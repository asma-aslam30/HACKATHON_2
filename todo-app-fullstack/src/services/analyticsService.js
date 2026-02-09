/**
 * Analytics Service - Analytics calculation functions
 * Implements T044: Create analytics calculation functions
 * Implements T048: Implement user contribution metrics
 */

export class AnalyticsService {
  constructor(supabase) {
    this.supabase = supabase
  }

  /**
   * Calculate overall statistics for a shared list
   * @param {string} listId - The shared list ID
   * @returns {Promise<Object>} Statistics object
   */
  async calculateListStats(listId) {
    const { data: tasks, error } = await this.supabase
      .from('todos')
      .select(`
        id,
        completed,
        priority,
        due_date,
        created_at,
        updated_at,
        user_id,
        assigned_to
      `)
      .eq('shared_list_id', listId)

    if (error) throw error

    const now = new Date()
    const stats = {
      totalTasks: tasks.length,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
      averageCompletionTime: 0,
      byPriority: {
        high: { total: 0, completed: 0 },
        medium: { total: 0, completed: 0 },
        low: { total: 0, completed: 0 }
      },
      trends: {
        daily: [],
        weekly: []
      }
    }

    let totalCompletionTime = 0
    let completedWithTime = 0

    tasks.forEach(task => {
      if (task.completed) {
        stats.completedTasks++

        // Calculate completion time
        const created = new Date(task.created_at)
        const updated = new Date(task.updated_at)
        const completionTime = (updated - created) / (1000 * 60 * 60) // hours
        if (completionTime > 0) {
          totalCompletionTime += completionTime
          completedWithTime++
        }
      } else {
        stats.pendingTasks++

        // Check if overdue
        if (task.due_date && new Date(task.due_date) < now) {
          stats.overdueTasks++
        }
      }

      // By priority
      const priority = task.priority || 'medium'
      if (stats.byPriority[priority]) {
        stats.byPriority[priority].total++
        if (task.completed) {
          stats.byPriority[priority].completed++
        }
      }
    })

    // Calculate rates
    stats.completionRate = stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0

    stats.averageCompletionTime = completedWithTime > 0
      ? Math.round(totalCompletionTime / completedWithTime)
      : 0

    // Calculate trends
    stats.trends = this.calculateTrends(tasks)

    return stats
  }

  /**
   * Calculate user contribution metrics
   * @param {string} listId - The shared list ID
   * @returns {Promise<Array>} Array of user contribution objects
   */
  async calculateUserContributions(listId) {
    // Get all tasks
    const { data: tasks, error: taskError } = await this.supabase
      .from('todos')
      .select(`
        id,
        completed,
        user_id,
        assigned_to,
        created_at,
        updated_at
      `)
      .eq('shared_list_id', listId)

    if (taskError) throw taskError

    // Get all comments
    const { data: comments, error: commentError } = await this.supabase
      .from('comments')
      .select(`
        id,
        user_id,
        todo_id,
        todos!inner (shared_list_id)
      `)
      .eq('todos.shared_list_id', listId)

    if (commentError) throw commentError

    // Get collaborators
    const { data: collaborators, error: collabError } = await this.supabase
      .from('collaborations')
      .select(`
        user_id,
        joined_at,
        users (id, name, email, avatar_url)
      `)
      .eq('list_id', listId)

    if (collabError) throw collabError

    // Calculate contributions per user
    const contributions = {}

    collaborators.forEach(collab => {
      contributions[collab.user_id] = {
        userId: collab.user_id,
        user: collab.users ? {
          id: collab.users.id,
          name: collab.users.name,
          email: collab.users.email,
          avatarUrl: collab.users.avatar_url
        } : null,
        joinedAt: collab.joined_at,
        tasksCreated: 0,
        tasksCompleted: 0,
        tasksAssigned: 0,
        commentsAdded: 0,
        contributionScore: 0
      }
    })

    // Count task contributions
    tasks.forEach(task => {
      const creatorId = task.user_id
      if (contributions[creatorId]) {
        contributions[creatorId].tasksCreated++
      }

      // Count assignments
      (task.assigned_to || []).forEach(userId => {
        if (contributions[userId]) {
          contributions[userId].tasksAssigned++
          if (task.completed) {
            contributions[userId].tasksCompleted++
          }
        }
      })
    })

    // Count comment contributions
    comments.forEach(comment => {
      if (contributions[comment.user_id]) {
        contributions[comment.user_id].commentsAdded++
      }
    })

    // Calculate contribution scores
    Object.values(contributions).forEach(contrib => {
      // Score formula: created*3 + completed*5 + comments*1
      contrib.contributionScore =
        (contrib.tasksCreated * 3) +
        (contrib.tasksCompleted * 5) +
        (contrib.commentsAdded * 1)

      // Calculate completion rate
      contrib.completionRate = contrib.tasksAssigned > 0
        ? Math.round((contrib.tasksCompleted / contrib.tasksAssigned) * 100)
        : 0
    })

    // Sort by contribution score
    return Object.values(contributions).sort(
      (a, b) => b.contributionScore - a.contributionScore
    )
  }

  /**
   * Calculate trend data for tasks
   * @param {Array} tasks - Array of task objects
   * @returns {Object} Trend data
   */
  calculateTrends(tasks) {
    const now = new Date()
    const dailyData = {}
    const weeklyData = {}

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      dailyData[key] = { created: 0, completed: 0 }
    }

    // Initialize last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (i * 7))
      const key = `Week ${4 - i}`
      weeklyData[key] = { created: 0, completed: 0 }
    }

    tasks.forEach(task => {
      const createdDate = new Date(task.created_at)
      const createdKey = createdDate.toISOString().split('T')[0]

      // Daily created
      if (dailyData[createdKey]) {
        dailyData[createdKey].created++
      }

      if (task.completed) {
        const completedDate = new Date(task.updated_at)
        const completedKey = completedDate.toISOString().split('T')[0]

        // Daily completed
        if (dailyData[completedKey]) {
          dailyData[completedKey].completed++
        }
      }

      // Weekly calculations
      const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24))
      const weekIndex = Math.floor(daysDiff / 7)
      if (weekIndex < 4) {
        const weekKey = `Week ${4 - weekIndex}`
        if (weeklyData[weekKey]) {
          weeklyData[weekKey].created++
          if (task.completed) {
            weeklyData[weekKey].completed++
          }
        }
      }
    })

    return {
      daily: Object.entries(dailyData).map(([date, data]) => ({
        date,
        ...data
      })),
      weekly: Object.entries(weeklyData).map(([week, data]) => ({
        week,
        ...data
      }))
    }
  }

  /**
   * Calculate productivity metrics
   * @param {string} listId - The shared list ID
   * @returns {Promise<Object>} Productivity metrics
   */
  async calculateProductivityMetrics(listId) {
    const { data: tasks, error } = await this.supabase
      .from('todos')
      .select(`
        id,
        completed,
        priority,
        created_at,
        updated_at,
        due_date
      `)
      .eq('shared_list_id', listId)

    if (error) throw error

    const now = new Date()
    const metrics = {
      velocity: {
        daily: 0,
        weekly: 0,
        monthly: 0
      },
      burndown: {
        remaining: 0,
        completed: 0,
        trend: []
      },
      timeToComplete: {
        average: 0,
        byPriority: {
          high: 0,
          medium: 0,
          low: 0
        }
      },
      onTimeDelivery: {
        onTime: 0,
        late: 0,
        noDeadline: 0,
        rate: 0
      }
    }

    // Calculate velocity
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const completedTasks = tasks.filter(t => t.completed)
    metrics.velocity.daily = completedTasks.filter(t =>
      new Date(t.updated_at) > dayAgo
    ).length

    metrics.velocity.weekly = completedTasks.filter(t =>
      new Date(t.updated_at) > weekAgo
    ).length

    metrics.velocity.monthly = completedTasks.filter(t =>
      new Date(t.updated_at) > monthAgo
    ).length

    // Burndown
    metrics.burndown.remaining = tasks.filter(t => !t.completed).length
    metrics.burndown.completed = completedTasks.length

    // Time to complete
    const completionTimes = {
      all: [],
      high: [],
      medium: [],
      low: []
    }

    completedTasks.forEach(task => {
      const created = new Date(task.created_at)
      const completed = new Date(task.updated_at)
      const hours = (completed - created) / (1000 * 60 * 60)

      completionTimes.all.push(hours)
      const priority = task.priority || 'medium'
      if (completionTimes[priority]) {
        completionTimes[priority].push(hours)
      }
    })

    const average = arr => arr.length > 0
      ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
      : 0

    metrics.timeToComplete.average = average(completionTimes.all)
    metrics.timeToComplete.byPriority.high = average(completionTimes.high)
    metrics.timeToComplete.byPriority.medium = average(completionTimes.medium)
    metrics.timeToComplete.byPriority.low = average(completionTimes.low)

    // On-time delivery
    completedTasks.forEach(task => {
      if (!task.due_date) {
        metrics.onTimeDelivery.noDeadline++
      } else {
        const dueDate = new Date(task.due_date)
        const completedDate = new Date(task.updated_at)
        if (completedDate <= dueDate) {
          metrics.onTimeDelivery.onTime++
        } else {
          metrics.onTimeDelivery.late++
        }
      }
    })

    const tasksWithDeadline = metrics.onTimeDelivery.onTime + metrics.onTimeDelivery.late
    metrics.onTimeDelivery.rate = tasksWithDeadline > 0
      ? Math.round((metrics.onTimeDelivery.onTime / tasksWithDeadline) * 100)
      : 100

    return metrics
  }

  /**
   * Compare two users' contributions
   * @param {string} listId - The shared list ID
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {Promise<Object>} Comparison data
   */
  async compareContributions(listId, userId1, userId2) {
    const contributions = await this.calculateUserContributions(listId)

    const user1 = contributions.find(c => c.userId === userId1)
    const user2 = contributions.find(c => c.userId === userId2)

    if (!user1 || !user2) {
      throw new Error('One or both users not found in this list')
    }

    return {
      user1: {
        ...user1,
        rank: contributions.findIndex(c => c.userId === userId1) + 1
      },
      user2: {
        ...user2,
        rank: contributions.findIndex(c => c.userId === userId2) + 1
      },
      comparison: {
        tasksCreated: user1.tasksCreated - user2.tasksCreated,
        tasksCompleted: user1.tasksCompleted - user2.tasksCompleted,
        commentsAdded: user1.commentsAdded - user2.commentsAdded,
        contributionScore: user1.contributionScore - user2.contributionScore
      }
    }
  }

  /**
   * Get leaderboard for a shared list
   * @param {string} listId - The shared list ID
   * @param {number} limit - Maximum entries to return
   * @returns {Promise<Array>} Leaderboard entries
   */
  async getLeaderboard(listId, limit = 10) {
    const contributions = await this.calculateUserContributions(listId)

    return contributions.slice(0, limit).map((contrib, index) => ({
      rank: index + 1,
      userId: contrib.userId,
      user: contrib.user,
      score: contrib.contributionScore,
      tasksCompleted: contrib.tasksCompleted,
      completionRate: contrib.completionRate
    }))
  }
}

export default AnalyticsService

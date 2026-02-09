/**
 * Dashboard Service - Team dashboard and progress display
 * Implements T043: Create dashboard service
 * Implements T045: Implement dashboard display UI
 * Implements T049: Add dashboard export functionality
 * Implements T050: Create dashboard refresh and update mechanism
 */

export class DashboardService {
  constructor(supabase) {
    this.supabase = supabase
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
    this.cache = new Map()
  }

  /**
   * Get dashboard data for a shared list
   * @param {string} listId - The shared list ID
   * @param {boolean} forceRefresh - Force refresh ignoring cache
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard(listId, forceRefresh = false) {
    const cacheKey = `dashboard_${listId}`

    // Check cache
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data
      }
    }

    // Fetch fresh data
    const [
      listData,
      tasks,
      collaborators,
      recentActivity
    ] = await Promise.all([
      this.getListInfo(listId),
      this.getTaskMetrics(listId),
      this.getCollaboratorStats(listId),
      this.getRecentActivity(listId)
    ])

    const dashboard = {
      list: listData,
      metrics: {
        tasks: tasks.metrics,
        progress: tasks.progress,
        byPriority: tasks.byPriority,
        overdue: tasks.overdue
      },
      collaborators: collaborators,
      recentActivity: recentActivity,
      generatedAt: new Date().toISOString()
    }

    // Update cache
    this.cache.set(cacheKey, {
      data: dashboard,
      timestamp: Date.now()
    })

    return dashboard
  }

  /**
   * Get basic list information
   * @param {string} listId - The shared list ID
   * @returns {Promise<Object>} List info
   */
  async getListInfo(listId) {
    const { data, error } = await this.supabase
      .from('shared_lists')
      .select(`
        id,
        name,
        description,
        owner_id,
        created_at,
        users!shared_lists_owner_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('id', listId)
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.created_at,
      owner: data.users ? {
        id: data.users.id,
        name: data.users.name,
        email: data.users.email
      } : null
    }
  }

  /**
   * Get task metrics for a list
   * @param {string} listId - The shared list ID
   * @returns {Promise<Object>} Task metrics
   */
  async getTaskMetrics(listId) {
    const { data: tasks, error } = await this.supabase
      .from('todos')
      .select(`
        id,
        completed,
        priority,
        due_date,
        created_at,
        updated_at,
        assigned_to
      `)
      .eq('shared_list_id', listId)

    if (error) throw error

    const now = new Date()
    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const pending = total - completed

    // Overdue tasks
    const overdue = tasks.filter(t =>
      !t.completed &&
      t.due_date &&
      new Date(t.due_date) < now
    ).length

    // By priority
    const byPriority = {
      high: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      low: { total: 0, completed: 0 }
    }

    tasks.forEach(task => {
      const priority = task.priority || 'medium'
      if (byPriority[priority]) {
        byPriority[priority].total++
        if (task.completed) {
          byPriority[priority].completed++
        }
      }
    })

    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // Weekly progress
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const createdThisWeek = tasks.filter(t => new Date(t.created_at) > weekAgo).length
    const completedThisWeek = tasks.filter(t =>
      t.completed && new Date(t.updated_at) > weekAgo
    ).length

    return {
      metrics: {
        total,
        completed,
        pending,
        completionRate
      },
      progress: {
        createdThisWeek,
        completedThisWeek,
        weeklyVelocity: completedThisWeek
      },
      byPriority,
      overdue
    }
  }

  /**
   * Get collaborator statistics
   * @param {string} listId - The shared list ID
   * @returns {Promise<Array>} Collaborator stats
   */
  async getCollaboratorStats(listId) {
    // Get collaborators
    const { data: collaborators, error: collabError } = await this.supabase
      .from('collaborations')
      .select(`
        user_id,
        role,
        joined_at,
        users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('list_id', listId)

    if (collabError) throw collabError

    // Get tasks to calculate contributions
    const { data: tasks, error: taskError } = await this.supabase
      .from('todos')
      .select('id, completed, assigned_to, user_id')
      .eq('shared_list_id', listId)

    if (taskError) throw taskError

    // Calculate stats per collaborator
    return collaborators.map(collab => {
      const userId = collab.user_id

      // Tasks created by this user
      const tasksCreated = tasks.filter(t => t.user_id === userId).length

      // Tasks assigned to this user
      const tasksAssigned = tasks.filter(t =>
        t.assigned_to && t.assigned_to.includes(userId)
      ).length

      // Tasks completed by this user (assigned and completed)
      const tasksCompleted = tasks.filter(t =>
        t.completed &&
        t.assigned_to &&
        t.assigned_to.includes(userId)
      ).length

      return {
        userId,
        role: collab.role,
        joinedAt: collab.joined_at,
        user: collab.users ? {
          id: collab.users.id,
          name: collab.users.name,
          email: collab.users.email,
          avatarUrl: collab.users.avatar_url
        } : null,
        contribution: {
          tasksCreated,
          tasksAssigned,
          tasksCompleted,
          completionRate: tasksAssigned > 0
            ? Math.round((tasksCompleted / tasksAssigned) * 100)
            : 0
        }
      }
    })
  }

  /**
   * Get recent activity for a list
   * @param {string} listId - The shared list ID
   * @param {number} limit - Maximum items to return
   * @returns {Promise<Array>} Recent activity items
   */
  async getRecentActivity(listId, limit = 10) {
    // Get recent task updates
    const { data: tasks, error: taskError } = await this.supabase
      .from('todos')
      .select(`
        id,
        title,
        completed,
        created_at,
        updated_at,
        last_modified_by,
        user_id
      `)
      .eq('shared_list_id', listId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (taskError) throw taskError

    // Get recent comments
    const { data: comments, error: commentError } = await this.supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        todo_id,
        todos!inner (
          title,
          shared_list_id
        )
      `)
      .eq('todos.shared_list_id', listId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (commentError) throw commentError

    // Combine and sort activities
    const activities = []

    tasks.forEach(task => {
      // Task created
      activities.push({
        type: 'task_created',
        timestamp: task.created_at,
        taskId: task.id,
        taskTitle: task.title,
        userId: task.user_id
      })

      // Task updated (if different from created)
      if (task.updated_at !== task.created_at) {
        activities.push({
          type: task.completed ? 'task_completed' : 'task_updated',
          timestamp: task.updated_at,
          taskId: task.id,
          taskTitle: task.title,
          userId: task.last_modified_by || task.user_id
        })
      }
    })

    comments.forEach(comment => {
      activities.push({
        type: 'comment_added',
        timestamp: comment.created_at,
        commentId: comment.id,
        taskId: comment.todo_id,
        taskTitle: comment.todos?.title,
        userId: comment.user_id,
        preview: comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : '')
      })
    })

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return activities.slice(0, limit)
  }

  /**
   * Export dashboard data in various formats
   * @param {string} listId - The shared list ID
   * @param {string} format - Export format: 'json', 'csv', or 'markdown'
   * @returns {Promise<Object>} Exported data
   */
  async export(listId, format = 'json') {
    const dashboard = await this.getDashboard(listId, true)

    switch (format) {
      case 'json':
        return {
          format: 'json',
          contentType: 'application/json',
          filename: `dashboard_${listId}_${Date.now()}.json`,
          data: JSON.stringify(dashboard, null, 2)
        }

      case 'csv':
        return {
          format: 'csv',
          contentType: 'text/csv',
          filename: `dashboard_${listId}_${Date.now()}.csv`,
          data: this.toCsv(dashboard)
        }

      case 'markdown':
        return {
          format: 'markdown',
          contentType: 'text/markdown',
          filename: `dashboard_${listId}_${Date.now()}.md`,
          data: this.toMarkdown(dashboard)
        }

      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Convert dashboard to CSV format
   * @param {Object} dashboard - Dashboard data
   * @returns {string} CSV string
   */
  toCsv(dashboard) {
    const lines = []

    // Metrics section
    lines.push('Category,Metric,Value')
    lines.push(`Tasks,Total,${dashboard.metrics.tasks.total}`)
    lines.push(`Tasks,Completed,${dashboard.metrics.tasks.completed}`)
    lines.push(`Tasks,Pending,${dashboard.metrics.tasks.pending}`)
    lines.push(`Tasks,Completion Rate,${dashboard.metrics.tasks.completionRate}%`)
    lines.push(`Tasks,Overdue,${dashboard.metrics.overdue}`)
    lines.push('')

    // Collaborators section
    lines.push('Collaborator,Role,Tasks Assigned,Tasks Completed,Completion Rate')
    dashboard.collaborators.forEach(c => {
      lines.push(`${c.user?.email || c.userId},${c.role},${c.contribution.tasksAssigned},${c.contribution.tasksCompleted},${c.contribution.completionRate}%`)
    })

    return lines.join('\n')
  }

  /**
   * Convert dashboard to Markdown format
   * @param {Object} dashboard - Dashboard data
   * @returns {string} Markdown string
   */
  toMarkdown(dashboard) {
    const lines = []

    lines.push(`# Dashboard: ${dashboard.list.name}`)
    lines.push('')
    lines.push(`*Generated: ${new Date(dashboard.generatedAt).toLocaleString()}*`)
    lines.push('')

    // Overview
    lines.push('## Overview')
    lines.push('')
    lines.push('| Metric | Value |')
    lines.push('|--------|-------|')
    lines.push(`| Total Tasks | ${dashboard.metrics.tasks.total} |`)
    lines.push(`| Completed | ${dashboard.metrics.tasks.completed} |`)
    lines.push(`| Pending | ${dashboard.metrics.tasks.pending} |`)
    lines.push(`| Completion Rate | ${dashboard.metrics.tasks.completionRate}% |`)
    lines.push(`| Overdue | ${dashboard.metrics.overdue} |`)
    lines.push('')

    // By Priority
    lines.push('## Tasks by Priority')
    lines.push('')
    lines.push('| Priority | Total | Completed |')
    lines.push('|----------|-------|-----------|')
    Object.entries(dashboard.metrics.byPriority).forEach(([priority, data]) => {
      lines.push(`| ${priority.charAt(0).toUpperCase() + priority.slice(1)} | ${data.total} | ${data.completed} |`)
    })
    lines.push('')

    // Collaborators
    lines.push('## Team Members')
    lines.push('')
    lines.push('| Member | Role | Assigned | Completed |')
    lines.push('|--------|------|----------|-----------|')
    dashboard.collaborators.forEach(c => {
      lines.push(`| ${c.user?.name || c.user?.email || 'Unknown'} | ${c.role} | ${c.contribution.tasksAssigned} | ${c.contribution.tasksCompleted} |`)
    })
    lines.push('')

    // Recent Activity
    lines.push('## Recent Activity')
    lines.push('')
    dashboard.recentActivity.slice(0, 5).forEach(activity => {
      const date = new Date(activity.timestamp).toLocaleDateString()
      lines.push(`- **${date}**: ${activity.type.replace('_', ' ')} - ${activity.taskTitle || ''}`)
    })

    return lines.join('\n')
  }

  /**
   * Clear cache for a specific list or all
   * @param {string} listId - Optional list ID
   */
  clearCache(listId = null) {
    if (listId) {
      this.cache.delete(`dashboard_${listId}`)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Subscribe to real-time dashboard updates
   * @param {string} listId - The shared list ID
   * @param {Function} callback - Callback for updates
   * @returns {Object} Subscription handle
   */
  subscribe(listId, callback) {
    const channel = this.supabase
      .channel(`dashboard:${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `shared_list_id=eq.${listId}`
        },
        async () => {
          this.clearCache(listId)
          const dashboard = await this.getDashboard(listId)
          callback(dashboard)
        }
      )
      .subscribe()

    return {
      unsubscribe: () => {
        this.supabase.removeChannel(channel)
      }
    }
  }
}

export default DashboardService

// phases/phase-1/src/dashboardService.js
import databaseService from '../database/service.js';
import collaborationService from './collaborationService.js';

class DashboardService {
  constructor() {
    this.databaseService = databaseService;
    this.collaborationService = collaborationService;
  }

  // Get dashboard data for a specific shared list
  async getDashboardData(listId, userId) {
    try {
      // Check if user has access to the list
      const hasAccess = await this.collaborationService.userHasAccessToList(userId, listId, 'read');
      if (!hasAccess) {
        throw new Error('User does not have access to this shared list');
      }

      // Get all tasks for the list
      const tasks = await this.databaseService.getTasksBySharedList(listId);

      // Get all collaborators for the list
      const collaborators = await this.getCollaboratorsForList(listId);

      // Calculate metrics
      const metrics = this.calculateMetrics(tasks, collaborators);

      // Get recent activity
      const recentActivity = await this.getRecentActivity(listId);

      return {
        listId,
        metrics,
        collaborators,
        tasks,
        recentActivity,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  // Calculate dashboard metrics
  calculateMetrics(tasks, collaborators) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate tasks by priority
    const tasksByPriority = {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length,
      none: tasks.filter(task => task.priority === 'none').length
    };

    // Calculate tasks by assignee
    const tasksByAssignee = {};
    tasks.forEach(task => {
      if (task.assignedTo && Array.isArray(task.assignedTo)) {
        task.assignedTo.forEach(assignee => {
          tasksByAssignee[assignee] = (tasksByAssignee[assignee] || 0) + 1;
        });
      }
    });

    // Calculate completion by assignee
    const completionByAssignee = {};
    tasks.forEach(task => {
      if (task.assignedTo && Array.isArray(task.assignedTo)) {
        task.assignedTo.forEach(assignee => {
          if (!completionByAssignee[assignee]) {
            completionByAssignee[assignee] = { total: 0, completed: 0 };
          }
          completionByAssignee[assignee].total += 1;
          if (task.completed) {
            completionByAssignee[assignee].completed += 1;
          }
        });
      }
    });

    // Calculate overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      return new Date(task.due_date) < now && !task.completed;
    }).length;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      tasksByPriority,
      tasksByAssignee,
      completionByAssignee,
      overdueTasks
    };
  }

  // Get collaborators for a list
  async getCollaboratorsForList(listId) {
    try {
      const collaborations = await this.databaseService.getCollaborationsByList(listId);
      const collaborators = [];

      for (const collab of collaborations) {
        const user = await this.databaseService.getUserById(collab.user_id || collab.userId);
        if (user) {
          collaborators.push({
            ...user,
            role: collab.role
          });
        }
      }

      return collaborators;
    } catch (error) {
      console.error('Error getting collaborators for list:', error);
      throw error;
    }
  }

  // Get recent activity for a list
  async getRecentActivity(listId) {
    try {
      // In a real implementation, this would fetch recent activity from a separate activity log
      // For now, we'll return a mock implementation based on task updates
      const tasks = await this.databaseService.getTasksBySharedList(listId);

      // Sort tasks by updated date (most recent first) and take the last 10
      const recentTasks = tasks
        .sort((a, b) => new Date(b.updated_at || b.updatedAt || 0) - new Date(a.updated_at || a.updatedAt || 0))
        .slice(0, 10);

      const recentActivity = recentTasks.map(task => ({
        type: 'task_update',
        taskId: task.id,
        taskTitle: task.title,
        timestamp: task.updated_at || task.updatedAt,
        action: task.completed ? 'completed' : 'updated'
      }));

      return recentActivity;
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw error;
    }
  }

  // Get user-specific dashboard data
  async getUserDashboardData(userId) {
    try {
      // Get all shared lists the user has access to
      const sharedLists = await this.databaseService.getSharedListsForUser(userId);

      // Get all assignments for the user
      const assignments = await this.databaseService.getAssignmentsByUser(userId);

      // Get assigned tasks for the user
      const assignedTasks = await this.databaseService.getUserTasks(userId);

      // Calculate user-specific metrics
      const userMetrics = {
        totalSharedLists: sharedLists.length,
        totalAssignments: assignments.length,
        assignedTasksCount: assignedTasks.length,
        completedAssignments: assignments.filter(assignment => assignment.status === 'completed').length,
        pendingAssignments: assignments.filter(assignment => assignment.status === 'pending').length,
        inProgressAssignments: assignments.filter(assignment => assignment.status === 'in_progress').length
      };

      return {
        userId,
        sharedLists,
        assignments,
        assignedTasks,
        userMetrics,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user dashboard data:', error);
      throw error;
    }
  }

  // Get analytics data for a list
  async getAnalyticsData(listId, userId, options = {}) {
    try {
      // Check if user has access to the list
      const hasAccess = await this.collaborationService.userHasAccessToList(userId, listId, 'read');
      if (!hasAccess) {
        throw new Error('User does not have access to this shared list');
      }

      const tasks = await this.databaseService.getTasksBySharedList(listId);
      const collaborators = await this.getCollaboratorsForList(listId);

      // Calculate advanced analytics
      const analytics = {
        completionTrends: this.calculateCompletionTrends(tasks),
        productivityMetrics: this.calculateProductivityMetrics(tasks, collaborators),
        assignmentDistribution: this.calculateAssignmentDistribution(tasks),
        timeToCompletion: this.calculateTimeToCompletion(tasks),
        ...options // Include any additional options requested
      };

      return analytics;
    } catch (error) {
      console.error('Error getting analytics data:', error);
      throw error;
    }
  }

  // Calculate completion trends
  calculateCompletionTrends(tasks) {
    // Group tasks by completion date
    const completionByDate = {};
    tasks.forEach(task => {
      if (task.completed) {
        const date = new Date(task.updated_at || task.updatedAt).toDateString();
        completionByDate[date] = (completionByDate[date] || 0) + 1;
      }
    });

    // Convert to array and sort by date
    const trendData = Object.entries(completionByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return trendData;
  }

  // Calculate productivity metrics
  calculateProductivityMetrics(tasks, collaborators) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Tasks completed in the last week
    const completedLastWeek = tasks.filter(task => {
      if (!task.completed) return false;
      const taskDate = new Date(task.updated_at || task.updatedAt);
      return taskDate >= lastWeek;
    }).length;

    // Tasks completed in the last month
    const completedLastMonth = tasks.filter(task => {
      if (!task.completed) return false;
      const taskDate = new Date(task.updated_at || task.updatedAt);
      return taskDate >= lastMonth;
    }).length;

    // Average completion time (simplified)
    let totalTime = 0;
    let completedCount = 0;
    tasks.forEach(task => {
      if (task.completed && task.created_at) {
        const createdDate = new Date(task.created_at);
        const updatedDate = new Date(task.updated_at || task.updatedAt);
        const timeDiff = updatedDate - createdDate; // in milliseconds
        totalTime += timeDiff;
        completedCount++;
      }
    });

    const avgCompletionTime = completedCount > 0 ? totalTime / completedCount : 0;

    return {
      completedLastWeek,
      completedLastMonth,
      avgCompletionTime: avgCompletionTime / (1000 * 60 * 60), // Convert to hours
      tasksPerUser: collaborators.length > 0 ? tasks.length / collaborators.length : 0
    };
  }

  // Calculate assignment distribution
  calculateAssignmentDistribution(tasks) {
    const assignmentCounts = {};
    let unassignedCount = 0;

    tasks.forEach(task => {
      if (task.assignedTo && task.assignedTo.length > 0) {
        task.assignedTo.forEach(assignee => {
          assignmentCounts[assignee] = (assignmentCounts[assignee] || 0) + 1;
        });
      } else {
        unassignedCount++;
      }
    });

    return {
      assignmentCounts,
      unassignedCount
    };
  }

  // Calculate time to completion
  calculateTimeToCompletion(tasks) {
    const completedTasks = tasks.filter(task => task.completed);
    if (completedTasks.length === 0) {
      return { avgTime: 0, medianTime: 0, fastest: 0, slowest: 0 };
    }

    const completionTimes = completedTasks.map(task => {
      if (task.created_at) {
        const createdDate = new Date(task.created_at);
        const updatedDate = new Date(task.updated_at || task.updatedAt);
        return updatedDate - createdDate; // in milliseconds
      }
      return 0;
    }).filter(time => time > 0); // Filter out invalid times

    if (completionTimes.length === 0) {
      return { avgTime: 0, medianTime: 0, fastest: 0, slowest: 0 };
    }

    // Calculate statistics
    const sortedTimes = completionTimes.sort((a, b) => a - b);
    const avgTime = completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length;
    const medianTime = sortedTimes[Math.floor(sortedTimes.length / 2)];
    const fastest = sortedTimes[0];
    const slowest = sortedTimes[sortedTimes.length - 1];

    return {
      avgTime: avgTime / (1000 * 60 * 60), // Convert to hours
      medianTime: medianTime / (1000 * 60 * 60),
      fastest: fastest / (1000 * 60 * 60),
      slowest: slowest / (1000 * 60 * 60)
    };
  }

  // Generate dashboard export data
  async generateExportData(listId, userId, format = 'json') {
    try {
      // Check if user has access to the list
      const hasAccess = await this.collaborationService.userHasAccessToList(userId, listId, 'read');
      if (!hasAccess) {
        throw new Error('User does not have access to this shared list');
      }

      const dashboardData = await this.getDashboardData(listId, userId);

      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(dashboardData, null, 2);
        case 'csv':
          return this.convertToCSV(dashboardData);
        case 'text':
          return this.convertToText(dashboardData);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error generating export data:', error);
      throw error;
    }
  }

  // Convert dashboard data to CSV format
  convertToCSV(dashboardData) {
    // This is a simplified implementation
    // In a real implementation, you'd want to create proper CSV formatting
    let csv = 'Metric,Value\n';
    csv += `Total Tasks,${dashboardData.metrics.totalTasks}\n`;
    csv += `Completed Tasks,${dashboardData.metrics.completedTasks}\n`;
    csv += `Pending Tasks,${dashboardData.metrics.pendingTasks}\n`;
    csv += `Completion Rate,${dashboardData.metrics.completionRate}%\n`;
    csv += `Overdue Tasks,${dashboardData.metrics.overdueTasks}\n`;

    return csv;
  }

  // Convert dashboard data to text format
  convertToText(dashboardData) {
    let text = `=== Team Dashboard Report ===\n\n`;
    text += `List ID: ${dashboardData.listId}\n`;
    text += `Generated: ${new Date().toLocaleString()}\n\n`;

    text += `📊 METRICS:\n`;
    text += `- Total Tasks: ${dashboardData.metrics.totalTasks}\n`;
    text += `- Completed: ${dashboardData.metrics.completedTasks}\n`;
    text += `- Pending: ${dashboardData.metrics.pendingTasks}\n`;
    text += `- Completion Rate: ${dashboardData.metrics.completionRate.toFixed(2)}%\n`;
    text += `- Overdue: ${dashboardData.metrics.overdueTasks}\n\n`;

    text += `👥 COLLABORATORS: ${dashboardData.collaborators.length}\n`;
    text += `📝 RECENT ACTIVITY: ${dashboardData.recentActivity.length} items\n`;

    return text;
  }

  // Get dashboard summary (lightweight version)
  async getDashboardSummary(listId, userId) {
    try {
      // Check if user has access to the list
      const hasAccess = await this.collaborationService.userHasAccessToList(userId, listId, 'read');
      if (!hasAccess) {
        throw new Error('User does not have access to this shared list');
      }

      const tasks = await this.databaseService.getTasksBySharedList(listId);
      const metrics = this.calculateMetrics(tasks, []);

      return {
        listId,
        summary: {
          totalTasks: metrics.totalTasks,
          completedTasks: metrics.completedTasks,
          completionRate: metrics.completionRate,
          overdueTasks: metrics.overdueTasks
        },
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const dashboardService = new DashboardService();
export default dashboardService;
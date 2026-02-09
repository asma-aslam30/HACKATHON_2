import { prisma } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userId = req.headers['x-user-id']

  try {
    // Get task statistics
    const totalTasks = await prisma.todo.count({
      where: { userId }
    })

    const completedTasks = await prisma.todo.count({
      where: { userId, completed: true }
    })

    const overdueTasks = await prisma.todo.count({
      where: {
        userId,
        completed: false,
        dueDate: { lt: new Date() }
      }
    })

    const highPriorityTasks = await prisma.todo.count({
      where: { userId, priority: 'high', completed: false }
    })

    // Get tasks by priority
    const tasksByPriority = await prisma.todo.groupBy({
      by: ['priority'],
      where: { userId },
      _count: true
    })

    // Get recent activity (tasks created/updated in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentTasks = await prisma.todo.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Calculate completion rate
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0

    // Get productivity trend (tasks completed per day this week)
    const productivityTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await prisma.todo.count({
        where: {
          userId,
          completed: true,
          updatedAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      productivityTrend.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: count
      })
    }

    return res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      overdueTasks,
      highPriorityTasks,
      completionRate,
      tasksByPriority: tasksByPriority.reduce((acc, item) => {
        acc[item.priority] = item._count
        return acc
      }, {}),
      recentTasks,
      productivityTrend
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
}

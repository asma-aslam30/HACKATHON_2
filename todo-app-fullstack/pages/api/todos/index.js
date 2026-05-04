import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'

const INCLUDE_FULL = {
  comments: true,
  assignments: true,
  subtasks: { orderBy: { order: 'asc' } },
}

export default async function handler(req, res) {
  let userId
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    userId = session?.user?.id
  } catch {}
  userId = userId || req.headers['x-user-id'] || 'demo-user'

  try {
    // Ensure user exists (demo/dev fallback)
    let user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      user = await prisma.user.create({
        data: { id: userId, email: `${userId}@demo.local`, name: 'Demo User' }
      })
    }

    if (req.method === 'GET') {
      const { filter, sort, search } = req.query
      const where = { userId }

      // Date filters
      const now = new Date()
      if (filter === 'overdue') {
        where.dueDate = { lt: now }
        where.completed = false
      } else if (filter === 'due_today') {
        const start = new Date(now); start.setHours(0, 0, 0, 0)
        const end = new Date(now); end.setHours(23, 59, 59, 999)
        where.dueDate = { gte: start, lte: end }
      } else if (filter === 'due_this_week') {
        const start = new Date(now); start.setHours(0, 0, 0, 0)
        const end = new Date(now); end.setDate(now.getDate() + 7); end.setHours(23, 59, 59, 999)
        where.dueDate = { gte: start, lte: end }
      } else if (filter === 'active') {
        where.completed = false
      } else if (filter === 'completed') {
        where.completed = true
      }

      // Search
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Sort
      let orderBy = { createdAt: 'desc' }
      if (sort === 'due_date') orderBy = [{ dueDate: 'asc' }, { createdAt: 'desc' }]
      else if (sort === 'priority') orderBy = { priority: 'desc' }

      const todos = await prisma.todo.findMany({ where, orderBy, include: INCLUDE_FULL })
      return res.status(200).json(todos)
    }

    if (req.method === 'POST') {
      const { title, description, priority, dueDate, recurrencePattern, reminderEnabled, reminderOffset } = req.body
      if (!title) return res.status(400).json({ error: 'Title is required' })

      const todo = await prisma.todo.create({
        data: {
          title,
          description,
          priority: priority || 'medium',
          dueDate: dueDate ? new Date(dueDate) : null,
          recurrencePattern: recurrencePattern || null,
          reminderEnabled: Boolean(reminderEnabled),
          reminderOffset: reminderOffset ? Number(reminderOffset) : null,
          userId,
        },
        include: INCLUDE_FULL,
      })
      return res.status(201).json(todo)
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

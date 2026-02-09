import { prisma } from '../../../lib/db'

export default async function handler(req, res) {
  // For demo purposes, use a default user ID
  // In production, get this from session/auth
  const userId = req.headers['x-user-id'] || 'demo-user'

  try {
    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@demo.local`,
          name: 'Demo User'
        }
      })
    }

    if (req.method === 'GET') {
      const todos = await prisma.todo.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          comments: true,
          assignments: true
        }
      })
      return res.status(200).json(todos)
    }

    if (req.method === 'POST') {
      const { title, description, priority, dueDate } = req.body

      if (!title) {
        return res.status(400).json({ error: 'Title is required' })
      }

      const todo = await prisma.todo.create({
        data: {
          title,
          description,
          priority: priority || 'medium',
          dueDate: dueDate ? new Date(dueDate) : null,
          userId
        }
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

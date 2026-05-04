import { prisma } from '../../../lib/db'

export default async function handler(req, res) {
  const { id } = req.query
  const userId = req.headers['x-user-id'] || 'demo-user'

  try {
    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: { id, userId }
    })

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' })
    }

    if (req.method === 'GET') {
      const todo = await prisma.todo.findUnique({
        where: { id },
        include: {
          comments: {
            include: { user: true },
            orderBy: { createdAt: 'asc' }
          },
          assignments: {
            include: { user: true }
          }
        }
      })
      return res.status(200).json(todo)
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { title, description, completed, priority, dueDate } = req.body

      const todo = await prisma.todo.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(completed !== undefined && { completed }),
          ...(priority !== undefined && { priority }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          version: { increment: 1 },
          lastModifiedBy: userId
        },
        include: {
          comments: true,
          assignments: true
        }
      })

      return res.status(200).json(todo)
    }

    if (req.method === 'DELETE') {
      await prisma.todo.delete({
        where: { id }
      })
      return res.status(204).end()
    }

    res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'
import { calculateNextDueDate } from '../../../lib/dateUtils'

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

  const { id } = req.query

  try {
    const existing = await prisma.todo.findFirst({ where: { id, userId } })
    if (!existing) return res.status(404).json({ error: 'Todo not found' })

    if (req.method === 'GET') {
      const todo = await prisma.todo.findFirst({ where: { id, userId }, include: INCLUDE_FULL })
      return res.json(todo)
    }

    if (req.method === 'PATCH') {
      const { title, description, completed, priority, dueDate,
              recurrencePattern, reminderEnabled, reminderOffset } = req.body

      // Handle recurring task: when completing a recurring task, spawn next instance
      let newRecurringTask = null
      if (completed === true && !existing.completed && existing.recurrencePattern && existing.dueDate) {
        const nextDue = calculateNextDueDate(existing.dueDate, existing.recurrencePattern)
        newRecurringTask = await prisma.todo.create({
          data: {
            title: existing.title,
            description: existing.description,
            priority: existing.priority,
            dueDate: nextDue,
            recurrencePattern: existing.recurrencePattern,
            reminderEnabled: existing.reminderEnabled,
            reminderOffset: existing.reminderOffset,
            userId,
          },
          include: INCLUDE_FULL,
        })
      }

      // Auto-complete subtasks when parent is completed
      if (completed === true && !existing.completed) {
        await prisma.subtask.updateMany({
          where: { todoId: id },
          data: { completed: true },
        })
      }

      const todo = await prisma.todo.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(completed !== undefined && { completed }),
          ...(priority !== undefined && { priority }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(recurrencePattern !== undefined && { recurrencePattern: recurrencePattern || null }),
          ...(reminderEnabled !== undefined && { reminderEnabled: Boolean(reminderEnabled) }),
          ...(reminderOffset !== undefined && { reminderOffset: reminderOffset ? Number(reminderOffset) : null }),
          version: { increment: 1 },
          lastModifiedBy: userId,
        },
        include: INCLUDE_FULL,
      })

      return res.json({ todo, newRecurringTask })
    }

    if (req.method === 'DELETE') {
      await prisma.todo.delete({ where: { id } })
      return res.json({ success: true })
    }

    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

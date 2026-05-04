import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers })
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    // Start or stop a timer
    const { todoId, action, durationMs } = req.body
    if (!todoId) return res.status(400).json({ error: 'todoId required' })

    const todo = await prisma.todo.findFirst({ where: { id: todoId, userId } })
    if (!todo) return res.status(404).json({ error: 'Task not found' })

    if (action === 'start') {
      const entry = await prisma.timeEntry.create({
        data: { todoId, startedAt: new Date() }
      })
      return res.status(201).json(entry)
    }

    if (action === 'stop') {
      const now = new Date()
      // Find latest open entry for this task
      const openEntry = await prisma.timeEntry.findFirst({
        where: { todoId, stoppedAt: null },
        orderBy: { startedAt: 'desc' }
      })

      const elapsed = openEntry
        ? now - new Date(openEntry.startedAt)
        : (durationMs || 0)

      let entry = null
      if (openEntry) {
        entry = await prisma.timeEntry.update({
          where: { id: openEntry.id },
          data: { stoppedAt: now, durationMs: Math.round(elapsed) }
        })
      }

      // Accumulate totalTimeMs on the task
      await prisma.todo.update({
        where: { id: todoId },
        data: { totalTimeMs: { increment: Math.round(elapsed) } }
      })

      return res.json({ entry, elapsed: Math.round(elapsed) })
    }

    return res.status(400).json({ error: 'action must be start or stop' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

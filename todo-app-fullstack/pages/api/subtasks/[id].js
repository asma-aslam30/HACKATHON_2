import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers })
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query

  // Verify subtask belongs to user's task
  const subtask = await prisma.subtask.findFirst({
    where: { id },
    include: { todo: { select: { userId: true } } }
  })
  if (!subtask || subtask.todo.userId !== userId) return res.status(404).json({ error: 'Subtask not found' })

  if (req.method === 'PATCH') {
    const { completed } = req.body
    const updated = await prisma.subtask.update({
      where: { id },
      data: { completed: Boolean(completed) }
    })
    return res.json(updated)
  }

  if (req.method === 'DELETE') {
    await prisma.subtask.delete({ where: { id } })
    return res.json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

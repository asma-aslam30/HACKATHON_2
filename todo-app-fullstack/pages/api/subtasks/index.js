import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers })
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    const { todoId, title } = req.body
    if (!todoId || !title?.trim()) return res.status(400).json({ error: 'todoId and title required' })

    // Verify ownership
    const todo = await prisma.todo.findFirst({ where: { id: todoId, userId }, include: { subtasks: true } })
    if (!todo) return res.status(404).json({ error: 'Task not found' })
    if (todo.subtasks.length >= 20) return res.status(400).json({ error: 'Max 20 subtasks per task' })

    const subtask = await prisma.subtask.create({
      data: { title: title.trim(), todoId, order: todo.subtasks.length }
    })
    return res.status(201).json(subtask)
  }

  res.status(405).json({ error: 'Method not allowed' })
}

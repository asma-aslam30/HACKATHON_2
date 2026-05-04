import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers })
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query
  const template = await prisma.taskTemplate.findFirst({ where: { id, userId } })
  if (!template) return res.status(404).json({ error: 'Template not found' })

  if (req.method === 'DELETE') {
    await prisma.taskTemplate.delete({ where: { id } })
    return res.json({ success: true })
  }

  if (req.method === 'PATCH') {
    const { name, title, description, priority } = req.body
    const updated = await prisma.taskTemplate.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
      }
    })
    return res.json(updated)
  }

  res.status(405).json({ error: 'Method not allowed' })
}

import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers })
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const templates = await prisma.taskTemplate.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    })
    return res.json(templates)
  }

  if (req.method === 'POST') {
    const { name, title, description, priority } = req.body
    if (!name?.trim() || !title?.trim()) return res.status(400).json({ error: 'name and title required' })

    // Check name uniqueness per user
    const existing = await prisma.taskTemplate.findFirst({ where: { userId, name: name.trim() } })
    if (existing) return res.status(409).json({ error: 'A template with that name already exists' })

    const template = await prisma.taskTemplate.create({
      data: { name: name.trim(), title: title.trim(), description: description || null, priority: priority || 'medium', userId }
    })
    return res.status(201).json(template)
  }

  res.status(405).json({ error: 'Method not allowed' })
}

import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null)
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  // GET — list notifications
  if (req.method === 'GET') {
    const { unreadOnly, limit = '20' } = req.query
    const notifications = await prisma.notification.findMany({
      where: { userId, ...(unreadOnly === 'true' && { read: false }) },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    })
    const unreadCount = await prisma.notification.count({ where: { userId, read: false } })
    return res.json({ notifications, unreadCount })
  }

  // PATCH — mark all as read
  if (req.method === 'PATCH') {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() }
    })
    return res.json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

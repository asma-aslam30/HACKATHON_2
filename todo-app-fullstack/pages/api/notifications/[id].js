import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null)
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query

  // PATCH — mark single notification as read
  if (req.method === 'PATCH') {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true, readAt: new Date() }
    })
    return res.json({ success: true })
  }

  // DELETE — delete notification
  if (req.method === 'DELETE') {
    await prisma.notification.deleteMany({ where: { id, userId } })
    return res.json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

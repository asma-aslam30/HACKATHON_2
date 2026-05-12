import { prisma } from '../../../../../lib/db'
import { auth } from '../../../../../lib/auth'

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null)
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { teamId, memberId } = req.query

  const requester = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } }
  })
  if (!requester) return res.status(403).json({ error: 'Not a member' })

  // PATCH — update member role
  if (req.method === 'PATCH') {
    if (requester.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const { role } = req.body
    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } }
    })
    return res.json(member)
  }

  // DELETE — remove member
  if (req.method === 'DELETE') {
    const target = await prisma.teamMember.findUnique({ where: { id: memberId } })
    if (!target) return res.status(404).json({ error: 'Member not found' })
    // Only admin can remove others; anyone can remove themselves
    if (target.userId !== userId && requester.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' })
    }
    await prisma.teamMember.delete({ where: { id: memberId } })
    return res.json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

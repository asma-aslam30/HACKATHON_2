import { prisma } from '../../../../../lib/db'
import { auth } from '../../../../../lib/auth'

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null)
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { teamId } = req.query

  // Verify requester is a member
  const requester = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } }
  })
  if (!requester) return res.status(403).json({ error: 'Not a member of this team' })

  // GET — list members
  if (req.method === 'GET') {
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { joinedAt: 'asc' }
    })
    return res.json(members)
  }

  // POST — invite member by email
  if (req.method === 'POST') {
    if (requester.role !== 'admin') return res.status(403).json({ error: 'Admin only' })

    const { email, role = 'member' } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })

    // Find user by email
    const invitee = await prisma.user.findUnique({ where: { email } })
    if (!invitee) return res.status(404).json({ error: `No user found with email: ${email}` })

    // Check if already a member
    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: invitee.id } }
    })
    if (existing) return res.status(409).json({ error: 'User is already a member' })

    const member = await prisma.teamMember.create({
      data: { teamId, userId: invitee.id, role, invitedBy: userId },
      include: { user: { select: { id: true, name: true, email: true } } }
    })

    // Create notification for the invited user
    const team = await prisma.team.findUnique({ where: { id: teamId }, select: { name: true } })
    await prisma.notification.create({
      data: {
        userId: invitee.id,
        type: 'team_invite',
        title: 'Team Invitation',
        message: `You've been added to team "${team.name}"`,
        data: { teamId },
        actionUrl: `/teams/${teamId}`
      }
    })

    return res.status(201).json(member)
  }

  res.status(405).json({ error: 'Method not allowed' })
}

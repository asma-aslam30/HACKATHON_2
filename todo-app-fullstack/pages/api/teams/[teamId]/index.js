import { prisma } from '../../../../lib/db'
import { auth } from '../../../../lib/auth'

async function getMember(teamId, userId) {
  return prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId } } })
}

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null)
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { teamId } = req.query
  const member = await getMember(teamId, userId)
  if (!member) return res.status(403).json({ error: 'Not a member of this team' })

  // GET — team details with members + tasks
  if (req.method === 'GET') {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { joinedAt: 'asc' }
        }
      }
    })
    return res.json({ ...team, myRole: member.role })
  }

  // PATCH — update team (admin only)
  if (req.method === 'PATCH') {
    if (member.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const { name, description } = req.body
    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } }
      }
    })
    return res.json(team)
  }

  // DELETE — delete team (admin only)
  if (req.method === 'DELETE') {
    if (member.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    await prisma.team.delete({ where: { id: teamId } })
    return res.json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

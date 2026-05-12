import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null)
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  // GET — list all teams user belongs to
  if (req.method === 'GET') {
    const memberships = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            creator: { select: { id: true, name: true, email: true } },
            members: {
              include: { user: { select: { id: true, name: true, email: true } } }
            },
          }
        }
      }
    })
    return res.json(memberships.map(m => ({ ...m.team, myRole: m.role })))
  }

  // POST — create a new team
  if (req.method === 'POST') {
    const { name, description } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Team name is required' })

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        description: description || null,
        createdBy: userId,
        members: {
          create: { userId, role: 'admin' }
        }
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    })
    return res.status(201).json(team)
  }

  res.status(405).json({ error: 'Method not allowed' })
}

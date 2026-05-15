import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  let userId
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    userId = session?.user?.id
  } catch {}
  userId = userId || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  try {
    // Get all teams the user belongs to
    const memberships = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          }
        }
      }
    })

    if (memberships.length === 0) {
      return res.status(200).json({ teams: [], memberWorkload: [] })
    }

    // Collect all unique team member user IDs
    const allMemberIds = new Set()
    const teamSummaries = []

    for (const m of memberships) {
      const team = m.team
      const memberIds = team.members.map(tm => tm.userId)
      memberIds.forEach(id => allMemberIds.add(id))

      // Per-team task stats
      const [total, completed, overdue] = await Promise.all([
        prisma.todo.count({ where: { userId: { in: memberIds } } }),
        prisma.todo.count({ where: { userId: { in: memberIds }, completed: true } }),
        prisma.todo.count({ where: { userId: { in: memberIds }, completed: false, dueDate: { lt: new Date() } } }),
      ])

      teamSummaries.push({
        id: team.id,
        name: team.name,
        memberCount: team.members.length,
        totalTasks: total,
        completedTasks: completed,
        overdueTasks: overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      })
    }

    // Per-member workload (across all teams)
    const memberIds = Array.from(allMemberIds)
    const memberWorkload = await Promise.all(
      memberIds.map(async (mid) => {
        const user = memberships
          .flatMap(m => m.team.members)
          .find(tm => tm.userId === mid)?.user

        const [pending, completed, overdue] = await Promise.all([
          prisma.todo.count({ where: { userId: mid, completed: false } }),
          prisma.todo.count({ where: { userId: mid, completed: true } }),
          prisma.todo.count({ where: { userId: mid, completed: false, dueDate: { lt: new Date() } } }),
        ])

        return {
          userId: mid,
          name: user?.name || user?.email || 'Unknown',
          email: user?.email,
          pending,
          completed,
          overdue,
          total: pending + completed,
        }
      })
    )

    // Sort by pending tasks desc
    memberWorkload.sort((a, b) => b.pending - a.pending)

    return res.status(200).json({ teams: teamSummaries, memberWorkload })
  } catch (error) {
    console.error('Team stats error:', error)
    return res.status(500).json({ error: 'Failed to fetch team stats' })
  }
}

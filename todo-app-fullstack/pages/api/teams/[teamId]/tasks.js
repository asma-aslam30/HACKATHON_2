import { prisma } from '../../../../lib/db'
import { auth } from '../../../../lib/auth'

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null)
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { teamId } = req.query

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } }
  })
  if (!member) return res.status(403).json({ error: 'Not a member' })

  // GET — all tasks assigned to team members
  if (req.method === 'GET') {
    // Get all member user IDs
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      select: { userId: true }
    })
    const memberIds = members.map(m => m.userId)

    const tasks = await prisma.todo.findMany({
      where: {
        assignments: { some: { userId: { in: memberIds } } }
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        comments: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'asc' }
        },
        subtasks: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return res.json(tasks)
  }

  // POST — create task and assign to team member
  if (req.method === 'POST') {
    const { title, description, priority, dueDate, assigneeId } = req.body
    if (!title?.trim()) return res.status(400).json({ error: 'Title required' })

    // Verify assignee is a team member
    if (assigneeId) {
      const assigneeMember = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: assigneeId } }
      })
      if (!assigneeMember) return res.status(400).json({ error: 'Assignee is not a team member' })
    }

    const task = await prisma.todo.create({
      data: {
        title: title.trim(),
        description,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
        ...(assigneeId && {
          assignments: {
            create: { userId: assigneeId, assignedBy: userId }
          }
        })
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        comments: true,
        subtasks: true
      }
    })

    // Notify the assignee
    if (assigneeId && assigneeId !== userId) {
      const team = await prisma.team.findUnique({ where: { id: teamId }, select: { name: true } })
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          type: 'task_assigned',
          title: 'Task Assigned',
          message: `You were assigned "${title}" in team "${team.name}"`,
          data: { taskId: task.id, teamId },
          actionUrl: `/teams/${teamId}`
        }
      })
    }

    return res.status(201).json(task)
  }

  res.status(405).json({ error: 'Method not allowed' })
}

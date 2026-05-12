import { prisma } from '../../../../lib/db'
import { auth } from '../../../../lib/auth'

// Team chat stored as special comments on a virtual "team chat" todo
// We use a dedicated TeamMessage model pattern via Comment with todoId=teamId marker

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null)
  const userId = session?.user?.id || req.headers['x-user-id']
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { teamId } = req.query

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    include: { user: { select: { id: true, name: true, email: true } } }
  })
  if (!member) return res.status(403).json({ error: 'Not a member' })

  // GET — last 50 messages
  if (req.method === 'GET') {
    const messages = await prisma.teamMessage.findMany({
      where: { teamId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
      take: 50
    })
    return res.json(messages)
  }

  // POST — send message
  if (req.method === 'POST') {
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Message cannot be empty' })

    const message = await prisma.teamMessage.create({
      data: { teamId, userId, content: content.trim() },
      include: { user: { select: { id: true, name: true, email: true } } }
    })
    return res.status(201).json(message)
  }

  res.status(405).json({ error: 'Method not allowed' })
}

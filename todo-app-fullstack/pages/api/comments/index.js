import { prisma } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { todoId } = req.query

    if (!todoId) {
      return res.status(400).json({ error: 'todoId is required' })
    }

    try {
      const comments = await prisma.comment.findMany({
        where: { todoId },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      })
      return res.status(200).json(comments)
    } catch (error) {
      console.error('Error fetching comments:', error)
      return res.status(500).json({ error: 'Failed to fetch comments' })
    }
  }

  if (req.method === 'POST') {
    const { todoId, content, userId } = req.body

    if (!todoId || !content || !userId) {
      return res.status(400).json({ error: 'todoId, content, and userId are required' })
    }

    try {
      // Parse mentions from content
      const mentionRegex = /@(\w+)/g
      const mentions = []
      let match
      while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1])
      }

      const comment = await prisma.comment.create({
        data: {
          todoId,
          content,
          userId,
          mentions,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      return res.status(201).json(comment)
    } catch (error) {
      console.error('Error creating comment:', error)
      return res.status(500).json({ error: 'Failed to create comment' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

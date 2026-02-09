import { prisma } from '../../../lib/db'

export default async function handler(req, res) {
  const userId = req.headers['x-user-id']

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' })
  }

  if (req.method === 'GET') {
    try {
      // Get lists the user owns or is a collaborator on
      const lists = await prisma.sharedList.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { collaborations: { some: { userId } } }
          ]
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: {
              todos: true,
              collaborations: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return res.status(200).json(lists)
    } catch (error) {
      console.error('Error fetching lists:', error)
      return res.status(500).json({ error: 'Failed to fetch lists' })
    }
  }

  if (req.method === 'POST') {
    const { name, description, ownerId } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    try {
      const list = await prisma.sharedList.create({
        data: {
          name,
          description,
          ownerId: ownerId || userId
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: {
              todos: true,
              collaborations: true
            }
          }
        }
      })

      return res.status(201).json(list)
    } catch (error) {
      console.error('Error creating list:', error)
      return res.status(500).json({ error: 'Failed to create list' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

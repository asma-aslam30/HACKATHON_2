import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'
import { toNodeHandler } from 'better-auth/node'

async function getSessionUser(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    return session?.user || null
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  // POST - find or create user (legacy)
  if (req.method === 'POST') {
    const { email, name } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })
    try {
      let user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        user = await prisma.user.create({
          data: { email, name: name || email.split('@')[0] }
        })
      }
      return res.status(200).json({ user })
    } catch (error) {
      console.error('Auth error:', error)
      return res.status(500).json({ error: 'Authentication failed' })
    }
  }

  // PATCH - update profile name
  if (req.method === 'PATCH') {
    const sessionUser = await getSessionUser(req)
    if (!sessionUser) return res.status(401).json({ error: 'Unauthorized' })

    const { name } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' })

    try {
      const updated = await prisma.user.update({
        where: { id: sessionUser.id },
        data: { name: name.trim() },
        select: { id: true, email: true, name: true }
      })
      return res.status(200).json({ user: updated })
    } catch (error) {
      console.error('Update error:', error)
      return res.status(500).json({ error: 'Failed to update profile' })
    }
  }

  // DELETE - delete account and all data
  if (req.method === 'DELETE') {
    const sessionUser = await getSessionUser(req)
    if (!sessionUser) return res.status(401).json({ error: 'Unauthorized' })

    try {
      // Cascade delete - Prisma handles related records via onDelete: Cascade
      await prisma.user.delete({ where: { id: sessionUser.id } })
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete error:', error)
      return res.status(500).json({ error: 'Failed to delete account' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

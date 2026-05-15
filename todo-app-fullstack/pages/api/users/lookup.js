import { prisma } from '../../../lib/db'
import { auth } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  let requesterId
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    requesterId = session?.user?.id
  } catch {}
  if (!requesterId) return res.status(401).json({ error: 'Unauthorized' })

  const { email } = req.query
  if (!email) return res.status(400).json({ error: 'email query param required' })

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.status(200).json({ userId: user.id, name: user.name, email: user.email })
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

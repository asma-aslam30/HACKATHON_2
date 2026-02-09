import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function auth(req, res) {
  // Create authenticated Supabase Client.
  const supabase = createPagesServerClient({ req, res })

  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Either the user doesn't have a session or was invalid
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // If there's a valid session, return the user info
  res.status(200).json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.full_name || session.user.email,
    }
  })
}

export const config = {
  api: {
    externalResolver: true,
  },
}
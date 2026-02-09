import { useState, useEffect } from 'react'
import { useSession } from '@supabase/auth-helpers-react'

export default function AuthWrapper({ children }) {
  const [isClient, setIsClient] = useState(false)
  const session = useSession()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Render nothing on the server for hydration compatibility
    return null
  }

  // If no session, the child component (index.js) will handle the sign-in flow
  return children
}
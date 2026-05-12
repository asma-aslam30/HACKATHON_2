import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

export default function TeamsPage() {
  const router = useRouter()
  const { user, loading } = useApp()
  const [teams, setTeams] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => { if (!loading && !user) router.push('/auth') }, [user, loading])

  useEffect(() => {
    if (user) fetchTeams()
  }, [user])

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams')
      if (res.ok) setTeams(await res.json())
    } finally { setFetching(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        const team = await res.json()
        setTeams(prev => [team, ...prev])
        setShowCreate(false)
        setForm({ name: '', description: '' })
        router.push(`/teams/${team.id}`)
      }
    } finally { setCreating(false) }
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <h1 className="text-xl font-bold text-gray-900">My Teams</h1>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm">+ New Team</Button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {fetching ? (
          <div className="text-center py-20 text-gray-400">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No teams yet</p>
            <p className="text-gray-400 text-sm mt-1">Create a team and invite members</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>Create your first team</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map(team => (
              <div key={team.id}
                onClick={() => router.push(`/teams/${team.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    {team.description && <p className="text-sm text-gray-500 mt-1">{team.description}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    team.myRole === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                  }`}>{team.myRole}</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {team.members?.slice(0, 5).map(m => (
                      <div key={m.id} className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium" title={m.user?.name || m.user?.email}>
                        {(m.user?.name || m.user?.email || '?')[0].toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{team.members?.length} member{team.members?.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Team">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
            <input autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Design Team, Backend Squad"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2} placeholder="What does this team work on?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create Team</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

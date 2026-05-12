import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

export default function TeamDetailPage() {
  const router = useRouter()
  const { teamId } = router.query
  const { user, loading } = useApp()

  const [team, setTeam] = useState(null)
  const [tasks, setTasks] = useState([])
  const [messages, setMessages] = useState([])
  const [tab, setTab] = useState('tasks') // tasks | chat | members
  const [fetching, setFetching] = useState(true)

  // Modals
  const [showInvite, setShowInvite] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)

  // Forms
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', assigneeId: '', dueDate: '' })
  const [creatingTask, setCreatingTask] = useState(false)
  const [chatMsg, setChatMsg] = useState('')
  const [sending, setSending] = useState(false)
  const chatBottomRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => { if (!loading && !user) router.push('/auth') }, [user, loading])

  const fetchAll = useCallback(async () => {
    if (!teamId) return
    const [teamRes, tasksRes, chatRes] = await Promise.all([
      fetch(`/api/teams/${teamId}`),
      fetch(`/api/teams/${teamId}/tasks`),
      fetch(`/api/teams/${teamId}/chat`)
    ])
    if (teamRes.ok) setTeam(await teamRes.json())
    if (tasksRes.ok) setTasks(await tasksRes.json())
    if (chatRes.ok) setMessages(await chatRes.json())
    setFetching(false)
  }, [teamId])

  useEffect(() => {
    if (user && teamId) {
      fetchAll()
      // Poll chat every 5 seconds for real-time feel
      pollRef.current = setInterval(async () => {
        const res = await fetch(`/api/teams/${teamId}/chat`)
        if (res.ok) setMessages(await res.json())
      }, 5000)
    }
    return () => clearInterval(pollRef.current)
  }, [user, teamId, fetchAll])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviteError('')
    setInviting(true)
    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail })
      })
      const data = await res.json()
      if (!res.ok) { setInviteError(data.error); return }
      setTeam(prev => ({ ...prev, members: [...prev.members, data] }))
      setInviteEmail('')
      setShowInvite(false)
    } finally { setInviting(false) }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setCreatingTask(true)
    try {
      const res = await fetch(`/api/teams/${teamId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm)
      })
      if (res.ok) {
        const task = await res.json()
        setTasks(prev => [task, ...prev])
        setShowCreateTask(false)
        setTaskForm({ title: '', description: '', priority: 'medium', assigneeId: '', dueDate: '' })
      }
    } finally { setCreatingTask(false) }
  }

  const handleSendChat = async (e) => {
    e.preventDefault()
    if (!chatMsg.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/teams/${teamId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: chatMsg })
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
        setChatMsg('')
      }
    } finally { setSending(false) }
  }

  const handleToggleTask = async (task) => {
    const res = await fetch(`/api/todos/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed })
    })
    if (res.ok) {
      const { todo } = await res.json()
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...todo } : t))
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return
    const res = await fetch(`/api/teams/${teamId}/members/${memberId}`, { method: 'DELETE' })
    if (res.ok) setTeam(prev => ({ ...prev, members: prev.members.filter(m => m.id !== memberId) }))
  }

  if (loading || !user || fetching) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  }

  if (!team) return <div className="min-h-screen flex items-center justify-center text-gray-500">Team not found</div>

  const isAdmin = team.myRole === 'admin'
  const priorityColors = { high: 'bg-red-100 text-red-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-green-100 text-green-700' }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/teams" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{team.name}</h1>
              {team.description && <p className="text-sm text-gray-500">{team.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Member avatars */}
            <div className="flex -space-x-2 mr-2">
              {team.members?.slice(0, 4).map(m => (
                <div key={m.id} title={m.user?.name || m.user?.email}
                  className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                  {(m.user?.name || m.user?.email || '?')[0].toUpperCase()}
                </div>
              ))}
              {team.members?.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold">
                  +{team.members.length - 4}
                </div>
              )}
            </div>
            {isAdmin && (
              <>
                <Button size="sm" variant="secondary" onClick={() => setShowInvite(true)}>+ Invite</Button>
                <Button size="sm" onClick={() => setShowCreateTask(true)}>+ Task</Button>
              </>
            )}
            {!isAdmin && <Button size="sm" onClick={() => setShowCreateTask(true)}>+ Task</Button>}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex gap-0">
          {['tasks', 'chat', 'members'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'chat' ? '💬 Chat' : t === 'tasks' ? '✅ Tasks' : '👥 Members'}
              {t === 'chat' && messages.length > 0 && <span className="ml-1 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">{messages.length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* TASKS TAB */}
        {tab === 'tasks' && (
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="font-medium">No tasks yet</p>
                <p className="text-sm mt-1">Create a task and assign it to a team member</p>
                <Button className="mt-4" onClick={() => setShowCreateTask(true)}>Create first task</Button>
              </div>
            ) : tasks.map(task => (
              <div key={task.id} className={`bg-white rounded-xl border p-4 ${task.completed ? 'opacity-60 border-gray-100' : 'border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => handleToggleTask(task)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                      task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-indigo-500'
                    }`}>
                    {task.completed && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                    {task.description && <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                      {task.dueDate && <span className="text-xs text-gray-500">📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                      {task.assignments?.map(a => (
                        <span key={a.id} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                          👤 {a.user?.name || a.user?.email}
                        </span>
                      ))}
                      {task.comments?.length > 0 && (
                        <span className="text-xs text-gray-500">💬 {task.comments.length}</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Comments */}
                {task.comments?.length > 0 && (
                  <div className="mt-3 pl-8 space-y-2">
                    {task.comments.map(c => (
                      <div key={c.id} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                          {(c.user?.name || c.user?.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="bg-gray-50 rounded-lg px-3 py-1.5 flex-1">
                          <p className="text-xs font-medium text-gray-700">{c.user?.name || c.user?.email}</p>
                          <p className="text-sm text-gray-600">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <TaskComment taskId={task.id} userId={user.id} onComment={comment => {
                  setTasks(prev => prev.map(t => t.id === task.id
                    ? { ...t, comments: [...(t.comments || []), comment] } : t))
                }} />
              </div>
            ))}
          </div>
        )}

        {/* CHAT TAB */}
        {tab === 'chat' && (
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col" style={{ height: '60vh' }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-gray-400 text-sm mt-8">No messages yet. Start the conversation!</p>
              )}
              {messages.map(msg => {
                const isMe = msg.userId === user.id
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${isMe ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                      {(msg.user?.name || msg.user?.email || '?')[0].toUpperCase()}
                    </div>
                    <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!isMe && <p className="text-xs text-gray-500 mb-1">{msg.user?.name || msg.user?.email}</p>}
                      <div className={`px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                        {msg.content}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={chatBottomRef} />
            </div>
            <form onSubmit={handleSendChat} className="border-t border-gray-200 p-3 flex gap-2">
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                placeholder="Type a message... (Enter to send)"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              <Button type="submit" size="sm" loading={sending} disabled={!chatMsg.trim()}>Send</Button>
            </form>
          </div>
        )}

        {/* MEMBERS TAB */}
        {tab === 'members' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {team.members?.map(m => (
                <div key={m.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                      {(m.user?.name || m.user?.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{m.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{m.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      m.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>{m.role}</span>
                    {isAdmin && m.userId !== user.id && (
                      <button onClick={() => handleRemoveMember(m.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {isAdmin && (
              <div className="px-5 py-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setShowInvite(true)}>+ Invite Member</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal isOpen={showInvite} onClose={() => { setShowInvite(false); setInviteEmail(''); setInviteError('') }} title="Invite Member">
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input autoFocus type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              placeholder="teammate@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            {inviteError && <p className="text-sm text-red-600 mt-1">{inviteError}</p>}
          </div>
          <p className="text-xs text-gray-500">The user must already have an account. They will be notified automatically.</p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button type="submit" loading={inviting}>Send Invite</Button>
          </div>
        </form>
      </Modal>

      {/* Create Task Modal */}
      <Modal isOpen={showCreateTask} onClose={() => setShowCreateTask(false)} title="Assign Task to Team">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input autoFocus value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
              rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
            <select value={taskForm.assigneeId} onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="">Unassigned</option>
              {team.members?.map(m => (
                <option key={m.id} value={m.userId}>{m.user?.name || m.user?.email}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowCreateTask(false)}>Cancel</Button>
            <Button type="submit" loading={creatingTask}>Create & Assign</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// Inline comment form component
function TaskComment({ taskId, userId, onComment }) {
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [show, setShow] = useState(false)

  const post = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setPosting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todoId: taskId, content: text, userId })
      })
      if (res.ok) {
        const comment = await res.json()
        onComment(comment)
        setText('')
        setShow(false)
      }
    } finally { setPosting(false) }
  }

  return (
    <div className="mt-2 pl-8">
      {!show ? (
        <button onClick={() => setShow(true)} className="text-xs text-indigo-600 hover:underline">+ Add comment</button>
      ) : (
        <form onSubmit={post} className="flex gap-2 mt-1">
          <input autoFocus value={text} onChange={e => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          <button type="submit" disabled={posting || !text.trim()}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50">Post</button>
          <button type="button" onClick={() => setShow(false)} className="px-3 py-1.5 text-gray-500 text-xs hover:bg-gray-100 rounded-lg">Cancel</button>
        </form>
      )}
    </div>
  )
}

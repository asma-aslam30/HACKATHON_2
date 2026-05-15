import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useApp } from '../../context/AppContext'

export default function SettingsPage() {
  const { user, logout } = useApp()
  const router = useRouter()

  // Profile
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null) // 'success' | 'error'

  // Theme
  const [theme, setTheme] = useState('light')

  // Notification prefs (stored in localStorage)
  const [notifPrefs, setNotifPrefs] = useState({
    task_assignments: true,
    task_completions: true,
    comments_mentions: true,
    deadline_reminders: true,
  })

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Load saved prefs from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'light'
    const savedNotifs = localStorage.getItem('notif-prefs')
    setTheme(savedTheme)
    if (savedNotifs) setNotifPrefs(JSON.parse(savedNotifs))
    applyTheme(savedTheme)
  }, [])

  // Sync name when user loads
  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user])

  const applyTheme = (t) => {
    const root = document.documentElement
    if (t === 'dark') {
      root.classList.add('dark')
    } else if (t === 'light') {
      root.classList.remove('dark')
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      prefersDark ? root.classList.add('dark') : root.classList.remove('dark')
    }
  }

  const handleThemeChange = (t) => {
    setTheme(t)
    localStorage.setItem('app-theme', t)
    applyTheme(t)
  }

  const handleNotifToggle = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    localStorage.setItem('notif-prefs', JSON.stringify(updated))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch('/api/users/auth', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        setSaveMsg('success')
      } else {
        setSaveMsg('error')
      }
    } catch {
      setSaveMsg('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return
    setDeleting(true)
    try {
      const res = await fetch('/api/users/auth', { method: 'DELETE' })
      if (res.ok) {
        await logout()
        router.push('/auth')
      }
    } catch {
      setDeleting(false)
    }
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ]

  const notifItems = [
    { key: 'task_assignments', label: 'Task assignments', desc: 'When someone assigns a task to you' },
    { key: 'task_completions', label: 'Task completions', desc: 'When a task you created is completed' },
    { key: 'comments_mentions', label: 'Comments & mentions', desc: 'When someone mentions you in a comment' },
    { key: 'deadline_reminders', label: 'Deadline reminders', desc: 'Reminders before tasks are due' },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* ── Profile ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saveMsg === 'success' && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </span>
            )}
            {saveMsg === 'error' && (
              <span className="text-sm text-red-600 font-medium">Failed to save. Try again.</span>
            )}
          </div>
        </form>
      </div>

      {/* ── Appearance ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Appearance</h2>
        <p className="text-xs text-gray-500 mb-4">Choose how the app looks</p>
        <div className="flex gap-3">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleThemeChange(opt.value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 text-sm font-medium rounded-xl border-2 transition-all
                ${theme === opt.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
            >
              <span className="text-xl">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Current: <span className="font-medium capitalize">{theme}</span> mode
          {theme === 'system' && ' (follows your OS setting)'}
        </p>
      </div>

      {/* ── Notifications ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Notifications</h2>
        <p className="text-xs text-gray-500 mb-4">Choose what you want to be notified about</p>
        <div className="space-y-1">
          {notifItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => handleNotifToggle(item.key)}
                role="switch"
                aria-checked={notifPrefs[item.key]}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  width: '44px',
                  height: '24px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background-color 0.2s ease',
                  backgroundColor: notifPrefs[item.key] ? '#4f46e5' : '#d1d5db',
                  outline: 'none',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: notifPrefs[item.key] ? '23px' : '3px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    transition: 'left 0.2s ease',
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-red-700 mb-1">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">These actions are permanent and cannot be undone.</p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-800">
              This will permanently delete your account and all your data including tasks, teams, and projects.
            </p>
            <p className="text-sm text-red-700">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

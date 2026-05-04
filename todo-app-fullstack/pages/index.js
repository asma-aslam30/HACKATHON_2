import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useApp } from '../context/AppContext'
import TaskCard from '../components/todos/TaskCard'
import TaskForm from '../components/todos/TaskForm'
import TaskDetailModal from '../components/todos/TaskDetailModal'
import GamificationPanel from '../components/GamificationPanel'
import PomodoroTimer from '../components/PomodoroTimer'
import TimeTracker from '../components/TimeTracker'
import TemplateManager from '../components/TemplateManager'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { useKeyboardShortcuts, ShortcutHelp } from '../lib/useKeyboardShortcuts'
import { initNotifications, rescheduleNotification } from '../lib/notificationService'
import { getDueDateStatus } from '../lib/dateUtils'

const XP_PER_COMPLETION = 10
const STREAK_BONUS = 5

export default function HomePage() {
  const router = useRouter()
  const { user, loading, addNotification } = useApp()

  // ── Task state ──────────────────────────────────────────────
  const [todos, setTodos] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('created')
  const [search, setSearch] = useState('')

  // ── Modals ───────────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [detailTask, setDetailTask] = useState(null)
  const [shareTask, setShareTask] = useState(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // ── Templates ────────────────────────────────────────────────
  const [templates, setTemplates] = useState([])

  // ── Time tracking ────────────────────────────────────────────
  const [activeTimerTask, setActiveTimerTask] = useState(null)

  // ── Gamification ─────────────────────────────────────────────
  const [userStats, setUserStats] = useState({
    totalXP: 0, level: 1, streak: 0, lastStreakDate: null, badges: [], lastXPGain: 0,
  })

  // ── Keyboard shortcuts ────────────────────────────────────────
  const shortcuts = [
    { key: 'n', label: 'New Task', handler: () => setShowCreateModal(true) },
    { key: '/', label: 'Search', handler: () => document.querySelector('[data-search]')?.focus() },
    { key: '?', label: 'Show shortcuts', handler: () => setShowShortcuts(true) },
    { key: 'Escape', label: 'Close modal', handler: () => {
      setShowCreateModal(false); setEditingTask(null); setDetailTask(null); setShowShortcuts(false)
    }},
  ]
  useKeyboardShortcuts(shortcuts)

  // ── Auth guard ────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) router.push('/auth')
  }, [user, loading, router])

  // ── Load tasks ────────────────────────────────────────────────
  const loadTodos = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('filter', filter)
      if (sort !== 'created') params.set('sort', sort)
      if (search) params.set('search', search)
      const res = await fetch(`/api/todos?${params}`)
      const data = await res.json()
      if (res.ok) {
        setTodos(Array.isArray(data) ? data : [])
        initNotifications(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setTasksLoading(false)
    }
  }, [filter, sort, search])

  useEffect(() => { if (user) loadTodos() }, [user, loadTodos])

  // ── Load templates ────────────────────────────────────────────
  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates')
      if (res.ok) setTemplates(await res.json())
    } catch {}
  }, [])

  useEffect(() => { if (user) loadTemplates() }, [user, loadTemplates])

  // ── Gamification helpers ──────────────────────────────────────
  const gainXP = (amount) => {
    setUserStats(prev => {
      const totalXP = prev.totalXP + amount
      const level = Math.floor(totalXP / 100) + 1
      const today = new Date().toDateString()
      const isNewStreak = prev.lastStreakDate !== today
      const streak = isNewStreak ? prev.streak + 1 : prev.streak
      return { ...prev, totalXP, level, streak, lastStreakDate: today, lastXPGain: amount }
    })
  }

  // ── Loading / auth guards ─────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  if (!user) return null

  // ── Task actions ──────────────────────────────────────────────
  const handleCreateTask = async (formData) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (!res.ok) throw new Error('Failed to create task')
    const newTodo = await res.json()
    setTodos(prev => [newTodo, ...prev])
    rescheduleNotification(newTodo)
    setShowCreateModal(false)
    addNotification?.('Task created!', 'success')
  }

  const handleUpdateTask = async (formData) => {
    const res = await fetch(`/api/todos/${editingTask.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (!res.ok) throw new Error('Failed to update task')
    const { todo, newRecurringTask } = await res.json()
    setTodos(prev => {
      const updated = prev.map(t => t.id === todo.id ? todo : t)
      return newRecurringTask ? [newRecurringTask, ...updated] : updated
    })
    rescheduleNotification(todo)
    setEditingTask(null)
    addNotification?.('Task updated!', 'success')
  }

  const handleToggle = async (id, currentCompleted) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentCompleted }),
    })
    if (!res.ok) return
    const { todo, newRecurringTask } = await res.json()
    setTodos(prev => {
      const updated = prev.map(t => t.id === todo.id ? todo : t)
      return newRecurringTask ? [newRecurringTask, ...updated] : updated
    })
    if (!currentCompleted) {
      gainXP(XP_PER_COMPLETION)
      if (todo.recurrencePattern) {
        addNotification?.(`↺ New recurring task created!`, 'success')
      }
    }
  }

  const handleDelete = async (id) => {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    if (res.ok) setTodos(prev => prev.filter(t => t.id !== id))
  }

  // ── Subtask actions ───────────────────────────────────────────
  const handleSubtaskAdd = async (todoId, title) => {
    const res = await fetch('/api/subtasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todoId, title }),
    })
    if (!res.ok) throw new Error('Failed to add subtask')
    const subtask = await res.json()
    const updateTodo = t => t.id === todoId
      ? { ...t, subtasks: [...(t.subtasks || []), subtask] }
      : t
    setTodos(prev => prev.map(updateTodo))
    if (detailTask?.id === todoId) setDetailTask(prev => updateTodo(prev))
  }

  const handleSubtaskToggle = async (todoId, subtaskId) => {
    const todo = todos.find(t => t.id === todoId)
    const sub = todo?.subtasks?.find(s => s.id === subtaskId)
    if (!sub) return
    const res = await fetch(`/api/subtasks/${subtaskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !sub.completed }),
    })
    if (!res.ok) return
    const updated = await res.json()
    const updateTodo = t => t.id === todoId
      ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? updated : s) }
      : t
    setTodos(prev => prev.map(updateTodo))
    if (detailTask?.id === todoId) setDetailTask(prev => updateTodo(prev))
  }

  const handleSubtaskDelete = async (todoId, subtaskId) => {
    const res = await fetch(`/api/subtasks/${subtaskId}`, { method: 'DELETE' })
    if (!res.ok) return
    const updateTodo = t => t.id === todoId
      ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) }
      : t
    setTodos(prev => prev.map(updateTodo))
    if (detailTask?.id === todoId) setDetailTask(prev => updateTodo(prev))
  }

  // ── Timer actions ─────────────────────────────────────────────
  const handleTimerToggle = async (task) => {
    if (activeTimerTask?.id === task.id) {
      // Stop
      await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todoId: task.id, action: 'stop' }),
      })
      setActiveTimerTask(null)
      loadTodos() // refresh totalTimeMs
    } else {
      // Stop any running timer first
      if (activeTimerTask) {
        await fetch('/api/time-entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ todoId: activeTimerTask.id, action: 'stop' }),
        })
      }
      await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todoId: task.id, action: 'start' }),
      })
      setActiveTimerTask(task)
    }
  }

  const handleTimerStop = async (taskId, elapsedMs) => {
    await fetch('/api/time-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todoId: taskId, action: 'stop', durationMs: elapsedMs }),
    })
    setActiveTimerTask(null)
    loadTodos()
  }

  // ── Template actions ──────────────────────────────────────────
  const handleTemplateSave = async (data) => {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to save template')
    }
    await loadTemplates()
  }

  const handleTemplateDelete = async (id) => {
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    await loadTemplates()
  }

  // ── Stats ─────────────────────────────────────────────────────
  const overdueCount = todos.filter(t => !t.completed && getDueDateStatus(t.dueDate)?.isOverdue).length

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Done' },
    { value: 'overdue', label: `Overdue${overdueCount > 0 ? ` (${overdueCount})` : ''}` },
    { value: 'due_today', label: 'Due Today' },
    { value: 'due_this_week', label: 'This Week' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 text-lg">TodoApp</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-6">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  data-search
                  type="text"
                  placeholder="Search tasks… (/)"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Keyboard shortcuts (?)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => setShowTemplates(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Templates"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
              <Button onClick={() => setShowCreateModal(true)} size="sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task (N)
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Overdue banner */}
      {overdueCount > 0 && filter !== 'overdue' && (
        <div
          onClick={() => setFilter('overdue')}
          className="cursor-pointer bg-red-500 text-white text-center text-sm py-2 font-medium hover:bg-red-600 transition-colors"
        >
          ⚠ {overdueCount} overdue task{overdueCount > 1 ? 's' : ''} — click to view
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <GamificationPanel
              currentXP={userStats.totalXP % 100}
              level={userStats.level}
              streak={userStats.streak}
              badges={userStats.badges}
              lastXPGain={userStats.lastXPGain}
            />
            <TimeTracker activeTask={activeTimerTask} onStop={handleTimerStop} />
            <PomodoroTimer />
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3 space-y-5">
            {/* Filters & sort */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                {filterOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      filter === opt.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="ml-auto">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="created">Sort: Newest</option>
                  <option value="due_date">Sort: Due Date</option>
                  <option value="priority">Sort: Priority</option>
                </select>
              </div>
            </div>

            {/* Task list */}
            {tasksLoading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Loading tasks...</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No tasks yet</p>
                <p className="text-gray-400 text-sm mt-1">Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">N</kbd> to add one</p>
                <Button className="mt-4" onClick={() => setShowCreateModal(true)}>Create your first task</Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {todos.map(task => (
                  <div key={task.id} onClick={() => setDetailTask(task)} className="cursor-pointer">
                    <TaskCard
                      task={task}
                      onToggle={(id, c) => { handleToggle(id, c); }}
                      onDelete={handleDelete}
                      onEdit={(t) => { setEditingTask(t); }}
                      onShare={setShareTask}
                      onStartTimer={handleTimerToggle}
                      activeTimerTaskId={activeTimerTask?.id}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Task" size="lg">
        <TaskForm
          templates={templates}
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task" size="lg">
        {editingTask && (
          <TaskForm
            initialValues={editingTask}
            templates={templates}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
          />
        )}
      </Modal>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={detailTask}
        isOpen={!!detailTask}
        onClose={() => setDetailTask(null)}
        onSubtaskAdd={handleSubtaskAdd}
        onSubtaskToggle={handleSubtaskToggle}
        onSubtaskDelete={handleSubtaskDelete}
        onEdit={(t) => { setDetailTask(null); setEditingTask(t) }}
      />

      {/* Templates Manager */}
      <TemplateManager
        templates={templates}
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSave={handleTemplateSave}
        onDelete={handleTemplateDelete}
      />

      {/* Keyboard shortcuts help */}
      <ShortcutHelp
        shortcuts={shortcuts}
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  )
}

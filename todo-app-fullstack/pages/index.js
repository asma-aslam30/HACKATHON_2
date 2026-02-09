import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/layout/Layout'
import { useApp } from '../context/AppContext'
import TaskCard from '../components/todos/TaskCard'
import TaskForm from '../components/todos/TaskForm'
import ShareModal from '../components/collaboration/ShareModal'
import CommentsPanel from '../components/collaboration/CommentsPanel'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import GamificationPanel from '../components/GamificationPanel'
import AchievementModal from '../components/AchievementModal'

export default function HomePage() {
  const router = useRouter()
  const { user, loading, addNotification } = useApp()

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }
  const [todos, setTodos] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [priority, setPriority] = useState('all')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [shareTask, setShareTask] = useState(null)
  const [commentTask, setCommentTask] = useState(null)

  // Gamification state
  const [userStats, setUserStats] = useState({
    totalXP: 0,
    level: 1,
    streak: 0,
    lastStreakDate: null, // Track the last day a task was completed
    badges: [],
    lastXPGain: 0
  })
  const [achievement, setAchievement] = useState(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadTodos()
    }
  }, [user])

  const loadTodos = async () => {
    try {
      const res = await fetch('/api/todos', {
        headers: { 'x-user-id': user.id }
      })
      const data = await res.json()
      setTodos(data)
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      setTasksLoading(false)
    }
  }

  const createTodo = async (data) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify(data)
    })
    const todo = await res.json()
    setTodos([todo, ...todos])
    setShowCreateModal(false)
    addNotification({ type: 'success', message: 'Task created successfully!' })
  }

  const updateTodo = async (data) => {
    const res = await fetch(`/api/todos/${editingTask.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify(data)
    })
    const updated = await res.json()
    setTodos(todos.map(t => t.id === updated.id ? updated : t))
    setEditingTask(null)
    addNotification({ type: 'success', message: 'Task updated!' })
  }

  const toggleTodo = async (id, completed) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ completed: !completed })
    })
    const updated = await res.json()
    setTodos(todos.map(t => t.id === id ? updated : t))

    // Handle gamification if task is being completed (not uncompleted)
    if (!completed) {
      // Calculate XP based on task priority
      const xpGain = updated.priority === 'high' ? 20 : updated.priority === 'medium' ? 15 : 10

      // Update user stats with XP gain
      setUserStats(prev => {
        const newTotalXP = prev.totalXP + xpGain
        const newLevel = Math.floor(newTotalXP / 100) + 1

        // Calculate new streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let newStreak = prev.streak;
        let newLastStreakDate = prev.lastStreakDate;

        if (!prev.lastStreakDate) {
          // First time completing a task
          newStreak = 1;
          newLastStreakDate = today.toISOString();
        } else {
          const lastDate = new Date(prev.lastStreakDate);
          lastDate.setHours(0, 0, 0, 0);

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);

          if (lastDate.getTime() === today.getTime()) {
            // Already completed a task today, don't increase streak
            newStreak = prev.streak;
            newLastStreakDate = prev.lastStreakDate;
          } else if (lastDate.getTime() === yesterday.getTime()) {
            // Completed yesterday, continuing streak
            newStreak = prev.streak + 1;
            newLastStreakDate = today.toISOString();
          } else {
            // Streak broken, reset to 1
            newStreak = 1;
            newLastStreakDate = today.toISOString();
          }
        }

        const newBadges = [...prev.badges]

        // Check for achievements based on XP and streak
        let newAchievement = null;
        if (newTotalXP >= 100 && !prev.badges.some(b => b.id === 'first_level')) {
          // First level achievement
          newAchievement = {
            id: 'first_level',
            name: 'First Level',
            description: 'Reach level 2',
            icon: '⭐',
            rarity: 'common',
            xpBonus: 50
          };
          newBadges.push(newAchievement);
        } else if (newStreak >= 3 && !prev.badges.some(b => b.id === 'triple_streak')) {
          // 3-day streak achievement
          newAchievement = {
            id: 'triple_streak',
            name: 'Triple Streak',
            description: 'Complete tasks for 3 consecutive days',
            icon: '🔥',
            rarity: 'rare',
            xpBonus: 100
          };
          newBadges.push(newAchievement);
        } else if (newTotalXP >= 500 && !prev.badges.some(b => b.id === 'xp_master')) {
          // 500 XP achievement
          newAchievement = {
            id: 'xp_master',
            name: 'XP Master',
            description: 'Earn 500 total XP',
            icon: '👑',
            rarity: 'epic',
            xpBonus: 200
          };
          newBadges.push(newAchievement);
        }

        // If there's a new achievement, show the modal
        if (newAchievement) {
          setAchievement(newAchievement);
          setShowAchievementModal(true);

          // Add the achievement's XP bonus to the total
          return {
            ...prev,
            totalXP: newTotalXP + newAchievement.xpBonus,
            level: newLevel,
            streak: newStreak,
            lastStreakDate: newLastStreakDate,
            badges: newBadges,
            lastXPGain: xpGain + newAchievement.xpBonus
          };
        }

        return {
          ...prev,
          totalXP: newTotalXP,
          level: newLevel,
          streak: newStreak,
          lastStreakDate: newLastStreakDate,
          badges: newBadges,
          lastXPGain: xpGain
        };
      });
    }
  }

  const deleteTodo = async (id) => {
    await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': user.id }
    })
    setTodos(todos.filter(t => t.id !== id))
    addNotification({ type: 'info', message: 'Task deleted' })
  }

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active' && todo.completed) return false
    if (filter === 'completed' && !todo.completed) return false
    if (priority !== 'all' && todo.priority !== priority) return false
    if (search && !todo.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Gamification Panel */}
        <GamificationPanel userStats={userStats} />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-500">
              {stats.completed} of {stats.total} tasks completed
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              {['all', 'active', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        {tasksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16" />
                  <div className="h-6 bg-gray-200 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-4">
              {search || filter !== 'all' || priority !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first task to get started!'
              }
            </p>
            {!search && filter === 'all' && priority === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                Create Task
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTodos.map((todo) => (
              <TaskCard
                key={todo.id}
                task={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={setEditingTask}
                onShare={setShareTask}
                onComment={setCommentTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
      >
        <TaskForm
          onSubmit={createTodo}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm
            initialValues={editingTask}
            onSubmit={updateTodo}
            onCancel={() => setEditingTask(null)}
          />
        )}
      </Modal>

      {/* Share Modal */}
      <ShareModal
        isOpen={!!shareTask}
        onClose={() => setShareTask(null)}
        item={shareTask}
        type="task"
      />

      {/* Comments Panel */}
      <CommentsPanel
        taskId={commentTask?.id}
        isOpen={!!commentTask}
        onClose={() => setCommentTask(null)}
      />

      {/* Achievement Modal */}
      <AchievementModal
        achievement={achievement}
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
      />
    </Layout>
  )
}

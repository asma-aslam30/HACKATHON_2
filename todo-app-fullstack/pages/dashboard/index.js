import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { useApp } from '../../context/AppContext'

export default function DashboardPage() {
  const { user } = useApp()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', {
        headers: { 'x-user-id': user.id }
      })
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-gray-500">Track your team's progress and productivity</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Tasks"
                value={stats.totalTasks}
                icon="tasks"
                color="indigo"
              />
              <StatCard
                title="Completed"
                value={stats.completedTasks}
                subtitle={`${stats.completionRate}% completion rate`}
                icon="check"
                color="green"
              />
              <StatCard
                title="Pending"
                value={stats.pendingTasks}
                icon="clock"
                color="yellow"
              />
              <StatCard
                title="Overdue"
                value={stats.overdueTasks}
                icon="alert"
                color="red"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Productivity Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Weekly Productivity</h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {stats.productivityTrend.map((day, idx) => {
                    const maxHeight = Math.max(...stats.productivityTrend.map(d => d.completed), 1)
                    const height = (day.completed / maxHeight) * 100
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gray-100 rounded-t relative" style={{ height: '160px' }}>
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t transition-all duration-500"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{day.day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
                <div className="space-y-4">
                  {['high', 'medium', 'low'].map((priority) => {
                    const count = stats.tasksByPriority[priority] || 0
                    const percentage = stats.totalTasks > 0
                      ? Math.round((count / stats.totalTasks) * 100)
                      : 0
                    const colors = {
                      high: 'bg-red-500',
                      medium: 'bg-yellow-500',
                      low: 'bg-green-500'
                    }
                    return (
                      <div key={priority}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize font-medium text-gray-700">{priority}</span>
                          <span className="text-gray-500">{count} tasks ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[priority]} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {stats.recentTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-2 h-2 rounded-full
                          ${task.completed ? 'bg-green-500' : 'bg-gray-300'}
                        `} />
                        <span className={task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}>
                          {task.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

function StatCard({ title, value, subtitle, icon, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  }

  const icons = {
    tasks: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    check: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    clock: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    alert: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center`}>
          {icons[icon]}
        </div>
      </div>
    </div>
  )
}

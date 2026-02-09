import { CalendarIcon, CheckCircleIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/outline'

export default function Dashboard({ stats }) {
  const statCards = [
    {
      name: 'Total Tasks',
      value: stats.total || 0,
      icon: CalendarIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Completed',
      value: stats.completed || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Pending',
      value: stats.pending || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Collaborators',
      value: stats.collaborators || 0,
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            <li className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">User completed a task</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
            </li>
            <li className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Y</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">You added a new task</p>
                  <p className="text-sm text-gray-500">5 hours ago</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
import { LogoutIcon } from '@heroicons/react/outline'
import UserAvatar from './UserAvatar'

export default function Header({ user, onSignOut }) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Todo App</h1>
        <div className="flex items-center space-x-4">
          {user && <UserAvatar user={user} />}
          <button
            onClick={onSignOut}
            className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <LogoutIcon className="h-4 w-4 mr-1" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
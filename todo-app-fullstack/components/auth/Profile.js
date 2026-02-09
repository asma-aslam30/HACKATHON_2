/**
 * Profile Component - Shows user profile and allows logout
 */

import { useApp } from '../context/AppContext';

export default function Profile() {
  const { user, logout } = useApp();

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || user.email}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {user.name || user.email}
            </h3>
            <p className="text-gray-500 text-sm">
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
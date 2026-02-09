import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Sidebar from './Sidebar'
import Header from './Header'
import LoginPage from '../auth/LoginPage'

function NotificationToast() {
  const { notifications } = useApp()

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300
            ${notification.type === 'success' ? 'bg-green-600' : ''}
            ${notification.type === 'error' ? 'bg-red-600' : ''}
            ${notification.type === 'info' ? 'bg-indigo-600' : ''}
          `}
        >
          {notification.message}
        </div>
      ))}
    </div>
  )
}

export default function Layout({ children }) {
  const { user, loading } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Toast Notifications */}
      <NotificationToast />
    </div>
  )
}

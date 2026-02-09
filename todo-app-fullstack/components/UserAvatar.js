import { UserCircleIcon } from '@heroicons/react/outline'

export default function UserAvatar({ user, size = 'md' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  }

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  // Generate initials from user's name or email
  const getInitials = (user) => {
    if (user.name) {
      const names = user.name.split(' ')
      return names.length > 1
        ? names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase()
        : names[0][0].toUpperCase()
    }

    if (user.email) {
      const parts = user.email.split('@')[0].split('.')
      return parts.length > 1
        ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
        : parts[0][0].toUpperCase()
    }

    return '?'
  }

  const initials = getInitials(user)

  return (
    <div className="flex items-center">
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center`}>
        <span className={`${textSize[size]} font-medium text-gray-700`}>
          {initials}
        </span>
      </div>
      <span className="ml-2 text-sm font-medium text-gray-700">
        {user.name || user.email}
      </span>
    </div>
  )
}
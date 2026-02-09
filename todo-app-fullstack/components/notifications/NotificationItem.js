/**
 * NotificationItem Component
 * Single notification display with actions
 */

import { useRouter } from 'next/router';
import {
  AtSign,
  UserPlus,
  TrendingUp,
  Bell,
  CheckCircle,
  Clock,
  Users,
  Shield
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { formatDistanceToNow } from '../../lib/utils';

const NOTIFICATION_ICONS = {
  mention: AtSign,
  assignment: UserPlus,
  task_assigned: UserPlus,
  progress_request: TrendingUp,
  progress_update: TrendingUp,
  task_completed: CheckCircle,
  deadline_approaching: Clock,
  member_joined: Users,
  member_left: Users,
  role_changed: Shield,
  default: Bell
};

const NOTIFICATION_COLORS = {
  mention: 'bg-blue-100 text-blue-600',
  assignment: 'bg-green-100 text-green-600',
  task_assigned: 'bg-green-100 text-green-600',
  progress_request: 'bg-orange-100 text-orange-600',
  progress_update: 'bg-purple-100 text-purple-600',
  task_completed: 'bg-emerald-100 text-emerald-600',
  deadline_approaching: 'bg-red-100 text-red-600',
  member_joined: 'bg-indigo-100 text-indigo-600',
  member_left: 'bg-gray-100 text-gray-600',
  role_changed: 'bg-yellow-100 text-yellow-600',
  default: 'bg-gray-100 text-gray-600'
};

export default function NotificationItem({ notification, onClose }) {
  const router = useRouter();
  const user = useStore(state => state.user);
  const { markNotificationRead, removeNotification } = useStore();

  const Icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default;
  const colorClass = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.default;

  const handleClick = async () => {
    // Mark as read
    if (!notification.read && user?.id) {
      try {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          },
          body: JSON.stringify({ notificationId: notification.id })
        });
        markNotificationRead(notification.id);
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Navigate if action URL exists
    if (notification.actionUrl) {
      onClose?.();
      router.push(notification.actionUrl);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();

    if (!user?.id) return;

    try {
      await fetch(`/api/notifications/${notification.id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id }
      });
      removeNotification(notification.id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const timeAgo = formatDistanceToNow
    ? formatDistanceToNow(new Date(notification.createdAt))
    : new Date(notification.createdAt).toLocaleDateString();

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
        hover:bg-gray-50
        ${!notification.read ? 'bg-indigo-50/50' : ''}
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
            {notification.message}
          </p>
          {!notification.read && (
            <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-indigo-600 rounded-full" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{timeAgo}</p>
      </div>
    </div>
  );
}

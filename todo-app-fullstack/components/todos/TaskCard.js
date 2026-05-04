import { useState, useEffect } from 'react'
import { getDueDateStatus, formatDuration } from '../../lib/dateUtils'

const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
}

const dueDateColors = {
  red: 'text-red-600 bg-red-50 border-red-200',
  orange: 'text-orange-600 bg-orange-50 border-orange-200',
  yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  gray: 'text-gray-500',
}

const recurrenceIcon = {
  daily: '↺ Daily',
  weekly: '↺ Weekly',
  monthly: '↺ Monthly',
}

export default function TaskCard({
  task,
  onToggle,
  onDelete,
  onEdit,
  onShare,
  onComment,
  onStartTimer,
  activeTimerTaskId,
  showActions = true,
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [dueDateStatus, setDueDateStatus] = useState(() => getDueDateStatus(task.dueDate))

  // Re-compute due date status every minute for live countdowns
  useEffect(() => {
    if (!task.dueDate) return
    const interval = setInterval(() => {
      setDueDateStatus(getDueDateStatus(task.dueDate))
    }, 60000)
    return () => clearInterval(interval)
  }, [task.dueDate])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    setIsDeleting(true)
    try { await onDelete(task.id) }
    catch (error) { console.error(error) }
    finally { setIsDeleting(false) }
  }

  const subtaskProgress = task.subtasks?.length > 0
    ? { done: task.subtasks.filter(s => s.completed).length, total: task.subtasks.length }
    : null

  const isTimerActive = activeTimerTaskId === task.id

  return (
    <div className={`
      bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200
      ${task.completed ? 'opacity-60' : ''}
      ${dueDateStatus?.isOverdue && !task.completed ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}
    `}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id, task.completed)}
          className={`
            w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5
            transition-colors flex items-center justify-center
            ${task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-indigo-500'
            }
          `}
        >
          {task.completed && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>

        {/* Active timer indicator */}
        {isTimerActive && (
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 animate-pulse mt-2" title="Timer running" />
        )}
      </div>

      {/* Subtask progress bar */}
      {subtaskProgress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Subtasks</span>
            <span>{subtaskProgress.done}/{subtaskProgress.total}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(subtaskProgress.done / subtaskProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Metadata row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>

        {/* Due date badge */}
        {dueDateStatus && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border flex items-center gap-1 ${dueDateColors[dueDateStatus.color]}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {dueDateStatus.label}
            {dueDateStatus.isOverdue && ' ⚠'}
          </span>
        )}

        {/* Recurrence badge */}
        {task.recurrencePattern && recurrenceIcon[task.recurrencePattern] && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full border bg-purple-50 text-purple-600 border-purple-200">
            {recurrenceIcon[task.recurrencePattern]}
          </span>
        )}

        {/* Time tracked */}
        {task.totalTimeMs > 0 && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDuration(task.totalTimeMs)}
          </span>
        )}

        {/* Comments count */}
        {task.comments && task.comments.length > 0 && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {task.comments.length}
          </span>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {onComment && (
              <button onClick={() => onComment(task)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Comments">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            )}
            {onShare && (
              <button onClick={() => onShare(task)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Share">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            )}
            {/* Timer button */}
            {onStartTimer && !task.completed && (
              <button
                onClick={() => onStartTimer(task)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isTimerActive
                    ? 'text-green-600 bg-green-50 hover:bg-green-100'
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }`}
                title={isTimerActive ? 'Stop timer' : 'Start timer'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button onClick={() => onEdit(task)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

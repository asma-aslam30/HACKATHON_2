import Modal from '../ui/Modal'
import SubtaskPanel from './SubtaskPanel'
import { getDueDateStatus, formatDuration } from '../../lib/dateUtils'

export default function TaskDetailModal({ task, isOpen, onClose, onSubtaskAdd, onSubtaskToggle, onSubtaskDelete, onEdit }) {
  if (!task) return null

  const dueDateStatus = getDueDateStatus(task.dueDate)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details" size="lg">
      <div className="space-y-4">
        {/* Title & description */}
        <div>
          <h2 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </h2>
          {task.description && (
            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-sm">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
            ${task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
              task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              'bg-green-50 text-green-700 border-green-200'}`}>
            {task.priority} priority
          </span>

          {dueDateStatus && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
              ${dueDateStatus.isOverdue ? 'bg-red-50 text-red-700 border-red-200' :
                dueDateStatus.isDueSoon ? 'bg-orange-50 text-orange-700 border-orange-200' :
                'bg-gray-50 text-gray-600 border-gray-200'}`}>
              📅 {dueDateStatus.label}
            </span>
          )}

          {task.recurrencePattern && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              ↺ Repeats {task.recurrencePattern}
            </span>
          )}

          {task.totalTimeMs > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              ⏱ {formatDuration(task.totalTimeMs)} tracked
            </span>
          )}
        </div>

        {/* Subtasks */}
        <SubtaskPanel
          taskId={task.id}
          subtasks={task.subtasks || []}
          onAdd={onSubtaskAdd}
          onToggle={onSubtaskToggle}
          onDelete={onSubtaskDelete}
        />

        {/* Edit button */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={() => { onClose(); onEdit(task) }}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            Edit Task
          </button>
        </div>
      </div>
    </Modal>
  )
}

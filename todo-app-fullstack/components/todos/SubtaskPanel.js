import { useState } from 'react'

export default function SubtaskPanel({ taskId, subtasks = [], onAdd, onToggle, onDelete }) {
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [showInput, setShowInput] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      await onAdd(taskId, newTitle.trim())
      setNewTitle('')
      setShowInput(false)
    } finally {
      setAdding(false)
    }
  }

  const done = subtasks.filter(s => s.completed).length
  const total = subtasks.length

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          Subtasks
          {total > 0 && (
            <span className="text-xs font-normal text-gray-400">{done}/{total}</span>
          )}
        </h4>
        {total < 20 && (
          <button
            onClick={() => setShowInput(!showInput)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + Add
          </button>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      )}

      {/* Subtask list */}
      <ul className="space-y-1.5">
        {subtasks.map(sub => (
          <li key={sub.id} className="flex items-center gap-2 group">
            <button
              onClick={() => onToggle(taskId, sub.id)}
              className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors
                ${sub.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300 hover:border-indigo-400'}`}
            >
              {sub.completed && (
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className={`flex-1 text-sm ${sub.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {sub.title}
            </span>
            <button
              onClick={() => onDelete(taskId, sub.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {/* Add subtask input */}
      {showInput && (
        <form onSubmit={handleAdd} className="flex gap-2 mt-2">
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Subtask title..."
            className="flex-1 text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={adding || !newTitle.trim()}
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setShowInput(false); setNewTitle('') }}
            className="px-3 py-1.5 text-gray-500 text-sm rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  )
}

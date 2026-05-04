import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { analyzeTitleForSuggestion } from '../../lib/dateUtils'

export default function TaskForm({ initialValues, onSubmit, onCancel, templates = [] }) {
  const [formData, setFormData] = useState({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    priority: initialValues?.priority || 'medium',
    dueDate: initialValues?.dueDate
      ? new Date(initialValues.dueDate).toISOString().slice(0, 16)
      : '',
    recurrencePattern: initialValues?.recurrencePattern || 'none',
    reminderEnabled: initialValues?.reminderEnabled || false,
    reminderOffset: initialValues?.reminderOffset || 15,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [suggestion, setSuggestion] = useState(null)
  const [showTemplates, setShowTemplates] = useState(false)

  const handleTitleBlur = () => {
    if (!formData.dueDate && !initialValues) {
      const s = analyzeTitleForSuggestion(formData.title)
      if (s) setSuggestion(s)
    }
  }

  const applyTemplate = (tpl) => {
    setFormData(prev => ({
      ...prev,
      title: tpl.title,
      description: tpl.description || '',
      priority: tpl.priority || 'medium',
    }))
    setShowTemplates(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        dueDate: formData.dueDate || null,
        recurrencePattern: formData.recurrencePattern === 'none' ? null : formData.recurrencePattern,
        reminderEnabled: formData.reminderEnabled && !!formData.dueDate,
        reminderOffset: Number(formData.reminderOffset),
      })
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save task' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {templates.length > 0 && !initialValues && (
        <div>
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Use a template
          </button>
          {showTemplates && (
            <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 flex items-center justify-between border-b border-gray-100 last:border-0"
                >
                  <span className="font-medium text-sm text-gray-800">{tpl.name}</span>
                  <span className="text-xs text-gray-400">{tpl.priority}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {suggestion && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm">
          <span className="text-amber-800">
            💡 <strong>{suggestion.hint}</strong> — add a due date?
          </span>
          <div className="flex gap-2 ml-3">
            <button
              type="button"
              onClick={() => { document.querySelector('[data-due-date]')?.focus(); setSuggestion(null) }}
              className="text-amber-700 font-medium hover:underline"
            >Yes</button>
            <button type="button" onClick={() => setSuggestion(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
      )}

      <Input
        label="Task Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        onBlur={handleTitleBlur}
        placeholder="What needs to be done?"
        error={errors.title}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add more details..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            data-due-date="true"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {formData.dueDate && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
            <select
              value={formData.recurrencePattern}
              onChange={(e) => setFormData({ ...formData, recurrencePattern: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.reminderEnabled}
                  onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remind me
              </span>
            </label>
            {formData.reminderEnabled && (
              <select
                value={formData.reminderOffset}
                onChange={(e) => setFormData({ ...formData, reminderOffset: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value={5}>5 min before</option>
                <option value={15}>15 min before</option>
                <option value={30}>30 min before</option>
                <option value={60}>1 hour before</option>
                <option value={1440}>1 day before</option>
              </select>
            )}
          </div>
        </div>
      )}

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errors.submit}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" loading={loading}>
          {initialValues ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}

import { useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'

export default function TemplateManager({ templates, onSave, onDelete, isOpen, onClose }) {
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', title: '', description: '', priority: 'medium' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.title.trim()) {
      setError('Name and title are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(form)
      setForm({ name: '', title: '', description: '', priority: 'medium' })
      setCreating(false)
    } catch (err) {
      setError(err.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Templates" size="lg">
      <div className="space-y-4">
        {!creating ? (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">{templates.length} template{templates.length !== 1 ? 's' : ''} saved</p>
              <Button size="sm" onClick={() => setCreating(true)}>+ New Template</Button>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">No templates yet. Create one to speed up task creation.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {templates.map(tpl => (
                  <li key={tpl.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{tpl.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{tpl.title} · <span className="capitalize">{tpl.priority}</span></p>
                    </div>
                    <button
                      onClick={() => onDelete(tpl.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="font-medium text-gray-800">New Template</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input
                autoFocus
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Weekly Report"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Task Title</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Write weekly report"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" onClick={() => { setCreating(false); setError('') }}>Cancel</Button>
              <Button type="submit" loading={saving}>Save Template</Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}

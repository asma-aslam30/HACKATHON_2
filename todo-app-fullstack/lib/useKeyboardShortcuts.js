import { useEffect, useState } from 'react'

/**
 * Register keyboard shortcuts.
 * Shortcuts are disabled while the user is typing in any input/textarea/select.
 *
 * @param {Array<{ key: string, label: string, handler: () => void }>} shortcuts
 */
export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const match = shortcuts.find(s => s.key.toLowerCase() === e.key.toLowerCase())
      if (match) {
        e.preventDefault()
        match.handler()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts])
}

/**
 * ShortcutHelp overlay component — renders a list of shortcuts.
 */
export function ShortcutHelp({ shortcuts, isOpen, onClose }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <ul className="space-y-2">
          {shortcuts.map(s => (
            <li key={s.key} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{s.label}</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-700">
                {s.key}
              </kbd>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-gray-400 text-center">Shortcuts are disabled while typing</p>
      </div>
    </div>
  )
}

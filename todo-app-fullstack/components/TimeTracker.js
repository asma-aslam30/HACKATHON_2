import { useState, useEffect, useRef } from 'react'
import { formatDuration } from '../lib/dateUtils'

export default function TimeTracker({ activeTask, onStop }) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!activeTask) { clearInterval(intervalRef.current); setElapsed(0); return }
    startRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startRef.current)
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [activeTask?.id])

  if (!activeTask) return null

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <div>
            <p className="text-xs text-green-600 font-medium">Tracking time</p>
            <p className="text-sm font-semibold text-green-800 truncate max-w-[140px]">{activeTask.title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-mono font-bold text-green-800">{formatDuration(elapsed)}</p>
          <button
            onClick={() => onStop(activeTask.id, elapsed)}
            className="text-xs text-green-600 hover:text-red-600 hover:underline mt-0.5"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  )
}

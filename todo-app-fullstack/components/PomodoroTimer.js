import { useState, useEffect, useRef } from 'react'

const DEFAULT_WORK = 25
const DEFAULT_BREAK = 5

export default function PomodoroTimer() {
  const [phase, setPhase] = useState('idle') // idle | work | break
  const [workMins, setWorkMins] = useState(DEFAULT_WORK)
  const [breakMins, setBreakMins] = useState(DEFAULT_BREAK)
  const [remaining, setRemaining] = useState(DEFAULT_WORK * 60)
  const [completedToday, setCompletedToday] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const intervalRef = useRef(null)

  // Load today's count from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pomodoro_today')
    if (stored) {
      const { date, count } = JSON.parse(stored)
      const today = new Date().toDateString()
      if (date === today) setCompletedToday(count)
    }
  }, [])

  const saveTodayCount = (count) => {
    localStorage.setItem('pomodoro_today', JSON.stringify({
      date: new Date().toDateString(),
      count,
    }))
    setCompletedToday(count)
  }

  const start = (p = 'work') => {
    setPhase(p)
    setRemaining(p === 'work' ? workMins * 60 : breakMins * 60)
    setIsMinimized(false)
  }

  const cancel = () => {
    clearInterval(intervalRef.current)
    setPhase('idle')
    setRemaining(workMins * 60)
  }

  // Countdown tick
  useEffect(() => {
    if (phase === 'idle') { clearInterval(intervalRef.current); return }

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          if (phase === 'work') {
            const newCount = completedToday + 1
            saveTodayCount(newCount)
            // Browser notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('🍅 Pomodoro complete!', { body: 'Take a 5-minute break.' })
            }
            setPhase('break')
            return breakMins * 60
          } else {
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('☕ Break over!', { body: 'Ready for another Pomodoro?' })
            }
            setPhase('idle')
            return workMins * 60
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [phase, workMins, breakMins])

  // Request notification permission on first start
  const handleStart = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    start('work')
  }

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0')
  const secs = (remaining % 60).toString().padStart(2, '0')
  const totalSecs = phase === 'work' ? workMins * 60 : breakMins * 60
  const progress = ((totalSecs - remaining) / totalSecs) * 100

  if (phase === 'idle') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            🍅 Pomodoro
          </h3>
          <button onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {showSettings && (
          <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Work (min)</label>
              <input type="number" min={1} max={90} value={workMins}
                onChange={e => setWorkMins(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Break (min)</label>
              <input type="number" min={1} max={30} value={breakMins}
                onChange={e => setBreakMins(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        )}

        <div className="text-center text-2xl font-mono font-bold text-gray-400 my-2">{workMins}:00</div>
        <button
          onClick={handleStart}
          className="w-full py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Start Pomodoro
        </button>
        {completedToday > 0 && (
          <p className="text-center text-xs text-gray-400 mt-2">
            {'🍅'.repeat(Math.min(completedToday, 8))} {completedToday} today
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border shadow-sm ${phase === 'break' ? 'border-green-300' : 'border-red-300'}`}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
          {phase === 'work' ? '🍅 Focus Time' : '☕ Break Time'}
        </h3>
        <button onClick={() => setIsMinimized(!isMinimized)} className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </button>
      </div>

      {!isMinimized && (
        <div className="px-4 pb-4">
          {/* Circular progress */}
          <div className="flex justify-center my-2">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={phase === 'work' ? '#ef4444' : '#22c55e'}
                  strokeWidth="2.5"
                  strokeDasharray={`${progress} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-mono font-bold text-gray-800">{mins}:{secs}</span>
              </div>
            </div>
          </div>

          <button
            onClick={cancel}
            className="w-full py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {isMinimized && (
        <div className="px-4 pb-3 flex items-center justify-between">
          <span className="font-mono font-bold text-gray-800">{mins}:{secs}</span>
          <button onClick={cancel} className="text-xs text-gray-400 hover:text-red-600">Cancel</button>
        </div>
      )}
    </div>
  )
}

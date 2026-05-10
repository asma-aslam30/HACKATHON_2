import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * VoiceButton — microphone button that uses Web Speech API
 * Calls onTranscript(text) when speech is recognized
 */
export default function VoiceButton({ onTranscript, disabled, size = 'md' }) {
  const [state, setState] = useState('idle') // idle | listening | processing | error
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startListening = useCallback(() => {
    if (!isSupported || state === 'listening') return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.lang = 'en-US' // will auto-detect Urdu from text

    recognition.onstart = () => setState('listening')
    recognition.onend = () => {
      if (state !== 'processing') setState('idle')
    }
    recognition.onerror = (e) => {
      if (e.error !== 'aborted') setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
    recognition.onresult = (e) => {
      const last = e.results[e.results.length - 1]
      const text = last[0].transcript
      setTranscript(text)
      if (last.isFinal) {
        setState('processing')
        recognitionRef.current = null
        onTranscript(text)
        setTimeout(() => { setState('idle'); setTranscript('') }, 1500)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, state, onTranscript])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setState('idle')
    setTranscript('')
  }, [])

  useEffect(() => () => recognitionRef.current?.stop(), [])

  if (!isSupported) return null

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-lg',
  }

  const colors = {
    idle: 'bg-white border-2 border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600',
    listening: 'bg-red-500 border-2 border-red-600 text-white shadow-lg shadow-red-200',
    processing: 'bg-indigo-500 border-2 border-indigo-600 text-white',
    error: 'bg-red-100 border-2 border-red-300 text-red-600',
  }

  return (
    <div className="relative flex flex-col items-center gap-1">
      <button
        onClick={state === 'listening' ? stopListening : startListening}
        disabled={disabled || state === 'processing'}
        className={`${sizes[size]} rounded-full flex items-center justify-center transition-all duration-200 ${colors[state]} disabled:opacity-50 disabled:cursor-not-allowed relative`}
        title={state === 'listening' ? 'Stop listening' : 'Start voice command'}
      >
        {/* Pulse ring when listening */}
        {state === 'listening' && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" style={{ animationDelay: '0.3s' }} />
          </>
        )}

        {state === 'processing' ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : state === 'error' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {/* Live transcript */}
      {transcript && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg max-w-48 truncate z-50">
          "{transcript}"
        </div>
      )}
    </div>
  )
}

/**
 * ConnectionStatus Component - Display real-time connection status
 * Implements T021: Add connection status indicators
 */

import { useState, useEffect } from 'react'
import { ConnectionState } from '../lib/realtime'

const statusConfig = {
  [ConnectionState.CONNECTED]: {
    color: 'bg-green-500',
    text: 'Connected',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    )
  },
  [ConnectionState.CONNECTING]: {
    color: 'bg-yellow-500',
    text: 'Connecting...',
    icon: (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    )
  },
  [ConnectionState.RECONNECTING]: {
    color: 'bg-yellow-500',
    text: 'Reconnecting...',
    icon: (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    )
  },
  [ConnectionState.DISCONNECTED]: {
    color: 'bg-gray-400',
    text: 'Disconnected',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
      </svg>
    )
  },
  [ConnectionState.ERROR]: {
    color: 'bg-red-500',
    text: 'Connection Error',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    )
  }
}

export default function ConnectionStatus({
  state = ConnectionState.DISCONNECTED,
  showText = true,
  size = 'default',
  onRetry
}) {
  const [showDetails, setShowDetails] = useState(false)
  const config = statusConfig[state] || statusConfig[ConnectionState.DISCONNECTED]

  const sizeClasses = {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-base'
  }

  const dotSizes = {
    small: 'w-2 h-2',
    default: 'w-3 h-3',
    large: 'w-4 h-4'
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-2 py-1 rounded-full hover:bg-gray-100 ${sizeClasses[size]}`}
      >
        {/* Status dot */}
        <span className={`${dotSizes[size]} rounded-full ${config.color} ${
          state === ConnectionState.CONNECTING || state === ConnectionState.RECONNECTING
            ? 'animate-pulse'
            : ''
        }`} />

        {showText && (
          <span className="text-gray-600">{config.text}</span>
        )}
      </button>

      {/* Details dropdown */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-3">
            <div className="flex items-center space-x-2 text-gray-900 font-medium">
              <span className={`w-3 h-3 rounded-full ${config.color}`} />
              <span>{config.text}</span>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              {state === ConnectionState.CONNECTED && (
                'Real-time updates are working. Changes will sync automatically.'
              )}
              {state === ConnectionState.CONNECTING && (
                'Establishing connection to the server...'
              )}
              {state === ConnectionState.RECONNECTING && (
                'Connection lost. Attempting to reconnect...'
              )}
              {state === ConnectionState.DISCONNECTED && (
                'Not connected to real-time updates. Changes may not sync immediately.'
              )}
              {state === ConnectionState.ERROR && (
                'Unable to connect to real-time updates. Changes will be saved locally.'
              )}
            </p>

            {(state === ConnectionState.DISCONNECTED || state === ConnectionState.ERROR) && onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
              >
                Retry Connection
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Simple status indicator without text
 */
export function ConnectionDot({ state = ConnectionState.DISCONNECTED }) {
  const config = statusConfig[state] || statusConfig[ConnectionState.DISCONNECTED]

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${config.color} ${
        state === ConnectionState.CONNECTING || state === ConnectionState.RECONNECTING
          ? 'animate-pulse'
          : ''
      }`}
      title={config.text}
    />
  )
}

/**
 * Full-width banner for connection status
 */
export function ConnectionBanner({
  state = ConnectionState.DISCONNECTED,
  onRetry,
  onDismiss
}) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Reset dismissed state when connected
    if (state === ConnectionState.CONNECTED) {
      setDismissed(false)
    }
  }, [state])

  // Don't show banner when connected or dismissed
  if (state === ConnectionState.CONNECTED || dismissed) {
    return null
  }

  const config = statusConfig[state] || statusConfig[ConnectionState.DISCONNECTED]
  const bgColors = {
    [ConnectionState.CONNECTING]: 'bg-yellow-50 border-yellow-200',
    [ConnectionState.RECONNECTING]: 'bg-yellow-50 border-yellow-200',
    [ConnectionState.DISCONNECTED]: 'bg-gray-50 border-gray-200',
    [ConnectionState.ERROR]: 'bg-red-50 border-red-200'
  }

  const textColors = {
    [ConnectionState.CONNECTING]: 'text-yellow-800',
    [ConnectionState.RECONNECTING]: 'text-yellow-800',
    [ConnectionState.DISCONNECTED]: 'text-gray-800',
    [ConnectionState.ERROR]: 'text-red-800'
  }

  return (
    <div className={`px-4 py-3 border-b ${bgColors[state]} flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <span className={`${config.color} rounded-full p-1 text-white`}>
          {config.icon}
        </span>
        <span className={textColors[state]}>
          {config.text}
          {state === ConnectionState.RECONNECTING && ' - Your changes will sync when connection is restored.'}
          {state === ConnectionState.ERROR && ' - Changes are being saved locally.'}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {onRetry && (state === ConnectionState.DISCONNECTED || state === ConnectionState.ERROR) && (
          <button
            onClick={onRetry}
            className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={() => {
              setDismissed(true)
              if (onDismiss) onDismiss()
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

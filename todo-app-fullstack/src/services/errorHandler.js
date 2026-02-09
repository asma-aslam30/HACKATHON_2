/**
 * Error Handler - Proper error handling for collaboration features
 * Implements T053: Implement proper error handling for collaboration features
 */

// Error codes for collaboration features
export const ErrorCodes = {
  // Share link errors
  SHARE_LINK_INVALID: 'COLLAB_001',
  SHARE_LINK_EXPIRED: 'COLLAB_001a',
  SHARE_LINK_LIMIT_REACHED: 'COLLAB_003',

  // Permission errors
  PERMISSION_DENIED: 'COLLAB_002',
  INSUFFICIENT_ROLE: 'COLLAB_002a',

  // User errors
  USER_NOT_FOUND: 'COLLAB_004',
  COLLABORATOR_LIMIT_REACHED: 'COLLAB_006',

  // List errors
  LIST_NOT_FOUND: 'COLLAB_005',
  LIST_ACCESS_DENIED: 'COLLAB_005a',

  // Assignment errors
  ASSIGNMENT_LIMIT_REACHED: 'COLLAB_006',
  SELF_ASSIGNMENT_DENIED: 'COLLAB_006a',

  // Comment errors
  COMMENT_TOO_LONG: 'COLLAB_007',
  COMMENT_EMPTY: 'COLLAB_007a',

  // Validation errors
  INVALID_DATE_FORMAT: 'COLLAB_008',
  INVALID_INPUT: 'COLLAB_009',

  // Network errors
  NETWORK_ERROR: 'COLLAB_010',
  SYNC_FAILED: 'COLLAB_011',

  // Conflict errors
  VERSION_CONFLICT: 'COLLAB_012',
  CONCURRENT_EDIT: 'COLLAB_012a',

  // Generic errors
  INTERNAL_ERROR: 'COLLAB_999',
  UNKNOWN_ERROR: 'COLLAB_000'
}

// User-friendly error messages
const ErrorMessages = {
  [ErrorCodes.SHARE_LINK_INVALID]: 'Invalid share link. Please check the link and try again.',
  [ErrorCodes.SHARE_LINK_EXPIRED]: 'This share link has expired.',
  [ErrorCodes.SHARE_LINK_LIMIT_REACHED]: 'Maximum share links reached. Please remove an existing link first.',
  [ErrorCodes.PERMISSION_DENIED]: 'You do not have permission to perform this action.',
  [ErrorCodes.INSUFFICIENT_ROLE]: 'Your role does not allow this action. Contact the list owner.',
  [ErrorCodes.USER_NOT_FOUND]: 'User not found. Please verify the username or email.',
  [ErrorCodes.COLLABORATOR_LIMIT_REACHED]: 'This list has reached its maximum number of collaborators.',
  [ErrorCodes.LIST_NOT_FOUND]: 'List not found. It may have been deleted.',
  [ErrorCodes.LIST_ACCESS_DENIED]: 'You do not have access to this list.',
  [ErrorCodes.ASSIGNMENT_LIMIT_REACHED]: 'Maximum assignees reached for this task.',
  [ErrorCodes.SELF_ASSIGNMENT_DENIED]: 'You cannot assign this task to yourself.',
  [ErrorCodes.COMMENT_TOO_LONG]: 'Comment must be 1000 characters or less.',
  [ErrorCodes.COMMENT_EMPTY]: 'Comment cannot be empty.',
  [ErrorCodes.INVALID_DATE_FORMAT]: 'Invalid date format. Please use YYYY-MM-DD.',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input. Please check your data.',
  [ErrorCodes.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ErrorCodes.SYNC_FAILED]: 'Failed to sync changes. They will be saved locally.',
  [ErrorCodes.VERSION_CONFLICT]: 'This item was modified by someone else. Please refresh.',
  [ErrorCodes.CONCURRENT_EDIT]: 'Someone else is editing this item.',
  [ErrorCodes.INTERNAL_ERROR]: 'An internal error occurred. Please try again.',
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred.'
}

// Suggestions for resolving errors
const ErrorSuggestions = {
  [ErrorCodes.SHARE_LINK_INVALID]: 'Ask the list owner for a new share link.',
  [ErrorCodes.SHARE_LINK_EXPIRED]: 'Request a new share link from the list owner.',
  [ErrorCodes.SHARE_LINK_LIMIT_REACHED]: 'Remove unused share links from the list settings.',
  [ErrorCodes.PERMISSION_DENIED]: 'Contact the list owner to request access.',
  [ErrorCodes.INSUFFICIENT_ROLE]: 'Ask an admin to upgrade your role.',
  [ErrorCodes.USER_NOT_FOUND]: 'Double-check the spelling of the username.',
  [ErrorCodes.COLLABORATOR_LIMIT_REACHED]: 'Remove inactive collaborators or upgrade the list.',
  [ErrorCodes.LIST_NOT_FOUND]: 'Check if you have the correct list ID.',
  [ErrorCodes.LIST_ACCESS_DENIED]: 'Request access from the list owner.',
  [ErrorCodes.ASSIGNMENT_LIMIT_REACHED]: 'Remove some assignees to add new ones.',
  [ErrorCodes.COMMENT_TOO_LONG]: 'Shorten your comment to 1000 characters.',
  [ErrorCodes.INVALID_DATE_FORMAT]: 'Use the format: YYYY-MM-DD (e.g., 2024-12-31).',
  [ErrorCodes.NETWORK_ERROR]: 'Check your internet connection and try again.',
  [ErrorCodes.SYNC_FAILED]: 'Changes will sync automatically when connection is restored.',
  [ErrorCodes.VERSION_CONFLICT]: 'Refresh the page to see the latest changes.',
  [ErrorCodes.CONCURRENT_EDIT]: 'Wait a moment and try again.'
}

/**
 * Custom error class for collaboration features
 */
export class CollaborationError extends Error {
  constructor(code, message, details = {}) {
    super(message || ErrorMessages[code] || 'An error occurred')
    this.name = 'CollaborationError'
    this.code = code
    this.details = details
    this.suggestion = ErrorSuggestions[code] || null
    this.timestamp = new Date().toISOString()
  }

  /**
   * Get a user-friendly error response
   * @returns {Object}
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        suggestion: this.suggestion,
        details: this.details,
        timestamp: this.timestamp
      }
    }
  }

  /**
   * Get formatted error for display
   * @returns {string}
   */
  toDisplayString() {
    let str = `Error [${this.code}]: ${this.message}`
    if (this.suggestion) {
      str += `\nSuggestion: ${this.suggestion}`
    }
    return str
  }
}

/**
 * Error handler service
 */
export class ErrorHandler {
  constructor() {
    this.errorLog = []
    this.maxLogSize = 100
    this.listeners = new Set()
  }

  /**
   * Handle an error
   * @param {Error} error - The error to handle
   * @param {Object} context - Additional context
   * @returns {CollaborationError}
   */
  handle(error, context = {}) {
    let collabError

    if (error instanceof CollaborationError) {
      collabError = error
    } else {
      // Map common errors to collaboration errors
      collabError = this.mapError(error, context)
    }

    // Log the error
    this.logError(collabError, context)

    // Notify listeners
    this.notifyListeners(collabError)

    return collabError
  }

  /**
   * Map generic errors to collaboration errors
   * @param {Error} error - Original error
   * @param {Object} context - Context
   * @returns {CollaborationError}
   */
  mapError(error, context) {
    const message = error.message?.toLowerCase() || ''

    // Network errors
    if (error.name === 'NetworkError' || message.includes('network') || message.includes('fetch')) {
      return new CollaborationError(ErrorCodes.NETWORK_ERROR, error.message, context)
    }

    // Permission errors
    if (message.includes('permission') || message.includes('access denied') || message.includes('forbidden')) {
      return new CollaborationError(ErrorCodes.PERMISSION_DENIED, error.message, context)
    }

    // Not found errors
    if (message.includes('not found') || message.includes('does not exist')) {
      if (message.includes('user')) {
        return new CollaborationError(ErrorCodes.USER_NOT_FOUND, error.message, context)
      }
      if (message.includes('list')) {
        return new CollaborationError(ErrorCodes.LIST_NOT_FOUND, error.message, context)
      }
    }

    // Conflict errors
    if (message.includes('conflict') || message.includes('version')) {
      return new CollaborationError(ErrorCodes.VERSION_CONFLICT, error.message, context)
    }

    // Validation errors
    if (message.includes('invalid') || message.includes('validation')) {
      return new CollaborationError(ErrorCodes.INVALID_INPUT, error.message, context)
    }

    // Default to unknown error
    return new CollaborationError(ErrorCodes.UNKNOWN_ERROR, error.message, {
      ...context,
      originalError: error.name
    })
  }

  /**
   * Create a specific collaboration error
   * @param {string} code - Error code
   * @param {Object} details - Additional details
   * @returns {CollaborationError}
   */
  createError(code, details = {}) {
    return new CollaborationError(code, ErrorMessages[code], details)
  }

  /**
   * Log an error
   * @param {CollaborationError} error - The error
   * @param {Object} context - Context
   */
  logError(error, context) {
    const logEntry = {
      ...error.toJSON(),
      context,
      logged: new Date().toISOString()
    }

    this.errorLog.unshift(logEntry)

    // Keep log size limited
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('[CollaborationError]', error.toDisplayString(), context)
    }
  }

  /**
   * Get recent errors
   * @param {number} count - Number of errors to return
   * @returns {Array}
   */
  getRecentErrors(count = 10) {
    return this.errorLog.slice(0, count)
  }

  /**
   * Clear error log
   */
  clearLog() {
    this.errorLog = []
  }

  /**
   * Add error listener
   * @param {Function} callback - Listener callback
   * @returns {Function} Unsubscribe function
   */
  addListener(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Notify listeners of an error
   * @param {CollaborationError} error - The error
   */
  notifyListeners(error) {
    this.listeners.forEach(callback => {
      try {
        callback(error)
      } catch (e) {
        console.error('Error in error listener:', e)
      }
    })
  }

  /**
   * Wrap an async function with error handling
   * @param {Function} fn - Function to wrap
   * @param {Object} context - Context for errors
   * @returns {Function} Wrapped function
   */
  wrap(fn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args)
      } catch (error) {
        throw this.handle(error, context)
      }
    }
  }

  /**
   * Try an operation with fallback
   * @param {Function} operation - Operation to try
   * @param {*} fallback - Fallback value on error
   * @param {Object} context - Error context
   * @returns {Promise<*>}
   */
  async tryWithFallback(operation, fallback, context = {}) {
    try {
      return await operation()
    } catch (error) {
      this.handle(error, { ...context, usingFallback: true })
      return fallback
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler()

export default errorHandler

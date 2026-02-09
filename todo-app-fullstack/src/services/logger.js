/**
 * Logger Service - Comprehensive logging for collaboration operations
 * Implements T054: Add comprehensive logging for collaboration operations
 */

// Log levels
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
}

// Log categories for filtering
export const LogCategory = {
  AUTH: 'auth',
  SHARING: 'sharing',
  REALTIME: 'realtime',
  COMMENTS: 'comments',
  ASSIGNMENTS: 'assignments',
  DASHBOARD: 'dashboard',
  SYNC: 'sync',
  ERROR: 'error',
  PERFORMANCE: 'performance'
}

/**
 * Logger service for collaboration operations
 */
export class Logger {
  constructor(options = {}) {
    this.level = options.level ?? LogLevel.INFO
    this.prefix = options.prefix ?? '[TodoApp]'
    this.enableConsole = options.enableConsole ?? true
    this.enablePersistence = options.enablePersistence ?? false
    this.maxLogEntries = options.maxLogEntries ?? 500
    this.logs = []
    this.listeners = new Set()
    this.timers = new Map()
  }

  /**
   * Set the log level
   * @param {number} level - Log level
   */
  setLevel(level) {
    this.level = level
  }

  /**
   * Check if a level should be logged
   * @param {number} level - Level to check
   * @returns {boolean}
   */
  shouldLog(level) {
    return level >= this.level
  }

  /**
   * Format a log entry
   * @param {string} level - Level name
   * @param {string} category - Log category
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   * @returns {Object}
   */
  formatEntry(level, category, message, data) {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      id: crypto.randomUUID?.() ?? Date.now().toString()
    }
  }

  /**
   * Log a message
   * @param {number} level - Log level
   * @param {string} category - Log category
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  log(level, category, message, data = {}) {
    if (!this.shouldLog(level)) return

    const levelName = Object.keys(LogLevel).find(k => LogLevel[k] === level) || 'INFO'
    const entry = this.formatEntry(levelName, category, message, data)

    // Store log
    this.logs.unshift(entry)
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(0, this.maxLogEntries)
    }

    // Console output
    if (this.enableConsole) {
      const consoleMethod = level === LogLevel.ERROR ? 'error'
        : level === LogLevel.WARN ? 'warn'
        : level === LogLevel.DEBUG ? 'debug'
        : 'log'

      const prefix = `${this.prefix} [${levelName}] [${category}]`
      console[consoleMethod](prefix, message, Object.keys(data).length > 0 ? data : '')
    }

    // Persist if enabled
    if (this.enablePersistence) {
      this.persistLog(entry)
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(entry)
      } catch {}
    })
  }

  /**
   * Debug log
   */
  debug(category, message, data = {}) {
    this.log(LogLevel.DEBUG, category, message, data)
  }

  /**
   * Info log
   */
  info(category, message, data = {}) {
    this.log(LogLevel.INFO, category, message, data)
  }

  /**
   * Warning log
   */
  warn(category, message, data = {}) {
    this.log(LogLevel.WARN, category, message, data)
  }

  /**
   * Error log
   */
  error(category, message, data = {}) {
    this.log(LogLevel.ERROR, category, message, data)
  }

  // ==================== Category-specific loggers ====================

  /**
   * Log authentication events
   */
  auth(message, data = {}) {
    this.info(LogCategory.AUTH, message, data)
  }

  /**
   * Log sharing events
   */
  sharing(message, data = {}) {
    this.info(LogCategory.SHARING, message, data)
  }

  /**
   * Log real-time events
   */
  realtime(message, data = {}) {
    this.debug(LogCategory.REALTIME, message, data)
  }

  /**
   * Log comment events
   */
  comments(message, data = {}) {
    this.info(LogCategory.COMMENTS, message, data)
  }

  /**
   * Log assignment events
   */
  assignments(message, data = {}) {
    this.info(LogCategory.ASSIGNMENTS, message, data)
  }

  /**
   * Log dashboard events
   */
  dashboard(message, data = {}) {
    this.debug(LogCategory.DASHBOARD, message, data)
  }

  /**
   * Log sync events
   */
  sync(message, data = {}) {
    this.info(LogCategory.SYNC, message, data)
  }

  // ==================== Performance logging ====================

  /**
   * Start a timer for performance measurement
   * @param {string} label - Timer label
   */
  startTimer(label) {
    this.timers.set(label, {
      start: performance.now(),
      label
    })
  }

  /**
   * End a timer and log the duration
   * @param {string} label - Timer label
   * @param {Object} data - Additional data
   * @returns {number} Duration in milliseconds
   */
  endTimer(label, data = {}) {
    const timer = this.timers.get(label)
    if (!timer) {
      this.warn(LogCategory.PERFORMANCE, `Timer "${label}" not found`)
      return 0
    }

    const duration = performance.now() - timer.start
    this.timers.delete(label)

    this.log(LogLevel.DEBUG, LogCategory.PERFORMANCE, `${label} completed`, {
      ...data,
      durationMs: Math.round(duration * 100) / 100
    })

    return duration
  }

  /**
   * Measure an async operation
   * @param {string} label - Operation label
   * @param {Function} operation - Async operation to measure
   * @returns {Promise<*>} Operation result
   */
  async measure(label, operation) {
    this.startTimer(label)
    try {
      const result = await operation()
      this.endTimer(label, { success: true })
      return result
    } catch (error) {
      this.endTimer(label, { success: false, error: error.message })
      throw error
    }
  }

  // ==================== Log retrieval ====================

  /**
   * Get all logs
   * @param {Object} filters - Optional filters
   * @returns {Array}
   */
  getLogs(filters = {}) {
    let result = [...this.logs]

    if (filters.category) {
      result = result.filter(l => l.category === filters.category)
    }

    if (filters.level) {
      const minLevel = LogLevel[filters.level] ?? 0
      result = result.filter(l => LogLevel[l.level] >= minLevel)
    }

    if (filters.since) {
      const since = new Date(filters.since)
      result = result.filter(l => new Date(l.timestamp) >= since)
    }

    if (filters.limit) {
      result = result.slice(0, filters.limit)
    }

    return result
  }

  /**
   * Get logs for a specific category
   * @param {string} category - Log category
   * @param {number} limit - Maximum entries
   * @returns {Array}
   */
  getByCategory(category, limit = 50) {
    return this.getLogs({ category, limit })
  }

  /**
   * Get error logs
   * @param {number} limit - Maximum entries
   * @returns {Array}
   */
  getErrors(limit = 50) {
    return this.getLogs({ level: 'ERROR', limit })
  }

  /**
   * Search logs
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Array}
   */
  search(query, filters = {}) {
    const queryLower = query.toLowerCase()
    return this.getLogs(filters).filter(log =>
      log.message.toLowerCase().includes(queryLower) ||
      JSON.stringify(log.data).toLowerCase().includes(queryLower)
    )
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logs = []
  }

  /**
   * Clear logs older than a date
   * @param {Date} date - Cutoff date
   */
  clearOlderThan(date) {
    this.logs = this.logs.filter(l => new Date(l.timestamp) >= date)
  }

  // ==================== Persistence ====================

  /**
   * Persist a log entry to localStorage
   * @param {Object} entry - Log entry
   */
  persistLog(entry) {
    if (typeof window === 'undefined') return

    try {
      const key = 'todo_app_logs'
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.unshift(entry)

      // Keep limited entries
      const limited = existing.slice(0, this.maxLogEntries)
      localStorage.setItem(key, JSON.stringify(limited))
    } catch {}
  }

  /**
   * Load persisted logs
   * @returns {Array}
   */
  loadPersistedLogs() {
    if (typeof window === 'undefined') return []

    try {
      const key = 'todo_app_logs'
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
      return []
    }
  }

  /**
   * Clear persisted logs
   */
  clearPersistedLogs() {
    if (typeof window === 'undefined') return
    localStorage.removeItem('todo_app_logs')
  }

  // ==================== Export ====================

  /**
   * Export logs as JSON
   * @param {Object} filters - Optional filters
   * @returns {string}
   */
  exportAsJson(filters = {}) {
    return JSON.stringify(this.getLogs(filters), null, 2)
  }

  /**
   * Export logs as CSV
   * @param {Object} filters - Optional filters
   * @returns {string}
   */
  exportAsCsv(filters = {}) {
    const logs = this.getLogs(filters)
    const headers = ['Timestamp', 'Level', 'Category', 'Message', 'Data']
    const rows = logs.map(l => [
      l.timestamp,
      l.level,
      l.category,
      `"${l.message.replace(/"/g, '""')}"`,
      `"${JSON.stringify(l.data).replace(/"/g, '""')}"`
    ])

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }

  // ==================== Listeners ====================

  /**
   * Add a log listener
   * @param {Function} listener - Listener function
   * @returns {Function} Unsubscribe function
   */
  addListener(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Create a scoped logger
   * @param {string} scope - Scope name
   * @returns {Object} Scoped logger methods
   */
  scope(scope) {
    return {
      debug: (message, data) => this.debug(scope, message, data),
      info: (message, data) => this.info(scope, message, data),
      warn: (message, data) => this.warn(scope, message, data),
      error: (message, data) => this.error(scope, message, data),
      startTimer: (label) => this.startTimer(`${scope}:${label}`),
      endTimer: (label, data) => this.endTimer(`${scope}:${label}`, data),
      measure: (label, op) => this.measure(`${scope}:${label}`, op)
    }
  }
}

// Export singleton instance
export const logger = new Logger({
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enablePersistence: false
})

export default logger

/**
 * Data Service - Handles data persistence layer for local and database sync
 * Implements T010: Update data persistence layer to support both local and database sync
 */

export class DataService {
  constructor(supabase) {
    this.supabase = supabase
    this.localStorageKey = 'todo_app_local_data'
    this.syncQueue = []
    this.isOnline = typeof window !== 'undefined' ? navigator.onLine : true
    this.listeners = new Map()

    // Set up online/offline listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline())
      window.addEventListener('offline', () => this.handleOffline())
    }
  }

  /**
   * Handle coming online
   */
  async handleOnline() {
    this.isOnline = true
    await this.syncPendingChanges()
    this.notifyListeners('connection', { online: true })
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    this.isOnline = false
    this.notifyListeners('connection', { online: false })
  }

  /**
   * Check if we have network connectivity
   * @returns {boolean}
   */
  checkOnline() {
    return this.isOnline
  }

  // ==================== Local Storage Operations ====================

  /**
   * Get all local data
   * @returns {Object}
   */
  getLocalData() {
    if (typeof window === 'undefined') return {}
    try {
      const data = localStorage.getItem(this.localStorageKey)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }

  /**
   * Save data locally
   * @param {Object} data - Data to save
   */
  saveLocalData(data) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save local data:', error)
    }
  }

  /**
   * Get local tasks
   * @returns {Array}
   */
  getLocalTasks() {
    const data = this.getLocalData()
    return data.tasks || []
  }

  /**
   * Save tasks locally
   * @param {Array} tasks - Tasks to save
   */
  saveLocalTasks(tasks) {
    const data = this.getLocalData()
    data.tasks = tasks
    data.lastUpdated = new Date().toISOString()
    this.saveLocalData(data)
  }

  /**
   * Get local comments
   * @returns {Object} Map of taskId to comments array
   */
  getLocalComments() {
    const data = this.getLocalData()
    return data.comments || {}
  }

  /**
   * Save comments locally
   * @param {Object} comments - Comments map
   */
  saveLocalComments(comments) {
    const data = this.getLocalData()
    data.comments = comments
    this.saveLocalData(data)
  }

  // ==================== Sync Queue Operations ====================

  /**
   * Queue a change for sync
   * @param {Object} change - Change to queue
   */
  queueChange(change) {
    this.syncQueue.push({
      ...change,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    })

    // Save queue to local storage
    this.saveSyncQueue()

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingChanges()
    }
  }

  /**
   * Save sync queue to local storage
   */
  saveSyncQueue() {
    const data = this.getLocalData()
    data.syncQueue = this.syncQueue
    this.saveLocalData(data)
  }

  /**
   * Load sync queue from local storage
   */
  loadSyncQueue() {
    const data = this.getLocalData()
    this.syncQueue = data.syncQueue || []
  }

  /**
   * Sync pending changes to database
   * @returns {Promise<Object>} Sync results
   */
  async syncPendingChanges() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return { synced: 0, failed: 0, remaining: this.syncQueue.length }
    }

    const results = { synced: 0, failed: 0, errors: [] }

    // Process queue items
    const itemsToProcess = [...this.syncQueue]

    for (const item of itemsToProcess) {
      try {
        await this.processQueueItem(item)
        // Remove from queue on success
        this.syncQueue = this.syncQueue.filter(i => i.id !== item.id)
        results.synced++
      } catch (error) {
        results.failed++
        results.errors.push({ item, error: error.message })

        // Mark as failed but keep in queue for retry
        const queueItem = this.syncQueue.find(i => i.id === item.id)
        if (queueItem) {
          queueItem.status = 'failed'
          queueItem.retries = (queueItem.retries || 0) + 1
          queueItem.lastError = error.message

          // Remove if too many retries
          if (queueItem.retries > 3) {
            this.syncQueue = this.syncQueue.filter(i => i.id !== item.id)
          }
        }
      }
    }

    // Save updated queue
    this.saveSyncQueue()
    results.remaining = this.syncQueue.length

    this.notifyListeners('sync', results)
    return results
  }

  /**
   * Process a single queue item
   * @param {Object} item - Queue item to process
   */
  async processQueueItem(item) {
    switch (item.type) {
      case 'CREATE_TASK':
        await this.supabase.from('todos').insert(item.data)
        break

      case 'UPDATE_TASK':
        await this.supabase
          .from('todos')
          .update(item.data)
          .eq('id', item.taskId)
        break

      case 'DELETE_TASK':
        await this.supabase
          .from('todos')
          .delete()
          .eq('id', item.taskId)
        break

      case 'CREATE_COMMENT':
        await this.supabase.from('comments').insert(item.data)
        break

      case 'UPDATE_COMMENT':
        await this.supabase
          .from('comments')
          .update(item.data)
          .eq('id', item.commentId)
        break

      case 'DELETE_COMMENT':
        await this.supabase
          .from('comments')
          .delete()
          .eq('id', item.commentId)
        break

      default:
        throw new Error(`Unknown sync operation type: ${item.type}`)
    }
  }

  // ==================== Hybrid Data Operations ====================

  /**
   * Get tasks with fallback to local data
   * @param {string} userId - The user ID
   * @returns {Promise<Array>}
   */
  async getTasks(userId) {
    if (this.isOnline) {
      try {
        const { data, error } = await this.supabase
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (!error && data) {
          // Update local cache
          this.saveLocalTasks(data)
          return data
        }
      } catch {
        // Fall through to local data
      }
    }

    // Return local data
    return this.getLocalTasks().filter(t => t.user_id === userId)
  }

  /**
   * Create a task with sync support
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData) {
    const localTask = {
      ...taskData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      _local: true
    }

    // Save locally first
    const localTasks = this.getLocalTasks()
    localTasks.unshift(localTask)
    this.saveLocalTasks(localTasks)

    if (this.isOnline) {
      try {
        const { data, error } = await this.supabase
          .from('todos')
          .insert(taskData)
          .select()
          .single()

        if (!error && data) {
          // Replace local task with server version
          const tasks = this.getLocalTasks()
          const index = tasks.findIndex(t => t.id === localTask.id)
          if (index >= 0) {
            tasks[index] = data
            this.saveLocalTasks(tasks)
          }
          return data
        }
      } catch {
        // Queue for later sync
        this.queueChange({
          type: 'CREATE_TASK',
          data: taskData
        })
      }
    } else {
      // Queue for later sync
      this.queueChange({
        type: 'CREATE_TASK',
        data: taskData
      })
    }

    return localTask
  }

  /**
   * Update a task with sync support
   * @param {string} taskId - Task ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(taskId, updates) {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    // Update locally first
    const tasks = this.getLocalTasks()
    const index = tasks.findIndex(t => t.id === taskId)
    if (index >= 0) {
      tasks[index] = { ...tasks[index], ...updateData }
      this.saveLocalTasks(tasks)
    }

    if (this.isOnline) {
      try {
        const { data, error } = await this.supabase
          .from('todos')
          .update(updateData)
          .eq('id', taskId)
          .select()
          .single()

        if (!error && data) {
          // Update local with server version
          const tasks = this.getLocalTasks()
          const idx = tasks.findIndex(t => t.id === taskId)
          if (idx >= 0) {
            tasks[idx] = data
            this.saveLocalTasks(tasks)
          }
          return data
        }
      } catch {
        this.queueChange({
          type: 'UPDATE_TASK',
          taskId,
          data: updateData
        })
      }
    } else {
      this.queueChange({
        type: 'UPDATE_TASK',
        taskId,
        data: updateData
      })
    }

    return tasks[index]
  }

  /**
   * Delete a task with sync support
   * @param {string} taskId - Task ID
   * @returns {Promise<void>}
   */
  async deleteTask(taskId) {
    // Delete locally first
    const tasks = this.getLocalTasks().filter(t => t.id !== taskId)
    this.saveLocalTasks(tasks)

    if (this.isOnline) {
      try {
        await this.supabase
          .from('todos')
          .delete()
          .eq('id', taskId)
      } catch {
        this.queueChange({
          type: 'DELETE_TASK',
          taskId
        })
      }
    } else {
      this.queueChange({
        type: 'DELETE_TASK',
        taskId
      })
    }
  }

  // ==================== Event Listeners ====================

  /**
   * Add a listener for data events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  /**
   * Notify listeners of an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error)
        }
      })
    }
  }

  /**
   * Get sync status
   * @returns {Object}
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingChanges: this.syncQueue.length,
      lastSync: this.getLocalData().lastSync || null
    }
  }

  /**
   * Force a full sync
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Sync results
   */
  async forceSync(userId) {
    if (!this.isOnline) {
      return { success: false, error: 'Offline' }
    }

    // Sync pending changes first
    await this.syncPendingChanges()

    // Fetch fresh data from server
    const tasks = await this.getTasks(userId)

    // Update last sync time
    const data = this.getLocalData()
    data.lastSync = new Date().toISOString()
    this.saveLocalData(data)

    return {
      success: true,
      tasksCount: tasks.length,
      pendingChanges: this.syncQueue.length
    }
  }

  /**
   * Clear all local data
   */
  clearLocalData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.localStorageKey)
    }
    this.syncQueue = []
  }
}

export default DataService

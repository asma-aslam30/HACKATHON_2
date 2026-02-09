/**
 * Enhanced Real-time Service with conflict resolution and reconnection
 * Implements T007: Implement basic real-time sync using Supabase Realtime
 * Implements T019: Enhance real-time sync with conflict resolution
 * Implements T023: Add real-time task update listeners
 * Implements T026: Add reconnection logic with exponential backoff
 * Implements T033: Implement real-time comment synchronization
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// Connection states
export const ConnectionState = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
}

/**
 * Enhanced Real-time Service with conflict resolution
 */
export class RealtimeService {
  constructor(supabase) {
    this.supabase = supabase
    this.channels = new Map()
    this.connectionState = ConnectionState.DISCONNECTED
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.baseDelay = 1000 // 1 second
    this.maxDelay = 30000 // 30 seconds
    this.listeners = new Set()
    this.pendingUpdates = new Map()
  }

  /**
   * Get connection state
   * @returns {string}
   */
  getConnectionState() {
    return this.connectionState
  }

  /**
   * Set connection state and notify listeners
   * @param {string} state - New state
   */
  setConnectionState(state) {
    this.connectionState = state
    this.listeners.forEach(listener => {
      try {
        listener({ type: 'connection', state })
      } catch {}
    })
  }

  /**
   * Add a listener for real-time events
   * @param {Function} listener - Listener function
   * @returns {Function} Unsubscribe function
   */
  addListener(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Calculate exponential backoff delay
   * @returns {number} Delay in milliseconds
   */
  getReconnectDelay() {
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts),
      this.maxDelay
    )
    // Add jitter (0-20% of delay)
    return delay + Math.random() * delay * 0.2
  }

  /**
   * Subscribe to real-time changes for a user's todos
   * @param {string} userId - User ID
   * @param {Function} callback - Callback for updates
   * @returns {Object} Channel subscription
   */
  subscribeToTodos(userId, callback) {
    const channelName = `todos:${userId}`

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)
    }

    this.setConnectionState(ConnectionState.CONNECTING)

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.handleUpdate('todos', payload, callback)
        }
      )
      .subscribe((status) => {
        this.handleSubscriptionStatus(status, channelName, userId, callback)
      })

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Subscribe to a shared list's todos
   * @param {string} listId - Shared list ID
   * @param {Function} callback - Callback for updates
   * @returns {Object} Channel subscription
   */
  subscribeToSharedList(listId, callback) {
    const channelName = `shared_list:${listId}`

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)
    }

    this.setConnectionState(ConnectionState.CONNECTING)

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `shared_list_id=eq.${listId}`
        },
        (payload) => {
          this.handleUpdate('todos', payload, callback)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        async (payload) => {
          // Verify comment belongs to a task in this list
          if (payload.new?.todo_id || payload.old?.todo_id) {
            const todoId = payload.new?.todo_id || payload.old?.todo_id
            const { data } = await this.supabase
              .from('todos')
              .select('shared_list_id')
              .eq('id', todoId)
              .single()

            if (data?.shared_list_id === listId) {
              this.handleUpdate('comments', payload, callback)
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaborations',
          filter: `list_id=eq.${listId}`
        },
        (payload) => {
          this.handleUpdate('collaborations', payload, callback)
        }
      )
      .subscribe((status) => {
        this.handleSubscriptionStatus(status, channelName, listId, callback)
      })

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Subscribe to comments on a specific task
   * @param {string} todoId - Task ID
   * @param {Function} callback - Callback for updates
   * @returns {Object} Channel subscription
   */
  subscribeToComments(todoId, callback) {
    const channelName = `comments:${todoId}`

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `todo_id=eq.${todoId}`
        },
        (payload) => {
          this.handleUpdate('comments', payload, callback)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Handle subscription status changes
   * @param {string} status - Subscription status
   * @param {string} channelName - Channel name
   * @param {string} entityId - Entity ID (user/list)
   * @param {Function} callback - Original callback
   */
  handleSubscriptionStatus(status, channelName, entityId, callback) {
    switch (status) {
      case 'SUBSCRIBED':
        this.setConnectionState(ConnectionState.CONNECTED)
        this.reconnectAttempts = 0
        break

      case 'CHANNEL_ERROR':
        this.setConnectionState(ConnectionState.ERROR)
        this.attemptReconnect(channelName, entityId, callback)
        break

      case 'TIMED_OUT':
        this.setConnectionState(ConnectionState.DISCONNECTED)
        this.attemptReconnect(channelName, entityId, callback)
        break

      case 'CLOSED':
        this.setConnectionState(ConnectionState.DISCONNECTED)
        break
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   * @param {string} channelName - Channel name
   * @param {string} entityId - Entity ID
   * @param {Function} callback - Callback function
   */
  async attemptReconnect(channelName, entityId, callback) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setConnectionState(ConnectionState.ERROR)
      return
    }

    this.setConnectionState(ConnectionState.RECONNECTING)
    this.reconnectAttempts++

    const delay = this.getReconnectDelay()
    await new Promise(resolve => setTimeout(resolve, delay))

    // Remove old channel
    this.unsubscribe(channelName)

    // Determine subscription type and resubscribe
    if (channelName.startsWith('todos:')) {
      this.subscribeToTodos(entityId, callback)
    } else if (channelName.startsWith('shared_list:')) {
      this.subscribeToSharedList(entityId, callback)
    } else if (channelName.startsWith('comments:')) {
      this.subscribeToComments(entityId, callback)
    }
  }

  /**
   * Handle incoming updates with conflict detection
   * @param {string} table - Table name
   * @param {Object} payload - Update payload
   * @param {Function} callback - Callback function
   */
  handleUpdate(table, payload, callback) {
    const update = {
      table,
      eventType: payload.eventType,
      old: payload.old,
      new: payload.new,
      timestamp: new Date().toISOString()
    }

    // Check for version conflicts on updates
    if (payload.eventType === 'UPDATE' && payload.new?.version) {
      const entityId = payload.new.id
      const pendingUpdate = this.pendingUpdates.get(entityId)

      if (pendingUpdate && pendingUpdate.version !== payload.new.version - 1) {
        // Conflict detected
        update.conflict = true
        update.serverVersion = payload.new.version
        update.localVersion = pendingUpdate.version
      }

      this.pendingUpdates.delete(entityId)
    }

    callback(update)
  }

  /**
   * Track a pending update for conflict detection
   * @param {string} entityId - Entity ID
   * @param {number} version - Current version
   */
  trackPendingUpdate(entityId, version) {
    this.pendingUpdates.set(entityId, {
      version,
      timestamp: Date.now()
    })

    // Clean up old pending updates after 30 seconds
    setTimeout(() => {
      this.pendingUpdates.delete(entityId)
    }, 30000)
  }

  /**
   * Unsubscribe from a specific channel
   * @param {string} channelName - Channel name
   */
  unsubscribe(channelName) {
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName)
      this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll() {
    for (const [channelName, channel] of this.channels) {
      this.supabase.removeChannel(channel)
    }
    this.channels.clear()
    this.setConnectionState(ConnectionState.DISCONNECTED)
  }

  /**
   * Force reconnect all channels
   */
  async reconnectAll() {
    const channelConfigs = []
    for (const [name, channel] of this.channels) {
      channelConfigs.push({ name, channel })
    }

    this.unsubscribeAll()
    this.reconnectAttempts = 0

    // Wait a moment before reconnecting
    await new Promise(resolve => setTimeout(resolve, 500))

    // Note: Caller should resubscribe to channels
    this.setConnectionState(ConnectionState.DISCONNECTED)
  }
}

// ==================== React Hooks ====================

/**
 * React hook for using real-time todo functionality
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 * @returns {Array} [todos, setTodos, connectionState]
 */
export function useRealtimeTodos(supabase, userId) {
  const [todos, setTodos] = useState([])
  const [connectionState, setConnectionState] = useState(ConnectionState.DISCONNECTED)
  const realtimeServiceRef = useRef(null)

  useEffect(() => {
    if (!userId) return

    // Create or reuse service
    if (!realtimeServiceRef.current) {
      realtimeServiceRef.current = new RealtimeService(supabase)
    }
    const realtimeService = realtimeServiceRef.current

    // Add connection state listener
    const unsubscribeListener = realtimeService.addListener(({ type, state }) => {
      if (type === 'connection') {
        setConnectionState(state)
      }
    })

    // Subscribe to real-time updates
    realtimeService.subscribeToTodos(userId, (update) => {
      setTodos(currentTodos => {
        switch (update.eventType) {
          case 'INSERT':
            return [update.new, ...currentTodos]
          case 'UPDATE':
            return currentTodos.map(todo =>
              todo.id === update.new.id ? update.new : todo
            )
          case 'DELETE':
            return currentTodos.filter(todo => todo.id !== update.old.id)
          default:
            return currentTodos
        }
      })
    })

    // Load initial todos
    const loadTodos = async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error) {
        setTodos(data || [])
      }
    }

    loadTodos()

    // Cleanup
    return () => {
      unsubscribeListener()
      const channelName = `todos:${userId}`
      realtimeService.unsubscribe(channelName)
    }
  }, [userId, supabase])

  return [todos, setTodos, connectionState]
}

/**
 * React hook for real-time shared list updates
 * @param {Object} supabase - Supabase client
 * @param {string} listId - Shared list ID
 * @returns {Object} { todos, comments, collaborators, connectionState }
 */
export function useRealtimeSharedList(supabase, listId) {
  const [todos, setTodos] = useState([])
  const [comments, setComments] = useState({})
  const [collaborators, setCollaborators] = useState([])
  const [connectionState, setConnectionState] = useState(ConnectionState.DISCONNECTED)
  const realtimeServiceRef = useRef(null)

  useEffect(() => {
    if (!listId) return

    if (!realtimeServiceRef.current) {
      realtimeServiceRef.current = new RealtimeService(supabase)
    }
    const realtimeService = realtimeServiceRef.current

    // Connection listener
    const unsubscribeListener = realtimeService.addListener(({ type, state }) => {
      if (type === 'connection') {
        setConnectionState(state)
      }
    })

    // Subscribe to shared list updates
    realtimeService.subscribeToSharedList(listId, (update) => {
      switch (update.table) {
        case 'todos':
          setTodos(current => {
            switch (update.eventType) {
              case 'INSERT':
                return [update.new, ...current]
              case 'UPDATE':
                return current.map(todo =>
                  todo.id === update.new.id ? update.new : todo
                )
              case 'DELETE':
                return current.filter(todo => todo.id !== update.old.id)
              default:
                return current
            }
          })
          break

        case 'comments':
          setComments(current => {
            const todoId = update.new?.todo_id || update.old?.todo_id
            const todoComments = current[todoId] || []

            let updatedComments
            switch (update.eventType) {
              case 'INSERT':
                updatedComments = [...todoComments, update.new]
                break
              case 'UPDATE':
                updatedComments = todoComments.map(c =>
                  c.id === update.new.id ? update.new : c
                )
                break
              case 'DELETE':
                updatedComments = todoComments.filter(c => c.id !== update.old.id)
                break
              default:
                updatedComments = todoComments
            }

            return { ...current, [todoId]: updatedComments }
          })
          break

        case 'collaborations':
          setCollaborators(current => {
            switch (update.eventType) {
              case 'INSERT':
                return [...current, update.new]
              case 'UPDATE':
                return current.map(c =>
                  c.id === update.new.id ? update.new : c
                )
              case 'DELETE':
                return current.filter(c => c.id !== update.old.id)
              default:
                return current
            }
          })
          break
      }
    })

    // Load initial data
    const loadData = async () => {
      const [todosRes, collabRes] = await Promise.all([
        supabase
          .from('todos')
          .select('*')
          .eq('shared_list_id', listId)
          .order('created_at', { ascending: false }),
        supabase
          .from('collaborations')
          .select('*, users(id, name, email, avatar_url)')
          .eq('list_id', listId)
      ])

      if (!todosRes.error) setTodos(todosRes.data || [])
      if (!collabRes.error) setCollaborators(collabRes.data || [])
    }

    loadData()

    return () => {
      unsubscribeListener()
      realtimeService.unsubscribe(`shared_list:${listId}`)
    }
  }, [listId, supabase])

  return { todos, comments, collaborators, connectionState, setTodos }
}

/**
 * React hook for connection status
 * @param {RealtimeService} realtimeService - Real-time service instance
 * @returns {string} Connection state
 */
export function useConnectionStatus(realtimeService) {
  const [state, setState] = useState(
    realtimeService?.getConnectionState() || ConnectionState.DISCONNECTED
  )

  useEffect(() => {
    if (!realtimeService) return

    const unsubscribe = realtimeService.addListener(({ type, state: newState }) => {
      if (type === 'connection') {
        setState(newState)
      }
    })

    return unsubscribe
  }, [realtimeService])

  return state
}

export default RealtimeService

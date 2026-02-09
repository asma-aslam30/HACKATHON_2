import { v4 as uuidv4 } from 'uuid';
import taskService from './taskService.js';
import { sendNotification } from './notificationService.js';

/**
 * TimerService - Time tracking and Pomodoro timer functionality
 * Phase 4: Power User Enhancements
 */

// In-memory Pomodoro state (not persisted across restarts)
let pomodoroTimeout = null;
let pomodoroState = {
  active: false,
  type: null, // 'work' | 'break'
  endTime: null,
  linkedTaskId: null
};

/**
 * Start a timer on a task
 * @param {string} taskId - Task ID to time
 * @returns {{success: boolean, error?: string}}
 */
export function startTimer(taskId) {
  const task = taskService.getTaskById(taskId);
  if (!task) {
    return { success: false, error: 'Task not found' };
  }

  // Check if there's already an active timer
  const activeTimer = getActiveTimer();
  if (activeTimer) {
    // Auto-stop existing timer
    stopTimer();
  }

  const timerState = {
    taskId: taskId,
    startTime: new Date().toISOString(),
    type: 'task'
  };

  taskService.setActiveTimerState(timerState);
  return { success: true };
}

/**
 * Stop the currently active timer
 * @returns {{success: boolean, taskId?: string, durationMs?: number, error?: string}}
 */
export function stopTimer() {
  const activeTimer = getActiveTimer();
  if (!activeTimer || activeTimer.type !== 'task') {
    return { success: false, error: 'No active timer' };
  }

  const startTime = new Date(activeTimer.startTime);
  const endTime = new Date();
  const durationMs = endTime.getTime() - startTime.getTime();

  // Create time entry on the task
  const timeEntry = {
    id: uuidv4(),
    startTime: activeTimer.startTime,
    endTime: endTime.toISOString(),
    durationMs: durationMs
  };

  taskService.addTimeEntry(activeTimer.taskId, timeEntry);
  taskService.setActiveTimerState(null);

  return {
    success: true,
    taskId: activeTimer.taskId,
    durationMs: durationMs
  };
}

/**
 * Get current active timer state
 * @returns {Object|null} ActiveTimerState or null
 */
export function getActiveTimer() {
  return taskService.getActiveTimerState();
}

/**
 * Get elapsed time of current timer in milliseconds
 * @returns {number} Elapsed milliseconds or 0 if no timer
 */
export function getElapsedTime() {
  const activeTimer = getActiveTimer();
  if (!activeTimer) {
    return 0;
  }

  const startTime = new Date(activeTimer.startTime);
  return Date.now() - startTime.getTime();
}

/**
 * Recover orphaned timer from previous session
 * @returns {{found: boolean, taskId?: string, taskTitle?: string, elapsedMs?: number}}
 */
export function recoverOrphanedTimer() {
  const activeTimer = getActiveTimer();
  if (!activeTimer || activeTimer.type !== 'task') {
    return { found: false };
  }

  const task = taskService.getTaskById(activeTimer.taskId);
  if (!task) {
    // Task was deleted, clear orphaned timer
    taskService.setActiveTimerState(null);
    return { found: false };
  }

  const elapsedMs = getElapsedTime();

  return {
    found: true,
    taskId: activeTimer.taskId,
    taskTitle: task.title,
    elapsedMs: elapsedMs
  };
}

/**
 * Save timer state (for persistence)
 */
export function saveTimerState() {
  // Timer state is already persisted via taskService
  // This is a no-op but kept for API consistency
}

/**
 * Load timer state (for recovery)
 */
export function loadTimerState() {
  // Timer state is already loaded via taskService
  // This is a no-op but kept for API consistency
}

// ==================== Pomodoro Functions ====================

/**
 * Start a Pomodoro work session
 * @param {string} [taskId] - Optional task to link to
 * @returns {{success: boolean, endTime?: string, error?: string}}
 */
export function startPomodoro(taskId = null) {
  if (pomodoroState.active) {
    return { success: false, error: 'Pomodoro already running' };
  }

  // Validate taskId if provided
  if (taskId) {
    const task = taskService.getTaskById(taskId);
    if (!task) {
      return { success: false, error: 'Task not found' };
    }
  }

  const config = getPomodoroConfig();
  const workDurationMs = config.workDurationMinutes * 60 * 1000;
  const endTime = new Date(Date.now() + workDurationMs);

  pomodoroState = {
    active: true,
    type: 'work',
    endTime: endTime.toISOString(),
    linkedTaskId: taskId
  };

  // Also save to persistent storage for crash recovery
  taskService.setActiveTimerState({
    taskId: taskId,
    startTime: new Date().toISOString(),
    type: 'pomodoro_work'
  });

  // Schedule work completion
  pomodoroTimeout = setTimeout(() => {
    completePomodoroWork();
  }, workDurationMs);

  return { success: true, endTime: endTime.toISOString() };
}

/**
 * Cancel the current Pomodoro session
 * @returns {boolean} True if cancelled, false if no Pomodoro active
 */
export function cancelPomodoro() {
  if (!pomodoroState.active) {
    return false;
  }

  if (pomodoroTimeout) {
    clearTimeout(pomodoroTimeout);
    pomodoroTimeout = null;
  }

  pomodoroState = {
    active: false,
    type: null,
    endTime: null,
    linkedTaskId: null
  };

  taskService.setActiveTimerState(null);

  return true;
}

/**
 * Get current Pomodoro state
 * @returns {{active: boolean, type: 'work'|'break'|null, remainingMs: number, linkedTaskId: string|null}}
 */
export function getPomodoroState() {
  if (!pomodoroState.active) {
    return {
      active: false,
      type: null,
      remainingMs: 0,
      linkedTaskId: null
    };
  }

  const endTime = new Date(pomodoroState.endTime);
  const remainingMs = Math.max(0, endTime.getTime() - Date.now());

  return {
    active: pomodoroState.active,
    type: pomodoroState.type,
    remainingMs: remainingMs,
    linkedTaskId: pomodoroState.linkedTaskId
  };
}

/**
 * Complete Pomodoro work session and start break
 * @returns {{breakEndTime: string}}
 */
export function completePomodoroWork() {
  if (pomodoroTimeout) {
    clearTimeout(pomodoroTimeout);
    pomodoroTimeout = null;
  }

  // Increment today's count
  taskService.incrementPomodoroCount();

  // Send notification
  sendNotification({
    title: '🍅 Pomodoro Complete!',
    message: 'Time for a break!'
  });

  // Start break timer
  const config = getPomodoroConfig();
  const breakDurationMs = config.breakDurationMinutes * 60 * 1000;
  const breakEndTime = new Date(Date.now() + breakDurationMs);

  pomodoroState = {
    active: true,
    type: 'break',
    endTime: breakEndTime.toISOString(),
    linkedTaskId: pomodoroState.linkedTaskId
  };

  taskService.setActiveTimerState({
    taskId: pomodoroState.linkedTaskId,
    startTime: new Date().toISOString(),
    type: 'pomodoro_break'
  });

  // Schedule break completion
  pomodoroTimeout = setTimeout(() => {
    completePomodoroBreak();
  }, breakDurationMs);

  return { breakEndTime: breakEndTime.toISOString() };
}

/**
 * Complete Pomodoro break session
 */
export function completePomodoroBreak() {
  if (pomodoroTimeout) {
    clearTimeout(pomodoroTimeout);
    pomodoroTimeout = null;
  }

  // Send notification
  sendNotification({
    title: '☕ Break Over!',
    message: 'Ready for another Pomodoro?'
  });

  pomodoroState = {
    active: false,
    type: null,
    endTime: null,
    linkedTaskId: null
  };

  taskService.setActiveTimerState(null);
}

/**
 * Get Pomodoro configuration
 * @returns {Object} PomodoroConfig
 */
export function getPomodoroConfig() {
  return taskService.getPomodoroConfig();
}

/**
 * Update Pomodoro configuration
 * @param {Object} config - Partial config to update
 * @returns {Object} Updated config
 */
export function updatePomodoroConfig(config) {
  const current = getPomodoroConfig();

  if (config.workDurationMinutes !== undefined) {
    const minutes = parseInt(config.workDurationMinutes, 10);
    if (isNaN(minutes) || minutes < 1 || minutes > 120) {
      throw new Error('Work duration must be between 1 and 120 minutes');
    }
    current.workDurationMinutes = minutes;
  }

  if (config.breakDurationMinutes !== undefined) {
    const minutes = parseInt(config.breakDurationMinutes, 10);
    if (isNaN(minutes) || minutes < 1 || minutes > 60) {
      throw new Error('Break duration must be between 1 and 60 minutes');
    }
    current.breakDurationMinutes = minutes;
  }

  taskService.updatePomodoroConfig(current);
  return current;
}

/**
 * Get today's completed Pomodoro count
 * @returns {number} Count of completed Pomodoros today
 */
export function getTodayPomodoroCount() {
  return taskService.getTodayPomodoroCount();
}

/**
 * Cleanup on exit (for signal handlers)
 */
export function cleanup() {
  if (pomodoroTimeout) {
    clearTimeout(pomodoroTimeout);
    pomodoroTimeout = null;
  }

  // Stop any active task timer
  const activeTimer = getActiveTimer();
  if (activeTimer && activeTimer.type === 'task') {
    stopTimer();
  }
}

export default {
  startTimer,
  stopTimer,
  getActiveTimer,
  getElapsedTime,
  recoverOrphanedTimer,
  saveTimerState,
  loadTimerState,
  startPomodoro,
  cancelPomodoro,
  getPomodoroState,
  completePomodoroWork,
  completePomodoroBreak,
  getPomodoroConfig,
  updatePomodoroConfig,
  getTodayPomodoroCount,
  cleanup
};

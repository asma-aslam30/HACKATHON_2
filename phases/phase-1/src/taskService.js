import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { isToday, isWithinWeek, isPast, calculateNextDueDate } from './dateService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// T003: Priority levels (ordered by importance)
export const PRIORITIES = ['high', 'medium', 'low', 'none'];

// T004: Priority colors for display
export const PRIORITY_COLORS = {
  high: 'red',
  medium: 'yellow',
  low: 'blue',
  none: null
};

// T005: Predefined tags
export const PREDEFINED_TAGS = [
  { name: 'work', color: 'cyan', type: 'predefined' },
  { name: 'home', color: 'magenta', type: 'predefined' },
  { name: 'personal', color: 'green', type: 'predefined' }
];

// Default custom tag color
export const DEFAULT_CUSTOM_TAG_COLOR = 'yellow';

// T006: Sort types
// T026: Added 'due_date' sort option
export const SORT_TYPES = ['priority', 'alpha', 'date', 'status', 'manual', 'due_date'];

// T027: Filter types for date-based filtering
export const DATE_FILTER_TYPES = ['due_today', 'due_this_week', 'overdue', 'no_due_date'];

/**
 * TaskService - Core CRUD operations for task management with file persistence
 */
class TaskService {
  constructor() {
    this.tasks = [];
    this.customTags = []; // T009: Custom tags storage
    // Phase 4: Power User Enhancements
    this.templates = [];
    this.pomodoroConfig = null;
    this.activeTimerState = null;
    this.ensureDataDirectory();
    this.loadTasks();
  }

  /**
   * Ensure data directory exists
   */
  ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  /**
   * Load tasks from tasks.json file into memory
   * Handles: file not found, corrupted JSON, invalid entries
   * T008: Includes migration logic for Phase 1 tasks
   */
  loadTasks() {
    try {
      if (!fs.existsSync(TASKS_FILE)) {
        this.tasks = [];
        this.customTags = [];
        return this.tasks;
      }

      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      const parsed = JSON.parse(data);

      // Validate and filter valid tasks
      if (parsed && Array.isArray(parsed.tasks)) {
        this.tasks = parsed.tasks
          .filter(task => this.isValidTask(task))
          .map(task => this.migrateTask(task)); // T008: Apply migration
      } else {
        this.tasks = [];
      }

      // T009: Load custom tags
      if (parsed && Array.isArray(parsed.customTags)) {
        this.customTags = parsed.customTags;
      } else {
        this.customTags = [];
      }

      // T005: Phase 4 - Load templates
      if (parsed && Array.isArray(parsed.templates)) {
        this.templates = parsed.templates;
      } else {
        this.templates = [];
      }

      // T005: Phase 4 - Load Pomodoro config with defaults
      if (parsed && parsed.pomodoroConfig) {
        this.pomodoroConfig = parsed.pomodoroConfig;
      } else {
        this.pomodoroConfig = {
          workDurationMinutes: 25,
          breakDurationMinutes: 5,
          completedToday: 0,
          lastResetDate: new Date().toISOString().split('T')[0]
        };
      }

      // T005: Phase 4 - Load active timer state
      this.activeTimerState = parsed?.activeTimerState || null;

      return this.tasks;
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Corrupted JSON - backup and start fresh
        this.backupCorruptedFile();
        this.tasks = [];
        this.customTags = [];
        this.templates = [];
        this.pomodoroConfig = {
          workDurationMinutes: 25,
          breakDurationMinutes: 5,
          completedToday: 0,
          lastResetDate: new Date().toISOString().split('T')[0]
        };
        this.activeTimerState = null;
        console.warn('Tasks file was corrupted. Starting fresh.');
      } else {
        console.error('Error loading tasks:', error.message);
        this.tasks = [];
        this.customTags = [];
        this.templates = [];
        this.pomodoroConfig = {
          workDurationMinutes: 25,
          breakDurationMinutes: 5,
          completedToday: 0,
          lastResetDate: new Date().toISOString().split('T')[0]
        };
        this.activeTimerState = null;
      }
      return this.tasks;
    }
  }

  /**
   * T008: Migrate Phase 1 tasks to Phase 2 schema
   * T010: Extended for Phase 3 - Intelligent Features
   * T004: Extended for Phase 4 - Power User Enhancements (subtasks, time tracking)
   * T008: Extended for Phase 5 - Collaboration Features (sharedListId, assignedTo, comments, version, lastModifiedBy)
   * Adds default values for priority, tags, sortOrder, and new Phase 3/4/5 fields
   */
  migrateTask(task) {
    return {
      ...task,
      // Phase 2 fields
      priority: task.priority || 'none',
      tags: task.tags || [],
      sortOrder: task.sortOrder || new Date(task.createdAt).getTime(),
      // Phase 3 fields (Intelligent Features)
      dueDate: task.dueDate ?? null,
      recurrencePattern: task.recurrencePattern ?? 'none',
      reminderOffset: task.reminderOffset ?? 15,
      reminderEnabled: task.reminderEnabled ?? (task.dueDate !== null),
      suggestionDismissed: task.suggestionDismissed ?? false,
      // Phase 4 fields (Power User Enhancements)
      subtasks: task.subtasks ?? [],
      timeEntries: task.timeEntries ?? [],
      totalTimeMs: task.totalTimeMs ?? 0,
      // Phase 5 fields (Collaboration Features)
      comments: task.comments ?? [], // Array of comment objects
      assignedTo: task.assignedTo ?? [], // Array of user IDs
      sharedListId: task.sharedListId ?? null, // ID of the shared list this task belongs to
      version: task.version ?? 1, // For conflict resolution during sync
      lastModifiedBy: task.lastModifiedBy ?? null // User ID of last modifier
    };
  }

  /**
   * Validate task object has required fields
   */
  isValidTask(task) {
    return (
      task &&
      typeof task.id === 'string' &&
      typeof task.title === 'string' &&
      task.title.trim().length > 0 &&
      typeof task.completed === 'boolean' &&
      typeof task.createdAt === 'string'
    );
  }

  /**
   * Backup corrupted tasks.json file
   */
  backupCorruptedFile() {
    try {
      if (fs.existsSync(TASKS_FILE)) {
        const backupPath = TASKS_FILE + '.backup.' + Date.now();
        fs.copyFileSync(TASKS_FILE, backupPath);
      }
    } catch (error) {
      console.error('Error backing up corrupted file:', error.message);
    }
  }

  /**
   * Save tasks to tasks.json file
   * T009: Includes customTags in storage
   * T005: Includes templates, pomodoroConfig, activeTimerState in storage
   * @returns {boolean} Success status
   */
  saveTasks() {
    try {
      const data = JSON.stringify({
        tasks: this.tasks,
        customTags: this.customTags, // T009: Save custom tags
        // Phase 4: Power User Enhancements
        templates: this.templates,
        pomodoroConfig: this.pomodoroConfig,
        activeTimerState: this.activeTimerState
      }, null, 2);
      fs.writeFileSync(TASKS_FILE, data, 'utf-8');
      return true;
    } catch (error) {
      console.error('Error saving tasks:', error.message);
      return false;
    }
  }

  /**
   * Create a new task
   * T007: Extended to support priority, tags, sortOrder
   * T015: Extended to support dueDate, recurrencePattern
   * @param {Object} input - { title: string, description?: string, priority?: string, tags?: string[], dueDate?: string, recurrencePattern?: string }
   * @returns {Object} Created task
   */
  createTask(input) {
    const title = input.title?.trim();
    if (!title) {
      throw new Error('Title is required');
    }

    const now = Date.now();
    const task = {
      id: uuidv4(),
      title: title,
      description: input.description?.trim() || '',
      completed: false,
      createdAt: new Date().toISOString(),
      priority: input.priority || 'none', // T007: Priority support
      tags: input.tags || [], // T007: Tags support
      sortOrder: now, // T007: Manual sort order
      // T015: Due date support
      dueDate: input.dueDate || null,
      recurrencePattern: input.recurrencePattern || 'none',
      reminderOffset: 15,
      reminderEnabled: input.dueDate ? true : false,
      suggestionDismissed: false
    };

    // Create custom tags if needed
    if (input.tags && input.tags.length > 0) {
      input.tags.forEach(tagName => {
        const normalized = tagName.toLowerCase().trim();
        if (!this.getAllTags().find(t => t.name === normalized)) {
          this.createCustomTag(normalized);
        }
      });
    }

    this.tasks.push(task);
    this.saveTasks();
    return task;
  }

  /**
   * Get all tasks
   * @returns {Array} All tasks
   */
  getAllTasks() {
    return this.tasks;
  }

  /**
   * Get task by ID
   * @param {string} id - Task ID
   * @returns {Object|null} Task or null if not found
   */
  getTaskById(id) {
    return this.tasks.find(task => task.id === id) || null;
  }

  /**
   * Toggle task completion status
   * T033: Extended for recurring tasks - creates new instance when completing
   * @param {string} id - Task ID
   * @returns {{completedTask: Object, newTask: Object|null}|null} Result or null if not found
   */
  toggleTask(id) {
    const task = this.getTaskById(id);
    if (!task) {
      return null;
    }

    task.completed = !task.completed;

    let newTask = null;

    // T033: Handle recurring task completion
    // T057: Prevent duplicate instances - check if next instance already exists
    if (task.completed && task.recurrencePattern && task.recurrencePattern !== 'none' && task.dueDate) {
      const nextDueDate = calculateNextDueDate(task.dueDate, task.recurrencePattern);
      if (nextDueDate) {
        // T057: Check for existing task with same title and next due date (idempotent guard)
        const existingInstance = this.tasks.find(t =>
          t.title === task.title &&
          t.dueDate === nextDueDate &&
          !t.completed &&
          t.id !== task.id
        );

        if (!existingInstance) {
          // Create new recurring instance
          newTask = {
            id: uuidv4(),
            title: task.title,
            description: task.description,
            completed: false,
            createdAt: new Date().toISOString(),
            priority: task.priority,
            tags: [...task.tags],
            sortOrder: Date.now(),
            dueDate: nextDueDate,
            recurrencePattern: task.recurrencePattern,
            reminderOffset: task.reminderOffset,
            reminderEnabled: task.reminderEnabled,
            suggestionDismissed: true // Don't show suggestion for recurring copies
          };
          this.tasks.push(newTask);
        }
      }
    }

    this.saveTasks();
    return { completedTask: task, newTask };
  }

  /**
   * Delete task by ID
   * @param {string} id - Task ID
   * @returns {boolean} True if deleted, false if not found
   */
  deleteTask(id) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) {
      return false;
    }

    this.tasks.splice(index, 1);
    this.saveTasks();
    return true;
  }

  /**
   * Update task title, description, priority, tags, and/or due date
   * T007: Extended to support priority and tags updates
   * T016: Extended to support dueDate and recurrencePattern updates
   * @param {string} id - Task ID
   * @param {Object} input - { title?: string, description?: string, priority?: string, tags?: string[], dueDate?: string, recurrencePattern?: string }
   * @returns {Object|null} Updated task or null if not found
   */
  updateTask(id, input) {
    const task = this.getTaskById(id);
    if (!task) {
      return null;
    }

    if (input.title !== undefined) {
      const newTitle = input.title.trim();
      if (newTitle.length === 0) {
        throw new Error('Title cannot be empty');
      }
      task.title = newTitle;
    }

    if (input.description !== undefined) {
      task.description = input.description.trim();
    }

    // T007: Handle priority update
    if (input.priority !== undefined) {
      if (!PRIORITIES.includes(input.priority)) {
        throw new Error('Invalid priority');
      }
      task.priority = input.priority;
    }

    // T007: Handle tags update
    if (input.tags !== undefined) {
      if (input.tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      // Create custom tags if needed
      input.tags.forEach(tagName => {
        const normalized = tagName.toLowerCase().trim();
        if (!this.getAllTags().find(t => t.name === normalized)) {
          this.createCustomTag(normalized);
        }
      });
      task.tags = input.tags.map(t => t.toLowerCase().trim());
    }

    // T016: Handle due date update
    if (input.dueDate !== undefined) {
      task.dueDate = input.dueDate;
      task.reminderEnabled = input.dueDate !== null;
    }

    // T016: Handle recurrence pattern update
    if (input.recurrencePattern !== undefined) {
      task.recurrencePattern = input.recurrencePattern;
    }

    this.saveTasks();
    return task;
  }

  /**
   * T014: Set due date on a task
   * @param {string} taskId - Task ID
   * @param {string|null} dueDate - ISO-8601 date or null to clear
   * @param {string} recurrencePattern - 'none' | 'daily' | 'weekly' | 'monthly'
   * @returns {Object|null} Updated task or null if not found
   */
  setDueDate(taskId, dueDate, recurrencePattern = 'none') {
    return this.updateTask(taskId, { dueDate, recurrencePattern });
  }

  /**
   * T044: Set reminder for a task
   * @param {string} taskId - Task ID
   * @param {number} reminderOffset - Minutes before due date to remind
   * @param {boolean} reminderEnabled - Whether reminder is enabled
   * @returns {Object|null} Updated task or null if not found
   */
  setReminder(taskId, reminderOffset, reminderEnabled) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return null;
    }

    task.reminderOffset = reminderOffset;
    task.reminderEnabled = reminderEnabled;

    this.saveTasks();
    return task;
  }

  /**
   * T053: Dismiss suggestion for a task
   * Prevents future suggestions from being shown
   * @param {string} taskId - Task ID
   * @returns {Object|null} Updated task or null if not found
   */
  dismissSuggestion(taskId) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return null;
    }

    task.suggestionDismissed = true;

    this.saveTasks();
    return task;
  }

  /**
   * Check if there are any tasks
   * @returns {boolean}
   */
  hasAnyTasks() {
    return this.tasks.length > 0;
  }

  /**
   * Get total task count
   * @returns {number}
   */
  getTaskCount() {
    return this.tasks.length;
  }

  /**
   * Get short ID (first 4 characters) for display
   * @param {string} id - Full UUID
   * @returns {string} Short ID
   */
  getShortId(id) {
    return id.substring(0, 4);
  }

  /**
   * Get all available tags (predefined + custom)
   * @returns {Array} All tags
   */
  getAllTags() {
    return [...PREDEFINED_TAGS, ...this.customTags];
  }

  /**
   * Get only tags that are used by at least one task
   * @returns {Array} Used tags
   */
  getUsedTags() {
    const usedTagNames = new Set();
    this.tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => usedTagNames.add(tag.toLowerCase()));
      }
    });
    return this.getAllTags().filter(tag => usedTagNames.has(tag.name));
  }

  /**
   * Create a new custom tag
   * @param {string} name - Tag name (1-30 chars)
   * @returns {Object} Created tag
   */
  createCustomTag(name) {
    const normalized = name.toLowerCase().trim();

    if (normalized.length < 1 || normalized.length > 30) {
      throw new Error('Tag name must be 1-30 lowercase characters');
    }

    // Check if already exists
    if (this.getAllTags().find(t => t.name === normalized)) {
      throw new Error('Tag already exists');
    }

    const tag = {
      name: normalized,
      color: DEFAULT_CUSTOM_TAG_COLOR,
      type: 'custom'
    };

    this.customTags.push(tag);
    this.saveTasks();
    return tag;
  }

  /**
   * Search tasks by keyword in title and description
   * @param {string} query - Search keyword
   * @returns {Array} Matching tasks
   */
  searchTasks(query) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    // Escape special regex characters for safety
    const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return this.tasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(normalizedQuery);
      const descMatch = task.description.toLowerCase().includes(normalizedQuery);
      return titleMatch || descMatch;
    });
  }

  /**
   * Filter tasks by status, priority, tag, or date
   * T027: Extended to support date-based filtering
   * @param {Object} filter - { type: 'status'|'priority'|'tag'|'due_today'|'due_this_week'|'overdue'|'no_due_date', value: any }
   * @returns {Array} Filtered tasks
   */
  filterTasks(filter) {
    if (!filter) {
      return this.tasks;
    }

    return this.tasks.filter(task => {
      switch (filter.type) {
        case 'status':
          return task.completed === filter.value;
        case 'priority':
          return task.priority === filter.value;
        case 'tag':
          return task.tags && task.tags.includes(filter.value.toLowerCase());
        // T027: Date-based filters
        case 'due_today':
          return task.dueDate && isToday(task.dueDate) && !task.completed;
        case 'due_this_week':
          return task.dueDate && isWithinWeek(task.dueDate) && !task.completed;
        case 'overdue':
          return task.dueDate && isPast(task.dueDate) && !task.completed;
        case 'no_due_date':
          return !task.dueDate;
        default:
          return true;
      }
    });
  }

  /**
   * T024: Filter tasks by date criteria
   * @param {string} filter - 'due_today' | 'due_this_week' | 'overdue' | 'no_due_date'
   * @returns {Array} Filtered tasks
   */
  filterByDate(filter) {
    return this.filterTasks({ type: filter });
  }

  /**
   * Sort tasks by specified criteria
   * T026: Extended to support due_date sorting
   * @param {Array} tasks - Tasks to sort
   * @param {string} sortType - 'priority'|'alpha'|'date'|'status'|'manual'|'due_date'
   * @returns {Array} Sorted tasks (new array)
   */
  sortTasks(tasks, sortType) {
    const sorted = [...tasks];

    const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };

    sorted.sort((a, b) => {
      let result = 0;

      switch (sortType) {
        case 'priority':
          result = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'alpha':
          result = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
          break;
        case 'date':
          result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'status':
          result = Number(a.completed) - Number(b.completed);
          break;
        // T026: Sort by due date (soonest first, nulls at end)
        case 'due_date':
          if (!a.dueDate && !b.dueDate) {
            result = 0;
          } else if (!a.dueDate) {
            result = 1; // a goes to end
          } else if (!b.dueDate) {
            result = -1; // b goes to end
          } else {
            result = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          break;
        case 'manual':
        default:
          result = a.sortOrder - b.sortOrder;
          break;
      }

      // Secondary sort by date (newest first) when primary values are equal
      if (result === 0 && sortType !== 'date') {
        result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      return result;
    });

    return sorted;
  }

  /**
   * T025: Sort tasks by due date
   * @param {Array} tasks - Tasks to sort
   * @param {string} direction - 'asc' | 'desc'
   * @returns {Array} Sorted tasks (null dates at end)
   */
  sortByDueDate(tasks, direction = 'asc') {
    const sorted = this.sortTasks(tasks, 'due_date');
    return direction === 'desc' ? sorted.reverse() : sorted;
  }

  /**
   * Move task up one position in manual order
   * @param {string} id - Task ID
   * @returns {boolean} True if moved, false if already at top
   */
  moveTaskUp(id) {
    const sorted = this.sortTasks(this.tasks, 'manual');
    const index = sorted.findIndex(t => t.id === id);

    if (index <= 0) {
      return false;
    }

    // Swap sortOrder with previous task
    const temp = sorted[index].sortOrder;
    sorted[index].sortOrder = sorted[index - 1].sortOrder;
    sorted[index - 1].sortOrder = temp;

    this.saveTasks();
    return true;
  }

  /**
   * Move task down one position in manual order
   * @param {string} id - Task ID
   * @returns {boolean} True if moved, false if already at bottom
   */
  moveTaskDown(id) {
    const sorted = this.sortTasks(this.tasks, 'manual');
    const index = sorted.findIndex(t => t.id === id);

    if (index < 0 || index >= sorted.length - 1) {
      return false;
    }

    // Swap sortOrder with next task
    const temp = sorted[index].sortOrder;
    sorted[index].sortOrder = sorted[index + 1].sortOrder;
    sorted[index + 1].sortOrder = temp;

    this.saveTasks();
    return true;
  }

  /**
   * Move task to specific position
   * @param {string} id - Task ID
   * @param {number} position - Target position (0-based)
   * @returns {boolean} True if moved
   */
  moveTaskTo(id, position) {
    const sorted = this.sortTasks(this.tasks, 'manual');
    const currentIndex = sorted.findIndex(t => t.id === id);

    if (currentIndex < 0 || position < 0 || position >= sorted.length) {
      return false;
    }

    // Remove task from current position
    const [task] = sorted.splice(currentIndex, 1);
    // Insert at target position
    sorted.splice(position, 0, task);

    // Recalculate sortOrder for all tasks
    sorted.forEach((t, index) => {
      t.sortOrder = index;
    });

    this.saveTasks();
    return true;
  }

  // ==================== Phase 4: Template Methods ====================

  /**
   * Get all templates
   * @returns {Array} Templates array
   */
  getTemplates() {
    return this.templates;
  }

  /**
   * Add a new template
   * @param {Object} template - Template object
   */
  addTemplate(template) {
    this.templates.push(template);
    this.saveTasks();
  }

  /**
   * Update an existing template
   * @param {Object} template - Template object with updated fields
   */
  updateTemplate(template) {
    const index = this.templates.findIndex(t => t.id === template.id);
    if (index !== -1) {
      this.templates[index] = template;
      this.saveTasks();
    }
  }

  /**
   * Delete a template by ID
   * @param {string} id - Template ID
   * @returns {boolean} True if deleted
   */
  deleteTemplate(id) {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) {
      return false;
    }
    this.templates.splice(index, 1);
    this.saveTasks();
    return true;
  }

  // ==================== Phase 4: Subtask Methods ====================

  /**
   * T021: Add a subtask to a task
   * @param {string} taskId - Task ID
   * @param {string} title - Subtask title
   * @returns {Object|null} Created subtask or null if task not found
   */
  addSubtask(taskId, title) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return null;
    }

    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      throw new Error('Subtask title cannot be empty');
    }

    if (trimmedTitle.length > 100) {
      throw new Error('Subtask title must be 100 characters or less');
    }

    if (task.subtasks.length >= 20) {
      throw new Error('Maximum 20 subtasks per task');
    }

    const subtask = {
      id: uuidv4(),
      title: trimmedTitle,
      completed: false,
      createdAt: new Date().toISOString()
    };

    task.subtasks.push(subtask);
    this.saveTasks();
    return subtask;
  }

  /**
   * T022: Toggle subtask completion status
   * @param {string} taskId - Task ID
   * @param {string} subtaskId - Subtask ID
   * @returns {Object|null} Updated subtask or null if not found
   */
  toggleSubtask(taskId, subtaskId) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return null;
    }

    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) {
      return null;
    }

    subtask.completed = !subtask.completed;
    this.saveTasks();
    return subtask;
  }

  /**
   * T023: Delete a subtask
   * @param {string} taskId - Task ID
   * @param {string} subtaskId - Subtask ID
   * @returns {boolean} True if deleted
   */
  deleteSubtask(taskId, subtaskId) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return false;
    }

    const index = task.subtasks.findIndex(s => s.id === subtaskId);
    if (index === -1) {
      return false;
    }

    task.subtasks.splice(index, 1);
    this.saveTasks();
    return true;
  }

  /**
   * T024: Get subtask progress for a task
   * @param {string} taskId - Task ID
   * @returns {{completed: number, total: number, percentage: number}|null}
   */
  getSubtaskProgress(taskId) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return null;
    }

    const total = task.subtasks.length;
    const completed = task.subtasks.filter(s => s.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  // ==================== Phase 4: Time Tracking Methods ====================

  /**
   * Add a time entry to a task
   * @param {string} taskId - Task ID
   * @param {Object} timeEntry - Time entry object
   */
  addTimeEntry(taskId, timeEntry) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return;
    }

    task.timeEntries.push(timeEntry);
    task.totalTimeMs = (task.totalTimeMs || 0) + timeEntry.durationMs;
    this.saveTasks();
  }

  /**
   * Get active timer state
   * @returns {Object|null}
   */
  getActiveTimerState() {
    return this.activeTimerState;
  }

  /**
   * Set active timer state
   * @param {Object|null} state - Timer state or null to clear
   */
  setActiveTimerState(state) {
    this.activeTimerState = state;
    this.saveTasks();
  }

  // ==================== Phase 4: Pomodoro Methods ====================

  /**
   * Get Pomodoro configuration
   * @returns {Object} PomodoroConfig
   */
  getPomodoroConfig() {
    // Check for daily reset
    const today = new Date().toISOString().split('T')[0];
    if (this.pomodoroConfig.lastResetDate !== today) {
      this.pomodoroConfig.completedToday = 0;
      this.pomodoroConfig.lastResetDate = today;
      this.saveTasks();
    }
    return this.pomodoroConfig;
  }

  /**
   * Update Pomodoro configuration
   * @param {Object} config - Updated config
   */
  updatePomodoroConfig(config) {
    this.pomodoroConfig = { ...this.pomodoroConfig, ...config };
    this.saveTasks();
  }

  /**
   * Increment today's Pomodoro count
   */
  incrementPomodoroCount() {
    const today = new Date().toISOString().split('T')[0];

    // Check for daily reset
    if (this.pomodoroConfig.lastResetDate !== today) {
      this.pomodoroConfig.completedToday = 0;
      this.pomodoroConfig.lastResetDate = today;
    }

    this.pomodoroConfig.completedToday++;
    this.saveTasks();
  }

  /**
   * Get today's Pomodoro count
   * @returns {number}
   */
  getTodayPomodoroCount() {
    // Trigger daily reset check
    this.getPomodoroConfig();
    return this.pomodoroConfig.completedToday;
  }

  // ==================== Phase 5: Collaboration Methods ====================

  /**
   * Add an assignee to a task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID to assign
   * @returns {Object|null} Updated task or null if not found
   */
  addAssignee(taskId, userId) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return null;
    }

    if (task.assignedTo.length >= 5) {
      throw new Error('Maximum 5 assignees per task');
    }

    if (!task.assignedTo.includes(userId)) {
      task.assignedTo.push(userId);
      task.version = (task.version || 1) + 1; // Increment version for conflict resolution
    }

    this.saveTasks();
    return task;
  }

  /**
   * Remove an assignee from a task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID to unassign
   * @returns {Object|null} Updated task or null if not found
   */
  removeAssignee(taskId, userId) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return null;
    }

    const initialLength = task.assignedTo.length;
    task.assignedTo = task.assignedTo.filter(id => id !== userId);

    if (initialLength !== task.assignedTo.length) {
      task.version = (task.version || 1) + 1; // Increment version if changed
    }

    this.saveTasks();
    return task;
  }

  /**
   * Get all assigned tasks for a user
   * @param {string} userId - User ID
   * @returns {Array} Tasks assigned to the user
   */
  getAssignedTasks(userId) {
    return this.tasks.filter(task => task.assignedTo && task.assignedTo.includes(userId));
  }

  /**
   * Add a comment to a task
   * @param {string} taskId - Task ID
   * @param {Object} comment - Comment object with authorId, content, etc.
   * @returns {Object|null} Updated task or null if not found
   */
  addComment(taskId, comment) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return null;
    }

    // Add the comment to the task
    if (!task.comments) {
      task.comments = [];
    }

    task.comments.push({
      id: comment.id || uuidv4(),
      taskId: taskId,
      authorId: comment.authorId,
      content: comment.content,
      createdAt: comment.createdAt || new Date().toISOString(),
      updatedAt: comment.updatedAt || new Date().toISOString(),
      mentions: comment.mentions || [],
      resolved: comment.resolved || false
    });

    task.version = (task.version || 1) + 1; // Increment version for conflict resolution

    this.saveTasks();
    return task;
  }

  /**
   * Get comments for a task
   * @param {string} taskId - Task ID
   * @returns {Array} Comments for the task
   */
  getComments(taskId) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return [];
    }
    return task.comments || [];
  }

  /**
   * Update the last modified information for a task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID of modifier
   * @returns {Object|null} Updated task or null if not found
   */
  updateLastModified(taskId, userId) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return null;
    }

    task.lastModifiedBy = userId;
    task.version = (task.version || 1) + 1;
    task.updatedAt = new Date().toISOString(); // Add updatedAt timestamp

    this.saveTasks();
    return task;
  }

  /**
   * Set the shared list ID for a task
   * @param {string} taskId - Task ID
   * @param {string} listId - Shared list ID
   * @returns {Object|null} Updated task or null if not found
   */
  setSharedListId(taskId, listId) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return null;
    }

    task.sharedListId = listId;
    task.version = (task.version || 1) + 1;

    this.saveTasks();
    return task;
  }

  /**
   * Get all tasks for a shared list
   * @param {string} listId - Shared list ID
   * @returns {Array} Tasks in the shared list
   */
  getTasksBySharedList(listId) {
    return this.tasks.filter(task => task.sharedListId === listId);
  }
}

// Export singleton instance
const taskService = new TaskService();
export default taskService;

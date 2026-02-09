import inquirer from 'inquirer';
import { formatTaskForSelection } from './display.js';
import taskService, { PRIORITIES, PREDEFINED_TAGS } from './taskService.js';
import { parseDate, toUTCString, formatDate } from './dateService.js';

// Export inquirer for inline prompts in other modules
export { inquirer };

/**
 * Prompts module - Interactive CLI prompts using inquirer
 */

/**
 * T012: Get priority choice from user
 * @param {string} currentPriority - Current priority for updates
 * @returns {Promise<string>} Selected priority
 */
export async function getPriorityChoice(currentPriority = null) {
  const choices = [
    { name: chalk.red('● High') + ' (urgent, do first)', value: 'high' },
    { name: chalk.yellow('◐ Medium') + ' (important)', value: 'medium' },
    { name: chalk.blue('○ Low') + ' (can wait)', value: 'low' },
    { name: '  None (no priority)', value: 'none' }
  ];

  const { priority } = await inquirer.prompt([
    {
      type: 'list',
      name: 'priority',
      message: 'Select priority:',
      choices,
      default: currentPriority || 'none'
    }
  ]);

  return priority;
}

// Import chalk for priority colors
import chalk from 'chalk';

/**
 * T021: Get tag selection from user (multi-select)
 * @param {Array} availableTags - Available tags
 * @param {Array} currentTags - Currently selected tags
 * @returns {Promise<string[]>} Selected tags
 */
export async function getTagSelection(availableTags, currentTags = []) {
  const tagChoices = availableTags.map(tag => ({
    name: tag.name,
    value: tag.name,
    checked: currentTags.includes(tag.name)
  }));

  tagChoices.push(new inquirer.Separator());
  tagChoices.push({ name: '+ Add custom tag...', value: '__custom__' });

  const { tags } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'tags',
      message: 'Select tags (space to select, enter to confirm):',
      choices: tagChoices
    }
  ]);

  // Handle custom tag creation
  if (tags.includes('__custom__')) {
    const customName = await getCustomTagName();
    if (customName) {
      const filtered = tags.filter(t => t !== '__custom__');
      filtered.push(customName);
      return filtered;
    }
    return tags.filter(t => t !== '__custom__');
  }

  return tags;
}

/**
 * T022: Get custom tag name from user
 * @returns {Promise<string|null>} Tag name or null if cancelled
 */
export async function getCustomTagName() {
  const { tagName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'tagName',
      message: 'Enter custom tag name (1-30 chars, lowercase):',
      validate: (input) => {
        const normalized = input.toLowerCase().trim();
        if (!normalized) {
          return 'Tag name cannot be empty';
        }
        if (normalized.length > 30) {
          return 'Tag name must be 30 characters or less';
        }
        if (taskService.getAllTags().find(t => t.name === normalized)) {
          return 'Tag already exists';
        }
        return true;
      },
      filter: (input) => input.toLowerCase().trim()
    }
  ]);

  return tagName || null;
}

/**
 * Get main menu choice
 * T033, T041, T050, T061, T066: Updated to handle options 1-10
 * T018, T043, T059: Extended to handle options 11-13 (Phase 4)
 * @returns {Promise<number>} Selected menu option (1-13)
 */
export async function getMenuChoice() {
  const { choice } = await inquirer.prompt([
    {
      type: 'input',
      name: 'choice',
      message: 'Enter your choice (1-13):',
      validate: (input) => {
        const num = parseInt(input, 10);
        if (isNaN(num) || num < 1 || num > 13) {
          return 'Invalid option. Please enter 1-13.';
        }
        return true;
      }
    }
  ]);
  return parseInt(choice, 10);
}

/**
 * T029: Get search query from user
 * @returns {Promise<string>} Search query
 */
export async function getSearchQuery() {
  const { query } = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: 'Enter search keyword:'
    }
  ]);
  return query.trim();
}

/**
 * T037: Get filter choice from user
 * T028: Updated with date filter options
 * @param {Array} usedTags - Tags currently in use
 * @returns {Promise<{type: string, value: any}|null>} Filter or null
 */
export async function getFilterChoice(usedTags = []) {
  const { filterType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'filterType',
      message: 'Filter by:',
      choices: [
        { name: 'Status (Pending/Completed)', value: 'status' },
        { name: 'Priority (High/Medium/Low/None)', value: 'priority' },
        { name: 'Tag', value: 'tag' },
        new inquirer.Separator(),
        // T028: Date-based filters
        { name: chalk.yellow('📅 Due Today'), value: 'due_today' },
        { name: chalk.yellow('📅 Due This Week'), value: 'due_this_week' },
        { name: chalk.red('⚠️  Overdue'), value: 'overdue' },
        { name: chalk.dim('📅 No Due Date'), value: 'no_due_date' },
        new inquirer.Separator(),
        { name: 'Clear Filter', value: 'clear' },
        { name: '← Back to Menu', value: null }
      ]
    }
  ]);

  if (filterType === null || filterType === 'clear') {
    return filterType === 'clear' ? { type: 'clear' } : null;
  }

  // T028: Handle date-based filters (no additional value needed)
  if (['due_today', 'due_this_week', 'overdue', 'no_due_date'].includes(filterType)) {
    return { type: filterType };
  }

  // Get filter value based on type
  if (filterType === 'status') {
    const { status } = await inquirer.prompt([
      {
        type: 'list',
        name: 'status',
        message: 'Show tasks:',
        choices: [
          { name: 'Pending only', value: false },
          { name: 'Completed only', value: true }
        ]
      }
    ]);
    return { type: 'status', value: status };
  }

  if (filterType === 'priority') {
    const { priority } = await inquirer.prompt([
      {
        type: 'list',
        name: 'priority',
        message: 'Show priority:',
        choices: [
          { name: chalk.red('● High'), value: 'high' },
          { name: chalk.yellow('◐ Medium'), value: 'medium' },
          { name: chalk.blue('○ Low'), value: 'low' },
          { name: '  None', value: 'none' }
        ]
      }
    ]);
    return { type: 'priority', value: priority };
  }

  if (filterType === 'tag') {
    const allTags = taskService.getAllTags();
    const tagChoices = allTags.map(t => ({ name: t.name, value: t.name }));

    if (tagChoices.length === 0) {
      console.log(chalk.yellow('No tags available'));
      return null;
    }

    const { tag } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tag',
        message: 'Show tasks tagged:',
        choices: tagChoices
      }
    ]);
    return { type: 'tag', value: tag };
  }

  return null;
}

/**
 * T047: Get sort choice from user
 * T029: Updated with due date sort option
 * @returns {Promise<string|null>} Sort type or null
 */
export async function getSortChoice() {
  const { sortType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'sortType',
      message: 'Sort by:',
      choices: [
        // T029: Due date sort option
        { name: chalk.yellow('📅 Due Date (Soonest First)'), value: 'due_date' },
        { name: 'Priority (High → Low)', value: 'priority' },
        { name: 'Alphabetical (A → Z)', value: 'alpha' },
        { name: 'Date Created (Newest First)', value: 'date' },
        { name: 'Status (Pending First)', value: 'status' },
        { name: 'Manual Order', value: 'manual' },
        new inquirer.Separator(),
        { name: '← Back to Menu', value: null }
      ]
    }
  ]);
  return sortType;
}

/**
 * T058: Get reorder choice from user
 * @param {Array} tasks - Tasks to reorder
 * @returns {Promise<{taskId: string, action: string}|null>} Reorder action or null
 */
export async function getReorderChoice(tasks) {
  if (tasks.length === 0) {
    return null;
  }

  const taskChoices = tasks.map((task, index) => ({
    name: `${index + 1}. ${formatTaskForSelection(task)}`,
    value: task.id
  }));

  taskChoices.push(new inquirer.Separator());
  taskChoices.push({ name: '← Back to Menu', value: null });

  const { taskId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'taskId',
      message: 'Select task to move:',
      choices: taskChoices
    }
  ]);

  if (!taskId) {
    return null;
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Move action:',
      choices: [
        { name: '↑ Move Up', value: 'up' },
        { name: '↓ Move Down', value: 'down' },
        { name: '# Move to Position...', value: 'position' },
        new inquirer.Separator(),
        { name: 'Cancel', value: null }
      ]
    }
  ]);

  if (!action) {
    return null;
  }

  return { taskId, action };
}

/**
 * T059: Get new position for task
 * @param {number} max - Maximum position
 * @returns {Promise<number>} New position (0-based)
 */
export async function getNewPosition(max) {
  const { position } = await inquirer.prompt([
    {
      type: 'input',
      name: 'position',
      message: `Enter new position (1-${max}):`,
      validate: (input) => {
        const num = parseInt(input, 10);
        if (isNaN(num) || num < 1 || num > max) {
          return `Please enter a number between 1 and ${max}`;
        }
        return true;
      }
    }
  ]);
  return parseInt(position, 10) - 1; // Convert to 0-based
}

/**
 * Get new task input including priority, tags, and due date
 * T014: Updated to include priority selection
 * T024: Updated to include tag selection
 * T012: Updated to include due date prompt
 * @returns {Promise<{title: string, description: string, priority: string, tags: string[], dueDate: string|null, recurrencePattern: string}>}
 */
export async function getNewTaskInput() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter task title:',
      validate: (input) => {
        if (!input.trim()) {
          return 'Title cannot be empty. Please try again.';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter description (optional):'
    }
  ]);

  // T014: Get priority
  const priority = await getPriorityChoice();

  // T024: Get tags
  const availableTags = taskService.getAllTags();
  const tags = await getTagSelection(availableTags, []);

  // T012: Get due date
  const { dueDate, recurrencePattern } = await promptDueDate(null);

  return {
    title: answers.title.trim(),
    description: answers.description.trim(),
    priority,
    tags,
    dueDate,
    recurrencePattern
  };
}

/**
 * Select task for toggle operation
 * @param {Array} tasks - Array of tasks
 * @returns {Promise<string|null>} Selected task ID or null if cancelled
 */
export async function selectTaskForToggle(tasks) {
  if (tasks.length === 0) {
    return null;
  }

  const choices = [
    ...tasks.map(task => ({
      name: formatTaskForSelection(task),
      value: task.id
    })),
    new inquirer.Separator(),
    { name: '← Back to menu', value: null }
  ];

  const { taskId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'taskId',
      message: 'Select a task to toggle:',
      choices
    }
  ]);

  return taskId;
}

/**
 * Select task for delete operation
 * @param {Array} tasks - Array of tasks
 * @returns {Promise<string|null>} Selected task ID or null if cancelled
 */
export async function selectTaskForDelete(tasks) {
  if (tasks.length === 0) {
    return null;
  }

  const choices = [
    ...tasks.map(task => ({
      name: formatTaskForSelection(task),
      value: task.id
    })),
    new inquirer.Separator(),
    { name: '← Back to menu', value: null }
  ];

  const { taskId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'taskId',
      message: 'Select a task to delete:',
      choices
    }
  ]);

  return taskId;
}

/**
 * Select task for update operation
 * @param {Array} tasks - Array of tasks
 * @returns {Promise<string|null>} Selected task ID or null if cancelled
 */
export async function selectTaskForUpdate(tasks) {
  if (tasks.length === 0) {
    return null;
  }

  const choices = [
    ...tasks.map(task => ({
      name: formatTaskForSelection(task),
      value: task.id
    })),
    new inquirer.Separator(),
    { name: '← Back to menu', value: null }
  ];

  const { taskId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'taskId',
      message: 'Select a task to update:',
      choices
    }
  ]);

  return taskId;
}

/**
 * Get update input for a task including priority and tags
 * T015: Updated to include priority update
 * T025: Updated to include tag update
 * @param {Object} currentTask - Current task object
 * @returns {Promise<{title?: string, description?: string, priority?: string, tags?: string[]}>}
 */
/**
 * T011: Prompt for due date input
 * @param {string|null} currentDueDate - Current due date for updates (ISO string)
 * @returns {Promise<{dueDate: string|null, recurrencePattern: string}>}
 */
export async function promptDueDate(currentDueDate = null) {
  // Ask if user wants to set a due date
  const { setDueDate } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'setDueDate',
      message: currentDueDate ? 'Change due date?' : 'Set a due date?',
      default: false
    }
  ]);

  if (!setDueDate) {
    // Keep current or return null
    return {
      dueDate: currentDueDate,
      recurrencePattern: 'none'
    };
  }

  // Show current due date if exists
  if (currentDueDate) {
    console.log(chalk.dim(`  Current: ${formatDate(currentDueDate, 'long')}`));
  }

  // Get date input
  const { dateInput } = await inquirer.prompt([
    {
      type: 'input',
      name: 'dateInput',
      message: 'Enter due date (YYYY-MM-DD HH:MM) or "clear" to remove:',
      validate: (input) => {
        if (input.toLowerCase() === 'clear' || input === '') {
          return true;
        }
        const dt = parseDate(input);
        if (!dt) {
          // T058: User-friendly error messages
          return 'Invalid date format. Examples: "2025-01-15", "2025-01-15 14:30", or "clear" to remove';
        }
        return true;
      }
    }
  ]);

  // Handle clear
  if (dateInput.toLowerCase() === 'clear' || dateInput === '') {
    return {
      dueDate: null,
      recurrencePattern: 'none'
    };
  }

  // Parse and convert to UTC
  const dueDate = toUTCString(dateInput);

  // Ask about recurrence (implemented fully in Phase 6 US4)
  const { recurrencePattern } = await inquirer.prompt([
    {
      type: 'list',
      name: 'recurrencePattern',
      message: 'Set recurrence?',
      choices: [
        { name: 'None (one-time)', value: 'none' },
        { name: 'Daily', value: 'daily' },
        { name: 'Weekly', value: 'weekly' },
        { name: 'Monthly', value: 'monthly' }
      ],
      default: 'none'
    }
  ]);

  return { dueDate, recurrencePattern };
}

/**
 * T052: Prompt user to accept/dismiss date suggestion
 * @param {Object} suggestion - Suggestion from analyzeTitleForDateSuggestion
 * @returns {Promise<{action: 'accept'|'custom'|'dismiss', dueDate?: string}>}
 */
export async function promptSuggestionResponse(suggestion) {
  console.log();
  console.log(chalk.cyan(`  💡 ${suggestion.message}`));
  console.log();

  const choices = [];

  if (suggestion.suggestedDate) {
    choices.push({
      name: chalk.green('Yes, use suggested date'),
      value: 'accept'
    });
  }

  choices.push(
    { name: 'Set a different date...', value: 'custom' },
    { name: chalk.dim('No, skip for now'), value: 'dismiss' }
  );

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices
    }
  ]);

  if (action === 'accept') {
    return {
      action: 'accept',
      dueDate: suggestion.suggestedDate
    };
  }

  if (action === 'custom') {
    // Use existing promptDueDate function
    const { dueDate, recurrencePattern } = await promptDueDate(null);
    return {
      action: 'custom',
      dueDate,
      recurrencePattern
    };
  }

  return { action: 'dismiss' };
}

/**
 * T045: Prompt for reminder configuration
 * @param {Object} currentTask - Current task with existing reminder settings
 * @returns {Promise<{reminderOffset: number, reminderEnabled: boolean}|null>}
 */
export async function promptReminder(currentTask) {
  // Check if task has a due date
  if (!currentTask.dueDate) {
    console.log(chalk.yellow('  Cannot set reminder - task has no due date'));
    return null;
  }

  const { enableReminder } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'enableReminder',
      message: 'Enable reminder notification?',
      default: currentTask.reminderEnabled ?? true
    }
  ]);

  if (!enableReminder) {
    return {
      reminderOffset: currentTask.reminderOffset || 15,
      reminderEnabled: false
    };
  }

  const { reminderOffset } = await inquirer.prompt([
    {
      type: 'list',
      name: 'reminderOffset',
      message: 'Remind me:',
      choices: [
        { name: '5 minutes before', value: 5 },
        { name: '15 minutes before', value: 15 },
        { name: '30 minutes before', value: 30 },
        { name: '1 hour before', value: 60 },
        { name: '2 hours before', value: 120 },
        { name: '1 day before', value: 1440 }
      ],
      default: currentTask.reminderOffset || 15
    }
  ]);

  return {
    reminderOffset,
    reminderEnabled: true
  };
}

export async function getUpdateInput(currentTask) {
  console.log(`\nCurrent title: "${currentTask.title}"`);
  console.log(`Current description: "${currentTask.description || '(none)'}"`);
  console.log(`Current priority: ${currentTask.priority || 'none'}`);
  console.log(`Current tags: ${(currentTask.tags || []).join(', ') || '(none)'}`);
  if (currentTask.dueDate) {
    console.log(`Current due date: ${formatDate(currentTask.dueDate, 'long')}`);
    if (currentTask.recurrencePattern && currentTask.recurrencePattern !== 'none') {
      console.log(`Recurrence: ${currentTask.recurrencePattern}`);
    }
  }
  console.log();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter new title (or press Enter to keep current):',
      default: ''
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter new description (or press Enter to keep current):',
      default: ''
    }
  ]);

  // T015: Ask if user wants to change priority
  const { changePriority } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'changePriority',
      message: 'Change priority?',
      default: false
    }
  ]);

  let priority;
  if (changePriority) {
    priority = await getPriorityChoice(currentTask.priority);
  }

  // T025: Ask if user wants to change tags
  const { changeTags } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'changeTags',
      message: 'Change tags?',
      default: false
    }
  ]);

  let tags;
  if (changeTags) {
    const availableTags = taskService.getAllTags();
    tags = await getTagSelection(availableTags, currentTask.tags || []);
  }

  // T013: Ask if user wants to change due date
  const { dueDate, recurrencePattern } = await promptDueDate(currentTask.dueDate);

  const result = {};

  // Only include fields that were actually changed
  if (answers.title.trim()) {
    result.title = answers.title.trim();
  }
  if (answers.description !== '') {
    result.description = answers.description.trim();
  }
  if (priority !== undefined) {
    result.priority = priority;
  }
  if (tags !== undefined) {
    result.tags = tags;
  }
  // T013: Include due date changes
  if (dueDate !== currentTask.dueDate) {
    result.dueDate = dueDate;
    result.recurrencePattern = recurrencePattern;
  }

  return result;
}

// ==================== Phase 4: Template Prompts ====================

/**
 * T013: Select a template from the list
 * @param {Array} templates - Available templates
 * @returns {Promise<string|null>} Template ID or null if cancelled
 */
export async function selectTemplate(templates) {
  if (templates.length === 0) {
    return null;
  }

  const choices = [
    ...templates.map(template => ({
      name: `${template.name} - "${template.title}"`,
      value: template.id
    })),
    new inquirer.Separator(),
    { name: '← Back', value: null }
  ];

  const { templateId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'templateId',
      message: 'Select a template:',
      choices
    }
  ]);

  return templateId;
}

/**
 * T014: Get template creation input
 * @param {Object} [fromTask] - Optional task to pre-fill values
 * @returns {Promise<Object>} Template input
 */
export async function getTemplateInput(fromTask = null) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Template name (unique, 1-50 chars):',
      default: fromTask ? `${fromTask.title.substring(0, 30)} Template` : '',
      validate: (input) => {
        const trimmed = input.trim();
        if (!trimmed) return 'Template name is required';
        if (trimmed.length > 50) return 'Template name must be 50 characters or less';
        return true;
      }
    },
    {
      type: 'input',
      name: 'title',
      message: 'Task title pattern:',
      default: fromTask?.title || '',
      validate: (input) => {
        if (!input.trim()) return 'Title is required';
        if (input.length > 200) return 'Title must be 200 characters or less';
        return true;
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description (optional):',
      default: fromTask?.description || ''
    }
  ]);

  // Get priority
  const priority = await getPriorityChoice(fromTask?.priority || 'none');

  // Get tags
  const availableTags = taskService.getAllTags();
  const tags = await getTagSelection(availableTags, fromTask?.tags || []);

  // Get recurrence pattern
  const { recurrencePattern } = await inquirer.prompt([
    {
      type: 'list',
      name: 'recurrencePattern',
      message: 'Default recurrence?',
      choices: [
        { name: 'None (one-time)', value: 'none' },
        { name: 'Daily', value: 'daily' },
        { name: 'Weekly', value: 'weekly' },
        { name: 'Monthly', value: 'monthly' }
      ],
      default: fromTask?.recurrencePattern || 'none'
    }
  ]);

  // Get default subtasks
  const { addSubtasks } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addSubtasks',
      message: 'Add default subtasks?',
      default: false
    }
  ]);

  let defaultSubtasks = [];
  if (addSubtasks) {
    defaultSubtasks = await getDefaultSubtasks();
  }

  return {
    name: answers.name.trim(),
    title: answers.title.trim(),
    description: answers.description.trim(),
    priority,
    tags,
    recurrencePattern,
    defaultSubtasks
  };
}

/**
 * Helper to get default subtasks for a template
 * @returns {Promise<string[]>} Array of subtask titles
 */
async function getDefaultSubtasks() {
  const subtasks = [];
  const maxSubtasks = 10;

  console.log(chalk.dim(`  Enter subtask titles (max ${maxSubtasks}, empty to finish):`));

  while (subtasks.length < maxSubtasks) {
    const { subtask } = await inquirer.prompt([
      {
        type: 'input',
        name: 'subtask',
        message: `Subtask ${subtasks.length + 1}:`,
        validate: (input) => {
          if (input && input.length > 100) return 'Subtask must be 100 characters or less';
          return true;
        }
      }
    ]);

    if (!subtask.trim()) break;
    subtasks.push(subtask.trim());
  }

  return subtasks;
}

/**
 * T015: Confirm template overwrite when name conflicts
 * @param {string} name - Template name
 * @returns {Promise<boolean>} True if user wants to overwrite
 */
export async function confirmTemplateOverwrite(name) {
  const { overwrite } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'overwrite',
      message: `Template "${name}" already exists. Overwrite?`,
      default: false
    }
  ]);
  return overwrite;
}

/**
 * Get template submenu choice
 * @returns {Promise<string|null>} Submenu choice or null
 */
export async function getTemplateSubmenuChoice() {
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Template Options:',
      choices: [
        { name: '📝 Create Template', value: 'create' },
        { name: '📋 List Templates', value: 'list' },
        { name: '✏️  Edit Template', value: 'edit' },
        { name: '🗑️  Delete Template', value: 'delete' },
        { name: '➕ Create Task from Template', value: 'use' },
        new inquirer.Separator(),
        { name: '← Back to Menu', value: null }
      ]
    }
  ]);
  return choice;
}

/**
 * Ask if user wants to create from template
 * @returns {Promise<boolean>}
 */
export async function askCreateFromTemplate() {
  const { useTemplate } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useTemplate',
      message: 'Create from template?',
      default: false
    }
  ]);
  return useTemplate;
}

// ==================== Phase 4: Subtask Prompts ====================

/**
 * T026: Get subtask title input
 * @returns {Promise<string>} Subtask title
 */
export async function getSubtaskTitle() {
  const { title } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Subtask title:',
      validate: (input) => {
        if (!input.trim()) return 'Subtask title is required';
        if (input.length > 100) return 'Subtask must be 100 characters or less';
        return true;
      }
    }
  ]);
  return title.trim();
}

/**
 * T027: Select a subtask from the list
 * @param {Array} subtasks - Available subtasks
 * @returns {Promise<string|null>} Subtask ID or null if cancelled
 */
export async function selectSubtask(subtasks) {
  if (subtasks.length === 0) {
    return null;
  }

  const choices = [
    ...subtasks.map(subtask => ({
      name: `${subtask.completed ? '✓' : '○'} ${subtask.title}`,
      value: subtask.id
    })),
    new inquirer.Separator(),
    { name: '← Back', value: null }
  ];

  const { subtaskId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'subtaskId',
      message: 'Select a subtask:',
      choices
    }
  ]);

  return subtaskId;
}

/**
 * Get subtask action choice
 * @returns {Promise<string|null>}
 */
export async function getSubtaskAction() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Subtask action:',
      choices: [
        { name: '➕ Add Subtask', value: 'add' },
        { name: '✓  Toggle Subtask', value: 'toggle' },
        { name: '🗑️  Delete Subtask', value: 'delete' },
        new inquirer.Separator(),
        { name: '← Back', value: null }
      ]
    }
  ]);
  return action;
}

// ==================== Phase 4: Timer Prompts ====================

/**
 * T039: Confirm timer recovery from previous session
 * @param {string} taskTitle - Title of task with orphaned timer
 * @param {number} elapsedMs - Elapsed time in milliseconds
 * @returns {Promise<'save'|'discard'>}
 */
export async function confirmTimerRecovery(taskTitle, elapsedMs) {
  const { formatDuration } = await import('./display.js');
  const duration = formatDuration(elapsedMs);

  console.log();
  console.log(chalk.yellow(`⏱️  Found active timer from previous session:`));
  console.log(chalk.yellow(`   Task: "${taskTitle}"`));
  console.log(chalk.yellow(`   Elapsed: ${duration}`));
  console.log();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: `✓ Save time (${duration})`, value: 'save' },
        { name: '✗ Discard', value: 'discard' }
      ]
    }
  ]);

  return action;
}

/**
 * T040: Select task for timer
 * @param {Array} tasks - Available tasks
 * @returns {Promise<string|null>} Task ID or null
 */
export async function selectTaskForTimer(tasks) {
  if (tasks.length === 0) {
    return null;
  }

  // Filter to only incomplete tasks
  const incompleteTasks = tasks.filter(t => !t.completed);

  if (incompleteTasks.length === 0) {
    console.log(chalk.yellow('No incomplete tasks to time.'));
    return null;
  }

  const choices = [
    ...incompleteTasks.map(task => ({
      name: formatTaskForSelection(task),
      value: task.id
    })),
    new inquirer.Separator(),
    { name: '← Back', value: null }
  ];

  const { taskId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'taskId',
      message: 'Select task to time:',
      choices
    }
  ]);

  return taskId;
}

/**
 * T055: Get Pomodoro configuration input
 * @param {Object} current - Current Pomodoro config
 * @returns {Promise<Object>} Updated config
 */
export async function getPomodoroConfigInput(current) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'workDurationMinutes',
      message: 'Work duration (minutes):',
      default: current.workDurationMinutes,
      validate: (input) => {
        const num = parseInt(input, 10);
        if (isNaN(num) || num < 1 || num > 120) {
          return 'Must be between 1 and 120 minutes';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'breakDurationMinutes',
      message: 'Break duration (minutes):',
      default: current.breakDurationMinutes,
      validate: (input) => {
        const num = parseInt(input, 10);
        if (isNaN(num) || num < 1 || num > 60) {
          return 'Must be between 1 and 60 minutes';
        }
        return true;
      }
    }
  ]);

  return {
    workDurationMinutes: parseInt(answers.workDurationMinutes, 10),
    breakDurationMinutes: parseInt(answers.breakDurationMinutes, 10)
  };
}

/**
 * Get Pomodoro submenu choice
 * @returns {Promise<string|null>}
 */
export async function getPomodoroSubmenuChoice() {
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Pomodoro Options:',
      choices: [
        { name: '🍅 Start Pomodoro', value: 'start' },
        { name: '⏹️  Cancel Pomodoro', value: 'cancel' },
        { name: '⚙️  Settings', value: 'settings' },
        { name: '📊 Today\'s Stats', value: 'stats' },
        new inquirer.Separator(),
        { name: '← Back to Menu', value: null }
      ]
    }
  ]);
  return choice;
}

// ==================== Phase 5: Collaboration Prompts ====================

/**
 * Get updated menu choice to include collaboration options (1-18)
 * @returns {Promise<number>} Selected menu option (1-18)
 */
export async function getUpdatedMenuChoice() {
  const { choice } = await inquirer.prompt([
    {
      type: 'input',
      name: 'choice',
      message: 'Enter your choice (1-18):',
      validate: (input) => {
        const num = parseInt(input, 10);
        if (isNaN(num) || num < 1 || num > 18) {
          return 'Invalid option. Please enter a number between 1 and 18.';
        }
        return true;
      }
    }
  ]);
  return parseInt(choice, 10);
}

/**
 * Get share list options from user
 * @returns {Promise<{accessType: string, permissions: string, expiresAt: string|null}>}
 */
export async function getShareListOptions() {
  const { accessType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'accessType',
      message: 'Set access level:',
      choices: [
        { name: 'Public (anyone with link)', value: 'public' },
        { name: 'Private (only invited users)', value: 'private' },
        { name: 'Team (within organization)', value: 'team' }
      ]
    }
  ]);

  const { permissions } = await inquirer.prompt([
    {
      type: 'list',
      name: 'permissions',
      message: 'Set permissions:',
      choices: [
        { name: 'Read-only', value: 'read' },
        { name: 'Read & Write', value: 'read_write' }
      ]
    }
  ]);

  const { setExpiration } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'setExpiration',
      message: 'Set expiration date?',
      default: false
    }
  ]);

  let expiresAt = null;
  if (setExpiration) {
    const { expirationDate } = await inquirer.prompt([
      {
        type: 'input',
        name: 'expirationDate',
        message: 'Enter expiration date (YYYY-MM-DD):',
        validate: (input) => {
          if (!input) return true;
          const date = new Date(input);
          if (isNaN(date.getTime())) {
            return 'Invalid date format. Please use YYYY-MM-DD.';
          }
          if (date < new Date()) {
            return 'Expiration date must be in the future.';
          }
          return true;
        }
      }
    ]);
    expiresAt = expirationDate || null;
  }

  return { accessType, permissions, expiresAt };
}

/**
 * Get user ID or email for assignment
 * @returns {Promise<string>} User ID or email
 */
export async function getUserForAssignment() {
  const { userId } = await inquirer.prompt([
    {
      type: 'input',
      name: 'userId',
      message: 'Enter user ID or email to assign:'
    }
  ]);
  return userId.trim();
}

/**
 * Get assignment details
 * @returns {Promise<{status: string, dueDate: string|null, priority: string|null}>}
 */
export async function getAssignmentDetails() {
  const { status } = await inquirer.prompt([
    {
      type: 'list',
      name: 'status',
      message: 'Set assignment status:',
      choices: [
        { name: 'Pending', value: 'pending' },
        { name: 'Accepted', value: 'accepted' },
        { name: 'In Progress', value: 'in_progress' },
        { name: 'Completed', value: 'completed' }
      ],
      default: 'pending'
    }
  ]);

  const { setDueDate } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'setDueDate',
      message: 'Set due date for assignment?',
      default: false
    }
  ]);

  let dueDate = null;
  if (setDueDate) {
    const { dueDateInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'dueDateInput',
        message: 'Enter due date (YYYY-MM-DD):',
        validate: (input) => {
          if (!input) return true;
          const date = new Date(input);
          if (isNaN(date.getTime())) {
            return 'Invalid date format. Please use YYYY-MM-DD.';
          }
          if (date < new Date()) {
            return 'Due date must be in the future.';
          }
          return true;
        }
      }
    ]);
    dueDate = dueDateInput || null;
  }

  const { priority } = await inquirer.prompt([
    {
      type: 'list',
      name: 'priority',
      message: 'Set priority:',
      choices: [
        { name: 'Low', value: 'low' },
        { name: 'Medium', value: 'medium' },
        { name: 'High', value: 'high' },
        { name: 'None', value: null }
      ],
      default: null
    }
  ]);

  return { status, dueDate, priority };
}

/**
 * Get comment content from user
 * @returns {Promise<string>} Comment content
 */
export async function getCommentContent() {
  const { content } = await inquirer.prompt([
    {
      type: 'input',
      name: 'content',
      message: 'Enter comment:',
      validate: (input) => {
        if (!input.trim()) {
          return 'Comment cannot be empty.';
        }
        if (input.length > 1000) {
          return 'Comment must be less than 1000 characters.';
        }
        return true;
      }
    }
  ]);
  return content.trim();
}

/**
 * Select shared list from user's available lists
 * @param {Array} sharedLists - Available shared lists
 * @returns {Promise<string|null>} Selected list ID or null
 */
export async function selectSharedList(sharedLists) {
  if (sharedLists.length === 0) {
    console.log(chalk.yellow('No shared lists available.'));
    return null;
  }

  const choices = [
    ...sharedLists.map(list => ({
      name: `${list.name} (${list.ownerId === 'current_user' ? 'Owner' : 'Collaborator'})`,
      value: list.id
    })),
    new inquirer.Separator(),
    { name: '← Back to menu', value: null }
  ];

  const { listId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'listId',
      message: 'Select shared list:',
      choices
    }
  ]);

  return listId;
}

/**
 * Select task from shared list
 * @param {Array} tasks - Available tasks
 * @returns {Promise<string|null>} Selected task ID or null
 */
export async function selectTaskFromSharedList(tasks) {
  if (tasks.length === 0) {
    console.log(chalk.yellow('No tasks in this list.'));
    return null;
  }

  const choices = [
    ...tasks.map(task => ({
      name: `${task.completed ? '✓' : '○'} ${task.title}`,
      value: task.id
    })),
    new inquirer.Separator(),
    { name: '← Back to menu', value: null }
  ];

  const { taskId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'taskId',
      message: 'Select task:',
      choices
    }
  ]);

  return taskId;
}

/**
 * Get share link ID from user
 * @returns {Promise<string>} Share link ID
 */
export async function getShareLink() {
  const { linkId } = await inquirer.prompt([
    {
      type: 'input',
      name: 'linkId',
      message: 'Enter share link ID:'
    }
  ]);
  return linkId.trim();
}

/**
 * Get dashboard view type
 * @returns {Promise<string>} View type ('overview', 'progress', 'analytics')
 */
export async function getDashboardView() {
  const { viewType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'viewType',
      message: 'Select dashboard view:',
      choices: [
        { name: '📊 Overview', value: 'overview' },
        { name: '📈 Progress', value: 'progress' },
        { name: '📋 Analytics', value: 'analytics' }
      ]
    }
  ]);
  return viewType;
}

/**
 * Get export format for dashboard
 * @returns {Promise<string>} Export format ('json', 'csv', 'text')
 */
export async function getExportFormat() {
  const { format } = await inquirer.prompt([
    {
      type: 'list',
      name: 'format',
      message: 'Export format:',
      choices: [
        { name: 'JSON', value: 'json' },
        { name: 'CSV', value: 'csv' },
        { name: 'Text', value: 'text' }
      ]
    }
  ]);
  return format;
}

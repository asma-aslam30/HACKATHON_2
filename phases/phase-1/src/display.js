import chalk from 'chalk';
import Table from 'cli-table3';
import boxen from 'boxen';
import { PRIORITY_COLORS, PREDEFINED_TAGS } from './taskService.js';
import { formatDate, getRelativeTime } from './dateService.js';

/**
 * Display module - Colored terminal output formatting
 */

const DIVIDER = '═'.repeat(50);

/**
 * T006: Format duration in milliseconds to human-readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., "1h 23m", "45m", "12s")
 */
export function formatDuration(ms) {
  if (ms < 0) ms = 0;

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * T011: Show priority indicator with colored symbol
 * @param {string} priority - 'high'|'medium'|'low'|'none'
 * @returns {string} Colored priority indicator
 */
export function showPriorityIndicator(priority) {
  switch (priority) {
    case 'high':
      return chalk.red('●');
    case 'medium':
      return chalk.yellow('◐');
    case 'low':
      return chalk.blue('○');
    case 'none':
    default:
      return ' ';
  }
}

/**
 * T020: Show tag chips with colors
 * @param {Array} tags - Array of tag names
 * @param {number} maxShow - Max tags to display (default 3)
 * @returns {string} Formatted tag chips
 */
export function showTagChips(tags, maxShow = 3) {
  if (!tags || tags.length === 0) {
    return '';
  }

  const allTags = [...PREDEFINED_TAGS];
  const tagColors = {
    work: chalk.bgCyan.black,
    home: chalk.bgMagenta.white,
    personal: chalk.bgGreen.black
  };

  const displayTags = tags.slice(0, maxShow);
  const remaining = tags.length - maxShow;

  const chips = displayTags.map(tagName => {
    const colorFn = tagColors[tagName] || chalk.bgYellow.black;
    return colorFn(` ${tagName} `);
  });

  let result = chips.join(' ');
  if (remaining > 0) {
    result += chalk.dim(` +${remaining} more`);
  }

  return result;
}

/**
 * Show header with title
 * @param {string} title - Header title
 */
export function showHeader(title) {
  console.log(boxen(chalk.cyan.bold(title), {
    padding: { left: 5, right: 5 },
    margin: { top: 1, bottom: 1 },
    borderStyle: 'double',
    borderColor: 'cyan',
    title: 'TODO APP',
    titleAlignment: 'center'
  }));
}

/**
 * Show divider line
 */
export function showDivider() {
  console.log(chalk.cyan(DIVIDER));
}

/**
 * Show main menu
 * T032, T040, T049, T060, T065: Updated with options 1-10
 * T018, T043, T059: Extended with options 11-13 (Phase 4)
 */
export function showMainMenu() {
  const menuContent = [
    chalk.bold.blue('  --- CORE TASKS ---'),
    '  1. Add Task',
    '  2. List Tasks',
    '  3. Toggle Complete',
    '  4. Delete Task',
    '  5. Update Task',
    '',
    chalk.bold.cyan('  --- ORGANIZATION ---'),
    chalk.cyan('  6. 🔍 Search Tasks'),
    chalk.cyan('  7. 🏷️  Filter Tasks'),
    chalk.cyan('  8. 📊 Sort Tasks'),
    chalk.cyan('  9. ↕️  Reorder Tasks'),
    '',
    chalk.bold.magenta('  --- POWER USER ---'),
    chalk.magenta('  10. 📋 Templates'),
    chalk.magenta('  11. ⏱️  Start/Stop Timer'),
    chalk.magenta('  12. 🍅 Pomodoro'),
    '',
    chalk.bold.yellow('  --- COLLABORATION ---'),
    chalk.yellow('  13. 🔗 Share List'),
    chalk.yellow('  14. 💬 View Comments'),
    chalk.yellow('  15. 👥 Assign Task'),
    chalk.yellow('  16. 📈 Team Dashboard'),
    chalk.yellow('  17. 🤝 Join Shared List'),
    '',
    chalk.red('  18. 🚪 Exit')
  ].join('\n');

  console.log(boxen(menuContent, {
    padding: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    title: ' MAIN MENU ',
    titleAlignment: 'center'
  }));
}

/**
 * T030: Show search results
 * @param {Array} tasks - Matching tasks
 * @param {string} query - Search query
 */
export function showSearchResults(tasks, query) {
  showHeader(`Search Results for "${query}"`);

  if (tasks.length === 0) {
    showNoResults('search', query);
    return;
  }

  console.log(chalk.dim(`  Found ${tasks.length} task(s):\n`));
  tasks.forEach(task => {
    showTask(task, true);
    console.log();
  });

  showDivider();
}

/**
 * T031: Show no results message
 * @param {string} type - 'search' or 'filter'
 * @param {string} query - Search query (for search type)
 */
export function showNoResults(type, query = '') {
  if (type === 'search') {
    console.log(chalk.yellow(`  No tasks found matching '${query}'`));
  } else {
    console.log(chalk.yellow(`  No tasks match the current filter`));
  }
  console.log();
  showDivider();
}

/**
 * T038, T045: Show filter header indicator
 * T030: Extended to show date filter names
 * @param {Object} filter - Active filter { type, value }
 * @returns {string} Filter indicator string
 */
export function showFilterHeader(filter) {
  if (!filter) return '';

  let desc = '';
  switch (filter.type) {
    case 'status':
      desc = filter.value ? 'Completed' : 'Pending';
      break;
    case 'priority':
      desc = filter.value.charAt(0).toUpperCase() + filter.value.slice(1);
      break;
    case 'tag':
      desc = filter.value;
      break;
    // T030: Date filter names
    case 'due_today':
      return chalk.yellow('[Filter: Due Today]');
    case 'due_this_week':
      return chalk.yellow('[Filter: Due This Week]');
    case 'overdue':
      return chalk.red('[Filter: Overdue]');
    case 'no_due_date':
      return chalk.dim('[Filter: No Due Date]');
    default:
      return '';
  }

  return chalk.magenta(`[Filter: ${filter.type} = ${desc}]`);
}

/**
 * T048, T054: Show sort header indicator
 * T030: Extended to include due_date sort
 * @param {string} sortType - Active sort type
 * @returns {string} Sort indicator string
 */
export function showSortHeader(sortType) {
  if (!sortType || sortType === 'manual') return '';

  const labels = {
    priority: 'Priority ↓',
    alpha: 'A-Z',
    date: 'Newest First',
    status: 'Status',
    due_date: 'Due Date ↑'
  };

  return chalk.blue(`[Sort: ${labels[sortType] || sortType}]`);
}

/**
 * T017: Format task with due date and urgency styling
 * @param {Object} task - Task object
 * @returns {string} - Formatted due date string with colors
 */
export function formatTaskDueDate(task) {
  if (!task.dueDate) {
    return '';
  }

  const relativeTime = getRelativeTime(task.dueDate);

  let dueDateStr = '';
  if (relativeTime.isOverdue) {
    dueDateStr = chalk.red.bold(relativeTime.text);
  } else if (relativeTime.isDueSoon) {
    dueDateStr = chalk.yellow(relativeTime.text);
  } else {
    dueDateStr = chalk.gray(relativeTime.text);
  }

  // Add recurrence indicator
  if (task.recurrencePattern && task.recurrencePattern !== 'none') {
    dueDateStr += chalk.blue(` 🔁 ${task.recurrencePattern}`);
  }

  return dueDateStr;
}

/**
 * Show a single task with colored status, priority, tags, and due date
 * T013: Updated to display priority indicator
 * T023: Updated to display tag chips
 * T017/T018: Updated to display due date with urgency styling
 * @param {Object} task - Task object
 * @param {boolean} showDescription - Whether to show description
 */
export function showTask(task, showDescription = true) {
  const shortId = task.id.substring(0, 4);
  const status = task.completed
    ? chalk.green('✓')
    : chalk.yellow('○');

  const idDisplay = chalk.cyan(`[${shortId}]`);
  const priorityDisplay = showPriorityIndicator(task.priority || 'none');
  const titleDisplay = truncateTitle(task.title, 30);
  const tagsDisplay = showTagChips(task.tags || [], 3);
  const dueDateDisplay = formatTaskDueDate(task);

  // Format: [id] priority status title [tags] [due date]
  let line = `  ${idDisplay} ${priorityDisplay} ${status} ${titleDisplay}`;
  if (tagsDisplay) {
    line += ` ${tagsDisplay}`;
  }
  if (dueDateDisplay) {
    line += `  ${dueDateDisplay}`;
  }
  console.log(line);

  if (showDescription && task.description) {
    console.log(chalk.dim(`            ${task.description}`));
  } else if (showDescription && !task.description) {
    console.log(chalk.dim('            (no description)'));
  }
}

/**
 * Truncate title if too long
 * @param {string} title - Task title
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated title
 */
function truncateTitle(title, maxLength) {
  if (title.length <= maxLength) {
    return title;
  }
  return title.substring(0, maxLength - 3) + '...';
}

/**
 * T020: Show overdue warning banner
 * @param {number} overdueCount - Number of overdue tasks
 */
export function showOverdueBanner(overdueCount) {
  if (overdueCount > 0) {
    console.log(chalk.red.bold(`  ⚠️  ${overdueCount} task${overdueCount !== 1 ? 's are' : ' is'} overdue!`));
    console.log();
  }
}

/**
 * T023: Show upcoming reminders summary for tasks due within 24h
 * @param {Array} upcomingTasks - Tasks due within 24h
 */
export function showUpcomingReminders(upcomingTasks) {
  if (upcomingTasks.length > 0) {
    console.log(chalk.yellow(`  ⏰ ${upcomingTasks.length} task${upcomingTasks.length !== 1 ? 's' : ''} due soon:`));
    upcomingTasks.slice(0, 3).forEach(task => {
      const relativeTime = getRelativeTime(task.dueDate);
      console.log(chalk.yellow(`     • ${task.title} - ${relativeTime.text}`));
    });
    if (upcomingTasks.length > 3) {
      console.log(chalk.dim(`     ... and ${upcomingTasks.length - 3} more`));
    }
    console.log();
  }
}

/**
 * T022: Count overdue tasks
 * @param {Array} tasks - Array of tasks
 * @returns {number} Number of overdue tasks
 */
function countOverdueTasks(tasks) {
  return tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const relativeTime = getRelativeTime(task.dueDate);
    return relativeTime.isOverdue;
  }).length;
}

/**
 * T022: Get tasks due within 24 hours
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Tasks due soon
 */
function getTasksDueSoon(tasks) {
  return tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const relativeTime = getRelativeTime(task.dueDate);
    return relativeTime.isDueSoon && !relativeTime.isOverdue;
  });
}

/**
 * Show task list with overdue banner
 * T022: Updated to show overdue banner and upcoming reminders
 * @param {Array} tasks - Array of tasks
 */
export function showTaskList(tasks) {
  showHeader(`Your Tasks (${tasks.length})`);

  if (tasks.length === 0) {
    showEmptyState('No tasks found. Add your first task!');
    return;
  }

  // T022: Show overdue banner
  const overdueCount = countOverdueTasks(tasks);
  showOverdueBanner(overdueCount);

  // T023: Show upcoming reminders
  const dueSoonTasks = getTasksDueSoon(tasks);
  showUpcomingReminders(dueSoonTasks);

  const table = new Table({
    head: [
      chalk.cyan('ID'),
      chalk.cyan('Pri'),
      chalk.cyan('Status'),
      chalk.cyan('Title'),
      chalk.cyan('Tags'),
      chalk.cyan('Due Date')
    ],
    colWidths: [8, 5, 8, 30, 20, 25],
    wordWrap: true,
    style: {
      head: [],
      border: ['gray']
    }
  });

  tasks.forEach(task => {
    const shortId = task.id.substring(0, 4);
    const status = task.completed ? chalk.green('✓ Done') : chalk.yellow('○ Pending');
    const priority = showPriorityIndicator(task.priority || 'none');
    const tags = task.tags ? task.tags.slice(0, 2).join(', ') : '';
    const dueDate = formatTaskDueDate(task);

    table.push([
      shortId,
      priority,
      status,
      task.title,
      tags,
      dueDate
    ]);
  });

  console.log(table.toString());
  console.log();
}

/**
 * Show empty state message
 * @param {string} message - Message to display
 */
export function showEmptyState(message) {
  console.log(chalk.dim(`  ${message}`));
  console.log();
  showDivider();
}

/**
 * Show success message
 * @param {string} message - Success message
 */
export function showSuccess(message) {
  console.log();
  console.log(chalk.green(`✓ ${message}`));
}

/**
 * Show error message
 * @param {string} message - Error message
 */
export function showError(message) {
  console.log();
  console.log(chalk.red(`✗ ${message}`));
}

/**
 * Show info message
 * @param {string} message - Info message
 */
export function showInfo(message) {
  console.log();
  console.log(chalk.blue(`ℹ ${message}`));
}

/**
 * T035: Show recurring task creation message
 * @param {Object} newTask - The newly created recurring task
 */
export function showRecurringTaskCreated(newTask) {
  const dueDateStr = formatDate(newTask.dueDate, 'long');
  console.log();
  console.log(chalk.blue(`🔁 New recurring task created for ${dueDateStr}`));
}

/**
 * Show task details after operation
 * @param {Object} task - Task object
 */
export function showTaskDetails(task) {
  const shortId = task.id.substring(0, 4);
  console.log(chalk.dim(`  ID: ${shortId}`));
  console.log(chalk.dim(`  Title: "${task.title}"`));
}

/**
 * Show goodbye message
 */
export function showGoodbye() {
  console.log();
  console.log(chalk.cyan(DIVIDER));
  console.log(chalk.cyan.bold('  Thanks for using Todo App! Goodbye!'));
  console.log(chalk.cyan(DIVIDER));
  console.log();
}

/**
 * Format task for selection list
 * @param {Object} task - Task object
 * @returns {string} Formatted task string
 */
export function formatTaskForSelection(task) {
  const shortId = task.id.substring(0, 4);
  const status = task.completed ? '✓' : '○';
  const title = truncateTitle(task.title, 30);
  return `[${shortId}] ${status} ${title}`;
}

// ==================== Phase 4: Template Display Functions ====================

/**
 * T016: Show list of templates
 * @param {Array} templates - Templates array
 */
export function showTemplateList(templates) {
  showHeader(`Templates (${templates.length})`);

  if (templates.length === 0) {
    console.log(chalk.dim('  No templates saved. Create one with "Create Template"'));
    console.log();
    showDivider();
    return;
  }

  templates.forEach((template, index) => {
    console.log(`  ${index + 1}. ${chalk.cyan(template.name)}`);
    console.log(chalk.dim(`     Title: "${template.title}"`));
    if (template.tags.length > 0) {
      console.log(chalk.dim(`     Tags: ${template.tags.join(', ')}`));
    }
    if (template.defaultSubtasks.length > 0) {
      console.log(chalk.dim(`     Subtasks: ${template.defaultSubtasks.length} default`));
    }
    console.log();
  });

  showDivider();
}

/**
 * T017: Show template details
 * @param {Object} template - Template object
 */
export function showTemplateDetails(template) {
  console.log();
  console.log(chalk.cyan.bold(`Template: ${template.name}`));
  console.log(chalk.dim(`  Title: "${template.title}"`));
  if (template.description) {
    console.log(chalk.dim(`  Description: ${template.description}`));
  }
  console.log(chalk.dim(`  Priority: ${template.priority}`));
  if (template.tags.length > 0) {
    console.log(chalk.dim(`  Tags: ${template.tags.join(', ')}`));
  }
  if (template.recurrencePattern !== 'none') {
    console.log(chalk.dim(`  Recurrence: ${template.recurrencePattern}`));
  }
  if (template.defaultSubtasks.length > 0) {
    console.log(chalk.dim(`  Default Subtasks:`));
    template.defaultSubtasks.forEach(st => {
      console.log(chalk.dim(`    - ${st}`));
    });
  }
  console.log();
}

// ==================== Phase 4: Subtask Display Functions ====================

/**
 * T028: Show subtasks under a task with indented checkboxes
 * @param {Array} subtasks - Subtasks array
 */
export function showSubtasks(subtasks) {
  if (!subtasks || subtasks.length === 0) {
    return;
  }

  subtasks.forEach(subtask => {
    const checkbox = subtask.completed
      ? chalk.green('  ✓')
      : chalk.yellow('  □');
    const title = subtask.completed
      ? chalk.dim.strikethrough(subtask.title)
      : subtask.title;
    console.log(`${checkbox} ${title}`);
  });
}

/**
 * T029: Show subtask progress indicator
 * @param {{completed: number, total: number, percentage: number}} progress
 * @returns {string} Formatted progress string like "[2/5]"
 */
export function showSubtaskProgress(progress) {
  if (!progress || progress.total === 0) {
    return '';
  }

  const { completed, total, percentage } = progress;

  let color;
  if (percentage === 100) {
    color = chalk.green;
  } else if (percentage >= 50) {
    color = chalk.yellow;
  } else {
    color = chalk.gray;
  }

  return color(`[${completed}/${total}]`);
}

// ==================== Phase 4: Timer Display Functions ====================

/**
 * T041: Show active timer status
 * @param {string} taskTitle - Title of task being timed
 * @param {number} elapsedMs - Elapsed time in milliseconds
 */
export function showActiveTimer(taskTitle, elapsedMs) {
  const duration = formatDuration(elapsedMs);
  console.log(chalk.cyan(`⏱️  Timing: "${taskTitle}" - ${duration}`));
}

/**
 * T042: Show task's total tracked time
 * @param {number} totalTimeMs - Total time in milliseconds
 * @returns {string} Formatted time string
 */
export function showTaskTime(totalTimeMs) {
  if (!totalTimeMs || totalTimeMs === 0) {
    return '';
  }
  return chalk.gray(`⏱ ${formatDuration(totalTimeMs)}`);
}

// ==================== Phase 4: Pomodoro Display Functions ====================

/**
 * T056: Show Pomodoro status with countdown
 * @param {{active: boolean, type: string, remainingMs: number}} state
 */
export function showPomodoroStatus(state) {
  if (!state.active) {
    console.log(chalk.dim('  No Pomodoro active'));
    return;
  }

  const minutes = Math.floor(state.remainingMs / 60000);
  const seconds = Math.floor((state.remainingMs % 60000) / 1000);
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  if (state.type === 'work') {
    console.log(chalk.red(`🍅 Work: ${timeStr} remaining`));
  } else if (state.type === 'break') {
    console.log(chalk.green(`☕ Break: ${timeStr} remaining`));
  }
}

/**
 * T057: Show today's Pomodoro count with tomato icons
 * @param {number} count - Completed Pomodoros today
 */
export function showPomodoroCount(count) {
  if (count === 0) {
    console.log(chalk.dim('  No Pomodoros completed today'));
    return;
  }

  const tomatoes = '🍅'.repeat(Math.min(count, 10));
  const extra = count > 10 ? ` +${count - 10}` : '';
  console.log(`${tomatoes}${extra} ${count} Pomodoro${count !== 1 ? 's' : ''} today`);
}

// ==================== Phase 4: Keyboard Shortcut Display ====================

/**
 * T066: Show keyboard shortcut help overlay
 * @param {Array<{key: string, description: string}>} shortcuts
 */
export function showShortcutHelp(shortcuts) {
  showHeader('Keyboard Shortcuts');

  if (shortcuts.length === 0) {
    console.log(chalk.dim('  No shortcuts registered'));
    showDivider();
    return;
  }

  const maxKeyLen = Math.max(...shortcuts.map(s => s.key.length));

  shortcuts.forEach(shortcut => {
    const keyStr = chalk.cyan(shortcut.key.toUpperCase().padEnd(maxKeyLen + 2));
    console.log(`  ${keyStr} ${shortcut.description}`);
  });

  console.log();
  console.log(chalk.dim('  Press any key to close'));
  showDivider();
}

// ==================== Phase 5: Collaboration Display Functions ====================

/**
 * Show updated main menu with collaboration options (14-18)
 */
export function showCollaborationMenu() {
  showHeader('TODO APP - Collaboration Menu');
  console.log('  14. 📎 Share List');
  console.log('  15. 💬 View Comments');
  console.log('  16. 📌 Assign Task');
  console.log('  17. 📊 Team Dashboard');
  console.log('  18. 🤝 Join Shared List');
  console.log();
  showDivider();
}

/**
 * Show task with collaboration information
 * @param {Object} task - Task object with collaboration fields
 * @param {boolean} showDescription - Whether to show description
 */
export function showTaskWithCollaboration(task, showDescription = true) {
  // First show the basic task
  showTask(task, showDescription);

  // Add collaboration information
  if (task.assignedTo && task.assignedTo.length > 0) {
    console.log(chalk.magenta(`      Assigned to: ${task.assignedTo.join(', ')}`));
  }

  if (task.comments && task.comments.length > 0) {
    console.log(chalk.cyan(`      Comments: ${task.comments.length}`));
  }

  if (task.sharedListId) {
    console.log(chalk.blue(`      Shared List ID: ${task.sharedListId.substring(0, 6)}...`));
  }
}

/**
 * Show task list with collaboration information
 * @param {Array} tasks - Array of tasks with collaboration fields
 */
export function showTaskListWithCollaboration(tasks) {
  showHeader(`Your Tasks (${tasks.length}) - With Collaboration`);

  if (tasks.length === 0) {
    showEmptyState('No tasks found. Add your first task!');
    return;
  }

  // Show overdue banner
  const overdueCount = countOverdueTasks(tasks);
  showOverdueBanner(overdueCount);

  // Show upcoming reminders
  const dueSoonTasks = getTasksDueSoon(tasks);
  showUpcomingReminders(dueSoonTasks);

  tasks.forEach(task => {
    showTaskWithCollaboration(task, true);
    console.log();
  });

  showDivider();
}

/**
 * Show shared list information
 * @param {Object} list - Shared list object
 */
export function showSharedList(list) {
  showHeader(`Shared List: ${list.name}`);

  console.log(chalk.cyan(`ID: ${list.id.substring(0, 8)}...`));
  console.log(chalk.magenta(`Owner: ${list.ownerId}`));
  console.log(chalk.dim(`Created: ${list.createdAt}`));
  console.log(chalk.dim(`Updated: ${list.updatedAt || list.createdAt}`));

  if (list.permissions) {
    console.log(chalk.yellow('Permissions:'));
    Object.entries(list.permissions).forEach(([userId, role]) => {
      console.log(`  - ${userId}: ${role}`);
    });
  }

  console.log();
  showDivider();
}

/**
 * Show comments for a task
 * @param {Array} comments - Array of comment objects
 */
export function showComments(comments) {
  if (!comments || comments.length === 0) {
    console.log(chalk.dim('  No comments yet.'));
    return;
  }

  showHeader(`Comments (${comments.length})`);

  comments.forEach(comment => {
    const author = comment.authorId || 'Unknown';
    const date = new Date(comment.createdAt).toLocaleString();
    console.log(chalk.cyan(`@${author} - ${date}`));
    console.log(`  ${comment.content}`);

    if (comment.mentions && comment.mentions.length > 0) {
      console.log(chalk.yellow(`  📌 Mentions: ${comment.mentions.join(', ')}`));
    }

    if (comment.resolved) {
      console.log(chalk.green('  ✅ Resolved'));
    }

    console.log();
  });

  showDivider();
}

/**
 * Show assignments for a task
 * @param {Array} assignments - Array of assignment objects
 */
export function showAssignments(assignments) {
  if (!assignments || assignments.length === 0) {
    console.log(chalk.dim('  No assignments yet.'));
    return;
  }

  showHeader(`Assignments (${assignments.length})`);

  assignments.forEach(assignment => {
    console.log(chalk.cyan(`Assigned to: ${assignment.assignedTo}`));
    console.log(`  Status: ${assignment.status}`);

    if (assignment.dueDate) {
      console.log(`  Due: ${new Date(assignment.dueDate).toLocaleDateString()}`);
    }

    if (assignment.priority) {
      console.log(`  Priority: ${assignment.priority}`);
    }

    console.log();
  });

  showDivider();
}

/**
 * Show dashboard metrics
 * @param {Object} metrics - Dashboard metrics object
 */
export function showDashboardMetrics(metrics) {
  showHeader('Team Dashboard');

  const overviewTable = new Table({
    head: [chalk.bold('Overview Metric'), chalk.bold('Value')],
    colWidths: [20, 15],
    style: { border: ['cyan'] }
  });

  overviewTable.push(
    ['Total Tasks', metrics.totalTasks],
    ['Completed', chalk.green(metrics.completedTasks)],
    ['Pending', chalk.yellow(metrics.pendingTasks)],
    ['Rate', `${metrics.completionRate.toFixed(1)}%`],
    ['Overdue', chalk.red(metrics.overdueTasks)]
  );

  const priorityTable = new Table({
    head: [chalk.bold('Priority'), chalk.bold('Count')],
    colWidths: [15, 10],
    style: { border: ['yellow'] }
  });

  priorityTable.push(
    ['High', metrics.tasksByPriority.high],
    ['Medium', metrics.tasksByPriority.medium],
    ['Low', metrics.tasksByPriority.low],
    ['None', metrics.tasksByPriority.none]
  );

  console.log(chalk.bold(' 📊 SUMMARY STATISTICS'));
  console.log(overviewTable.toString());
  console.log(chalk.bold(' 📈 BY PRIORITY'));
  console.log(priorityTable.toString());

  if (Object.keys(metrics.tasksByAssignee).length > 0) {
    const assigneeTable = new Table({
      head: [chalk.bold('Assignee'), chalk.bold('Tasks')],
      colWidths: [25, 10],
      style: { border: ['magenta'] }
    });

    Object.entries(metrics.tasksByAssignee).forEach(([userId, count]) => {
      assigneeTable.push([userId, count]);
    });

    console.log(chalk.bold(' 👥 BY ASSIGNEE'));
    console.log(assigneeTable.toString());
  }

  console.log();
}

/**
 * Show share link information
 * @param {Object} shareLink - Share link object
 */
export function showShareLink(shareLink) {
  showHeader('Share Link Created');

  console.log(chalk.green(`📋 Link ID: ${shareLink.id}`));
  console.log(`  Access: ${shareLink.accessType}`);
  console.log(`  Permissions: ${shareLink.permissions}`);
  console.log(`  Created: ${new Date(shareLink.createdAt).toLocaleString()}`);

  if (shareLink.expiresAt) {
    console.log(`  Expires: ${new Date(shareLink.expiresAt).toLocaleString()}`);
  }

  console.log();
  console.log(chalk.cyan(`🔗 Shareable URL: ${shareLink.getShareableUrl() || 'Not available'}`));

  showDivider();
}

/**
 * Show user assignments
 * @param {Array} assignments - Array of user assignments
 */
export function showUserAssignments(assignments) {
  if (!assignments || assignments.length === 0) {
    console.log(chalk.dim('  No assignments for you.'));
    return;
  }

  showHeader(`Your Assignments (${assignments.length})`);

  assignments.forEach(assignment => {
    console.log(chalk.cyan(`Task: ${assignment.taskId.substring(0, 6)}...`));
    console.log(`  Status: ${assignment.status}`);
    console.log(`  Assigned by: ${assignment.assignedBy}`);

    if (assignment.dueDate) {
      console.log(`  Due: ${new Date(assignment.dueDate).toLocaleDateString()}`);
    }

    if (assignment.priority) {
      console.log(`  Priority: ${assignment.priority}`);
    }

    console.log();
  });

  showDivider();
}

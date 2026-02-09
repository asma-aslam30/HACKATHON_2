#!/usr/bin/env node

import taskService from './taskService.js';
import * as display from './display.js';
import * as prompts from './prompts.js';
import {
  initNotifications,
  rescheduleNotification,
  cancelNotification,
  cancelAllNotifications,
  checkNotificationSupport
} from './notificationService.js';
import {
  analyzeTitleForDateSuggestion,
  shouldShowSuggestion
} from './suggestionService.js';
// Phase 4: Power User Enhancements imports
import * as templateService from './templateService.js';
import * as timerService from './timerService.js';
import * as keyboardService from './keyboardService.js';
// Phase 5: Collaboration Features imports
import collaborationService from './collaborationService.js';
import * as commentService from './commentService.js';
import dashboardService from './dashboardService.js';
import dataService from './dataService.js';

/**
 * Main entry point - Todo CLI Application
 * Extended with organization features (Phase 2)
 */

// T039: View state for filter and sort
let viewState = {
  activeFilter: null,
  activeSort: 'manual',
  searchQuery: null
};

/**
 * Handle Add Task (Menu Option 1)
 * T047: Reschedule notification on task create
 * T054/T055: Smart suggestion integration
 */
async function handleAddTask() {
  try {
    const input = await prompts.getNewTaskInput();
    const task = taskService.createTask(input);
    display.showSuccess('Task added successfully!');
    display.showTaskDetails(task);

    // T047: Schedule notification if task has due date
    if (task.dueDate && task.reminderEnabled) {
      rescheduleNotification(task);
    }

    // T054/T055: Check for smart suggestions if no due date was set
    if (!task.dueDate && shouldShowSuggestion(task)) {
      const suggestion = analyzeTitleForDateSuggestion(task.title);
      if (suggestion) {
        const response = await prompts.promptSuggestionResponse(suggestion);

        if (response.action === 'accept' && response.dueDate) {
          const updatedTask = taskService.setDueDate(task.id, response.dueDate, 'none');
          if (updatedTask) {
            display.showSuccess('Due date set from suggestion!');
            rescheduleNotification(updatedTask);
          }
        } else if (response.action === 'custom' && response.dueDate) {
          const updatedTask = taskService.setDueDate(
            task.id,
            response.dueDate,
            response.recurrencePattern || 'none'
          );
          if (updatedTask) {
            display.showSuccess('Due date set!');
            rescheduleNotification(updatedTask);
          }
        } else if (response.action === 'dismiss') {
          taskService.dismissSuggestion(task.id);
        }
      }
    }
  } catch (error) {
    display.showError(error.message);
  }
}

/**
 * Handle List Tasks (Menu Option 2)
 * T043, T052: Updated to apply filter and sort
 */
function handleListTasks() {
  let tasks = taskService.getAllTasks();

  // T043: Apply filter if active
  if (viewState.activeFilter && viewState.activeFilter.type !== 'clear') {
    tasks = taskService.filterTasks(viewState.activeFilter);

    // T070: Handle invalid filter (tag doesn't exist anymore)
    if (viewState.activeFilter.type === 'tag') {
      const allTags = taskService.getAllTags();
      const tagExists = allTags.some(t => t.name === viewState.activeFilter.value);
      if (!tagExists) {
        viewState.activeFilter = null;
        tasks = taskService.getAllTasks();
        display.showInfo('Filter cleared - tag no longer exists');
      }
    }
  }

  // T052: Apply sort
  tasks = taskService.sortTasks(tasks, viewState.activeSort);

  // Show header with filter/sort indicators
  const filterIndicator = display.showFilterHeader(viewState.activeFilter);
  const sortIndicator = display.showSortHeader(viewState.activeSort);
  const indicators = [filterIndicator, sortIndicator].filter(Boolean).join(' ');

  if (indicators) {
    console.log('\n' + indicators);
  }

  display.showTaskList(tasks);
}

/**
 * Handle Toggle Complete (Menu Option 3)
 * T033/T035: Updated to handle recurring tasks
 */
async function handleToggleTask() {
  const tasks = taskService.getAllTasks();

  if (!taskService.hasAnyTasks()) {
    display.showInfo('No tasks to toggle. Add some tasks first!');
    return;
  }

  const taskId = await prompts.selectTaskForToggle(tasks);

  if (!taskId) {
    return; // User selected back to menu
  }

  const result = taskService.toggleTask(taskId);

  if (result) {
    const { completedTask, newTask } = result;
    const statusText = completedTask.completed ? 'complete' : 'pending';
    display.showSuccess(`Task marked as ${statusText}!`);
    display.showTaskDetails(completedTask);

    // T047: Cancel notification if completed, reschedule if uncompleted
    if (completedTask.completed) {
      cancelNotification(completedTask.id);
    } else {
      rescheduleNotification(completedTask);
    }

    // T035: Show recurring task creation message
    if (newTask) {
      display.showRecurringTaskCreated(newTask);
      // T047: Schedule notification for the new recurring task
      rescheduleNotification(newTask);
    }
  } else {
    display.showError('Task not found.');
  }
}

/**
 * Handle Delete Task (Menu Option 4)
 */
async function handleDeleteTask() {
  const tasks = taskService.getAllTasks();

  if (!taskService.hasAnyTasks()) {
    display.showInfo('No tasks to delete.');
    return;
  }

  const taskId = await prompts.selectTaskForDelete(tasks);

  if (!taskId) {
    return; // User selected back to menu
  }

  // Get task details before deletion for display
  const task = taskService.getTaskById(taskId);
  const deleted = taskService.deleteTask(taskId);

  if (deleted) {
    // T047: Cancel any pending notification for deleted task
    cancelNotification(taskId);

    display.showSuccess('Task deleted!');
    if (task) {
      display.showTaskDetails(task);
    }
  } else {
    display.showError('Task not found.');
  }
}

/**
 * Handle Update Task (Menu Option 5)
 * T031: Extended with subtask management
 */
async function handleUpdateTask() {
  const tasks = taskService.getAllTasks();

  if (!taskService.hasAnyTasks()) {
    display.showInfo('No tasks to update. Add some tasks first!');
    return;
  }

  const taskId = await prompts.selectTaskForUpdate(tasks);

  if (!taskId) {
    return; // User selected back to menu
  }

  const currentTask = taskService.getTaskById(taskId);

  if (!currentTask) {
    display.showError('Task not found.');
    return;
  }

  // T031: Show subtask management option
  const { manageSubtasks } = await prompts.inquirer.prompt([
    {
      type: 'confirm',
      name: 'manageSubtasks',
      message: 'Manage subtasks?',
      default: false
    }
  ]);

  if (manageSubtasks) {
    await handleSubtaskManagement(taskId);
    return;
  }

  const updateInput = await prompts.getUpdateInput(currentTask);

  // Check if any changes were made
  if (Object.keys(updateInput).length === 0) {
    display.showInfo('No changes made.');
    return;
  }

  try {
    const updatedTask = taskService.updateTask(taskId, updateInput);

    if (updatedTask) {
      display.showSuccess('Task updated!');
      display.showTaskDetails(updatedTask);

      // T047: Reschedule notification on task update
      rescheduleNotification(updatedTask);
    } else {
      display.showError('Task not found.');
    }
  } catch (error) {
    display.showError(error.message);
  }
}

/**
 * T031: Handle subtask management for a task
 */
async function handleSubtaskManagement(taskId) {
  while (true) {
    const task = taskService.getTaskById(taskId);
    if (!task) {
      display.showError('Task not found.');
      return;
    }

    // Show current subtasks
    if (task.subtasks.length > 0) {
      console.log();
      console.log(`Subtasks for "${task.title}":`);
      display.showSubtasks(task.subtasks);
      const progress = taskService.getSubtaskProgress(taskId);
      console.log(display.showSubtaskProgress(progress));
      console.log();
    } else {
      display.showInfo('No subtasks yet.');
    }

    const action = await prompts.getSubtaskAction();

    if (action === null) {
      return; // Back to task update
    }

    switch (action) {
      case 'add': {
        try {
          const title = await prompts.getSubtaskTitle();
          const subtask = taskService.addSubtask(taskId, title);
          if (subtask) {
            display.showSuccess('Subtask added!');
          }
        } catch (error) {
          display.showError(error.message);
        }
        break;
      }
      case 'toggle': {
        if (task.subtasks.length === 0) {
          display.showInfo('No subtasks to toggle.');
          break;
        }
        const subtaskId = await prompts.selectSubtask(task.subtasks);
        if (subtaskId) {
          const toggled = taskService.toggleSubtask(taskId, subtaskId);
          if (toggled) {
            const status = toggled.completed ? 'complete' : 'pending';
            display.showSuccess(`Subtask marked as ${status}!`);
          }
        }
        break;
      }
      case 'delete': {
        if (task.subtasks.length === 0) {
          display.showInfo('No subtasks to delete.');
          break;
        }
        const subtaskId = await prompts.selectSubtask(task.subtasks);
        if (subtaskId) {
          const deleted = taskService.deleteSubtask(taskId, subtaskId);
          if (deleted) {
            display.showSuccess('Subtask deleted!');
          }
        }
        break;
      }
    }
  }
}

/**
 * T034: Handle Search Tasks (Menu Option 6)
 */
async function handleSearch() {
  const query = await prompts.getSearchQuery();

  if (!query) {
    display.showInfo('No search query entered.');
    return;
  }

  const results = taskService.searchTasks(query);
  display.showSearchResults(results, query);

  // Wait for user to press Enter
  await prompts.getSearchQuery().catch(() => {}); // Ignore errors
}

/**
 * T042: Handle Filter Tasks (Menu Option 7)
 */
async function handleFilter() {
  const usedTags = taskService.getUsedTags();
  const filter = await prompts.getFilterChoice(usedTags);

  if (filter === null) {
    return; // Back to menu
  }

  if (filter.type === 'clear') {
    viewState.activeFilter = null;
    display.showSuccess('Filter cleared');
  } else {
    viewState.activeFilter = filter;
    display.showSuccess(`Filter applied: ${filter.type} = ${filter.value}`);
  }
}

/**
 * T051: Handle Sort Tasks (Menu Option 8)
 */
async function handleSort() {
  const sortType = await prompts.getSortChoice();

  if (sortType === null) {
    return; // Back to menu
  }

  viewState.activeSort = sortType;
  display.showSuccess(`Sort applied: ${sortType}`);
}

/**
 * T062: Handle Reorder Tasks (Menu Option 9)
 */
async function handleReorder() {
  if (!taskService.hasAnyTasks()) {
    display.showInfo('No tasks to reorder.');
    return;
  }

  // T064: Warn if sort is active
  if (viewState.activeSort !== 'manual') {
    display.showInfo('Switching to manual order mode...');
    viewState.activeSort = 'manual';
  }

  const tasks = taskService.sortTasks(taskService.getAllTasks(), 'manual');
  const choice = await prompts.getReorderChoice(tasks);

  if (!choice) {
    return; // Cancelled
  }

  const { taskId, action } = choice;
  let success = false;

  if (action === 'up') {
    success = taskService.moveTaskUp(taskId);
    if (success) {
      display.showSuccess('Task moved up');
    } else {
      display.showInfo('Task is already at the top');
    }
  } else if (action === 'down') {
    success = taskService.moveTaskDown(taskId);
    if (success) {
      display.showSuccess('Task moved down');
    } else {
      display.showInfo('Task is already at the bottom');
    }
  } else if (action === 'position') {
    const max = tasks.length;
    const newPosition = await prompts.getNewPosition(max);
    success = taskService.moveTaskTo(taskId, newPosition);
    if (success) {
      display.showSuccess(`Task moved to position ${newPosition + 1}`);
    } else {
      display.showError('Failed to move task');
    }
  }
}

/**
 * T067: Handle Exit (Menu Option 10)
 */
function handleExit() {
  // T046: Cleanup timers on exit
  timerService.cleanup();
  display.showGoodbye();
  process.exit(0);
}

// ==================== Phase 4: Handler Functions ====================

/**
 * T018, T019: Handle Templates (Menu Option 11)
 */
async function handleTemplates() {
  while (true) {
    const choice = await prompts.getTemplateSubmenuChoice();

    if (choice === null) {
      return; // Back to main menu
    }

    switch (choice) {
      case 'create': {
        try {
          const input = await prompts.getTemplateInput();
          const template = templateService.createTemplate(input);
          display.showSuccess('Template created!');
          display.showTemplateDetails(template);
        } catch (error) {
          display.showError(error.message);
        }
        break;
      }
      case 'list': {
        const templates = templateService.getAllTemplates();
        display.showTemplateList(templates);
        break;
      }
      case 'edit': {
        const templates = templateService.getAllTemplates();
        if (templates.length === 0) {
          display.showInfo('No templates to edit.');
          break;
        }
        const templateId = await prompts.selectTemplate(templates);
        if (!templateId) break;

        const template = templateService.getTemplateById(templateId);
        display.showTemplateDetails(template);

        const input = await prompts.getTemplateInput(template);
        try {
          const updated = templateService.updateTemplate(templateId, input);
          if (updated) {
            display.showSuccess('Template updated!');
            display.showTemplateDetails(updated);
          }
        } catch (error) {
          display.showError(error.message);
        }
        break;
      }
      case 'delete': {
        const templates = templateService.getAllTemplates();
        if (templates.length === 0) {
          display.showInfo('No templates to delete.');
          break;
        }
        const templateId = await prompts.selectTemplate(templates);
        if (!templateId) break;

        const deleted = templateService.deleteTemplate(templateId);
        if (deleted) {
          display.showSuccess('Template deleted!');
        } else {
          display.showError('Template not found.');
        }
        break;
      }
      case 'use': {
        const templates = templateService.getAllTemplates();
        if (templates.length === 0) {
          display.showInfo('No templates available. Create one first!');
          break;
        }
        const templateId = await prompts.selectTemplate(templates);
        if (!templateId) break;

        const taskInput = templateService.createTaskFromTemplate(templateId);
        if (!taskInput) {
          display.showError('Template not found.');
          break;
        }

        // Let user modify the task before creating
        display.showInfo('Creating task from template. You can modify the values:');
        const modifiedInput = await prompts.getNewTaskInput();

        // Merge template values with user modifications
        const finalInput = {
          ...taskInput,
          title: modifiedInput.title || taskInput.title,
          description: modifiedInput.description || taskInput.description,
          priority: modifiedInput.priority || taskInput.priority,
          tags: modifiedInput.tags.length > 0 ? modifiedInput.tags : taskInput.tags,
          dueDate: modifiedInput.dueDate,
          recurrencePattern: modifiedInput.recurrencePattern || taskInput.recurrencePattern
        };

        const task = taskService.createTask(finalInput);

        // Add default subtasks from template
        if (taskInput.defaultSubtasks && taskInput.defaultSubtasks.length > 0) {
          for (const subtaskTitle of taskInput.defaultSubtasks) {
            taskService.addSubtask(task.id, subtaskTitle);
          }
        }

        display.showSuccess('Task created from template!');
        display.showTaskDetails(task);

        // Schedule notification if task has due date
        if (task.dueDate && task.reminderEnabled) {
          rescheduleNotification(task);
        }
        break;
      }
    }
  }
}

/**
 * T020: Extend handleAddTask to offer "Create from template" option
 */
async function handleAddTaskWithTemplate() {
  const templates = templateService.getAllTemplates();

  // If templates exist, offer to use one
  if (templates.length > 0) {
    const useTemplate = await prompts.askCreateFromTemplate();
    if (useTemplate) {
      const templateId = await prompts.selectTemplate(templates);
      if (templateId) {
        const taskInput = templateService.createTaskFromTemplate(templateId);
        if (taskInput) {
          // Create task with template values
          const task = taskService.createTask(taskInput);

          // Add default subtasks from template
          if (taskInput.defaultSubtasks && taskInput.defaultSubtasks.length > 0) {
            for (const subtaskTitle of taskInput.defaultSubtasks) {
              taskService.addSubtask(task.id, subtaskTitle);
            }
          }

          display.showSuccess('Task created from template!');
          display.showTaskDetails(task);

          if (task.dueDate && task.reminderEnabled) {
            rescheduleNotification(task);
          }
          return;
        }
      }
      // User cancelled template selection, fall through to normal add
    }
  }

  // Normal task creation
  await handleAddTask();
}

/**
 * T043, T044: Handle Timer (Menu Option 12)
 */
async function handleTimer() {
  const activeTimer = timerService.getActiveTimer();

  if (activeTimer && activeTimer.type === 'task') {
    // Timer is running - offer to stop
    const task = taskService.getTaskById(activeTimer.taskId);
    const elapsed = timerService.getElapsedTime();

    display.showActiveTimer(task?.title || 'Unknown task', elapsed);

    const { action } = await prompts.inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Timer is running:',
        choices: [
          { name: '⏹️  Stop Timer', value: 'stop' },
          { name: '← Back', value: null }
        ]
      }
    ]);

    if (action === 'stop') {
      const result = timerService.stopTimer();
      if (result.success) {
        display.showSuccess(`Timer stopped! Tracked: ${display.formatDuration(result.durationMs)}`);
      } else {
        display.showError(result.error);
      }
    }
  } else {
    // No timer running - offer to start
    const tasks = taskService.getAllTasks();
    const taskId = await prompts.selectTaskForTimer(tasks);

    if (taskId) {
      const result = timerService.startTimer(taskId);
      if (result.success) {
        const task = taskService.getTaskById(taskId);
        display.showSuccess(`Timer started for "${task.title}"`);
      } else {
        display.showError(result.error);
      }
    }
  }
}

/**
 * T059, T060: Handle Pomodoro (Menu Option 13)
 */
async function handlePomodoro() {
  while (true) {
    const choice = await prompts.getPomodoroSubmenuChoice();

    if (choice === null) {
      return; // Back to main menu
    }

    switch (choice) {
      case 'start': {
        const state = timerService.getPomodoroState();
        if (state.active) {
          display.showInfo('Pomodoro already running.');
          display.showPomodoroStatus(state);
          break;
        }

        // Optionally link to a task
        const tasks = taskService.getAllTasks();
        let taskId = null;

        if (tasks.filter(t => !t.completed).length > 0) {
          const { linkTask } = await prompts.inquirer.prompt([
            {
              type: 'confirm',
              name: 'linkTask',
              message: 'Link Pomodoro to a task?',
              default: false
            }
          ]);

          if (linkTask) {
            taskId = await prompts.selectTaskForTimer(tasks);
          }
        }

        const result = timerService.startPomodoro(taskId);
        if (result.success) {
          const config = timerService.getPomodoroConfig();
          display.showSuccess(`Pomodoro started! ${config.workDurationMinutes} minute work session.`);
        } else {
          display.showError(result.error);
        }
        break;
      }
      case 'cancel': {
        const cancelled = timerService.cancelPomodoro();
        if (cancelled) {
          display.showSuccess('Pomodoro cancelled.');
        } else {
          display.showInfo('No Pomodoro active.');
        }
        break;
      }
      case 'settings': {
        const current = timerService.getPomodoroConfig();
        const newConfig = await prompts.getPomodoroConfigInput(current);
        try {
          timerService.updatePomodoroConfig(newConfig);
          display.showSuccess('Pomodoro settings updated!');
        } catch (error) {
          display.showError(error.message);
        }
        break;
      }
      case 'stats': {
        display.showHeader('Pomodoro Stats');
        const count = timerService.getTodayPomodoroCount();
        display.showPomodoroCount(count);
        const state = timerService.getPomodoroState();
        if (state.active) {
          console.log();
          display.showPomodoroStatus(state);
        }
        display.showDivider();
        break;
      }
    }
  }
}

// ==================== Phase 5: Collaboration Handler Functions ====================

/**
 * Handle Share List (Menu Option 14)
 */
async function handleShareList() {
  try {
    // Get available shared lists for the user
    const sharedLists = await dataService.getUserSharedLists('current_user'); // In a real implementation, we'd have a proper user ID
    if (sharedLists.length === 0) {
      display.showInfo('No shared lists available. Create a list first or enable collaboration for your tasks.');
      return;
    }

    // Select a list to share
    const listId = await prompts.selectSharedList(sharedLists);
    if (!listId) {
      return; // User cancelled
    }

    // Get sharing options
    const options = await prompts.getShareListOptions();

    // Generate share link
    const shareLink = await collaborationService.generateShareLink(
      listId,
      options.accessType,
      options.permissions,
      'current_user' // In a real implementation, this would be the actual user ID
    );

    // Display the share link
    display.showShareLink(shareLink);
  } catch (error) {
    display.showError(`Error sharing list: ${error.message}`);
  }
}

/**
 * Handle View Comments (Menu Option 15)
 */
async function handleViewComments() {
  try {
    // Get available shared lists for the user
    const sharedLists = await dataService.getUserSharedLists('current_user');
    if (sharedLists.length === 0) {
      display.showInfo('No shared lists available. Join or create a shared list first.');
      return;
    }

    // Select a shared list
    const listId = await prompts.selectSharedList(sharedLists);
    if (!listId) {
      return; // User cancelled
    }

    // Get tasks in the selected list
    const tasks = await dataService.getSharedListTasks(listId);
    if (tasks.length === 0) {
      display.showInfo('No tasks in this list.');
      return;
    }

    // Select a task to view comments
    const taskId = await prompts.selectTaskFromSharedList(tasks);
    if (!taskId) {
      return; // User cancelled
    }

    // Get comments for the selected task
    const comments = await commentService.getCommentsForTask(taskId);
    display.showComments(comments);
  } catch (error) {
    display.showError(`Error viewing comments: ${error.message}`);
  }
}

/**
 * Handle Assign Task (Menu Option 16)
 */
async function handleAssignTask() {
  try {
    // Get available shared lists for the user
    const sharedLists = await dataService.getUserSharedLists('current_user');
    if (sharedLists.length === 0) {
      display.showInfo('No shared lists available. Join or create a shared list first.');
      return;
    }

    // Select a shared list
    const listId = await prompts.selectSharedList(sharedLists);
    if (!listId) {
      return; // User cancelled
    }

    // Get tasks in the selected list
    const tasks = await dataService.getSharedListTasks(listId);
    if (tasks.length === 0) {
      display.showInfo('No tasks in this list.');
      return;
    }

    // Select a task to assign
    const taskId = await prompts.selectTaskFromSharedList(tasks);
    if (!taskId) {
      return; // User cancelled
    }

    // Get user to assign
    const userId = await prompts.getUserForAssignment();
    if (!userId) {
      display.showInfo('No user ID provided.');
      return;
    }

    // Get assignment details
    const assignmentDetails = await prompts.getAssignmentDetails();

    // Create the assignment
    const assignments = await collaborationService.createAssignment(
      taskId,
      [userId],
      'current_user', // assignedBy
      assignmentDetails
    );

    if (assignments && assignments.length > 0) {
      display.showSuccess(`Task assigned to ${userId}!`);
    } else {
      display.showError('Failed to create assignment.');
    }
  } catch (error) {
    display.showError(`Error assigning task: ${error.message}`);
  }
}

/**
 * Handle Team Dashboard (Menu Option 17)
 */
async function handleTeamDashboard() {
  try {
    // Get available shared lists for the user
    const sharedLists = await dataService.getUserSharedLists('current_user');
    if (sharedLists.length === 0) {
      display.showInfo('No shared lists available. Join or create a shared list first.');
      return;
    }

    // Select a shared list
    const listId = await prompts.selectSharedList(sharedLists);
    if (!listId) {
      return; // User cancelled
    }

    // Get dashboard view type
    const viewType = await prompts.getDashboardView();

    // Get dashboard data
    const dashboardData = await dashboardService.getDashboardData(listId, 'current_user');

    // Display based on view type
    switch (viewType) {
      case 'overview':
        display.showDashboardMetrics(dashboardData.metrics);
        break;
      case 'progress':
        // Show progress-specific metrics
        display.showHeader('Team Progress');
        console.log(chalk.bold('📈 Progress Overview:'));
        console.log(`  Completion Rate: ${dashboardData.metrics.completionRate.toFixed(2)}%`);
        console.log(`  Completed: ${dashboardData.metrics.completedTasks}`);
        console.log(`  Pending: ${dashboardData.metrics.pendingTasks}`);
        console.log();
        display.showDivider();
        break;
      case 'analytics':
        // Get and show analytics data
        const analytics = await dashboardService.getAnalyticsData(listId, 'current_user');
        display.showHeader('Team Analytics');
        console.log(chalk.bold('📊 Analytics:'));
        console.log(`  Tasks completed this week: ${analytics.productivityMetrics.completedLastWeek}`);
        console.log(`  Tasks completed this month: ${analytics.productivityMetrics.completedLastMonth}`);
        console.log(`  Average completion time: ${analytics.productivityMetrics.avgCompletionTime.toFixed(2)} hours`);
        console.log();
        display.showDivider();
        break;
    }
  } catch (error) {
    display.showError(`Error showing dashboard: ${error.message}`);
  }
}

/**
 * Handle Join Shared List (Menu Option 18)
 */
async function handleJoinSharedList() {
  try {
    // Get share link from user
    const linkId = await prompts.getShareLink();
    if (!linkId) {
      display.showInfo('No link ID provided.');
      return;
    }

    // Join the shared list
    const result = await collaborationService.joinSharedList(linkId, 'current_user');

    if (result) {
      display.showSuccess('Successfully joined shared list!');
      display.showSharedList(result);
    } else {
      display.showError('Failed to join shared list. The link may be invalid or expired.');
    }
  } catch (error) {
    display.showError(`Error joining shared list: ${error.message}`);
  }
}

/**
 * Main menu loop
 * Updated to handle options 1-18 (Phase 5 Collaboration Features)
 */
async function mainLoop() {
  while (true) {
    display.showMainMenu();

    try {
      // Use the updated menu choice function that supports options 1-18
      const choice = await prompts.getUpdatedMenuChoice();

      switch (choice) {
        case 1:
          await handleAddTaskWithTemplate(); // T020: Extended with template option
          break;
        case 2:
          handleListTasks();
          break;
        case 3:
          await handleToggleTask();
          break;
        case 4:
          await handleDeleteTask();
          break;
        case 5:
          await handleUpdateTask();
          break;
        case 6:
          await handleSearch();
          break;
        case 7:
          await handleFilter();
          break;
        case 8:
          await handleSort();
          break;
        case 9:
          await handleReorder();
          break;
        case 10:
          await handleTemplates();
          break;
        case 11:
          await handleTimer();
          break;
        case 12:
          await handlePomodoro();
          break;
        // Phase 5: Collaboration Features
        case 13:
          await handleShareList();
          break;
        case 14:
          await handleViewComments();
          break;
        case 15:
          await handleAssignTask();
          break;
        case 16:
          await handleTeamDashboard();
          break;
        case 17:
          await handleJoinSharedList();
          break;
        case 18:
          handleExit();
          break;
        default:
          display.showError('Invalid option. Please enter 1-18.');
      }
    } catch (error) {
      if (error.name === 'ExitPromptError') {
        // User pressed Ctrl+C during prompt
        handleExit();
      } else {
        display.showError(`An error occurred: ${error.message}`);
      }
    }
  }
}

/**
 * Handle graceful exit on Ctrl+C
 * T047: Cancel all pending notifications on exit
 * T046: Auto-stop timer and save on exit
 */
process.on('SIGINT', () => {
  timerService.cleanup(); // T046: Auto-stop timer
  cancelAllNotifications();
  display.showGoodbye();
  process.exit(0);
});

process.on('SIGTERM', () => {
  timerService.cleanup(); // T046: Auto-stop timer
  cancelAllNotifications();
  display.showGoodbye();
  process.exit(0);
});

// T046: Initialize notification service and start the application
// T045: Check for timer recovery on startup
async function startApp() {
  console.clear();

  // T046: Check notification support and schedule notifications
  const notificationSupport = await checkNotificationSupport();
  if (notificationSupport) {
    const tasks = taskService.getAllTasks();
    const scheduled = initNotifications(tasks);
    if (scheduled > 0) {
      console.log(`📋 ${scheduled} reminder${scheduled !== 1 ? 's' : ''} scheduled\n`);
    }
  }

  // T045: Check for orphaned timer from previous session
  const orphanedTimer = timerService.recoverOrphanedTimer();
  if (orphanedTimer.found) {
    const action = await prompts.confirmTimerRecovery(
      orphanedTimer.taskTitle,
      orphanedTimer.elapsedMs
    );

    if (action === 'save') {
      // Stop and save the orphaned timer
      const result = timerService.stopTimer();
      if (result.success) {
        display.showSuccess(`Timer saved: ${display.formatDuration(result.durationMs)}`);
      }
    } else {
      // Discard the orphaned timer
      taskService.setActiveTimerState(null);
      display.showInfo('Timer discarded.');
    }
    console.log();
  }

  // Start main loop
  await mainLoop();
}

startApp().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});

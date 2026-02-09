import { v4 as uuidv4 } from 'uuid';
import taskService from './taskService.js';

/**
 * TemplateService - Template CRUD operations for task templates
 * Phase 4: Power User Enhancements
 */

/**
 * Get all templates from storage
 * @returns {Array} All templates sorted alphabetically by name
 */
export function getAllTemplates() {
  const templates = taskService.getTemplates();
  return templates.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

/**
 * Get a template by ID
 * @param {string} id - Template ID
 * @returns {Object|null} Template or null if not found
 */
export function getTemplateById(id) {
  const templates = taskService.getTemplates();
  return templates.find(t => t.id === id) || null;
}

/**
 * Get a template by name (case-insensitive)
 * @param {string} name - Template name
 * @returns {Object|null} Template or null if not found
 */
export function getTemplateByName(name) {
  const templates = taskService.getTemplates();
  return templates.find(t => t.name.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * Create a new template
 * @param {Object} input - Template input
 * @param {string} input.name - Template name (1-50 chars, unique)
 * @param {string} input.title - Task title pattern
 * @param {string} [input.description] - Optional description
 * @param {string} [input.priority] - Priority level
 * @param {string[]} [input.tags] - Tags to apply
 * @param {string} [input.recurrencePattern] - Recurrence pattern
 * @param {string[]} [input.defaultSubtasks] - Subtask titles to auto-create
 * @returns {Object} Created template
 * @throws {Error} If name already exists or validation fails
 */
export function createTemplate(input) {
  const name = input.name?.trim();

  if (!name || name.length === 0) {
    throw new Error('Template name is required');
  }

  if (name.length > 50) {
    throw new Error('Template name must be 50 characters or less');
  }

  // Check for name uniqueness
  if (getTemplateByName(name)) {
    throw new Error('Template name already exists');
  }

  const title = input.title?.trim();
  if (!title || title.length === 0) {
    throw new Error('Template title is required');
  }

  if (title.length > 200) {
    throw new Error('Template title must be 200 characters or less');
  }

  const now = new Date().toISOString();

  const template = {
    id: uuidv4(),
    name: name,
    createdAt: now,
    updatedAt: now,
    title: title,
    description: input.description?.trim() || '',
    priority: input.priority || 'none',
    tags: input.tags || [],
    recurrencePattern: input.recurrencePattern || 'none',
    defaultSubtasks: input.defaultSubtasks || []
  };

  // Validate tags count
  if (template.tags.length > 10) {
    throw new Error('Maximum 10 tags allowed');
  }

  // Validate default subtasks
  if (template.defaultSubtasks.length > 10) {
    throw new Error('Maximum 10 default subtasks allowed');
  }

  taskService.addTemplate(template);
  return template;
}

/**
 * Update an existing template
 * @param {string} id - Template ID
 * @param {Object} input - Partial template input
 * @returns {Object|null} Updated template or null if not found
 * @throws {Error} If new name conflicts with existing template
 */
export function updateTemplate(id, input) {
  const template = getTemplateById(id);
  if (!template) {
    return null;
  }

  // Check name uniqueness if name is being changed
  if (input.name !== undefined) {
    const newName = input.name.trim();
    if (newName.length === 0) {
      throw new Error('Template name cannot be empty');
    }
    if (newName.length > 50) {
      throw new Error('Template name must be 50 characters or less');
    }

    const existing = getTemplateByName(newName);
    if (existing && existing.id !== id) {
      throw new Error('Template name already exists');
    }
    template.name = newName;
  }

  if (input.title !== undefined) {
    const newTitle = input.title.trim();
    if (newTitle.length === 0) {
      throw new Error('Template title cannot be empty');
    }
    template.title = newTitle;
  }

  if (input.description !== undefined) {
    template.description = input.description.trim();
  }

  if (input.priority !== undefined) {
    template.priority = input.priority;
  }

  if (input.tags !== undefined) {
    if (input.tags.length > 10) {
      throw new Error('Maximum 10 tags allowed');
    }
    template.tags = input.tags;
  }

  if (input.recurrencePattern !== undefined) {
    template.recurrencePattern = input.recurrencePattern;
  }

  if (input.defaultSubtasks !== undefined) {
    if (input.defaultSubtasks.length > 10) {
      throw new Error('Maximum 10 default subtasks allowed');
    }
    template.defaultSubtasks = input.defaultSubtasks;
  }

  template.updatedAt = new Date().toISOString();

  taskService.updateTemplate(template);
  return template;
}

/**
 * Delete a template
 * @param {string} id - Template ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteTemplate(id) {
  return taskService.deleteTemplate(id);
}

/**
 * Create TaskInput object from a template
 * @param {string} templateId - Template ID
 * @returns {Object|null} TaskInput object or null if template not found
 */
export function createTaskFromTemplate(templateId) {
  const template = getTemplateById(templateId);
  if (!template) {
    return null;
  }

  return {
    title: template.title,
    description: template.description,
    priority: template.priority,
    tags: [...template.tags],
    recurrencePattern: template.recurrencePattern,
    defaultSubtasks: [...template.defaultSubtasks]
  };
}

export default {
  getAllTemplates,
  getTemplateById,
  getTemplateByName,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createTaskFromTemplate
};

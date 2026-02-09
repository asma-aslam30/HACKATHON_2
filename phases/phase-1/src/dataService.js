// phases/phase-1/src/dataService.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import databaseService from '../database/service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

class DataService {
  constructor() {
    this.databaseService = databaseService;
    this.localDataPath = TASKS_FILE;
    this.ensureDataDirectory();
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
   * Load tasks from local storage (JSON file)
   */
  loadLocalTasks() {
    try {
      if (!fs.existsSync(this.localDataPath)) {
        return { tasks: [], customTags: [], templates: [], pomodoroConfig: null, activeTimerState: null };
      }

      const data = fs.readFileSync(this.localDataPath, 'utf-8');
      const parsed = JSON.parse(data);

      // Return with defaults for missing fields
      return {
        tasks: parsed.tasks || [],
        customTags: parsed.customTags || [],
        templates: parsed.templates || [],
        pomodoroConfig: parsed.pomodoroConfig || null,
        activeTimerState: parsed.activeTimerState || null,
        // Add collaboration-specific fields if they don't exist
        sharedListLinks: parsed.sharedListLinks || {},
        localCollaborationCache: parsed.localCollaborationCache || {}
      };
    } catch (error) {
      console.error('Error loading local tasks:', error.message);
      // Return default structure if there's an error
      return { tasks: [], customTags: [], templates: [], pomodoroConfig: null, activeTimerState: null };
    }
  }

  /**
   * Save tasks to local storage (JSON file)
   */
  saveLocalTasks(data) {
    try {
      const content = JSON.stringify(data, null, 2);
      fs.writeFileSync(this.localDataPath, content, 'utf-8');
      return true;
    } catch (error) {
      console.error('Error saving local tasks:', error.message);
      return false;
    }
  }

  /**
   * Migrate local tasks to include collaboration fields
   */
  migrateLocalTasks(tasksData) {
    return {
      ...tasksData,
      // Phase 5 fields (Collaboration Features)
      sharedListLinks: tasksData.sharedListLinks ?? {},
      localCollaborationCache: tasksData.localCollaborationCache ?? {}
    };
  }

  /**
   * Migrate individual task to include collaboration fields
   */
  migrateTask(task) {
    return {
      ...task,
      // Phase 5 fields on tasks
      comments: task.comments ?? [],
      assignedTo: task.assignedTo ?? [],
      sharedListId: task.sharedListId ?? null,
      version: task.version ?? 1,
      lastModifiedBy: task.lastModifiedBy ?? null,
      updatedAt: task.updatedAt ?? task.createdAt
    };
  }

  /**
   * Synchronize local tasks with database when a user enables collaboration
   */
  async syncLocalToDatabase(userId, listName = "Personal Tasks") {
    try {
      // Load local tasks
      const localData = this.loadLocalTasks();

      // Migrate local tasks to include collaboration fields
      const migratedData = this.migrateLocalTasks(localData);
      const migratedTasks = migratedData.tasks.map(task => this.migrateTask(task));

      // Create a shared list for the user's personal tasks
      const sharedList = await this.databaseService.createSharedList(listName, userId, { [userId]: 'admin' });

      // Add all local tasks to the shared list
      for (const task of migratedTasks) {
        await this.databaseService.createTask({
          ...task,
          sharedListId: sharedList.id
        });
      }

      // Create initial collaboration record
      await this.databaseService.createCollaboration(sharedList.id, userId, 'owner');

      return sharedList;
    } catch (error) {
      console.error('Error syncing local tasks to database:', error);
      throw error;
    }
  }

  /**
   * Get tasks for a shared list from database
   */
  async getSharedListTasks(listId) {
    try {
      return await this.databaseService.getTasksBySharedList(listId);
    } catch (error) {
      console.error('Error getting shared list tasks:', error);
      throw error;
    }
  }

  /**
   * Get a specific task from database
   */
  async getTaskById(taskId) {
    try {
      return await this.databaseService.getTaskById(taskId);
    } catch (error) {
      console.error('Error getting task by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new task in the database
   */
  async createTask(taskData) {
    try {
      return await this.databaseService.createTask(taskData);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update a task in the database
   */
  async updateTask(taskId, updates) {
    try {
      return await this.databaseService.updateTask(taskId, updates);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Get all shared lists for a user
   */
  async getUserSharedLists(userId) {
    try {
      return await this.databaseService.getSharedListsForUser(userId);
    } catch (error) {
      console.error('Error getting user shared lists:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      return await this.databaseService.getUserById(userId);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new user in the database
   */
  async createUser(userData) {
    try {
      return await this.databaseService.createUser(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get comments for a task
   */
  async getTaskComments(taskId) {
    try {
      return await this.databaseService.getCommentsByTask(taskId);
    } catch (error) {
      console.error('Error getting task comments:', error);
      throw error;
    }
  }

  /**
   * Add a comment to a task
   */
  async addTaskComment(commentData) {
    try {
      return await this.databaseService.createComment(commentData);
    } catch (error) {
      console.error('Error adding task comment:', error);
      throw error;
    }
  }

  /**
   * Get assignments for a task
   */
  async getTaskAssignments(taskId) {
    try {
      return await this.databaseService.getAssignmentsByTask(taskId);
    } catch (error) {
      console.error('Error getting task assignments:', error);
      throw error;
    }
  }

  /**
   * Create an assignment
   */
  async createAssignment(assignmentData) {
    try {
      return await this.databaseService.createAssignment(assignmentData);
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  /**
   * Create a share link
   */
  async createShareLink(linkData) {
    try {
      return await this.databaseService.createShareLink(linkData);
    } catch (error) {
      console.error('Error creating share link:', error);
      throw error;
    }
  }

  /**
   * Validate a share link
   */
  async validateShareLink(linkId) {
    try {
      return await this.databaseService.validateShareLink(linkId);
    } catch (error) {
      console.error('Error validating share link:', error);
      throw error;
    }
  }

  /**
   * Get share link by ID
   */
  async getShareLinkById(linkId) {
    try {
      return await this.databaseService.getShareLinkById(linkId);
    } catch (error) {
      console.error('Error getting share link by ID:', error);
      throw error;
    }
  }

  /**
   * Get shared list by ID
   */
  async getSharedListById(listId) {
    try {
      return await this.databaseService.getSharedListById(listId);
    } catch (error) {
      console.error('Error getting shared list by ID:', error);
      throw error;
    }
  }

  /**
   * Join a shared list using a link
   */
  async joinSharedListWithLink(linkId, userId) {
    try {
      const link = await this.validateShareLink(linkId);
      if (!link) {
        throw new Error('Invalid or expired share link');
      }

      // Add user as collaborator based on link permissions
      const role = link.permissions === 'read_write' ? 'editor' : 'viewer';
      await this.databaseService.createCollaboration(link.list_id || link.listId, userId, role);

      return await this.getSharedListById(link.list_id || link.listId);
    } catch (error) {
      console.error('Error joining shared list with link:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to a list
   */
  async userHasAccessToList(userId, listId, requiredPermission = 'read') {
    try {
      const sharedList = await this.getSharedListById(listId);
      if (!sharedList) {
        return false;
      }

      const permissions = typeof sharedList.permissions === 'string'
        ? JSON.parse(sharedList.permissions)
        : sharedList.permissions || {};

      const userRole = permissions[userId];
      if (!userRole) {
        return false; // User is not a collaborator
      }

      if (userRole === 'admin' || userRole === 'owner') {
        return true; // Admins/owners can do everything
      }

      if (requiredPermission === 'read') {
        return ['viewer', 'editor', 'admin', 'owner'].includes(userRole);
      }

      if (requiredPermission === 'write') {
        return ['editor', 'admin', 'owner'].includes(userRole);
      }

      return false;
    } catch (error) {
      console.error('Error checking user access to list:', error);
      return false;
    }
  }

  /**
   * Get all tasks assigned to a user
   */
  async getUserAssignedTasks(userId) {
    try {
      return await this.databaseService.getUserTasks(userId);
    } catch (error) {
      console.error('Error getting user assigned tasks:', error);
      throw error;
    }
  }

  /**
   * Update shared list
   */
  async updateSharedList(listId, updates) {
    try {
      return await this.databaseService.updateSharedList(listId, updates);
    } catch (error) {
      console.error('Error updating shared list:', error);
      throw error;
    }
  }

  /**
   * Add collaborator to shared list
   */
  async addCollaboratorToList(listId, userId, role) {
    try {
      return await this.databaseService.createCollaboration(listId, userId, role);
    } catch (error) {
      console.error('Error adding collaborator to list:', error);
      throw error;
    }
  }

  /**
   * Get all collaborations for a list
   */
  async getCollaborationsByList(listId) {
    try {
      return await this.databaseService.getCollaborationsByList(listId);
    } catch (error) {
      console.error('Error getting collaborations by list:', error);
      throw error;
    }
  }

  /**
   * Get all collaborations for a user
   */
  async getCollaborationsByUser(userId) {
    try {
      return await this.databaseService.getCollaborationsByUser(userId);
    } catch (error) {
      console.error('Error getting collaborations by user:', error);
      throw error;
    }
  }

  /**
   * Initialize the database with default tables and structures
   */
  initializeDatabase() {
    // The database initialization happens in the database service
    // This method is just for consistency in the API
    return this.databaseService.initializeDatabase();
  }
}

// Export a singleton instance
const dataService = new DataService();
export default dataService;
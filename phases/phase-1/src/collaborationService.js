// phases/phase-1/src/collaborationService.js
import SharedList from './models/sharedListModel.js';
import ShareLink from './models/shareLinkModel.js';
import Assignment from './models/assignmentModel.js';
import Comment from './models/commentModel.js';
import databaseService from '../database/service.js';
import { v4 as uuidv4 } from 'uuid';

class CollaborationService {
  constructor() {
    this.databaseService = databaseService;
  }

  // Share List functionality
  async createSharedList(name, ownerId, permissions = {}) {
    try {
      const sharedList = new SharedList({
        name,
        ownerId,
        permissions
      });

      return await sharedList.save();
    } catch (error) {
      console.error('Error creating shared list:', error);
      throw error;
    }
  }

  async getSharedListById(listId) {
    try {
      const dbData = databaseService.getSharedListById(listId);
      return dbData ? SharedList.fromDatabase(dbData) : null;
    } catch (error) {
      console.error('Error getting shared list:', error);
      throw error;
    }
  }

  async updateSharedList(listId, updates, userId) {
    try {
      const sharedList = await this.getSharedListById(listId);
      if (!sharedList) {
        throw new Error('Shared list not found');
      }

      // Check if user has permission to update the list
      if (!sharedList.isOwner(userId) && sharedList.permissions[userId] !== 'admin') {
        throw new Error('User does not have permission to update this shared list');
      }

      // Update the shared list properties
      Object.assign(sharedList, updates);
      sharedList.updatedAt = new Date().toISOString();

      return await sharedList.save();
    } catch (error) {
      console.error('Error updating shared list:', error);
      throw error;
    }
  }

  async addCollaboratorToList(listId, userId, newUserId, role, currentUserId) {
    try {
      const sharedList = await this.getSharedListById(listId);
      if (!sharedList) {
        throw new Error('Shared list not found');
      }

      // Check if the current user has permission to add collaborators
      if (!sharedList.isOwner(currentUserId) &&
          sharedList.permissions[currentUserId] !== 'admin' &&
          sharedList.permissions[currentUserId] !== 'read_write') {
        throw new Error('User does not have permission to add collaborators');
      }

      // Add the new collaborator
      sharedList.addCollaborator(newUserId, role);

      // Create the collaboration record in the database
      databaseService.createCollaboration(listId, newUserId, role);

      return await sharedList.save();
    } catch (error) {
      console.error('Error adding collaborator to list:', error);
      throw error;
    }
  }

  // Share Link functionality
  async generateShareLink(listId, accessType, permissions, userId) {
    try {
      const sharedList = await this.getSharedListById(listId);
      if (!sharedList) {
        throw new Error('Shared list not found');
      }

      // Check if user has permission to generate a share link
      if (!sharedList.hasPermission(userId, 'write')) {
        throw new Error('User does not have permission to generate a share link');
      }

      const shareLink = new ShareLink({
        listId,
        accessType,
        permissions,
        createdBy: userId
      });

      // For now, return the share link object without saving to DB
      // The actual DB save would happen when we implement the full share link flow
      return shareLink;
    } catch (error) {
      console.error('Error generating share link:', error);
      throw error;
    }
  }

  async validateShareLink(linkId) {
    try {
      // Check if the share link is valid in the database
      const dbLink = databaseService.validateShareLink(linkId);
      if (!dbLink) {
        return null;
      }

      // Create a ShareLink instance from the database data
      const shareLink = ShareLink.fromDatabase(dbLink);

      // Increment usage count
      shareLink.incrementUsage();

      return shareLink;
    } catch (error) {
      console.error('Error validating share link:', error);
      throw error;
    }
  }

  // Assignment functionality
  async createAssignment(taskId, assignees, assignedBy, options = {}) {
    try {
      // Create assignment(s) for each assignee
      const assignments = Assignment.createMultiple(taskId, assignees, assignedBy, options);

      // Save each assignment
      const savedAssignments = [];
      for (const assignment of assignments) {
        savedAssignments.push(await assignment.save());
      }

      return savedAssignments;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  async updateAssignment(assignmentId, updates, userId) {
    try {
      // Get the assignment
      const dbAssignment = databaseService.getAssignmentById(assignmentId);
      if (!dbAssignment) {
        throw new Error('Assignment not found');
      }

      const assignment = Assignment.fromDatabase(dbAssignment);

      // Check if user has permission to update this assignment
      // User can update if they are assigned to the task or if they assigned it
      if (!assignment.isAssignedTo(userId) && !assignment.isAssignedBy(userId)) {
        throw new Error('User does not have permission to update this assignment');
      }

      // Update the assignment
      return await assignment.update(updates);
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  async getTaskAssignments(taskId) {
    try {
      return await Assignment.getByTask(taskId);
    } catch (error) {
      console.error('Error getting task assignments:', error);
      throw error;
    }
  }

  async getUserAssignments(userId) {
    try {
      return await Assignment.getByUser(userId);
    } catch (error) {
      console.error('Error getting user assignments:', error);
      throw error;
    }
  }

  // Comment functionality
  async addCommentToTask(taskId, authorId, content, mentions = []) {
    try {
      // Create and save the comment
      const comment = Comment.createWithSanitization({
        taskId,
        authorId,
        content,
        mentions
      });

      return await comment.save();
    } catch (error) {
      console.error('Error adding comment to task:', error);
      throw error;
    }
  }

  async getCommentsForTask(taskId) {
    try {
      return await Comment.getByTask(taskId);
    } catch (error) {
      console.error('Error getting comments for task:', error);
      throw error;
    }
  }

  async updateComment(commentId, updates, userId) {
    try {
      // Get the comment
      const dbComments = databaseService.getCommentsByTask(updates.taskId || 'unknown'); // This is a workaround
      const dbComment = dbComments.find(c => c.id === commentId);

      if (!dbComment) {
        throw new Error('Comment not found');
      }

      const comment = Comment.fromDatabase(dbComment);

      // Check if user is the author of the comment
      if (!comment.isAuthor(userId)) {
        throw new Error('User does not have permission to update this comment');
      }

      // Update the comment
      return await comment.update(updates);
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  // Join shared list functionality
  async joinSharedList(linkId, userId) {
    try {
      // Validate the share link
      const shareLink = await this.validateShareLink(linkId);
      if (!shareLink) {
        throw new Error('Invalid or expired share link');
      }

      // Get the shared list
      const sharedList = await this.getSharedListById(shareLink.listId);
      if (!sharedList) {
        throw new Error('Shared list not found');
      }

      // Determine the appropriate role based on link permissions
      let role = 'read_only';
      if (shareLink.permissions === 'read_write') {
        role = 'read_write';
      }

      // Add the user as a collaborator
      return await this.addCollaboratorToList(shareLink.listId, userId, userId, role, userId);
    } catch (error) {
      console.error('Error joining shared list:', error);
      throw error;
    }
  }

  // Get all shared lists for a user
  async getUserSharedLists(userId) {
    try {
      return databaseService.getSharedListsForUser(userId);
    } catch (error) {
      console.error('Error getting user shared lists:', error);
      throw error;
    }
  }

  // Get all tasks assigned to a user
  async getUserAssignedTasks(userId) {
    try {
      return databaseService.getUserTasks(userId);
    } catch (error) {
      console.error('Error getting user assigned tasks:', error);
      throw error;
    }
  }

  // Create a user in the system
  async createUser(userData) {
    try {
      return databaseService.createUser(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get a user by ID
  async getUserById(userId) {
    try {
      return databaseService.getUserById(userId);
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  // Mention parsing utility
  parseMentions(text, userList) {
    const mentionRegex = /@(\w+)/g;
    const matches = [...text.matchAll(mentionRegex)];
    const mentions = [];

    for (const match of matches) {
      const username = match[1];
      const user = userList.find(u => u.displayName === username || u.id === username);
      if (user) {
        mentions.push(user.id);
      }
    }

    return {
      textWithoutMentions: text.replace(mentionRegex, (match, username) => `@${username}`),
      mentions: [...new Set(mentions)] // Remove duplicates
    };
  }

  // Check if user has access to a specific shared list
  async userHasAccessToList(userId, listId, requiredPermission = 'read') {
    try {
      const sharedList = await this.getSharedListById(listId);
      if (!sharedList) {
        return false;
      }

      return sharedList.hasPermission(userId, requiredPermission);
    } catch (error) {
      console.error('Error checking user access to list:', error);
      return false;
    }
  }
}

// Export a singleton instance
const collaborationService = new CollaborationService();
export default collaborationService;
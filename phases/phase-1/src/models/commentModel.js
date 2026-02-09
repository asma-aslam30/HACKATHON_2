// phases/phase-1/src/models/commentModel.js
import { v4 as uuidv4 } from 'uuid';
import databaseService from '../../database/service.js';

class Comment {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.taskId = data.taskId;
    this.authorId = data.authorId;
    this.content = data.content;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || this.createdAt;
    this.mentions = data.mentions || [];
    this.resolved = data.resolved || false;
  }

  // Validate the comment data
  validate() {
    if (!this.taskId || typeof this.taskId !== 'string') {
      throw new Error('Task ID is required and must be a string');
    }

    if (!this.authorId || typeof this.authorId !== 'string') {
      throw new Error('Author ID is required and must be a string');
    }

    if (!this.content || typeof this.content !== 'string') {
      throw new Error('Content is required and must be a string');
    }

    if (this.content.length < 1 || this.content.length > 1000) {
      throw new Error('Content must be between 1 and 1000 characters');
    }

    if (this.mentions && !Array.isArray(this.mentions)) {
      throw new Error('Mentions must be an array');
    }

    if (this.mentions && this.mentions.length > 10) {
      throw new Error('Maximum 10 mentions per comment');
    }

    return true;
  }

  // Save the comment to the database
  async save() {
    this.validate();

    // If this is a new comment, create it
    if (!this.id) {
      this.id = uuidv4();
      const result = databaseService.createComment({
        id: this.id,
        taskId: this.taskId,
        authorId: this.authorId,
        content: this.content,
        mentions: this.mentions
      });
      return Comment.fromDatabase(result);
    } else {
      // Update the comment (for now, just return the current instance since DB updates are handled differently)
      this.updatedAt = new Date().toISOString();
      return this;
    }
  }

  // Create a comment from database data
  static fromDatabase(dbData) {
    return new Comment({
      id: dbData.id,
      taskId: dbData.task_id || dbData.taskId,
      authorId: dbData.author_id || dbData.authorId,
      content: dbData.content,
      createdAt: dbData.created_at || dbData.createdAt,
      updatedAt: dbData.updated_at || dbData.updatedAt,
      mentions: dbData.mentions || [],
      resolved: dbData.resolved
    });
  }

  // Update the comment
  async update(updates) {
    const allowedUpdates = ['content', 'mentions', 'resolved'];
    const filteredUpdates = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    if (filteredUpdates.content) {
      if (typeof filteredUpdates.content !== 'string' ||
          filteredUpdates.content.length < 1 ||
          filteredUpdates.content.length > 1000) {
        throw new Error('Content must be between 1 and 1000 characters');
      }
    }

    if (filteredUpdates.mentions && !Array.isArray(filteredUpdates.mentions)) {
      throw new Error('Mentions must be an array');
    }

    if (filteredUpdates.mentions && filteredUpdates.mentions.length > 10) {
      throw new Error('Maximum 10 mentions per comment');
    }

    // Update the comment in database (we'll update our local instance too)
    Object.assign(this, filteredUpdates);
    this.updatedAt = new Date().toISOString();

    return this;
  }

  // Check if a user is the author
  isAuthor(userId) {
    return this.authorId === userId;
  }

  // Add a mention to the comment
  addMention(userId) {
    if (!this.mentions.includes(userId)) {
      this.mentions.push(userId);
      this.updatedAt = new Date().toISOString();
    }
  }

  // Remove a mention from the comment
  removeMention(userId) {
    this.mentions = this.mentions.filter(id => id !== userId);
    this.updatedAt = new Date().toISOString();
  }

  // Format the comment for display
  formatForDisplay(currentUser = null) {
    let formattedContent = this.content;

    // Add @ mentions highlighting for the current user if they're mentioned
    if (currentUser && this.mentions.includes(currentUser.id)) {
      formattedContent = formattedContent.replace(
        new RegExp(`@${currentUser.displayName}`, 'gi'),
        `@${currentUser.displayName} (mentioned you)`
      );
    }

    return {
      id: this.id,
      taskId: this.taskId,
      authorId: this.authorId,
      content: formattedContent,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      mentions: this.mentions,
      resolved: this.resolved,
      isCurrentUserMentioned: currentUser ? this.mentions.includes(currentUser.id) : false
    };
  }

  // Get all comments for a specific task
  static async getByTask(taskId) {
    const dbComments = databaseService.getCommentsByTask(taskId);
    return dbComments.map(comment => Comment.fromDatabase(comment));
  }

  // Create comment with content sanitization
  static createWithSanitization(data) {
    // Basic sanitization to prevent XSS - remove any HTML tags
    const sanitizedContent = data.content.replace(/<[^>]*>/g, '');

    return new Comment({
      ...data,
      content: sanitizedContent
    });
  }
}

export default Comment;
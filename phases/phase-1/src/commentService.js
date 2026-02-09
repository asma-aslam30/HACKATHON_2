// phases/phase-1/src/commentService.js
import Comment from './models/commentModel.js';
import databaseService from '../database/service.js';
import collaborationService from './collaborationService.js';

class CommentService {
  constructor() {
    this.databaseService = databaseService;
    this.collaborationService = collaborationService;
  }

  // Add a comment to a task
  async addComment(taskId, authorId, content, options = {}) {
    try {
      // Validate inputs
      if (!taskId || typeof taskId !== 'string') {
        throw new Error('Task ID is required and must be a string');
      }

      if (!authorId || typeof authorId !== 'string') {
        throw new Error('Author ID is required and must be a string');
      }

      if (!content || typeof content !== 'string') {
        throw new Error('Content is required and must be a string');
      }

      // Check if user has access to the task
      // This is a simplified check - in a real implementation, you'd need to check if the user has access to the task
      // For now, we'll assume the user has access if they can provide the task ID

      // Parse mentions from the content
      const userList = await this.getUsersForMentions(); // This would need to be implemented
      const { textWithoutMentions, mentions } = this.parseMentions(content, userList);

      // Create the comment
      const comment = Comment.createWithSanitization({
        taskId,
        authorId,
        content: textWithoutMentions,
        mentions: options.mentions || mentions
      });

      const savedComment = await comment.save();

      // Trigger notifications for mentioned users
      if (savedComment.mentions && savedComment.mentions.length > 0) {
        await this.notifyMentionedUsers(savedComment);
      }

      return savedComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get all comments for a specific task
  async getCommentsForTask(taskId) {
    try {
      if (!taskId || typeof taskId !== 'string') {
        throw new Error('Task ID is required and must be a string');
      }

      // Check if user has access to the task
      // This would involve checking if the user has permission to view the task

      const comments = await Comment.getByTask(taskId);
      return comments;
    } catch (error) {
      console.error('Error getting comments for task:', error);
      throw error;
    }
  }

  // Update a comment
  async updateComment(commentId, updates, userId) {
    try {
      if (!commentId || typeof commentId !== 'string') {
        throw new Error('Comment ID is required and must be a string');
      }

      if (!userId || typeof userId !== 'string') {
        throw new Error('User ID is required and must be a string');
      }

      // Get the comment
      const dbComments = this.databaseService.getCommentsByTask(updates.taskId || 'unknown'); // This is a workaround
      const dbComment = dbComments.find(c => c.id === commentId);

      if (!dbComment) {
        throw new Error('Comment not found');
      }

      const comment = Comment.fromDatabase(dbComment);

      // Check if the user is the author of the comment
      if (!comment.isAuthor(userId)) {
        throw new Error('Only the author can update this comment');
      }

      // Update the comment
      return await comment.update(updates);
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  // Delete a comment
  async deleteComment(commentId, userId) {
    try {
      if (!commentId || typeof commentId !== 'string') {
        throw new Error('Comment ID is required and must be a string');
      }

      if (!userId || typeof userId !== 'string') {
        throw new Error('User ID is required and must be a string');
      }

      // In a real implementation, we would delete the comment from the database
      // For now, we'll just validate that the user is the author
      const dbComments = this.databaseService.getCommentsByTask('unknown'); // This is a workaround
      const dbComment = dbComments.find(c => c.id === commentId);

      if (!dbComment) {
        throw new Error('Comment not found');
      }

      const comment = Comment.fromDatabase(dbComment);

      // Check if the user is the author of the comment
      if (!comment.isAuthor(userId)) {
        throw new Error('Only the author can delete this comment');
      }

      // In a real implementation, we would delete the comment from the database
      console.log(`Comment ${commentId} would be deleted by user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Format comments for display
  async formatCommentsForDisplay(comments, currentUser = null) {
    try {
      return comments.map(comment => comment.formatForDisplay(currentUser));
    } catch (error) {
      console.error('Error formatting comments for display:', error);
      throw error;
    }
  }

  // Parse mentions in comment content
  parseMentions(content, userList) {
    // This is a simplified mention parser
    // In a real implementation, you'd want to use the collaborationService.parseMentions method
    const mentionRegex = /@(\w+)/g;
    const matches = [...content.matchAll(mentionRegex)];
    const mentions = [];

    for (const match of matches) {
      const username = match[1];
      const user = userList.find(u => u.displayName === username || u.id === username);
      if (user) {
        mentions.push(user.id);
      }
    }

    return {
      textWithoutMentions: content.replace(mentionRegex, (match, username) => `@${username}`),
      mentions: [...new Set(mentions)] // Remove duplicates
    };
  }

  // Get users for mention suggestions (simplified implementation)
  async getUsersForMentions() {
    // This would normally fetch users from a database
    // For now, return an empty array
    // In a real implementation, you might fetch users from the same shared list
    return [];
  }

  // Notify mentioned users about the comment
  async notifyMentionedUsers(comment) {
    try {
      if (!comment.mentions || comment.mentions.length === 0) {
        return;
      }

      // In a real implementation, this would send notifications to mentioned users
      // This could be email notifications, in-app notifications, etc.
      console.log(`Notifying users: ${comment.mentions.join(', ')} about comment on task ${comment.taskId}`);

      // You might want to integrate with the notificationService here
      // For now, we'll just log the notification
    } catch (error) {
      console.error('Error notifying mentioned users:', error);
      // Don't throw error here as it shouldn't prevent the comment from being added
    }
  }

  // Validate comment content
  validateCommentContent(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('Comment content is required and must be a string');
    }

    if (content.length < 1 || content.length > 1000) {
      throw new Error('Comment content must be between 1 and 1000 characters');
    }

    // Additional validation could go here (e.g., no HTML tags, no spam, etc.)
    return true;
  }

  // Add comment with validation and sanitization
  async addCommentWithValidation(taskId, authorId, content, options = {}) {
    try {
      // Validate the content first
      this.validateCommentContent(content);

      // Sanitize the content
      const sanitizedContent = this.sanitizeContent(content);

      // Add the comment
      return await this.addComment(taskId, authorId, sanitizedContent, options);
    } catch (error) {
      console.error('Error adding comment with validation:', error);
      throw error;
    }
  }

  // Sanitize comment content to prevent XSS and other issues
  sanitizeContent(content) {
    // Basic sanitization to prevent XSS
    // In a real implementation, you might want to use a more robust sanitization library
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .trim();
  }

  // Get recent comments for a user (mentions and assignments)
  async getRecentCommentsForUser(userId) {
    try {
      // This would fetch all comments where the user was mentioned
      // In a real implementation, this would query the database for comments
      // where the user ID appears in the mentions array
      console.log(`Fetching recent comments for user: ${userId}`);
      return [];
    } catch (error) {
      console.error('Error getting recent comments for user:', error);
      throw error;
    }
  }

  // Mark a comment as resolved
  async resolveComment(commentId, userId, resolved = true) {
    try {
      if (!commentId || typeof commentId !== 'string') {
        throw new Error('Comment ID is required and must be a string');
      }

      if (!userId || typeof userId !== 'string') {
        throw new Error('User ID is required and must be a string');
      }

      // Get the comment
      const dbComments = this.databaseService.getCommentsByTask('unknown'); // This is a workaround
      const dbComment = dbComments.find(c => c.id === commentId);

      if (!dbComment) {
        throw new Error('Comment not found');
      }

      const comment = Comment.fromDatabase(dbComment);

      // Check if the user has permission to resolve the comment
      // This could be the comment author, task assignee, or list owner
      const canResolve = comment.isAuthor(userId) ||
                         await this.collaborationService.userHasAccessToList(userId, comment.taskId, 'write'); // Simplified check

      if (!canResolve) {
        throw new Error('User does not have permission to resolve this comment');
      }

      // Update the comment
      return await comment.update({ resolved });
    } catch (error) {
      console.error('Error resolving comment:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const commentService = new CommentService();
export default commentService;
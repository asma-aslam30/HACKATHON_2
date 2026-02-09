// Mock Supabase client for testing comment service
const mockSupabase = {
  from: jest.fn((table) => {
    const mockTable = {
      select: jest.fn(() => mockTable),
      eq: jest.fn(() => mockTable),
      order: jest.fn(() => mockTable),
      insert: jest.fn(() => mockTable),
      update: jest.fn(() => mockTable),
      delete: jest.fn(() => mockTable),
      contains: jest.fn(() => mockTable),
      single: jest.fn(() => ({
        data: { id: 'comment-1', content: 'Test comment', todo_id: 'todo-1', user_id: 'user-123' },
        error: null
      })),
      data: [{ id: 'comment-1', content: 'Test comment', todo_id: 'todo-1', user_id: 'user-123' }],
      error: null
    };

    return mockTable;
  })
};

describe('Comment Service', () => {
  let CommentService;

  beforeEach(() => {
    // Dynamically import the comment service to mock Supabase
    jest.resetModules();
    jest.mock('../../lib/supabase', () => ({
      supabase: mockSupabase
    }));

    // Import the service after mocking
    const commentServiceModule = require('../../src/services/commentService');
    CommentService = commentServiceModule.CommentService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new comment service instance', () => {
    const service = new CommentService(mockSupabase);
    expect(service.supabase).toBe(mockSupabase);
  });

  test('should create a new comment', async () => {
    const service = new CommentService(mockSupabase);

    // Mock the commentModel
    service.commentModel = {
      create: jest.fn().mockResolvedValue({
        id: 'comment-1',
        content: 'Test comment',
        todoId: 'todo-1',
        userId: 'user-123'
      })
    };

    const comment = await service.createComment({
      todoId: 'todo-1',
      userId: 'user-123',
      content: 'Test comment',
      listId: 'list-1'
    });

    expect(comment.content).toBe('Test comment');
    expect(comment.userId).toBe('user-123');
  });

  test('should validate comment content', () => {
    const service = new CommentService(mockSupabase);

    // Test valid content
    const validContent = service.validateContent('This is a valid comment');
    expect(validContent).toBe('This is a valid comment');

    // Test null content (should throw)
    expect(() => {
      service.validateContent(null);
    }).toThrow('Comment content is required');

    // Test non-string content (should throw)
    expect(() => {
      service.validateContent(123);
    }).toThrow('Comment content is required');

    // Test empty content (should throw)
    expect(() => {
      service.validateContent('   ');
    }).toThrow('Comment cannot be empty');

    // Test content with HTML (should be sanitized)
    const sanitizedContent = service.validateContent('<script>alert("xss")</script>Hello <b>world</b>');
    expect(sanitizedContent).toBe('Hello world');
  });

  test('should parse mentions correctly', () => {
    const service = new CommentService(mockSupabase);

    const textWithMentions = 'Hello @john and @jane, please review this task';
    const mentions = service.parseMentions(textWithMentions);

    expect(mentions).toEqual(['john', 'jane']);
  });

  test('should get comments for a task', async () => {
    const service = new CommentService(mockSupabase);

    // Mock the commentModel
    service.commentModel = {
      getByTodoId: jest.fn().mockResolvedValue([
        { id: 'comment-1', content: 'First comment', userId: 'user-123' },
        { id: 'comment-2', content: 'Second comment', userId: 'user-456' }
      ])
    };

    const comments = await service.getComments('todo-1');

    expect(comments).toHaveLength(2);
    expect(comments[0].content).toBe('First comment');
  });

  test('should update a comment', async () => {
    const service = new CommentService(mockSupabase);

    // Mock the commentModel
    service.commentModel = {
      getById: jest.fn().mockResolvedValue({
        id: 'comment-1',
        content: 'Old comment',
        userId: 'user-123'
      }),
      update: jest.fn().mockResolvedValue({
        id: 'comment-1',
        content: 'Updated comment',
        userId: 'user-123'
      })
    };

    const updatedComment = await service.updateComment('comment-1', 'Updated comment', 'user-123', 'list-1');

    expect(updatedComment.content).toBe('Updated comment');
  });

  test('should delete a comment', async () => {
    const service = new CommentService(mockSupabase);

    // Mock the commentModel
    service.commentModel = {
      getById: jest.fn().mockResolvedValue({
        id: 'comment-1',
        userId: 'user-123'
      }),
      delete: jest.fn().mockResolvedValue()
    };

    await service.deleteComment('comment-1', 'user-123');

    expect(service.commentModel.delete).toHaveBeenCalledWith('comment-1');
  });

  test('should resolve a comment', async () => {
    const service = new CommentService(mockSupabase);

    // Mock the commentModel
    service.commentModel = {
      resolve: jest.fn().mockResolvedValue({
        id: 'comment-1',
        content: 'Test comment',
        resolved: true
      })
    };

    const resolvedComment = await service.setResolved('comment-1', true);

    expect(resolvedComment.resolved).toBe(true);
  });
});
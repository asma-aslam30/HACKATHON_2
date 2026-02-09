// Mock Supabase client for testing collaboration service
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
        data: { id: '1', name: 'Test List', owner_id: 'user-123', max_collaborators: 10 },
        error: null
      })),
      data: [{ id: '1', name: 'Test List', owner_id: 'user-123', max_collaborators: 10 }],
      error: null
    };

    // Mock different operations
    if (table === 'assignments') {
      mockTable.upsert = jest.fn(() => mockTable);
    }

    return mockTable;
  }),
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      subscribe: jest.fn(() => 'mock-channel')
    })),
    subscribe: jest.fn(() => 'mock-channel')
  })),
  removeChannel: jest.fn()
};

describe('Collaboration Service', () => {
  let CollaborationService;

  beforeEach(() => {
    // Dynamically import the collaboration service to mock Supabase
    jest.resetModules();
    jest.mock('../../lib/supabase', () => ({
      supabase: mockSupabase
    }));

    // Import the service after mocking
    const collaborationServiceModule = require('../../src/services/collaborationService');
    CollaborationService = collaborationServiceModule.CollaborationService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new collaboration service instance', () => {
    const service = new CollaborationService(mockSupabase);
    expect(service.supabase).toBe(mockSupabase);
    expect(service.offlineQueue).toEqual([]);
  });

  test('should generate a share link', async () => {
    const service = new CollaborationService(mockSupabase);

    // Mock the shareLinkModel methods
    service.shareLinkModel = {
      create: jest.fn().mockResolvedValue({ id: 'link-123', list_id: 'list-1', created_by: 'user-123' }),
      generateShareUrl: jest.fn().mockReturnValue('http://localhost/share/link-123'),
      getByListId: jest.fn().mockResolvedValue([])
    };

    // Mock the sharedListModel methods
    service.sharedListModel = {
      checkAccess: jest.fn().mockResolvedValue({ hasAccess: true, role: 'owner' })
    };

    const result = await service.generateShareLink({
      listId: 'list-1',
      createdBy: 'user-123'
    });

    expect(result).toHaveProperty('shareUrl');
    expect(result.shareUrl).toBe('http://localhost/share/link-123');
  });

  test('should create a shared list', async () => {
    const service = new CollaborationService(mockSupabase);

    // Mock the sharedListModel
    service.sharedListModel = {
      create: jest.fn().mockResolvedValue({ id: 'list-1', name: 'New List', owner_id: 'user-123' })
    };

    const result = await service.createSharedList({
      name: 'New List',
      ownerId: 'user-123'
    });

    expect(result.name).toBe('New List');
    expect(result.owner_id).toBe('user-123');
  });

  test('should parse mentions correctly', () => {
    const service = new CollaborationService(mockSupabase);

    const textWithMentions = 'Hello @john and @jane, please review this task';
    const mentions = service.parseMentions(textWithMentions);

    expect(mentions).toEqual(['john', 'jane']);
  });

  test('should assign a task to users', async () => {
    const service = new CollaborationService(mockSupabase);

    // Mock the sharedListModel
    service.sharedListModel = {
      checkAccess: jest.fn().mockResolvedValue({ hasAccess: true, role: 'editor' }),
      getCollaborators: jest.fn().mockResolvedValue([
        { userId: 'user-123', role: 'owner' },
        { userId: 'user-456', role: 'editor' }
      ])
    };

    const assignments = await service.assignTask('todo-1', ['user-456'], 'user-123', 'list-1');

    expect(assignments).toBeDefined();
  });

  test('should queue operations for offline support', () => {
    const service = new CollaborationService(mockSupabase);

    service.queueOperation({
      type: 'CREATE_TASK',
      data: { title: 'Test Task' }
    });

    expect(service.getQueueSize()).toBe(1);
  });
});
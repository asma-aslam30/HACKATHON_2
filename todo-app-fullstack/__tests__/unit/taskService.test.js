// Mock Supabase client with different return values for different operations
const mockSupabase = {
  from: jest.fn((table) => {
    // Create a different mock for each table access
    const mockTable = {
      select: jest.fn(() => mockTable),
      eq: jest.fn(() => mockTable),
      order: jest.fn(() => mockTable),
      insert: jest.fn(() => mockTable),
      update: jest.fn(() => mockTable),
      delete: jest.fn(() => mockTable),
      contains: jest.fn(() => mockTable),
      single: jest.fn(() => ({
        data: { id: '1', title: 'Test Todo', completed: false, user_id: 'user-123', version: 1 },
        error: null
      })),
      data: [{ id: '1', title: 'Test Todo', completed: false, user_id: 'user-123' }],
      error: null
    };

    // Mock the chain methods to return data/error based on the operation
    const originalSelect = mockTable.select;
    mockTable.select = jest.fn((fields) => {
      // Mock different responses based on the fields requested
      if (fields && fields.includes('version')) {
        // For update operations
        mockTable.single.mockReturnValueOnce({
          data: { version: 1 },
          error: null
        });
      } else if (fields && fields.includes('shared_lists')) {
        // For getAssignedToUser
        mockTable.data = [{ id: '1', title: 'Test Todo', completed: false, user_id: 'user-123', assigned_to: ['user-123'] }];
      }
      return mockTable;
    });

    // Mock different operations
    const originalInsert = mockTable.insert;
    mockTable.insert = jest.fn((data) => {
      mockTable.select = jest.fn(() => mockTable);
      mockTable.single = jest.fn(() => ({
        data: { id: '2', title: 'New Todo', completed: false, user_id: 'user-123', version: 1 },
        error: null
      }));
      return mockTable;
    });

    const originalUpdate = mockTable.update;
    mockTable.update = jest.fn((data) => {
      mockTable.eq = jest.fn(() => mockTable);
      mockTable.select = jest.fn(() => mockTable);
      mockTable.single = jest.fn(() => ({
        data: { id: '1', title: 'Test Todo', completed: true, user_id: 'user-123', version: 2 },
        error: null
      }));
      return mockTable;
    });

    const originalDelete = mockTable.delete;
    mockTable.delete = jest.fn(() => {
      mockTable.eq = jest.fn(() => mockTable);
      mockTable.data = [];
      mockTable.error = null;
      return mockTable;
    });

    return mockTable;
  })
};

describe('Task Service', () => {
  let TaskService;

  beforeEach(() => {
    // Dynamically import the task service to mock Supabase
    jest.resetModules();
    jest.mock('../../lib/supabase', () => ({
      supabase: mockSupabase
    }));

    // Import the service after mocking
    const taskServiceModule = require('../../src/services/taskService');
    TaskService = taskServiceModule.TaskService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new task service instance', () => {
    const service = new TaskService(mockSupabase);
    expect(service.supabase).toBe(mockSupabase);
    expect(service.tableName).toBe('todos');
  });

  test('should fetch tasks for a user', async () => {
    const service = new TaskService(mockSupabase);
    const tasks = await service.getByUserId('user-123');

    expect(mockSupabase.from).toHaveBeenCalledWith('todos');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Test Todo');
  });

  test('should create a new task', async () => {
    const service = new TaskService(mockSupabase);
    const newTask = await service.create({
      title: 'New Todo',
      userId: 'user-123'
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('todos');
    expect(newTask.title).toBe('New Todo');
  });

  test('should update a task', async () => {
    const service = new TaskService(mockSupabase);
    const result = await service.update('1', { completed: true }, 'user-123');

    expect(result.success).toBe(true);
    expect(result.task.completed).toBe(true);
  });

  test('should toggle task completion', async () => {
    const service = new TaskService(mockSupabase);

    // Mock the getById method for toggleComplete
    jest.spyOn(service, 'getById').mockResolvedValue({
      id: '1',
      title: 'Test Todo',
      completed: false,
      user_id: 'user-123'
    });

    const updatedTask = await service.toggleComplete('1', 'user-123');
    expect(updatedTask.completed).toBe(true);
  });

  test('should delete a task', async () => {
    const service = new TaskService(mockSupabase);
    await service.delete('1');

    expect(mockSupabase.from).toHaveBeenCalledWith('todos');
  });
});
// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [{ id: '1', title: 'Test Todo', completed: false }],
          error: null
        }))
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({
          data: { id: '2', title: 'New Todo', completed: false },
          error: null
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: [{ id: '1', title: 'Test Todo', completed: true }],
        error: null
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: [],
        error: null
      }))
    }))
  }))
}

describe('Todo Service', () => {
  let todoService;

  beforeEach(() => {
    // Dynamically import the todo service to mock Supabase
    jest.resetModules();
    jest.mock('../../lib/supabase', () => ({
      supabase: mockSupabase
    }));

    // Import the service after mocking
    todoService = require('../../src/services/taskService');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch todos for a user', async () => {
    const todos = await todoService.getTodosByUser('user-123');
    expect(todos).toHaveLength(1);
    expect(todos[0].title).toBe('Test Todo');
  });

  test('should create a new todo', async () => {
    const newTodo = await todoService.createTodo({
      title: 'New Todo',
      userId: 'user-123'
    });
    expect(newTodo.title).toBe('New Todo');
  });

  test('should update a todo', async () => {
    const updatedTodo = await todoService.updateTodo('1', { completed: true });
    expect(updatedTodo.completed).toBe(true);
  });

  test('should delete a todo', async () => {
    const result = await todoService.deleteTodo('1');
    expect(result).toBe(true);
  });
});
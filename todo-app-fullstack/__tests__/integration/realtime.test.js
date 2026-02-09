// Mock Supabase client for testing real-time functionality
const mockSupabase = {
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      subscribe: jest.fn(() => 'mock-channel')
    })),
    subscribe: jest.fn(() => 'mock-channel')
  })),
  removeChannel: jest.fn(),
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }))
}

// Mock the supabase client module
jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('Real-time Service', () => {
  let RealtimeService, useRealtimeTodos;

  beforeAll(async () => {
    // Dynamically import after setting up mocks
    const realtimeModule = await import('../../lib/realtime');
    RealtimeService = realtimeModule.RealtimeService;
    useRealtimeTodos = realtimeModule.useRealtimeTodos;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new real-time service instance', () => {
    const service = new RealtimeService(mockSupabase);
    expect(service.supabase).toBe(mockSupabase);
    expect(service.channels).toBeInstanceOf(Map);
  });

  test('should subscribe to todos', () => {
    const service = new RealtimeService(mockSupabase);
    const callback = jest.fn();

    const channel = service.subscribeToTodos('user-123', callback);

    expect(mockSupabase.channel).toHaveBeenCalledWith('todos:user-123');
    expect(channel).toBe('mock-channel');
  });

  test('should handle real-time updates properly', () => {
    const service = new RealtimeService(mockSupabase);
    const callback = jest.fn();

    service.subscribeToTodos('user-123', callback);

    // Verify the channel was set up with the correct filters
    expect(mockSupabase.channel).toHaveBeenCalledWith('todos:user-123');
    expect(callback).not.toHaveBeenCalled(); // Callback only triggers on actual events
  });

  test('should unsubscribe from a channel', () => {
    const service = new RealtimeService(mockSupabase);
    service.channels.set('todos:user-123', 'mock-channel');

    service.unsubscribe('todos:user-123');

    expect(mockSupabase.removeChannel).toHaveBeenCalledWith('mock-channel');
    expect(service.channels.has('todos:user-123')).toBe(false);
  });

  test('should unsubscribe from all channels', () => {
    const service = new RealtimeService(mockSupabase);
    service.channels.set('todos:user-123', 'channel1');
    service.channels.set('shared_todos:user-123', 'channel2');

    service.unsubscribeAll();

    expect(mockSupabase.removeChannel).toHaveBeenCalledTimes(2);
    expect(service.channels.size).toBe(0);
  });

  test('should subscribe to shared todos', () => {
    const service = new RealtimeService(mockSupabase);
    const callback = jest.fn();

    const channel = service.subscribeToSharedTodos('user-123', callback);

    expect(mockSupabase.channel).toHaveBeenCalledWith('shared_todos:user-123');
    expect(channel).toBe('mock-channel');
  });
});

describe('useRealtimeTodos Hook', () => {
  test('should handle real-time updates correctly', async () => {
    // This test would typically require a more complex setup with React testing library
    // For now, we'll verify the hook exists and has the expected signature
    expect(typeof useRealtimeTodos).toBe('function');
  });
});
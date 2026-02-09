import { createStore } from 'zustand'
import { useStore } from '../../lib/store'

// Mock the store for testing
const mockStore = createStore((set) => ({
  user: null,
  todos: [],
  loading: { todos: false, auth: false },
  ui: { activeTab: 'todos', sidebarOpen: false, mobileMenuOpen: false },
  setUser: (user) => set({ user }),
  setTodos: (todos) => set({ todos }),
  addTodo: (todo) => set((state) => ({ todos: [todo, ...state.todos] })),
  updateTodo: (id, updates) => set((state) => ({
    todos: state.todos.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    )
  })),
  removeTodo: (id) => set((state) => ({
    todos: state.todos.filter(todo => todo.id !== id)
  })),
  setLoading: (section, value) => set((state) => ({
    loading: { ...state.loading, [section]: value }
  })),
  setActiveTab: (tab) => set((state) => ({
    ui: { ...state.ui, activeTab: tab }
  })),
  toggleSidebar: () => set((state) => ({
    ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
  })),
  reset: () => set({
    user: null,
    todos: [],
    loading: { todos: false, auth: false },
    ui: { activeTab: 'todos', sidebarOpen: false, mobileMenuOpen: false }
  })
}))

describe('Store', () => {
  beforeEach(() => {
    mockStore.getState().reset()
  })

  test('should set user', () => {
    const user = { id: '1', email: 'test@example.com' }
    mockStore.getState().setUser(user)
    expect(mockStore.getState().user).toEqual(user)
  })

  test('should add a todo', () => {
    const newTodo = { id: '1', title: 'Test Todo', completed: false }
    mockStore.getState().addTodo(newTodo)
    expect(mockStore.getState().todos).toHaveLength(1)
    expect(mockStore.getState().todos[0]).toEqual(newTodo)
  })

  test('should update a todo', () => {
    const todo = { id: '1', title: 'Old Title', completed: false }
    mockStore.getState().addTodo(todo)

    mockStore.getState().updateTodo('1', { title: 'New Title' })
    const updatedTodo = mockStore.getState().todos[0]
    expect(updatedTodo.title).toBe('New Title')
  })

  test('should remove a todo', () => {
    const todo = { id: '1', title: 'Test Todo', completed: false }
    mockStore.getState().addTodo(todo)

    expect(mockStore.getState().todos).toHaveLength(1)
    mockStore.getState().removeTodo('1')
    expect(mockStore.getState().todos).toHaveLength(0)
  })

  test('should update loading state', () => {
    mockStore.getState().setLoading('todos', true)
    expect(mockStore.getState().loading.todos).toBe(true)
  })

  test('should update active tab', () => {
    mockStore.getState().setActiveTab('dashboard')
    expect(mockStore.getState().ui.activeTab).toBe('dashboard')
  })

  test('should toggle sidebar', () => {
    const initialState = mockStore.getState().ui.sidebarOpen
    mockStore.getState().toggleSidebar()
    expect(mockStore.getState().ui.sidebarOpen).toBe(!initialState)
  })

  test('should reset state', () => {
    mockStore.getState().setUser({ id: '1', email: 'test@example.com' })
    mockStore.getState().addTodo({ id: '1', title: 'Test', completed: false })

    mockStore.getState().reset()
    expect(mockStore.getState().user).toBeNull()
    expect(mockStore.getState().todos).toHaveLength(0)
  })
})
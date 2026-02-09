import { create } from 'zustand'

// Zustand store for managing global app state
export const useStore = create((set, get) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),

  // Todos state
  todos: [],
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

  // Teams state
  teams: [],
  setTeams: (teams) => set({ teams }),
  addTeam: (team) => set((state) => ({ teams: [team, ...state.teams] })),
  updateTeam: (id, updates) => set((state) => ({
    teams: state.teams.map(team =>
      team.id === id ? { ...team, ...updates } : team
    )
  })),
  removeTeam: (id) => set((state) => ({
    teams: state.teams.filter(team => team.id !== id)
  })),

  // Projects state
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === id ? { ...project, ...updates } : project
    )
  })),
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(project => project.id !== id)
  })),

  // Current project state (when viewing a specific project)
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  currentProjectTasks: [],
  setCurrentProjectTasks: (tasks) => set({ currentProjectTasks: tasks }),

  // Current team state
  currentTeam: null,
  setCurrentTeam: (team) => set({ currentTeam: team }),

  // Notifications state
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1
  })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
    unreadCount: state.notifications.find(n => n.id === id && !n.read)
      ? state.unreadCount - 1
      : state.unreadCount
  })),

  // Loading states
  loading: {
    todos: false,
    auth: false,
    teams: false,
    projects: false,
    notifications: false,
  },
  setLoading: (section, value) => set((state) => ({
    loading: { ...state.loading, [section]: value }
  })),

  // UI states
  ui: {
    activeTab: 'todos', // todos, teams, projects, dashboard, profile
    sidebarOpen: false,
    mobileMenuOpen: false,
    notificationPanelOpen: false,
    createTeamModalOpen: false,
    createProjectModalOpen: false,
  },
  setActiveTab: (tab) => set((state) => ({
    ui: { ...state.ui, activeTab: tab }
  })),
  toggleSidebar: () => set((state) => ({
    ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
  })),
  toggleMobileMenu: () => set((state) => ({
    ui: { ...state.ui, mobileMenuOpen: !state.ui.mobileMenuOpen }
  })),
  toggleNotificationPanel: () => set((state) => ({
    ui: { ...state.ui, notificationPanelOpen: !state.ui.notificationPanelOpen }
  })),
  setCreateTeamModalOpen: (open) => set((state) => ({
    ui: { ...state.ui, createTeamModalOpen: open }
  })),
  setCreateProjectModalOpen: (open) => set((state) => ({
    ui: { ...state.ui, createProjectModalOpen: open }
  })),

  // Reset state
  reset: () => set({
    user: null,
    todos: [],
    teams: [],
    projects: [],
    currentProject: null,
    currentProjectTasks: [],
    currentTeam: null,
    notifications: [],
    unreadCount: 0,
    loading: {
      todos: false,
      auth: false,
      teams: false,
      projects: false,
      notifications: false,
    },
    ui: {
      activeTab: 'todos',
      sidebarOpen: false,
      mobileMenuOpen: false,
      notificationPanelOpen: false,
      createTeamModalOpen: false,
      createProjectModalOpen: false,
    }
  })
}))

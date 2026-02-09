import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory (needed since we're using ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../data/collaboration.db');

// Initialize database
const db = new Database(dbPath);

// Create tables for collaboration features
function initializeDatabase() {
  // Shared Lists table
  db.exec(`
    CREATE TABLE IF NOT EXISTS shared_lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      permissions TEXT, -- JSON string of permissions
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tasks table (extends existing functionality with collaboration fields)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      priority TEXT DEFAULT 'none',
      sort_order INTEGER DEFAULT 0,
      due_date DATETIME,
      recurrence_pattern TEXT DEFAULT 'none',
      reminder_offset INTEGER DEFAULT 0,
      reminder_enabled BOOLEAN DEFAULT 0,
      suggestion_dismissed BOOLEAN DEFAULT 0,
      shared_list_id TEXT,
      assigned_to TEXT, -- JSON array of user IDs
      version INTEGER DEFAULT 1,
      last_modified_by TEXT,
      FOREIGN KEY (shared_list_id) REFERENCES shared_lists (id)
    )
  `);

  // Comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      mentions TEXT, -- JSON array of mentioned user IDs
      resolved BOOLEAN DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks (id)
    )
  `);

  // Assignments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      assigned_to TEXT NOT NULL,
      assigned_by TEXT NOT NULL,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending', -- pending, accepted, in_progress, completed
      due_date DATETIME,
      priority TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks (id)
    )
  `);

  // Share links table
  db.exec(`
    CREATE TABLE IF NOT EXISTS share_links (
      id TEXT PRIMARY KEY,
      list_id TEXT NOT NULL,
      access_type TEXT NOT NULL, -- public, private, team
      permissions TEXT NOT NULL, -- read, read_write
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      created_by TEXT NOT NULL,
      usage_count INTEGER DEFAULT 0,
      max_uses INTEGER,
      FOREIGN KEY (list_id) REFERENCES shared_lists (id)
    )
  `);

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      email TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      preferences TEXT -- JSON string of user preferences
    )
  `);

  // Collaborations table (many-to-many relationship between users and shared lists)
  db.exec(`
    CREATE TABLE IF NOT EXISTS collaborations (
      id TEXT PRIMARY KEY,
      list_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL, -- owner, editor, viewer
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notifications_enabled BOOLEAN DEFAULT 1,
      FOREIGN KEY (list_id) REFERENCES shared_lists (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(list_id, user_id)
    )
  `);

  // Indexes for better performance
  db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_shared_list ON tasks(shared_list_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_assignments_task ON assignments(task_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_share_links_list ON share_links(list_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_collaborations_list ON collaborations(list_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_collaborations_user ON collaborations(user_id)');
}

// Initialize the database
initializeDatabase();

// Export database instance and helper functions
export { db, initializeDatabase };
export default db;
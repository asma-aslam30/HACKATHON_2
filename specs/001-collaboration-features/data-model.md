# Data Model: Todo App Phase 2 - Claude Skills Workflow

**Feature**: 001-collaboration-features
**Date**: 2025-12-27
**Status**: Design Complete
**Input**: Feature specification from `/specs/001-collaboration-features/spec.md`

## Overview

This document defines the data model for the Todo App collaboration features. The system extends the existing CLI todo app data model with collaboration capabilities using PostgreSQL and Prisma ORM.

## Storage Schema

### Supabase PostgreSQL Tables

#### Users Table
```sql
users (
  id: String @id @default(cuid()) @unique
  email: String @unique
  name: String?
  avatarUrl: String?
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  todos: Todo[]
  profile: Profile?
)
```

#### Profile Table
```sql
profiles (
  id: String @id @default(cuid())
  userId: String @unique
  bio: String?
  location: String?
  website: String?
  preferences: Json?
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
)
```

#### Todos Table (Extended from Phase 1)
```sql
todos (
  id: String @id @default(cuid())
  title: String
  description: String?
  completed: Boolean @default(false)
  priority: String @default("medium") // "low", "medium", "high"
  dueDate: DateTime?
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  userId: String
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  tags: String[]
  comments: Comment[]
  sharedListId: String? // ID of the shared list this task belongs to
  assignedTo: String[] // Array of user IDs assigned to this task
  version: Int @default(1) // For conflict resolution during sync
  lastModifiedBy: String? // User ID of last modifier
  collaborators: User[] @relation("TodoCollaborators")
)
```

#### Comments Table
```sql
comments (
  id: String @id @default(cuid())
  content: String
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  userId: String
  todoId: String
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  todo: Todo @relation(fields: [todoId], references: [id], onDelete: Cascade)
  mentions: String[] // Array of user IDs mentioned in the comment
  resolved: Boolean @default(false)
)
```

#### Shared Lists Table
```sql
sharedLists (
  id: String @id @default(cuid())
  name: String
  ownerId: String
  permissions: Json // { userId: "read_only" | "read_write" | "admin" }
  tasks: Todo[]
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  description: String?
  maxCollaborators: Int @default(10)
)
```

#### Collaborations Table (Many-to-Many between users and shared lists)
```sql
collaborations (
  id: String @id @default(cuid())
  listId: String
  userId: String
  role: String @default("viewer") // "viewer", "editor", "admin"
  joinedAt: DateTime @default(now())
  notificationsEnabled: Boolean @default(true)
  sharedList: SharedList @relation(fields: [listId], references: [id], onDelete: Cascade)
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
)
```

#### Share Links Table
```sql
shareLinks (
  id: String @id @default(cuid())
  listId: String
  accessType: String // "public", "private", "team"
  permissions: String // "read" or "read_write"
  createdAt: DateTime @default(now())
  expiresAt: DateTime?
  createdBy: String
  usageCount: Int @default(0)
  maxUses: Int?
  sharedList: SharedList @relation(fields: [listId], references: [id], onDelete: Cascade)
  user: User @relation(fields: [createdBy], references: [id], onDelete: Cascade)
)
```

#### Tags Table
```sql
tags (
  id: String @id @default(cuid())
  name: String @unique
  color: String @default("#3B82F6") // Default blue color
  userId: String
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  todos: Todo[]
)
```

## Entity Definitions

### 1. User (Extended)
A user of the Todo application with authentication and profile information.

**Fields**:
- `id`: Unique identifier for the user (UUID)
- `email`: User's email address (required, unique)
- `name`: User's display name (optional)
- `avatarUrl`: URL to user's avatar image (optional)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last account update timestamp

**Validation Rules**:
- `email`: Required, valid email format, unique across all users
- `name`: Optional, max 100 characters if provided

**Business Rules**:
- Users can create and own shared lists
- Users can be collaborators on shared lists
- User accounts cannot be deleted, only deactivated

### 2. Todo (Extended from Phase 1)
A task item with collaboration features.

**Fields**:
- `id`: Unique identifier for the task
- `title`: Task title (required)
- `description`: Detailed description of the task
- `completed`: Boolean indicating completion status
- `priority`: Task priority level ('high', 'medium', 'low', 'none')
- `dueDate`: Deadline for the task
- `createdAt`: Task creation timestamp
- `updatedAt`: Last modification timestamp
- `userId`: Owner of the task
- `tags`: Array of tag strings
- `sharedListId`: ID of the shared list this task belongs to
- `assignedTo`: Array of user IDs assigned to this task
- `version`: Version number for conflict resolution
- `lastModifiedBy`: User ID of last modifier

**Validation Rules**:
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `priority`: Must be one of allowed values
- `assignedTo`: Max 5 users per task
- `version`: Non-negative integer

**Business Rules**:
- Task completion by assignee updates assignment status
- Comments and assignments persist with task
- Version field enables conflict detection during sync

### 3. Comment
A user-generated message attached to a specific task for discussion.

**Fields**:
- `id`: Unique identifier for the comment
- `content`: Comment text content (required)
- `createdAt`: Comment creation timestamp
- `updatedAt`: Last comment update timestamp
- `userId`: Author of the comment
- `todoId`: Task this comment belongs to
- `mentions`: Array of user IDs mentioned in the comment
- `resolved`: Boolean indicating if the comment is resolved

**Validation Rules**:
- `content`: Required, 1-1000 characters
- `userId`: Must be valid authenticated user ID
- `mentions`: Maximum 10 users per comment

**Business Rules**:
- Comments are ordered chronologically
- Authors can edit/delete their own comments
- Mentions trigger notifications to mentioned users
- Comments persist even if task is modified

### 4. SharedList
A todo list that can be shared with other users with configurable permissions.

**Fields**:
- `id`: Unique identifier for the shared list
- `name`: Display name for the list
- `ownerId`: User ID of the list owner
- `permissions`: JSON object mapping user IDs to access levels
- `createdAt`: List creation timestamp
- `updatedAt`: Last modification timestamp
- `description`: Optional description of the list
- `maxCollaborators`: Maximum number of collaborators

**Validation Rules**:
- `name`: Required, 1-100 characters, trimmed
- `ownerId`: Must be valid authenticated user ID
- `permissions`: Minimum 1 entry (owner), maximum 10 collaborators
- `maxCollaborators`: Maximum 100 collaborators

**Business Rules**:
- Owner has admin rights and can modify permissions
- Only editors can create/update/delete tasks
- Viewers can only read tasks and comments
- Owner can transfer ownership to another collaborator

### 5. Collaboration
A relationship between a user and a shared list indicating their role and access level.

**Fields**:
- `id`: Unique identifier for the collaboration
- `listId`: ID of the shared list
- `userId`: ID of the collaborating user
- `role`: Role of the user ('viewer', 'editor', 'admin')
- `joinedAt`: Timestamp when user joined
- `notificationsEnabled`: Whether user receives notifications

**Validation Rules**:
- `role`: Must be one of 'viewer', 'editor', 'admin'
- `userId` and `listId`: Combination must be unique

**Business Rules**:
- Users can be part of multiple shared lists
- Role determines what actions user can perform
- Notifications can be enabled/disabled per collaboration

### 6. ShareLink
A generated link for sharing access to a shared list.

**Fields**:
- `id`: Unique identifier for the share link
- `listId`: ID of the list being shared
- `accessType`: Access level ('public', 'private', 'team')
- `permissions`: Permission level ('read', 'read_write')
- `createdAt`: Link creation timestamp
- `expiresAt`: Optional expiration date
- `createdBy`: User ID of link creator
- `usageCount`: Number of times link was used
- `maxUses`: Optional limit on usage

**Validation Rules**:
- `accessType`: Must be one of allowed values
- `expiresAt`: If set, must be in the future
- `maxUses`: If set, must be positive integer

**Business Rules**:
- Public links are discoverable by any user
- Private links require authentication but no special permission
- Team links are limited to users in the same organization
- Links can be revoked by the creator

## Relationships Diagram

```
User (1) ---- (n) Todo (owner)
User (1) ---- (n) Comment (author)
User (1) ---- (n) SharedList (owner)
User (1) ---- (n) Collaboration (collaborator)
SharedList (1) ---- (n) Todo (in list)
SharedList (1) ---- (n) Collaboration (collaborations)
SharedList (1) ---- (n) ShareLink (links)
Todo (1) ---- (n) Comment (comments)
Todo (n) ---- (m) User (assignedTo) [via collaborators relation]
```

## Index and Query Patterns

### By Shared List Access
```javascript
// Find all lists a user has access to
collaborations
  .filter(c => c.userId === userId)
  .map(c => sharedLists[c.listId])
```

### By Task Assignments
```javascript
// Find all tasks assigned to a user
sharedLists
  .flatMap(list => list.tasks)
  .filter(task => task.assignedTo.includes(userId))
```

### By User Mentions
```javascript
// Find all comments where user was mentioned
sharedLists
  .flatMap(list => list.tasks)
  .flatMap(task => task.comments)
  .filter(comment => comment.mentions?.includes(userId))
```

### By Share Link
```javascript
// Validate and use share link
const link = shareLinks[linkId];
if (link && (!link.expiresAt || new Date(link.expiresAt) > new Date())) {
  // Grant access based on link permissions
}
```

## Migration Strategy

### From Phase 1 to Phase 2
Extend existing tasks with collaboration-specific fields:

```javascript
function migrateLocalTasks(tasksData) {
  return {
    ...tasksData,
    // Phase 2 fields (Collaboration Features)
    sharedListLinks: tasksData.sharedListLinks ?? {},
    localCollaborationCache: tasksData.localCollaborationCache ?? {}
  };
}

function migrateTask(task) {
  return {
    ...task,
    // Phase 2 fields on tasks
    comments: task.comments ?? [],
    assignedTo: task.assignedTo ?? [],
    sharedListId: task.sharedListId ?? null,
    version: task.version ?? 1,
    lastModifiedBy: task.lastModifiedBy ?? null
  };
}
```

### When a user first enables collaboration:
1. Create user profile in Supabase if not exists
2. Migrate existing local tasks to a new SharedList
3. Set user as owner of their migrated list
4. Create initial share link if needed

## Security Considerations

### Database Security Rules

```sql
-- Users can only access their own data
CREATE POLICY "Users can view their own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos" ON todos FOR DELETE USING (auth.uid() = user_id);

-- For shared lists, users can access based on collaboration permissions
CREATE POLICY "Users can access shared todos" ON todos FOR ALL USING (
  EXISTS (
    SELECT 1 FROM collaborations
    WHERE collaborations.list_id = todos.shared_list_id
    AND collaborations.user_id = auth.uid()
  )
);
```

### Validation Rules
- All write operations must include user authentication
- Permission checks are performed at the database level
- Data validation prevents invalid data from being stored
- Rate limiting prevents abuse of collaboration features

## Performance Considerations

### Sync Optimization
- Use Supabase listeners for real-time updates
- Implement local caching to reduce network requests
- Batch operations where possible to reduce API calls
- Implement pagination for large lists (>100 tasks)

### Offline Capability
- Local storage maintains copy of shared lists
- Operations are queued when offline
- Sync conflicts are resolved with version-based approach
- Clear UI indicators for online/offline status

## Backward Compatibility

- All new fields have defaults (empty arrays, null, or sensible values)
- Existing tasks work without modification when collaboration is disabled
- Migration runs automatically when collaboration features are first used
- No breaking changes to existing task operations
- Local-only mode continues to work without Supabase connection
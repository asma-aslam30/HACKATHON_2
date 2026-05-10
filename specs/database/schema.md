# Database Schema

## Provider
Neon Serverless PostgreSQL

## Tables

### users (managed by Better Auth)
| Column | Type | Notes |
|--------|------|-------|
| id | string | Primary key (cuid) |
| email | string | Unique |
| name | string | Nullable |
| emailVerified | boolean | Default false |
| image | string | Nullable |
| createdAt | timestamp | Auto |
| updatedAt | timestamp | Auto |

### todos (Next.js frontend tasks)
| Column | Type | Notes |
|--------|------|-------|
| id | string | Primary key (cuid) |
| title | string | Required |
| description | string | Nullable |
| completed | boolean | Default false |
| priority | string | low/medium/high |
| dueDate | timestamp | Nullable |
| recurrencePattern | string | daily/weekly/monthly |
| reminderEnabled | boolean | Default false |
| reminderOffset | integer | Minutes before due |
| totalTimeMs | integer | Tracked time |
| userId | string | FK → users.id |
| createdAt | timestamp | Auto |
| updatedAt | timestamp | Auto |

### subtasks
| Column | Type | Notes |
|--------|------|-------|
| id | string | Primary key |
| title | string | Required |
| completed | boolean | Default false |
| order | integer | Sort order |
| todoId | string | FK → todos.id |

### timeEntries
| Column | Type | Notes |
|--------|------|-------|
| id | string | Primary key |
| startedAt | timestamp | Required |
| stoppedAt | timestamp | Nullable |
| durationMs | integer | Nullable |
| todoId | string | FK → todos.id |

### taskTemplates
| Column | Type | Notes |
|--------|------|-------|
| id | string | Primary key |
| name | string | Unique per user |
| title | string | Default task title |
| description | string | Nullable |
| priority | string | Default medium |
| userId | string | FK → users.id |

### chatbot_tasks (FastAPI backend tasks)
| Column | Type | Notes |
|--------|------|-------|
| id | integer | Primary key |
| user_id | string | Indexed |
| title | string | Required |
| description | string | Nullable |
| completed | boolean | Default false |
| priority | string | low/medium/high |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### chatbot_conversations
| Column | Type | Notes |
|--------|------|-------|
| id | integer | Primary key |
| user_id | string | Indexed |
| title | string | First 50 chars of first message |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### chatbot_messages
| Column | Type | Notes |
|--------|------|-------|
| id | integer | Primary key |
| conversation_id | integer | FK → chatbot_conversations.id |
| user_id | string | Indexed |
| role | string | user/assistant/tool |
| content | string | Message text |
| tool_calls | string | JSON array of tool calls |
| created_at | timestamp | Auto |

## Indexes
- todos.userId
- chatbot_tasks.user_id
- chatbot_messages.conversation_id
- chatbot_conversations.user_id

# Notification Types Specification

This document defines the notification types and channels for the todo application notification system.

## Notification Channels

### 1. Email
- **Purpose**: Detailed notifications for important events
- **Format**: HTML emails with rich content
- **Template**: Customizable templates for different notification types
- **Delivery**: SMTP with fallback to transactional email service

### 2. Slack
- **Purpose**: Real-time notifications for team collaboration
- **Format**: Slack message format with attachments and buttons
- **Integration**: Slack API with bot token authentication
- **Delivery**: Real-time via Slack API

### 3. Push Notifications
- **Purpose**: Mobile app notifications for immediate attention
- **Format**: Title and body with optional action buttons
- **Integration**: Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNs)
- **Delivery**: Real-time via push notification services

### 4. In-App Notifications
- **Purpose**: System notifications within the application
- **Format**: Notification center with badge counts
- **Storage**: Database-stored notifications with read/unread status
- **Delivery**: Real-time via WebSocket or polling

## Notification Types

### 1. Task Due Soon
- **Trigger**: 1 hour before task due date
- **Channels**: Email, Push, In-app (with option for Slack)
- **Priority**: High
- **Content**: Task title, due date, project name

### 2. Daily Digest
- **Trigger**: Daily at user's preferred time
- **Channels**: Email, In-app
- **Priority**: Medium
- **Content**: Summary of upcoming tasks, completed tasks, and overdue items

### 3. Task Completed
- **Trigger**: When task is marked as completed
- **Channels**: In-app, Push (optional)
- **Priority**: Low
- **Content**: Task title, completion time

### 4. Team Collaboration
- **Trigger**: When task is assigned or mentioned
- **Channels**: Email, Slack, Push, In-app
- **Priority**: High
- **Content**: Task title, assigner, action required

### 5. System Notifications
- **Trigger**: System events (maintenance, updates, etc.)
- **Channels**: In-app, Email
- **Priority**: High
- **Content**: System message with severity level

## Kafka Event Schema

### Task Due Soon Event
```json
{
  "event_type": "task.due_soon",
  "task_id": "string",
  "user_id": "string",
  "task_title": "string",
  "due_date": "timestamp",
  "project_id": "string",
  "priority": "string",
  "timestamp": "timestamp"
}
```

### Daily Digest Event
```json
{
  "event_type": "daily.digest",
  "user_id": "string",
  "upcoming_tasks": [
    {
      "task_id": "string",
      "title": "string",
      "due_date": "timestamp"
    }
  ],
  "completed_tasks_count": "number",
  "overdue_tasks_count": "number",
  "timestamp": "timestamp"
}
```

## Notification Preferences

### User Preferences Schema
```json
{
  "user_id": "string",
  "email_enabled": "boolean",
  "email_frequency": "string", // immediate, daily, weekly, never
  "slack_enabled": "boolean",
  "push_enabled": "boolean",
  "in_app_enabled": "boolean",
  "daily_digest_time": "string", // HH:MM format
  "timezone": "string",
  "channel_preferences": {
    "task_due_soon": ["email", "push", "in_app"],
    "daily_digest": ["email"],
    "task_completed": ["in_app"],
    "team_collaboration": ["email", "slack", "push", "in_app"]
  }
}
```

## Delivery Guarantees

### 1. At-Most-Once
- Used for low-priority notifications
- May be dropped during high load

### 2. At-Least-Once
- Used for important notifications
- May be delivered multiple times

### 3. Exactly-Once
- Used for critical notifications
- Guaranteed delivery with deduplication

## Retry Strategy

- **Initial Delay**: 1 second
- **Max Retries**: 5
- **Backoff**: Exponential (1s, 2s, 4s, 8s, 16s)
- **Dead Letter Queue**: Failed notifications after max retries

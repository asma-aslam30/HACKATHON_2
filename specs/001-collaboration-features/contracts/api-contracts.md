# API Contracts: Todo App Collaboration Features

**Feature**: 001-collaboration-features
**Date**: 2025-12-27
**Version**: 1.0
**Status**: Draft

## Overview

This document defines the API contracts for the collaboration features in the Todo application. The APIs are built using Next.js API routes with Supabase as the backend data store.

## Authentication

All endpoints require authentication using Supabase's built-in authentication system. Requests must include the appropriate headers for Supabase auth.

## Endpoints

### 1. Todos Management

#### GET `/api/todos`

**Description**: Retrieve todos for the authenticated user, including shared lists if applicable

**Headers**:
- `Authorization: Bearer {token}` (Required)

**Query Parameters**:
- `sharedListId` (Optional): Filter todos by shared list ID
- `assignedToMe` (Optional): Filter todos assigned to the current user
- `completed` (Optional): Filter by completion status (true/false)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "completed": "boolean",
      "priority": "string",
      "dueDate": "string | null",
      "createdAt": "string",
      "updatedAt": "string",
      "userId": "string",
      "tags": ["string"],
      "sharedListId": "string | null",
      "assignedTo": ["string"],
      "version": "number",
      "lastModifiedBy": "string | null",
      "comments": [
        {
          "id": "string",
          "content": "string",
          "userId": "string",
          "createdAt": "string",
          "updatedAt": "string",
          "mentions": ["string"],
          "resolved": "boolean"
        }
      ]
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### POST `/api/todos`

**Description**: Create a new todo

**Headers**:
- `Authorization: Bearer {token}` (Required)
- `Content-Type: application/json`

**Body**:
```json
{
  "title": "string",
  "description": "string",
  "priority": "string",
  "dueDate": "string | null",
  "tags": ["string"],
  "sharedListId": "string | null",
  "assignedTo": ["string"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "completed": false,
    "priority": "string",
    "dueDate": "string | null",
    "createdAt": "string",
    "updatedAt": "string",
    "userId": "string",
    "tags": ["string"],
    "sharedListId": "string | null",
    "assignedTo": ["string"],
    "version": 1,
    "lastModifiedBy": "string | null"
  }
}
```

#### PUT `/api/todos/{id}`

**Description**: Update an existing todo

**Headers**:
- `Authorization: Bearer {token}` (Required)
- `Content-Type: application/json`

**Path Parameter**:
- `id`: Todo ID (Required)

**Body**:
```json
{
  "title": "string",
  "description": "string",
  "completed": "boolean",
  "priority": "string",
  "dueDate": "string | null",
  "tags": ["string"],
  "assignedTo": ["string"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "completed": "boolean",
    "priority": "string",
    "dueDate": "string | null",
    "createdAt": "string",
    "updatedAt": "string",
    "userId": "string",
    "tags": ["string"],
    "sharedListId": "string | null",
    "assignedTo": ["string"],
    "version": "number",
    "lastModifiedBy": "string | null"
  }
}
```

#### DELETE `/api/todos/{id}`

**Description**: Delete a todo

**Headers**:
- `Authorization: Bearer {token}` (Required)

**Path Parameter**:
- `id`: Todo ID (Required)

**Response**:
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

### 2. Comments Management

#### GET `/api/todos/{todoId}/comments`

**Description**: Retrieve comments for a specific todo

**Headers**:
- `Authorization: Bearer {token}` (Required)

**Path Parameter**:
- `todoId`: Todo ID (Required)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "content": "string",
      "userId": "string",
      "userName": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "mentions": ["string"],
      "resolved": "boolean"
    }
  ]
}
```

#### POST `/api/todos/{todoId}/comments`

**Description**: Add a comment to a todo

**Headers**:
- `Authorization: Bearer {token}` (Required)
- `Content-Type: application/json`

**Path Parameter**:
- `todoId`: Todo ID (Required)

**Body**:
```json
{
  "content": "string",
  "mentions": ["string"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "content": "string",
    "userId": "string",
    "userName": "string",
    "todoId": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "mentions": ["string"],
    "resolved": false
  }
}
```

### 3. Shared Lists Management

#### GET `/api/shared-lists`

**Description**: Retrieve shared lists for the authenticated user

**Headers**:
- `Authorization: Bearer {token}` (Required)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "ownerId": "string",
      "ownerName": "string",
      "permissions": "object",
      "createdAt": "string",
      "updatedAt": "string",
      "role": "string",
      "memberCount": "number"
    }
  ]
}
```

#### POST `/api/shared-lists`

**Description**: Create a new shared list

**Headers**:
- `Authorization: Bearer {token}` (Required)
- `Content-Type: application/json`

**Body**:
```json
{
  "name": "string",
  "description": "string",
  "permissions": "object"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "ownerId": "string",
    "permissions": "object",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 4. Share Links Management

#### POST `/api/shared-lists/{listId}/share-link`

**Description**: Generate a share link for a shared list

**Headers**:
- `Authorization: Bearer {token}` (Required)
- `Content-Type: application/json`

**Path Parameter**:
- `listId`: Shared list ID (Required)

**Body**:
```json
{
  "accessType": "string", // "public", "private", "team"
  "permissions": "string", // "read", "read_write"
  "expiresAt": "string | null",
  "maxUses": "number | null"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "listId": "string",
    "accessType": "string",
    "permissions": "string",
    "createdAt": "string",
    "expiresAt": "string | null",
    "createdBy": "string",
    "usageCount": "number",
    "maxUses": "number | null",
    "shareUrl": "string"
  }
}
```

### 5. Collaborations Management

#### GET `/api/shared-lists/{listId}/collaborators`

**Description**: Retrieve collaborators for a shared list

**Headers**:
- `Authorization: Bearer {token}` (Required)

**Path Parameter**:
- `listId`: Shared list ID (Required)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "userName": "string",
      "email": "string",
      "role": "string", // "viewer", "editor", "admin"
      "joinedAt": "string",
      "notificationsEnabled": "boolean"
    }
  ]
}
```

#### POST `/api/shared-lists/{listId}/collaborators`

**Description**: Add a collaborator to a shared list

**Headers**:
- `Authorization: Bearer {token}` (Required)
- `Content-Type: application/json`

**Path Parameter**:
- `listId`: Shared list ID (Required)

**Body**:
```json
{
  "userId": "string",
  "role": "string" // "viewer", "editor", "admin"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "listId": "string",
    "userId": "string",
    "role": "string",
    "joinedAt": "string",
    "notificationsEnabled": true
  }
}
```

### 6. Dashboard Analytics

#### GET `/api/dashboard/{listId}`

**Description**: Retrieve dashboard analytics for a shared list

**Headers**:
- `Authorization: Bearer {token}` (Required)

**Path Parameter**:
- `listId`: Shared list ID (Required)

**Response**:
```json
{
  "success": true,
  "data": {
    "listId": "string",
    "metrics": {
      "totalTasks": "number",
      "completedTasks": "number",
      "pendingTasks": "number",
      "completionRate": "number",
      "overdueTasks": "number",
      "tasksByPriority": {
        "high": "number",
        "medium": "number",
        "low": "number",
        "none": "number"
      },
      "tasksByAssignee": {
        "userId": "number"
      },
      "completionByAssignee": {
        "userId": {
          "total": "number",
          "completed": "number"
        }
      }
    },
    "recentActivity": [
      {
        "id": "string",
        "type": "string",
        "taskId": "string",
        "taskTitle": "string",
        "timestamp": "string",
        "action": "string"
      }
    ],
    "collaborators": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "string",
        "contribution": {
          "completedTasks": "number",
          "assignedTasks": "number"
        }
      }
    ]
  }
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

### Common Error Codes

- `AUTH_001`: Unauthorized - User not authenticated
- `PERMISSION_001`: Forbidden - Insufficient permissions
- `VALIDATION_001`: Bad Request - Invalid input data
- `NOT_FOUND_001`: Not Found - Resource does not exist
- `INTERNAL_ERROR`: Internal Server Error - Something went wrong
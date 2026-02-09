# CLI Contract: Todo App Collaboration Features

**Feature**: 001-collaboration-features
**Date**: 2025-12-27
**Interface**: Command Line Interface Extension

---

## Overview

This document specifies the CLI contract extensions for collaboration features. The existing CLI menu system will be enhanced with new options for sharing, comments, assignments, and team dashboards.

---

## New Menu Options

### Main Menu Extensions

**Option 14**: `Share List` - Generate and manage shareable links for todo lists
**Option 15**: `View Comments` - Browse comments on shared tasks
**Option 16**: `Assign Task` - Assign tasks to team members
**Option 17**: `Team Dashboard` - View team progress and analytics
**Option 18**: `Join Shared List` - Join a list using a share link

---

## Command Specifications

### 1. Share List Functionality (Option 14)

**Command**: `share-list` (accessible via menu option 14)

**Input Flow**:
1. Select existing todo list to share
2. Choose access level: `public`, `private`, or `team`
3. Set permissions: `read-only` or `read-write`
4. Set expiration (optional)
5. Generate share link

**Output**:
- Success: Display shareable link with access instructions
- Error: Clear error message (e.g., "No lists available to share")

**Validation**:
- User must own the list or have admin permissions
- Maximum 5 shared links per list
- Expiration date must be in the future if specified

### 2. Comments Management (Option 15)

**Command**: `view-comments` (accessible via menu option 15)

**Input Flow**:
1. Select shared list (if multiple)
2. Select task within list
3. View chronological comment thread
4. Option to add new comment

**Output**:
- Success: Display comment timeline with author and timestamp
- Error: "No comments found" or "Access denied"

**Validation**:
- User must have read access to the list
- Comments must be 1-1000 characters
- @mentions must reference valid team members

### 3. Task Assignment (Option 16)

**Command**: `assign-task` (accessible via menu option 16)

**Input Flow**:
1. Select shared list (if multiple)
2. Select task within list
3. Choose assignee from team members
4. Set priority (optional)
5. Set due date (optional)

**Output**:
- Success: Confirmation with assignee notification
- Error: "User not found" or "Insufficient permissions"

**Validation**:
- User must have editor or admin permissions
- Assignee must have access to the list
- Maximum 5 assignees per task

### 4. Team Dashboard (Option 17)

**Command**: `team-dashboard` (accessible via menu option 17)

**Input Flow**:
1. Select team/shared list to view
2. Choose dashboard view: `overview`, `progress`, or `analytics`

**Output**:
- Success: Display formatted dashboard with metrics
- Error: "No team data available"

**Dashboard Metrics**:
- Total tasks vs completed tasks
- Individual user contributions
- Average completion time
- Active assignments
- Recent activity feed

### 5. Join Shared List (Option 18)

**Command**: `join-list` (accessible via menu option 18)

**Input Flow**:
1. Enter share link or code
2. Request access if required
3. Accept terms and notifications

**Output**:
- Success: List added to user's todo lists
- Error: "Invalid link" or "Access denied"

**Validation**:
- Share link must be valid and not expired
- User must have permission to join
- Maximum 10 shared lists per user

---

## New CLI Commands

### Command: `share`
**Description**: Share the current list or a specific list
**Usage**: `node index.js share [list-id] [options]`
**Options**:
- `--access [public|private|team]`: Set access level
- `--permissions [read|read-write]`: Set permissions
- `--expires [YYYY-MM-DD]`: Set expiration date
- `--list [list-id]`: Specify list to share

### Command: `comment`
**Description**: Add or view comments on a task
**Usage**: `node index.js comment [task-id] [comment-text]`
**Options**:
- `--task [task-id]`: Specify task
- `--list [list-id]`: Specify list if multiple
- `--view`: View existing comments only

### Command: `assign`
**Description**: Assign a task to a team member
**Usage**: `node index.js assign [task-id] [user-id]`
**Options**:
- `--task [task-id]`: Specify task
- `--user [user-id]`: Specify assignee
- `--priority [low|medium|high]`: Set priority
- `--due [YYYY-MM-DD]`: Set due date

### Command: `dashboard`
**Description**: View team dashboard
**Usage**: `node index.js dashboard [options]`
**Options**:
- `--list [list-id]`: Specify list
- `--view [overview|progress|analytics]`: Dashboard view type
- `--export [format]`: Export dashboard data

---

## Error Handling

### Common Error Codes

| Code | Description | Action |
|------|-------------|---------|
| COLLAB_001 | Invalid share link | Verify link and try again |
| COLLAB_002 | Insufficient permissions | Contact list owner |
| COLLAB_003 | Maximum links reached | Remove existing links first |
| COLLAB_004 | User not found | Verify username/email |
| COLLAB_005 | List not found | Check list ID or refresh |
| COLLAB_006 | Assignment limit reached | Remove existing assignments first |
| COLLAB_007 | Comment too long | Limit to 1000 characters |
| COLLAB_008 | Invalid date format | Use YYYY-MM-DD format |

### Error Response Format

All CLI commands return structured error messages:

```
Error [CODE]: [Description]
Suggestion: [How to resolve]
```

---

## Authentication Requirements

### Public Share Links
- No authentication required to view (read-only)
- Authentication required to make changes
- Anonymous temporary accounts for quick collaboration

### Private/Team Share Links
- Valid user account required
- Explicit permission from list owner required
- Role-based access control (viewer, editor, admin)

### Owner Functions
- List creation and sharing
- Permission management
- Assignment management
- Dashboard administration

---

## Data Validation

### Input Validation Rules

1. **Text Fields**:
   - Minimum 1 character, maximum 1000 characters
   - No HTML/JavaScript injection allowed
   - Sanitized before storage

2. **Dates**:
   - Must be in YYYY-MM-DD format
   - Cannot be in the past (for due dates)
   - Valid calendar dates only

3. **User IDs**:
   - Must match existing users
   - Valid email format for new invites
   - Proper permissions verification

4. **Share Links**:
   - Unique identifier generation
   - Expiration validation
   - Access level verification

---

## Notification System

### Notification Types

1. **Assignment Notifications**: When a user is assigned to a task
2. **Mention Notifications**: When a user is @mentioned in comments
3. **Update Notifications**: When assigned tasks are updated
4. **Join Notifications**: When new users join a shared list

### Notification Delivery

- In-app notifications (CLI display)
- Email notifications (configurable)
- Push notifications (if available)

---

## Performance Requirements

### Response Times

- Share link generation: < 1 second
- Comment addition: < 2 seconds
- Dashboard loading: < 3 seconds
- List joining: < 2 seconds
- Assignment creation: < 1 second

### Concurrency

- Support up to 10 simultaneous users per shared list
- Handle 50 concurrent operations per list
- Maintain real-time sync under load

---

## Security Considerations

### Data Protection

- All user data encrypted in transit and at rest
- Share links have configurable expiration
- Access logs maintained for audit purposes
- Rate limiting to prevent abuse

### Authentication

- OAuth 2.0 or Firebase Authentication integration
- Session management with configurable timeouts
- Multi-factor authentication support (if available)
- Secure credential storage

---

## Backward Compatibility

### Existing Commands

All existing CLI commands continue to function unchanged:
- `add`, `list`, `complete`, `delete` work as before
- Local-only lists remain fully functional
- All Phase 1-4 features continue to work

### Migration Path

- Existing local tasks become user's "personal" shared list
- No data loss during collaboration feature activation
- Users can disable collaboration features and return to local-only mode
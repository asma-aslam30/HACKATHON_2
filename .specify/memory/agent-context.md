# Agent Context: Todo App Collaboration Features

## Overview
This document provides context for AI agents working on the Todo App Phase 2 - Claude Skills Workflow feature. The feature implements collaboration capabilities including sharing, real-time sync, comments, assignments, and dashboards.

## Feature Details
- **Feature ID**: 001-collaboration-features
- **Title**: Todo App Collaboration Features
- **Description**: Add sharing, real-time sync, comments, assignments, dashboards
- **Priority**: Medium
- **Status**: Implementation in progress

## Technical Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **ORM**: Prisma
- **State Management**: Zustand
- **Authentication**: Supabase Auth with OAuth (Google, GitHub)
- **Real-time**: Supabase Realtime with PostgreSQL LISTEN/NOTIFY
- **UI Components**: Custom components with Tailwind CSS

## Key Data Models
1. **User**: Extended from Phase 1 with collaboration capabilities
2. **Todo**: Extended with sharedListId, assignedTo, version, lastModifiedBy
3. **Comment**: For task discussions with @mentions support
4. **SharedList**: Represents shared todo lists with access controls
5. **Collaboration**: Junction table for user-list relationships
6. **ShareLink**: For generating shareable links with permissions

## API Endpoints
- `/api/todos` - CRUD operations for todos with collaboration features
- `/api/todos/:id/comments` - Comments management
- `/api/shared-lists` - Shared lists management
- `/api/shared-lists/:id/share-link` - Share link generation
- `/api/shared-lists/:id/collaborators` - Collaborator management
- `/api/dashboard/:id` - Dashboard analytics

## Key Implementation Points
1. **Real-time Sync**: Using Supabase Realtime for live updates across users
2. **Conflict Resolution**: Last-write-wins with version tracking and user notifications
3. **Access Controls**: Row-level security with Supabase policies
4. **Offline Support**: Local caching with sync when connection restored
5. **Authentication**: Supabase Auth with OAuth providers
6. **Sharing**: Configurable permissions via share links

## User Flows
1. **Share List**: Generate link → set permissions → share with others
2. **Real-time Updates**: Connected users see changes instantly
3. **Comments**: Add comments with @mentions → notified users see updates
4. **Assignments**: Assign tasks to team members → notifications sent
5. **Dashboard**: View team progress and analytics

## Files to Modify
- `/components/` - New UI components for collaboration features
- `/lib/` - Services for Supabase integration and collaboration logic
- `/pages/` - Next.js pages for the UI
- `/__tests__/` - Tests for new functionality
- `/prisma/schema.prisma` - Updated data model

## Security Considerations
- Row-level security in Supabase database
- Authentication required for all operations
- Permission checks for shared list access
- Rate limiting for API endpoints

## Performance Targets
- Real-time sync under 2 seconds
- Share link generation under 30 seconds
- 95% user success rate for joining shared lists
- 25% improvement in team productivity metrics

## Error Handling
- Graceful degradation when offline
- Clear error messages for users
- Proper validation of inputs
- Conflict resolution notifications

## Testing Strategy
- Unit tests for service layer functions
- Integration tests for API endpoints
- Component tests for UI elements
- End-to-end tests for user flows

## Deployment Notes
- Environment variables for Supabase configuration
- Database migration scripts
- OAuth provider setup
- Vercel deployment configuration
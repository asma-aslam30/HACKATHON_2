# UI Layout & Components Skill

**Purpose**: Design Next.js pages and reusable Tailwind UI components for Evolution of Todo hackathon phases II-III with responsive, accessible, mobile-first layouts

**Owner**: Frontend UI/UX Agent + AI Chatbot Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **UI Layout & Components Skill** enables systematic design of user interfaces following modern web standards:
- Design Next.js page layouts with wireframes (TaskListPage, TaskDetailPage, ChatDashboard)
- Create reusable Tailwind UI components (TaskCard, FilterDropdown, ChatBubble)
- Implement responsive design (mobile-first with Tailwind breakpoints)
- Ensure accessibility compliance (WCAG 2.1 AA standards)
- Support dark mode (Tailwind dark: variant)
- Generate component specifications for implementation

This skill produces detailed UI specifications that developers can directly implement with Next.js and Tailwind CSS.

---

## Skill Components

### 1. Page Layouts for Phase II-III

**Phase II (Web App)**:
- **TaskListPage**: Main dashboard with task grid, filters, search, and actions
- **TaskDetailPage**: Single task view with edit form, metadata, and actions
- **TaskCreatePage**: Form to add new tasks with validation
- **LoginPage**: Authentication with email/password
- **RegisterPage**: User registration form

**Phase III (AI Chatbot)**:
- **ChatDashboard**: Conversational interface with chat history
- **ChatWindow**: Active conversation with message bubbles
- **ToolCallsPanel**: Display MCP tool executions in real-time

### 2. Reusable Tailwind Components

**Task Components**:
- **TaskCard**: Task display with priority, status, and actions
- **TaskGrid**: Responsive grid layout for multiple tasks
- **PriorityBadge**: Colored badge for priority levels (high/medium/low)
- **StatusChip**: Status indicator (pending/completed)
- **DueDateDisplay**: Due date with visual urgency indicator

**Filter & Search Components**:
- **FilterDropdown**: Multi-select dropdown for status/priority/tags
- **SearchBar**: Text search with debouncing
- **FilterBar**: Container for multiple filters
- **SortSelector**: Sort by created date, priority, due date

**Chat Components** (Phase III):
- **ChatBubble**: User and AI message styling
- **TypingIndicator**: Animated dots for AI thinking
- **ToolCallDisplay**: Visual representation of MCP tool execution
- **ConversationList**: Chat history sidebar

**Form Components**:
- **TextField**: Text input with label and validation
- **TextArea**: Multi-line text input
- **Select**: Dropdown selector
- **Button**: Primary, secondary, danger variants
- **FormError**: Error message display

**Layout Components**:
- **AppShell**: Main layout with header, sidebar, content
- **Header**: Top navigation with user menu
- **Sidebar**: Navigation menu (collapsible on mobile)
- **EmptyState**: Placeholder when no data

### 3. Responsive Design Strategy

**Mobile-First Approach**:
- Base styles for mobile (< 640px)
- Tablet breakpoint (sm: 640px)
- Desktop breakpoint (md: 768px, lg: 1024px, xl: 1280px)
- Responsive grid (1 column → 2 columns → 3 columns)
- Touch-friendly targets (min 44x44px)

**Tailwind Breakpoints**:
```css
/* Mobile (default) */
.grid-cols-1

/* Tablet (640px+) */
sm:grid-cols-2

/* Desktop (1024px+) */
lg:grid-cols-3

/* Large Desktop (1280px+) */
xl:grid-cols-4
```

### 4. Accessibility Standards (WCAG 2.1 AA)

**Required Attributes**:
- `role` attributes (button, article, navigation)
- `aria-label` for icon buttons
- `aria-labelledby` for form fields
- `aria-expanded` for dropdowns
- `aria-checked` for checkboxes

**Keyboard Navigation**:
- `tabindex` for focusable elements
- Focus indicators (`focus:ring-2 focus:ring-blue-500`)
- Escape key to close modals/dropdowns

**Color Contrast**:
- Text contrast ratio ≥ 4.5:1 (WCAG AA)
- Interactive elements contrast ≥ 3:1

**Screen Reader Support**:
- Semantic HTML (header, nav, main, article)
- Hidden labels for screen readers (`sr-only`)

### 5. Dark Mode Support

**Tailwind Dark Mode**:
```css
/* Light mode (default) */
bg-white text-gray-900

/* Dark mode */
dark:bg-gray-800 dark:text-gray-100
```

**Color Palette**:
- Light: White backgrounds, gray text
- Dark: Gray-800/900 backgrounds, gray-100/200 text

---

## Skill Instructions

### Step 1: Define Page Layout

Create page structure with wireframe.

**Template**:
```markdown
## [Page Name]

**Route**: [/path]
**Phase**: [II or III]
**Type**: [Server Component | Client Component]

### Purpose
[1-2 sentence description of page purpose]

### Layout Structure
[ASCII wireframe showing layout regions]

### Sections
1. **[Section Name]**
   - Description: [What this section contains]
   - Components: [List of components used]
   - Responsive behavior: [How it adapts to mobile/tablet/desktop]

### Data Requirements
- [Data needed from API]
- [State management needed]

### User Actions
- [Interactive elements and their behavior]

### Accessibility
- [WCAG requirements]
- [Keyboard navigation]

### Responsive Breakpoints
- Mobile (default): [Layout description]
- Tablet (sm:640px): [Layout changes]
- Desktop (lg:1024px): [Layout changes]
```

---

#### Example: TaskListPage

```markdown
## TaskListPage

**Route**: `/tasks`
**Phase**: II (Web App)
**Type**: Server Component (data fetching) + Client Component (interactions)

### Purpose
Main dashboard for viewing all user tasks with filtering, searching, and quick actions.

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ Header                                               │
│  [Logo]  Tasks               [+ Add] [Profile]      │
├─────────────────────────────────────────────────────┤
│ FilterBar                                            │
│  [Search]  [Status ▾]  [Priority ▾]  [Sort ▾]      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Task Grid (Responsive)                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ TaskCard │  │ TaskCard │  │ TaskCard │          │
│  │  [High]  │  │ [Medium] │  │  [Low]   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ TaskCard │  │ TaskCard │  │ TaskCard │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                      │
│  [Load More]                                         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Sections

1. **Header**
   - Description: Top navigation with branding and user actions
   - Components: `Header`, `Button` (+ Add Task), `UserMenu`
   - Responsive: Full width, hamburger menu on mobile

2. **FilterBar**
   - Description: Search and filter controls
   - Components: `SearchBar`, `FilterDropdown` (x3), `SortSelector`
   - Responsive: Stacked on mobile, horizontal on desktop

3. **Task Grid**
   - Description: Responsive grid of task cards
   - Components: `TaskGrid`, `TaskCard` (repeated)
   - Responsive: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)

4. **Empty State** (when no tasks)
   - Description: Helpful message and CTA when no tasks exist
   - Components: `EmptyState`, `Button`
   - Responsive: Centered on all breakpoints

### Data Requirements
- Fetch tasks from API: `GET /api/{user_id}/tasks`
- Filters applied client-side or via query params
- Real-time updates (optional Phase III enhancement)

### User Actions
- **Search**: Debounced text search on title/description
- **Filter by Status**: Dropdown to show pending/completed
- **Filter by Priority**: Dropdown to show high/medium/low
- **Sort**: By created date, priority, due date
- **View Task**: Click card → Navigate to `/tasks/{id}`
- **Quick Complete**: Checkbox on card to mark complete
- **Delete Task**: Delete icon → Confirm modal → API call

### Accessibility
- **Keyboard Navigation**: Tab through cards, Enter to open
- **Screen Reader**: Announce task count, filter changes
- **Focus Indicators**: Blue ring on focused elements
- **Color Independence**: Don't rely solely on color for status

### Responsive Breakpoints
- **Mobile (default < 640px)**:
  - Single column grid
  - Stacked filters (vertical)
  - Hamburger menu in header
  - 44px touch targets

- **Tablet (sm: 640px - 1023px)**:
  - 2 column grid
  - Horizontal filter bar
  - Expanded header

- **Desktop (lg: 1024px+)**:
  - 3 column grid
  - All filters visible
  - Hover effects on cards

### Implementation Notes
- Use Next.js App Router (server component for initial data)
- Client components for filters and interactions
- Optimistic updates for quick complete
- Skeleton loaders during data fetch
```

---

#### Example: ChatDashboard (Phase III)

```markdown
## ChatDashboard

**Route**: `/chat`
**Phase**: III (AI Chatbot)
**Type**: Client Component (real-time interactions)

### Purpose
Conversational interface for task management via AI chatbot with MCP tool integration.

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ Header                                               │
│  [Logo]  AI Assistant             [Profile]         │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│ Conversation │  Active Chat Window                   │
│ List         │  ┌─────────────────────────────────┐ │
│ (Sidebar)    │  │ User: Add task "Buy milk"       │ │
│              │  └─────────────────────────────────┘ │
│ [+ New]      │  ┌─────────────────────────────────┐ │
│              │  │ AI: I'll add that task for you  │ │
│ Chat 1       │  │ [Tool: add_task]                │ │
│ Chat 2 ✓     │  │ ✓ Task created successfully      │ │
│ Chat 3       │  └─────────────────────────────────┘ │
│              │  ┌─────────────────────────────────┐ │
│              │  │ ...typing                        │ │
│              │  └─────────────────────────────────┘ │
│              │                                       │
│              │  [Type your message...] [Send]       │
└──────────────┴──────────────────────────────────────┘
```

### Sections

1. **Conversation List (Sidebar)**
   - Description: List of past conversations
   - Components: `ConversationList`, `ConversationItem`, `Button` (+ New)
   - Responsive: Collapsible drawer on mobile, fixed sidebar on desktop

2. **Chat Window**
   - Description: Active conversation with message history
   - Components: `ChatWindow`, `ChatBubble` (user/AI), `ToolCallDisplay`, `TypingIndicator`
   - Responsive: Full width on mobile, flex-1 on desktop

3. **Message Input**
   - Description: Text input for user messages
   - Components: `MessageInput`, `Button` (Send)
   - Responsive: Fixed at bottom, full width

### Data Requirements
- Fetch conversation history: `GET /api/chat/conversations`
- Fetch messages for active conversation: `GET /api/chat/{conversation_id}/messages`
- Real-time message streaming (Server-Sent Events or WebSocket)
- MCP tool execution status updates

### User Actions
- **Send Message**: Type and press Enter or click Send
- **Start New Chat**: Click + New button
- **Switch Conversation**: Click conversation in sidebar
- **View Tool Calls**: Expand tool execution details
- **Copy Message**: Copy button on AI responses

### Accessibility
- **Keyboard Navigation**: Tab to input, Enter to send
- **Screen Reader**: Announce new messages, tool results
- **Focus Management**: Focus input after tool execution
- **Live Regions**: `aria-live="polite"` for new messages

### Responsive Breakpoints
- **Mobile (default < 768px)**:
  - Full-screen chat window
  - Sidebar as slide-out drawer
  - Fixed message input at bottom

- **Desktop (md: 768px+)**:
  - Split layout (sidebar + chat)
  - Sidebar width: 280px
  - Chat window flex-1

### Implementation Notes
- Use ChatKit UI components (Phase III)
- MCP tool server integration for task operations
- Streaming responses with React Server Components
- Optimistic UI updates for messages
```

---

### Step 2: Design Reusable Components

Create component specifications with props and variants.

**Template**:
```markdown
## [Component Name]

**Type**: [Server Component | Client Component]
**File**: `components/[ComponentName].tsx`

### Purpose
[1 sentence description]

### Props Interface
\`\`\`typescript
interface [ComponentName]Props {
  [prop]: [type];  // Description
  [prop]?: [type]; // Optional: Description
}
\`\`\`

### Variants
- **[Variant Name]**: [Description and use case]

### Tailwind Classes
\`\`\`css
[List of Tailwind classes used]
\`\`\`

### Accessibility
- [WCAG requirements]
- [ARIA attributes]

### Example Usage
\`\`\`tsx
<ComponentName prop="value" />
\`\`\`

### Visual Example
[ASCII art or description of appearance]
```

---

#### Example: TaskCard Component

```markdown
## TaskCard

**Type**: Client Component (for interactivity)
**File**: `components/TaskCard.tsx`

### Purpose
Display a single task with priority badge, status indicator, and quick actions.

### Props Interface
```typescript
interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;  // ISO date string
  createdAt: string;
  onComplete?: (id: number) => void;
  onDelete?: (id: number) => void;
}
```

### Variants
- **Default**: Standard card with all information
- **Compact**: Smaller version for mobile (no description)
- **Completed**: Grayed out with strikethrough title

### Tailwind Classes
```css
/* Container */
bg-white dark:bg-gray-800
shadow-md hover:shadow-xl
rounded-xl
border border-gray-200 dark:border-gray-700
p-4
transition-all duration-200

/* Title */
text-lg font-semibold
text-gray-900 dark:text-gray-100

/* Description */
text-sm text-gray-600 dark:text-gray-400
line-clamp-2

/* Actions */
flex gap-2
text-blue-500 hover:text-blue-600
text-red-500 hover:text-red-600
```

### Accessibility
- **Role**: `role="article"` on container
- **Label**: `aria-labelledby` pointing to title ID
- **Actions**: `aria-label` on icon buttons ("View task: {title}", "Delete task: {title}")
- **Keyboard**: Tab to focus, Enter to open, Delete key to delete (with confirmation)

### Example Usage
```tsx
<TaskCard
  id={1}
  title="Buy milk"
  description="2 liters low fat"
  status="pending"
  priority="high"
  dueDate="2025-12-25T00:00:00Z"
  createdAt="2025-12-24T10:00:00Z"
  onComplete={(id) => handleComplete(id)}
  onDelete={(id) => handleDelete(id)}
/>
```

### Visual Example
```
┌────────────────────────────────────────┐
│  Buy milk                    [HIGH] ⭐ │
│                                         │
│  2 liters low fat                       │
│                                         │
│  ⏰ Due: Dec 25          [pending] 🔵   │
│  📅 Created: Dec 24                     │
│                                         │
│  [View] [✓ Complete] [🗑️ Delete]        │
└────────────────────────────────────────┘
```

### Implementation Code
```tsx
'use client';

import { useState } from 'react';
import { PriorityBadge } from './PriorityBadge';
import { StatusChip } from './StatusChip';
import { formatDate } from '@/lib/utils';

interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  createdAt: string;
  onComplete?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  dueDate,
  createdAt,
  onComplete,
  onDelete,
}: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;

    setIsDeleting(true);
    try {
      await onDelete?.(id);
    } catch (error) {
      alert('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article
      role="article"
      aria-labelledby={`task-title-${id}`}
      className={`
        bg-white dark:bg-gray-800
        shadow-md hover:shadow-xl
        rounded-xl
        border border-gray-200 dark:border-gray-700
        p-4
        transition-all duration-200
        ${status === 'completed' ? 'opacity-60' : ''}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3
          id={`task-title-${id}`}
          className={`
            text-lg font-semibold
            text-gray-900 dark:text-gray-100
            ${status === 'completed' ? 'line-through' : ''}
          `}
        >
          {title}
        </h3>
        <PriorityBadge priority={priority} />
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs text-gray-500 space-y-1">
          {dueDate && (
            <div className="flex items-center gap-1">
              <span>⏰ Due:</span>
              <span>{formatDate(dueDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span>📅 Created:</span>
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
        <StatusChip status={status} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <a
          href={`/tasks/${id}`}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          aria-label={`View task: ${title}`}
        >
          View
        </a>
        {status === 'pending' && (
          <button
            onClick={() => onComplete?.(id)}
            className="text-green-500 hover:text-green-600 text-sm font-medium"
            aria-label={`Complete task: ${title}`}
          >
            ✓ Complete
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-600 text-sm font-medium disabled:opacity-50"
          aria-label={`Delete task: ${title}`}
        >
          {isDeleting ? 'Deleting...' : '🗑️ Delete'}
        </button>
      </div>
    </article>
  );
}
```
```

---

#### Example: ChatBubble Component (Phase III)

```markdown
## ChatBubble

**Type**: Client Component
**File**: `components/ChatBubble.tsx`

### Purpose
Display a single message in the chat interface (user or AI) with styling differentiation.

### Props Interface
```typescript
interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];  // MCP tool executions
  isStreaming?: boolean;   // True while AI is generating response
}

interface ToolCall {
  name: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  status: 'pending' | 'success' | 'error';
}
```

### Variants
- **User Message**: Right-aligned, blue background
- **AI Message**: Left-aligned, gray background
- **Tool Call**: Embedded tool execution display
- **Streaming**: With typing indicator animation

### Tailwind Classes
```css
/* User Message */
ml-auto max-w-[80%]
bg-blue-500 text-white
rounded-2xl rounded-br-sm
px-4 py-2

/* AI Message */
mr-auto max-w-[80%]
bg-gray-200 dark:bg-gray-700
text-gray-900 dark:text-gray-100
rounded-2xl rounded-bl-sm
px-4 py-2

/* Tool Call */
bg-blue-50 dark:bg-blue-900/20
border-l-4 border-blue-500
rounded-lg p-3 my-2
```

### Accessibility
- **Role**: `role="article"` on container
- **Label**: `aria-label="{role} message at {time}"`
- **Live Region**: `aria-live="polite"` for streaming messages
- **Screen Reader**: Announce tool call results

### Example Usage
```tsx
<ChatBubble
  role="user"
  content="Add task 'Buy milk'"
  timestamp="2025-12-24T10:30:00Z"
/>

<ChatBubble
  role="assistant"
  content="I'll add that task for you."
  timestamp="2025-12-24T10:30:05Z"
  toolCalls={[
    {
      name: 'add_task',
      input: { title: 'Buy milk' },
      output: { id: 1, title: 'Buy milk' },
      status: 'success'
    }
  ]}
/>
```

### Visual Example
```
User Message:
                ┌────────────────────────────┐
                │ Add task "Buy milk"        │
                │ 10:30 AM                   │
                └────────────────────────────┘

AI Message:
┌────────────────────────────────────────┐
│ I'll add that task for you.            │
│                                         │
│ ┌────────────────────────────────────┐ │
│ │ 🔧 Tool: add_task                  │ │
│ │ Input: { title: "Buy milk" }       │ │
│ │ ✓ Task created successfully        │ │
│ └────────────────────────────────────┘ │
│ 10:30 AM                                │
└────────────────────────────────────────┘
```

### Implementation Code
```tsx
'use client';

import { formatTime } from '@/lib/utils';
import { ToolCallDisplay } from './ToolCallDisplay';
import { TypingIndicator } from './TypingIndicator';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}

export function ChatBubble({
  role,
  content,
  timestamp,
  toolCalls,
  isStreaming,
}: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <article
      role="article"
      aria-label={`${role} message at ${formatTime(timestamp)}`}
      className={`
        flex flex-col mb-4
        ${isUser ? 'items-end' : 'items-start'}
      `}
    >
      {/* Message Bubble */}
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-2
          ${isUser
            ? 'bg-blue-500 text-white rounded-br-sm ml-auto'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm mr-auto'
          }
        `}
      >
        <p className="whitespace-pre-wrap break-words">
          {content}
        </p>

        {/* Tool Calls (AI only) */}
        {!isUser && toolCalls && toolCalls.length > 0 && (
          <div className="mt-3 space-y-2">
            {toolCalls.map((toolCall, index) => (
              <ToolCallDisplay key={index} {...toolCall} />
            ))}
          </div>
        )}

        {/* Streaming Indicator */}
        {isStreaming && <TypingIndicator />}
      </div>

      {/* Timestamp */}
      <span className="text-xs text-gray-500 mt-1 px-2">
        {formatTime(timestamp)}
      </span>
    </article>
  );
}
```
```

---

### Step 3: Define Responsive Behavior

Specify how components adapt to different screen sizes.

**Template**:
```markdown
## Responsive Design

### Breakpoint Strategy
- **Mobile**: < 640px (sm) - Touch-first, vertical layouts
- **Tablet**: 640px - 1023px (sm-lg) - Mixed layouts
- **Desktop**: ≥ 1024px (lg) - Horizontal layouts, hover states

### Component Adaptations
- **[Component Name]**:
  - Mobile: [Behavior]
  - Tablet: [Behavior]
  - Desktop: [Behavior]
```

**Example**:
```markdown
## Responsive Design

### Breakpoint Strategy
- **Mobile**: < 640px - 1 column grid, stacked filters, drawer navigation
- **Tablet**: 640px - 1023px - 2 column grid, horizontal filters
- **Desktop**: ≥ 1024px - 3 column grid, all features visible, hover effects

### Component Adaptations

**TaskGrid**:
- Mobile: `grid-cols-1` (single column, full width cards)
- Tablet: `sm:grid-cols-2` (2 columns, cards side-by-side)
- Desktop: `lg:grid-cols-3 xl:grid-cols-4` (3-4 columns based on screen)

**FilterBar**:
- Mobile: `flex-col gap-2` (stacked vertically, each filter full width)
- Tablet: `sm:flex-row sm:gap-4` (horizontal row with spacing)
- Desktop: `lg:justify-between` (spread across available space)

**Sidebar**:
- Mobile: `hidden` + drawer overlay with `fixed inset-0 z-50` when open
- Tablet: `sm:block sm:w-64` (visible, fixed width)
- Desktop: `lg:w-80` (wider for more content)

**ChatWindow**:
- Mobile: `h-[calc(100vh-140px)]` (full screen minus header/input)
- Desktop: `md:h-[600px]` (fixed height with scroll)

**Touch Targets** (Mobile):
- Minimum size: `min-h-[44px] min-w-[44px]` (WCAG 2.5.5)
- Padding: `p-3` instead of `p-2` on mobile
- Spacing: `gap-3` instead of `gap-2` for better tap accuracy
```

---

### Step 4: Ensure Accessibility Compliance

Verify WCAG 2.1 AA standards are met.

**Checklist**:
```markdown
## Accessibility Compliance (WCAG 2.1 AA)

### ✅ Perceivable
- [ ] Color contrast ≥ 4.5:1 for text (use WebAIM contrast checker)
- [ ] Alternative text for images and icons
- [ ] Captions for videos (if applicable)
- [ ] Content not solely dependent on color

### ✅ Operable
- [ ] Keyboard accessible (Tab, Enter, Escape, Arrow keys)
- [ ] No keyboard traps
- [ ] Skip links for navigation
- [ ] Focus indicators visible (ring-2 ring-blue-500)
- [ ] Touch targets ≥ 44x44px

### ✅ Understandable
- [ ] Clear labels for form fields
- [ ] Error messages with suggestions
- [ ] Consistent navigation across pages
- [ ] Predictable interactions

### ✅ Robust
- [ ] Valid HTML5 semantic markup
- [ ] ARIA attributes where needed
- [ ] Tested with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Works in all major browsers
```

**Example Implementation**:
```tsx
// ✅ Good Accessibility
<button
  onClick={handleDelete}
  aria-label="Delete task: Buy milk"
  className="
    min-h-[44px] min-w-[44px]
    focus:ring-2 focus:ring-blue-500 focus:outline-none
    text-red-500 hover:text-red-600
  "
>
  🗑️
</button>

// ❌ Bad Accessibility
<div onClick={handleDelete}>  {/* Not keyboard accessible */}
  <span>❌</span>  {/* No label for screen readers */}
</div>
```

---

### Step 5: Generate Output Specifications

Create `specs/ui/pages.md` and `specs/ui/components.md` files.

**File Structure**:
```
specs/
├── ui/
│   ├── pages.md            # All page layouts
│   ├── components.md       # All reusable components
│   ├── responsive.md       # Responsive design guide
│   └── accessibility.md    # Accessibility checklist
```

**Example: specs/ui/pages.md**:
```markdown
# UI Pages Specification - Evolution of Todo

**Phase**: II-III
**Framework**: Next.js 15+ with App Router
**Styling**: Tailwind CSS v4
**Accessibility**: WCAG 2.1 AA

---

## Pages Overview

| Page | Route | Phase | Type | Purpose |
|------|-------|-------|------|---------|
| TaskListPage | /tasks | II | Server + Client | Main dashboard |
| TaskDetailPage | /tasks/[id] | II | Server + Client | Single task view |
| TaskCreatePage | /tasks/new | II | Client | Create new task |
| ChatDashboard | /chat | III | Client | AI chatbot interface |
| LoginPage | /login | II | Client | User authentication |
| RegisterPage | /register | II | Client | User registration |

---

[Include full page specifications from Step 1]
```

**Example: specs/ui/components.md**:
```markdown
# UI Components Specification - Evolution of Todo

**Phase**: II-III
**Framework**: React 19+ with TypeScript
**Styling**: Tailwind CSS v4
**Accessibility**: WCAG 2.1 AA

---

## Components Overview

### Task Components
- TaskCard - Display single task with actions
- TaskGrid - Responsive grid layout
- PriorityBadge - Priority level indicator
- StatusChip - Task status indicator
- DueDateDisplay - Due date with urgency

### Filter Components
- FilterDropdown - Multi-select filter
- SearchBar - Debounced text search
- FilterBar - Container for filters
- SortSelector - Sort options

### Chat Components (Phase III)
- ChatBubble - Message display
- TypingIndicator - AI thinking animation
- ToolCallDisplay - MCP tool execution
- ConversationList - Chat history

### Form Components
- TextField - Text input with validation
- TextArea - Multi-line input
- Select - Dropdown selector
- Button - Action buttons
- FormError - Error display

### Layout Components
- AppShell - Main layout
- Header - Top navigation
- Sidebar - Side navigation
- EmptyState - No data placeholder

---

[Include full component specifications from Step 2]
```

---

## Complete Examples

### Example 1: TaskListPage (Full Specification)

```markdown
# TaskListPage Specification

**Route**: `/tasks`
**Phase**: II (Web App)
**Type**: Server Component (data) + Client Components (interactions)
**File**: `app/tasks/page.tsx`

---

## Purpose
Main dashboard for viewing, filtering, and managing all user tasks.

---

## Layout (Mobile)
```
┌─────────────────────┐
│ ☰  Tasks    [+] 👤 │ Header
├─────────────────────┤
│ [Search...        ] │ SearchBar
├─────────────────────┤
│ [Status ▾]          │ FilterDropdown
│ [Priority ▾]        │ FilterDropdown
│ [Sort ▾]            │ SortSelector
├─────────────────────┤
│ ┌─────────────────┐ │
│ │  TaskCard       │ │ Task 1
│ │  [HIGH] ⭐      │ │
│ │  Buy milk       │ │
│ │  [pending] 🔵   │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │  TaskCard       │ │ Task 2
│ │  [MEDIUM] 🟡    │ │
│ │  Write report   │ │
│ │  [pending] 🔵   │ │
│ └─────────────────┘ │
│                     │
│   [Load More]       │
└─────────────────────┘
```

## Layout (Desktop)
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Tasks              [+ Add Task] [Profile]        │ Header
├─────────────────────────────────────────────────────────┤
│ [Search] [Status ▾] [Priority ▾] [Sort ▾]       12 tasks│ FilterBar
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│  │ TaskCard  │  │ TaskCard  │  │ TaskCard  │          │ Row 1
│  │ [HIGH] ⭐ │  │[MEDIUM]🟡 │  │ [LOW] 🟢  │          │
│  │ Buy milk  │  │ Write doc │  │ Clean up  │          │
│  │[pending]🔵│  │[pending]🔵│  │[done] ✅  │          │
│  └───────────┘  └───────────┘  └───────────┘          │
│                                                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│  │ TaskCard  │  │ TaskCard  │  │ TaskCard  │          │ Row 2
│  └───────────┘  └───────────┘  └───────────┘          │
│                                                          │
│               [Load More (Pagination)]                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Data Fetching (Server Component)

```tsx
// app/tasks/page.tsx (Server Component)
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TaskGrid } from '@/components/TaskGrid';

async function getTasks(userId: number, accessToken: string) {
  const res = await fetch(
    `${process.env.API_URL}/api/${userId}/tasks`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    }
  );

  if (res.status === 401) redirect('/login');
  if (!res.ok) throw new Error('Failed to fetch tasks');

  return res.json();
}

export default async function TaskListPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const tasks = await getTasks(session.user.id, session.accessToken);

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <FilterBar />
      <TaskGrid tasks={tasks} />
    </div>
  );
}
```

---

## Components Used

1. **Header** (Client Component)
   - Logo, page title, Add button, user menu
   - Mobile: Hamburger menu

2. **FilterBar** (Client Component)
   - SearchBar (debounced input)
   - FilterDropdown (Status: pending/completed)
   - FilterDropdown (Priority: high/medium/low)
   - SortSelector (created/priority/due date)
   - Mobile: Stacked vertically

3. **TaskGrid** (Client Component)
   - Responsive grid container
   - Maps tasks to TaskCard components
   - Mobile: 1 column
   - Tablet: 2 columns
   - Desktop: 3 columns

4. **TaskCard** (Client Component)
   - See component specification

5. **EmptyState** (if no tasks)
   - Friendly message
   - CTA button to create first task

---

## Responsive Behavior

### Mobile (< 640px)
```tsx
<div className="container mx-auto px-4 py-8">
  {/* Header - Full width with hamburger */}
  <header className="flex justify-between items-center mb-6">
    <button className="p-2">☰</button>
    <h1 className="text-2xl font-bold">Tasks</h1>
    <div className="flex gap-2">
      <button className="min-h-[44px] min-w-[44px]">+</button>
      <button className="min-h-[44px] min-w-[44px]">👤</button>
    </div>
  </header>

  {/* Filters - Stacked */}
  <div className="flex flex-col gap-2 mb-6">
    <SearchBar />
    <FilterDropdown label="Status" />
    <FilterDropdown label="Priority" />
    <SortSelector />
  </div>

  {/* Grid - Single column */}
  <div className="grid grid-cols-1 gap-4">
    {tasks.map(task => <TaskCard key={task.id} {...task} />)}
  </div>
</div>
```

### Desktop (≥ 1024px)
```tsx
<div className="container mx-auto px-6 py-8 max-w-7xl">
  {/* Header - Full width */}
  <header className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-4">
      <img src="/logo.svg" className="h-8" />
      <h1 className="text-3xl font-bold">My Tasks</h1>
    </div>
    <div className="flex gap-4">
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
        + Add Task
      </button>
      <UserMenu />
    </div>
  </header>

  {/* Filters - Horizontal */}
  <div className="flex gap-4 mb-6 items-center">
    <SearchBar className="flex-1 max-w-md" />
    <FilterDropdown label="Status" />
    <FilterDropdown label="Priority" />
    <SortSelector />
    <span className="text-sm text-gray-500">{tasks.length} tasks</span>
  </div>

  {/* Grid - 3 columns */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {tasks.map(task => <TaskCard key={task.id} {...task} />)}
  </div>
</div>
```

---

## Accessibility

### Keyboard Navigation
- `Tab` - Navigate through filters and cards
- `Enter` - Activate button/link
- `Space` - Toggle checkbox
- `/` - Focus search bar (global shortcut)
- `Escape` - Close filter dropdowns

### Screen Reader Announcements
- Page load: "Task list page. 12 tasks loaded."
- Filter change: "Filtered to show 5 pending tasks."
- Task complete: "Task 'Buy milk' marked as complete."
- Task delete: "Task 'Buy milk' deleted successfully."

### ARIA Attributes
```tsx
<main aria-label="Task list">
  <div role="search">
    <label htmlFor="search-input" className="sr-only">
      Search tasks
    </label>
    <input
      id="search-input"
      type="search"
      aria-label="Search tasks by title or description"
    />
  </div>

  <div role="region" aria-label="Task filters">
    <FilterDropdown aria-label="Filter by status" />
    <FilterDropdown aria-label="Filter by priority" />
  </div>

  <div role="region" aria-label="Task grid" aria-live="polite">
    {/* Tasks rendered here */}
  </div>
</main>
```

### Focus Management
- Focus search bar on `/` key press
- Preserve focus when filters update (don't reset to top)
- Focus first task after creating new task

---

## Performance Optimizations

1. **Server-Side Rendering**: Initial data fetched on server
2. **Optimistic Updates**: UI updates before API confirms
3. **Debounced Search**: Wait 300ms after typing stops
4. **Virtualization**: Only render visible cards (if >100 tasks)
5. **Image Optimization**: Use Next.js Image component
6. **Skeleton Loaders**: Show placeholders during loading

---

## State Management

```tsx
'use client';

import { useState, useEffect } from 'react';

export function TaskGridClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filters, setFilters] = useState({
    status: null,
    priority: null,
    search: '',
  });

  // Apply filters client-side
  const filteredTasks = tasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.search && !task.title.includes(filters.search)) return false;
    return true;
  });

  // Optimistic update for complete action
  const handleComplete = async (id: number) => {
    // Update UI immediately
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'completed' } : t
    ));

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });
    } catch (error) {
      // Revert on error
      setTasks(prev => prev.map(t =>
        t.id === id ? { ...t, status: 'pending' } : t
      ));
      alert('Failed to update task');
    }
  };

  return (
    <>
      <FilterBar filters={filters} onChange={setFilters} />
      <TaskGrid tasks={filteredTasks} onComplete={handleComplete} />
    </>
  );
}
```

---

## Testing Checklist

- [ ] Page loads with tasks from API
- [ ] Search filters tasks by title/description
- [ ] Status filter shows only selected status
- [ ] Priority filter shows only selected priority
- [ ] Sort selector reorders tasks
- [ ] Quick complete updates task status
- [ ] Delete confirmation modal works
- [ ] Empty state shows when no tasks match filters
- [ ] Mobile responsive layout works
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Touch targets are 44x44px minimum
- [ ] Focus indicators visible
- [ ] Dark mode works correctly
```

---

## Related Agents

All frontend agents use this skill:

- **Frontend UI/UX Agent**: Primary owner, designs pages and components
- **AI Chatbot Agent**: Designs ChatDashboard and chat components (Phase III)
- **Spec Architect Agent**: Reviews UI specifications for completeness
- **Code Quality Agent**: Reviews implementation for accessibility compliance
- **Testing & QA Agent**: Tests responsive behavior and accessibility

---

## Success Metrics

The UI Layout & Components Skill is successful when:

✅ **Spec Completeness**: All pages and components fully specified
✅ **Responsive Design**: Mobile-first with clear breakpoint behavior
✅ **Accessibility**: WCAG 2.1 AA compliance verified
✅ **Tailwind Classes**: Consistent utility-first styling
✅ **Component Reusability**: DRY principle with shared components
✅ **Implementation Ready**: Developers can code directly from specs
✅ **Visual Clarity**: Wireframes and examples included
✅ **Dark Mode**: Full support with dark: variants

---

## Best Practices

### Do's ✅

- **Mobile-First**: Design for mobile, enhance for desktop
- **Semantic HTML**: Use header, nav, main, article, section
- **Tailwind Utilities**: Prefer utility classes over custom CSS
- **Component Composition**: Build complex UIs from simple components
- **Accessibility First**: Include ARIA from the start, not as afterthought
- **Touch Targets**: Minimum 44x44px for mobile interactions
- **Focus Indicators**: Always show focus state (ring-2 ring-blue-500)
- **Color Contrast**: Check with WebAIM contrast checker
- **Responsive Images**: Use Next.js Image component
- **Loading States**: Show skeleton loaders, not blank screens

### Don'ts ❌

- **Don't Use divs for Buttons**: Use proper semantic elements
- **Don't Rely on Color Alone**: Use icons + text for status
- **Don't Forget Dark Mode**: Include dark: variants from start
- **Don't Hardcode Breakpoints**: Use Tailwind's responsive utilities
- **Don't Skip Keyboard Nav**: Test with Tab key
- **Don't Use Fixed Pixel Widths**: Use flex/grid and max-w-*
- **Don't Nest Too Deep**: Keep component hierarchy shallow
- **Don't Ignore Loading States**: Always show feedback during async operations
- **Don't Use Custom CSS**: Stick to Tailwind utilities for consistency
- **Don't Skip Testing on Mobile**: Test on real devices, not just DevTools

---

## Integration with Other Skills

### Workflow Integration

```
Spec Authoring (defines features)
  ↓
UI Specification (older skill - high level)
  ↓
UI LAYOUT & COMPONENTS (this skill) ← Detailed design
  ↓
Code Generation (implements components)
  ↓
Test Design (E2E tests for user flows)
```

### Skill Combinations

**UI Specification + UI Layout & Components**:
```
1. UI Specification defines high-level wireframes
2. UI Layout & Components creates detailed component specs
3. Code Generation implements React components
```

**API Specification + UI Layout & Components**:
```
1. API Specification defines REST endpoints
2. UI Layout & Components designs pages that consume APIs
3. Integration Wiring connects frontend to backend
```

---

## Output Format

When using this skill, generate:

**1. Page Layouts** (TaskListPage, TaskDetailPage, ChatDashboard)
**2. Component Specifications** (TaskCard, FilterDropdown, ChatBubble)
**3. Responsive Behavior** (Mobile/tablet/desktop adaptations)
**4. Accessibility Guidelines** (WCAG 2.1 AA checklist)
**5. Implementation Examples** (React + TypeScript + Tailwind code)

Save specifications to:
- `specs/ui/pages.md` - All page layouts
- `specs/ui/components.md` - All reusable components
- `specs/ui/responsive.md` - Responsive design guide
- `specs/ui/accessibility.md` - Accessibility checklist

---

## References

- **UI Specification**: `.claude/skills/ui-specification/README.md` (High-level UI design)
- **Code Generation**: `.claude/skills/code-generation/README.md` (Implements components)
- **Test Design**: `.claude/skills/test-design/README.md` (E2E tests)
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Next.js**: https://nextjs.org/docs
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 6 (TaskListPage, TaskCard, ChatBubble, FilterBar, Responsive layouts, Accessibility)
**Coverage**: Phases II-III (Web App + AI Chatbot)

---

*This UI layout & components skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*

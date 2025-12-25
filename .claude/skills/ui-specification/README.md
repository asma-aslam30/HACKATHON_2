# UI Specification Skill

**Purpose**: Design Next.js pages, ChatKit UI components, and Tailwind CSS specifications for web and chatbot interfaces (Phases II-III)

**Owner**: Spec Architect Agent + Frontend UI/UX Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **UI Specification Skill** enables clear, implementable UI/UX designs for:
- **Phase II**: Next.js web app pages with Tailwind CSS
- **Phase III**: ChatKit AI chatbot interfaces with conversational UI
- **Responsive Design**: Mobile-first layouts with desktop enhancements
- **Accessibility**: WCAG 2.1 AA compliance

---

## Skill Components

### 1. Next.js Page Layouts (Phase II)

Complete page structures with routing, data fetching, and component hierarchy.

**Deliverables**:
- Page wireframes (ASCII diagrams)
- Component tree
- Data fetching strategy (server/client)
- Responsive breakpoints

### 2. ChatKit UI Components (Phase III)

Conversational interfaces using OpenAI ChatKit SDK.

**Deliverables**:
- Chat window design
- Message bubbles (user/assistant)
- Tool call indicators
- Typing animations

### 3. Tailwind CSS Component Specs

Reusable component classes with variants.

**Deliverables**:
- Base styles
- Variants (size, color, state)
- Responsive modifiers
- Dark mode support

### 4. Accessibility & Responsiveness

WCAG compliance and mobile-first design.

**Deliverables**:
- ARIA labels
- Keyboard navigation
- Screen reader support
- Mobile/tablet/desktop layouts

---

## Skill Instructions

### Step 1: Identify UI Surfaces

Determine which pages and components are needed for the feature.

**Questions to Answer**:
- What pages does the user navigate? (List, Detail, Edit, Dashboard)
- What actions can users perform? (CRUD, filters, search)
- What feedback do users receive? (Success/error messages, loading states)
- Is this Phase II (web app) or Phase III (chatbot)?

**Example**:
```
Feature: Task Management
Pages Needed:
- TaskListPage (view all tasks)
- TaskDetailPage (view/edit single task)
- TaskCreatePage (add new task)
- Dashboard (analytics)
```

---

### Step 2: Design Page Layouts (Phase II)

Create ASCII wireframes for each page with component hierarchy.

**Template**:
```markdown
## Page: [PageName]

**Route**: /path/to/page
**Auth**: Public / Protected (JWT required)
**Data Fetching**: Server Component / Client Component / API Route

### Layout Wireframe

┌─────────────────────────────────────────────────────┐
│ [Header with logo, user menu]                       │
├─────────────────────────────────────────────────────┤
│ [Main content area]                                 │
│                                                     │
│  [Component 1]    [Component 2]    [Component 3]   │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Footer]                                            │
└─────────────────────────────────────────────────────┘

### Component Tree
- PageLayout
  ├── Header
  │   ├── Logo
  │   └── UserMenu
  ├── MainContent
  │   ├── FilterBar
  │   ├── TaskGrid
  │   │   └── TaskCard (repeated)
  │   └── Pagination
  └── Footer

### Responsive Breakpoints
- Mobile (< 768px): Single column, stacked components
- Tablet (768px - 1024px): 2-column grid
- Desktop (> 1024px): 3-column grid with sidebar
```

---

### Step 3: Design ChatKit UI (Phase III)

Create conversational interface designs for AI chatbot.

**Template**:
```markdown
## ChatKit Interface: [Feature Name]

### Chat Window Layout

┌─────────────────────────────────────────────────────┐
│ [Chat Header: "Evolution of Todo Assistant"]       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────┐         │
│  │ User: "Add task: Buy milk"            │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│         ┌───────────────────────────────────────┐  │
│         │ Assistant: "Task added successfully!" │  │
│         │ [TaskCard preview]                    │  │
│         └───────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────┐         │
│  │ Tool Call: add_task(...)              │         │
│  │ Status: ✓ Completed                   │         │
│  └───────────────────────────────────────┘         │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Input: "Type a message..." + Send button]         │
└─────────────────────────────────────────────────────┘

### Message Types
1. User Message: Right-aligned, blue background
2. Assistant Message: Left-aligned, gray background
3. Tool Call: Centered, yellow background with icon
4. Error Message: Red border, error icon
```

---

### Step 4: Define Tailwind Component Classes

Create reusable component styles with variants.

**Template**:
```markdown
## Component: [ComponentName]

**Base Class**: `base-styles`
**Variants**: size, color, state
**Responsive**: Yes / No
**Dark Mode**: Yes / No

### Base Styles
\`\`\`css
.component-base {
  @apply bg-white shadow-md rounded-lg p-4 border border-gray-200;
}
\`\`\`

### Variants

#### Size Variants
- **Small**: `text-sm p-2`
- **Medium**: `text-base p-4` (default)
- **Large**: `text-lg p-6`

#### Color Variants
- **Primary**: `bg-blue-500 text-white hover:bg-blue-600`
- **Success**: `bg-green-500 text-white hover:bg-green-600`
- **Danger**: `bg-red-500 text-white hover:bg-red-600`

#### State Variants
- **Default**: `opacity-100`
- **Disabled**: `opacity-50 cursor-not-allowed`
- **Loading**: `animate-pulse`

### Responsive Modifiers
- **Mobile**: `w-full`
- **Tablet**: `sm:w-1/2`
- **Desktop**: `lg:w-1/3`

### Dark Mode
- **Light Mode**: `bg-white text-gray-900`
- **Dark Mode**: `dark:bg-gray-800 dark:text-gray-100`

### Example Usage
\`\`\`jsx
<div className="component-base text-base p-4 bg-blue-500 text-white hover:bg-blue-600 w-full sm:w-1/2 lg:w-1/3">
  Content
</div>
\`\`\`
```

---

### Step 5: Document Accessibility

Ensure WCAG 2.1 AA compliance.

**Template**:
```markdown
## Accessibility Checklist

### Keyboard Navigation
- [ ] Tab order follows visual flow
- [ ] All interactive elements focusable
- [ ] Escape key closes modals/dropdowns
- [ ] Enter/Space activates buttons

### Screen Reader Support
- [ ] ARIA labels on all inputs
- [ ] ARIA live regions for dynamic content
- [ ] Alt text on all images
- [ ] Semantic HTML (header, nav, main, footer)

### Visual Accessibility
- [ ] Color contrast ratio ≥ 4.5:1 (normal text)
- [ ] Color contrast ratio ≥ 3:1 (large text)
- [ ] Focus indicators visible (outline or ring)
- [ ] Text resizable to 200% without breaking layout

### Example
\`\`\`jsx
<button
  aria-label="Add new task"
  className="focus:ring-2 focus:ring-blue-500"
>
  <PlusIcon className="w-5 h-5" aria-hidden="true" />
  Add Task
</button>
\`\`\`
```

---

## Example Output

### Example 1: TaskListPage (Phase II)

```markdown
# Page: TaskListPage

**Route**: `/tasks`
**Auth**: Protected (JWT required)
**Data Fetching**: Server Component (RSC) with client-side filtering

## Layout Wireframe

┌─────────────────────────────────────────────────────────────────┐
│ Header: Logo | Search | User Menu                               │
├─────────────────────────────────────────────────────────────────┤
│ Breadcrumb: Home > Tasks                                        │
├─────────────────────────────────────────────────────────────────┤
│ Filter Bar: [All] [Active] [Completed] | Priority: [High] [Med]│
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌─────────┐                          │
│ │ Task 1  │  │ Task 2  │  │ Task 3  │                          │
│ │ HIGH    │  │ MEDIUM  │  │ LOW     │                          │
│ │ ✓ Done  │  │ Pending │  │ Pending │                          │
│ └─────────┘  └─────────┘  └─────────┘                          │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐                          │
│ │ Task 4  │  │ Task 5  │  │ Task 6  │                          │
│ └─────────┘  └─────────┘  └─────────┘                          │
├─────────────────────────────────────────────────────────────────┤
│ Pagination: « Prev | 1 2 3 | Next »                            │
└─────────────────────────────────────────────────────────────────┘

## Component Tree
- TaskListPage (Server Component)
  ├── Header
  │   ├── Logo
  │   ├── SearchBar (Client Component)
  │   └── UserMenu
  ├── Breadcrumb
  ├── FilterBar (Client Component)
  │   ├── StatusFilter
  │   └── PriorityFilter
  ├── TaskGrid (Server Component)
  │   └── TaskCard (repeated, Client Component)
  │       ├── PriorityBadge
  │       ├── StatusChip
  │       └── ActionButtons
  └── Pagination (Client Component)

## Data Fetching Strategy

### Server Component (RSC)
```tsx
// app/tasks/page.tsx
import { getTasks } from '@/lib/api';

export default async function TaskListPage() {
  const tasks = await getTasks(); // Server-side fetch

  return (
    <div>
      <FilterBar />
      <TaskGrid tasks={tasks} />
    </div>
  );
}
```

### Client Component (Filtering)
```tsx
'use client';
import { useState } from 'react';

export function FilterBar() {
  const [status, setStatus] = useState('all');

  return (
    <div className="flex gap-2">
      <button onClick={() => setStatus('all')}>All</button>
      <button onClick={() => setStatus('active')}>Active</button>
    </div>
  );
}
```

## Responsive Breakpoints
- **Mobile (< 768px)**: Single column, vertical stack
- **Tablet (768px - 1024px)**: 2-column grid
- **Desktop (> 1024px)**: 3-column grid

## Accessibility
- ARIA label on search input: `aria-label="Search tasks"`
- Keyboard shortcut: `Ctrl+K` to focus search
- Status announced to screen readers: `aria-live="polite"` on filter results
```

---

### Example 2: TaskCard Component (Phase II)

```markdown
# Component: TaskCard

**Type**: Client Component (interactive)
**Variants**: size (sm, md, lg), priority (high, medium, low), status (pending, completed)
**Responsive**: Yes
**Dark Mode**: Yes

## Base Styles

```tsx
// components/TaskCard.tsx
interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  createdAt: string;
}

export function TaskCard({ id, title, priority, status }: TaskCardProps) {
  return (
    <div className="
      bg-white dark:bg-gray-800
      shadow-md hover:shadow-lg
      rounded-lg
      p-4
      border border-gray-200 dark:border-gray-700
      transition-shadow duration-200
    ">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <PriorityBadge priority={priority} />
      </div>

      <div className="flex justify-between items-center mt-4">
        <StatusChip status={status} />
        <ActionButtons taskId={id} />
      </div>
    </div>
  );
}
```

## Tailwind Classes Breakdown

### Base Card
```css
.task-card-base {
  @apply bg-white dark:bg-gray-800;
  @apply shadow-md hover:shadow-lg;
  @apply rounded-lg;
  @apply p-4;
  @apply border border-gray-200 dark:border-gray-700;
  @apply transition-shadow duration-200;
}
```

### Size Variants
- **Small**: `p-2 text-sm`
- **Medium**: `p-4 text-base` (default)
- **Large**: `p-6 text-lg`

### Priority Variants (PriorityBadge)
- **High**: `bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`
- **Medium**: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`
- **Low**: `bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`

### Status Variants (StatusChip)
- **Pending**: `bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`
- **Completed**: `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`

## Responsive Design

```tsx
// Mobile-first approach
<div className="
  w-full              // Mobile: full width
  sm:w-1/2            // Tablet: 2 columns
  lg:w-1/3            // Desktop: 3 columns
  p-4                 // Padding consistent across breakpoints
">
```

## Accessibility

```tsx
<div
  role="article"
  aria-labelledby={`task-title-${id}`}
  className="task-card-base"
>
  <h3 id={`task-title-${id}`}>
    {title}
  </h3>

  <button
    aria-label={`Complete task: ${title}`}
    className="focus:ring-2 focus:ring-blue-500"
  >
    Complete
  </button>
</div>
```

## Example Usage

```tsx
// In TaskListPage
<TaskGrid>
  <TaskCard
    id={1}
    title="Buy milk"
    description="2 liters low fat"
    priority="high"
    status="pending"
    createdAt="2025-12-24T10:30:00Z"
  />
  <TaskCard
    id={2}
    title="Finish report"
    priority="medium"
    status="completed"
    createdAt="2025-12-24T09:15:00Z"
  />
</TaskGrid>
```
```

---

### Example 3: ChatKit Interface (Phase III)

```markdown
# ChatKit Interface: Task Management Chatbot

**Phase**: III (AI Chatbot)
**Tech**: OpenAI ChatKit SDK + Claude Agents SDK + MCP
**Features**: Natural language task management, tool calls, multilingual

## Chat Window Layout

┌──────────────────────────────────────────────────────────────────┐
│ ╔════════════════════════════════════════════════════════════╗  │
│ ║  Evolution of Todo Assistant  👤 User Menu                 ║  │
│ ╚════════════════════════════════════════════════════════════╝  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │ User: "Add a task to buy milk with high priority" │         │
│  └────────────────────────────────────────────────────┘         │
│                                              [10:30 AM]         │
│                                                                  │
│         ┌──────────────────────────────────────────────────┐   │
│         │ Assistant: "I'll add that task for you."        │   │
│         │                                                  │   │
│         │ ┌────────────────────────────────────┐          │   │
│         │ │ 🛠️ Calling add_task tool...         │          │   │
│         │ │ Status: ✓ Completed                │          │   │
│         │ └────────────────────────────────────┘          │   │
│         │                                                  │   │
│         │ Task added successfully!                        │   │
│         │ ╔═══════════════════════════════════╗          │   │
│         │ ║ Task #42: Buy milk                ║          │   │
│         │ ║ Priority: HIGH 🔴                 ║          │   │
│         │ ║ Status: Pending                   ║          │   │
│         │ ╚═══════════════════════════════════╝          │   │
│         └──────────────────────────────────────────────────┘   │
│         [10:30 AM]                                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │ User: "Show my tasks"                              │         │
│  └────────────────────────────────────────────────────┘         │
│                                              [10:31 AM]         │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  [Type a message...]                          [📎] [🎤] [Send]  │
└──────────────────────────────────────────────────────────────────┘

## Component Hierarchy

- ChatWindow (Client Component)
  ├── ChatHeader
  │   ├── AssistantInfo
  │   └── UserMenu
  ├── MessageList (Scrollable)
  │   ├── UserMessage (repeated)
  │   ├── AssistantMessage (repeated)
  │   │   ├── MessageText
  │   │   ├── ToolCallIndicator (conditional)
  │   │   └── TaskCardPreview (conditional)
  │   └── TypingIndicator (conditional)
  └── ChatInput
      ├── TextArea
      ├── AttachButton
      ├── VoiceButton
      └── SendButton

## Message Bubble Styles

### User Message (Right-Aligned)
```tsx
<div className="flex justify-end mb-4">
  <div className="
    bg-blue-500 text-white
    rounded-lg rounded-br-none
    px-4 py-2
    max-w-[70%]
    shadow-sm
  ">
    {message.content}
  </div>
  <span className="text-xs text-gray-500 ml-2 self-end">
    {formatTime(message.timestamp)}
  </span>
</div>
```

### Assistant Message (Left-Aligned)
```tsx
<div className="flex justify-start mb-4">
  <div className="
    bg-gray-100 dark:bg-gray-700
    text-gray-900 dark:text-gray-100
    rounded-lg rounded-bl-none
    px-4 py-2
    max-w-[70%]
    shadow-sm
  ">
    {message.content}
  </div>
  <span className="text-xs text-gray-500 mr-2 self-end">
    {formatTime(message.timestamp)}
  </span>
</div>
```

### Tool Call Indicator (Centered)
```tsx
<div className="flex justify-center mb-4">
  <div className="
    bg-yellow-100 dark:bg-yellow-900
    border border-yellow-300 dark:border-yellow-700
    text-yellow-800 dark:text-yellow-200
    rounded-lg
    px-4 py-2
    flex items-center gap-2
  ">
    <WrenchIcon className="w-5 h-5" />
    <span>Calling add_task tool...</span>
    {status === 'completed' && <CheckIcon className="w-5 h-5 text-green-600" />}
  </div>
</div>
```

### Task Card Preview (Embedded)
```tsx
<div className="
  border-l-4 border-blue-500
  bg-blue-50 dark:bg-blue-900/20
  rounded-r-lg
  p-3 mt-2
">
  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
    Task #{task.id}: {task.title}
  </div>
  <div className="flex gap-2 mt-1">
    <PriorityBadge priority={task.priority} size="sm" />
    <StatusChip status={task.status} size="sm" />
  </div>
</div>
```

## ChatKit SDK Integration

```tsx
'use client';
import { ChatProvider, Chat, Message } from '@openai/chatkit';
import { useMCP } from '@/lib/mcp-client';

export function TaskChatbot() {
  const { tools, callTool } = useMCP();

  return (
    <ChatProvider
      model="claude-opus-4-5"
      tools={tools}
      onToolCall={callTool}
    >
      <Chat>
        <Message.List>
          {(messages) => messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </Message.List>

        <Message.Input placeholder="Ask me to manage your tasks..." />
      </Chat>
    </ChatProvider>
  );
}
```

## MCP Tool Call Flow

```typescript
// MCP tool definition
const addTaskTool = {
  name: 'add_task',
  description: 'Add a new task to the todo list',
  parameters: {
    title: { type: 'string', required: true },
    priority: { type: 'string', enum: ['high', 'medium', 'low'] },
  },
};

// Tool call handler
async function handleToolCall(toolName: string, params: any) {
  if (toolName === 'add_task') {
    const response = await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    return await response.json();
  }
}
```

## Accessibility

### Keyboard Navigation
- `Enter`: Send message
- `Shift+Enter`: New line in input
- `Escape`: Clear input
- `Tab`: Navigate between input, attach, voice, send

### Screen Reader Support
```tsx
<div
  role="log"
  aria-live="polite"
  aria-label="Chat conversation"
>
  {messages.map((msg) => (
    <div
      key={msg.id}
      role="article"
      aria-label={`${msg.role} message at ${formatTime(msg.timestamp)}`}
    >
      {msg.content}
    </div>
  ))}
</div>

<textarea
  aria-label="Message input"
  aria-describedby="chat-input-help"
/>
<span id="chat-input-help" className="sr-only">
  Type your message and press Enter to send
</span>
```

## Example Conversation Flow

```
User: "Add a task to buy milk with high priority"
  └─> Assistant detects intent: add_task
      └─> Tool call: add_task(title="Buy milk", priority="high")
          └─> API: POST /api/todos
              └─> Response: { id: 42, title: "Buy milk", priority: "high" }
                  └─> Assistant: "Task added successfully!" + TaskCardPreview

User: "Show my tasks"
  └─> Assistant detects intent: list_tasks
      └─> Tool call: list_tasks()
          └─> API: GET /api/todos
              └─> Response: [{ id: 42, ... }, { id: 43, ... }]
                  └─> Assistant: "You have 2 tasks:" + TaskList
```
```

---

## Related Agents

- **Spec Architect Agent**: Authors UI specifications
- **Frontend UI/UX Agent**: Implements Next.js + Tailwind designs
- **AI Chatbot Agent**: Implements ChatKit interfaces
- **System Architect Agent**: Reviews UI architecture decisions
- **Testing & QA Agent**: Tests UI accessibility and responsiveness

---

## Success Metrics

The UI Specification Skill is successful when:

✅ **Page Layouts**: Clear wireframes with component hierarchy
✅ **Component Specs**: Reusable Tailwind classes with variants
✅ **Responsive**: Mobile/tablet/desktop breakpoints defined
✅ **Accessible**: WCAG 2.1 AA compliance (keyboard, ARIA, contrast)
✅ **ChatKit UI**: Conversational interfaces with tool call indicators
✅ **Implementable**: Frontend agent can implement without clarifications
✅ **Testable**: Testing agent can validate with Playwright/Storybook

---

## Best Practices

### Do's ✅
- Start with mobile-first design (small screen → large)
- Use semantic HTML (header, nav, main, footer, article)
- Define ARIA labels for all interactive elements
- Specify focus states (ring-2, ring-blue-500)
- Include dark mode variants (dark:bg-gray-800)
- Provide keyboard shortcuts for power users
- Test with screen readers (NVDA, JAWS, VoiceOver)

### Don'ts ❌
- Don't skip accessibility (WCAG 2.1 AA is required)
- Don't use color alone to convey meaning (add icons/text)
- Don't hardcode pixel values (use Tailwind spacing scale)
- Don't forget loading states (spinners, skeletons)
- Don't ignore mobile users (50%+ traffic)
- Don't use non-standard HTML (breaks screen readers)
- Don't skip error states (network failures, validation)

---

## Integration with Other Skills

### Spec Authoring → UI Specification
```
Feature Spec (spec.md)
  ↓
User Stories + Acceptance Criteria
  ↓
UI Specification (pages.md, components.md)
  ↓
Frontend Implementation (Next.js + Tailwind)
```

### API Specification → UI Specification
```
REST Endpoints (api/rest-endpoints.md)
  ↓
Data Contracts (request/response schemas)
  ↓
UI Components (TaskCard fetches from GET /api/todos)
  ↓
Loading/Error States
```

---

## Output Format

When completing this skill, create:

1. **specs/ui/pages.md** - Page layouts for all routes
2. **specs/ui/components.md** - Reusable component specs
3. **specs/ui/chatkit.md** - Chatbot interface designs (Phase III)
4. **specs/ui/accessibility.md** - WCAG 2.1 AA checklist

---

## References

- **Next.js App Router**: https://nextjs.org/docs/app
- **Tailwind CSS**: https://tailwindcss.com/docs
- **OpenAI ChatKit**: https://platform.openai.com/chatkit
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 3 (TaskListPage, TaskCard, ChatKit Interface)
**Coverage**: Phase II (Next.js) + Phase III (ChatKit)

---

*This UI specification skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*

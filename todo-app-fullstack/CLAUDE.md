# Frontend Guidelines

## Stack
- Next.js 16 (Pages Router)
- Tailwind CSS
- Better Auth (client-side)

## Patterns
- Use `useApp()` hook for auth state
- Client components use `useState`/`useEffect`
- API calls go through `fetch` with JWT token in header

## Component Structure
- `/components` - Reusable UI components
- `/components/voice` - Voice control components
- `/components/chat` - AI chatbot UI
- `/components/todos` - Task management
- `/pages` - Pages and API routes
- `/lib` - Utilities and services

## Auth Pattern
All authenticated API calls must include JWT:
```js
const { data: session } = useSession()
const token = session?.token

fetch('/api/todos', {
  headers: { Authorization: `Bearer ${token}` }
})
```

## Styling
- Use Tailwind CSS classes only
- No inline styles
- Follow existing component patterns

## Running
```bash
npm run dev   # port 3000
npm run build
npm run db:push  # push Prisma schema to Neon
```

## Specs Reference
- @specs/features/task-crud.md
- @specs/features/chatbot.md
- @specs/ui/

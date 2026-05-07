# Running Locally (Without Docker)

## Step 1 — Backend setup

```bash
cd backend

# Create .env file
cp .env.example .env
# Edit .env and add:
#   DATABASE_URL=your-neon-url?sslmode=require
#   DATABASE_URL_UNPOOLED=your-neon-url?sslmode=require
#   GEMINI_API_KEY=your-gemini-key
#   GEMINI_MODEL=gemini-2.5-flash
#   FRONTEND_URL=http://localhost:3000

# Install dependencies
pip install -r requirements.txt

# Run backend (port 8000)
uvicorn main:app --reload --port 8000
```

Open: http://localhost:8000/docs

---

## Step 2 — Frontend setup

```bash
cd todo-app-fullstack

# Create .env.local file
cp .env.local.example .env.local
# Edit .env.local and add:
#   DATABASE_URL=your-neon-url?sslmode=require
#   DATABASE_URL_UNPOOLED=your-neon-url?sslmode=require
#   AUTH_SECRET=any-random-32-char-string
#   NEXT_PUBLIC_APP_URL=http://localhost:3000
#   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Install dependencies (first time only)
npm install --legacy-peer-deps

# Push DB schema to Neon (first time only)
npm run db:push

# Run frontend (port 3000)
npm run dev
```

Open: http://localhost:3000

---

## URLs
| Service | URL |
|---------|-----|
| Frontend (Task Board) | http://localhost:3000 |
| AI Chat | http://localhost:3000/chat |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Running with Docker

```bash
# 1. Setup env files
cp backend/.env.example backend/.env
# Fill in backend/.env with your Neon DB URL and Gemini API key

cp todo-app-fullstack/.env.local.example todo-app-fullstack/.env.local
# Fill in todo-app-fullstack/.env.local with your Neon DB URL and auth secret

# 2. Build and run
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
```

---

## Common Errors

### "SSL connection has been closed unexpectedly"
Your DATABASE_URL has `channel_binding=require` — remove it.
Correct format: `postgresql://user:pass@host/db?sslmode=require`

### "Prisma Client is not initialized"
Run: `npm run db:push` in the `todo-app-fullstack` folder

### Auth errors / redirect loops
Make sure `AUTH_SECRET` is set in `.env.local` (any random string, 32+ chars)
Make sure `NEXT_PUBLIC_APP_URL=http://localhost:3000` (not 3001)

### AI Chat not working
Make sure `GEMINI_API_KEY` is set in `backend/.env`
Make sure backend is running on port 8000
Make sure `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000` in frontend `.env.local`

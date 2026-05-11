# Hackathon II: Evolution of Todo 🚀

> Spec-Driven Development · Cloud-Native AI · Kubernetes · Gemini 2.5 Flash

[![CI/CD](https://github.com/asma-aslam30/HACKATHON_2/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/asma-aslam30/HACKATHON_2/actions)

---

## 🎯 What This Project Is

A todo application that evolves from a Python console app into a Kubernetes-managed,
event-driven, AI-powered distributed system — built entirely using **Spec-Driven Development** with Claude Code and Spec-Kit Plus.

---

## 📊 Phase Progress

| # | Phase | Tech | Points | Status |
|---|-------|------|--------|--------|
| I | Python Console App | Python, UV | 100 | ✅ Complete |
| II | Full-Stack Web App | Next.js 16 + FastAPI + Neon + Better Auth | 150 | ✅ Complete |
| III | AI Chatbot + MCP | Gemini 2.5 Flash + 5 MCP Tools | 200 | ✅ Complete |
| IV | Local Kubernetes | Docker + Minikube + Helm | 250 | ✅ Code Ready |
| V | Cloud + Kafka + Dapr | GKE + Redpanda + Dapr | 300 | ✅ Code Ready |

| Bonus | Feature | Points | Status |
|-------|---------|--------|--------|
| 🇵🇰 | Urdu language support | +100 | ✅ Complete |
| 🎤 | Voice commands | +200 | ✅ Complete |
| 🤖 | Claude Code Subagents | +200 | ✅ Complete |
| 🏗️ | Cloud-Native Blueprints | +200 | ✅ Complete |

**Maximum possible: 1,200+ points**

---

## ✅ TODO — Your Remaining Tasks (in exact order)

Follow this sequence. Each step unlocks the next.

---

### Step 1 — Regenerate GitHub Token (5 min)
> Needed to push CI/CD pipeline to GitHub Actions

```
1. GitHub.com → Profile → Settings
2. Developer settings → Personal access tokens → Tokens (classic)
3. Regenerate your token
4. Check BOTH: ✅ repo  ✅ workflow
5. Copy new token → share with Claude to push CI/CD file
```

---

### Step 2 — Setup local environment (10 min)
> Get the app running on your machine

**Create `todo-app-fullstack/.env.local`:**
```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-frosty-mouse-a4hyr3wp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:YOUR_PASSWORD@ep-frosty-mouse-a4hyr3wp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
AUTH_SECRET=any-random-32-character-string-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Create `backend/.env`:**
```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-frosty-mouse-a4hyr3wp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:YOUR_PASSWORD@ep-frosty-mouse-a4hyr3wp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=your-actual-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:3000
BETTER_AUTH_SECRET=any-random-32-character-string-here
```

**Run commands:**
```bash
# Push DB schema to Neon (first time only)
cd todo-app-fullstack
npm run db:push

# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd todo-app-fullstack
npm run dev
```

**Open:** http://localhost:3000

---

### Step 3 — Deploy to Google Cloud Run (30 min) → Phase II + III = 350 pts

```powershell
# In VS Code terminal from HACKATHON_2 root
gcloud auth login
gcloud projects list   # copy your Project ID

.\infra\gcloud\deploy-gcloud.ps1 `
  -ProjectId "your-gcp-project-id" `
  -DatabaseUrl "postgresql://neondb_owner:PASSWORD@ep-frosty-mouse-a4hyr3wp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require" `
  -GeminiApiKey "your-gemini-api-key"
```

Script gives you:
- 🌐 Frontend URL: `https://todo-frontend-xxx.run.app`
- ⚙️ Backend URL: `https://todo-backend-xxx.run.app`
- 📖 API Docs: `https://todo-backend-xxx.run.app/docs`
- 💬 AI Chat: `https://todo-frontend-xxx.run.app/chat`

---

### Step 4 — Submit Phase II + III form (5 min)

**Submit here:** https://forms.gle/KMKEKaFUD6ZX4UtY8

```
GitHub Repo: https://github.com/asma-aslam30/HACKATHON_2
Frontend URL: https://todo-frontend-xxx.run.app
Demo Video: (record in Step 6, add later)
WhatsApp: your number
```

---

### Step 5 — Run Minikube locally (45 min) → Phase IV = 250 pts

> Make sure Docker Desktop is running first

```powershell
# Start Minikube
minikube start --memory=4096 --cpus=2 --driver=docker

# Point Docker to Minikube registry
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Build images
docker build -f infra/docker/Dockerfile.backend -t todo-backend:latest .
docker build -f infra/docker/Dockerfile.frontend -t todo-frontend:latest .

# Deploy with Helm
helm install todo-app infra/helm/todo-app `
  --set secrets.geminiApiKey="your-gemini-key" `
  --set secrets.databaseUrl="your-neon-url?sslmode=require" `
  --set secrets.authSecret="your-auth-secret"

# Verify
kubectl get pods
kubectl get services
minikube tunnel   # in separate terminal to expose services
```

**Take a screenshot of `kubectl get pods` showing Running status.**

---

### Step 6 — Record 90 second demo video (20 min)

> Use [Loom](https://loom.com) (free) — share link without downloading

**Script (judges stop watching at 90 seconds):**

| Time | What to show |
|------|-------------|
| 0:00 – 0:10 | GitHub repo → specs folder, CLAUDE.md files |
| 0:10 – 0:25 | Live app on Cloud Run → add task, complete it |
| 0:25 – 0:40 | Click 🎤 mic → say "add task buy groceries" → task appears |
| 0:40 – 0:55 | Go to /chat → type in Urdu: `کام دکھائیں` |
| 0:55 – 1:10 | Show `kubectl get pods` in terminal (Minikube running) |
| 1:10 – 1:20 | Show Google Cloud Run console with both services |
| 1:20 – 1:30 | Show CI/CD running in GitHub Actions |

---

### Step 7 — Submit Phase IV + V form

Same form: https://forms.gle/KMKEKaFUD6ZX4UtY8

Add:
- Minikube screenshot or video clip
- GKE/Cloud Run deployment URL
- Updated demo video link

---

## 🚀 Quick Start (Local)

```bash
# Terminal 1 — Backend (port 8000)
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend (port 3000)
cd todo-app-fullstack
npm run dev
```

| URL | What |
|-----|------|
| http://localhost:3000 | Task Board |
| http://localhost:3000/chat | AI Chatbot |
| http://localhost:8000/docs | Backend API Docs |

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌────────────────────────────────────┐     ┌──────────────┐
│  Next.js 16     │────▶│  FastAPI Backend                    │────▶│  Neon DB     │
│  Task Board     │     │  ├── REST API  /api/{user}/tasks    │     │  PostgreSQL  │
│  AI Chat UI     │     │  ├── Chat API  /api/{user}/chat     │     └──────────────┘
│  Voice Control  │     │  ├── JWT Auth  (Better Auth tokens) │
└─────────────────┘     │  ├── Gemini 2.5 Flash Agent         │     ┌──────────────┐
                        │  ├── 5 MCP Tools                    │────▶│  Redpanda    │
                        │  └── Kafka Events (Phase V)         │     │  (Kafka)     │
                        └────────────────────────────────────┘     └──────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │    Dapr Sidecar      │
                              │  Pub/Sub · State     │
                              │  Cron · Secrets      │
                              └─────────────────────┘
```

---

## 📁 Repository Structure

```
HACKATHON_2/
├── .spec-kit/config.yaml        # Spec-Kit configuration
├── .claude/agents/              # Claude Code Subagents (+200 pts bonus)
├── .github/workflows/ci-cd.yml  # GitHub Actions CI/CD
├── specs/                       # All specifications (Spec-Kit)
│   ├── overview.md
│   ├── features/task-crud.md
│   ├── features/chatbot.md
│   ├── api/rest-endpoints.md
│   ├── database/schema.md
│   └── infrastructure/deployment.md
├── backend/                     # FastAPI + Gemini + MCP
│   ├── CLAUDE.md                # Backend Claude Code instructions
│   ├── main.py                  # Entry point
│   ├── agent.py                 # Gemini 2.5 Flash + function calling
│   ├── db.py                    # Neon DB connection
│   ├── routes/auth.py           # JWT verification middleware
│   ├── routes/chat.py           # Chat endpoint
│   ├── routes/tasks.py          # REST CRUD endpoints
│   ├── mcp_server/tools.py      # 5 MCP tools
│   ├── models/models.py         # SQLModel DB tables
│   ├── kafka/producer.py        # Kafka event producer
│   └── kafka/dapr_publisher.py  # Dapr pub/sub publisher
├── todo-app-fullstack/          # Next.js 16 frontend
│   ├── CLAUDE.md                # Frontend Claude Code instructions
│   ├── components/voice/        # Voice control (+200 pts bonus)
│   ├── components/chat/         # AI Chat UI
│   ├── components/todos/        # Task management UI
│   ├── pages/chat/              # AI Chatbot page
│   └── lib/voiceCommands.js     # Voice command parser
├── infra/
│   ├── docker/                  # Dockerfiles (backend + frontend)
│   ├── helm/todo-app/           # Helm charts for Kubernetes
│   ├── dapr-components/         # Dapr YAML configs
│   └── gcloud/                  # Google Cloud deploy scripts
├── phases/phase-1/              # Phase I — Python console app
├── CLAUDE.md                    # Root Claude Code instructions
├── docker-compose.yml           # Local Docker Compose
└── run-local.md                 # Local setup guide
```

---

## 🌟 Bonus Features

### 🇵🇰 Urdu Support (+100 pts)
```
User: گروسری خریدنے کا کام شامل کریں
Bot:  ✅ بہت اچھا! میں نے 'گروسری خریدنا' آپ کی فہرست میں شامل کر دیا ہے۔
```

### 🎤 Voice Commands (+200 pts)
Say any of these:
- "Add task buy groceries" → creates task
- "Show my pending tasks" → filters list
- "Mark task 1 as done" → completes task
- "Go to chat" → navigates to AI chat
- Urdu voice commands supported too

### 🤖 Claude Code Subagents (+200 pts)
Reusable agents in `.claude/agents/`:
- `ai-chatbot.md` — chatbot development
- `backend-fastapi.md` — FastAPI patterns
- `frontend-uiux.md` — UI development
- `cloudops-k8s.md` — Kubernetes operations
- `spec-architect.md` — spec writing
- And 8 more...

### 🔒 JWT Authentication
Better Auth (frontend) issues JWT tokens → FastAPI backend verifies them.
Shared secret: `BETTER_AUTH_SECRET`. Every user only sees their own data.

---

## 🔧 Environment Variables

### Backend — `backend/.env`
```env
DATABASE_URL=postgresql://...@neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://...@neon.tech/neondb?sslmode=require
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-32-chars
```

### Frontend — `todo-app-fullstack/.env.local`
```env
DATABASE_URL=postgresql://...@neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://...@neon.tech/neondb?sslmode=require
AUTH_SECRET=your-secret-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 📤 Submission Links

| Item | Link |
|------|------|
| 📦 GitHub Repo | https://github.com/asma-aslam30/HACKATHON_2 |
| 🌐 Live App | *(add Cloud Run URL after deploy)* |
| 📹 Demo Video | *(add Loom link after recording)* |
| 📝 Submit Form | https://forms.gle/KMKEKaFUD6ZX4UtY8 |
| 🎥 Zoom Meeting | https://us06web.zoom.us/j/84976847088?pwd=Z7t7NaeXwVmmR5fysCv7NiMbfbhIda.1 |

---

*Built with Claude Code + Spec-Kit Plus · Panaversity Hackathon II*

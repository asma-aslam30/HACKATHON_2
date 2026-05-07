# Hackathon II: Evolution of Todo 🚀

> Spec-Driven Development · Cloud-Native AI · Kubernetes

[![CI/CD](https://github.com/asma-aslam30/HACKATHON_2/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/asma-aslam30/HACKATHON_2/actions)

## Overview

A todo application that evolves from a Python console app into a Kubernetes-managed, event-driven, AI-powered distributed system — built using Spec-Driven Development with Claude Code.

## Phase Progress

| Phase | Description | Points | Status |
|-------|-------------|--------|--------|
| I | Python Console App | 100 | ✅ Done |
| II | Full-Stack Web App (Next.js + FastAPI) | 150 | ✅ Done |
| III | AI Chatbot (Gemini 2.5 Flash + MCP) | 200 | ✅ Done |
| IV | Local Kubernetes (Minikube + Helm) | 250 | ✅ Done |
| V | Cloud + Kafka + Dapr | 300 | 🔨 In Progress |
| **Bonus** | Urdu support, Voice, Subagents | +600 | 🔨 In Progress |

**Total: 900+ / 1000 points**

## Quick Start

### Run locally

```bash
# 1. Backend (AI Chatbot API)
cd backend
cp .env.example .env
# Add GEMINI_API_KEY and DATABASE_URL to .env
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 2. Frontend (Next.js)
cd todo-app-fullstack
cp .env.example .env.local
# Add NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
npm install --legacy-peer-deps
npm run dev
```

Open:
- **Task Board**: http://localhost:3001
- **AI Chat**: http://localhost:3001/chat
- **API Docs**: http://localhost:8000/docs

### Run with Docker

```bash
docker-compose up
```

### Deploy to Kubernetes (Minikube)

```bash
# Start Minikube
minikube start --memory=4096 --cpus=2

# Build images
eval $(minikube docker-env)
docker build -f infra/docker/Dockerfile.backend -t todo-backend:latest .
docker build -f infra/docker/Dockerfile.frontend -t todo-frontend:latest .

# Deploy with Helm
helm install todo-app infra/helm/todo-app \
  --set secrets.geminiApiKey=YOUR_KEY \
  --set secrets.databaseUrl=YOUR_DB_URL \
  --set secrets.authSecret=YOUR_SECRET

# Access
minikube tunnel
# Frontend: http://localhost:30001
# Backend:  http://localhost:8000
```

## Architecture

```
┌─────────────────┐     ┌──────────────────────────────────┐     ┌──────────────┐
│  Next.js 16     │────▶│  FastAPI Backend                  │────▶│  Neon DB     │
│  Task Board     │     │  ├── REST API (/api/{user}/tasks) │     │  PostgreSQL  │
│  AI Chat UI     │     │  ├── Chat API (/api/{user}/chat)  │     └──────────────┘
└─────────────────┘     │  ├── Gemini 2.5 Flash Agent       │
                        │  └── MCP Tools (5 tools)          │     ┌──────────────┐
                        └──────────────────────────────────┘     │  Redpanda    │
                                        │                        │  (Kafka)     │
                                        ▼                        └──────────────┘
                               ┌────────────────┐
                               │  Dapr Sidecar  │
                               │  Pub/Sub       │
                               │  State         │
                               │  Cron Bindings │
                               └────────────────┘
```

## Repository Structure

```
HACKATHON_2/
├── .spec-kit/               # Spec-Kit configuration
├── .github/workflows/       # CI/CD (GitHub Actions)
├── specs/                   # All specifications
│   ├── overview.md
│   ├── features/            # Feature specs
│   ├── api/                 # API specs
│   ├── database/            # Schema specs
│   ├── ui/                  # UI specs
│   └── infrastructure/      # Infra specs
├── backend/                 # FastAPI + Gemini + MCP Tools
│   ├── main.py              # Entry point
│   ├── agent.py             # Gemini 2.5 Flash agent
│   ├── db.py                # Neon DB connection
│   ├── mcp_server/tools.py  # 5 MCP tools
│   ├── routes/              # chat.py, tasks.py
│   ├── models/models.py     # SQLModel tables
│   └── kafka/               # Kafka producer + Dapr publisher
├── todo-app-fullstack/      # Next.js frontend
│   ├── pages/               # Task board + AI chat
│   └── components/          # UI components
├── infra/
│   ├── docker/              # Dockerfiles
│   ├── helm/todo-app/       # Helm charts
│   └── dapr-components/     # Dapr YAML configs
├── phases/phase-1/          # Python console app
├── CLAUDE.md                # Claude Code instructions
└── docker-compose.yml       # Local dev compose
```

## Bonus Features

### 🇵🇰 Urdu Support (+100 pts)
The AI chatbot understands and responds in Urdu:
```
User: گروسری خریدنے کا کام شامل کریں
Bot:  ✅ بہت اچھا! میں نے 'گروسری خریدنا' آپ کی فہرست میں شامل کر دیا ہے۔
```

### Kafka Events (+Phase V)
- `task-events` topic: all CRUD operations
- `reminders` topic: due date notifications  
- `task-updates` topic: real-time sync

### Dapr Integration (+Phase V)
- Pub/Sub via `kafka-pubsub` component
- State management via `statestore` (PostgreSQL)
- Cron binding: reminder checks every 5 minutes
- Secrets via Kubernetes secrets store

## Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://...@neon.tech/neondb?sslmode=require
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:3001
```

### Frontend (`todo-app-fullstack/.env.local`)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Submission
- 📦 [GitHub Repo](https://github.com/asma-aslam30/HACKATHON_2)
- 🌐 Vercel: *(add after deploy)*
- 📹 Demo: *(add video link)*
- 📝 [Submit Form](https://forms.gle/KMKEKaFUD6ZX4UtY8)

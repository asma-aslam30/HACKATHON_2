# Todo App — Hackathon II Overview

## Purpose
A todo application that evolves from a Python console app to a Kubernetes-managed,
event-driven, AI-powered distributed system.

## Current Phase
Phase IV: Local Kubernetes Deployment (Minikube + Helm)

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS |
| Backend | Python FastAPI |
| AI Agent | Gemini 2.5 Flash (replaces OpenAI) |
| MCP Tools | Custom FastAPI tools (5 tools) |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Auth | Better Auth (JWT) |
| Container | Docker |
| Orchestration | Kubernetes (Minikube) |
| Package Mgr | Helm Charts |
| Event Bus | Kafka (Redpanda) |
| Runtime | Dapr |

## Phase Completion
- [x] Phase I — Python Console App (100 pts)
- [x] Phase II — Full-Stack Web App (150 pts)
- [x] Phase III — AI Chatbot with Gemini + MCP (200 pts)
- [x] Phase IV — Docker + Helm + Kubernetes (250 pts)
- [ ] Phase V — Cloud + Kafka + Dapr (300 pts)

## Bonus Features
- [ ] Urdu language support (+100 pts)
- [ ] Voice commands (+200 pts)
- [ ] Reusable Claude Code subagents (+200 pts)
- [ ] Cloud-native blueprints (+200 pts)

## Repository Structure
```
HACKATHON_2/
├── .spec-kit/         # Spec-Kit configuration
├── specs/             # All specifications
│   ├── features/      # Feature specs
│   ├── api/           # API specs
│   ├── database/      # Schema specs
│   ├── ui/            # UI specs
│   └── infrastructure/# Infra specs
├── backend/           # FastAPI + Gemini + MCP
├── todo-app-fullstack/# Next.js frontend
├── phases/phase-1/    # Python console app
├── infra/             # Docker, Helm, Dapr, Kafka
│   ├── docker/        # Dockerfiles
│   ├── helm/          # Helm charts
│   ├── dapr-components/# Dapr YAML
│   └── kafka/         # Kafka/Redpanda config
└── CLAUDE.md          # Root Claude Code instructions
```

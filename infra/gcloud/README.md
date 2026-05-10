# Google Cloud Deployment Guide

## Two Options

| Option | Time | Points | Best For |
|--------|------|--------|----------|
| Cloud Run | 30 min | Phase II+III (350 pts) | Quick live deploy |
| GKE | 1-2 hrs | Phase V (300 pts bonus) | Full Kubernetes |

---

## Option 1 — Cloud Run (Do this first)

### Prerequisites
```powershell
# Install gcloud CLI (if not installed)
# Download: https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Check your project ID
gcloud projects list
```

### Deploy everything with one script
```powershell
cd HACKATHON_2

.\infra\gcloud\deploy-gcloud.ps1 `
  -ProjectId "your-project-id" `
  -Region "us-central1" `
  -DatabaseUrl "postgresql://neondb_owner:PASSWORD@ep-xxx.neon.tech/neondb?sslmode=require" `
  -GeminiApiKey "your-gemini-api-key"
```

### What the script does automatically
1. Enables Cloud Run, Cloud Build, Secret Manager APIs
2. Creates Artifact Registry for Docker images
3. Stores all secrets in Google Secret Manager
4. Builds backend + frontend with Cloud Build
5. Deploys both to Cloud Run
6. Gives you live HTTPS URLs

### Expected output
```
✅ DEPLOYMENT COMPLETE!
🌐 Frontend:  https://todo-frontend-xxx-uc.a.run.app
⚙️  Backend:   https://todo-backend-xxx-uc.a.run.app
📖 API Docs:  https://todo-backend-xxx-uc.a.run.app/docs
💬 AI Chat:   https://todo-frontend-xxx-uc.a.run.app/chat
```

---

## Option 2 — GKE (Phase V — run after Cloud Run)

### Prerequisites
```powershell
# Install kubectl
gcloud components install kubectl

# Install Helm
winget install Helm.Helm

# Install Dapr CLI
winget install Dapr.CLI
```

### Deploy GKE cluster
```powershell
.\infra\gcloud\deploy-gke.ps1 `
  -ProjectId "your-project-id" `
  -Region "us-central1"
```

### What you get
- GKE Autopilot cluster (no node management)
- Dapr installed with Kafka pubsub + statestore
- Helm chart deployed
- Same images from Cloud Run reused

---

## Manual steps (if script fails at any point)

### Enable APIs manually
```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com
```

### Build images manually
```powershell
$PROJECT = "your-project-id"
$REGION = "us-central1"
$REG = "$REGION-docker.pkg.dev/$PROJECT/todo-app"

gcloud auth configure-docker "$REGION-docker.pkg.dev"

# Backend
gcloud builds submit . --tag "$REG/todo-backend:latest" --dockerfile infra/docker/Dockerfile.backend

# Frontend
gcloud builds submit . --tag "$REG/todo-frontend:latest" --dockerfile infra/docker/Dockerfile.frontend
```

### Deploy manually
```powershell
# Backend
gcloud run deploy todo-backend `
  --image "$REG/todo-backend:latest" `
  --region us-central1 `
  --allow-unauthenticated `
  --port 8080 `
  --set-env-vars "GEMINI_MODEL=gemini-2.5-flash,DATABASE_URL=YOUR_URL,GEMINI_API_KEY=YOUR_KEY,BETTER_AUTH_SECRET=YOUR_SECRET"

# Frontend (after getting backend URL)
gcloud run deploy todo-frontend `
  --image "$REG/todo-frontend:latest" `
  --region us-central1 `
  --allow-unauthenticated `
  --port 3000 `
  --set-env-vars "NODE_ENV=production,NEXT_PUBLIC_BACKEND_URL=BACKEND_URL,DATABASE_URL=YOUR_URL,AUTH_SECRET=YOUR_SECRET"
```

---

## Costs
- Cloud Run: **Free** (2 million requests/month free tier)
- GKE Autopilot: ~$0.10/hour (~$2.40/day) — use $300 free credit
- Cloud Build: 120 free build-minutes/day
- Secret Manager: Free for first 6 secrets
- Artifact Registry: 0.5 GB free storage

## Finding your Project ID
```powershell
gcloud projects list
# or
gcloud config get-value project
```

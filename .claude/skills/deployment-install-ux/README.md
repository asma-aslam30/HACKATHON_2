# Deployment & Install UX Skill

**Purpose**: Design zero-config deployment flows and one-command installation scripts for Evolution of Todo hackathon phases I-V with colored output and progress bars

**Owner**: CloudOps Agent + Infrastructure Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Deployment & Install UX Skill** enables frictionless setup and deployment:
- Design phase-specific installation flows (one-command setup)
- Create Makefiles with colored output and progress indicators
- Generate Docker Compose configurations for local development
- Implement Kubernetes deployment manifests with Helm charts
- Configure CI/CD pipelines (GitHub Actions)
- Manage secrets and environment variables securely
- Generate comprehensive installation documentation

This skill ensures developers can get started in < 5 minutes and deploy to production with confidence.

---

## Skill Components

### 1. Phase-Specific Install Flows

**Phase I (CLI)**:
```bash
# One-command install
pip install -r requirements.txt && todo --help

# With virtual environment
python -m venv venv && source venv/bin/activate && pip install -e .
```

**Phase II (Web App)**:
```bash
# Development environment
make dev

# Equivalent to:
# - Start PostgreSQL (Docker)
# - Run Alembic migrations
# - Start FastAPI backend
# - Start Next.js frontend
```

**Phase III (AI Chatbot)**:
```bash
# Development with MCP tools
make dev-chatbot

# Starts Phase II stack + MCP server + ChatKit UI
```

**Phase IV (Kubernetes)**:
```bash
# Local Kubernetes (Minikube)
make k8s-dev

# Equivalent to:
# - Start Minikube cluster
# - Apply Kubernetes manifests
# - Port-forward services
# - Show service URLs
```

**Phase V (Cloud)**:
```bash
# Deploy to production (GitHub Actions)
git push origin main

# Manual deploy
make deploy-prod
```

### 2. UX Standards for Install Scripts

**Colored Output**:
```bash
# Success (green)
echo -e "\033[0;32m✓\033[0m Backend started on http://localhost:8000"

# Info (blue)
echo -e "\033[0;34mℹ\033[0m Installing dependencies..."

# Warning (yellow)
echo -e "\033[0;33m⚠\033[0m Port 8000 already in use, using 8001"

# Error (red)
echo -e "\033[0;31m✗\033[0m Failed to start database"
```

**Progress Bars**:
```bash
# Simple progress indicator
echo -n "Installing dependencies... "
pip install -r requirements.txt > /dev/null 2>&1
echo "✓ Done"

# Percentage progress
for i in {1..5}; do
  echo -ne "Progress: $(($i*20))%\r"
  sleep 1
done
echo "Progress: 100%"
```

**Clear Status Messages**:
```bash
echo "🚀 Starting Evolution of Todo - Phase II"
echo ""
echo "Services:"
echo "  • FastAPI Backend: http://localhost:8000"
echo "  • Next.js Frontend: http://localhost:3000"
echo "  • PostgreSQL: localhost:5432"
echo ""
echo "Logs:"
echo "  • Backend: tail -f logs/backend.log"
echo "  • Frontend: tail -f logs/frontend.log"
```

### 3. Makefile Structure

**Standard Targets**:
- `make install` - Install dependencies
- `make dev` - Start development environment
- `make test` - Run tests
- `make build` - Build for production
- `make deploy` - Deploy to production
- `make clean` - Clean build artifacts
- `make help` - Show available commands

### 4. Docker Compose for Local Development

**Multi-service orchestration**:
- PostgreSQL database
- FastAPI backend (hot reload)
- Next.js frontend (hot reload)
- Adminer (database UI)
- MCP tool server (Phase III)

### 5. Secrets Management

**.env.example**:
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todos

# Authentication
JWT_SECRET=your-secret-key-here
BETTER_AUTH_SECRET=your-auth-secret

# External APIs
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx

# Environment
NODE_ENV=development
```

**Secrets in CI/CD**:
- GitHub Secrets for production
- Kubernetes Secrets for K8s deployments
- Never commit secrets to git

---

## Skill Instructions

### Step 1: Design Install Flow

Create a smooth installation experience.

**Template**:
```markdown
## Phase [I/II/III/IV/V] Installation

**Prerequisites**:
- [Tool] version X.X+
- [Tool] version Y.Y+

**Installation Steps**:
1. Clone repository
2. Install dependencies
3. Configure environment
4. Start services
5. Verify installation

**Time to Complete**: [X minutes]
```

---

#### Example: Phase II Installation

```markdown
## Phase II Installation (Web App)

**Prerequisites**:
- Python 3.13+
- Node.js 20+
- Docker Desktop (for PostgreSQL)

**One-Command Install**:
\`\`\`bash
make dev
\`\`\`

**Manual Installation**:

1. **Clone repository**
\`\`\`bash
git clone https://github.com/yourusername/evolution-of-todo.git
cd evolution-of-todo
\`\`\`

2. **Install backend dependencies**
\`\`\`bash
cd packages/backend
pip install poetry
poetry install
\`\`\`

3. **Install frontend dependencies**
\`\`\`bash
cd packages/frontend
pnpm install
\`\`\`

4. **Configure environment**
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

5. **Start services**
\`\`\`bash
# Terminal 1: Start database
docker-compose up -d postgres

# Terminal 2: Start backend
cd packages/backend
poetry run uvicorn app.main:app --reload

# Terminal 3: Start frontend
cd packages/frontend
pnpm dev
\`\`\`

6. **Verify installation**
- Backend: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Database: localhost:5432

**Time to Complete**: 5 minutes
```

---

### Step 2: Create Makefile

Design a comprehensive Makefile with colored output.

**Makefile Template**:
```makefile
.PHONY: help install dev test build deploy clean

# Colors
GREEN  := \033[0;32m
BLUE   := \033[0;34m
YELLOW := \033[0;33m
RED    := \033[0;31m
RESET  := \033[0m

help: ## Show this help
	@echo "$(BLUE)Evolution of Todo - Available Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "$(BLUE)ℹ$(RESET) Installing dependencies..."
	@cd packages/backend && poetry install
	@cd packages/frontend && pnpm install
	@echo "$(GREEN)✓$(RESET) Dependencies installed"

dev: ## Start development environment (Phase II)
	@echo "$(BLUE)🚀 Starting Evolution of Todo - Phase II$(RESET)"
	@echo ""
	@docker-compose up -d postgres
	@echo "$(GREEN)✓$(RESET) PostgreSQL started"
	@cd packages/backend && poetry run alembic upgrade head
	@echo "$(GREEN)✓$(RESET) Database migrated"
	@echo ""
	@echo "$(BLUE)Services:$(RESET)"
	@echo "  • Backend:  http://localhost:8000"
	@echo "  • Frontend: http://localhost:3000"
	@echo "  • Database: localhost:5432"
	@echo ""
	@echo "$(YELLOW)Run in separate terminals:$(RESET)"
	@echo "  make dev-backend"
	@echo "  make dev-frontend"

dev-backend: ## Start FastAPI backend
	@cd packages/backend && poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start Next.js frontend
	@cd packages/frontend && pnpm dev

test: ## Run all tests
	@echo "$(BLUE)ℹ$(RESET) Running tests..."
	@cd packages/backend && poetry run pytest
	@cd packages/frontend && pnpm test
	@echo "$(GREEN)✓$(RESET) All tests passed"

build: ## Build for production
	@echo "$(BLUE)ℹ$(RESET) Building production assets..."
	@cd packages/frontend && pnpm build
	@echo "$(GREEN)✓$(RESET) Build complete"

deploy: ## Deploy to production (requires setup)
	@echo "$(BLUE)ℹ$(RESET) Deploying to production..."
	@./scripts/deploy.sh
	@echo "$(GREEN)✓$(RESET) Deployed successfully"

clean: ## Clean build artifacts
	@echo "$(BLUE)ℹ$(RESET) Cleaning build artifacts..."
	@find . -type d -name "__pycache__" -exec rm -rf {} +
	@find . -type d -name ".pytest_cache" -exec rm -rf {} +
	@find . -type d -name "node_modules" -exec rm -rf {} +
	@find . -type d -name ".next" -exec rm -rf {} +
	@echo "$(GREEN)✓$(RESET) Cleaned"
```

---

### Step 3: Create Docker Compose Configuration

**docker-compose.yml for Phase II**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: evolution-todo-postgres
    environment:
      POSTGRES_DB: todos
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
    container_name: evolution-todo-backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/todos
      JWT_SECRET: ${JWT_SECRET}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
    ports:
      - "8000:8000"
    volumes:
      - ./packages/backend:/app
    depends_on:
      postgres:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile.dev
    container_name: evolution-todo-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    volumes:
      - ./packages/frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    command: pnpm dev

  adminer:
    image: adminer:latest
    container_name: evolution-todo-adminer
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

**docker-compose.override.yml** (for local dev):
```yaml
version: '3.8'

services:
  backend:
    environment:
      DEBUG: "true"
      LOG_LEVEL: debug

  frontend:
    environment:
      NODE_ENV: development
```

---

### Step 4: Create Kubernetes Manifests (Phase IV)

**k8s/deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: evolution-todo-backend
  labels:
    app: evolution-todo
    component: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: evolution-todo
      component: backend
  template:
    metadata:
      labels:
        app: evolution-todo
        component: backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/yourusername/evolution-todo-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: evolution-todo-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: evolution-todo-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**k8s/service.yaml**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: evolution-todo-backend
  labels:
    app: evolution-todo
    component: backend
spec:
  type: ClusterIP
  ports:
  - port: 8000
    targetPort: 8000
    protocol: TCP
  selector:
    app: evolution-todo
    component: backend
```

**k8s/ingress.yaml**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: evolution-todo-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.evolution-todo.com
    secretName: evolution-todo-tls
  rules:
  - host: api.evolution-todo.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: evolution-todo-backend
            port:
              number: 8000
```

**Makefile for Kubernetes**:
```makefile
k8s-dev: ## Start local Kubernetes cluster
	@echo "$(BLUE)🚀 Starting Minikube cluster$(RESET)"
	@minikube start --cpus=4 --memory=8192
	@minikube addons enable ingress
	@echo "$(GREEN)✓$(RESET) Minikube started"
	@echo ""
	@echo "$(BLUE)ℹ$(RESET) Deploying to Kubernetes..."
	@kubectl apply -f k8s/
	@echo "$(GREEN)✓$(RESET) Deployed"
	@echo ""
	@echo "$(BLUE)Services:$(RESET)"
	@kubectl get services
	@echo ""
	@echo "$(YELLOW)Port forward with:$(RESET)"
	@echo "  kubectl port-forward svc/evolution-todo-backend 8000:8000"

k8s-stop: ## Stop Minikube cluster
	@minikube stop
	@echo "$(GREEN)✓$(RESET) Minikube stopped"

k8s-logs: ## View backend logs
	@kubectl logs -f -l component=backend

k8s-shell: ## Open shell in backend pod
	@kubectl exec -it $$(kubectl get pods -l component=backend -o name | head -1) -- /bin/bash
```

---

### Step 5: Create CI/CD Pipeline (Phase V)

**GitHub Actions Workflow**:

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.13
        uses: actions/setup-python@v5
        with:
          python-version: '3.13'

      - name: Install backend dependencies
        run: |
          cd packages/backend
          pip install poetry
          poetry install

      - name: Run backend tests
        run: |
          cd packages/backend
          poetry run pytest --cov=app --cov-report=xml

      - name: Set up Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install frontend dependencies
        run: |
          cd packages/frontend
          npm install -g pnpm
          pnpm install

      - name: Run frontend tests
        run: |
          cd packages/frontend
          pnpm test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}

      - name: Build and push backend image
        uses: docker/build-push-action@v5
        with:
          context: ./packages/backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

      - name: Build and push frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./packages/frontend
          push: true
          tags: ${{ steps.meta.outputs.tags }}-frontend
          labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Install doctl
        uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}

      - name: Save kubeconfig
        run: doctl kubernetes cluster kubeconfig save ${{ secrets.CLUSTER_NAME }}

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/evolution-todo-backend \
            backend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          kubectl set image deployment/evolution-todo-frontend \
            frontend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}

      - name: Verify deployment
        run: |
          kubectl rollout status deployment/evolution-todo-backend
          kubectl rollout status deployment/evolution-todo-frontend

      - name: Run database migrations
        run: |
          kubectl exec -it $(kubectl get pod -l component=backend -o name | head -1) \
            -- poetry run alembic upgrade head

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployed Evolution of Todo to production'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

**Makefile for deployment**:
```makefile
deploy-prod: ## Deploy to production (GitHub Actions)
	@echo "$(BLUE)ℹ$(RESET) Deploying to production via GitHub Actions..."
	@git push origin main
	@echo "$(GREEN)✓$(RESET) Pushed to main branch"
	@echo ""
	@echo "$(BLUE)Monitor deployment:$(RESET)"
	@echo "  https://github.com/$(GITHUB_REPO)/actions"

deploy-staging: ## Deploy to staging
	@echo "$(BLUE)ℹ$(RESET) Deploying to staging..."
	@git push origin staging
	@echo "$(GREEN)✓$(RESET) Pushed to staging branch"
```

---

### Step 6: Create Installation Documentation

**docs/install.md**:
```markdown
# Installation Guide - Evolution of Todo

**Quick Start**: Get up and running in 5 minutes

---

## Prerequisites

- **Python 3.13+** - [Download](https://python.org)
- **Node.js 20+** - [Download](https://nodejs.org)
- **Docker Desktop** - [Download](https://docker.com) (for Phase II+)
- **Git** - [Download](https://git-scm.com)

---

## Phase I: CLI Installation

\`\`\`bash
# Clone repository
git clone https://github.com/yourusername/evolution-of-todo.git
cd evolution-of-todo

# Install CLI
cd packages/cli
pip install -e .

# Run CLI
todo list
\`\`\`

**Time**: 2 minutes

---

## Phase II: Web App Installation

### One-Command Setup

\`\`\`bash
make dev
\`\`\`

This will:
1. Start PostgreSQL in Docker
2. Run database migrations
3. Start FastAPI backend on :8000
4. Start Next.js frontend on :3000

### Manual Setup

See [Manual Installation](#manual-installation) below.

**Time**: 5 minutes

---

## Phase III: AI Chatbot Installation

\`\`\`bash
# Start Phase II + MCP server
make dev-chatbot

# Set environment variables
export ANTHROPIC_API_KEY=sk-ant-xxx
\`\`\`

**Time**: 5 minutes

---

## Phase IV: Kubernetes Installation

### Local Development (Minikube)

\`\`\`bash
# Start Minikube cluster
make k8s-dev

# Port forward services
kubectl port-forward svc/evolution-todo-backend 8000:8000
\`\`\`

**Time**: 10 minutes

---

## Phase V: Production Deployment

### GitHub Actions (Recommended)

\`\`\`bash
# Deploy by pushing to main
git push origin main
\`\`\`

### Manual Deployment

\`\`\`bash
# Configure Kubernetes cluster
export KUBECONFIG=~/.kube/config

# Deploy with Helm
helm upgrade --install evolution-todo ./helm/evolution-todo \
  --set image.tag=latest \
  --set ingress.host=app.evolution-todo.com
\`\`\`

**Time**: 15 minutes (first time)

---

## Environment Configuration

### .env.example

Copy and configure:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your values:

\`\`\`bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todos

# Authentication
JWT_SECRET=your-secret-key-here
BETTER_AUTH_SECRET=your-auth-secret

# External APIs
ANTHROPIC_API_KEY=sk-ant-xxx
\`\`\`

---

## Troubleshooting

### Port already in use

\`\`\`bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
PORT=8001 make dev-backend
\`\`\`

### Database connection failed

\`\`\`bash
# Check Docker status
docker ps

# Restart database
docker-compose restart postgres

# View logs
docker-compose logs -f postgres
\`\`\`

### Module not found

\`\`\`bash
# Reinstall dependencies
make clean
make install
\`\`\`

---

## Next Steps

- [Architecture Documentation](./architecture.md)
- [API Documentation](./api.md)
- [Development Workflow](./development.md)
- [Deployment Guide](./deployment.md)
```

---

## Related Agents

- **CloudOps Agent**: Primary owner, creates K8s manifests and CI/CD
- **Infrastructure Agent**: Manages cloud infrastructure and deployments
- **Backend Pro Agent**: Creates backend Dockerfiles and configs
- **Frontend UI/UX Agent**: Creates frontend build configurations

---

## Success Metrics

✅ **Zero-Config**: One-command setup works out of the box
✅ **Fast**: < 5 minutes from clone to running
✅ **Clear Feedback**: Colored output with progress indicators
✅ **Cross-Platform**: Works on Windows, Mac, Linux
✅ **Reproducible**: Same behavior in all environments
✅ **Documented**: Comprehensive installation guide
✅ **Secure**: Secrets managed via .env and GitHub Secrets
✅ **Automated**: CI/CD pipeline for deployments

---

## Best Practices

### Do's ✅

- **One Command**: `make dev` should start everything
- **Colored Output**: Green for success, red for errors
- **Progress Indicators**: Show what's happening
- **Health Checks**: Verify services are ready
- **Clear Errors**: Tell users how to fix issues
- **Docker by Default**: Use Docker for databases
- **Environment Files**: .env.example with all keys
- **Secrets Management**: Never commit secrets

### Don'ts ❌

- **Don't Require Manual Steps**: Automate everything
- **Don't Hardcode Values**: Use environment variables
- **Don't Ignore Errors**: Fail fast with clear messages
- **Don't Skip Documentation**: Document every command
- **Don't Use Complex Commands**: Keep it simple
- **Don't Forget Cleanup**: Provide `make clean`

---

## Integration with Other Skills

```
Architecture Specification (defines stack)
  ↓
API & Database Specification (defines services)
  ↓
DEPLOYMENT & INSTALL UX (this skill) ← Setup & deployment
  ↓
Code Generation (implements services)
  ↓
Test Design (CI/CD testing)
```

---

## Output Format

When using this skill, generate:

**1. Makefile** (with colored output, all targets)
**2. docker-compose.yml** (for local development)
**3. Kubernetes manifests** (deployments, services, ingress)
**4. GitHub Actions workflows** (CI/CD pipeline)
**5. .env.example** (with all required variables)
**6. docs/install.md** (installation guide)
**7. docs/deployment.md** (deployment guide)

Save files to:
- `Makefile` - Root directory
- `docker-compose.yml` - Root directory
- `.env.example` - Root directory
- `k8s/` - Kubernetes manifests
- `.github/workflows/` - CI/CD pipelines
- `docs/` - Documentation

---

## References

- **Docker Compose**: https://docs.docker.com/compose/
- **Kubernetes**: https://kubernetes.io/docs/
- **Helm**: https://helm.sh/docs/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Make**: https://www.gnu.org/software/make/manual/

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 6 (Makefile, Docker Compose, K8s, GitHub Actions, install docs)
**Coverage**: All 5 Hackathon II Phases

---

*This deployment & install UX skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*

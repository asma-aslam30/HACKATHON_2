# Containerization & Docker Skill

**Skill Type**: Container Orchestration & Docker Configuration
**Version**: 1.0.0
**Created**: 2025-12-25
**Owner**: Spec Architect Agent

---

## Overview

The **Containerization & Docker** skill provides comprehensive design patterns for containerizing the Evolution of Todo monorepo using Docker, with multi-stage builds, security best practices, and production-ready configurations for Phase IV deployment.

**Purpose**: Design and implement Dockerfiles for each package (frontend, backend, database) with multi-stage builds, layer optimization, and security hardening for efficient container deployments.

**Output**:
- `infra/docker/Dockerfile.frontend` - Next.js multi-stage build
- `infra/docker/Dockerfile.backend` - FastAPI production container
- `infra/docker/Dockerfile.db` - PostgreSQL with migrations
- `docker-compose.yml` - Local development orchestration
- `.dockerignore` - Build optimization

---

## Skill Components

### 1. Multi-Stage Docker Builds
- Separate build and runtime stages
- Minimize final image size
- Layer caching optimization
- Development vs production configurations

### 2. Security Best Practices
- Non-root user execution
- Minimal base images (alpine, slim)
- Vulnerability scanning
- Secret management
- Read-only file systems where possible

### 3. Container Orchestration
- Docker Compose for local development
- Health checks and dependencies
- Volume management
- Network isolation
- Environment configuration

### 4. Production Optimizations
- Layer caching strategies
- Build-time vs runtime dependencies
- Image size minimization
- Startup time optimization

---

## Architecture

```
evolution_of_todo/
├── frontend/               # Next.js application
│   └── Dockerfile → nginx
├── backend/                # FastAPI application
│   └── Dockerfile → uvicorn + gunicorn
├── infra/
│   └── docker/
│       ├── Dockerfile.frontend
│       ├── Dockerfile.backend
│       ├── Dockerfile.db
│       └── .dockerignore
├── docker-compose.yml      # Local development
└── docker-compose.prod.yml # Production configuration
```

---

## Frontend Dockerfile (Next.js)

### Multi-Stage Build Strategy

**Stage 1: Dependencies**
- Install only production dependencies
- Leverage layer caching

**Stage 2: Builder**
- Copy source code
- Run Next.js build
- Generate optimized static assets

**Stage 3: Runtime (nginx)**
- Copy built assets
- Serve with nginx
- Minimal final image size

### Image Size Comparison

| **Stage** | **Base Image** | **Size** |
|-----------|----------------|----------|
| Dependencies | node:20-alpine | ~180 MB |
| Builder | node:20-alpine | ~500 MB |
| Runtime | nginx:alpine | ~25 MB |

**Final Image**: ~25 MB (static files only)

---

## Backend Dockerfile (FastAPI)

### Multi-Stage Build Strategy

**Stage 1: Builder**
- Install build dependencies
- Compile Python wheels
- Create virtual environment

**Stage 2: Runtime**
- Copy only runtime dependencies
- Non-root user
- Uvicorn + Gunicorn for production

### Image Size Comparison

| **Stage** | **Base Image** | **Size** |
|-----------|----------------|----------|
| Builder | python:3.13-slim | ~180 MB |
| Runtime | python:3.13-slim | ~220 MB |

**Final Image**: ~220 MB (minimal Python runtime)

---

## Database Container (PostgreSQL)

### Strategy

- Use official PostgreSQL image
- Custom initialization scripts
- Alembic migrations on startup
- Health checks
- Data persistence with volumes

---

## Security Best Practices

### 1. Non-Root User

**Why**: Prevent privilege escalation attacks

```dockerfile
# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Switch to non-root user
USER nextjs
```

### 2. Minimal Base Images

| **Image Type** | **Size** | **Use Case** |
|----------------|----------|--------------|
| `alpine` | ~5 MB | Minimal, production |
| `slim` | ~50 MB | Balanced |
| `full` | ~200+ MB | Development only |

### 3. Multi-Stage Builds

- Separate build tools from runtime
- Reduce attack surface
- Smaller image size

### 4. Layer Optimization

- Copy dependencies first (better caching)
- Copy source code last (changes frequently)
- Combine RUN commands to reduce layers

### 5. Vulnerability Scanning

```bash
# Scan images for vulnerabilities
docker scan evolution-todo-frontend:latest
docker scan evolution-todo-backend:latest
```

---

## Docker Compose Structure

### Services

1. **Frontend** (Next.js)
   - Port: 3000
   - Depends on: backend
   - Health check: HTTP GET /

2. **Backend** (FastAPI)
   - Port: 8000
   - Depends on: database
   - Health check: HTTP GET /health

3. **Database** (PostgreSQL)
   - Port: 5432
   - Volume: postgres-data
   - Health check: pg_isready

4. **Redis** (Cache - optional)
   - Port: 6379
   - Volume: redis-data

### Networks

- `evolution-todo-network`: Bridge network for service communication

### Volumes

- `postgres-data`: Database persistence
- `redis-data`: Cache persistence

---

## Development vs Production

### Development (docker-compose.yml)

- Source code mounted as volumes (hot reload)
- Exposed ports for debugging
- Verbose logging
- Development dependencies included

### Production (docker-compose.prod.yml)

- No source code mounts
- Internal networks only
- Production logging
- Optimized images
- Secrets from environment

---

## Build Commands

### Build Images

```bash
# Frontend
docker build -f infra/docker/Dockerfile.frontend -t evolution-todo-frontend:latest .

# Backend
docker build -f infra/docker/Dockerfile.backend -t evolution-todo-backend:latest .

# All services
docker-compose build
```

### Run Containers

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Stop and Clean

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Remove images
docker rmi evolution-todo-frontend evolution-todo-backend
```

---

## Environment Variables

### Frontend (.env.frontend)

```bash
NEXT_PUBLIC_API_URL=http://backend:8000
NEXT_PUBLIC_ENV=production
NODE_ENV=production
```

### Backend (.env.backend)

```bash
DATABASE_URL=postgresql://user:pass@db:5432/evolution_todo
SECRET_KEY=your-secret-key
ENVIRONMENT=production
CORS_ORIGINS=http://localhost:3000,https://app.evolution-todo.com
```

### Database (.env.db)

```bash
POSTGRES_USER=evolution_todo_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=evolution_todo
```

---

## Health Checks

### Frontend

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Backend

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Database

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U evolution_todo_user"]
  interval: 10s
  timeout: 5s
  retries: 5
```

---

## Performance Optimizations

### 1. Layer Caching

```dockerfile
# ✅ Good: Dependencies first (cached)
COPY package*.json ./
RUN npm ci --only=production

# Then source code (changes frequently)
COPY . .
```

```dockerfile
# ❌ Bad: Source code first (no caching)
COPY . .
RUN npm ci --only=production
```

### 2. .dockerignore

Exclude unnecessary files from build context:

```
node_modules/
.next/
dist/
build/
.git/
.env*
*.log
*.md
.vscode/
.idea/
coverage/
```

### 3. Multi-Stage Builds

- Build stage: ~500 MB
- Runtime stage: ~25 MB
- **Savings**: 95% smaller image

### 4. Parallel Builds

```bash
# Build services in parallel
docker-compose build --parallel
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Frontend
        run: docker build -f infra/docker/Dockerfile.frontend -t evolution-todo-frontend:${{ github.sha }} .
      
      - name: Build Backend
        run: docker build -f infra/docker/Dockerfile.backend -t evolution-todo-backend:${{ github.sha }} .
      
      - name: Push to Registry
        run: |
          docker push evolution-todo-frontend:${{ github.sha }}
          docker push evolution-todo-backend:${{ github.sha }}
```

---

## Monitoring & Logging

### Container Logs

```bash
# View logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

### Container Stats

```bash
# Resource usage
docker stats

# Specific container
docker stats evolution-todo-backend
```

### Health Status

```bash
# Check health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## Troubleshooting

### Common Issues

| **Issue** | **Cause** | **Solution** |
|-----------|-----------|--------------|
| Build fails: "Cannot find module" | Missing dependencies | Check package.json, clear cache |
| Container exits immediately | Error in entrypoint | Check logs: `docker logs <container>` |
| Port already in use | Port conflict | Change port in docker-compose.yml |
| Permission denied | File ownership | Check USER directive, volume permissions |
| Slow builds | No layer caching | Optimize Dockerfile order, use .dockerignore |

### Debug Commands

```bash
# Interactive shell in container
docker exec -it evolution-todo-backend /bin/bash

# Inspect container
docker inspect evolution-todo-frontend

# Check container processes
docker top evolution-todo-backend

# View container filesystem
docker diff evolution-todo-frontend
```

---

## Related Agents

- **CloudOps Agent** (`.claude/agents/cloudops.md`): Deploys containers to cloud
- **Infra Agent** (`.claude/agents/infra.md`): Manages infrastructure
- **Spec Architect Agent** (`.claude/agents/spec-architect.md`): Designs container architecture

---

## Skill Invocation

**For Docker Configuration Design**:
```
Act as Spec Architect Agent and design Docker containerization for the monorepo
```

**For Implementation**:
```
Act as CloudOps Agent and implement Dockerfiles for all services
```

---

## Success Metrics

A well-designed container system has:
- ✅ Multi-stage builds for all services
- ✅ Final images < 250 MB (backend), < 50 MB (frontend)
- ✅ Non-root user execution
- ✅ Layer caching optimized
- ✅ Health checks configured
- ✅ Development and production configs
- ✅ Secrets externalized
- ✅ .dockerignore configured
- ✅ Build time < 5 minutes
- ✅ Zero vulnerability scan issues

---

## Revision History

| **Version** | **Date**       | **Changes**                                      |
|-------------|----------------|--------------------------------------------------|
| 1.0.0       | 2025-12-25     | Initial skill documentation                      |

---

## References

- **Constitution**: `.specify/memory/constitution.md` (Principle VI: Performance, Principle VII: Security)
- **CloudOps Agent**: `.claude/agents/cloudops.md`
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Multi-Stage Builds**: https://docs.docker.com/build/building/multi-stage/

---

**Status**: Ready for Phase IV implementation
**Activation**: See skill invocation section above

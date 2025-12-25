# Integration Wiring Skill

**Purpose**: Wire components across monorepo layers (frontend, backend, database, infrastructure) per architecture specifications

**Owner**: CloudOps & Kubernetes Agent + Backend / FastAPI Pro Agent + System Architect Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Integration Wiring Skill** enables systematic connection of all system components:
- Connect frontend to backend (API calls, authentication)
- Wire backend to database (connection strings, migrations)
- Configure infrastructure (Docker Compose, Kubernetes services)
- Generate environment configuration (`.env`, ConfigMaps, Secrets)
- Set up cross-cutting concerns (CORS, JWT, logging, observability)

This skill ensures all layers communicate correctly and securely across the monorepo.

---

## Skill Components

### 1. Layer Connection

Wire architectural layers per phase diagrams:

**Frontend → Backend**:
- API base URL configuration
- Authentication headers (JWT tokens)
- CORS origin whitelisting
- Request/response interceptors

**Backend → Database**:
- Connection string configuration
- Connection pooling
- Migration execution
- Health checks

**Backend → External Services**:
- Anthropic API (Claude)
- OpenAI API (ChatKit)
- Email services (SendGrid, Mailgun)
- Storage services (S3, GCS)

**Application → Infrastructure**:
- Docker Compose service linking
- Kubernetes Service discovery
- Environment variable injection
- Secret management

### 2. Phase-Specific Wiring

**Phase I: Console CLI**
- No wiring needed (in-memory storage)
- Optional: Config file for settings

**Phase II: Web App (Next.js + FastAPI + PostgreSQL)**
- Frontend → Backend: HTTP calls with JWT
- Backend → Database: SQLModel connection
- CORS: Allow frontend origin
- Auth: Better Auth JWT validation

**Phase III: AI Chatbot (ChatKit + MCP + Claude)**
- Frontend → MCP Server: ChatKit SDK
- MCP Server → Backend: REST API calls
- Backend → Claude API: Anthropic SDK
- Voice: Whisper API integration

**Phase IV: Kubernetes (Docker + Minikube + Helm)**
- Services → Services: DNS-based discovery
- Pods → Database: Service endpoints
- Ingress → Services: HTTP routing
- ConfigMaps/Secrets injection

**Phase V: Cloud-Native (Multi-cloud + Kafka + Dapr)**
- Services → Kafka: Event streaming
- Services → Dapr: Service mesh
- Multi-region → Load Balancer
- GitHub Actions → Cloud platforms

### 3. Configuration Generation

Create configuration files for each layer:

**Environment Variables** (`.env`):
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/evolution_todo

# Backend API
API_URL=http://localhost:8000
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# External APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: evolution_todo
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./packages/backend
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/evolution_todo
    ports:
      - "8000:8000"

  frontend:
    build: ./packages/frontend
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

**Package Scripts** (`package.json`):
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd packages/backend && poetry run uvicorn app.main:app --reload",
    "dev:frontend": "cd packages/frontend && npm run dev",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "migrate": "cd packages/backend && alembic upgrade head"
  }
}
```

### 4. Cross-Cutting Concerns

Configure system-wide features:

**CORS Configuration**:
```python
# packages/backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev
        "https://evolution-todo.vercel.app",  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**JWT Middleware**:
```python
# packages/backend/app/core/deps.py
from fastapi import Depends, HTTPException
from jose import jwt, JWTError

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401)
        return await get_user_by_id(user_id)
    except JWTError:
        raise HTTPException(status_code=401)
```

**Logging Configuration**:
```python
# packages/backend/app/core/logging.py
import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
        }
        return json.dumps(log_obj)

logging.basicConfig(level=logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logging.getLogger().addHandler(handler)
```

---

## Skill Instructions

### Step 1: Analyze Architecture

Map component connections from architecture specs.

**Template**:
```markdown
## Architecture Analysis

**Phase**: [II, III, IV, or V]
**Spec Reference**: .claude/skills/architecture-specification/README.md

### Component Inventory

| Component | Type | Location | Dependencies |
|-----------|------|----------|--------------|
| Frontend | Next.js 16 | packages/frontend | Backend API |
| Backend | FastAPI | packages/backend | PostgreSQL, Claude API |
| Database | PostgreSQL | Neon / Local | None |
| Chatbot | MCP Server | packages/chatbot | Backend API, Claude API |

### Connection Requirements

**Frontend → Backend**:
- Protocol: HTTP/HTTPS
- Auth: JWT Bearer token
- Base URL: $API_URL
- CORS: Enabled

**Backend → Database**:
- Protocol: PostgreSQL wire protocol
- Connection string: $DATABASE_URL
- Pool size: 10 connections
- Health check: SELECT 1

**Backend → External APIs**:
- Claude API: Anthropic SDK with $ANTHROPIC_API_KEY
- Authentication: API key in header
```

**Example (Phase II)**:
```markdown
## Architecture Analysis

**Phase**: II (Web App with Backend + Frontend)
**Spec Reference**: .claude/skills/architecture-specification/README.md (Phase II diagram)

### Component Inventory

| Component | Type | Location | Dependencies |
|-----------|------|----------|--------------|
| Frontend | Next.js 16 | packages/frontend | Backend API (port 8000) |
| Backend | FastAPI | packages/backend | PostgreSQL (port 5432) |
| Database | PostgreSQL | Neon (remote) | None |
| Auth | Better Auth | packages/backend | PostgreSQL, JWT secret |

### Connection Requirements

**Frontend → Backend**:
- Protocol: HTTP (dev), HTTPS (prod)
- Auth: JWT Bearer token in Authorization header
- Base URL: http://localhost:8000 (dev), https://api.evolution-todo.com (prod)
- CORS: Allow http://localhost:3000 and https://evolution-todo.vercel.app

**Backend → Database**:
- Protocol: PostgreSQL wire protocol (SSL required for Neon)
- Connection string: postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/evolution_todo?sslmode=require
- Pool size: 10 connections
- Health check: SELECT 1

**Backend → Frontend** (for SSR):
- Not required (Next.js calls backend from browser)
```

---

### Step 2: Generate Environment Configuration

Create `.env.example` with all required variables.

**Template**:
```bash
# .env.example

###################
# Database
###################
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
# For Neon: postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

###################
# Backend API
###################
API_URL=http://localhost:8000
API_PORT=8000
API_HOST=0.0.0.0
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

###################
# Authentication
###################
JWT_SECRET=your-very-long-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600  # 1 hour in seconds
REFRESH_TOKEN_EXPIRATION=2592000  # 30 days in seconds

###################
# Frontend
###################
NEXT_PUBLIC_API_URL=http://localhost:8000
# Note: Only vars prefixed with NEXT_PUBLIC_ are exposed to browser

###################
# External APIs
###################
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG...

###################
# Observability (Phase IV+)
###################
PROMETHEUS_PORT=9090
JAEGER_ENDPOINT=http://localhost:14268/api/traces
LOG_LEVEL=INFO
```

**Example (Phase II)**:
```bash
# .env.example - Phase II Web App

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://evolution_todo_user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/evolution_todo?sslmode=require

# Backend API
API_URL=http://localhost:8000
API_PORT=8000
ALLOWED_ORIGINS=http://localhost:3000

# Authentication (Better Auth)
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600

# Frontend (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Email (for password reset, etc.)
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@evolution-todo.com
```

---

### Step 3: Wire Frontend to Backend

Configure API calls with authentication.

**Frontend API Client**:
```typescript
// packages/frontend/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * API client with JWT authentication
 */
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Make authenticated request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Get JWT token from Better Auth session
    const session = await auth();
    const token = session?.accessToken;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Unauthorized - redirect to login
      redirect('/login');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  }

  // Task operations
  async getTasks(userId: number, filters?: { status?: string; priority?: string }) {
    const params = new URLSearchParams(filters as any);
    return this.request<Task[]>(`/api/${userId}/tasks?${params}`);
  }

  async createTask(userId: number, data: { title: string; description?: string; priority?: string }) {
    return this.request<Task>(`/api/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(userId: number, taskId: number, data: Partial<Task>) {
    return this.request<Task>(`/api/${userId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(userId: number, taskId: number) {
    return this.request<void>(`/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
```

**Usage in Next.js Server Component**:
```tsx
// packages/frontend/app/tasks/page.tsx

import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function TasksPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Fetch tasks using API client
  const tasks = await apiClient.getTasks(session.user.id);

  return (
    <div>
      <h1>My Tasks</h1>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
}
```

---

### Step 4: Wire Backend to Database

Configure SQLModel connection with pooling.

**Database Connection**:
```python
# packages/backend/app/core/database.py

from sqlmodel import create_engine, Session
from sqlalchemy.pool import NullPool
import os

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    pool_size=10,  # Max 10 connections in pool
    max_overflow=20,  # Allow 20 additional connections
    pool_pre_ping=True,  # Check connection health before using
    pool_recycle=3600,  # Recycle connections after 1 hour
)

def get_session():
    """Dependency for FastAPI routes to get database session."""
    with Session(engine) as session:
        yield session
```

**Usage in FastAPI Router**:
```python
# packages/backend/app/api/tasks.py

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.database import get_session

router = APIRouter()

@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: int,
    session: Session = Depends(get_session),  # Inject database session
):
    # Session automatically closed after request
    tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
    return tasks
```

**Health Check Endpoint**:
```python
# packages/backend/app/api/health.py

from fastapi import APIRouter, Depends
from sqlmodel import Session, text
from app.core.database import get_session

router = APIRouter()

@router.get("/health")
async def health_check(session: Session = Depends(get_session)):
    """Health check endpoint for load balancers."""
    try:
        # Test database connection
        session.exec(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}, 503
```

---

### Step 5: Configure CORS and Middleware

Set up cross-origin requests and JWT validation.

**CORS Configuration**:
```python
# packages/backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Evolution of Todo API")

# Get allowed origins from environment
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,  # Allow cookies and auth headers
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
from app.api import tasks, health, auth
app.include_router(health.router, tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tasks.router, tags=["tasks"])
```

**JWT Middleware**:
```python
# packages/backend/app/core/auth.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlmodel import Session, select
from app.models.user import User
from app.core.database import get_session
import os

security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    """
    Dependency to get current authenticated user from JWT token.

    Usage:
        @router.get("/api/{user_id}/tasks")
        async def list_tasks(
            user_id: int,
            current_user: User = Depends(get_current_user),
        ):
            # current_user is authenticated User object
    """
    token = credentials.credentials

    try:
        # Decode JWT token
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: int = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    # Get user from database
    user = session.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
```

---

### Step 6: Create Docker Compose Configuration

Wire services together in local development.

**Docker Compose File**:
```yaml
# docker-compose.yml

version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: evolution_todo_db
    environment:
      POSTGRES_DB: evolution_todo
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

  # FastAPI Backend
  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
    container_name: evolution_todo_backend
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/evolution_todo
      JWT_SECRET: dev-secret-key-change-in-production
      JWT_ALGORITHM: HS256
      ALLOWED_ORIGINS: http://localhost:3000
    ports:
      - "8000:8000"
    volumes:
      - ./packages/backend:/app  # Mount source for hot reload
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Next.js Frontend
  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
    container_name: evolution_todo_frontend
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    volumes:
      - ./packages/frontend:/app  # Mount source for hot reload
      - /app/node_modules  # Exclude node_modules
    command: npm run dev

  # MCP Server (Phase III)
  chatbot:
    build:
      context: ./packages/chatbot
      dockerfile: Dockerfile
    container_name: evolution_todo_chatbot
    depends_on:
      - backend
    environment:
      API_URL: http://backend:8000
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    ports:
      - "8001:8001"

volumes:
  postgres_data:
    driver: local

networks:
  default:
    name: evolution_todo_network
```

**Docker Compose Commands**:
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Run migrations
docker-compose exec backend alembic upgrade head

# Access database
docker-compose exec postgres psql -U postgres -d evolution_todo
```

---

### Step 7: Generate Package Scripts

Add monorepo development scripts.

**Root package.json**:
```json
{
  "name": "evolution-of-todo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd packages/backend && poetry run uvicorn app.main:app --reload",
    "dev:frontend": "cd packages/frontend && npm run dev",
    "dev:chatbot": "cd packages/chatbot && npm run dev",

    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd packages/frontend && npm run build",
    "build:backend": "cd packages/backend && poetry build",

    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd packages/backend && poetry run pytest",
    "test:frontend": "cd packages/frontend && npm test",

    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:rebuild": "docker-compose up -d --build",

    "db:migrate": "cd packages/backend && poetry run alembic upgrade head",
    "db:rollback": "cd packages/backend && poetry run alembic downgrade -1",
    "db:reset": "docker-compose down -v && docker-compose up -d postgres && npm run db:migrate",

    "lint": "npm run lint:frontend && npm run lint:backend",
    "lint:frontend": "cd packages/frontend && npm run lint",
    "lint:backend": "cd packages/backend && poetry run ruff check .",

    "format": "npm run format:frontend && npm run format:backend",
    "format:frontend": "cd packages/frontend && npm run format",
    "format:backend": "cd packages/backend && poetry run ruff format ."
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

---

### Step 8: Create Setup Documentation

Provide setup instructions for new developers.

**SETUP.md**:
```markdown
# Evolution of Todo - Setup Guide

## Prerequisites

- Node.js 20+
- Python 3.13+
- Poetry 1.8+
- Docker & Docker Compose

## Quick Start (Docker)

\`\`\`bash
# 1. Clone repository
git clone https://github.com/your-org/evolution-of-todo.git
cd evolution-of-todo

# 2. Copy environment file
cp .env.example .env
# Edit .env with your values (JWT_SECRET, API keys, etc.)

# 3. Start all services with Docker
npm run docker:up

# 4. Run database migrations
npm run db:migrate

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
\`\`\`

## Manual Setup (Without Docker)

### Backend Setup

\`\`\`bash
cd packages/backend

# Install dependencies
poetry install

# Set up environment
cp .env.example .env
# Edit .env with DATABASE_URL and JWT_SECRET

# Run migrations
poetry run alembic upgrade head

# Start development server
poetry run uvicorn app.main:app --reload
\`\`\`

### Frontend Setup

\`\`\`bash
cd packages/frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with NEXT_PUBLIC_API_URL

# Start development server
npm run dev
\`\`\`

### Database Setup (Local PostgreSQL)

\`\`\`bash
# Install PostgreSQL
brew install postgresql@16  # macOS
sudo apt install postgresql-16  # Ubuntu

# Create database
createdb evolution_todo

# Update .env with connection string
DATABASE_URL=postgresql://user:password@localhost:5432/evolution_todo
\`\`\`

## Verification

\`\`\`bash
# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000

# Run tests
npm test
\`\`\`

## Common Issues

### Port Already in Use

\`\`\`bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
\`\`\`

### Database Connection Failed

\`\`\`bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check connection string
echo $DATABASE_URL
\`\`\`

### CORS Errors

Make sure ALLOWED_ORIGINS in backend .env includes your frontend URL:
\`\`\`
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
\`\`\`
```

---

## Related Agents

All agents benefit from this skill:

- **CloudOps & Kubernetes Agent**: Creates Docker Compose and Kubernetes service configurations
- **Backend / FastAPI Pro Agent**: Configures CORS, JWT middleware, database connections
- **Frontend UI/UX Agent**: Implements API client with authentication
- **System Architect Agent**: Verifies wiring matches architecture diagrams
- **CI/CD Agent**: Uses Docker Compose for testing, deployment scripts

---

## Success Metrics

The Integration Wiring Skill is successful when:

✅ **All Layers Connected**: Frontend → Backend → Database → Infrastructure
✅ **Environment Configured**: `.env.example` with all required variables
✅ **Local Development Works**: `npm run dev` or `docker-compose up` starts everything
✅ **Authentication Flows**: JWT tokens pass correctly between layers
✅ **CORS Configured**: No cross-origin errors in browser
✅ **Health Checks Pass**: `/health` endpoint returns 200 OK
✅ **Documentation Complete**: SETUP.md with clear instructions
✅ **Zero Manual Steps**: Automated setup with scripts

---

## Best Practices

### Do's ✅
- Use environment variables for all configuration
- Provide `.env.example` with placeholder values
- Configure CORS to allow only specific origins
- Use connection pooling for database
- Implement health check endpoints
- Add request/response logging
- Use Docker Compose for local development
- Create monorepo scripts for common tasks
- Document setup process clearly

### Don'ts ❌
- Don't hardcode URLs or secrets in code
- Don't allow `*` for CORS origins in production
- Don't skip health checks
- Don't commit `.env` files (add to .gitignore)
- Don't use different configurations across environments without documentation
- Don't forget to test integration after wiring changes

---

## Integration with Other Skills

### Workflow Integration

```
Architecture Specification (diagrams)
  ↓
Code Generation (components)
  ↓
INTEGRATION WIRING (this skill) ← YOU ARE HERE
  ↓
Testing (verify connections)
  ↓
Deployment
```

### Skill Combinations

**Architecture + Integration Wiring**:
```
1. Architecture Specification shows Frontend → Backend → Database
2. Integration Wiring creates API client, connection strings, Docker Compose
3. Verify connections match architecture diagram
```

**Code Generation + Integration Wiring**:
```
1. Code Generation creates FastAPI routers and Next.js pages
2. Integration Wiring connects them with API client and CORS config
3. Everything works end-to-end
```

---

## Output Format

When using this skill, generate:

**1. Environment Configuration** (`.env.example`)
**2. Docker Compose** (`docker-compose.yml`)
**3. API Client** (`packages/frontend/lib/api.ts`)
**4. Database Connection** (`packages/backend/app/core/database.py`)
**5. CORS & Middleware** (`packages/backend/app/main.py`)
**6. Package Scripts** (root `package.json`)
**7. Setup Documentation** (`SETUP.md`)

---

## References

- **Architecture Spec**: `.claude/skills/architecture-specification/README.md` (Layer diagrams)
- **Code Generation**: `.claude/skills/code-generation/README.md` (Component code)
- **API Spec**: `.claude/skills/api-database-specification/README.md` (Endpoint definitions)
- **Constitution**: `.specify/memory/constitution.md` (Principle 6: Observability)

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 8 (API client, database connection, CORS, JWT, Docker Compose, scripts, health checks, setup docs)
**Coverage**: All 5 Phases (I-V)

---

*This integration wiring skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*

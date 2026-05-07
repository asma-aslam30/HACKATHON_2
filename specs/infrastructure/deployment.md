# Infrastructure Specification — Phase IV & V

## Phase IV: Local Kubernetes (Minikube)

### Containers
| Service | Dockerfile | Port | Image |
|---------|-----------|------|-------|
| frontend | infra/docker/Dockerfile.frontend | 3001 | todo-frontend:latest |
| backend | infra/docker/Dockerfile.backend | 8000 | todo-backend:latest |

### Helm Chart Structure
```
infra/helm/todo-app/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── configmap.yaml
    └── secrets.yaml
```

### Minikube Setup
```bash
minikube start --memory=4096 --cpus=2
eval $(minikube docker-env)
docker build -f infra/docker/Dockerfile.backend -t todo-backend:latest .
docker build -f infra/docker/Dockerfile.frontend -t todo-frontend:latest .
helm install todo-app infra/helm/todo-app
minikube tunnel  # expose services
```

## Phase V: Cloud + Kafka + Dapr

### Kafka Topics (Redpanda Cloud)
| Topic | Producer | Consumer | Purpose |
|-------|---------|----------|---------|
| task-events | Backend API | Recurring Task Service, Audit | All CRUD operations |
| reminders | Backend API | Notification Service | Due date reminders |
| task-updates | Backend API | WebSocket Service | Real-time sync |

### Dapr Components
| Component | Type | Purpose |
|-----------|------|---------|
| kafka-pubsub | pubsub.kafka | Event streaming via Dapr |
| statestore | state.postgresql | Conversation state |
| reminder-cron | bindings.cron | Trigger reminder checks every 5 min |
| kubernetes-secrets | secretstores.kubernetes | API keys, DB creds |

### Cloud Deployment (DigitalOcean DOKS)
- Cluster: 2 nodes, s-2vcpu-4gb
- Helm deploy same charts as local
- Dapr installed on cluster: `dapr init -k`
- Redpanda Cloud serverless (free tier)
- CI/CD: GitHub Actions on push to main

### Event Schema
```json
// task-events
{
  "event_type": "created|updated|completed|deleted",
  "task_id": 1,
  "task_data": { "title": "...", "user_id": "..." },
  "user_id": "user-123",
  "timestamp": "2026-01-01T00:00:00Z"
}

// reminders
{
  "task_id": 1,
  "title": "Buy groceries",
  "due_at": "2026-01-01T09:00:00Z",
  "remind_at": "2026-01-01T08:45:00Z",
  "user_id": "user-123"
}
```

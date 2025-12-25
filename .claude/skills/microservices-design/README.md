# Microservices Design Skill

**Purpose**: Design Phase V microservices architecture with Dapr sidecars, Kafka event streaming, and service decomposition for Evolution of Todo hackathon

**Owner**: CloudOps Agent + Backend Pro Agent + System Architect Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Microservices Design Skill** enables systematic design of distributed systems:
- Decompose Phase II monolith into independent microservices
- Design Dapr sidecar patterns (service invocation, pub/sub, state management)
- Implement event-driven architecture with Kafka/Redpanda
- Define service boundaries and communication patterns
- Create service mesh configurations
- Generate microservices specifications for implementation

This skill transforms the Phase II monolith into a scalable, event-driven Phase V architecture.

---

## Skill Components

### 1. Service Decomposition (Phase V)

**Microservices Architecture**:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  tasks-service  │     │  chat-service   │     │ notification-   │
│                 │     │                 │     │    service      │
│  • CRUD ops     │────▶│  • MCP tools    │────▶│  • Email        │
│  • Validation   │     │  • Conversations│     │  • Slack        │
│  • Events       │     │  • State mgmt   │     │  • Push         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                        │
        │                       │                        │
        ▼                       ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Kafka Event Bus (Redpanda)                   │
│  Topics: tasks.created, tasks.updated, chat.message             │
└─────────────────────────────────────────────────────────────────┘
        │                       │                        │
        ▼                       ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PostgreSQL    │     │   PostgreSQL    │     │     Redis       │
│  (tasks DB)     │     │  (chat DB)      │     │  (cache)        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Service Responsibilities**:

**tasks-service**:
- Task CRUD operations
- Task validation and business logic
- Publish events (task.created, task.updated, task.deleted)
- Own database (tasks schema)
- API: REST endpoints for task management

**chat-service**:
- MCP tool execution
- Conversation history management
- AI integration (Claude API)
- Publish events (chat.message, tool.executed)
- Own database (conversations schema)
- API: WebSocket for real-time chat

**notification-service**:
- Event consumer (Kafka)
- Email notifications (task completed, reminders)
- Slack notifications (daily summaries)
- Push notifications (mobile, Phase VI)
- No database (stateless consumer)
- API: Webhook endpoints for testing

**api-gateway** (optional):
- Request routing to services
- Authentication (JWT validation)
- Rate limiting
- Load balancing
- API composition

### 2. Dapr Sidecar Patterns

**Dapr Building Blocks**:

**Service Invocation**:
```bash
# Service-to-service calls via Dapr sidecar
dapr invoke \
  --app-id tasks-service \
  --method add_task \
  --data '{"user_id": 123, "title": "Buy milk"}'
```

**Pub/Sub**:
```yaml
# Publish event to Kafka
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "localhost:9092"
  - name: consumerGroup
    value: "notification-service"
```

**State Management**:
```python
# Store conversation state in Redis via Dapr
dapr_client.save_state(
    store_name="statestore",
    key=f"conversation:{conversation_id}",
    value=conversation_data,
)
```

**Secrets Management**:
```yaml
# Retrieve secrets from Kubernetes Secrets
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secretstore
spec:
  type: secretstores.kubernetes
```

### 3. Async Communication with Kafka

**Event-Driven Architecture**:

**Kafka Topics**:
- `tasks.created` - New task created
- `tasks.updated` - Task modified (status, priority, etc.)
- `tasks.deleted` - Task removed
- `tasks.completed` - Task marked as completed
- `chat.message` - New chat message
- `chat.tool_executed` - MCP tool execution result
- `user.registered` - New user account
- `user.login` - User login event

**Event Schema (Avro)**:
```json
{
  "type": "record",
  "name": "TaskCreated",
  "namespace": "com.evolution_todo.events",
  "fields": [
    {"name": "event_id", "type": "string"},
    {"name": "event_type", "type": "string", "default": "task.created"},
    {"name": "timestamp", "type": "long"},
    {"name": "user_id", "type": "int"},
    {"name": "task_id", "type": "int"},
    {"name": "task_title", "type": "string"},
    {"name": "priority", "type": "string"},
    {"name": "correlation_id", "type": ["null", "string"], "default": null}
  ]
}
```

**Producer Example** (tasks-service):
```python
from confluent_kafka import Producer
import json

producer = Producer({'bootstrap.servers': 'localhost:9092'})

def publish_task_created(task: Task):
    """Publish task.created event to Kafka."""
    event = {
        "event_id": str(uuid.uuid4()),
        "event_type": "task.created",
        "timestamp": int(datetime.utcnow().timestamp()),
        "user_id": task.user_id,
        "task_id": task.id,
        "task_title": task.title,
        "priority": task.priority,
    }

    producer.produce(
        topic="tasks.created",
        key=str(task.user_id),  # Partition by user_id
        value=json.dumps(event),
    )
    producer.flush()
```

**Consumer Example** (notification-service):
```python
from confluent_kafka import Consumer

consumer = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'notification-service',
    'auto.offset.reset': 'earliest',
})

consumer.subscribe(['tasks.created', 'tasks.completed'])

while True:
    msg = consumer.poll(1.0)

    if msg is None:
        continue

    if msg.error():
        logger.error(f"Consumer error: {msg.error()}")
        continue

    # Process event
    event = json.loads(msg.value().decode('utf-8'))

    if event['event_type'] == 'task.created':
        send_task_created_notification(event)
    elif event['event_type'] == 'task.completed':
        send_task_completed_notification(event)

    consumer.commit()
```

### 4. Service Communication Patterns

**Synchronous (REST via Dapr)**:
- Frontend → API Gateway → tasks-service
- chat-service → tasks-service (tool execution)
- Use for: Read operations, immediate responses

**Asynchronous (Kafka Events)**:
- tasks-service → Kafka → notification-service
- chat-service → Kafka → analytics-service
- Use for: Notifications, analytics, eventual consistency

**WebSocket (Real-time)**:
- Frontend ↔ chat-service (real-time chat)
- Use for: Live updates, typing indicators

---

## Skill Instructions

### Step 1: Decompose Monolith into Services

Identify service boundaries based on domain.

**Template**:
```markdown
## Service Decomposition Strategy

### Service: [service-name]

**Domain**: [Bounded context]
**Responsibilities**:
- [Responsibility 1]
- [Responsibility 2]

**Data Ownership**:
- [Table 1] (exclusive ownership)
- [Table 2] (exclusive ownership)

**API Endpoints**:
- [Endpoint 1]
- [Endpoint 2]

**Events Published**:
- [Event 1]: When [trigger]
- [Event 2]: When [trigger]

**Events Consumed**:
- [Event 1]: Action taken
- [Event 2]: Action taken

**Dependencies**:
- [Service 1]: For [reason]
- [Service 2]: For [reason]

**Database**:
- Type: PostgreSQL
- Schema: [schema name]
- Connection: Independent connection pool
```

---

#### Example: tasks-service

```markdown
## Service: tasks-service

**Domain**: Task Management (Bounded Context)
**Port**: 8001
**App ID**: tasks-service (Dapr)

### Responsibilities
- Task CRUD operations (create, read, update, delete)
- Task validation (title length, status enum, priority)
- Task filtering and sorting
- Multi-tenant isolation (user_id filtering)
- Publish task lifecycle events to Kafka

### Data Ownership
- **tasks** table (exclusive ownership)
- No shared database with other services
- Own PostgreSQL instance (or separate schema)

### REST API Endpoints
- **GET** `/api/{user_id}/tasks` - List tasks with filters
- **POST** `/api/{user_id}/tasks` - Create task
- **GET** `/api/{user_id}/tasks/{task_id}` - Get task details
- **PATCH** `/api/{user_id}/tasks/{task_id}` - Update task
- **DELETE** `/api/{user_id}/tasks/{task_id}` - Delete task

### Events Published (to Kafka)
- **tasks.created**: When new task is created
  - Payload: { event_id, user_id, task_id, task_title, priority, timestamp }
  - Consumers: notification-service, analytics-service

- **tasks.updated**: When task is modified
  - Payload: { event_id, user_id, task_id, changes, timestamp }
  - Consumers: analytics-service

- **tasks.completed**: When task status changes to completed
  - Payload: { event_id, user_id, task_id, task_title, timestamp }
  - Consumers: notification-service (send congratulations email)

- **tasks.deleted**: When task is removed
  - Payload: { event_id, user_id, task_id, timestamp }
  - Consumers: analytics-service

### Events Consumed (from Kafka)
- None (tasks-service is a producer only)

### Dependencies
- **auth-service**: For JWT validation (via Dapr service invocation)
- **Kafka**: For publishing events
- **PostgreSQL**: For task persistence

### Database
- Type: PostgreSQL
- Schema: tasks_db
- Tables: tasks
- Connection: Independent connection pool (max 20 connections)

### Dapr Configuration
**dapr.yaml**:
\`\`\`yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: tasks-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "kafka:9092"
  - name: consumerGroup
    value: "tasks-service"
\`\`\`

### Deployment
- Kubernetes Deployment with Dapr sidecar annotation
- Replicas: 3 (horizontal scaling)
- Resources: 256Mi memory, 250m CPU
- Health checks: /health, /ready
```

---

#### Example: notification-service

```markdown
## Service: notification-service

**Domain**: Notifications (Bounded Context)
**Port**: 8003
**App ID**: notification-service (Dapr)

### Responsibilities
- Consume task lifecycle events from Kafka
- Send email notifications (task completed, reminders)
- Send Slack notifications (daily summaries)
- Send push notifications (mobile app, Phase VI)
- Retry failed notifications with exponential backoff

### Data Ownership
- None (stateless consumer)
- Uses Redis for deduplication cache only
- No persistent database

### API Endpoints (Webhooks)
- **POST** `/webhooks/test-email` - Test email sending
- **POST** `/webhooks/test-slack` - Test Slack integration
- **GET** `/health` - Health check

### Events Published (to Kafka)
- **notifications.sent**: When notification is successfully sent
  - Payload: { event_id, user_id, notification_type, channel, timestamp }
  - Consumers: analytics-service

- **notifications.failed**: When notification fails
  - Payload: { event_id, user_id, notification_type, error, retry_count }
  - Consumers: monitoring-service (alert on failures)

### Events Consumed (from Kafka)
- **tasks.created**: Send "Task created" confirmation email
- **tasks.completed**: Send "Congratulations!" email
- **tasks.due_soon**: Send reminder email (1 day before due)
- **user.registered**: Send welcome email

### Dependencies
- **Kafka**: For consuming events
- **SendGrid/AWS SES**: For email delivery
- **Slack API**: For Slack messages
- **Redis**: For deduplication cache

### Event Processing Logic

**tasks.completed Handler**:
\`\`\`python
async def handle_task_completed(event: Dict[str, Any]):
    """
    Send congratulations email when task completed.

    Event: tasks.completed
    Payload: { user_id, task_id, task_title, timestamp }
    """
    user_id = event['user_id']
    task_title = event['task_title']

    # Get user email (call user-service via Dapr)
    user = await dapr_client.invoke_method(
        app_id="user-service",
        method_name="get_user",
        data={"user_id": user_id},
    )

    # Send email
    await send_email(
        to=user['email'],
        subject="Task Completed!",
        body=f"Congratulations! You completed '{task_title}'",
    )

    # Publish confirmation event
    await publish_event("notifications.sent", {
        "user_id": user_id,
        "notification_type": "task_completed",
        "channel": "email",
    })
\`\`\`

### Dapr Configuration
**components/notification-pubsub.yaml**:
\`\`\`yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: notification-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "kafka:9092"
  - name: consumerGroup
    value: "notification-service"
  - name: topics
    value: "tasks.created,tasks.completed,tasks.due_soon,user.registered"
\`\`\`

### Deployment
- Kubernetes Deployment with Dapr sidecar
- Replicas: 2 (for redundancy)
- Resources: 128Mi memory, 100m CPU
- Auto-scaling: Not needed (lightweight consumer)
```

---

### Step 2: Design Dapr Sidecar Patterns

**Dapr Building Blocks**:

#### Service Invocation
```python
from dapr.clients import DaprClient

# Call another service via Dapr
with DaprClient() as dapr:
    result = dapr.invoke_method(
        app_id="tasks-service",
        method_name="add_task",
        data={
            "user_id": 123,
            "title": "Buy milk",
            "priority": "high",
        },
        http_verb="POST",
    )
```

#### Pub/Sub
```python
from dapr.clients import DaprClient

# Publish event
with DaprClient() as dapr:
    dapr.publish_event(
        pubsub_name="pubsub",
        topic_name="tasks.created",
        data={
            "event_id": str(uuid.uuid4()),
            "user_id": 123,
            "task_id": 456,
            "task_title": "Buy milk",
        },
    )

# Subscribe to events (FastAPI)
from dapr.ext.fastapi import DaprApp

app = FastAPI()
dapr_app = DaprApp(app)

@dapr_app.subscribe(pubsub_name="pubsub", topic="tasks.created")
async def on_task_created(event_data: dict):
    """Handle task.created event."""
    logger.info(f"Task created: {event_data['task_id']}")
    # Process event
```

#### State Management
```python
from dapr.clients import DaprClient

# Save state to Redis via Dapr
with DaprClient() as dapr:
    dapr.save_state(
        store_name="statestore",
        key=f"conversation:{conversation_id}",
        value={
            "messages": [...],
            "context": {...},
        },
    )

# Get state
state = dapr.get_state(
    store_name="statestore",
    key=f"conversation:{conversation_id}",
)
```

#### Secrets
```python
from dapr.clients import DaprClient

# Get secret from Kubernetes Secrets
with DaprClient() as dapr:
    secret = dapr.get_secret(
        store_name="kubernetes",
        key="jwt-secret",
    )
    jwt_secret = secret.secret["jwt-secret"]
```

---

### Step 3: Design Kafka Event Schemas

Define event structure with schema registry.

**Event Schema Template**:
```json
{
  "type": "record",
  "name": "[EventName]",
  "namespace": "com.evolution_todo.events",
  "doc": "[Event description]",
  "fields": [
    {
      "name": "event_id",
      "type": "string",
      "doc": "Unique event identifier (UUID)"
    },
    {
      "name": "event_type",
      "type": "string",
      "doc": "Event type identifier"
    },
    {
      "name": "timestamp",
      "type": "long",
      "doc": "Event timestamp (Unix milliseconds)"
    },
    {
      "name": "correlation_id",
      "type": ["null", "string"],
      "default": null,
      "doc": "Request correlation ID for tracing"
    },
    {
      "name": "user_id",
      "type": "int",
      "doc": "User who triggered the event"
    }
  ]
}
```

**Example: TaskCreatedEvent Schema**:
```json
{
  "type": "record",
  "name": "TaskCreatedEvent",
  "namespace": "com.evolution_todo.events.tasks",
  "doc": "Event published when a new task is created",
  "fields": [
    {"name": "event_id", "type": "string"},
    {"name": "event_type", "type": "string", "default": "task.created"},
    {"name": "timestamp", "type": "long"},
    {"name": "correlation_id", "type": ["null", "string"], "default": null},
    {"name": "user_id", "type": "int"},
    {"name": "task_id", "type": "int"},
    {"name": "task_title", "type": "string"},
    {"name": "task_description", "type": ["null", "string"], "default": null},
    {"name": "priority", "type": "string"},
    {"name": "due_date", "type": ["null", "long"], "default": null}
  ]
}
```

**Schema Registry Configuration**:
```python
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroSerializer

# Schema Registry client
schema_registry = SchemaRegistryClient({
    'url': 'http://schema-registry:8081'
})

# Register schema
schema_str = """{ ... Avro schema ... }"""
schema_id = schema_registry.register_schema(
    subject="tasks.created-value",
    schema=schema_str,
)

# Use schema for serialization
serializer = AvroSerializer(schema_registry, schema_str)
```

---

### Step 4: Design Service Mesh Configuration

**Kubernetes Deployment with Dapr**:

**k8s/tasks-service-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tasks-service
  labels:
    app: tasks-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tasks-service
  template:
    metadata:
      labels:
        app: tasks-service
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "tasks-service"
        dapr.io/app-port: "8001"
        dapr.io/config: "tracing"
        dapr.io/log-level: "info"
    spec:
      containers:
      - name: tasks-service
        image: ghcr.io/yourusername/tasks-service:latest
        ports:
        - containerPort: 8001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: tasks-service-secrets
              key: database-url
        - name: KAFKA_BROKERS
          value: "kafka:9092"
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
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8001
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Dapr Component Configurations**:

**components/kafka-pubsub.yaml**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "kafka:9092"
  - name: authType
    value: "none"
  - name: consumerID
    value: "{APP_ID}"
scopes:
- tasks-service
- chat-service
- notification-service
```

**components/redis-statestore.yaml**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: "redis-master:6379"
  - name: redisPassword
    secretKeyRef:
      name: redis-secret
      key: password
scopes:
- chat-service
```

---

### Step 5: Generate Service Specifications

**specs/microservices/services.md**:
```markdown
# Microservices Architecture - Evolution of Todo Phase V

**Architecture Pattern**: Event-Driven Microservices
**Service Mesh**: Dapr
**Message Broker**: Kafka (Redpanda)
**State Store**: Redis
**Databases**: PostgreSQL (per-service)

---

## Service Overview

| Service | Port | Database | Events Published | Events Consumed |
|---------|------|----------|------------------|-----------------|
| tasks-service | 8001 | tasks_db | tasks.* | None |
| chat-service | 8002 | chat_db | chat.* | tasks.* |
| notification-service | 8003 | None | notifications.* | tasks.*, chat.*, user.* |
| user-service | 8004 | users_db | user.* | None |
| api-gateway | 8000 | None | None | None |

---

## Inter-Service Communication

### Synchronous (Dapr Service Invocation)
- Frontend → api-gateway → tasks-service (read operations)
- chat-service → tasks-service (MCP tool execution)
- notification-service → user-service (get user email)

### Asynchronous (Kafka Events)
- tasks-service → tasks.created → notification-service
- chat-service → chat.message → analytics-service
- Any service → Kafka → multiple consumers

---

## Event-Driven Flows

### Task Creation Flow
\`\`\`
User creates task (Frontend)
  ↓
POST /api/1/tasks (API Gateway)
  ↓
Dapr invoke tasks-service.add_task
  ↓
tasks-service creates task in database
  ↓
tasks-service publishes tasks.created to Kafka
  ↓
notification-service consumes event
  ↓
notification-service sends confirmation email
  ↓
analytics-service consumes event (async)
\`\`\`

### Chat Tool Execution Flow
\`\`\`
User: "Add task: Buy milk" (Frontend)
  ↓
WebSocket to chat-service
  ↓
chat-service calls Claude API
  ↓
Claude invokes add_task tool
  ↓
chat-service → Dapr invoke tasks-service.add_task
  ↓
tasks-service creates task + publishes event
  ↓
chat-service receives task response
  ↓
chat-service sends message to user: "Task created!"
  ↓
notification-service consumes event → sends email
\`\`\`

---

## Data Consistency Patterns

### Strong Consistency
- Within service: Database transactions (ACID)
- Use for: Critical operations (task creation, user registration)

### Eventual Consistency
- Across services: Event-driven updates
- Use for: Notifications, analytics, non-critical features

### Saga Pattern
- For distributed transactions (if needed)
- Compensating transactions on failure
- Use for: Complex multi-service operations

---

## Resilience Patterns

### Circuit Breaker
\`\`\`python
from circuitbreaker import circuit

@circuit(failure_threshold=5, recovery_timeout=60)
async def call_tasks_service(data):
    # Service call with circuit breaker
    return await dapr.invoke_method("tasks-service", "add_task", data)
\`\`\`

### Retry with Backoff
\`\`\`python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
)
async def publish_event(topic, data):
    producer.produce(topic, data)
\`\`\`

### Timeout
\`\`\`python
import httpx

async with httpx.AsyncClient(timeout=5.0) as client:
    response = await client.post(url, json=data)
\`\`\`
```

---

## Related Agents

- **CloudOps Agent**: Deploys microservices to Kubernetes with Dapr
- **Backend Pro Agent**: Implements individual microservices
- **System Architect Agent**: Designs service boundaries and communication
- **Testing & QA Agent**: Tests inter-service communication and event flows

---

## Success Metrics

✅ **Independent Deployment**: Each service deploys independently
✅ **Loose Coupling**: Services communicate via events (not direct calls)
✅ **Fault Isolation**: One service failure doesn't crash entire system
✅ **Horizontal Scaling**: Services scale independently
✅ **Event-Driven**: Async communication for non-critical operations
✅ **Observable**: Distributed tracing with correlation IDs
✅ **Resilient**: Circuit breakers, retries, timeouts
✅ **Consistent**: Eventual consistency with Saga pattern for critical flows

---

## Best Practices

### Do's ✅

- **Single Responsibility**: One service per bounded context
- **Database per Service**: Each service owns its data
- **Async by Default**: Use events for non-urgent operations
- **Correlation IDs**: Track requests across services
- **Health Checks**: /health and /ready endpoints
- **Idempotency**: Use event_id for deduplication
- **Schema Registry**: Version event schemas
- **Circuit Breakers**: Protect against cascading failures

### Don'ts ❌

- **Don't Share Databases**: Each service owns its schema
- **Don't Couple Services**: Use events, not direct DB access
- **Don't Synchronous Chain**: Avoid A→B→C→D calls
- **Don't Ignore Ordering**: Use partition keys for event order
- **Don't Skip Monitoring**: Implement distributed tracing
- **Don't Forget Retries**: Events may fail, implement retry
- **Don't Hardcode Service URLs**: Use Dapr service invocation
- **Don't Skip Versioning**: Version APIs and events

---

## Integration with Other Skills

```
Architecture Specification (defines phases)
  ↓
API & Database Specification (defines contracts)
  ↓
MICROSERVICES DESIGN (this skill) ← Service decomposition
  ↓
Backend Service Design (implements services)
  ↓
Deployment & Install UX (deploys to K8s with Dapr)
  ↓
Test Design (integration and E2E tests)
```

---

## Output Format

When using this skill, generate:

**1. Service Decomposition** (domain boundaries, responsibilities)
**2. Service Specifications** (API, events, database, dependencies)
**3. Dapr Configurations** (components for pub/sub, state, secrets)
**4. Kafka Topic Definitions** (topics, schemas, partitions)
**5. Deployment Manifests** (K8s with Dapr annotations)
**6. Communication Patterns** (sync vs async flows)
**7. Resilience Strategies** (circuit breakers, retries, timeouts)

Save specifications to:
- `specs/microservices/services.md` - Service catalog
- `specs/microservices/events.md` - Event schemas
- `specs/microservices/dapr.md` - Dapr configuration
- `dapr/components/` - Dapr component YAML files
- `k8s/services/` - Kubernetes deployment manifests

---

## References

- **Dapr**: https://dapr.io/
- **Kafka**: https://kafka.apache.org/
- **Redpanda**: https://redpanda.com/
- **Avro**: https://avro.apache.org/
- **Microservices Patterns**: https://microservices.io/patterns/

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 7 (Service decomposition, Dapr patterns, Kafka events, K8s manifests)
**Coverage**: Phase V (Cloud Production Microservices)

---

*This microservices design skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*

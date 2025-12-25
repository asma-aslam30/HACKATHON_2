# Todo Application Helm Chart

This Helm chart deploys the Todo application with frontend, backend, and MCP (Model Context Protocol) services to a Kubernetes cluster.

## Chart Structure

```
infra/helm/todo-app/
├── Chart.yaml          # Chart metadata
├── values.yaml         # Default configuration values
├── charts/             # Subcharts (frontend, backend, mcp)
├── templates/          # Kubernetes manifest templates
└── README.md           # This file
```

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- Minikube (for local development)

## Installing the Chart

To install the chart with the release name `todo-app`:

```bash
cd infra/helm/todo-app
helm install todo-app . --create-namespace --namespace todo-app
```

To install with custom values:

```bash
helm install todo-app . --set frontend.replicaCount=2 --set backend.replicaCount=2 --create-namespace --namespace todo-app
```

## Upgrading the Chart

```bash
helm upgrade todo-app . --namespace todo-app --reuse-values
```

## Uninstalling the Chart

```bash
helm uninstall todo-app --namespace todo-app
kubectl delete namespace todo-app
```

## Configuration

The following table lists the configurable parameters of the todo-app chart and their default values.

### Global Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.image.repository` | Global image repository | `todo-app` |
| `global.image.tag` | Global image tag | `latest` |

### Frontend Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `frontend.replicaCount` | Number of frontend pods | `1` |
| `frontend.image.repository` | Frontend image repository | `todo-frontend` |
| `frontend.image.tag` | Frontend image tag | `latest` |
| `frontend.service.type` | Frontend service type | `ClusterIP` |
| `frontend.service.port` | Frontend service port | `3000` |
| `frontend.ingress.enabled` | Enable ingress for frontend | `false` |

### Backend Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `backend.replicaCount` | Number of backend pods | `1` |
| `backend.image.repository` | Backend image repository | `todo-backend` |
| `backend.image.tag` | Backend image tag | `latest` |
| `backend.service.type` | Backend service type | `ClusterIP` |
| `backend.service.port` | Backend service port | `8080` |
| `backend.database.host` | Database host | `postgres` |
| `backend.database.port` | Database port | `5432` |

### MCP Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `mcp.replicaCount` | Number of MCP pods | `1` |
| `mcp.image.repository` | MCP image repository | `todo-mcp` |
| `mcp.image.tag` | MCP image tag | `latest` |
| `mcp.service.type` | MCP service type | `ClusterIP` |
| `mcp.service.port` | MCP service port | `8081` |

## Local Development with Minikube

For local development, use the provided Minikube setup script:

```bash
./infra/k8s/minikube-setup.sh
```

This script will:
1. Start a Minikube cluster
2. Enable the ingress addon
3. Deploy the Todo application
4. Wait for all pods to be ready

## Kubectl-AI Integration

The setup includes kubectl-ai integration for enhanced Kubernetes operations. To use it:

1. Install kubectl-ai plugin
2. Source the integration script:
   ```bash
   source infra/k8s/kubectl-ai-integration.sh
   ```
3. Run the setup function:
   ```bash
   main
   ```

This will add custom commands and aliases for managing the Todo application.

## Values File Example

```yaml
frontend:
  replicaCount: 2
  service:
    type: ClusterIP
    port: 3000
  ingress:
    enabled: true
    hosts:
      - host: todo-app.local
        paths:
          - path: /
            pathType: ImplementationSpecific

backend:
  replicaCount: 2
  service:
    port: 8080
  database:
    host: postgres-service
    port: 5432
    name: todo_db
    user: todo_user

mcp:
  replicaCount: 1
  service:
    port: 8081

autoscaling:
  enabled: true
  minReplicas: 1
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80
```
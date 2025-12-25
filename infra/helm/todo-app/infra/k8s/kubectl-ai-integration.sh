# kubectl-ai Integration for Todo Application

# This configuration provides AI-powered kubectl commands for the Todo application
# It includes common operations, troubleshooting commands, and deployment utilities

# Configuration for kubectl-ai plugin
export KUBECTL_AI_CONFIG_FILE=$(cat << EOF
{
  "commands": {
    "todo-app-status": {
      "description": "Get status of all todo application components",
      "command": "kubectl get pods,svc,ingress,deployments -n todo-app"
    },
    "todo-app-logs": {
      "description": "Get logs from all todo application pods",
      "command": "kubectl get pods -n todo-app -o name | xargs -I {} kubectl logs {} -n todo-app"
    },
    "todo-app-troubleshoot": {
      "description": "Comprehensive troubleshooting for todo application",
      "command": "kubectl get events -n todo-app && kubectl describe pods -n todo-app && kubectl logs -l app.kubernetes.io/name=todo-app -n todo-app --tail=50"
    },
    "todo-app-scale": {
      "description": "Scale frontend/backend deployments",
      "command": "kubectl scale deployment {deployment_name} --replicas={replica_count} -n todo-app"
    },
    "todo-app-port-forward": {
      "description": "Port forward to todo application services",
      "command": "kubectl port-forward -n todo-app service/{service_name} {local_port}:{remote_port}"
    },
    "todo-app-update-image": {
      "description": "Update image for a deployment",
      "command": "kubectl set image deployment/{deployment_name} {container_name}={new_image} -n todo-app"
    },
    "todo-app-helm-upgrade": {
      "description": "Upgrade todo application using Helm",
      "command": "helm upgrade todo-app infra/helm/todo-app -n todo-app --reuse-values"
    },
    "todo-app-helm-rollback": {
      "description": "Rollback todo application to previous version",
      "command": "helm rollback todo-app -n todo-app"
    }
  },
  "aliases": {
    "tas": "todo-app-status",
    "tal": "todo-app-logs",
    "tat": "todo-app-troubleshoot",
    "tash": "todo-app-shell",
    "tah": "todo-app-helm-upgrade"
  },
  "contexts": {
    "todo-app": {
      "namespace": "todo-app",
      "selectors": [
        "app.kubernetes.io/name=todo-app",
        "app=todo-app"
      ]
    }
  }
}
EOF
)

# Function to install kubectl-ai plugin if not present
install_kubectl_ai() {
  if ! command -v kubectl-ai &> /dev/null; then
    echo "Installing kubectl-ai plugin..."
    # This assumes kubectl-ai is available as a krew plugin or can be installed
    # Adjust based on actual kubectl-ai installation method
    kubectl krew install ai || {
      echo "Failed to install kubectl-ai via krew"
      echo "Please install kubectl-ai manually from: https://github.com/itaysk/kubectl-ai"
      return 1
    }
  fi
}

# Function to apply kubectl-ai configurations
setup_kubectl_ai_config() {
  local config_dir="$HOME/.kubectl-ai"
  mkdir -p "$config_dir"

  # Create custom commands file
  cat > "$config_dir/custom-commands.yaml" << 'CUSTOM_COMMANDS_EOF'
commands:
  - name: "todo-app-status"
    description: "Get status of all todo application components"
    template: |
      kubectl get pods,svc,ingress,deployments -n todo-app

  - name: "todo-app-logs"
    description: "Get logs from all todo application pods"
    template: |
      kubectl get pods -n todo-app -o name | xargs -I {} kubectl logs {} -n todo-app

  - name: "todo-app-troubleshoot"
    description: "Comprehensive troubleshooting for todo application"
    template: |
      kubectl get events -n todo-app && kubectl describe pods -n todo-app && kubectl logs -l app.kubernetes.io/name=todo-app -n todo-app --tail=50

  - name: "todo-app-scale"
    description: "Scale frontend/backend deployments"
    template: |
      kubectl scale deployment {{.DeploymentName}} --replicas={{.ReplicaCount}} -n todo-app
    parameters:
      - name: "DeploymentName"
        prompt: "Enter deployment name:"
      - name: "ReplicaCount"
        prompt: "Enter replica count:"

  - name: "todo-app-port-forward"
    description: "Port forward to todo application services"
    template: |
      kubectl port-forward -n todo-app service/{{.ServiceName}} {{.LocalPort}}:{{.RemotePort}}
    parameters:
      - name: "ServiceName"
        prompt: "Enter service name:"
      - name: "LocalPort"
        prompt: "Enter local port:"
      - name: "RemotePort"
        prompt: "Enter remote port:"

  - name: "todo-app-update-image"
    description: "Update image for a deployment"
    template: |
      kubectl set image deployment {{.DeploymentName}} {{.ContainerName}}={{.NewImage}} -n todo-app
    parameters:
      - name: "DeploymentName"
        prompt: "Enter deployment name:"
      - name: "ContainerName"
        prompt: "Enter container name:"
      - name: "NewImage"
        prompt: "Enter new image (e.g., nginx:latest):"

  - name: "todo-app-helm-upgrade"
    description: "Upgrade todo application using Helm"
    template: |
      helm upgrade todo-app infra/helm/todo-app -n todo-app --reuse-values

  - name: "todo-app-helm-rollback"
    description: "Rollback todo application to previous version"
    template: |
      helm rollback todo-app -n todo-app
CUSTOM_COMMANDS_EOF

  echo "kubectl-ai custom commands configured in $config_dir/custom-commands.yaml"
}

# Function to create kubectl aliases for todo app
setup_kubectl_aliases() {
  cat >> "$HOME/.bashrc" << 'ALIASES_EOF'

# Todo App kubectl aliases
alias kta='kubectl -n todo-app'
alias ktas='kubectl get pods,svc,ingress,deployments -n todo-app'
alias ktal='kubectl get pods -n todo-app -o name | xargs -I {} kubectl logs {} -n todo-app'
alias ktat='kubectl get events -n todo-app && kubectl describe pods -n todo-app && kubectl logs -l app.kubernetes.io/name=todo-app -n todo-app --tail=50'
alias ktad='kubectl describe -n todo-app'
alias ktag='kubectl get -n todo-app'
alias ktaln='kubectl logs -n todo-app -l app.kubernetes.io/name=todo-app'
ALIASES_EOF

  echo "kubectl aliases added to ~/.bashrc"
  echo "Run 'source ~/.bashrc' or restart your terminal to use the aliases"
}

# Main execution
main() {
  echo "Setting up kubectl-ai integration for Todo application..."

  install_kubectl_ai
  setup_kubectl_ai_config
  setup_kubectl_aliases

  echo "✅ kubectl-ai integration for Todo application is set up!"
  echo "💡 Run 'kubectl ai --help' to see available AI-powered commands"
  echo "💡 Custom commands available: todo-app-status, todo-app-logs, todo-app-troubleshoot, etc."
}

# Uncomment the following line to run the setup automatically
# main
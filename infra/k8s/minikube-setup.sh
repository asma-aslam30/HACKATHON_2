#!/bin/bash

# Minikube setup script for Todo Application
# This script sets up a local Kubernetes cluster with Minikube and deploys the Todo application

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Setting up Minikube for Todo Application..."

# Check if minikube is installed
if ! command -v minikube &> /dev/null; then
    echo "❌ Minikube is not installed. Please install Minikube first."
    echo "Installation instructions: https://minikube.sigs.k8s.io/docs/start/"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    echo "Installation instructions: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo "❌ Helm is not installed. Please install Helm first."
    echo "Installation instructions: https://helm.sh/docs/intro/install/"
    exit 1
fi

# Start Minikube cluster
echo "🔄 Starting Minikube cluster..."
minikube start --cpus=2 --memory=4g --disk-size=20g

# Enable ingress addon
echo "🔌 Enabling ingress addon..."
minikube addons enable ingress

# Wait for ingress controller to be ready
echo "⏳ Waiting for ingress controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

# Build Docker images (if using minikube's Docker daemon)
echo "🐳 Using Minikube's Docker environment..."
eval $(minikube docker-env)

# Build application images (example - adjust according to your actual Dockerfiles)
# docker build -t todo-frontend:latest ./frontend
# docker build -t todo-backend:latest ./backend
# docker build -t todo-mcp:latest ./mcp

# Deploy the Todo application using Helm
echo "📦 Deploying Todo application with Helm..."
cd infra/helm/todo-app
helm dependency update
helm install todo-app . --create-namespace --namespace todo-app --wait

# Wait for all pods to be ready
echo "⏳ Waiting for all pods to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=todo-app --timeout=300s --namespace todo-app

# Get the Minikube IP
MINIKUBE_IP=$(minikube ip)
echo "✅ Minikube cluster is ready!"
echo "🌐 Todo application is accessible at: http://$MINIKUBE_IP"

# Show deployment status
echo "📋 Deployment status:"
kubectl get pods,services,ingress -n todo-app

echo "💡 To access the application, you may need to add an entry to your /etc/hosts file:"
echo "sudo echo '$MINIKUBE_IP todo-app.local' >> /etc/hosts"

echo "🔧 To access the Minikube dashboard:"
echo "minikube dashboard"

echo "🧹 To stop Minikube: minikube stop"
echo "🗑️  To delete the cluster: minikube delete"
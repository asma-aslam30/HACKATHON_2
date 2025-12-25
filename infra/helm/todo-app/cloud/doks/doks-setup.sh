#!/bin/bash

# doks-setup.sh - Setup script for DOKS cluster
# This script provisions and configures a DOKS cluster for the todo application

set -e

CLUSTER_NAME="${CLUSTER_NAME:-todo-cluster}"
REGION="${REGION:-nyc1}"
NODE_SIZE="${NODE_SIZE:-s-2vcpu-4gb}"
NODE_COUNT="${NODE_COUNT:-3}"

echo "🚀 Setting up DOKS cluster: $CLUSTER_NAME"

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl is not installed. Please install DigitalOcean CLI first."
    echo "Installation: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo "❌ Helm is not installed. Please install Helm first."
    exit 1
fi

# Create DOKS cluster
echo "🌐 Creating DOKS cluster: $CLUSTER_NAME"
doctl kubernetes cluster create $CLUSTER_NAME \
    --region $REGION \
    --node-pool "name=default;size=$NODE_SIZE;count=$NODE_COUNT" \
    --auto-upgrade \
    --maintenance-start "sunday=02:00:00" \
    --wait

# Get cluster credentials
echo "🔐 Getting cluster credentials..."
doctl kubernetes cluster kubeconfig save $CLUSTER_NAME

# Verify cluster connectivity
echo "✅ Cluster connectivity verified"
kubectl cluster-info

# Install Nginx Ingress Controller
echo "🔌 Installing Nginx Ingress Controller..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
    --namespace ingress-nginx \
    --create-namespace \
    --set controller.service.type=LoadBalancer \
    --wait

# Install Cert-Manager for SSL certificates
echo "🔒 Installing Cert-Manager..."
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager --timeout=300s -n cert-manager

# Install Dapr
echo "🎯 Installing Dapr..."
helm repo add dapr https://dapr.github.io/helm-charts
helm repo update
helm install dapr dapr/dapr \
    --namespace dapr-system \
    --create-namespace \
    --wait

# Wait for Dapr to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=dapr --timeout=300s -n dapr-system

echo "✅ DOKS cluster setup complete!"
echo "Cluster: $CLUSTER_NAME"
echo "Region: $REGION"
echo "Nodes: $NODE_COUNT x $NODE_SIZE"
echo ""
echo "To access the cluster: doctl kubernetes cluster kubeconfig save $CLUSTER_NAME"
echo "To view cluster info: kubectl cluster-info"
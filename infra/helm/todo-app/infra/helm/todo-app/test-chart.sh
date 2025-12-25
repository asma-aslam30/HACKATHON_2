#!/bin/bash

# Test script for Todo Application Helm Chart
# This script validates the Helm chart structure and performs basic tests

set -e

echo "🧪 Testing Todo Application Helm Chart..."

# Validate Helm chart structure
echo "📋 Validating Helm chart structure..."
if [ ! -f "Chart.yaml" ]; then
    echo "❌ Chart.yaml not found"
    exit 1
fi

if [ ! -f "values.yaml" ]; then
    echo "❌ values.yaml not found"
    exit 1
fi

if [ ! -d "templates" ]; then
    echo "❌ templates directory not found"
    exit 1
fi

echo "✅ Chart structure validation passed"

# Validate required templates exist
echo "📋 Checking required templates..."
required_templates=("frontend-deployment.yaml" "frontend-service.yaml" "backend-deployment.yaml" "backend-service.yaml" "mcp-deployment.yaml" "mcp-service.yaml" "ingress.yaml" "_helpers.tpl" "NOTES.txt")

for template in "${required_templates[@]}"; do
    if [ ! -f "templates/$template" ]; then
        echo "❌ Template $template not found"
        exit 1
    fi
done

echo "✅ All required templates found"

# Try to lint the Helm chart
echo "🔍 Linting Helm chart..."
if command -v helm &> /dev/null; then
    helm lint .
    echo "✅ Helm lint passed"
else
    echo "⚠️ Helm not found, skipping lint test"
fi

# Check if values files have expected content
echo "🔍 Checking values.yaml content..."
if grep -q "frontend:" "values.yaml" && grep -q "backend:" "values.yaml" && grep -q "mcp:" "values.yaml"; then
    echo "✅ Values.yaml contains expected service configurations"
else
    echo "❌ Values.yaml missing expected service configurations"
    exit 1
fi

# Check if scripts are executable
echo "🔧 Checking script permissions..."
if [ -x "../../k8s/minikube-setup.sh" ]; then
    echo "✅ Minikube setup script is executable"
else
    echo "❌ Minikube setup script is not executable"
    chmod +x ../../k8s/minikube-setup.sh
    echo "🔧 Made minikube setup script executable"
fi

if [ -f "../../k8s/kubectl-ai-integration.sh" ]; then
    echo "✅ Kubectl-ai integration script exists"
else
    echo "❌ Kubectl-ai integration script not found"
    exit 1
fi

echo "✅ All tests passed!"
echo ""
echo "🚀 To deploy the application:"
echo "cd infra/helm/todo-app"
echo "helm install todo-app . --create-namespace --namespace todo-app"
#!/bin/bash

# Test script for cloud deployment workflow
# This script validates the cloud deployment configuration

set -e

echo "🧪 Testing Cloud Deployment Configuration..."

# Validate GitHub Actions workflow exists
echo "📋 Checking GitHub Actions workflow..."
if [ ! -f ".github/workflows/deploy.yml" ]; then
    echo "❌ GitHub Actions workflow not found"
    exit 1
fi
echo "✅ GitHub Actions workflow exists"

# Validate DOKS configuration exists
echo "📋 Checking DOKS configuration..."
if [ ! -f "cloud/doks/doks-setup.sh" ]; then
    echo "❌ DOKS setup script not found"
    exit 1
fi

if [ ! -f "cloud/doks/dapr-components/statestore.yaml" ]; then
    echo "❌ Dapr statestore component not found"
    exit 1
fi

if [ ! -f "cloud/doks/dapr-components/pubsub.yaml" ]; then
    echo "❌ Dapr pubsub component not found"
    exit 1
fi

if [ ! -f "cloud/doks/dapr-components/redis-cache.yaml" ]; then
    echo "❌ Dapr redis cache component not found"
    exit 1
fi

if [ ! -f "cloud/doks/dapr-components/service-invocation.yaml" ]; then
    echo "❌ Dapr service invocation config not found"
    exit 1
fi

echo "✅ All DOKS configuration files exist"

# Validate multi-environment configuration
echo "📋 Checking multi-environment configuration..."
if [ ! -f "infra/helm/todo-app/values-dev.yaml" ]; then
    echo "❌ Development values file not found"
    exit 1
fi

if [ ! -f "infra/helm/todo-app/values-staging.yaml" ]; then
    echo "❌ Staging values file not found"
    exit 1
fi

if [ ! -f "infra/helm/todo-app/values-prod.yaml" ]; then
    echo "❌ Production values file not found"
    exit 1
fi

echo "✅ All environment values files exist"

# Check if values files contain expected configurations
echo "🔍 Checking environment values content..."
if grep -q "replicaCount: 1" "infra/helm/todo-app/values-dev.yaml" && \
   grep -q "replicaCount: 2" "infra/helm/todo-app/values-staging.yaml" && \
   grep -q "replicaCount: 3" "infra/helm/todo-app/values-prod.yaml"; then
    echo "✅ Environment configurations have appropriate replica counts"
else
    echo "❌ Environment configurations missing expected replica counts"
    exit 1
fi

# Check if Dapr configurations exist in values files
if grep -q "dapr:" "infra/helm/todo-app/values-dev.yaml" && \
   grep -q "dapr:" "infra/helm/todo-app/values-staging.yaml" && \
   grep -q "dapr:" "infra/helm/todo-app/values-prod.yaml"; then
    echo "✅ Dapr configurations exist in environment values"
else
    echo "❌ Dapr configurations missing from environment values"
    exit 1
fi

# Check if DOKS setup script is executable
if [ -x "cloud/doks/doks-setup.sh" ]; then
    echo "✅ DOKS setup script is executable"
else
    echo "❌ DOKS setup script is not executable"
    chmod +x cloud/doks/doks-setup.sh
    echo "🔧 Made DOKS setup script executable"
fi

# Check if GitHub workflow has the expected structure
if grep -q "lint-test-build" ".github/workflows/deploy.yml" && \
   grep -q "deploy-dev" ".github/workflows/deploy.yml" && \
   grep -q "deploy-staging" ".github/workflows/deploy.yml" && \
   grep -q "deploy-prod" ".github/workflows/deploy.yml" && \
   grep -q "dapr-rollout" ".github/workflows/deploy.yml"; then
    echo "✅ GitHub Actions workflow has expected job structure"
else
    echo "❌ GitHub Actions workflow missing expected jobs"
    exit 1
fi

echo "✅ All tests passed!"
echo ""
echo "🎯 Cloud deployment configuration is ready:"
echo "   - GitHub Actions workflow: .github/workflows/deploy.yml"
echo "   - DOKS setup script: cloud/doks/doks-setup.sh"
echo "   - Dapr components: cloud/doks/dapr-components/"
echo "   - Environment configs: infra/helm/todo-app/values-{dev,staging,prod}.yaml"
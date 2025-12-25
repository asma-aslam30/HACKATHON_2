#!/bin/bash

# Test script for observability monitoring stack
# This script validates the observability configuration

set -e

echo "🧪 Testing Observability Monitoring Stack..."

# Validate Prometheus configuration
echo "📋 Checking Prometheus configuration..."
if [ ! -f "infra/monitoring/prometheus.yml" ]; then
    echo "❌ Prometheus configuration not found"
    exit 1
fi

if [ ! -f "infra/monitoring/alert_rules.yml" ]; then
    echo "❌ Alert rules configuration not found"
    exit 1
fi

echo "✅ Prometheus configuration exists"

# Validate Grafana dashboards
echo "📋 Checking Grafana dashboards..."
if [ ! -f "grafana/dashboards/todo-app-dashboard.json" ]; then
    echo "❌ Todo app dashboard not found"
    exit 1
fi

if [ ! -f "grafana/dashboards/dapr-dashboard.json" ]; then
    echo "❌ Dapr dashboard not found"
    exit 1
fi

if [ ! -f "grafana/dashboards/trace-dashboard.json" ]; then
    echo "❌ Trace dashboard not found"
    exit 1
fi

echo "✅ All Grafana dashboards exist"

# Validate Jaeger configuration
echo "📋 Checking Jaeger configuration..."
if [ ! -f "infra/monitoring/jaeger-config.yml" ]; then
    echo "❌ Jaeger configuration not found"
    exit 1
fi

echo "✅ Jaeger configuration exists"

# Validate Loki configuration
echo "📋 Checking Loki configuration..."
if [ ! -f "infra/monitoring/loki-config.yml" ]; then
    echo "❌ Loki configuration not found"
    exit 1
fi

echo "✅ Loki configuration exists"

# Validate OpenTelemetry collector configuration
echo "📋 Checking OpenTelemetry collector configuration..."
if [ ! -f "infra/monitoring/otel-collector-config.yml" ]; then
    echo "❌ OpenTelemetry collector configuration not found"
    exit 1
fi

echo "✅ OpenTelemetry collector configuration exists"

# Validate alerting configuration
echo "📋 Checking alerting configuration..."
if [ ! -f "infra/monitoring/alertmanager.yml" ]; then
    echo "❌ Alertmanager configuration not found"
    exit 1
fi

echo "✅ Alertmanager configuration exists"

# Validate Dapr metrics configuration
echo "📋 Checking Dapr metrics configuration..."
if [ ! -f "infra/monitoring/dapr-metrics-config.yml" ]; then
    echo "❌ Dapr metrics configuration not found"
    exit 1
fi

echo "✅ Dapr metrics configuration exists"

# Check if configuration files contain expected content
echo "🔍 Checking configuration content..."

# Check for metrics configuration
if grep -q "prometheus" "infra/monitoring/prometheus.yml" && \
   grep -q "scrape_configs" "infra/monitoring/prometheus.yml"; then
    echo "✅ Prometheus configuration has expected metrics setup"
else
    echo "❌ Prometheus configuration missing expected metrics setup"
    exit 1
fi

# Check for tracing configuration
if grep -q "jaeger" "infra/monitoring/jaeger-config.yml" && \
   grep -q "OTLP" "infra/monitoring/jaeger-config.yml"; then
    echo "✅ Jaeger configuration has expected tracing setup"
else
    echo "❌ Jaeger configuration missing expected tracing setup"
    exit 1
fi

# Check for logging configuration
if grep -q "loki" "infra/monitoring/loki-config.yml" && \
   grep -q "auth_enabled" "infra/monitoring/loki-config.yml"; then
    echo "✅ Loki configuration has expected logging setup"
else
    echo "❌ Loki configuration missing expected logging setup"
    exit 1
fi

# Check for OpenTelemetry configuration
if grep -q "otlp" "infra/monitoring/otel-collector-config.yml" && \
   grep -q "receivers" "infra/monitoring/otel-collector-config.yml" && \
   grep -q "exporters" "infra/monitoring/otel-collector-config.yml"; then
    echo "✅ OpenTelemetry configuration has expected setup"
else
    echo "❌ OpenTelemetry configuration missing expected setup"
    exit 1
fi

# Check for alerting configuration
if grep -q "slack_configs" "infra/monitoring/alertmanager.yml" && \
   grep -q "pagerduty_configs" "infra/monitoring/alertmanager.yml"; then
    echo "✅ Alerting configuration has expected setup"
else
    echo "❌ Alerting configuration missing expected setup"
    exit 1
fi

# Check for Dapr configuration
if grep -q "dapr.io" "infra/monitoring/dapr-metrics-config.yml" && \
   grep -q "tracing" "infra/monitoring/dapr-metrics-config.yml"; then
    echo "✅ Dapr metrics configuration has expected setup"
else
    echo "❌ Dapr metrics configuration missing expected setup"
    exit 1
fi

echo "✅ All tests passed!"
echo ""
echo "🎯 Observability stack is ready:"
echo "   - Metrics: Prometheus + Grafana dashboards"
echo "   - Traces: Jaeger + trace_id propagation"
echo "   - Logs: Loki + structured JSON"
echo "   - Service mesh: Dapr metrics integration"
echo "   - Alerting: Slack + PagerDuty integration"
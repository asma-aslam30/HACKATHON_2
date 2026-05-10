# ============================================================
# deploy-gke.ps1
# GKE Kubernetes deployment (Phase V — 300 pts)
# Run AFTER deploy-gcloud.ps1
# ============================================================

param(
    [string]$ProjectId = "",
    [string]$Region = "us-central1",
    [string]$ClusterName = "todo-cluster"
)

if (-not $ProjectId) {
    $ProjectId = Read-Host "Enter your Google Cloud Project ID"
}

$REGISTRY = "$Region-docker.pkg.dev/$ProjectId/todo-app"

Write-Host "`n🚀 Setting up GKE cluster for Phase V..." -ForegroundColor Green

# ── Create GKE cluster (Autopilot — no node management needed) ──
Write-Host "`nStep 1: Creating GKE Autopilot cluster..." -ForegroundColor Yellow
gcloud container clusters create-auto $ClusterName `
    --region $Region `
    --project $ProjectId

Write-Host "Cluster created ✅"

# ── Get credentials ──────────────────────────────────────────
Write-Host "`nStep 2: Getting cluster credentials..." -ForegroundColor Yellow
gcloud container clusters get-credentials $ClusterName --region $Region
Write-Host "kubectl configured ✅"

# ── Install Dapr ─────────────────────────────────────────────
Write-Host "`nStep 3: Installing Dapr on GKE..." -ForegroundColor Yellow
dapr init -k --wait
Write-Host "Dapr installed ✅"

# ── Create Kubernetes secrets ─────────────────────────────────
Write-Host "`nStep 4: Creating Kubernetes secrets..." -ForegroundColor Yellow

$DB_URL = gcloud secrets versions access latest --secret="database-url"
$GEMINI_KEY = gcloud secrets versions access latest --secret="gemini-api-key"
$AUTH_SECRET = gcloud secrets versions access latest --secret="auth-secret"
$BACKEND_URL = gcloud secrets versions access latest --secret="backend-url"
$FRONTEND_URL = gcloud secrets versions access latest --secret="frontend-url"

kubectl create secret generic todo-secrets `
    --from-literal=database-url="$DB_URL" `
    --from-literal=gemini-api-key="$GEMINI_KEY" `
    --from-literal=auth-secret="$AUTH_SECRET" `
    --from-literal=frontend-url="$FRONTEND_URL" `
    --from-literal=backend-url="$BACKEND_URL" `
    --dry-run=client -o yaml | kubectl apply -f -

Write-Host "Secrets created ✅"

# ── Apply Dapr components ─────────────────────────────────────
Write-Host "`nStep 5: Applying Dapr components..." -ForegroundColor Yellow
kubectl apply -f infra/dapr-components/
Write-Host "Dapr components applied ✅"

# ── Deploy with Helm ──────────────────────────────────────────
Write-Host "`nStep 6: Deploying with Helm..." -ForegroundColor Yellow
helm upgrade --install todo-app infra/helm/todo-app `
    --set backend.image.repository="$REGISTRY/todo-backend" `
    --set backend.image.tag="latest" `
    --set frontend.image.repository="$REGISTRY/todo-frontend" `
    --set frontend.image.tag="latest" `
    --set dapr.enabled=true `
    --set secrets.geminiApiKey="$GEMINI_KEY" `
    --set secrets.databaseUrl="$DB_URL" `
    --set secrets.authSecret="$AUTH_SECRET" `
    --wait --timeout=5m

Write-Host "Helm deployed ✅"

# ── Get external IPs ──────────────────────────────────────────
Write-Host "`nStep 7: Getting service URLs..." -ForegroundColor Yellow
kubectl get services

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "✅ GKE DEPLOYMENT COMPLETE! (Phase V)" -ForegroundColor Green
Write-Host "============================================`n"
Write-Host "Run: kubectl get pods    — to see running pods"
Write-Host "Run: kubectl get services — to see external IPs"
Write-Host "Run: dapr dashboard      — to see Dapr status"

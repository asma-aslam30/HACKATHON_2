# ============================================================
# deploy-gcloud.ps1
# Complete Google Cloud deployment script
# Run from: HACKATHON_2 root folder
# Usage: .\infra\gcloud\deploy-gcloud.ps1
# ============================================================

param(
    [string]$ProjectId = "",
    [string]$Region = "us-central1",
    [string]$DatabaseUrl = "",
    [string]$GeminiApiKey = "",
    [string]$AuthSecret = ""
)

# ── Validate inputs ──────────────────────────────────────────
if (-not $ProjectId) {
    $ProjectId = Read-Host "Enter your Google Cloud Project ID"
}
if (-not $DatabaseUrl) {
    $DatabaseUrl = Read-Host "Enter Neon DATABASE_URL (no channel_binding)"
}
if (-not $GeminiApiKey) {
    $GeminiApiKey = Read-Host "Enter Gemini API Key"
}
if (-not $AuthSecret) {
    $AuthSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    Write-Host "Generated AUTH_SECRET: $AuthSecret" -ForegroundColor Cyan
}

Write-Host "`n🚀 Starting Google Cloud deployment..." -ForegroundColor Green
Write-Host "Project: $ProjectId | Region: $Region`n"

# ── Step 1: Configure gcloud ─────────────────────────────────
Write-Host "Step 1: Configuring gcloud..." -ForegroundColor Yellow
gcloud config set project $ProjectId
gcloud config set run/region $Region

# ── Step 2: Enable required APIs ─────────────────────────────
Write-Host "`nStep 2: Enabling Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable `
    run.googleapis.com `
    cloudbuild.googleapis.com `
    secretmanager.googleapis.com `
    artifactregistry.googleapis.com `
    container.googleapis.com

Write-Host "APIs enabled ✅"

# ── Step 3: Create Artifact Registry ─────────────────────────
Write-Host "`nStep 3: Creating Artifact Registry..." -ForegroundColor Yellow
gcloud artifacts repositories create todo-app `
    --repository-format=docker `
    --location=$Region `
    --description="Todo App Docker images" 2>$null

$REGISTRY = "$Region-docker.pkg.dev/$ProjectId/todo-app"
Write-Host "Registry: $REGISTRY ✅"

# ── Step 4: Store secrets in Secret Manager ───────────────────
Write-Host "`nStep 4: Storing secrets in Secret Manager..." -ForegroundColor Yellow

function Set-Secret($name, $value) {
    $existing = gcloud secrets describe $name 2>$null
    if ($LASTEXITCODE -ne 0) {
        echo $value | gcloud secrets create $name --data-file=-
    } else {
        echo $value | gcloud secrets versions add $name --data-file=-
    }
    Write-Host "  Secret $name set ✅"
}

Set-Secret "database-url" $DatabaseUrl
Set-Secret "gemini-api-key" $GeminiApiKey
Set-Secret "auth-secret" $AuthSecret
# Placeholders — will update after deploy
Set-Secret "frontend-url" "https://todo-frontend-placeholder.run.app"
Set-Secret "backend-url" "https://todo-backend-placeholder.run.app"

# Grant Cloud Run access to secrets
$PROJECT_NUMBER = gcloud projects describe $ProjectId --format="value(projectNumber)"
$SA = "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding database-url --member="serviceAccount:$SA" --role="roles/secretmanager.secretAccessor" 2>$null
gcloud secrets add-iam-policy-binding gemini-api-key --member="serviceAccount:$SA" --role="roles/secretmanager.secretAccessor" 2>$null
gcloud secrets add-iam-policy-binding auth-secret --member="serviceAccount:$SA" --role="roles/secretmanager.secretAccessor" 2>$null
gcloud secrets add-iam-policy-binding frontend-url --member="serviceAccount:$SA" --role="roles/secretmanager.secretAccessor" 2>$null
gcloud secrets add-iam-policy-binding backend-url --member="serviceAccount:$SA" --role="roles/secretmanager.secretAccessor" 2>$null
Write-Host "Secrets configured ✅"

# ── Step 5: Build and push Docker images ─────────────────────
Write-Host "`nStep 5: Building Docker images with Cloud Build..." -ForegroundColor Yellow

gcloud auth configure-docker "$Region-docker.pkg.dev" --quiet

# Build backend
Write-Host "  Building backend..."
gcloud builds submit . `
    --tag "$REGISTRY/todo-backend:latest" `
    --dockerfile infra/docker/Dockerfile.backend `
    --timeout=600

# Build frontend
Write-Host "  Building frontend..."
gcloud builds submit . `
    --tag "$REGISTRY/todo-frontend:latest" `
    --dockerfile infra/docker/Dockerfile.frontend `
    --timeout=600

Write-Host "Images built ✅"

# ── Step 6: Deploy Backend to Cloud Run ──────────────────────
Write-Host "`nStep 6: Deploying backend to Cloud Run..." -ForegroundColor Yellow

gcloud run deploy todo-backend `
    --image "$REGISTRY/todo-backend:latest" `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --port 8080 `
    --memory 512Mi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 3 `
    --set-secrets "DATABASE_URL=database-url:latest,DATABASE_URL_UNPOOLED=database-url:latest,GEMINI_API_KEY=gemini-api-key:latest,BETTER_AUTH_SECRET=auth-secret:latest,FRONTEND_URL=frontend-url:latest" `
    --set-env-vars "GEMINI_MODEL=gemini-2.5-flash,PORT=8080"

$BACKEND_URL = gcloud run services describe todo-backend --region=$Region --format="value(status.url)"
Write-Host "Backend deployed: $BACKEND_URL ✅"

# ── Step 7: Update backend URL secret ────────────────────────
echo $BACKEND_URL | gcloud secrets versions add backend-url --data-file=-

# ── Step 8: Deploy Frontend to Cloud Run ─────────────────────
Write-Host "`nStep 7: Deploying frontend to Cloud Run..." -ForegroundColor Yellow

gcloud run deploy todo-frontend `
    --image "$REGISTRY/todo-frontend:latest" `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --port 3000 `
    --memory 512Mi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 3 `
    --set-secrets "DATABASE_URL=database-url:latest,DATABASE_URL_UNPOOLED=database-url:latest,AUTH_SECRET=auth-secret:latest" `
    --set-env-vars "NODE_ENV=production,PORT=3000,NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL"

$FRONTEND_URL = gcloud run services describe todo-frontend --region=$Region --format="value(status.url)"
Write-Host "Frontend deployed: $FRONTEND_URL ✅"

# ── Step 9: Update frontend URL secret ───────────────────────
echo $FRONTEND_URL | gcloud secrets versions add frontend-url --data-file=-

# ── Done! ────────────────────────────────────────────────────
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "============================================`n"
Write-Host "🌐 Frontend:  $FRONTEND_URL"
Write-Host "⚙️  Backend:   $BACKEND_URL"
Write-Host "📖 API Docs:  $BACKEND_URL/docs"
Write-Host "💬 AI Chat:   $FRONTEND_URL/chat"
Write-Host "`n📝 Submit form: https://forms.gle/KMKEKaFUD6ZX4UtY8"

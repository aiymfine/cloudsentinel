# Setup script for Windows (PowerShell)
# CloudSentinel - Secure Cloud Infrastructure

Write-Host "🛡️  CloudSentinel - Setup (Windows)" -ForegroundColor Cyan
Write-Host "===================================="

# Step 1: Build Docker Images
Write-Host ""
Write-Host "🏗️  Building Docker images..." -ForegroundColor Yellow

Write-Host "  Building backend..."
docker build -t cloud-sentinel-backend:latest ./app/backend
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Backend build failed" -ForegroundColor Red; exit 1 }

Write-Host "  Building frontend..."
docker build -t cloud-sentinel-frontend:latest ./app/frontend
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Frontend build failed" -ForegroundColor Red; exit 1 }

Write-Host "✅ Docker images built" -ForegroundColor Green

# Step 2: Start LocalStack first
Write-Host ""
Write-Host "📦 Starting LocalStack..." -ForegroundColor Yellow
docker compose up -d localstack

Write-Host "  Waiting for LocalStack to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# Step 3: Terraform
Write-Host ""
Write-Host "🏗️  Running Terraform..." -ForegroundColor Yellow
Set-Location terraform
terraform init -reconfigure
terraform plan -out=tfplan
terraform apply -auto-approve tfplan
Set-Location ..
Write-Host "✅ Infrastructure provisioned" -ForegroundColor Green

# Step 4: Start all services
Write-Host ""
Write-Host "🚀 Starting all services..." -ForegroundColor Yellow
docker compose up -d
Write-Host "✅ Services started" -ForegroundColor Green

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "🎉 CloudSentinel is running!" -ForegroundColor Green
Write-Host ""
Write-Host "  📱 Frontend:    http://localhost"
Write-Host "  🔧 Backend API: http://localhost:8080"
Write-Host "  📖 Swagger:     http://localhost:8080/api/swagger-ui.html"
Write-Host "  📊 Prometheus:  http://localhost:9090"
Write-Host "  📈 Grafana:     http://localhost:3000 (admin/admin)"
Write-Host ""
Write-Host "  👤 Default Users:"
Write-Host "     admin   / admin123  (ADMIN)"
Write-Host "     editor  / editor123 (EDITOR)"
Write-Host "     viewer  / viewer123 (VIEWER)"
Write-Host "====================================" -ForegroundColor Cyan

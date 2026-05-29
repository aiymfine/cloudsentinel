#!/bin/bash
# ─── CloudSentinel Setup Script ───
# This script sets up the entire infrastructure locally

set -e

echo "🛡️  CloudSentinel - Secure Cloud Infrastructure Setup"
echo "===================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ $1 found${NC}"
    return 0
}

# ─── Step 1: Check Prerequisites ───
echo ""
echo "📋 Checking prerequisites..."
check_command docker
check_command kubectl || true
check_command terraform
check_command java || true

# ─── Step 2: Build Docker Images ───
echo ""
echo "🏗️  Building Docker images..."

echo "  Building backend..."
docker build -t cloud-sentinel-backend:latest ./app/backend

echo "  Building frontend..."
docker build -t cloud-sentinel-frontend:latest ./app/frontend

echo -e "${GREEN}✅ Docker images built${NC}"

# ─── Step 3: Terraform (Provision LocalStack Resources) ───
echo ""
echo "📦 Starting LocalStack..."
docker compose up -d localstack
echo "  Waiting for LocalStack to be ready..."
sleep 15

echo ""
echo "🏗️  Running Terraform..."
cd terraform
terraform init -reconfigure
terraform plan -out=tfplan
terraform apply -auto-approve tfplan
cd ..
echo -e "${GREEN}✅ Infrastructure provisioned${NC}"

# ─── Step 4: Start Application (Docker Compose) ───
echo ""
echo "🚀 Starting all services with Docker Compose..."
docker compose up -d
echo -e "${GREEN}✅ Services started${NC}"

# ─── Done ───
echo ""
echo "===================================================="
echo -e "${GREEN}🎉 CloudSentinel is running!${NC}"
echo ""
echo "  📱 Frontend:    http://localhost"
echo "  🔧 Backend API: http://localhost:8080"
echo "  📖 Swagger:     http://localhost:8080/api/swagger-ui.html"
echo "  📊 Prometheus:  http://localhost:9090"
echo "  📈 Grafana:     http://localhost:3000 (admin/admin)"
echo "  ☁️  LocalStack:  http://localhost:4566"
echo ""
echo "  👤 Default Users:"
echo "     admin   / admin123  (ADMIN)"
echo "     editor  / editor123 (EDITOR)"
echo "     viewer  / viewer123 (VIEWER)"
echo "===================================================="

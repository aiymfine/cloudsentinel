#!/bin/bash
# ─── CloudSentinel Kubernetes Deployment Script ───

set -e

echo "🛡️  CloudSentinel - Kubernetes Deployment"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ─── Step 1: Check kubectl & cluster ───
echo "📋 Checking Kubernetes cluster..."
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Kubernetes cluster not available${NC}"
    echo "Starting kind cluster..."
    
    if ! command -v kind &> /dev/null; then
        echo "Installing kind..."
        curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64
        chmod +x ./kind
        sudo mv ./kind /usr/local/bin/kind
    fi
    
    kind create cluster --name cloudsentinel --config=- <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 80
        protocol: TCP
      - containerPort: 30030
        hostPort: 3000
        protocol: TCP
      - containerPort: 30090
        hostPort: 9090
        protocol: TCP
EOF
    echo -e "${GREEN}✅ Kind cluster created${NC}"
fi

# ─── Step 2: Build & Load Images ───
echo ""
echo "🏗️  Building Docker images..."
docker build -t cloud-sentinel-backend:latest ./app/backend
docker build -t cloud-sentinel-frontend:latest ./app/frontend

echo "Loading images into kind..."
kind load docker-image cloud-sentinel-backend:latest --name cloudsentinel
kind load docker-image cloud-sentinel-frontend:latest --name cloudsentinel
echo -e "${GREEN}✅ Images loaded${NC}"

# ─── Step 3: Deploy to Kubernetes ───
echo ""
echo "🚀 Deploying to Kubernetes..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/serviceaccount.yaml
kubectl apply -f k8s/localstack.yaml

echo "  Waiting for LocalStack to be ready..."
kubectl wait --for=condition=ready pod -l app=localstack -n cloud-sentinel --timeout=120s

kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/prometheus.yaml
kubectl apply -f k8s/grafana.yaml
kubectl apply -f k8s/grafana-config.yaml
kubectl apply -f k8s/networkpolicy.yaml

# ─── Step 4: Run Terraform Job ───
echo ""
echo "📦 Provisioning LocalStack resources..."
# Wait for backend to be ready for Terraform
echo "  Waiting for backend..."
kubectl wait --for=condition=ready pod -l app=backend -n cloud-sentinel --timeout=180s

# ─── Done ───
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 CloudSentinel deployed to Kubernetes!${NC}"
echo ""
echo "  📱 Frontend:    http://localhost"
echo "  🔧 Backend API: http://localhost:8080/api/health"
echo "  📈 Grafana:     http://localhost:3000 (admin/admin)"
echo "  📊 Prometheus:  http://localhost:9090"
echo ""
echo "  Check status: kubectl get pods -n cloud-sentinel"
echo "=========================================="

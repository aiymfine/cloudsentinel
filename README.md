# ☁️ CloudSentinel

> **Secure Cloud-Native Document Management Platform**

[![CI/CD](https://github.com/aiymfine/cloudsentinel/actions/workflows/ci.yml/badge.svg)](https://github.com/aiymfine/cloudsentinel/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green.svg)](https://spring.io/projects/spring-boot)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Deployed-326CE5.svg)](https://kubernetes.io/)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC.svg)](https://www.terraform.io/)

## 🛡️ Overview

CloudSentinel is a secure, cloud-native document management system built as a final project demonstrating enterprise-grade infrastructure practices. It features Role-Based Access Control (RBAC), Infrastructure as Code (IaC), container orchestration, and full observability.

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **RBAC Security** | 3-tier role system (Viewer/Editor/Admin) with JWT authentication |
| ☁️ **Cloud Storage** | S3-compatible document storage via LocalStack |
| 📊 **DynamoDB** | NoSQL user management and audit logging |
| 🏗️ **Infrastructure as Code** | Full Terraform provisioning |
| 🐳 **Docker** | Multi-stage builds with non-root security |
| ☸️ **Kubernetes** | HA deployment with 2+ replicas |
| 📈 **Monitoring** | Prometheus + Grafana dashboards |
| 🔒 **Network Policies** | Zero-trust pod networking |
| 📖 **API Documentation** | Auto-generated Swagger/OpenAPI |
| 🎨 **Modern UI** | Dark-themed React frontend with glassmorphism |
| 📝 **Audit Logging** | Complete activity tracking |
| 🚦 **Rate Limiting** | API rate protection |
| 🔄 **CI/CD** | GitHub Actions pipeline |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                     │
│                                                          │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────────┐ │
│  │ Frontend  │──▶│   Backend    │──▶│   LocalStack     │ │
│  │ (React +  │   │ (Spring Boot │   │ (S3 + DynamoDB + │ │
│  │  Nginx)   │   │  + Security) │   │  IAM + STS)      │ │
│  │  2 pods   │   │   2 pods     │   │   1 pod          │ │
│  └──────────┘   └──────┬───────┘   └──────────────────┘ │
│                        │                                  │
│                        ▼                                  │
│              ┌──────────────────┐                        │
│              │   Prometheus     │◀── Scrape /metrics     │
│              │   + Grafana      │                        │
│              └──────────────────┘                        │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Network Policies │ Secrets │ ConfigMaps │ RBAC     │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
         ▲
         │ Terraform provisions resources
         │ in LocalStack (S3, DynamoDB, IAM)
```

## 📁 Repository Structure

```
cloudsentinel/
├── terraform/              # IaC - LocalStack resource provisioning
│   ├── main.tf            # S3, DynamoDB, IAM resources
│   ├── providers.tf       # AWS provider config for LocalStack
│   ├── variables.tf       # Input variables
│   ├── outputs.tf         # Output values
│   └── backend.tf         # State backend config
├── app/
│   ├── backend/           # Spring Boot application
│   │   ├── src/           # Java source code
│   │   ├── Dockerfile     # Multi-stage, non-root build
│   │   └── pom.xml        # Maven dependencies
│   └── frontend/          # React application
│       ├── src/           # React source code
│       ├── Dockerfile     # Multi-stage build with Nginx
│       └── package.json   # Node dependencies
├── k8s/                   # Kubernetes manifests
│   ├── namespace.yaml     # Namespace definition
│   ├── configmap.yaml     # App configuration
│   ├── secrets.yaml       # Sensitive credentials
│   ├── serviceaccount.yaml # Least-privilege service account
│   ├── localstack.yaml    # LocalStack deployment
│   ├── backend.yaml       # Backend deployment (2 replicas)
│   ├── frontend.yaml      # Frontend deployment (2 replicas)
│   ├── prometheus.yaml    # Prometheus deployment
│   ├── grafana.yaml       # Grafana deployment
│   ├── networkpolicy.yaml # Network security policies
│   └── kustomization.yaml # Kustomize config
├── monitoring/
│   ├── prometheus.yml     # Prometheus scrape config
│   └── grafana/
│       └── dashboards/    # Pre-configured Grafana dashboards
├── scripts/
│   ├── setup.sh           # Linux/Mac setup script
│   ├── setup.ps1          # Windows PowerShell setup script
│   ├── deploy-k8s.sh      # Kubernetes deployment script
│   └── teardown.sh        # Cleanup script
├── .github/workflows/     # CI/CD pipeline
├── docker-compose.yml     # Local development environment
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/) 20+
- [Terraform](https://www.terraform.io/) 1.0+
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (for K8s deployment)
- [kind](https://kind.sigs.k8s.io/) (for local K8s cluster)

### Option 1: Docker Compose (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/aiymfine/cloudsentinel.git
cd cloudsentinel

# Run the setup script
# Linux/Mac:
chmod +x scripts/setup.sh && ./scripts/setup.sh

# Windows PowerShell:
.\scripts\setup.ps1
```

Or manually:
```bash
# Build and start everything
docker compose up -d --build

# Provision cloud resources
cd terraform
terraform init
terraform apply -auto-approve
cd ..
```

### Option 2: Kubernetes (Production-like)

```bash
# Create kind cluster with port mappings
kind create cluster --name cloudsentinel --config=- <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 80
      - containerPort: 30030
        hostPort: 3000
EOF

# Deploy
chmod +x scripts/deploy-k8s.sh && ./scripts/deploy-k8s.sh
```

### Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| 📱 Frontend | http://localhost | - |
| 🔧 Backend API | http://localhost:8080 | - |
| 📖 Swagger UI | http://localhost:8080/api/swagger-ui.html | - |
| 📊 Prometheus | http://localhost:9090 | - |
| 📈 Grafana | http://localhost:3000 | admin / admin |
| ☁️ LocalStack | http://localhost:4566 | - |

### Default Users

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `admin` | `admin123` | ADMIN | Full access + sensitive endpoints |
| `editor` | `editor123` | EDITOR | View + upload files |
| `viewer` | `viewer123` | VIEWER | View files only |

## 🔐 Security Features

### RBAC Roles

| Role | List Files | Upload Files | Delete Files | Admin Panel |
|------|-----------|-------------|-------------|-------------|
| VIEWER | ✅ | ❌ | ❌ | ❌ |
| EDITOR | ✅ | ✅ | ❌ | ❌ |
| ADMIN | ✅ | ✅ | ✅ | ✅ |

### Security Measures

- **JWT Authentication** with configurable expiration
- **BCrypt Password Hashing** (cost factor 12)
- **Non-root Docker containers** (dedicated system user)
- **Kubernetes Secrets** for all sensitive data
- **Network Policies** restricting pod-to-pod traffic
- **Least-Privilege ServiceAccount** (RBAC)
- **S3 Bucket Encryption** (AES256)
- **S3 Public Access Block** enabled
- **Audit Logging** of all state-changing operations

## 📊 Monitoring

### Prometheus Metrics

- `auth_failures_total` — Authorization failure counter
- `http_server_requests_seconds` — Request latency histogram
- `jvm_memory_used_bytes` — JVM memory usage
- `process_uptime_seconds` — Application uptime

### Grafana Dashboards

Pre-configured dashboard includes:
- Authorization failures over time
- HTTP request rate by status code
- Request latency (p50, p95, p99)
- JVM memory usage
- S3 operation counts
- Application uptime

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend | Spring Boot | 3.2.x |
| Security | Spring Security + JWT | - |
| Frontend | React + Vite | 18.x |
| Styling | Tailwind CSS | 3.x |
| Cloud Emulation | LocalStack | latest |
| Storage | S3 (via LocalStack) | - |
| Database | DynamoDB (via LocalStack) | - |
| IaC | Terraform | 1.14+ |
| Containers | Docker | 20+ |
| Orchestration | Kubernetes | 1.28+ |
| Monitoring | Prometheus + Grafana | latest |
| CI/CD | GitHub Actions | - |

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login and get JWT
- `GET /api/auth/me` — Get current user info

### Documents
- `GET /api/documents` — List all files (VIEWER+)
- `POST /api/documents/upload` — Upload file (EDITOR+)
- `GET /api/documents/{key}/download` — Download file (VIEWER+)
- `GET /api/documents/{key}/preview` — Preview file (VIEWER+)
- `DELETE /api/documents/{key}` — Delete file (ADMIN)

### Admin
- `GET /api/admin/users` — List all users (ADMIN)
- `PUT /api/admin/users/{id}/role` — Change user role (ADMIN)
- `GET /api/admin/audit-logs` — View audit logs (ADMIN)
- `GET /api/admin/dashboard` — Dashboard stats (ADMIN)
- `GET /api/admin/sensitive` — Sensitive endpoint (ADMIN)

### Monitoring
- `GET /actuator/health` — Health check
- `GET /actuator/prometheus` — Prometheus metrics
- `GET /api/health` — Application health

## 👨‍💻 Development

### Backend (Spring Boot)

```bash
cd app/backend
./mvnw spring-boot:run
```

### Frontend (React)

```bash
cd app/frontend
npm install
npm run dev
```

### Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## 📜 License

This project is licensed under the MIT License.

## 🙏 Credits

Built as a final exam project for **IT Infrastructure** course demonstrating secure cloud-native architecture patterns.

---

<div align="center">
  <strong>CloudSentinel</strong> — Secure. Cloud-Native. Enterprise-Grade.
</div>

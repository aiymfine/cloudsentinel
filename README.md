# ☁️ CloudSentinel

> **Secure Cloud-Native Document Management Platform**

[![CI/CD](https://github.com/aiymfine/cloudsentinel/actions/workflows/ci.yml/badge.svg)](https://github.com/aiymfine/cloudsentinel/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green.svg)](https://spring.io/projects/spring-boot)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Deployed-326CE5.svg)](https://kubernetes.io/)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC.svg)](https://www.terraform.io/)

## 🛡️ Overview

CloudSentinel is a secure, cloud-native document management system demonstrating enterprise-grade infrastructure practices. It features Role-Based Access Control (RBAC) with 3 distinct tiers, JWT authentication, Infrastructure as Code (IaC), container orchestration with Docker and Kubernetes, and full observability with Prometheus + Grafana.

### ✨ Features

- 🔐 **3-Tier RBAC** — Viewer (read-only), Editor (upload), Admin (full control)
- ☁️ **AWS S3 Storage** — S3-compatible document storage via LocalStack
- 📊 **DynamoDB** — NoSQL user management and audit logging
- 🔑 **JWT Authentication** — Stateless auth with BCrypt password hashing
- 🏗️ **Infrastructure as Code** — Terraform provisioning for AWS resources
- 🐳 **Docker** — Multi-stage builds with non-root containers
- ☸️ **Kubernetes** — Production manifests with NetworkPolicies
- 📈 **Prometheus + Grafana** — Real-time metrics and dashboards
- 🔒 **Network Policies** — Zero-trust pod-to-pod traffic control
- 📖 **Swagger/OpenAPI** — Auto-generated interactive API docs
- 🎨 **Modern UI** — Dark-themed React frontend with glassmorphism design
- 📝 **Audit Logging** — Complete activity tracking for all operations
- 🚦 **CI/CD** — GitHub Actions pipeline with build, test, validate, and deploy

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker / Kubernetes Cluster             │
│                                                          │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────────┐ │
│  │ Frontend  │──▶│   Backend    │──▶│   LocalStack     │ │
│  │ (React +  │   │ (Spring Boot │   │  S3 + DynamoDB   │ │
│  │  Nginx)   │   │  Security)   │   │  IAM + STS        │ │
│  │ :80       │   │ :8080        │   │  :4566            │ │
│  └──────────┘   └──────┬───────┘   └──────────────────┘ │
│                        │                                  │
│                        ▼                                  │
│              ┌──────────────────┐                        │
│              │   Prometheus     │◀── Scrape /actuator    │
│              │   :9090          │    /prometheus          │
│              ├──────────────────┤                        │
│              │   Grafana        │                        │
│              │   :3000          │                        │
│              └──────────────────┘                        │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  NetworkPolicies │ Secrets │ ConfigMaps │ RBAC      │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 📁 Repository Structure

```
cloudsentinel/
├── terraform/              # IaC — LocalStack resource provisioning
│   ├── main.tf            # S3 bucket, DynamoDB tables, IAM policies
│   ├── providers.tf       # AWS provider config for LocalStack
│   ├── variables.tf       # Input variables
│   └── outputs.tf         # Output values
├── app/
│   ├── backend/           # Spring Boot REST API
│   │   ├── src/main/java/com/cloudsentinel/
│   │   │   ├── config/       # SecurityConfig, AwsConfig
│   │   │   ├── controller/    # REST endpoints (Auth, Documents, Admin)
│   │   │   ├── security/      # JWT filter, token provider
│   │   │   ├── service/       # S3Service, AuthService, AuditService
│   │   │   ├── model/         # DocumentMetadata
│   │   │   └── dto/           # Request/Response DTOs
│   │   ├── Dockerfile     # Multi-stage, non-root build
│   │   └── pom.xml        # Maven dependencies
│   └── frontend/          # React SPA
│       ├── src/           # React components, pages, services
│       ├── Dockerfile     # Multi-stage build with Nginx
│       └── package.json   # Node dependencies
├── k8s/                   # Kubernetes manifests
│   ├── namespace.yaml     # Namespace definition
│   ├── configmap.yaml     # Application configuration
│   ├── secrets.yaml       # Credentials (CHANGE_ME placeholders)
│   ├── secrets.example.yaml # Example with LocalStack defaults
│   ├── serviceaccount.yaml # Least-privilege service account
│   ├── localstack.yaml    # LocalStack StatefulSet
│   ├── backend.yaml       # Backend Deployment + Service (2 replicas)
│   ├── frontend.yaml      # Frontend Deployment + Service (2 replicas)
│   ├── prometheus.yaml    # Prometheus Deployment + Service
│   ├── grafana.yaml       # Grafana Deployment + Service
│   ├── networkpolicy.yaml # Network security policies
│   └── kustomization.yaml # Kustomize overlay
├── monitoring/
│   ├── prometheus.yml     # Prometheus scrape configuration
│   └── grafana/
│       └── dashboards/    # Pre-configured Grafana dashboards
├── scripts/
│   ├── setup.sh           # Linux/Mac setup script
│   ├── setup.ps1          # Windows PowerShell setup script
│   ├── deploy-k8s.sh      # Kubernetes deployment script
│   └── teardown.sh        # Cleanup script
├── .github/workflows/
│   └── ci.yml             # CI/CD pipeline
├── docker-compose.yml     # Local development environment
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/) 20+
- [Terraform](https://www.terraform.io/) 1.0+ (optional, for IaC demo)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) + [kind](https://kind.sigs.k8s.io/) (optional, for K8s deployment)

### Docker Compose (Development)

```bash
# Clone the repository
git clone https://github.com/aiymfine/cloudsentinel.git
cd cloudsentinel

# Build and start all 5 containers
docker compose up -d --build
```

That's it. The stack includes:
- **Backend** (Spring Boot) — port 8080
- **Frontend** (React + Nginx) — port 80
- **LocalStack** (S3 + DynamoDB) — port 4566
- **Prometheus** — port 9090
- **Grafana** — port 3000

### Terraform (Provision Cloud Resources)

```bash
cd terraform
terraform init
terraform apply -auto-approve
```

### Kubernetes (Production-like)

```bash
# Create local cluster
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

# Deploy all resources
kubectl apply -k k8s/
```

## 🔗 Access Points

| Service | URL | Notes |
|---------|-----|-------|
| 📱 **Frontend** | http://localhost | Main application UI |
| 🔧 **Backend API** | http://localhost:8080 | REST API |
| 📖 **Swagger UI** | http://localhost:8080/api/swagger-ui.html | Interactive API docs |
| 📊 **Prometheus** | http://localhost:9090 | Metrics scraper (target: `backend:8080`) |
| 📈 **Grafana** | http://localhost:3000 | Dashboards (`admin` / `admin`) |
| ☁️ **LocalStack** | http://localhost:4566 | AWS emulation |
| ❤️ **Health** | http://localhost:8080/actuator/health | Backend health check |

## 👥 Default Users

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `admin` | `admin123` | **ADMIN** | Full access — list, upload, download, delete, admin panel, audit logs, sensitive endpoint |
| `editor` | `editor123` | **EDITOR** | View files + upload files |
| `viewer` | `viewer123` | **VIEWER** | View file list only |

## 🔐 Security Architecture

### RBAC Matrix

| Action | VIEWER | EDITOR | ADMIN |
|--------|--------|--------|-------|
| List documents | ✅ | ✅ | ✅ |
| Upload documents | ❌ | ✅ | ✅ |
| Download documents | ❌ | ✅ | ✅ |
| Delete documents | ❌ | ❌ | ✅ |
| Admin panel | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |
| Sensitive endpoint | ❌ | ❌ | ✅ |

### Security Measures

- **JWT Authentication** — HS256 signed tokens with configurable expiration
- **BCrypt Password Hashing** — Industry-standard salted hashing
- **Non-root Docker Containers** — Dedicated `cloudsentinel` system user
- **Kubernetes Secrets** — All credentials stored in K8s Secrets (not ConfigMaps)
- **NetworkPolicies** — Restrict pod-to-pod traffic (backend ↔ LocalStack only)
- **Least-Privilege ServiceAccount** — No default cluster permissions
- **S3 Bucket Encryption** — AES256 server-side encryption
- **S3 Public Access Block** — Explicit public access prevention
- **Audit Logging** — All state-changing operations tracked in DynamoDB
- **Sensitive Endpoint** — Admin-only endpoint demonstrating RBAC enforcement

## 📊 Monitoring

### Prometheus Scraping

Prometheus scrapes Spring Boot Actuator metrics at `http://backend:8080/actuator/prometheus` every 15 seconds. Key metrics include:

| Metric | Description |
|--------|-------------|
| `auth_failures_total` | Count of JWT/authentication failures |
| `http_server_requests_seconds` | Request latency histogram |
| `jvm_memory_used_bytes` | JVM heap usage |
| `process_uptime_seconds` | Application uptime |

## 📝 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login → JWT token |
| GET | `/api/auth/me` | ✅ | Current user profile |

### Documents

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/documents` | ALL | List all files |
| POST | `/api/documents/upload` | EDITOR+ | Upload file (multipart) |
| GET | `/api/documents/download?key=` | EDITOR+ | Download file by S3 key |
| GET | `/api/documents/preview?key=` | EDITOR+ | Preview file by S3 key |
| DELETE | `/api/documents?key=` | ADMIN | Delete file by S3 key |

### Admin

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | ADMIN | List all users |
| PUT | `/api/admin/users/{id}/role` | ADMIN | Change user role |
| GET | `/api/admin/audit-logs` | ADMIN | View audit trail |
| GET | `/api/admin/dashboard` | ADMIN | Dashboard statistics |
| GET | `/api/admin/sensitive` | ADMIN | Sensitive data endpoint |

### Health & Metrics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/actuator/health` | ❌ | Backend health check |
| GET | `/actuator/prometheus` | ❌ | Prometheus metrics |
| GET | `/actuator/info` | ❌ | Application info |

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | Spring Boot | 3.2.5 |
| Language | Java | 21 |
| Security | Spring Security + JWT (jjwt) | 0.12.5 |
| Frontend Framework | React | 18.x |
| Build Tool | Vite | 5.x |
| Styling | Tailwind CSS | 3.x |
| Animations | Framer Motion | — |
| Cloud Emulation | LocalStack | 3.7 |
| Object Storage | AWS S3 (via LocalStack) | — |
| NoSQL Database | DynamoDB (via LocalStack) | — |
| IaC | Terraform | 1.14+ |
| Containerization | Docker (multi-stage builds) | — |
| Orchestration | Kubernetes + Kustomize | 1.28+ |
| Metrics | Micrometer + Prometheus | — |
| Dashboards | Grafana | latest |
| CI/CD | GitHub Actions | — |

## 📸 Screenshots

<details>
<summary>Click to expand screenshots</summary>

### 1. Docker Containers Running
All 5 containers healthy and running via `docker compose ps`

### 2. Frontend — Login Page
Glassmorphism dark-themed login with form validation

### 3. Frontend — Dashboard (Admin)
File management grid with upload, download, delete actions

### 4. Frontend — Admin Panel
User management, audit logs, and dashboard statistics

### 5. Swagger API Documentation
Interactive API docs at `/api/swagger-ui.html` with all endpoints

### 6. Prometheus Targets
Scrape target `backend:8080` showing **UP** status

### 7. Grafana Dashboard
Pre-configured monitoring dashboard connected to Prometheus

</details>

## 🔄 CI/CD Pipeline

The GitHub Actions pipeline runs on every push and PR:

1. **Build Backend** — Maven build with dependency caching
2. **Build Frontend** — npm install + Vite build
3. **Run Tests** — JUnit tests with test profile (no AWS calls)
4. **Validate K8s** — YAML syntax validation via Python
5. **Push to GHCR** — Docker images to GitHub Container Registry

## 📜 License

This project is licensed under the MIT License.

---

<div align="center">
  <strong>CloudSentinel</strong> — Secure. Cloud-Native. Enterprise-Grade.
</div>

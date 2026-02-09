# duo-mate

> Personal AI Content Generation Platform with RAG-Enhanced Fine-Tuned LLMs

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [Contributing](#contributing)
- [License](#license)

## Overview

duo-mate implements a Feature-Training-Inference (FTI) pipeline architecture that:

1. **Collects** user data from multiple sources (Twitter/X, LinkedIn, Email)
2. **Processes** data through cleaning, chunking, and embedding generation
3. **Trains** personalized LLMs using LoRA fine-tuning on user-specific datasets
4. **Generates** content using RAG-enhanced inference with semantic caching
5. **Delivers** through a secure Next.js frontend with OAuth 2.0 authentication

### Key Features

- OAuth 2.0 authentication (Google, GitHub, LinkedIn)
- Multi-source data collection and ETL pipelines
- Vector-based RAG retrieval for context-aware generation
- Fine-tuned LLM models per user (Mistral 7B base)
- Semantic caching for cost optimization
- Real-time streaming generation with Server-Sent Events
- Production-ready monitoring and observability
- Scalable microservices architecture
- 100% free tier deployment option

## System Architecture

### Layer 0: Frontend & Presentation
- **Next.js 14+** with App Router for server-side rendering
- **NextAuth.js** for OAuth 2.0 authentication
- **Tailwind CSS** with shadcn/ui components
- **Zustand** for client state management

### Layer 1: API Gateway & Security
- **Kong/Traefik** API Gateway with rate limiting
- **JWT-based** authentication service
- **Redis** session management
- **ClamAV** document scanning
- CSRF protection and input validation

### Layer 2: Data Collection & Feature Pipeline
- ETL services for Twitter/X, LinkedIn, Email data
- **MongoDB** for raw data storage
- **RabbitMQ** for message queuing
- **Bytewax** streaming pipeline
- **Qdrant** vector database for embeddings
- **Sentence-BERT/E5** embedding models

### Layer 3: Training Pipeline
- **Unsloth** for efficient LoRA/QLoRA fine-tuning
- **CometML** experiment tracking
- **Minio/S3** model registry
- 4-bit quantization for inference optimization
- Automated evaluation and deployment gates

### Layer 4: Inference Pipeline
- **FastAPI** REST API with streaming support
- **RAG retrieval** with cross-encoder reranking
- **Model cascading** (Mistral 7B / Llama 70B)
- **vLLM** inference engine with GPU support
- **Langfuse** prompt monitoring
- **Redis** semantic caching

### Cross-Cutting Concerns
- **Prometheus** metrics collection
- **Grafana** visualization dashboards
- **ELK Stack** centralized logging
- **OpenTelemetry** distributed tracing

## Technology Stack

### Backend
- **Python 3.11+** with FastAPI, PyTorch, Transformers
- **Poetry** for dependency management
- **Pydantic** for data validation

### Frontend
- **Next.js 14+** with TypeScript
- **React 18+** with Server Components
- **NextAuth.js** v5 for authentication
- **Axios** for API communication

### Databases
- **MongoDB** 7.0 (document store)
- **Qdrant** (vector database)
- **PostgreSQL** 15 (model registry)
- **Redis** 7.0 (caching, sessions)

### Infrastructure
- **Docker** & Docker Compose
- **Kubernetes** for orchestration
- **Terraform** for IaC (AWS deployment)
- **GitHub Actions** for CI/CD

### ML/AI
- **Mistral 7B** (base model)
- **Unsloth** (fine-tuning library)
- **Sentence-BERT** (embeddings)
- **vLLM** (inference engine)

## Project Structure

```
duo-mate/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd-training.yml
│       ├── cd-inference.yml
│       ├── docker-build.yml
│       └── frontend-deploy.yml
│
├── .docker/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── frontend/
│   ├── document-scanner/
│   ├── etl-services/
│   ├── feature-pipeline/
│   ├── training/
│   └── inference/
│
├── configs/
│   ├── oauth/
│   ├── etl/
│   ├── training/
│   ├── inference/
│   └── *.yaml
│
├── src/
│   ├── duo_mate/
│   │   ├── domain/           # Domain entities & repositories
│   │   ├── application/      # Business logic & services
│   │   ├── model/            # Training, evaluation & inference
│   │   └── infrastructure/   # API, databases, cloud & monitoring
│   │
│   ├── frontend/             # Next.js application
│   ├── pipelines/            # ML pipeline orchestration
│   └── scripts/              # Utility scripts
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   ├── terraform/
│   └── monitoring/
│
├── notebooks/
├── tests/
├── docs/
└── [config files]
```

## Prerequisites

### Development Environment
- Python 3.11+
- Node.js 18+ and npm/yarn
- Docker 24+ and Docker Compose
- Git

### Cloud Accounts (Free Tier)
- Vercel account (frontend hosting)
- Render account (backend hosting)
- MongoDB Atlas account
- Qdrant Cloud account
- Supabase account
- Upstash account
- Hugging Face account
- Google account (Colab for training)

### Optional
- Kubernetes cluster (Minikube for local, EKS/GKE for production)
- Terraform 1.5+ (for AWS deployment)

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/duo-mate.git
cd duo-mate
```

### 2. Backend Setup

```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
cd src/duo_mate
poetry install

# Activate virtual environment
poetry shell

# Copy environment variables
cp .env.example .env.development

# Initialize databases (requires Docker)
python scripts/setup/init_databases.py
```

### 3. Frontend Setup

```bash
cd src/frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Update OAuth credentials in .env.local
```

### 4. Docker Setup

```bash
cd infrastructure/docker

# Copy environment file
cp .env.docker.example .env.docker

# Start all services
docker-compose up -d

# Check service health
docker-compose ps
```

## Configuration

### OAuth Configuration

#### 1. Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `configs/oauth/google.yaml`

#### 2. GitHub OAuth
1. Go to GitHub Settings > Developer Settings
2. Create OAuth App
3. Add callback: `http://localhost:3000/api/auth/callback/github`
4. Copy credentials to `configs/oauth/github.yaml`

#### 3. LinkedIn OAuth
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create app and request OAuth access
3. Add redirect URI
4. Copy credentials to `configs/oauth/linkedin.yaml`

### Database Configuration

Edit `configs/feature_pipeline.yaml`:

```yaml
mongodb:
  url: mongodb://localhost:27017
  database: duo_mate

qdrant:
  url: http://localhost:6333
  collection_prefix: user_

redis:
  url: redis://localhost:6379
  db: 0
```

### Model Configuration

Edit `configs/training/lora_config.yaml`:

```yaml
base_model: unsloth/mistral-7b-bnb-4bit
lora_r: 16
lora_alpha: 32
lora_dropout: 0.05
target_modules:
  - q_proj
  - k_proj
  - v_proj
  - o_proj
```

## Development

### Running Locally

#### Backend (FastAPI)

```bash
# Start inference API
make dev-backend

# Or manually
cd src/duo_mate
poetry run python -m infrastructure.api.main
```

- API available at: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

#### Frontend (Next.js)

```bash
# Start development server
make dev-frontend

# Or manually
cd src/frontend
npm run dev
```

- Frontend available at: http://localhost:3000

#### Full Stack (Docker Compose)

```bash
# Start all services
make dev

# View logs
make logs

# Stop services
make compose-down
```

### Running ETL Pipelines

```bash
# Run Twitter ETL
python src/scripts/etl/run_twitter_etl.py --user-id user123

# Run LinkedIn ETL
python src/scripts/etl/run_linkedin_etl.py --user-id user123

# Run all ETL jobs
make run-etl
```

### Training Models

```bash
# Start training on Google Colab (recommended)
# Open notebooks/training.ipynb in Colab

# Or train locally (requires GPU)
python src/scripts/training/run_training.py \
  --user-id user123 \
  --config configs/training/sft_config.yaml
```

### Testing Inference

```bash
# Test inference endpoint
python src/scripts/inference/test_endpoint.py \
  --prompt "Write a tweet about AI trends" \
  --user-id user123
```

## Deployment

### Free Tier Deployment

#### 1. Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd src/frontend
vercel --prod
```

#### 2. Deploy Backend (Render)

1. Push code to GitHub
2. Connect Render to GitHub repo
3. Create Web Service from `src/duo_mate/infrastructure/api/main.py`
4. Add environment variables
5. Deploy

#### 3. Setup Databases

- **MongoDB Atlas**: Create free cluster, get connection string
- **Qdrant Cloud**: Create free cluster, get API key
- **Supabase**: Create project, get PostgreSQL URL
- **Upstash Redis**: Create database, get connection string

#### 4. Deploy Inference (Hugging Face Spaces)

```bash
# Create new Space on Hugging Face
# Select "Gradio" SDK with GPU
# Push model and app

git clone https://huggingface.co/spaces/yourusername/duo-mate-inference
cd duo-mate-inference
# Copy inference code and requirements
git push
```

### Production Deployment (Kubernetes)

```bash
# Build and push Docker images
make build
make push

# Deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/namespaces/
kubectl apply -f infrastructure/kubernetes/deployments/
kubectl apply -f infrastructure/kubernetes/services/
kubectl apply -f infrastructure/kubernetes/ingress/

# Check deployment status
kubectl get pods -n duo-mate-prod
```

### AWS Deployment (Terraform)

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file=environments/prod.tfvars

# Apply infrastructure
terraform apply -var-file=environments/prod.tfvars
```

## Testing

### Run All Tests

```bash
make test
```

### Run Specific Test Suites

```bash
# Unit tests only
make test-unit

# Integration tests
pytest tests/integration/

# End-to-end tests
make test-e2e

# Load tests
make test-load
```

### Code Quality

```bash
# Run linters
make lint

# Format code
make format

# Type checking
make type-check
```

## Monitoring

### Local Monitoring

```bash
# Start monitoring stack
docker-compose -f infrastructure/docker/docker-compose.monitoring.yml up -d

# Access dashboards
# Grafana: http://localhost:3002 (admin/admin)
# Prometheus: http://localhost:9090
# Kibana: http://localhost:5601
```

### Production Monitoring

- **Grafana Cloud**: Sign up for free tier, import dashboards from `infrastructure/monitoring/grafana/dashboards/`
- **Sentry**: Add DSN to environment variables for error tracking
- **Langfuse**: Self-host or use cloud for prompt monitoring

### Health Checks

```bash
# Check all service health
python src/scripts/monitoring/check_health.py

# Generate usage report
python src/scripts/monitoring/generate_report.py --date 2026-01-19
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and add tests
3. Run tests: `make test`
4. Run linters: `make lint`
5. Commit changes: `git commit -m "feat: your feature"`
6. Push branch: `git push origin feature/your-feature`
7. Create Pull Request

### Code Standards

- **Python**: PEP 8, Black formatting, type hints with mypy
- **TypeScript**: ESLint, Prettier formatting
- **Commit messages**: Conventional Commits format
- **Test coverage**: Minimum 80% for new code

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- FTI Pipeline architecture inspired by ML system design best practices
- OAuth implementation follows RFC 9700 security recommendations
- RAG retrieval based on state-of-the-art semantic search techniques
- Fine-tuning approach uses efficient LoRA/QLoRA methods

## Support

- **Documentation**: [docs/README.md](docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/duo-mate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/duo-mate/discussions)
- **Email**: support@duo-mate.com

## Roadmap

### Phase 1: Foundation & Data Collection (Weeks 1-3)
> **Goal**: Get user data into the system

- [ ] **1.1 Basic Project Setup** – Initialize repository, Poetry, Next.js, Docker Compose (MongoDB, Redis)
- [ ] **1.2 MongoDB Data Models** – User/Document entities, connection manager, CRUD operations
- [ ] **1.3 Simple Twitter ETL** – Parse Twitter archive, validate, clean, store in MongoDB

### Phase 2: Feature Pipeline (Weeks 4-6)
> **Goal**: Transform raw data into embeddings

- [ ] **2.1 Text Chunking** – Text cleaning, sliding window chunking (512 tokens, 50 overlap)
- [ ] **2.2 Embedding Generation** – Setup Qdrant, E5-base-v2/Sentence-BERT, batch processing
- [ ] **2.3 Qdrant Integration** – Per-user collections, vector upsert, metadata storage

### Phase 3: Basic Inference / RAG (Weeks 7-9)
> **Goal**: Retrieve similar content (no LLM yet)

- [ ] **3.1 RAG Retrieval** – Vector search in Qdrant, top-k retrieval, context formatting
- [ ] **3.2 Simple Inference API** – FastAPI setup, `/generate` endpoint (RAG only)
- [ ] **3.3 Basic Frontend** – Simple UI to test RAG retrieval

### Phase 4: Training Pipeline (Weeks 10-13)
> **Goal**: Fine-tune a model on user data

- [ ] **4.1 Dataset Generation** – Instruction datasets from tweets, train/val split, JSONL export
- [ ] **4.2 LoRA Fine-tuning Setup** – Google Colab notebook, Unsloth, Mistral-7B, LoRA config
- [ ] **4.3 Model Registry** – Upload to Hugging Face Hub, model versioning

### Phase 5: LLM Inference Integration (Weeks 14-16)
> **Goal**: Generate content with fine-tuned model

- [ ] **5.1 Hugging Face Inference** – HF Space with ZeroGPU, load fine-tuned model
- [ ] **5.2 Update Inference API** – Integrate HF API, RAG context prompts, SSE streaming
- [ ] **5.3 Frontend Integration** – Content generation UI, loading states, regenerate button

### Phase 6: Authentication (Weeks 17-19)
> **Goal**: Secure the application with OAuth

- [ ] **6.1 OAuth Setup** – Google/GitHub OAuth apps, NextAuth.js, Redis sessions
- [ ] **6.2 Backend Authentication** – JWT generation, Redis sessions, protected endpoints
- [ ] **6.3 User Management** – Profile endpoints, settings page, usage stats

### Phase 7: Optimization & Polish (Weeks 20-22)
> **Goal**: Production-ready features

- [ ] **7.1 Semantic Caching** – Cache check before RAG, Redis with embeddings, 7-day TTL
- [ ] **7.2 Rate Limiting** – Token bucket algorithm, free/premium tiers, 429 responses
- [ ] **7.3 Monitoring Setup** – Grafana Cloud, Prometheus metrics, Sentry error tracking

### Phase 8: Deployment (Weeks 23-24)
> **Goal**: Deploy to production

- [ ] **8.1 Frontend Deployment** – Deploy Next.js to Vercel, configure env vars, OAuth callbacks
- [ ] **8.2 Backend Deployment** – Deploy FastAPI to Render, MongoDB Atlas, Qdrant Cloud, Upstash Redis

---





# PredictEdge — Deployment Guide

## Architecture

```
Internet → Ingress → predict-frontend (Next.js :3000)
                   → predict-backend  (FastAPI :8000)
                                        ↓
                                   PostgreSQL
                                        ↑
                   predict-collector (CronJob every 5min)
```

## Prerequisites

- K8s cluster with Ingress controller
- Container registry (e.g. Tencent TCR, Docker Hub)
- PostgreSQL instance (Tencent TencentDB or in-cluster)
- Domain names for frontend + API

## Quick Start

### 1. Build & Push Images

```bash
# Backend
cd packages/server
docker build -t YOUR_REGISTRY/predict-backend:latest .
docker push YOUR_REGISTRY/predict-backend:latest

# Frontend (pass API URL at build time)
cd packages/web
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://predict-api.yourdomain.com \
  -t YOUR_REGISTRY/predict-frontend:latest .
docker push YOUR_REGISTRY/predict-frontend:latest
```

### 2. Create PostgreSQL Database

```sql
CREATE DATABASE predict;
CREATE USER predict WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE predict TO predict;
```

Tables are auto-created on first startup (via `store.init()`).

### 3. Configure Secrets

```bash
cp deploy/k8s/secret.yaml.example deploy/k8s/secret.yaml
# Edit secret.yaml with real values:
#   DATABASE_URL: postgresql://predict:PASSWORD@HOST:5432/predict
#   OPENAI_API_KEY: sk-...
```

### 4. Update Image References

In these files, replace `YOUR_REGISTRY/predict-*:latest`:
- `deploy/k8s/backend-deployment.yaml`
- `deploy/k8s/frontend-deployment.yaml`
- `deploy/k8s/cronjob-collector.yaml`

### 5. Update Domain Names

In these files, replace `yourdomain.com`:
- `deploy/k8s/configmap.yaml` → `NEXT_PUBLIC_API_URL`
- `deploy/k8s/ingress.yaml.example` → copy to `ingress.yaml`, set hosts

### 6. Deploy

```bash
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/configmap.yaml
kubectl apply -f deploy/k8s/secret.yaml        # NOT the .example
kubectl apply -f deploy/k8s/backend-deployment.yaml
kubectl apply -f deploy/k8s/backend-service.yaml
kubectl apply -f deploy/k8s/frontend-deployment.yaml
kubectl apply -f deploy/k8s/frontend-service.yaml
kubectl apply -f deploy/k8s/cronjob-collector.yaml
kubectl apply -f deploy/k8s/ingress.yaml        # Your customized version
```

### 7. Verify

```bash
kubectl -n predict get pods
kubectl -n predict logs -l app=predict-backend --tail=20
curl https://predict-api.yourdomain.com/api/health
curl https://predict.yourdomain.com/
```

## Environment Variables

### Required (Secret)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API key for LLM analysis |

### Optional (Secret)
| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key (alternative LLM) |

### Configuration (ConfigMap)
| Variable | Default | Description |
|----------|---------|-------------|
| `PMT_ENV` | production | Environment |
| `PMT_PIPELINE__STORE` | postgres | Storage backend (sqlite/postgres) |
| `PMT_ANALYZERS__LLM_PROB__MODEL` | gpt-4o-mini | LLM model for analysis |
| `PMT_COLLECTORS__POLYMARKET__POLL_INTERVAL` | 30 | Poll interval (seconds) |
| `NEXT_PUBLIC_API_URL` | — | Backend API URL for frontend |

## Scaling Notes

- **Backend**: Stateless, scale horizontally. 2 replicas recommended.
- **Frontend**: Stateless, scale horizontally. 2 replicas recommended.
- **Collector CronJob**: Single instance (concurrencyPolicy: Forbid).
- **PostgreSQL**: Single instance for MVP. Consider read replicas for scale.

## Health Checks

- Backend: `GET /api/health` → `{"status": "ok"}`
- Frontend: `GET /` → 200

## Troubleshooting

```bash
# Check backend logs
kubectl -n predict logs -l app=predict-backend -f

# Check collector job
kubectl -n predict get jobs
kubectl -n predict logs job/predict-collector-XXXXX

# Test DB connectivity from backend
kubectl -n predict exec -it deploy/predict-backend -- python -c "
import asyncio, asyncpg, os
async def test():
    conn = await asyncpg.connect(os.environ['DATABASE_URL'])
    print(await conn.fetchval('SELECT version()'))
    await conn.close()
asyncio.run(test())
"
```

# Layer 6: Scale Architecture

## System Diagram

```
Users (10,000+ concurrent)
           ↓
    Cloudflare CDN
  (Static assets, DDoS protection)
           ↓
    Load Balancer (Nginx / AWS ALB)
    (Round-robin, health checks)
       ↓       ↓       ↓
  FastAPI  FastAPI  FastAPI
  Node 1   Node 2   Node 3
  (Stateless — horizontal scaling)
    ↓           ↓
Redis Cluster    PostgreSQL
(Cache, Rate    Master + Read
Limiting,       Replicas
Sessions)
                ↓
         Celery Workers
      (Async LLM tasks,
       Background processing)
                ↓
         Qdrant Vector DB
      (Job description embeddings,
       User profile matching)
                ↓
      LLM Provider (OpenAI GPT-4)
     (Resume analysis, Interview,
      Roadmap generation)
```

## Scaling Strategies

### Backend
- **Stateless FastAPI nodes**: All state in Redis/PostgreSQL, not in-process.
- **Horizontal scaling**: Add nodes behind Load Balancer when CPU > 70%.
- **Connection pooling**: PgBouncer for PostgreSQL connection management.

### Database
- **Read replicas**: Write to master, read from replicas for analytics/dashboards.
- **Indexing strategy**: Index on `user_id`, `created_at`, `target_role`.
- **Partitioning**: Partition `resume_analyses` table by `created_at`.

### AI/LLM Layer
- **Async Celery workers**: Slow LLM tasks (roadmap generation, full analysis) queued.
- **Redis caching**: Cache roadmaps for 24h — same user, same role, same result.
- **Rate limiting**: Per-user LLM call limits via Redis token bucket.

### Observability
- **Prometheus + Grafana**: API latency, error rates, queue depth.
- **Sentry**: Exception tracking.
- **PostHog**: Product analytics (DAU, funnel, retention).

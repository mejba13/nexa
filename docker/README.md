# Local Infrastructure

`docker-compose.yml` spins up the two dependencies the API needs locally:

- **PostgreSQL 16 + pgvector** (`pgvector/pgvector:pg16` image — includes the `vector` extension)
- **Redis 7** (for BullMQ queue + cache)

## Usage

```bash
# From repo root
pnpm db:up       # start
pnpm db:logs     # tail logs
pnpm db:down     # stop (data persists in volumes)
```

Connection strings for local dev:

```
DATABASE_URL=postgresql://nexa:nexa@localhost:5432/nexa
REDIS_URL=redis://localhost:6379
```

## Extensions

On first boot, `postgres-init/01-extensions.sql` creates:

- `vector` — pgvector for RAG embeddings
- `pgcrypto` — for secure randoms / hashing

## Resetting

```bash
docker compose -f docker/docker-compose.yml down -v
```

The `-v` flag drops the volume — **all data lost**.

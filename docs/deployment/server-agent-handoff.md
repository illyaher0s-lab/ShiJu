# Server Agent Handoff

The server Agent owns deployment and operations.

## Required Runtime

- Node.js 22 or newer
- pnpm
- PostgreSQL 16 or newer
- Reverse proxy with HTTPS
- Process manager such as systemd or pm2

## Environment

Create a production environment file from `.env.example`.

Required secrets:

- `DATABASE_URL`
- `AI_API_KEY` when `AI_PROVIDER=openai_compatible`

Keep production secrets out of Git.

## Deployment Steps

1. Clone or pull the repository.
2. Install dependencies with `pnpm install --frozen-lockfile`.
3. Build with `pnpm build`.
4. Apply database schema from `apps/api/src/db/schema.sql`.
5. Start API with `pnpm --filter @art/api start` after a production start script exists.
6. Serve frontend build from `apps/web/dist`.
7. Configure HTTPS.
8. Configure logs and restart policy.
9. Configure daily PostgreSQL backups.

## Smoke Test

- Open the public web URL.
- Import or load the sample article.
- Open the first segment.
- Add one expression to review.
- Confirm pending sync operations are created with client operation IDs.
- Complete one review card.
- Confirm API logs show no errors.

## Current Local MVP Notes

- Local MVP uses fixture/mock data by default.
- Real AI calls are disabled unless `AI_PROVIDER=openai_compatible` and provider credentials are configured.
- PostgreSQL is the intended authoritative store; IndexedDB is the PWA cache and pending operation queue.
- Server deployment must wire persistence and sync durability before production use.

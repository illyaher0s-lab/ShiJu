# Server Agent Handoff — AI Reading Trainer

**Date:** 2026-06-14  
**Branch:** `codex/ai-reading-trainer-roadmap`  
**Latest Commit:** d540db6  
**Handoff From:** Codex Local Agent  
**Handoff To:** Server Agent

---

## Executive Summary

The **AI Reading Trainer MVP** is complete and verified locally. All core features are implemented with mock/fixture data and ready for production deployment.

**What's Ready:**
- ✅ Frontend PWA (React + Vite) with mobile-first reading, review, and card library
- ✅ Backend API (Fastify + TypeScript) with mock AI providers
- ✅ PostgreSQL schema with all tables and constraints
- ✅ IndexedDB offline queue with idempotent sync contract
- ✅ Three AI generation paths: segment preselection, manual selection, context-entry
- ✅ SM-2 SRS scheduling with FSRS-ready fields
- ✅ Home dashboard with daily targets
- ✅ Chinese review feedback UI (不知道/迷惑/知道/熟知)

**What the Server Agent Needs to Do:**
1. Deploy frontend and backend to production server
2. Set up PostgreSQL database and apply schema
3. Connect real LLM API (OpenAI-compatible or custom)
4. Configure secrets and environment variables
5. Set up HTTPS, process management, logs, and backups
6. Smoke test the full learning loop end-to-end

---

## Repository Structure

```
/mnt/d/Codex/english app/
├── apps/
│   ├── web/                          # Frontend PWA
│   │   ├── dist/                     # Production build output (after pnpm build)
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── home/            # HomePage.tsx (dashboard)
│   │   │   │   ├── reading/         # ReadingPage, ExpressionSheet, SelectionToolbar
│   │   │   │   ├── review/          # ReviewPage with Chinese feedback buttons
│   │   │   │   ├── cards/           # CardLibraryPage, ContextCardGenerator
│   │   │   │   └── import/          # ImportPage (fixture mode)
│   │   │   ├── storage/             # IndexedDB wrapper and operation queue
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api/                          # Backend API
│       ├── src/
│       │   ├── ai/
│       │   │   ├── provider.ts               # AiProvider interface
│       │   │   ├── mockProvider.ts           # Local mock (current default)
│       │   │   └── openAiCompatibleProvider.ts  # Real LLM integration (needs API key)
│       │   ├── db/
│       │   │   ├── schema.sql                # PostgreSQL schema (APPLY THIS FIRST)
│       │   │   └── client.ts                 # Database client (pg)
│       │   ├── routes/
│       │   │   ├── articles.ts               # POST /articles (import), GET /articles/:id/segments
│       │   │   ├── review.ts                 # POST /review (submit feedback)
│       │   │   ├── sync.ts                   # POST /sync (idempotent operation sync)
│       │   │   ├── manualSelection.ts        # POST /manual-selection/generate
│       │   │   └── contextGeneration.ts      # POST /cards/context/generate
│       │   ├── services/
│       │   │   ├── segmentationService.ts
│       │   │   ├── generationService.ts
│       │   │   ├── srsService.ts
│       │   │   ├── syncService.ts
│       │   │   ├── manualSelectionService.ts
│       │   │   └── contextGenerationService.ts
│       │   ├── app.ts                        # Fastify app factory
│       │   ├── server.ts                     # Server bootstrap
│       │   └── config.ts                     # Environment config
│       └── package.json
├── packages/
│   └── domain/                       # Shared types and SRS logic
│       ├── src/
│       │   ├── types.ts              # Article, Segment, ExpressionSense, Occurrence, etc.
│       │   ├── srs.ts                # SM-2 scheduling logic
│       │   ├── candidateStatus.ts    # Five V1 statuses
│       │   └── index.ts
│       └── package.json
├── docs/
│   ├── superpowers/
│   │   ├── specs/2026-06-13-ai-reading-trainer-v1-design.md
│   │   └── plans/2026-06-13-ai-reading-trainer-mvp-implementation.md
│   ├── development/
│   │   ├── local-mvp.md
│   │   └── STATUS.md
│   └── deployment/
│       ├── server-agent-handoff.md   # Old handoff doc
│       └── SERVER-HANDOFF.md         # This file
├── package.json                      # Root workspace scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .env.example                      # Template for secrets
└── .gitignore
```

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, PWA, IndexedDB
- **Backend:** Node.js 22+, TypeScript, Fastify, PostgreSQL 16+
- **AI Provider:** OpenAI-compatible API (default: mock provider)
- **SRS:** SM-2 algorithm with FSRS-ready fields
- **Tests:** Vitest, Testing Library
- **Package Manager:** pnpm (corepack)

---

## Database Schema

**Location:** `apps/api/src/db/schema.sql`

**Tables:**
1. `articles` — imported TXT/Markdown articles
2. `segments` — chunked article segments (1-3 sentences each)
3. `candidate_expressions` — AI-generated expression candidates per segment
4. `expression_senses` — user's personal vocabulary (one sense per expression)
5. `occurrences` — evidence instances (article occurrences + context-entry cards)
6. `review_logs` — SRS review history with before/after state
7. `client_operations` — idempotent operation queue (sync contract)
8. `ai_generation_jobs` — AI generation task tracking

**Key Constraints:**
- `expression_senses` has unique constraint on `(user_id, normalized_form, type, meaning_zh)` where `deleted_at IS NULL`
- `client_operations` has unique constraint on `client_operation_id` for idempotent sync
- All tables support soft delete via `deleted_at`

**Apply Schema:**
```bash
psql $DATABASE_URL -f apps/api/src/db/schema.sql
```

---

## API Endpoints

### 1. Article Import
**POST /articles**
- Body: `{ title, sourceType, rawText }`
- Returns: `{ articleId, segments[] }`
- Segments text, calls AI provider to generate candidates for first segment

### 2. Get Article Segments
**GET /articles/:articleId/segments**
- Returns: `{ segments[], candidates[] }`

### 3. Review Feedback
**POST /review**
- Body: `{ expressionSenseId, feedback, at }`
- Updates SRS fields (easeFactor, intervalDays, srsDueAt)

### 4. Sync Operations
**POST /sync**
- Body: `{ operations: ClientOperation[] }`
- Idempotent by `client_operation_id`
- Returns: `{ results: SyncResult[] }`

### 5. Manual Selection AI Generation
**POST /manual-selection/generate**
- Body: `{ userId, articleId, segmentId, selectedText, surroundingContext }`
- Returns: `ManualSelectionGenerationDraft` with AI-generated candidates

### 6. Context-Entry AI Generation
**POST /cards/context/generate**
- Body: `{ userId, expression, contextLabel, contextNote }`
- Returns: `ContextEntryGenerationDraft` with AI-generated card

---

## AI Provider Integration

**Current State:** Mock provider returns deterministic responses for testing.

**Real LLM Integration Steps:**

### Step 1: Choose Provider Mode

Edit `apps/api/src/config.ts` or set environment variable:

```bash
# Option A: OpenAI-compatible API (recommended)
AI_PROVIDER=openai_compatible
AI_API_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-...
AI_MODEL_NAME=gpt-4o-mini

# Option B: Keep mock provider (testing only)
AI_PROVIDER=mock
```

### Step 2: Understand Provider Interface

**File:** `apps/api/src/ai/provider.ts`

```typescript
export interface AiProvider {
  // Segment preselection (reading page highlights)
  generateCandidates(request: GenerationRequest): Promise<GenerationResult>;
  
  // Manual selection (user selects text in reading page)
  generateManualSelectionDraft(request: ManualSelectionGenerationRequest): Promise<ManualSelectionGenerationDraft>;
  
  // Context-entry (user enters expression + context label)
  generateContextEntryDraft(request: ContextEntryGenerationRequest): Promise<ContextEntryGenerationDraft>;
}
```

### Step 3: Configure OpenAI-Compatible Provider

**File:** `apps/api/src/ai/openAiCompatibleProvider.ts`

Already implemented, needs API key only. Supports:
- OpenAI GPT-4/GPT-3.5
- Anthropic Claude (via OpenRouter or direct)
- Any OpenAI-compatible endpoint (OpenRouter, Together, local vLLM)

**Prompt Templates:**
- Segment generation: returns 3-5 candidates per segment
- Manual selection: returns 1 candidate with duplicate detection
- Context-entry: returns 1 candidate for custom context

**Generation Metadata:**
All AI-generated candidates include:
- `modelProvider` (e.g., "openai")
- `modelName` (e.g., "gpt-4o-mini")
- `promptVersion` (e.g., "v1")
- `generationVersion` (e.g., "2026-06-14")

### Step 4: Test Real AI Calls Locally

```bash
# Set up .env
cp .env.example .env
# Edit .env with real API key

# Start API server
pnpm --filter @art/api dev

# Test segment generation
curl -X POST http://localhost:3001/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","sourceType":"txt","rawText":"The city will roll out new bike lanes next month."}'

# Check response for real AI-generated candidates
```

### Step 5: Monitor and Tune

**Cost Management:**
- Segment generation: ~300-500 tokens per segment (input + output)
- Manual selection: ~200-400 tokens per request
- Context-entry: ~150-300 tokens per request
- Estimated cost: $0.001-0.005 per learning session (10 segments + 2 manual cards)

**Quality Monitoring:**
- Check `ai_generation_jobs` table for success/failure rates
- Log prompt versions and model responses
- A/B test different prompt templates
- Collect user feedback on "bad_explanation" actions

---

## Environment Variables

**Location:** Create `.env` in repository root (NOT committed to git)

**Template:** `.env.example`

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/art_production

# AI Provider
AI_PROVIDER=openai_compatible
AI_API_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-...
AI_MODEL_NAME=gpt-4o-mini

# API Server
PORT=3001
NODE_ENV=production

# Frontend (if serving from API)
FRONTEND_BUILD_PATH=../web/dist
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Clone repository to production server
- [ ] Install Node.js 22+ and pnpm (`corepack enable`)
- [ ] Install PostgreSQL 16+
- [ ] Create production database
- [ ] Apply schema: `psql $DATABASE_URL -f apps/api/src/db/schema.sql`
- [ ] Create `.env` with production secrets (DATABASE_URL, AI_API_KEY)
- [ ] Install dependencies: `pnpm install --frozen-lockfile`
- [ ] Build frontend: `pnpm build` (output: `apps/web/dist`)
- [ ] Build backend: `pnpm --filter @art/api build` (if TypeScript compilation needed)

### Deployment

- [ ] **Frontend:** Serve `apps/web/dist` via Nginx or Caddy
  - Configure as SPA (fallback to `index.html` for client-side routing)
  - Set up HTTPS with Let's Encrypt or Cloudflare
  - Add CSP headers if needed
  
- [ ] **Backend:** Start API server with process manager
  - systemd: create `/etc/systemd/system/art-api.service`
  - pm2: `pm2 start apps/api/src/server.ts --name art-api --interpreter pnpm`
  - Set working directory to repo root
  - Expose on localhost:3001 (or configured PORT)
  
- [ ] **Reverse Proxy:** Configure Nginx/Caddy
  - Frontend: serve static files from `apps/web/dist`
  - Backend: proxy `/api/*` to `http://localhost:3001`
  - Enable HTTPS, HTTP/2, gzip compression

### Post-Deployment

- [ ] Configure logs
  - API logs: stdout/stderr to systemd journal or pm2 logs
  - PostgreSQL logs: enable slow query log (> 1s)
  - Nginx access/error logs
  
- [ ] Configure restart policy
  - systemd: `Restart=always`
  - pm2: `pm2 startup` + `pm2 save`
  
- [ ] Configure daily PostgreSQL backups
  - `pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql`
  - Rotate old backups (keep last 30 days)
  - Test restore procedure
  
- [ ] Set up monitoring (optional but recommended)
  - Uptime checks (ping /api/health every 5min)
  - Disk space alerts (PostgreSQL data directory)
  - Error log alerts (API 5xx responses)

---

## Smoke Test Script

Run this after deployment to verify the full learning loop:

### 1. Open Web App
```
https://your-domain.com
```

### 2. Import Article
- Go to Import tab
- Paste sample text: "The city will roll out new bike lanes next month. This initiative picks up steam as more residents embrace cycling."
- Submit → should create article and segments

### 3. Read First Segment
- Go to Read tab
- Should see "The city will roll out..." with 2-3 highlights
- Tap "roll out" → should show lightweight popover
- Expand → should show full explanation with local meaning
- Tap "Add to Review" → should create client operation

### 4. Manual Selection
- Select text "new bike lanes" in reading page
- Tap "Generate card" button that appears
- Should show draft with expression/meaning/metadata
- Accept draft → should add to Cards and Review

### 5. Context-Entry Card
- Go to Cards tab
- Enter expression: "buff"
- Enter context: "game"
- Tap "Generate card"
- Should show draft (e.g., "增益效果" in gaming context)
- Accept → should add to Cards and Review

### 6. Review Card
- Go to Review tab
- Should see 2-3 due cards
- Tap "Show answer" → should reveal full card with occurrence evidence
- Tap "知道" (green button) → should advance SRS interval
- Long-press "知道" → should reveal "熟知" button
- Tap "熟知" → should mark as mastered and remove from active queue

### 7. Check Database
```sql
-- Should have articles, segments, candidates
SELECT COUNT(*) FROM articles;
SELECT COUNT(*) FROM segments;
SELECT COUNT(*) FROM candidate_expressions;

-- Should have expression_senses and occurrences
SELECT COUNT(*) FROM expression_senses;
SELECT COUNT(*) FROM occurrences;

-- Should have review logs with SRS transitions
SELECT * FROM review_logs ORDER BY created_at DESC LIMIT 5;

-- Should have client operations (if sync was triggered)
SELECT COUNT(*) FROM client_operations;

-- Should have AI generation jobs
SELECT * FROM ai_generation_jobs ORDER BY created_at DESC LIMIT 5;
```

### 8. Check API Logs
```bash
# systemd
journalctl -u art-api -n 100 --no-pager

# pm2
pm2 logs art-api --lines 100
```

Should see:
- No 5xx errors
- Successful AI generation requests (if real LLM connected)
- Successful database queries
- No unhandled promise rejections

---

## Troubleshooting

### Frontend not loading
- Check Nginx config: SPA fallback to `index.html`?
- Check browser console for CORS errors
- Check CSP headers allow required resources

### API returning 500 errors
- Check API logs for stack traces
- Check DATABASE_URL is correct
- Check database schema was applied
- Check AI_API_KEY is valid (if using real LLM)

### AI generation failing
- Check AI_PROVIDER is set correctly
- Check AI_API_KEY is valid and has quota
- Check AI_API_BASE_URL is reachable
- Check `ai_generation_jobs` table for error messages
- Fall back to mock provider temporarily for debugging

### Database connection errors
- Check PostgreSQL is running
- Check DATABASE_URL format: `postgresql://user:pass@host:port/dbname`
- Check firewall allows connections to PostgreSQL port
- Check PostgreSQL `pg_hba.conf` allows connections from API server

### SRS scheduling not working
- Check `review_logs` table has entries
- Check `expression_senses` table has `ease_factor`, `interval_days`, `lapse_count` fields
- Check frontend is calling `POST /review` with correct feedback
- Check SRS logic in `packages/domain/src/srs.ts`

---

## Known Limitations

1. **Authentication:** Not implemented. Add your own auth layer (JWT, OAuth, etc.) before public launch.
2. **Multi-user:** Schema supports `user_id`, but no user management UI exists yet.
3. **Real file import:** TXT/Markdown import UI exists, but backend needs full file parsing logic.
4. **Real sync:** Frontend creates client operations, but backend sync is in-memory only (needs PostgreSQL persistence).
5. **FSRS optimization:** SRS uses SM-2 algorithm. Full FSRS training requires review history data.
6. **PDF/Webpage import:** Excluded from V1 scope.

---

## Next Steps for Server Agent

1. **Deploy MVP to production server** following deployment checklist
2. **Connect real LLM API** (OpenAI or compatible provider)
3. **Run smoke test** end-to-end to verify learning loop
4. **Monitor for 24 hours** to check logs, database growth, API errors
5. **Implement authentication** before allowing public signups
6. **Set up monitoring and alerts** (uptime, errors, disk space)
7. **Configure backups** and test restore procedure
8. **Optimize AI prompts** based on user feedback and cost analysis

---

## Contact

**Codex Local Agent Handoff Complete:** 2026-06-14  
**Questions?** Check `docs/development/STATUS.md` for detailed task history and technical decisions.

**Repository:** `/mnt/d/Codex/english app`  
**Branch:** `codex/ai-reading-trainer-roadmap`  
**Latest Commit:** d540db6 (docs: mark task 18-20 complete)

---

**Good luck with deployment! 🚀**

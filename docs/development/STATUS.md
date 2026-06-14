# AI Reading Trainer - Development Status

**Last Updated**: 2026-06-14  
**Branch**: `codex/ai-reading-trainer-roadmap`  
**Current Phase**: MVP Implementation (Backend AI Contract Layer)

---

## Overview

Building a mobile-first English reading trainer with inline learning and spaced repetition. Current focus: local MVP with mock AI generation to validate learning loop before connecting real LLM APIs or deploying to production.

---

## Implementation Strategy

### Two-Track Ownership

1. **Codex Local Track** (this repo)
   - Frontend PWA (React + Vite)
   - Backend API (Fastify + TypeScript)
   - Database schema (PostgreSQL)
   - Mock AI providers
   - Local tests and browser verification
   - Documentation and handoff specs

2. **Server Agent Track** (not started)
   - Cloud deployment
   - Real LLM API integration
   - Secrets management
   - HTTPS and process management
   - Logs and backups

### Boundary Rule

**Codex does NOT**:
- Deploy to servers
- Connect real LLM APIs
- Handle production secrets
- Configure HTTPS or reverse proxies

**Codex DOES**:
- Define API contracts
- Implement mock providers
- Write schema and migrations
- Document handoff for server agent

---

## Completed Tasks

### ✅ Task 1: Scaffold Workspace
- Commit: `chore: scaffold workspace`
- pnpm monorepo structure
- Root package.json, tsconfig.base.json, .gitignore
- Workspace packages defined

### ✅ Task 2: Add Shared Domain Types and SRS Logic
- Commit: `feat: add shared domain model and srs logic`
- `packages/domain/src/types.ts`: Article, Segment, CandidateExpression, ExpressionSense, Occurrence, ReviewLog, ClientOperation
- `packages/domain/src/srs.ts`: SM-2 based SRS transitions
- `packages/domain/src/candidateStatus.ts`: Five V1 statuses (selected, backup_candidate, ignored_too_easy, ignored_duplicate, ignored_over_limit)
- Domain tests pass

### ✅ Task 3: Build Fixture-Driven Mobile MVP Frontend
- Commit: `feat: build fixture-driven mobile mvp`
- Vite + React + PWA setup
- `apps/web/src/fixtures/sampleSegment.ts`: deterministic fixture data
- ReadingPage: segment rendering, highlights, popover, more expressions
- ExpressionSheet: lightweight + expanded layers
- ReviewPage: due queue, active recall, feedback
- `apps/web/src/lib/highlightText.tsx`: safe text highlighting
- Tests pass, browser verified

### ✅ Task 4: Add Import Page Placeholder
- Commit: `feat: add import page placeholder`
- Static ImportPage with fixture-mode messaging
- Bottom navigation: Read, Review, Library

### ✅ Task 5: Add Fastify API Skeleton
- Commit: `feat: add fastify api skeleton`
- `apps/api/src/app.ts`: Fastify app factory with CORS
- `apps/api/src/server.ts`: server bootstrap
- `apps/api/src/ai/provider.ts`: AI provider interface
- `apps/api/src/ai/mockProvider.ts`: deterministic mock for "roll out"
- Routes registered: articles, review, sync

### ✅ Task 6: Add PostgreSQL Schema
- Commit: `feat: add postgres schema`
- `apps/api/src/db/schema.sql`: tables for articles, segments, candidate_expressions, expression_senses, occurrences, review_logs, client_operations
- Unique constraint on expression_senses (user_id, normalized_form, type, meaning_zh where deleted_at is null)
- Idempotent client_operation_id
- Schema smoke tests pass

### ✅ Task 7: Add IndexedDB Cache and Operation Queue
- Commit: `feat: add offline operation queue`
- `apps/web/src/storage/db.ts`: IndexedDB wrapper
- `apps/web/src/storage/operationQueue.ts`: createClientOperation
- Reading actions wire to operation queue (add_to_review, known, too_easy, bad_explanation)

### ✅ Task 8: Add Sync API Contract
- Commit: `feat: add idempotent sync contract`
- `apps/api/src/services/syncService.ts`: applyClientOperationsInMemory (deduplicates by clientOperationId)
- `apps/api/src/routes/sync.ts`: POST /sync
- Sync tests pass

### ✅ Task 9: Add AI Provider Interface and Real Provider Boundary
- Commit: `feat: add ai provider boundary`
- `apps/api/src/config.ts`: loadConfig (AI_PROVIDER, AI_BASE_URL, AI_API_KEY, AI_MODEL)
- `apps/api/src/ai/openAiCompatibleProvider.ts`: buildGenerationPrompt (includes five V1 statuses, local_meaning, generation_version)
- Provider shell ready for real implementation (not connected yet)

### ✅ Task 10: Local End-to-End Verification
- Commit: `docs: add local mvp verification guide`
- `docs/development/local-mvp.md`: how to run and inspect
- Verified: highlights, popover layers, more expressions, reading vs review feedback behavior

### ✅ Task 11: Server Agent Handoff
- Commit: `docs: add server deployment handoff`
- `docs/deployment/server-agent-handoff.md`: deployment checklist
- `.env.example`: production environment template
- Handoff complete; server agent can execute when ready

### ✅ Task 12: Enrich Review Cards and Add Card Library
- Commit: `feat: enrich review cards and add card library`
- Richer review answer surface: local meaning, sentence, translation, syntax hint, type, difficulty, source, review/mistake counts
- CardLibraryPage: lists ExpressionSense cards, opens occurrence evidence
- CardDetailSheet: shows all matching occurrences and source context
- App navigation: Read, Review, Cards, Articles
- Browser verified

### ✅ Task 13: Add Visible TXT/Markdown Import Entry Point
- Commit: `feat: add article import entry point`
- ImportPage: file input for .txt/.md/.markdown, import state messaging
- V1 affordance visible (fixture mode)
- Browser verified

### ✅ Task 14: Add Manual Selection AI Card Generation Mock Flow
- Commit: `feat: add manual selection card generation mock`
- `apps/web/src/features/reading/manualSelection.ts`: buildManualSelectionDraft (deterministic for "all at once")
- SelectionToolbar: appears on text selection
- GeneratedCardDraftSheet: shows metadata, allows accept/dismiss
- ReadingPage wired to listen for text selection
- Browser verified: select "all at once" → Generate card → draft appears → accept adds to Review/Cards

### ✅ Task 15: Add Backend Manual Selection AI Contract
- Commit: `feat: add manual selection ai generation contract` (04abf61)
- `packages/domain/src/types.ts`: ManualSelectionGenerationRequest, ManualSelectionGenerationDraft
- `apps/api/src/ai/provider.ts`: generateManualSelectionDraft() method added
- `apps/api/src/ai/mockProvider.ts`: deterministic mock for "all at once", fallback for others
- `apps/api/src/services/manualSelectionService.ts`: thin orchestration layer
- `apps/api/src/routes/manualSelection.ts`: POST /manual-selection/generate
- `apps/api/src/db/schema.sql`: ai_generation_jobs table (already existed, supports manual_selection source_type)
- `apps/api/src/db/schema.test.ts`: added manual selection verification test
- **Boundary respected**: mock provider only, no real LLM calls, no server deployment

---

## Current State

### What Works
- ✅ Local fixture-driven MVP frontend runs at `http://localhost:5173`
- ✅ Reading page with highlights, popover, more expressions
- ✅ Review page with due queue and active recall
- ✅ Card library with occurrence evidence
- ✅ Article import entry point (fixture mode)
- ✅ Manual selection mock flow (frontend + backend contract)
- ✅ Backend API skeleton with mock providers
- ✅ PostgreSQL schema defined
- ✅ IndexedDB operation queue
- ✅ Sync API contract (idempotent)
- ✅ Manual selection AI generation contract (backend mock only)

### What Doesn't Work Yet
- ❌ Real file parsing (TXT/Markdown)
- ❌ Real AI generation (LLM calls)
- ❌ Real PostgreSQL persistence
- ❌ Real IndexedDB sync
- ❌ Context-entry AI card generation (Task 16)
- ❌ Authentication
- ❌ Server deployment

### Next Task
**Task 16: Add Context-Entry AI Card Generation Mock Flow**
- Frontend: form for expression + context + note → generate draft
- Backend contract: POST /context-entry/generate
- Mock provider: deterministic for "buff" in "game" context

---

## Key Decisions

### 1. MVP Scope: Fixture-First
**Decision**: Start with deterministic fixture data, defer real file import and AI calls.  
**Rationale**: Validate learning loop early before committing to infrastructure.  
**Status**: Holding. Frontend fixture MVP complete. Backend contract layer in progress.

### 2. SRS Algorithm: SM-2 Variant
**Decision**: Use SM-2 with ease_factor, interval_days, lapse_count. Store full transition history in review_logs.  
**Rationale**: SM-2 is proven, well-documented, and doesn't require complex tuning.  
**Status**: Implemented. Tests pass. Browser verified.

### 3. Two-Track Ownership
**Decision**: Codex owns repo code and mock contracts. Server Agent owns deployment and real LLM integration.  
**Rationale**: Keeps local iteration fast. Avoids blocking on server setup during MVP validation.  
**Status**: Active. Handoff docs written. Server Agent not started yet.

### 4. Five V1 Candidate Statuses
**Decision**: `selected`, `backup_candidate`, `ignored_too_easy`, `ignored_duplicate`, `ignored_over_limit`  
**Rationale**: Covers AI prioritization, learner agency (backup for more expressions), and rejection reasons.  
**Status**: Implemented in domain, schema, tests.

### 5. ExpressionSense vs Sentence Cards
**Decision**: SRS schedules `ExpressionSense` (expression + sense), not full sentence cards.  
**Rationale**: Learners need expression recall, not sentence memorization. Sentences are review evidence, not learning units.  
**Status**: Implemented. Occurrence stores sentence context. ExpressionSense stores type, meaning, difficulty.

### 6. Manual Selection Source
**Decision**: Learners can select text not highlighted by AI and request generation. Backend owns prompt construction and generation.  
**Rationale**: AI misses expressions meaningful to individual learners. Manual selection gives agency without requiring raw authoring.  
**Status**: Task 14 (frontend mock) complete. Task 15 (backend contract) complete. Real LLM integration deferred to server agent.

### 7. Context-Entry Card Generation
**Decision**: Learners can enter expression + real-world context (game, programming, work) and request AI generation. Not raw manual card authoring.  
**Rationale**: Learners meet words outside imported articles. AI generation maintains quality and consistency.  
**Status**: Pending Task 16.

### 8. ai_generation_jobs Table
**Decision**: Single table for all generation sources (segment_preselection, manual_selection, context_entry). Stores client_operation_id, selected_text, context_label, context_note, sentence, context, status, model metadata.  
**Rationale**: Unified job tracking and idempotency. Source type distinguishes workflows.  
**Status**: Implemented in schema. Used by Task 15.

---

## Technical Stack

### Frontend
- React 19
- TypeScript
- Vite 6
- PWA (vite-plugin-pwa)
- IndexedDB (native APIs)
- Vitest + Testing Library

### Backend
- Node.js 22
- Fastify
- TypeScript
- PostgreSQL 16
- Vitest

### Tooling
- pnpm workspace
- ESM everywhere
- Strict TypeScript
- TDD (tests before implementation)

---

## Repository Structure

```
/mnt/d/Codex/english app/
├── apps/
│   ├── web/                     # Frontend PWA
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── reading/    # ReadingPage, ExpressionSheet, SelectionToolbar, manualSelection.ts
│   │   │   │   ├── review/     # ReviewPage, reviewState.ts
│   │   │   │   ├── cards/      # CardLibraryPage, CardDetailSheet
│   │   │   │   └── import/     # ImportPage
│   │   │   ├── fixtures/       # sampleSegment.ts
│   │   │   ├── lib/            # highlightText.tsx, date.ts
│   │   │   ├── storage/        # db.ts, operationQueue.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api/                     # Backend API
│       ├── src/
│       │   ├── ai/              # provider.ts, mockProvider.ts, openAiCompatibleProvider.ts
│       │   ├── db/              # schema.sql, client.ts
│       │   ├── routes/          # articles.ts, review.ts, sync.ts, manualSelection.ts
│       │   ├── services/        # segmentationService.ts, generationService.ts, srsService.ts, syncService.ts, manualSelectionService.ts
│       │   ├── app.ts
│       │   ├── server.ts
│       │   └── config.ts
│       └── package.json
├── packages/
│   └── domain/                  # Shared types and logic
│       ├── src/
│       │   ├── types.ts
│       │   ├── srs.ts
│       │   ├── candidateStatus.ts
│       │   └── index.ts
│       └── package.json
├── docs/
│   ├── superpowers/
│   │   ├── specs/               # V1 design spec
│   │   └── plans/               # MVP implementation plan
│   ├── development/
│   │   ├── local-mvp.md
│   │   ├── database.md
│   │   └── STATUS.md            # This file
│   └── deployment/
│       └── server-agent-handoff.md
├── AGENTS.md                     # Coding rules (enforced)
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## Running Locally

### Frontend
```powershell
pnpm install
pnpm dev:web
```
Open `http://localhost:5173`

### Backend (not needed for current MVP)
```powershell
pnpm dev:api
```

### Tests
```powershell
pnpm test              # All packages
pnpm test:web          # Frontend only
pnpm test:api          # Backend only
pnpm test:domain       # Domain only
```

---

## Commit History (Recent)

- `04abf61` - feat: add manual selection ai generation contract (Task 15)
- `12c2ae2` - feat: polish review feedback and mastered action (Task 19)
- `7746ed1` - feat: add learning home dashboard (Task 18)
- `0778c06` - feat: upgrade srs scheduling (Task 20)
- Previous commits for Tasks 1-14...

---

## Known Issues

None currently blocking. Tests pass, browser verification succeeds for completed tasks.

---

## Next Steps

1. **Complete Task 16**: Context-entry AI card generation mock flow
2. **Complete Task 17**: Context-entry backend contract
3. **Local verification checkpoint**: Run full test suite + browser smoke test
4. **Server agent handoff**: When ready to connect real LLM APIs and deploy

---

## Questions / Blockers

None.

---

**Notes**:
- This document is updated after every significant milestone or decision.
- If a decision needs revisiting, document the new choice and mark the old one as superseded.
- Rule violations from AGENTS.md should be noted here if they led to bugs or rework.

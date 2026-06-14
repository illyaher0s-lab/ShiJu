# AI Reading Trainer MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local, computer-visible mobile-first MVP that validates the reading-inline-learning-review loop before connecting real AI generation or cloud deployment.

**Architecture:** Start with a Vite React PWA shell and deterministic fixture data so the learning experience can be tested immediately in a browser. Then add the Fastify API, PostgreSQL persistence, IndexedDB cache, AI provider boundary, and server deployment path in separate phases. The backend remains the authority, while the phone/PWA stores cached content and pending operations.

**Tech Stack:** React, TypeScript, Vite, PWA, IndexedDB, Node.js, TypeScript, Fastify, PostgreSQL, Vitest, Testing Library, Playwright.

---

## Scope Strategy

The full V1 spec spans frontend, backend, database, offline sync, AI generation, and cloud deployment. To reduce risk, implementation is split into two tracks:

- **Codex local track:** build and verify the product code in this repository.
- **Server Agent track:** deploy the finished services to the cloud server, configure secrets, HTTPS, process management, logs, and backups.

The first milestone is a fixture-driven MVP on the local computer. It intentionally avoids real AI calls and PostgreSQL so the learning interaction can be judged early.

## Ownership Split

### Codex Local Agent Owns

- Repository structure
- Vite React PWA frontend
- Mobile-first UI
- Fixture-driven local MVP
- Domain types and SRS logic
- Fastify backend code
- PostgreSQL schema and migrations
- API contract
- IndexedDB cache and operation queue
- AI provider interface and mock provider
- Local tests and local browser verification
- Developer documentation

### Server Agent Owns

- Cloud server runtime setup
- PostgreSQL installation or managed database connection
- Environment variables and secrets
- API key configuration
- Reverse proxy and HTTPS
- Process manager configuration
- Deployment scripts on the server
- Logs and restart policy
- Database backup policy
- Smoke testing on the public server URL

## MVP Cut

The first visible MVP should answer one question:

Can the user read a short English segment, tap highlighted expressions, see lightweight help, add an expression to review, and complete one review card without the reading page feeling like a dictionary?

MVP includes:

- One sample article segment embedded as fixture data.
- Three selected highlights.
- Two more expressions in a collapsed section.
- Lightweight first-layer popover.
- Full expansion layer.
- Reading feedback actions: add to review, known, too easy, bad explanation.
- A review tab with due expressions.
- SRS interval changes only from review feedback.
- Mobile-width layout that can be viewed on desktop.

After the first local MVP review, the next visible milestone must address learning depth and learner agency before cloud deployment:

- Richer review cards that are useful after recall, not just expression plus Chinese meaning.
- A card library for `ExpressionSense` records, separate from article/library import views.
- Manual selection AI card generation, where the learner selects text and the system calls the LLM to generate card candidates.
- Context-entry AI card generation, where the learner enters an expression plus real-world context such as game or programming and the system calls the LLM to generate card candidates.
- A visible TXT/Markdown import entry point.

MVP excludes:

- Real file import.
- Real AI calls.
- Real PostgreSQL.
- Real IndexedDB sync.
- Raw manual card authoring without AI generation.
- Authentication.
- Server deployment.

---

## Planned File Structure

### Root

- Create: `package.json`  
  Workspace scripts for frontend, backend, tests, and formatting.

- Create: `pnpm-workspace.yaml`  
  Monorepo workspace definition.

- Create: `tsconfig.base.json`  
  Shared strict TypeScript settings.

- Modify: `.gitignore`  
  Add future generated folders such as `.env.local`, `apps/web/dist`, and backend build output if missing.

### Frontend

- Create: `apps/web/package.json`  
  Frontend dependencies and scripts.

- Create: `apps/web/index.html`  
  Vite HTML entry.

- Create: `apps/web/vite.config.ts`  
  Vite, React, and PWA configuration.

- Create: `apps/web/tsconfig.json`  
  Frontend TypeScript config.

- Create: `apps/web/src/main.tsx`  
  React entry.

- Create: `apps/web/src/App.tsx`  
  App composition and tab state.

- Create: `apps/web/src/styles.css`  
  Mobile-first visual system.

- Create: `apps/web/src/fixtures/sampleSegment.ts`  
  Deterministic segment, candidates, expression senses, and occurrences.

- Create: `apps/web/src/features/reading/ReadingPage.tsx`  
  Segment rendering, highlights, popover, more expressions.

- Create: `apps/web/src/features/reading/ExpressionSheet.tsx`  
  Lightweight and expanded expression card.

- Create: `apps/web/src/features/review/ReviewPage.tsx`  
  Review queue and active recall feedback.

- Create: `apps/web/src/features/review/reviewState.ts`  
  Client-side MVP review state updates.

- Create: `apps/web/src/features/import/ImportPage.tsx`  
  Static MVP fixture-mode import screen that keeps the app flow visible before real file import exists.

- Create: `apps/web/src/features/cards/contextGeneration.ts`
  Deterministic local mock builder for learner-entered expression plus real-world context generation.

- Create: `apps/web/src/features/cards/ContextCardGenerator.tsx`
  Form and draft preview for context-entry AI card generation.

- Create: `apps/web/src/lib/highlightText.tsx`  
  Safe text highlighting from occurrence ranges.

- Create: `apps/web/src/lib/date.ts`  
  Date helpers for SRS.

- Create: `apps/web/src/types/domain.ts`  
  Shared domain types used by the MVP.

- Create: `apps/web/src/**/*.test.tsx` and `apps/web/src/**/*.test.ts`  
  Unit and component tests.

### Shared Domain

- Create: `packages/domain/package.json`  
  Shared domain package.

- Create: `packages/domain/src/types.ts`  
  Canonical domain types.

- Create: `packages/domain/src/srs.ts`  
  SRS transition logic.

- Create: `packages/domain/src/segmentation.ts`  
  Text segmentation utilities.

- Create: `packages/domain/src/candidateStatus.ts`  
  Candidate status constants and guards.

- Create: `packages/domain/src/index.ts`  
  Public exports.

- Create: `packages/domain/src/*.test.ts`  
  Domain tests.

### Backend

- Create: `apps/api/package.json`  
  Backend dependencies and scripts.

- Create: `apps/api/tsconfig.json`  
  Backend TypeScript config.

- Create: `apps/api/src/server.ts`  
  Fastify server bootstrap.

- Create: `apps/api/src/app.ts`  
  Fastify app factory for tests.

- Create: `apps/api/src/routes/articles.ts`  
  Article import and segment routes.

- Create: `apps/api/src/routes/review.ts`  
  Review queue and feedback routes.

- Create: `apps/api/src/routes/sync.ts`  
  Client operation sync routes.

- Create: `apps/api/src/services/segmentationService.ts`  
  TXT/Markdown splitting.

- Create: `apps/api/src/services/generationService.ts`  
  First-segment priority and mock generation workflow.

- Create: `apps/api/src/services/contextGenerationService.ts`
  Backend contract for LLM-backed card generation from learner-entered expression and context.

- Create: `apps/api/src/services/srsService.ts`  
  Review updates.

- Create: `apps/api/src/services/syncService.ts`  
  Idempotent operation application.

- Create: `apps/api/src/ai/provider.ts`  
  AI provider interface.

- Create: `apps/api/src/ai/mockProvider.ts`  
  Deterministic provider for tests and local development.

- Create: `apps/api/src/db/schema.sql`  
  PostgreSQL schema.

- Create: `apps/api/src/db/client.ts`  
  PostgreSQL connection wrapper.

- Create: `apps/api/src/**/*.test.ts`  
  Backend service and route tests.

### Documentation

- Create: `docs/development/local-mvp.md`  
  How to run and inspect the local MVP.

- Create: `docs/deployment/server-agent-handoff.md`  
  Exact handoff checklist for the server Agent.

---

## Task 1: Scaffold Workspace

**Owner:** Codex local agent

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create root package files**

Create `package.json`:

```json
{
  "name": "ai-reading-trainer",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev:web": "pnpm --filter @art/web dev",
    "dev:api": "pnpm --filter @art/api dev",
    "test": "pnpm -r test",
    "test:web": "pnpm --filter @art/web test",
    "test:api": "pnpm --filter @art/api test",
    "test:domain": "pnpm --filter @art/domain test",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

- [ ] **Step 2: Update `.gitignore`**

Ensure `.gitignore` contains:

```gitignore
node_modules/
dist/
build/
coverage/
.env
.env.*
!.env.example
.superpowers/
.DS_Store
Thumbs.db
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
apps/web/dist/
apps/api/dist/
```

- [ ] **Step 3: Install dependencies**

Run:

```powershell
pnpm install
```

Expected: dependency installation completes and `pnpm-lock.yaml` is created.

- [ ] **Step 4: Commit**

Run:

```powershell
git add package.json pnpm-workspace.yaml tsconfig.base.json .gitignore pnpm-lock.yaml
git commit -m "chore: scaffold workspace"
```

Expected: commit succeeds.

---

## Task 2: Add Shared Domain Types and SRS Logic

**Owner:** Codex local agent

**Files:**
- Create: `packages/domain/package.json`
- Create: `packages/domain/src/types.ts`
- Create: `packages/domain/src/srs.ts`
- Create: `packages/domain/src/candidateStatus.ts`
- Create: `packages/domain/src/index.ts`
- Create: `packages/domain/src/srs.test.ts`
- Create: `packages/domain/src/candidateStatus.test.ts`

- [ ] **Step 1: Create domain package**

Create `packages/domain/package.json`:

```json
{
  "name": "@art/domain",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.ts",
  "scripts": {
    "test": "vitest run",
    "build": "tsc --noEmit",
    "lint": "tsc --noEmit"
  },
  "devDependencies": {
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Define candidate status constants**

Create `packages/domain/src/candidateStatus.ts`:

```ts
export const candidateStatuses = [
  "selected",
  "backup_candidate",
  "ignored_too_easy",
  "ignored_duplicate",
  "ignored_over_limit",
] as const;

export type CandidateStatus = (typeof candidateStatuses)[number];

export function isCandidateStatus(value: string): value is CandidateStatus {
  return candidateStatuses.includes(value as CandidateStatus);
}

export function appearsInMoreExpressions(status: CandidateStatus): boolean {
  return status === "backup_candidate" || status === "ignored_over_limit";
}
```

- [ ] **Step 3: Test candidate status behavior**

Create `packages/domain/src/candidateStatus.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { appearsInMoreExpressions, isCandidateStatus } from "./candidateStatus";

describe("candidate statuses", () => {
  it("recognizes only the five V1 statuses", () => {
    expect(isCandidateStatus("selected")).toBe(true);
    expect(isCandidateStatus("backup_candidate")).toBe(true);
    expect(isCandidateStatus("ignored_too_easy")).toBe(true);
    expect(isCandidateStatus("ignored_duplicate")).toBe(true);
    expect(isCandidateStatus("ignored_over_limit")).toBe(true);
    expect(isCandidateStatus("low_value")).toBe(false);
  });

  it("shows only backup and over-limit candidates in more expressions", () => {
    expect(appearsInMoreExpressions("backup_candidate")).toBe(true);
    expect(appearsInMoreExpressions("ignored_over_limit")).toBe(true);
    expect(appearsInMoreExpressions("selected")).toBe(false);
    expect(appearsInMoreExpressions("ignored_too_easy")).toBe(false);
    expect(appearsInMoreExpressions("ignored_duplicate")).toBe(false);
  });
});
```

- [ ] **Step 4: Define domain types**

Create `packages/domain/src/types.ts`:

```ts
import type { CandidateStatus } from "./candidateStatus";

export type ExpressionType = "phrasal_verb" | "collocation" | "idiom" | "sentence_pattern" | "other";
export type Difficulty = "A2" | "B1" | "B2" | "C1" | "C2";
export type MasteryStatus = "new" | "learning" | "review" | "mastered";
export type GenerationStatus = "not_generated" | "generating" | "generated" | "failed" | "retryable";
export type ReadingFeedback = "add_to_review" | "known" | "too_easy" | "bad_explanation";
export type ReviewFeedback = "known" | "fuzzy" | "unknown";

export interface Article {
  id: string;
  userId: string;
  title: string;
  sourceType: "txt" | "markdown";
  rawText: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Segment {
  id: string;
  userId: string;
  articleId: string;
  sequence: number;
  text: string;
  wordCount: number;
  generationStatus: GenerationStatus;
  progressStatus: "unread" | "reading" | "read";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CandidateExpression {
  id: string;
  userId: string;
  articleId: string;
  segmentId: string;
  expression: string;
  normalizedForm: string;
  type: ExpressionType;
  meaningZh: string;
  localMeaning: string;
  sentence: string;
  sentenceTranslation: string;
  syntaxHint: string | null;
  difficulty: Difficulty;
  valueScore: number;
  candidateStatus: CandidateStatus;
  statusReason: string;
  occurrenceCount: number;
  modelProvider: string;
  modelName: string;
  promptVersion: string;
  generationVersion: string;
  generatedAt: string;
}

export interface ExpressionSense {
  id: string;
  userId: string;
  expression: string;
  normalizedForm: string;
  type: ExpressionType;
  meaningZh: string;
  difficulty: Difficulty;
  masteryStatus: MasteryStatus;
  srsDueAt: string | null;
  reviewCount: number;
  mistakeCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Occurrence {
  id: string;
  userId: string;
  expressionSenseId: string;
  articleId: string;
  segmentId: string;
  sentence: string;
  sentenceTranslation: string;
  localMeaning: string;
  syntaxHint: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ReviewLog {
  id: string;
  userId: string;
  expressionSenseId: string;
  feedback: ReviewFeedback;
  previousDueAt: string | null;
  nextDueAt: string;
  reviewedAt: string;
  createdAt: string;
}

export interface ClientOperation {
  clientOperationId: string;
  userId: string;
  operationType: string;
  targetType: string;
  targetId: string;
  payload: Record<string, unknown>;
  clientCreatedAt: string;
  syncStatus: "pending" | "synced" | "failed";
  serverAppliedAt: string | null;
}
```

- [ ] **Step 5: Implement SRS transitions**

Create `packages/domain/src/srs.ts`:

```ts
import type { ExpressionSense, ReviewFeedback } from "./types";

const intervalsInDays = [1, 3, 7, 14, 30] as const;

export interface SrsTransition {
  next: ExpressionSense;
  previousDueAt: string | null;
  nextDueAt: string;
}

export function applyReviewFeedback(
  expression: ExpressionSense,
  feedback: ReviewFeedback,
  reviewedAtIso: string,
): SrsTransition {
  const reviewedAt = new Date(reviewedAtIso);
  const previousDueAt = expression.srsDueAt;
  const currentStep = Math.max(0, expression.reviewCount);
  const dayInterval = intervalForFeedback(feedback, currentStep);
  const nextDueAt = addDays(reviewedAt, dayInterval).toISOString();

  const nextReviewCount = feedback === "known"
    ? Math.min(currentStep + 1, intervalsInDays.length)
    : feedback === "fuzzy"
      ? Math.max(1, currentStep)
      : 0;

  const mistakeCount = feedback === "unknown"
    ? expression.mistakeCount + 1
    : expression.mistakeCount;

  return {
    previousDueAt,
    nextDueAt,
    next: {
      ...expression,
      masteryStatus: masteryFor(nextReviewCount, feedback),
      srsDueAt: nextDueAt,
      reviewCount: nextReviewCount,
      mistakeCount,
      updatedAt: reviewedAt.toISOString(),
    },
  };
}

function intervalForFeedback(feedback: ReviewFeedback, currentStep: number): number {
  if (feedback === "unknown") return 1;
  if (feedback === "fuzzy") return currentStep <= 1 ? 1 : 3;
  return intervalsInDays[Math.min(currentStep, intervalsInDays.length - 1)];
}

function masteryFor(reviewCount: number, feedback: ReviewFeedback): ExpressionSense["masteryStatus"] {
  if (feedback === "unknown") return "learning";
  if (reviewCount >= 5) return "mastered";
  if (reviewCount >= 2) return "review";
  return "learning";
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
```

- [ ] **Step 6: Test SRS transitions**

Create `packages/domain/src/srs.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { applyReviewFeedback } from "./srs";
import type { ExpressionSense } from "./types";

const base: ExpressionSense = {
  id: "sense-1",
  userId: "user-1",
  expression: "roll out",
  normalizedForm: "roll out",
  type: "phrasal_verb",
  meaningZh: "推出、发布",
  difficulty: "B2",
  masteryStatus: "learning",
  srsDueAt: null,
  reviewCount: 0,
  mistakeCount: 0,
  createdAt: "2026-06-13T00:00:00.000Z",
  updatedAt: "2026-06-13T00:00:00.000Z",
  deletedAt: null,
};

describe("applyReviewFeedback", () => {
  it("advances known reviews using the V1 interval ladder", () => {
    const result = applyReviewFeedback(base, "known", "2026-06-13T00:00:00.000Z");
    expect(result.next.reviewCount).toBe(1);
    expect(result.next.srsDueAt).toBe("2026-06-14T00:00:00.000Z");
  });

  it("keeps fuzzy reviews on a short interval", () => {
    const result = applyReviewFeedback({ ...base, reviewCount: 3 }, "fuzzy", "2026-06-13T00:00:00.000Z");
    expect(result.next.reviewCount).toBe(3);
    expect(result.next.srsDueAt).toBe("2026-06-16T00:00:00.000Z");
  });

  it("returns unknown reviews to a one-day interval and counts mistakes", () => {
    const result = applyReviewFeedback({ ...base, reviewCount: 4, mistakeCount: 2 }, "unknown", "2026-06-13T00:00:00.000Z");
    expect(result.next.reviewCount).toBe(0);
    expect(result.next.mistakeCount).toBe(3);
    expect(result.next.srsDueAt).toBe("2026-06-14T00:00:00.000Z");
  });
});
```

- [ ] **Step 7: Export domain package**

Create `packages/domain/src/index.ts`:

```ts
export * from "./candidateStatus";
export * from "./srs";
export * from "./types";
```

- [ ] **Step 8: Run domain tests**

Run:

```powershell
pnpm test:domain
```

Expected: all domain tests pass.

- [ ] **Step 9: Commit**

Run:

```powershell
git add packages/domain
git commit -m "feat: add shared domain model and srs logic"
```

Expected: commit succeeds.

---

## Task 3: Build Fixture-Driven Mobile MVP Frontend

**Owner:** Codex local agent

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/index.html`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/styles.css`
- Create: `apps/web/src/fixtures/sampleSegment.ts`
- Create: `apps/web/src/features/reading/ReadingPage.tsx`
- Create: `apps/web/src/features/reading/ExpressionSheet.tsx`
- Create: `apps/web/src/features/review/ReviewPage.tsx`
- Create: `apps/web/src/features/review/reviewState.ts`
- Create: `apps/web/src/lib/highlightText.tsx`
- Create: `apps/web/src/features/reading/ReadingPage.test.tsx`
- Create: `apps/web/src/features/review/reviewState.test.ts`

- [ ] **Step 1: Create frontend package**

Create `apps/web/package.json`:

```json
{
  "name": "@art/web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc --noEmit && vite build",
    "test": "vitest run --environment jsdom",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@art/domain": "workspace:*",
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.3",
    "vite-plugin-pwa": "^0.21.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "jsdom": "^25.0.1",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Add Vite entry files**

Create `apps/web/index.html`:

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

Create `apps/web/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

Create `apps/web/vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "AI Reading Trainer",
        short_name: "Reading Trainer",
        display: "standalone",
        start_url: "/",
        theme_color: "#2563eb",
        background_color: "#f8fafc",
        icons: []
      }
    })
  ],
  server: {
    port: 5173
  }
});
```

- [ ] **Step 3: Add fixture data**

Create `apps/web/src/fixtures/sampleSegment.ts` with one 150-250 word segment, three `selected` candidates, one `backup_candidate`, one `ignored_over_limit`, and two initial review items. Use deterministic IDs such as `candidate-roll-out` and `sense-roll-out`.

The fixture must include these selected expressions:

```ts
export const selectedCandidateIds = [
  "candidate-roll-out",
  "candidate-pick-up-steam",
  "candidate-keep-pace-with",
] as const;
```

- [ ] **Step 4: Implement safe highlighting helper**

Create `apps/web/src/lib/highlightText.tsx`:

```tsx
import type { ReactNode } from "react";
import type { CandidateExpression } from "@art/domain";

interface HighlightOptions {
  text: string;
  candidates: CandidateExpression[];
  onSelect: (candidate: CandidateExpression) => void;
}

export function renderHighlightedText({ text, candidates, onSelect }: HighlightOptions): ReactNode[] {
  const sorted = candidates
    .filter((candidate) => candidate.candidateStatus === "selected")
    .sort((a, b) => text.indexOf(a.expression) - text.indexOf(b.expression));

  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const candidate of sorted) {
    const index = text.indexOf(candidate.expression, cursor);
    if (index < 0) continue;
    if (index > cursor) nodes.push(text.slice(cursor, index));

    nodes.push(
      <button
        className="highlight"
        key={candidate.id}
        type="button"
        onClick={() => onSelect(candidate)}
      >
        {text.slice(index, index + candidate.expression.length)}
      </button>,
    );

    cursor = index + candidate.expression.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}
```

- [ ] **Step 5: Write frontend behavior tests first**

Create `apps/web/src/features/reading/ReadingPage.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReadingPage } from "./ReadingPage";
import { sampleCandidates, sampleSegment } from "../../fixtures/sampleSegment";

describe("ReadingPage", () => {
  it("shows selected highlights and hides more expressions until expanded", async () => {
    render(
      <ReadingPage
        segment={sampleSegment}
        candidates={sampleCandidates}
        onAddToReview={vi.fn()}
        onReadingFeedback={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "roll out" })).toBeInTheDocument();
    expect(screen.queryByText("shore up")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /more expressions/i }));
    expect(screen.getByText("shore up")).toBeInTheDocument();
  });

  it("opens a lightweight layer before the full explanation", async () => {
    render(
      <ReadingPage
        segment={sampleSegment}
        candidates={sampleCandidates}
        onAddToReview={vi.fn()}
        onReadingFeedback={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "roll out" }));
    expect(screen.getByText("推出、发布")).toBeInTheDocument();
    expect(screen.queryByText(/Full sentence/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /expand/i }));
    expect(screen.getByText(/Full sentence/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Implement reading components**

Create `ReadingPage.tsx` and `ExpressionSheet.tsx` so the tests pass. The reading page must:

- Render the original segment text.
- Highlight only `selected` candidates.
- Show `backup_candidate` and `ignored_over_limit` only after the user expands "More expressions".
- Open a bottom sheet or compact panel with lightweight content first.
- Show full explanation only after the user taps expand.

- [ ] **Step 7: Implement review state tests**

Create `apps/web/src/features/review/reviewState.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { applyReviewAction } from "./reviewState";
import { sampleExpressionSenses } from "../../fixtures/sampleSegment";

describe("applyReviewAction", () => {
  it("does not advance SRS from reading known feedback", () => {
    const state = { expressions: sampleExpressionSenses };
    const before = state.expressions[0];
    const after = applyReviewAction(state, {
      source: "reading",
      expressionSenseId: before.id,
      feedback: "known",
      at: "2026-06-13T00:00:00.000Z",
    });

    expect(after.expressions[0].reviewCount).toBe(before.reviewCount);
    expect(after.expressions[0].srsDueAt).toBe(before.srsDueAt);
  });

  it("advances SRS from review known feedback", () => {
    const state = { expressions: sampleExpressionSenses };
    const before = state.expressions[0];
    const after = applyReviewAction(state, {
      source: "review",
      expressionSenseId: before.id,
      feedback: "known",
      at: "2026-06-13T00:00:00.000Z",
    });

    expect(after.expressions[0].reviewCount).toBe(before.reviewCount + 1);
    expect(after.expressions[0].srsDueAt).toBe("2026-06-14T00:00:00.000Z");
  });
});
```

- [ ] **Step 8: Implement review page**

Create `ReviewPage.tsx` with:

- Due expression list.
- One active review card.
- Hidden answer state.
- Feedback buttons: known, fuzzy, unknown.
- A visible confirmation that only review feedback changes the interval.

- [ ] **Step 9: Compose the app**

Create `main.tsx`, `App.tsx`, and `styles.css`.

The app should have three tabs:

- Read
- Review
- Library

The first screen should be the reading experience, not a marketing page.

- [ ] **Step 10: Run frontend tests and build**

Run:

```powershell
pnpm test:web
pnpm --filter @art/web build
```

Expected: tests pass and Vite build succeeds.

- [ ] **Step 11: Run local MVP**

Run:

```powershell
pnpm dev:web
```

Expected: app starts at `http://localhost:5173`.

- [ ] **Step 12: Verify in browser**

Open `http://localhost:5173` and verify:

- Mobile-width layout is readable.
- Highlight tap opens lightweight content first.
- Full explanation is hidden until expanded.
- More expressions are collapsed by default.
- Add to review moves an expression into the review queue.
- Review feedback changes SRS; reading feedback does not.

- [ ] **Step 13: Commit**

Run:

```powershell
git add apps/web packages/domain package.json pnpm-lock.yaml
git commit -m "feat: build fixture-driven reading trainer mvp"
```

Expected: commit succeeds.

---

## Task 4: Add Text Segmentation

**Owner:** Codex local agent

**Files:**
- Create: `packages/domain/src/segmentation.ts`
- Create: `packages/domain/src/segmentation.test.ts`
- Modify: `packages/domain/src/index.ts`

- [ ] **Step 1: Write segmentation tests**

Create `packages/domain/src/segmentation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { segmentArticleText } from "./segmentation";

describe("segmentArticleText", () => {
  it("keeps markdown headings as segment boundaries", () => {
    const text = "# First\n\n" + "word ".repeat(160) + "\n\n# Second\n\n" + "next ".repeat(160);
    const segments = segmentArticleText(text);
    expect(segments).toHaveLength(2);
    expect(segments[0].text.startsWith("# First")).toBe(true);
    expect(segments[1].text.startsWith("# Second")).toBe(true);
  });

  it("splits long paragraph groups near the 150 to 250 word target", () => {
    const text = Array.from({ length: 7 }, (_, index) => `Paragraph ${index}. ` + "word ".repeat(60)).join("\n\n");
    const segments = segmentArticleText(text);
    expect(segments.length).toBeGreaterThan(1);
    expect(segments.every((segment) => segment.wordCount <= 260)).toBe(true);
  });
});
```

- [ ] **Step 2: Implement segmentation**

Create `packages/domain/src/segmentation.ts`:

```ts
export interface SegmentedText {
  sequence: number;
  text: string;
  wordCount: number;
}

const targetMin = 150;
const targetMax = 250;

export function segmentArticleText(input: string): SegmentedText[] {
  const normalized = input.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const headingGroups = splitByMarkdownHeadings(normalized);
  const segments: SegmentedText[] = [];

  for (const group of headingGroups) {
    for (const chunk of splitGroupByParagraphs(group)) {
      segments.push({
        sequence: segments.length,
        text: chunk,
        wordCount: countWords(chunk),
      });
    }
  }

  return segments;
}

function splitByMarkdownHeadings(text: string): string[] {
  const lines = text.split("\n");
  const groups: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (/^#{1,6}\s+/.test(line) && current.length > 0) {
      groups.push(current.join("\n").trim());
      current = [];
    }
    current.push(line);
  }

  if (current.length > 0) groups.push(current.join("\n").trim());
  return groups.filter(Boolean);
}

function splitGroupByParagraphs(group: string): string[] {
  const paragraphs = group.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current: string[] = [];
  let currentWords = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = countWords(paragraph);
    if (currentWords >= targetMin && currentWords + paragraphWords > targetMax) {
      chunks.push(current.join("\n\n"));
      current = [];
      currentWords = 0;
    }
    current.push(paragraph);
    currentWords += paragraphWords;
  }

  if (current.length > 0) chunks.push(current.join("\n\n"));
  return chunks;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
```

- [ ] **Step 3: Export segmentation**

Modify `packages/domain/src/index.ts`:

```ts
export * from "./candidateStatus";
export * from "./segmentation";
export * from "./srs";
export * from "./types";
```

- [ ] **Step 4: Run domain tests**

Run:

```powershell
pnpm test:domain
```

Expected: all domain tests pass.

- [ ] **Step 5: Commit**

Run:

```powershell
git add packages/domain
git commit -m "feat: add article segmentation"
```

Expected: commit succeeds.

---

## Task 5: Add Fastify API Skeleton With Mock Generation

**Owner:** Codex local agent

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/routes/articles.ts`
- Create: `apps/api/src/routes/review.ts`
- Create: `apps/api/src/services/generationService.ts`
- Create: `apps/api/src/ai/provider.ts`
- Create: `apps/api/src/ai/mockProvider.ts`
- Create: `apps/api/src/app.test.ts`

- [ ] **Step 1: Create API package**

Create `apps/api/package.json`:

```json
{
  "name": "@art/api",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc --noEmit",
    "test": "vitest run",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@art/domain": "workspace:*",
    "fastify": "^5.1.0",
    "@fastify/cors": "^10.0.2",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Add Fastify app test**

Create `apps/api/src/app.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildApp } from "./app";

describe("API app", () => {
  it("imports an article and returns first segment generation status", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/articles",
      payload: {
        title: "Sample",
        sourceType: "markdown",
        rawText: "# Heading\n\n" + "word ".repeat(180),
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.article.title).toBe("Sample");
    expect(body.segments[0].generationStatus).toBe("generated");
  });
});
```

- [ ] **Step 3: Implement app factory and article route**

Create `apps/api/src/app.ts`:

```ts
import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerArticleRoutes } from "./routes/articles";
import { registerReviewRoutes } from "./routes/review";

export function buildApp() {
  const app = Fastify({ logger: true });
  app.register(cors, { origin: true });
  app.register(registerArticleRoutes);
  app.register(registerReviewRoutes);
  return app;
}
```

Create `apps/api/src/server.ts`:

```ts
import { buildApp } from "./app";

const app = buildApp();
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

await app.listen({ port, host });
```

Create `apps/api/src/routes/articles.ts` with a `POST /articles` route using `segmentArticleText` and the mock provider.

- [ ] **Step 4: Implement mock AI provider boundary**

Create `apps/api/src/ai/provider.ts`:

```ts
import type { CandidateExpression, Segment } from "@art/domain";

export interface AiGenerationResult {
  candidates: CandidateExpression[];
}

export interface AiProvider {
  generateSegment(segment: Segment): Promise<AiGenerationResult>;
}
```

Create `apps/api/src/ai/mockProvider.ts`:

```ts
import type { AiProvider } from "./provider";

export function createMockProvider(): AiProvider {
  return {
    async generateSegment(segment) {
      const generatedAt = new Date("2026-06-13T00:00:00.000Z").toISOString();
      return {
        candidates: [
          {
            id: `candidate-${segment.id}-roll-out`,
            userId: segment.userId,
            articleId: segment.articleId,
            segmentId: segment.id,
            expression: "roll out",
            normalizedForm: "roll out",
            type: "phrasal_verb",
            meaningZh: "推出、发布",
            localMeaning: "make a new service available",
            sentence: segment.text.split(".")[0] + ".",
            sentenceTranslation: "该句说明一项服务被推出。",
            syntaxHint: "Main action: teams roll out a service.",
            difficulty: "B2",
            valueScore: 92,
            candidateStatus: "selected",
            statusReason: "High-value phrasal verb in product and policy writing.",
            occurrenceCount: 1,
            modelProvider: "mock",
            modelName: "mock-v1",
            promptVersion: "prompt-v1",
            generationVersion: "generation-v1",
            generatedAt,
          },
        ],
      };
    },
  };
}
```

- [ ] **Step 5: Run API tests**

Run:

```powershell
pnpm test:api
```

Expected: API tests pass.

- [ ] **Step 6: Commit**

Run:

```powershell
git add apps/api packages/domain package.json pnpm-lock.yaml
git commit -m "feat: add fastify api skeleton"
```

Expected: commit succeeds.

---

## Task 6: Add PostgreSQL Schema

**Owner:** Codex local agent

**Files:**
- Create: `apps/api/src/db/schema.sql`
- Create: `apps/api/src/db/schema.test.ts`
- Create: `docs/development/database.md`

- [ ] **Step 1: Write schema file**

Create `apps/api/src/db/schema.sql` with tables:

- `articles`
- `segments`
- `candidate_expressions`
- `expression_senses`
- `occurrences`
- `review_logs`
- `client_operations`

Required constraints:

- `client_operations.client_operation_id` unique.
- `expression_senses` unique on `user_id`, `normalized_form`, `type`, `meaning_zh` where `deleted_at is null`.
- Candidate status check limited to the five V1 statuses.
- Generation status check limited to the five V1 statuses.

- [ ] **Step 2: Add schema smoke test**

Create `apps/api/src/db/schema.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("database schema", () => {
  const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

  it("enforces idempotent client operations", () => {
    expect(schema).toContain("client_operation_id");
    expect(schema).toContain("unique");
  });

  it("stores generation version metadata", () => {
    expect(schema).toContain("model_provider");
    expect(schema).toContain("model_name");
    expect(schema).toContain("prompt_version");
    expect(schema).toContain("generation_version");
  });

  it("separates expression senses from occurrences", () => {
    expect(schema).toContain("create table expression_senses");
    expect(schema).toContain("create table occurrences");
  });
});
```

- [ ] **Step 3: Document local database setup**

Create `docs/development/database.md` with:

```md
# Local Database

PostgreSQL is the authoritative database for V1.

Required environment variables:

```text
DATABASE_URL=postgres://user:password@localhost:5432/ai_reading_trainer
```

Apply schema:

```powershell
psql $env:DATABASE_URL -f apps/api/src/db/schema.sql
```
```

- [ ] **Step 4: Run API tests**

Run:

```powershell
pnpm test:api
```

Expected: schema smoke tests pass.

- [ ] **Step 5: Commit**

Run:

```powershell
git add apps/api/src/db docs/development/database.md
git commit -m "feat: add postgres schema"
```

Expected: commit succeeds.

---

## Task 7: Add IndexedDB Cache and Operation Queue

**Owner:** Codex local agent

**Files:**
- Create: `apps/web/src/storage/db.ts`
- Create: `apps/web/src/storage/operationQueue.ts`
- Create: `apps/web/src/storage/operationQueue.test.ts`
- Modify: `apps/web/src/features/reading/ReadingPage.tsx`
- Modify: `apps/web/src/features/review/ReviewPage.tsx`

- [ ] **Step 1: Add operation queue tests**

Create `apps/web/src/storage/operationQueue.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createClientOperation } from "./operationQueue";

describe("createClientOperation", () => {
  it("creates an idempotent operation with a client operation id", () => {
    const operation = createClientOperation({
      userId: "user-1",
      operationType: "reading.add_to_review",
      targetType: "candidate_expression",
      targetId: "candidate-roll-out",
      payload: { expressionSenseId: "sense-roll-out" },
      now: "2026-06-13T00:00:00.000Z",
    });

    expect(operation.clientOperationId).toMatch(/^client-op-/);
    expect(operation.syncStatus).toBe("pending");
    expect(operation.clientCreatedAt).toBe("2026-06-13T00:00:00.000Z");
  });
});
```

- [ ] **Step 2: Implement operation creation**

Create `apps/web/src/storage/operationQueue.ts`:

```ts
import type { ClientOperation } from "@art/domain";

interface CreateOperationInput {
  userId: string;
  operationType: string;
  targetType: string;
  targetId: string;
  payload: Record<string, unknown>;
  now: string;
}

export function createClientOperation(input: CreateOperationInput): ClientOperation {
  return {
    clientOperationId: `client-op-${crypto.randomUUID()}`,
    userId: input.userId,
    operationType: input.operationType,
    targetType: input.targetType,
    targetId: input.targetId,
    payload: input.payload,
    clientCreatedAt: input.now,
    syncStatus: "pending",
    serverAppliedAt: null,
  };
}
```

- [ ] **Step 3: Add IndexedDB wrapper**

Create `apps/web/src/storage/db.ts` with object stores:

- `segments`
- `candidateExpressions`
- `expressionSenses`
- `occurrences`
- `clientOperations`

Use native IndexedDB APIs. Store version should be `1`.

- [ ] **Step 4: Wire reading actions to operation queue**

Modify reading actions so `add_to_review`, `known`, `too_easy`, and `bad_explanation` create pending operations.

- [ ] **Step 5: Run frontend tests**

Run:

```powershell
pnpm test:web
```

Expected: frontend tests pass.

- [ ] **Step 6: Commit**

Run:

```powershell
git add apps/web/src/storage apps/web/src/features
git commit -m "feat: add offline operation queue"
```

Expected: commit succeeds.

---

## Task 8: Add Sync API Contract

**Owner:** Codex local agent

**Files:**
- Create: `apps/api/src/routes/sync.ts`
- Create: `apps/api/src/services/syncService.ts`
- Create: `apps/api/src/services/syncService.test.ts`
- Modify: `apps/api/src/app.ts`

- [ ] **Step 1: Test idempotent sync**

Create `apps/api/src/services/syncService.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { applyClientOperationsInMemory } from "./syncService";

describe("applyClientOperationsInMemory", () => {
  it("applies duplicate client operations only once", () => {
    const operation = {
      clientOperationId: "client-op-1",
      userId: "user-1",
      operationType: "reading.add_to_review",
      targetType: "candidate_expression",
      targetId: "candidate-roll-out",
      payload: { expressionSenseId: "sense-roll-out" },
      clientCreatedAt: "2026-06-13T00:00:00.000Z",
      syncStatus: "pending" as const,
      serverAppliedAt: null,
    };

    const result = applyClientOperationsInMemory([operation, operation]);
    expect(result.applied).toHaveLength(1);
    expect(result.ignoredDuplicateIds).toEqual(["client-op-1"]);
  });
});
```

- [ ] **Step 2: Implement in-memory sync service**

Create `apps/api/src/services/syncService.ts`:

```ts
import type { ClientOperation } from "@art/domain";

export function applyClientOperationsInMemory(operations: ClientOperation[]) {
  const seen = new Set<string>();
  const applied: ClientOperation[] = [];
  const ignoredDuplicateIds: string[] = [];

  for (const operation of [...operations].sort((a, b) => a.clientCreatedAt.localeCompare(b.clientCreatedAt))) {
    if (seen.has(operation.clientOperationId)) {
      ignoredDuplicateIds.push(operation.clientOperationId);
      continue;
    }
    seen.add(operation.clientOperationId);
    applied.push({ ...operation, syncStatus: "synced", serverAppliedAt: new Date().toISOString() });
  }

  return { applied, ignoredDuplicateIds };
}
```

- [ ] **Step 3: Add `POST /sync` route**

Create `apps/api/src/routes/sync.ts` and register it in `app.ts`. The route accepts an array of `ClientOperation` objects and returns applied operation IDs plus ignored duplicate IDs.

- [ ] **Step 4: Run API tests**

Run:

```powershell
pnpm test:api
```

Expected: sync tests pass.

- [ ] **Step 5: Commit**

Run:

```powershell
git add apps/api/src/routes/sync.ts apps/api/src/services/syncService.ts apps/api/src/services/syncService.test.ts apps/api/src/app.ts
git commit -m "feat: add idempotent sync contract"
```

Expected: commit succeeds.

---

## Task 9: Add AI Provider Interface and Real Provider Boundary

**Owner:** Codex local agent

**Files:**
- Modify: `apps/api/src/ai/provider.ts`
- Create: `apps/api/src/ai/openAiCompatibleProvider.ts`
- Create: `apps/api/src/ai/openAiCompatibleProvider.test.ts`
- Create: `apps/api/src/config.ts`
- Modify: `apps/api/src/services/generationService.ts`

- [ ] **Step 1: Test provider request construction**

Create `apps/api/src/ai/openAiCompatibleProvider.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildGenerationPrompt } from "./openAiCompatibleProvider";

describe("buildGenerationPrompt", () => {
  it("includes the five V1 candidate statuses and generation requirements", () => {
    const prompt = buildGenerationPrompt("A team will roll out the service next month.");
    expect(prompt).toContain("selected");
    expect(prompt).toContain("backup_candidate");
    expect(prompt).toContain("ignored_too_easy");
    expect(prompt).toContain("ignored_duplicate");
    expect(prompt).toContain("ignored_over_limit");
    expect(prompt).toContain("local_meaning");
    expect(prompt).toContain("generation_version");
  });
});
```

- [ ] **Step 2: Implement prompt builder and provider shell**

Create `apps/api/src/ai/openAiCompatibleProvider.ts`:

```ts
export function buildGenerationPrompt(segmentText: string): string {
  return [
    "Analyze this English reading segment for an adult Chinese-speaking English learner.",
    "Return JSON only.",
    "Candidate statuses must be one of: selected, backup_candidate, ignored_too_easy, ignored_duplicate, ignored_over_limit.",
    "Each candidate must include expression, normalized_form, type, meaning_zh, local_meaning, sentence, sentence_translation, difficulty, value_score, candidate_status, status_reason, syntax_hint.",
    "Include model_provider, model_name, prompt_version, generation_version, generated_at in metadata.",
    "Do not create permanent sentence cards. SRS will schedule ExpressionSense only.",
    "Segment:",
    segmentText,
  ].join("\n");
}
```

- [ ] **Step 3: Add config**

Create `apps/api/src/config.ts`:

```ts
export interface ApiConfig {
  aiProvider: "mock" | "openai_compatible";
  aiBaseUrl: string | null;
  aiApiKey: string | null;
  aiModel: string | null;
}

export function loadConfig(): ApiConfig {
  return {
    aiProvider: (process.env.AI_PROVIDER as ApiConfig["aiProvider"]) ?? "mock",
    aiBaseUrl: process.env.AI_BASE_URL ?? null,
    aiApiKey: process.env.AI_API_KEY ?? null,
    aiModel: process.env.AI_MODEL ?? null,
  };
}
```

- [ ] **Step 4: Keep mock provider as default**

Modify generation service so local development uses `mock` unless environment variables choose the real provider.

- [ ] **Step 5: Run API tests**

Run:

```powershell
pnpm test:api
```

Expected: provider tests pass without a real API key.

- [ ] **Step 6: Commit**

Run:

```powershell
git add apps/api/src/ai apps/api/src/config.ts apps/api/src/services/generationService.ts
git commit -m "feat: add ai provider boundary"
```

Expected: commit succeeds.

---

## Task 10: Local End-to-End Verification

**Owner:** Codex local agent

**Files:**
- Create: `docs/development/local-mvp.md`
- Modify: `package.json`

- [ ] **Step 1: Add local run documentation**

Create `docs/development/local-mvp.md`:

```md
# Local MVP

Run the fixture-driven mobile MVP:

```powershell
pnpm install
pnpm dev:web
```

Open:

```text
http://localhost:5173
```

Verify:

- The reading page opens first.
- The passage has 2-4 main highlights.
- Tapping a highlight shows expression, type, and short local meaning first.
- Full explanation appears only after expanding.
- More expressions are collapsed by default.
- Reading feedback does not advance SRS.
- Review feedback advances SRS.
```

- [ ] **Step 2: Run all tests**

Run:

```powershell
pnpm test
pnpm build
```

Expected: all packages pass tests and type checks.

- [ ] **Step 3: Browser verification**

Open the local MVP and inspect both:

- Desktop browser at normal width.
- Mobile viewport around 390px wide.

Expected: no overlapping text, no full-card dictionary behavior on first tap, and the review tab can complete one card.

- [ ] **Step 4: Commit**

Run:

```powershell
git add docs/development/local-mvp.md package.json
git commit -m "docs: add local mvp verification guide"
```

Expected: commit succeeds.

---

## Task 11: Server Agent Handoff

**Owner:** Codex local agent writes the handoff; Server Agent executes deployment.

**Files:**
- Create: `docs/deployment/server-agent-handoff.md`
- Create: `.env.example`

- [ ] **Step 1: Create `.env.example`**

Create `.env.example`:

```text
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgres://user:password@localhost:5432/ai_reading_trainer
AI_PROVIDER=mock
AI_BASE_URL=
AI_API_KEY=
AI_MODEL=
WEB_ORIGIN=https://example.com
```

- [ ] **Step 2: Write server handoff checklist**

Create `docs/deployment/server-agent-handoff.md`:

```md
# Server Agent Handoff

The server Agent owns deployment and operations.

## Required runtime

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

## Deployment steps

1. Clone or pull the repository.
2. Install dependencies with `pnpm install --frozen-lockfile`.
3. Build with `pnpm build`.
4. Apply database schema from `apps/api/src/db/schema.sql`.
5. Start API with `pnpm --filter @art/api start` after a production start script exists.
6. Serve frontend build from `apps/web/dist`.
7. Configure HTTPS.
8. Configure logs and restart policy.
9. Configure daily PostgreSQL backups.

## Smoke test

- Open the public web URL.
- Import or load the sample article.
- Open the first segment.
- Add one expression to review.
- Complete one review card.
- Confirm API logs show no errors.
```

- [ ] **Step 3: Commit**

Run:

```powershell
git add .env.example docs/deployment/server-agent-handoff.md
git commit -m "docs: add server deployment handoff"
```

Expected: commit succeeds.

---

## Task 12: Enrich Review Cards and Add Card Library

**Owner:** Codex local agent

**Reason:** First MVP review showed that review cards are too thin for a learning-first product. The app also needs a card library, not only an article/library placeholder.

**Files:**
- Modify: `apps/web/src/fixtures/sampleSegment.ts`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/src/features/review/ReviewPage.tsx`
- Create: `apps/web/src/features/cards/CardLibraryPage.tsx`
- Create: `apps/web/src/features/cards/CardDetailSheet.tsx`
- Create: `apps/web/src/features/cards/CardLibraryPage.test.tsx`
- Modify: `apps/web/src/features/review/ReviewPage.test.tsx`

- [x] **Step 1: Add failing review card behavior test**

Create or update `apps/web/src/features/review/ReviewPage.test.tsx`:

```tsx
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sampleExpressionSenses, sampleOccurrences } from "../../fixtures/sampleSegment";
import { ReviewPage } from "./ReviewPage";

afterEach(() => cleanup());

describe("ReviewPage", () => {
  it("keeps learning details hidden until answer reveal", async () => {
    render(
      <ReviewPage
        expressions={sampleExpressionSenses}
        occurrences={sampleOccurrences}
        activeReviewIds={["sense-roll-out"]}
        onReview={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "roll out" })).toBeInTheDocument();
    expect(screen.queryByText("Local meaning")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Show answer" }));

    expect(screen.getByText("Local meaning")).toBeInTheDocument();
    expect(screen.getByText("Original sentence")).toBeInTheDocument();
    expect(screen.getByText("Usage hint")).toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
  });
});
```

- [x] **Step 2: Run review test and verify it fails**

Run:

```powershell
corepack pnpm --filter @art/web test -- src/features/review/ReviewPage.test.tsx
```

Expected: fails because rich answer labels are not rendered yet.

- [x] **Step 3: Implement richer review answer surface**

Modify `ReviewPage.tsx` so the hidden answer reveals:

- Chinese meaning
- Local meaning
- Original sentence
- Sentence translation
- Syntax or usage hint
- Type and difficulty
- Source segment
- Review count and mistake count

Keep the recall prompt compact before the answer is revealed.

- [x] **Step 4: Add failing card library test**

Create `apps/web/src/features/cards/CardLibraryPage.test.tsx`:

```tsx
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { sampleExpressionSenses, sampleOccurrences } from "../../fixtures/sampleSegment";
import { CardLibraryPage } from "./CardLibraryPage";

afterEach(() => cleanup());

describe("CardLibraryPage", () => {
  it("lists expression sense cards and opens occurrence evidence", async () => {
    render(
      <CardLibraryPage
        expressions={sampleExpressionSenses}
        occurrences={sampleOccurrences}
      />,
    );

    expect(screen.getByRole("heading", { name: "Card Library" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /roll out/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /roll out/i }));

    expect(screen.getByText("Occurrence evidence")).toBeInTheDocument();
    expect(screen.getByText(/When the city began to roll out/i)).toBeInTheDocument();
  });
});
```

- [x] **Step 5: Run card library test and verify it fails**

Run:

```powershell
corepack pnpm --filter @art/web test -- src/features/cards/CardLibraryPage.test.tsx
```

Expected: fails because `CardLibraryPage` does not exist.

- [x] **Step 6: Implement card library UI**

Create:

- `CardLibraryPage.tsx`: lists `ExpressionSense` cards with type, meaning, mastery, due state, review count.
- `CardDetailSheet.tsx`: shows all matching `Occurrence` evidence and source segment/article context.

The page must list `ExpressionSense`, not sentence cards.

- [x] **Step 7: Wire app navigation**

Modify `App.tsx` so the bottom navigation has four tabs:

- Read
- Review
- Cards
- Articles

The current static `Library` page becomes the article/import area.

- [x] **Step 8: Run web tests and build**

Run:

```powershell
corepack pnpm test:web
corepack pnpm --filter @art/web build
```

Expected: tests and build pass.

- [x] **Step 9: Browser verify**

Open `http://localhost:5173`.

Verify:

- Review answer reveal is richer than translation only.
- Card Library lists expression cards.
- Card detail shows occurrence evidence.
- Article library/import area remains separate from card library.

- [x] **Step 10: Commit**

Run:

```powershell
git add apps/web
git commit -m "feat: enrich review cards and add card library"
```

Expected: commit succeeds.

---

## Task 13: Add Visible TXT/Markdown Import Entry Point

**Owner:** Codex local agent

**Reason:** TXT/Markdown import is a V1 requirement. The current MVP has only a static fixture library screen.

**Files:**
- Modify: `apps/web/src/features/import/ImportPage.tsx`
- Create: `apps/web/src/features/import/ImportPage.test.tsx`
- Modify: `apps/web/src/styles.css`

- [ ] **Step 1: Add failing import UI test**

Create `apps/web/src/features/import/ImportPage.test.tsx`:

```tsx
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ImportPage } from "./ImportPage";

afterEach(() => cleanup());

describe("ImportPage", () => {
  it("shows a TXT or Markdown import entry point", () => {
    render(<ImportPage />);

    expect(screen.getByRole("heading", { name: "Articles" })).toBeInTheDocument();
    expect(screen.getByLabelText("Import TXT or Markdown article")).toBeInTheDocument();
    expect(screen.getByText("First segment starts first")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run import test and verify it fails**

Run:

```powershell
corepack pnpm --filter @art/web test -- src/features/import/ImportPage.test.tsx
```

Expected: fails because the import input is not present.

- [ ] **Step 3: Implement fixture-mode import UI**

Modify `ImportPage.tsx` to show:

- File input accepting `.txt`, `.md`, `.markdown`, and `text/plain`
- Import state copy for fixture mode
- Segment generation states: first segment generated, later segments preparing
- Existing sample article row

This task does not parse real files yet. It makes the V1 import affordance visible before backend import exists.

- [ ] **Step 4: Run tests and build**

Run:

```powershell
corepack pnpm test:web
corepack pnpm --filter @art/web build
```

Expected: tests and build pass.

- [ ] **Step 5: Browser verify**

Open `http://localhost:5173` and go to Articles.

Verify:

- There is a visible TXT/Markdown import control.
- It is clear that first segment generation is prioritized.
- The static sample article is still available.

- [ ] **Step 6: Commit**

Run:

```powershell
git add apps/web/src/features/import apps/web/src/styles.css
git commit -m "feat: add article import entry point"
```

Expected: commit succeeds.

---

## Task 14: Add Manual Selection AI Card Generation Mock Flow

**Owner:** Codex local agent

**Reason:** Learners need agency when AI did not highlight a word or phrase they personally need. The learner selects text; the system generates card candidates via AI. Local MVP starts with deterministic mock generation.

**Files:**
- Modify: `apps/web/src/features/reading/ReadingPage.tsx`
- Create: `apps/web/src/features/reading/SelectionToolbar.tsx`
- Create: `apps/web/src/features/reading/GeneratedCardDraftSheet.tsx`
- Create: `apps/web/src/features/reading/manualSelection.ts`
- Create: `apps/web/src/features/reading/manualSelection.test.ts`
- Modify: `apps/web/src/fixtures/sampleSegment.ts`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/styles.css`

- [ ] **Step 1: Add failing manual selection unit test**

Create `apps/web/src/features/reading/manualSelection.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildManualSelectionDraft } from "./manualSelection";

describe("buildManualSelectionDraft", () => {
  it("creates an AI-generated draft from selected text and sentence context", () => {
    const draft = buildManualSelectionDraft({
      selectedText: "all at once",
      sentence: "Teachers noticed that momentum did not arrive all at once.",
      articleId: "article-sample",
      segmentId: "segment-1",
      generatedAt: "2026-06-13T00:00:00.000Z",
    });

    expect(draft.expression).toBe("all at once");
    expect(draft.localMeaning).toBe("suddenly or together in this sentence");
    expect(draft.modelProvider).toBe("mock");
    expect(draft.generationVersion).toBe("manual-selection-v1");
  });
});
```

- [ ] **Step 2: Run manual selection test and verify it fails**

Run:

```powershell
corepack pnpm --filter @art/web test -- src/features/reading/manualSelection.test.ts
```

Expected: fails because `manualSelection.ts` does not exist.

- [ ] **Step 3: Implement deterministic local draft builder**

Create `manualSelection.ts` with a pure function that returns a `CandidateExpression` draft using:

- `candidateStatus: "backup_candidate"`
- `modelProvider: "mock"`
- `modelName: "manual-selection-mock-v1"`
- `promptVersion: "manual-selection-prompt-v1"`
- `generationVersion: "manual-selection-v1"`

This is a local stand-in for the future backend LLM call.

- [ ] **Step 4: Add failing selection toolbar and draft sheet tests**

Create `apps/web/src/features/reading/SelectionToolbar.test.tsx`:

```tsx
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SelectionToolbar } from "./SelectionToolbar";

afterEach(() => cleanup());

describe("SelectionToolbar", () => {
  it("requests card generation for selected text", async () => {
    const onGenerate = vi.fn();

    render(<SelectionToolbar selectedText="all at once" onGenerate={onGenerate} />);

    await userEvent.click(screen.getByRole("button", { name: "Generate card" }));

    expect(onGenerate).toHaveBeenCalledWith("all at once");
  });
});
```

Create `apps/web/src/features/reading/GeneratedCardDraftSheet.test.tsx`:

```tsx
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildManualSelectionDraft } from "./manualSelection";
import { GeneratedCardDraftSheet } from "./GeneratedCardDraftSheet";

afterEach(() => cleanup());

describe("GeneratedCardDraftSheet", () => {
  it("shows generated metadata and allows accepting the draft", async () => {
    const draft = buildManualSelectionDraft({
      selectedText: "all at once",
      sentence: "Teachers noticed that momentum did not arrive all at once.",
      articleId: "article-sample",
      segmentId: "segment-1",
      generatedAt: "2026-06-13T00:00:00.000Z",
    });
    const onAccept = vi.fn();

    render(<GeneratedCardDraftSheet draft={draft} onAccept={onAccept} onDismiss={vi.fn()} />);

    expect(screen.getByText("manual-selection-mock-v1")).toBeInTheDocument();
    expect(screen.getByText("manual-selection-v1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Add to review" }));

    expect(onAccept).toHaveBeenCalledWith(draft);
  });
});
```

These component tests cover the selection-generation UI contract. `ReadingPage` still needs browser verification for native text selection because jsdom selection APIs are not reliable enough for the full gesture.

- [ ] **Step 5: Run selection UI tests and verify they fail**

Run:

```powershell
corepack pnpm --filter @art/web test -- src/features/reading/SelectionToolbar.test.tsx src/features/reading/GeneratedCardDraftSheet.test.tsx
```

Expected: fails because the components do not exist.

- [ ] **Step 6: Implement selection toolbar and draft sheet**

Create:

- `SelectionToolbar.tsx`: receives selected text and has a `Generate card` button.
- `GeneratedCardDraftSheet.tsx`: shows generated expression, type, local meaning, Chinese explanation, sentence, generation metadata, and actions `Add to review` / `Dismiss`.

Modify `ReadingPage.tsx` to listen for text selection inside the passage and show the toolbar near the lower edge of the reading area.

- [ ] **Step 7: Wire draft acceptance**

Modify `App.tsx` so accepting a generated draft creates or activates a fixture `ExpressionSense` and adds it to review. In the mock MVP, support at least `all at once` as a deterministic generated card.

- [ ] **Step 8: Add browser-verifiable reading selection behavior**

Modify `ReadingPage.tsx` so that when the browser selection is inside the passage and the selected text is non-empty:

- The selected text is stored in component state.
- `SelectionToolbar` appears.
- Clicking `Generate card` builds the deterministic draft.
- `GeneratedCardDraftSheet` opens.

- [ ] **Step 9: Run tests and build**

Run:

```powershell
corepack pnpm test:web
corepack pnpm --filter @art/web build
```

Expected: tests and build pass.

- [ ] **Step 10: Browser verify**

Open `http://localhost:5173`.

Verify:

- Select the text `all at once`.
- A `Generate card` action appears.
- Generated draft shows metadata and explanation.
- Accepting the draft adds it to Review/Cards.

- [ ] **Step 11: Commit**

Run:

```powershell
git add apps/web
git commit -m "feat: add manual selection card generation mock"
```

Expected: commit succeeds.

---

## Task 15: Add Backend Manual Selection AI Contract

**Owner:** Codex local agent

**Reason:** Manual selection is ultimately LLM-backed, not local manual entry. The backend owns prompt construction, provider calls, generation metadata, idempotency, and persistence.

**Dependencies:** Execute after Task 5 and Task 9, because it needs the Fastify app and AI provider boundary.

**Files:**
- Modify: `apps/api/src/ai/provider.ts`
- Modify: `apps/api/src/ai/mockProvider.ts`
- Modify: `apps/api/src/ai/openAiCompatibleProvider.ts`
- Create: `apps/api/src/routes/manualSelection.ts`
- Create: `apps/api/src/services/manualSelectionService.ts`
- Create: `apps/api/src/services/manualSelectionService.test.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `apps/api/src/db/schema.sql`
- Modify: `apps/api/src/db/schema.test.ts`
- Modify: `packages/domain/src/types.ts`

- [ ] **Step 1: Add manual selection generation types**

Modify `packages/domain/src/types.ts` to add:

```ts
export interface ManualSelectionGenerationRequest {
  clientOperationId: string;
  userId: string;
  articleId: string;
  segmentId: string;
  selectedText: string;
  sentence: string;
  context: string;
  clientCreatedAt: string;
}

export interface ManualSelectionGenerationDraft {
  candidate: CandidateExpression;
  duplicateExpressionSenseId: string | null;
  recommendation: "add" | "merge" | "reject";
  recommendationReason: string;
}
```

- [ ] **Step 2: Add failing service test**

Create `apps/api/src/services/manualSelectionService.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generateManualSelectionDraft } from "./manualSelectionService";
import { createMockProvider } from "../ai/mockProvider";

describe("generateManualSelectionDraft", () => {
  it("generates a draft with model metadata from learner-selected text", async () => {
    const result = await generateManualSelectionDraft({
      provider: createMockProvider(),
      request: {
        clientOperationId: "client-op-selection-1",
        userId: "user-1",
        articleId: "article-1",
        segmentId: "segment-1",
        selectedText: "all at once",
        sentence: "Teachers noticed that momentum did not arrive all at once.",
        context: "Teachers noticed that momentum did not arrive all at once.",
        clientCreatedAt: "2026-06-13T00:00:00.000Z",
      },
    });

    expect(result.candidate.expression).toBe("all at once");
    expect(result.candidate.modelProvider).toBe("mock");
    expect(result.candidate.generationVersion).toBe("manual-selection-v1");
    expect(result.recommendation).toBe("add");
  });
});
```

- [ ] **Step 3: Run service test and verify it fails**

Run:

```powershell
corepack pnpm test:api -- src/services/manualSelectionService.test.ts
```

Expected: fails because the service does not exist.

- [ ] **Step 4: Extend AI provider interface**

Modify `provider.ts` so `AiProvider` supports:

```ts
generateManualSelectionDraft(request: ManualSelectionGenerationRequest): Promise<ManualSelectionGenerationDraft>;
```

- [ ] **Step 5: Implement mock provider manual selection**

Modify `mockProvider.ts` so selected text `all at once` returns a deterministic draft with generation metadata and recommendation `add`.

- [ ] **Step 6: Implement service**

Create `manualSelectionService.ts` as a thin orchestration layer:

- Validates non-empty selected text.
- Calls `provider.generateManualSelectionDraft`.
- Preserves `clientOperationId`.
- Returns one draft.

- [ ] **Step 7: Add API route**

Create `routes/manualSelection.ts` with:

```text
POST /manual-selection/generate
```

Request body is `ManualSelectionGenerationRequest`. Response body is `ManualSelectionGenerationDraft`.

Register the route in `app.ts`.

- [ ] **Step 8: Extend schema**

Modify `schema.sql` to add `ai_generation_jobs` with source type `segment_preselection` or `manual_selection`, `client_operation_id`, selected text, sentence, context, status, and model metadata.

Update `schema.test.ts` to assert:

- `ai_generation_jobs` exists.
- `manual_selection` appears in the schema.
- `client_operation_id` is present.
- model metadata fields are present.

- [ ] **Step 9: Run API tests**

Run:

```powershell
corepack pnpm test:api
```

Expected: API tests pass.

- [ ] **Step 10: Commit**

Run:

```powershell
git add packages/domain apps/api
git commit -m "feat: add manual selection ai generation contract"
```

Expected: commit succeeds.

---

## Task 16: Add Context-Entry AI Card Generation Mock Flow

**Owner:** Codex local agent

**Reason:** Learners also meet words outside imported articles, such as in games, programming documentation, work messages, or videos. They should be able to enter the expression and context, then let AI generate the card. This is not raw manual card authoring.

**Dependencies:** Execute after Task 12 so the Card Library exists, and after Task 14 so the app already has a generated-card acceptance pattern.

**Files:**
- Create: `apps/web/src/features/cards/contextGeneration.ts`
- Create: `apps/web/src/features/cards/contextGeneration.test.ts`
- Create: `apps/web/src/features/cards/ContextCardGenerator.tsx`
- Create: `apps/web/src/features/cards/ContextCardGenerator.test.tsx`
- Modify: `apps/web/src/features/cards/CardLibraryPage.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/styles.css`

- [ ] **Step 1: Add failing context generation unit test**

Create `apps/web/src/features/cards/contextGeneration.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildContextEntryDraft } from "./contextGeneration";

describe("buildContextEntryDraft", () => {
  it("creates an AI-generated draft from an expression and real-world context", () => {
    const draft = buildContextEntryDraft({
      expression: "buff",
      contextLabel: "game",
      contextNote: "I saw this word in an RPG item description.",
      generatedAt: "2026-06-13T00:00:00.000Z",
    });

    expect(draft.expression).toBe("buff");
    expect(draft.localMeaning).toBe("a temporary improvement or boost in a game context");
    expect(draft.modelProvider).toBe("mock");
    expect(draft.modelName).toBe("context-entry-mock-v1");
    expect(draft.generationVersion).toBe("context-entry-v1");
  });
});
```

- [ ] **Step 2: Run context generation test and verify it fails**

Run:

```powershell
corepack pnpm --filter @art/web test -- src/features/cards/contextGeneration.test.ts
```

Expected: fails because `contextGeneration.ts` does not exist.

- [ ] **Step 3: Implement deterministic context draft builder**

Create `apps/web/src/features/cards/contextGeneration.ts`:

The current local `CandidateExpression` type still requires `articleId` and `segmentId`, so the fixture draft uses `"context-entry"` placeholders. Do not treat these as real article sources. When accepting the draft into an `Occurrence`, mark the occurrence source as context-entry in UI state and later in the backend schema.

```ts
import type { CandidateExpression } from "@art/domain";

interface ContextEntryDraftInput {
  expression: string;
  contextLabel: string;
  contextNote: string;
  generatedAt: string;
}

export function buildContextEntryDraft(input: ContextEntryDraftInput): CandidateExpression {
  const expression = input.expression.trim();
  const contextLabel = input.contextLabel.trim() || "real-world context";
  const contextNote = input.contextNote.trim();

  return {
    id: `context-draft-${expression.toLowerCase().replaceAll(" ", "-")}`,
    userId: "user-1",
    articleId: "context-entry",
    segmentId: "context-entry",
    expression,
    normalizedForm: expression.toLowerCase(),
    type: "other",
    meaningZh: meaningFor(expression, contextLabel),
    localMeaning: localMeaningFor(expression, contextLabel),
    sentence: exampleFor(expression, contextLabel),
    sentenceTranslation: translationFor(expression, contextLabel),
    syntaxHint: contextNote ? `Source context: ${contextNote}` : `Source context: ${contextLabel}`,
    difficulty: "B1",
    valueScore: 0.7,
    candidateStatus: "backup_candidate",
    statusReason: `Generated from learner-entered ${contextLabel} context.`,
    occurrenceCount: 1,
    modelProvider: "mock",
    modelName: "context-entry-mock-v1",
    promptVersion: "context-entry-prompt-v1",
    generationVersion: "context-entry-v1",
    generatedAt: input.generatedAt,
  };
}

function meaningFor(expression: string, contextLabel: string): string {
  if (expression.toLowerCase() === "buff" && contextLabel.toLowerCase().includes("game")) {
    return "增益、强化效果";
  }
  return "根据场景生成的含义";
}

function localMeaningFor(expression: string, contextLabel: string): string {
  if (expression.toLowerCase() === "buff" && contextLabel.toLowerCase().includes("game")) {
    return "a temporary improvement or boost in a game context";
  }
  return `meaning inferred from ${contextLabel} context`;
}

function exampleFor(expression: string, contextLabel: string): string {
  if (expression.toLowerCase() === "buff" && contextLabel.toLowerCase().includes("game")) {
    return "This potion gives your character a short attack buff.";
  }
  return `I noticed "${expression}" in a ${contextLabel} context.`;
}

function translationFor(expression: string, contextLabel: string): string {
  if (expression.toLowerCase() === "buff" && contextLabel.toLowerCase().includes("game")) {
    return "这瓶药水会给你的角色一个短暂的攻击增益。";
  }
  return `我在${contextLabel}场景中注意到了“${expression}”。`;
}
```

- [ ] **Step 4: Add failing component test**

Create `apps/web/src/features/cards/ContextCardGenerator.test.tsx`:

```tsx
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContextCardGenerator } from "./ContextCardGenerator";

afterEach(() => cleanup());

describe("ContextCardGenerator", () => {
  it("generates and accepts a card draft from learner-entered context", async () => {
    const onAccept = vi.fn();

    render(<ContextCardGenerator onAccept={onAccept} />);

    await userEvent.type(screen.getByLabelText("Expression"), "buff");
    await userEvent.type(screen.getByLabelText("Context"), "game");
    await userEvent.type(screen.getByLabelText("Where did you see it?"), "RPG item description");
    await userEvent.click(screen.getByRole("button", { name: "Generate card" }));

    expect(screen.getByText("context-entry-mock-v1")).toBeInTheDocument();
    expect(screen.getByText("a temporary improvement or boost in a game context")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Add to review" }));

    expect(onAccept).toHaveBeenCalledWith(expect.objectContaining({ expression: "buff" }));
  });
});
```

- [ ] **Step 5: Run component test and verify it fails**

Run:

```powershell
corepack pnpm --filter @art/web test -- src/features/cards/ContextCardGenerator.test.tsx
```

Expected: fails because `ContextCardGenerator` does not exist.

- [ ] **Step 6: Implement context-entry generator UI**

Create `apps/web/src/features/cards/ContextCardGenerator.tsx`:

```tsx
import { useState } from "react";
import type { CandidateExpression } from "@art/domain";
import { buildContextEntryDraft } from "./contextGeneration";

interface ContextCardGeneratorProps {
  onAccept: (draft: CandidateExpression) => void;
}

export function ContextCardGenerator({ onAccept }: ContextCardGeneratorProps) {
  const [expression, setExpression] = useState("");
  const [contextLabel, setContextLabel] = useState("");
  const [contextNote, setContextNote] = useState("");
  const [draft, setDraft] = useState<CandidateExpression | null>(null);

  function generate() {
    if (!expression.trim() || !contextLabel.trim()) return;
    setDraft(buildContextEntryDraft({
      expression,
      contextLabel,
      contextNote,
      generatedAt: new Date().toISOString(),
    }));
  }

  return (
    <section className="contextGenerator">
      <h2>Add from context</h2>
      <label>
        Expression
        <input value={expression} onChange={(event) => setExpression(event.target.value)} />
      </label>
      <label>
        Context
        <input value={contextLabel} onChange={(event) => setContextLabel(event.target.value)} placeholder="game, programming, work" />
      </label>
      <label>
        Where did you see it?
        <textarea value={contextNote} onChange={(event) => setContextNote(event.target.value)} />
      </label>
      <button type="button" onClick={generate}>Generate card</button>

      {draft ? (
        <article className="generatedDraft">
          <p>{draft.modelName}</p>
          <h3>{draft.expression}</h3>
          <p>{draft.localMeaning}</p>
          <p>{draft.meaningZh}</p>
          <p>{draft.sentence}</p>
          <p>{draft.sentenceTranslation}</p>
          <button type="button" onClick={() => onAccept(draft)}>Add to review</button>
        </article>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 7: Wire into card library**

Modify `CardLibraryPage.tsx` so the top of the Card Library contains `ContextCardGenerator`. Keep the card list below it.

Modify `App.tsx` so accepting the generated draft creates or activates a fixture `ExpressionSense`, adds a context-entry occurrence, and makes the card visible in Review and Cards.

- [ ] **Step 8: Run tests and build**

Run:

```powershell
corepack pnpm test:web
corepack pnpm --filter @art/web build
```

Expected: tests and build pass.

- [ ] **Step 9: Browser verify**

Open `http://localhost:5173` and go to Cards.

Verify:

- The learner can enter `buff`.
- The learner can enter `game`.
- `Generate card` produces an AI-generated mock draft.
- The draft shows model metadata.
- Accepting the draft adds it to Cards and Review.
- The occurrence source is clearly shown as context-entry, not an article segment.

- [ ] **Step 10: Commit**

Run:

```powershell
git add apps/web
git commit -m "feat: add context card generation mock"
```

Expected: commit succeeds.

---

## Task 17: Add Backend Context-Entry AI Contract

**Owner:** Codex local agent

**Reason:** Context-entry card generation is ultimately LLM-backed. The backend owns prompt construction, provider calls, generation metadata, idempotency, duplicate detection, and persistence.

**Dependencies:** Execute after Task 9 and Task 15, because it uses the AI provider boundary and the generated-card draft pattern.

**Files:**
- Modify: `packages/domain/src/types.ts`
- Modify: `apps/api/src/ai/provider.ts`
- Modify: `apps/api/src/ai/mockProvider.ts`
- Create: `apps/api/src/routes/contextGeneration.ts`
- Create: `apps/api/src/services/contextGenerationService.ts`
- Create: `apps/api/src/services/contextGenerationService.test.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `apps/api/src/db/schema.sql`
- Modify: `apps/api/src/db/schema.test.ts`

- [ ] **Step 1: Add context generation types**

Modify `packages/domain/src/types.ts` to add:

```ts
export interface ContextEntryGenerationRequest {
  clientOperationId: string;
  userId: string;
  expression: string;
  contextLabel: string;
  contextNote: string;
  sentence: string | null;
  clientCreatedAt: string;
}

export interface ContextEntryGenerationDraft {
  candidate: CandidateExpression;
  duplicateExpressionSenseId: string | null;
  recommendation: "add" | "merge" | "reject";
  recommendationReason: string;
}
```

- [ ] **Step 2: Add failing service test**

Create `apps/api/src/services/contextGenerationService.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createMockProvider } from "../ai/mockProvider";
import { generateContextEntryDraft } from "./contextGenerationService";

describe("generateContextEntryDraft", () => {
  it("generates a draft with model metadata from expression and context", async () => {
    const result = await generateContextEntryDraft({
      provider: createMockProvider(),
      request: {
        clientOperationId: "client-op-context-1",
        userId: "user-1",
        expression: "buff",
        contextLabel: "game",
        contextNote: "RPG item description",
        sentence: null,
        clientCreatedAt: "2026-06-13T00:00:00.000Z",
      },
    });

    expect(result.candidate.expression).toBe("buff");
    expect(result.candidate.modelProvider).toBe("mock");
    expect(result.candidate.generationVersion).toBe("context-entry-v1");
    expect(result.recommendation).toBe("add");
  });
});
```

- [ ] **Step 3: Run service test and verify it fails**

Run:

```powershell
corepack pnpm test:api -- src/services/contextGenerationService.test.ts
```

Expected: fails because the service does not exist.

- [ ] **Step 4: Extend AI provider interface**

Modify `provider.ts` so `AiProvider` supports:

```ts
generateContextEntryDraft(request: ContextEntryGenerationRequest): Promise<ContextEntryGenerationDraft>;
```

- [ ] **Step 5: Implement mock provider context generation**

Modify `mockProvider.ts` so expression `buff` with context label `game` returns a deterministic draft with:

- `modelProvider: "mock"`
- `modelName: "context-entry-mock-v1"`
- `promptVersion: "context-entry-prompt-v1"`
- `generationVersion: "context-entry-v1"`
- `recommendation: "add"`

- [ ] **Step 6: Implement service**

Create `contextGenerationService.ts` as a thin orchestration layer:

- Validates non-empty `expression`.
- Validates non-empty `contextLabel`.
- Calls `provider.generateContextEntryDraft`.
- Preserves `clientOperationId`.
- Returns one draft.

- [ ] **Step 7: Add API route**

Create `routes/contextGeneration.ts` with:

```text
POST /cards/context/generate
```

Request body is `ContextEntryGenerationRequest`. Response body is `ContextEntryGenerationDraft`.

Register the route in `app.ts`.

- [ ] **Step 8: Extend schema**

Modify `schema.sql` so:

- `occurrences.article_id` and `occurrences.segment_id` can represent article sources while context-entry occurrences store `source_type`, `context_label`, and `context_note`.
- `ai_generation_jobs.source_type` supports `context_entry`.
- `ai_generation_jobs` stores `context_label`, `context_note`, `client_operation_id`, and model metadata.

Update `schema.test.ts` to assert:

- `context_entry` appears in the schema.
- `context_label` appears in `occurrences` and `ai_generation_jobs`.
- `context_note` appears in `occurrences` and `ai_generation_jobs`.
- `client_operation_id` is present.
- model metadata fields are present.

- [ ] **Step 9: Run API tests**

Run:

```powershell
corepack pnpm test:api
```

Expected: API tests pass.

- [ ] **Step 10: Commit**

Run:

```powershell
git add packages/domain apps/api
git commit -m "feat: add context card generation contract"
```

Expected: commit succeeds.

---

## Task 18: Add Home Dashboard and Daily Targets

**Owner:** Codex local agent

**Reason:** The app needs a true learning home page that shows today's progress and lets the learner control daily load. The reading page remains the main learning surface, but the home page answers "what should I do today?"

**Files:**
- Create: `apps/web/src/features/home/HomePage.tsx`
- Create: `apps/web/src/features/home/HomePage.test.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/src/storage/db.ts` if daily targets need local persistence

- [ ] **Step 1: Add failing home page test**

Test that the app opens to Home first and shows:

- Today's new cards
- Today's completed reviews
- Due review count
- Daily new-card target control
- Daily review-card target control
- Pending sync count as a small status, not an overlay

- [ ] **Step 2: Implement Home page**

Create a mobile-first dashboard with compact stats and primary actions:

- Continue reading
- Review due cards
- Cards
- Articles

Keep it utilitarian and learning-focused, not a marketing page.

- [ ] **Step 3: Move pending sync status**

Remove persistent pending-sync status from reading/review surfaces. Show it on Home as a small status line. The learner should not need manual sync during normal use; a retry action can be added later when server sync exists.

- [ ] **Step 4: Run web tests and build**

Run:

```powershell
corepack pnpm test:web
corepack pnpm build
```

- [ ] **Step 5: Commit**

Run:

```powershell
git add apps/web
git commit -m "feat: add learning home dashboard"
```

---

## Task 19: Polish Review Feedback UX and Mastered Action

**Owner:** Codex local agent

**Reason:** Review feedback should match the learner's mental model. The current English labels are too abstract, and the learner needs a way to mark well-known cards as mastered without deleting them.

**Files:**
- Modify: `packages/domain/src/types.ts`
- Modify: `apps/web/src/features/review/ReviewPage.tsx`
- Modify: `apps/web/src/features/review/ReviewPage.test.tsx`
- Modify: `apps/web/src/features/review/reviewState.ts`
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Add failing review button test**

Test that review buttons render as:

- `不知道`
- `迷惑`
- `知道`

and use distinct classes for red, amber, and green styling.

- [ ] **Step 2: Add failing long-press mastered test**

Test that long-pressing `知道` reveals `熟知`, and choosing `熟知` removes the expression from the active review queue while keeping it available in Cards.

- [ ] **Step 3: Extend review feedback/domain action**

Support a mastered action without treating it as deletion. Recommended model:

- Keep `ReviewFeedback = "known" | "fuzzy" | "unknown"` for ordinary SRS ratings.
- Add a separate action or operation type for `review.mark_mastered`.
- Set `masteryStatus: "mastered"` and remove the item from active review IDs.

- [ ] **Step 4: Implement UI styling**

Style buttons:

- `不知道`: red
- `迷惑`: amber
- `知道`: green
- `熟知`: quiet positive secondary action shown only after long press

- [ ] **Step 5: Run tests and build**

Run:

```powershell
corepack pnpm test:web
corepack pnpm build
```

- [ ] **Step 6: Commit**

Run:

```powershell
git add packages/domain apps/web
git commit -m "feat: polish review feedback and mastered action"
```

---

## Task 20: Upgrade SRS to SM-2-Compatible Scheduling

**Owner:** Codex local agent

**Reason:** The initial fixed ladder was only enough to validate the loop. The product should move toward Anki-like scheduling while keeping room for FSRS later.

**Files:**
- Modify: `packages/domain/src/types.ts`
- Modify: `packages/domain/src/srs.ts`
- Modify: `packages/domain/src/srs.test.ts`
- Modify: `apps/api/src/db/schema.sql`
- Modify: `apps/api/src/db/schema.test.ts`
- Modify: `apps/web/src/fixtures/sampleSegment.ts`
- Modify: any web tests that construct `ExpressionSense`

- [x] **Step 1: Add failing SM-2 tests**

Cover:

- `known` increases repetitions and grows interval using ease factor.
- `fuzzy` schedules earlier than `known` and slightly reduces ease.
- `unknown` resets repetitions, increments mistake/lapse count, and schedules soon.
- `mastered` items are excluded from normal due review filtering.

- [x] **Step 2: Extend scheduling fields**

Add to `ExpressionSense`:

- `easeFactor`
- `intervalDays`
- `lapseCount`

Add corresponding database columns:

- `ease_factor`
- `interval_days`
- `lapse_count`

Review logs should preserve enough before/after state to debug scheduling:

- previous/next due date
- previous/next ease factor
- previous/next interval days
- feedback/rating

- [x] **Step 3: Implement SM-2-compatible transitions**

Recommended defaults:

- Initial ease factor: `2.5`
- Minimum ease factor: `1.3`
- `known`: quality 4 or 5 equivalent, interval grows by ease after early reviews.
- `fuzzy`: quality 3 equivalent, shorter interval and small ease reduction.
- `unknown`: quality 1 or 2 equivalent, reset repetitions and schedule soon.

Do not implement full FSRS training in this task.

- [x] **Step 4: Wire review state**

Ensure only review page feedback changes SM-2 scheduling. Reading feedback remains triage only.

- [x] **Step 5: Run tests and build**

Run:

```powershell
corepack pnpm test
corepack pnpm build
```

- [x] **Step 6: Commit**

Run:

```powershell
git add packages/domain apps/api apps/web
git commit -m "feat: upgrade srs scheduling"
```

---

## Execution Order

1. Task 1: Scaffold Workspace
2. Task 2: Shared Domain Types and SRS Logic
3. Task 3: Fixture-Driven Mobile MVP Frontend
4. Task 10: Local End-to-End Verification
5. Review the visible MVP with the user
6. Task 12: Enrich Review Cards and Add Card Library
7. Task 13: Add Visible TXT/Markdown Import Entry Point
8. Task 14: Add Manual Selection AI Card Generation Mock Flow
9. Task 16: Add Context-Entry AI Card Generation Mock Flow
10. Task 4: Text Segmentation
11. Task 5: Fastify API Skeleton
12. Task 6: PostgreSQL Schema
13. Task 7: IndexedDB Cache and Operation Queue
14. Task 8: Sync API Contract
15. Task 9: AI Provider Boundary
16. Task 15: Add Backend Manual Selection AI Contract
17. Task 17: Add Backend Context-Entry AI Contract
18. Task 11: Server Agent Handoff
19. Task 18: Home Dashboard and Daily Targets
20. Task 19: Review Feedback UX and Mastered Action
21. Task 20: SM-2-Compatible SRS Scheduling

This order deliberately puts the visible MVP before backend depth. If the learning interaction feels wrong, frontend behavior can be adjusted before persistence and deployment increase the cost of change.

## Self-Review Notes

Spec coverage:

- Learning-first reading flow: covered by Tasks 3 and 10.
- ExpressionSense vs Occurrence separation: covered by Tasks 2, 6, and 8.
- Reading feedback separated from review feedback: covered by Tasks 2 and 3.
- Rich review cards: covered by Task 12.
- Card library: covered by Task 12.
- Visible TXT/Markdown import entry point: covered by Task 13, with real backend import later in Tasks 4 and 5.
- Manual selection AI card generation: covered locally by Task 14 and on the backend by Task 15.
- Context-entry AI card generation: covered locally by Task 16 and on the backend by Task 17.
- Five candidate statuses: covered by Tasks 2, 3, 6, and 9.
- First-segment priority generation: covered by Task 5.
- PostgreSQL authority: covered by Task 6.
- IndexedDB offline queue and idempotent operations: covered by Tasks 7 and 8.
- AI generation metadata and versioning: covered by Tasks 6 and 9.
- Server deployment split: covered by Task 11.
- Home dashboard and daily targets: covered by Task 18.
- Chinese review feedback, colors, and mastered action: covered by Task 19.
- SM-2-compatible scheduling and FSRS-ready fields: covered by Task 20.

Known intentional deferrals:

- Native mobile app is excluded by the spec.
- PDF and webpage import are excluded by the spec.
- Real AI calls are behind the provider boundary and disabled by default for local MVP verification.
- Full FSRS optimization is deferred until enough review history exists.

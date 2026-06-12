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

MVP excludes:

- Real file import.
- Real AI calls.
- Real PostgreSQL.
- Real IndexedDB sync.
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

## Execution Order

1. Task 1: Scaffold Workspace
2. Task 2: Shared Domain Types and SRS Logic
3. Task 3: Fixture-Driven Mobile MVP Frontend
4. Task 10: Local End-to-End Verification
5. Review the visible MVP with the user
6. Task 4: Text Segmentation
7. Task 5: Fastify API Skeleton
8. Task 6: PostgreSQL Schema
9. Task 7: IndexedDB Cache and Operation Queue
10. Task 8: Sync API Contract
11. Task 9: AI Provider Boundary
12. Task 11: Server Agent Handoff

This order deliberately puts the visible MVP before backend depth. If the learning interaction feels wrong, frontend behavior can be adjusted before persistence and deployment increase the cost of change.

## Self-Review Notes

Spec coverage:

- Learning-first reading flow: covered by Tasks 3 and 10.
- ExpressionSense vs Occurrence separation: covered by Tasks 2, 6, and 8.
- Reading feedback separated from review feedback: covered by Tasks 2 and 3.
- Five candidate statuses: covered by Tasks 2, 3, 6, and 9.
- First-segment priority generation: covered by Task 5.
- PostgreSQL authority: covered by Task 6.
- IndexedDB offline queue and idempotent operations: covered by Tasks 7 and 8.
- AI generation metadata and versioning: covered by Tasks 6 and 9.
- Server deployment split: covered by Task 11.

Known intentional deferrals:

- Native mobile app is excluded by the spec.
- PDF and webpage import are excluded by the spec.
- Real AI calls are behind the provider boundary and disabled by default for local MVP verification.

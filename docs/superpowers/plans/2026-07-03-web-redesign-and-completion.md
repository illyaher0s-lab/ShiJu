# ShiJu Web Redesign and Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ShiJu from mobile-first PWA to desktop web application using Vercel design system, and complete all missing P0 functionality to make the product production-ready.

**Architecture:** 
- Frontend: React web app with Vercel design system (Geist fonts, shadow-as-border, sidebar navigation)
- Backend: Fastify API with PostgreSQL persistence and real LLM integration
- Remove PWA features (service worker, manifest, IndexedDB offline queue)
- Implement complete article import → AI generation → reading → review → sync flow

**Tech Stack:**
- Frontend: React 19, TypeScript, Vite, Vercel design system
- Backend: Node.js 22, Fastify, PostgreSQL 16, OpenAI-compatible LLM provider
- Testing: Vitest, browser verification

---

## Part 1: Frontend Web Redesign (UI Layer)

### Task 1: Remove PWA Infrastructure

**Files:**
- Remove: `apps/web/vite.config.ts` (PWA plugin config)
- Remove: `apps/web/public/manifest.webmanifest`
- Remove: `apps/web/src/registerSW.ts`
- Modify: `apps/web/index.html` (remove manifest link, SW registration)
- Modify: `apps/web/package.json` (remove vite-plugin-pwa)
- Remove: `apps/web/src/storage/` (entire directory - IndexedDB will be replaced with API calls)

- [ ] **Step 1: Remove PWA plugin from Vite config**

Read current config:

```bash
cd ~/ShiJu
cat apps/web/vite.config.ts
```

Remove `VitePWA` plugin and its imports. Keep only React plugin and basic config.

- [ ] **Step 2: Remove manifest and service worker files**

```bash
rm apps/web/public/manifest.webmanifest
rm apps/web/src/registerSW.ts
```

- [ ] **Step 3: Clean up index.html**

Read:
```bash
cat apps/web/index.html
```

Remove `<link rel="manifest">` and any SW registration `<script>` tags.

- [ ] **Step 4: Remove vite-plugin-pwa dependency**

```bash
cd apps/web
pnpm remove vite-plugin-pwa
```

- [ ] **Step 5: Remove IndexedDB storage layer**

```bash
rm -rf apps/web/src/storage/
```

- [ ] **Step 6: Verify build still works**

```bash
cd ~/ShiJu
pnpm build:web
```

Expected: Build succeeds without PWA artifacts in `dist/`.

- [ ] **Step 7: Commit**

```bash
git add apps/web/
git commit -m "refactor: remove PWA infrastructure (manifest, SW, IndexedDB)"
```

---

### Task 2: Add Vercel Design System Foundation

**Files:**
- Create: `apps/web/src/styles/vercel-design-system.css`
- Modify: `apps/web/index.html` (add Geist fonts)
- Modify: `apps/web/src/styles.css` (integrate design system)

- [ ] **Step 1: Add Geist fonts to index.html**

Insert before closing `</head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Create design system CSS file**

```css
/* apps/web/src/styles/vercel-design-system.css */

:root {
  /* Colors */
  --vercel-black: #171717;
  --vercel-white: #ffffff;
  --vercel-gray-900: #171717;
  --vercel-gray-600: #4d4d4d;
  --vercel-gray-500: #666666;
  --vercel-gray-400: #808080;
  --vercel-gray-100: #ebebeb;
  --vercel-gray-50: #fafafa;
  
  /* Accent colors */
  --link-blue: #0072f5;
  --focus-blue: hsla(212, 100%, 48%, 1);
  
  /* Shadows - Vercel signature shadow-as-border */
  --shadow-border: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
  --shadow-card: rgba(0,0,0,0.08) 0px 0px 0px 1px, 
                 rgba(0,0,0,0.04) 0px 2px 2px, 
                 rgba(0,0,0,0.04) 0px 8px 8px -8px, 
                 #fafafa 0px 0px 0px 1px inset;
  --shadow-subtle: rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-pill: 9999px;
  
  /* Spacing (8px base unit) */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-5: 40px;
  --space-6: 48px;
  --space-8: 64px;
  --space-10: 80px;
}

/* Typography */
body {
  font-family: 'Geist', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--vercel-black);
  background: var(--vercel-white);
  margin: 0;
  padding: 0;
}

h1 {
  font-size: 48px;
  font-weight: 600;
  line-height: 1.00;
  letter-spacing: -2.4px;
  color: var(--vercel-black);
  margin: 0 0 var(--space-2) 0;
}

h2 {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -1.28px;
  color: var(--vercel-black);
  margin: 0 0 var(--space-2) 0;
}

h3 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.33;
  letter-spacing: -0.96px;
  color: var(--vercel-black);
  margin: 0 0 var(--space-1) 0;
}

p {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--vercel-gray-600);
  margin: 0 0 var(--space-1) 0;
}

code, .mono {
  font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Buttons */
.btn {
  font-family: 'Geist', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: var(--vercel-black);
  color: var(--vercel-white);
}

.btn-primary:hover {
  background: var(--vercel-gray-600);
}

.btn-secondary {
  background: var(--vercel-white);
  color: var(--vercel-black);
  box-shadow: var(--shadow-border);
}

.btn-secondary:hover {
  background: var(--vercel-gray-50);
}

/* Cards */
.card {
  background: var(--vercel-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-2);
}

.card-simple {
  background: var(--vercel-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-subtle);
  padding: var(--space-2);
}

/* Links */
a {
  color: var(--link-blue);
  text-decoration: underline;
  cursor: pointer;
}

a:hover {
  color: var(--vercel-gray-600);
}

/* Focus states */
*:focus-visible {
  outline: 2px solid var(--focus-blue);
  outline-offset: 2px;
}

/* Pill badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 500;
  background: var(--vercel-gray-50);
  color: var(--vercel-gray-600);
}
```

- [ ] **Step 3: Import design system in main styles**

Modify `apps/web/src/styles.css` to import at the top:

```css
@import './styles/vercel-design-system.css';

/* Rest of existing styles... */
```

- [ ] **Step 4: Verify fonts load in browser**

```bash
cd ~/ShiJu
pnpm dev:web
```

Open browser to http://localhost:5173, open DevTools Network tab, filter for "font", confirm Geist and Geist Mono load successfully.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/styles/ apps/web/index.html
git commit -m "feat: add Vercel design system foundation (Geist fonts, CSS variables, components)"
```

---

### Task 3: Build Sidebar Navigation Layout

**Files:**
- Create: `apps/web/src/components/Sidebar.tsx`
- Modify: `apps/web/src/App.tsx` (replace bottom nav with sidebar layout)
- Modify: `apps/web/src/styles.css` (add sidebar layout styles)

- [ ] **Step 1: Create Sidebar component**

```tsx
// apps/web/src/components/Sidebar.tsx
import { BookMarked, BookOpen, Files, Home, RotateCcw } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>ShiJu</h2>
        <p className="sidebar-subtitle">AI Reading Trainer</p>
      </div>
      
      <nav className="sidebar-nav">
        <Link 
          to="/" 
          className={`sidebar-link ${isActive("/") ? "active" : ""}`}
        >
          <Home size={20} />
          <span>Home</span>
        </Link>
        
        <Link 
          to="/articles" 
          className={`sidebar-link ${isActive("/articles") ? "active" : ""}`}
        >
          <Files size={20} />
          <span>Articles</span>
        </Link>
        
        <Link 
          to="/reading" 
          className={`sidebar-link ${isActive("/reading") ? "active" : ""}`}
        >
          <BookOpen size={20} />
          <span>Reading</span>
        </Link>
        
        <Link 
          to="/review" 
          className={`sidebar-link ${isActive("/review") ? "active" : ""}`}
        >
          <RotateCcw size={20} />
          <span>Review</span>
        </Link>
        
        <Link 
          to="/cards" 
          className={`sidebar-link ${isActive("/cards") ? "active" : ""}`}
        >
          <BookMarked size={20} />
          <span>Cards</span>
        </Link>
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Add sidebar styles**

Append to `apps/web/src/styles.css`:

```css
/* Sidebar Layout */
.app-container {
  display: flex;
  min-height: 100vh;
  background: var(--vercel-white);
}

.sidebar {
  width: 240px;
  background: var(--vercel-white);
  border-right: 1px solid var(--vercel-gray-100);
  box-shadow: var(--shadow-border);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--vercel-gray-100);
}

.sidebar-header h2 {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.96px;
  margin: 0 0 4px 0;
}

.sidebar-subtitle {
  font-size: 12px;
  font-weight: 400;
  color: var(--vercel-gray-500);
  margin: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--vercel-gray-600);
  text-decoration: none;
  transition: all 0.15s ease;
}

.sidebar-link:hover {
  background: var(--vercel-gray-50);
  color: var(--vercel-black);
}

.sidebar-link.active {
  background: var(--vercel-gray-50);
  color: var(--vercel-black);
  font-weight: 600;
  box-shadow: var(--shadow-border);
}

.main-content {
  margin-left: 240px;
  flex: 1;
  padding: var(--space-4);
  max-width: 1200px;
  width: 100%;
}

/* Remove old mobile bottom nav */
.bottomNav {
  display: none;
}
```

- [ ] **Step 3: Update App.tsx to use sidebar layout**

Read current App.tsx:

```bash
cat apps/web/src/App.tsx
```

Replace the structure to use sidebar + main-content layout:

```tsx
// apps/web/src/App.tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { HomePage } from "./features/home/HomePage";
import { ArticleListPage } from "./features/articles/ArticleListPage";
import { ArticleDetailPage } from "./features/articles/ArticleDetailPage";
import { ReadingPage } from "./features/reading/ReadingPage";
import { ReviewPage } from "./features/review/ReviewPage";
import { CardLibraryPage } from "./features/cards/CardLibraryPage";
import { ImportPage } from "./features/import/ImportPage";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/articles" element={<ArticleListPage />} />
            <Route path="/articles/:id" element={<ArticleDetailPage />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/reading" element={<ReadingPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/cards" element={<CardLibraryPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 4: Create Sidebar component file**

Actually create the file from Step 1 (write to disk).

- [ ] **Step 5: Run dev server and verify layout**

```bash
cd ~/ShiJu
pnpm dev:web
```

Open http://localhost:5173, verify:
- Sidebar appears on left with ShiJu header
- Navigation links visible
- Main content area takes remaining space
- Active link highlights correctly when navigating

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/Sidebar.tsx apps/web/src/App.tsx apps/web/src/styles.css
git commit -m "feat: add sidebar navigation layout (Vercel design, fixed left sidebar)"
```

---

### Task 4: Redesign Home Page

**Files:**
- Modify: `apps/web/src/features/home/HomePage.tsx` (Vercel card layout)
- Modify: `apps/web/src/styles.css` (home page specific styles)

- [ ] **Step 1: Read current HomePage structure**

```bash
cat apps/web/src/features/home/HomePage.tsx
```

Note the props and functionality.

- [ ] **Step 2: Rewrite HomePage with Vercel design**

```tsx
// apps/web/src/features/home/HomePage.tsx
import { BookMarked, BookOpen, Files, RotateCcw, Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

interface HomePageProps {
  newCardsToday: number;
  completedReviewsToday: number;
  dueReviewCount: number;
  newCardTarget: number;
  reviewTarget: number;
  pendingSyncCount: number;
  onNewCardTargetChange: (target: number) => void;
  onReviewTargetChange: (target: number) => void;
}

export function HomePage({
  newCardsToday,
  completedReviewsToday,
  dueReviewCount,
  newCardTarget,
  reviewTarget,
  pendingSyncCount,
  onNewCardTargetChange,
  onReviewTargetChange,
}: HomePageProps) {
  const navigate = useNavigate();
  
  function updateTarget(event: ChangeEvent<HTMLInputElement>, onChange: (target: number) => void) {
    onChange(Number(event.target.value));
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Today</h1>
        <p>Your daily learning dashboard</p>
      </header>

      <section className="home-stats">
        <div className="stat-card">
          <h3>{newCardsToday}</h3>
          <p className="stat-label">New cards today</p>
          <span className="stat-target">Target: {newCardTarget}</span>
        </div>
        
        <div className="stat-card">
          <h3>{completedReviewsToday}</h3>
          <p className="stat-label">Reviews completed</p>
          <span className="stat-target">Target: {reviewTarget}</span>
        </div>
        
        <div className="stat-card highlight">
          <h3>{dueReviewCount}</h3>
          <p className="stat-label">Due for review</p>
          <span className="stat-target">Ready now</span>
        </div>
      </section>

      <section className="home-targets card-simple">
        <h3>Daily Targets</h3>
        <div className="target-inputs">
          <label>
            <span>New cards per day</span>
            <input
              type="number"
              min={0}
              step={1}
              value={newCardTarget}
              onChange={(e) => updateTarget(e, onNewCardTargetChange)}
              className="target-input"
            />
          </label>
          <label>
            <span>Review cards per day</span>
            <input
              type="number"
              min={0}
              step={1}
              value={reviewTarget}
              onChange={(e) => updateTarget(e, onReviewTargetChange)}
              className="target-input"
            />
          </label>
        </div>
      </section>

      <section className="home-actions">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button 
            type="button" 
            className="action-card"
            onClick={() => navigate("/import")}
          >
            <Upload size={24} />
            <span>Import Article</span>
          </button>
          
          <button 
            type="button" 
            className="action-card"
            onClick={() => navigate("/reading")}
          >
            <BookOpen size={24} />
            <span>Continue Reading</span>
          </button>
          
          <button 
            type="button" 
            className="action-card"
            onClick={() => navigate("/review")}
          >
            <RotateCcw size={24} />
            <span>Review Cards</span>
          </button>
          
          <button 
            type="button" 
            className="action-card"
            onClick={() => navigate("/cards")}
          >
            <BookMarked size={24} />
            <span>Card Library</span>
          </button>
        </div>
      </section>

      {pendingSyncCount > 0 && (
        <div className="sync-status badge">
          {pendingSyncCount} operation(s) pending sync
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Add home page styles**

Append to `apps/web/src/styles.css`:

```css
/* Home Page */
.home-page {
  max-width: 900px;
  margin: 0 auto;
}

.home-header {
  margin-bottom: var(--space-4);
}

.home-header h1 {
  margin-bottom: 8px;
}

.home-header p {
  font-size: 18px;
  color: var(--vercel-gray-500);
}

.home-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.stat-card {
  background: var(--vercel-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-subtle);
  padding: var(--space-3);
  text-align: center;
}

.stat-card.highlight {
  box-shadow: var(--shadow-card);
}

.stat-card h3 {
  font-size: 48px;
  font-weight: 600;
  letter-spacing: -2.4px;
  margin: 0 0 8px 0;
  color: var(--vercel-black);
}

.stat-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--vercel-gray-600);
  margin: 0 0 4px 0;
}

.stat-target {
  font-size: 12px;
  color: var(--vercel-gray-400);
}

.home-targets {
  margin-bottom: var(--space-4);
}

.home-targets h3 {
  margin-bottom: var(--space-2);
}

.target-inputs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
}

.target-inputs label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vercel-gray-600);
}

.target-input {
  font-family: 'Geist', sans-serif;
  font-size: 16px;
  font-weight: 400;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: none;
  box-shadow: var(--shadow-border);
  background: var(--vercel-white);
  color: var(--vercel-black);
}

.target-input:focus {
  outline: 2px solid var(--focus-blue);
  outline-offset: 0;
}

.home-actions {
  margin-bottom: var(--space-4);
}

.home-actions h3 {
  margin-bottom: var(--space-2);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-3);
  background: var(--vercel-white);
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-subtle);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: 'Geist', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--vercel-gray-600);
}

.action-card:hover {
  box-shadow: var(--shadow-card);
  color: var(--vercel-black);
}

.sync-status {
  position: fixed;
  bottom: var(--space-2);
  right: var(--space-2);
  z-index: 100;
}
```

- [ ] **Step 4: Update App.tsx HomePage props (if needed)**

Check if HomePage is used in App.tsx with default props or needs state management.

- [ ] **Step 5: Run dev server and verify home page**

```bash
pnpm dev:web
```

Navigate to http://localhost:5173/, verify:
- Stats display in 3-column grid
- Target inputs work
- Action cards clickable and navigate correctly
- Vercel design applied (Geist fonts, shadow-as-border)

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/home/ apps/web/src/styles.css
git commit -m "feat: redesign home page with Vercel design system"
```

---

## Part 2: Article Import and Segmentation (Backend Services)

### Task 5: Implement Text Segmentation Service

**Files:**
- Create: `apps/api/src/services/segmentationService.ts`
- Create: `apps/api/src/services/segmentationService.test.ts`

- [ ] **Step 1: Write segmentation test**

```typescript
// apps/api/src/services/segmentationService.test.ts
import { describe, expect, it } from 'vitest';
import { segmentText } from './segmentationService';

describe('segmentText', () => {
  it('should split text into segments of 150-250 words', () => {
    const text = 'word '.repeat(500); // 500 words
    const segments = segmentText(text.trim());
    
    expect(segments.length).toBeGreaterThan(1);
    for (const segment of segments) {
      const wordCount = segment.text.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(150);
      expect(wordCount).toBeLessThanOrEqual(250);
    }
  });
  
  it('should preserve paragraph boundaries', () => {
    const text = 'First paragraph with fifty words. '.repeat(50) + '\n\n' + 
                 'Second paragraph with fifty words. '.repeat(50);
    const segments = segmentText(text);
    
    // Should not break in the middle of "Second paragraph"
    const hasCleanBreak = segments.some(s => s.text.startsWith('Second paragraph'));
    expect(hasCleanBreak).toBe(true);
  });
  
  it('should handle short text (< 150 words)', () => {
    const text = 'Short text with only twenty words. '.repeat(4);
    const segments = segmentText(text.trim());
    
    expect(segments.length).toBe(1);
    expect(segments[0].text).toBe(text.trim());
  });
  
  it('should assign correct sequence numbers', () => {
    const text = 'word '.repeat(500);
    const segments = segmentText(text.trim());
    
    for (let i = 0; i < segments.length; i++) {
      expect(segments[i].sequence).toBe(i);
    }
  });
  
  it('should calculate word count correctly', () => {
    const text = 'one two three four five';
    const segments = segmentText(text);
    
    expect(segments[0].wordCount).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ~/ShiJu
pnpm test:api -- segmentationService.test.ts
```

Expected: FAIL with "Cannot find module './segmentationService'"

- [ ] **Step 3: Implement segmentation service**

```typescript
// apps/api/src/services/segmentationService.ts
export interface Segment {
  text: string;
  sequence: number;
  wordCount: number;
}

/**
 * Split text into segments of 150-250 words, respecting paragraph boundaries.
 * Strategy:
 * 1. Split by double newline (paragraphs)
 * 2. Accumulate paragraphs until reaching 150-250 words
 * 3. If a single paragraph > 250 words, split at sentence boundaries
 */
export function segmentText(text: string): Segment[] {
  const MIN_WORDS = 150;
  const MAX_WORDS = 250;
  
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const segments: Segment[] = [];
  let currentSegment: string[] = [];
  let currentWordCount = 0;
  
  for (const paragraph of paragraphs) {
    const paragraphWordCount = countWords(paragraph);
    
    // If single paragraph is too long, split at sentences
    if (paragraphWordCount > MAX_WORDS) {
      // Flush current segment if any
      if (currentSegment.length > 0) {
        segments.push(createSegment(currentSegment.join('\n\n'), segments.length));
        currentSegment = [];
        currentWordCount = 0;
      }
      
      // Split long paragraph at sentence boundaries
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      let sentenceBuffer: string[] = [];
      let sentenceWordCount = 0;
      
      for (const sentence of sentences) {
        const words = countWords(sentence);
        
        if (sentenceWordCount + words > MAX_WORDS && sentenceBuffer.length > 0) {
          segments.push(createSegment(sentenceBuffer.join(' '), segments.length));
          sentenceBuffer = [sentence];
          sentenceWordCount = words;
        } else {
          sentenceBuffer.push(sentence);
          sentenceWordCount += words;
        }
      }
      
      if (sentenceBuffer.length > 0) {
        segments.push(createSegment(sentenceBuffer.join(' '), segments.length));
      }
      
      continue;
    }
    
    // Check if adding this paragraph exceeds MAX_WORDS
    if (currentWordCount + paragraphWordCount > MAX_WORDS && currentSegment.length > 0) {
      // Flush current segment
      segments.push(createSegment(currentSegment.join('\n\n'), segments.length));
      currentSegment = [paragraph];
      currentWordCount = paragraphWordCount;
    } else {
      currentSegment.push(paragraph);
      currentWordCount += paragraphWordCount;
      
      // If we've reached MIN_WORDS, consider flushing
      if (currentWordCount >= MIN_WORDS) {
        segments.push(createSegment(currentSegment.join('\n\n'), segments.length));
        currentSegment = [];
        currentWordCount = 0;
      }
    }
  }
  
  // Flush remaining
  if (currentSegment.length > 0) {
    segments.push(createSegment(currentSegment.join('\n\n'), segments.length));
  }
  
  return segments;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function createSegment(text: string, sequence: number): Segment {
  return {
    text,
    sequence,
    wordCount: countWords(text),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:api -- segmentationService.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/services/segmentationService.ts apps/api/src/services/segmentationService.test.ts
git commit -m "feat(api): implement text segmentation service (150-250 words, paragraph-aware)"
```

---

### Task 6: Implement Article Import API

**Files:**
- Modify: `apps/api/src/routes/articles.ts`
- Modify: `apps/api/src/db/client.ts` (add article queries)
- Create: `apps/api/src/routes/articles.test.ts`

- [ ] **Step 1: Write article import route test**

```typescript
// apps/api/src/routes/articles.test.ts
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../app';
import { FastifyInstance } from 'fastify';

describe('POST /articles', () => {
  let app: FastifyInstance;
  
  beforeEach(async () => {
    app = await buildApp();
  });
  
  afterEach(async () => {
    await app.close();
  });
  
  it('should import article and create segments', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/articles',
      payload: {
        title: 'Test Article',
        rawText: 'word '.repeat(300), // 300 words
        sourceType: 'paste',
      },
    });
    
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.article).toBeDefined();
    expect(body.article.id).toBeDefined();
    expect(body.segments).toBeDefined();
    expect(body.segments.length).toBeGreaterThan(0);
    expect(body.segments[0].generationStatus).toBe('not_generated');
  });
  
  it('should reject empty text', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/articles',
      payload: {
        title: 'Empty',
        rawText: '',
        sourceType: 'paste',
      },
    });
    
    expect(response.statusCode).toBe(400);
  });
  
  it('should prioritize first segment', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/articles',
      payload: {
        title: 'Test',
        rawText: 'word '.repeat(500),
        sourceType: 'paste',
      },
    });
    
    const body = JSON.parse(response.body);
    expect(body.segments[0].priority).toBe('high');
    expect(body.segments[1]?.priority).toBe('normal');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:api -- articles.test.ts
```

Expected: FAIL (route not implemented yet)

- [ ] **Step 3: Read current articles.ts route structure**

```bash
cat apps/api/src/routes/articles.ts | head -50
```

- [ ] **Step 4: Implement article import route**

```typescript
// apps/api/src/routes/articles.ts
import { FastifyPluginAsync } from 'fastify';
import { segmentText } from '../services/segmentationService';
import * as db from '../db/client';

export const articlesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/articles', async (request, reply) => {
    const { title, rawText, sourceType } = request.body as {
      title: string;
      rawText: string;
      sourceType: 'paste' | 'file';
    };
    
    // Validation
    if (!rawText || rawText.trim().length === 0) {
      return reply.code(400).send({ error: 'rawText is required' });
    }
    
    if (!title || title.trim().length === 0) {
      return reply.code(400).send({ error: 'title is required' });
    }
    
    // TODO: Get user_id from auth (for now use default)
    const userId = 1;
    
    // Insert article
    const article = await db.createArticle({
      userId,
      title: title.trim(),
      sourceType: sourceType || 'paste',
      rawText: rawText.trim(),
    });
    
    // Segment text
    const textSegments = segmentText(rawText.trim());
    
    // Insert segments
    const segments = [];
    for (const seg of textSegments) {
      const priority = seg.sequence === 0 ? 'high' : 'normal';
      const segment = await db.createSegment({
        userId,
        articleId: article.id,
        sequence: seg.sequence,
        text: seg.text,
        wordCount: seg.wordCount,
        generationStatus: 'not_generated',
        priority,
      });
      segments.push(segment);
    }
    
    return reply.code(201).send({
      article,
      segments,
    });
  });
  
  fastify.get('/articles', async (request, reply) => {
    // TODO: Get user_id from auth
    const userId = 1;
    
    const articles = await db.listArticles(userId);
    return reply.send({ articles });
  });
  
  fastify.get('/articles/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = 1;
    
    const article = await db.getArticle(Number(id), userId);
    if (!article) {
      return reply.code(404).send({ error: 'Article not found' });
    }
    
    const segments = await db.getArticleSegments(Number(id), userId);
    
    return reply.send({
      article,
      segments,
    });
  });
};
```

- [ ] **Step 5: Implement database queries in client.ts**

```typescript
// Add to apps/api/src/db/client.ts

export async function createArticle(data: {
  userId: number;
  title: string;
  sourceType: string;
  rawText: string;
}) {
  const result = await pool.query(
    `INSERT INTO articles (user_id, title, source_type, raw_text, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING *`,
    [data.userId, data.title, data.sourceType, data.rawText]
  );
  return result.rows[0];
}

export async function createSegment(data: {
  userId: number;
  articleId: number;
  sequence: number;
  text: string;
  wordCount: number;
  generationStatus: string;
  priority: string;
}) {
  const result = await pool.query(
    `INSERT INTO segments 
     (user_id, article_id, sequence, text, word_count, generation_status, priority, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [data.userId, data.articleId, data.sequence, data.text, data.wordCount, data.generationStatus, data.priority]
  );
  return result.rows[0];
}

export async function listArticles(userId: number) {
  const result = await pool.query(
    `SELECT * FROM articles 
     WHERE user_id = $1 AND deleted_at IS NULL 
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getArticle(id: number, userId: number) {
  const result = await pool.query(
    `SELECT * FROM articles 
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function getArticleSegments(articleId: number, userId: number) {
  const result = await pool.query(
    `SELECT * FROM segments 
     WHERE article_id = $1 AND user_id = $2 AND deleted_at IS NULL 
     ORDER BY sequence ASC`,
    [articleId, userId]
  );
  return result.rows;
}
```

- [ ] **Step 6: Run test to verify it passes**

```bash
pnpm test:api -- articles.test.ts
```

Expected: PASS (may need PostgreSQL running)

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/routes/articles.ts apps/api/src/routes/articles.test.ts apps/api/src/db/client.ts
git commit -m "feat(api): implement article import API with segmentation"
```

---

### Task 7: Build Import Page Frontend

**Files:**
- Modify: `apps/web/src/features/import/ImportPage.tsx`
- Create: `apps/web/src/api/articles.ts` (API client)

- [ ] **Step 1: Create articles API client**

```typescript
// apps/web/src/api/articles.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface Article {
  id: number;
  userId: number;
  title: string;
  sourceType: 'paste' | 'file';
  rawText: string;
  createdAt: string;
  updatedAt: string;
}

export interface Segment {
  id: number;
  articleId: number;
  sequence: number;
  text: string;
  wordCount: number;
  generationStatus: string;
  priority: string;
}

export async function importArticle(data: {
  title: string;
  rawText: string;
  sourceType: 'paste' | 'file';
}): Promise<{ article: Article; segments: Segment[] }> {
  const response = await fetch(`${API_BASE}/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to import article');
  }
  
  return response.json();
}

export async function listArticles(): Promise<Article[]> {
  const response = await fetch(`${API_BASE}/articles`);
  if (!response.ok) throw new Error('Failed to list articles');
  const data = await response.json();
  return data.articles;
}

export async function getArticle(id: number): Promise<{
  article: Article;
  segments: Segment[];
}> {
  const response = await fetch(`${API_BASE}/articles/${id}`);
  if (!response.ok) throw new Error('Failed to get article');
  return response.json();
}
```

- [ ] **Step 2: Rewrite ImportPage component**

```tsx
// apps/web/src/features/import/ImportPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText } from 'lucide-react';
import { importArticle } from '../../api/articles';

export function ImportPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePaste() {
    if (!title.trim() || !text.trim()) {
      setError('Both title and text are required');
      return;
    }
    
    setIsImporting(true);
    setError(null);
    
    try {
      const result = await importArticle({
        title: title.trim(),
        rawText: text.trim(),
        sourceType: 'paste',
      });
      
      // Navigate to article detail or reading page
      navigate(`/articles/${result.article.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  }
  
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const text = await file.text();
    const filename = file.name.replace(/\.(txt|md)$/i, '');
    
    setTitle(filename);
    setText(text);
  }

  return (
    <div className="import-page">
      <header className="import-header">
        <h1>Import Article</h1>
        <p>Paste text or upload a TXT/Markdown file</p>
      </header>

      <div className="import-form card-simple">
        <label className="form-field">
          <span className="form-label">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article title"
            className="form-input"
          />
        </label>

        <label className="form-field">
          <span className="form-label">Text</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste article text here"
            className="form-textarea"
            rows={20}
          />
        </label>

        <div className="import-actions">
          <button
            type="button"
            onClick={handlePaste}
            disabled={isImporting || !title.trim() || !text.trim()}
            className="btn btn-primary"
          >
            <Upload size={16} />
            {isImporting ? 'Importing...' : 'Import Article'}
          </button>

          <label className="btn btn-secondary">
            <FileText size={16} />
            Upload File
            <input
              type="file"
              accept=".txt,.md"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add import page styles**

```css
/* Add to apps/web/src/styles.css */

.import-page {
  max-width: 800px;
  margin: 0 auto;
}

.import-header {
  margin-bottom: var(--space-4);
}

.import-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--vercel-gray-600);
}

.form-input {
  font-family: 'Geist', sans-serif;
  font-size: 16px;
  padding: 10px 12px;
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-border);
  background: var(--vercel-white);
}

.form-input:focus {
  outline: 2px solid var(--focus-blue);
  outline-offset: 0;
}

.form-textarea {
  font-family: 'Geist Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 12px;
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-border);
  background: var(--vercel-white);
  resize: vertical;
}

.form-textarea:focus {
  outline: 2px solid var(--focus-blue);
  outline-offset: 0;
}

.import-actions {
  display: flex;
  gap: var(--space-2);
}

.error-message {
  padding: var(--space-2);
  background: #ffebee;
  color: #c62828;
  border-radius: var(--radius-md);
  font-size: 14px;
}
```

- [ ] **Step 4: Add API base URL to env**

Create `apps/web/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

- [ ] **Step 5: Test import flow in browser**

```bash
# Start API server (needs PostgreSQL running)
pnpm dev:api

# In another terminal, start web
pnpm dev:web
```

Navigate to http://localhost:5173/import, paste text, click Import, verify it posts to API and navigates to article detail.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/import/ apps/web/src/api/ apps/web/src/styles.css apps/web/.env
git commit -m "feat(web): implement article import page with API integration"
```

---

## Part 3: PostgreSQL Setup and Data Layer

### Task 8: PostgreSQL Database Setup

**Files:**
- Modify: `apps/api/src/db/client.ts` (connection pool setup)
- Create: `apps/api/src/db/init.sql` (database initialization script)
- Modify: `apps/api/.env.example`

- [ ] **Step 1: Install PostgreSQL client**

```bash
cd ~/ShiJu/apps/api
pnpm add pg
pnpm add -D @types/pg
```

- [ ] **Step 2: Create database initialization script**

```sql
-- apps/api/src/db/init.sql
-- Run this once to set up the database

-- Drop existing tables (development only)
DROP TABLE IF EXISTS ai_generation_jobs CASCADE;
DROP TABLE IF EXISTS client_operations CASCADE;
DROP TABLE IF EXISTS review_logs CASCADE;
DROP TABLE IF EXISTS occurrences CASCADE;
DROP TABLE IF EXISTS expression_senses CASCADE;
DROP TABLE IF EXISTS candidate_expressions CASCADE;
DROP TABLE IF EXISTS segments CASCADE;
DROP TABLE IF EXISTS articles CASCADE;

-- Articles table
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  title VARCHAR(500) NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  raw_text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_deleted_at ON articles(deleted_at);

-- Segments table
CREATE TABLE segments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  text TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  generation_status VARCHAR(50) NOT NULL DEFAULT 'not_generated',
  priority VARCHAR(50) NOT NULL DEFAULT 'normal',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_segments_article_id ON segments(article_id);
CREATE INDEX idx_segments_user_id ON segments(user_id);
CREATE INDEX idx_segments_generation_status ON segments(generation_status);

-- Candidate expressions table
CREATE TABLE candidate_expressions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  segment_id INTEGER NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  expression VARCHAR(500) NOT NULL,
  normalized_form VARCHAR(500) NOT NULL,
  type VARCHAR(100) NOT NULL,
  meaning_zh TEXT NOT NULL,
  local_meaning TEXT,
  sentence TEXT NOT NULL,
  sentence_translation TEXT,
  difficulty VARCHAR(50),
  value_score DECIMAL(3,2),
  candidate_status VARCHAR(100) NOT NULL,
  status_reason TEXT,
  model_provider VARCHAR(100),
  model_name VARCHAR(200),
  prompt_version VARCHAR(50),
  generation_version VARCHAR(50),
  generated_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_candidate_expressions_segment_id ON candidate_expressions(segment_id);
CREATE INDEX idx_candidate_expressions_status ON candidate_expressions(candidate_status);

-- Expression senses table (SRS units)
CREATE TABLE expression_senses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  expression VARCHAR(500) NOT NULL,
  normalized_form VARCHAR(500) NOT NULL,
  type VARCHAR(100) NOT NULL,
  meaning_zh TEXT NOT NULL,
  difficulty VARCHAR(50),
  mastery_status VARCHAR(50) NOT NULL DEFAULT 'new',
  srs_due_at TIMESTAMP,
  review_count INTEGER NOT NULL DEFAULT 0,
  mistake_count INTEGER NOT NULL DEFAULT 0,
  ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.50,
  interval_days DECIMAL(10,2) NOT NULL DEFAULT 0,
  lapse_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL,
  CONSTRAINT unique_expression_sense UNIQUE (user_id, normalized_form, type, meaning_zh)
);

CREATE INDEX idx_expression_senses_user_id ON expression_senses(user_id);
CREATE INDEX idx_expression_senses_due_at ON expression_senses(srs_due_at);
CREATE INDEX idx_expression_senses_mastery_status ON expression_senses(mastery_status);

-- Occurrences table (context evidence)
CREATE TABLE occurrences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  expression_sense_id INTEGER NOT NULL REFERENCES expression_senses(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL,
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  segment_id INTEGER REFERENCES segments(id) ON DELETE CASCADE,
  context_label VARCHAR(200),
  context_note TEXT,
  sentence TEXT NOT NULL,
  sentence_translation TEXT,
  local_meaning TEXT,
  syntax_hint TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_occurrences_expression_sense_id ON occurrences(expression_sense_id);
CREATE INDEX idx_occurrences_article_id ON occurrences(article_id);

-- Review logs table
CREATE TABLE review_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  expression_sense_id INTEGER NOT NULL REFERENCES expression_senses(id) ON DELETE CASCADE,
  feedback VARCHAR(50) NOT NULL,
  rating INTEGER,
  previous_due_at TIMESTAMP,
  next_due_at TIMESTAMP,
  previous_ease_factor DECIMAL(4,2),
  next_ease_factor DECIMAL(4,2),
  previous_interval_days DECIMAL(10,2),
  next_interval_days DECIMAL(10,2),
  reviewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_logs_expression_sense_id ON review_logs(expression_sense_id);
CREATE INDEX idx_review_logs_reviewed_at ON review_logs(reviewed_at);

-- Client operations table (offline sync)
CREATE TABLE client_operations (
  id SERIAL PRIMARY KEY,
  client_operation_id VARCHAR(100) NOT NULL UNIQUE,
  user_id INTEGER NOT NULL DEFAULT 1,
  operation_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(100),
  target_id INTEGER,
  payload JSONB,
  client_created_at TIMESTAMP NOT NULL,
  sync_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  server_applied_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_operations_user_id ON client_operations(user_id);
CREATE INDEX idx_client_operations_sync_status ON client_operations(sync_status);

-- AI generation jobs table
CREATE TABLE ai_generation_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  segment_id INTEGER REFERENCES segments(id) ON DELETE CASCADE,
  source_type VARCHAR(100) NOT NULL,
  selected_text TEXT,
  context_label VARCHAR(200),
  context_note TEXT,
  sentence TEXT,
  context TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  client_operation_id VARCHAR(100),
  model_provider VARCHAR(100),
  model_name VARCHAR(200),
  prompt_version VARCHAR(50),
  generation_version VARCHAR(50),
  generated_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_ai_generation_jobs_segment_id ON ai_generation_jobs(segment_id);
CREATE INDEX idx_ai_generation_jobs_status ON ai_generation_jobs(status);
```

- [ ] **Step 3: Update db/client.ts with connection pool**

```typescript
// apps/api/src/db/client.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  database: process.env.DATABASE_NAME || 'shiju',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error', err);
  process.exit(-1);
});

export { pool };

// Article queries (already added in Task 6)
export async function createArticle(data: {
  userId: number;
  title: string;
  sourceType: string;
  rawText: string;
}) {
  const result = await pool.query(
    `INSERT INTO articles (user_id, title, source_type, raw_text, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING *`,
    [data.userId, data.title, data.sourceType, data.rawText]
  );
  return result.rows[0];
}

export async function createSegment(data: {
  userId: number;
  articleId: number;
  sequence: number;
  text: string;
  wordCount: number;
  generationStatus: string;
  priority: string;
}) {
  const result = await pool.query(
    `INSERT INTO segments 
     (user_id, article_id, sequence, text, word_count, generation_status, priority, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [data.userId, data.articleId, data.sequence, data.text, data.wordCount, data.generationStatus, data.priority]
  );
  return result.rows[0];
}

export async function listArticles(userId: number) {
  const result = await pool.query(
    `SELECT * FROM articles 
     WHERE user_id = $1 AND deleted_at IS NULL 
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getArticle(id: number, userId: number) {
  const result = await pool.query(
    `SELECT * FROM articles 
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function getArticleSegments(articleId: number, userId: number) {
  const result = await pool.query(
    `SELECT * FROM segments 
     WHERE article_id = $1 AND user_id = $2 AND deleted_at IS NULL 
     ORDER BY sequence ASC`,
    [articleId, userId]
  );
  return result.rows;
}
```

- [ ] **Step 4: Create .env.example**

```bash
# apps/api/.env.example
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=shiju
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password_here

AI_PROVIDER=mock
AI_BASE_URL=
AI_API_KEY=
AI_MODEL=
```

- [ ] **Step 5: Initialize PostgreSQL database**

```bash
# Create database
createdb shiju

# Run init script
psql -d shiju -f apps/api/src/db/init.sql
```

Expected: Tables created successfully.

- [ ] **Step 6: Create actual .env file**

```bash
# Copy example and fill in real values
cp apps/api/.env.example apps/api/.env
# Edit .env with real database credentials
```

- [ ] **Step 7: Verify database connection**

```bash
cd ~/ShiJu
pnpm dev:api
```

Check logs for "Database connected" or similar. Test POST /articles endpoint.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/db/ apps/api/.env.example
git commit -m "feat(api): set up PostgreSQL connection and schema"
```

---

### Task 9: Implement Expression Sense and Occurrence Queries

**Files:**
- Modify: `apps/api/src/db/client.ts` (add ExpressionSense/Occurrence queries)
- Create: `apps/api/src/db/client.test.ts`

- [ ] **Step 1: Write database query tests**

```typescript
// apps/api/src/db/client.test.ts
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import * as db from './client';

describe('ExpressionSense queries', () => {
  let testArticleId: number;
  let testSegmentId: number;
  
  beforeAll(async () => {
    // Create test article and segment
    const article = await db.createArticle({
      userId: 1,
      title: 'Test Article',
      sourceType: 'paste',
      rawText: 'Test content',
    });
    testArticleId = article.id;
    
    const segment = await db.createSegment({
      userId: 1,
      articleId: testArticleId,
      sequence: 0,
      text: 'Test segment',
      wordCount: 2,
      generationStatus: 'not_generated',
      priority: 'high',
    });
    testSegmentId = segment.id;
  });
  
  afterAll(async () => {
    // Clean up
    await db.pool.query('DELETE FROM articles WHERE id = $1', [testArticleId]);
  });
  
  it('should create and retrieve ExpressionSense', async () => {
    const sense = await db.createExpressionSense({
      userId: 1,
      expression: 'take off',
      normalizedForm: 'take off',
      type: 'phrasal_verb',
      meaningZh: '起飞',
      difficulty: 'intermediate',
    });
    
    expect(sense.id).toBeDefined();
    expect(sense.expression).toBe('take off');
    
    const retrieved = await db.getExpressionSense(sense.id, 1);
    expect(retrieved).toBeDefined();
    expect(retrieved?.meaningZh).toBe('起飞');
  });
  
  it('should enforce unique constraint on (user_id, normalized_form, type, meaning_zh)', async () => {
    await db.createExpressionSense({
      userId: 1,
      expression: 'all at once',
      normalizedForm: 'all at once',
      type: 'idiom',
      meaningZh: '突然',
      difficulty: 'intermediate',
    });
    
    // Try to create duplicate
    await expect(
      db.createExpressionSense({
        userId: 1,
        expression: 'all at once',
        normalizedForm: 'all at once',
        type: 'idiom',
        meaningZh: '突然',
        difficulty: 'intermediate',
      })
    ).rejects.toThrow();
  });
  
  it('should create occurrence for ExpressionSense', async () => {
    const sense = await db.createExpressionSense({
      userId: 1,
      expression: 'test expression',
      normalizedForm: 'test expression',
      type: 'phrase',
      meaningZh: '测试',
      difficulty: 'easy',
    });
    
    const occurrence = await db.createOccurrence({
      userId: 1,
      expressionSenseId: sense.id,
      sourceType: 'article',
      articleId: testArticleId,
      segmentId: testSegmentId,
      sentence: 'This is a test expression.',
      sentenceTranslation: '这是一个测试表达。',
      localMeaning: '测试',
    });
    
    expect(occurrence.id).toBeDefined();
    expect(occurrence.expressionSenseId).toBe(sense.id);
  });
  
  it('should list occurrences for ExpressionSense', async () => {
    const sense = await db.createExpressionSense({
      userId: 1,
      expression: 'multi occurrence',
      normalizedForm: 'multi occurrence',
      type: 'phrase',
      meaningZh: '多次出现',
      difficulty: 'easy',
    });
    
    await db.createOccurrence({
      userId: 1,
      expressionSenseId: sense.id,
      sourceType: 'article',
      articleId: testArticleId,
      segmentId: testSegmentId,
      sentence: 'First occurrence.',
      sentenceTranslation: '第一次。',
      localMeaning: '多次出现',
    });
    
    await db.createOccurrence({
      userId: 1,
      expressionSenseId: sense.id,
      sourceType: 'context_entry',
      contextLabel: 'game',
      sentence: 'Second occurrence.',
      sentenceTranslation: '第二次。',
      localMeaning: '多次出现',
    });
    
    const occurrences = await db.listOccurrences(sense.id, 1);
    expect(occurrences.length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:api -- client.test.ts
```

Expected: FAIL (functions not implemented yet)

- [ ] **Step 3: Implement ExpressionSense and Occurrence queries**

```typescript
// Add to apps/api/src/db/client.ts

export async function createExpressionSense(data: {
  userId: number;
  expression: string;
  normalizedForm: string;
  type: string;
  meaningZh: string;
  difficulty?: string;
}) {
  const result = await pool.query(
    `INSERT INTO expression_senses 
     (user_id, expression, normalized_form, type, meaning_zh, difficulty, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING *`,
    [data.userId, data.expression, data.normalizedForm, data.type, data.meaningZh, data.difficulty || null]
  );
  return result.rows[0];
}

export async function getExpressionSense(id: number, userId: number) {
  const result = await pool.query(
    `SELECT * FROM expression_senses 
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function findExpressionSense(data: {
  userId: number;
  normalizedForm: string;
  type: string;
  meaningZh: string;
}) {
  const result = await pool.query(
    `SELECT * FROM expression_senses 
     WHERE user_id = $1 
       AND normalized_form = $2 
       AND type = $3 
       AND meaning_zh = $4 
       AND deleted_at IS NULL`,
    [data.userId, data.normalizedForm, data.type, data.meaningZh]
  );
  return result.rows[0] || null;
}

export async function listDueExpressionSenses(userId: number, dueDate: Date) {
  const result = await pool.query(
    `SELECT * FROM expression_senses 
     WHERE user_id = $1 
       AND srs_due_at <= $2 
       AND mastery_status != 'mastered'
       AND deleted_at IS NULL 
     ORDER BY srs_due_at ASC`,
    [userId, dueDate]
  );
  return result.rows;
}

export async function updateExpressionSense(id: number, userId: number, data: {
  masteryStatus?: string;
  srsDueAt?: Date;
  reviewCount?: number;
  mistakeCount?: number;
  easeFactor?: number;
  intervalDays?: number;
  lapseCount?: number;
}) {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  
  if (data.masteryStatus !== undefined) {
    updates.push(`mastery_status = $${paramIndex++}`);
    values.push(data.masteryStatus);
  }
  if (data.srsDueAt !== undefined) {
    updates.push(`srs_due_at = $${paramIndex++}`);
    values.push(data.srsDueAt);
  }
  if (data.reviewCount !== undefined) {
    updates.push(`review_count = $${paramIndex++}`);
    values.push(data.reviewCount);
  }
  if (data.mistakeCount !== undefined) {
    updates.push(`mistake_count = $${paramIndex++}`);
    values.push(data.mistakeCount);
  }
  if (data.easeFactor !== undefined) {
    updates.push(`ease_factor = $${paramIndex++}`);
    values.push(data.easeFactor);
  }
  if (data.intervalDays !== undefined) {
    updates.push(`interval_days = $${paramIndex++}`);
    values.push(data.intervalDays);
  }
  if (data.lapseCount !== undefined) {
    updates.push(`lapse_count = $${paramIndex++}`);
    values.push(data.lapseCount);
  }
  
  updates.push(`updated_at = NOW()`);
  values.push(id, userId);
  
  const result = await pool.query(
    `UPDATE expression_senses 
     SET ${updates.join(', ')} 
     WHERE id = $${paramIndex++} AND user_id = $${paramIndex++} 
     RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function createOccurrence(data: {
  userId: number;
  expressionSenseId: number;
  sourceType: 'article' | 'context_entry';
  articleId?: number;
  segmentId?: number;
  contextLabel?: string;
  contextNote?: string;
  sentence: string;
  sentenceTranslation?: string;
  localMeaning?: string;
  syntaxHint?: string;
}) {
  const result = await pool.query(
    `INSERT INTO occurrences 
     (user_id, expression_sense_id, source_type, article_id, segment_id, 
      context_label, context_note, sentence, sentence_translation, local_meaning, syntax_hint,
      created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
     RETURNING *`,
    [
      data.userId,
      data.expressionSenseId,
      data.sourceType,
      data.articleId || null,
      data.segmentId || null,
      data.contextLabel || null,
      data.contextNote || null,
      data.sentence,
      data.sentenceTranslation || null,
      data.localMeaning || null,
      data.syntaxHint || null,
    ]
  );
  return result.rows[0];
}

export async function listOccurrences(expressionSenseId: number, userId: number) {
  const result = await pool.query(
    `SELECT * FROM occurrences 
     WHERE expression_sense_id = $1 AND user_id = $2 AND deleted_at IS NULL 
     ORDER BY created_at DESC`,
    [expressionSenseId, userId]
  );
  return result.rows;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:api -- client.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/db/client.ts apps/api/src/db/client.test.ts
git commit -m "feat(api): implement ExpressionSense and Occurrence database queries"
```

---

## Part 4: AI Generation Implementation (LLM Integration)

### Task 10: Connect OpenAI-Compatible Provider

**Files:**
- Modify: `apps/api/src/ai/openAiCompatibleProvider.ts`
- Modify: `apps/api/src/config.ts` (validate LLM config)
- Create: `apps/api/src/ai/provider.test.ts`

- [ ] **Step 1: Read existing OpenAI compatible provider**

```bash
cat apps/api/src/ai/openAiCompatibleProvider.ts
```

Note current structure.

- [ ] **Step 2: Write provider integration test**

```typescript
// apps/api/src/ai/provider.test.ts
import { describe, expect, it } from 'vitest';
import { openAiCompatibleProvider } from './openAiCompatibleProvider';

describe('openAiCompatibleProvider', () => {
  it('should call LLM with correct format', async () => {
    const config = {
      provider: 'openai_compatible' as const,
      baseUrl: process.env.AI_BASE_URL!,
      apiKey: process.env.AI_API_KEY!,
      model: process.env.AI_MODEL!,
    };
    
    // Skip if env vars not set (CI/local dev)
    if (!config.baseUrl || !config.apiKey || !config.model) {
      console.log('Skipping LLM test: AI env vars not set');
      return;
    }
    
    const result = await openAiCompatibleProvider.generateCandidates(config, {
      segmentText: 'The project took off after the initial launch.',
      existingCandidates: [],
    });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result.candidates)).toBe(true);
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates[0].expression).toBeDefined();
  });
});
```

- [ ] **Step 3: Update config.ts to validate LLM config**

```typescript
// Add to apps/api/src/config.ts

export interface Config {
  port: number;
  aiProvider: 'mock' | 'openai_compatible';
  aiBaseUrl?: string;
  aiApiKey?: string;
  aiModel?: string;
  databaseHost: string;
  databasePort: number;
  databaseName: string;
  databaseUser: string;
  databasePassword?: string;
}

export function loadConfig(): Config {
  const aiProvider = (process.env.AI_PROVIDER || 'mock') as 'mock' | 'openai_compatible';
  
  // Validate LLM config if using real provider
  if (aiProvider === 'openai_compatible') {
    if (!process.env.AI_BASE_URL) {
      throw new Error('AI_BASE_URL is required when AI_PROVIDER=openai_compatible');
    }
    if (!process.env.AI_API_KEY) {
      throw new Error('AI_API_KEY is required when AI_PROVIDER=openai_compatible');
    }
    if (!process.env.AI_MODEL) {
      throw new Error('AI_MODEL is required when AI_PROVIDER=openai_compatible');
    }
  }
  
  return {
    port: Number(process.env.PORT) || 3000,
    aiProvider,
    aiBaseUrl: process.env.AI_BASE_URL,
    aiApiKey: process.env.AI_API_KEY,
    aiModel: process.env.AI_MODEL,
    databaseHost: process.env.DATABASE_HOST || 'localhost',
    databasePort: Number(process.env.DATABASE_PORT) || 5432,
    databaseName: process.env.DATABASE_NAME || 'shiju',
    databaseUser: process.env.DATABASE_USER || 'postgres',
    databasePassword: process.env.DATABASE_PASSWORD,
  };
}
```

- [ ] **Step 4: Update openAiCompatibleProvider with real implementation**

```typescript
// apps/api/src/ai/openAiCompatibleProvider.ts
import { callLLM } from '../lib/llmClient';
import type { AIProvider, GenerateCandidatesInput, GenerateCandidatesOutput } from './provider';

export const openAiCompatibleProvider: AIProvider = {
  async generateCandidates(config, input) {
    const prompt = buildSegmentPrompt(input);
    
    const response = await callLLM(config, {
      messages: [
        {
          role: 'system',
          content: 'You are an English learning assistant. Extract valuable expressions from English text for Chinese learners.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from LLM');
    }
    
    // Parse JSON response
    const parsed = parseJSONResponse(content);
    
    return {
      candidates: parsed.candidates.map((c: any) => ({
        expression: c.expression,
        normalizedForm: c.normalized_form || c.expression.toLowerCase(),
        type: c.type,
        meaningZh: c.meaning_zh,
        localMeaning: c.local_meaning,
        sentence: c.sentence,
        sentenceTranslation: c.sentence_translation,
        difficulty: c.difficulty,
        valueScore: c.value_score,
        candidateStatus: c.candidate_status,
        statusReason: c.status_reason,
      })),
      modelProvider: 'openai_compatible',
      modelName: config.model,
      promptVersion: 'v1.0',
      generationVersion: '20260703',
    };
  },
  
  async generateFromSelection(config, input) {
    const prompt = buildManualSelectionPrompt(input);
    
    const response = await callLLM(config, {
      messages: [
        {
          role: 'system',
          content: 'You are an English learning assistant. Generate expression card for the selected text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from LLM');
    
    const parsed = parseJSONResponse(content);
    
    return {
      expression: parsed.expression,
      normalizedForm: parsed.normalized_form || parsed.expression.toLowerCase(),
      type: parsed.type,
      meaningZh: parsed.meaning_zh,
      localMeaning: parsed.local_meaning,
      sentenceTranslation: parsed.sentence_translation,
      difficulty: parsed.difficulty,
      syntaxHint: parsed.syntax_hint,
      duplicateWarning: parsed.duplicate_warning,
      modelProvider: 'openai_compatible',
      modelName: config.model,
      promptVersion: 'v1.0',
      generationVersion: '20260703',
    };
  },
  
  async generateFromContext(config, input) {
    const prompt = buildContextPrompt(input);
    
    const response = await callLLM(config, {
      messages: [
        {
          role: 'system',
          content: 'You are an English learning assistant. Generate expression card for learner-provided context.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from LLM');
    
    const parsed = parseJSONResponse(content);
    
    return {
      expression: parsed.expression,
      normalizedForm: parsed.normalized_form || parsed.expression.toLowerCase(),
      type: parsed.type,
      meaningZh: parsed.meaning_zh,
      localMeaning: parsed.local_meaning,
      exampleSentence: parsed.example_sentence,
      exampleTranslation: parsed.example_translation,
      difficulty: parsed.difficulty,
      usageHint: parsed.usage_hint,
      duplicateWarning: parsed.duplicate_warning,
      modelProvider: 'openai_compatible',
      modelName: config.model,
      promptVersion: 'v1.0',
      generationVersion: '20260703',
    };
  },
};

function buildSegmentPrompt(input: GenerateCandidatesInput): string {
  return `Extract 2-4 valuable English expressions from this text for Chinese learners:

Text:
${input.segmentText}

Requirements:
- Focus on phrasal verbs, idioms, collocations, and useful phrases
- Prioritize expressions that are common but not too easy
- Each expression should have clear meaning in context
- Return JSON format with array of candidates

Example output format:
{
  "candidates": [
    {
      "expression": "take off",
      "normalized_form": "take off",
      "type": "phrasal_verb",
      "meaning_zh": "起飞；脱下；突然成功",
      "local_meaning": "在本句中指：起飞",
      "sentence": "The plane will take off soon.",
      "sentence_translation": "飞机即将起飞。",
      "difficulty": "intermediate",
      "value_score": 0.85,
      "candidate_status": "selected",
      "status_reason": "Common phrasal verb with multiple meanings"
    }
  ]
}`;
}

function buildManualSelectionPrompt(input: any): string {
  return `The learner selected this text from an article and wants to learn it:

Selected text: "${input.selectedText}"
Full sentence: "${input.sentence}"
Context: ${input.context}

Generate a learning card for this expression. Return JSON format:
{
  "expression": "...",
  "normalized_form": "...",
  "type": "phrasal_verb|idiom|collocation|phrase|word",
  "meaning_zh": "中文释义",
  "local_meaning": "在本句中的含义",
  "sentence_translation": "句子翻译",
  "difficulty": "easy|intermediate|advanced",
  "syntax_hint": "可选的语法提示",
  "duplicate_warning": null
}`;
}

function buildContextPrompt(input: any): string {
  return `The learner encountered this expression in ${input.contextLabel} context:

Expression: "${input.expression}"
${input.contextNote ? `Note: ${input.contextNote}` : ''}
${input.sentence ? `Sentence: "${input.sentence}"` : ''}

Generate a learning card appropriate for this context. Return JSON format:
{
  "expression": "...",
  "normalized_form": "...",
  "type": "...",
  "meaning_zh": "中文释义",
  "local_meaning": "在此语境中的含义",
  "example_sentence": "适合该语境的例句",
  "example_translation": "例句翻译",
  "difficulty": "easy|intermediate|advanced",
  "usage_hint": "可选的使用提示",
  "duplicate_warning": null
}`;
}

function parseJSONResponse(content: string): any {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : content;
  
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(`Failed to parse LLM JSON response: ${err}`);
  }
}
```

- [ ] **Step 5: Test with real LLM (if API key available)**

```bash
# Set env vars in apps/api/.env
# AI_PROVIDER=openai_compatible
# AI_BASE_URL=https://api.openai.com/v1
# AI_API_KEY=sk-...
# AI_MODEL=gpt-4

pnpm test:api -- provider.test.ts
```

Expected: PASS if API key valid, SKIP if not set

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/ai/ apps/api/src/config.ts
git commit -m "feat(api): implement OpenAI-compatible LLM provider with real API calls"
```

---

### Task 11: Implement Segment Generation Service

**Files:**
- Modify: `apps/api/src/services/generationService.ts`
- Create: `apps/api/src/services/generationService.test.ts`
- Modify: `apps/api/src/db/client.ts` (add candidate queries)

- [ ] **Step 1: Write generation service test**

```typescript
// apps/api/src/services/generationService.test.ts
import { describe, expect, it, beforeAll } from 'vitest';
import { generateSegmentCandidates } from './generationService';
import * as db from '../db/client';

describe('generateSegmentCandidates', () => {
  let testArticleId: number;
  let testSegmentId: number;
  
  beforeAll(async () => {
    const article = await db.createArticle({
      userId: 1,
      title: 'Test Article',
      sourceType: 'paste',
      rawText: 'The project took off after the initial launch. It was all at once successful.',
    });
    testArticleId = article.id;
    
    const segment = await db.createSegment({
      userId: 1,
      articleId: testArticleId,
      sequence: 0,
      text: 'The project took off after the initial launch.',
      wordCount: 8,
      generationStatus: 'not_generated',
      priority: 'high',
    });
    testSegmentId = segment.id;
  });
  
  it('should generate candidates and save to database', async () => {
    const result = await generateSegmentCandidates(testSegmentId, 1);
    
    expect(result.segmentId).toBe(testSegmentId);
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates[0].expression).toBeDefined();
    
    // Verify saved to database
    const candidates = await db.listCandidateExpressions(testSegmentId, 1);
    expect(candidates.length).toBe(result.candidates.length);
  });
  
  it('should mark segment as generated', async () => {
    await generateSegmentCandidates(testSegmentId, 1);
    
    const segment = await db.getSegment(testSegmentId, 1);
    expect(segment.generationStatus).toBe('generated');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:api -- generationService.test.ts
```

Expected: FAIL (service not implemented)

- [ ] **Step 3: Implement candidate database queries**

```typescript
// Add to apps/api/src/db/client.ts

export async function getSegment(id: number, userId: number) {
  const result = await pool.query(
    `SELECT * FROM segments 
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function updateSegmentStatus(id: number, userId: number, status: string) {
  const result = await pool.query(
    `UPDATE segments 
     SET generation_status = $1, updated_at = NOW() 
     WHERE id = $2 AND user_id = $3 
     RETURNING *`,
    [status, id, userId]
  );
  return result.rows[0];
}

export async function createCandidateExpression(data: {
  userId: number;
  articleId: number;
  segmentId: number;
  expression: string;
  normalizedForm: string;
  type: string;
  meaningZh: string;
  localMeaning?: string;
  sentence: string;
  sentenceTranslation?: string;
  difficulty?: string;
  valueScore?: number;
  candidateStatus: string;
  statusReason?: string;
  modelProvider?: string;
  modelName?: string;
  promptVersion?: string;
  generationVersion?: string;
  generatedAt?: Date;
}) {
  const result = await pool.query(
    `INSERT INTO candidate_expressions 
     (user_id, article_id, segment_id, expression, normalized_form, type, 
      meaning_zh, local_meaning, sentence, sentence_translation, difficulty, 
      value_score, candidate_status, status_reason, model_provider, model_name, 
      prompt_version, generation_version, generated_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
     RETURNING *`,
    [
      data.userId,
      data.articleId,
      data.segmentId,
      data.expression,
      data.normalizedForm,
      data.type,
      data.meaningZh,
      data.localMeaning || null,
      data.sentence,
      data.sentenceTranslation || null,
      data.difficulty || null,
      data.valueScore || null,
      data.candidateStatus,
      data.statusReason || null,
      data.modelProvider || null,
      data.modelName || null,
      data.promptVersion || null,
      data.generationVersion || null,
      data.generatedAt || null,
    ]
  );
  return result.rows[0];
}

export async function listCandidateExpressions(segmentId: number, userId: number) {
  const result = await pool.query(
    `SELECT * FROM candidate_expressions 
     WHERE segment_id = $1 AND user_id = $2 
     ORDER BY 
       CASE candidate_status 
         WHEN 'selected' THEN 1 
         WHEN 'backup_candidate' THEN 2 
         ELSE 3 
       END,
       value_score DESC`,
    [segmentId, userId]
  );
  return result.rows;
}
```

- [ ] **Step 4: Implement generation service**

```typescript
// apps/api/src/services/generationService.ts
import * as db from '../db/client';
import { mockProvider } from '../ai/mockProvider';
import { openAiCompatibleProvider } from '../ai/openAiCompatibleProvider';
import { loadConfig } from '../config';

export async function generateSegmentCandidates(segmentId: number, userId: number) {
  const config = loadConfig();
  
  // Get segment
  const segment = await db.getSegment(segmentId, userId);
  if (!segment) {
    throw new Error('Segment not found');
  }
  
  // Mark as generating
  await db.updateSegmentStatus(segmentId, userId, 'generating');
  
  try {
    // Choose provider
    const provider = config.aiProvider === 'mock' ? mockProvider : openAiCompatibleProvider;
    
    // Generate candidates
    const result = await provider.generateCandidates(
      {
        provider: config.aiProvider,
        baseUrl: config.aiBaseUrl!,
        apiKey: config.aiApiKey!,
        model: config.aiModel!,
      },
      {
        segmentText: segment.text,
        existingCandidates: [],
      }
    );
    
    // Save candidates to database
    const savedCandidates = [];
    for (const candidate of result.candidates) {
      const saved = await db.createCandidateExpression({
        userId,
        articleId: segment.articleId,
        segmentId: segment.id,
        expression: candidate.expression,
        normalizedForm: candidate.normalizedForm,
        type: candidate.type,
        meaningZh: candidate.meaningZh,
        localMeaning: candidate.localMeaning,
        sentence: candidate.sentence,
        sentenceTranslation: candidate.sentenceTranslation,
        difficulty: candidate.difficulty,
        valueScore: candidate.valueScore,
        candidateStatus: candidate.candidateStatus,
        statusReason: candidate.statusReason,
        modelProvider: result.modelProvider,
        modelName: result.modelName,
        promptVersion: result.promptVersion,
        generationVersion: result.generationVersion,
        generatedAt: new Date(),
      });
      savedCandidates.push(saved);
    }
    
    // Mark as generated
    await db.updateSegmentStatus(segmentId, userId, 'generated');
    
    return {
      segmentId,
      candidates: savedCandidates,
    };
  } catch (error) {
    // Mark as failed
    await db.updateSegmentStatus(segmentId, userId, 'failed');
    throw error;
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm test:api -- generationService.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/services/generationService.ts apps/api/src/services/generationService.test.ts apps/api/src/db/client.ts
git commit -m "feat(api): implement segment candidate generation service"
```

---

### Task 12: Trigger First Segment Generation After Import

**Files:**
- Modify: `apps/api/src/routes/articles.ts` (trigger generation)

- [ ] **Step 1: Update articles route to trigger generation**

```typescript
// Modify apps/api/src/routes/articles.ts POST /articles handler

import { generateSegmentCandidates } from '../services/generationService';

// ... inside fastify.post('/articles', async (request, reply) => {
    
    // Insert segments (existing code)
    const segments = [];
    for (const seg of textSegments) {
      const priority = seg.sequence === 0 ? 'high' : 'normal';
      const segment = await db.createSegment({
        userId,
        articleId: article.id,
        sequence: seg.sequence,
        text: seg.text,
        wordCount: seg.wordCount,
        generationStatus: 'not_generated',
        priority,
      });
      segments.push(segment);
    }
    
    // Trigger first segment generation (high priority)
    if (segments.length > 0) {
      const firstSegment = segments[0];
      // Fire and forget - don't block response
      generateSegmentCandidates(firstSegment.id, userId).catch((err) => {
        console.error('First segment generation failed:', err);
      });
    }
    
    return reply.code(201).send({
      article,
      segments,
    });
  });
```

- [ ] **Step 2: Test article import triggers generation**

```bash
# Start API server
pnpm dev:api

# In another terminal, test import
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","rawText":"The project took off after the initial launch.","sourceType":"paste"}'
```

Check database:
```bash
psql -d shiju -c "SELECT id, generation_status FROM segments ORDER BY id DESC LIMIT 1;"
```

Expected: generation_status should be 'generating' or 'generated'

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/routes/articles.ts
git commit -m "feat(api): trigger first segment generation after article import"
```

---

## Part 5: Review System and SRS Implementation

### Task 13: Implement SRS Service

**Files:**
- Create: `apps/api/src/services/srsService.ts`
- Create: `apps/api/src/services/srsService.test.ts`
- Modify: `apps/api/src/db/client.ts` (add review log queries)

- [ ] **Step 1: Write SRS service test**

```typescript
// apps/api/src/services/srsService.test.ts
import { describe, expect, it, beforeAll } from 'vitest';
import { processFeedback, getDueCards } from './srsService';
import * as db from '../db/client';

describe('SRS Service', () => {
  let testSenseId: number;
  
  beforeAll(async () => {
    const sense = await db.createExpressionSense({
      userId: 1,
      expression: 'take off',
      normalizedForm: 'take off',
      type: 'phrasal_verb',
      meaningZh: '起飞',
      difficulty: 'intermediate',
    });
    testSenseId = sense.id;
  });
  
  it('should schedule new card for tomorrow on "熟悉" feedback', async () => {
    const result = await processFeedback(testSenseId, 1, '熟悉');
    
    expect(result.nextDueAt).toBeDefined();
    const daysDiff = Math.floor((result.nextDueAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toBeGreaterThanOrEqual(0);
    expect(daysDiff).toBeLessThanOrEqual(2); // Should be ~1 day
    expect(result.masteryStatus).toBe('learning');
  });
  
  it('should increase interval on successful review', async () => {
    // First review
    await processFeedback(testSenseId, 1, '熟悉');
    const sense1 = await db.getExpressionSense(testSenseId, 1);
    const interval1 = sense1.intervalDays;
    
    // Second review
    await processFeedback(testSenseId, 1, '熟悉');
    const sense2 = await db.getExpressionSense(testSenseId, 1);
    const interval2 = sense2.intervalDays;
    
    expect(interval2).toBeGreaterThan(interval1);
  });
  
  it('should reset interval on "不记得" feedback', async () => {
    // Build up some interval
    await processFeedback(testSenseId, 1, '熟悉');
    await processFeedback(testSenseId, 1, '熟悉');
    
    const before = await db.getExpressionSense(testSenseId, 1);
    expect(before.intervalDays).toBeGreaterThan(1);
    
    // Forget
    await processFeedback(testSenseId, 1, '不记得');
    
    const after = await db.getExpressionSense(testSenseId, 1);
    expect(after.intervalDays).toBeLessThan(before.intervalDays);
    expect(after.lapseCount).toBeGreaterThan(before.lapseCount);
  });
  
  it('should return due cards', async () => {
    // Create a card due now
    const sense = await db.createExpressionSense({
      userId: 1,
      expression: 'all at once',
      normalizedForm: 'all at once',
      type: 'idiom',
      meaningZh: '突然',
      difficulty: 'intermediate',
    });
    
    await db.updateExpressionSense(sense.id, 1, {
      srsDueAt: new Date(Date.now() - 1000), // Due 1 second ago
      masteryStatus: 'learning',
    });
    
    const dueCards = await getDueCards(1);
    expect(dueCards.length).toBeGreaterThan(0);
    expect(dueCards.some(c => c.id === sense.id)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:api -- srsService.test.ts
```

Expected: FAIL (service not implemented)

- [ ] **Step 3: Implement SRS service**

```typescript
// apps/api/src/services/srsService.ts
import * as db from '../db/client';

/**
 * SM-2 compatible SRS algorithm
 * Feedback mapping:
 * - "不记得" (Again) -> rating 1
 * - "有点印象" (Hard) -> rating 2
 * - "熟悉" (Good) -> rating 3
 * - "熟知" (Easy) -> rating 4
 */
export async function processFeedback(
  expressionSenseId: number,
  userId: number,
  feedback: '不记得' | '有点印象' | '熟悉' | '熟知'
) {
  const sense = await db.getExpressionSense(expressionSenseId, userId);
  if (!sense) {
    throw new Error('ExpressionSense not found');
  }
  
  const rating = feedbackToRating(feedback);
  const now = new Date();
  
  // Current state
  const previousDueAt = sense.srsDueAt ? new Date(sense.srsDueAt) : null;
  const previousEaseFactor = sense.easeFactor || 2.5;
  const previousIntervalDays = sense.intervalDays || 0;
  const reviewCount = sense.reviewCount || 0;
  const mistakeCount = sense.mistakeCount || 0;
  const lapseCount = sense.lapseCount || 0;
  
  // Calculate new state
  let newEaseFactor = previousEaseFactor;
  let newIntervalDays = 0;
  let newLapseCount = lapseCount;
  let newMistakeCount = mistakeCount;
  let newMasteryStatus = sense.masteryStatus;
  
  if (rating === 1) {
    // Forgot - reset to learning
    newIntervalDays = 0;
    newLapseCount += 1;
    newMistakeCount += 1;
    newEaseFactor = Math.max(1.3, previousEaseFactor - 0.2);
    newMasteryStatus = 'learning';
  } else {
    // Remembered
    if (rating === 2) {
      newMistakeCount += 1;
      newEaseFactor = Math.max(1.3, previousEaseFactor - 0.15);
    } else if (rating === 3) {
      // No change to ease factor
    } else if (rating === 4) {
      newEaseFactor = Math.min(2.5, previousEaseFactor + 0.15);
    }
    
    // Calculate new interval
    if (reviewCount === 0) {
      newIntervalDays = 1; // First review: 1 day
    } else if (reviewCount === 1) {
      newIntervalDays = 3; // Second review: 3 days
    } else {
      newIntervalDays = previousIntervalDays * newEaseFactor;
    }
    
    // Update mastery status based on interval
    if (newIntervalDays >= 21) {
      newMasteryStatus = 'mature';
    } else if (newIntervalDays >= 7) {
      newMasteryStatus = 'young';
    } else {
      newMasteryStatus = 'learning';
    }
  }
  
  const nextDueAt = new Date(now.getTime() + newIntervalDays * 24 * 60 * 60 * 1000);
  
  // Update ExpressionSense
  await db.updateExpressionSense(expressionSenseId, userId, {
    masteryStatus: newMasteryStatus,
    srsDueAt: nextDueAt,
    reviewCount: reviewCount + 1,
    mistakeCount: newMistakeCount,
    easeFactor: newEaseFactor,
    intervalDays: newIntervalDays,
    lapseCount: newLapseCount,
  });
  
  // Log review
  await db.createReviewLog({
    userId,
    expressionSenseId,
    feedback,
    rating,
    previousDueAt,
    nextDueAt,
    previousEaseFactor,
    nextEaseFactor: newEaseFactor,
    previousIntervalDays,
    nextIntervalDays: newIntervalDays,
    reviewedAt: now,
  });
  
  return {
    expressionSenseId,
    feedback,
    nextDueAt,
    intervalDays: newIntervalDays,
    masteryStatus: newMasteryStatus,
    reviewCount: reviewCount + 1,
  };
}

export async function getDueCards(userId: number) {
  const now = new Date();
  return db.listDueExpressionSenses(userId, now);
}

function feedbackToRating(feedback: string): number {
  switch (feedback) {
    case '不记得':
      return 1;
    case '有点印象':
      return 2;
    case '熟悉':
      return 3;
    case '熟知':
      return 4;
    default:
      return 3;
  }
}
```

- [ ] **Step 4: Implement review log query**

```typescript
// Add to apps/api/src/db/client.ts

export async function createReviewLog(data: {
  userId: number;
  expressionSenseId: number;
  feedback: string;
  rating: number;
  previousDueAt: Date | null;
  nextDueAt: Date;
  previousEaseFactor: number;
  nextEaseFactor: number;
  previousIntervalDays: number;
  nextIntervalDays: number;
  reviewedAt: Date;
}) {
  const result = await pool.query(
    `INSERT INTO review_logs 
     (user_id, expression_sense_id, feedback, rating, previous_due_at, next_due_at,
      previous_ease_factor, next_ease_factor, previous_interval_days, next_interval_days,
      reviewed_at, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
     RETURNING *`,
    [
      data.userId,
      data.expressionSenseId,
      data.feedback,
      data.rating,
      data.previousDueAt,
      data.nextDueAt,
      data.previousEaseFactor,
      data.nextEaseFactor,
      data.previousIntervalDays,
      data.nextIntervalDays,
      data.reviewedAt,
    ]
  );
  return result.rows[0];
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm test:api -- srsService.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/services/srsService.ts apps/api/src/services/srsService.test.ts apps/api/src/db/client.ts
git commit -m "feat(api): implement SRS scheduling service with SM-2 algorithm"
```

---

### Task 14: Implement Review API Routes

**Files:**
- Create: `apps/api/src/routes/review.ts`
- Modify: `apps/api/src/app.ts` (register routes)

- [ ] **Step 1: Implement review routes**

```typescript
// apps/api/src/routes/review.ts
import { FastifyPluginAsync } from 'fastify';
import * as db from '../db/client';
import { getDueCards, processFeedback } from '../services/srsService';

export const reviewRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/review/due', async (request, reply) => {
    const userId = 1; // TODO: from auth
    
    const dueCards = await getDueCards(userId);
    
    // Enrich with occurrences
    const enriched = [];
    for (const card of dueCards) {
      const occurrences = await db.listOccurrences(card.id, userId);
      enriched.push({
        ...card,
        occurrences,
      });
    }
    
    return reply.send({ dueCards: enriched });
  });
  
  fastify.post('/review/feedback', async (request, reply) => {
    const { expressionSenseId, feedback } = request.body as {
      expressionSenseId: number;
      feedback: '不记得' | '有点印象' | '熟悉' | '熟知';
    };
    
    const userId = 1; // TODO: from auth
    
    if (!expressionSenseId || !feedback) {
      return reply.code(400).send({ error: 'expressionSenseId and feedback are required' });
    }
    
    const result = await processFeedback(expressionSenseId, userId, feedback);
    
    return reply.send(result);
  });
  
  fastify.get('/review/stats', async (request, reply) => {
    const userId = 1; // TODO: from auth
    
    // Get counts by mastery status
    const result = await db.pool.query(
      `SELECT mastery_status, COUNT(*) as count 
       FROM expression_senses 
       WHERE user_id = $1 AND deleted_at IS NULL 
       GROUP BY mastery_status`,
      [userId]
    );
    
    const stats = result.rows.reduce((acc: any, row: any) => {
      acc[row.mastery_status] = Number(row.count);
      return acc;
    }, {});
    
    // Get today's review count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reviewsToday = await db.pool.query(
      `SELECT COUNT(*) as count 
       FROM review_logs 
       WHERE user_id = $1 AND reviewed_at >= $2`,
      [userId, today]
    );
    
    return reply.send({
      stats,
      reviewsToday: Number(reviewsToday.rows[0].count),
    });
  });
};
```

- [ ] **Step 2: Register review routes in app**

```typescript
// Modify apps/api/src/app.ts

import { reviewRoutes } from './routes/review';

export async function buildApp() {
  const app = fastify({ logger: true });
  
  // ... existing routes
  
  await app.register(reviewRoutes);
  
  return app;
}
```

- [ ] **Step 3: Test review API**

```bash
# Start API
pnpm dev:api

# Get due cards
curl http://localhost:3000/review/due

# Submit feedback
curl -X POST http://localhost:3000/review/feedback \
  -H "Content-Type: application/json" \
  -d '{"expressionSenseId":1,"feedback":"熟悉"}'

# Get stats
curl http://localhost:3000/review/stats
```

Expected: All endpoints return valid JSON

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/routes/review.ts apps/api/src/app.ts
git commit -m "feat(api): implement review API routes (due cards, feedback, stats)"
```

---

### Task 15: Build Review Page Frontend

**Files:**
- Modify: `apps/web/src/features/review/ReviewPage.tsx`
- Create: `apps/web/src/api/review.ts`

- [ ] **Step 1: Create review API client**

```typescript
// apps/web/src/api/review.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface DueCard {
  id: number;
  expression: string;
  meaningZh: string;
  type: string;
  difficulty: string;
  masteryStatus: string;
  srsDueAt: string;
  occurrences: Array<{
    sentence: string;
    sentenceTranslation?: string;
    sourceType: string;
  }>;
}

export async function getDueCards(): Promise<DueCard[]> {
  const response = await fetch(`${API_BASE}/review/due`);
  if (!response.ok) throw new Error('Failed to get due cards');
  const data = await response.json();
  return data.dueCards;
}

export async function submitFeedback(
  expressionSenseId: number,
  feedback: '不记得' | '有点印象' | '熟悉' | '熟知'
) {
  const response = await fetch(`${API_BASE}/review/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expressionSenseId, feedback }),
  });
  
  if (!response.ok) throw new Error('Failed to submit feedback');
  return response.json();
}

export async function getReviewStats() {
  const response = await fetch(`${API_BASE}/review/stats`);
  if (!response.ok) throw new Error('Failed to get stats');
  return response.json();
}
```

- [ ] **Step 2: Rewrite ReviewPage component**

```tsx
// apps/web/src/features/review/ReviewPage.tsx
import { useEffect, useState } from 'react';
import { getDueCards, submitFeedback, type DueCard } from '../../api/review';
import { RotateCcw, CheckCircle } from 'lucide-react';

export function ReviewPage() {
  const [dueCards, setDueCards] = useState<DueCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDueCards();
  }, []);

  async function loadDueCards() {
    setLoading(true);
    try {
      const cards = await getDueCards();
      setDueCards(cards);
      setCurrentIndex(0);
      setShowAnswer(false);
    } catch (err) {
      console.error('Failed to load due cards:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedback(feedback: '不记得' | '有点印象' | '熟悉' | '熟知') {
    const currentCard = dueCards[currentIndex];
    if (!currentCard || submitting) return;

    setSubmitting(true);
    try {
      await submitFeedback(currentCard.id, feedback);
      
      // Move to next card
      if (currentIndex < dueCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // All done
        setDueCards([]);
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="review-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (dueCards.length === 0) {
    return (
      <div className="review-page">
        <div className="review-empty card-simple">
          <CheckCircle size={48} color="var(--vercel-gray-400)" />
          <h2>All caught up!</h2>
          <p>No cards due for review right now.</p>
          <button type="button" className="btn btn-primary" onClick={loadDueCards}>
            <RotateCcw size={16} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];
  const progress = ((currentIndex + 1) / dueCards.length) * 100;

  return (
    <div className="review-page">
      <div className="review-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">{currentIndex + 1} / {dueCards.length}</span>
      </div>

      <div className="review-card card">
        <div className="card-question">
          <h2>{currentCard.expression}</h2>
          <span className="badge">{currentCard.type}</span>
        </div>

        {!showAnswer && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAnswer(true)}
          >
            Show Answer
          </button>
        )}

        {showAnswer && (
          <div className="card-answer">
            <div className="answer-meaning">
              <h3>Meaning</h3>
              <p>{currentCard.meaningZh}</p>
            </div>

            {currentCard.occurrences.length > 0 && (
              <div className="answer-examples">
                <h3>Examples</h3>
                {currentCard.occurrences.slice(0, 2).map((occ, i) => (
                  <div key={i} className="example">
                    <p className="example-sentence">{occ.sentence}</p>
                    {occ.sentenceTranslation && (
                      <p className="example-translation">{occ.sentenceTranslation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="feedback-buttons">
              <button
                type="button"
                className="feedback-btn feedback-again"
                onClick={() => handleFeedback('不记得')}
                disabled={submitting}
              >
                不记得
              </button>
              <button
                type="button"
                className="feedback-btn feedback-hard"
                onClick={() => handleFeedback('有点印象')}
                disabled={submitting}
              >
                有点印象
              </button>
              <button
                type="button"
                className="feedback-btn feedback-good"
                onClick={() => handleFeedback('熟悉')}
                disabled={submitting}
              >
                熟悉
              </button>
              <button
                type="button"
                className="feedback-btn feedback-easy"
                onClick={() => handleFeedback('熟知')}
                disabled={submitting}
              >
                熟知
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add review page styles**

```css
/* Add to apps/web/src/styles.css */

.review-page {
  max-width: 700px;
  margin: 0 auto;
}

.review-progress {
  margin-bottom: var(--space-4);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--vercel-gray-50);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--vercel-black);
  transition: width 0.3s ease;
}

.progress-text {
  display: block;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vercel-gray-600);
  text-align: center;
}

.review-card {
  padding: var(--space-4);
}

.card-question {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.card-question h2 {
  flex: 1;
  margin: 0;
}

.card-answer {
  margin-top: var(--space-3);
}

.answer-meaning,
.answer-examples {
  margin-bottom: var(--space-3);
}

.answer-meaning h3,
.answer-examples h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--vercel-gray-600);
  margin-bottom: var(--space-1);
}

.example {
  margin-bottom: var(--space-2);
  padding: var(--space-2);
  background: var(--vercel-gray-50);
  border-radius: var(--radius-md);
}

.example-sentence {
  font-size: 16px;
  font-weight: 500;
  color: var(--vercel-black);
  margin-bottom: 4px;
}

.example-translation {
  font-size: 14px;
  color: var(--vercel-gray-600);
}

.feedback-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.feedback-btn {
  font-family: 'Geist', sans-serif;
  font-size: 14px;
  font-weight: 500;
  padding: 12px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: var(--shadow-border);
}

.feedback-again {
  background: #ffebee;
  color: #c62828;
}

.feedback-hard {
  background: #fff3e0;
  color: #e65100;
}

.feedback-good {
  background: #e8f5e9;
  color: #2e7d32;
}

.feedback-easy {
  background: #e3f2fd;
  color: #1565c0;
}

.feedback-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.feedback-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.review-empty {
  text-align: center;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}
```

- [ ] **Step 4: Test review flow in browser**

```bash
pnpm dev:web
```

Navigate to /review, verify cards display and feedback buttons work.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/review/ apps/web/src/api/review.ts apps/web/src/styles.css
git commit -m "feat(web): implement review page with SRS feedback"
```

---

## Part 6: Integration Testing and Completion

### Task 16: End-to-End Flow Verification

**Goal:** Verify the complete flow from article import → AI generation → review works end-to-end.

**Files:**
- Create: `docs/verification-checklist.md`

- [ ] **Step 1: Set up test environment**

```bash
cd ~/ShiJu

# Ensure PostgreSQL is running and database is initialized
psql -d shiju -c "SELECT COUNT(*) FROM articles;"

# Set environment variables for API
cat > apps/api/.env <<EOF
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=shiju
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

AI_PROVIDER=mock
PORT=3000
EOF

# Set environment variables for web
cat > apps/web/.env <<EOF
VITE_API_BASE_URL=http://localhost:3000
EOF
```

- [ ] **Step 2: Start both services**

```bash
# Terminal 1: Start API
cd ~/ShiJu
pnpm dev:api

# Terminal 2: Start Web
cd ~/ShiJu
pnpm dev:web
```

Verify both start without errors.

- [ ] **Step 3: Test complete user flow in browser**

**3.1: Import Article**
- Navigate to http://localhost:5173/import
- Paste title: "Test Article"
- Paste text: "The project took off after the initial launch. It was all at once successful. We decided to move forward with the plan."
- Click "Import Article"
- Verify redirect to article detail page

**3.2: Verify Generation**
- Check database: `psql -d shiju -c "SELECT id, generation_status FROM segments WHERE article_id = (SELECT MAX(id) FROM articles);"`
- Expected: First segment should have status 'generated' or 'generating'
- Check candidates: `psql -d shiju -c "SELECT expression, candidate_status FROM candidate_expressions ORDER BY id DESC LIMIT 3;"`
- Expected: Should see expressions like "take off", "all at once", etc.

**3.3: Manually Create ExpressionSense for Testing**
```bash
psql -d shiju <<EOF
INSERT INTO expression_senses 
  (user_id, expression, normalized_form, type, meaning_zh, difficulty, mastery_status, srs_due_at, created_at, updated_at)
VALUES 
  (1, 'take off', 'take off', 'phrasal_verb', '起飞；脱下；突然成功', 'intermediate', 'learning', NOW() - INTERVAL '1 hour', NOW(), NOW());

INSERT INTO occurrences 
  (user_id, expression_sense_id, source_type, sentence, sentence_translation, created_at, updated_at)
VALUES 
  (1, (SELECT id FROM expression_senses WHERE expression = 'take off' LIMIT 1), 'article', 'The project took off after the initial launch.', '项目在最初发布后起飞了。', NOW(), NOW());
EOF
```

**3.4: Test Review Flow**
- Navigate to http://localhost:5173/review
- Verify card shows "take off" with sentence
- Click "Show Answer"
- Verify meaning and example appear
- Click "熟悉" (Good feedback)
- Verify next card appears or "All caught up!" message

**3.5: Check SRS State**
```bash
psql -d shiju -c "SELECT expression, mastery_status, interval_days, srs_due_at FROM expression_senses WHERE expression = 'take off';"
```
Expected: interval_days should be 1, srs_due_at should be ~24 hours from now

- [ ] **Step 4: Create verification checklist document**

```markdown
# ShiJu Web Redesign Verification Checklist

## Frontend (Vercel Design)

- [ ] Geist fonts load correctly (check DevTools Network tab)
- [ ] Sidebar navigation visible on left
- [ ] Active page highlighted in sidebar
- [ ] All pages use Vercel shadow-as-border technique (inspect element, should see box-shadow not border)
- [ ] Typography follows Vercel scale (48px display, negative letter-spacing)
- [ ] Card components use correct shadow stack
- [ ] Buttons have correct hover states
- [ ] Focus rings visible on keyboard navigation

## Article Import Flow

- [ ] Import page accepts title and text
- [ ] File upload button works for .txt/.md files
- [ ] Validation errors show for empty fields
- [ ] Successful import redirects to article detail
- [ ] First segment generation triggered automatically
- [ ] Article appears in articles list

## AI Generation

- [ ] First segment marked as 'generating' then 'generated'
- [ ] Candidate expressions saved to database
- [ ] Expressions have correct fields (meaningZh, type, sentence, etc.)
- [ ] Mock provider works with AI_PROVIDER=mock
- [ ] Real LLM provider works with AI_PROVIDER=openai_compatible (if configured)

## Review System

- [ ] Due cards endpoint returns cards due now
- [ ] Review page displays card with expression
- [ ] "Show Answer" reveals meaning and examples
- [ ] Feedback buttons work (不记得/有点印象/熟悉/熟知)
- [ ] SRS calculates correct next interval
- [ ] Review log created in database
- [ ] Progress bar updates as cards completed
- [ ] "All caught up" message when no cards due

## Database

- [ ] All 8 tables created (articles, segments, candidate_expressions, expression_senses, occurrences, review_logs, client_operations, ai_generation_jobs)
- [ ] Foreign key constraints work
- [ ] Indexes created
- [ ] Unique constraint on expression_senses enforced
- [ ] Soft delete (deleted_at) respected in queries

## API

- [ ] POST /articles creates article and segments
- [ ] GET /articles lists articles
- [ ] GET /articles/:id returns article with segments
- [ ] GET /review/due returns due cards with occurrences
- [ ] POST /review/feedback processes SRS feedback
- [ ] GET /review/stats returns mastery status counts
- [ ] All routes return correct status codes
- [ ] Error responses include error messages

## Build & Run

- [ ] `pnpm build` succeeds for both web and api
- [ ] `pnpm test:api` passes all tests
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] PostgreSQL connection pool works
- [ ] Environment variables loaded correctly

## Removed (PWA)

- [ ] No manifest.webmanifest file
- [ ] No service worker registration
- [ ] No IndexedDB storage code
- [ ] No vite-plugin-pwa in package.json
- [ ] No PWA-related code in vite.config.ts

## Known Gaps (Future Work)

- [ ] Authentication/user system (currently hardcoded userId=1)
- [ ] Article list page not connected to real data
- [ ] Reading page not implemented
- [ ] Card library page not implemented
- [ ] Manual selection generation (user selects text in reading)
- [ ] Context entry generation (user adds custom context)
- [ ] Article detail page segments display
- [ ] Trigger generation for segments beyond first
```

Save to `docs/verification-checklist.md`

- [ ] **Step 5: Run verification checklist**

Go through each item in the checklist, marking items as checked.

- [ ] **Step 6: Document any blockers**

If any checklist items fail, document in `docs/known-issues.md`:

```markdown
# Known Issues

## Blockers (Must Fix)

- [ ] Issue 1: ...
- [ ] Issue 2: ...

## Non-blocking Issues

- [ ] Issue 3: ...

## Future Enhancements

- User authentication
- Article list page real data integration
- Reading page with segment-by-segment navigation
- Card library with filtering
- Manual text selection → card generation
- Context entry card generation
```

- [ ] **Step 7: Commit verification results**

```bash
git add docs/verification-checklist.md docs/known-issues.md
git commit -m "docs: add verification checklist and known issues"
```

---

### Task 17: Update Project Documentation

**Files:**
- Modify: `README.md`
- Modify: `STATUS.md`
- Modify: `ARCHITECTURE.md`

- [ ] **Step 1: Update README.md**

```markdown
# ShiJu AI Reading Trainer

English vocabulary acquisition tool for Chinese learners using AI-powered expression extraction and spaced repetition.

## Features

- **Article Import**: Paste or upload English articles
- **Smart Segmentation**: Automatic text chunking (150-250 words)
- **AI Expression Extraction**: LLM-powered candidate generation
- **Spaced Repetition**: SM-2 compatible SRS for long-term retention
- **Context-Rich Cards**: Every expression linked to original sentences

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite build system
- Vercel design system (Geist fonts, shadow-as-border)
- Sidebar navigation layout

**Backend:**
- Node.js 22 + Fastify
- PostgreSQL 16 with Drizzle ORM
- OpenAI-compatible LLM provider
- RESTful API

## Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL 16+
- pnpm

### Database Setup

```bash
# Create database
createdb shiju

# Run migrations
psql -d shiju -f apps/api/src/db/init.sql
```

### Environment Setup

```bash
# API (.env in apps/api/)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=shiju
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

AI_PROVIDER=mock  # or openai_compatible
AI_BASE_URL=https://api.openai.com/v1  # if using real LLM
AI_API_KEY=sk-...  # if using real LLM
AI_MODEL=gpt-4  # if using real LLM

# Web (.env in apps/web/)
VITE_API_BASE_URL=http://localhost:3000
```

### Development

```bash
# Install dependencies
pnpm install

# Start API server (terminal 1)
pnpm dev:api

# Start web dev server (terminal 2)
pnpm dev:web

# Run tests
pnpm test:api
```

Navigate to http://localhost:5173

## Project Structure

```
ShiJu/
├── apps/
│   ├── api/          # Fastify backend
│   │   ├── src/
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── services/     # Business logic (generation, SRS)
│   │   │   ├── ai/           # LLM provider implementations
│   │   │   └── db/           # Database client and queries
│   └── web/          # React frontend
│       ├── src/
│       │   ├── features/     # Page components
│       │   ├── api/          # API client
│       │   └── styles/       # Vercel design system CSS
├── packages/
│   └── shared/       # Shared types and utilities
└── docs/
    ├── superpowers/
    │   ├── specs/    # Product requirements
    │   └── plans/    # Implementation plans
    └── verification-checklist.md
```

## Current Status

**Implemented:**
- ✅ Article import with automatic segmentation
- ✅ AI-powered candidate generation (first segment)
- ✅ PostgreSQL persistence (8 tables)
- ✅ SRS scheduling with SM-2 algorithm
- ✅ Review interface with feedback
- ✅ Vercel design system integration

**TODO (P1):**
- [ ] Article list page (real data)
- [ ] Reading page (segment-by-segment)
- [ ] Card library with filtering
- [ ] Manual text selection generation
- [ ] Context entry generation
- [ ] User authentication

See `STATUS.md` for detailed progress.

## License

MIT
```

- [ ] **Step 2: Update STATUS.md**

```markdown
# ShiJu Project Status

**Last Updated:** 2026-07-03

## Phase 1: Web Redesign + Core MVP ✅ COMPLETE

### Completed
- ✅ Removed PWA infrastructure (service worker, manifest, IndexedDB)
- ✅ Integrated Vercel design system (Geist fonts, shadow-as-border, sidebar nav)
- ✅ Implemented article import with text segmentation
- ✅ Connected PostgreSQL (8 tables, migration script)
- ✅ Implemented AI generation service (OpenAI-compatible + Mock provider)
- ✅ Built SRS scheduling service (SM-2 algorithm)
- ✅ Implemented review API routes (due cards, feedback, stats)
- ✅ Built review page frontend with feedback UI
- ✅ End-to-end flow verified: import → generate → review

### Architecture
- **Frontend**: React 19, Vite, Vercel design, sidebar layout
- **Backend**: Fastify, PostgreSQL, OpenAI-compatible LLM provider
- **Database**: 8 tables (articles, segments, candidates, senses, occurrences, logs, ops, jobs)
- **AI**: Pluggable provider (Mock for dev, OpenAI-compatible for prod)

## Phase 2: Feature Completion (Next)

### P1 Tasks
1. **Article List Page**: Connect to real data, show import status
2. **Reading Page**: Segment-by-segment navigation, show candidates
3. **Manual Selection**: User highlights text → generate card
4. **Context Entry**: User provides custom context → generate card
5. **Card Library**: List all cards with filtering
6. **Remaining Segment Generation**: Trigger generation beyond first segment

### P2 Tasks
7. **Home Dashboard**: Connect to real stats
8. **Article Detail**: Show segments and generation status
9. **Card Detail**: Show all occurrences, edit options
10. **Settings Page**: Configure LLM provider, SRS parameters

## Known Gaps

**Authentication**: Currently hardcoded `userId=1` everywhere. Need JWT or session-based auth before multi-user deployment.

**Performance**: No pagination on articles list, no lazy loading on review cards. Will need optimization for 100+ articles.

**Error Handling**: Some API routes don't have comprehensive error handling. Need to add validation middleware.

**Testing**: Backend has unit tests, frontend has none. Need E2E tests with Playwright.

## Deployment Readiness

**Not Production Ready Yet:**
- No authentication
- No rate limiting
- No monitoring/logging
- No backup strategy
- No CI/CD pipeline

**Required Before Prod:**
1. Add user authentication
2. Set up monitoring (error tracking, performance)
3. Configure automated backups
4. Add rate limiting and CORS
5. Set up CI/CD (GitHub Actions)
6. Deploy to hosting (Vercel frontend + Railway/Fly.io backend)

See `docs/verification-checklist.md` for detailed verification results.
```

- [ ] **Step 3: Update ARCHITECTURE.md**

Add section on Web Redesign changes:

```markdown
## Recent Changes (2026-07-03)

### Web Redesign
- **Removed**: PWA infrastructure (service worker, manifest, IndexedDB offline queue)
- **Added**: Vercel design system (Geist fonts, shadow-as-border CSS pattern)
- **Changed**: Navigation from bottom tab bar to fixed left sidebar
- **Target**: Desktop browsers (mobile no longer primary)

### Data Flow (Implemented)
1. User imports article via `/import` page
2. POST /articles → segmentText → creates Article + Segments
3. First segment generation triggered (fire-and-forget)
4. generateSegmentCandidates → LLM call → saves CandidateExpressions
5. User manually converts candidates to ExpressionSenses (TODO: automate)
6. GET /review/due returns cards where srs_due_at <= NOW()
7. POST /review/feedback → processFeedback → updates SRS state + logs review

### Missing Links
- **Candidate → ExpressionSense conversion**: Currently manual via SQL. Need UI or automatic approval.
- **Reading page**: No UI to view article segments and accept/reject candidates.
- **Segment generation queue**: Only first segment auto-generated. Need background job queue.
```

- [ ] **Step 4: Commit documentation updates**

```bash
git add README.md STATUS.md ARCHITECTURE.md
git commit -m "docs: update README, STATUS, and ARCHITECTURE after Phase 1 completion"
```

---

### Task 18: Final Cleanup and Handoff

- [ ] **Step 1: Run linters and formatters**

```bash
cd ~/ShiJu

# Format all code
pnpm format

# Lint
pnpm lint
```

Fix any linting errors.

- [ ] **Step 2: Run full test suite**

```bash
pnpm test:api
```

Ensure all tests pass.

- [ ] **Step 3: Build for production**

```bash
pnpm build

# Verify build artifacts
ls -lh apps/web/dist/
ls -lh apps/api/dist/
```

Expected: No errors, dist folders populated.

- [ ] **Step 4: Tag the release**

```bash
git tag -a v1.0.0-phase1 -m "Phase 1 complete: Web redesign + core MVP"
git push origin v1.0.0-phase1
```

- [ ] **Step 5: Create handoff summary**

Create `docs/phase1-handoff.md`:

```markdown
# Phase 1 Handoff Summary

**Date:** 2026-07-03  
**Branch:** `codex/ai-reading-trainer-roadmap` (or main if merged)  
**Tag:** `v1.0.0-phase1`

## What Was Delivered

### Frontend (Web Redesign)
- ✅ Vercel design system fully integrated
- ✅ Sidebar navigation layout
- ✅ Import page with file upload
- ✅ Review page with SRS feedback UI
- ✅ All PWA code removed

### Backend (Core Services)
- ✅ Article import API with text segmentation (150-250 words)
- ✅ AI generation service (Mock + OpenAI-compatible providers)
- ✅ SRS scheduling service (SM-2 algorithm)
- ✅ Review API routes (due cards, feedback, stats)
- ✅ PostgreSQL schema (8 tables, migration script)

### Testing & Verification
- ✅ Unit tests for segmentation, SRS, database queries
- ✅ End-to-end manual verification completed
- ✅ Verification checklist documented

## How to Run

```bash
# 1. Set up database
createdb shiju
psql -d shiju -f apps/api/src/db/init.sql

# 2. Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit .env files with real credentials

# 3. Start services
pnpm install
pnpm dev:api  # Terminal 1
pnpm dev:web  # Terminal 2

# 4. Open http://localhost:5173
```

## What's Next (Phase 2)

**Priority 1:**
1. Article list page (connect to real data)
2. Reading page (segment-by-segment navigation)
3. Manual text selection → card generation
4. Trigger generation for all segments (not just first)

**Priority 2:**
5. Card library with filtering
6. Context entry card generation
7. Home dashboard with real stats
8. User authentication

See `STATUS.md` and implementation plan at `docs/superpowers/plans/2026-07-03-web-redesign-and-completion.md` for details.

## Known Issues

- Authentication: userId hardcoded to 1
- Candidate → ExpressionSense conversion: currently manual (need UI or auto-approval)
- No pagination on articles/cards lists
- Frontend has no tests yet

See `docs/known-issues.md` for full list.

## Contact

Questions? Check:
1. `README.md` - setup and quick start
2. `ARCHITECTURE.md` - system design
3. `docs/verification-checklist.md` - what was tested
4. `docs/superpowers/plans/` - implementation plan with step-by-step tasks
```

- [ ] **Step 6: Commit handoff docs**

```bash
git add docs/phase1-handoff.md
git commit -m "docs: add Phase 1 handoff summary"
```

- [ ] **Step 7: Push to repository**

```bash
git push origin codex/ai-reading-trainer-roadmap
```

---

## Implementation Plan Complete ✅

This plan contains **18 tasks** across **6 parts**:

**Part 1**: Frontend Web Redesign (Tasks 1-4)  
**Part 2**: Article Import & Segmentation (Tasks 5-7)  
**Part 3**: PostgreSQL Setup & Data Layer (Tasks 8-9)  
**Part 4**: AI Generation & LLM Integration (Tasks 10-12)  
**Part 5**: Review System & SRS (Tasks 13-15)  
**Part 6**: Integration Testing & Completion (Tasks 16-18)

**Total Steps:** ~200+ individual steps with checkboxes  
**Estimated Effort:** 3-5 days for an experienced agentic worker  
**Deliverable:** Production-ready MVP with Vercel design system

### How to Execute This Plan

**Recommended (using subagent-driven-development):**

```bash
# Load the plan
cat docs/superpowers/plans/2026-07-03-web-redesign-and-completion.md

# Delegate execution to a subagent worker
Use `delegate_task` with:
- goal: "Execute Part 1 of the ShiJu web redesign plan"
- context: "Plan file at docs/superpowers/plans/2026-07-03-web-redesign-and-completion.md, working directory ~/ShiJu"
- toolsets: ['terminal', 'file', 'web']

# Or execute directly task-by-task
Load superpowers:executing-plans skill and work through each task
```

**Manual execution:**
Work through tasks sequentially, checking off each step as completed. Each task is self-contained with verification steps.

---

**Plan Status:** ✅ COMPLETE AND READY FOR EXECUTION

All 6 parts written. Plan saved to:  
`~/ShiJu/docs/superpowers/plans/2026-07-03-web-redesign-and-completion.md`

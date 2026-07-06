# ShiJu - Agent Working Rules

**Last Updated**: 2026-06-15  
**Purpose**: 强制执行的代码修改和调试规范，防止低质量修复和隐性 bug。

---

## 文档优先级

进入项目时的阅读顺序：
1. **STATUS.md** — 当前状态、已完成任务、下一步
2. **AGENTS.md** — 本文件，工作规范和约束
3. **README.md** — 项目简介、技术栈、快速开始
4. **ARCHITECTURE.md** — 系统架构、数据模型、设计决策

修改代码前必须先读：
- **API_RULES.md** — LLM API 调用规范（强制执行）
- 相关模块的源码（不要猜测实现）

---

## Rule 0 — Two-Track Ownership Boundary

**Codex 本地轨（本仓库）**：
- ✅ 前端 PWA 实现
- ✅ 后端 API 契约定义
- ✅ Mock AI providers
- ✅ 数据库 schema 和 migrations
- ✅ 本地测试和浏览器验证
- ✅ 文档和交接规格

**Server Agent 轨（尚未启动）**：
- ❌ 云服务器部署
- ❌ 真实 LLM API 集成
- ❌ 密钥管理
- ❌ HTTPS 和进程管理
- ❌ 日志和备份

**强制约束**：
- Codex **不得**部署到服务器
- Codex **不得**连接真实 LLM API（只能用 mock provider）
- Codex **不得**处理生产密钥
- Codex **不得**配置 HTTPS 或反向代理

**正确做法**：
- 定义 API 契约（接口、请求/响应格式、错误处理）
- 实现 mock provider 返回确定性结果
- 编写 schema 和 migrations
- 编写服务器交接文档（`docs/deployment/server-agent-handoff.md`）

---

## Rule 1 — Think Before Coding

No silent assumptions. State what you're assuming. Surface tradeoffs. Ask before guessing. Push back when a simpler approach exists.

**ShiJu 具体要求**：
- 修改 AI 生成流程前，先读 `docs/superpowers/specs/2026-06-13-ai-reading-trainer-v1-design.md` 确认设计意图
- 修改 SRS 调度前，先读 `packages/domain/src/srs.ts` 理解 SM-2 变体的实现
- 修改数据库操作前，先读 `apps/api/src/db/schema.sql` 确认表结构和约束
- 发现设计规格和代码不一致时，先问用户哪个是对的，不要自作主张

---

## Rule 2 — Simplicity First

Minimum code that solves the problem. No speculative features. No abstractions for single-use code.

**ShiJu 具体要求**：
- V1 只支持五种候选状态（selected, backup_candidate, ignored_too_easy, ignored_duplicate, ignored_over_limit），不要添加第六种
- V1 不支持 PDF 导入、网页导入、多用户系统、社区内容（详见 ARCHITECTURE.md "V1 不支持"章节）
- Mock provider 返回确定性结果即可，不要实现完整的 LLM 模拟逻辑
- 内存任务队列够用就行，不要现在就引入 BullMQ

---

## Rule 3 — Surgical Changes

Touch only what you must. Don't "improve" adjacent code, comments, or formatting. Don't refactor what isn't broken. Match existing style.

**ShiJu 具体要求**：
- 代码风格：ESM everywhere, strict TypeScript, 函数式优先
- 命名约定：camelCase（TypeScript/JavaScript）, snake_case（PostgreSQL）
- 不要在修 bug 时顺便重构周围代码
- 不要在添加功能时修改不相关的文件

---

## Rule 4 — Goal-Driven Execution

Define success criteria. Loop until verified.

**ShiJu 具体要求**：
- 添加新功能后，必须运行对应的测试套件：
  - 前端：`pnpm test:web`
  - 后端：`pnpm test:api`
  - 领域逻辑：`pnpm test:domain`
- 修改 AI Provider 后，必须运行 `pnpm test:llm`（需要真实 API key，本地轨跳过）
- 前端修改后，必须浏览器验证关键流程（阅读页、复习页、卡片库）
- 后端修改后，必须验证 API 响应格式符合契约

---

## Rule 5 — LLM API Calls Must Follow API_RULES.md

**强制规范**（详见 `API_RULES.md`）：

✅ **允许**：
- 通过 `apps/api/src/lib/llmClient.ts` 的 `callLLM()` 调用 LLM
- 从环境变量读取配置（`apps/api/src/config.ts`）
- 使用 `LLMError` 分类错误（CONFIG_MISSING, AUTH_FAILED, MODEL_NOT_FOUND, NETWORK_ERROR, INVALID_RESPONSE, RATE_LIMIT, UNKNOWN）
- 使用 mock provider（`AI_PROVIDER=mock`）进行本地开发

❌ **禁止**：
- 直接 `fetch()` 或 `axios()` 调用 LLM API
- 硬编码 API URL、key、model
- 在业务逻辑中包含 API 细节
- 使用静默回退（silent fallback）隐藏配置错误
- 在 Codex 本地轨连接真实 LLM API

**调用链**：
```
业务服务 (generationService.ts)
    ↓
AI Provider 接口 (ai/provider.ts)
    ↓
Mock Provider (ai/mockProvider.ts) 或 OpenAI 兼容 Provider (ai/openAiCompatibleProvider.ts)
    ↓
统一 LLM 客户端 (lib/llmClient.ts)
    ↓
真实 LLM API (仅 Server Agent 轨)
```

---

## Rule 6 — ExpressionSense Uniqueness

**核心约束**：ExpressionSense 的唯一性基于 `(user_id, normalized_form, type, meaning_zh)`，不是原始字符串。

**允许的情况**：
- 同一表达式有多个不同含义的卡片
- 例如：`take off / phrasal_verb / 飞机离地`、`take off / phrasal_verb / 脱衣服`、`take off / phrasal_verb / 突然成功`

**禁止的操作**：
- 按原始字符串去重（会误删不同含义的卡片）
- 修改唯一性约束为 `(user_id, expression)`

**数据库约束**（`apps/api/src/db/schema.sql`）：
```sql
UNIQUE (user_id, normalized_form, type, meaning_zh) 
WHERE deleted_at IS NULL
```

---

## Rule 7 — Reading Feedback ≠ Review Feedback

**强制分离**：
- 阅读页面的操作（`add_to_review`, `known`, `too_easy`, `bad_explanation`）**不影响 SRS 间隔**
- 只有复习页面的反馈（`unknown`, `fuzzy`, `known`, `mastered`）才推进间隔

**理由**：避免"看到释义"被误认为"记住了"。阅读页面用于理解和分流，复习页面用于正式主动回忆。

**实现检查**：
- `apps/web/src/features/reading/readingState.ts` 不得调用 `packages/domain/src/srs.ts` 的 `computeNextReview()`
- `apps/web/src/features/review/reviewState.ts` 必须调用 `computeNextReview()`

---

## Rule 8 — Read Before You Write

Before adding code in a file, read the file's exports, the immediate caller, and any obvious shared utilities. If you don't understand why existing code is structured the way it is, ask before adding to it.

**ShiJu 具体要求**：
- 修改 `generationService.ts` 前，先读 `ai/provider.ts` 接口定义
- 修改前端组件前，先读 `fixtures/sampleSegment.ts` 确认数据结构
- 修改数据库查询前，先读 `db/schema.sql` 确认字段名和约束
- 添加新路由前，先读 `app.ts` 确认现有路由注册方式

---

## Rule 9 — Tests Verify Intent, Not Just Behavior

Every test must encode WHY the behavior matters, not just WHAT it does. If you can't write a test that would fail when business logic changes, the function is wrong.

**ShiJu 具体要求**：
- SRS 测试必须验证间隔增长逻辑，不只是"调用函数返回了结果"
- Sync 测试必须验证幂等性（重复上传同一 client_operation_id 不重复执行）
- Candidate 状态测试必须验证分类规则（为什么是 selected 而不是 backup_candidate）
- Schema 测试必须验证唯一性约束（插入重复数据会失败）

---

## Rule 10 — Checkpoint After Every Significant Step

After completing each step: summarize what was done, what's verified, what's left. Don't continue from a state you can't describe back to me.

**ShiJu 具体要求**：
- 完成一个 Task 后，更新 `docs/development/STATUS.md` 的已完成任务列表
- 添加新表或修改 schema 后，运行 `pnpm test:api` 验证约束
- 添加新 AI 生成路径后，编写对应的 mock provider 和集成测试
- 部署前运行完整测试套件：`pnpm test`

---

## Rule 11 — Match the Codebase's Conventions

If the codebase uses snake_case and you'd prefer camelCase: snake_case. Disagreement is a separate conversation. Inside the codebase, conformance > taste.

**ShiJu 代码风格**：
- TypeScript/JavaScript：camelCase（函数、变量）、PascalCase（类型、组件）
- PostgreSQL：snake_case（表名、字段名）
- 文件命名：camelCase.ts（如 `generationService.ts`）
- React 组件：PascalCase.tsx（如 `ReadingPage.tsx`）
- 测试文件：同名 + `.test.ts`（如 `srs.test.ts`）

**Import 顺序**：
1. 外部依赖（React, Fastify）
2. 内部模块（相对路径）
3. 类型导入（分离）

---

## Rule 12 — Fail Loud

If you can't be sure something worked, say so explicitly. Default to surfacing uncertainty, not hiding it.

**ShiJu 具体要求**：
- LLM API 调用失败时，抛出 `LLMError` 并分类错误类型，不要返回空结果
- 数据库插入违反唯一性约束时，捕获异常并告知用户"卡片已存在"，不要静默忽略
- 配置缺失时，启动时立即抛出异常，不要使用 `AI_PROVIDER ?? 'mock'` 静默回退
- 同步失败时，标记 `sync_status='failed'` 并显示在 UI，不要假装成功

---

## 核心设计原则

### 1. 离线优先
- IndexedDB 作为本地缓存和操作队列
- 操作立即写入队列，后台自动同步
- 同步失败不阻塞用户继续使用
- 手机丢失后，已同步数据不丢失

### 2. 学习者自主权
- AI 预选 2-4 个主高亮，但学习者可以：
  - 查看"更多表达式"区域的备选候选
  - 手动选择 AI 未高亮的文本生成卡片
  - 输入游戏/编程/工作等真实场景的表达式生成卡片
- 每日新卡推荐 6 张（软限制），但不强制阻止

### 3. 表达式 > 句子
- SRS 调度的是 ExpressionSense（expression + type + meaning）
- 句子作为语境证据存储在 Occurrence 中
- 允许同一表达式有多个不同含义的卡片

### 4. 阅读 ≠ 复习
- 阅读页面：理解原文、分流表达式、轻量释义
- 复习页面：主动回忆、正式反馈、推进间隔
- 阅读页面的操作不影响 SRS 间隔

### 5. 生成元数据追溯
- 所有 AI 生成必须记录：
  - model_provider
  - model_name
  - prompt_version
  - generation_version
  - generated_at
- 用于后续调试和质量改进

---

## 项目特定约束

### 前端约束
- **移动优先**：UI 设计针对手机屏幕，桌面次要
- **PWA 必需**：支持离线使用、安装到主屏幕
- **IndexedDB 必需**：不能依赖 localStorage（容量限制）
- **Fixture 模式**：当前阶段使用 `fixtures/sampleSegment.ts`，不连接真实后端
### 后端约束

- **Mock Provider 优先**：本地开发使用 `AI_PROVIDER=mock`
- **PostgreSQL 必需**：不能改用 SQLite 或 MongoDB
- **幂等性必需**：所有写操作通过 `client_operation_id` 去重
- **轻量级队列**：当前阶段内存队列够用，不要引入 Redis/BullMQ
- **camelCase 契约强制**：所有对外 API 接口必须返回 camelCase，数据库行一律经 `apps/api/src/lib/dbRowTransformer.ts` 出口转换。禁止在路由层手动逐字段映射（散点补丁），禁止返回 snake_case。前后端共享类型通过 `@art/domain` monorepo 包，确保编译期契约一致性。参考：Google JSON Style Guide

### 数据模型约束
- **软删除**：使用 `deleted_at` 字段，不物理删除
- **时间戳**：所有表必须有 `created_at` 和 `updated_at`
- **用户隔离**：所有查询必须包含 `WHERE user_id = ?`
- **唯一性约束**：必须包含 `WHERE deleted_at IS NULL`

---

## 违规处理

**如果发现自己违反了规则**：
1. 立刻停止当前操作
2. 告诉用户"我刚才违反了 Rule X，需要重新来"
3. 回到正确的流程

**如果用户发现你违反了规则**：
1. 承认错误
2. 解释为什么会违反（是理解错了还是忘记了）
3. 重新按规则执行

---

## 常见陷阱

### 陷阱 1：直接调用 LLM API
**错误做法**：
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: { Authorization: 'Bearer sk-...' }
});
```

**正确做法**：
```typescript
import { callLLM } from '../lib/llmClient';
const result = await callLLM(config, { messages: [...] });
```

### 陷阱 2：按原始字符串去重 ExpressionSense
**错误做法**：
```sql
SELECT * FROM expression_senses 
WHERE user_id = ? AND expression = ?
```

**正确做法**：
```sql
SELECT * FROM expression_senses 
WHERE user_id = ? 
  AND normalized_form = ? 
  AND type = ? 
  AND meaning_zh = ?
  AND deleted_at IS NULL
```

### 陷阱 3：阅读页面反馈推进 SRS 间隔
**错误做法**：
```typescript
// readingState.ts
if (feedback === 'known') {
  const nextReview = computeNextReview(sense, 'known');
  updateSense({ ...sense, ...nextReview });
}
```

**正确做法**：
```typescript
// readingState.ts
if (feedback === 'known') {
  // 只标记为已知候选，不推进间隔
  updateCandidate({ status: 'known_candidate' });
}

// reviewState.ts
if (feedback === 'known') {
  // 复习页面才推进间隔
  const nextReview = computeNextReview(sense, 'known');
  updateSense({ ...sense, ...nextReview });
}
```

### 陷阱 4：在 Codex 本地轨连接真实 LLM API
**错误做法**：
```bash
# .env
AI_PROVIDER=openai_compatible
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-real-key-here
```

**正确做法**：
```bash
# .env (Codex 本地轨)
AI_PROVIDER=mock

# .env.example (Server Agent 参考)
AI_PROVIDER=openai_compatible
AI_BASE_URL=https://your-llm-provider.com
AI_API_KEY=your-key-here
AI_MODEL=claude-sonnet-4-6
```

---

## 文档维护

**这个文件是活的，不是死的。发现规则不够用，立刻补充。**

更新后通知用户：
- 添加了什么规则
- 为什么需要这个规则
- 影响哪些模块

---

**最后更新**：2026-06-15

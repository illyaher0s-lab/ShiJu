# ShiJu (拾句) - AI Reading Trainer

**一句话定义**：为成人英语学习者设计的 AI 辅助阅读工具，通过原文阅读 + 表达式提取 + 间隔复习闭环，让学习者在真实语境中积累可复用的英语表达。

---

## 核心理念

ShiJu 不是休闲阅读工具，也不是完整的英语学习平台。它验证一个核心假设：**学习者能否通过 AI 预处理的英文文章，在低摩擦阅读的同时收集有价值的表达式，并通过长期复习内化？**

核心学习对象不是句子，不是原始字符串，而是 **ExpressionSense**（一个表达 + 一个类型 + 一个含义）。句子作为语境证据存在于 **Occurrence** 中。

主循环：
1. 导入英文 TXT/Markdown 文章
2. 拆分为 150-250 词段落
3. AI 生成高亮表达式（优先生成第一段，后台生成剩余段落）
4. 学习者阅读原文，点击高亮获取轻量释义
5. 手动选择值得学习的表达加入 SRS
6. 定期复习到期卡片，主动回忆

---

## 当前状态

**阶段**：单用户生产运行  
**分支**：`codex/ai-reading-trainer-roadmap`  
**最后更新**：2026-07-07  
**访问地址**：http://43.128.11.119/shiju/

### ✅ 已实现
- 前端 Web 应用（React + Vite，Vercel 设计风格）
- 阅读页面：原文高亮、手动选择生成卡片
- 复习页面：SM-2 算法、4级反馈按钮
- 卡片库：ExpressionSense 列表、批量删除
- 文章导入：完整表单、自动分段
- 手动选择生成：真实 LLM 调用（OpenAI 兼容 API）
- 后端 API（Fastify + PostgreSQL，systemd 托管）
- SM-2 复习系统（GET /review/due, POST /review/feedback）
- 数据库持久化（8 张表）
- 每日数据库备份（2 AM，30天保留）

### ❌ 尚未实现
- 用户认证（当前硬编码 userId="user-1"）
- 语境卡片生成后端 API
- Article List 页面
- 离线 PWA 支持（已移除）
- HTTPS 配置

---

## 技术栈

### 前端
- React 19
- TypeScript
- Vite 6
- PWA (vite-plugin-pwa)
- IndexedDB (原生 API)

### 后端
- Node.js 22
- Fastify
- TypeScript
- PostgreSQL 16

### 工具链
- pnpm workspace (monorepo)
- ESM 全面启用
- 严格 TypeScript
- Vitest + Testing Library

---

## 项目结构

```
ShiJu/
├── apps/
│   ├── web/                    # 前端 PWA
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── reading/    # 阅读页、表达式弹层、手动选择工具栏
│   │   │   │   ├── review/     # 复习页、SRS 状态管理
│   │   │   │   ├── cards/      # 卡片库、语境卡片生成
│   │   │   │   └── import/     # 文章导入页
│   │   │   ├── fixtures/       # 本地 fixture 数据
│   │   │   ├── storage/        # IndexedDB、操作队列
│   │   │   └── App.tsx
│   │   └── package.json
│   └── api/                    # 后端 API
│       ├── src/
│       │   ├── ai/             # AI provider 接口、mock、OpenAI 兼容层
│       │   ├── db/             # PostgreSQL schema、客户端
│       │   ├── routes/         # articles, review, sync, manualSelection, contextGeneration
│       │   ├── services/       # 业务逻辑层
│       │   ├── lib/            # llmClient (统一 LLM 调用)
│       │   ├── app.ts
│       │   ├── server.ts
│       │   └── config.ts
│       └── package.json
├── packages/
│   └── domain/                 # 共享类型和 SRS 逻辑
│       ├── src/
│       │   ├── types.ts
│       │   ├── srs.ts
│       │   └── candidateStatus.ts
│       └── package.json
├── docs/
│   ├── superpowers/
│   │   ├── specs/              # V1 设计规格
│   │   └── plans/              # MVP 实施计划
│   ├── development/
│   │   ├── STATUS.md           # 开发状态（详细任务清单）
│   │   ├── local-mvp.md        # 本地验证指南
│   │   └── database.md         # 数据库 schema 说明
│   └── deployment/
│       └── server-agent-handoff.md  # 服务器部署交接文档
├── API_RULES.md                # LLM API 调用规范（强制执行）
├── README.md                   # 本文件
├── ARCHITECTURE.md             # 架构文档
├── STATUS.md                   # 项目当前状态（简要版）
└── package.json
```

---

## 本地开发

### 前端
```bash
pnpm install
pnpm dev:web          # http://localhost:5173
```

### 后端
```bash
pnpm dev:api          # http://localhost:3001
```

### 测试
```bash
pnpm test              # 全部测试
pnpm test:web          # 前端测试
pnpm test:api          # 后端测试
pnpm test:domain       # 领域逻辑测试
```

### 生产部署

**前端**：
```bash
pnpm build:web
# 复制 apps/web/dist/ 到 Nginx 目录
```

**后端**：
```bash
systemctl --user restart shiju-api
systemctl --user status shiju-api
```

**数据库备份**：
```bash
# 自动运行（每日 2 AM）
# 手动触发：~/scripts/backup-db.sh
```

---

## 关键设计决策

### 1. ExpressionSense vs 句子卡片
SRS 调度的是 **ExpressionSense**（expression + type + meaning），不是完整句子。句子作为复习证据存储在 **Occurrence** 中。

**理由**：学习者需要表达式回忆，不是句子记忆。句子提供语境，但不是学习单元。

### 2. 五种 V1 候选状态
- `selected`：主高亮（2-4 个/段落）
- `backup_candidate`：AI 认为有价值但未进入主高亮
- `ignored_too_easy`：过于简单
- `ignored_duplicate`：重复
- `ignored_over_limit`：超出段落高亮限制或每日新卡限制

**理由**：覆盖 AI 优先级、学习者自主权（备选表达在"更多表达式"区域）、拒绝原因可追溯。

### 3. 三种生成路径
- **段落预选**：AI 分析段落，自动提取候选表达式
- **手动选择生成**：学习者选中 AI 未高亮的文本，请求生成卡片
- **语境卡片生成**：学习者输入在游戏/编程/工作等场景遇到的表达式，AI 生成卡片（无需导入文章）

**理由**：AI 会漏掉对个体学习者有意义的表达；学习者需要在文章外积累词汇；但仍由 AI 生成释义和例句，保证质量和一致性。

### 4. SM-2 兼容 SRS
使用 SM-2 算法的变体，存储 ease_factor、interval_days、lapse_count、review_count。中文反馈按钮：
- `不知道`（红色）：重置间隔，增加失误计数，降低 ease
- `迷惑`（琥珀色）：缩短间隔，轻微降低 ease
- `知道`（绿色）：增加间隔，使用 ease 因子
- `熟知`（长按"知道"触发）：标记为已掌握，移出复习队列但保留在卡片库

**理由**：SM-2 成熟、简单、无需复杂调参。数据字段预留 FSRS 扩展空间。

### 5. 阅读反馈 ≠ 复习反馈
阅读页面的操作（`add_to_review`, `known`, `too_easy`, `bad_explanation`）**不影响 SRS 间隔**。只有复习页面的反馈才推进间隔。

**理由**：避免"看到释义"被误认为"记住了"。阅读页面用于理解和分流，复习页面用于正式主动回忆。

---

## API 调用规范

**强制规则**（详见 `API_RULES.md`）：

✅ **允许**
- 通过 `apps/api/src/lib/llmClient.ts` 的 `callLLM()` 函数调用 LLM
- 从环境变量读取配置（`apps/api/src/config.ts`）
- 使用 `LLMError` 异常分类错误（CONFIG_MISSING, AUTH_FAILED, MODEL_NOT_FOUND, NETWORK_ERROR, INVALID_RESPONSE, RATE_LIMIT, UNKNOWN）

❌ **禁止**
- 直接 `fetch()` 或 `axios()` 调用 LLM API
- 硬编码 API URL、key、model
- 在业务逻辑中包含 API 细节
- 使用静默回退（silent fallback）隐藏配置错误

**部署前检查**：
```bash
pnpm test:llm  # 真实 API 调用验证
```

---

## 数据模型核心表

### Article
存储原文和导入状态

### Segment
存储文章片段和生成状态（`not_generated`, `generating`, `generated`, `failed`, `retryable`）

### CandidateExpression
存储 AI 选择的和拒绝的候选表达式，保留生成元数据（model_provider, model_name, prompt_version, generation_version, generated_at）

### ExpressionSense
长期记忆对象。唯一性基于 `(user_id, normalized_form, type, meaning_zh)` 而非原始字符串。

例如：
- `take off / phrasal_verb / 飞机离地`
- `take off / phrasal_verb / 脱衣服`
- `take off / phrasal_verb / 突然成功`

### Occurrence
ExpressionSense 的语境证据。可以来自文章（article_id, segment_id）或语境输入（context_label, context_note）。

### ReviewLog
SRS 复习事件记录（feedback, rating, previous/next due_at, ease_factor, interval_days）

### ClientOperation
离线操作队列，支持幂等同步（client_operation_id）

### AiGenerationJob
统一生成任务表（segment_preselection, manual_selection, context_entry），存储 selected_text, context_label, context_note, status, model 元数据

---

## 接下来做什么

**优先级 P0（核心功能补全）**：
- Article List 页面（显示已导入的文章列表）
- 文章详情页（段落导航、跳转到阅读页）
- 语境卡片生成后端 API 集成

**优先级 P1（用户体验）**：
- 用户认证系统
- 前端加载状态优化
- 错误提示优化

**优先级 P2（生产就绪）**：
- HTTPS 配置
- API 错误监控
- 性能优化

查看 **STATUS.md** 了解当前完整状态。

查看 **docs/archive/** 了解历史交付文档。

---

**最后更新**：2026-07-07

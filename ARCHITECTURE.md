# ShiJu - 架构文档

**最后更新**：2026-07-07

---

## 系统架构概览

ShiJu 是一个移动优先的 PWA 应用，采用前后端分离架构：

```
┌─────────────────┐
│  React PWA      │  ← 前端：阅读、复习、卡片管理
│  (IndexedDB)    │     离线缓存 + 操作队列
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  Fastify API    │  ← 后端：业务逻辑、AI 编排、同步
│  (Node.js)      │
└────────┬────────┘
         │
    ┌────┴─────┬───────────┐
    ↓          ↓           ↓
┌────────┐ ┌─────────┐ ┌──────────┐
│Postgres│ │LLM API  │ │Job Queue │
│        │ │Provider │ │(in-mem)  │
└────────┘ └─────────┘ └──────────┘
```

---

## 前端架构

### 技术选型
- **React 19**：组件化 UI
- **TypeScript**：类型安全
- **Vite 6**：快速构建和热更新
- **PWA**：离线支持、安装到主屏幕
- **IndexedDB**：本地缓存和操作队列

### 目录结构

```
apps/web/src/
├── features/              # 功能模块
│   ├── reading/           # 阅读页面
│   │   ├── ReadingPage.tsx
│   │   ├── ExpressionSheet.tsx        # 表达式弹层
│   │   ├── SelectionToolbar.tsx       # 手动选择工具栏
│   │   ├── manualSelection.ts         # 手动选择 mock 逻辑
│   │   └── readingState.ts            # 阅读状态管理
│   ├── review/            # 复习页面
│   │   ├── ReviewPage.tsx
│   │   ├── ReviewCard.tsx
│   │   └── reviewState.ts             # SRS 状态管理
│   ├── cards/             # 卡片库
│   │   ├── CardLibraryPage.tsx
│   │   ├── CardDetailSheet.tsx
│   │   ├── ContextCardGenerator.tsx   # 语境卡片生成
│   │   └── contextGeneration.ts       # 语境生成 mock 逻辑
│   ├── import/            # 文章导入
│   │   └── ImportPage.tsx
│   └── home/              # 首页仪表盘
│       └── HomePage.tsx
├── fixtures/              # 本地 fixture 数据
│   └── sampleSegment.ts
├── storage/               # 离线存储
│   ├── db.ts              # IndexedDB 封装
│   └── operationQueue.ts  # 操作队列（add_to_review, known, feedback 等）
├── lib/                   # 工具库
│   ├── highlightText.tsx  # 安全文本高亮
│   └── date.ts
├── api/                   # API 客户端
│   └── articles.ts
├── App.tsx                # 路由和全局状态
└── main.tsx               # 入口
```

### 离线优先设计

**IndexedDB 存储结构**：
- `articles`：最近打开的文章和段落
- `generated_segments`：已生成的段落释义（缓存）
- `review_queue`：最近和到期的复习队列
- `pending_operations`：离线操作（待同步）

**操作队列机制**：
1. 用户在阅读/复习页面执行操作（add_to_review, known, feedback）
2. 操作立即写入 IndexedDB `pending_operations` 表
3. 后台自动同步到服务器（POST /sync）
4. 服务器返回成功后，从队列中移除

**幂等性保证**：
- 每个操作生成唯一 `client_operation_id`
- 服务器通过 `client_operation_id` 去重
- 重复上传不会导致重复执行

---

## 后端架构

### 技术选型
- **Fastify**：高性能 HTTP 框架
- **TypeScript**：类型安全
- **PostgreSQL 16**：关系数据库（权威数据源）
- **systemd**：进程管理和自动重启

### 部署状态
- **服务器**：43.128.11.119
- **API 端口**：3001
- **健康检查**：GET /health
- **进程管理**：systemd user service (shiju-api.service)
- **环境配置**：通过 EnvironmentFile 加载 .env
- **备份策略**：每日 2 AM 自动备份，30天保留

### 目录结构

```
apps/api/src/
├── ai/                    # AI Provider 层
│   ├── provider.ts        # Provider 接口定义
│   ├── mockProvider.ts    # Mock provider（本地开发/测试）
│   └── openAiCompatibleProvider.ts  # OpenAI 兼容 provider
├── db/                    # 数据库
│   ├── schema.sql         # PostgreSQL schema
│   ├── client.ts          # 数据库客户端
│   └── schema.test.ts     # Schema 验证测试
├── lib/                   # 工具库
│   └── llmClient.ts       # 统一 LLM 调用客户端
├── routes/                # HTTP 路由
│   ├── articles.ts        # POST /articles (导入文章)
│   ├── review.ts          # GET /review/due, POST /review/feedback
│   ├── sync.ts            # POST /sync (离线操作同步)
│   ├── manualSelection.ts # POST /manual-selection/generate
│   └── contextGeneration.ts  # POST /cards/context/generate
├── services/              # 业务逻辑层
│   ├── segmentationService.ts      # 文章分段
│   ├── generationService.ts        # AI 候选表达式生成
│   ├── srsService.ts               # SRS 调度
│   ├── syncService.ts              # 离线操作应用
│   ├── manualSelectionService.ts   # 手动选择生成
│   └── contextGenerationService.ts # 语境卡片生成
├── app.ts                 # Fastify app 工厂
├── server.ts              # 服务器启动
└── config.ts              # 环境变量加载和验证
```

### API Provider 层

**设计原则**：所有 LLM 调用必须通过统一的 `llmClient.ts`，业务代码只依赖 `ai/provider.ts` 接口。

**调用链**：
```
业务服务 (generationService.ts)
    ↓
AI Provider 接口 (provider.ts)
    ↓
OpenAI 兼容 Provider (openAiCompatibleProvider.ts)
    ↓
统一 LLM 客户端 (llmClient.ts)
    ↓
真实 LLM API (OpenAI / Claude / 自定义端点)
```

**错误分类**：
`llmClient.ts` 将所有 LLM 错误包装为 `LLMError`，分类为：
- `CONFIG_MISSING`：缺少 AI_BASE_URL / AI_API_KEY / AI_MODEL
- `AUTH_FAILED`：401/403 响应
- `MODEL_NOT_FOUND`：404 响应
- `NETWORK_ERROR`：连接拒绝/超时
- `INVALID_RESPONSE`：格式错误
- `RATE_LIMIT`：429 响应
- `UNKNOWN`：其他错误

### Mock Provider
- 本地开发和测试使用（`AI_PROVIDER=mock`）
- 返回确定性结果（如选中文本 "all at once" 返回固定卡片）
- 不产生网络调用和 API 费用

**生产环境**：
- 使用 OpenAI 兼容 Provider（`AI_PROVIDER=openai_compatible`）
- 支持 tool calling（create_candidate_expressions）
- 配置通过环境变量：AI_BASE_URL, AI_API_KEY, AI_MODEL

---

## 数据模型

### 核心实体关系

```
Article (文章)
    ↓ 1:N
Segment (段落)
    ↓ 1:N
CandidateExpression (AI 候选表达式)
    ↓ N:1 (learner confirms)
ExpressionSense (长期记忆对象)
    ↓ 1:N
Occurrence (语境证据)

ExpressionSense
    ↓ 1:N
ReviewLog (复习记录)
```

### 关键约束

**ExpressionSense 唯一性**：
```sql
UNIQUE (user_id, normalized_form, type, meaning_zh) 
WHERE deleted_at IS NULL
```
允许同一表达式有多个不同含义的卡片。

**ClientOperation 幂等性**：
```sql
UNIQUE (client_operation_id)
```
保证离线操作不会重复执行。

**Occurrence 来源多样性**：
- 文章来源：`source_type='article'`, 有 `article_id` 和 `segment_id`
- 语境来源：`source_type='context_entry'`, 有 `context_label` 和 `context_note`

---

## AI 生成流程

### 三种生成路径

#### 1. 段落预选（Segment Preselection）
```
用户导入文章
    ↓
后端拆分为 150-250 词段落
    ↓
优先生成第一段（高优先级）
    ↓
后台生成剩余段落
    ↓
AI 分析段落，生成候选表达式
    ↓
按规则分配状态：
  - selected (2-4 个主高亮)
  - backup_candidate (备选)
  - ignored_too_easy / ignored_duplicate / ignored_over_limit
    ↓
返回前端渲染
```

#### 2. 手动选择生成（Manual Selection）
```
学习者在阅读页选中文本
    ↓
前端发送请求：POST /manual-selection/generate
  - selected_text
  - sentence (包含选中文本的完整句子)
  - article_id, segment_id
  - context (周围段落)
    ↓
后端调用 LLM 生成草稿
  - expression
  - normalized_form
  - type (phrasal_verb, idiom, collocation, etc.)
  - meaning_zh (中文释义)
  - local_meaning (当前句子中的含义)
  - sentence_translation
  - difficulty
  - syntax_hint (可选)
  - duplicate_warning (如果与已有 ExpressionSense 冲突)
    ↓
前端显示草稿，学习者确认
    ↓
确认后创建 ExpressionSense 和 Occurrence
```

#### 3. 语境卡片生成（Context Entry）
```
学习者在卡片库输入：
  - expression (如 "buff")
  - context_label (如 "game")
  - context_note (可选，如 "游戏里看到的增益效果")
  - sentence (可选)
    ↓
前端发送请求：POST /cards/context/generate
    ↓
后端调用 LLM 生成草稿
  - expression
  - normalized_form
  - type
  - meaning_zh
  - local_meaning (针对提供的语境)
  - example_sentence (适合该语境的例句)
  - example_translation
  - difficulty
  - usage_hint (可选)
  - duplicate_warning (如果与已有 ExpressionSense 冲突)
    ↓
前端显示草稿，学习者确认
    ↓
确认后创建 ExpressionSense 和 Occurrence (source_type='context_entry')
```

### 生成元数据

所有生成路径必须记录：
- `model_provider`：如 "openai_compatible"
- `model_name`：如 "claude-sonnet-4-6"
- `prompt_version`：如 "v1.0"
- `generation_version`：如 "20260615"
- `generated_at`：生成时间戳

**用途**：prompt 和模型变化会影响候选质量，没有版本记录无法追溯问题。

---

## SRS 调度算法

### SM-2 变体

**核心参数**：
- `ease_factor`：初始 2.5，范围 1.3-2.5
- `interval_days`：初始 1，逐步增长
- `lapse_count`：失误次数
- `review_count`：复习次数

**反馈映射**：
- `不知道` (unknown)：重置到学习阶段，增加 lapse_count，降低 ease
- `迷惑` (fuzzy)：缩短间隔，轻微降低 ease
- `知道` (known)：增加间隔 = 上次间隔 × ease_factor
- `熟知` (mastered)：标记 mastery_status = 'mastered'，移出复习队列

**状态机**：
```
new (新卡)
    ↓
learning (学习中，间隔 < 1 天)
    ↓
young (年轻卡，间隔 1-21 天)
    ↓
mature (成熟卡，间隔 > 21 天)
    ↓
mastered (熟知，手动触发)
```

**调度规则**：
- 每日新卡推荐：6 张（软限制，可超过）
- 复习队列：只包含 due_at ≤ 今天且 mastery_status != 'mastered' 的卡片
- 复习顺序：到期时间从早到晚

---

## 离线同步机制

### 操作队列结构

**ClientOperation 字段**：
- `client_operation_id`：UUID，客户端生成
- `user_id`：用户 ID
- `operation_type`：操作类型
  - `reading.add_to_review`
  - `reading.feedback` (known, too_easy, bad_explanation)
  - `reading.generate_card_from_selection`
  - `cards.generate_card_from_context`
  - `review.feedback` (unknown, fuzzy, known)
- `target_type`：目标类型（expression_sense, candidate_expression 等）
- `target_id`：目标 ID
- `payload`：操作详细数据（JSON）
- `client_created_at`：客户端创建时间
- `sync_status`：同步状态（pending, synced, failed）
- `server_applied_at`：服务器应用时间

### 同步流程

**客户端**：
1. 用户执行操作（点击"加入复习"、提交复习反馈）
2. 操作立即写入 IndexedDB `pending_operations` 表
3. UI 立即更新（乐观更新）
4. 后台自动触发同步（POST /sync）

**服务器**：
1. 接收 `ClientOperation[]` 数组
2. 按 `client_created_at` 排序
3. 对每个操作：
   - 检查 `client_operation_id` 是否已存在（幂等性）
   - 应用操作（更新 ExpressionSense, ReviewLog 等）
   - 记录 `server_applied_at`
4. 返回成功应用的操作列表

**客户端（同步后）**：
1. 从 IndexedDB `pending_operations` 中删除已同步操作
2. 如果有失败操作，标记为 `sync_status='failed'`，稍后重试

---

## 安全和配置管理

### 环境变量

**必需配置（AI_PROVIDER=openai_compatible 时）**：
- `AI_BASE_URL`：LLM API 端点
- `AI_API_KEY`：认证 token
- `AI_MODEL`：模型标识符（如 "claude-sonnet-4-6"）

**可选配置**：
- `AI_PROVIDER`：默认 "mock"（本地开发），生产环境设为 "openai_compatible"
- `DATABASE_URL`：PostgreSQL 连接字符串
- `PORT`：API 服务器端口

### 配置验证

**启动时验证**：
- `config.ts` 的 `loadConfig()` 在服务器启动前验证所有必需字段
- 缺少配置会立即抛出异常，阻止服务器启动
- **不允许静默回退**（如 `AI_PROVIDER ?? 'mock'`）

**运行时验证**：
- `llmClient.ts` 的 `callLLM()` 在每次调用前验证配置完整性
- 响应格式错误会分类为 `INVALID_RESPONSE`
- 网络错误会分类为 `NETWORK_ERROR`

### 密钥管理

**原则**：
1. 永远不提交 `.env` 到 git
2. 使用 `.env.example` 作为模板
3. 生产密钥只存在于部署环境
4. 泄露密钥后立即轮换

---

## 部署架构（Server Agent 负责）

**当前状态**：未部署，所有代码在本地运行。

**计划部署架构**：
```
Internet
    ↓ HTTPS (443)
Nginx (反向代理)
    ↓
Fastify API (内部端口 3000)
    ↓
PostgreSQL (内部端口 5432)
```

**部署清单**（详见 `docs/deployment/server-agent-handoff.md`）：
- 安装 Node.js 22、PostgreSQL 16、Nginx
- 配置环境变量（.env）
- 初始化数据库（运行 schema.sql）
- 构建前后端（pnpm build）
- 配置进程管理（systemd）
- 配置 HTTPS（Let's Encrypt）
- 设置日志和备份

---

## 测试策略

### 单元测试
- `packages/domain/src/*.test.ts`：SRS 逻辑、候选状态分类
- `apps/api/src/services/*.test.ts`：业务逻辑层
- `apps/api/src/ai/*.test.ts`：AI Provider

### 集成测试
- `apps/api/src/app.test.ts`：HTTP 路由
- `apps/api/src/db/schema.test.ts`：数据库约束

### LLM API 集成测试
```bash
pnpm test:llm
```
真实调用 LLM API，验证配置正确性。**部署前必须运行**。

### 浏览器验证
- 手动测试关键用户流程
- 阅读页：高亮、弹层、更多表达式
- 复习页：卡片显示、反馈按钮
- 卡片库：搜索、筛选、查看证据
- 语境生成：输入、生成草稿、确认

---

## 性能优化

### 前端优化
- **懒加载**：路由级别的代码拆分
- **IndexedDB 缓存**：缓存已生成的段落释义
- **乐观更新**：操作立即反映在 UI，后台同步

### 后端优化
- **优先生成第一段**：用户导入文章后立即生成第一段，剩余段落后台生成
- **批量同步**：一次请求同步多个离线操作
- **连接池**：PostgreSQL 连接池复用

### 未来优化方向
- 引入 BullMQ 替代内存任务队列
- Redis 缓存热点数据（如到期复习队列）
- CDN 加速前端静态资源

---

## 已知限制

### V1 不支持
- PDF 导入
- 网页导入
- 多用户账户系统（当前单用户模式）
- 社区内容和课程系统
- 知识图谱
- 离线 PWA（已移除）
- 原生移动 app

---

## 技术债务和改进方向

### 当前限制
1. **单用户模式**：user_id 硬编码为 "user-1"，无认证系统
2. **HTTP only**：HTTPS 待配置
3. **语境卡片生成**：前端已实现，后端 API 待集成
4. **离线支持**：已移除 PWA 基础设施

### 下一步改进
1. 添加用户认证（JWT + 注册/登录）
2. 配置 HTTPS（Let's Encrypt）
3. 完成语境卡片生成后端 API
4. 添加 prompt 版本管理和 A/B 测试
5. 引入 FSRS 算法替代 SM-2（可选）

---

## 参考文档

- **API 调用规范**：`API_RULES.md`
- **数据库 schema**：`apps/api/src/db/schema.sql`
- **V1 设计规格**：`docs/superpowers/specs/` 
- **历史交付文档**：`docs/archive/`

---

**最后更新**：2026-07-07

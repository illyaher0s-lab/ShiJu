# ShiJu - 项目状态

**最后更新**：2026-06-15  
**当前分支**：`codex/ai-reading-trainer-roadmap`  
**阶段**：本地 MVP 验证（后端契约层完成）

---

## 一句话总结

为成人英语学习者设计的 AI 辅助阅读工具，通过原文阅读 + 表达式提取 + 间隔复习闭环，让学习者在真实语境中积累可复用的英语表达。

---

## 当前状态

### ✅ 已完成

**前端**
- React PWA（移动优先设计）
- 阅读页面：原文高亮、表达式弹层（轻量层 + 展开层）、更多表达式区域
- 复习页面：到期队列、主动回忆、中文反馈按钮（不知道/迷惑/知道/熟知）
- 卡片库：ExpressionSense 列表、Occurrence 证据查看、跳转到来源段落
- 文章导入入口（fixture 模式）
- 手动选择 AI 生成卡片（前端 mock flow）
- 语境卡片生成（游戏/编程/工作等真实场景，前端 mock flow）
- 离线操作队列（IndexedDB）
- 首页仪表盘：今日学习状态、每日目标设置

**后端**
- Fastify API 骨架
- PostgreSQL schema（8 张核心表）
- AI Provider 接口定义
- Mock Provider（deterministic，支持 "all at once" 和 "buff" + "game" 等固定场景）
- 同步 API 契约（幂等性，基于 client_operation_id）
- 手动选择生成契约（POST /manual-selection/generate）
- 语境卡片生成契约（POST /cards/context/generate）
- 统一 LLM 客户端（llmClient.ts，错误分类）
- 配置验证（启动时检查必需环境变量）

**共享逻辑**
- SM-2 兼容 SRS 调度（packages/domain/src/srs.ts）
- 五种 V1 候选状态分类（selected, backup_candidate, ignored_too_easy, ignored_duplicate, ignored_over_limit）
- 类型定义（Article, Segment, CandidateExpression, ExpressionSense, Occurrence, ReviewLog, ClientOperation, AiGenerationJob）

**文档**
- V1 设计规格（24KB，687 行）
- MVP 实施计划（Task 1-20）
- API 调用规范（API_RULES.md，强制执行）
- 数据库 schema 说明
- 本地验证指南
- 服务器部署交接文档

### ❌ 尚未实现

- 真实文件解析（TXT/Markdown）
- 真实 AI 生成（LLM 调用）
- 真实 PostgreSQL 持久化
- 真实 IndexedDB 同步
- 用户认证
- 服务器部署

---

## 技术栈

- **前端**：React 19 + TypeScript + Vite 6 + PWA + IndexedDB
- **后端**：Node.js 22 + Fastify + TypeScript + PostgreSQL 16
- **工具链**：pnpm workspace + Vitest

---

## 核心设计决策

1. **ExpressionSense vs 句子卡片**：SRS 调度表达式（expression + type + meaning），句子作为语境证据
2. **五种候选状态**：selected, backup_candidate, ignored_too_easy, ignored_duplicate, ignored_over_limit
3. **三种生成路径**：段落预选、手动选择生成、语境卡片生成
4. **SM-2 兼容 SRS**：ease_factor, interval_days, lapse_count，中文反馈按钮
5. **阅读反馈 ≠ 复习反馈**：阅读页面操作不影响 SRS 间隔
6. **两轨制开发**：Codex 负责本地代码和契约，Server Agent 负责部署和真实 LLM 集成

---

## 本地运行

```bash
# 前端
pnpm install
pnpm dev:web          # http://localhost:5173

# 后端（当前 MVP 阶段不需要）
pnpm dev:api

# 测试
pnpm test             # 全部测试
pnpm test:web         # 前端测试
pnpm test:api         # 后端测试
pnpm test:domain      # 领域逻辑测试
pnpm test:llm         # LLM API 集成测试（需要真实 API key）
```

---

## 项目结构

```
ShiJu/
├── apps/
│   ├── web/          # 前端 PWA（React + Vite）
│   └── api/          # 后端 API（Fastify + TypeScript）
├── packages/
│   └── domain/       # 共享类型和 SRS 逻辑
├── docs/
│   ├── superpowers/  # 设计规格 + 实施计划
│   ├── development/  # 开发文档
│   └── deployment/   # 部署交接文档
├── README.md         # 项目简介
├── ARCHITECTURE.md   # 架构文档
├── STATUS.md         # 本文件
└── API_RULES.md      # LLM API 调用规范
```

---

## 最近完成的任务

- Task 17: 语境卡片生成后端契约（aa19b25）
- Task 16: 语境卡片生成前端 mock flow（78442f3）
- Task 15: 手动选择生成后端契约（04abf61）
- Task 14: 手动选择生成前端 mock flow
- Task 13: 文章导入入口
- Task 12: 丰富复习卡片 + 卡片库
- Task 18-20: 首页仪表盘、复习反馈优化、SRS 升级

---

## 下一步

查看 `docs/development/STATUS.md` 了解详细任务清单和完成状态。

查看 `docs/superpowers/plans/2026-06-13-ai-reading-trainer-mvp-implementation.md` 了解剩余任务（Task 18 之后）。

当 MVP 验证完成后，Server Agent 可以根据 `docs/deployment/server-agent-handoff.md` 执行部署。

---

## 已知问题

无当前阻塞问题。测试通过，浏览器验证成功。

---

## 参考文档

- **README.md**：项目简介、快速开始
- **ARCHITECTURE.md**：系统架构、数据模型、技术选型
- **API_RULES.md**：LLM API 调用规范（强制执行）
- **docs/development/STATUS.md**：详细开发状态和任务清单
- **docs/superpowers/specs/2026-06-13-ai-reading-trainer-v1-design.md**：V1 设计规格（24KB）
- **docs/deployment/server-agent-handoff.md**：服务器部署交接文档

---

**最后更新**：2026-06-15

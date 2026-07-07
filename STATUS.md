# ShiJu - 项目状态

**最后更新**：2026-07-07  
**当前分支**：`codex/ai-reading-trainer-roadmap`  
**阶段**：单用户生产运行（服务器部署完成）

---

## 一句话总结

为成人英语学习者设计的 AI 辅助阅读工具，通过原文阅读 + 表达式提取 + 间隔复习闭环，让学习者在真实语境中积累可复用的英语表达。

---

## 当前状态

### ✅ 已完成

**前端**（部署在 http://43.128.11.119/shiju/）
- Vercel 设计风格的桌面 Web 应用
- 侧边栏导航布局
- 文章导入页面（完整表单、错误处理）
- 阅读页面（原文高亮、手动选择生成卡片）
- 复习页面（SM-2 算法、4级反馈按钮）
- 卡片库（ExpressionSense 列表、批量删除）

**后端**（systemd 托管，运行在 3001 端口）
- Fastify API（健康检查 /health）
- PostgreSQL 数据持久化（8 张表）
- 真实 LLM 集成（OpenAI 兼容 API，支持 tool calling）
- 文章导入和自动分段（150-250 词/段）
- 手动选择生成（POST /manual-selection/generate）
- SM-2 复习系统（GET /review/due, POST /review/feedback）
- 统一 LLM 客户端（错误分类）
- 配置验证（环境变量）

**运维**
- systemd 服务自动重启
- 数据库每日备份（2 AM，30天保留）
- 日志查看工具（shiju-logs.sh）
- 性能监控工具（shiju-perf.sh）

### ❌ 尚未实现

- 用户认证（当前硬编码 userId="user-1"）
- 语境卡片生成（前端实现完成，后端 API 未集成）
- 离线 PWA 支持（已移除）
- Article List 页面（显示已导入文章）
- 文章详情页（段落列表和导航）

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

## 下一步

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

---

## 参考文档

- **ARCHITECTURE.md**：系统架构、数据模型、技术选型
- **API_RULES.md**：LLM API 调用规范（强制执行）
- **docs/development/STATUS.md**：详细开发状态（如果需要历史任务清单）
- **docs/archive/**：已完成阶段的交付文档和稳定化计划

---

**最后更新**：2026-07-07

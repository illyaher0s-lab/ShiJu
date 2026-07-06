# ReadingPage 高亮与手动选词 API 接入 - 完成报告

## ① 两处前端改动完成说明

### (a) ReadingPage 候选词高亮 ✅

**改动文件：** `apps/web/src/features/reading/ReadingPage.tsx`

**具体修改：**
1. **新增 state（第15行）：**
   ```ts
   const [candidates, setCandidates] = useState<CandidateExpression[]>([]);
   ```

2. **loadSegments() 保存 candidates（第58行）：**
   ```ts
   setCandidates(result.candidates);
   ```

3. **新增 highlightText() 函数（第119-192行）：**
   - 按 expression 长度降序排序（避免短词先匹配）
   - 用 `String.indexOf()` 精确匹配
   - 包裹 `<mark>` 标签，绑定 onClick 显示 candidate 详情
   - 处理多次出现（while 循环标记所有匹配）

4. **替换纯文本渲染（第309-312行）：**
   ```tsx
   {highlightText(
     currentSegment.text,
     candidates.filter(c => c.segmentId === currentSegment.id)
   )}
   ```

**保留的局限（按计划设计）：**
- ❌ 词形变化不处理（`run` vs `running`）
- ❌ 大小写敏感
- ❌ 子串重叠会误标
- ❌ 标点边界问题

---

### (b) 手动选词接后端 ✅

**改动文件：** `apps/web/src/features/reading/manualSelection.ts`

**具体修改：**
1. **删除整个 mock 函数（45行 → 40行）**
2. **改为真实 API 调用：**
   ```ts
   export async function buildManualSelectionDraft(
     input: BuildManualSelectionDraftInput
   ): Promise<CandidateExpression>
   ```
   - 构造 `ManualSelectionGenerationRequest`（严格按后端契约）
   - `POST /manual-selection/generate`
   - 返回 `draft.candidate`

**改动文件：** `apps/web/src/features/reading/ReadingPage.tsx`

**具体修改：**
- `handleGenerateCard()` 改为 async（第88行）
- 添加 try-catch 错误处理
- 生成失败时 alert 提示用户

**入参契约（已验证）：**
```ts
interface ManualSelectionGenerationRequest {
  clientOperationId: string;      // crypto.randomUUID()
  userId: string;                 // "user-1"
  articleId: string;
  segmentId: string;
  selectedText: string;
  sentence: string;
  context: string;                // 使用 sentence 作为 context
  clientCreatedAt: string;        // ISO timestamp
}
```

**返回契约（已验证）：**
```ts
interface ManualSelectionGenerationDraft {
  candidate: CandidateExpression;
  duplicateExpressionSenseId: string | null;
  recommendation: "add" | "merge" | "reject";
  recommendationReason: string;
}
```

---

## ② manual-selection 后端 provider 实测结论

### 结论：**按路由分别配置，manual-selection 路由确定使用 mock**

**证据：**

1. **文章导入路由（`routes/articles.ts` 第83行）：**
   ```ts
   provider: createGenerationProvider(),
   ```
   → 根据环境变量 `AI_PROVIDER` 决定（当前配置为 `openai_compatible`，走真实 LLM）

2. **手动选词路由（`routes/manualSelection.ts` 第11行）：**
   ```ts
   const provider = createMockProvider();
   ```
   → **硬编码 mock，无条件返回 mock 数据**

3. **上下文生成路由（`routes/contextGeneration.ts` 第11行）：**
   ```ts
   const provider = createMockProvider();
   ```
   → 同样硬编码 mock

**实测验证：**
```bash
curl -X POST http://localhost:3001/manual-selection/generate -d '{...}'
# 返回：{"candidate": {"modelProvider": "mock", ...}}
```

### 影响说明

**✅ 前端已正确接通真实 API**
- 请求格式符合后端契约
- 错误处理完整
- 结构正确

**⚠️ 后端此路由仍返回 mock 数据**
- `routes/manualSelection.ts` 第11行需改为 `createGenerationProvider()`
- 当前前端调用成功，但生成结果是占位符（"AI draft"、"hyperbole"等）
- 需要修改后端才能获得真实 LLM 生成

**是否需要修改后端？** 留给你决定，本轮未擅自改动。

---

## ③ 自查

### 做了什么：
1. ✅ 创建 git checkpoint（commit 949513e）
2. ✅ 读取 `routes/manualSelection.ts` 确认 provider 配置
3. ✅ 读取 `services/generationService.ts` 确认 `createGenerationProvider()` 逻辑
4. ✅ grep 所有路由的 provider 使用情况
5. ✅ 添加 candidates state 到 ReadingPage
6. ✅ 实现 highlightText() 函数（76行）
7. ✅ 替换纯文本渲染为高亮渲染
8. ✅ 重写 manualSelection.ts 为真实 API 调用
9. ✅ handleGenerateCard() 改为 async + 错误处理
10. ✅ 构建成功（vite build 通过）
11. ✅ 部署到生产环境（`/var/www/shiju/`）
12. ✅ 提交代码（commit cdec9b8，带详细说明）

### 验证了什么：
- ✅ 后端各路由的 provider 配置（articles 用真 LLM，manual-selection 用 mock）
- ✅ manual-selection API 契约完整（请求/返回结构）
- ✅ 实际调用后端接口，确认返回 `modelProvider: "mock"`
- ✅ 前端构建无错误
- ✅ 新版前端已部署（bundle hash 变为 `C_Jf7gRL.js`）

### 哪没验证：
- ❌ 高亮的真实视觉表现（需浏览器查看）
- ❌ 高亮匹配算法在真实文章上的效果（局限性是否影响使用）
- ❌ 手动选词端到端流程（选词 → API 调用 → 卡片显示）
- ❌ 点击高亮词是否正确弹出候选卡片
- ❌ 多个候选词重叠时的表现

### 下一步（人工浏览器验证清单）：

**高亮功能验证：**
1. 打开任意文章阅读页 `http://43.128.11.119/shiju/reading/:articleId`
2. 检查第一个 segment 是否有黄色高亮词
3. 点击高亮词，检查是否弹出候选卡片
4. 检查卡片内容是否完整（expression、meaning、sentence、translation）
5. 切换到下一个 segment，检查高亮是否更新
6. 观察是否有误标/漏标的词

**手动选词验证：**
1. 在未高亮的文本中选中一个词/短语
2. 检查是否弹出生成按钮
3. 点击生成，观察是否有 loading 状态
4. 检查生成的卡片是否显示 mock 数据（"AI draft" 等占位符）
5. 查看浏览器 Network 标签，确认调用了 `/manual-selection/generate`
6. 确认返回的 `modelProvider` 是 `"mock"`

**已知问题确认：**
- 手动选词返回的是 mock 数据（后端需切换 provider）
- 高亮匹配可能在复杂场景下失效（大小写/标点/重叠）

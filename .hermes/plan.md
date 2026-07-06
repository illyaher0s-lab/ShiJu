# ReadingPage 高亮与手动选词 API 接入计划

## ① DB 连接排查结论

**结论：其实 URL 没真错 —— 连接字符串指向的数据库名确实存在且有数据。**

**依据代码：**
- `apps/api/src/db/client.ts` 第5行：`connectionString: process.env.DATABASE_URL`，无 fallback 逻辑
- 环境变量实际值：`postgresql:///ai_reading_trainer?host=/var/run/postgresql`
- 数据库验证：
  - `ai_reading_trainer` 库存在，有 32 篇文章
  - `shiju` 库存在，有 0 篇文章
  - API 返回 32 篇文章 → 实际连的是 `ai_reading_trainer`
- PostgreSQL 连接字符串 `postgresql:///dbname` 是合法格式（三斜杠表示 localhost）
- `?host=/var/run/postgresql` 指定 Unix socket 路径

**非问题：** 没有静默 fallback，连接字符串确实指向正确的库。之前以为 URL "错误"是误判 —— `ai_reading_trainer` 是实际在用的库名，`shiju` 是我新建但未迁移数据的空库。

---

## ② 前端两处修复计划

### (a) ReadingPage 候选词高亮

**现状：**
- `ReadingPage.tsx` 第231行只渲染纯文本：`{currentSegment.text}`
- API 返回的 `candidates: CandidateExpression[]` 被忽略
- `CandidateExpression` 包含 `expression: string` 字段（要高亮的词）

**匹配策略及局限：**
采用**精确字符串匹配 + 逐个标记**：
1. 遍历所有 candidates，用 `String.indexOf()` 在 segment.text 中查找 `candidate.expression`
2. 找到后，用 `<mark>` 或 `<span>` 包裹该词，绑定点击事件
3. 多次出现时，逐个标记所有匹配位置

**局限性：**
- ❌ 不处理词形变化（`run` vs `running`）
- ❌ 不处理大小写（`The` vs `the`）—— 可通过 `toLowerCase()` 比较缓解
- ❌ 子串重叠会误标（`in` 会匹配到 `interesting` 里的 `in`）
- ❌ 标点符号边界问题（`"run"` 不会匹配 `run,` 或 `run.`）
- ✅ 对"换一篇输入文章"仍成立 —— 只要 candidates 的 `expression` 是文中原词

**改进可能（本次不做）：**
- 用正则 `\b${expression}\b` 做词边界匹配
- 标准化大小写和标点
- 用 NLP tokenizer 做词级对齐

**方案：**

**文件：** `apps/web/src/features/reading/ReadingPage.tsx`

**改动：**
1. 在 `loadSegments()` 里同时保存 `candidates` 到 state：
   ```ts
   const [candidates, setCandidates] = useState<CandidateExpression[]>([]);
   
   // in loadSegments()
   const result = await getArticleSegments(articleId);
   setSegments(result.segments);
   setCandidates(result.candidates); // 新增
   ```

2. 新建 `highlightText()` 辅助函数，将纯文本转换为带高亮的 JSX：
   ```ts
   function highlightText(text: string, candidatesForSegment: CandidateExpression[]) {
     // 按 expression 长度降序排序（避免短词先匹配导致长词被拆）
     const sorted = [...candidatesForSegment].sort((a, b) => 
       b.expression.length - a.expression.length
     );
     
     const parts: JSX.Element[] = [];
     let remaining = text;
     let offset = 0;
     
     sorted.forEach(candidate => {
       let idx = remaining.indexOf(candidate.expression);
       while (idx !== -1) {
         // 添加前面的纯文本
         if (idx > 0) {
           parts.push(<span key={`text-${offset}`}>{remaining.slice(0, idx)}</span>);
         }
         // 添加高亮词
         parts.push(
           <mark 
             key={`mark-${offset}-${idx}`}
             style={{ cursor: 'pointer', background: '#fef3c7' }}
             onClick={() => handleCandidateClick(candidate)}
           >
             {candidate.expression}
           </mark>
         );
         
         offset += idx + candidate.expression.length;
         remaining = remaining.slice(idx + candidate.expression.length);
         idx = remaining.indexOf(candidate.expression);
       }
     });
     
     // 添加剩余文本
     if (remaining) {
       parts.push(<span key={`text-end`}>{remaining}</span>);
     }
     
     return parts;
   }
   ```

3. 替换纯文本渲染（第231行）：
   ```tsx
   // 旧：
   {currentSegment.text}
   
   // 新：
   {highlightText(
     currentSegment.text, 
     candidates.filter(c => c.segmentId === currentSegment.id)
   )}
   ```

4. 实现 `handleCandidateClick(candidate)` 弹出卡片展示详情

**风险：**
- 长文本 + 大量 candidates 可能导致性能问题（建议限制单 segment 的 candidates < 50）
- 重叠匹配会导致部分词无法标记（需要更复杂的区间合并算法）

---

### (b) 手动选词接后端

**现状：**
- 前端 `apps/web/src/features/reading/manualSelection.ts` 是纯 mock 函数，返回硬编码占位符
- 调用处：`ReadingPage.tsx` 第92行 `buildManualSelectionDraft()`

**后端接口契约（已存在）：**

**路径：** `POST /manual-selection/generate`

**请求体：** `ManualSelectionGenerationRequest`
```ts
{
  clientOperationId: string;      // UUID
  userId: string;                 // "user-1"
  articleId: string;
  segmentId: string;
  selectedText: string;           // 用户选中的词
  sentence: string;               // 完整句子
  context: string;                // 上下文（可为空或整个 segment）
  clientCreatedAt: string;        // ISO timestamp
}
```

**返回：** `ManualSelectionGenerationDraft`
```ts
{
  candidate: CandidateExpression;           // 生成的候选词卡片
  duplicateExpressionSenseId: string | null; // 若已存在，返回 ID
  recommendation: "add" | "merge" | "reject";
  recommendationReason: string;
}
```

**后端现状问题：**
- `apps/api/src/routes/manualSelection.ts` 第11行仍在用 `createMockProvider()`
- 需要改为 `createGenerationProvider()` 来调用真实 LLM
- **但这是后端的改动，不在本次前端计划范围内**

**方案：**

**文件：** `apps/web/src/features/reading/manualSelection.ts`

**改动：** 删除整个 mock 函数，改为真实 API 调用
```ts
import type { CandidateExpression, ManualSelectionGenerationRequest, ManualSelectionGenerationDraft } from '@art/domain';
import { randomUUID } from 'crypto'; // 或用浏览器的 crypto.randomUUID()

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/shiju/api';

interface BuildManualSelectionDraftInput {
  selectedText: string;
  sentence: string;
  articleId: string;
  segmentId: string;
  generatedAt: string;
}

export async function buildManualSelectionDraft(
  input: BuildManualSelectionDraftInput
): Promise<CandidateExpression> {
  const request: ManualSelectionGenerationRequest = {
    clientOperationId: crypto.randomUUID(),
    userId: 'user-1',
    articleId: input.articleId,
    segmentId: input.segmentId,
    selectedText: input.selectedText,
    sentence: input.sentence,
    context: input.sentence, // 或传更大的上下文
    clientCreatedAt: input.generatedAt,
  };

  const response = await fetch(`${API_BASE}/manual-selection/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate card');
  }

  const draft: ManualSelectionGenerationDraft = await response.json();
  return draft.candidate;
}
```

**文件：** `apps/web/src/features/reading/ReadingPage.tsx`

**改动：** 第86-102行的 `handleGenerateCard()` 需要改为 async
```ts
async function handleGenerateCard(text: string) {
  if (!articleId) return;
  
  const currentSegment = segments[currentIndex];
  if (!currentSegment) return;
  
  try {
    const draft = await buildManualSelectionDraft({
      selectedText: text,
      sentence: currentSegment.text,
      articleId,
      segmentId: currentSegment.id,
      generatedAt: new Date().toISOString(),
    });
    
    setGeneratedDraft(draft);
    setShowToolbar(false);
  } catch (err) {
    console.error('Failed to generate card:', err);
    alert(err instanceof Error ? err.message : 'Failed to generate card');
  }
}
```

**迁移风险：**
- ⚠️ **后端仍在用 mock provider** —— 前端改完后，生成结果仍是 mock 数据，除非同时修改后端
- ⚠️ 需要处理 loading 状态（生成可能需要几秒）
- ⚠️ 后端接口可能超时（LLM 调用慢）—— 需要 timeout 处理
- ⚠️ `crypto.randomUUID()` 在旧浏览器不支持 —— 可回退到 `nanoid` 或其他 UUID 库

---

## ③ 自查

**做了什么：**
1. ✅ 读取 `db/client.ts` 确认连接初始化逻辑 —— 无 fallback，直接用环境变量
2. ✅ 验证数据库实际存在：`ai_reading_trainer` 有 32 篇文章，`shiju` 是空库
3. ✅ 确认 API 返回 32 篇 → 实际连的是 `ai_reading_trainer`
4. ✅ 读取后端 `routes/manualSelection.ts` 确认接口存在
5. ✅ 读取 `domain/types.ts` 确认请求/响应结构
6. ✅ 读取 `ReadingPage.tsx` 确认当前高亮缺失
7. ✅ 创建 git checkpoint（工作区已 clean）

**验证了什么：**
- ✅ DB 连接字符串指向的库确实存在且有数据
- ✅ 没有静默 fallback 逻辑
- ✅ 后端手动选词接口存在，路径 `POST /manual-selection/generate`
- ✅ 接口契约完整：入参 `ManualSelectionGenerationRequest`，返回 `ManualSelectionGenerationDraft`

**哪没验证：**
- ❌ 后端接口是否真的调用了 LLM（代码显示仍在用 mock，但没实际请求验证）
- ❌ 前端 `getArticleSegments()` 返回的 candidates 数据结构是否符合预期（只看了 API curl，没看前端实际拿到的）
- ❌ 高亮匹配算法在真实文章上的表现（需要实现后测试）

**下一步：**
等你确认计划后：
1. 实现 (a) ReadingPage 高亮
2. 实现 (b) 手动选词接 API
3. 构建 + 部署
4. 验证：
   - 高亮词是否正确显示
   - 点击高亮词是否有反应
   - 手动选词是否调用了后端（看 Network 请求）
   - 生成结果是否仍是 mock（若是，需要再修后端）

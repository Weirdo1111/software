# Reading Module – Implementation Plan

## 背景

当前四个技能模块中，Speaking 和 Writing 均已实现完整的交互式工作台（表单 → API → AI 反馈），
而 Reading 和 Listening 仅展示静态的 checkpoint 问题列表，没有任何交互性。

本计划专注于将 Reading 模块补齐到与 Speaking / Writing 对齐的水平。

---

## 现状分析

### 已有

| 文件 | 内容 |
|---|---|
| `app/lesson/[id]/page.tsx` | `modeMeta.reading` 已定义好 label、focus、tasks、checkpoints、tone |
| `lib/academic-ui.ts` | `learningModules` 中 reading 配置完整 |
| `lib/placement.ts` | 放置测试包含 3 道 reading 题 |
| `supabase/migrations/001_init.sql` | `lesson_exercises` / `user_attempts` 表结构支持 reading |
| `types/learning.ts` | `SkillType` 已含 `"reading"`，但无 `ReadingFeedback` 接口 |

### 缺失

| 缺口 | 影响 |
|---|---|
| `ReadingFeedback` 类型 | 无法对 API 响应做类型约束 |
| `readingFeedbackPrompt()` | 无法调用 OpenAI |
| `app/api/ai/feedback/reading/route.ts` | 没有后端路由 |
| `components/forms/reading-feedback-form.tsx` | 没有前端工作台 |
| `renderWorkbench()` 未处理 reading | 页面仍显示静态 prompt 列表 |

---

## 设计决策

### 为什么 Reading 不能照抄 Speaking/Writing？

Speaking 和 Writing 都是**开放式生产型**任务（用户自由输入文本），AI 对输出评分。
Reading 是**理解型**任务：用户先阅读一篇固定语料，再回答关于语料的问题，AI 对理解结果评分。

所以 ReadingFeedbackForm 需要：
1. **展示语料段落**（嵌入组件，不从数据库取，与现有 mock 数据策略一致）
2. **三道结构化问题**（对应现有 checkpoints）
3. **词汇选择区**（对应现有 task 3：从语料中选 2 个术语加入 SRS 复习堆）
4. **提交后展示 AI 反馈**

### 语料内容

主题与现有 meta 一致（`source: "Short abstract and commentary on remote study habits"`），
语料约 160 词，满足：

- 有一句清晰的主旨句（main claim）
- 有可辨识的证据细节（evidence vs. background）
- 有对比转折词（"However"）
- 有 4–5 个适合加入 SRS 的学术词汇

---

## 实现步骤

### Step 1 — 数据层（类型 + Prompt）

**修改 `types/learning.ts`**
新增 `ReadingFeedback` 接口：

```typescript
export interface ReadingFeedback {
  comprehension_score: number;   // 0–10
  claim_feedback: string;        // 对主旨句识别的反馈
  evidence_feedback: string;     // 对证据识别的反馈
  vocabulary_feedback: string;   // 对词汇选择的反馈
  tips: string[];                // 2–3 条可操作建议
}
```

**修改 `lib/ai/prompts.ts`**
新增 `readingFeedbackPrompt()`，接收 targetLevel、passage、answers 对象，
返回供 OpenAI 使用的 prompt 字符串。

---

### Step 2 — API 路由

**新建 `app/api/ai/feedback/reading/route.ts`**

严格遵循 `speaking/route.ts` 和 `writing/route.ts` 的相同结构：

- Zod 校验入参（passage、answers、target_level）
- 无 OpenAI Key 时返回合理的 mock 数据（fallback）
- 有 Key 时调用 OpenAI，`safeParseJSON` 处理输出
- 统一错误格式 `jsonError()`

---

### Step 3 — 前端组件

**新建 `components/forms/reading-feedback-form.tsx`**

UI 结构（与现有 surface-panel 风格一致）：

```
┌─────────────────────────────────────┐
│  section-label: "Reading feedback"  │
│  h2: 标题                           │
│  p: 说明文字                        │
├─────────────────────────────────────┤
│  [语料段落卡片]                     │
│  160 词学术段落，学术词汇用下划线   │
│  虚线标注                           │
├─────────────────────────────────────┤
│  Checkpoint 1 文本框                │
│  "What sentence expresses the       │
│   main claim most clearly?"         │
├─────────────────────────────────────┤
│  Checkpoint 2 文本框                │
│  "Which detail functions as         │
│   evidence rather than background?" │
├─────────────────────────────────────┤
│  Checkpoint 3 文本框                │
│  "What transition signals contrast  │
│   in the passage?"                  │
├─────────────────────────────────────┤
│  词汇选择区（4–5 个词，勾选 ≤ 2）  │
├─────────────────────────────────────┤
│  [提交按钮]                         │
├─────────────────────────────────────┤
│  [反馈结果区] comprehension_score   │
│  + claim/evidence/vocab feedback    │
│  + tips                             │
└─────────────────────────────────────┘
```

状态管理与 SpeakingFeedbackForm 完全对称：
`answers state` → submit → fetch → `result state`

---

### Step 4 — 接入 Lesson 页

**修改 `app/lesson/[id]/page.tsx`**

在 `renderWorkbench()` 中为 reading 模式添加分支：

```typescript
if (mode === "reading") {
  return <ReadingFeedbackForm defaultLevel="B1" />;
}
```

---

## 实现顺序

```
Step 1 → Step 2 → Step 3 → Step 4
  类型      API     组件     接线
```

每步独立可验证，不互相阻塞。

---

## 不在本次范围内

- 从数据库动态加载语料（当前所有 mock 数据均硬编码）
- 将词汇选择真正写入 `review_cards` 表（SRS 接线）
- Listening 模块的类似改造
- 多语料 / 多难度切换

这些属于后续迭代，与本次目标无关。

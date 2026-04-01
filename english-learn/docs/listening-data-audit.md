# 听力模块资源与数据库审计（2026-04-01）

## 1. 这次清理做了什么

本次对“封面不稳定 + 站内播放不稳定”的条目进行了替换与兜底改造：

- 替换了 3 个 ASME Brightcove 嵌入条目（`civil-built-sustainability-asme`、`mechanical-czinger-hypercar-asme`、`transport-hyperloop-asme`）。
- 新条目改为官方可追溯来源（Oxford / MIT OCW），并统一补上站内音频 `audioSrc`。
- 为多个已有条目补挂本地音频，保证外链失效时仍可在站内完成听力训练。
- 听力详情页新增“切换到站内音频”与自动回退逻辑，视频失败可自动回退到音频。

## 2. 替换后的资源来源（按专业）

### 土木 Civil Engineering

- `civil-built-sustainability-asme`
  - 新来源：Oxford Engineering Science
  - 官方页：<https://podcasts.ox.ac.uk/thermally-induced-lateral-buckling-subsea-pipelines>
  - 直链视频：<https://media.podcasts.ox.ac.uk/engsci/general/2019-05-22-engsci-lubbock-1-720p.mp4>
  - 口音/难度：British, B2

### 机械 Mechanical Engineering

- `mechanical-czinger-hypercar-asme`
  - 新来源：MIT OpenCourseWare（Dynamics and Control 课程体系）
  - 官方页：<https://ocw.mit.edu/courses/2-003-modeling-dynamics-and-control-i-spring-2005/pages/syllabus/>
  - 口音/难度：American, B2
  - 站内播放：使用本地音频兜底

### 交通 Transportation

- `transport-hyperloop-asme`
  - 新来源：MIT OpenCourseWare
  - 官方页：<https://ocw.mit.edu/courses/1-258j-public-transportation-systems-spring-2017/resources/lecture-20-service-reliability/>
  - 直链视频：<https://archive.org/download/MIT1.258JS17/MIT1_258JS17_lec20_300k.mp4>
  - 口音/难度：American, B2

## 3. 难度与口音覆盖（工科向）

当前 authentic 听力库仍覆盖：

- 专业：土木、计算机、应用数学、交通、机械
- 难度：B1/B2 为主（含少量更高语速语料）
- 口音：British / American / Indian / Global

说明：NPTEL 保留 Indian English；Oxford 与 TED 提供 British / Global；MIT / Stanford 提供 American。

## 4. 题目和答案从哪里来

### 题目与答案的生成方式

- 听力题目与“参考答案（modelAnswer）/评分线索（rubricNote）”由项目侧人工编写，存放在：
  - `lib/authentic-listening-catalog.ts`
  - `lib/listening-materials.ts`（TED 与映射逻辑）
- 这些答案不是“官方考试原题答案”，而是课程内训练用的评分参考与关键词匹配规则。

### 可靠性判断

- 资源来源可靠性：优先官方机构页面（MIT OCW / Stanford SEE / Oxford Podcasts / NPTEL / TED）。
- 题目答案可靠性：属于“教学编写内容”，可靠性取决于课程团队审核质量，不应被标注为官方标准答案。

## 5. 是否存在数据库里

### Supabase

- 表：`listening_materials`
- 关键字段：`code`, `content_mode`, `material_group_id`, `title`, `official_url`, `embed_url`, `questions(jsonb)`, `vocabulary(jsonb)`, `note_prompts(jsonb)` 等
- 建表迁移：
  - `supabase/migrations/003_listening_materials.sql`
  - `supabase/migrations/004_listening_material_groups.sql`

### 入库路径

- 种子脚本：`scripts/seed-listening-materials.mjs`
- 行为：把 `listeningMaterials` 里的题目、答案、词汇、来源 URL upsert 到 `listening_materials`

### 运行时读取策略

- `lib/listening-materials-repository.ts`：
  - 优先读 Supabase `listening_materials`
  - 若 Supabase 不可用或记录不足，则回退到本地 `listeningMaterials`
  - 并合并本地字段兜底（如 `videoSrc`、`thumbnailUrl`、`audioSrc`）

## 6. 结论

- 听力资源来源已经收敛到可追溯官方站点；
- 外链不稳定场景下，站内音频播放已可兜底；
- 题目与答案属于项目教学内容（非官方真题库），已支持入库并可追踪来源。

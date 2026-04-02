type GuideLocale = "zh" | "en";

export type BuddyGuidePageId =
  | "home"
  | "schedule"
  | "listening"
  | "listening-test"
  | "reading"
  | "speaking"
  | "writing"
  | "review"
  | "discussion"
  | "progress"
  | "games"
  | "sign-in";

type BuddyGuideContext = {
  locale: GuideLocale;
  levelPrefix?: string;
};

type BuddyGuidePageConfig = {
  id: BuddyGuidePageId;
  title: Record<GuideLocale, string>;
  summary: Record<GuideLocale, string>;
  keywords: string[];
  pathnamePrefixes: string[];
  requiresLogin: boolean;
  buildHref: (context: BuddyGuideContext) => string;
};

type BuddyFaqConfig = {
  id: string;
  prompts: Record<GuideLocale, string[]>;
  keywords: string[];
  answer: Record<GuideLocale, string>;
  pageIds: BuddyGuidePageId[];
  quickReplies?: Record<GuideLocale, string[]>;
};

export type BuddyGuideAction = {
  id: BuddyGuidePageId;
  label: string;
  href: string;
  requiresLogin: boolean;
};

export type BuddyGuideRuleResponse = {
  mode: "faq" | "guide";
  answer: string;
  actions: BuddyGuideAction[];
  quickReplies: string[];
  confidence: number;
};

const allowedLevels = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

function normalizeLevelPrefix(raw?: string) {
  const next = String(raw ?? "A2").toUpperCase();
  return allowedLevels.has(next) ? next : "A2";
}

function localizePath(basePath: string, locale: GuideLocale) {
  return `${basePath}?lang=${locale}`;
}

const guidePages: BuddyGuidePageConfig[] = [
  {
    id: "home",
    title: { zh: "首页", en: "Home" },
    summary: {
      zh: "总入口页面，可以进入计划、学习模块、讨论区和成长看板。",
      en: "The main entry page for plan, study modules, discussion, and growth views.",
    },
    keywords: ["home", "homepage", "首页", "主页面", "入口"],
    pathnamePrefixes: ["/"],
    requiresLogin: false,
    buildHref: ({ locale }) => localizePath("/", locale),
  },
  {
    id: "schedule",
    title: { zh: "计划", en: "Schedule" },
    summary: {
      zh: "查看课程表、截止任务、本周安排，并生成学习计划。",
      en: "View timetable, deadlines, weekly plan, and generate study schedules.",
    },
    keywords: ["schedule", "plan", "planner", "计划", "课程表", "本周安排", "学习计划", "deadline"],
    pathnamePrefixes: ["/schedule"],
    requiresLogin: true,
    buildHref: ({ locale }) => localizePath("/schedule", locale),
  },
  {
    id: "listening",
    title: { zh: "听力", en: "Listening" },
    summary: {
      zh: "进入 TED 听力资源、练习材料和常规听力任务。",
      en: "Open TED listening resources, practice materials, and regular listening tasks.",
    },
    keywords: ["listening", "ted", "audio", "lecture", "听力", "TED", "讲座", "音频"],
    pathnamePrefixes: ["/listening"],
    requiresLogin: true,
    buildHref: ({ locale }) => localizePath("/listening", locale),
  },
  {
    id: "listening-test",
    title: { zh: "听力测试", en: "Listening Test" },
    summary: {
      zh: "随机抽取 TED 材料，完成后即时评分并记录结果。",
      en: "Randomly select TED materials, score answers immediately, and record results.",
    },
    keywords: ["listening test", "test", "quiz", "听力测试", "测试", "测验", "随机抽题"],
    pathnamePrefixes: ["/listening/test"],
    requiresLogin: true,
    buildHref: ({ locale }) => localizePath("/listening/test", locale),
  },
  {
    id: "reading",
    title: { zh: "阅读", en: "Reading" },
    summary: {
      zh: "进行阅读理解和 AI 批改，提交主旨、证据和词汇选择。",
      en: "Complete reading practice and AI feedback by submitting claim, evidence, and vocabulary.",
    },
    keywords: ["reading", "article", "feedback", "阅读", "批改", "文章", "claim", "evidence"],
    pathnamePrefixes: ["/reading"],
    requiresLogin: true,
    buildHref: ({ locale }) => localizePath("/reading", locale),
  },
  {
    id: "speaking",
    title: { zh: "口语", en: "Speaking" },
    summary: {
      zh: "进入场景口语训练，做 AI 对话和表达练习。",
      en: "Enter scenario-based speaking practice with AI dialogue and speaking tasks.",
    },
    keywords: ["speaking", "oral", "scene", "口语", "场景口语", "表达", "说话", "dialogue"],
    pathnamePrefixes: ["/lesson/"],
    requiresLogin: true,
    buildHref: ({ locale, levelPrefix }) =>
      localizePath(`/lesson/${normalizeLevelPrefix(levelPrefix)}-speaking-starter`, locale),
  },
  {
    id: "writing",
    title: { zh: "写作", en: "Writing" },
    summary: {
      zh: "进入写作任务并获取 AI 写作反馈。",
      en: "Open writing tasks and get AI writing feedback.",
    },
    keywords: ["writing", "essay", "paragraph", "写作", "作文", "段落", "批改", "rewrite"],
    pathnamePrefixes: ["/lesson/"],
    requiresLogin: true,
    buildHref: ({ locale, levelPrefix }) =>
      localizePath(`/lesson/${normalizeLevelPrefix(levelPrefix)}-writing-starter`, locale),
  },
  {
    id: "review",
    title: { zh: "复习", en: "Review" },
    summary: {
      zh: "查看复习卡片，进行间隔重复训练。",
      en: "Review cards and complete spaced-repetition practice.",
    },
    keywords: ["review", "cards", "srs", "复习", "卡片", "单词卡", "间隔重复"],
    pathnamePrefixes: ["/review"],
    requiresLogin: true,
    buildHref: ({ locale }) => localizePath("/review", locale),
  },
  {
    id: "discussion",
    title: { zh: "讨论", en: "Discussion" },
    summary: {
      zh: "进入论坛和讨论空间，查看帖子、评论和交流内容。",
      en: "Open the forum and discussion area for posts, comments, and learner interaction.",
    },
    keywords: ["discussion", "forum", "post", "讨论", "论坛", "帖子", "评论", "交流"],
    pathnamePrefixes: ["/discussion", "/forum"],
    requiresLogin: true,
    buildHref: ({ locale }) => localizePath("/discussion", locale),
  },
  {
    id: "progress",
    title: { zh: "成长进度", en: "Progress" },
    summary: {
      zh: "查看经验值、成长阶段、学习完成情况和奖励。",
      en: "Check XP, growth stage, learning completion, and rewards.",
    },
    keywords: ["progress", "xp", "reward", "buddy", "成长", "经验", "桌宠", "奖励", "进度"],
    pathnamePrefixes: ["/progress", "/dashboard"],
    requiresLogin: true,
    buildHref: ({ locale }) => localizePath("/progress", locale),
  },
  {
    id: "games",
    title: { zh: "游戏中心", en: "Games" },
    summary: {
      zh: "进入逃脱和单词游戏，完成后也会获得成长经验。",
      en: "Open escape and word games, which also award growth XP after completion.",
    },
    keywords: ["games", "escape", "word game", "游戏", "密室", "逃脱", "单词游戏"],
    pathnamePrefixes: ["/games", "/quests"],
    requiresLogin: false,
    buildHref: ({ locale }) => localizePath("/games", locale),
  },
  {
    id: "sign-in",
    title: { zh: "登录", en: "Sign in" },
    summary: {
      zh: "登录或注册账号，解锁计划、进度和桌宠成长记录。",
      en: "Sign in or register to unlock plans, progress, and buddy growth records.",
    },
    keywords: ["login", "sign in", "register", "account", "登录", "注册", "账号"],
    pathnamePrefixes: ["/auth/sign-in", "/auth/sign-up", "/login", "/register"],
    requiresLogin: false,
    buildHref: ({ locale }) => localizePath("/auth/sign-in", locale),
  },
];

const faqItems: BuddyFaqConfig[] = [
  {
    id: "start-listening",
    prompts: {
      zh: ["我想开始听力", "听力在哪里", "怎么做听力"],
      en: ["I want to start listening", "where is listening", "how do I do listening"],
    },
    keywords: ["listening", "听力", "ted", "lecture"],
    answer: {
      zh: "如果你想开始听力，直接去 Listening 页面，那里可以进入 TED 资源、常规听力材料和练习内容。",
      en: "If you want to start listening, open the Listening page for TED resources, standard materials, and practice tasks.",
    },
    pageIds: ["listening", "listening-test"],
    quickReplies: {
      zh: ["我想做听力测试", "TED 材料在哪里"],
      en: ["I want the listening test", "Where are the TED materials"],
    },
  },
  {
    id: "start-reading",
    prompts: {
      zh: ["阅读批改在哪里", "怎么做阅读批改", "我想做阅读"],
      en: ["where is reading feedback", "how do I get reading feedback", "I want reading practice"],
    },
    keywords: ["reading", "阅读", "批改", "feedback", "claim", "evidence"],
    answer: {
      zh: "阅读 AI 批改在 Reading 页面。进入后填写主旨、证据和转折信号，再提交就能看到反馈。",
      en: "Reading AI feedback is on the Reading page. Fill in the claim, evidence, and contrast signal, then submit to get feedback.",
    },
    pageIds: ["reading"],
    quickReplies: {
      zh: ["阅读和听力测试有什么区别", "我想进入计划页面"],
      en: ["What is the difference from the listening test", "I want the schedule page"],
    },
  },
  {
    id: "start-speaking",
    prompts: {
      zh: ["怎么开始口语", "口语训练在哪里", "我想练口语"],
      en: ["how do I start speaking", "where is speaking practice", "I want speaking practice"],
    },
    keywords: ["speaking", "口语", "场景口语", "scene", "dialogue"],
    answer: {
      zh: "口语训练入口在 Speaking 场景任务里，系统会根据你的等级进入对应的口语 starter 页面。",
      en: "Speaking practice starts from the Speaking scene tasks, and the system opens the starter page for your level.",
    },
    pageIds: ["speaking"],
  },
  {
    id: "start-writing",
    prompts: {
      zh: ["写作在哪里", "怎么做写作批改", "我想开始写作"],
      en: ["where is writing", "how do I get writing feedback", "I want to start writing"],
    },
    keywords: ["writing", "写作", "批改", "essay", "paragraph"],
    answer: {
      zh: "写作入口在 Writing 任务页面。提交内容后，系统会返回 AI 写作反馈和改写建议。",
      en: "Writing is on the Writing task page. After submission, the system returns AI feedback and rewrite suggestions.",
    },
    pageIds: ["writing"],
  },
  {
    id: "schedule-and-timetable",
    prompts: {
      zh: ["计划页面在哪里", "课程表在哪里", "怎么查看本周安排"],
      en: ["where is the schedule page", "where is the timetable", "how do I see this week's plan"],
    },
    keywords: ["schedule", "计划", "课程表", "本周安排", "timetable", "deadline"],
    answer: {
      zh: "计划页面里可以看课程表、截止任务和本周安排，也可以在那里生成或编辑学习计划。",
      en: "The Schedule page contains the timetable, deadlines, and weekly plan, and you can also generate or edit study plans there.",
    },
    pageIds: ["schedule"],
  },
  {
    id: "listening-test",
    prompts: {
      zh: ["我想做听力测试", "听力测试在哪里", "测试入口在哪"],
      en: ["I want the listening test", "where is the listening test", "where is the test entry"],
    },
    keywords: ["test", "听力测试", "测试", "quiz", "随机抽题"],
    answer: {
      zh: "听力测试是独立入口，会随机抽取两组 TED 材料并即时评分。",
      en: "The listening test is a separate entry that randomly selects two TED materials and scores them immediately.",
    },
    pageIds: ["listening-test", "listening"],
  },
  {
    id: "review-cards",
    prompts: {
      zh: ["复习卡片在哪里", "怎么复习单词", "review 在哪"],
      en: ["where are review cards", "how do I review words", "where is review"],
    },
    keywords: ["review", "cards", "复习", "卡片", "单词"],
    answer: {
      zh: "复习功能在 Review 页面，系统会把保存下来的词汇或内容做成卡片进行间隔重复练习。",
      en: "Review lives on the Review page, where saved content becomes cards for spaced-repetition practice.",
    },
    pageIds: ["review"],
  },
  {
    id: "discussion",
    prompts: {
      zh: ["论坛在哪里", "讨论区在哪", "怎么发帖子"],
      en: ["where is the forum", "where is discussion", "how do I post"],
    },
    keywords: ["discussion", "forum", "讨论", "论坛", "帖子", "评论"],
    answer: {
      zh: "讨论区在 Discussion 页面，可以看帖子、发表评论，也能进入更偏交流的空间。",
      en: "The forum is on the Discussion page, where you can browse posts, comment, and join learner interaction.",
    },
    pageIds: ["discussion"],
  },
  {
    id: "xp-and-buddy",
    prompts: {
      zh: ["桌宠怎么升级", "经验值怎么看", "成长进度在哪里"],
      en: ["how does the buddy level up", "where do I see xp", "where is growth progress"],
    },
    keywords: ["xp", "buddy", "桌宠", "经验", "成长", "progress", "reward"],
    answer: {
      zh: "桌宠成长和经验值在 Progress 页面查看。完成听说读写、复习和游戏后，系统会累计经验并改变成长阶段。",
      en: "Buddy growth and XP are shown on the Progress page. Listening, speaking, reading, writing, review, and games all contribute XP.",
    },
    pageIds: ["progress"],
  },
  {
    id: "games",
    prompts: {
      zh: ["游戏中心在哪里", "密室逃脱在哪", "我想玩游戏"],
      en: ["where is the game center", "where is escape room", "I want the games"],
    },
    keywords: ["games", "游戏", "密室", "escape room", "word game"],
    answer: {
      zh: "游戏相关功能在 Games 页面，可以进入密室逃脱和单词游戏，通关也会给桌宠经验。",
      en: "Game features are in the Games page, including escape rooms and word games, and completions also award buddy XP.",
    },
    pageIds: ["games", "progress"],
  },
  {
    id: "sign-in",
    prompts: {
      zh: ["我怎么登录", "我怎么注册", "账号在哪里"],
      en: ["how do I sign in", "how do I register", "where is my account"],
    },
    keywords: ["login", "register", "登录", "注册", "账号", "account"],
    answer: {
      zh: "如果你需要登录或注册，可以先进入 Sign in 页面。登录后才能稳定保存计划、进度和桌宠成长记录。",
      en: "If you need to sign in or register, open the Sign in page first. Logging in allows plans, progress, and buddy growth to persist reliably.",
    },
    pageIds: ["sign-in"],
  },
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[?？!！,，.。:：;'`"”“‘’()[\]{}<>|/\\_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scorePrompt(query: string, prompts: string[]) {
  let score = 0;
  for (const prompt of prompts) {
    const normalizedPrompt = normalizeText(prompt);
    if (!normalizedPrompt) continue;
    if (query === normalizedPrompt) score = Math.max(score, 12);
    else if (query.includes(normalizedPrompt) || normalizedPrompt.includes(query)) score = Math.max(score, 8);
  }
  return score;
}

function scoreKeywords(query: string, keywords: string[]) {
  let score = 0;
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) continue;
    if (query.includes(normalizedKeyword)) {
      score += normalizedKeyword.length <= 3 ? 1 : 2;
    }
  }
  return score;
}

function isCurrentPageQuestion(query: string) {
  const tokens = [
    "这里",
    "这个页面",
    "当前页面",
    "what can i do here",
    "this page",
    "current page",
    "how do i use this page",
    "how to use this page",
  ];
  return tokens.some((token) => normalizeText(query).includes(normalizeText(token)));
}

export function getBuddyGuidePageById(pageId: BuddyGuidePageId) {
  return guidePages.find((page) => page.id === pageId) ?? guidePages[0];
}

export function getBuddyGuidePageForPath(pathname: string | null | undefined) {
  if (!pathname) return null;
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  if (normalizedPath.startsWith("/listening/test")) {
    return getBuddyGuidePageById("listening-test");
  }

  if (normalizedPath.startsWith("/lesson/") && normalizedPath.includes("speaking")) {
    return getBuddyGuidePageById("speaking");
  }

  if (normalizedPath.startsWith("/lesson/") && normalizedPath.includes("writing")) {
    return getBuddyGuidePageById("writing");
  }

  return (
    guidePages.find((page) =>
      page.pathnamePrefixes.some((prefix) => prefix === "/" ? normalizedPath === "/" : normalizedPath.startsWith(prefix)),
    ) ?? null
  );
}

export function buildBuddyGuideAction(pageId: BuddyGuidePageId, context: BuddyGuideContext): BuddyGuideAction {
  const page = getBuddyGuidePageById(pageId);
  return {
    id: page.id,
    label: page.title[context.locale],
    href: page.buildHref(context),
    requiresLogin: page.requiresLogin,
  };
}

function buildBuddyGuideActions(pageIds: BuddyGuidePageId[], context: BuddyGuideContext) {
  return pageIds
    .filter((pageId, index) => pageIds.indexOf(pageId) === index)
    .slice(0, 3)
    .map((pageId) => buildBuddyGuideAction(pageId, context));
}

function getBuddyRelatedPageIds(pageId: BuddyGuidePageId): BuddyGuidePageId[] {
  switch (pageId) {
    case "home":
      return ["schedule", "listening", "reading"];
    case "schedule":
      return ["schedule", "listening", "progress"];
    case "listening":
      return ["listening", "listening-test", "schedule"];
    case "listening-test":
      return ["listening-test", "listening", "progress"];
    case "reading":
      return ["reading", "review", "schedule"];
    case "speaking":
      return ["speaking", "writing", "schedule"];
    case "writing":
      return ["writing", "reading", "schedule"];
    case "review":
      return ["review", "schedule", "progress"];
    case "discussion":
      return ["discussion", "progress", "schedule"];
    case "progress":
      return ["progress", "schedule", "games"];
    case "games":
      return ["games", "progress", "schedule"];
    case "sign-in":
      return ["sign-in", "schedule", "progress"];
    default:
      return ["schedule", "listening", "reading"];
  }
}

export function getBuddyDefaultQuestions(locale: GuideLocale, pathname?: string | null) {
  const currentPage = getBuddyGuidePageForPath(pathname);

  if (currentPage?.id === "reading") {
    return locale === "zh"
      ? ["这个页面怎么用", "阅读批改在哪里", "我想去计划页面", "桌宠怎么升级"]
      : ["How do I use this page", "Where is reading feedback", "Take me to schedule", "How does the buddy level up"];
  }

  if (currentPage?.id === "schedule") {
    return locale === "zh"
      ? ["课程表在哪里编辑", "我想查看本周安排", "怎么开始听力", "经验值怎么看"]
      : ["Where do I edit the timetable", "Show this week's plan", "How do I start listening", "Where do I see XP"];
  }

  if (currentPage?.id === "listening" || currentPage?.id === "listening-test") {
    return locale === "zh"
      ? ["我想做听力测试", "TED 材料在哪里", "我想去阅读", "桌宠怎么升级"]
      : ["I want the listening test", "Where are the TED materials", "Take me to reading", "How does the buddy level up"];
  }

  return locale === "zh"
    ? ["我想开始听力", "阅读批改在哪里", "我想进入计划页面", "桌宠怎么升级", "论坛在哪里", "我怎么登录"]
    : [
        "I want to start listening",
        "Where is reading feedback",
        "Take me to the schedule page",
        "How does the buddy level up",
        "Where is the forum",
        "How do I sign in",
      ];
}

export function getBuddyCurrentPageGuide(locale: GuideLocale, pathname?: string | null, levelPrefix?: string) {
  const currentPage = getBuddyGuidePageForPath(pathname);

  if (!currentPage) {
    return {
      answer:
        locale === "zh"
          ? "你可以直接问我网站功能，比如听力、阅读批改、计划、课程表或桌宠成长。"
          : "You can ask me about site features like listening, reading feedback, schedule, timetable, or buddy growth.",
      actions: buildBuddyGuideActions(["schedule", "listening"], { locale, levelPrefix }),
    };
  }

  return {
    answer:
      locale === "zh"
        ? `你当前在${currentPage.title.zh}页面。${currentPage.summary.zh}`
        : `You are on the ${currentPage.title.en} page. ${currentPage.summary.en}`,
    actions: buildBuddyGuideActions(getBuddyRelatedPageIds(currentPage.id), { locale, levelPrefix }),
  };
}

export function getBuddyGuidePromptContext(locale: GuideLocale, pathname?: string | null, levelPrefix?: string) {
  const currentPage = getBuddyGuidePageForPath(pathname);
  const pageLines = guidePages
    .map((page) => {
      const href = page.buildHref({ locale, levelPrefix });
      return `- ${page.id}: ${page.title[locale]} | ${page.summary[locale]} | href=${href} | requiresLogin=${page.requiresLogin}`;
    })
    .join("\n");
  const faqLines = faqItems
    .map((item) => `- ${item.id}: ${item.prompts[locale].join(" / ")} -> ${item.answer[locale]}`)
    .join("\n");

  return {
    siteMapText: pageLines,
    faqText: faqLines,
    currentPageText: currentPage
      ? `${currentPage.title[locale]} | ${currentPage.summary[locale]}`
      : locale === "zh"
        ? "当前没有明确页面上下文。"
        : "No specific page context is available.",
  };
}

export function resolveBuddyGuideRule(input: {
  locale: GuideLocale;
  query: string;
  pathname?: string | null;
  levelPrefix?: string;
}) {
  const locale = input.locale;
  const query = normalizeText(input.query);
  const currentPage = getBuddyGuidePageForPath(input.pathname);

  if (!query) {
    const currentGuide = getBuddyCurrentPageGuide(locale, input.pathname, input.levelPrefix);
    return {
      mode: "guide",
      answer: currentGuide.answer,
      actions: currentGuide.actions,
      quickReplies: getBuddyDefaultQuestions(locale, input.pathname).slice(0, 4),
      confidence: 1,
    } satisfies BuddyGuideRuleResponse;
  }

  if (currentPage && isCurrentPageQuestion(query)) {
    return {
      mode: "guide",
      answer:
        locale === "zh"
          ? `你当前在${currentPage.title.zh}页面。${currentPage.summary.zh}`
          : `You are on the ${currentPage.title.en} page. ${currentPage.summary.en}`,
      actions: buildBuddyGuideActions(getBuddyRelatedPageIds(currentPage.id), input),
      quickReplies: getBuddyDefaultQuestions(locale, input.pathname).slice(0, 3),
      confidence: 0.96,
    } satisfies BuddyGuideRuleResponse;
  }

  const scoredFaq = faqItems
    .map((item) => ({
      item,
      score: scorePrompt(query, item.prompts[locale]) + scoreKeywords(query, item.keywords),
    }))
    .sort((left, right) => right.score - left.score);

  const bestFaq = scoredFaq[0];
  if (bestFaq && bestFaq.score >= 4) {
    return {
      mode: "faq",
      answer: bestFaq.item.answer[locale],
      actions: buildBuddyGuideActions(bestFaq.item.pageIds, input),
      quickReplies:
        bestFaq.item.quickReplies?.[locale]?.slice(0, 3) ?? getBuddyDefaultQuestions(locale, input.pathname).slice(0, 3),
      confidence: Math.min(0.99, bestFaq.score / 12),
    } satisfies BuddyGuideRuleResponse;
  }

  const scoredPages = guidePages
    .map((page) => ({
      page,
      score: scoreKeywords(query, [page.title.zh, page.title.en, ...page.keywords]),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  if (scoredPages.length > 0) {
    const primary = scoredPages[0]?.page ?? guidePages[0];
    const actions = buildBuddyGuideActions(
      [primary.id, ...getBuddyRelatedPageIds(primary.id), ...scoredPages.map((entry) => entry.page.id)],
      input,
    );
    return {
      mode: "guide",
      answer:
        locale === "zh"
          ? `如果你要找的是${primary.title.zh}，可以去这个页面：${primary.summary.zh}`
          : `If you are looking for ${primary.title.en}, this is the right page: ${primary.summary.en}`,
      actions,
      quickReplies: getBuddyDefaultQuestions(locale, input.pathname).slice(0, 3),
      confidence: Math.min(0.9, (scoredPages[0]?.score ?? 0) / 8),
    } satisfies BuddyGuideRuleResponse;
  }

  return {
    mode: "guide",
    answer:
      locale === "zh"
        ? "我可以帮你找计划、听力、阅读批改、测试、讨论区和成长进度。你也可以直接点下面的入口。"
        : "I can help you find schedule, listening, reading feedback, tests, discussion, and growth progress. You can also tap one of the shortcuts below.",
    actions: [
      buildBuddyGuideAction("schedule", input),
      buildBuddyGuideAction("listening", input),
      buildBuddyGuideAction("reading", input),
    ],
    quickReplies: getBuddyDefaultQuestions(locale, input.pathname).slice(0, 4),
    confidence: 0.2,
  } satisfies BuddyGuideRuleResponse;
}

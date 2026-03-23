export type Locale = "zh" | "en";

type Dict = Record<string, string>;

const zh: Dict = {
  app_name: "English Learn Academic",
  nav_home: "首页",
  nav_assessment: "测评",
  nav_learn: "学习中心",
  nav_dashboard: "学习面板",
  nav_review: "复习",
  nav_progress: "进度",
  nav_pricing: "订阅",
  nav_discussion: "讨论区",
  nav_settings: "设置",
  hero_title: "面向 DIICSU 本科生的学术英语支持",
  hero_desc:
    "围绕全英文课程、seminar 发言、reading list 与 coursework 写作设计，先分级，再进入更贴近 DIICSU 学习节奏的四技能路径。",
  start_test: "开始分级测评",
  start_learning: "查看学习模块",
};

const en: Dict = {
  app_name: "English Learn Academic",
  nav_home: "Home",
  nav_assessment: "Assessment",
  nav_learn: "Learn Hub",
  nav_dashboard: "Dashboard",
  nav_review: "Review",
  nav_progress: "Progress",
  nav_pricing: "Pricing",
  nav_discussion: "Discussion",
  nav_settings: "Settings",
  hero_title: "Academic English support for DIICSU undergraduates",
  hero_desc:
    "Built for DIICSU students adapting to English-medium modules, seminar turns, reading lists, presentations, and assessed coursework.",
  start_test: "Start placement test",
  start_learning: "Explore learning modules",
};

export const dictionaries: Record<Locale, Dict> = { zh, en };

export function t(locale: Locale, key: string) {
  return dictionaries[locale][key] ?? key;
}
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
  nav_settings: "设置",
  hero_title: "先分级，再进入学术英语学习路径",
  hero_desc: "面向大学生的学术英语平台，基于初始测评将学习者分到 Low / Medium / High，再进入听说读写模块。",
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
  nav_settings: "Settings",
  hero_title: "Assessment-led academic English learning",
  hero_desc: "Route each learner into Low, Medium, or High before they enter the listening, speaking, reading, and writing pathway.",
  start_test: "Start placement test",
  start_learning: "Explore learning modules",
};

export const dictionaries: Record<Locale, Dict> = { zh, en };

export function t(locale: Locale, key: string) {
  return dictionaries[locale][key] ?? key;
}

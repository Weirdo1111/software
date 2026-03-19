import type { CEFRLevel } from "@/types/learning";

export interface ReadingPracticePassage {
  level: CEFRLevel;
  band: "Low" | "Medium" | "High";
  title: string;
  paragraphs: string[];
  vocab_options: string[];
}

export interface ReadingPassage extends ReadingPracticePassage {
  expected: {
    claim: string;
    evidence: string;
    contrast_signal: string;
  };
}

/**
 * Reading passages aligned to the CEFR ladder used in the product.
 * Each passage contains a main claim, supporting evidence,
 * one contrast signal, and 5 vocabulary items.
 */
export const readingPassages: Record<"A1" | "A2" | "B1" | "B2", ReadingPassage> = {
  A1: {
    level: "A1",
    band: "Low",
    title: "Using the campus library every week",
    paragraphs: [
      "Many first-year students want a quiet place to study after class. A short student survey showed that learners who visit the campus library every week finish more reading tasks on time. The main idea is simple: regular library visits help students build better study habits.",
      "Some students like to study only in their dorm room because it feels more comfortable. However, the same survey found that library users were more likely to complete homework before the deadline. For example, students who used the library twice a week finished one extra reading task each week.",
      "Useful academic words in this topic include library, homework, deadline, reading task, and study habit.",
    ],
    vocab_options: ["library", "homework", "deadline", "reading task", "study habit"],
    expected: {
      claim: "regular library visits help students build better study habits",
      evidence: "students who used the library twice a week finished one extra reading task each week",
      contrast_signal: "However",
    },
  },
  A2: {
    level: "A2",
    band: "Low",
    title: "Study habits and class attendance",
    paragraphs: [
      "Many first-year university students find it difficult to manage their study time. A recent report from a Chinese university showed that students who attend all lectures score higher on end-of-term exams. The main point is simple: regular attendance helps students understand course material more deeply.",
      "Some students prefer to study alone using online videos instead of going to class. However, the same report found that students who skipped lectures often missed important explanations that were not available online. For example, one group of students who attended every class scored 15 percent higher than those who only watched recorded lectures.",
      "Key academic words such as attendance, lecture, coursework, and assessment appear often in university study guides and are useful to learn early.",
    ],
    vocab_options: ["attendance", "lecture", "coursework", "assessment", "end-of-term"],
    expected: {
      claim: "regular attendance helps students understand course material more deeply",
      evidence: "one group of students who attended every class scored 15 percent higher than those who only watched recorded lectures",
      contrast_signal: "However",
    },
  },
  B1: {
    level: "B1",
    band: "Medium",
    title: "Remote study habits and comprehension",
    paragraphs: [
      "Remote learning has reshaped how first-year students interact with academic texts. A survey conducted across five Chinese universities found that students studying from home complete more assigned readings than their campus-based peers. The central claim is clear: independent reading frequency increases under remote conditions, yet comprehension depth declines when collaborative discussion is removed from the process.",
      "Proponents of fully online study argue that self-paced access to digital materials improves reading coverage. However, longitudinal data from the same survey shows that students without weekly seminar discussion produce shorter and less evidence-based written responses after eight weeks. One concrete example is the drop in referencing accuracy seen in remote cohorts compared to blended-learning groups.",
      "For new university students, terms such as longitudinal, cohort, blended learning, and evidence-based appear regularly in academic source material and are worth adding to a personal vocabulary review system.",
    ],
    vocab_options: ["longitudinal", "cohort", "blended learning", "evidence-based", "referencing accuracy"],
    expected: {
      claim:
        "independent reading frequency increases under remote conditions, yet comprehension depth declines when collaborative discussion is removed",
      evidence:
        "students without weekly seminar discussion produce shorter and less evidence-based written responses after eight weeks",
      contrast_signal: "However",
    },
  },
  B2: {
    level: "B2",
    band: "High",
    title: "Critical reading in interdisciplinary programmes",
    paragraphs: [
      "Interdisciplinary degree programmes increasingly require students to synthesize arguments across multiple fields. A meta-analysis of 32 studies conducted in East-Asian higher education contexts concluded that students enrolled in cross-departmental modules demonstrate stronger critical evaluation skills than those following single-discipline pathways. The core claim is that exposure to competing disciplinary frameworks accelerates the development of analytical reading ability.",
      "Advocates of traditional single-discipline curricula contend that depth of knowledge should take priority over breadth. However, the meta-analysis revealed that interdisciplinary students were 1.4 times more likely to identify methodological limitations in published journal articles, a competency directly tied to postgraduate readiness. A notable case study from a joint engineering-sociology programme showed measurable gains in argument mapping within one academic semester.",
      "University students engaging with advanced academic reading should be comfortable with terms such as meta-analysis, methodological, interdisciplinary, synthesize, and curriculum, which recur across research literature regardless of discipline.",
    ],
    vocab_options: ["meta-analysis", "methodological", "interdisciplinary", "synthesize", "curriculum"],
    expected: {
      claim:
        "exposure to competing disciplinary frameworks accelerates the development of analytical reading ability",
      evidence:
        "interdisciplinary students were 1.4 times more likely to identify methodological limitations in published journal articles",
      contrast_signal: "However",
    },
  },
};

export function getPassageForLevel(level: CEFRLevel): ReadingPassage {
  if (level === "A1") return readingPassages.A1;
  if (level === "A2") return readingPassages.A2;
  if (level === "B2") return readingPassages.B2;
  return readingPassages.B1;
}

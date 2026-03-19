import type { CEFRLevel, WritingPrompt } from "@/types/learning";

export const writingPrompts: WritingPrompt[] = [
  {
    id: "a1-study-routine-note",
    level: "A1",
    title: "Study routine note",
    scenario: "You are writing a short reflection after your first week of English-medium classes and want to describe one study habit that already helps you.",
    prompt: "Write 3-4 simple sentences about one study habit that helps you learn in English.",
    skill_focus: "Use simple present tense and one clear reason.",
    checkpoints: [
      "Name one study habit clearly.",
      "Say why it helps.",
      "Keep each sentence simple and direct.",
    ],
    sample_response:
      "I review my English notes every evening. This habit helps me remember new words. I also read one short paragraph before class. It makes me feel more ready to learn.",
  },
  {
    id: "a1-ask-teacher-help",
    level: "A1",
    title: "Ask a teacher for help",
    scenario: "You are sending a short classroom message after a lesson because one part of today's English task was difficult for you.",
    prompt: "Write a short message to your teacher about one problem in class and one kind of help you need.",
    skill_focus: "State one problem and one polite request.",
    checkpoints: [
      "Say what the problem is.",
      "Ask for one clear type of help.",
      "Use polite classroom language.",
    ],
    sample_response:
      "Hello teacher. I have difficulty with new reading words in class. Could you give me one small vocabulary list for practice? Thank you for your help.",
  },
  {
    id: "a1-library-orientation-note",
    level: "A1",
    title: "Library orientation note",
    scenario: "You have just finished a university library orientation and want to note one rule or service that will help your study this semester.",
    prompt: "Write 3-4 simple sentences about one library rule or service that is useful for your English study.",
    skill_focus: "Use simple classroom vocabulary and one clear benefit.",
    checkpoints: [
      "Name one rule or service.",
      "Explain why it is useful.",
      "Keep the message short and clear.",
    ],
    sample_response:
      "The library has a quiet study room for students. This room is useful because I can read English texts without noise. I can also borrow simple academic books there. It helps me study more carefully.",
  },
  {
    id: "a1-group-meeting-reminder",
    level: "A1",
    title: "Group meeting reminder",
    scenario: "Your English class group will meet before a small presentation, and you need to send a short reminder to one classmate.",
    prompt: "Write a short note to a classmate about when your group will meet and what to bring.",
    skill_focus: "Give simple time, place, and task information.",
    checkpoints: [
      "Say when the meeting is.",
      "Say where to meet.",
      "Mention one thing to bring.",
    ],
    sample_response:
      "Hello Mei. Our group will meet in the library at 3 p.m. tomorrow. Please bring your presentation notes and one article for discussion. See you there.",
  },
  {
    id: "a2-seminar-preparation-advice",
    level: "A2",
    title: "Seminar preparation advice",
    scenario: "A classmate is nervous about joining an English seminar next week and asks you for practical preparation advice.",
    prompt: "Write a short paragraph giving advice to a classmate about how to prepare for an academic seminar in English.",
    skill_focus: "Organize advice with sequence words and practical support.",
    checkpoints: [
      "Give at least two steps.",
      "Use a sequence word such as first or then.",
      "Explain why the advice is useful.",
    ],
    sample_response:
      "First, read the topic before the seminar and write two short ideas in your notebook. Then practise saying one opinion aloud, because this can help you speak more clearly in class. It is also useful to learn a few key words so you can follow the discussion more easily.",
  },
  {
    id: "a2-study-group-recommendation",
    level: "A2",
    title: "Recommend a study group",
    scenario: "A new student has arrived on campus and wants to know which study group would be most useful for academic English practice.",
    prompt: "Write a short paragraph recommending one study group or club to a new student and explain how it supports academic English.",
    skill_focus: "Recommend one option with one benefit and one example.",
    checkpoints: [
      "Name the group clearly.",
      "Explain one benefit for academic English.",
      "Add one simple example.",
    ],
    sample_response:
      "I recommend the weekly discussion club for new students. It helps academic English because students can practise speaking and listening in a friendly way. For example, members talk about class topics and learn useful words before seminars.",
  },
  {
    id: "a2-writing-center-visit",
    level: "A2",
    title: "Writing center visit",
    scenario: "After your first appointment at the university writing center, a friend asks whether the service is worth using before assignments.",
    prompt: "Write a short paragraph explaining how the writing center can help a student prepare an academic paragraph or essay.",
    skill_focus: "Explain one service and one clear benefit with an example.",
    checkpoints: [
      "Name the support clearly.",
      "Explain how it helps writing.",
      "Add one practical example.",
    ],
    sample_response:
      "The writing center can help students plan and revise their assignments before submission. A tutor can show how to write a clearer topic sentence and organize supporting ideas. For example, a student can bring one draft paragraph and get advice on grammar and structure.",
  },
  {
    id: "a2-presentation-preparation-plan",
    level: "A2",
    title: "Presentation preparation plan",
    scenario: "Your tutor has assigned a short class presentation, and you want to explain the best way for a student to prepare in English.",
    prompt: "Write a short paragraph about how a student should prepare for a short academic presentation in English.",
    skill_focus: "Use sequence and purpose to explain a simple plan.",
    checkpoints: [
      "Give two or more preparation steps.",
      "Use a sequence word.",
      "Explain why the plan is useful.",
    ],
    sample_response:
      "First, a student should read the topic and choose two simple points for the presentation. Then the student should practise speaking aloud and check important academic words. This plan is useful because it improves confidence and helps the speaker stay organized in class.",
  },
  {
    id: "b1-english-medium-support",
    level: "B1",
    title: "Support strategies for English-medium study",
    scenario: "A first-year support team is reviewing how to help international students succeed in English-medium courses across reading, seminars, and assignments.",
    prompt: "Write a short analytical paragraph explaining one challenge international students face in academic reading and one practical solution.",
    skill_focus: "State one problem, explain it, and propose one realistic support strategy.",
    checkpoints: [
      "Open with a clear analytical point.",
      "Explain the challenge with a specific detail.",
      "End with a practical solution.",
    ],
    sample_response:
      "International students often struggle with academic reading because texts include unfamiliar terms and dense sentence structures. This can slow comprehension and make it harder to identify the writer's main claim. A practical solution is to teach students how to mark topic sentences, track key terms, and build a small subject-specific vocabulary list before class.",
  },
  {
    id: "b1-online-reading-balance",
    level: "B1",
    title: "Online reading: benefit and limitation",
    scenario: "In a study skills class, students are debating whether online reading tools really improve learning or mainly encourage shallow reading habits.",
    prompt: "Write a paragraph responding to the claim that online reading improves flexibility but reduces deep understanding.",
    skill_focus: "Balance one advantage against one limitation.",
    checkpoints: [
      "Show your position clearly.",
      "Mention both a benefit and a limitation.",
      "Use one contrast signal such as however.",
    ],
    sample_response:
      "Online reading gives students more flexibility because they can study at any time and quickly search for key information. However, it can also reduce deep understanding when learners skim too fast and do not pause to analyze the writer's argument. For this reason, online reading is most effective when students combine digital convenience with slower note-taking and reflection.",
  },
  {
    id: "b1-tutorial-participation-support",
    level: "B1",
    title: "Support quiet students in tutorials",
    scenario: "A tutor has noticed that several first-year students understand the readings but rarely speak during tutorials, even when they prepare in advance.",
    prompt: "Write a short analytical paragraph explaining why some students stay quiet in tutorials and one practical way a tutor can support participation.",
    skill_focus: "Explain a cause and propose one realistic classroom support strategy.",
    checkpoints: [
      "Identify one likely cause.",
      "Explain how it affects participation.",
      "Suggest one practical solution.",
    ],
    sample_response:
      "Some students remain quiet in tutorials because they need more time to organize ideas in English before speaking. As a result, they may understand the reading but still avoid discussion in front of others. One practical solution is for tutors to give students one minute of preparation time and one guiding question before open discussion begins.",
  },
  {
    id: "b1-note-taking-and-plagiarism",
    level: "B1",
    title: "Note-taking and plagiarism prevention",
    scenario: "During an academic skills workshop, students are discussing why weak note-taking often causes problems later in essay writing and source use.",
    prompt: "Write a short analytical paragraph explaining how better note-taking can help students avoid plagiarism and improve academic writing.",
    skill_focus: "Connect one study habit to one writing outcome with clear cause-and-effect logic.",
    checkpoints: [
      "State the main connection clearly.",
      "Explain one writing risk.",
      "Show how note-taking reduces that risk.",
    ],
    sample_response:
      "Better note-taking helps students avoid plagiarism because it makes the difference between copied language and personal summary much clearer. When notes are disorganized, students may forget which ideas came from a source and which words are their own. Clear labels for quotations, paraphrases, and source details therefore support both honest citation and stronger essay planning.",
  },
  {
    id: "b2-attendance-policy-argument",
    level: "B2",
    title: "Attendance policy argument",
    scenario: "Your faculty is reviewing whether English-medium courses should adopt a stricter attendance rule after several seminars suffered from low participation.",
    prompt: "Write a short argumentative paragraph for or against a strict attendance policy in English-medium university courses.",
    skill_focus: "Take a position, justify it, and acknowledge one limitation.",
    checkpoints: [
      "State a direct position.",
      "Support it with a clear justification.",
      "Address one counterpoint briefly.",
    ],
    sample_response:
      "A strict attendance policy can strengthen English-medium courses because regular participation helps students follow academic terminology, discussion routines, and task expectations more consistently. This is especially important for learners who need repeated exposure to spoken academic English. Nevertheless, any policy should remain flexible enough to account for documented health or access difficulties, otherwise it may punish students without improving learning.",
  },
  {
    id: "b2-research-reading-support",
    level: "B2",
    title: "Support for research reading",
    scenario: "An academic skills committee wants recommendations for helping first-year students manage journal articles, abstracts, methods sections, and unfamiliar research vocabulary.",
    prompt: "Write a short analytical paragraph explaining how universities should support first-year students who struggle with research articles.",
    skill_focus: "Develop a precise claim with evidence-aware academic language.",
    checkpoints: [
      "State one focused claim.",
      "Explain why research articles are difficult.",
      "Propose a support strategy with academic precision.",
    ],
    sample_response:
      "Universities should support first-year students with research reading by teaching them how to identify article structure before asking them to interpret complex evidence. Many learners struggle not because they lack motivation, but because abstracts, methods, and hedging language are unfamiliar at the start of university study. A guided workshop sequence on structure, vocabulary, and evidence mapping would therefore improve both comprehension and confidence.",
  },
  {
    id: "b2-peer-review-requirement",
    level: "B2",
    title: "Should peer review be required?",
    scenario: "A writing program is considering whether every major first-year assignment should include a compulsory peer-review stage before final submission.",
    prompt: "Write a short argumentative paragraph discussing whether peer review should be a required part of academic writing classes.",
    skill_focus: "Take a reasoned position and evaluate one benefit against one risk.",
    checkpoints: [
      "State your position directly.",
      "Support it with an academic reason.",
      "Acknowledge one possible limitation or risk.",
    ],
    sample_response:
      "Peer review should be a required part of academic writing classes because it helps students recognize weaknesses in structure, evidence, and clarity before final submission. It also encourages learners to read academic writing critically, which can improve their own drafting decisions. However, peer review is only reliable when students receive clear guidance; otherwise, comments may remain too vague to support meaningful revision.",
  },
  {
    id: "b2-ai-feedback-policy",
    level: "B2",
    title: "AI feedback in first-year writing",
    scenario: "A department is debating whether first-year students should be allowed to use AI tools for feedback on grammar and clarity before they submit coursework.",
    prompt: "Write a short analytical paragraph arguing whether universities should allow limited AI feedback support in first-year academic writing.",
    skill_focus: "Present a policy position with balance, precision, and one clear condition.",
    checkpoints: [
      "State one policy position clearly.",
      "Explain one strong reason.",
      "Add one condition or limit.",
    ],
    sample_response:
      "Universities should allow limited AI feedback in first-year writing because it can help students notice recurring grammar and clarity problems more quickly during revision. This support is especially useful for multilingual learners who need immediate language guidance outside class hours. Even so, such use should remain limited to feedback rather than content generation, otherwise the line between support and authorship becomes unclear.",
  },
];

export function getWritingPromptsForLevel(level: CEFRLevel) {
  return writingPrompts.filter((prompt) => prompt.level === level);
}

export function getWritingPromptById(id: string) {
  return writingPrompts.find((prompt) => prompt.id === id) ?? null;
}

import type { ReadingPracticePassage } from "@/lib/reading-passages";

export const articleCategories = [
  "All",
  "Academic Skills",
  "Campus Life",
  "Science & Tech",
  "Culture & Society",
] as const;

export type ReadingArticleCategory = Exclude<(typeof articleCategories)[number], "All">;

export interface ReadingArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface ReadingArticle {
  id: string;
  title: string;
  excerpt: string;
  category: ReadingArticleCategory;
  difficulty: "Low" | "Medium" | "High";
  cefr: "A2" | "B1" | "B2";
  word_count: number;
  read_count: number;
  published_at: string;
  author: string;
  focus: string;
  keywords: string[];
  takeaways: string[];
  reflection_prompt: string;
  sections: ReadingArticleSection[];
  featured?: boolean;
}

export const readingArticles: ReadingArticle[] = [
  {
    id: "thesis-statement-basics",
    title: "How to Write an Effective Thesis Statement",
    excerpt:
      "A thesis statement gives first-year writers a clear direction. This article explains how to move from a broad topic to a focused academic claim.",
    category: "Academic Skills",
    difficulty: "Low",
    cefr: "A2",
    word_count: 520,
    read_count: 342,
    published_at: "2026-03-10",
    author: "DIICSU Writing Desk",
    focus: "Turn a general topic into a focused claim that can guide a paragraph or short essay.",
    keywords: ["thesis statement", "essay plan", "topic sentence", "claim"],
    takeaways: [
      "A thesis statement should make one clear academic point.",
      "Strong thesis sentences are specific enough to guide evidence selection.",
      "Reading the question carefully is the first step to writing a usable claim.",
    ],
    reflection_prompt:
      "Think about one course reading you have completed this week. What one-sentence claim could become the thesis for a response paragraph?",
    sections: [
      {
        heading: "Why first-year students need a thesis statement",
        paragraphs: [
          "Many new university students begin writing by collecting ideas without deciding what their main point will be. This often leads to paragraphs that sound busy but do not answer the question directly. A thesis statement solves that problem because it tells the reader what the writer is trying to prove, explain, or evaluate.",
          "For DIICSU freshmen, the thesis statement is especially useful because many assignments ask for short analytical responses rather than long essays. If the opening claim is weak, the rest of the paragraph usually becomes descriptive instead of academic. A clear thesis helps students choose relevant evidence and avoid repeating background information.",
        ],
      },
      {
        heading: "What makes a thesis statement effective",
        paragraphs: [
          "An effective thesis statement is specific, arguable, and connected to the task. For example, the sentence 'Technology is important in education' is too broad to guide a paragraph. A stronger version would be 'Structured use of AI tools can improve first-year study habits when students still check evidence and write final responses independently.'",
          "This second sentence works better because it takes a position and introduces a clear condition. The writer can now add reasons, examples, and limits. When you draft your own thesis, ask whether a teacher could disagree with it or request proof. If the answer is yes, the sentence is probably strong enough to support academic writing.",
        ],
      },
      {
        heading: "A simple revision routine",
        paragraphs: [
          "Before submitting a paragraph, read your thesis statement again and compare it with every supporting sentence. Each sentence should explain, prove, or illustrate the same main point. If a sentence does not help the thesis, it probably belongs in another paragraph or should be deleted.",
          "A useful final check is to underline the keywords in the assignment question and then underline the keywords in your thesis. There should be a clear match. This small habit helps first-year writers stay focused, write more efficiently, and build better links between reading and writing.",
        ],
      },
    ],
  },
  {
    id: "lecture-note-strategies",
    title: "Note-Taking Strategies for Lecture Comprehension",
    excerpt:
      "Good lecture notes support both listening and later reading. This article compares simple note-taking methods that help first-year students study with more control.",
    category: "Academic Skills",
    difficulty: "Medium",
    cefr: "B1",
    word_count: 610,
    read_count: 215,
    published_at: "2026-03-12",
    author: "Academic Skills Hub",
    focus: "Choose a note-taking method that turns lectures into reviewable study material.",
    keywords: ["lecture", "Cornell method", "outline", "review", "main idea"],
    takeaways: [
      "Useful notes record structure, not every spoken word.",
      "A note-taking method should make revision easier after class.",
      "The best system is the one you can use consistently each week.",
    ],
    reflection_prompt:
      "After your next lecture, compare your notes with a classmate's. Which details helped you understand the lecture structure more clearly?",
    sections: [
      {
        heading: "Why lecture notes often fail",
        paragraphs: [
          "Many first-year students write too much during lectures because they are afraid of missing important information. As a result, their notes become long lists of disconnected phrases. When they return to those notes before an exam, they can see individual facts but not the relationship between the lecturer's main ideas, examples, and transitions.",
          "A more effective approach is to listen for structure first. Lecturers often signal movement with phrases such as 'the first reason', 'in contrast', or 'to sum up'. If students capture these signals, they can organize notes around the logic of the lecture instead of trying to copy every sentence.",
        ],
      },
      {
        heading: "Comparing three common methods",
        paragraphs: [
          "The Cornell method divides the page into cues, notes, and summary. It works well for students who want a built-in revision routine after class. The outline method is faster and suits lectures with clear headings and sub-points. Mind mapping is often helpful for visual learners, especially when a lecturer compares related concepts or processes.",
          "There is no perfect method for every module. However, the most useful system is usually the one that makes review easier. If your notes help you answer three questions after class, what was the main point, what evidence was used, and what example was given, then your method is probably supporting comprehension rather than only transcription.",
        ],
      },
      {
        heading: "Turning notes into study support",
        paragraphs: [
          "Strong note-taking does not end when the lecture ends. Within twenty-four hours, students should return to their notes, fill in missing details, and write a short summary in their own words. This process turns temporary listening input into material that can support later reading, seminar discussion, or assessment preparation.",
          "For DIICSU students, this habit also strengthens cross-skill development. A well-organized page of notes can become the basis for a reading question, a speaking response, or a short analytical paragraph. In that sense, note-taking is not only a listening skill. It is part of a wider academic learning system.",
        ],
      },
    ],
  },
  {
    id: "academic-integrity-first-year-guide",
    title: "Understanding Academic Integrity at University",
    excerpt:
      "Academic integrity is not only about avoiding plagiarism. It is about showing where ideas come from and building honest study habits from the start.",
    category: "Campus Life",
    difficulty: "Low",
    cefr: "A2",
    word_count: 540,
    read_count: 428,
    published_at: "2026-03-08",
    author: "First-Year Student Support Team",
    focus: "Understand what counts as responsible academic practice before the first major assignment.",
    keywords: ["academic integrity", "plagiarism", "citation", "paraphrase", "reference"],
    takeaways: [
      "Academic integrity means using sources honestly and clearly.",
      "Accidental plagiarism often comes from weak note-taking or rushed drafting.",
      "Simple habits can reduce risk before submission.",
    ],
    reflection_prompt:
      "When you read a source for an assignment, what information do you need to record immediately so that you can reference it later?",
    sections: [
      {
        heading: "What academic integrity means",
        paragraphs: [
          "At university, students are expected to show which ideas are their own and which ideas come from other people. This is the basic principle of academic integrity. It includes accurate citation, honest note-taking, fair collaboration, and responsible use of digital tools.",
          "Many freshmen hear the word plagiarism first and assume integrity is only about punishment. In reality, it is also about trust. Teachers need to see how students think, how they use reading, and how they build arguments. Clear referencing helps teachers understand that process and evaluate student work fairly.",
        ],
      },
      {
        heading: "Why accidental plagiarism happens",
        paragraphs: [
          "New students often copy sentences into notes because they are reading quickly or trying to remember useful ideas. Later, when they write under time pressure, they may forget which words came from the source and which words are their own. This is one of the most common reasons for accidental plagiarism.",
          "Another problem appears when students paraphrase too closely. Changing two or three words in a sentence is not enough if the original structure remains the same. Good paraphrasing requires real understanding of the source and the ability to restate the point in a new form while still acknowledging the original author.",
        ],
      },
      {
        heading: "Safer habits for first assignments",
        paragraphs: [
          "A practical first habit is to separate direct quotations from paraphrased notes. Use quotation marks in your notebook or digital file whenever you copy exact wording. A second habit is to record source information immediately, including author, year, title, and page number if relevant. This saves time later and reduces confusion during drafting.",
          "Students should also review submission rules before uploading final work. If a task allows support tools such as grammar checkers or AI for brainstorming, use them carefully and continue to produce the final analysis independently. Academic integrity is strongest when students combine honesty, organization, and good revision practice.",
        ],
      },
    ],
  },
  {
    id: "managing-academic-stress",
    title: "Managing Academic Stress as a First-Year Student",
    excerpt:
      "Academic pressure is common in the first semester. This article explains how routines, realistic planning, and support systems reduce avoidable stress.",
    category: "Campus Life",
    difficulty: "Medium",
    cefr: "B1",
    word_count: 600,
    read_count: 189,
    published_at: "2026-03-14",
    author: "Student Success Office",
    focus: "Recognize the causes of study stress and build routines that protect learning quality.",
    keywords: ["stress", "routine", "deadline", "wellbeing", "support"],
    takeaways: [
      "Stress often grows when tasks stay unclear for too long.",
      "Simple weekly routines reduce decision pressure and missed deadlines.",
      "Asking for support early is part of effective study, not a sign of failure.",
    ],
    reflection_prompt:
      "Which part of your weekly routine creates the most uncertainty right now, and what one small change could make it easier to manage?",
    sections: [
      {
        heading: "The first signs of academic overload",
        paragraphs: [
          "The first semester can feel intense because students are adapting to new expectations in several areas at once. They are learning module content, dealing with unfamiliar assessment formats, and often working in a second language. Stress rises quickly when these demands appear together and students do not yet have systems for planning or prioritizing.",
          "Common warning signs include skipping readings because they seem too long, delaying emails to teachers, and spending many hours studying without feeling productive. These signs matter because they show that the problem is often not effort. It is usually a problem of structure, clarity, or recovery.",
        ],
      },
      {
        heading: "Why routine matters more than motivation",
        paragraphs: [
          "Many students wait to feel motivated before starting difficult work. However, academic progress depends more on repeatable routines than on mood. A weekly study plan that includes reading blocks, short review sessions, and protected rest time usually produces better results than irregular periods of intense work.",
          "Routine also lowers cognitive load. When students know when they will read, write, and revise, they spend less energy deciding what to do next. For first-year learners, this stability can improve attendance, reading completion, and assignment quality at the same time.",
        ],
      },
      {
        heading: "Using support systems early",
        paragraphs: [
          "Students often seek help only after a serious problem appears. A healthier approach is to use support before the situation becomes urgent. Office hours, peer study groups, academic language workshops, and wellbeing services are all more effective when they are used early enough to guide adjustment rather than repair failure.",
          "For DIICSU freshmen, the most useful question is not 'Can I manage everything alone?' but 'Which support will help me keep learning steadily?' Students who ask for clarification, compare study strategies, and monitor workload regularly usually build stronger confidence by the end of the semester.",
        ],
      },
    ],
  },
  {
    id: "ai-in-higher-education",
    title: "The Impact of Artificial Intelligence on Higher Education",
    excerpt:
      "AI tools can support feedback, planning, and language development, but first-year students still need judgment, source checking, and academic integrity.",
    category: "Science & Tech",
    difficulty: "Medium",
    cefr: "B1",
    word_count: 670,
    read_count: 512,
    published_at: "2026-03-15",
    author: "Digital Learning Lab",
    focus: "Understand how AI can support study without replacing reading, evidence checking, or original thinking.",
    keywords: ["artificial intelligence", "feedback", "integrity", "drafting", "evidence"],
    takeaways: [
      "AI works best as a support tool, not as a substitute for learning.",
      "Students still need to verify evidence and write final responses independently.",
      "Responsible AI use depends on course rules and transparent study habits.",
    ],
    reflection_prompt:
      "Which part of your study process could benefit from AI support, and which part should always remain your own work?",
    sections: [
      {
        heading: "Where AI tools can help",
        paragraphs: [
          "Artificial intelligence is becoming part of everyday university study. Many students use AI systems to explain unfamiliar vocabulary, generate revision questions, or suggest ways to organize a paragraph. These uses can be helpful because they reduce friction at the start of a task and give learners faster feedback during independent study.",
          "In language learning contexts, AI can be especially useful for checking tone, suggesting clearer wording, or identifying patterns in repeated grammar mistakes. For international students, this kind of support can make academic English feel more approachable and can increase confidence before tutorials or written assignments.",
        ],
      },
      {
        heading: "Why AI also creates risks",
        paragraphs: [
          "The main danger appears when students confuse convenience with reliability. AI-generated answers can sound confident even when they are inaccurate, oversimplified, or unsupported by credible sources. If students accept these responses without checking them against course materials, they may repeat weak arguments or incorrect facts in assessed work.",
          "There is also an integrity issue. Some universities allow limited AI use for brainstorming or language support, while others restrict it more strongly. Students therefore need to understand module rules clearly. Responsible use means treating AI as a study assistant, not as a ghost writer that produces finished academic work.",
        ],
      },
      {
        heading: "A responsible first-year approach",
        paragraphs: [
          "A practical model is to use AI for preparation, not replacement. Students can ask for vocabulary explanations, outline suggestions, or revision checklists, but they should still read original sources, take their own notes, and produce final arguments independently. This keeps the learning process active and visible.",
          "For DIICSU freshmen, the strongest habit is to pair AI use with evidence checking. If a tool gives an explanation, compare it with lecture notes, assigned readings, or a reliable database. When students keep that checking routine, AI becomes a useful academic support system rather than a shortcut that weakens real learning.",
        ],
      },
    ],
    featured: true,
  },
  {
    id: "reading-scientific-reports",
    title: "Climate Change: How to Read Scientific Reports",
    excerpt:
      "Scientific reports can feel dense at first. This article shows students how to read structure, hedging, and evidence strength without needing expert knowledge in the field.",
    category: "Science & Tech",
    difficulty: "High",
    cefr: "B2",
    word_count: 720,
    read_count: 97,
    published_at: "2026-03-11",
    author: "Research Literacy Unit",
    focus: "Read scientific reports critically by identifying structure, evidence claims, and cautious language.",
    keywords: ["scientific report", "hedging", "methodology", "evidence strength", "data"],
    takeaways: [
      "Scientific reports follow predictable structures that support selective reading.",
      "Hedging language signals caution, limitation, or uncertainty.",
      "Critical reading involves asking how strong the evidence really is.",
    ],
    reflection_prompt:
      "The next time you read a scientific summary, which sentence seems to make the strongest claim, and what evidence is offered to support it?",
    sections: [
      {
        heading: "Reading the structure before the detail",
        paragraphs: [
          "Scientific reports often intimidate new readers because they contain technical vocabulary, compressed information, and frequent reference to data. However, they also follow recognizable structures. Titles, abstracts, section headings, figure captions, and conclusion paragraphs provide a map that helps readers decide where to focus attention first.",
          "Students do not need to understand every sentence immediately. A better strategy is to skim for purpose. Ask what question the report is trying to answer, what method was used, and what the main finding appears to be. This structural preview creates a framework that makes detailed reading more manageable.",
        ],
      },
      {
        heading: "Why hedging matters",
        paragraphs: [
          "Scientific writers rarely make absolute claims unless the evidence is exceptionally strong. Instead, they use cautious language such as 'suggests', 'is associated with', or 'may indicate'. This hedging is not weakness. It reflects responsible interpretation because scientific evidence often has limits related to sample size, method, or context.",
          "When students ignore hedging, they may misread a measured conclusion as a universal truth. A sentence stating that climate policies 'may reduce emissions in urban transport systems' does not mean the effect is guaranteed everywhere. Reading hedging carefully helps students understand both the value and the limits of the evidence.",
        ],
      },
      {
        heading: "Questions that strengthen critical reading",
        paragraphs: [
          "A useful critical reading routine is to ask three questions. First, what exactly is being claimed? Second, what evidence is used to support that claim? Third, what limitation or uncertainty remains? These questions encourage students to move beyond vocabulary recognition and toward genuine analytical reading.",
          "For DIICSU students who meet scientific sources across disciplines, this skill has wide value. Engineering, environmental studies, policy, and education research all depend on careful interpretation of evidence. Students who can read scientific reports critically are better prepared for research-based assignments and more confident when joining academic discussions.",
        ],
      },
    ],
  },
  {
    id: "cross-cultural-teamwork",
    title: "Cross-Cultural Communication in International Teams",
    excerpt:
      "Group projects often fail because students interpret silence, disagreement, and feedback in different ways. This article offers practical strategies for international teamwork.",
    category: "Culture & Society",
    difficulty: "Medium",
    cefr: "B1",
    word_count: 590,
    read_count: 163,
    published_at: "2026-03-13",
    author: "Global Classroom Project",
    focus: "Work more effectively in diverse teams by understanding different communication expectations.",
    keywords: ["teamwork", "communication style", "feedback", "seminar", "disagreement"],
    takeaways: [
      "Different communication styles do not automatically mean poor teamwork.",
      "Teams work better when expectations are discussed early and clearly.",
      "Useful feedback is specific, respectful, and linked to a shared goal.",
    ],
    reflection_prompt:
      "In a recent group task, how did your team show agreement or disagreement? What worked well, and what created confusion?",
    sections: [
      {
        heading: "Why group communication feels difficult",
        paragraphs: [
          "International classrooms bring together students with different expectations about politeness, leadership, and participation. In some contexts, direct disagreement is seen as efficient and honest. In others, it may sound rude or overly aggressive. Because of these differences, group members can misunderstand each other even when everyone is trying to cooperate.",
          "First-year students often experience this problem during presentations or project planning. One student may interpret silence as disinterest, while another sees it as respectful listening. Without discussion, these different interpretations can produce frustration, uneven workload, or weak final performance.",
        ],
      },
      {
        heading: "Making expectations visible",
        paragraphs: [
          "A strong team begins by making expectations explicit. Members should agree on meeting times, response speed, task ownership, and how feedback will be given. These small decisions reduce uncertainty and help prevent unfair assumptions about effort or commitment.",
          "Clear language also matters. When students say 'I am not convinced by this example because it does not match the data' instead of 'This is bad', they make disagreement easier to accept. The goal is not to remove difference from communication, but to make the purpose of the message easier to understand.",
        ],
      },
      {
        heading: "Turning difference into a strength",
        paragraphs: [
          "Cross-cultural teams can become stronger than uniform groups because they bring more perspectives to the same task. Students may notice different risks, suggest alternative examples, or challenge assumptions that would otherwise go untested. However, this benefit appears only when teams manage communication carefully.",
          "For DIICSU freshmen, the practical lesson is simple: do not assume that one communication style is the only correct one. Instead, build shared habits that allow different styles to work together. This approach improves teamwork now and prepares students for international academic and professional settings later.",
        ],
      },
    ],
  },
  {
    id: "digital-literacy-information-overload",
    title: "Digital Literacy in the Age of Information Overload",
    excerpt:
      "University students read more information than ever, but not all of it deserves trust. This article explains how to evaluate sources and control digital overload.",
    category: "Culture & Society",
    difficulty: "High",
    cefr: "B2",
    word_count: 710,
    read_count: 134,
    published_at: "2026-03-09",
    author: "Academic Media Lab",
    focus: "Develop source evaluation habits that support academic reading in high-information environments.",
    keywords: ["digital literacy", "source evaluation", "bias", "evidence", "algorithm"],
    takeaways: [
      "Fast access to information does not guarantee trustworthy knowledge.",
      "Students should evaluate source purpose, evidence, and authority before reuse.",
      "A repeatable verification routine reduces confusion and weak citation choices.",
    ],
    reflection_prompt:
      "When you search for information online, what signals help you decide whether a source is trustworthy enough to use in academic work?",
    sections: [
      {
        heading: "Why overload is an academic problem",
        paragraphs: [
          "University students now encounter information through search engines, social platforms, newsletters, video summaries, and AI-generated outputs. This constant flow creates a difficult paradox. Information is easier to access than ever, but it is also harder to judge quickly. Students may spend long periods reading without building real understanding because they move between too many disconnected sources.",
          "Information overload becomes especially dangerous during assignment preparation. Under time pressure, students may choose sources because they are easy to access rather than because they are reliable or relevant. The result is often shallow argumentation built on weak evidence.",
        ],
      },
      {
        heading: "Reading sources critically",
        paragraphs: [
          "Critical source evaluation begins with simple but demanding questions. Who produced this text? What evidence is used? What audience is it addressing? Does the source explain method, cite references, or acknowledge limitations? These questions help students distinguish between informed analysis and unsupported opinion.",
          "Bias does not always mean a source is useless, but it does mean the reader should interpret claims carefully. A report from a company, a newspaper opinion column, and a peer-reviewed article can all discuss the same topic while offering different kinds of evidence. Academic readers need to recognize these differences instead of treating all sources as equal.",
        ],
      },
      {
        heading: "Building a reliable verification routine",
        paragraphs: [
          "Students can protect themselves from overload by using a short verification routine. First, identify the source type. Second, scan for evidence and references. Third, compare the claim with at least one additional trustworthy source. This routine slows the reading process slightly, but it improves confidence and reduces weak citation choices.",
          "For DIICSU freshmen, digital literacy is not an optional extra. It supports reading, writing, seminar preparation, and responsible use of technology. Students who learn to question digital information carefully are better prepared to build credible arguments and to navigate future academic research with independence.",
        ],
      },
    ],
  },
];

const articleMap = new Map(readingArticles.map((article) => [article.id, article]));

export function getReadingArticleById(id: string) {
  return articleMap.get(id);
}

export function getReadingArticlesByIds(ids: string[]) {
  return ids
    .map((id) => articleMap.get(id))
    .filter((article): article is ReadingArticle => Boolean(article));
}

export function getLessonCodeForReadingArticle(article: Pick<ReadingArticle, "cefr">) {
  return `${article.cefr}-reading-starter`;
}

/**
 * Return up to `limit` related articles, ranked by shared category, then CEFR proximity, then keyword overlap.
 */
export function getRelatedArticles(
  article: ReadingArticle,
  limit = 3,
): ReadingArticle[] {
  const cefrOrder: ReadingArticle["cefr"][] = ["A2", "B1", "B2"];
  const currentCefrIndex = cefrOrder.indexOf(article.cefr);

  return readingArticles
    .filter((a) => a.id !== article.id)
    .map((candidate) => {
      let score = 0;
      // Same category = strong signal
      if (candidate.category === article.category) score += 10;
      // CEFR proximity (closer = better)
      const cefrDist = Math.abs(cefrOrder.indexOf(candidate.cefr) - currentCefrIndex);
      score += 3 - cefrDist;
      // Keyword overlap
      const overlap = candidate.keywords.filter((k) => article.keywords.includes(k)).length;
      score += overlap * 2;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

export function buildPracticePassageFromArticle(article: ReadingArticle): ReadingPracticePassage {
  return {
    level: article.cefr,
    band: article.difficulty,
    title: article.title,
    paragraphs: article.sections.flatMap((section) => section.paragraphs),
    vocab_options: article.keywords.slice(0, 5),
  };
}

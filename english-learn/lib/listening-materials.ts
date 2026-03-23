import type { CEFRLevel } from "@/types/learning";

export type DIICSUMajorId =
  | "civil-engineering"
  | "mathematics"
  | "computing-science"
  | "mechanical-engineering"
  | "mechanical-engineering-transportation";

export type ListeningAccent = "british" | "american" | "global";
export type ListeningContentMode = "practice" | "ted";

export interface DIICSUMajorProfile {
  id: DIICSUMajorId;
  label: string;
  shortLabel: string;
  focus: string;
}

export interface ListeningVocabularyItem {
  term: string;
  definition: string;
}

export interface ListeningQuestion {
  id: string;
  prompt: string;
  placeholder: string;
  modelAnswer: string;
  rubricNote: string;
  matchGroups: string[][];
}

export interface ListeningMaterial {
  id: string;
  contentMode: ListeningContentMode;
  materialGroupId: string;
  materialGroupLabel: string;
  majorId: DIICSUMajorId;
  majorLabel: string;
  accent: ListeningAccent;
  accentLabel: string;
  accentHint: string;
  title: string;
  source: string;
  sourceName: string;
  speakerRole: string;
  speakerName?: string;
  scenario: string;
  transcript: string;
  transcriptUrl?: string;
  officialUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  recommendedLevel: CEFRLevel;
  durationLabel: string;
  supportFocus: string;
  notePrompts: string[];
  vocabulary: ListeningVocabularyItem[];
  questions: ListeningQuestion[];
  followUpTask: string;
  audioSrc: string | null;
  audioVoice: string | null;
  voiceLocales: string[];
}

export interface ListeningQuestionFeedback {
  id: string;
  prompt: string;
  answer: string;
  correct: boolean;
  modelAnswer: string;
  rubricNote: string;
  evidenceSentence: string | null;
  evidenceNote: string;
}

export interface ListeningScoreResult {
  overallScore: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  strengths: string[];
  revisionFocus: string;
  noteFeedback: string;
  nextAction: string;
  questionFeedback: ListeningQuestionFeedback[];
}

export interface ListeningSentenceSegment {
  id: string;
  text: string;
  startRatio: number;
  endRatio: number;
}

export interface ShadowingScoreResult {
  overallScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  extraKeywords: string[];
  note: string;
}

export interface ListeningMaterialOption {
  id: string;
  label: string;
  summary: string;
  durationLabel: string;
  recommendedLevel: CEFRLevel;
  contentMode: ListeningContentMode;
}

interface AccentVariant {
  title: string;
  source: string;
  speakerRole: string;
  transcript: string;
  recommendedLevel: CEFRLevel;
  durationLabel: string;
  supportFocus: string;
  audioVoice: string;
  voiceLocales: string[];
}

interface ListeningBlueprint {
  groupId: string;
  groupLabel: string;
  majorId: DIICSUMajorId;
  scenario: string;
  notePrompts: string[];
  vocabulary: ListeningVocabularyItem[];
  questions: ListeningQuestion[];
  followUpTask: string;
  variants: Record<ListeningAccent, AccentVariant>;
}

const accentMeta: Record<ListeningAccent, { label: string; hint: string }> = {
  british: {
    label: "British English",
    hint: "Lecture and lab briefing tone closer to UK university delivery.",
  },
  american: {
    label: "American English",
    hint: "A US-style classroom or project briefing with clearer stress and pacing shifts.",
  },
  global: {
    label: "Global English",
    hint: "International academic English for mixed classrooms and project teams.",
  },
};

export const listeningMajors: DIICSUMajorProfile[] = [
  {
    id: "civil-engineering",
    label: "Civil Engineering",
    shortLabel: "Civil",
    focus: "Drainage, structures, site inspection, and flood resilience.",
  },
  {
    id: "mathematics",
    label: "Mathematics",
    shortLabel: "Maths",
    focus: "Statistics, modelling, variables, and interpretation of data.",
  },
  {
    id: "computing-science",
    label: "Computing Science",
    shortLabel: "Computing",
    focus: "Repositories, debugging, sprint review, and system performance.",
  },
  {
    id: "mechanical-engineering",
    label: "Mechanical Engineering",
    shortLabel: "Mechanical",
    focus: "Thermal systems, lab procedure, measurement, and equipment safety.",
  },
  {
    id: "mechanical-engineering-transportation",
    label: "Mechanical Engineering with Transportation",
    shortLabel: "Transport",
    focus: "Transport systems, simulation, reliability, and route efficiency.",
  },
];

export const listeningAccents = [
  { id: "british", label: accentMeta.british.label, hint: accentMeta.british.hint },
  { id: "american", label: accentMeta.american.label, hint: accentMeta.american.hint },
  { id: "global", label: accentMeta.global.label, hint: accentMeta.global.hint },
] as const;

const listeningBlueprints: ListeningBlueprint[] = [
  {
    groupId: "civil-engineering",
    groupLabel: "Drainage inspection",
    majorId: "civil-engineering",
    scenario: "Field-briefing listening for drainage inspection and retaining-wall risk.",
    notePrompts: [
      "What is the inspection task?",
      "Which location needs priority attention?",
      "Which signpost phrase showed priority?",
      "Which technical term should go into your notes?",
    ],
    vocabulary: [
      { term: "runoff", definition: "water that flows over the ground after rain" },
      { term: "retaining wall", definition: "a wall that holds back soil or water pressure" },
      { term: "permeability", definition: "how easily water can pass through a material" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main purpose of the briefing?",
        placeholder: "Write the main task in one sentence.",
        modelAnswer: "The speaker explains a drainage inspection plan after heavy rain.",
        rubricNote: "State the engineering task, not only the location.",
        matchGroups: [["drainage", "runoff", "rain"], ["inspection", "check", "survey", "plan"]],
      },
      {
        id: "detail",
        prompt: "Which location should the team inspect first?",
        placeholder: "Name the place the speaker prioritizes.",
        modelAnswer: "The east retaining wall by the lower footpath should be checked first.",
        rubricNote: "Capture the location accurately because it drives the field summary.",
        matchGroups: [["east"], ["retaining wall", "wall"]],
      },
      {
        id: "signpost",
        prompt: "Which phrase told you that the speaker was identifying the priority?",
        placeholder: "Write the signpost phrase you heard.",
        modelAnswer: "The priority signpost is a phrase like 'the key point is' or 'what matters most is'.",
        rubricNote: "Listening for signposting helps you structure lecture notes faster.",
        matchGroups: [["key point", "most important", "matters most"]],
      },
      {
        id: "term",
        prompt: "Which technical term in the clip is connected to water movement across the site?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct technical term is 'runoff'.",
        rubricNote: "Technical vocabulary should be written exactly for later review.",
        matchGroups: [["runoff"]],
      },
    ],
    followUpTask:
      "Compare your notes with a classmate and turn the briefing into a 60-word field summary about drainage risk.",
    variants: {
      british: {
        title: "Retaining wall drainage briefing",
        source: "Civil Engineering site inspection mini-lecture",
        speakerRole: "British lecturer",
        transcript:
          "Before next Tuesday's site visit, I want your group to focus on drainage around the east retaining wall. After last week's rain, surface runoff collected near the lower footpath, and that is where small cracks became visible. The key point is that we are not checking the whole structure at once. We are starting with the wall section that already shows moisture marks. First, note the slope, the drain outlet, and any blocked channels. Then compare your notes with the permeability figures from the lab sheet. If the water cannot leave the area quickly, pressure will build behind the retaining wall. That is the risk I want you to explain in your field summary.",
        recommendedLevel: "B1",
        durationLabel: "75-90 sec",
        supportFocus: "Track inspection priorities, location detail, and one technical term while listening.",
        audioVoice: "Daniel (英语（英国）)",
        voiceLocales: ["en-GB", "en-IE"],
      },
      american: {
        title: "Storm runoff inspection plan",
        source: "Civil Engineering project briefing",
        speakerRole: "American instructor",
        transcript:
          "For this week's field check, your team should start at the east retaining wall near the lower walkway. During the storm last week, runoff stayed in that corner longer than anywhere else, so we already have visible moisture marks and minor cracking there. The most important point is that you should not spread your attention across the whole site. Begin with the section that is already showing stress. Record the slope, the drain outlet, and any blocked channels. After that, compare what you saw with the permeability data from the lab handout. If water does not leave the area quickly, pressure builds behind the retaining wall, and that is the mechanism you need to explain in your report.",
        recommendedLevel: "A2",
        durationLabel: "70-85 sec",
        supportFocus: "Catch a clear task sequence and connect it to the engineering risk.",
        audioVoice: "Samantha",
        voiceLocales: ["en-US"],
      },
      global: {
        title: "Flood-resilience site note briefing",
        source: "International project-team briefing",
        speakerRole: "Global English project lead",
        transcript:
          "When you arrive at the site, please begin with the east retaining wall beside the lower footpath. After the recent rain, runoff remained in that area and left moisture marks on the wall surface. What matters most is that you inspect the first high-risk section carefully instead of trying to record every part of the site. Write down the slope, the drain outlet, and any blocked channels. Then check those notes against the permeability values from your lab sheet. If the water cannot escape quickly, pressure increases behind the retaining wall. In your final summary, explain why that pressure may lead to additional cracking if drainage is not improved.",
        recommendedLevel: "B1",
        durationLabel: "75-90 sec",
        supportFocus: "Handle international academic English while keeping technical notes concise.",
        audioVoice: "Aman",
        voiceLocales: ["en-IN", "en-AU", "en-NZ", "en-SG", "en-ZA"],
      },
    },
  },
  {
    groupId: "mathematics",
    groupLabel: "Sampling bias",
    majorId: "mathematics",
    scenario: "Statistics-listening practice on sampling bias and interpretation.",
    notePrompts: [
      "What is the lecturer warning students about?",
      "Which group makes the data unbalanced?",
      "Which example phrase did you hear?",
      "Which data term should stay in your notes?",
    ],
    vocabulary: [
      { term: "sample", definition: "the group selected for data collection" },
      { term: "bias", definition: "a repeated error that pushes results in one direction" },
      { term: "variable", definition: "the feature or value being measured" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the lecturer's main warning?",
        placeholder: "Write the main mathematical point in one sentence.",
        modelAnswer: "The lecturer warns that sampling bias can make the conclusion misleading.",
        rubricNote: "The main idea is about data quality, not just stress levels.",
        matchGroups: [["bias", "sampling bias"], ["misleading", "not represent", "unbalanced", "distort"]],
      },
      {
        id: "detail",
        prompt: "Which student group appears too often in the survey data?",
        placeholder: "Name the over-represented group.",
        modelAnswer: "First-year students appear too often in the survey sample.",
        rubricNote: "Specific detail matters because it explains why the sample is weak.",
        matchGroups: [["first year", "first-year", "year one"]],
      },
      {
        id: "signpost",
        prompt: "Which phrase introduced the lecturer's example?",
        placeholder: "Write the example signpost phrase.",
        modelAnswer: "The lecturer uses a phrase like 'for example' or 'for instance'.",
        rubricNote: "Example markers are useful listening anchors in statistics lectures.",
        matchGroups: [["for example", "for instance"]],
      },
      {
        id: "term",
        prompt: "Which term refers to the group from which data is collected?",
        placeholder: "Write one technical term.",
        modelAnswer: "The correct term is 'sample'.",
        rubricNote: "Core quantitative vocabulary should be spelled correctly in notes.",
        matchGroups: [["sample"]],
      },
    ],
    followUpTask:
      "Turn the listening notes into a short explanation of why a narrow sample can weaken a mathematical conclusion.",
    variants: {
      british: {
        title: "Sampling bias in a student survey",
        source: "Mathematics statistics tutorial",
        speakerRole: "British lecturer",
        transcript:
          "In this week's statistics tutorial, we are looking at sampling bias in the survey about study stress. Most of the responses came from first-year students, so the sample does not represent the full college population. The main warning is simple: do not treat the average score as a complete picture. For example, older students on placement reported very different study patterns, but their numbers were too small to influence the final mean. When you write your notes, separate the variable we measured from the group we sampled. If the sample is narrow, the conclusion may sound precise while still being misleading.",
        recommendedLevel: "B1",
        durationLabel: "65-80 sec",
        supportFocus: "Follow warning language, examples, and one key term from statistics.",
        audioVoice: "Daniel (英语（英国）)",
        voiceLocales: ["en-GB", "en-IE"],
      },
      american: {
        title: "Interpreting a biased data set",
        source: "Mathematics classroom explanation",
        speakerRole: "American lecturer",
        transcript:
          "Today we are reviewing sampling bias in the stress survey from last month. A large share of the responses came from first-year students, so the sample does not represent the whole institute very well. The main warning is this: do not assume the average result tells the full story. For example, students in later years reported different study habits, but there were too few of them to shift the final mean. In your notes, keep the variable separate from the group that was sampled. If the sample is too narrow, the calculation may look clean even though the conclusion is still misleading.",
        recommendedLevel: "A2",
        durationLabel: "65-80 sec",
        supportFocus: "Catch the warning, example, and one data term at moderate speed.",
        audioVoice: "Samantha",
        voiceLocales: ["en-US"],
      },
      global: {
        title: "Survey reliability and sample limits",
        source: "International mathematics workshop",
        speakerRole: "Global English workshop tutor",
        transcript:
          "In this session, we are checking why sampling bias can reduce the value of survey results. Most answers came from first-year students, so the sample is not broad enough to describe the whole student body. The central warning is that a neat average may still give a misleading conclusion. For instance, students in later years followed different study routines, but their number was too small to affect the mean. In your listening notes, separate the variable from the sample. If the sample is narrow, the mathematics may be correct while the interpretation remains weak.",
        recommendedLevel: "B1",
        durationLabel: "65-80 sec",
        supportFocus: "Practice listening to international academic explanation without losing the statistical logic.",
        audioVoice: "Aman",
        voiceLocales: ["en-IN", "en-AU", "en-NZ", "en-SG", "en-ZA"],
      },
    },
  },
  {
    groupId: "computing-science",
    groupLabel: "Caching sprint review",
    majorId: "computing-science",
    scenario: "Sprint-review listening on debugging, memory use, and repository history.",
    notePrompts: [
      "What is the engineering problem?",
      "Which service caused the bug?",
      "Which contrast signpost did you hear?",
      "Which software-development term should you save?",
    ],
    vocabulary: [
      { term: "repository", definition: "the shared storage location for project code" },
      { term: "version control", definition: "the system used to track code changes over time" },
      { term: "memory leak", definition: "a problem where memory is not released properly" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the speaker asking the team to do?",
        placeholder: "Describe the main debugging task.",
        modelAnswer: "The team must review the caching service and explain the memory problem before the sprint review.",
        rubricNote: "Summarize both the technical focus and the team action.",
        matchGroups: [["cache", "caching"], ["memory", "debug", "review"]],
      },
      {
        id: "detail",
        prompt: "Which part of the system caused the problem?",
        placeholder: "Name the service or layer.",
        modelAnswer: "The problem came from the caching service or cache layer.",
        rubricNote: "Accurate subsystem names make debugging notes useful later.",
        matchGroups: [["caching service", "cache service", "cache layer"]],
      },
      {
        id: "signpost",
        prompt: "Which contrast phrase helped you follow the explanation?",
        placeholder: "Write the contrast phrase.",
        modelAnswer: "The contrast phrase is 'however'.",
        rubricNote: "Contrast markers often separate the symptom from the real cause.",
        matchGroups: [["however"]],
      },
      {
        id: "term",
        prompt: "Which term refers to the system that tracks code history?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'version control'.",
        rubricNote: "Keep software process vocabulary exact for team communication.",
        matchGroups: [["version control", "repository"]],
      },
    ],
    followUpTask:
      "Use your listening notes to give a 45-second spoken explanation of the bug, the cause, and the next fix.",
    variants: {
      british: {
        title: "Caching-service sprint review briefing",
        source: "Computing Science sprint-review mini-lecture",
        speakerRole: "British module tutor",
        transcript:
          "Before tomorrow's sprint review, please check the caching service in your group repository. During the last test, memory use kept rising even when user traffic stayed stable. However, the search function itself was not the main problem. The larger issue was that old session objects were not cleared after each request. In your listening notes, record the symptom, the cause, and the fix we expect you to propose. First, measure memory growth. Next, review the version control history to see when the cache logic changed. Then prepare one short explanation for the demo. If you can describe the bug clearly, your team will save time in the final debugging stage.",
        recommendedLevel: "B1",
        durationLabel: "70-85 sec",
        supportFocus: "Catch the system name, the true cause, and one process term from software engineering.",
        audioVoice: "Daniel (英语（英国）)",
        voiceLocales: ["en-GB", "en-IE"],
      },
      american: {
        title: "Debugging plan for the cache layer",
        source: "Computing Science project briefing",
        speakerRole: "American instructor",
        transcript:
          "Before the sprint review tomorrow, I need your team to inspect the caching service in the project repository. In the last performance test, memory kept climbing even though user traffic stayed almost flat. However, the search feature itself was not the real issue. The main problem was that old session objects stayed in memory after each request. In your notes, write down the symptom, the cause, and the fix you want to propose. First, measure memory growth. Then check the version control history to find when the cache logic changed. After that, prepare a short explanation for the demo so the team can debug faster.",
        recommendedLevel: "A2",
        durationLabel: "70-85 sec",
        supportFocus: "Listen for the debugging sequence and one key development term at moderate speed.",
        audioVoice: "Samantha",
        voiceLocales: ["en-US"],
      },
      global: {
        title: "Repository history and memory issue briefing",
        source: "International software-team meeting",
        speakerRole: "Global English project mentor",
        transcript:
          "Please review the caching service before the sprint meeting tomorrow. In our latest test, memory usage continued to rise while user traffic remained stable. However, the search module was not the central problem. The real issue was that session objects were not cleared correctly after each request. Your notes should include the symptom, the cause, and the fix we want to test next. First, measure the memory growth. Then use the version control history in the repository to identify when the cache logic changed. If you can explain that sequence clearly, the whole team will debug the system more efficiently.",
        recommendedLevel: "B1",
        durationLabel: "70-85 sec",
        supportFocus: "Practice mixed-accent software English while keeping the logic of the bug report clear.",
        audioVoice: "Aman",
        voiceLocales: ["en-IN", "en-AU", "en-NZ", "en-SG", "en-ZA"],
      },
    },
  },
  {
    groupId: "mechanical-engineering",
    groupLabel: "Heat exchanger lab",
    majorId: "mechanical-engineering",
    scenario: "Lab-briefing listening on heat transfer, measurement, and safety procedure.",
    notePrompts: [
      "What is the lab objective?",
      "Which measurement must be logged regularly?",
      "Which caution signpost did you hear?",
      "Which technical term should go into the report notes?",
    ],
    vocabulary: [
      { term: "thermal resistance", definition: "resistance to heat flow through a material or system" },
      { term: "coolant", definition: "the fluid used to remove or transfer heat" },
      { term: "efficiency", definition: "how effectively a system converts input into useful output" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main objective of the lab task?",
        placeholder: "Write the main objective in one sentence.",
        modelAnswer: "The objective is to measure heat-exchanger efficiency during the lab.",
        rubricNote: "The objective is broader than recording numbers alone.",
        matchGroups: [["heat exchanger"], ["efficiency"]],
      },
      {
        id: "detail",
        prompt: "Which measurement should be logged every five minutes?",
        placeholder: "Write the specific measurement.",
        modelAnswer: "Students should log the outlet temperature every five minutes.",
        rubricNote: "Regular measurements are key evidence in an engineering report.",
        matchGroups: [["outlet"], ["temperature"]],
      },
      {
        id: "signpost",
        prompt: "Which phrase warned students before the procedure started?",
        placeholder: "Write the warning phrase.",
        modelAnswer: "The warning phrase is 'before you start'.",
        rubricNote: "Procedure warnings often signal a shift from goal to safety.",
        matchGroups: [["before you start", "before starting", "one warning"]],
      },
      {
        id: "term",
        prompt: "Which technical term describes resistance to heat flow in the system?",
        placeholder: "Write one technical term.",
        modelAnswer: "The correct term is 'thermal resistance'.",
        rubricNote: "This term is central when you explain why efficiency changes.",
        matchGroups: [["thermal resistance"]],
      },
    ],
    followUpTask:
      "Use your notes to write three report sentences about the measurement, the warning, and the reason efficiency changed.",
    variants: {
      british: {
        title: "Heat exchanger lab briefing",
        source: "Mechanical Engineering lab introduction",
        speakerRole: "British lab tutor",
        transcript:
          "In the heat exchanger lab this afternoon, your objective is to measure efficiency rather than simply record numbers. Before you start, make sure the coolant line is open and the inlet reading is stable. Then log the outlet temperature every five minutes and compare it with the flow rate. If the outlet value begins to fall, do not adjust the valve immediately. First check whether thermal resistance has increased because of trapped air in the system. The reason I want detailed notes is that your report must explain not only what changed, but why the change affected heat transfer across the equipment.",
        recommendedLevel: "B1",
        durationLabel: "70-85 sec",
        supportFocus: "Listen for task objective, scheduled measurement, and one lab-safety warning.",
        audioVoice: "Daniel (英语（英国）)",
        voiceLocales: ["en-GB", "en-IE"],
      },
      american: {
        title: "Thermal systems measurement briefing",
        source: "Mechanical Engineering classroom lab talk",
        speakerRole: "American instructor",
        transcript:
          "In today's heat exchanger lab, the main goal is to measure efficiency, not just collect a list of numbers. Before you start, check that the coolant line is open and that the inlet reading is stable. Then record the outlet temperature every five minutes and compare it with the flow rate. If the outlet value drops, do not change the valve right away. First, see whether thermal resistance increased because air is trapped in the system. Your report needs to explain both the change you observed and the reason that change affected heat transfer through the equipment.",
        recommendedLevel: "A2",
        durationLabel: "70-85 sec",
        supportFocus: "Catch the procedural order and the reason behind the measurement sequence.",
        audioVoice: "Samantha",
        voiceLocales: ["en-US"],
      },
      global: {
        title: "Heat-transfer reporting briefing",
        source: "International engineering lab session",
        speakerRole: "Global English lab supervisor",
        transcript:
          "For this lab, your main objective is to measure heat-exchanger efficiency instead of writing isolated values. Before you start, confirm that the coolant line is open and that the inlet reading is stable. After that, record the outlet temperature every five minutes and compare it with the flow rate. If the outlet reading begins to fall, do not adjust the valve immediately. First check whether thermal resistance has increased because air is trapped inside the system. Your final report should explain both the observed change and the reason it influenced heat transfer across the equipment.",
        recommendedLevel: "B1",
        durationLabel: "70-85 sec",
        supportFocus: "Practice international engineering listening while still capturing exact measurements.",
        audioVoice: "Aman",
        voiceLocales: ["en-IN", "en-AU", "en-NZ", "en-SG", "en-ZA"],
      },
    },
  },
  {
    groupId: "mechanical-engineering-transportation",
    groupLabel: "Bus corridor simulation",
    majorId: "mechanical-engineering-transportation",
    scenario: "Transport-systems listening for route simulation, reliability, and delay spread.",
    notePrompts: [
      "What is the simulation task?",
      "Which route or location should be checked first?",
      "Which result signpost phrase did you hear?",
      "Which transport term should be kept in your notes?",
    ],
    vocabulary: [
      { term: "headway", definition: "the time gap between two vehicles on the same route" },
      { term: "dwell time", definition: "the time a vehicle spends stopped for boarding and alighting" },
      { term: "throughput", definition: "the amount of movement a transport system can handle in a period of time" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main task in the simulation briefing?",
        placeholder: "Write the main transport-systems task.",
        modelAnswer: "Teams must compare headway and dwell time to understand delay spread in the bus corridor.",
        rubricNote: "Mention both comparison and system purpose if possible.",
        matchGroups: [["headway"], ["dwell time", "delay", "bus corridor", "simulation"]],
      },
      {
        id: "detail",
        prompt: "Which route should teams examine first?",
        placeholder: "Write the route name or code.",
        modelAnswer: "Teams should start with route B6.",
        rubricNote: "Specific route detail helps you follow procedural instructions.",
        matchGroups: [["b6", "route b6"]],
      },
      {
        id: "signpost",
        prompt: "Which phrase signalled the result of the analysis?",
        placeholder: "Write the result signpost phrase.",
        modelAnswer: "The result signpost is 'as a result'.",
        rubricNote: "Result markers help you track cause and effect in transport lectures.",
        matchGroups: [["as a result"]],
      },
      {
        id: "term",
        prompt: "Which term describes the time a bus spends at a stop for passengers?",
        placeholder: "Write one technical term.",
        modelAnswer: "The correct term is 'dwell time'.",
        rubricNote: "Transport vocabulary often carries the core meaning of the task.",
        matchGroups: [["dwell time"]],
      },
    ],
    followUpTask:
      "Use your notes to explain, in 50 words, why changing only one variable may not solve a network delay problem.",
    variants: {
      british: {
        title: "Bus-corridor simulation briefing",
        source: "Transportation systems mini-lecture",
        speakerRole: "British lecturer",
        transcript:
          "For the transport systems simulation this week, each team must compare headway and dwell time on the bus corridor before changing the timetable. The aim is to see why delays spread through the network even when traffic demand stays almost the same. As a result, we need accurate notes on what happens at the busiest stop, not just the final travel time. Start with route B6, where boarding takes longest during the morning peak. Then test one adjustment at a time. If dwell time drops but buses still bunch together, the problem may be the original headway rather than passenger volume.",
        recommendedLevel: "B1",
        durationLabel: "70-85 sec",
        supportFocus: "Track route detail, cause-effect logic, and core transport vocabulary.",
        audioVoice: "Daniel (英语（英国）)",
        voiceLocales: ["en-GB", "en-IE"],
      },
      american: {
        title: "Transit reliability simulation briefing",
        source: "Transportation project explanation",
        speakerRole: "American instructor",
        transcript:
          "In this week's transport simulation, each team should compare headway and dwell time on the bus corridor before changing the schedule. The goal is to understand why delays spread through the network even when travel demand stays almost constant. As a result, your notes should focus on what happens at the busiest stop, not only on the final trip time. Start with route B6, where boarding takes longest in the morning peak. Then change one variable at a time. If dwell time improves but buses still group together, the original headway may be the larger problem.",
        recommendedLevel: "A2",
        durationLabel: "70-85 sec",
        supportFocus: "Catch key route instructions and the relationship between variables in the simulation.",
        audioVoice: "Samantha",
        voiceLocales: ["en-US"],
      },
      global: {
        title: "Network delay and headway briefing",
        source: "International transport-systems workshop",
        speakerRole: "Global English transport tutor",
        transcript:
          "For this transport systems task, please compare headway and dwell time before you change the bus schedule. We want to understand why delay spreads through the corridor even when demand remains nearly the same. As a result, your notes must focus on the busiest stop instead of only the final journey time. Begin with route B6, where passenger boarding is slowest during the morning peak. Then test one change at a time. If dwell time becomes shorter but buses still arrive in groups, the original headway may be causing the network problem.",
        recommendedLevel: "B1",
        durationLabel: "70-85 sec",
        supportFocus: "Practice international listening while preserving transport-systems detail in your notes.",
        audioVoice: "Aman",
        voiceLocales: ["en-IN", "en-AU", "en-NZ", "en-SG", "en-ZA"],
      },
    },
  },
  {
    groupId: "civil-engineering-load-testing",
    groupLabel: "Bridge load test",
    majorId: "civil-engineering",
    scenario:
      "Site-briefing listening on bridge load testing, deflection measurement, and temporary safety limits.",
    notePrompts: [
      "What is the purpose of the load test?",
      "Which span should the team measure first?",
      "Which caution signpost phrase did you hear?",
      "Which structural term should go into your notes?",
    ],
    vocabulary: [
      { term: "deflection", definition: "the amount a structure bends or moves under load" },
      { term: "strain gauge", definition: "a sensor used to measure deformation or strain" },
      { term: "baseline", definition: "the reference reading used for later comparison" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main purpose of the bridge briefing?",
        placeholder: "Write the main task in one sentence.",
        modelAnswer:
          "The speaker explains a bridge load test to measure deflection under a controlled load.",
        rubricNote: "State both the structure and the measurement goal.",
        matchGroups: [["bridge", "load test", "trial load"], ["deflection", "measure", "reading"]],
      },
      {
        id: "detail",
        prompt: "Which part of the bridge should the team measure first?",
        placeholder: "Name the location or span.",
        modelAnswer: "The team should begin at midspan on span two.",
        rubricNote: "Location detail matters because it controls the testing sequence.",
        matchGroups: [["midspan", "span two", "second span"]],
      },
      {
        id: "signpost",
        prompt: "Which phrase warned the team before the test sequence started?",
        placeholder: "Write the warning phrase.",
        modelAnswer: "The warning phrase is 'before we begin' or 'before we start'.",
        rubricNote: "Procedure signposts help you catch the shift from setup to action.",
        matchGroups: [["before we begin", "before we start", "before we load"]],
      },
      {
        id: "term",
        prompt: "Which structural term describes how much the bridge bends under the load?",
        placeholder: "Write one technical term.",
        modelAnswer: "The correct term is 'deflection'.",
        rubricNote: "This term is central when you compare observed and design values.",
        matchGroups: [["deflection"]],
      },
    ],
    followUpTask:
      "Use your notes to write a short bridge-test summary explaining the measurement point, the controlled load, and the safety decision.",
    variants: {
      british: {
        title: "Bridge load-test measurement briefing",
        source: "Civil Engineering structures lab briefing",
        speakerRole: "British structures tutor",
        transcript:
          "During this morning's bridge load test, your team will begin at midspan on span two, where the trial lorry should produce the clearest deflection reading. Before we begin, check that the strain gauges are fixed correctly and that yesterday's baseline figures are visible on your sheet. The purpose of the exercise is not to prove the bridge is unsafe. It is to compare the measured deflection with the design allowance under a controlled load. First, record the unloaded value. Then take a second reading once the vehicle is in position. If the difference is larger than expected, do not repeat the run immediately. Report the figure to the supervisor so we can decide whether the support condition or the sensor placement needs another inspection.",
        recommendedLevel: "B1",
        durationLabel: "75-90 sec",
        supportFocus:
          "Track the testing purpose, measurement point, and one structural term while listening.",
        audioVoice: "Daniel (英语（英国）)",
        voiceLocales: ["en-GB", "en-IE"],
      },
      american: {
        title: "Controlled load reading plan",
        source: "Civil Engineering field-testing talk",
        speakerRole: "American instructor",
        transcript:
          "During today's bridge load test, your group should start at midspan on span two, because that position gives us the clearest deflection reading from the trial truck. Before we start, make sure the strain gauges are attached correctly and that the baseline numbers from yesterday are on your worksheet. The goal is not to show that the bridge is failing. The goal is to compare the measured deflection with the design limit under a controlled load. First, write down the unloaded reading. Then take a second reading when the vehicle is fully in place. If the difference is larger than expected, do not repeat the test right away. Report the value first so we can check the support condition and the sensor location.",
        recommendedLevel: "A2",
        durationLabel: "75-90 sec",
        supportFocus:
          "Catch the measurement order and the reason the team pauses before repeating the test.",
        audioVoice: "Samantha",
        voiceLocales: ["en-US"],
      },
      global: {
        title: "Span-two deflection briefing",
        source: "International structures project briefing",
        speakerRole: "Global English project lead",
        transcript:
          "For today's bridge test, please begin at midspan on span two, because the trial vehicle should give the clearest deflection reading at that point. Before we begin, confirm that the strain gauges are secured and that the baseline values from yesterday are ready in your notes. This exercise is not only about collecting numbers. It is about comparing the measured deflection with the allowed design value under a controlled load. First record the unloaded reading. Then take another reading when the vehicle is in the correct position. If the gap between the two readings is larger than expected, do not run the test again immediately. Report the result to the supervisor so we can review the support condition and the sensor setup.",
        recommendedLevel: "B1",
        durationLabel: "75-90 sec",
        supportFocus:
          "Practice international academic English while keeping the structure-test sequence clear.",
        audioVoice: "Aman",
        voiceLocales: ["en-IN", "en-AU", "en-NZ", "en-SG", "en-ZA"],
      },
    },
  },
  {
    groupId: "mathematics-hypothesis-testing",
    groupLabel: "Hypothesis test",
    majorId: "mathematics",
    scenario:
      "Tutorial listening on hypothesis testing, significance level, and interpreting a p-value.",
    notePrompts: [
      "What decision is the class making?",
      "Which threshold is being used?",
      "Which rephrasing signpost phrase did you hear?",
      "Which statistics term should stay in your notes?",
    ],
    vocabulary: [
      { term: "null hypothesis", definition: "the starting claim that there is no real effect or difference" },
      { term: "p-value", definition: "the probability measure used to judge evidence against the null hypothesis" },
      { term: "significance level", definition: "the threshold used to decide whether a result is statistically significant" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the lecturer asking the class to decide?",
        placeholder: "Write the main statistical task in one sentence.",
        modelAnswer:
          "The class must decide whether the revision workshop really improved the quiz scores.",
        rubricNote: "Summarize the decision, not only the method.",
        matchGroups: [["workshop", "revision class", "quiz"], ["improve", "difference", "hypothesis", "test"]],
      },
      {
        id: "detail",
        prompt: "Which significance threshold does the class use?",
        placeholder: "Write the number or percentage.",
        modelAnswer: "The class uses the five percent level, or 0.05.",
        rubricNote: "Threshold detail is central for correct interpretation.",
        matchGroups: [["five percent", "5 percent", "0.05", "five"]],
      },
      {
        id: "signpost",
        prompt: "Which phrase did the lecturer use to restate the idea more simply?",
        placeholder: "Write the rephrasing phrase.",
        modelAnswer: "The lecturer uses a phrase like 'in other words' or 'to put it simply'.",
        rubricNote: "Rephrasing signposts often explain a formula in clearer everyday language.",
        matchGroups: [["in other words", "to put it simply"]],
      },
      {
        id: "term",
        prompt: "Which term names the value used to judge the evidence against the null hypothesis?",
        placeholder: "Write one technical term.",
        modelAnswer: "The correct term is 'p-value'.",
        rubricNote: "Save the exact term because it appears repeatedly in later statistics work.",
        matchGroups: [["p-value", "p value"]],
      },
    ],
    followUpTask:
      "Turn your notes into a short explanation of how the p-value and significance level work together in the final decision.",
    variants: {
      british: {
        title: "Hypothesis-testing workshop briefing",
        source: "Mathematics tutorial explanation",
        speakerRole: "British lecturer",
        transcript:
          "In today's statistics workshop, we are testing whether the revision class improved the mean quiz score. Start with the null hypothesis that the workshop made no real difference. We are using the five percent significance level, so your decision depends on whether the p-value falls below 0.05. In other words, the smaller the p-value, the stronger the evidence against the null hypothesis. Do not jump straight to a conclusion simply because the sample mean increased. First check the test result, then explain what the number means in plain language. Your notes should show the hypothesis, the threshold, and the final interpretation.",
        recommendedLevel: "B1",
        durationLabel: "65-80 sec",
        supportFocus:
          "Follow the decision sequence in a statistics explanation and catch the rephrasing signpost.",
        audioVoice: "Daniel (英语（英国）)",
        voiceLocales: ["en-GB", "en-IE"],
      },
      american: {
        title: "P-value interpretation briefing",
        source: "Mathematics classroom explanation",
        speakerRole: "American lecturer",
        transcript:
          "In today's statistics workshop, we are testing whether the revision class improved the average quiz score. Begin with the null hypothesis that the workshop caused no real difference. We are using the five percent significance level, so the decision depends on whether the p-value is below 0.05. To put it simply, a smaller p-value gives stronger evidence against the null hypothesis. Do not decide too early just because the sample mean went up. First look at the test result, then explain what that number means in ordinary language. Your notes should include the hypothesis, the threshold, and the interpretation.",
        recommendedLevel: "A2",
        durationLabel: "65-80 sec",
        supportFocus:
          "Catch the key threshold and connect it to the plain-language meaning of the result.",
        audioVoice: "Samantha",
        voiceLocales: ["en-US"],
      },
      global: {
        title: "Significance-level decision briefing",
        source: "International mathematics workshop",
        speakerRole: "Global English workshop tutor",
        transcript:
          "In this statistics session, we are checking whether the revision workshop really improved the mean quiz score. Begin with the null hypothesis that there was no real effect. We are using the five percent significance level, so the decision depends on whether the p-value is lower than 0.05. In other words, a smaller p-value means stronger evidence against the null hypothesis. Please do not move directly to the conclusion only because the average increased. First examine the test result, then explain the number in simple language. Your notes should include the hypothesis, the threshold, and the final interpretation.",
        recommendedLevel: "B1",
        durationLabel: "65-80 sec",
        supportFocus:
          "Practice international statistics listening without losing the logic of the final decision.",
        audioVoice: "Aman",
        voiceLocales: ["en-IN", "en-AU", "en-NZ", "en-SG", "en-ZA"],
      },
    },
  },
  {
    groupId: "computing-science-deployment-rollback",
    groupLabel: "Deployment rollback",
    majorId: "computing-science",
    scenario:
      "Incident-response listening on deployment rollback, authentication failures, and log review.",
    notePrompts: [
      "What production issue is the team responding to?",
      "Which service failed first?",
      "Which urgent signpost phrase did you hear?",
      "Which release-management term should go into your notes?",
    ],
    vocabulary: [
      { term: "rollback", definition: "reverting a deployment to the last stable version" },
      { term: "authentication", definition: "the process of verifying a user's identity" },
      { term: "latency", definition: "the delay between a request and the system response" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main incident-response task?",
        placeholder: "Describe the main task in one sentence.",
        modelAnswer:
          "The team needs to investigate login failures and prepare a rollback if the new release caused them.",
        rubricNote: "Mention both the symptom and the release decision.",
        matchGroups: [["login", "authentication"], ["rollback", "release", "deployment", "incident"]],
      },
      {
        id: "detail",
        prompt: "Which service should the team check first?",
        placeholder: "Name the service or layer.",
        modelAnswer: "The team should check the authentication gateway first.",
        rubricNote: "Service detail matters because it guides the first log review.",
        matchGroups: [["authentication gateway", "auth gateway", "authentication service"]],
      },
      {
        id: "signpost",
        prompt: "Which urgent phrase signalled the first short-term action?",
        placeholder: "Write the urgent signpost phrase.",
        modelAnswer: "The signpost phrase is 'for now'.",
        rubricNote: "Short urgent markers often identify the first operational priority.",
        matchGroups: [["for now", "right now", "immediately"]],
      },
      {
        id: "term",
        prompt: "Which term means returning the system to the previous stable release?",
        placeholder: "Write one technical term.",
        modelAnswer: "The correct term is 'rollback'.",
        rubricNote: "Release-management vocabulary should stay exact for team communication.",
        matchGroups: [["rollback"]],
      },
    ],
    followUpTask:
      "Use your notes to give a short spoken incident summary covering the symptom, affected service, and rollback decision.",
    variants: {
      british: {
        title: "Authentication rollback incident briefing",
        source: "Computing Science operations briefing",
        speakerRole: "British module tutor",
        transcript:
          "Since the noon deployment, users have reported repeated login failures on the mobile app. For now, I want the team to focus on the authentication gateway rather than the payment service, because that is where the error rate increased first. The immediate task is to confirm whether the new token check added extra latency and blocked valid requests. Start by comparing the latest logs with the last stable release. If the rollback removes the errors, we can inspect the patch in a safer environment. Do not open another feature branch yet. Record the symptom, the affected service, and the release step that we may need to reverse before the client notices a wider outage.",
        recommendedLevel: "B1",
        durationLabel: "70-85 sec",
        supportFocus:
          "Catch the service name, short-term action, and release vocabulary in an incident update.",
        audioVoice: "Daniel (英语（英国）)",
        voiceLocales: ["en-GB", "en-IE"],
      },
      american: {
        title: "Login failure rollback plan",
        source: "Computing Science incident meeting",
        speakerRole: "American instructor",
        transcript:
          "Since the noon deployment, users have reported repeated login failures in the mobile app. For now, the team should focus on the authentication gateway instead of the payment service, because that is where the error rate rose first. The immediate goal is to confirm whether the new token check added latency and blocked valid requests. Start by comparing the latest logs with the last stable release. If a rollback removes the errors, we can inspect the patch in a safer environment. Do not create another feature branch yet. Write down the symptom, the affected service, and the release step that may need to be reversed before the outage gets wider.",
        recommendedLevel: "A2",
        durationLabel: "70-85 sec",
        supportFocus:
          "Follow an incident-response sequence at moderate speed and capture the first action clearly.",
        audioVoice: "Samantha",
        voiceLocales: ["en-US"],
      },
      global: {
        title: "Release rollback operations briefing",
        source: "International software-team stand-up",
        speakerRole: "Global English project mentor",
        transcript:
          "After the noon deployment, users started reporting repeated login failures in the mobile app. For now, please focus on the authentication gateway rather than the payment service, because that is where the error rate increased first. The immediate task is to check whether the new token validation added extra latency and blocked valid requests. Begin by comparing the latest logs with the previous stable release. If the rollback removes the problem, we can review the patch more safely in another environment. Do not open a new feature branch yet. Your notes should include the symptom, the affected service, and the release step we may need to reverse.",
        recommendedLevel: "B1",
        durationLabel: "70-85 sec",
        supportFocus:
          "Practice mixed-accent software operations English while keeping the response sequence clear.",
        audioVoice: "Aman",
        voiceLocales: ["en-IN", "en-AU", "en-NZ", "en-SG", "en-ZA"],
      },
    },
  },
  {
    groupId: "mechanical-engineering-vibration-analysis",
    groupLabel: "Vibration analysis",
    majorId: "mechanical-engineering",
    scenario:
      "Lab-briefing listening on vibration analysis, bearing wear, and condition monitoring.",
    notePrompts: [
      "What abnormal behavior is the team checking?",
      "Which component should be inspected first?",
      "Which warning signpost phrase did you hear?",
      "Which monitoring term should stay in your notes?",
    ],
    vocabulary: [
      { term: "vibration amplitude", definition: "the size of the vibration signal being measured" },
      { term: "bearing wear", definition: "damage or deterioration in a bearing caused by use" },
      { term: "frequency spectrum", definition: "the distribution of vibration energy across different frequencies" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main purpose of the lab briefing?",
        placeholder: "Write the main task in one sentence.",
        modelAnswer:
          "The team is checking abnormal vibration on the pump rig to judge whether it suggests bearing wear.",
        rubricNote: "Summarize both the machine problem and the diagnostic aim.",
        matchGroups: [["vibration", "pump rig"], ["bearing", "wear", "condition", "monitoring"]],
      },
      {
        id: "detail",
        prompt: "Which component should be checked first?",
        placeholder: "Name the location or component.",
        modelAnswer: "The team should begin with the front bearing housing.",
        rubricNote: "Specific hardware detail guides the inspection order.",
        matchGroups: [["front bearing housing", "front bearing"]],
      },
      {
        id: "signpost",
        prompt: "Which phrase warned students not to change parts too quickly?",
        placeholder: "Write the warning phrase.",
        modelAnswer: "The warning phrase is 'before you replace anything'.",
        rubricNote: "Procedure warnings often tell you to verify data before taking action.",
        matchGroups: [["before you replace anything", "before replacing anything"]],
      },
      {
        id: "term",
        prompt: "Which term describes the size of the vibration signal recorded by the sensor?",
        placeholder: "Write one technical term.",
        modelAnswer: "The correct term is 'vibration amplitude'.",
        rubricNote: "This term helps connect the sensor reading to the maintenance decision.",
        matchGroups: [["vibration amplitude", "amplitude"]],
      },
    ],
    followUpTask:
      "Use your notes to explain whether the rig shows temporary imbalance or a stronger sign of bearing wear.",
    variants: {
      british: {
        title: "Pump-rig vibration briefing",
        source: "Mechanical Engineering condition-monitoring lab",
        speakerRole: "British lab tutor",
        transcript:
          "In this condition-monitoring lab, your group is investigating abnormal vibration on the pump rig after yesterday's endurance run. Begin with the front bearing housing, because that sensor showed the largest vibration amplitude during the final ten minutes. Before you replace anything, compare the new reading with the baseline data from last week. The purpose is to decide whether the change suggests bearing wear or only a temporary imbalance after shutdown. Record the amplitude and note any shift in the frequency spectrum. If both values move together, the maintenance team will need a closer inspection before the rig is used again.",
        recommendedLevel: "B1",
        durationLabel: "70-85 sec",
        supportFocus:
          "Track the inspection order and the diagnostic meaning of the vibration reading.",
        audioVoice: "Daniel (英语（英国）)",
        voiceLocales: ["en-GB", "en-IE"],
      },
      american: {
        title: "Bearing-check vibration plan",
        source: "Mechanical Engineering lab briefing",
        speakerRole: "American instructor",
        transcript:
          "In this condition-monitoring lab, your team is checking abnormal vibration on the pump rig after yesterday's endurance run. Start with the front bearing housing, because that sensor showed the highest vibration amplitude during the last ten minutes. Before you replace anything, compare the new reading with the baseline data from last week. The goal is to decide whether the change points to bearing wear or only a temporary imbalance after shutdown. Record the amplitude and any shift in the frequency spectrum. If both values move together, the rig should get a closer inspection before it is used again.",
        recommendedLevel: "A2",
        durationLabel: "70-85 sec",
        supportFocus:
          "Catch the machine component, warning signpost, and diagnostic term at moderate speed.",
        audioVoice: "Samantha",
        voiceLocales: ["en-US"],
      },
      global: {
        title: "Condition-monitoring vibration update",
        source: "International mechanical lab session",
        speakerRole: "Global English lab supervisor",
        transcript:
          "For this condition-monitoring task, your team is investigating abnormal vibration on the pump rig after yesterday's endurance run. Please begin with the front bearing housing, because that sensor produced the largest vibration amplitude during the final ten minutes. Before you replace anything, compare the new reading with the baseline data from last week. We want to decide whether the change suggests bearing wear or only a temporary imbalance after shutdown. Record the amplitude and any shift in the frequency spectrum. If both values change together, the maintenance team should inspect the rig more closely before it is used again.",
        recommendedLevel: "B1",
        durationLabel: "70-85 sec",
        supportFocus:
          "Practice international mechanical-engineering listening while preserving the diagnostic logic.",
        audioVoice: "Aman",
        voiceLocales: ["en-IN", "en-AU", "en-NZ", "en-SG", "en-ZA"],
      },
    },
  },
  {
    groupId: "mechanical-engineering-transportation-rail-turnaround",
    groupLabel: "Rail turnaround",
    majorId: "mechanical-engineering-transportation",
    scenario:
      "Operations-briefing listening on rail turnaround time, platform occupancy, and delay recovery.",
    notePrompts: [
      "What station operation is being checked?",
      "Which platform should the team review first?",
      "Which constraint signpost phrase did you hear?",
      "Which rail-operations term should go into your notes?",
    ],
    vocabulary: [
      { term: "turnaround", definition: "the process of preparing a vehicle for its next service after arrival" },
      { term: "platform occupancy", definition: "the period when a train is using a platform and blocking access for others" },
      { term: "recovery margin", definition: "extra timetable time available to absorb small delays" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main task in the rail-operations briefing?",
        placeholder: "Write the main task in one sentence.",
        modelAnswer:
          "The team must analyze how a short turnaround at the terminal creates late departures.",
        rubricNote: "Mention both turnaround and the delay effect on the next service.",
        matchGroups: [["turnaround", "terminal"], ["late departures", "delay", "rail", "service"]],
      },
      {
        id: "detail",
        prompt: "Which platform should the team examine first?",
        placeholder: "Write the platform number.",
        modelAnswer: "The team should start with platform 4.",
        rubricNote: "Platform detail helps you follow where the main delay begins.",
        matchGroups: [["platform 4", "platform four"]],
      },
      {
        id: "signpost",
        prompt: "Which phrase signalled the main operational bottleneck?",
        placeholder: "Write the signpost phrase.",
        modelAnswer: "The signpost phrase is 'the main constraint is'.",
        rubricNote: "Constraint phrases often identify the real operational cause.",
        matchGroups: [["the main constraint is", "main constraint"]],
      },
      {
        id: "term",
        prompt: "Which term describes preparing the train for its next departure after arrival?",
        placeholder: "Write one technical term.",
        modelAnswer: "The correct term is 'turnaround'.",
        rubricNote: "This operations term is the key concept in the whole briefing.",
        matchGroups: [["turnaround"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why platform occupancy and turnaround should be analyzed separately in a rail timetable review.",
    variants: {
      british: {
        title: "Rail-turnaround operations briefing",
        source: "Transportation systems operations talk",
        speakerRole: "British lecturer",
        transcript:
          "For today's rail-operations simulation, we are examining why late arrivals at the terminal quickly become late departures on the next service. Start with platform 4, where the morning T2 service loses most of its recovery margin. The main constraint is not line speed on the approach. It is the short turnaround between unloading, cleaning, and boarding the next passengers. In your notes, separate platform occupancy from the turnaround task itself. If a train remains on the platform too long, the next unit has no space to enter on time. Record the delay source, the platform number, and one change that might protect the timetable.",
        recommendedLevel: "B1",
        durationLabel: "70-85 sec",
        supportFocus:
          "Track the platform detail, operational bottleneck, and core timetable term.",
        audioVoice: "Daniel (英语（英国）)",
        voiceLocales: ["en-GB", "en-IE"],
      },
      american: {
        title: "Terminal turnaround delay briefing",
        source: "Transportation project meeting",
        speakerRole: "American instructor",
        transcript:
          "In today's rail-operations simulation, we are checking why late arrivals at the terminal quickly turn into late departures on the next service. Start with platform 4, where the morning T2 service loses most of its recovery margin. The main constraint is not approach speed on the line. It is the short turnaround between unloading, cleaning, and boarding the next group of passengers. In your notes, keep platform occupancy separate from the turnaround task itself. If a train stays on the platform too long, the next unit cannot enter on time. Write down the delay source, the platform number, and one change that could protect the schedule.",
        recommendedLevel: "A2",
        durationLabel: "70-85 sec",
        supportFocus:
          "Catch the platform number and understand why turnaround is the main operational problem.",
        audioVoice: "Samantha",
        voiceLocales: ["en-US"],
      },
      global: {
        title: "Platform-occupancy turnaround briefing",
        source: "International transport-systems workshop",
        speakerRole: "Global English transport tutor",
        transcript:
          "For this rail-operations task, we are examining why late arrivals at the terminal soon become late departures on the following service. Please start with platform 4, where the morning T2 service loses most of its recovery margin. The main constraint is not the speed on the approach line. It is the short turnaround between unloading, cleaning, and boarding the next passengers. In your notes, separate platform occupancy from the turnaround work itself. If one train stays on the platform too long, the next unit cannot enter on time. Record the delay source, the platform number, and one change that may protect the timetable.",
        recommendedLevel: "B1",
        durationLabel: "70-85 sec",
        supportFocus:
          "Practice international transport English while keeping the operations logic clear.",
        audioVoice: "Aman",
        voiceLocales: ["en-IN", "en-AU", "en-NZ", "en-SG", "en-ZA"],
      },
    },
  },
];

export const practiceListeningMaterials: ListeningMaterial[] = listeningBlueprints.flatMap((blueprint) => {
  const major = listeningMajors.find((item) => item.id === blueprint.majorId);

  if (!major) return [];

  return (Object.entries(blueprint.variants) as Array<[ListeningAccent, AccentVariant]>).map(
    ([accent, variant]) => ({
      id: `${blueprint.groupId}-${accent}`,
      contentMode: "practice",
      materialGroupId: blueprint.groupId,
      materialGroupLabel: blueprint.groupLabel,
      majorId: blueprint.majorId,
      majorLabel: major.label,
      accent,
      accentLabel: accentMeta[accent].label,
      accentHint: accentMeta[accent].hint,
      title: variant.title,
      source: variant.source,
      sourceName: "DIICSU Studio",
      speakerRole: variant.speakerRole,
      scenario: blueprint.scenario,
      transcript: variant.transcript,
      recommendedLevel: variant.recommendedLevel,
      durationLabel: variant.durationLabel,
      supportFocus: variant.supportFocus,
      notePrompts: blueprint.notePrompts,
      vocabulary: blueprint.vocabulary,
      questions: blueprint.questions,
      followUpTask: blueprint.followUpTask,
      audioSrc: `/audio/listening/${blueprint.groupId}-${accent}.m4a`,
      audioVoice: variant.audioVoice,
      voiceLocales: variant.voiceLocales,
    }),
  );
});

interface TedListeningBlueprint {
  groupId: string;
  majorId: DIICSUMajorId;
  talkSlug: string;
  title: string;
  speakerName: string;
  speakerRole: string;
  scenario: string;
  recommendedLevel: CEFRLevel;
  durationLabel: string;
  supportFocus: string;
  notePrompts: string[];
  vocabulary: ListeningVocabularyItem[];
  questions: ListeningQuestion[];
  followUpTask: string;
}

function buildTedTalkUrls(slug: string) {
  return {
    officialUrl: `https://www.ted.com/talks/${slug}`,
    embedUrl: `https://embed.ted.com/talks/${slug}`,
    transcriptUrl: `https://www.ted.com/talks/${slug}/transcript?language=en`,
  };
}

const tedTalkThumbnailBySlug: Record<string, string> = {
  michael_green_why_we_should_build_wooden_skyscrapers:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/a0368828-56e3-4c2f-b653-02e56c8e51b5/MichaelGreen_2013-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  norman_foster_my_green_agenda_for_architecture:
    "https://pi.tedcdn.com/r/pe.tedcdn.com/images/ted/35395_480x360.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  hans_rosling_the_best_stats_you_ve_ever_seen:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/91206e56-87be-4387-830b-c38f37d02d78/HansRosling_2006-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  david_mccandless_the_beauty_of_data_visualization:
    "https://pi.tedcdn.com/r/pe.tedcdn.com/images/ted/192641_800x600.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  joseph_redmon_how_computers_learn_to_recognize_objects_instantly:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/0ae6b7c3-c00b-4925-976f-536837b4fee7/JosephRedmon_2017-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  yann_lecun_deep_learning_neural_networks_and_the_future_of_ai:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/43cf1b5b-a587-4d82-b8c3-b2a8766436a4/YannLeCun_2020S-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  joseph_desimone_what_if_3d_printing_was_100x_faster:
    "https://pi.tedcdn.com/r/pe.tedcdn.com/images/ted/2ef806c0d21c3c82ad49f3735e599b8233f804d5_2880x1620.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  lisa_harouni_a_primer_on_3d_printing:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/4182ccb0-c2c3-430e-8ac4-f1ba45eed7a3/LisaHarouni_2011S-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  jeff_speck_the_walkable_city:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/8e2c3251-fdfd-40a6-9261-30170217c709/JeffSpeck_2013S-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  jeff_speck_4_ways_to_make_a_city_more_walkable:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/6808ae37-9bea-4680-b216-d892cbb932df/JeffSpeck_2013X-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  alyssa_amor_gibbons_how_to_design_climate_resilient_buildings:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/e5cb48c4-f115-4a05-8afe-db34bf962283/Alyssa-AmorGibbons_2022-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  mark_miodownik_the_brilliance_of_bridges_and_roads_that_repair_themselves:
    "https://pi.tedcdn.com/r/talkstar-assets.s3.amazonaws.com/production/talks/talk_171657/be6dfdb6-eef1-4009-b592-b3f14b04913f/MarkMiodownik_2025-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  gerd_gigerenzer_how_good_are_you_at_calculating_risk:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/725b90e7-fa05-4c94-9110-40808a95beb4/fearofthewrong_textless.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  mona_chalabi_what_we_miss_when_we_focus_on_the_average:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/272caf74-eebf-42c8-8b86-5cec73365329/AmINormal_2021V_E04-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  anima_anandkumar_ai_that_connects_the_digital_and_physical_worlds:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/e2faab32-749d-47d0-bf69-598f721ab478/AnimaAnandkumar_2024-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  surya_ganguli_can_ai_match_the_human_brain:
    "https://pi.tedcdn.com/r/talkstar-assets.s3.amazonaws.com/production/talks/talk_145110/9b1dbc4f-436c-4833-af8e-64d1e5e96145/SuryaGanguli_2024S-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  avi_reichental_what_s_next_in_3d_printing:
    "https://pi.tedcdn.com/r/pe.tedcdn.com/images/ted/63a0888240fb2364a32f3ace0499aac036ee83ef_2400x1800.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  olivier_scalabre_the_next_manufacturing_revolution_is_here:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/b0dd2ca9-2259-456c-84bc-4fcd01df0920/OlivierScalabre_2016S-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  monica_araya_the_billion_dollar_campaign_to_electrify_transport:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/ceef94d8-20e5-48e9-aadb-e8f403762336/MonicaAraya_2021T-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
  wayne_ting_a_carbon_free_future_starts_with_driving_less:
    "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/1bd2298b-9b51-4825-a2d6-bb4f7c8daf4f/WayneTing_2022T-embed.jpg?u%5Br%5D=2&u%5Bs%5D=0.5&u%5Ba%5D=0.8&u%5Bt%5D=0.03&quality=82c=1050%2C550&w=1050",
};

const tedListeningBlueprints: TedListeningBlueprint[] = [
  {
    groupId: "ted-civil-timber-skyscrapers",
    majorId: "civil-engineering",
    talkSlug: "michael_green_why_we_should_build_wooden_skyscrapers",
    title: "Why we should build wooden skyscrapers",
    speakerName: "Michael Green",
    speakerRole: "TED speaker and architect",
    scenario:
      "Real TED listening on sustainable construction, structural materials, and low-carbon urban development.",
    recommendedLevel: "B2",
    durationLabel: "12 min TED Talk",
    supportFocus:
      "Track a real conference argument about material choice, carbon impact, and the future of large-scale construction.",
    notePrompts: [
      "What is Green asking designers and engineers to change?",
      "Which traditional materials does he compare with wood?",
      "What climate or carbon argument supports his idea?",
      "Which material term should go into your engineering notes?",
    ],
    vocabulary: [
      { term: "mass timber", definition: "large engineered wood elements used in structural systems" },
      { term: "sequester", definition: "to capture and store carbon rather than release it" },
      { term: "built environment", definition: "human-made spaces such as buildings and infrastructure" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the speaker's main argument about future tall buildings?",
        placeholder: "Write the main argument in one or two sentences.",
        modelAnswer:
          "He argues that cities should build more tall buildings with wood or mass timber to cut carbon from construction.",
        rubricNote: "Capture both the material choice and the sustainability reason.",
        matchGroups: [["wood", "timber"], ["tall buildings", "skyscrapers", "high rise"], ["carbon", "climate", "emissions", "sustainable"]],
      },
      {
        id: "detail",
        prompt: "Which two conventional construction materials does he compare with wood?",
        placeholder: "Name both materials.",
        modelAnswer: "He repeatedly compares wood with concrete and steel.",
        rubricNote: "This contrast is central to the engineering logic of the talk.",
        matchGroups: [["concrete"], ["steel"]],
      },
      {
        id: "signpost",
        prompt: "What environmental issue makes his proposal urgent?",
        placeholder: "Write the key issue in a short phrase.",
        modelAnswer: "A strong answer mentions carbon emissions or climate impact.",
        rubricNote: "Listen for the wider systems problem, not only the building technique.",
        matchGroups: [["carbon", "co2", "emissions", "climate"]],
      },
      {
        id: "term",
        prompt: "Which engineering term names the large structural wood system used in the talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct technical term is 'mass timber'.",
        rubricNote: "Specialist terms should be captured precisely for later review.",
        matchGroups: [["mass timber", "engineered wood", "cross laminated timber", "clt"]],
      },
    ],
    followUpTask:
      "Use your notes to explain whether low-carbon building materials should become a bigger topic in DIICSU engineering projects.",
  },
  {
    groupId: "ted-civil-green-agenda",
    majorId: "civil-engineering",
    talkSlug: "norman_foster_my_green_agenda_for_architecture",
    title: "My green agenda for architecture",
    speakerName: "Norman Foster",
    speakerRole: "TED speaker and architect",
    scenario:
      "Real TED listening on sustainable architecture, efficient structures, and environmental design at city scale.",
    recommendedLevel: "B2",
    durationLabel: "31 min TED Talk",
    supportFocus:
      "Follow a longer design argument about energy, structure, and how buildings can reduce environmental impact.",
    notePrompts: [
      "What design principle does Foster return to again and again?",
      "How does he connect architecture with energy or pollution?",
      "Which building or city example supports his point?",
      "Which engineering or design term should stay in your notes?",
    ],
    vocabulary: [
      { term: "ventilation", definition: "the movement of fresh air through a building" },
      { term: "sustainability", definition: "meeting present needs while reducing long-term environmental damage" },
      { term: "infrastructure", definition: "the large-scale systems and structures that support a city or society" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is Foster's main argument about architecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Foster argues that architecture should combine good design with lower energy use and lower environmental impact.",
        rubricNote: "Capture both design quality and sustainability.",
        matchGroups: [["architecture", "design", "building"], ["energy", "green", "sustainable", "pollution", "environment"]],
      },
      {
        id: "detail",
        prompt: "Which environmental concern appears repeatedly in the talk?",
        placeholder: "Write one concern in a short phrase.",
        modelAnswer: "A strong answer mentions pollution, emissions, or energy waste.",
        rubricNote: "Listen for the systems problem behind the design examples.",
        matchGroups: [["pollution", "emissions", "energy", "environment"]],
      },
      {
        id: "signpost",
        prompt: "What design quality does Foster link to environmental performance?",
        placeholder: "Write one phrase.",
        modelAnswer: "He links efficient design or intelligent design to environmental performance.",
        rubricNote: "The talk connects aesthetics and function rather than separating them.",
        matchGroups: [["efficient", "efficiency", "intelligent", "good design"]],
      },
      {
        id: "term",
        prompt: "Which building-system term should civil-engineering students remember from this talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'ventilation'.",
        rubricNote: "Capture a practical building term, not only abstract ideas.",
        matchGroups: [["ventilation"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how sustainable architectural thinking could influence structural design or campus-building projects.",
  },
  {
    groupId: "ted-maths-best-stats",
    majorId: "mathematics",
    talkSlug: "hans_rosling_the_best_stats_you_ve_ever_seen",
    title: "The best stats you've ever seen",
    speakerName: "Hans Rosling",
    speakerRole: "TED speaker and global health data expert",
    scenario:
      "Real TED listening on statistics, data visualization, and how quantitative evidence can challenge common assumptions.",
    recommendedLevel: "B2",
    durationLabel: "19 min TED Talk",
    supportFocus:
      "Follow fast data commentary, identify the variables on the chart, and capture the purpose of quantitative storytelling.",
    notePrompts: [
      "What myth or misconception does Rosling challenge?",
      "Which variables appear on the moving chart?",
      "What makes the visual explanation effective?",
      "Which statistics tool or term should stay in your notes?",
    ],
    vocabulary: [
      { term: "life expectancy", definition: "the average number of years a population is expected to live" },
      { term: "income per person", definition: "average income measured for each individual in a population" },
      { term: "Gapminder", definition: "the data-visualization platform associated with Rosling's talk" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main purpose of the talk?",
        placeholder: "Explain the central message in one or two sentences.",
        modelAnswer:
          "Rosling uses data to challenge myths about the developing world and show how global health and prosperity are changing.",
        rubricNote: "The key point is evidence-based rethinking, not only entertaining charts.",
        matchGroups: [["data", "statistics"], ["myths", "misconceptions", "wrong ideas"], ["global", "development", "health", "world"]],
      },
      {
        id: "detail",
        prompt: "Which two variables appear on the animated chart?",
        placeholder: "Name the two measures.",
        modelAnswer: "A correct answer includes income per person and life expectancy.",
        rubricNote: "Capturing the variables shows that you followed the quantitative structure of the talk.",
        matchGroups: [["income"], ["life expectancy"]],
      },
      {
        id: "signpost",
        prompt: "What kind of evidence drives the whole presentation?",
        placeholder: "Write a short phrase.",
        modelAnswer: "The talk is driven by data visualization or animated statistics.",
        rubricNote: "Identify the evidence type that supports the argument.",
        matchGroups: [["data", "statistics"], ["visual", "chart", "bubble"]],
      },
      {
        id: "term",
        prompt: "Which named platform is closely associated with Rosling's visual explanation?",
        placeholder: "Write the platform name.",
        modelAnswer: "The platform is 'Gapminder'.",
        rubricNote: "Named tools are worth saving because they support later research.",
        matchGroups: [["gapminder"]],
      },
    ],
    followUpTask:
      "Use your notes to give a short explanation of how better data visualization can improve mathematical communication in class.",
  },
  {
    groupId: "ted-maths-data-visualization",
    majorId: "mathematics",
    talkSlug: "david_mccandless_the_beauty_of_data_visualization",
    title: "The beauty of data visualization",
    speakerName: "David McCandless",
    speakerRole: "TED speaker and data journalist",
    scenario:
      "Real TED listening on visual patterns, statistical storytelling, and how complex information becomes easier to understand.",
    recommendedLevel: "B1",
    durationLabel: "18 min TED Talk",
    supportFocus:
      "Track how the speaker turns raw data into visual meaning and listen for examples that show why design matters.",
    notePrompts: [
      "What problem does McCandless want to solve with visual design?",
      "How does he describe the value of turning data into images?",
      "Which example of visualized information stands out in the talk?",
      "Which data term or design term should stay in your notes?",
    ],
    vocabulary: [
      { term: "information design", definition: "organizing information so people can understand it more easily" },
      { term: "pattern", definition: "a repeated relationship or structure in data" },
      { term: "visualization", definition: "a visual representation of data or information" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main purpose of data visualization in this talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "McCandless argues that data visualization helps people understand complex information by making patterns visible.",
        rubricNote: "Mention both complexity and visibility.",
        matchGroups: [["data", "information"], ["visual", "visualization"], ["pattern", "understand", "clarity"]],
      },
      {
        id: "detail",
        prompt: "What does he make easier to see through visualization?",
        placeholder: "Write one short answer.",
        modelAnswer: "He makes hidden patterns or relationships easier to see.",
        rubricNote: "This is the core mathematical value of visualization.",
        matchGroups: [["pattern", "relationship", "connections"]],
      },
      {
        id: "signpost",
        prompt: "What broad skill does the speaker combine with statistics?",
        placeholder: "Write one phrase.",
        modelAnswer: "He combines design with statistics or information.",
        rubricNote: "The talk is about communication as much as calculation.",
        matchGroups: [["design", "visual design", "information design"]],
      },
      {
        id: "term",
        prompt: "Which term from the talk should mathematics students remember?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'visualization'.",
        rubricNote: "Keep one reusable academic term for later tasks.",
        matchGroups: [["visualization", "information design"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how better visualization could help you present statistical findings more clearly in class.",
  },
  {
    groupId: "ted-computing-yolo",
    majorId: "computing-science",
    talkSlug: "joseph_redmon_how_computers_learn_to_recognize_objects_instantly",
    title: "How computers learn to recognize objects instantly",
    speakerName: "Joseph Redmon",
    speakerRole: "TED speaker and computer scientist",
    scenario:
      "Real TED listening on computer vision, object detection, and real-time machine-learning systems.",
    recommendedLevel: "B1",
    durationLabel: "7 min TED Talk",
    supportFocus:
      "Pick out the algorithm name, the real-time performance goal, and the everyday device analogy used to explain the system.",
    notePrompts: [
      "What computing problem is Redmon trying to solve?",
      "How does he explain the speed of the system?",
      "Which everyday device analogy helps the audience understand the idea?",
      "Which AI term should stay in your notes?",
    ],
    vocabulary: [
      { term: "YOLO", definition: "the object-detection algorithm name meaning 'You Only Look Once'" },
      { term: "object detection", definition: "identifying objects and their positions in an image" },
      { term: "computer vision", definition: "the field of enabling computers to interpret visual information" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main computing goal described in the talk?",
        placeholder: "Write the goal in one or two sentences.",
        modelAnswer:
          "The goal is to let computers recognize or detect objects in real time with AI.",
        rubricNote: "Include both recognition and speed if possible.",
        matchGroups: [["object", "recognize", "detection"], ["real time", "instantly", "fast"], ["ai", "computer vision", "machine learning", "computer"]],
      },
      {
        id: "detail",
        prompt: "Which everyday device does he compare the system to when explaining it?",
        placeholder: "Name the device.",
        modelAnswer: "He compares it to a phone camera or camera app.",
        rubricNote: "Analogies help explain advanced computing ideas to non-specialists.",
        matchGroups: [["phone", "smartphone", "camera"]],
      },
      {
        id: "signpost",
        prompt: "Which short algorithm name should you remember from the talk?",
        placeholder: "Write the algorithm name.",
        modelAnswer: "The algorithm name is 'YOLO'.",
        rubricNote: "Short algorithm names are useful anchors in technical listening.",
        matchGroups: [["yolo"]],
      },
      {
        id: "term",
        prompt: "Which broader AI field does this talk belong to?",
        placeholder: "Write one field name.",
        modelAnswer: "A correct field name is 'computer vision'.",
        rubricNote: "Connect the example system to its wider academic field.",
        matchGroups: [["computer vision", "object detection"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how real-time object detection could connect to future DIICSU computing projects or demos.",
  },
  {
    groupId: "ted-computing-deep-learning",
    majorId: "computing-science",
    talkSlug: "yann_lecun_deep_learning_neural_networks_and_the_future_of_ai",
    title: "Deep learning, neural networks and the future of AI",
    speakerName: "Yann LeCun",
    speakerRole: "TED speaker and AI researcher",
    scenario:
      "Real TED listening on deep learning, neural networks, and the wider future of artificial intelligence systems.",
    recommendedLevel: "B2",
    durationLabel: "55 min TED Talk",
    supportFocus:
      "Follow a more advanced AI lecture, identify the main claims about learning systems, and capture field-level vocabulary.",
    notePrompts: [
      "What does LeCun say current AI systems can already do well?",
      "What future of AI does he imagine?",
      "Which limitation or challenge does he discuss?",
      "Which technical term should stay in your notes?",
    ],
    vocabulary: [
      { term: "deep learning", definition: "a machine-learning approach using multi-layer neural networks" },
      { term: "neural network", definition: "a system of connected computational units used for learning patterns" },
      { term: "self-supervised learning", definition: "a training approach that learns from structure inside large data sets" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main topic of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "LeCun explains how deep learning and neural networks work and what they may enable in the future of AI.",
        rubricNote: "Mention both present systems and future direction.",
        matchGroups: [["deep learning", "neural networks"], ["future", "ai", "artificial intelligence"]],
      },
      {
        id: "detail",
        prompt: "Which kind of AI system is central to the talk?",
        placeholder: "Write one phrase.",
        modelAnswer: "The core system is a neural network or deep neural network.",
        rubricNote: "This is the key technical object in the talk.",
        matchGroups: [["neural network", "deep learning"]],
      },
      {
        id: "signpost",
        prompt: "What larger field does LeCun connect these systems to?",
        placeholder: "Write one field or phrase.",
        modelAnswer: "He connects them to artificial intelligence or machine learning.",
        rubricNote: "Use the broader academic category, not only one application.",
        matchGroups: [["artificial intelligence", "ai", "machine learning"]],
      },
      {
        id: "term",
        prompt: "Which advanced learning term from the talk should you keep in your notes?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'self-supervised learning'.",
        rubricNote: "This is a reusable term for later AI discussion.",
        matchGroups: [["self supervised learning", "self-supervised learning"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how deep-learning systems could influence future computing projects, research, or product design.",
  },
  {
    groupId: "ted-mechanical-fast-3d-printing",
    majorId: "mechanical-engineering",
    talkSlug: "joseph_desimone_what_if_3d_printing_was_100x_faster",
    title: "What if 3D printing was 100x faster?",
    speakerName: "Joseph DeSimone",
    speakerRole: "TED speaker, inventor, and materials scientist",
    scenario:
      "Real TED listening on advanced manufacturing, 3D printing, and how new processes can change engineering production.",
    recommendedLevel: "B1",
    durationLabel: "10 min TED Talk",
    supportFocus:
      "Track the manufacturing problem, the promised speed gain, and the named process behind the engineering breakthrough.",
    notePrompts: [
      "What limitation of standard 3D printing is DeSimone trying to solve?",
      "How much faster is the new process meant to be?",
      "What could this change for engineering production?",
      "Which process name should go into your notes?",
    ],
    vocabulary: [
      { term: "additive manufacturing", definition: "building a part layer by layer rather than subtracting material" },
      { term: "CLIP", definition: "Continuous Liquid Interface Production, DeSimone's 3D-printing process" },
      { term: "resin", definition: "a liquid polymer material used in many 3D-printing systems" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main engineering idea in the talk?",
        placeholder: "Write the core idea in one or two sentences.",
        modelAnswer:
          "DeSimone argues that much faster 3D printing could make additive manufacturing more practical for real production.",
        rubricNote: "Mention both speed and production relevance.",
        matchGroups: [["3d printing", "additive"], ["faster", "speed"], ["manufacturing", "production", "parts"]],
      },
      {
        id: "detail",
        prompt: "How much faster is the new approach described in the title?",
        placeholder: "Write the number or phrase.",
        modelAnswer: "The talk describes a process that could be 100 times faster.",
        rubricNote: "Numeric detail is often the easiest concrete point to miss in longer talks.",
        matchGroups: [["100", "hundred"]],
      },
      {
        id: "signpost",
        prompt: "Which engineering area does he want to transform with this process?",
        placeholder: "Write a short phrase.",
        modelAnswer: "A strong answer mentions manufacturing or production.",
        rubricNote: "Connect the invention to the wider engineering system it affects.",
        matchGroups: [["manufacturing", "production"]],
      },
      {
        id: "term",
        prompt: "What is the short name of the 3D-printing process featured in the talk?",
        placeholder: "Write the process name.",
        modelAnswer: "The process name is 'CLIP'.",
        rubricNote: "Named processes are strong revision anchors for technical modules.",
        matchGroups: [["clip", "continuous liquid interface production"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how faster additive manufacturing could matter for mechanical design, prototyping, or lab work.",
  },
  {
    groupId: "ted-mechanical-primer-3d-printing",
    majorId: "mechanical-engineering",
    talkSlug: "lisa_harouni_a_primer_on_3d_printing",
    title: "A primer on 3D printing",
    speakerName: "Lisa Harouni",
    speakerRole: "TED speaker and 3D-printing entrepreneur",
    scenario:
      "Real TED listening on additive manufacturing basics, design freedom, and how 3D printing changes production logic.",
    recommendedLevel: "B1",
    durationLabel: "15 min TED Talk",
    supportFocus:
      "Listen for the core advantages of additive manufacturing and the examples used to show how it changes engineering design.",
    notePrompts: [
      "What makes 3D printing different from traditional manufacturing?",
      "Which design advantage does Harouni emphasize?",
      "How does she explain the value of complexity in printed parts?",
      "Which manufacturing term should stay in your notes?",
    ],
    vocabulary: [
      { term: "additive manufacturing", definition: "making objects by adding material layer by layer" },
      { term: "geometry", definition: "the shape and structure of an object or part" },
      { term: "prototype", definition: "an early model used for testing or development" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main idea of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Harouni explains how 3D printing changes manufacturing by allowing complex parts to be built layer by layer.",
        rubricNote: "Mention both the process and the design impact.",
        matchGroups: [["3d printing", "additive manufacturing"], ["layer", "build"], ["complex", "design", "parts"]],
      },
      {
        id: "detail",
        prompt: "What kind of design feature becomes easier with 3D printing?",
        placeholder: "Write one short answer.",
        modelAnswer: "A strong answer mentions complex geometry or complex shapes.",
        rubricNote: "This detail shows why the process matters for engineering.",
        matchGroups: [["complex", "geometry", "shape"]],
      },
      {
        id: "signpost",
        prompt: "What manufacturing approach does this talk introduce?",
        placeholder: "Write one phrase.",
        modelAnswer: "The talk introduces additive manufacturing.",
        rubricNote: "Use the formal engineering term if you can.",
        matchGroups: [["additive manufacturing", "3d printing"]],
      },
      {
        id: "term",
        prompt: "Which manufacturing term should mechanical students keep from this talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'additive manufacturing'.",
        rubricNote: "Keep one precise term for technical discussion.",
        matchGroups: [["additive manufacturing"]],
      },
    ],
    followUpTask:
      "Use your notes to explain when 3D printing is most useful for prototyping, custom parts, or mechanical experimentation.",
  },
  {
    groupId: "ted-transport-walkable-city",
    majorId: "mechanical-engineering-transportation",
    talkSlug: "jeff_speck_the_walkable_city",
    title: "The walkable city",
    speakerName: "Jeff Speck",
    speakerRole: "TED speaker and urban planner",
    scenario:
      "Real TED listening on urban mobility, transport planning, and why walkability matters for efficient city systems.",
    recommendedLevel: "B2",
    durationLabel: "16 min TED Talk",
    supportFocus:
      "Follow a policy-style argument about mobility, identify the planning problem, and capture the central transport solution.",
    notePrompts: [
      "What transport or city-planning problem does Speck criticize?",
      "What simple human activity is central to his solution?",
      "How does he connect mobility to health, economy, or environment?",
      "Which planning term should remain in your notes?",
    ],
    vocabulary: [
      { term: "walkability", definition: "how easy and attractive it is to move through a city on foot" },
      { term: "sprawl", definition: "low-density outward urban growth that depends heavily on cars" },
      { term: "public realm", definition: "shared city space such as streets, pavements, and squares" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main message of the talk?",
        placeholder: "Write the main message in one or two sentences.",
        modelAnswer:
          "Speck argues that more walkable cities can solve transport, health, economic, and environmental problems.",
        rubricNote: "Capture the idea that one design choice has several system-wide effects.",
        matchGroups: [["walk", "walkable"], ["city", "urban"], ["health", "economic", "environmental", "transport", "mobility"]],
      },
      {
        id: "detail",
        prompt: "Which urban problem does Speck strongly criticize?",
        placeholder: "Write the problem in a short phrase.",
        modelAnswer: "He criticizes suburban sprawl or car-dependent sprawl.",
        rubricNote: "This problem frames the whole transport argument.",
        matchGroups: [["sprawl", "suburban"]],
      },
      {
        id: "signpost",
        prompt: "What simple human activity sits at the center of his solution?",
        placeholder: "Write one word or short phrase.",
        modelAnswer: "The central activity is walking.",
        rubricNote: "Simple solutions are easy to hear but also easy to overlook.",
        matchGroups: [["walk", "walking"]],
      },
      {
        id: "term",
        prompt: "Which planning term from the talk should transport students remember?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'walkability'.",
        rubricNote: "Key planning vocabulary helps bridge transport engineering and policy thinking.",
        matchGroups: [["walkability", "walkable city"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how walkability could improve transport-system design, campus mobility, or city planning decisions.",
  },
  {
    groupId: "ted-transport-walkable-4-ways",
    majorId: "mechanical-engineering-transportation",
    talkSlug: "jeff_speck_4_ways_to_make_a_city_more_walkable",
    title: "4 ways to make a city more walkable",
    speakerName: "Jeff Speck",
    speakerRole: "TED speaker and urban planner",
    scenario:
      "Real TED listening on practical urban-mobility design, walkability, and how transport planning shapes everyday movement.",
    recommendedLevel: "B2",
    durationLabel: "18 min TED Talk",
    supportFocus:
      "Track a more structured policy talk about specific ways cities can improve walkability and mobility outcomes.",
    notePrompts: [
      "Which city-design problem does Speck focus on?",
      "What practical changes does he propose?",
      "How does he connect walking with transport-system quality?",
      "Which planning term should stay in your notes?",
    ],
    vocabulary: [
      { term: "walkability", definition: "how easy and pleasant it is to move through a place on foot" },
      { term: "public space", definition: "shared urban space such as streets, squares, and pavements" },
      { term: "mobility", definition: "the ability of people to move efficiently through a system or city" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main goal of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Speck explains practical ways cities can become more walkable and improve transport and urban life.",
        rubricNote: "Mention practical design changes, not only a general idea.",
        matchGroups: [["walkable", "walkability", "walking"], ["city", "urban"], ["transport", "mobility", "life"]],
      },
      {
        id: "detail",
        prompt: "What kind of urban movement does Speck want cities to support more?",
        placeholder: "Write one short phrase.",
        modelAnswer: "He wants cities to support more walking.",
        rubricNote: "This should be the clearest transport focus in your answer.",
        matchGroups: [["walk", "walking"]],
      },
      {
        id: "signpost",
        prompt: "Which broader urban issue does he connect to walkability?",
        placeholder: "Write one issue.",
        modelAnswer: "A strong answer mentions mobility, health, economy, or public life.",
        rubricNote: "The talk links street design to wider city outcomes.",
        matchGroups: [["mobility", "health", "economy", "public", "transport"]],
      },
      {
        id: "term",
        prompt: "Which planning term should transport students remember from this talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'walkability'.",
        rubricNote: "Keep the central planning word exactly.",
        matchGroups: [["walkability"]],
      },
    ],
    followUpTask:
      "Use your notes to explain which one of Speck's walkability ideas could help campus transport or city movement most.",
  },
  {
    groupId: "ted-civil-climate-resilient-buildings",
    majorId: "civil-engineering",
    talkSlug: "alyssa_amor_gibbons_how_to_design_climate_resilient_buildings",
    title: "How to design climate-resilient buildings",
    speakerName: "Alyssa-Amor Gibbons",
    speakerRole: "TED speaker and climate-resilient design specialist",
    scenario:
      "Real TED listening on climate-resilient construction, traditional building knowledge, and designing structures that work with local conditions.",
    recommendedLevel: "B2",
    durationLabel: "14 min TED Talk",
    supportFocus:
      "Track how the speaker links climate risk, local design knowledge, and practical building strategies for resilience.",
    notePrompts: [
      "Why does Gibbons say architecture must respond differently to climate change?",
      "Which local or traditional design idea does she value?",
      "How should buildings work with nature rather than against it?",
      "Which resilience term should stay in your notes?",
    ],
    vocabulary: [
      { term: "climate resilience", definition: "the ability of a building or system to continue performing under climate stress" },
      { term: "endemic design", definition: "design shaped by the local climate, materials, and conditions of a place" },
      { term: "retrofit", definition: "to upgrade an existing building so it performs better" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main message of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Gibbons argues that climate-resilient buildings should learn from traditional local design and work with nature under extreme conditions.",
        rubricNote: "Mention both resilience and the value of local building knowledge.",
        matchGroups: [["climate", "resilient", "resilience"], ["traditional", "local", "endemic"], ["nature", "conditions"]],
      },
      {
        id: "detail",
        prompt: "Which kind of conditions does she say designers must prepare for?",
        placeholder: "Write one or two examples.",
        modelAnswer: "Strong answers mention extreme weather such as hurricanes, storms, or other climate stress.",
        rubricNote: "Capture the environmental pressure that drives the design problem.",
        matchGroups: [["hurricane", "storm", "extreme"], ["climate", "weather"]],
      },
      {
        id: "signpost",
        prompt: "How does she say buildings should relate to nature?",
        placeholder: "Write the relationship in a short phrase.",
        modelAnswer: "Buildings should work with nature rather than against it.",
        rubricNote: "This contrast organizes the design logic of the talk.",
        matchGroups: [["with nature", "work with"], ["against", "rather than"]],
      },
      {
        id: "term",
        prompt: "Which resilience term should civil-engineering students keep from this talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'climate resilience' or 'climate-resilient design'.",
        rubricNote: "Keep the core design term in a reusable form.",
        matchGroups: [["climate resilience", "climate resilient design", "resilience"]],
      },
    ],
    followUpTask:
      "Use your notes to suggest one climate-resilient improvement for a campus building, residence hall, or engineering studio.",
  },
  {
    groupId: "ted-civil-self-repairing-infrastructure",
    majorId: "civil-engineering",
    talkSlug: "mark_miodownik_the_brilliance_of_bridges_and_roads_that_repair_themselves",
    title: "The brilliance of bridges and roads that repair themselves",
    speakerName: "Mark Miodownik",
    speakerRole: "TED speaker, scientist, and engineer",
    scenario:
      "Real TED listening on self-healing infrastructure materials, durability, and the future of civil systems that can sense and repair damage.",
    recommendedLevel: "B1",
    durationLabel: "10 min TED Talk",
    supportFocus:
      "Listen for the infrastructure problem, the self-repair idea, and the new materials concept behind it.",
    notePrompts: [
      "What weakness in today's infrastructure does Miodownik highlight?",
      "What new ability could future materials have?",
      "Which structures does he use as examples?",
      "Which materials term should stay in your notes?",
    ],
    vocabulary: [
      { term: "self-healing", definition: "able to repair damage without a full external repair process" },
      { term: "animate matter", definition: "a new class of materials designed to sense damage and respond to it" },
      { term: "biodegrade", definition: "to break down naturally after use" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main engineering idea in the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Miodownik explains that future bridges, roads, and cities could use self-healing materials that sense damage and repair themselves.",
        rubricNote: "Mention both infrastructure and the self-repair capability.",
        matchGroups: [["bridge", "road", "city", "infrastructure"], ["self heal", "repair themselves", "self-healing"]],
      },
      {
        id: "detail",
        prompt: "Which pieces of infrastructure does he mention as examples?",
        placeholder: "Write one or two examples.",
        modelAnswer: "He talks about roads, bridges, or cities as systems that could self-repair.",
        rubricNote: "This detail anchors the materials idea in civil engineering.",
        matchGroups: [["bridge", "bridges", "road", "roads", "city", "cities"]],
      },
      {
        id: "signpost",
        prompt: "What new ability could these materials have after damage?",
        placeholder: "Write one short phrase.",
        modelAnswer: "They could sense damage and self-heal.",
        rubricNote: "Listen for the capability, not only the product category.",
        matchGroups: [["sense damage", "detect damage", "damage"], ["self heal", "repair"]],
      },
      {
        id: "term",
        prompt: "Which materials term from the talk should civil students remember?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'animate matter'.",
        rubricNote: "The named materials concept is the key revision point.",
        matchGroups: [["animate matter"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how self-healing materials could change maintenance planning for bridges, pavements, or public infrastructure.",
  },
  {
    groupId: "ted-maths-calculating-risk",
    majorId: "mathematics",
    talkSlug: "gerd_gigerenzer_how_good_are_you_at_calculating_risk",
    title: "How good are you at calculating risk?",
    speakerName: "Gerd Gigerenzer",
    speakerRole: "TED speaker and risk researcher",
    scenario:
      "Real TED listening on statistics, probability, and the difference between relative and absolute risk in public communication.",
    recommendedLevel: "B1",
    durationLabel: "4 min TED Talk",
    supportFocus:
      "Track how the speaker explains misleading risk claims and the statistical contrast that helps listeners interpret them better.",
    notePrompts: [
      "Why can common risk headlines be misleading?",
      "Which two kinds of risk presentation does Gigerenzer compare?",
      "What real-life judgments could be improved by better risk understanding?",
      "Which statistical term should stay in your notes?",
    ],
    vocabulary: [
      { term: "relative risk", definition: "a comparison showing how much a risk changes in proportion to another case" },
      { term: "absolute risk", definition: "the actual numerical chance that something happens" },
      { term: "risk literacy", definition: "the ability to understand and evaluate risk information clearly" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main point of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Gigerenzer explains that people should judge risk more carefully by distinguishing relative risk from absolute risk.",
        rubricNote: "Mention both better evaluation and the relative/absolute contrast.",
        matchGroups: [["risk"], ["relative"], ["absolute"]],
      },
      {
        id: "detail",
        prompt: "Which two kinds of risk expression does he compare?",
        placeholder: "Write the pair of terms.",
        modelAnswer: "He compares relative risk and absolute risk.",
        rubricNote: "This contrast is the key statistics takeaway.",
        matchGroups: [["relative risk"], ["absolute risk"]],
      },
      {
        id: "signpost",
        prompt: "Why does he think many headline-style risk claims are a problem?",
        placeholder: "Write a short explanation.",
        modelAnswer: "They can sound dramatic while still being misleading or incomplete.",
        rubricNote: "Focus on the communication problem, not only the numbers.",
        matchGroups: [["misleading", "incomplete", "confusing"], ["headline", "news", "risk claims"]],
      },
      {
        id: "term",
        prompt: "Which statistics term should maths students keep from this talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'absolute risk' or 'relative risk'.",
        rubricNote: "Keep one exact risk term for later data interpretation.",
        matchGroups: [["absolute risk", "relative risk"]],
      },
    ],
    followUpTask:
      "Use your notes to rewrite one alarming headline so that it reports risk more clearly and responsibly.",
  },
  {
    groupId: "ted-maths-focus-on-average",
    majorId: "mathematics",
    talkSlug: "mona_chalabi_what_we_miss_when_we_focus_on_the_average",
    title: "What we miss when we focus on the average",
    speakerName: "Mona Chalabi",
    speakerRole: "TED speaker and data journalist",
    scenario:
      "Real TED listening on data interpretation, averages, and why outliers and variation matter in statistical thinking.",
    recommendedLevel: "B1",
    durationLabel: "3 min TED Talk",
    supportFocus:
      "Listen for the limit of averages and the statistical value of the unusual cases hidden outside the middle.",
    notePrompts: [
      "Why does Chalabi say averages are not enough?",
      "What do we miss when we only look at the middle value?",
      "How does she describe unusual cases in data?",
      "Which data term should stay in your notes?",
    ],
    vocabulary: [
      { term: "average", definition: "a central value used to summarize a set of numbers" },
      { term: "outlier", definition: "a value that is unusually far from the rest of the data" },
      { term: "distribution", definition: "the way values are spread across a data set" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main argument of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Chalabi argues that focusing only on the average can hide important variation and outliers in data.",
        rubricNote: "Mention both the limit of averages and the value of variation.",
        matchGroups: [["average"], ["variation", "outlier", "distribution", "spread"]],
      },
      {
        id: "detail",
        prompt: "Which kind of data points does she encourage us to notice more?",
        placeholder: "Write one phrase.",
        modelAnswer: "She wants us to pay more attention to outliers or unusual cases.",
        rubricNote: "The answer should point beyond the central number.",
        matchGroups: [["outlier", "outliers", "unusual", "lost birds"]],
      },
      {
        id: "signpost",
        prompt: "What common summary number does she criticize when used alone?",
        placeholder: "Write one term.",
        modelAnswer: "She criticizes the average when it is used by itself.",
        rubricNote: "This is the clearest named concept in the talk.",
        matchGroups: [["average", "mean"]],
      },
      {
        id: "term",
        prompt: "Which statistics term should maths students keep from this talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'outlier' or 'distribution'.",
        rubricNote: "Keep one exact term that helps you discuss spread, not only center.",
        matchGroups: [["outlier", "distribution"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why one average score or average value should never be the only evidence in a data-based argument.",
  },
  {
    groupId: "ted-computing-digital-physical-ai",
    majorId: "computing-science",
    talkSlug: "anima_anandkumar_ai_that_connects_the_digital_and_physical_worlds",
    title: "AI that connects the digital and physical worlds",
    speakerName: "Anima Anandkumar",
    speakerRole: "TED speaker and AI professor",
    scenario:
      "Real TED listening on AI for physics-based simulation, scientific computing, and systems that connect digital models with the real world.",
    recommendedLevel: "B2",
    durationLabel: "10 min TED Talk",
    supportFocus:
      "Track how the speaker explains the simulation gap in AI and the role of neural operators in closing it.",
    notePrompts: [
      "What limitation of standard language models does Anandkumar mention?",
      "What kind of world does her AI try to model more accurately?",
      "Which examples show practical value?",
      "Which AI term should stay in your notes?",
    ],
    vocabulary: [
      { term: "simulation", definition: "a computational model used to predict how a system behaves" },
      { term: "physics", definition: "the rules governing energy, matter, forces, and motion in the real world" },
      { term: "neural operator", definition: "an AI model trained to learn patterns in physical systems and simulations" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main topic of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Anandkumar explains how AI can connect digital models and the physical world by learning the physics behind real systems.",
        rubricNote: "Mention both AI and the digital/physical connection.",
        matchGroups: [["ai"], ["digital"], ["physical", "physics", "real world"]],
      },
      {
        id: "detail",
        prompt: "What hard scientific task does she say language models cannot solve by themselves?",
        placeholder: "Write one short phrase.",
        modelAnswer: "She says the hard task is simulating the necessary physics.",
        rubricNote: "This limitation frames the whole technical problem.",
        matchGroups: [["simulate", "simulation"], ["physics"]],
      },
      {
        id: "signpost",
        prompt: "Which examples does she use to show the value of this approach?",
        placeholder: "Write one or two examples.",
        modelAnswer: "She mentions uses such as weather forecasting and medical device design.",
        rubricNote: "Concrete applications show why the model matters beyond theory.",
        matchGroups: [["weather"], ["medical", "device"]],
      },
      {
        id: "term",
        prompt: "Which AI term should computing students remember from this talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'neural operator'.",
        rubricNote: "Keep the named model family exactly.",
        matchGroups: [["neural operator", "neural operators"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how physics-aware AI could support engineering simulation, forecasting, or scientific computing projects.",
  },
  {
    groupId: "ted-computing-ai-human-brain",
    majorId: "computing-science",
    talkSlug: "surya_ganguli_can_ai_match_the_human_brain",
    title: "Can AI match the human brain?",
    speakerName: "Surya Ganguli",
    speakerRole: "TED speaker, neuroscientist, and professor",
    scenario:
      "Real TED listening on AI, neuroscience, and the search for a new science of intelligence that explains both machines and brains.",
    recommendedLevel: "B2",
    durationLabel: "17 min TED Talk",
    supportFocus:
      "Follow an interdisciplinary argument about why AI, neuroscience, and physics should be studied together.",
    notePrompts: [
      "What does Ganguli say AI can already do well?",
      "Why does he think AI is still far from human intelligence?",
      "Which disciplines does he want to combine?",
      "Which intelligence term should stay in your notes?",
    ],
    vocabulary: [
      { term: "cognition", definition: "the mental processes involved in understanding, learning, and reasoning" },
      { term: "interdisciplinary", definition: "combining methods or ideas from different fields" },
      { term: "neural network", definition: "a computational system inspired by connected units in the brain" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main message of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Ganguli argues that we need a new science of intelligence combining AI, neuroscience, and physics to better understand both machines and brains.",
        rubricNote: "Mention the interdisciplinary goal, not only AI progress.",
        matchGroups: [["science of intelligence", "intelligence"], ["ai"], ["neuroscience", "physics"]],
      },
      {
        id: "detail",
        prompt: "Which natural system does he compare AI with throughout the talk?",
        placeholder: "Write one phrase.",
        modelAnswer: "He compares AI with the human brain.",
        rubricNote: "This is the core comparison in the talk title and argument.",
        matchGroups: [["human brain", "brain"]],
      },
      {
        id: "signpost",
        prompt: "Which disciplines does he want researchers to connect more closely?",
        placeholder: "Write the fields.",
        modelAnswer: "He wants AI, neuroscience, and physics to work together.",
        rubricNote: "This field combination is the structural center of the talk.",
        matchGroups: [["ai"], ["neuroscience"], ["physics"]],
      },
      {
        id: "term",
        prompt: "Which computing or intelligence term should students keep from this talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'cognition' or 'science of intelligence'.",
        rubricNote: "Keep a term that connects machine learning with human thinking.",
        matchGroups: [["cognition", "science of intelligence"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why future AI research may need both computer science and neuroscience, not only bigger models.",
  },
  {
    groupId: "ted-mechanical-next-in-3d-printing",
    majorId: "mechanical-engineering",
    talkSlug: "avi_reichental_what_s_next_in_3d_printing",
    title: "What's next in 3D printing",
    speakerName: "Avi Reichental",
    speakerRole: "TED speaker and 3D-printing entrepreneur",
    scenario:
      "Real TED listening on 3D printing, material flexibility, and how additive manufacturing supports customization in product design.",
    recommendedLevel: "B1",
    durationLabel: "9 min TED Talk",
    supportFocus:
      "Listen for how the speaker links additive manufacturing with customization, new materials, and fast prototyping.",
    notePrompts: [
      "What makes 3D printing different from conventional production?",
      "What kinds of items does Reichental say can be printed?",
      "Why is customization important in his argument?",
      "Which manufacturing term should stay in your notes?",
    ],
    vocabulary: [
      { term: "additive manufacturing", definition: "producing objects by adding material layer by layer" },
      { term: "customization", definition: "adapting a product to fit specific user needs or contexts" },
      { term: "prototype", definition: "an early version of a design used for testing or demonstration" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main idea of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Reichental argues that 3D printing can produce many different objects and unlock much greater customization in manufacturing.",
        rubricNote: "Mention both wide application and customization.",
        matchGroups: [["3d printing", "additive"], ["custom", "customization"], ["manufacturing", "objects", "products"]],
      },
      {
        id: "detail",
        prompt: "How does he describe the range of things 3D printers can make?",
        placeholder: "Write one short answer.",
        modelAnswer: "He says they can make almost anything, often from many different materials.",
        rubricNote: "The breadth of production is a key selling point in the talk.",
        matchGroups: [["almost anything", "many things"], ["material", "materials"]],
      },
      {
        id: "signpost",
        prompt: "What design advantage does he connect strongly to 3D printing?",
        placeholder: "Write one short phrase.",
        modelAnswer: "A major advantage is customization or highly personalized production.",
        rubricNote: "This explains why the process matters beyond novelty.",
        matchGroups: [["custom", "personalized", "customization"]],
      },
      {
        id: "term",
        prompt: "Which manufacturing term should mechanical students keep from this talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'additive manufacturing'.",
        rubricNote: "Use the formal engineering term, not only the casual phrase.",
        matchGroups: [["additive manufacturing"]],
      },
    ],
    followUpTask:
      "Use your notes to explain where customization through 3D printing could be most useful in mechanical design or prototyping.",
  },
  {
    groupId: "ted-mechanical-manufacturing-revolution",
    majorId: "mechanical-engineering",
    talkSlug: "olivier_scalabre_the_next_manufacturing_revolution_is_here",
    title: "The next manufacturing revolution is here",
    speakerName: "Olivier Scalabre",
    speakerRole: "TED speaker and industrial systems thinker",
    scenario:
      "Real TED listening on advanced manufacturing, productivity, and how a fourth manufacturing revolution could reshape industrial growth.",
    recommendedLevel: "B1",
    durationLabel: "12 min TED Talk",
    supportFocus:
      "Track how the speaker links manufacturing change with jobs, productivity, and a larger macroeconomic shift.",
    notePrompts: [
      "What problem in economic growth does Scalabre mention?",
      "What kind of revolution does he describe?",
      "How could new manufacturing affect employment or productivity?",
      "Which industry term should stay in your notes?",
    ],
    vocabulary: [
      { term: "productivity", definition: "the amount of output produced from a given amount of input" },
      { term: "macroeconomic", definition: "connected to the performance of the economy as a whole" },
      { term: "automation", definition: "using machines or systems to perform tasks with less direct human labor" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main message of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Scalabre argues that a new manufacturing revolution could improve productivity, employment, and economic growth.",
        rubricNote: "Mention both manufacturing change and its wider economic effect.",
        matchGroups: [["manufacturing", "revolution"], ["productivity", "growth", "employment"]],
      },
      {
        id: "detail",
        prompt: "What broader economic issue does he say this revolution could help with?",
        placeholder: "Write one issue.",
        modelAnswer: "He says it could help with slow economic growth.",
        rubricNote: "The talk begins from an economy-level problem, not only a factory-level one.",
        matchGroups: [["economic growth", "growth", "slow"]],
      },
      {
        id: "signpost",
        prompt: "Which two work-related outcomes does he connect to better manufacturing?",
        placeholder: "Write one or two outcomes.",
        modelAnswer: "He connects it to higher productivity and more employment or jobs.",
        rubricNote: "These outcomes show why the topic matters beyond engineering labs.",
        matchGroups: [["productivity"], ["employment", "jobs"]],
      },
      {
        id: "term",
        prompt: "Which industrial term should mechanical students remember from this talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'productivity' or 'automation'.",
        rubricNote: "Keep one industry term you can reuse in manufacturing discussions.",
        matchGroups: [["productivity", "automation"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how manufacturing innovation could matter for plant efficiency, industrial jobs, or economic competitiveness.",
  },
  {
    groupId: "ted-transport-electrify-transport",
    majorId: "mechanical-engineering-transportation",
    talkSlug: "monica_araya_the_billion_dollar_campaign_to_electrify_transport",
    title: "The billion-dollar campaign to electrify transport",
    speakerName: "Monica Araya",
    speakerRole: "TED speaker and electrification advocate",
    scenario:
      "Real TED listening on transport electrification, zero-emission mobility, and how policy and funding can accelerate the shift away from combustion engines.",
    recommendedLevel: "B2",
    durationLabel: "11 min TED Talk",
    supportFocus:
      "Track the policy goal, the transport technology shift, and the system-wide reason the speaker argues for electrification.",
    notePrompts: [
      "What transport system change does Araya want to accelerate?",
      "Which old vehicle technology does she want to retire?",
      "How does she connect transport with pollution or climate risk?",
      "Which transport term should stay in your notes?",
    ],
    vocabulary: [
      { term: "electrification", definition: "the shift from fuel-based systems to electric-powered systems" },
      { term: "internal combustion engine", definition: "an engine that burns fuel inside the machine to create movement" },
      { term: "zero-emission", definition: "producing no exhaust emissions at the point of use" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main goal of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Araya argues for a large-scale campaign to electrify transport and move cities away from polluting combustion vehicles.",
        rubricNote: "Mention both electrification and the wider transport transition.",
        matchGroups: [["electrify", "electrification"], ["transport"], ["polluting", "combustion", "vehicles"]],
      },
      {
        id: "detail",
        prompt: "Which older engine technology does she want to retire?",
        placeholder: "Write one phrase.",
        modelAnswer: "She wants to retire the internal combustion engine.",
        rubricNote: "This technology is the clearest named target in the talk.",
        matchGroups: [["internal combustion engine", "combustion engine"]],
      },
      {
        id: "signpost",
        prompt: "Why does she say transport electrification matters so much?",
        placeholder: "Write one reason.",
        modelAnswer: "A strong answer mentions reducing pollution, emissions, or climate damage.",
        rubricNote: "Connect the engineering transition to the environmental purpose.",
        matchGroups: [["pollution", "emission", "climate", "zero-emission"]],
      },
      {
        id: "term",
        prompt: "Which transport term should students keep from this talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'electrification'.",
        rubricNote: "Keep the central systems term exactly.",
        matchGroups: [["electrification"]],
      },
    ],
    followUpTask:
      "Use your notes to explain which transport sector on campus or in a city should be electrified first and why.",
  },
  {
    groupId: "ted-transport-driving-less",
    majorId: "mechanical-engineering-transportation",
    talkSlug: "wayne_ting_a_carbon_free_future_starts_with_driving_less",
    title: "A carbon-free future starts with driving less",
    speakerName: "Wayne Ting",
    speakerRole: "TED speaker and mobility entrepreneur",
    scenario:
      "Real TED listening on shared micromobility, lightweight transport systems, and reducing emissions by changing travel behavior.",
    recommendedLevel: "B1",
    durationLabel: "3 min TED Talk",
    supportFocus:
      "Listen for the behavior change, the transport alternative, and the carbon argument behind shared electric mobility.",
    notePrompts: [
      "What simple change in travel behavior does Ting ask for?",
      "Which lightweight transport mode does he promote?",
      "How does shared mobility reduce carbon output?",
      "Which mobility term should stay in your notes?",
    ],
    vocabulary: [
      { term: "micromobility", definition: "small, lightweight transport such as scooters or bikes used for short trips" },
      { term: "shared mobility", definition: "transport services used by many people rather than owned individually" },
      { term: "carbon-free", definition: "designed to avoid adding carbon emissions" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main message of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "Ting argues that a carbon-free transport future depends on driving less and using shared electric micromobility more.",
        rubricNote: "Mention both reduced driving and the alternative transport model.",
        matchGroups: [["drive less", "driving less"], ["shared", "electric", "micromobility", "scooter"], ["carbon free", "carbon-free"]],
      },
      {
        id: "detail",
        prompt: "Which transport option does he use as a key example?",
        placeholder: "Write one mode.",
        modelAnswer: "He uses shared electric scooters or micromobility as a main example.",
        rubricNote: "This is the most concrete transport technology in the talk.",
        matchGroups: [["scooter", "scooters", "micromobility"]],
      },
      {
        id: "signpost",
        prompt: "What travel behavior does he say must change first?",
        placeholder: "Write one short phrase.",
        modelAnswer: "He says people need to drive less.",
        rubricNote: "The title gives away the key behavior, but listeners still need to catch it clearly.",
        matchGroups: [["drive less", "driving less"]],
      },
      {
        id: "term",
        prompt: "Which transport term should students keep from this talk?",
        placeholder: "Write one term.",
        modelAnswer: "A correct term is 'micromobility' or 'shared mobility'.",
        rubricNote: "Keep one precise term for short-trip transport systems.",
        matchGroups: [["micromobility", "shared mobility"]],
      },
    ],
    followUpTask:
      "Use your notes to suggest one shared-mobility change that could reduce short car trips on campus or in a city center.",
  },
];

export const tedListeningMaterials: ListeningMaterial[] = tedListeningBlueprints.flatMap((blueprint) => {
  const major = listeningMajors.find((item) => item.id === blueprint.majorId);

  if (!major) return [];

  const urls = buildTedTalkUrls(blueprint.talkSlug);

  return [
    {
      id: blueprint.groupId,
      contentMode: "ted",
      materialGroupId: blueprint.groupId,
      materialGroupLabel: blueprint.title,
      majorId: blueprint.majorId,
      majorLabel: major.label,
      accent: "global",
      accentLabel: "Original TED delivery",
      accentHint:
        "Authentic conference speech with natural pacing, live emphasis, and no simplified classroom scripting.",
      title: blueprint.title,
      source: "TED Talk",
      sourceName: "TED",
      speakerRole: blueprint.speakerRole,
      speakerName: blueprint.speakerName,
      scenario: blueprint.scenario,
      transcript: "",
      transcriptUrl: urls.transcriptUrl,
      officialUrl: urls.officialUrl,
      embedUrl: urls.embedUrl,
      thumbnailUrl: tedTalkThumbnailBySlug[blueprint.talkSlug],
      recommendedLevel: blueprint.recommendedLevel,
      durationLabel: blueprint.durationLabel,
      supportFocus: blueprint.supportFocus,
      notePrompts: blueprint.notePrompts,
      vocabulary: blueprint.vocabulary,
      questions: blueprint.questions,
      followUpTask: blueprint.followUpTask,
      audioSrc: null,
      audioVoice: null,
      voiceLocales: [],
    },
  ];
});

export const listeningMaterials: ListeningMaterial[] = [
  ...practiceListeningMaterials,
  ...tedListeningMaterials,
];

export const listeningModes = [
  {
    id: "practice",
    label: "Accent practice",
    hint: "Short DIICSU clips with controlled British, American, and global accent contrast.",
  },
  {
    id: "ted",
    label: "TED listening",
    hint: "Real official TED talks embedded from TED with major-matched topics and note-taking tasks.",
  },
] as const;

export function getListeningMaterialOptions(
  materials: ListeningMaterial[],
  mode: ListeningContentMode,
  majorId?: DIICSUMajorId,
) {
  const options = new Map<string, ListeningMaterialOption>();
  const filteredMaterials = materials.filter(
    (material) =>
      material.contentMode === mode && (majorId ? material.majorId === majorId : true),
  );

  for (const material of filteredMaterials) {
    if (options.has(material.materialGroupId)) {
      continue;
    }

    options.set(material.materialGroupId, {
      id: material.materialGroupId,
      label: material.materialGroupLabel,
      summary: material.scenario,
      durationLabel: material.durationLabel,
      recommendedLevel: material.recommendedLevel,
      contentMode: material.contentMode,
    });
  }

  return Array.from(options.values());
}

export function getListeningMaterial(
  majorId: DIICSUMajorId,
  accent: ListeningAccent,
  materialGroupId?: string,
  materials: ListeningMaterial[] = practiceListeningMaterials,
) {
  const practiceCatalog = materials.filter((material) => material.contentMode === "practice");
  const directMatch = practiceCatalog.find(
    (material) =>
      material.majorId === majorId &&
      material.accent === accent &&
      (materialGroupId ? material.materialGroupId === materialGroupId : true),
  );

  if (directMatch) return directMatch;

  const groupFallback =
    materialGroupId
      ? practiceCatalog.find(
          (material) => material.majorId === majorId && material.materialGroupId === materialGroupId,
        )
      : undefined;

  if (groupFallback) return groupFallback;

  const majorAccentFallback = practiceCatalog.find(
    (material) => material.majorId === majorId && material.accent === accent,
  );

  if (majorAccentFallback) return majorAccentFallback;

  const majorFallback = practiceCatalog.find((material) => material.majorId === majorId);

  if (majorFallback) return majorFallback;

  const fallback = practiceCatalog[0];
  if (fallback) return fallback;

  throw new Error("Listening materials are not configured.");
}

export function getTedListeningMaterial(
  majorId: DIICSUMajorId,
  materialGroupId?: string,
  materials: ListeningMaterial[] = tedListeningMaterials,
) {
  const tedCatalog = materials.filter((material) => material.contentMode === "ted");
  const directMatch = tedCatalog.find(
    (material) =>
      material.majorId === majorId &&
      (materialGroupId ? material.materialGroupId === materialGroupId : true),
  );

  if (directMatch) return directMatch;

  const groupFallback =
    materialGroupId
      ? tedCatalog.find((material) => material.materialGroupId === materialGroupId)
      : undefined;

  if (groupFallback) return groupFallback;

  const majorFallback = tedCatalog.find((material) => material.majorId === majorId);

  if (majorFallback) return majorFallback;

  const fallback = tedCatalog[0];
  if (fallback) return fallback;

  throw new Error("TED listening materials are not configured.");
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

const shadowingStopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "we",
  "with",
  "you",
  "your",
]);

function getKeywordTokens(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !shadowingStopWords.has(token));
}

export function splitTranscriptIntoSentences(transcript: string) {
  return transcript
    .match(/[^.!?]+[.!?]?/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
}

export function buildListeningSentenceSegments(material: ListeningMaterial): ListeningSentenceSegment[] {
  const sentences = splitTranscriptIntoSentences(material.transcript);

  if (sentences.length === 0) {
    return [];
  }

  const weights = sentences.map((sentence) => Math.max(18, sentence.replace(/\s+/g, "").length));
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);

  let cursor = 0;

  return sentences.map((sentence, index) => {
    const weight = weights[index] ?? 0;
    const startRatio = totalWeight > 0 ? cursor / totalWeight : 0;
    cursor += weight;
    const endRatio = totalWeight > 0 ? cursor / totalWeight : 1;

    return {
      id: `${material.id}-sentence-${index + 1}`,
      text: sentence,
      startRatio,
      endRatio: index === sentences.length - 1 ? 1 : endRatio,
    };
  });
}

export function findEvidenceSentence(material: ListeningMaterial, question: ListeningQuestion) {
  const sentences = splitTranscriptIntoSentences(material.transcript);

  if (sentences.length === 0) {
    return null;
  }

  const ranked = sentences
    .map((sentence, index) => {
      const normalizedSentence = normalizeText(sentence);
      let matchedGroups = 0;
      let keywordHits = 0;

      for (const group of question.matchGroups) {
        const hitsInGroup = group.filter((keyword) =>
          normalizedSentence.includes(normalizeText(keyword)),
        ).length;

        if (hitsInGroup > 0) {
          matchedGroups += 1;
          keywordHits += hitsInGroup;
        }
      }

      return {
        sentence,
        index,
        matchedGroups,
        keywordHits,
      };
    })
    .sort((left, right) => {
      if (right.matchedGroups !== left.matchedGroups) {
        return right.matchedGroups - left.matchedGroups;
      }

      if (right.keywordHits !== left.keywordHits) {
        return right.keywordHits - left.keywordHits;
      }

      return left.index - right.index;
    });

  const best = ranked[0];

  if (!best || best.matchedGroups === 0) {
    return null;
  }

  return best.sentence;
}

function matchesQuestion(answer: string, question: ListeningQuestion) {
  const normalizedAnswer = normalizeText(answer);
  if (!normalizedAnswer) return false;

  return question.matchGroups.every((group) =>
    group.some((keyword) => normalizedAnswer.includes(normalizeText(keyword))),
  );
}

function buildNoteFeedback(material: ListeningMaterial, notes: string) {
  const normalizedNotes = normalizeText(notes);
  const wordCount = normalizedNotes ? normalizedNotes.split(" ").length : 0;
  const vocabHits = material.vocabulary.filter((item) =>
    normalizedNotes.includes(normalizeText(item.term)),
  ).length;

  if (wordCount >= 30 && vocabHits >= 1) {
    return "Your notes are detailed enough to support a short academic summary, and you captured at least one specialist term.";
  }

  if (wordCount >= 18) {
    return "Your notes contain the main flow of the briefing, but add one technical term or one exact detail next time.";
  }

  return "Your notes are still too short. On the next listen, capture the main task, one exact detail, and one technical term.";
}

export function scoreShadowingAttempt(targetSentence: string, spokenTranscript: string): ShadowingScoreResult {
  const targetKeywords = Array.from(new Set(getKeywordTokens(targetSentence)));
  const spokenKeywords = Array.from(new Set(getKeywordTokens(spokenTranscript)));

  if (targetKeywords.length === 0) {
    return {
      overallScore: 0,
      matchedKeywords: [],
      missingKeywords: [],
      extraKeywords: spokenKeywords,
      note: "Choose a sentence with more academic content before starting shadowing practice.",
    };
  }

  const matchedKeywords = targetKeywords.filter((keyword) => spokenKeywords.includes(keyword));
  const missingKeywords = targetKeywords.filter((keyword) => !spokenKeywords.includes(keyword));
  const extraKeywords = spokenKeywords.filter((keyword) => !targetKeywords.includes(keyword));

  const coverage = matchedKeywords.length / targetKeywords.length;
  const precision =
    spokenKeywords.length > 0 ? matchedKeywords.length / spokenKeywords.length : 0;
  const overallScore = Math.round((coverage * 0.72 + precision * 0.28) * 100);

  const note =
    overallScore >= 85
      ? "Strong shadowing. You are holding onto the main academic keywords and sentence shape."
      : overallScore >= 65
        ? "Good progress. Replay once more and tighten the missing academic words."
        : "Stay with the same sentence and focus on repeating the key academic words more exactly.";

  return {
    overallScore,
    matchedKeywords,
    missingKeywords,
    extraKeywords,
    note,
  };
}

export function scoreListeningMaterial(
  material: ListeningMaterial,
  answers: Record<string, string>,
  notes: string,
  targetLevel: CEFRLevel,
): ListeningScoreResult {
  const questionFeedback = material.questions.map((question) => {
    const answer = answers[question.id] ?? "";
    const correct = matchesQuestion(answer, question);

    return {
      id: question.id,
      prompt: question.prompt,
      answer,
      correct,
      modelAnswer: question.modelAnswer,
      rubricNote: question.rubricNote,
      evidenceSentence: findEvidenceSentence(material, question),
      evidenceNote: material.transcript.trim()
        ? "Use this evidence sentence to hear where the answer was signalled in the audio."
        : material.transcriptUrl
          ? "Open the official transcript to locate the supporting sentence for this answer."
          : "Replay the clip and locate the sentence carrying the main clue for this answer.",
    };
  });

  const correctCount = questionFeedback.filter((item) => item.correct).length;
  const totalQuestions = material.questions.length;
  const overallScore = Math.round((correctCount / totalQuestions) * 10);
  const passThreshold: Record<CEFRLevel, number> = {
    A1: 4,
    A2: 5,
    B1: 6,
    B2: 7,
  };
  const passed = overallScore >= passThreshold[targetLevel];
  const missedPrompts = questionFeedback.filter((item) => !item.correct).map((item) => item.prompt);

  const strengths =
    correctCount >= 3
      ? [
          "You identified the main academic purpose of the clip.",
          "You captured at least one important lecture detail.",
          "Your listening is beginning to track signposting language more reliably.",
        ]
      : correctCount >= 2
        ? [
            "You caught part of the main idea and some supporting detail.",
            "Your answers show developing control of academic listening rather than random guessing.",
          ]
        : ["You stayed engaged with the clip and produced an answer for the listening check."];

  const revisionFocus =
    missedPrompts.length > 0
      ? `Replay the clip and focus on these items next: ${missedPrompts.join(" / ")}.`
      : "You answered every checkpoint correctly. Next time, compare the same major topic in another accent.";

  const nextAction = passed
    ? `You are ready to compare this ${material.majorLabel} topic with another accent or a harder clip.`
    : `Stay on this clip, replay once more, and rebuild your notes before moving on to another accent.`;

  return {
    overallScore,
    correctCount,
    totalQuestions,
    passed,
    strengths,
    revisionFocus,
    noteFeedback: buildNoteFeedback(material, notes),
    nextAction,
    questionFeedback,
  };
}

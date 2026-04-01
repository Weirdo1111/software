import type { CEFRLevel } from "@/types/learning";

export type AuthenticMajorId =
  | "civil-engineering"
  | "mathematics"
  | "computing-science"
  | "mechanical-engineering"
  | "mechanical-engineering-transportation";

export type AuthenticAccent = "british" | "american" | "indian" | "global";
export type AuthenticSpeakerRegion =
  | "north-america"
  | "british"
  | "europe"
  | "asia"
  | "latin-america"
  | "other";

export type AuthenticResourceType = "lecture" | "interview" | "podcast";

export interface AuthenticVocabularyItem {
  term: string;
  definition: string;
}

export interface AuthenticQuestion {
  id: string;
  prompt: string;
  placeholder: string;
  modelAnswer: string;
  rubricNote: string;
  matchGroups: string[][];
}

export interface AuthenticListeningBlueprint {
  groupId: string;
  majorId: AuthenticMajorId;
  resourceType: AuthenticResourceType;
  accent: AuthenticAccent;
  speakerRegion: AuthenticSpeakerRegion;
  title: string;
  source: string;
  sourceName: string;
  speakerRole: string;
  speakerName?: string;
  scenario: string;
  transcript: string;
  transcriptUrl?: string;
  officialUrl: string;
  embedUrl?: string;
  videoSrc?: string;
  thumbnailUrl?: string;
  audioSrc?: string;
  recommendedLevel: CEFRLevel;
  durationLabel: string;
  supportFocus: string;
  notePrompts: string[];
  vocabulary: AuthenticVocabularyItem[];
  questions: AuthenticQuestion[];
  followUpTask: string;
}

function buildYouTubeThumbnail(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function buildStanfordSeeImage(path: string) {
  return `https://see.stanford.edu${path}`;
}

function buildNptelCourseUrl(courseCode: string) {
  return `https://nptel.ac.in/courses/${courseCode}`;
}

export const authenticListeningBlueprints: AuthenticListeningBlueprint[] = [
  {
    groupId: "civil-bridge-maintenance-cambridge",
    majorId: "civil-engineering",
    resourceType: "lecture",
    accent: "american",
    speakerRegion: "north-america",
    title: "Lecture 15: Trusses and A^(T)CA",
    source:
      "MIT OpenCourseWare lecture on truss modelling, equilibrium, and how stiffness ideas connect structural members to matrix methods.",
    sourceName: "MIT OpenCourseWare",
    speakerRole: "MIT course lecture",
    speakerName: "Gilbert Strang",
    scenario:
      "Civil-structures lecture on truss members, joint equilibrium, load paths, and why matrix-based models help engineers analyse frameworks.",
    transcript:
      "The lecture shows how a truss can be understood as a network of bars and joints whose behaviour is governed by equilibrium and stiffness relationships. It explains that engineers move from the physical picture of loads and displacements to a matrix form that makes large structures solvable. A key message is that the algebra matters because it preserves the structural meaning of force paths and deformations.",
    transcriptUrl:
      "https://ocw.mit.edu/courses/18-085-computational-science-and-engineering-i-fall-2008/resources/lecture-15-trusses-and-a-t-ca/",
    officialUrl:
      "https://ocw.mit.edu/courses/18-085-computational-science-and-engineering-i-fall-2008/resources/lecture-15-trusses-and-a-t-ca/",
    videoSrc: "https://archive.org/download/MIT18.085F08/ocw-18.085-f08-lec15_300k.mp4",
    recommendedLevel: "B2",
    durationLabel: "MIT OCW lecture",
    supportFocus:
      "Track how the lecture moves from physical truss members to equilibrium equations and then to a matrix model.",
    notePrompts: [
      "Which physical structure does the lecture model first?",
      "How are equilibrium and matrix ideas connected in the explanation?",
      "Why does the lecturer move from geometry to algebra?",
      "Which structures term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "truss",
        definition: "a framework of connected members designed to carry loads efficiently",
      },
      {
        term: "stiffness matrix",
        definition: "a matrix that links nodal displacements to forces in a structural model",
      },
      {
        term: "nodal displacement",
        definition: "the movement of a joint or node in a structural system under load",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main purpose of the lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The lecture explains how trusses are analysed by connecting physical members and joints to equilibrium equations and matrix methods.",
        rubricNote: "Mention both the truss model and the move toward matrix-based structural analysis.",
        matchGroups: [["truss", "members", "joints"], ["equilibrium", "matrix", "analysis"]],
      },
      {
        id: "detail",
        prompt: "Which structural ideas does the lecturer emphasise when building the model?",
        placeholder: "Name one or two sources of evidence.",
        modelAnswer:
          "A strong answer includes joint equilibrium, member forces, stiffness, or nodal displacement.",
        rubricNote: "Choose concrete modelling ideas rather than only saying 'maths'.",
        matchGroups: [["equilibrium", "joint", "member"], ["stiffness", "nodal", "displacement"]],
      },
      {
        id: "signpost",
        prompt: "Why does the lecturer move from a physical truss picture to matrix form?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because the matrix form lets engineers solve larger structural systems while preserving the meaning of load paths and deformation.",
        rubricNote: "Connect the algebra to real structural interpretation, not only calculation speed.",
        matchGroups: [["matrix", "solve", "larger"], ["load path", "deformation", "structural"]],
      },
      {
        id: "term",
        prompt: "Which civil-engineering term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'truss', 'stiffness matrix', or 'nodal displacement'.",
        rubricNote: "Keep one structural-analysis term you can reuse in later mechanics discussions.",
        matchGroups: [["truss", "stiffness matrix", "nodal displacement"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why civil engineers need both a clear structural idealisation and a solvable matrix model when analysing a truss.",
  },
  {
    groupId: "civil-built-sustainability-asme",
    majorId: "civil-engineering",
    resourceType: "interview",
    accent: "american",
    speakerRegion: "north-america",
    title: "Managing Floods in Haiti",
    source:
      "ASME interview on flood-risk management systems for Haiti and other developing nations.",
    sourceName: "ASME TechCast",
    speakerRole: "Podcast interview guest",
    speakerName: "Raha Hakimdavar",
    scenario:
      "Civil-engineering interview listening on flood risk, missing baseline data, and practical planning for resilient infrastructure.",
    transcript:
      "The interview explains that flood management in developing regions is often limited by missing baseline data and weak risk mapping. The speaker describes why a structured flood-risk management program is needed for planning and disaster response. A key message is that better data and local implementation can improve resilience and reduce repeated losses.",
    officialUrl:
      "https://www.asme.org/topics-resources/content/podcast-managing-floods-in-haiti",
    embedUrl:
      "https://players.brightcove.net/1711318824001/default_default/index.html?videoId=2494890025001",
    thumbnailUrl:
      "https://www.asme.org/getmedia/c1d0d864-abe2-4697-b1e1-7a942b8b8193/managing-floods-in-haiti.jpg?width=640&height=360&ext=.jpg",
    recommendedLevel: "B1",
    durationLabel: "Podcast interview",
    supportFocus:
      "Listen for how the speaker links data gaps, flood-risk mapping, and decision-making in civil-engineering practice.",
    notePrompts: [
      "What flood-management challenge is highlighted first?",
      "Which type of data is missing or hard to collect?",
      "Why does the speaker argue for a formal management program?",
      "Which civil-engineering term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "flood risk",
        definition:
          "the likelihood and potential impact of flood events on people, assets, or infrastructure",
      },
      {
        term: "baseline data",
        definition:
          "reference information collected before planning so engineers can compare and model risk",
      },
      {
        term: "resilience planning",
        definition:
          "designing systems and procedures so infrastructure can withstand and recover from shocks",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main topic of the interview?",
        placeholder: "Write the main topic in one or two sentences.",
        modelAnswer:
          "The interview explains why Haiti needs stronger flood-risk management supported by better engineering data.",
        rubricNote: "Mention both flood management and the data problem.",
        matchGroups: [
          ["flood", "risk", "management"],
          ["haiti"],
          ["data", "mapping", "baseline"],
        ],
      },
      {
        id: "detail",
        prompt: "What practical gap does the speaker identify as a major obstacle?",
        placeholder: "Name one or two examples.",
        modelAnswer:
          "A strong answer mentions missing baseline data, weak flood records, or limited risk information.",
        rubricNote: "The detail should describe a concrete information gap.",
        matchGroups: [
          ["missing", "lack", "baseline"],
          ["data", "records", "information", "mapping"],
        ],
      },
      {
        id: "signpost",
        prompt: "Why does the speaker say a structured flood-management program matters?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "It helps turn risk knowledge into practical planning and can reduce repeated damage in vulnerable areas.",
        rubricNote: "Link the program to implementation and resilience outcomes.",
        matchGroups: [
          ["planning", "program", "management"],
          ["resilience", "reduce", "damage", "disaster"],
        ],
      },
      {
        id: "term",
        prompt: "Which built-environment term should you keep from this interview?",
        placeholder: "Write one technical term.",
        modelAnswer:
          "A correct term is 'flood risk', 'baseline data', or 'resilience planning'.",
        rubricNote: "Choose one term you can reuse in civil-infrastructure discussions.",
        matchGroups: [["flood risk", "baseline data", "resilience planning"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how a data-led flood-risk program could improve infrastructure planning in another vulnerable city.",
  },
  {
    groupId: "maths-uncertainty-oxford",
    majorId: "mathematics",
    resourceType: "lecture",
    accent: "global",
    speakerRegion: "europe",
    title: "Problems with Probability",
    source: "Oxford discussion on probability, fine-tuning arguments, and how uncertainty is interpreted in scientific reasoning.",
    sourceName: "University of Oxford Podcasts",
    speakerRole: "Oxford discussion",
    speakerName: "Simon Friederich and Erik Curiel",
    scenario:
      "Academic discussion on probability, uncertainty, and how mathematical language is used to interpret scientific arguments.",
    transcript:
      "The discussion asks what probability really means when people use it in scientific arguments about uncertainty. It shows that probability is not only a calculation tool but also a way of interpreting limited knowledge and competing explanations. A key message is that mathematical language becomes more useful when speakers explain what their uncertainty claims actually mean.",
    officialUrl: "https://podcasts.ox.ac.uk/problems-probability",
    videoSrc:
      "https://media.podcasts.ox.ac.uk/conted/2014-MT-emergent-multiverse/2014-11-22_wallace_probability_puzzle.mp4",
    audioSrc:
      "https://media.podcasts.ox.ac.uk/conted/2014-MT-emergent-multiverse/2014-11-22_wallace_probability_puzzle.mp3",
    recommendedLevel: "B2",
    durationLabel: "20 min Oxford discussion",
    supportFocus:
      "Track how the speakers connect formal probability language with interpretation, explanation, and scientific judgement.",
    notePrompts: [
      "What problem about probability do the speakers raise first?",
      "How do they connect uncertainty with interpretation rather than only calculation?",
      "Why does explanation matter alongside formal language?",
      "Which mathematics term should stay in your notes?",
    ],
    vocabulary: [
      { term: "probability", definition: "a numerical way to describe how likely an event is" },
      { term: "uncertainty", definition: "a situation in which the outcome or the information is not fully known" },
      {
        term: "interpretation",
        definition: "explaining what a mathematical statement means in context",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main message of the lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The discussion argues that probability is a way to reason about uncertainty, but its meaning still needs careful interpretation and explanation.",
        rubricNote: "Mention both probability and the challenge of interpreting uncertainty clearly.",
        matchGroups: [["probability"], ["uncertainty"], ["interpret", "meaning", "explain"]],
      },
      {
        id: "detail",
        prompt: "What do the speakers say mathematics cannot do by itself in this discussion?",
        placeholder: "Write one short answer.",
        modelAnswer:
          "A strong answer says formulas alone are not enough; probability statements still need interpretation.",
        rubricNote: "Show that the problem is about meaning, not only numerical technique.",
        matchGroups: [["formula", "alone", "not enough"], ["interpret", "meaning"]],
      },
      {
        id: "signpost",
        prompt: "Why does the discussion also stress clear explanation?",
        placeholder: "Write one reason.",
        modelAnswer:
          "Because people need to understand what a probability claim means before they can judge the scientific argument behind it.",
        rubricNote: "Connect mathematical language to interpretation and judgement.",
        matchGroups: [["understand", "means"], ["argument", "judge", "explain"]],
      },
      {
        id: "term",
        prompt: "Which mathematical term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'probability', 'uncertainty', or 'interpretation'.",
        rubricNote: "Choose one core term you can reuse in statistics and modelling tasks.",
        matchGroups: [["probability", "uncertainty", "interpretation"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why mathematicians need to interpret probability claims carefully instead of treating them as self-explanatory numbers.",
  },
  {
    groupId: "maths-ai-science-oxford",
    majorId: "mathematics",
    resourceType: "lecture",
    accent: "british",
    speakerRegion: "british",
    title: "Will Computers prove theorems?",
    source: "Oxford Strachey Lecture on theorem provers, large language models, and the future of mathematical proof.",
    sourceName: "University of Oxford Podcasts",
    speakerRole: "Strachey Lecture speaker",
    speakerName: "Kevin Buzzard",
    scenario:
      "Interdisciplinary lecture on theorem provers, AI-assisted reasoning, and how computers may change mathematical practice.",
    transcript:
      "The lecture asks whether computers could eventually prove theorems at a level that changes mathematical work. It explains that theorem provers and language models are useful in different ways, with formal systems handling detail while AI tools may help with exploration and brainstorming. A central message is that mathematics may change most when human insight is combined with rigorous machine checking.",
    transcriptUrl: "https://podcasts.ox.ac.uk/will-computers-prove-theorems",
    officialUrl: "https://podcasts.ox.ac.uk/will-computers-prove-theorems",
    videoSrc:
      "https://media.podcasts.ox.ac.uk/comlab/comsci/strachey/2025-05-06-consci-strachey-buzzard-720p.mp4",
    audioSrc:
      "https://media.podcasts.ox.ac.uk/comlab/comsci/strachey/2025-05-06-consci-strachey-buzzard.mp3",
    recommendedLevel: "B2",
    durationLabel: "46 min Oxford lecture",
    supportFocus:
      "Follow how the speaker distinguishes theorem provers, language models, and human mathematical judgement.",
    notePrompts: [
      "What question about computers and proof organises the lecture?",
      "How are theorem provers different from language models in the talk?",
      "What role still belongs to human mathematicians?",
      "Which AI or mathematics term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "theorem prover",
        definition: "software that checks or constructs formal proofs under strict logical rules",
      },
      {
        term: "formalisation",
        definition: "rewriting mathematical ideas in a precise form that a machine can verify",
      },
      { term: "brainstorming", definition: "generating rough ideas before refining them carefully" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The lecture examines whether computers can help prove theorems, and how theorem provers, AI tools, and human mathematicians might work together.",
        rubricNote: "Mention both machine support and the continuing role of human mathematics.",
        matchGroups: [["computer", "prove", "theorem"], ["theorem prover", "ai"], ["human", "mathematic"]],
      },
      {
        id: "detail",
        prompt: "What technical tool does the speaker link to rigorous machine checking?",
        placeholder: "Name one or two tasks.",
        modelAnswer: "A strong answer names theorem provers such as Lean or the idea of formal verification.",
        rubricNote: "Choose the precise tool for proof checking, not just 'AI'.",
        matchGroups: [["theorem prover", "lean"], ["formal", "verification", "machine checking"]],
      },
      {
        id: "signpost",
        prompt: "What still needs human judgement according to the lecture?",
        placeholder: "Write one short answer.",
        modelAnswer:
          "Human judgement is still needed for deciding which ideas matter, shaping arguments, and interpreting mathematical significance.",
        rubricNote: "Show that the lecture treats AI support as partial rather than complete replacement.",
        matchGroups: [["human"], ["idea", "argument", "interpret", "judgement"]],
      },
      {
        id: "term",
        prompt: "Which interdisciplinary term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'theorem prover', 'formalisation', or 'brainstorming'.",
        rubricNote: "Choose a term that connects mathematical thinking with AI use.",
        matchGroups: [["theorem prover", "formalisation", "brainstorming"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how theorem provers and human mathematicians might complement each other in future research.",
  },
  {
    groupId: "computing-software-changing-stanford",
    majorId: "computing-science",
    resourceType: "lecture",
    accent: "american",
    speakerRegion: "north-america",
    title: "Lecture 23: Graph Search Algorithms",
    source:
      "Stanford Engineering Everywhere lecture on graphs, depth-first search, breadth-first search, and pathfinding.",
    sourceName: "Stanford Engineering Everywhere",
    speakerRole: "Stanford course lecture",
    scenario:
      "Core computing lecture on graph representation, depth-first search, breadth-first search, and pathfinding strategy.",
    transcript:
      "The lecture uses pathfinding to show why graph structure matters in computing. It explains how depth-first and breadth-first search explore the same graph differently and why representation choices affect implementation. A key message is that algorithm behaviour becomes easier to reason about when students connect examples, data structures, and search strategy.",
    transcriptUrl: "https://see.stanford.edu/Course/CS106B/150",
    officialUrl: "https://see.stanford.edu/Course/CS106B/150",
    videoSrc: "https://html5.stanford.edu/videos/courses/see/CS106B/CS106B-lecture23.mp4",
    recommendedLevel: "B1",
    durationLabel: "46 min Stanford SEE lecture",
    supportFocus:
      "Track how the lecture connects graph examples, traversal strategy, and implementation decisions.",
    notePrompts: [
      "What problem does the lecture use to introduce graph search?",
      "How are DFS and BFS described differently?",
      "Why does graph representation matter in implementation?",
      "Which computing term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "graph traversal",
        definition: "the process of visiting nodes and edges in a graph according to a search rule",
      },
      {
        term: "depth-first search",
        definition: "a graph-search strategy that follows one branch deeply before backtracking",
      },
      {
        term: "breadth-first search",
        definition: "a graph-search strategy that explores all nearby nodes before moving deeper",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main message of the lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The lecture explains graph search by comparing traversal strategies and showing how representation choices affect pathfinding work.",
        rubricNote: "Mention both graph search and the practical implementation angle.",
        matchGroups: [["graph", "search"], ["traversal", "pathfinding"], ["represent", "implementation"]],
      },
      {
        id: "detail",
        prompt: "Which search strategies does the lecture compare directly?",
        placeholder: "Write one or two short phrases.",
        modelAnswer: "A strong answer includes depth-first search and breadth-first search.",
        rubricNote: "Name the algorithms explicitly rather than saying only 'graph methods'.",
        matchGroups: [["depth-first", "dfs"], ["breadth-first", "bfs"]],
      },
      {
        id: "signpost",
        prompt: "Why does graph representation matter in the lecture?",
        placeholder: "Write one practical effect.",
        modelAnswer:
          "Because the way nodes and arcs are stored affects how the search is implemented and understood.",
        rubricNote: "Connect the data structure choice to actual algorithm behaviour.",
        matchGroups: [["nodes", "arcs", "stored"], ["implement", "algorithm", "represent"]],
      },
      {
        id: "term",
        prompt: "Which computing term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer:
          "A correct term is 'graph traversal', 'depth-first search', or 'breadth-first search'.",
        rubricNote: "Choose one term you can reuse in algorithms and systems courses.",
        matchGroups: [["graph traversal", "depth-first search", "breadth-first search"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why students should compare both graph representation and search strategy when solving a pathfinding problem.",
  },
  {
    groupId: "computing-ai-healthcare-stanford",
    majorId: "computing-science",
    resourceType: "podcast",
    accent: "global",
    speakerRegion: "british",
    title: "Is AI good for our health?",
    source:
      "Oxford panel podcast on health data, machine learning, clinical decision-making, and public trust.",
    sourceName: "University of Oxford Podcasts",
    speakerRole: "Oxford panel discussion",
    speakerName: "Peter Millican, Alison Noble, Paul Leeson, and Jessica Morley",
    scenario:
      "Cross-disciplinary podcast on AI in healthcare, health data, clinical use, and the policy questions around deployment.",
    transcript:
      "The discussion looks at how AI can mine large health datasets and support clinical decisions, while also raising questions about trust, policy, and patient impact. It highlights that medical deployment depends on more than model performance because clinicians and institutions need reliable data, clear evaluation, and responsible oversight. A central message is that healthcare AI has to be useful, understandable, and accountable in real practice.",
    officialUrl: "https://podcasts.ox.ac.uk/ai-good-our-health",
    audioSrc: "https://media.podcasts.ox.ac.uk/devoff/futuremakers/2018-11-05-futuremakers-eps4.mp3",
    recommendedLevel: "B2",
    durationLabel: "47 min Oxford podcast",
    supportFocus:
      "Listen for how the panel links health data, model usefulness, clinical decisions, and public trust.",
    notePrompts: [
      "What benefits of AI in healthcare are described first?",
      "Why is health data quality important in the discussion?",
      "What makes medical deployment different from a simpler software setting?",
      "Which AI term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "health data",
        definition: "medical information collected from patients, devices, or clinical systems",
      },
      { term: "evaluation", definition: "checking how well a model or method performs on a task" },
      {
        term: "clinical decision-making",
        definition: "the process of choosing diagnosis or treatment actions in medical care",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The discussion focuses on how AI might improve healthcare through data analysis, while still requiring careful evaluation, trust, and responsible use.",
        rubricNote: "Mention both opportunity and the need for careful deployment.",
        matchGroups: [["ai"], ["health", "healthcare"], ["data", "trust", "evaluation", "responsible"]],
      },
      {
        id: "detail",
        prompt: "Which technical factor does the panel stress before real-world use?",
        placeholder: "Write one or two short answers.",
        modelAnswer: "A strong answer includes health data quality or careful evaluation.",
        rubricNote: "Choose a concrete technical factor rather than only saying 'accuracy'.",
        matchGroups: [["health data", "data quality", "data"], ["evaluation", "reliable"]],
      },
      {
        id: "signpost",
        prompt: "Why is deployment in healthcare treated carefully?",
        placeholder: "Write one reason.",
        modelAnswer:
          "Because healthcare AI affects real patients and has to be trustworthy in clinical practice, not only impressive in theory.",
        rubricNote: "Connect technical performance to human impact.",
        matchGroups: [["real", "patients", "people"], ["trust", "reliable", "clinical", "practice"]],
      },
      {
        id: "term",
        prompt: "Which applied-AI term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'health data', 'evaluation', or 'clinical decision-making'.",
        rubricNote: "Choose a term that matters in both class projects and real AI systems.",
        matchGroups: [["health data", "evaluation", "clinical decision-making"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why healthcare AI should be judged by trust and real clinical usefulness, not by model accuracy alone.",
  },
  {
    groupId: "mechanical-nature-3d-printer",
    majorId: "mechanical-engineering",
    resourceType: "podcast",
    accent: "global",
    speakerRegion: "north-america",
    title: "A rapid, multi-material 3D printer",
    source: "Nature Podcast episode on multi-material additive manufacturing.",
    sourceName: "Nature Podcast",
    speakerRole: "Podcast episode",
    speakerName: "Jennifer Lewis",
    scenario:
      "Science podcast listening on multi-material additive manufacturing, high-speed printheads, and future device fabrication.",
    transcript:
      "The episode explains a 3D printer that can switch rapidly among several materials in one build process. It highlights fast printhead switching, finer control over volume elements, and uses such as flexible electronics or soft robotics. The report frames this as a step toward more complex devices made in one manufacturing run.",
    transcriptUrl: "https://www.nature.com/articles/d41586-019-03507-2",
    officialUrl: "https://www.nature.com/articles/d41586-019-03507-2",
    thumbnailUrl:
      "https://media.nature.com/lw1200/magazine-assets/d41586-019-03507-2/d41586-019-03507-2_17372594.jpg",
    audioSrc:
      "https://media.nature.com/original/magazine-assets/d41586-019-03507-2/d41586-019-03507-2_17381816.mpga",
    recommendedLevel: "B1",
    durationLabel: "Nature podcast episode",
    supportFocus:
      "Track how the podcast explains a manufacturing breakthrough through speed, materials, and engineering applications.",
    notePrompts: [
      "What makes this printer different from standard 3D printers?",
      "How many materials can it switch between quickly?",
      "Which applications make the technology important?",
      "Which manufacturing term should stay in your notes?",
    ],
    vocabulary: [
      { term: "printhead", definition: "the component that delivers material during printing" },
      { term: "multi-material", definition: "using more than one material in a single manufactured object" },
      { term: "volume element", definition: "a very small unit of material inside a three-dimensional printed object" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main engineering advance in this podcast episode?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The episode explains a 3D printer that can switch rapidly between multiple materials and make more complex devices in one process.",
        rubricNote: "Mention both rapid switching and multi-material production.",
        matchGroups: [["3d printer", "printer"], ["switch", "multiple", "multi-material"], ["complex", "devices", "one process"]],
      },
      {
        id: "detail",
        prompt: "What does the episode say the system can switch between quickly?",
        placeholder: "Write one short answer.",
        modelAnswer: "It can switch between different printing materials or inks at high speed.",
        rubricNote: "Focus on the engineering capability, not only the final product.",
        matchGroups: [["materials", "inks"], ["high speed", "rapid", "switch"]],
      },
      {
        id: "signpost",
        prompt: "Which applications make the technology valuable?",
        placeholder: "Write one or two examples.",
        modelAnswer: "A strong answer includes flexible electronics, soft robotics, or complex multi-material devices.",
        rubricNote: "Give a concrete application area from the report.",
        matchGroups: [["electronics", "robot", "devices", "soft"]],
      },
      {
        id: "term",
        prompt: "Which manufacturing term should you keep from this episode?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'printhead' or 'multi-material'.",
        rubricNote: "Choose one term that helps you explain the technology precisely.",
        matchGroups: [["printhead", "multi-material"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how faster multi-material printing could change prototyping in a mechanical-engineering lab.",
  },
  {
    groupId: "mechanical-czinger-hypercar-asme",
    majorId: "mechanical-engineering",
    resourceType: "interview",
    accent: "global",
    speakerRegion: "north-america",
    title: "How 3D Printed Structures Are Changing Bioengineering",
    source:
      "ASME interview on 3D bioprinted structures, scaffold design, and structural uniformity.",
    sourceName: "ASME TechCast",
    speakerRole: "Podcast interview guest",
    speakerName: "Roger Narayan",
    scenario:
      "Mechanical and bioengineering interview listening on 3D printed scaffolds, lattices, and design quality in biomedical applications.",
    transcript:
      "The interview explains how 3D bioprinted structures such as scaffolds and lattices are being used in bioengineering. It highlights that structural uniformity and repeatable geometry matter for practical outcomes. A key idea is that additive manufacturing is not only about speed, but also about controllable structure and application-specific performance.",
    officialUrl:
      "https://www.asme.org/topics-resources/content/podcast-3d-printed-structures-changing",
    embedUrl:
      "https://players.brightcove.net/1711318824001/default_default/index.html?videoId=5524719189001",
    thumbnailUrl:
      "https://www.asme.org/getmedia/bba32584-a2d7-4460-9d79-64f077e12c5d/how-3d-printed-structures-are-changing-bioengineering.jpg?width=1280&height=720&ext=.jpg",
    recommendedLevel: "B1",
    durationLabel: "Podcast interview",
    supportFocus:
      "Listen for how the speaker links printed geometry, uniformity, and biomedical function.",
    notePrompts: [
      "What structures are repeatedly mentioned in the interview?",
      "Why does the speaker stress uniformity?",
      "How does this use of 3D printing differ from simple rapid prototyping?",
      "Which additive-manufacturing term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "scaffold",
        definition:
          "a three-dimensional support structure used to guide cell growth or tissue engineering",
      },
      {
        term: "lattice",
        definition:
          "a repeating geometric structure used to control stiffness, weight, or flow behavior",
      },
      {
        term: "uniformity",
        definition:
          "the consistency of structure and properties across printed parts or regions",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main engineering idea in the interview?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The interview explains how 3D printed scaffolds and lattices are changing bioengineering, with emphasis on structural control and consistency.",
        rubricNote: "Mention both printed structures and why they matter.",
        matchGroups: [
          ["3d", "printed", "bioprinted", "additive"],
          ["scaffold", "lattice"],
          ["uniformity", "control", "consistency"],
        ],
      },
      {
        id: "detail",
        prompt: "Which specific structure types does the speaker discuss?",
        placeholder: "Write one short answer.",
        modelAnswer: "A strong answer includes scaffolds and lattices.",
        rubricNote: "Capture concrete structure terms, not only '3D printing' in general.",
        matchGroups: [["scaffold", "lattice"]],
      },
      {
        id: "signpost",
        prompt: "Why is uniformity important in this context?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because reliable biomedical structures need consistent geometry and material behavior across prints.",
        rubricNote: "Link uniformity to reliability and practical application.",
        matchGroups: [
          ["uniformity", "consistent", "consistency"],
          ["reliable", "biomedical", "application", "geometry"],
        ],
      },
      {
        id: "term",
        prompt: "Which additive-manufacturing term should you keep from this interview?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'scaffold', 'lattice', or 'uniformity'.",
        rubricNote: "Keep a term that helps you describe printed-structure quality.",
        matchGroups: [["scaffold", "lattice", "uniformity"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how structure-level control in 3D printing can improve mechanical performance in biomedical design.",
  },
  {
    groupId: "transport-highway-decarbonisation-cambridge",
    majorId: "mechanical-engineering-transportation",
    resourceType: "lecture",
    accent: "british",
    speakerRegion: "british",
    title: "Zero carbon energy systems",
    source:
      "Oxford Martin School discussion on renewable electricity, energy efficiency, and the system changes needed for net zero.",
    sourceName: "University of Oxford Podcasts",
    speakerRole: "Oxford public discussion",
    speakerName: "Nick Eyre and Steve Smith",
    scenario:
      "Transport-and-energy lecture on system-wide decarbonisation, renewable electricity, and why net-zero planning depends on credible evidence.",
    transcript:
      "The discussion argues that net-zero planning depends on changing whole energy systems, not just swapping one fuel for another. It highlights the role of renewable electricity, energy efficiency, and credible emissions evidence when comparing decarbonisation pathways. A central point is that infrastructure decisions become more defensible when engineers think at the system level.",
    transcriptUrl: "https://podcasts.ox.ac.uk/zero-carbon-energy-systems",
    officialUrl: "https://podcasts.ox.ac.uk/zero-carbon-energy-systems",
    videoSrc:
      "https://media.podcasts.ox.ac.uk/jmar/general/zero-carbon-energy-systemsnick-eyremp4.mp4",
    recommendedLevel: "B2",
    durationLabel: "60 min Oxford discussion",
    supportFocus:
      "Track how the speakers connect renewable supply, energy efficiency, and evidence-based decarbonisation.",
    notePrompts: [
      "What system problem do the speakers identify first?",
      "Why is renewable electricity treated as only one part of the answer?",
      "How does evidence shape decarbonisation decisions in the discussion?",
      "Which transport term should stay in your notes?",
    ],
    vocabulary: [
      { term: "net zero", definition: "a state in which greenhouse-gas emissions are reduced as much as possible and balanced overall" },
      { term: "energy efficiency", definition: "getting the same useful result with less energy input" },
      { term: "mitigation", definition: "action taken to reduce the severity of emissions or climate impact" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The discussion explains that zero-carbon transitions need system-level planning built on renewable electricity, efficiency, and credible evidence.",
        rubricNote: "Mention both net-zero systems thinking and the role of evidence.",
        matchGroups: [["zero carbon", "net zero"], ["renewable", "efficiency"], ["evidence", "system"]],
      },
      {
        id: "detail",
        prompt: "Which two levers for decarbonisation are emphasised in the discussion?",
        placeholder: "Write one short phrase.",
        modelAnswer:
          "A strong answer includes renewable electricity and energy efficiency.",
        rubricNote: "Name the practical system levers, not only the climate goal.",
        matchGroups: [["renewable", "electricity"], ["energy efficiency", "efficiency"]],
      },
      {
        id: "signpost",
        prompt: "Why do the speakers stress evidence in decarbonisation planning?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because engineers need credible emissions evidence to compare pathways and choose defensible interventions.",
        rubricNote: "Connect evidence to decision-making rather than to climate messaging alone.",
        matchGroups: [["credible", "evidence", "emissions"], ["compare", "choose", "intervention", "decision"]],
      },
      {
        id: "term",
        prompt: "Which transport term should you keep from this talk?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'net zero', 'energy efficiency', or 'mitigation'.",
        rubricNote: "Choose a term that helps in policy and transport-systems discussions.",
        matchGroups: [["net zero", "energy efficiency", "mitigation"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why transport decarbonisation should be planned as a whole-system problem rather than a single-technology swap.",
  },
  {
    groupId: "transport-hyperloop-asme",
    majorId: "mechanical-engineering-transportation",
    resourceType: "podcast",
    accent: "american",
    speakerRegion: "north-america",
    title: "MIT Student Engineer’s Team Leads Hyperloop Effort",
    source: "Engineering podcast on Hyperloop pod development and high-speed transport design.",
    sourceName: "ASME TechCast",
    speakerRole: "Podcast interview",
    scenario:
      "Transport podcast listening on Hyperloop development, pod design, and multidisciplinary engineering teamwork.",
    transcript:
      "The podcast focuses on a student engineering team working on Hyperloop pod design. It highlights systems integration, competition constraints, and the challenge of turning transport ideas into workable prototypes. The discussion shows how high-speed transport design depends on mechanics, control, and team coordination.",
    officialUrl:
      "https://www.asme.org/topics-resources/content/podcast-mit-student-engineers-team-leads",
    embedUrl:
      "https://players.brightcove.net/1711318824001/default_default/index.html?videoId=4825130975001",
    thumbnailUrl:
      "https://www.asme.org/getmedia/6cd22ff6-bd8b-4b74-9cf0-b10b5352b560/Podcast-MIT-Student-Engineers-Team-Leads-Hyperloop-Effort_hero.jpg.aspx?width=460&height=360&ext=.jpg",
    recommendedLevel: "B1",
    durationLabel: "Podcast interview",
    supportFocus:
      "Listen for how the team combines prototype design, system constraints, and transport ambition in one project.",
    notePrompts: [
      "What transport concept is the team developing?",
      "Which engineering constraints shape the design?",
      "Why is systems integration important here?",
      "Which transport term should stay in your notes?",
    ],
    vocabulary: [
      { term: "prototype", definition: "an early working version of a system built for testing" },
      { term: "systems integration", definition: "making different subsystems work together as one whole" },
      { term: "high-speed transport", definition: "transport designed for movement at very high velocity" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the podcast interview?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The interview follows a student team building a Hyperloop prototype and managing the engineering challenges of high-speed transport design.",
        rubricNote: "Mention both the prototype and the transport system challenge.",
        matchGroups: [["hyperloop", "high-speed transport"], ["student", "team", "prototype"], ["engineering", "design"]],
      },
      {
        id: "detail",
        prompt: "Which kind of engineering challenge shapes the project strongly?",
        placeholder: "Write one short answer.",
        modelAnswer: "A strong answer includes system constraints, prototype design, or subsystem coordination.",
        rubricNote: "Choose a specific engineering challenge rather than a vague answer.",
        matchGroups: [["constraint", "prototype", "subsystem", "coordination", "integration"]],
      },
      {
        id: "signpost",
        prompt: "Why is systems integration important in the interview?",
        placeholder: "Write one practical reason.",
        modelAnswer: "Because the transport concept only works when multiple parts of the pod system operate together reliably.",
        rubricNote: "The answer should show whole-system thinking, not one isolated part.",
        matchGroups: [["system", "parts", "together"], ["reliable", "work"]],
      },
      {
        id: "term",
        prompt: "Which transport-engineering term should you keep from this interview?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'prototype', 'systems integration', or 'high-speed transport'.",
        rubricNote: "Choose a term you can reuse in transport-systems discussion.",
        matchGroups: [["prototype", "systems integration", "high-speed transport"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why transport innovation projects need both ambitious ideas and strong subsystem coordination.",
  },
  {
    groupId: "civil-mit-structural-design",
    majorId: "civil-engineering",
    resourceType: "lecture",
    accent: "american",
    speakerRegion: "north-america",
    title: "Lab 1 Part A: Data Acquisition and Instruments",
    source:
      "MIT civil-engineering lab demonstration on measurement devices, sensors, and digital data acquisition.",
    sourceName: "MIT OpenCourseWare",
    speakerRole: "MIT lab demonstration",
    speakerName: "John Germaine",
    scenario:
      "Civil-engineering lab video on instrumentation, sensor wiring, digital data acquisition, and how engineers evaluate measurement quality before analysing results.",
    transcript:
      "The demonstration introduces the basic data-acquisition setup used in a civil engineering materials lab. It shows that engineers need to understand wiring, sensors, and analog-to-digital conversion before trusting the numbers they record. A key message is that careful measurement practice is part of engineering judgement, not just a background technical step.",
    transcriptUrl:
      "https://ocw.mit.edu/courses/1-103-civil-engineering-materials-laboratory-spring-2004/f75be888182135889f32bd0e5c0a480a_lab_1.pdf",
    officialUrl:
      "https://ocw.mit.edu/courses/1-103-civil-engineering-materials-laboratory-spring-2004/pages/video-demonstrations/",
    videoSrc: "https://archive.org/download/MIT1.103S04/mit-ocw-1.103-lab-part-a-300k.mp4",
    recommendedLevel: "B1",
    durationLabel: "15 min MIT lab demonstration",
    supportFocus:
      "Track how the instructor links instrumentation, calibration, and data quality before any later materials analysis.",
    notePrompts: [
      "Which lab system or device is introduced first?",
      "What measurement or sensor ideas are emphasised?",
      "Why does the instructor stress setup quality before data analysis?",
      "Which measurement term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "data acquisition",
        definition: "collecting measurements digitally from instruments or sensors",
      },
      {
        term: "transducer",
        definition: "a device that converts a physical quantity into a measurable signal",
      },
      {
        term: "calibration",
        definition: "checking and adjusting an instrument so its readings can be trusted",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main purpose of the lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The lab video explains how engineers set up instruments and data acquisition correctly so later measurements can be trusted.",
        rubricNote: "Mention both the instrumentation focus and the need for reliable measurement.",
        matchGroups: [["instrument", "measurement", "data acquisition"], ["reliable", "trust", "setup"]],
      },
      {
        id: "detail",
        prompt: "Which devices or measurement concepts does the instructor emphasise?",
        placeholder: "Name one or two examples.",
        modelAnswer:
          "A strong answer includes sensors, transducers, wiring, or digital data acquisition.",
        rubricNote: "Choose specific lab concepts rather than only saying 'equipment'.",
        matchGroups: [["sensor", "transducer", "wiring"], ["data acquisition", "digital"]],
      },
      {
        id: "signpost",
        prompt: "Why does the instructor stress setup and calibration before analysis?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because poor setup produces unreliable readings, and unreliable data weakens later engineering decisions.",
        rubricNote: "Connect lab procedure to the trustworthiness of the results.",
        matchGroups: [["setup", "calibration", "reliable"], ["data", "readings", "decision"]],
      },
      {
        id: "term",
        prompt: "Which measurement term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer:
          "A correct term is 'data acquisition', 'transducer', or 'calibration'.",
        rubricNote: "Choose a term you can reuse in later lab and testing discussions.",
        matchGroups: [["data acquisition", "transducer", "calibration"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why civil-engineering experiments need careful instrumentation and calibration before students interpret the data.",
  },
  {
    groupId: "civil-mit-solid-mechanics",
    majorId: "civil-engineering",
    resourceType: "lecture",
    accent: "indian",
    speakerRegion: "asia",
    title: "Structural Analysis - I",
    source:
      "Archived NPTEL lecture on support idealisation, indeterminacy, and the force-based reasoning used in structural analysis.",
    sourceName: "NPTEL Archive",
    speakerRole: "NPTEL course lecture",
    scenario:
      "Civil-structures lecture on support conditions, structural idealisation, and how analysts move from reactions to internal-force interpretation.",
    transcript:
      "The lecture introduces structural analysis through the way real structures are idealised into supports, members, and connections that can be reasoned about mathematically. It explains that support conditions and the degree of indeterminacy shape the analysis method engineers choose. A key message is that clear structural idealisation comes before calculation because the wrong model leads to the wrong force picture.",
    officialUrl: "https://onlinecourses-archive.nptel.ac.in/noc17_ce25/preview",
    embedUrl: "https://www.youtube.com/embed/sGJtiVQOhpY?rel=0",
    thumbnailUrl: buildYouTubeThumbnail("sGJtiVQOhpY"),
    audioSrc: "/audio/listening/civil-mit-solid-mechanics.m4a",
    recommendedLevel: "B2",
    durationLabel: "NPTEL archive lecture",
    supportFocus:
      "Listen for the sequence from structural idealisation to indeterminacy and then to analysis choice.",
    notePrompts: [
      "What modelling step does the lecture emphasise first?",
      "Which support or indeterminacy ideas appear next?",
      "Why does the lecturer insist on idealisation before calculation?",
      "Which structural-analysis term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "structural idealisation",
        definition: "the simplification of a real structure into a model of supports, members, and connections",
      },
      {
        term: "degree of indeterminacy",
        definition: "the number of unknown reactions or forces beyond what basic equilibrium equations can solve directly",
      },
      {
        term: "support reaction",
        definition: "the force or moment supplied by a support to keep a structure in equilibrium",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the structural-analysis lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The lecture explains how engineers idealise structures, interpret supports, and use indeterminacy to choose an analysis approach.",
        rubricNote: "Mention both structural modelling and the move toward analysis method.",
        matchGroups: [["structure", "ideal"], ["support", "indeterminacy", "analysis"]],
      },
      {
        id: "detail",
        prompt: "Which structural-analysis ideas does the lecturer introduce after modelling the structure?",
        placeholder: "Write one or two examples.",
        modelAnswer:
          "A strong answer includes support reactions, degree of indeterminacy, or idealised support conditions.",
        rubricNote: "Choose specific structural-analysis ideas rather than only saying 'forces'.",
        matchGroups: [["support", "reaction"], ["indeterminacy", "idealisation"]],
      },
      {
        id: "signpost",
        prompt: "Why does the lecture insist on structural idealisation before solving equations?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because the analysis method and resulting force picture depend on whether the structure has been modelled with the right supports and constraints.",
        rubricNote: "Show why the model affects later calculations.",
        matchGroups: [["model", "ideal"], ["support", "constraint", "force"]],
      },
      {
        id: "term",
        prompt: "Which structural-analysis term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer:
          "A correct term is 'structural idealisation', 'degree of indeterminacy', or 'support reaction'.",
        rubricNote: "Choose one reusable term for structural-analysis discussion.",
        matchGroups: [["structural idealisation", "degree of indeterminacy", "support reaction"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why civil engineers should model supports and indeterminacy clearly before trusting a structural analysis result.",
  },
  {
    groupId: "maths-mit-linear-algebra-vision",
    majorId: "mathematics",
    resourceType: "lecture",
    accent: "american",
    speakerRegion: "north-america",
    title: "A Vision of Linear Algebra",
    source:
      "MIT OpenCourseWare video collection on a concept-first order for teaching and learning linear algebra.",
    sourceName: "MIT OpenCourseWare",
    speakerRole: "MIT mathematics lecture",
    scenario:
      "Applied-mathematics listening on column space, independence, and why conceptual order matters in linear algebra.",
    transcript:
      "The course presents linear algebra as a connected set of ideas rather than a list of procedures. It emphasizes column space, independence, and the geometry behind matrix reasoning, encouraging students to understand why operations work instead of memorizing steps. The overall message is that better conceptual order makes later applications in science and engineering easier to follow.",
    officialUrl:
      "https://ocw.mit.edu/courses/res-18-010-a-2020-vision-of-linear-algebra-spring-2020/pages/2021-video/",
    embedUrl: "https://www.youtube.com/embed/JFIaRtKNP2E",
    videoSrc: "https://archive.org/download/mit-2020-vision/MIT_2020_Vision_Part_6_300k.mp4",
    thumbnailUrl: buildYouTubeThumbnail("JFIaRtKNP2E"),
    recommendedLevel: "B1",
    durationLabel: "MIT OCW lecture collection",
    supportFocus:
      "Track how the speaker links conceptual order, geometry, and later applications in applied mathematics.",
    notePrompts: [
      "What teaching problem is the course trying to solve?",
      "Which core linear-algebra ideas appear early?",
      "Why does the speaker prefer conceptual order over memorised procedures?",
      "Which maths term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "column space",
        definition: "the set of all vectors that can be formed from the columns of a matrix",
      },
      {
        term: "linear independence",
        definition: "a property showing that no vector in a set is built from the others",
      },
      {
        term: "matrix reasoning",
        definition: "interpreting what a matrix means instead of applying rules mechanically",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main aim of this linear-algebra resource?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The resource argues for teaching linear algebra through connected concepts such as column space and independence instead of isolated procedures.",
        rubricNote: "Mention both the teaching approach and the core conceptual focus.",
        matchGroups: [["linear algebra", "concept"], ["column space", "independence", "procedure"]],
      },
      {
        id: "detail",
        prompt: "Which ideas does the course bring forward early in the learning sequence?",
        placeholder: "Name one or two ideas.",
        modelAnswer:
          "A strong answer includes column space, independence, or geometric interpretation.",
        rubricNote: "Choose specific ideas rather than saying only 'the basics'.",
        matchGroups: [["column space", "independence"], ["geometry", "interpretation"]],
      },
      {
        id: "signpost",
        prompt: "Why does the speaker want students to focus on concepts before procedures?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because conceptual understanding makes later applications in science and engineering easier to follow and explain.",
        rubricNote: "Connect the teaching choice to later mathematical use.",
        matchGroups: [["concept", "understand"], ["application", "engineering", "science"]],
      },
      {
        id: "term",
        prompt: "Which maths term should you keep from this resource?",
        placeholder: "Write one technical term.",
        modelAnswer:
          "A correct term is 'column space', 'linear independence', or 'matrix reasoning'.",
        rubricNote: "Choose a term you can reuse in later modelling and algebra study.",
        matchGroups: [["column space", "linear independence", "matrix reasoning"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how a concept-first approach to linear algebra can help engineering students read applied models more confidently.",
  },
  {
    groupId: "maths-stanford-linear-systems",
    majorId: "mathematics",
    resourceType: "lecture",
    accent: "american",
    speakerRegion: "north-america",
    title: "Introduction to Linear Dynamical Systems",
    source:
      "Stanford Engineering Everywhere course on applied linear algebra and linear dynamical systems across engineering domains.",
    sourceName: "Stanford Engineering Everywhere",
    speakerRole: "Stanford course lecture",
    scenario:
      "Applied-maths and systems lecture on stability, state evolution, and modelling across circuits, signal processing, and control.",
    transcript:
      "The course links linear algebra with dynamical systems and engineering applications such as circuits, signals, and control. It focuses on how state, stability, and input-output behaviour help students reason about complex systems over time. A key point is that mathematical models become more useful when learners connect equations with physical interpretation.",
    officialUrl: "https://see.stanford.edu/Course/EE263",
    videoSrc: "https://html5.stanford.edu/videos/courses/see/EE263/EE263-lecture01.mp4",
    thumbnailUrl: buildStanfordSeeImage("/Content/Images/Instructors/boyd.jpg"),
    recommendedLevel: "B2",
    durationLabel: "Stanford SEE course lecture",
    supportFocus:
      "Listen for how mathematical language is tied to state, stability, and real engineering interpretation.",
    notePrompts: [
      "What kinds of engineering systems does the lecture mention?",
      "Which mathematical ideas organise the course?",
      "Why does the speaker connect equations with physical interpretation?",
      "Which systems-maths term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "stability",
        definition: "the tendency of a system to remain bounded or return toward a desired state",
      },
      {
        term: "state estimation",
        definition: "using measurements and models to infer the internal state of a system",
      },
      {
        term: "convolution",
        definition: "an operation used to describe how a system responds over time to an input",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the Stanford course?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The course explains linear dynamical systems by connecting linear algebra with applications in circuits, signals, and control.",
        rubricNote: "Mention both the mathematical focus and the engineering applications.",
        matchGroups: [["linear", "dynamical systems"], ["circuits", "signals", "control"]],
      },
      {
        id: "detail",
        prompt: "Which engineering application areas does the speaker use to motivate the maths?",
        placeholder: "Name one or two areas.",
        modelAnswer:
          "A strong answer includes circuits, signal processing, or control systems.",
        rubricNote: "Choose the applied domains, not only abstract mathematics.",
        matchGroups: [["circuits", "signal", "control"], ["engineering", "systems"]],
      },
      {
        id: "signpost",
        prompt: "Why does the lecture insist on physical interpretation as well as equations?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because models become more useful when students can relate mathematical results to how real systems behave over time.",
        rubricNote: "Show why interpretation matters for application.",
        matchGroups: [["physical", "real system", "behave"], ["model", "equation", "interpretation"]],
      },
      {
        id: "term",
        prompt: "Which systems-maths term should you keep from this course?",
        placeholder: "Write one technical term.",
        modelAnswer:
          "A correct term is 'stability', 'state estimation', or 'convolution'.",
        rubricNote: "Choose a term that can transfer to modelling or control discussions.",
        matchGroups: [["stability", "state estimation", "convolution"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why applied mathematics becomes more valuable when state-based models are connected to real engineering systems.",
  },
  {
    groupId: "computing-mit-dijkstra",
    majorId: "computing-science",
    resourceType: "lecture",
    accent: "american",
    speakerRegion: "north-america",
    title: "Lecture 16: Dijkstra",
    source:
      "MIT OpenCourseWare algorithms lecture on shortest paths, weighted graphs, and relaxation-based search.",
    sourceName: "MIT OpenCourseWare",
    speakerRole: "MIT course lecture",
    scenario:
      "Computer-science lecture listening on shortest-path problems, graph structure, and why Dijkstra's algorithm works.",
    transcript:
      "The lecture explains Dijkstra's algorithm as a method for solving shortest-path problems in weighted graphs. It highlights how the algorithm updates tentative distances and chooses the next node in a controlled, greedy way. The core message is that algorithm design becomes clearer when students track both the graph structure and the reason each relaxation step is valid.",
    officialUrl:
      "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-16-dijkstra/",
    videoSrc: "https://archive.org/download/MIT6.006F11/MIT6_006F11_lec16_300k.mp4",
    thumbnailUrl:
      "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/1075c5ac06ae4c2cea8c89e9772da78a_6-006f11.jpg",
    recommendedLevel: "B2",
    durationLabel: "MIT OCW lecture",
    supportFocus:
      "Track how the lecture links graph structure, tentative distance updates, and greedy selection.",
    notePrompts: [
      "What problem is the algorithm trying to solve?",
      "Which values change during the method?",
      "Why does the lecture describe the algorithm as controlled or greedy?",
      "Which algorithms term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "weighted graph",
        definition: "a graph whose edges have numerical costs or distances attached",
      },
      { term: "shortest path", definition: "the least-cost route between two nodes in a graph" },
      {
        term: "relaxation",
        definition: "the update step that improves the current best known distance estimate",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The lecture explains how Dijkstra's algorithm finds shortest paths in weighted graphs.",
        rubricNote: "Mention both the algorithm and the shortest-path problem.",
        matchGroups: [["dijkstra"], ["shortest path", "weighted graph"]],
      },
      {
        id: "detail",
        prompt: "Which kind of value does the algorithm update as it runs?",
        placeholder: "Write one short answer.",
        modelAnswer:
          "A strong answer mentions tentative distances or current best distance estimates.",
        rubricNote: "The detail should identify what changes during the algorithm.",
        matchGroups: [["distance", "tentative"], ["estimate", "best"]],
      },
      {
        id: "signpost",
        prompt: "Why does the lecture care about the greedy choice in the algorithm?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because the greedy selection step helps explain why the search progresses efficiently and correctly.",
        rubricNote: "Connect the choice rule to efficiency or correctness.",
        matchGroups: [["greedy", "choice"], ["efficient", "correct", "progress"]],
      },
      {
        id: "term",
        prompt: "Which algorithms term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer:
          "A correct term is 'weighted graph', 'shortest path', or 'relaxation'.",
        rubricNote: "Choose a reusable algorithms term for graph discussions.",
        matchGroups: [["weighted graph", "shortest path", "relaxation"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why shortest-path algorithms need both a clear graph model and a valid update rule.",
  },
  {
    groupId: "computing-nptel-dsa",
    majorId: "computing-science",
    resourceType: "lecture",
    accent: "indian",
    speakerRegion: "asia",
    title: "Data Structures And Algorithms",
    source:
      "NPTEL course from IIT Delhi on how data representation and algorithm choice shape efficiency.",
    sourceName: "NPTEL",
    speakerRole: "NPTEL course lecture",
    speakerName: "Prof. Naveen Garg",
    scenario:
      "Indian English academic lecture on core data structures, algorithmic efficiency, and why representation affects computation.",
    transcript:
      "The course introduces data structures and algorithms as a linked discipline rather than two separate topics. It shows that the way data is represented affects efficiency, scalability, and the choice of algorithmic technique. A central message is that students need to compare correctness with time and space complexity when selecting a solution.",
    officialUrl: buildNptelCourseUrl("106102064"),
    embedUrl: "https://www.youtube.com/embed/zWg7U0OEAoE",
    thumbnailUrl: buildYouTubeThumbnail("zWg7U0OEAoE"),
    audioSrc: "/audio/listening/computing-nptel-dsa.m4a",
    recommendedLevel: "B1",
    durationLabel: "NPTEL course lecture",
    supportFocus:
      "Listen for the connection between representation, algorithm choice, and complexity trade-offs.",
    notePrompts: [
      "What relationship does the lecturer draw between data structures and algorithms?",
      "Why does representation matter in computation?",
      "Which efficiency trade-offs should students compare?",
      "Which computing term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "time complexity",
        definition: "how running time grows as the input size becomes larger",
      },
      {
        term: "data representation",
        definition: "the chosen way to store and organise information for computation",
      },
      { term: "scalability", definition: "how well a solution continues to work as demand or size increases" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main message of the NPTEL course introduction?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The introduction explains that data structures and algorithms must be studied together because representation affects efficiency and solution choice.",
        rubricNote: "Mention both the link between structures and algorithms and the efficiency point.",
        matchGroups: [["data structures", "algorithms"], ["representation", "efficiency", "choice"]],
      },
      {
        id: "detail",
        prompt: "Which trade-offs does the lecturer say students need to compare?",
        placeholder: "Name one or two trade-offs.",
        modelAnswer:
          "A strong answer includes time complexity, space complexity, or correctness versus efficiency.",
        rubricNote: "Choose concrete computational trade-offs.",
        matchGroups: [["time", "space", "complexity"], ["correct", "efficiency"]],
      },
      {
        id: "signpost",
        prompt: "Why does data representation matter in the course?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because the way information is stored affects which algorithms are suitable and how scalable the solution will be.",
        rubricNote: "Connect representation to both algorithm choice and performance.",
        matchGroups: [["representation", "stored"], ["algorithm", "scalable", "performance"]],
      },
      {
        id: "term",
        prompt: "Which computing term should you keep from this course?",
        placeholder: "Write one technical term.",
        modelAnswer:
          "A correct term is 'time complexity', 'data representation', or 'scalability'.",
        rubricNote: "Choose a term you can reuse in programming or systems discussion.",
        matchGroups: [["time complexity", "data representation", "scalability"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why programmers should evaluate both correctness and complexity before choosing a data structure or algorithm.",
  },
  {
    groupId: "mechanical-mit-engineering-dynamics",
    majorId: "mechanical-engineering",
    resourceType: "lecture",
    accent: "american",
    speakerRegion: "north-america",
    title: "Recitation 5: Equations of Motion",
    source:
      "MIT OpenCourseWare problem-solving video on free-body diagrams and equations of motion for multi-degree-of-freedom systems.",
    sourceName: "MIT OpenCourseWare",
    speakerRole: "MIT recitation",
    speakerName: "Kim Vandiver",
    scenario:
      "Mechanical-dynamics recitation on free-body diagrams, equations of motion, and how modelling choices affect multi-degree-of-freedom systems.",
    transcript:
      "The recitation reviews how engineers move from a physical mechanism to a free-body diagram and then to equations of motion. It emphasises that multi-degree-of-freedom systems become manageable only when forces, coordinates, and constraints are defined consistently. A key point is that dynamic analysis is clearer when the modelling decisions are explicit before algebra begins.",
    transcriptUrl:
      "https://ocw.mit.edu/courses/2-003sc-engineering-dynamics-fall-2011/resources/recitation-5-equations-of-motion-1/",
    officialUrl:
      "https://ocw.mit.edu/courses/2-003sc-engineering-dynamics-fall-2011/resources/recitation-5-equations-of-motion-1/",
    videoSrc: "https://archive.org/download/MIT2.003SCF11/MIT2_003SCF11_rec05_300k.mp4",
    recommendedLevel: "B2",
    durationLabel: "MIT OCW recitation",
    supportFocus:
      "Track the transition from physical system, to free-body diagram, to coordinates and equations of motion.",
    notePrompts: [
      "Which modelling step appears first in the recitation?",
      "How are forces and coordinates organised before the equations are written?",
      "Why does the instructor insist on a clear diagram before algebra?",
      "Which dynamics term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "free-body diagram",
        definition: "a diagram that isolates a body and shows the forces and moments acting on it",
      },
      {
        term: "degree of freedom",
        definition: "an independent coordinate needed to describe system motion",
      },
      {
        term: "equation of motion",
        definition: "an equation that relates forces, mass, and motion in a dynamic system",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the vibration lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The recitation explains how engineers build equations of motion by starting with a free-body diagram and consistent coordinates.",
        rubricNote: "Mention both the physical diagram and the move into equations.",
        matchGroups: [["free-body", "diagram"], ["equation of motion", "coordinate", "dynamic"]],
      },
      {
        id: "detail",
        prompt: "Which model elements or vibration concepts does the lecturer emphasise?",
        placeholder: "Name one or two examples.",
        modelAnswer:
          "A strong answer includes free-body diagrams, degrees of freedom, constraints, or equations of motion.",
        rubricNote: "Choose specific dynamics ideas rather than saying only 'forces'.",
        matchGroups: [["free-body", "diagram"], ["degree of freedom", "constraint", "equation of motion"]],
      },
      {
        id: "signpost",
        prompt: "Why does the lecture stress simplified modelling before calculation?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because unclear coordinates or force definitions lead to the wrong equations and an unreliable dynamic interpretation.",
        rubricNote: "Connect the setup choices to the quality of the final equations.",
        matchGroups: [["coordinate", "force", "wrong equations"], ["dynamic", "interpret", "reliable"]],
      },
      {
        id: "term",
        prompt: "Which vibration term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer:
          "A correct term is 'free-body diagram', 'degree of freedom', or 'equation of motion'.",
        rubricNote: "Choose a term you can reuse in dynamics and controls discussion.",
        matchGroups: [["free-body diagram", "degree of freedom", "equation of motion"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why a dynamics problem should be organised with diagrams and coordinates before solving the equations.",
  },
  {
    groupId: "mechanical-nptel-strength-materials",
    majorId: "mechanical-engineering",
    resourceType: "lecture",
    accent: "indian",
    speakerRegion: "asia",
    title: "Strength of Materials",
    source:
      "NPTEL course from IIT Roorkee on stress, strain, bending, and structural response under load.",
    sourceName: "NPTEL",
    speakerRole: "NPTEL course lecture",
    speakerName: "Dr. Satish C Sharma",
    scenario:
      "Indian English engineering lecture on stress, strain, bending, torsion, and design interpretation under loading.",
    transcript:
      "The course explains how members respond to loading through stress, strain, bending, and torsion. It emphasizes that material strength is not only a formula topic but a design decision about safety, stiffness, and failure risk. A key point is that engineers must interpret loading conditions before trusting the final calculation.",
    officialUrl: "https://onlinecourses-archive.nptel.ac.in/noc17_ce22/course",
    embedUrl: "https://www.youtube.com/embed/xMCReTC--Dg?rel=0",
    thumbnailUrl: buildYouTubeThumbnail("xMCReTC--Dg"),
    audioSrc: "/audio/listening/mechanical-nptel-strength-materials.m4a",
    recommendedLevel: "B1",
    durationLabel: "NPTEL archive lecture",
    supportFocus:
      "Listen for how the lecturer links loading conditions with deformation, safety, and design interpretation.",
    notePrompts: [
      "Which loading responses are central to the course?",
      "Why is the topic more than a formula exercise?",
      "What design concerns appear alongside calculation?",
      "Which materials term should stay in your notes?",
    ],
    vocabulary: [
      { term: "stress-strain", definition: "the relationship between applied load and material deformation" },
      { term: "bending moment", definition: "the moment that causes a member to bend under load" },
      { term: "torsion", definition: "twisting caused by torque acting on a member" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the course introduction?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The course explains how materials respond to loading through stress, strain, bending, and torsion.",
        rubricNote: "Mention both loading and response concepts.",
        matchGroups: [["stress", "strain"], ["bending", "torsion", "load"]],
      },
      {
        id: "detail",
        prompt: "Which response or loading topics does the lecturer emphasise?",
        placeholder: "Name one or two examples.",
        modelAnswer:
          "A strong answer includes stress-strain behaviour, bending, or torsion.",
        rubricNote: "Choose specific mechanics topics mentioned in the course frame.",
        matchGroups: [["stress-strain", "bending", "torsion"], ["load", "response"]],
      },
      {
        id: "signpost",
        prompt: "Why does the lecture say strength of materials is more than a formula topic?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because engineers use it to make decisions about safety, stiffness, and failure risk under real loading conditions.",
        rubricNote: "Connect the topic to design judgement and risk.",
        matchGroups: [["safety", "stiffness", "failure"], ["loading", "design", "risk"]],
      },
      {
        id: "term",
        prompt: "Which materials term should you keep from this course?",
        placeholder: "Write one technical term.",
        modelAnswer:
          "A correct term is 'stress-strain', 'bending moment', or 'torsion'.",
        rubricNote: "Choose one term you can reuse in mechanics and materials discussion.",
        matchGroups: [["stress-strain", "bending moment", "torsion"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why engineers should examine loading conditions carefully before accepting a strength-of-materials calculation.",
  },
  {
    groupId: "transport-mit-public-transport-systems",
    majorId: "mechanical-engineering-transportation",
    resourceType: "lecture",
    accent: "american",
    speakerRegion: "north-america",
    title: "Lecture 1: Introduction to Public Transportation Systems",
    source:
      "MIT OpenCourseWare course on bus and rail service design, performance monitoring, and transport planning.",
    sourceName: "MIT OpenCourseWare",
    speakerRole: "MIT course lecture",
    scenario:
      "Transport-systems lecture on bus and rail operations, route design, scheduling, and service performance.",
    transcript:
      "The course examines public transportation as a system that depends on planning, operations, and measurement rather than vehicles alone. It covers bus and rail service design, performance monitoring, scheduling, and policy decisions such as pricing. The central message is that transport engineers need data-informed planning to improve reliability, capacity, and passenger experience.",
    officialUrl:
      "https://ocw.mit.edu/courses/1-258j-public-transportation-systems-spring-2017/resources/lecture-1-introduction/",
    embedUrl: "https://www.youtube.com/embed/wzB8Rhm3xCU",
    videoSrc: "https://archive.org/download/MIT1.258JS17/MIT1_258JS17_lec01_300k.mp4",
    thumbnailUrl: buildYouTubeThumbnail("wzB8Rhm3xCU"),
    recommendedLevel: "B2",
    durationLabel: "MIT OCW lecture",
    supportFocus:
      "Track how the lecture connects operations, monitoring, and service planning in one transport system.",
    notePrompts: [
      "Which transport modes does the course discuss?",
      "What operational or planning tasks appear in the lecture frame?",
      "Why does the lecturer emphasise measurement and data?",
      "Which transport-planning term should stay in your notes?",
    ],
    vocabulary: [
      { term: "route design", definition: "planning where and how a transport service runs" },
      { term: "headway", definition: "the time gap between consecutive public transport vehicles" },
      {
        term: "performance monitoring",
        definition: "tracking service quality and operations using measured indicators",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the transport course?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The course explains how public transportation systems are planned, operated, and monitored across bus and rail services.",
        rubricNote: "Mention both the modes and the system-level planning or operations focus.",
        matchGroups: [["public transport", "bus", "rail"], ["planning", "operated", "monitored"]],
      },
      {
        id: "detail",
        prompt: "Which planning or operational tasks does the lecture frame include?",
        placeholder: "Name one or two examples.",
        modelAnswer:
          "A strong answer includes route design, scheduling, performance monitoring, or pricing-related decisions.",
        rubricNote: "Choose specific service-planning tasks.",
        matchGroups: [["route", "schedule", "pricing"], ["performance", "monitoring"]],
      },
      {
        id: "signpost",
        prompt: "Why does the speaker emphasise data-informed planning?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because better measurement helps engineers improve reliability, capacity, and passenger service decisions.",
        rubricNote: "Connect data to operational improvement.",
        matchGroups: [["data", "measurement"], ["reliability", "capacity", "service"]],
      },
      {
        id: "term",
        prompt: "Which transport-planning term should you keep from this course?",
        placeholder: "Write one technical term.",
        modelAnswer:
          "A correct term is 'route design', 'headway', or 'performance monitoring'.",
        rubricNote: "Choose a term useful for public-transport operations discussion.",
        matchGroups: [["route design", "headway", "performance monitoring"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why transport planners need both operational data and service-design thinking to improve a public transport corridor.",
  },
  {
    groupId: "transport-nptel-transportation-engineering",
    majorId: "mechanical-engineering-transportation",
    resourceType: "lecture",
    accent: "indian",
    speakerRegion: "asia",
    title: "Introduction to Geographic Information Systems",
    source:
      "Archived NPTEL lecture on spatial data, map layers, and GIS reasoning used in transport and infrastructure planning.",
    sourceName: "NPTEL Archive",
    speakerRole: "NPTEL course lecture",
    scenario:
      "Indian English lecture on spatial data, map layers, and how GIS supports route analysis and infrastructure planning.",
    transcript:
      "The lecture introduces GIS as a framework for working with spatial data, map layers, and georeferenced analysis rather than as simple digital cartography. It explains that engineers use GIS to combine location-based evidence with planning questions such as routes, accessibility, and infrastructure management. A central takeaway is that transport decisions become clearer when spatial datasets are organised into interpretable layers and attributes.",
    officialUrl: "https://onlinecourses-archive.nptel.ac.in/noc18_ce10/",
    embedUrl: "https://www.youtube.com/embed/WYy-owOcFsY?rel=0",
    thumbnailUrl: buildYouTubeThumbnail("WYy-owOcFsY"),
    audioSrc: "/audio/listening/transport-nptel-transportation-engineering.m4a",
    recommendedLevel: "B1",
    durationLabel: "NPTEL archive lecture",
    supportFocus:
      "Listen for how the lecturer connects spatial layers, attributes, and practical transport-planning questions.",
    notePrompts: [
      "Which kinds of spatial data or map layers are introduced first?",
      "How does the lecturer connect GIS with planning questions?",
      "Why do organised layers and attributes matter in analysis?",
      "Which GIS term should stay in your notes?",
    ],
    vocabulary: [
      {
        term: "spatial data",
        definition: "information that describes objects or events by their geographic location",
      },
      {
        term: "georeferencing",
        definition: "aligning data with real-world coordinates so it can be mapped and analysed spatially",
      },
      {
        term: "attribute table",
        definition: "the structured data attached to mapped features that stores their descriptive properties",
      },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the GIS lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The lecture explains how GIS organises spatial data and map layers so engineers can analyse route, accessibility, and infrastructure problems.",
        rubricNote: "Mention both GIS data organisation and planning use.",
        matchGroups: [["gis", "spatial"], ["layer", "route", "infrastructure", "planning"]],
      },
      {
        id: "detail",
        prompt: "Which GIS elements does the lecturer say engineers work with?",
        placeholder: "Write one short answer.",
        modelAnswer:
          "A strong answer mentions spatial data, map layers, coordinates, or attribute tables.",
        rubricNote: "Choose GIS data components rather than only saying 'maps'.",
        matchGroups: [["spatial", "layer", "map"], ["attribute", "coordinate", "data"]],
      },
      {
        id: "signpost",
        prompt: "Why does the lecture emphasise organised layers and attributes?",
        placeholder: "Write one practical reason.",
        modelAnswer:
          "Because structured spatial datasets make route and infrastructure decisions easier to analyse, compare, and explain.",
        rubricNote: "Connect data organisation to planning decisions.",
        matchGroups: [["layer", "attribute", "dataset"], ["route", "plan", "analysis", "decision"]],
      },
      {
        id: "term",
        prompt: "Which GIS term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer:
          "A correct term is 'spatial data', 'georeferencing', or 'attribute table'.",
        rubricNote: "Choose one GIS term you can reuse in transport-planning discussion.",
        matchGroups: [["spatial data", "georeferencing", "attribute table"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why transport planners need organised spatial data, not only visual maps, when evaluating a route or infrastructure corridor.",
  },
];

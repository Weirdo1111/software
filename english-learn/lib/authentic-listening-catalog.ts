import type { CEFRLevel } from "@/types/learning";

export type AuthenticMajorId =
  | "civil-engineering"
  | "mathematics"
  | "computing-science"
  | "mechanical-engineering"
  | "mechanical-engineering-transportation";

export type AuthenticAccent = "british" | "american" | "global";
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

function buildYouTubeUrls(videoId: string) {
  return {
    officialUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

export const authenticListeningBlueprints: AuthenticListeningBlueprint[] = [
  {
    groupId: "civil-bridge-maintenance-cambridge",
    majorId: "civil-engineering",
    resourceType: "lecture",
    accent: "british",
    speakerRegion: "british",
    title: "The future of bridge maintenance?",
    source: "Public infrastructure lecture on bridge inspection and maintenance strategy.",
    sourceName: "Cambridge CSIC",
    speakerRole: "Infrastructure lecture",
    scenario:
      "Public lecture listening on bridge maintenance, monitoring data, and value-based infrastructure decisions.",
    transcript:
      "The lecture explains that bridge maintenance should move away from reactive repair and toward planned intervention. It highlights how inspection records, structural monitoring, and digital tools help engineers prioritize limited budgets. A central message is that better data leads to safer bridges and more defensible maintenance decisions.",
    recommendedLevel: "B1",
    durationLabel: "Recorded lecture",
    supportFocus:
      "Track how the speaker connects inspection data, prioritisation, and long-term asset management.",
    notePrompts: [
      "What maintenance problem is the lecture trying to solve?",
      "Which kinds of data support bridge decisions?",
      "What benefit comes from prioritising maintenance earlier?",
      "Which infrastructure term should stay in your notes?",
    ],
    vocabulary: [
      { term: "asset management", definition: "planning how infrastructure is monitored, maintained, and renewed over time" },
      { term: "inspection record", definition: "documented evidence collected during a structural check" },
      { term: "prioritisation", definition: "ranking tasks so the most urgent work happens first" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main purpose of the lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The lecture argues that bridge maintenance should be data-led and prioritised before damage becomes more serious.",
        rubricNote: "Mention both maintenance strategy and the role of data.",
        matchGroups: [["bridge", "maintenance"], ["data", "monitoring", "inspection"], ["priorit", "plan", "strategy"]],
      },
      {
        id: "detail",
        prompt: "Which kinds of evidence does the speaker use to support maintenance decisions?",
        placeholder: "Name one or two sources of evidence.",
        modelAnswer: "A strong answer includes inspection records, monitoring data, or digital models.",
        rubricNote: "The answer should point to engineering evidence rather than only a budget issue.",
        matchGroups: [["inspection", "records"], ["monitor", "data", "digital"]],
      },
      {
        id: "signpost",
        prompt: "Why does the speaker say earlier prioritisation matters?",
        placeholder: "Write one practical reason.",
        modelAnswer: "It helps engineers use limited budgets better and improve long-term bridge safety.",
        rubricNote: "Connect early action to both safety and planning quality.",
        matchGroups: [["budget", "limited"], ["safe", "safety", "long term", "planning"]],
      },
      {
        id: "term",
        prompt: "Which civil-engineering term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'asset management' or 'prioritisation'.",
        rubricNote: "Keep one reusable infrastructure term for later seminar discussions.",
        matchGroups: [["asset management", "prioritisation"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how data-driven bridge maintenance could reduce risk and improve budget decisions in a local authority.",
    ...buildYouTubeUrls("dJMNL4Lzo6s"),
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
    accent: "british",
    speakerRegion: "british",
    title: "Chance, luck, and ignorance: how to put our uncertainty into numbers",
    source: "Oxford public lecture on probability, uncertainty, and risk.",
    sourceName: "Oxford Mathematics",
    speakerRole: "Public lecture speaker",
    speakerName: "David Spiegelhalter",
    scenario:
      "Public mathematics lecture on probability, uncertainty, and how quantitative thinking can describe risk.",
    transcript:
      "The lecture asks how people can reason more clearly about chance and uncertainty. It shows that probability can be used to express what we do not know, not only what we can predict. A key message is that numerical uncertainty should be judged carefully and communicated in plain language.",
    recommendedLevel: "B1",
    durationLabel: "60 min public lecture",
    supportFocus:
      "Track how the lecture connects abstract probability ideas with everyday judgement and decision-making.",
    notePrompts: [
      "What does the speaker want probability to help us do?",
      "How does he connect uncertainty with numbers?",
      "Why is plain-language explanation important?",
      "Which mathematics term should stay in your notes?",
    ],
    vocabulary: [
      { term: "probability", definition: "a numerical way to describe how likely an event is" },
      { term: "uncertainty", definition: "a situation in which the outcome or the information is not fully known" },
      { term: "risk", definition: "the possibility of loss, harm, or an unwanted outcome" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main message of the lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The lecture argues that probability helps us describe uncertainty more clearly and make better judgements about risk.",
        rubricNote: "Mention both uncertainty and the value of numerical reasoning.",
        matchGroups: [["probability"], ["uncertainty"], ["risk", "judgement", "numbers"]],
      },
      {
        id: "detail",
        prompt: "What does the speaker say we can put into numbers?",
        placeholder: "Write one short answer.",
        modelAnswer: "He says we can put our uncertainty or ignorance into numbers.",
        rubricNote: "This is one of the clearest framing ideas in the lecture title.",
        matchGroups: [["uncertainty", "ignorance"], ["numbers"]],
      },
      {
        id: "signpost",
        prompt: "Why does the lecture also stress plain-language explanation?",
        placeholder: "Write one reason.",
        modelAnswer: "Because numbers alone are not enough; people need to understand what the uncertainty actually means.",
        rubricNote: "Link the mathematics to communication rather than calculation only.",
        matchGroups: [["plain", "language", "explain"], ["understand", "means"]],
      },
      {
        id: "term",
        prompt: "Which mathematical term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'probability', 'uncertainty', or 'risk'.",
        rubricNote: "Choose one core term you can reuse in statistics and modelling tasks.",
        matchGroups: [["probability", "uncertainty", "risk"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how mathematics can help students talk about uncertainty more clearly in real decisions.",
    ...buildYouTubeUrls("Cybnip2Kyw0"),
  },
  {
    groupId: "maths-ai-science-oxford",
    majorId: "mathematics",
    resourceType: "lecture",
    accent: "global",
    speakerRegion: "other",
    title: "The Potential for AI in Science and Mathematics",
    source: "Oxford public lecture on AI, scientific discovery, and mathematical reasoning.",
    sourceName: "Oxford Mathematics",
    speakerRole: "Public lecture speaker",
    speakerName: "Terence Tao",
    scenario:
      "Interdisciplinary lecture listening on how AI tools may support scientific discovery and mathematical research.",
    transcript:
      "The lecture explores where AI may help with research in science and mathematics. It suggests that AI can assist with pattern finding, problem exploration, and collaboration with human experts. At the same time, the speaker treats AI as a tool that still needs careful interpretation and mathematical judgement.",
    recommendedLevel: "B2",
    durationLabel: "60 min public lecture",
    supportFocus:
      "Follow an interdisciplinary argument about AI support, research practice, and the continued role of human reasoning.",
    notePrompts: [
      "What kinds of research tasks might AI support?",
      "What role still belongs to human judgement?",
      "How is mathematics connected to AI development here?",
      "Which AI or mathematics term should stay in your notes?",
    ],
    vocabulary: [
      { term: "pattern finding", definition: "identifying meaningful structure or repetition in complex information" },
      { term: "reasoning", definition: "the process of drawing conclusions from evidence or logic" },
      { term: "interpretation", definition: "explaining what a result means in context" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The lecture examines how AI could support science and mathematics while still relying on human reasoning and interpretation.",
        rubricNote: "Mention both AI support and the continuing role of people.",
        matchGroups: [["ai"], ["science", "mathematics"], ["human", "reasoning", "interpretation"]],
      },
      {
        id: "detail",
        prompt: "Which kinds of research work does the speaker say AI may help with?",
        placeholder: "Name one or two tasks.",
        modelAnswer: "A strong answer includes pattern finding, exploring problems, or helping with scientific discovery.",
        rubricNote: "Capture a concrete research use rather than a vague idea of 'help'.",
        matchGroups: [["pattern", "problem", "discovery", "explor"]],
      },
      {
        id: "signpost",
        prompt: "What still needs human judgement according to the lecture?",
        placeholder: "Write one short answer.",
        modelAnswer: "Interpretation and mathematical reasoning still need human judgement.",
        rubricNote: "The answer should show that AI is presented as a tool, not a replacement.",
        matchGroups: [["human"], ["judgement", "interpretation", "reasoning"]],
      },
      {
        id: "term",
        prompt: "Which interdisciplinary term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'reasoning', 'interpretation', or 'pattern finding'.",
        rubricNote: "Choose a term that connects mathematical thinking with AI use.",
        matchGroups: [["reasoning", "interpretation", "pattern"]],
      },
    ],
    followUpTask:
      "Use your notes to explain one way AI could help mathematics students without replacing genuine problem-solving.",
    ...buildYouTubeUrls("_sTDSO74D8Q"),
  },
  {
    groupId: "computing-software-changing-stanford",
    majorId: "computing-science",
    resourceType: "lecture",
    accent: "global",
    speakerRegion: "north-america",
    title: "Software Is Changing (Again)",
    source: "Stanford CS25 lecture on modern software development and AI systems.",
    sourceName: "Stanford CS25",
    speakerRole: "Guest lecture speaker",
    speakerName: "Andrej Karpathy",
    scenario:
      "Advanced computing lecture on how AI is changing software development, interfaces, and engineering workflows.",
    transcript:
      "The lecture argues that software is changing because engineers now build around models as well as code. It suggests that prompting, orchestration, and human review are becoming part of the software stack. The speaker frames this shift as a new way of thinking about products, tooling, and developer workflows.",
    recommendedLevel: "B2",
    durationLabel: "Stanford guest lecture",
    supportFocus:
      "Track how the speaker redefines software development around models, prompts, and system design choices.",
    notePrompts: [
      "Why does the speaker say software is changing again?",
      "What new layer is added to the software stack?",
      "How do prompts or models affect engineering work?",
      "Which computing term should stay in your notes?",
    ],
    vocabulary: [
      { term: "orchestration", definition: "coordinating multiple system steps or tools into one workflow" },
      { term: "prompting", definition: "giving an AI system instructions or context to shape its output" },
      { term: "workflow", definition: "the sequence of tasks used to complete technical work" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main message of the lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The lecture argues that software engineering is changing because products now combine code with AI models, prompting, and review workflows.",
        rubricNote: "Mention the shift from code-only thinking to model-based systems.",
        matchGroups: [["software"], ["changing"], ["models", "prompt", "workflow", "code"]],
      },
      {
        id: "detail",
        prompt: "Which new software layer does the speaker emphasise?",
        placeholder: "Write one or two short phrases.",
        modelAnswer: "A strong answer includes prompting, orchestration, or model-based system design.",
        rubricNote: "Name the engineering layer rather than only saying 'AI'.",
        matchGroups: [["prompt", "orchestration", "model"]],
      },
      {
        id: "signpost",
        prompt: "How does this change affect engineering work?",
        placeholder: "Write one practical effect.",
        modelAnswer: "It changes how developers design workflows, review outputs, and build products around model behaviour.",
        rubricNote: "The answer should point to development practice, not only technology hype.",
        matchGroups: [["workflow", "review", "product", "developer"]],
      },
      {
        id: "term",
        prompt: "Which computing term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'orchestration', 'prompting', or 'workflow'.",
        rubricNote: "Choose one term that you can reuse in software-systems discussion.",
        matchGroups: [["orchestration", "prompting", "workflow"]],
      },
    ],
    followUpTask:
      "Use your notes to explain how model-based workflows could change the way a student team builds software for a real user.",
    ...buildYouTubeUrls("XfpMkf4rD6E"),
  },
  {
    groupId: "computing-ai-healthcare-stanford",
    majorId: "computing-science",
    resourceType: "lecture",
    accent: "american",
    speakerRegion: "north-america",
    title: "AI + Healthcare",
    source: "Stanford course lecture on applied AI in healthcare.",
    sourceName: "Stanford CS230",
    speakerRole: "Course lecture",
    scenario:
      "Academic lecture listening on machine learning in healthcare, applied AI workflows, and real-world deployment limits.",
    transcript:
      "This lecture examines how AI methods can be applied to healthcare problems. It focuses on the importance of data quality, evaluation, and safety when models are used in medical settings. A recurring idea is that machine-learning performance must be connected to real decision-making and real human impact.",
    recommendedLevel: "B2",
    durationLabel: "Course lecture",
    supportFocus:
      "Listen for how the lecture links models, data quality, evaluation, and responsible deployment in healthcare.",
    notePrompts: [
      "What healthcare problem space does the lecture focus on?",
      "Why is data quality important here?",
      "What makes deployment in healthcare different from other settings?",
      "Which AI term should stay in your notes?",
    ],
    vocabulary: [
      { term: "evaluation", definition: "checking how well a model or method performs on a task" },
      { term: "deployment", definition: "putting a model or system into real use" },
      { term: "data quality", definition: "how complete, accurate, and useful a dataset is for analysis" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the lecture?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The lecture focuses on applying AI to healthcare while paying close attention to data quality, evaluation, and safe deployment.",
        rubricNote: "Mention both application and responsibility.",
        matchGroups: [["ai"], ["healthcare"], ["data", "evaluation", "deployment", "safe"]],
      },
      {
        id: "detail",
        prompt: "Which technical factor does the lecture stress before real-world use?",
        placeholder: "Write one or two short answers.",
        modelAnswer: "A strong answer includes data quality or careful evaluation.",
        rubricNote: "Choose a concrete technical factor rather than only saying 'accuracy'.",
        matchGroups: [["data quality", "data"], ["evaluation", "safe"]],
      },
      {
        id: "signpost",
        prompt: "Why is deployment in healthcare treated carefully?",
        placeholder: "Write one reason.",
        modelAnswer: "Because AI decisions in healthcare affect real people and must be reliable in practice.",
        rubricNote: "Connect technical performance to human impact.",
        matchGroups: [["real people", "human"], ["reliable", "practice", "safe"]],
      },
      {
        id: "term",
        prompt: "Which applied-AI term should you keep from this lecture?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'deployment', 'evaluation', or 'data quality'.",
        rubricNote: "Choose a term that matters in both class projects and real AI systems.",
        matchGroups: [["deployment", "evaluation", "data quality"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why computing students should care about evaluation and deployment, not just model accuracy.",
    ...buildYouTubeUrls("IM9ANAbufYM"),
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
    accent: "global",
    speakerRegion: "asia",
    title: "Carbon Management in the Highway Sector: Toward Data Trustworthiness",
    source: "Cambridge infrastructure talk on highway decarbonisation and trusted transport data.",
    sourceName: "Cambridge CSIC",
    speakerRole: "Research talk speaker",
    speakerName: "Dr Jinying Xu",
    scenario:
      "Transport systems lecture on highway-sector carbon management, trusted data, and infrastructure decarbonisation.",
    transcript:
      "The talk connects transport decarbonisation with better data management in the highway sector. It suggests that trustworthy data is necessary for measuring carbon, comparing interventions, and guiding policy or engineering decisions. A key point is that carbon management becomes stronger when transport data is consistent and credible.",
    recommendedLevel: "B2",
    durationLabel: "Research talk",
    supportFocus:
      "Track how the speaker links carbon reduction targets with data quality, trust, and transport decision-making.",
    notePrompts: [
      "What is the main decarbonisation challenge in the highway sector?",
      "Why does the speaker stress trustworthy data?",
      "How can transport data shape engineering decisions?",
      "Which transport term should stay in your notes?",
    ],
    vocabulary: [
      { term: "decarbonisation", definition: "reducing carbon emissions from a system or activity" },
      { term: "carbon management", definition: "measuring and reducing emissions through planning and monitoring" },
      { term: "data trustworthiness", definition: "the degree to which data is reliable enough to support decisions" },
    ],
    questions: [
      {
        id: "gist",
        prompt: "What is the main focus of the talk?",
        placeholder: "Write the main idea in one or two sentences.",
        modelAnswer:
          "The talk explains how highway decarbonisation depends on trustworthy transport data and better carbon management decisions.",
        rubricNote: "Mention both decarbonisation and trusted data.",
        matchGroups: [["highway", "transport"], ["decarbon", "carbon management"], ["data", "trust"]],
      },
      {
        id: "detail",
        prompt: "What kind of data quality does the speaker say transport teams need?",
        placeholder: "Write one short phrase.",
        modelAnswer: "They need trustworthy or credible data that can support comparison and decision-making.",
        rubricNote: "The answer should describe the quality of the data, not only its existence.",
        matchGroups: [["trust", "credible", "reliable"], ["data"]],
      },
      {
        id: "signpost",
        prompt: "Why does the speaker connect data with carbon reduction?",
        placeholder: "Write one practical reason.",
        modelAnswer: "Because transport teams need reliable evidence to measure emissions and choose effective interventions.",
        rubricNote: "Connect data to action, not only measurement.",
        matchGroups: [["measure", "emissions", "carbon"], ["choose", "interventions", "decisions"]],
      },
      {
        id: "term",
        prompt: "Which transport term should you keep from this talk?",
        placeholder: "Write one technical term.",
        modelAnswer: "A correct term is 'decarbonisation', 'carbon management', or 'data trustworthiness'.",
        rubricNote: "Choose a term that helps in policy and transport-systems discussions.",
        matchGroups: [["decarbonisation", "carbon management", "data trustworthiness"]],
      },
    ],
    followUpTask:
      "Use your notes to explain why transport decarbonisation plans should include both engineering changes and stronger data systems.",
    ...buildYouTubeUrls("FirhF6bM0uw"),
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
];

import { listeningMajors } from "@/lib/listening-materials";
import type {
  CEFRLevel,
  DIICSUMajorId,
  SpeakingDifficulty,
  SpeakingPrompt,
  SpeakingScenarioCategory,
} from "@/types/learning";

<<<<<<< Updated upstream
function getMajorLabel(majorId: DIICSUMajorId) {
  return listeningMajors.find((major) => major.id === majorId)?.label ?? majorId;
}

function getCategoryLabel(category: SpeakingScenarioCategory) {
  switch (category) {
    case "major-study":
      return "Major study";
    case "academic-discussion":
      return "Academic discussion";
    default:
      return "Campus life";
  }
=======
export const speakingPromptMajors = listeningMajors;

export const speakingDifficultyOptions: Array<{ id: SpeakingDifficulty; label: string }> = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

export const speakingCategoryLabels: Record<SpeakingScenarioCategory, string> = {
  "major-study": "Major study",
  "academic-discussion": "Academic discussion",
  "campus-life": "Campus life",
};

export const speakingScenarioOptions: Array<{ id: SpeakingScenarioCategory; label: string }> = [
  { id: "major-study", label: speakingCategoryLabels["major-study"] },
  { id: "academic-discussion", label: speakingCategoryLabels["academic-discussion"] },
  { id: "campus-life", label: speakingCategoryLabels["campus-life"] },
];

function getMajorLabel(majorId: DIICSUMajorId) {
  return speakingPromptMajors.find((major) => major.id === majorId)?.label ?? majorId;
>>>>>>> Stashed changes
}

function createPrompt({
  id,
  difficulty,
  majorId,
  category,
  title,
  scenario,
  prompt,
  responseTimeSec,
  skillFocus,
  partnerRole,
  partnerGoal,
  usefulPhrases,
  checkpoints,
  sampleOpening,
}: {
  id: string;
  difficulty: SpeakingDifficulty;
  majorId: DIICSUMajorId;
  category: SpeakingScenarioCategory;
  title: string;
  scenario: string;
  prompt: string;
  responseTimeSec: number;
  skillFocus: string;
  partnerRole: string;
  partnerGoal: string;
  usefulPhrases: string[];
  checkpoints: string[];
  sampleOpening: string;
}): SpeakingPrompt {
  return {
    id,
    difficulty,
    major_id: majorId,
    major_label: getMajorLabel(majorId),
    category,
<<<<<<< Updated upstream
    category_label: getCategoryLabel(category),
=======
    category_label: speakingCategoryLabels[category],
>>>>>>> Stashed changes
    title,
    scenario,
    prompt,
    response_time_sec: responseTimeSec,
    skill_focus: skillFocus,
    partner_role: partnerRole,
    partner_goal: partnerGoal,
    useful_phrases: usefulPhrases,
    checkpoints,
    sample_opening: sampleOpening,
  };
}

// Date: 2026/3/18
// Author: Tianbo Cao
<<<<<<< Updated upstream
// Rebuilt the speaking prompt bank around DIICSU majors, simpler difficulty bands, and freshman-relevant scenarios.
=======
// Rebuilt the speaking bank around DIICSU majors, three difficulty bands, and a wider mix of study, discussion, and campus scenarios.
>>>>>>> Stashed changes
export const speakingPrompts: SpeakingPrompt[] = [
  createPrompt({
    id: "civil-low-campus-route",
    difficulty: "low",
    majorId: "civil-engineering",
    category: "campus-life",
    title: "Find the survey room",
    scenario: "Orientation week",
    prompt: "Explain to a new civil engineering classmate how to find the surveying room and why arriving early helps.",
    responseTimeSec: 45,
    skillFocus: "Give one clear suggestion with one reason.",
    partnerRole: "new civil engineering classmate",
    partnerGoal: "understand a simple campus instruction clearly",
    usefulPhrases: ["You should...", "It is in...", "It helps because..."],
    checkpoints: ["Give one clear direction.", "Add one reason.", "Finish with one useful reminder."],
<<<<<<< Updated upstream
    sampleOpening: "You should go to the engineering building early because the surveying room is on the second floor and it is easy to miss.",
=======
    sampleOpening:
      "You should go to the engineering building early because the surveying room is on the second floor and it is easy to miss.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "civil-medium-drainage-brief",
    difficulty: "medium",
    majorId: "civil-engineering",
    category: "major-study",
    title: "Drainage inspection priority",
    scenario: "Lab briefing",
    prompt: "Explain which area of a campus drainage system should be checked first after heavy rain and why.",
    responseTimeSec: 60,
    skillFocus: "State one priority and support it with a reason and one detail.",
    partnerRole: "lab partner",
    partnerGoal: "decide which inspection task to prioritise",
    usefulPhrases: ["I would check... first", "The main reason is...", "A clear sign is..."],
    checkpoints: ["Name one priority area.", "Give one engineering reason.", "Add one concrete sign or detail."],
<<<<<<< Updated upstream
    sampleOpening: "I would check the drainage outlet first because blocked flow there can quickly affect the whole site after heavy rain.",
=======
    sampleOpening:
      "I would check the drainage outlet first because blocked flow there can quickly affect the whole site after heavy rain.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "civil-medium-report-discussion",
    difficulty: "medium",
    majorId: "civil-engineering",
    category: "academic-discussion",
    title: "Group report or individual report",
    scenario: "Tutorial discussion",
    prompt: "Discuss whether first-year engineering fieldwork should be assessed through group reports or individual reports.",
    responseTimeSec: 70,
    skillFocus: "Take a view and compare one advantage with one concern.",
    partnerRole: "tutorial classmate",
    partnerGoal: "hear a balanced opinion about assessment",
    usefulPhrases: ["I think... is better", "One advantage is...", "However, ..."],
    checkpoints: ["State a clear view.", "Give one advantage.", "Mention one limitation or concern."],
<<<<<<< Updated upstream
    sampleOpening: "I think group reports are better for first-year fieldwork because students can compare observations, although weaker students may contribute less.",
=======
    sampleOpening:
      "I think group reports are better for first-year fieldwork because students can compare observations, although weaker students may contribute less.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "civil-high-flood-design",
    difficulty: "high",
    majorId: "civil-engineering",
    category: "major-study",
    title: "Flood-resilient campus design",
    scenario: "Mini design presentation",
    prompt: "Recommend one flood-resilient design improvement for a university campus and justify why it should be funded first.",
    responseTimeSec: 90,
    skillFocus: "Present a recommendation, justify it, and anticipate one challenge.",
    partnerRole: "project tutor",
    partnerGoal: "judge whether the design recommendation is well justified",
    usefulPhrases: ["I recommend...", "This should be prioritised because...", "One challenge is..."],
    checkpoints: ["Make one direct recommendation.", "Justify the funding priority.", "Address one implementation challenge."],
<<<<<<< Updated upstream
    sampleOpening: "I recommend upgrading surface drainage near teaching buildings because this would reduce repeated flooding and protect the busiest parts of campus first.",
=======
    sampleOpening:
      "I recommend upgrading surface drainage near teaching buildings because this would reduce repeated flooding and protect the busiest parts of campus first.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "math-low-study-group",
    difficulty: "low",
    majorId: "mathematics",
    category: "campus-life",
    title: "Invite a classmate to revise",
    scenario: "Library conversation",
    prompt: "Invite a new mathematics student to join a revision group and explain how it could help before a quiz.",
    responseTimeSec: 45,
    skillFocus: "Make one invitation with one practical benefit.",
    partnerRole: "new mathematics classmate",
    partnerGoal: "decide whether to join the revision group",
    usefulPhrases: ["Would you like to...", "It could help because...", "We can..."],
    checkpoints: ["Make a clear invitation.", "Give one benefit.", "Mention one activity the group can do."],
<<<<<<< Updated upstream
    sampleOpening: "Would you like to join our revision group because we usually solve quiz questions together before class tests?",
=======
    sampleOpening:
      "Would you like to join our revision group because we usually solve quiz questions together before class tests?",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "math-medium-graph-trend",
    difficulty: "medium",
    majorId: "mathematics",
    category: "major-study",
    title: "Explain a graph trend",
    scenario: "Statistics tutorial",
    prompt: "Explain the main trend in a simple data graph and say what conclusion a first-year class could draw from it.",
    responseTimeSec: 60,
    skillFocus: "Describe one trend clearly and interpret it carefully.",
    partnerRole: "statistics tutor",
    partnerGoal: "check whether the learner can link data with meaning",
    usefulPhrases: ["The graph shows...", "The main trend is...", "This suggests that..."],
    checkpoints: ["Describe the trend clearly.", "Use one data-focused phrase.", "Give one careful conclusion."],
<<<<<<< Updated upstream
    sampleOpening: "The graph shows a steady increase in attendance, and this suggests that students respond well to regular weekly reminders.",
=======
    sampleOpening:
      "The graph shows a steady increase in attendance, and this suggests that students respond well to regular weekly reminders.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "math-medium-calculator-debate",
    difficulty: "medium",
    majorId: "mathematics",
    category: "academic-discussion",
    title: "Calculator use in exams",
    scenario: "Seminar discussion",
    prompt: "Discuss whether calculators should be limited in first-year mathematics exams.",
    responseTimeSec: 70,
    skillFocus: "Present a position and support it with one educational reason.",
    partnerRole: "seminar partner",
    partnerGoal: "hear a reasoned view on assessment fairness",
    usefulPhrases: ["My view is that...", "This matters because...", "At the same time..."],
    checkpoints: ["State one direct position.", "Support it with one reason.", "Acknowledge one other side briefly."],
<<<<<<< Updated upstream
    sampleOpening: "My view is that calculators should be limited in some exams because students still need to show core reasoning without over-relying on technology.",
=======
    sampleOpening:
      "My view is that calculators should be limited in some exams because students still need to show core reasoning without over-relying on technology.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "math-high-model-assumption",
    difficulty: "high",
    majorId: "mathematics",
    category: "major-study",
    title: "Justify a modelling assumption",
    scenario: "Methods presentation",
    prompt: "Explain one assumption in a mathematical model and justify why it is useful even if it simplifies reality.",
    responseTimeSec: 90,
    skillFocus: "Explain an assumption, justify it, and note one limitation.",
    partnerRole: "methods lecturer",
    partnerGoal: "test whether the learner can speak cautiously about modelling choices",
    usefulPhrases: ["This model assumes...", "This is useful because...", "However, it may not..."],
    checkpoints: ["State the assumption clearly.", "Explain why it helps the model.", "Mention one limitation."],
<<<<<<< Updated upstream
    sampleOpening: "This model assumes stable travel demand, which is useful because it makes the first analysis manageable, although real demand often changes over time.",
=======
    sampleOpening:
      "This model assumes stable travel demand, which is useful because it makes the first analysis manageable, although real demand often changes over time.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "cs-low-lab-intro",
    difficulty: "low",
    majorId: "computing-science",
    category: "campus-life",
    title: "Programming lab check-in",
    scenario: "First lab session",
    prompt: "Introduce yourself to a new programming lab partner and say how you like to work on coding tasks.",
    responseTimeSec: 45,
    skillFocus: "Introduce yourself with one preference and one reason.",
    partnerRole: "new lab partner",
    partnerGoal: "start a simple working conversation",
    usefulPhrases: ["I usually...", "I prefer...", "It helps me because..."],
    checkpoints: ["Introduce yourself clearly.", "State one work preference.", "Give one short reason."],
<<<<<<< Updated upstream
    sampleOpening: "I usually test code in small steps because it helps me find mistakes faster during lab work.",
=======
    sampleOpening:
      "I usually test code in small steps because it helps me find mistakes faster during lab work.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "cs-medium-bug-update",
    difficulty: "medium",
    majorId: "computing-science",
    category: "major-study",
    title: "Explain a bug fix plan",
    scenario: "Project stand-up",
    prompt: "Explain one bug in a group project and describe the next step you would take to fix it.",
    responseTimeSec: 60,
    skillFocus: "Describe one problem and one practical next action.",
    partnerRole: "project teammate",
    partnerGoal: "understand the bug and the next development step",
    usefulPhrases: ["The issue is...", "I found that...", "The next step is..."],
    checkpoints: ["Name the bug clearly.", "Explain its effect.", "Say what you will do next."],
<<<<<<< Updated upstream
    sampleOpening: "The issue is that the login form accepts the password but does not redirect the user, so my next step is to check the response handler in the client code.",
=======
    sampleOpening:
      "The issue is that the login form accepts the password but does not redirect the user, so my next step is to check the response handler in the client code.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "cs-medium-ai-coursework",
    difficulty: "medium",
    majorId: "computing-science",
    category: "academic-discussion",
    title: "AI tools in coursework",
    scenario: "Department discussion",
    prompt: "Discuss whether AI coding tools should be allowed in first-year coursework.",
    responseTimeSec: 70,
    skillFocus: "Give a position with one benefit and one risk.",
    partnerRole: "course representative",
    partnerGoal: "hear a balanced view on AI use in study",
    usefulPhrases: ["I think...", "One benefit is...", "A risk is..."],
    checkpoints: ["State one position.", "Give one benefit.", "Mention one clear risk."],
<<<<<<< Updated upstream
    sampleOpening: "I think AI coding tools can be useful because they give fast feedback, but they also create a risk if students stop thinking through the code for themselves.",
=======
    sampleOpening:
      "I think AI coding tools can be useful because they give fast feedback, but they also create a risk if students stop thinking through the code for themselves.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "cs-high-design-choice",
    difficulty: "high",
    majorId: "computing-science",
    category: "major-study",
    title: "Defend a system design choice",
    scenario: "Mini technical presentation",
    prompt: "Defend one design choice for a student app and explain why it is more suitable than an alternative.",
    responseTimeSec: 90,
    skillFocus: "Justify one design decision and compare it with an alternative.",
    partnerRole: "technical reviewer",
    partnerGoal: "test whether the learner can justify design trade-offs clearly",
    usefulPhrases: ["I chose...", "This is more suitable because...", "Compared with..."],
    checkpoints: ["State the design choice.", "Justify it with one clear reason.", "Compare it with one alternative."],
<<<<<<< Updated upstream
    sampleOpening: "I chose a simple web-based interface because it is easier for students to access on different devices than a platform-specific desktop tool.",
=======
    sampleOpening:
      "I chose a simple web-based interface because it is easier for students to access on different devices than a platform-specific desktop tool.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "mech-low-workshop-help",
    difficulty: "low",
    majorId: "mechanical-engineering",
    category: "campus-life",
    title: "Ask for workshop help",
    scenario: "Before a workshop class",
    prompt: "Explain one thing you are unsure about before a workshop session and ask a classmate for help politely.",
    responseTimeSec: 45,
    skillFocus: "State one problem and make one polite request.",
    partnerRole: "classmate in the workshop",
    partnerGoal: "understand what support the learner needs",
    usefulPhrases: ["I am not sure about...", "Could you show me...", "I want to check..."],
    checkpoints: ["Say what you are unsure about.", "Use a polite request.", "Mention what you need to do next."],
<<<<<<< Updated upstream
    sampleOpening: "I am not sure about the machine setup, so could you show me the first safety check before we start?",
=======
    sampleOpening:
      "I am not sure about the machine setup, so could you show me the first safety check before we start?",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "mech-medium-test-report",
    difficulty: "medium",
    majorId: "mechanical-engineering",
    category: "major-study",
    title: "Report a test result",
    scenario: "Materials lab",
    prompt: "Summarize one test result from a materials experiment and explain what it means for design choice.",
    responseTimeSec: 60,
    skillFocus: "State one result and connect it to one design implication.",
    partnerRole: "lab tutor",
    partnerGoal: "check whether the learner can interpret a test result clearly",
    usefulPhrases: ["The test showed...", "This means that...", "As a result..."],
    checkpoints: ["State the result clearly.", "Interpret the result.", "Connect it to one design decision."],
<<<<<<< Updated upstream
    sampleOpening: "The test showed that the lighter material deformed earlier, and this means it may not be the best choice for a part under repeated stress.",
=======
    sampleOpening:
      "The test showed that the lighter material deformed earlier, and this means it may not be the best choice for a part under repeated stress.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "mech-medium-sustainability-discussion",
    difficulty: "medium",
    majorId: "mechanical-engineering",
    category: "academic-discussion",
    title: "Cost or sustainability first",
    scenario: "Design tutorial",
    prompt: "Discuss whether first-year engineering design projects should prioritise low cost or sustainability.",
    responseTimeSec: 70,
    skillFocus: "Compare two priorities and support your preference.",
    partnerRole: "design teammate",
    partnerGoal: "hear a reasoned design priority choice",
    usefulPhrases: ["I would prioritise...", "The main reason is...", "At the same time..."],
    checkpoints: ["Choose one priority.", "Give one reason.", "Show awareness of the other factor."],
<<<<<<< Updated upstream
    sampleOpening: "I would prioritise sustainability because first-year projects should help students think long term, although cost still matters in real production.",
=======
    sampleOpening:
      "I would prioritise sustainability because first-year projects should help students think long term, although cost still matters in real production.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "mech-high-energy-pitch",
    difficulty: "high",
    majorId: "mechanical-engineering",
    category: "major-study",
    title: "Pitch an efficiency improvement",
    scenario: "Engineering proposal",
    prompt: "Propose one change that could improve energy efficiency in a mechanical system and justify why it is practical.",
    responseTimeSec: 90,
    skillFocus: "Propose a change, justify it, and mention one practical constraint.",
    partnerRole: "project supervisor",
    partnerGoal: "judge whether the proposal is realistic and well justified",
    usefulPhrases: ["I propose...", "This would improve...", "One practical limit is..."],
    checkpoints: ["Make one direct proposal.", "Justify the expected improvement.", "Mention one practical constraint."],
<<<<<<< Updated upstream
    sampleOpening: "I propose improving insulation around the hot section of the system because this could reduce heat loss without completely redesigning the equipment.",
=======
    sampleOpening:
      "I propose improving insulation around the hot section of the system because this could reduce heat loss without completely redesigning the equipment.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "transport-low-bus-route",
    difficulty: "low",
    majorId: "mechanical-engineering-transportation",
    category: "campus-life",
    title: "Suggest a better bus route",
    scenario: "Student support meeting",
    prompt: "Suggest one way to improve a campus bus route for new students and explain why it would help.",
    responseTimeSec: 45,
    skillFocus: "Make one suggestion with one clear benefit.",
    partnerRole: "student volunteer",
    partnerGoal: "understand a simple transport suggestion",
    usefulPhrases: ["I suggest...", "It would help because...", "New students could..."],
    checkpoints: ["Make one clear suggestion.", "Explain one benefit.", "Keep the answer practical."],
<<<<<<< Updated upstream
    sampleOpening: "I suggest adding one stop near the library because new students often need to travel there between classes.",
=======
    sampleOpening:
      "I suggest adding one stop near the library because new students often need to travel there between classes.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "transport-medium-simulation-update",
    difficulty: "medium",
    majorId: "mechanical-engineering-transportation",
    category: "major-study",
    title: "Explain a delay pattern",
    scenario: "Simulation tutorial",
    prompt: "Explain one delay pattern from a basic transport simulation and what action it suggests.",
    responseTimeSec: 60,
    skillFocus: "Describe one pattern and link it to one transport action.",
    partnerRole: "tutorial partner",
    partnerGoal: "understand the main result of the simulation",
    usefulPhrases: ["The pattern shows...", "This suggests...", "A useful action is..."],
    checkpoints: ["Describe the delay pattern.", "Interpret the result.", "Suggest one action."],
<<<<<<< Updated upstream
    sampleOpening: "The pattern shows the longest delays near the final junction, and this suggests that signal timing should be adjusted there first.",
=======
    sampleOpening:
      "The pattern shows the longest delays near the final junction, and this suggests that signal timing should be adjusted there first.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "transport-medium-campus-cars",
    difficulty: "medium",
    majorId: "mechanical-engineering-transportation",
    category: "academic-discussion",
    title: "Should cars be limited on campus",
    scenario: "Seminar discussion",
    prompt: "Discuss whether private cars should be limited in the busiest parts of a university campus.",
    responseTimeSec: 70,
    skillFocus: "Take a position and support it with one safety or access argument.",
    partnerRole: "seminar classmate",
    partnerGoal: "hear a clear transport policy opinion",
    usefulPhrases: ["I think...", "One reason is...", "This could improve..."],
    checkpoints: ["State a direct position.", "Support it with one reason.", "Mention one impact on students or staff."],
<<<<<<< Updated upstream
    sampleOpening: "I think private cars should be limited in the busiest campus areas because this could improve safety and make walking routes less stressful for new students.",
=======
    sampleOpening:
      "I think private cars should be limited in the busiest campus areas because this could improve safety and make walking routes less stressful for new students.",
>>>>>>> Stashed changes
  }),
  createPrompt({
    id: "transport-high-mobility-policy",
    difficulty: "high",
    majorId: "mechanical-engineering-transportation",
    category: "major-study",
    title: "Respond to a mobility policy",
    scenario: "Policy briefing response",
    prompt: "Respond to a proposal for more shared transport on campus and explain whether it is the best long-term choice.",
    responseTimeSec: 90,
    skillFocus: "Evaluate a proposal, justify your view, and mention one trade-off.",
    partnerRole: "policy tutor",
    partnerGoal: "test whether the learner can evaluate transport policy critically",
    usefulPhrases: ["My view is that...", "In the long term...", "One trade-off is..."],
    checkpoints: ["Evaluate the proposal clearly.", "Justify the long-term view.", "Mention one trade-off."],
<<<<<<< Updated upstream
    sampleOpening: "My view is that shared transport should expand, but only if the system is reliable enough to replace short private car trips in the long term.",
=======
    sampleOpening:
      "My view is that shared transport should expand, but only if the system is reliable enough to replace short private car trips in the long term.",
>>>>>>> Stashed changes
  }),
];

export function mapCEFRToSpeakingDifficulty(level: CEFRLevel): SpeakingDifficulty {
  if (level === "A1" || level === "A2") return "low";
  if (level === "B1") return "medium";
  return "high";
}

export function getSpeakingPrompts({
  majorId,
  difficulty,
<<<<<<< Updated upstream
}: {
  majorId?: DIICSUMajorId;
  difficulty?: SpeakingDifficulty;
}) {
  return speakingPrompts.filter((prompt) => {
    if (majorId && prompt.major_id !== majorId) return false;
    if (difficulty && prompt.difficulty !== difficulty) return false;
=======
  category,
}: {
  majorId?: DIICSUMajorId;
  difficulty?: SpeakingDifficulty;
  category?: SpeakingScenarioCategory;
} = {}) {
  return speakingPrompts.filter((prompt) => {
    if (majorId && prompt.major_id !== majorId) return false;
    if (difficulty && prompt.difficulty !== difficulty) return false;
    if (category && prompt.category !== category) return false;
>>>>>>> Stashed changes
    return true;
  });
}

<<<<<<< Updated upstream
// Date: 2026/3/18
// Author: Tianbo Cao
// Keep a CEFR-compatible accessor while the UI is still being migrated to the new major and difficulty model.
=======
>>>>>>> Stashed changes
export function getSpeakingPromptsForLevel(level: CEFRLevel | SpeakingDifficulty) {
  const difficulty = level === "low" || level === "medium" || level === "high" ? level : mapCEFRToSpeakingDifficulty(level);
  return getSpeakingPrompts({ difficulty });
}

export function getSpeakingPromptById(id: string) {
  return speakingPrompts.find((prompt) => prompt.id === id) ?? null;
}

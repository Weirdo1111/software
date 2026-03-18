export type AcademicSkill = "listening" | "speaking" | "reading" | "writing";

export const platformSignals = [
  {
    label: "Audience",
    value: "Intermediate university students who need stronger academic performance.",
  },
  {
    label: "Logic",
    value: "Assessment first, then Low / Medium / High routing with matched content.",
  },
  {
    label: "Outcome",
    value: "Consistent gains across academic listening, speaking, reading, and writing.",
  },
] as const;

export const learnerJourney = [
  {
    step: "01",
    title: "Create or access account",
    detail: "Start with a simple learner profile and a clear explanation of the academic pathway.",
  },
  {
    step: "02",
    title: "Complete placement test",
    detail: "Use the initial questionnaire and skill checks to estimate the right difficulty band.",
  },
  {
    step: "03",
    title: "Assign proficiency band",
    detail: "Route each learner to Low, Medium, or High according to current academic English readiness.",
  },
  {
    step: "04",
    title: "Unlock matched content",
    detail: "Surface learning materials that match the learner's current support needs and challenge level.",
  },
  {
    step: "05",
    title: "Study across four skills",
    detail: "Work through listening, speaking, reading, and writing modules as one connected loop.",
  },
  {
    step: "06",
    title: "Track progress over time",
    detail: "Record minutes studied, module completion, and skill-specific evidence of growth.",
  },
  {
    step: "07",
    title: "Retake assessment",
    detail: "Allow reassessment after measurable improvement instead of locking users into one level.",
  },
  {
    step: "08",
    title: "Advance difficulty",
    detail: "Update the user band and unlock more demanding academic tasks when ready.",
  },
] as const;

export const levelBands = [
  {
    name: "Low",
    short: "Foundation band",
    summary: "More structure, simpler academic tasks, and heavy scaffolding for vocabulary and comprehension.",
    support: "Sentence frames, guided notes, modeled responses, and slower task pacing.",
    unlock: "Focus on confidence, academic routines, and core classroom language.",
    accentClass: "border-[#7ca7c8]/60 bg-[#edf5fb] text-[#14324b]",
    barClass: "bg-[#7ca7c8]",
  },
  {
    name: "Medium",
    short: "Core target band",
    summary: "Balanced practice for the main audience: intermediate learners building steady academic performance.",
    support: "Integrated note-taking, speaking rehearsal, text analysis, and paragraph-level writing.",
    unlock: "Default pathway for launch because it matches the agreed primary user group.",
    accentClass: "border-[#6a9483]/60 bg-[#edf6f1] text-[#1a493f]",
    barClass: "bg-[#6a9483]",
  },
  {
    name: "High",
    short: "Advanced band",
    summary: "More complex academic texts, higher language precision, and deeper output tasks.",
    support: "Faster pacing, synthesis tasks, seminar-style speaking, and critique-oriented writing.",
    unlock: "Unlock stretch content and more demanding evidence-based production tasks.",
    accentClass: "border-[#d88e34]/60 bg-[#fff4e4] text-[#7b4b14]",
    barClass: "bg-[#d88e34]",
  },
] as const;

export const learningModules = [
  {
    skill: "listening",
    title: "Academic Listening",
    focus: "Lecture signposting, note capture, and evidence detection.",
    summary: "Short lecture clips with note-taking prompts and instant comprehension checks.",
    deliverable: "Annotated lecture notes + gist summary",
    minutes: "18-22 min",
    progress: 72,
    href: "/lesson/A2-listening-starter",
    surfaceClass: "from-[#d7e8f7] via-white to-[#edf6fc]",
    badgeClass: "bg-[#14324b] text-white",
    progressClass: "bg-[#5f8fb7]",
  },
  {
    skill: "speaking",
    title: "Academic Speaking",
    focus: "Seminar response, pronunciation clarity, and spoken structure.",
    summary: "Guided discussion turns, shadowing, and AI-supported fluency feedback.",
    deliverable: "90-second seminar response",
    minutes: "16-20 min",
    progress: 58,
    href: "/lesson/A2-speaking-starter",
    surfaceClass: "from-[#dff1e6] via-white to-[#eff8f3]",
    badgeClass: "bg-[#285f4d] text-white",
    progressClass: "bg-[#6a9483]",
  },
  {
    skill: "reading",
    title: "Academic Reading",
    focus: "Text structure, claim-evidence mapping, and vocabulary in context.",
    summary: "Topic-based article library with full readings, favorites, history tracking, and linked feedback practice.",
    deliverable: "Article notes + evidence map + saved reading trail",
    minutes: "20-24 min",
    progress: 81,
    href: "/reading",
    surfaceClass: "from-[#f7ead2] via-white to-[#fdf5e8]",
    badgeClass: "bg-[#7b4b14] text-white",
    progressClass: "bg-[#d88e34]",
  },
  {
    skill: "writing",
    title: "Academic Writing",
    focus: "Topic sentences, cohesion, and paragraph-level development.",
    summary: "Produce short academic responses with revision prompts and structured feedback.",
    deliverable: "150-200 word analytical paragraph",
    minutes: "22-28 min",
    progress: 64,
    href: "/lesson/A2-writing-starter",
    surfaceClass: "from-[#f6e0d9] via-white to-[#fff1ec]",
    badgeClass: "bg-[#7f3d2d] text-white",
    progressClass: "bg-[#c36d59]",
  },
] as const;

export const releaseFeatures = [
  {
    title: "Registration and login",
    detail: "A learner foundation layer with account access before assessment and study begin.",
    status: "MVP",
  },
  {
    title: "Placement test + questionnaire",
    detail: "The first gate into the product, used to personalize difficulty and support level.",
    status: "MVP",
  },
  {
    title: "Low / Medium / High routing",
    detail: "Clear banding logic so learning plans can adapt without manual intervention.",
    status: "MVP",
  },
  {
    title: "Personal dashboard",
    detail: "Progress, profile, streaks, and next actions in a single learner view.",
    status: "MVP",
  },
  {
    title: "Four-skill content modules",
    detail: "Listening, speaking, reading, and writing experience tailored to the assigned band.",
    status: "MVP",
  },
  {
    title: "Reassessment and progression",
    detail: "Allow the platform to move learners upward after demonstrated improvement.",
    status: "MVP",
  },
] as const;

export const weeklyWorkflow = [
  {
    title: "Warm-up and orientation",
    detail: "Preview task goals, key vocabulary, and what evidence the learner must produce.",
  },
  {
    title: "Skill practice",
    detail: "Complete the main listening, speaking, reading, or writing activity for the assigned band.",
  },
  {
    title: "Feedback and reflection",
    detail: "Show quick AI or rubric-based feedback so users know what to improve next.",
  },
  {
    title: "Progress update",
    detail: "Store completion, accuracy, and minutes studied to inform future recommendations.",
  },
] as const;

export const dashboardFocus = [
  {
    label: "Current band",
    value: "Medium",
    note: "Main launch audience: intermediate university students.",
  },
  {
    label: "Reassessment window",
    value: "6 days",
    note: "Available after at least 4 completed modules and stronger skill balance.",
  },
  {
    label: "Weekly target",
    value: "90 min",
    note: "Keep one task active in each of the four core academic skills.",
  },
] as const;

export const assessmentFacts = [
  "20 short items across vocabulary, grammar, reading, and listening signals.",
  "Level recommendation mapped into Low / Medium / High learner bands.",
  "Retake supported after progress to keep the learning path adjustable.",
] as const;

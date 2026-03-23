export type AcademicSkill = "listening" | "speaking" | "reading" | "writing";

export const platformSignals = [
  {
    label: "Audience",
    value: "DIICSU undergraduates adapting to English-medium modules, seminars, and assessed coursework.",
  },
  {
    label: "Logic",
    value: "Placement first, then matched support for lecture input, discussion output, and assignment delivery.",
  },
  {
    label: "Outcome",
    value: "Stronger classroom participation and clearer academic performance across all four skills.",
  },
] as const;

export const learnerJourney = [
  {
    step: "01",
    title: "Start with a DIICSU learner profile",
    detail: "Frame the platform around undergraduate routines such as seminars, presentations, reading lists, and coursework.",
  },
  {
    step: "02",
    title: "Complete the placement check",
    detail: "Estimate how much support the learner needs before entering full-English class and assignment contexts.",
  },
  {
    step: "03",
    title: "Assign the right support band",
    detail: "Route each learner to Low, Medium, or High based on current readiness for academic participation.",
  },
  {
    step: "04",
    title: "Unlock matched study scenes",
    detail: "Show lecture, seminar, reading, and writing tasks that feel closer to the learner's real course load.",
  },
  {
    step: "05",
    title: "Train across four academic skills",
    detail: "Move through listening, speaking, reading, and writing as one connected undergraduate study loop.",
  },
  {
    step: "06",
    title: "Track evidence of adaptation",
    detail: "Record minutes, completions, and visible gains in confidence, structure, and academic expression.",
  },
  {
    step: "07",
    title: "Reassess when performance stabilizes",
    detail: "Let learners move up after sustained improvement, not just one strong session.",
  },
  {
    step: "08",
    title: "Advance into harder academic tasks",
    detail: "Increase challenge only when the learner is ready for denser reading, sharper speaking, and cleaner writing.",
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
    focus: "Major-specific briefings, TED listening, accent comparison, and structured note capture.",
    summary: "Replay DIICSU-oriented listening materials in British, American, and global English, then move into official TED talks for real-world listening.",
    deliverable: "Structured notes + comprehension check + technical vocabulary deck + TED extension",
    minutes: "20-24 min",
    progress: 78,
    href: "/listening/ted",
    surfaceClass: "from-[#d7e8f7] via-white to-[#edf6fc]",
    badgeClass: "bg-[#14324b] text-white",
    progressClass: "bg-[#5f8fb7]",
  },
  {
    skill: "speaking",
    title: "Academic Speaking",
    focus: "Seminar response, tutorial discussion, and presentation clarity.",
    summary: "Guided discussion turns and rehearsal flows for speaking up in class with clearer structure.",
    deliverable: "90-second seminar or presentation response",
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
    focus: "Reading lists, claim-evidence mapping, and vocabulary in context.",
    summary: "Topic-based article study that helps learners handle longer academic passages and keep better notes.",
    deliverable: "Reading list notes + evidence map + saved vocabulary trail",
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
    focus: "Coursework paragraphs, cohesion, and source-led development.",
    summary: "Produce short academic responses with revision prompts that feel closer to real reports and assignments.",
    deliverable: "150-200 word coursework paragraph",
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
    title: "DIICSU-oriented onboarding",
    detail: "A learner entry layer that sets expectations around seminars, reading lists, presentations, and coursework.",
    status: "MVP",
  },
  {
    title: "Placement for English-medium study",
    detail: "An initial check used to personalize how much support a learner needs before class and assignment work begin.",
    status: "MVP",
  },
  {
    title: "Low / Medium / High routing",
    detail: "Clear support bands so academic tasks can feel matched rather than generic.",
    status: "MVP",
  },
  {
    title: "Learner dashboard",
    detail: "Progress, profile, and next academic actions in one view geared toward undergraduate routines.",
    status: "MVP",
  },
  {
    title: "Four-skill academic modules",
    detail: "Listening, speaking, reading, and writing tasks aligned to lectures, seminars, reading lists, and writing assignments.",
    status: "MVP",
  },
  {
    title: "Reassessment and progression",
    detail: "Move learners upward only after visible stability in academic performance.",
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
    note: "Main launch audience: DIICSU undergraduates building confidence in English-medium study.",
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

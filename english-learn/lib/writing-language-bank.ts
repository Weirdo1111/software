import type { CEFRLevel } from "@/types/learning";

export type WritingDiscipline =
  | "computing"
  | "transport"
  | "maths"
  | "mechanical"
  | "civil";

export interface WritingVocabularyItem {
  term: string;
  meaning: string;
  usage: string;
}

export interface WritingSentenceItem {
  purpose: string;
  text: string;
}

export interface WritingLanguagePack {
  discipline: WritingDiscipline;
  level: CEFRLevel;
  title: string;
  vocabulary: WritingVocabularyItem[];
  sentences: WritingSentenceItem[];
}

export const writingDisciplineLabels: Record<WritingDiscipline, string> = {
  computing: "Computing",
  transport: "Transport",
  maths: "Maths",
  mechanical: "Mechanical",
  civil: "Civil",
};

export const writingLanguageBank: WritingLanguagePack[] = [
  {
    discipline: "computing",
    level: "A1",
    title: "Simple computing language for beginner writers",
    vocabulary: [
      { term: "program", meaning: "a set of computer instructions", usage: "Our program helps students practise vocabulary every day." },
      { term: "screen", meaning: "the part of a device that shows information", usage: "The data appears clearly on the screen." },
      { term: "file", meaning: "a saved document or piece of data", usage: "I save each report in a separate file." },
      { term: "button", meaning: "a control you click or press", usage: "Click the blue button to open the task." },
      { term: "error", meaning: "a mistake in a system or text", usage: "The system shows an error after the wrong password." },
      { term: "update", meaning: "a new version or change", usage: "The update makes the learning page faster." },
    ],
    sentences: [
      { purpose: "Describe a basic function", text: "This program helps users complete simple study tasks on one page." },
      { purpose: "Explain a problem", text: "The main problem is that students cannot find important information quickly." },
      { purpose: "Give a simple improvement", text: "A small update can make the system easier to use." },
      { purpose: "State a result", text: "As a result, learners spend less time searching for materials." },
    ],
  },
  {
    discipline: "computing",
    level: "A2",
    title: "Practical computing language for short paragraphs",
    vocabulary: [
      { term: "database", meaning: "an organized collection of information", usage: "The database stores student accounts and scores." },
      { term: "network", meaning: "connected computers or devices", usage: "A stable network is necessary for online learning." },
      { term: "backup", meaning: "a saved copy of data", usage: "Regular backup protects important project files." },
      { term: "search function", meaning: "a tool for finding information", usage: "The search function helps users find articles quickly." },
      { term: "digital tool", meaning: "software used for a task", usage: "This digital tool supports note-taking in class." },
      { term: "user account", meaning: "a personal profile in a system", usage: "Each user account keeps learning records safe." },
    ],
    sentences: [
      { purpose: "Introduce a tool", text: "This digital tool is useful because it combines storage, search, and quick feedback." },
      { purpose: "Show cause and effect", text: "When the network is unstable, students may lose access to online tasks." },
      { purpose: "Recommend an action", text: "Students should create a backup before making major changes to a file." },
      { purpose: "Explain a benefit", text: "A clear search function can improve efficiency during academic study." },
    ],
  },
  {
    discipline: "computing",
    level: "B1",
    title: "Analytical computing language for academic writing",
    vocabulary: [
      { term: "algorithm", meaning: "a set of rules for solving a problem", usage: "The algorithm sorts large amounts of learning data." },
      { term: "interface", meaning: "the part of a system users interact with", usage: "A clear interface reduces confusion for first-year students." },
      { term: "automation", meaning: "using technology to complete tasks automatically", usage: "Automation can save time in routine assessment tasks." },
      { term: "data security", meaning: "protection of digital information", usage: "Data security is essential in student management systems." },
      { term: "processing speed", meaning: "how fast a system handles tasks", usage: "Higher processing speed improves the user experience." },
      { term: "system design", meaning: "the structure and planning of a system", usage: "Good system design supports both access and reliability." },
    ],
    sentences: [
      { purpose: "Make an analytical claim", text: "A well-designed interface improves learning because students can focus on content rather than navigation." },
      { purpose: "Balance benefit and risk", text: "Although automation increases efficiency, poor system design may reduce user control." },
      { purpose: "Propose a solution", text: "One practical solution is to improve data security while keeping the platform easy to access." },
      { purpose: "Link evidence to conclusion", text: "This suggests that technical performance and user confidence are closely connected." },
    ],
  },
  {
    discipline: "computing",
    level: "B2",
    title: "Precise computing language for higher-level argument",
    vocabulary: [
      { term: "scalability", meaning: "the ability to grow without losing performance", usage: "Scalability matters when a platform serves many users at once." },
      { term: "optimization", meaning: "improving efficiency or performance", usage: "Optimization can reduce loading time during peak periods." },
      { term: "interoperability", meaning: "the ability of systems to work together", usage: "Interoperability supports data sharing across departments." },
      { term: "encryption", meaning: "coding data to keep it secure", usage: "Encryption protects sensitive student information." },
      { term: "deployment", meaning: "the release of a system into use", usage: "Careful deployment reduces disruption for users." },
      { term: "computational efficiency", meaning: "effective use of computing resources", usage: "Computational efficiency should guide software decisions in large systems." },
    ],
    sentences: [
      { purpose: "State a policy position", text: "Universities should prioritize interoperable systems because fragmented platforms weaken both efficiency and accountability." },
      { purpose: "Acknowledge a limitation", text: "Nevertheless, optimization alone cannot guarantee a positive user experience if the interface remains unclear." },
      { purpose: "Present a condition", text: "Any large-scale deployment should include encryption standards and routine user testing." },
      { purpose: "Conclude with precision", text: "For this reason, computational efficiency must be evaluated alongside accessibility and security." },
    ],
  },
  {
    discipline: "transport",
    level: "A1",
    title: "Basic transport language for short writing",
    vocabulary: [
      { term: "route", meaning: "the path a bus, train, or car follows", usage: "This bus route connects the campus and the station." },
      { term: "station", meaning: "a place where buses or trains stop", usage: "The station is close to the university gate." },
      { term: "ticket", meaning: "proof that you paid to travel", usage: "Students can buy a ticket on the app." },
      { term: "traffic", meaning: "vehicles moving on the road", usage: "Heavy traffic makes the journey slower." },
      { term: "bridge", meaning: "a structure across water or a road", usage: "The bridge helps cars cross the river safely." },
      { term: "bus lane", meaning: "a road area only for buses", usage: "The bus lane saves time in the morning." },
    ],
    sentences: [
      { purpose: "Describe a transport service", text: "The new bus route is useful for students who travel to campus every day." },
      { purpose: "Explain a delay", text: "Traffic is heavy in the morning, so the trip takes longer." },
      { purpose: "State a simple benefit", text: "A bus lane can make public transport faster and more reliable." },
      { purpose: "Give a recommendation", text: "Students should check the ticket information before the journey." },
    ],
  },
  {
    discipline: "transport",
    level: "A2",
    title: "Practical transport language for paragraph writing",
    vocabulary: [
      { term: "public transport", meaning: "buses, trains, and other shared travel systems", usage: "Public transport is important for daily commuting." },
      { term: "schedule", meaning: "a timetable of planned times", usage: "A clear schedule helps passengers arrive on time." },
      { term: "congestion", meaning: "too much traffic in one place", usage: "Road congestion increases travel time in the city center." },
      { term: "commuter", meaning: "a person who travels regularly to work or study", usage: "Many commuters use the metro every weekday." },
      { term: "transfer", meaning: "changing from one vehicle to another", usage: "The transfer between two train lines is easy." },
      { term: "maintenance", meaning: "work to keep something in good condition", usage: "Regular maintenance keeps buses safe." },
    ],
    sentences: [
      { purpose: "Explain a common issue", text: "Many commuters experience delays when congestion affects the main road near the station." },
      { purpose: "Describe a useful system", text: "A clear schedule allows passengers to plan transfers more confidently." },
      { purpose: "Recommend improvement", text: "City planners should improve maintenance so public transport remains safe and punctual." },
      { purpose: "Show impact", text: "As a result, students can reach campus more efficiently." },
    ],
  },
  {
    discipline: "transport",
    level: "B1",
    title: "Analytical transport language for academic support",
    vocabulary: [
      { term: "mobility", meaning: "the ability to move efficiently from place to place", usage: "Reliable transport improves urban mobility for students and workers." },
      { term: "infrastructure", meaning: "basic systems such as roads and railways", usage: "Transport infrastructure shapes economic activity across a city." },
      { term: "capacity", meaning: "the amount a system can handle", usage: "Rail capacity is limited during peak hours." },
      { term: "commuting pattern", meaning: "a regular travel behavior", usage: "Commuting patterns changed after new bus links were introduced." },
      { term: "travel demand", meaning: "how much people need transport", usage: "Travel demand rises quickly near university campuses." },
      { term: "service reliability", meaning: "how dependably transport runs", usage: "Service reliability affects whether passengers trust public systems." },
    ],
    sentences: [
      { purpose: "Present an analytical point", text: "Transport infrastructure should respond to travel demand rather than rely on outdated commuting patterns." },
      { purpose: "Explain a consequence", text: "When service reliability declines, passengers are more likely to choose private vehicles instead." },
      { purpose: "Suggest a solution", text: "One practical solution is to increase capacity on routes used heavily by students." },
      { purpose: "Conclude with impact", text: "This would strengthen mobility while reducing pressure on congested roads." },
    ],
  },
  {
    discipline: "transport",
    level: "B2",
    title: "Higher-level transport language for argument",
    vocabulary: [
      { term: "sustainability", meaning: "meeting present needs without harming the future", usage: "Transport policy should support sustainability as well as speed." },
      { term: "multimodal network", meaning: "a system combining different transport methods", usage: "A multimodal network connects buses, rail, and cycling routes." },
      { term: "logistical efficiency", meaning: "effective movement of people or goods", usage: "Logistical efficiency is essential in growing urban regions." },
      { term: "emission reduction", meaning: "lowering harmful gases", usage: "Public transport investment can support emission reduction." },
      { term: "capacity constraint", meaning: "a limit on how much a system can handle", usage: "Capacity constraints weaken service quality during rush hour." },
      { term: "transport resilience", meaning: "the ability to recover from disruption", usage: "Transport resilience matters during extreme weather events." },
    ],
    sentences: [
      { purpose: "State a strategic argument", text: "Cities should invest in multimodal networks because single-mode expansion rarely solves long-term mobility problems." },
      { purpose: "Balance aims", text: "Although speed remains important, sustainability and transport resilience deserve equal policy attention." },
      { purpose: "Add a condition", text: "Any expansion plan should address capacity constraints rather than simply increase route length." },
      { purpose: "Draw a policy conclusion", text: "For this reason, emission reduction and logistical efficiency should be treated as linked objectives." },
    ],
  },
  {
    discipline: "maths",
    level: "A1",
    title: "Simple maths language for beginning writers",
    vocabulary: [
      { term: "number", meaning: "a symbol used for counting", usage: "The number shows how many students joined the class." },
      { term: "shape", meaning: "the form of an object", usage: "A triangle is a simple shape in geometry." },
      { term: "measure", meaning: "find the size or amount of something", usage: "We measure the line with a ruler." },
      { term: "pattern", meaning: "something that repeats in a clear way", usage: "The chart shows a simple pattern." },
      { term: "graph", meaning: "a picture that shows data", usage: "The graph makes the result easy to see." },
      { term: "angle", meaning: "the space between two lines", usage: "This angle is larger than the first one." },
    ],
    sentences: [
      { purpose: "Describe data", text: "The graph shows a clear increase in student participation." },
      { purpose: "Explain a pattern", text: "This pattern is easy to see because the numbers rise each week." },
      { purpose: "State a comparison", text: "The first angle is smaller than the second angle." },
      { purpose: "Give a simple conclusion", text: "These numbers help us understand the result more clearly." },
    ],
  },
  {
    discipline: "maths",
    level: "A2",
    title: "Practical maths language for structured paragraphs",
    vocabulary: [
      { term: "equation", meaning: "a mathematical statement with equal values", usage: "The equation shows the relationship between two values." },
      { term: "variable", meaning: "a quantity that can change", usage: "Each variable has a different meaning in the formula." },
      { term: "ratio", meaning: "a comparison between two amounts", usage: "The ratio between theory and practice is balanced." },
      { term: "estimate", meaning: "an approximate calculation", usage: "We can estimate the total using the first results." },
      { term: "trend", meaning: "the general direction of change", usage: "The trend in the data is upward." },
      { term: "calculate", meaning: "work out an answer using numbers", usage: "Students calculate the value before drawing a conclusion." },
    ],
    sentences: [
      { purpose: "Introduce numerical evidence", text: "The equation helps explain how two variables are connected." },
      { purpose: "Report a trend", text: "The data shows an upward trend over the first three weeks." },
      { purpose: "Explain method", text: "Students can estimate the result before they calculate the exact answer." },
      { purpose: "Interpret data", text: "This ratio suggests that one factor has a stronger influence than the other." },
    ],
  },
  {
    discipline: "maths",
    level: "B1",
    title: "Analytical maths language for academic writing",
    vocabulary: [
      { term: "correlation", meaning: "a connection between two changing values", usage: "The chart suggests a correlation between study time and performance." },
      { term: "distribution", meaning: "the way values are spread", usage: "The distribution of scores is uneven across the group." },
      { term: "probability", meaning: "how likely something is to happen", usage: "Probability helps researchers discuss uncertain outcomes." },
      { term: "model", meaning: "a representation used to explain something", usage: "The model simplifies a complex real-world process." },
      { term: "calculation", meaning: "the process of working out a value", usage: "The final calculation supports the main conclusion." },
      { term: "quantitative evidence", meaning: "evidence based on numbers", usage: "Quantitative evidence makes the argument more convincing." },
    ],
    sentences: [
      { purpose: "State an analytical claim", text: "Quantitative evidence strengthens the argument because it reveals patterns that may not be obvious in description alone." },
      { purpose: "Warn about interpretation", text: "However, correlation does not automatically prove that one factor caused the other." },
      { purpose: "Explain value of a model", text: "A mathematical model can simplify a complex problem while preserving its main structure." },
      { purpose: "Link method and conclusion", text: "This calculation therefore provides a stronger basis for the final interpretation." },
    ],
  },
  {
    discipline: "maths",
    level: "B2",
    title: "Higher-level maths language for reasoned argument",
    vocabulary: [
      { term: "statistical validity", meaning: "how trustworthy a statistical result is", usage: "Statistical validity depends on both sample size and method." },
      { term: "predictive model", meaning: "a model used to forecast outcomes", usage: "The predictive model estimates future transport demand." },
      { term: "deviation", meaning: "difference from an expected value", usage: "A large deviation may suggest a hidden variable." },
      { term: "parameter", meaning: "a measurable factor in a system", usage: "Researchers adjusted the main parameter during testing." },
      { term: "optimization problem", meaning: "a problem about finding the best result", usage: "Route planning can be framed as an optimization problem." },
      { term: "analytical precision", meaning: "careful and exact reasoning", usage: "Analytical precision is essential when interpreting complex datasets." },
    ],
    sentences: [
      { purpose: "State a precise claim", text: "A predictive model is only persuasive when its assumptions and parameters are explained with analytical precision." },
      { purpose: "Acknowledge uncertainty", text: "Even so, some deviation is inevitable when real-world conditions change unexpectedly." },
      { purpose: "Discuss methodological strength", text: "Statistical validity improves when researchers combine transparent sampling with careful interpretation." },
      { purpose: "Draw a higher-level conclusion", text: "For this reason, optimization problems should be discussed in relation to both efficiency and uncertainty." },
    ],
  },
  {
    discipline: "mechanical",
    level: "A1",
    title: "Basic mechanical language for simple description",
    vocabulary: [
      { term: "machine", meaning: "a tool with moving parts that does work", usage: "This machine lifts heavy materials safely." },
      { term: "gear", meaning: "a toothed wheel in a machine", usage: "The gear helps the parts move together." },
      { term: "engine", meaning: "a machine that produces power", usage: "The engine provides energy for the system." },
      { term: "metal", meaning: "a strong material used in engineering", usage: "The frame is made of metal." },
      { term: "motor", meaning: "a device that creates movement", usage: "The motor turns the fan quickly." },
      { term: "part", meaning: "one piece of a larger system", usage: "Each part has a clear function in the device." },
    ],
    sentences: [
      { purpose: "Describe a device", text: "This machine uses a motor to move one important part." },
      { purpose: "Explain a function", text: "The gear helps the system work in a smooth way." },
      { purpose: "State material choice", text: "Metal is useful because it is strong and durable." },
      { purpose: "Give a simple conclusion", text: "As a result, the device can work safely for daily tasks." },
    ],
  },
  {
    discipline: "mechanical",
    level: "A2",
    title: "Practical mechanical language for short explanation",
    vocabulary: [
      { term: "force", meaning: "a push or pull that causes movement", usage: "The machine uses force to lift the object." },
      { term: "friction", meaning: "resistance when surfaces move against each other", usage: "Too much friction can damage the moving parts." },
      { term: "rotation", meaning: "movement in a circle", usage: "Rotation allows the wheel to turn continuously." },
      { term: "component", meaning: "one important piece in a machine", usage: "Each component should be checked before use." },
      { term: "efficiency", meaning: "how well something works without waste", usage: "Better efficiency reduces energy loss." },
      { term: "inspection", meaning: "a careful check", usage: "Regular inspection prevents simple problems." },
    ],
    sentences: [
      { purpose: "Explain a mechanical issue", text: "High friction can reduce efficiency and shorten the life of the component." },
      { purpose: "Describe movement", text: "The system uses rotation to transfer force from one part to another." },
      { purpose: "Recommend practice", text: "Students should complete a simple inspection before operating the device." },
      { purpose: "State a benefit", text: "This process improves safety and supports stable performance." },
    ],
  },
  {
    discipline: "mechanical",
    level: "B1",
    title: "Analytical mechanical language for technical writing",
    vocabulary: [
      { term: "load distribution", meaning: "how weight or force is shared in a system", usage: "Load distribution affects whether the structure remains stable." },
      { term: "mechanical stress", meaning: "internal force inside a material", usage: "Mechanical stress increases when the component carries a heavy load." },
      { term: "torque", meaning: "turning force", usage: "Torque is necessary for controlled rotation." },
      { term: "structural stability", meaning: "ability to remain strong and balanced", usage: "Structural stability is essential in machine frames." },
      { term: "wear resistance", meaning: "ability to resist damage from use", usage: "Wear resistance matters in high-speed systems." },
      { term: "maintenance cycle", meaning: "planned schedule for upkeep", usage: "A short maintenance cycle can reduce long-term failure risk." },
    ],
    sentences: [
      { purpose: "Present a technical claim", text: "Mechanical stress should be monitored carefully because repeated overload can weaken structural stability." },
      { purpose: "Explain cause and effect", text: "When torque is uneven, load distribution becomes less predictable across the system." },
      { purpose: "Recommend a response", text: "One practical response is to shorten the maintenance cycle for heavily used components." },
      { purpose: "Draw a conclusion", text: "This approach can improve wear resistance and reduce sudden failure." },
    ],
  },
  {
    discipline: "mechanical",
    level: "B2",
    title: "Higher-level mechanical language for engineering argument",
    vocabulary: [
      { term: "fatigue failure", meaning: "breakage caused by repeated stress over time", usage: "Fatigue failure may occur even when the load is moderate." },
      { term: "kinematic chain", meaning: "linked moving parts in a mechanism", usage: "The kinematic chain determines how motion is transferred." },
      { term: "load-bearing capacity", meaning: "how much weight a part can safely hold", usage: "Design choices must reflect the required load-bearing capacity." },
      { term: "mechanical reliability", meaning: "how consistently a system performs", usage: "Mechanical reliability is crucial in public safety systems." },
      { term: "material deformation", meaning: "change in shape under force", usage: "Material deformation becomes serious under repeated impact." },
      { term: "design tolerance", meaning: "acceptable limit of variation in design", usage: "Small design tolerances can improve precision but increase cost." },
    ],
    sentences: [
      { purpose: "State a higher-level argument", text: "Mechanical reliability depends not only on strength, but also on how the kinematic chain distributes repeated stress." },
      { purpose: "Evaluate a risk", text: "Even minor material deformation can become significant when design tolerance is narrow." },
      { purpose: "Add a design condition", text: "Any proposal should consider load-bearing capacity alongside the risk of fatigue failure." },
      { purpose: "Conclude with precision", text: "For this reason, mechanism design must balance precision, durability, and long-term reliability." },
    ],
  },
  {
    discipline: "civil",
    level: "A1",
    title: "Basic civil language for simple academic writing",
    vocabulary: [
      { term: "building", meaning: "a structure with walls and a roof", usage: "The new building is near the engineering lab." },
      { term: "road", meaning: "a surface for cars and buses", usage: "The road connects the campus and the town." },
      { term: "site", meaning: "a place where work happens", usage: "The site needs careful safety checks." },
      { term: "concrete", meaning: "a hard building material", usage: "Concrete is used in the foundation." },
      { term: "safety helmet", meaning: "head protection on a site", usage: "Every student must wear a safety helmet." },
      { term: "foundation", meaning: "the base that supports a structure", usage: "A strong foundation keeps the building stable." },
    ],
    sentences: [
      { purpose: "Describe a structure", text: "The foundation is important because it supports the whole building." },
      { purpose: "Mention safety", text: "Workers should wear a safety helmet on every site visit." },
      { purpose: "State a material use", text: "Concrete is useful because it is strong and durable." },
      { purpose: "Give a simple conclusion", text: "These steps help the project stay safe and organized." },
    ],
  },
  {
    discipline: "civil",
    level: "A2",
    title: "Practical civil language for paragraph building",
    vocabulary: [
      { term: "drainage", meaning: "system for removing water", usage: "Good drainage prevents flooding near roads." },
      { term: "survey", meaning: "measurement and examination of land", usage: "The survey provides important site information." },
      { term: "construction plan", meaning: "a document showing how to build something", usage: "The construction plan explains each stage of the project." },
      { term: "load", meaning: "weight a structure carries", usage: "Engineers must check the load on the bridge." },
      { term: "inspection report", meaning: "a document after checking a site", usage: "The inspection report lists safety concerns." },
      { term: "surface crack", meaning: "a small break on the outside", usage: "A surface crack should be checked quickly." },
    ],
    sentences: [
      { purpose: "Explain planning", text: "A clear construction plan helps the team complete each stage in the correct order." },
      { purpose: "Describe risk", text: "Poor drainage can damage roads and create safety problems after heavy rain." },
      { purpose: "Recommend checking", text: "Engineers should review the inspection report before the next site task." },
      { purpose: "Show purpose", text: "This survey is useful because it gives accurate information about the land." },
    ],
  },
  {
    discipline: "civil",
    level: "B1",
    title: "Analytical civil language for technical explanation",
    vocabulary: [
      { term: "structural load", meaning: "the weight and force carried by a structure", usage: "Structural load must be calculated before design approval." },
      { term: "site assessment", meaning: "evaluation of a construction site", usage: "A detailed site assessment reduces planning errors." },
      { term: "material durability", meaning: "how long a material lasts under use", usage: "Material durability influences long-term maintenance costs." },
      { term: "foundation design", meaning: "planning the base of a structure", usage: "Foundation design depends on soil condition and load." },
      { term: "water management", meaning: "control of water on or near a site", usage: "Water management is necessary in flood-prone areas." },
      { term: "construction safety", meaning: "protection of workers and site operations", usage: "Construction safety should guide every stage of the project." },
    ],
    sentences: [
      { purpose: "State an engineering point", text: "Foundation design should reflect both soil condition and expected structural load." },
      { purpose: "Explain long-term value", text: "Material durability matters because early damage increases maintenance demands and cost." },
      { purpose: "Suggest a practical measure", text: "One effective measure is to improve water management before major construction begins." },
      { purpose: "Conclude with impact", text: "This would strengthen construction safety and reduce preventable structural problems." },
    ],
  },
  {
    discipline: "civil",
    level: "B2",
    title: "Higher-level civil language for academic argument",
    vocabulary: [
      { term: "geotechnical analysis", meaning: "study of soil and ground conditions", usage: "Geotechnical analysis is essential before large foundation work." },
      { term: "structural integrity", meaning: "overall strength and soundness of a structure", usage: "Structural integrity must remain the priority throughout construction." },
      { term: "load-path efficiency", meaning: "effective transfer of force through a structure", usage: "Load-path efficiency improves building stability under pressure." },
      { term: "infrastructure resilience", meaning: "ability of infrastructure to recover from stress or disaster", usage: "Infrastructure resilience is increasingly important in climate planning." },
      { term: "compliance standard", meaning: "required rule or benchmark", usage: "Each design must meet the relevant compliance standard." },
      { term: "lifecycle cost", meaning: "total cost across the full life of a project", usage: "Lifecycle cost should influence material decisions, not only initial price." },
    ],
    sentences: [
      { purpose: "State a policy-style argument", text: "Civil engineering decisions should prioritize structural integrity and lifecycle cost rather than short-term savings alone." },
      { purpose: "Acknowledge a planning demand", text: "This is especially important when infrastructure resilience is threatened by changing environmental conditions." },
      { purpose: "Add a technical condition", text: "Any proposal should include geotechnical analysis and clear compliance standards from the earliest stage." },
      { purpose: "Reach a precise conclusion", text: "For this reason, long-term public safety must remain central to civil design choices." },
    ],
  },
];

export function getWritingLanguagePack(discipline: WritingDiscipline, level: CEFRLevel) {
  return writingLanguageBank.find((item) => item.discipline === discipline && item.level === level) ?? null;
}

export function getWritingLanguagePacksForDiscipline(discipline: WritingDiscipline) {
  return writingLanguageBank.filter((item) => item.discipline === discipline);
}

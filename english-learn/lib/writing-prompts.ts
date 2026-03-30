import type { CEFRLevel, WritingPrompt } from "@/types/learning";
import type { WritingDiscipline } from "@/lib/writing-language-bank";

export const writingPrompts: WritingPrompt[] = [
  {
    id: "a1-study-routine-note",
    level: "A1",
    title: "Coding practice note",
    scenario: "You have just finished your first computing lab and want to describe one simple coding habit that helps you learn programming in English.",
    prompt: "Write 3-4 simple sentences about one coding habit that helps you study computing.",
    skill_focus: "Use simple present tense and one clear reason in a computing context.",
    checkpoints: [
      "Name one study habit clearly.",
      "Say why it helps.",
      "Keep each sentence simple and direct.",
    ],
    sample_response:
      "I check my code every evening after class. This habit helps me find small errors early. I also write short notes about new commands. It makes me feel more ready for the next lab.",
  },
  {
    id: "a1-ask-teacher-help",
    level: "A1",
    title: "Ask for help with site terms",
    scenario: "You are sending a short message after a civil engineering class because some site drawing words were difficult for you.",
    prompt: "Write a short message to your teacher about one problem with civil engineering vocabulary and one kind of help you need.",
    skill_focus: "State one problem and one polite request with a civil engineering focus.",
    checkpoints: [
      "Say what the problem is.",
      "Ask for one clear type of help.",
      "Use polite classroom language.",
    ],
    sample_response:
      "Hello teacher. I have difficulty with new site drawing words in class. Could you give me one small vocabulary list for practice? Thank you for your help.",
  },
  {
    id: "a1-library-orientation-note",
    level: "A1",
    title: "Maths support room note",
    scenario: "You have just visited the mathematics support room and want to note one rule or service that will help your study this semester.",
    prompt: "Write 3-4 simple sentences about one maths support service that is useful for your English study.",
    skill_focus: "Use simple classroom vocabulary and one clear benefit in a maths setting.",
    checkpoints: [
      "Name one rule or service.",
      "Explain why it is useful.",
      "Keep the message short and clear.",
    ],
    sample_response:
      "The maths support room has a quiet table for students. This place is useful because I can check formulas without noise. I can also ask simple questions about graphs there. It helps me study more carefully.",
  },
  {
    id: "a1-group-meeting-reminder",
    level: "A1",
    title: "Route planning meeting reminder",
    scenario: "Your transport project group will meet before a short route planning presentation, and you need to send a reminder to one classmate.",
    prompt: "Write a short note to a classmate about when your transport group will meet and what to bring.",
    skill_focus: "Give simple time, place, and task information for a transport task.",
    checkpoints: [
      "Say when the meeting is.",
      "Say where to meet.",
      "Mention one thing to bring.",
    ],
    sample_response:
      "Hello Mei. Our route planning group will meet in Room 204 at 3 p.m. tomorrow. Please bring your map notes and one bus schedule for discussion. See you there.",
  },
  {
    id: "a2-seminar-preparation-advice",
    level: "A2",
    title: "Mechanical lab demo advice",
    scenario: "A classmate is nervous about presenting a simple mechanical lab demo in English and asks you for preparation advice.",
    prompt: "Write a short paragraph giving advice to a classmate about how to prepare for a mechanical engineering lab explanation in English.",
    skill_focus: "Organize advice with sequence words and practical support for a mechanical task.",
    checkpoints: [
      "Give at least two steps.",
      "Use a sequence word such as first or then.",
      "Explain why the advice is useful.",
    ],
    sample_response:
      "First, review the machine diagram and write two short points in your notebook. Then practise explaining one part aloud, because this can help you speak more clearly in the lab. It is also useful to learn a few key terms so you can describe the device more easily.",
  },
  {
    id: "a2-study-group-recommendation",
    level: "A2",
    title: "Recommend a coding clinic",
    scenario: "A new computing student wants to know which support group would be most useful for academic English and programming practice.",
    prompt: "Write a short paragraph recommending one computing study group or coding clinic to a new student and explain how it supports academic English.",
    skill_focus: "Recommend one option with one benefit and one example in computing.",
    checkpoints: [
      "Name the group clearly.",
      "Explain one benefit for academic English.",
      "Add one simple example.",
    ],
    sample_response:
      "I recommend the weekly coding clinic for new students. It helps academic English because students can practise explaining errors and solutions in a friendly way. For example, members discuss simple programming tasks and learn useful technical words before labs.",
  },
  {
    id: "a2-writing-center-visit",
    level: "A2",
    title: "Site report writing support",
    scenario: "After your first appointment at the university writing center, a civil engineering classmate asks whether it is useful before site report assignments.",
    prompt: "Write a short paragraph explaining how the writing center can help a civil engineering student prepare a site report or short technical paragraph.",
    skill_focus: "Explain one service and one clear benefit with an example from civil engineering writing.",
    checkpoints: [
      "Name the support clearly.",
      "Explain how it helps writing.",
      "Add one practical example.",
    ],
    sample_response:
      "The writing center can help civil engineering students plan and revise their site reports before submission. A tutor can show how to write a clearer main point and organize technical details. For example, a student can bring one draft paragraph about a site inspection and get advice on grammar and structure.",
  },
  {
    id: "a2-presentation-preparation-plan",
    level: "A2",
    title: "Transit safety briefing plan",
    scenario: "Your tutor has assigned a short transport safety briefing, and you want to explain the best way for a student to prepare in English.",
    prompt: "Write a short paragraph about how a student should prepare for a short transport-related presentation in English.",
    skill_focus: "Use sequence and purpose to explain a simple plan in a transport context.",
    checkpoints: [
      "Give two or more preparation steps.",
      "Use a sequence word.",
      "Explain why the plan is useful.",
    ],
    sample_response:
      "First, a student should read the transport topic and choose two simple safety points for the presentation. Then the student should practise speaking aloud and check important technical words. This plan is useful because it improves confidence and helps the speaker stay organized in class.",
  },
  {
    id: "b1-english-medium-support",
    level: "B1",
    title: "Support strategies for programming study",
    scenario: "A first-year support team is reviewing how to help international students succeed in English-medium computing labs and coding assignments.",
    prompt: "Write a short analytical paragraph explaining one challenge students face in programming classes and one practical solution.",
    skill_focus: "State one problem, explain it, and propose one realistic support strategy for computing.",
    checkpoints: [
      "Open with a clear analytical point.",
      "Explain the challenge with a specific detail.",
      "End with a practical solution.",
    ],
    sample_response:
      "International students often struggle in programming classes because task sheets include unfamiliar technical terms and dense instructions. This can slow comprehension and make debugging harder during lab time. A practical solution is to teach students how to mark key commands, track error messages, and build a small subject-specific vocabulary list before class.",
  },
  {
    id: "b1-online-reading-balance",
    level: "B1",
    title: "Graphing software: benefit and limitation",
    scenario: "In a mathematics skills class, students are debating whether graphing software improves learning or makes them depend too much on visual tools.",
    prompt: "Write a paragraph responding to the claim that graphing software improves flexibility but can weaken deeper mathematical understanding.",
    skill_focus: "Balance one advantage against one limitation in a maths context.",
    checkpoints: [
      "Show your position clearly.",
      "Mention both a benefit and a limitation.",
      "Use one contrast signal such as however.",
    ],
    sample_response:
      "Graphing software gives mathematics students more flexibility because they can test patterns quickly and compare results efficiently. However, it can also reduce deep understanding when learners rely on the graph and do not pause to explain the underlying method. For this reason, graphing software is most effective when students combine digital convenience with slower written reasoning.",
  },
  {
    id: "b1-tutorial-participation-support",
    level: "B1",
    title: "Support quiet students in design reviews",
    scenario: "A tutor has noticed that several first-year mechanical engineering students understand the lab work but rarely speak during design review discussions.",
    prompt: "Write a short analytical paragraph explaining why some students stay quiet in mechanical design reviews and one practical way a tutor can support participation.",
    skill_focus: "Explain a cause and propose one realistic support strategy in a mechanical setting.",
    checkpoints: [
      "Identify one likely cause.",
      "Explain how it affects participation.",
      "Suggest one practical solution.",
    ],
    sample_response:
      "Some students remain quiet in design reviews because they need more time to organize technical ideas in English before speaking. As a result, they may understand the lab task but still avoid discussion in front of others. One practical solution is for tutors to give students one minute of preparation time and one guiding question before open discussion begins.",
  },
  {
    id: "b1-note-taking-and-plagiarism",
    level: "B1",
    title: "Site notes and report integrity",
    scenario: "During a civil engineering workshop, students are discussing why weak site notes often cause problems later in technical report writing and source use.",
    prompt: "Write a short analytical paragraph explaining how better site note-taking can help students avoid plagiarism and improve civil engineering writing.",
    skill_focus: "Connect one study habit to one writing outcome with clear cause-and-effect logic in civil engineering.",
    checkpoints: [
      "State the main connection clearly.",
      "Explain one writing risk.",
      "Show how note-taking reduces that risk.",
    ],
    sample_response:
      "Better site note-taking helps students avoid plagiarism because it makes the difference between copied technical wording and personal summary much clearer. When notes are disorganized, students may forget which details came from a source and which observations are their own. Clear labels for quotations, paraphrases, and source details therefore support both honest citation and stronger report planning.",
  },
  {
    id: "b2-public-transport-investment-argument",
    level: "B2",
    title: "Public transport investment argument",
    scenario: "A city transport committee is reviewing whether it should invest more heavily in public transport after repeated congestion problems.",
    prompt: "Write a short argumentative paragraph for or against increased public transport investment in a growing city.",
    skill_focus: "Take a position, justify it, and acknowledge one limitation in a transport policy context.",
    checkpoints: [
      "State a direct position.",
      "Support it with a clear justification.",
      "Address one counterpoint briefly.",
    ],
    sample_response:
      "Increased public transport investment can strengthen urban mobility because regular, reliable services help reduce congestion and improve access across the city. This is especially important in areas where students and workers depend on buses or rail to travel efficiently. Nevertheless, any investment plan should remain realistic about cost and maintenance demands, otherwise it may overpromise without improving service quality.",
  },
  {
    id: "b2-research-reading-support",
    level: "B2",
    title: "Support for reading mathematical proofs",
    scenario: "An academic skills committee wants recommendations for helping first-year students manage formal proofs, symbolic explanations, and unfamiliar mathematical vocabulary.",
    prompt: "Write a short analytical paragraph explaining how universities should support first-year students who struggle with mathematical proofs and theory texts.",
    skill_focus: "Develop a precise claim with evidence-aware academic language in a maths context.",
    checkpoints: [
      "State one focused claim.",
      "Explain why research articles are difficult.",
      "Propose a support strategy with academic precision.",
    ],
    sample_response:
      "Universities should support first-year students with mathematical reading by teaching them how to identify proof structure before asking them to interpret dense symbolic reasoning. Many learners struggle not because they lack motivation, but because formal definitions, proof steps, and compressed notation are unfamiliar at the start of university study. A guided workshop sequence on structure, vocabulary, and worked examples would therefore improve both comprehension and confidence.",
  },
  {
    id: "b2-peer-review-requirement",
    level: "B2",
    title: "Should design review be required?",
    scenario: "A mechanical engineering program is considering whether every major first-year design report should include a compulsory peer review stage before final submission.",
    prompt: "Write a short argumentative paragraph discussing whether peer review should be a required part of mechanical engineering design writing.",
    skill_focus: "Take a reasoned position and evaluate one benefit against one risk in mechanical engineering writing.",
    checkpoints: [
      "State your position directly.",
      "Support it with an academic reason.",
      "Acknowledge one possible limitation or risk.",
    ],
    sample_response:
      "Peer review should be a required part of mechanical engineering design writing because it helps students recognize weaknesses in structure, evidence, and technical clarity before final submission. It also encourages learners to read design arguments critically, which can improve their own drafting decisions. However, peer review is only reliable when students receive clear guidance; otherwise, comments may remain too vague to support meaningful revision.",
  },
  {
    id: "b2-ai-feedback-policy",
    level: "B2",
    title: "AI support in code documentation",
    scenario: "A computing department is debating whether first-year students should be allowed to use AI tools for feedback on code documentation and technical clarity before they submit coursework.",
    prompt: "Write a short analytical paragraph arguing whether universities should allow limited AI feedback support in first-year computing writing.",
    skill_focus: "Present a policy position with balance, precision, and one clear condition in a computing context.",
    checkpoints: [
      "State one policy position clearly.",
      "Explain one strong reason.",
      "Add one condition or limit.",
    ],
    sample_response:
      "Universities should allow limited AI feedback in first-year computing writing because it can help students notice recurring grammar and clarity problems more quickly when they describe code logic or system behavior. This support is especially useful for multilingual learners who need immediate language guidance outside class hours. Even so, such use should remain limited to feedback rather than content generation, otherwise the line between support and authorship becomes unclear.",
  },
  {
    id: "a2-campus-shuttle-improvement-note",
    level: "A2",
    title: "Campus shuttle improvement note",
    scenario: "Your transport class is discussing campus shuttle problems, and you want to suggest one simple improvement for students.",
    prompt: "Write a short paragraph suggesting one practical improvement for a campus shuttle service and explain why it helps students.",
    skill_focus: "Recommend one practical transport change with a clear reason and example.",
    checkpoints: [
      "Name one transport problem clearly.",
      "Suggest one realistic improvement.",
      "Explain why students would benefit.",
    ],
    sample_response:
      "One useful improvement for the campus shuttle is a clearer evening timetable. Many students finish late classes and wait too long for the next bus. If the shuttle times are shown more clearly on the app, students can plan their journeys with less stress.",
  },
  {
    id: "a2-statistics-workshop-advice",
    level: "A2",
    title: "Statistics workshop advice",
    scenario: "A classmate is worried about understanding graphs and averages in a maths workshop and asks you for study advice.",
    prompt: "Write a short paragraph giving advice to a classmate about how to prepare for a statistics workshop in English.",
    skill_focus: "Give sequenced advice with one clear reason in a maths context.",
    checkpoints: [
      "Give at least two preparation steps.",
      "Use a sequence word such as first or then.",
      "Explain why the advice is useful.",
    ],
    sample_response:
      "First, review the basic words for graphs, averages, and percentages before the workshop. Then practise reading one simple chart aloud, because this can help you explain the data more clearly in class. It is also useful to write down two question forms you can use if you need help.",
  },
  {
    id: "b1-machine-maintenance-log",
    level: "B1",
    title: "Machine maintenance explanation",
    scenario: "A workshop tutor wants students to explain why regular maintenance logs matter when machines are used every day in the lab.",
    prompt: "Write a short analytical paragraph explaining why maintenance logs are important in a mechanical engineering lab.",
    skill_focus: "Explain a technical practice and connect it to one clear outcome.",
    checkpoints: [
      "State the main value clearly.",
      "Explain one risk of poor maintenance records.",
      "Show how better logs improve performance or safety.",
    ],
    sample_response:
      "Maintenance logs are important in a mechanical engineering lab because they make patterns of wear and small faults easier to detect before a serious failure occurs. When records are incomplete, students may repeat the same mistake or use a machine that already shows warning signs. Clear logs therefore support both safer practice and more efficient repairs.",
  },
  {
    id: "b1-foundation-drainage-priority",
    level: "B1",
    title: "Foundation drainage priority",
    scenario: "A civil engineering seminar is discussing why drainage planning should be considered early in foundation design rather than left until late construction.",
    prompt: "Write a short analytical paragraph explaining why drainage planning matters in foundation design.",
    skill_focus: "State one engineering point, explain it, and support it with a practical consequence.",
    checkpoints: [
      "Open with one clear engineering claim.",
      "Explain one technical reason.",
      "End with a practical consequence or solution.",
    ],
    sample_response:
      "Drainage planning matters in foundation design because uncontrolled water can weaken soil conditions and increase long-term structural risk. If drainage is considered too late, engineers may need more expensive changes after the main work has already begun. Early planning therefore protects both structural stability and project efficiency.",
  },
  {
    id: "b2-system-testing-report",
    level: "B2",
    title: "System testing report argument",
    scenario: "A computing module is debating whether first-year students should be required to include a short testing report with every software submission.",
    prompt: "Write a short argumentative paragraph discussing whether testing reports should be a required part of first-year computing coursework.",
    skill_focus: "Take a clear position, justify it with a technical reason, and acknowledge one limitation.",
    checkpoints: [
      "State your position directly.",
      "Support it with one computing-related justification.",
      "Acknowledge one possible limitation or condition.",
    ],
    sample_response:
      "Testing reports should be a required part of first-year computing coursework because they encourage students to explain how they checked logic, inputs, and expected outputs before submission. This habit helps learners treat debugging as part of the design process rather than as a last-minute correction. However, the report format should remain short and focused, otherwise documentation may take attention away from coding practice.",
  },
  {
    id: "a1-password-check-note",
    level: "A1",
    title: "Password check note",
    scenario: "You want to describe one simple digital safety habit after your first computing class.",
    prompt: "Write 3-4 simple sentences about one computer safety habit that helps you study.",
    skill_focus: "Use simple present tense and one clear reason in a computing context.",
    checkpoints: ["Name one safety habit clearly.", "Say why it helps.", "Keep each sentence short and direct."],
    sample_response:
      "I check my password carefully before I log in. This habit helps me protect my account. I also save my work in the correct folder. It makes my study safer and easier.",
  },
  {
    id: "a2-debugging-pair-work-advice",
    level: "A2",
    title: "Debugging pair work advice",
    scenario: "A new computing student feels nervous about pair debugging in English and asks you for advice.",
    prompt: "Write a short paragraph giving advice about how to prepare for pair debugging in a computing lab.",
    skill_focus: "Give sequenced advice with one benefit in a computing setting.",
    checkpoints: ["Give at least two steps.", "Use a sequence word.", "Explain why the advice is useful."],
    sample_response:
      "First, read the task and underline the main error message before the lab starts. Then practise saying one possible cause aloud, because this can help you explain your idea more clearly to your partner. It is also useful to learn a few debugging words so the discussion is easier to follow.",
  },
  {
    id: "b1-version-control-collaboration",
    level: "B1",
    title: "Version control collaboration",
    scenario: "A computing tutor wants students to explain why version control is useful when several people work on the same software task.",
    prompt: "Write a short analytical paragraph explaining why version control improves collaboration in programming projects.",
    skill_focus: "Explain one computing practice and connect it to one practical outcome.",
    checkpoints: ["State the main value clearly.", "Explain one risk without version control.", "Show one practical benefit."],
    sample_response:
      "Version control improves collaboration in programming projects because it makes changes visible and easier to track across a team. Without it, students may overwrite each other's work or lose important progress after a mistake. A shared version history therefore supports clearer teamwork and more reliable debugging.",
  },
  {
    id: "a1-materials-check-message",
    level: "A1",
    title: "Materials check message",
    scenario: "You need to send a short message before a civil engineering site visit about one item students must bring.",
    prompt: "Write 3-4 simple sentences about one important item for a civil engineering site visit.",
    skill_focus: "Give simple practical information in a civil engineering setting.",
    checkpoints: ["Name the item clearly.", "Say why it is important.", "Keep the sentences simple."],
    sample_response:
      "A safety helmet is important for the site visit. It protects our heads in dangerous areas. We should also check it before we leave. This helps us stay safe on site.",
  },
  {
    id: "a2-bridge-inspection-preparation",
    level: "A2",
    title: "Bridge inspection preparation",
    scenario: "A classmate asks how to prepare for a short bridge inspection presentation in English.",
    prompt: "Write a short paragraph about how a student should prepare for a bridge inspection discussion in class.",
    skill_focus: "Use sequence and purpose in a civil engineering context.",
    checkpoints: ["Give two preparation steps.", "Use a sequence word.", "Explain why the plan is useful."],
    sample_response:
      "First, a student should review the main parts of the bridge and write down key terms before class. Then the student should practise describing one safety concern aloud, because this can make the explanation clearer. This plan is useful because it improves confidence and technical accuracy.",
  },
  {
    id: "b2-sustainable-material-choice",
    level: "B2",
    title: "Sustainable material choice",
    scenario: "A civil engineering department is discussing whether sustainable materials should be prioritized even when the initial project cost is higher.",
    prompt: "Write a short argumentative paragraph discussing whether civil engineering projects should prioritize sustainable materials.",
    skill_focus: "Take a clear position, justify it, and address one limitation in civil engineering.",
    checkpoints: ["State your position directly.", "Support it with one engineering reason.", "Acknowledge one limitation or condition."],
    sample_response:
      "Civil engineering projects should prioritize sustainable materials because long-term durability, lower environmental impact, and reduced lifecycle cost often outweigh a higher initial price. This is especially important when infrastructure is expected to serve the public for many years. However, such choices should still reflect local budget limits and performance requirements rather than rely on sustainability claims alone.",
  },
  {
    id: "b2-flood-risk-planning",
    level: "B2",
    title: "Flood risk planning",
    scenario: "A planning committee is debating whether flood-risk assessment should receive more time and funding at the start of civil engineering projects.",
    prompt: "Write a short analytical paragraph arguing whether early flood-risk planning should be a priority in civil engineering.",
    skill_focus: "Present a policy-style position with precision and one clear condition.",
    checkpoints: ["State one focused claim.", "Explain one strong reason.", "Add one condition or limit."],
    sample_response:
      "Early flood-risk planning should be a priority in civil engineering because delayed assessment can lead to weaker drainage choices, higher repair costs, and greater long-term danger for surrounding communities. This is particularly important in areas where climate pressure is increasing. Even so, the planning process should be tied to accurate local data rather than broad assumptions about future risk.",
  },
  {
    id: "a1-formula-review-note",
    level: "A1",
    title: "Formula review note",
    scenario: "You want to describe one simple maths study habit after your first week of problem-solving practice.",
    prompt: "Write 3-4 simple sentences about one maths study habit that helps you learn.",
    skill_focus: "Use simple present tense and one clear reason in a maths setting.",
    checkpoints: ["Name one study habit clearly.", "Say why it helps.", "Keep each sentence simple and direct."],
    sample_response:
      "I review my formulas every evening after class. This habit helps me remember important steps. I also check one graph before I sleep. It makes me feel more ready for maths lessons.",
  },
  {
    id: "a2-geometry-club-recommendation",
    level: "A2",
    title: "Geometry club recommendation",
    scenario: "A new student wants to know which maths support group is useful for learning geometry terms in English.",
    prompt: "Write a short paragraph recommending one maths club or study group and explain why it is helpful.",
    skill_focus: "Recommend one option with one benefit and one example in maths.",
    checkpoints: ["Name the group clearly.", "Explain one benefit.", "Add one simple example."],
    sample_response:
      "I recommend the weekly geometry club for new students. It is helpful because students can practise explaining shapes and angles in a small group. For example, members describe diagrams together and learn useful maths words before class.",
  },
  {
    id: "b1-data-table-interpretation",
    level: "B1",
    title: "Data table interpretation",
    scenario: "A maths tutor wants students to explain why some first-year learners find data tables harder to interpret than graphs.",
    prompt: "Write a short analytical paragraph explaining why students may struggle with data tables and one way to support them.",
    skill_focus: "Explain one challenge and propose one realistic support strategy in maths.",
    checkpoints: ["Identify one likely cause.", "Explain how it affects understanding.", "Suggest one practical solution."],
    sample_response:
      "Some students struggle with data tables because the relationships between values are less visible than they are in a graph. As a result, learners may focus on separate numbers without noticing the overall pattern. One practical solution is to ask students to label variables and summarize one trend before doing a full calculation.",
  },
  {
    id: "b2-proof-feedback-policy",
    level: "B2",
    title: "Proof feedback policy",
    scenario: "A mathematics department is debating whether first-year students should receive structured feedback templates when they write formal proofs.",
    prompt: "Write a short analytical paragraph arguing whether structured proof-feedback templates should be used in first-year maths teaching.",
    skill_focus: "Present a policy position with balance, precision, and one condition in mathematics.",
    checkpoints: ["State one policy position clearly.", "Explain one strong reason.", "Add one condition or limit."],
    sample_response:
      "Structured proof-feedback templates should be used in first-year mathematics because they help students focus on logical sequence, justification, and notation rather than treating a proof as a loose summary of ideas. This support can be especially useful when learners are new to formal mathematical writing. However, the template should guide reasoning without becoming so rigid that it limits independent thought.",
  },
  {
    id: "a1-tool-check-reminder",
    level: "A1",
    title: "Tool check reminder",
    scenario: "Your mechanical engineering group will meet in the lab, and you need to remind one classmate what to bring.",
    prompt: "Write a short note to a classmate about a lab meeting and one tool or item to bring.",
    skill_focus: "Give simple time, place, and task information in a mechanical lab context.",
    checkpoints: ["Say when the meeting is.", "Say where to meet.", "Mention one thing to bring."],
    sample_response:
      "Hello Jun. Our lab group will meet in Workshop 2 at 10 a.m. tomorrow. Please bring your safety glasses and your machine notes. See you there.",
  },
  {
    id: "a1-machine-part-note",
    level: "A1",
    title: "Machine part note",
    scenario: "After a lab lesson, you want to write a few simple sentences about one machine part you learned.",
    prompt: "Write 3-4 simple sentences about one machine part and why it is useful.",
    skill_focus: "Use simple present tense and one clear benefit in a mechanical context.",
    checkpoints: ["Name one machine part clearly.", "Say what it does.", "Keep the message short and simple."],
    sample_response:
      "The gear is an important machine part. It helps the system move in a smooth way. It also connects one part to another part. This makes the machine work better.",
  },
  {
    id: "a2-lab-safety-preparation",
    level: "A2",
    title: "Lab safety preparation",
    scenario: "A classmate is worried about joining a mechanical workshop for the first time and asks you for preparation advice.",
    prompt: "Write a short paragraph giving advice about how to prepare for a mechanical engineering workshop in English.",
    skill_focus: "Organize advice with sequence words and practical support in a mechanical setting.",
    checkpoints: ["Give at least two steps.", "Use a sequence word.", "Explain why the advice is useful."],
    sample_response:
      "First, read the workshop rules and check the names of the main tools before class. Then practise saying one short explanation about the machine, because this can help you speak more clearly during the task. It is also useful to learn a few safety terms so you can follow the instructions easily.",
  },
  {
    id: "b2-material-fatigue-discussion",
    level: "B2",
    title: "Material fatigue discussion",
    scenario: "A mechanical engineering module is debating whether more teaching time should be spent on material fatigue and long-term failure analysis in first-year labs.",
    prompt: "Write a short argumentative paragraph discussing whether first-year mechanical students should study material fatigue in more depth.",
    skill_focus: "Take a reasoned position and evaluate one benefit against one limitation in a mechanical engineering context.",
    checkpoints: ["State your position directly.", "Support it with a technical reason.", "Acknowledge one possible limitation or risk."],
    sample_response:
      "First-year mechanical students should study material fatigue in more depth because repeated stress and long-term wear are central to understanding why components fail in real systems. Earlier exposure would help learners connect design choices to safety and maintenance decisions more clearly. However, such content should still be introduced gradually so that technical complexity does not overwhelm students at the start of their degree.",
  },
  {
    id: "a1-bus-stop-note",
    level: "A1",
    title: "Bus stop note",
    scenario: "You want to write a few simple sentences about one useful transport service near campus.",
    prompt: "Write 3-4 simple sentences about one transport service that helps students travel to class.",
    skill_focus: "Use simple transport vocabulary and one clear benefit.",
    checkpoints: ["Name one transport service clearly.", "Explain why it is useful.", "Keep the message short and clear."],
    sample_response:
      "The campus bus stop is useful for students. It is close to the main gate. The bus comes every morning before class. It helps students arrive on time.",
  },
  {
    id: "b1-timetable-reliability-support",
    level: "B1",
    title: "Timetable reliability support",
    scenario: "A transport tutor wants students to explain why unclear timetables make public transport harder for new passengers to use.",
    prompt: "Write a short analytical paragraph explaining why timetable clarity matters in public transport and one practical improvement.",
    skill_focus: "Explain one transport challenge and propose one realistic improvement.",
    checkpoints: ["State the main issue clearly.", "Explain how it affects passengers.", "Suggest one practical solution."],
    sample_response:
      "Timetable clarity matters in public transport because unclear departure times make it harder for new passengers to trust the service and plan their journeys efficiently. When information is confusing, people may miss connections or choose private transport instead. One practical improvement is to show simpler, more consistent timetable formats at stops and on mobile apps.",
  },
  {
    id: "b1-rail-transfer-design",
    level: "B1",
    title: "Rail transfer design",
    scenario: "A transport planning class is discussing why difficult rail transfers can reduce the value of an otherwise efficient public transport network.",
    prompt: "Write a short analytical paragraph explaining why transfer design matters in rail systems and one way to improve it.",
    skill_focus: "State one transport problem, explain it, and offer one practical solution.",
    checkpoints: ["Open with a clear analytical point.", "Explain one practical difficulty.", "End with one realistic solution."],
    sample_response:
      "Transfer design matters in rail systems because passengers judge the whole journey rather than each separate service. When transfer routes are long, confusing, or poorly signed, even a fast line may feel inefficient and stressful. A practical solution is to improve station signage and reduce walking distance between key platforms.",
  },
  {
    id: "b2-bus-lane-policy",
    level: "B2",
    title: "Bus lane policy",
    scenario: "A city is debating whether new bus lanes should be introduced even if they reduce road space for private cars.",
    prompt: "Write a short analytical paragraph arguing whether bus lanes should be expanded in congested urban areas.",
    skill_focus: "Present a policy position with balance, precision, and one clear condition in transport planning.",
    checkpoints: ["State one policy position clearly.", "Explain one strong reason.", "Add one condition or limit."],
    sample_response:
      "Bus lanes should be expanded in congested urban areas because they improve service reliability, reduce delay, and make public transport a more realistic option for a larger number of passengers. This can strengthen mobility without requiring every traveller to rely on a private car. However, expansion should be based on clear demand evidence rather than introduced in corridors where bus use remains limited.",
  },
];

const writingPromptDisciplines: Record<string, WritingDiscipline> = {
  "a1-study-routine-note": "computing",
  "a1-ask-teacher-help": "civil",
  "a1-library-orientation-note": "maths",
  "a1-group-meeting-reminder": "transport",
  "a2-seminar-preparation-advice": "mechanical",
  "a2-study-group-recommendation": "computing",
  "a2-writing-center-visit": "civil",
  "a2-presentation-preparation-plan": "transport",
  "b1-english-medium-support": "computing",
  "b1-online-reading-balance": "maths",
  "b1-tutorial-participation-support": "mechanical",
  "b1-note-taking-and-plagiarism": "civil",
  "b2-public-transport-investment-argument": "transport",
  "b2-research-reading-support": "maths",
  "b2-peer-review-requirement": "mechanical",
  "b2-ai-feedback-policy": "computing",
  "a2-campus-shuttle-improvement-note": "transport",
  "a2-statistics-workshop-advice": "maths",
  "b1-machine-maintenance-log": "mechanical",
  "b1-foundation-drainage-priority": "civil",
  "b2-system-testing-report": "computing",
  "a1-password-check-note": "computing",
  "a2-debugging-pair-work-advice": "computing",
  "b1-version-control-collaboration": "computing",
  "a1-materials-check-message": "civil",
  "a2-bridge-inspection-preparation": "civil",
  "b2-sustainable-material-choice": "civil",
  "b2-flood-risk-planning": "civil",
  "a1-formula-review-note": "maths",
  "a2-geometry-club-recommendation": "maths",
  "b1-data-table-interpretation": "maths",
  "b2-proof-feedback-policy": "maths",
  "a1-tool-check-reminder": "mechanical",
  "a1-machine-part-note": "mechanical",
  "a2-lab-safety-preparation": "mechanical",
  "b2-material-fatigue-discussion": "mechanical",
  "a1-bus-stop-note": "transport",
  "b1-timetable-reliability-support": "transport",
  "b1-rail-transfer-design": "transport",
  "b2-bus-lane-policy": "transport",
};

export function getWritingPromptsForLevel(level: CEFRLevel) {
  return writingPrompts.filter((prompt) => prompt.level === level);
}

export function getWritingPromptDiscipline(id: string) {
  return writingPromptDisciplines[id] ?? "computing";
}

export function getWritingPromptsForLevelAndDiscipline(level: CEFRLevel, discipline: WritingDiscipline) {
  return writingPrompts.filter((prompt) => {
    return prompt.level === level && getWritingPromptDiscipline(prompt.id) === discipline;
  });
}

export function getWritingPromptById(id: string) {
  return writingPrompts.find((prompt) => prompt.id === id) ?? null;
}

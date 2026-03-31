# Listening Material Sourcing

Updated: 2026-03-31

## Fit With The Current App

The current listening library already supports most of the metadata needed for authentic academic listening materials:

- source page and embed links
- major tags
- accent and speaker region
- CEFR-based difficulty
- in-app playback mode
- study-text support for read-first and review-first workflows
- note prompts, vocabulary, questions, and follow-up tasks

The most relevant implementation files are:

- `lib/authentic-listening-catalog.ts`
- `lib/listening-materials.ts`
- `app/listening/page.tsx`
- `app/listening/[groupId]/page.tsx`

That means the best ingestion model is:

1. Keep the official source player.
2. Embed only when the source allows stable embedding.
3. Store transcript and source URLs.
4. Keep a DIICSU-native study text when a full inline transcript is not practical.
5. Build DIICSU-native questions, notes, and answer checking around the original material.

## Current Inventory Snapshot

As of 2026-03-31, the current catalog has:

- 50 materials total
- 30 TED talks
- 20 non-TED academic materials
- 5 majors with 10 items each
- 4 accent lanes: British, American, Indian, and Global
- 16 cross-disciplinary items
- full in-app playback coverage through video embeds, direct video files, or in-app audio

## Source Priority

### 1. Official educational channels distributed through YouTube

Best default for the product because the platform is easy to embed, familiar to students, and supports playlists.

Operational note:

- YouTube officially supports embedding videos and playlists, but specific uploads can still disable embedding or change availability later.

Recommended use:

- use the official player
- do not rehost the video
- verify embedding before publishing
- keep a fallback `officialUrl` even when `embedUrl` exists

Useful references:

- YouTube Help: https://support.google.com/youtube/answer/171780
- YouTube Embedded Players: https://developers.google.com/youtube/player_parameters

### 2. MIT OpenCourseWare

Strongest source for reusable engineering and maths teaching content. MIT OCW is a better fit as a clip source than as a whole-course import.

Recommended use:

- cut one lecture into one listening unit
- keep each listening task focused on one concept
- write 5 to 8 questions around gist, detail, signposting, and technical vocabulary

Licensing reference:

- MIT OCW Privacy + Terms of Use: https://ocw.mit.edu/pages/privacy-and-terms-of-use/

### 3. Stanford Engineering Everywhere and Stanford course channels

Useful for computing, applied mathematics, and cross-disciplinary technical English. Stanford Engineering Everywhere is especially attractive because the courses are free and published under a Creative Commons license.

Reference:

- Stanford Engineering Everywhere: https://see.stanford.edu

### 4. TED

Best as an auxiliary track for presentation listening, argument structure, note-taking, and interdisciplinary topics.

Operational note:

- use TED's own player and transcript pages
- treat TED as a support lane, not the only engineering lane

Reference:

- TED Talks Usage Policy: https://www.ted.com/about/our-organization/our-policies-terms/ted-talks-usage-policy

### 5. NPTEL

Very valuable for engineering students because it adds authentic Indian English academic delivery and engineering-heavy topic coverage.

Operational note:

- especially good for civil, mechanical, transport, computing, and maths fundamentals
- use it to diversify accent exposure and classroom rhythm

Reference:

- NPTEL About page: https://nptel.ac.in/aboutus

Note:

- The official NPTEL footer currently labels the material as `CC BY-NC-SA`; the footer text is not perfectly consistent, so treat this as an official label that should still be rechecked during final publication review.

## Recommended Source Families

| Source family | Best for majors | Accent / region | Typical difficulty | Why it fits |
| --- | --- | --- | --- | --- |
| MIT OpenCourseWare | computing, maths, mechanical, civil, transport | American / North America | B1-C1 | clean lecture structure, strong board work, reusable lecture segments |
| Stanford Engineering Everywhere | computing, maths, systems | American / North America | B1-B2 | slower classroom pacing and clearer teaching flow |
| Stanford CS course channels | computing, AI, cross-disciplinary engineering | American / Global | B2-C1 | modern technical topics and seminar-style listening |
| Cambridge CSIC | civil, transport, infrastructure | British / Global | B1-B2 | infrastructure and transport topics close to DIICSU student interests |
| Oxford Mathematics | applied maths, modelling, statistics, AI+maths | British / Global | B2-C1 | strong public lectures for academic reasoning and abstractions |
| ASME TechCast | mechanical, transport, civil-adjacent industry topics | American / Global | B1-B2 | interview and podcast format for real professional listening |
| TED | all majors, especially cross-disciplinary themes | mixed international accents | B1-B2 | strong for note-taking, persuasion, and presentation language |
| NPTEL | all core engineering majors | Indian / Asia | B1-C1 | authentic engineering lecture rhythm and strong major alignment |

## Starter Backlog By Major

The list below is the most practical first batch to build next. Each line is suitable for a single listening unit rather than a whole-course import.

### Computing Science

- MIT OCW `6.006 Introduction to Algorithms`: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/
- Stanford Engineering Everywhere `CS106A Programming Methodology`: https://see.stanford.edu/Course/CS106A
- Stanford `CS230` for AI-themed academic listening: https://cs230.stanford.edu
- NPTEL `Data Structures and Algorithms`: https://nptel.ac.in/courses/106102064

Recommended difficulty split:

- B1-B2: Stanford SEE classroom explanations
- B2: MIT OCW algorithm lectures with visuals
- B2-C1: Stanford AI seminars and guest talks

### Civil Engineering

- MIT OCW `1.051 Structural Engineering Design`: https://ocw.mit.edu/courses/1-051-structural-engineering-design-fall-2003/
- MIT OCW `1.050 Solid Mechanics`: https://ocw.mit.edu/courses/1-050-solid-mechanics-fall-2004/
- Cambridge CSIC talks and webinars: https://www-smartinfrastructure.eng.cam.ac.uk
- NPTEL `Introduction to Transportation Engineering`: https://nptel.ac.in/courses/105101087

Recommended difficulty split:

- B1: infrastructure interviews and short CSIC talks
- B1-B2: NPTEL topic lectures with familiar engineering context
- B2-C1: MIT structural and mechanics lectures

### Mechanical Engineering

- MIT OCW `2.003SC Engineering Dynamics`: https://ocw.mit.edu/courses/2-003sc-engineering-dynamics-fall-2011/
- MIT OCW `2.003 Modeling Dynamics and Control I`: https://ocw.mit.edu/courses/2-003-modeling-dynamics-and-control-i-spring-2005/
- ASME TechCast example episode page: https://www.asme.org/topics-resources/content/podcast-ai-and-the-industrial-internet-of-things
- NPTEL `Strength of Materials`: https://nptel.ac.in/courses/112107146

Recommended difficulty split:

- B1: ASME interview clips
- B1-B2: NPTEL concept lectures
- B2-C1: MIT dynamics and control lectures

### Transportation And Equipment

- MIT OCW `1.258J Public Transportation Systems`: https://ocw.mit.edu/courses/1-258j-public-transportation-systems-spring-2017/
- Cambridge CSIC transport and highway decarbonisation talks: https://www-smartinfrastructure.eng.cam.ac.uk
- NPTEL `Introduction to Transportation Engineering`: https://nptel.ac.in/courses/105101087
- TED transport and city-system talks: https://www.ted.com/topics/transportation

Recommended difficulty split:

- B1: TED transport talks and CSIC explainers
- B1-B2: NPTEL transport engineering
- B2-C1: MIT public transportation systems

### Applied Mathematics

- MIT OCW `A 2020 Vision of Linear Algebra`: https://ocw.mit.edu/courses/res-18-010-a-2020-vision-of-linear-algebra-spring-2020/
- Oxford Mathematics public lectures: https://www.maths.ox.ac.uk/events/public-lectures-events
- Stanford Engineering Everywhere `EE263 Introduction to Linear Dynamical Systems`: https://see.stanford.edu/Course/EE263
- NPTEL probability and statistics course catalogue: https://nptel.ac.in/courses

Recommended difficulty split:

- B1: visual and concept-driven maths talks
- B1-B2: Stanford SEE lecture units
- B2-C1: Oxford public lectures and advanced MIT explanations

## Cross-Disciplinary Lane

Build a separate lane for topics shared by several majors:

- AI for science and engineering
- climate resilience and infrastructure
- risk, uncertainty, and decision-making
- data visualisation and modelling
- manufacturing, automation, and digital twins

Best source mix:

- TED
- Oxford Mathematics
- Stanford AI / systems talks
- MIT OCW interdisciplinary courses

## Difficulty Rules For Unit Design

Use source difficulty and task difficulty separately.

Suggested mapping:

- `B1`: 4 to 8 minute clips, one speaker, strong slides or board support, one main concept
- `B1-B2`: 8 to 12 minute clips, one to two speakers, moderate pace, clear signposting
- `B2`: 10 to 18 minute clips, denser terminology, less visual support
- `C1`: 15 to 30 minute clips, advanced lecture pacing, abstract explanation, more inferencing

## Intake Checklist Before Publishing

- `Source validity`: official institution, lab, society, or course page
- `Embed check`: embedded player works in the app, otherwise keep source-page mode only
- `Transcript check`: official transcript or reliable subtitles available
- `Topic focus`: one unit should train one concept, not a whole lecture
- `Questionability`: the clip must support gist, detail, signpost, and terminology questions
- `Accent value`: the clip adds a real accent or speaking-style distinction
- `Discipline fit`: the clip uses genuine academic or professional language from the target major

## Product Recommendations

### Keep

- official player outside the quiz shell
- your current `material -> notes -> questions -> answer check` flow
- major, region, and difficulty filters

### Add Next

- `sourcePlatform` such as `youtube`, `ted`, `ocw`, `nptel`, `podcast`
- `licenseLabel`
- `usageNotes`
- `verifiedEmbed`
- optional `clipStartSec` and `clipEndSec`

### Important Data Note

If NPTEL and Indian university sources become a real content lane, keep `Indian English` as a first-class accent rather than folding it into `global`. The app now supports that metadata shape in `ListeningAccent` and `AuthenticAccent`.

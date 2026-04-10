# Source Attribution, GitHub Citation, and AI Disclosure

Updated: 2026-04-10

## 1. Scope and Audit Baseline

This document is based on the current repository code and is intended for project display, repository documentation, presentations, assessment materials, and compliance-style disclosure for `English Learn`.

If you want a faster teacher-facing checklist rather than a narrative explanation, use [./source-register.md](./source-register.md).

- GitHub repository: <https://github.com/Weirdo1111/software>
- Project folder: `english-learn/`
- Local audit baseline used for this document: branch `z-x-hub/agile-remediation-on-latest-main`, latest local commit `857111e` dated 2026-04-08 with message `fix(lint): resolve strict react and jsx checks`

Notes:

- When this document says `code evidence`, it refers to traceable files in the repository.
- When this document says `inference`, it means the repository supports a careful conclusion about usage or naming, but does not store a separate original license file, design source file, or download record. Those cases should not be treated as formal licensing proof.

## 2. Recommended GitHub Citation Style

For reports, README notes, and course documentation, the following citation style is recommended.

### 2.1 Repository-level citation

`Weirdo1111/software`, project folder `english-learn/`

### 2.2 File-level citation

Examples:

- `Weirdo1111/software: english-learn/lib/ai/client.ts`
- `Weirdo1111/software: english-learn/lib/listening-materials.ts`
- `Weirdo1111/software: english-learn/app/api/ai/feedback/writing/route.ts`

If you want direct GitHub links, use:

- `https://github.com/Weirdo1111/software/blob/main/english-learn/<path>`

Examples:

- <https://github.com/Weirdo1111/software/blob/main/english-learn/lib/ai/client.ts>
- <https://github.com/Weirdo1111/software/blob/main/english-learn/README.md>

## 3. Image Asset Attribution

### 3.1 Institutional branding and home-page visuals

Code evidence:

- [`../public/dii-brand/ddlogo.png`](../public/dii-brand/ddlogo.png)
- [`../public/dii-brand/institute-building.jpg`](../public/dii-brand/institute-building.jpg)
- [`../public/dii-brand/about-us.jpg`](../public/dii-brand/about-us.jpg)
- [`../public/dii-brand/degree-programmes.jpg`](../public/dii-brand/degree-programmes.jpg)
- [`../public/dii-brand/campus-life.jpg`](../public/dii-brand/campus-life.jpg)
- [`../components/institution-brand.tsx`](../components/institution-brand.tsx)
- [`../components/home/home-action-entry.tsx`](../components/home/home-action-entry.tsx)
- [`../app/globals.css`](../app/globals.css)

Explanation:

- `ddlogo.png` is explicitly used in code as the `Dundee International Institute of Central South University official logo`, so it should be treated as an institutional branding asset.
- `about-us.jpg`, `degree-programmes.jpg`, and `campus-life.jpg` are used for the `About Us`, `Degree Programmes`, and `Campus Life` cards on the home page, and those cards link to official DIICSU pages.
- `institute-building.jpg` is used as a branded visual background on the home page.
- Based on file naming, page destinations, and component usage, it is reasonable to infer that this group of assets is intended as DIICSU-branded or DIICSU-directed visual material. However, the current repository does not include separate source screenshots, license files, or download records for these images.

Suggested wording:

- "The home-page branding and institutional visual assets are included in the project repository and are used to direct users to official DIICSU pages. The current repository does not separately archive original asset provenance or license paperwork, so any public release should add formal source notes if required."

### 3.2 The image with explicit AI-generated naming

Code evidence:

- [`../public/Gemini_Generated_Image_bjoegbbjoegbbjoe.png`](../public/Gemini_Generated_Image_bjoegbbjoegbbjoe.png)
- [`../components/forms/auth-landing-hero.tsx`](../components/forms/auth-landing-hero.tsx)

Explanation:

- The filename explicitly includes `Gemini_Generated_Image`.
- In the current codebase, this image is used as the `DIICSU campus welcome illustration` on the sign-in and sign-up entry layout.
- It is therefore reasonable to identify this asset as an AI-generated welcome illustration. The repository supports that conclusion through both naming and actual usage.
- The current repository does not store the original prompt, exact model version, generation date, or a separate edit log. If stricter disclosure is required, those details would need to be documented outside the current repository state.

Suggested wording:

- "The welcome illustration used on the sign-in and sign-up entry layout is an AI-generated image asset. Its repository filename indicates Gemini-based generation, but the current repository does not preserve the full generation parameters."

### 3.3 Game Center and escape-room visuals

Code evidence:

- [`../public/game-center/escape-room-preview.png`](../public/game-center/escape-room-preview.png)
- [`../public/game-center/word-game-preview.png`](../public/game-center/word-game-preview.png)
- [`../public/quests/escape-room/`](../public/quests/escape-room)
- [`../components/games/game-selector-modal.tsx`](../components/games/game-selector-modal.tsx)
- [`../docs/architecture.md`](../docs/architecture.md)

Explanation:

- This group includes Game Center preview images, escape-room scene assets, SVG stage covers, and local quest audio.
- The commit history shows that these assets entered the repository alongside the Game Center and escape-room feature work.
- In the current repository state, the safest truthful description is that these are project-contained local demo and gameplay assets.
- The repository does not currently include a separate third-party asset manifest, commercial art license record, or external art-source note for this group. If those assets are later confirmed to come from specific tools or external packs, that should be added as an explicit supplement.

## 4. Learning Material Attribution

### 4.1 External source families used in the listening library

Code evidence:

- [`../lib/authentic-listening-catalog.ts`](../lib/authentic-listening-catalog.ts)
- [`../lib/listening-materials.ts`](../lib/listening-materials.ts)
- [`../scripts/seed-listening-materials.mjs`](../scripts/seed-listening-materials.mjs)
- [`./listening-material-sourcing.md`](./listening-material-sourcing.md)
- [`./listening-data-audit.md`](./listening-data-audit.md)
- [`../tests/listening-materials.test.ts`](../tests/listening-materials.test.ts)

Current code-level inventory:

- total listening materials: 80
- TED materials: 60
- authentic academic materials: 20
- source families currently represented in code: `TED`, `MIT OpenCourseWare`, `Stanford Engineering Everywhere`, `University of Oxford Podcasts`, `NPTEL`, and `Nature Podcast`

Explanation:

- Listening items in the data model preserve fields such as `source`, `sourceName`, `officialUrl`, `transcriptUrl`, `embedUrl`, `videoSrc`, and `audioSrc`.
- That makes the current listening library materially traceable at source level.
- This is especially useful in reviews and presentations because the platform does not only keep processed exercises; it also keeps explicit links back to official or original source pages.

Suggested wording:

- "The listening library preserves traceable source metadata in code, including source labels and official URLs. Current source families include TED, MIT OpenCourseWare, Stanford Engineering Everywhere, University of Oxford Podcasts, NPTEL, and Nature Podcast."

### 4.2 In-app fallback audio is project-generated support audio, not original source audio

Code evidence:

- [`../scripts/generate-listening-audio.mjs`](../scripts/generate-listening-audio.mjs)
- [`../public/audio/listening/`](../public/audio/listening)
- [`./listening-data-audit.md`](./listening-data-audit.md)

Explanation:

- The files in `public/audio/listening/*.m4a` are in-app fallback audio assets.
- They are generated by project scripts through macOS `say` and `afconvert`, using the listening transcript or study text.
- These files should therefore be described as project-generated support audio or fallback audio.
- They should not be described as official source recordings.

Suggested wording:

- "To maintain stable in-app playback, the project generates local fallback audio from study text and transcript content. These files are support assets for teaching and demo reliability and are not the original source recordings."

### 4.3 Questions, model answers, vocabulary, and study prompts are project-authored teaching content

Code evidence:

- [`../lib/authentic-listening-catalog.ts`](../lib/authentic-listening-catalog.ts)
- [`../lib/listening-materials.ts`](../lib/listening-materials.ts)
- [`./listening-data-audit.md`](./listening-data-audit.md)

Explanation:

- Listening questions, model answers, rubric notes, vocabulary, and note prompts are maintained in project code.
- They are teaching content designed around authentic source materials.
- They are not official exam-bank questions and should not be presented as official answer keys from TED, MIT, Oxford, NPTEL, or other source institutions.

Suggested wording:

- "The platform's questions, model answers, vocabulary items, and note prompts are project-authored teaching materials designed around authentic academic listening sources. They should not be presented as official exam or source-provider answer keys."

### 4.4 Other learning texts are repository-authored educational content

Code evidence:

- [`../lib/reading-articles.ts`](../lib/reading-articles.ts)
- [`../lib/writing-prompts.ts`](../lib/writing-prompts.ts)
- [`../lib/speaking-prompts.ts`](../lib/speaking-prompts.ts)

Explanation:

- Reading passages, writing prompts, and speaking prompts are currently stored directly in repository code.
- In the present implementation, those items are not centrally tied to a shared external source URL.
- They should therefore be described as project-authored educational content rather than third-party article reproduction.

## 5. AI Disclosure for Key Features

### 5.1 AI integration pattern

Code evidence:

- [`../lib/ai/client.ts`](../lib/ai/client.ts)
- [`../README.md`](../README.md)

Explanation:

- The project uses an `OpenAI-compatible` integration pattern.
- The default text model in code is `gpt-4o-mini`.
- Compatible providers can be switched through `AI_BASE_URL` and `AI_MODEL`.
- When the API key format matches ZhiPu conventions, the code can automatically apply ZhiPu-compatible defaults.
- Speech transcription is handled separately and supports OpenAI-compatible audio endpoints, a ZhiPu ASR path, and Doubao speech recognition.

Suggested wording:

- "The project uses an OpenAI-compatible AI integration pattern, and the actual provider can vary by deployment configuration."

### 5.2 Runtime features that genuinely call AI services

#### A. Writing feedback

Code evidence:

- [`../app/api/ai/feedback/writing/route.ts`](../app/api/ai/feedback/writing/route.ts)

Explanation:

- Input: learner essay text, target level, and optional writing-task context
- Output: structured writing feedback, error notes, and a rewrite sample
- If AI is not configured, the route falls back to built-in mock feedback

#### B. Reading feedback

Code evidence:

- [`../app/api/ai/feedback/reading/route.ts`](../app/api/ai/feedback/reading/route.ts)

Explanation:

- Input: passage text plus learner answers such as claim, evidence, and vocabulary
- Output: structured reading-comprehension feedback and study tips
- If AI is not configured, the route falls back to level-based static feedback

#### C. Listening feedback

Code evidence:

- [`../app/api/ai/feedback/listening/route.ts`](../app/api/ai/feedback/listening/route.ts)

Explanation:

- Input: talk metadata, scenario, learner answers, and listening notes
- Output: structured listening feedback and improvement tips
- If AI is not configured, the route falls back to built-in feedback templates

#### D. Speaking scoring and speaking-test reports

Code evidence:

- [`../app/api/ai/feedback/speaking/route.ts`](../app/api/ai/feedback/speaking/route.ts)
- [`../app/api/ai/feedback/speaking-test/route.ts`](../app/api/ai/feedback/speaking-test/route.ts)
- [`../lib/speaking-ai.ts`](../lib/speaking-ai.ts)
- [`../lib/speaking-test.ts`](../lib/speaking-test.ts)

Explanation:

- Standard speaking feedback uses task context and transcript content to produce structured scoring and revision guidance.
- The speaking-test route evaluates three fixed answers as one combined report and persists results into `ai_feedback_records`.
- If AI is not configured, the system falls back to built-in heuristic mock scoring instead of becoming unusable.

#### E. Speaking partner and roleplay dialogue

Code evidence:

- [`../app/api/ai/speaking/partner/route.ts`](../app/api/ai/speaking/partner/route.ts)
- [`../app/api/ai/roleplay/dialog/route.ts`](../app/api/ai/roleplay/dialog/route.ts)
- [`../lib/ai/prompts.ts`](../lib/ai/prompts.ts)
- [`../lib/roleplay.ts`](../lib/roleplay.ts)

Explanation:

- The speaking-partner route continues a task-specific academic speaking exchange.
- The roleplay route continues short in-character English dialogue.
- If AI is not configured, both features have local mock or rule-based fallback behavior.

#### F. Buddy Assistant site-navigation support

Code evidence:

- [`../app/api/buddy/assistant/route.ts`](../app/api/buddy/assistant/route.ts)
- [`../lib/buddy-site-guide.ts`](../lib/buddy-site-guide.ts)

Explanation:

- This feature does not call AI on every request.
- It first uses local rule matching against site knowledge.
- Only when the query is non-empty, local confidence is too low, and AI is configured does it call the model.
- This is best described as a rule-first, AI-assisted navigation design.

#### G. Timetable image recognition

Code evidence:

- [`../app/api/schedule/import-image/route.ts`](../app/api/schedule/import-image/route.ts)
- [`../lib/schedule-image-template.ts`](../lib/schedule-image-template.ts)
- [`../tests/schedule-image-template.test.ts`](../tests/schedule-image-template.test.ts)

Explanation:

- The system first tries to recognize a known timetable template locally.
- Only when the template does not match and AI is configured does it send the uploaded image to a vision-capable model for structured extraction.
- This should be described as template-first recognition with AI as a supplementary path.

#### H. Speech transcription

Code evidence:

- [`../app/api/ai/speaking/transcribe/route.ts`](../app/api/ai/speaking/transcribe/route.ts)
- [`../lib/doubao-speech.ts`](../lib/doubao-speech.ts)

Explanation:

- This feature sends learner audio to a configured speech-recognition service.
- The current code supports Doubao speech recognition and non-ZhiPu OpenAI-compatible transcription endpoints.
- Unlike several text-feedback routes, this feature does not have a local offline transcription fallback. If the provider is not configured, the route returns an error.

### 5.3 Honest boundary statements for AI use

Based on the current code, the following statements are accurate and recommended:

- AI is mainly used for feedback, transcription, recognition, roleplay-style practice, and navigation support rather than for every product capability.
- Several features preserve mock, rule-based, or template-recognition fallbacks when AI is unavailable, which improves demo reliability but also means the exact AI experience depends on deployment configuration.
- AI outputs should be presented as learning support and automated feedback, not as official grading, official marking, or final academic judgment.
- Where users submit writing, answers, dialogue, timetable screenshots, or audio, the configured external model provider may process that data. A production deployment should therefore pair AI features with a clear privacy notice.

## 6. AI-Assisted Authorship Disclosure

Code evidence:

- [`../README.md`](../README.md)
- [`../components/home/home-action-entry.tsx`](../components/home/home-action-entry.tsx)
- [`../components/home/buddy-campus-lobby.tsx`](../components/home/buddy-campus-lobby.tsx)
- [`../components/forms/auth-landing-hero.tsx`](../components/forms/auth-landing-hero.tsx)

Explanation:

- The README explicitly states that parts of the `2026 Buddy Campus home refresh` were drafted with AI assistance and then reviewed, edited, and integrated by the project team.
- `home-action-entry.tsx` and `buddy-campus-lobby.tsx` both contain inline AI-assisted authorship notes.
- The sign-in and sign-up welcome illustration uses a filename that explicitly includes `Gemini_Generated_Image`, which supports describing it as an AI-generated visual asset.

Suggested wording:

- "Parts of the 2026 Buddy Campus front-end refresh were drafted with AI assistance and then reviewed, edited, and integrated by the team. The welcome illustration used on the auth entry layout is also an AI-generated image asset."

## 7. Reusable Short-Form Statement

If you need a shorter paragraph for a report, repository page, or presentation, you can reuse the following version:

> This project uses an OpenAI-compatible AI integration for selected functions including writing, reading, listening, and speaking feedback, speaking-roleplay support, timetable image recognition, and speech transcription. AI outputs are used as learning support rather than official assessment. Parts of the 2026 Buddy Campus home refresh were drafted with AI assistance and then reviewed and integrated by the team, and the login/register welcome illustration is an AI-generated image asset. Listening materials keep traceable official source links in code, while in-app fallback audio, questions, model answers, and study prompts are project-generated teaching resources rather than official source recordings or official exam answers.

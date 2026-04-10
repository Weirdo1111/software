# AI Model Usage Guide

This document explains how AI is used in the `English Learn` project, which services are involved, how they are configured, and how the main AI-related flows work in the current codebase.

## 1. Overview

The project uses AI in three main categories:

1. Structured text generation and feedback
2. Realtime voice conversation
3. Speech transcription

These categories do not all use the same provider or the same runtime path.

## 2. AI Architecture Summary

### 2.1 Structured text generation

This part uses an OpenAI-compatible integration layer.

Main entry point:
- [`lib/ai/client.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\lib\ai\client.ts)

Typical environment variables:

```env
AI_API_KEY=
AI_BASE_URL=
AI_MODEL=

OPENAI_API_KEY=
```

In the current team setup, the default shared text model configuration is typically:

```env
AI_API_KEY=...
AI_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
AI_MODEL=glm-4-flash
```

That means the project usually runs structured text generation through a Zhipu GLM endpoint exposed through an OpenAI-compatible API shape.

### 2.2 Realtime voice conversation

`AI dialogue` and `Speaking Test` do not connect directly from the browser to the upstream realtime provider.

The actual path is:

`Browser -> Python realtime bridge -> upstream ByteDance realtime dialogue service`

Main files:
- [`components/discussion/use-realtime-roleplay.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\components\discussion\use-realtime-roleplay.ts)
- [`scripts/roleplay_realtime_bridge.py`](C:\Users\ken\Documents\GitHub\software\english-learn\scripts\roleplay_realtime_bridge.py)
- [`scripts/roleplay_bridge/config.py`](C:\Users\ken\Documents\GitHub\software\english-learn\scripts\roleplay_bridge\config.py)

Typical upstream configuration:

```env
ROLEPLAY_DIALOG_BASE_URL=wss://openspeech.bytedance.com/api/v3/realtime/dialogue
ROLEPLAY_DIALOG_RESOURCE_ID=volc.speech.dialog
```

### 2.3 Speech transcription

Speech transcription is mainly used for:

- speaking-test answer recovery and fallback scoring
- speaking practice audio transcription

The current priority order is:

1. Use `DOUBAO_SPEECH_*` if explicitly configured
2. Otherwise reuse `ROLEPLAY_DIALOG_*` / `ROLEPLAY_DIALOG_SC_*` credentials for ASR
3. Otherwise fall back to a compatible non-Zhipu transcription provider if available

Main files:
- [`app/api/ai/speaking/transcribe/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\speaking\transcribe\route.ts)
- [`lib/doubao-speech.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\lib\doubao-speech.ts)

## 3. AI Features by Route

### 3.1 Writing feedback

Route:
- [`app/api/ai/feedback/writing/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\feedback\writing\route.ts)

Purpose:
- Scores a writing response
- Returns structured errors
- Returns a rewrite sample

Behavior:
- Uses `generateStructuredJSON(...)`
- Returns mock feedback when AI is not configured

### 3.2 Reading feedback

Route:
- [`app/api/ai/feedback/reading/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\feedback\reading\route.ts)

Purpose:
- Generates reading-comprehension feedback
- Reviews claim, evidence, contrast signal, and vocabulary choices

Behavior:
- Uses structured JSON output
- Has a mock fallback when AI is unavailable

### 3.3 Listening feedback

Route:
- [`app/api/ai/feedback/listening/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\feedback\listening\route.ts)

Purpose:
- Generates listening feedback for gist, detail, signpost, terminology, and notes

Behavior:
- Uses structured JSON output
- Has a mock fallback when AI is unavailable

### 3.4 Standard speaking feedback

Route:
- [`app/api/ai/feedback/speaking/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\feedback\speaking\route.ts)

Purpose:
- Scores a speaking response for a selected academic speaking prompt

Behavior:
- Primarily evaluates transcript-based content
- Uses structured JSON output
- Falls back to a mock result when AI is unavailable

### 3.5 Full speaking-test scoring

Route:
- [`app/api/ai/feedback/speaking-test/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\feedback\speaking-test\route.ts)

Purpose:
- Scores the full three-question speaking test

Important rule:
- If one or more answers do not contain a valid transcript, the route switches to `buildMissingTranscriptSpeakingTestFeedback(...)`
- That branch returns `overall_score: 0`

Related logic:
- [`lib/speaking-test.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\lib\speaking-test.ts)

This is why a learner can complete the full test and still receive `0 / 100`: the issue is usually missing transcript capture rather than the scoring model itself.

### 3.6 Text roleplay dialogue

Route:
- [`app/api/ai/roleplay/dialog/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\roleplay\dialog\route.ts)

Purpose:
- Provides non-realtime roleplay conversation

Behavior:
- Uses structured JSON output
- Falls back to a local mock reply when AI is not configured

### 3.7 Text speaking partner

Route:
- [`app/api/ai/speaking/partner/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\speaking\partner\route.ts)

Purpose:
- Provides a text-based speaking partner for guided rehearsal before scoring

Behavior:
- Uses prompt context from the speaking prompt library
- Falls back to a local mock reply when AI is not configured

### 3.8 Realtime AI dialogue and speaking-test examiner

Frontend:
- [`components/discussion/discussion-roleplay-panel.tsx`](C:\Users\ken\Documents\GitHub\software\english-learn\components\discussion\discussion-roleplay-panel.tsx)
- [`components/speaking/speaking-test-module.tsx`](C:\Users\ken\Documents\GitHub\software\english-learn\components\speaking\speaking-test-module.tsx)

Bridge:
- [`scripts/roleplay_realtime_bridge.py`](C:\Users\ken\Documents\GitHub\software\english-learn\scripts\roleplay_realtime_bridge.py)

Bridge configuration:
- [`scripts/roleplay_bridge/config.py`](C:\Users\ken\Documents\GitHub\software\english-learn\scripts\roleplay_bridge\config.py)
- [`scripts/roleplay_bridge/character_profiles.py`](C:\Users\ken\Documents\GitHub\software\english-learn\scripts\roleplay_bridge\character_profiles.py)

Supported realtime characters:
- `wizard_boy`
- `british_codebreaker`
- `pop_star_mentor`
- `pronunciation_teacher`
- `speaking_examiner`

## 4. Environment Variables

### 4.1 Text generation

```env
AI_API_KEY=
AI_BASE_URL=
AI_MODEL=

OPENAI_API_KEY=
```

Notes:
- `AI_API_KEY / AI_BASE_URL / AI_MODEL` are the main text-generation settings
- `OPENAI_API_KEY` is a compatibility fallback
- These are read centrally in [`lib/ai/client.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\lib\ai\client.ts)

### 4.2 Realtime dialogue bridge

```env
ROLEPLAY_DIALOG_APP_ID=
ROLEPLAY_DIALOG_ACCESS_KEY=
ROLEPLAY_DIALOG_APP_KEY=
ROLEPLAY_DIALOG_RESOURCE_ID=volc.speech.dialog
ROLEPLAY_DIALOG_BASE_URL=wss://openspeech.bytedance.com/api/v3/realtime/dialogue
ROLEPLAY_DIALOG_CITY=Beijing
ROLEPLAY_DIALOG_VARIANT=default
```

Optional strong-character configuration:

```env
ROLEPLAY_DIALOG_SC_APP_ID=
ROLEPLAY_DIALOG_SC_ACCESS_KEY=
ROLEPLAY_DIALOG_SC_APP_KEY=
ROLEPLAY_DIALOG_SC_RESOURCE_ID=
ROLEPLAY_DIALOG_SC_BASE_URL=
ROLEPLAY_DIALOG_SC_CITY=
```

### 4.3 Frontend bridge URL

```env
NEXT_PUBLIC_ROLEPLAY_BRIDGE_URL=ws://127.0.0.1:8877
```

Notes:
- Local development usually uses `ws://127.0.0.1:8877`
- Public deployment must use a browser-reachable address such as `wss://your-domain.com/ws/roleplay-bridge`

### 4.4 Voice configuration by character

```env
ROLEPLAY_HARRISON_SPEAKER=
ROLEPLAY_CODEBREAKER_SPEAKER=
ROLEPLAY_POP_STAR_SPEAKER=
ROLEPLAY_TEACHER_SPEAKER=

NEXT_PUBLIC_ROLEPLAY_HARRISON_SPEAKER=
NEXT_PUBLIC_ROLEPLAY_CODEBREAKER_SPEAKER=
NEXT_PUBLIC_ROLEPLAY_POP_STAR_SPEAKER=
NEXT_PUBLIC_ROLEPLAY_TEACHER_SPEAKER=
```

Notes:
- These values control TTS speakers
- They do not control the text model itself

### 4.5 Speech transcription

```env
DOUBAO_SPEECH_APP_ID=
DOUBAO_SPEECH_ACCESS_TOKEN=
DOUBAO_SPEECH_APP_KEY=
DOUBAO_SPEECH_RESOURCE_ID=
```

If these are not configured, the project attempts to reuse `ROLEPLAY_DIALOG_*` values for ASR.

## 5. Runtime Flows

### 5.1 Structured text flow

Main functions:
- `getAIConfig()`
- `createAIClient()`
- `generateStructuredJSON()`

Execution path:

1. Read `AI_API_KEY / AI_BASE_URL / AI_MODEL`
2. Build an OpenAI-compatible client
3. Generate strict JSON from a route-specific prompt
4. Parse, validate, normalize, and return the result

### 5.2 Realtime voice flow

Execution path:

1. The frontend calls `useRealtimeRoleplay(...)`
2. The browser connects to `NEXT_PUBLIC_ROLEPLAY_BRIDGE_URL`
3. The Python bridge connects to the upstream ByteDance realtime dialogue service
4. Audio packets and control text are forwarded through the bridge

### 5.3 Speaking-test flow

Current flow:

1. The examiner delivers questions through the realtime bridge
2. While the learner answers, the frontend captures:
   - browser audio recording
   - live transcript when available
3. When the learner clicks `Over`:
   - the system prefers live transcript
   - if the live transcript is too short or empty, it calls `/api/ai/speaking/transcribe`
4. After all three answers are collected, the frontend calls `/api/ai/feedback/speaking-test`
5. The final structured report is saved

## 6. Local Development and Deployment

### 6.1 Local development

Install:

```bash
npm install
npm run roleplay:bridge:setup
```

Start:

```bash
npm run dev
```

Notes:
- `npm run dev` starts both Next.js and the local realtime bridge

### 6.2 Server deployment

The server setup needs two working parts:

1. The Next.js application
2. The Python realtime bridge

If only Next.js is deployed and the bridge is missing:
- AI dialogue `Connect` will fail
- Speaking Test `Connect` will fail

If deployed publicly:
- `NEXT_PUBLIC_ROLEPLAY_BRIDGE_URL` must not remain `127.0.0.1`

## 7. Common Issues

### 7.1 Why does Speaking Test sometimes end with 0?

The most common cause is missing transcript data.

Relevant files:
- [`app/api/ai/feedback/speaking-test/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\feedback\speaking-test\route.ts)
- [`lib/speaking-test.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\lib\speaking-test.ts)

If transcript capture fails for one or more answers, the route intentionally returns a zero-score placeholder result.

### 7.2 Why does Connect return HTTP 403?

This usually indicates that the upstream realtime credentials were rejected.

Check these first:
- `ROLEPLAY_DIALOG_APP_ID`
- `ROLEPLAY_DIALOG_ACCESS_KEY`
- `ROLEPLAY_DIALOG_APP_KEY`
- `ROLEPLAY_DIALOG_RESOURCE_ID`

### 7.3 Why can teammates not use Connect immediately after cloning?

Because realtime dialogue is not a pure frontend feature. Each machine that runs the project needs:

1. Python
2. `websockets`
3. Working local realtime credentials

### 7.4 Do normal website users need to configure AI keys?

No.

Important distinction:
- Developers running the project locally must prepare the environment once per machine
- Normal users accessing a deployed site do not configure any keys

## 8. Recommended Maintenance Strategy

### 8.1 Keep text-model configuration centralized

Recommended:

```env
AI_API_KEY
AI_BASE_URL
AI_MODEL
```

Benefits:
- All structured feedback routes use the same provider settings
- Provider switching is easier

### 8.2 Keep realtime voice configuration separate

Recommended:

```env
ROLEPLAY_DIALOG_*
ROLEPLAY_DIALOG_SC_*
NEXT_PUBLIC_ROLEPLAY_BRIDGE_URL
```

Benefits:
- Realtime dialogue remains isolated from text-generation settings
- Realtime credential and session issues are easier to debug

## 9. Related Files

### Core configuration

- [`.env.example`](C:\Users\ken\Documents\GitHub\software\english-learn\.env.example)
- [`lib/env.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\lib\env.ts)
- [`lib/ai/client.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\lib\ai\client.ts)

### Text AI routes

- [`app/api/ai/feedback/writing/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\feedback\writing\route.ts)
- [`app/api/ai/feedback/reading/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\feedback\reading\route.ts)
- [`app/api/ai/feedback/listening/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\feedback\listening\route.ts)
- [`app/api/ai/feedback/speaking/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\feedback\speaking\route.ts)
- [`app/api/ai/feedback/speaking-test/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\feedback\speaking-test\route.ts)
- [`app/api/ai/roleplay/dialog/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\roleplay\dialog\route.ts)
- [`app/api/ai/speaking/partner/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\speaking\partner\route.ts)

### Voice and realtime

- [`app/api/ai/speaking/transcribe/route.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\app\api\ai\speaking\transcribe\route.ts)
- [`lib/doubao-speech.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\lib\doubao-speech.ts)
- [`components/speaking/speaking-test-module.tsx`](C:\Users\ken\Documents\GitHub\software\english-learn\components\speaking\speaking-test-module.tsx)
- [`components/discussion/use-realtime-roleplay.ts`](C:\Users\ken\Documents\GitHub\software\english-learn\components\discussion\use-realtime-roleplay.ts)
- [`scripts/roleplay_realtime_bridge.py`](C:\Users\ken\Documents\GitHub\software\english-learn\scripts\roleplay_realtime_bridge.py)
- [`scripts/roleplay_bridge/config.py`](C:\Users\ken\Documents\GitHub\software\english-learn\scripts\roleplay_bridge\config.py)
- [`scripts/roleplay_bridge/character_profiles.py`](C:\Users\ken\Documents\GitHub\software\english-learn\scripts\roleplay_bridge\character_profiles.py)

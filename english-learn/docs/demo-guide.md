# Demo Guide

## Purpose

This document explains how to present `English Learn` in a way that feels polished, intentional, and product-level.

The goal is not just to click through pages. The goal is to tell a coherent story:

- who this product is for
- why it is useful
- what makes it different
- why the implementation feels credible

## Core Demo Narrative

Use this one-sentence framing:

> English Learn is an AI-assisted English platform that combines structured language practice, personalized study flows, and lightweight game-style quests to make learning more effective and more memorable.

That framing works because it covers:

- educational seriousness
- AI relevance
- engagement design
- differentiation

## Best Demo Order

## Path A: Balanced Product Demo

This is the best default path for most audiences.

1. `/`
2. `/learn`
3. `/listening/practice`
4. `/reading`
5. `/progress`
6. `/discussion`
7. `/games`
8. `/games/escape-room`

Why this works:

- starts with product framing
- proves core learning value first
- shows retention and community second
- ends with the most memorable visual module

## Path B: Investor / Judge / Demo Day Flow

Use this when you need stronger impact in less time.

1. `/`
2. `/learn`
3. `/progress`
4. `/games`
5. `/games/escape-room`

Why this works:

- fast product clarity
- immediate proof of breadth
- ends with a module people remember

## Path C: Technical Review Flow

Use this with developers, teachers, or internal reviewers.

1. `/`
2. `/learn`
3. `/listening/practice`
4. `/discussion`
5. `/games/escape-room`
6. explain architecture from `components/escape-room` and `lib/`

Why this works:

- shows real functionality
- shows multiple domains
- gives a strong reason to discuss system design

## Recommended Talking Points by Page

## 1. Home Page

What to say:

- this is not just a landing page; it frames the product around practical English growth
- the app is designed for real learners rather than abstract AI demos
- the product direction is skill-first, not just test-first

What you are proving:

- there is a coherent product identity

## 2. Learning Hub

What to say:

- the app is organized around the core language skills
- the user is not trapped in one rigid course path
- the structure supports both guided learning and modular practice

What you are proving:

- the app has real curriculum logic

## 3. Listening / Reading Modules

What to say:

- we treat comprehension as something to practice repeatedly, not just consume passively
- content and logic are organized so they can scale
- parts of the system already have dedicated tests

What you are proving:

- the product has depth beyond UI polish

## 4. Progress / Review

What to say:

- retention matters as much as content exposure
- the product includes a feedback loop rather than isolated exercises
- the learning system is trying to build continuity

What you are proving:

- there is educational product thinking behind the build

## 5. Discussion / Activity

What to say:

- language learning benefits from interaction, not only solo practice
- the app includes a community or participation layer
- this expands the product from “tool” to “learning environment”

What you are proving:

- the app has ecosystem potential

## 6. Game Center

What to say:

- this is where the product deliberately breaks from generic learning-app conventions
- the game layer is not decoration; it is designed to make English tasks more memorable and more demo-friendly
- the visual system is intentionally separate from the main study product

What you are proving:

- the team can design differentiated experiences

## 7. Midnight Library Escape

What to say:

- this is a browser-based 2D escape-room quest built without a heavy game engine
- it uses hotspot scenes, puzzle state, listening tasks, dialogue tasks, choice quizzes, and a reward loop
- it is still tied to English learning and school/campus context rather than being a random minigame

What you are proving:

- the team can combine product design, frontend interaction, and educational framing

## Best Escape Room Demo Flow

If you are live-demoing the game, use this route:

1. open `/games`
2. show the stage card briefly
3. open `/games/escape-room`
4. mention the timer and objective panel
5. click one easy scene clue
6. show the listening task
7. show the polite-English dialogue task
8. mention the reward flow

If time is short, do not fully play every step live. Instead:

- solve one close-up puzzle
- open one dialogue interaction
- explain the rest of the loop verbally

That keeps the pace strong.

## How to Talk About the AI Layer

Do not oversell the AI.

Better framing:

- AI is used where feedback quality matters
- the product does not depend on AI for every single interaction
- some game modules intentionally use local logic to stay demo-stable and fast

That sounds more mature than saying “everything is AI.”

## How to Talk About the Engineering

Strong framing:

- the codebase is modular by feature
- logic-heavy systems are extracted into reusable helpers and tested
- the game system is componentized rather than hacked into one file
- the repo already supports real product surfaces, not just one demo page

Avoid weak framing like:

- “we just built a bunch of pages”
- “it’s mostly frontend”
- “the backend is kind of mixed”

Instead say:

- the project is in an active product-build phase, with multiple domains already running in parallel

That is much stronger and more honest.

## Audience-Specific Positioning

## For Teachers / Educators

Focus on:

- four-skill structure
- onboarding and placement
- review and retention
- authentic practice
- English tasks embedded in scenarios

## For Technical Reviewers

Focus on:

- App Router organization
- feature-based components
- reusable logic in `lib/`
- tested modules
- game implementation without a heavy engine

## For Product / Startup Audiences

Focus on:

- motivation and retention
- differentiated user experience
- AI as support, not gimmick
- Game Center as a memorable growth/demo layer

## Suggested Live Script

Short version:

> English Learn is an AI-assisted English platform for non-native speakers. It combines structured skill practice with retention systems, community features, and a lightweight quest layer that makes learning more engaging. The Game Center is especially useful for demos because it shows how language tasks can become interactive instead of feeling like worksheets.

Longer version:

> We wanted to build something that feels more like a real product than a set of isolated exercises. So the platform includes onboarding, placement, four-skill practice, progress tracking, review loops, discussion, and even a browser-based educational escape room. The point is not gamification for its own sake. The point is to make English practice more memorable while keeping the academic structure credible.

## Common Demo Mistakes

Avoid these:

- spending too long on setup
- explaining every route in order
- describing implementation before product value
- live-solving the entire game if time is tight
- calling the game “just a gimmick”

Better approach:

- frame the product first
- show one learning module
- show one retention/community signal
- end with the Game Center

## Final Demo Checklist

Before presenting:

- confirm `npm run dev` is already running
- check `/games`
- check `/games/escape-room`
- verify the main route you plan to start on
- keep one or two preselected pages open in tabs
- know your 30-second version and your 2-minute version

## If You Want To Extend This Doc Later

Best future additions:

1. screenshots for each recommended demo step
2. a 60-second pitch version
3. a 3-minute pitch version
4. audience-specific scripts
5. a “what is mocked vs real” appendix

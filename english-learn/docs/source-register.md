# Source Register

Updated: 2026-04-10

This file is the fastest teacher-facing source checklist for the `English Learn` project.

Use this file when you want to verify:

- which third-party platforms and libraries the project directly uses
- which visual assets are official, internal, AI-generated, or only partially traceable
- which learning materials come from external official sources
- which teaching content is project-authored
- where the complete listening-material source list is recorded

For explanatory notes and longer wording guidance, see [./source-attribution-ai-statement.md](./source-attribution-ai-statement.md).

## 1. Coverage and Limits

This register is designed to be clear and auditable, but it is not a replacement for every machine-readable manifest in the repository.

What this register covers:

- direct product-facing dependencies and services
- institutional links and major visual assets used in the product
- official source families for learning materials
- project-authored and project-generated educational content
- the full code-level listening source manifest in Appendix A

What this register does not expand line-by-line:

- every transitive npm dependency in `package-lock.json`
- every single local SVG, PNG, or WAV asset when provenance is identical across a folder
- licensing paperwork that is not stored in the repository

Authoritative repository manifests still include:

- [`../package.json`](../package.json)
- [`../package-lock.json`](../package-lock.json)

## 2. Quick Status Key

| Status | Meaning |
| --- | --- |
| `Direct dependency` | Explicitly declared in `package.json` and used by the product or build stack |
| `Official external source` | The project links to or embeds an official outside source |
| `Project-authored` | Written or designed by the project team inside the repository |
| `Project-generated` | Produced by project tooling or scripts from project-controlled input |
| `AI-generated local asset` | Stored locally in the repo, with AI generation indicated in repo evidence |
| `Partially traceable / inferred` | Usage is clear in code, but original provenance or license paperwork is not separately archived |
| `Configuration-based provider` | The product can use the service, but the exact live provider depends on deployment configuration |

## 3. External Platforms, Services, and Libraries

| Item | Role in project | Official source | Repo evidence | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `package.json` and `package-lock.json` | Full JavaScript dependency manifests | N/A | [`../package.json`](../package.json), [`../package-lock.json`](../package-lock.json) | `Direct dependency` | These files remain the authoritative dependency record for the repository. |
| `Next.js` | Application framework and routing | <https://nextjs.org/> | [`../package.json`](../package.json), [`../app/`](../app), [`../components/`](../components) | `Direct dependency` | Main web application framework. |
| `React` and `react-dom` | UI runtime and component model | <https://react.dev/> | [`../package.json`](../package.json), [`../components/`](../components) | `Direct dependency` | Used across the entire interface layer. |
| `Prisma` | ORM and schema layer | <https://www.prisma.io/> | [`../package.json`](../package.json), [`../lib/prisma.ts`](../lib/prisma.ts), [`../prisma/schema.prisma`](../prisma/schema.prisma) | `Direct dependency` | Used for MySQL-backed persistence. |
| `Supabase` | Auth, storage, and service-backed features | <https://supabase.com/> | [`../package.json`](../package.json), [`../lib/supabase/client.ts`](../lib/supabase/client.ts), [`../lib/supabase/server.ts`](../lib/supabase/server.ts), [`../supabase/`](../supabase) | `Direct dependency` | Used for auth/storage flows and Supabase-backed content paths. |
| `Stripe` | Subscription checkout and webhook handling | <https://stripe.com/> | [`../package.json`](../package.json), [`../app/api/subscription/checkout/route.ts`](../app/api/subscription/checkout/route.ts), [`../app/api/webhooks/stripe/route.ts`](../app/api/webhooks/stripe/route.ts) | `Direct dependency` | Used for billing-related routes. |
| `PostHog` | Product analytics | <https://posthog.com/> | [`../package.json`](../package.json), [`../lib/posthog.ts`](../lib/posthog.ts), [`../components/analytics-provider.tsx`](../components/analytics-provider.tsx) | `Direct dependency` | Browser and server analytics are both referenced. |
| `Sentry` | Error monitoring and tracing | <https://sentry.io/> | [`../package.json`](../package.json), [`../sentry.client.config.ts`](../sentry.client.config.ts), [`../sentry.edge.config.ts`](../sentry.edge.config.ts), [`../sentry.server.config.ts`](../sentry.server.config.ts) | `Direct dependency` | Monitoring is environment-controlled. |
| `OpenAI` SDK / OpenAI-compatible API pattern | Structured AI client for text and vision requests | <https://platform.openai.com/docs/overview> | [`../package.json`](../package.json), [`../lib/ai/client.ts`](../lib/ai/client.ts) | `Direct dependency` | The code uses an OpenAI-compatible pattern, so the live provider may vary. |
| `ZhiPu` compatible endpoint | Optional AI provider path | <https://open.bigmodel.cn/> | [`../lib/ai/client.ts`](../lib/ai/client.ts) | `Configuration-based provider` | Auto-selected when key format matches ZhiPu conventions. |
| `Doubao` / ByteDance OpenSpeech | Optional speech-transcription provider | <https://openspeech.bytedance.com/> | [`../lib/doubao-speech.ts`](../lib/doubao-speech.ts), [`../app/api/ai/speaking/transcribe/route.ts`](../app/api/ai/speaking/transcribe/route.ts) | `Configuration-based provider` | Used only when corresponding credentials are configured. |
| `Zod` | Runtime schema validation | <https://zod.dev/> | [`../package.json`](../package.json), [`../app/api/`](../app/api) | `Direct dependency` | Used heavily across API request validation. |
| `lucide-react` / Lucide | Icon library | <https://lucide.dev/> | [`../package.json`](../package.json), [`../components/`](../components) | `Direct dependency` | Used across product UI and game UI. |
| `xlsx` / SheetJS | Excel and CSV timetable import | <https://sheetjs.com/> | [`../package.json`](../package.json), [`../app/api/schedule/import-excel/route.ts`](../app/api/schedule/import-excel/route.ts) | `Direct dependency` | Used for timetable file parsing. |

## 4. Institutional Links and Visual Assets

| Item | Source / provider | URL or reference | Repo evidence | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| DIICSU official site link | Official institution site | <https://dii.csu.edu.cn/> and <https://dii.csu.edu.cn/EN/HOME.htm> | [`../components/home/home-action-entry.tsx`](../components/home/home-action-entry.tsx) | `Official external source` | Surfaced as a homepage quick link. |
| CSU Library link | Official university library | <https://lib.csu.edu.cn> | [`../components/home/home-action-entry.tsx`](../components/home/home-action-entry.tsx) | `Official external source` | Surfaced as a homepage quick link. |
| University of Dundee Library link | Official university library | <https://www.dundee.ac.uk/library/> | [`../components/home/home-action-entry.tsx`](../components/home/home-action-entry.tsx) | `Official external source` | Surfaced as a homepage quick link. |
| `ddlogo.png` | DIICSU institutional branding asset | Local repository asset | [`../public/dii-brand/ddlogo.png`](../public/dii-brand/ddlogo.png), [`../components/institution-brand.tsx`](../components/institution-brand.tsx) | `Partially traceable / inferred` | Clearly used as official branding in code, but separate provenance paperwork is not archived. |
| `institute-building.jpg` | DIICSU-themed home-page visual | Local repository asset | [`../public/dii-brand/institute-building.jpg`](../public/dii-brand/institute-building.jpg), [`../app/globals.css`](../app/globals.css) | `Partially traceable / inferred` | Used as a branded home-page background. |
| `about-us.jpg` | DIICSU-directed home-page image | <https://dii.csu.edu.cn/EN/ABOUT/Why_DIICSU/Introduction.htm> | [`../public/dii-brand/about-us.jpg`](../public/dii-brand/about-us.jpg), [`../components/home/home-action-entry.tsx`](../components/home/home-action-entry.tsx) | `Partially traceable / inferred` | Used for the home-page `About DIICSU` card that links to an official page. |
| `degree-programmes.jpg` | DIICSU-directed home-page image | <https://dii.csu.edu.cn/EN/ACADEMICS/DegreeProgrammes.htm> | [`../public/dii-brand/degree-programmes.jpg`](../public/dii-brand/degree-programmes.jpg), [`../components/home/home-action-entry.tsx`](../components/home/home-action-entry.tsx) | `Partially traceable / inferred` | Used for the home-page `Degree Programmes` card. |
| `campus-life.jpg` | DIICSU-directed home-page image | <https://dii.csu.edu.cn/EN/CAMPUS_LIFE/Campus_Life.htm> | [`../public/dii-brand/campus-life.jpg`](../public/dii-brand/campus-life.jpg), [`../components/home/home-action-entry.tsx`](../components/home/home-action-entry.tsx) | `Partially traceable / inferred` | Used for the home-page `Campus Life` card. |
| `Gemini_Generated_Image_bjoegbbjoegbbjoe.png` | AI-generated welcome illustration | Local repository asset | [`../public/Gemini_Generated_Image_bjoegbbjoegbbjoe.png`](../public/Gemini_Generated_Image_bjoegbbjoegbbjoe.png), [`../components/forms/auth-landing-hero.tsx`](../components/forms/auth-landing-hero.tsx) | `AI-generated local asset` | AI generation is supported by the filename and actual code usage; full prompt metadata is not archived. |
| Game Center preview images | Local gameplay/demo visuals | Local repository assets | [`../public/game-center/`](../public/game-center), [`../components/games/game-selector-modal.tsx`](../components/games/game-selector-modal.tsx) | `Partially traceable / inferred` | Repository usage is clear; external provenance is not separately documented. |
| Escape-room scene pack, stage covers, and quest audio | Local gameplay/demo assets | Local repository assets | [`../public/quests/escape-room/`](../public/quests/escape-room), [`../docs/architecture.md`](../docs/architecture.md) | `Partially traceable / inferred` | Stored locally and used directly by the game layer; external provenance is not separately archived. |

## 5. Educational Content and Media Sources

| Item | Source / provider | URL or reference | Repo evidence | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Listening library source families | TED, MIT OpenCourseWare, Stanford Engineering Everywhere, University of Oxford Podcasts, NPTEL, Nature Podcast | See Appendix A and [`./listening-material-sourcing.md`](./listening-material-sourcing.md) | [`../lib/authentic-listening-catalog.ts`](../lib/authentic-listening-catalog.ts), [`../lib/listening-materials.ts`](../lib/listening-materials.ts) | `Official external source` | The listening library preserves per-item source labels and official URLs in code. |
| Complete listening-material register | Full per-item source list | See Appendix A below | [`../lib/listening-materials.ts`](../lib/listening-materials.ts), [`../tests/listening-materials.test.ts`](../tests/listening-materials.test.ts) | `Official external source` | Appendix A is the fastest complete list for assessors. |
| Listening fallback audio in `public/audio/listening` | Generated from study text/transcript by project script | Local repository assets | [`../scripts/generate-listening-audio.mjs`](../scripts/generate-listening-audio.mjs), [`../public/audio/listening/`](../public/audio/listening) | `Project-generated` | Used for in-app playback support, not as official source audio. |
| Listening questions, model answers, rubric notes, vocabulary, and note prompts | Internal teaching content written in repo | Local repository code | [`../lib/authentic-listening-catalog.ts`](../lib/authentic-listening-catalog.ts), [`../lib/listening-materials.ts`](../lib/listening-materials.ts) | `Project-authored` | Designed around authentic source materials but not copied as official answer keys. |
| Reading passages | Internal educational content written in repo | Local repository code | [`../lib/reading-articles.ts`](../lib/reading-articles.ts) | `Project-authored` | Not tied to one shared outside source registry in the current implementation. |
| Writing prompts | Internal educational content written in repo | Local repository code | [`../lib/writing-prompts.ts`](../lib/writing-prompts.ts) | `Project-authored` | Project-authored prompt bank. |
| Speaking prompts | Internal educational content written in repo | Local repository code | [`../lib/speaking-prompts.ts`](../lib/speaking-prompts.ts) | `Project-authored` | Project-authored speaking-task bank. |

## 6. AI Services and AI-Assisted Authorship

| Item | Source / provider | URL or reference | Repo evidence | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| OpenAI-compatible AI routing for text and vision | Deployment-configured AI provider | See [`../lib/ai/client.ts`](../lib/ai/client.ts) | [`../lib/ai/client.ts`](../lib/ai/client.ts), [`../app/api/ai/`](../app/api/ai) | `Configuration-based provider` | Used for writing, reading, listening, speaking, roleplay, and timetable image extraction. |
| ZhiPu-compatible model defaults | ZhiPu-compatible API path | <https://open.bigmodel.cn/> | [`../lib/ai/client.ts`](../lib/ai/client.ts) | `Configuration-based provider` | Auto-selected when a matching API key pattern is detected. |
| Doubao speech recognition | ByteDance OpenSpeech | <https://openspeech.bytedance.com/> | [`../lib/doubao-speech.ts`](../lib/doubao-speech.ts), [`../app/api/ai/speaking/transcribe/route.ts`](../app/api/ai/speaking/transcribe/route.ts) | `Configuration-based provider` | Used for speaking transcription when configured. |
| AI-assisted home refresh disclosure | Internal repo disclosure | Local repository notes | [`../README.md`](../README.md), [`../components/home/home-action-entry.tsx`](../components/home/home-action-entry.tsx), [`../components/home/buddy-campus-lobby.tsx`](../components/home/buddy-campus-lobby.tsx) | `Project-authored` | The repository explicitly discloses AI-assisted drafting for parts of the 2026 home refresh. |
| AI-generated auth welcome illustration | Local repository visual asset | Local repository asset | [`../public/Gemini_Generated_Image_bjoegbbjoegbbjoe.png`](../public/Gemini_Generated_Image_bjoegbbjoegbbjoe.png), [`../components/forms/auth-landing-hero.tsx`](../components/forms/auth-landing-hero.tsx) | `AI-generated local asset` | Included here again because it is both a visual asset and an AI disclosure item. |

## Appendix A. Complete Listening Material Source Manifest

The table below is the most direct complete source list for the listening library as represented in the current codebase.

| Material ID | Mode | Major | Title | Source | Official URL |
| --- | --- | --- | --- | --- | --- |
| ted-civil-timber-skyscrapers | ted | Civil Engineering | Why we should build wooden skyscrapers | TED | <https://www.ted.com/talks/michael_green_why_we_should_build_wooden_skyscrapers> |
| ted-civil-green-agenda | ted | Civil Engineering | My green agenda for architecture | TED | <https://www.ted.com/talks/norman_foster_my_green_agenda_for_architecture> |
| ted-maths-best-stats | ted | Mathematics | The best stats you've ever seen | TED | <https://www.ted.com/talks/hans_rosling_the_best_stats_you_ve_ever_seen> |
| ted-maths-data-visualization | ted | Mathematics | The beauty of data visualization | TED | <https://www.ted.com/talks/david_mccandless_the_beauty_of_data_visualization> |
| ted-computing-yolo | ted | Computing Science | How computers learn to recognize objects instantly | TED | <https://www.ted.com/talks/joseph_redmon_how_computers_learn_to_recognize_objects_instantly> |
| ted-computing-deep-learning | ted | Computing Science | Deep learning, neural networks and the future of AI | TED | <https://www.ted.com/talks/yann_lecun_deep_learning_neural_networks_and_the_future_of_ai> |
| ted-mechanical-fast-3d-printing | ted | Mechanical Engineering | What if 3D printing was 100x faster? | TED | <https://www.ted.com/talks/joseph_desimone_what_if_3d_printing_was_100x_faster> |
| ted-mechanical-primer-3d-printing | ted | Mechanical Engineering | A primer on 3D printing | TED | <https://www.ted.com/talks/lisa_harouni_a_primer_on_3d_printing> |
| ted-transport-walkable-city | ted | Mechanical Engineering with Transportation | The walkable city | TED | <https://www.ted.com/talks/jeff_speck_the_walkable_city> |
| ted-transport-walkable-4-ways | ted | Mechanical Engineering with Transportation | 4 ways to make a city more walkable | TED | <https://www.ted.com/talks/jeff_speck_4_ways_to_make_a_city_more_walkable> |
| ted-civil-climate-resilient-buildings | ted | Civil Engineering | How to design climate-resilient buildings | TED | <https://www.ted.com/talks/alyssa_amor_gibbons_how_to_design_climate_resilient_buildings> |
| ted-civil-self-repairing-infrastructure | ted | Civil Engineering | The brilliance of bridges and roads that repair themselves | TED | <https://www.ted.com/talks/mark_miodownik_the_brilliance_of_bridges_and_roads_that_repair_themselves> |
| ted-maths-calculating-risk | ted | Mathematics | How good are you at calculating risk? | TED | <https://www.ted.com/talks/gerd_gigerenzer_how_good_are_you_at_calculating_risk> |
| ted-maths-focus-on-average | ted | Mathematics | What we miss when we focus on the average | TED | <https://www.ted.com/talks/mona_chalabi_what_we_miss_when_we_focus_on_the_average> |
| ted-computing-digital-physical-ai | ted | Computing Science | AI that connects the digital and physical worlds | TED | <https://www.ted.com/talks/anima_anandkumar_ai_that_connects_the_digital_and_physical_worlds> |
| ted-computing-ai-human-brain | ted | Computing Science | Can AI match the human brain? | TED | <https://www.ted.com/talks/surya_ganguli_can_ai_match_the_human_brain> |
| ted-mechanical-next-in-3d-printing | ted | Mechanical Engineering | What's next in 3D printing | TED | <https://www.ted.com/talks/avi_reichental_what_s_next_in_3d_printing> |
| ted-mechanical-manufacturing-revolution | ted | Mechanical Engineering | The next manufacturing revolution is here | TED | <https://www.ted.com/talks/olivier_scalabre_the_next_manufacturing_revolution_is_here> |
| ted-transport-electrify-transport | ted | Mechanical Engineering with Transportation | The billion-dollar campaign to electrify transport | TED | <https://www.ted.com/talks/monica_araya_the_billion_dollar_campaign_to_electrify_transport> |
| ted-transport-driving-less | ted | Mechanical Engineering with Transportation | A carbon-free future starts with driving less | TED | <https://www.ted.com/talks/wayne_ting_a_carbon_free_future_starts_with_driving_less> |
| ted-civil-better-world-2030 | ted | Civil Engineering | How we can make the world a better place by 2030 | TED | <https://www.ted.com/talks/michael_green_how_we_can_make_the_world_a_better_place_by_2030> |
| ted-civil-flood-fighting-landscapes | ted | Civil Engineering | How to transform sinking cities into landscapes that fight floods | TED | <https://www.ted.com/talks/kotchakorn_voraakhom_how_to_transform_sinking_cities_into_landscapes_that_fight_floods> |
| ted-maths-hidden-secret-world | ted | Mathematics | Math is the hidden secret to understanding the world | TED | <https://www.ted.com/talks/roger_antonsen_math_is_the_hidden_secret_to_understanding_the_world> |
| ted-maths-empowered-by-ai | ted | Mathematics | How to get empowered, not overpowered, by AI | TED | <https://www.ted.com/talks/max_tegmark_how_to_get_empowered_not_overpowered_by_ai> |
| ted-computing-brain-science | ted | Computing Science | How brain science will change computing | TED | <https://www.ted.com/talks/jeff_hawkins_how_brain_science_will_change_computing> |
| ted-computing-ai-coder | ted | Computing Science | With AI, anyone can be a coder now | TED | <https://www.ted.com/talks/thomas_dohmke_with_ai_anyone_can_be_a_coder_now> |
| ted-mechanical-printing-human-kidney | ted | Mechanical Engineering | Printing a human kidney | TED | <https://www.ted.com/talks/anthony_atala_printing_a_human_kidney> |
| ted-mechanical-micro-robot | ted | Mechanical Engineering | How you could see inside your body -- with a micro-robot | TED | <https://www.ted.com/talks/alex_luebke_vivek_kumbhari_how_you_could_see_inside_your_body_with_a_micro_robot> |
| ted-transport-better-cities | ted | Mechanical Engineering with Transportation | 7 principles for building better cities | TED | <https://www.ted.com/talks/peter_calthorpe_7_principles_for_building_better_cities> |
| ted-transport-buses-democracy | ted | Mechanical Engineering with Transportation | Why buses represent democracy in action | TED | <https://www.ted.com/talks/enrique_penalosa_why_buses_represent_democracy_in_action> |
| ted-civil-ai-critical-infrastructure | ted | Civil Engineering | The case for regulating AI like critical infrastructure | TED | <https://www.ted.com/talks/paul_scharre_the_case_for_regulating_ai_like_critical_infrastructure> |
| ted-civil-ai-methane-space | ted | Civil Engineering | How AI helps us track methane from space | TED | <https://www.ted.com/talks/vit_ruzicka_how_ai_helps_us_track_methane_from_space> |
| ted-civil-ai-water-use | ted | Civil Engineering | AI consumes a lot of water, but why? | TED | <https://www.ted.com/talks/shaolei_ren_ai_consumes_a_lot_of_water_but_why> |
| ted-civil-rebuild-coastlines | ted | Civil Engineering | Your empty wine bottle could help rebuild coastlines | TED | <https://www.ted.com/talks/franziska_trautmann_your_empty_wine_bottle_could_help_rebuild_coastlines> |
| ted-civil-code-transform-city | ted | Civil Engineering | How light and code can transform a city | TED | <https://www.ted.com/talks/leo_villareal_how_light_and_code_can_transform_a_city> |
| ted-civil-deep-innovation-growth | ted | Civil Engineering | The key to sustainable growth is deep innovation | TED | <https://www.ted.com/talks/lauren_taylor_the_key_to_sustainable_growth_is_deep_innovation> |
| ted-maths-time-technology | ted | Mathematics | 4 lessons on time and technology | TED | <https://www.ted.com/talks/carlo_rovelli_4_lessons_on_time_and_technology> |
| ted-maths-physics-ai-civilization | ted | Mathematics | The future of civilization, powered by physics and AI | TED | <https://www.ted.com/talks/guillaume_verdon_the_future_of_civilization_powered_by_physics_and_ai> |
| ted-maths-collective-intelligence-ai | ted | Mathematics | Can AI help build a collective human intelligence? | TED | <https://www.ted.com/talks/pedro_domingos_can_ai_help_build_a_collective_human_intelligence> |
| ted-maths-ai-2042 | ted | Mathematics | Why 2042 will be a big year for AI | TED | <https://www.ted.com/talks/juergen_schmidhuber_why_2042_will_be_a_big_year_for_ai> |
| ted-maths-science-of-intelligence | ted | Mathematics | The science of intelligence and a bold new principle | TED | <https://www.ted.com/talks/oliver_brock_the_science_of_intelligence_and_a_bold_new_principle> |
| ted-maths-worm-inspired-ai | ted | Mathematics | How a worm could save humanity from bad AI | TED | <https://www.ted.com/talks/ramin_hasani_how_a_worm_could_save_humanity_from_bad_ai> |
| ted-computing-linguistics-future-ai | ted | Computing Science | Lessons from linguistics for the future of AI | TED | <https://www.ted.com/talks/jessica_coon_lessons_from_linguistics_for_the_future_of_ai> |
| ted-computing-ai-sidesteps-science | ted | Computing Science | How AI sidesteps traditional science | TED | <https://www.ted.com/talks/jakob_uszkoreit_how_ai_sidesteps_traditional_science> |
| ted-computing-ai-productivity-paradox | ted | Computing Science | AI's productivity paradox and what it means for you | TED | <https://www.ted.com/talks/ethan_mollick_ai_s_productivity_paradox_and_what_it_means_for_you> |
| ted-computing-ai-transforming-work | ted | Computing Science | How AI is transforming work and everyday life | TED | <https://www.ted.com/talks/tri_dao_how_ai_is_transforming_work_and_everyday_life> |
| ted-computing-black-box-ai | ted | Computing Science | What's inside the black box of AI | TED | <https://www.ted.com/talks/joelle_pineau_what_s_inside_the_black_box_of_ai> |
| ted-computing-ai-just-works | ted | Computing Science | What if AI just works? | TED | <https://www.ted.com/talks/thomas_wolf_what_if_ai_just_works> |
| ted-mechanical-microchips-made | ted | Mechanical Engineering | How are microchips made? | TED | <https://www.ted.com/talks/george_zaidan_and_sajan_saini_how_are_microchips_made> |
| ted-mechanical-joyful-robots | ted | Mechanical Engineering | The wonderful world of joyful robots | TED | <https://www.ted.com/talks/jerome_monceaux_the_wonderful_world_of_joyful_robots> |
| ted-mechanical-robots-heart-mind | ted | Mechanical Engineering | Building robots with heart and mind | TED | <https://www.ted.com/talks/yves_behar_and_christoph_kohstall_building_robots_with_heart_and_mind> |
| ted-mechanical-3d-world-text-prompt | ted | Mechanical Engineering | How to build the 3D world of your dreams with just a text prompt | TED | <https://www.ted.com/talks/kiran_bhat_how_to_build_the_3d_world_of_your_dreams_with_just_a_text_prompt> |
| ted-mechanical-refrigerator-saving-lives | ted | Mechanical Engineering | This refrigerator is saving lives | TED | <https://www.ted.com/talks/norah_magero_this_refrigerator_is_saving_lives> |
| ted-mechanical-pollution-to-products | ted | Mechanical Engineering | How we're turning pollution into toys, toothpaste and more | TED | <https://www.ted.com/talks/xu_hao_how_we_re_turning_pollution_into_toys_toothpaste_and_more> |
| ted-transport-cleaner-cheaper-transport | ted | Mechanical Engineering with Transportation | How to make transportation quieter, cleaner and cheaper | TED | <https://www.ted.com/talks/doreen_orishaba_how_to_make_transportation_quieter_cleaner_and_cheaper> |
| ted-transport-next-generation-pilots | ted | Mechanical Engineering with Transportation | How to empower the next generation of pilots | TED | <https://www.ted.com/talks/refilwe_ledwaba_how_to_empower_the_next_generation_of_pilots> |
| ted-transport-ai-video-games-training | ted | Mechanical Engineering with Transportation | Why we're training AI on video games | TED | <https://www.ted.com/talks/katja_hofmann_why_we_re_training_ai_on_video_games> |
| ted-transport-brain-inspired-ai-system | ted | Mechanical Engineering with Transportation | Meet the AI system inspired by the human brain | TED | <https://www.ted.com/talks/ramin_hasani_meet_the_ai_system_inspired_by_the_human_brain> |
| ted-transport-authenticate-creativity | ted | Mechanical Engineering with Transportation | Can we authenticate human creativity? | TED | <https://www.ted.com/talks/ben_zhao_can_we_authenticate_human_creativity> |
| ted-transport-ai-like-wikipedia | ted | Mechanical Engineering with Transportation | Why AI should be more like Wikipedia | TED | <https://www.ted.com/talks/selena_deckelmann_why_ai_should_be_more_like_wikipedia> |
| civil-bridge-maintenance-cambridge | authentic | Civil Engineering | Lecture 15: Trusses and A^(T)CA | MIT OpenCourseWare | <https://ocw.mit.edu/courses/18-085-computational-science-and-engineering-i-fall-2008/resources/lecture-15-trusses-and-a-t-ca/> |
| civil-built-sustainability-asme | authentic | Civil Engineering | Thermally Induced Lateral Buckling of Subsea Pipelines | University of Oxford Podcasts | <https://podcasts.ox.ac.uk/thermally-induced-lateral-buckling-subsea-pipelines> |
| maths-uncertainty-oxford | authentic | Mathematics | Problems with Probability | University of Oxford Podcasts | <https://podcasts.ox.ac.uk/problems-probability> |
| maths-ai-science-oxford | authentic | Mathematics | Will Computers prove theorems? | University of Oxford Podcasts | <https://podcasts.ox.ac.uk/will-computers-prove-theorems> |
| computing-software-changing-stanford | authentic | Computing Science | Lecture 23: Graph Search Algorithms | Stanford Engineering Everywhere | <https://see.stanford.edu/Course/CS106B/150> |
| computing-ai-healthcare-stanford | authentic | Computing Science | Is AI good for our health? | University of Oxford Podcasts | <https://podcasts.ox.ac.uk/ai-good-our-health> |
| mechanical-nature-3d-printer | authentic | Mechanical Engineering | A rapid, multi-material 3D printer | Nature Podcast | <https://www.nature.com/articles/d41586-019-03507-2> |
| mechanical-czinger-hypercar-asme | authentic | Mechanical Engineering | Modeling Dynamics and Control I: System Modeling Briefing | MIT OpenCourseWare | <https://ocw.mit.edu/courses/2-003-modeling-dynamics-and-control-i-spring-2005/pages/syllabus/> |
| transport-highway-decarbonisation-cambridge | authentic | Mechanical Engineering with Transportation | Zero carbon energy systems | University of Oxford Podcasts | <https://podcasts.ox.ac.uk/zero-carbon-energy-systems> |
| transport-hyperloop-asme | authentic | Mechanical Engineering with Transportation | Lecture 20: Service Reliability | MIT OpenCourseWare | <https://ocw.mit.edu/courses/1-258j-public-transportation-systems-spring-2017/resources/lecture-20-service-reliability/> |
| civil-mit-structural-design | authentic | Civil Engineering | Lab 1 Part A: Data Acquisition and Instruments | MIT OpenCourseWare | <https://ocw.mit.edu/courses/1-103-civil-engineering-materials-laboratory-spring-2004/pages/video-demonstrations/> |
| civil-mit-solid-mechanics | authentic | Civil Engineering | Structural Analysis - I | NPTEL Archive | <https://onlinecourses-archive.nptel.ac.in/noc17_ce25/preview> |
| maths-mit-linear-algebra-vision | authentic | Mathematics | A Vision of Linear Algebra | MIT OpenCourseWare | <https://ocw.mit.edu/courses/res-18-010-a-2020-vision-of-linear-algebra-spring-2020/pages/2021-video/> |
| maths-stanford-linear-systems | authentic | Mathematics | Introduction to Linear Dynamical Systems | Stanford Engineering Everywhere | <https://see.stanford.edu/Course/EE263> |
| computing-mit-dijkstra | authentic | Computing Science | Lecture 16: Dijkstra | MIT OpenCourseWare | <https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-16-dijkstra/> |
| computing-nptel-dsa | authentic | Computing Science | Data Structures And Algorithms | NPTEL | <https://nptel.ac.in/courses/106102064> |
| mechanical-mit-engineering-dynamics | authentic | Mechanical Engineering | Recitation 5: Equations of Motion | MIT OpenCourseWare | <https://ocw.mit.edu/courses/2-003sc-engineering-dynamics-fall-2011/resources/recitation-5-equations-of-motion-1/> |
| mechanical-nptel-strength-materials | authentic | Mechanical Engineering | Strength of Materials | NPTEL | <https://onlinecourses-archive.nptel.ac.in/noc17_ce22/course> |
| transport-mit-public-transport-systems | authentic | Mechanical Engineering with Transportation | Lecture 1: Introduction to Public Transportation Systems | MIT OpenCourseWare | <https://ocw.mit.edu/courses/1-258j-public-transportation-systems-spring-2017/resources/lecture-1-introduction/> |
| transport-nptel-transportation-engineering | authentic | Mechanical Engineering with Transportation | Introduction to Geographic Information Systems | NPTEL Archive | <https://onlinecourses-archive.nptel.ac.in/noc18_ce10/> |

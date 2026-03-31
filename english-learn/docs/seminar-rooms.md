# Seminar Rooms Developer Note

## Purpose

Seminar Rooms extend the existing discussion/forum area with room-based chat, protected access, attachment sharing, and lightweight browser-based voice/video sessions.

The feature is implemented under the existing `discussion` domain so it follows the repository's current architecture instead of introducing a parallel mini-app.

## Schema Additions

Prisma now includes six seminar-specific tables:

- `seminar_rooms`
- `seminar_room_members`
- `seminar_room_messages`
- `seminar_room_attachments`
- `seminar_room_call_participants`
- `seminar_room_call_signals`

Key design decisions:

- protected-room access is persisted through `seminar_room_members`
- room passwords are stored as hashes, reusing the existing `scrypt`-based auth helper pattern
- attachments are stored outside the database and referenced by `storageDriver` + `storagePath`
- archived/closed rooms remain readable but stop accepting new messages
- live-call presence and WebRTC signaling are stored separately so chat history and call state can evolve independently

Migration:

- `prisma/migrations/20260331_add_seminar_rooms/migration.sql`
- `prisma/migrations/20260331_add_seminar_room_calls/migration.sql`

## Routes

### Pages

- `/discussion/seminars`
- `/discussion/seminars/[roomId]`
- `/forum/seminars`
- `/forum/seminars/[roomId]`

`/forum/...` is a compatibility alias that redirects into the `discussion` namespace.

### API

- `GET /api/discussion/seminars/rooms`
- `POST /api/discussion/seminars/rooms`
- `GET /api/discussion/seminars/rooms/[roomId]`
- `PATCH /api/discussion/seminars/rooms/[roomId]`
- `DELETE /api/discussion/seminars/rooms/[roomId]`
- `POST /api/discussion/seminars/rooms/[roomId]/join`
- `GET /api/discussion/seminars/rooms/[roomId]/messages`
- `POST /api/discussion/seminars/rooms/[roomId]/messages`
- `GET /api/discussion/seminars/rooms/[roomId]/attachments/[attachmentId]`
- `POST /api/discussion/seminars/rooms/[roomId]/call/join`
- `POST /api/discussion/seminars/rooms/[roomId]/call/presence`
- `POST /api/discussion/seminars/rooms/[roomId]/call/signal`
- `POST /api/discussion/seminars/rooms/[roomId]/call/leave`

## Auth and Access

- room creation, protected-room join, messaging, room management, and live call actions all require `requireCurrentDiscussionUser()`
- public rooms are readable without auth
- protected rooms require a member record or owner match before messages/attachments are returned
- live call actions require the same room access checks as chat and are blocked once a room is archived/closed
- owner permissions are implemented today; no global moderator/admin role existed in the current schema, so no new cross-product role system was introduced

## Storage

Attachment storage uses a small abstraction in `lib/seminar-room-storage.ts`.

Behavior:

- if `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET_SEMINARS` are available, uploads go to that Supabase Storage bucket
- otherwise files fall back to local disk at `data/seminar-room-attachments/`
- files are always served through an authenticated room-aware API route instead of exposing raw storage paths

This keeps protected-room attachments access-controlled even in local fallback mode.

## Realtime Behavior

The repository did not already contain reusable realtime infrastructure for forum chat.

For v1, room detail and live calls both use incremental polling:

- `GET /api/discussion/seminars/rooms/[roomId]/messages?after=<messageId>`
- `POST /api/discussion/seminars/rooms/[roomId]/call/presence`

Voice/video transport uses native WebRTC peer connections in the browser. The repository keeps the signaling layer inside the existing Next.js API surface instead of adding a separate socket server.

This keeps the feature near real time without adding a separate websocket backend.

## Environment

Optional env var:

```bash
SUPABASE_STORAGE_BUCKET_SEMINARS=
```

If omitted, the feature still works with local file storage.

No extra conference-specific environment variables are required. Browser clients currently use the public Google STUN endpoints bundled in the seminar call panel.

## Attachment Rules

Server-side validation currently allows:

- images
- videos
- audio
- common office/document formats (`pdf`, `doc/docx`, `ppt/pptx`, `xls/xlsx`, `csv`, `txt`, `zip`)

The route enforces MIME and size checks before storage.

## Tradeoffs / Follow-up

- polling-based signaling is simpler than websockets/Supabase Realtime and keeps the implementation inside existing repo patterns, but it is still best suited to small seminar groups rather than large meetings
- protected rooms do not yet support a separate kick/ban model
- owner-only management is intentional because the repo had no established moderator/admin authorization layer for forum data
- local fallback storage is practical for development/demo use, but production should prefer a configured private Supabase Storage bucket
- the current WebRTC setup is mesh-based, so performance will degrade as participant counts grow; if rooms later need larger meetings, move the media layer behind an SFU

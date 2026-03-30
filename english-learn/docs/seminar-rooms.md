# Seminar Rooms Developer Note

## Purpose

Seminar Rooms extend the existing discussion/forum area with room-based chat, protected access, and attachment sharing.

The feature is implemented under the existing `discussion` domain so it follows the repository's current architecture instead of introducing a parallel mini-app.

## Schema Additions

Prisma now includes four seminar-specific tables:

- `seminar_rooms`
- `seminar_room_members`
- `seminar_room_messages`
- `seminar_room_attachments`

Key design decisions:

- protected-room access is persisted through `seminar_room_members`
- room passwords are stored as hashes, reusing the existing `scrypt`-based auth helper pattern
- attachments are stored outside the database and referenced by `storageDriver` + `storagePath`
- archived/closed rooms remain readable but stop accepting new messages

Migration:

- `prisma/migrations/20260331_add_seminar_rooms/migration.sql`

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

## Auth and Access

- room creation, protected-room join, messaging, and room management all require `requireCurrentDiscussionUser()`
- public rooms are readable without auth
- protected rooms require a member record or owner match before messages/attachments are returned
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

For v1, room detail uses incremental polling against:

- `GET /api/discussion/seminars/rooms/[roomId]/messages?after=<messageId>`

This keeps the feature near real time without adding a separate websocket backend.

## Environment

Optional env var:

```bash
SUPABASE_STORAGE_BUCKET_SEMINARS=
```

If omitted, the feature still works with local file storage.

## Attachment Rules

Server-side validation currently allows:

- images
- videos
- audio
- common office/document formats (`pdf`, `doc/docx`, `ppt/pptx`, `xls/xlsx`, `csv`, `txt`, `zip`)

The route enforces MIME and size checks before storage.

## Tradeoffs / Follow-up

- polling is simpler than websockets/Supabase Realtime, but easier to maintain in the current repo
- protected rooms do not yet support a separate kick/ban model
- owner-only management is intentional because the repo had no established moderator/admin authorization layer for forum data
- local fallback storage is practical for development/demo use, but production should prefer a configured private Supabase Storage bucket

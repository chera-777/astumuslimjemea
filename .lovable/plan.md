## Phase 3 — Realtime UX

**1. Realtime chat**
- Enable Realtime on a new `messages` table (id, group_id, user_id, content, created_at).
- RLS: only group members (via profiles.university_id + group membership) can select/insert. For MVP, scope by `university_id` on the profiles table and require auth.
- Frontend: extend `src/pages/Community.tsx` (or Groups) with a chat panel that subscribes via `supabase.channel(...)` inside `useEffect`, cleans up with `removeChannel`.
- Show sender name + timestamp; auto-scroll on new message.

**2. Live event RSVPs**
- Add Realtime publication on existing `event_rsvps` table.
- In Events UI (StudentPortal event cards / EventDetailsDialog), subscribe to `postgres_changes` on `event_rsvps` filtered by event_id.
- Update RSVP count live and reflect current user's RSVP status.

**3. Notification toaster**
- Add Realtime publication on `notifications` table.
- New global component `RealtimeNotificationBridge` mounted in `App.tsx` (like `AzanNotificationBridge`) that subscribes to INSERTs where `user_id = auth.uid()` and calls `toast()` from sonner.

## Phase 4 — Edge Functions

**A. `send-email`** (Resend via connector gateway)
- POST { to, subject, html }
- Zod validation, CORS, verify JWT in code, call `https://connector-gateway.lovable.dev/resend/emails` with `Authorization: Bearer ${LOVABLE_API_KEY}` + `X-Connection-Api-Key: ${RESEND_API_KEY}`.
- From address uses `onboarding@resend.dev` until user verifies a domain.

**B. `send-push`** (OneSignal REST)
- POST { user_ids?, segments?, title, message, url? }
- Uses `ONESIGNAL_APP_ID` + `ONESIGNAL_REST_API_KEY` secrets.
- Admin-only: verifies caller has admin role before sending.

**C. `prayer-times-cache`**
- POST { city, country, method? } → checks a new `prayer_times_cache` table (city, country, date, timings jsonb), returns cached row if today's exists, otherwise fetches from Aladhan API, upserts, returns.
- Reduces external calls; `usePrayerTimes` hook can optionally call this via `supabase.functions.invoke`.

## Technical notes

- Migration adds: `messages` table + grants + RLS + realtime publication; `prayer_times_cache` table + grants + RLS (public read); `ALTER PUBLICATION supabase_realtime ADD TABLE event_rsvps, notifications, messages`.
- All Realtime subscriptions live inside `useEffect` with cleanup — no leaks.
- Edge functions use `npm:@supabase/supabase-js@2/cors` for CORS headers.
- Resend already connected; no new secrets required for Phase 4.

Approve to proceed with the migration + code + edge functions.


# ASTU Muslim Jemea — 6-Phase Completion Plan (7 days)

Goal: ship a production-ready app with a polished UI, a live real-time backend, integrated third-party services, and zero loose ends. Each phase ends with a working, testable milestone.

Before we start building, I need your confirmation on the **API integrations** listed under "Integrations checkpoint" below — I've recommended free/low-cost options for each. Reply with the ones to enable (or say "all defaults") and I'll wire them up.

---

## Phase 1 — Foundations & UI polish (Day 1)
Finish outstanding UI/UX issues so the shell is stable for backend wiring.
- Fixed header verification across every route (sticky, no jitter on scroll).
- Greeting shows real first + last name from `profiles.full_name`; safe fallback.
- Services rail: snap scrolling, larger touch targets, keyboard focus rings — done, verify on mobile viewport.
- Remove any remaining "Redirecting to your portal" flashes (Dashboard.tsx already uses `<Navigate>`).
- Global loading skeletons + empty states for every list view.
- Dark-mode audit — no hardcoded colors; all tokens via `index.css`.

## Phase 2 — Backend schema & RLS hardening (Day 2)
Model the missing domain data and lock down access.
- New tables: `events`, `event_rsvps`, `classes`, `tutoring_sessions`, `challenges`, `challenge_progress`, `announcements`, `notifications`, `chat_messages`, `chat_channels`, `channel_members`, `prayer_reminders`.
- Each table: `GRANT` block + RLS + `updated_at` trigger.
- University-scoped policies using existing `get_user_university()` + `has_role()`.
- Seed data migration for the current portal content (`portalItems.ts` → DB rows).
- Storage buckets: `avatars` (public read, owner write), `event-images` (public read, committee/amir write), `resources` (auth read).

## Phase 3 — Real-time features (Day 3)
Wire Supabase Realtime into the pieces that benefit most.
- `ALTER PUBLICATION supabase_realtime ADD TABLE ...` for chat, notifications, donations, event_rsvps, challenge_progress.
- Community chat (channel list + message stream + typing indicator via Realtime presence).
- Live donation progress bar on Ramadan Meal Fund.
- Live RSVP counts on event cards + admin dashboard tiles.
- Push-style in-app notification toaster (from `notifications` table).

## Phase 4 — Integrations & edge functions (Day 4)
Confirm the integration list first (see checkpoint), then build:
- Prayer times: keep **Aladhan API** (free, no key) — already used; move to an edge function with 24h cache to cut client calls.
- Hijri date + Qibla: Aladhan (same).
- Adhan audio: bundled MP3s (no API), reciter picker done.
- Email (password reset, event invites, admin digests): **Resend** free tier (3k/mo). Needs `RESEND_API_KEY`.
- Push notifications on mobile (Capacitor build): **OneSignal** free tier (unlimited web+mobile). Needs `ONESIGNAL_APP_ID` + REST key.
- AI Q&A ("Ask an Ustadh" helper, Quran/Hadith search assist): **Lovable AI Gateway** (Gemini free through Oct-2025; nominal after). Zero setup.
- Maps for mosque/campus locations: **MapLibre + OpenStreetMap tiles** (free, no key). No secret needed.
- Analytics: **PostHog** free tier (1M events/mo). Needs `VITE_POSTHOG_KEY`.
- SMS reminders (optional, opt-in Amirs only): **Twilio** trial credit. Only if you want it.

## Phase 5 — Portals, gamification & content management (Day 5)
Make each role productive.
- Admin/Amir CMS screens: create/edit events, classes, challenges, announcements, donation campaigns (writes to Phase 2 tables).
- Committee moderation queue: pending khadim registrations, flagged chat messages.
- Student XP engine: DB trigger increments `profiles.xp` on RSVP, challenge completion, daily-check-in; badges table + unlock rules.
- Leaderboards (weekly, all-time) with university filter.
- Profile completion prompt tied to real fields.

## Phase 6 — Hardening, tests, mobile build & launch (Day 6–7)
- Vitest coverage for auth guards, prayer-time logic, reciter selection, RSVP flow, RLS-critical hooks.
- Playwright smoke: sign-in → dashboard → services rail → azan/now with `auto=1` → RSVP → chat.
- Capacitor iOS/Android build: verify background audio + notification tap → `/azan/now?reciter=...&auto=1` on cold start.
- Lighthouse pass (perf/SEO/a11y ≥ 90). Image lazy-load, route-level code split.
- Security scan re-run; migrate leaked-password protection toggle in Supabase dashboard.
- SEO: unique title/description per route, sitemap refresh, JSON-LD for events.
- Publish + monitor via PostHog + Supabase logs.

---

## Integrations checkpoint — please confirm
| # | Purpose | Recommended (free tier) | Needs from you |
|---|---|---|---|
| 1 | Transactional email | **Resend** (3k/mo free) | Approve + I'll request `RESEND_API_KEY` |
| 2 | Mobile push | **OneSignal** (free unlimited) | Approve + app ID & REST key |
| 3 | AI helper | **Lovable AI Gateway** | Nothing — already available |
| 4 | Maps | **MapLibre + OSM** | Nothing |
| 5 | Analytics | **PostHog Cloud** (1M events/mo) | Approve + project key |
| 6 | SMS (optional) | **Twilio** trial | Only if you want SMS |
| 7 | Prayer times | **Aladhan** (already in use) | Nothing |

Reply with which of 1, 2, 5, 6 to enable (or "all defaults = 1+2+3+4+5+7, skip SMS") and I'll start Phase 1 immediately and queue secret requests for the approved ones before Phase 4.

## Technical notes
- All new tables follow the required order: `CREATE TABLE` → `GRANT` → `ENABLE RLS` → `CREATE POLICY`, scoped by `get_user_university()` and `has_role()`.
- Realtime enabled only on tables with RLS to avoid leaking cross-university rows.
- Edge functions used for: prayer-times cache, Resend sender, OneSignal dispatcher, XP awarder (service-role writes only).
- No `service_role` key in the client; all privileged writes go through edge functions with JWT verification.
- Capacitor deep-link handler already exists (`AzanNotificationBridge`); Phase 6 will add OneSignal channel + cold-start test.

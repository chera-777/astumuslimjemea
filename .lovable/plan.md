# Phase 6 — Moderation UI, Gamification & QA polish

Phase 5 shipped the admin dashboard, push, analytics and PWA basics. Phase 6 closes the loops those systems opened: surfacing moderation everywhere content lives, giving users visible reasons to keep engaging, and hardening the app before wider rollout.

Three sub-phases, each independently shippable.

---

## 6A. Moderation reach & safety

The Admin Reports tab exists but users can only report chat messages today. Extend the loop.

- Add report affordances on: announcements (Dashboard + News), events (EventDetailsDialog), user profiles (Profile page header), donations comments if any.
- Add a "Block user" action from any reported message → writes to a new `user_blocks` table; blocked users' messages are hidden client-side in `RealtimeChat`.
- Admin Reports tab gains: filter by target_type, quick-preview of reported content (fetches the target row), and a "Warn user" action that inserts a `notifications` row for the reported author.
- Rate limit: enforce max 5 open reports per reporter per 24h via a DB trigger to prevent abuse.
- Audit log surfaces: link each entry's `target_id` to the relevant admin sub-view.

## 6B. Gamification surfacing

XP fields exist on `profiles` but nothing awards or displays them consistently.

- Award XP on: event RSVP (+5), donation (+10), daily azan interaction (+2, once/day), tasbih 100-count (+3), Quran surah completion (+15).
- New `xp_events` table (user_id, source, delta, meta) as the audit trail; a trigger sums into `profiles.xp`.
- Add a compact XP/streak chip to `AppHeader` (mobile & desktop).
- Profile page: level progress bar, badge grid (existing badges table if present, else derive from milestones), last 10 XP events.
- University leaderboard (top 20 by XP this month) added as a tab in `Community`.
- Respect Halal boundaries: female users only appear on the leaderboard to other female users (RLS scoped by viewer gender via a security-definer view).

## 6C. QA & polish sweep

- Accessibility: audit all icon-only buttons for `aria-label`, ensure focus rings on custom-styled interactive elements, verify `prefers-reduced-motion` on framer-motion pages.
- Empty states: every list view (News, Events, Groups, Khadims, Donations history) gets a friendly empty state with a call-to-action.
- Error boundaries: wrap each lazy route in an ErrorBoundary that shows a retry card instead of a white screen.
- Loading skeletons: replace spinner-only loads on Dashboard, Community, AmirsPortal, CommitteePortal with shadcn `Skeleton` shells.
- SEO: verify every page has `<SEO>` with distinct title/description; add JSON-LD Event schema to event details.
- Console hygiene: remove dev-only `console.log`s; keep `console.error`s.
- Broken-link sweep: run a script that visits every route and reports 404s or missing images.

---

## Technical notes

- New tables: `user_blocks(blocker_id, blocked_id, created_at, unique(blocker,blocked))`, `xp_events(id, user_id, source, delta int, meta jsonb, created_at)`.
- Trigger `award_xp()` on insert to `xp_events` bumps `profiles.xp`.
- Trigger `enforce_report_rate_limit()` on insert to `content_reports`.
- Leaderboard uses a SQL view `v_university_leaderboard` with `SECURITY INVOKER` + a `has_visibility_to(viewer, target)` helper.
- No new secrets. No breaking changes to existing schema.

## Suggested execution order

1. **6A** — highest safety impact, small surface, extends existing tables.
2. **6B** — user-visible engagement win; requires migration + several UI touchpoints.
3. **6C** — final polish pass before broader release.

Approve and I'll start with **6A**.
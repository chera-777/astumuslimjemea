## Phase 5 — Admin dashboard, Push wiring, Analytics, PWA polish

Delivered in 4 sub-phases. Each is independently shippable.

### 5A. Admin dashboard & moderation
- New route `/admin` (admin-only via `ProtectedRoute allowedRoles={["admin"]}`).
- Tabs: **Users** (list profiles + roles, promote/demote, verify), **Content** (flagged messages/announcements/news), **Reports** (user-submitted flags), **Audit log** (append-only trail).
- New tables:
  - `content_reports` (target_type, target_id, reason, reporter_id, status).
  - `audit_log` (actor_id, action, target_type, target_id, meta jsonb).
  - `message_flags` reuses `content_reports`.
- Admin-only RLS + `service_role` grants. Role changes write to `audit_log` via trigger.
- Report button added to `RealtimeChat` messages and news/announcements cards.

### 5B. Push notifications wiring
- Install `react-onesignal`; init in `App.tsx` with `ONESIGNAL_APP_ID` (publishable — exposed via `.env`).
- On sign-in, call `OneSignal.login(user.id)` so admin `send-push` can target by external user id.
- New `push_subscriptions` table (optional mirror of user_id → last_seen) for admin targeting.
- Triggers on `announcements`, `notifications`, and event RSVP thresholds call `send-push` via `pg_net`? — instead, do it client-agnostic: an edge function `on-announcement-created` invoked by a DB trigger via `net.http_post` OR by client after insert. MVP: call from admin UI "Send push" button on new announcement.

### 5C. Analytics & reporting
- New views/queries powering Amir/Committee dashboards:
  - Prayer streaks per university (aggregate of `azan` interactions — if not tracked, skip).
  - Event attendance rate (`event_rsvps` grouped by event).
  - Donation totals + trend (`donations` weekly buckets).
  - Active users (distinct auth per week, via `profiles.updated_at`).
- Recharts line/bar/pie in `AmirsPortal` and `CommitteePortal` under a new "Analytics" tab.
- Server-side aggregation via SQL views with RLS scoping to university.

### 5D. Polish & PWA
- Manifest-only PWA: `public/manifest.webmanifest`, icons (192/512/maskable), `<link rel="manifest">`, `theme-color`, `apple-touch-icon` in `index.html`.
- Capacitor already configured — verify `capacitor.config.ts` still points to preview URL, document `npx cap sync` flow in README.
- Accessibility pass: focus rings on all interactive, aria-labels on icon buttons, `prefers-reduced-motion` respect.
- Perf: lazy-load heavy routes (`Quran`, `Ramadan`, `PrayerTimes`) via `React.lazy` + `Suspense`.

### Technical notes
- Migration adds `content_reports`, `audit_log`, `push_subscriptions` with GRANTs + admin-only RLS.
- Edge fn `on-report-created` (optional) toasts admins via `notifications` insert.
- OneSignal App ID goes to `.env` as `VITE_ONESIGNAL_APP_ID` (publishable).
- No new user-provided secrets required — OneSignal + Resend already set.

### Suggested execution order
1. 5A migration → admin UI.
2. 5D PWA (fast win, no backend).
3. 5B push wiring.
4. 5C analytics.

Approve and I'll start with **5A + 5D** in the next message.

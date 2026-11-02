# Authentication, portal routing and profile fixes

- [ ] Fit authentication pop-ups without vertical scrolling.
- [ ] Open independent Admin and Committee authentication directly after five logo clicks.
- [ ] Route authenticated users to their assigned portal and preserve intentional student access.
- [ ] Make profile details editable and persistent; connect Complete Profile to the editor.
- [ ] Redesign only the Profile name card.
- [ ] Test role rules, profile persistence and form layout; report authenticated verification limits.

## Previous work and external blockers

- [x] Prepare Google sign-in and post-login student profile setup; hide unavailable providers.
- [x] Enforce university/gender boundaries and add Admin Groups & Shifts with real-data student views.
- [x] Run previous regression and public-screen checks.
- [ ] Enable Google in external Supabase (blocked by Google OAuth credentials and dashboard configuration).
- [ ] Create actual named groups/memberships/shifts (blocked: no student profiles or supplied group/shift details).

Hosted settings verified: email enabled; Google, Apple and Facebook disabled. Six real universities exist, but zero student profiles, groups, or shifts. Keep existing profiles; never create fictitious students, volunteer assignments, or privileged accounts. Authenticated browser checks are unavailable for this external Supabase project.
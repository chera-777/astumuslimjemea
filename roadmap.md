# Authentication, portal routing and profile fixes

- [x] Fit authentication pop-ups without vertical scrolling.
- [x] Open independent Admin and Committee authentication directly after five logo clicks.
- [x] Route authenticated users to their assigned portal and preserve intentional student access.
- [x] Make profile details editable and persistent; connect Complete Profile to the editor.
- [x] Redesign only the Profile name card.
- [x] Test role rules, profile persistence and form layout; report authenticated verification limits.

## Previous work and external blockers

- [x] Prepare Google sign-in and post-login student profile setup; hide unavailable providers.
- [x] Enforce university/gender boundaries and add Admin Groups & Shifts with real-data student views.
- [x] Run previous regression and public-screen checks.
- [ ] Enable Google in external Supabase (blocked by Google OAuth credentials and dashboard configuration).
- [ ] Create actual named groups/memberships/shifts (blocked: no student profiles or supplied group/shift details).

Previous hosted settings check: email enabled; Google, Apple and Facebook disabled. The current profile count is two; group creation still needs supplied assignment details. Keep existing profiles; never create fictitious students, volunteer assignments, or privileged accounts. Authenticated browser checks are unavailable for this external Supabase project.

Current verification: 63 tests passed, including staff role checks and profile-save/error handling with mocked Supabase. Public browser checks passed all student registration steps, sign-in, password reset, five-click entry, and both staff forms at 320×568, 390×844, 844×390, 1100×724, and 1280×1800 without form scrolling, clipped controls, or page errors. Live signed-in saves, management permissions, and portal landing flows remain unverified because no managed session is available.
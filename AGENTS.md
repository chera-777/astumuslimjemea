# Project rules

- Use the shared nature-themed application shell and page header for standard pages; keep the Quran reader and fullscreen Azan unadorned to preserve their focused experiences.
- Keep application presentation tokens in global CSS and Tailwind mappings; shared design-system controls inherit those tokens so page colors remain consistent across themes.
- Preserve all existing navigation geometry and data-access behavior during presentation-only redesigns.
- Keep group and volunteer administration in the Admin Groups & Shifts workspace; use the Admin-only directory RPC rather than broadening profile visibility for ordinary students.
- Validate university/gender membership and linked shift ownership with database triggers and RLS; frontend selectors and query filters complement these checks, never replace them.
- Read public provider availability before offering Google OAuth; external Supabase provider credentials are configured in its dashboard, never embedded in frontend code.
- Load profile and role records before finishing session initialization, and require first-time OAuth users without profiles to choose their university and gender without copying privileged metadata.
- Resolve canonical home destinations through the shared assigned-role resolver; staff forms independently authenticate and verify database roles, while RLS remains the authority for management actions.
- Keep profile editing in one allowlisted editor shared by Profile and completion prompts; never submit protected entitlement, verification, role, or university fields from student forms.
- Keep authentication steps short with height-aware layouts rather than scroll containers or clipping; staff authentication does not share student registration controls.
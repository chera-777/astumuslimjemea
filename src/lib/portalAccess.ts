export type StaffPortal = "admin" | "committee";

// Use assigned database roles, never submitted form values or editable metadata.
export function portalHome(roles: readonly string[]): string {
  if (roles.includes("admin")) return "/admin";
  if (roles.includes("committee")) return "/portal/committee";
  if (roles.includes("amir")) return "/portal/amirs";
  if (roles.includes("student")) return "/dashboard";
  if (roles.includes("guest")) return "/portal/guest";
  return "/dashboard";
}

export function canSignInToPortal(roles: readonly string[], portal: StaffPortal): boolean {
  return roles.includes(portal) || (portal === "committee" && roles.includes("admin"));
}

export const studentPortalRoles = ["student", "admin", "amir", "committee"];
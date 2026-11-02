import { describe, expect, it } from "vitest";
import { canSignInToPortal, portalHome, studentPortalRoles } from "@/lib/portalAccess";

describe("Assigned-role portal destinations", () => {
  it("sends admins to Admin, not the student or Amir dashboard", () => {
    expect(portalHome(["student", "amir", "admin"])).toBe("/admin");
  });
  it("sends committee members to their own portal", () => {
    expect(portalHome(["student", "committee"])).toBe("/portal/committee");
  });
  it("keeps the student dashboard as students' home", () => {
    expect(portalHome(["student"])).toBe("/dashboard");
  });
  it("keeps Amir and guest destinations distinct", () => {
    expect(portalHome(["student", "amir"])).toBe("/portal/amirs");
    expect(portalHome(["guest"])).toBe("/portal/guest");
  });
  it("does not grant a staff role through the choice of sign-in form", () => {
    expect(canSignInToPortal(["student"], "admin")).toBe(false);
    expect(canSignInToPortal(["student"], "committee")).toBe(false);
    expect(canSignInToPortal(["committee"], "admin")).toBe(false);
    expect(canSignInToPortal(["admin"], "admin")).toBe(true);
    expect(canSignInToPortal(["committee"], "committee")).toBe(true);
  });
  it("preserves intentional Student access for all management roles", () => {
    for (const role of ["student", "admin", "amir", "committee"]) expect(studentPortalRoles.includes(role)).toBe(true);
  });
});
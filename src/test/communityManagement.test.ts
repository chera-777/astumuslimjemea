import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { membershipError, shiftUniversityError, bookedShiftStats } from "@/lib/communityManagement";

describe("University student assignment rules", () => {
  const group = { university_id: "ASTU", gender: "male" };
  it("rejects a member from a different university", () => {
    expect(membershipError(group, { university_id: "AAU", gender: "male" }, 0)).not.toBeNull();
    expect(membershipError(group, { university_id: "ASTU", gender: "male" }, 0)).toBeNull();
  });
  it("preserves gender-separated memberships", () => {
    expect(membershipError(group, { university_id: "ASTU", gender: "female" }, 0)).not.toBeNull();
  });
  it("allows a fourteenth student but rejects a fifteenth", () => {
    expect(membershipError(group, group, 13)).toBeNull();
    expect(membershipError(group, group, 14)).not.toBeNull();
  });
  it("requires shift, registration and student to share one university", () => {
    expect(shiftUniversityError("ASTU", { university_id: "ASTU" }, { university_id: "AAU" })).not.toBeNull();
    expect(shiftUniversityError("ASTU", { university_id: "AAU" }, { university_id: "ASTU" })).not.toBeNull();
    expect(shiftUniversityError("ASTU", group, group)).toBeNull();
  });
  it("derives Ittikaf counts from booked shifts, not sample figures", () => {
    expect(bookedShiftStats([], "2026-10-23")).toEqual({ upcoming: 0, past: 0, ittikaf: 0 });
    expect(bookedShiftStats([{ assigned_date: "2026-10-24", assigned_role: "ittikaf_support" }, { assigned_date: "2026-10-22", assigned_role: "ittikaf_support" }], "2026-10-23")).toEqual({ upcoming: 1, past: 1, ittikaf: 1 });
  });
});
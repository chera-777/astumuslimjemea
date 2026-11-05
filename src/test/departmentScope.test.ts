import { describe, it, expect } from "vitest";
import { groupMatchesStudent } from "@/lib/astuDepartments";
import { membershipError } from "@/lib/communityManagement";

const cse3 = { department: "Computer Science & Engineering", batch_year: "3rd year" };

describe("department + class year group scope", () => {
  it("shows a group of the same department and year", () => {
    expect(groupMatchesStudent({ department: "Computer Science & Engineering", academic_year: "3rd year" }, cse3)).toBe(true);
  });
  it("hides a group of another department", () => {
    expect(groupMatchesStudent({ department: "Civil Engineering", academic_year: "3rd year" }, cse3)).toBe(false);
  });
  it("hides a group of another class year", () => {
    expect(groupMatchesStudent({ department: "Computer Science & Engineering", academic_year: "1st year" }, cse3)).toBe(false);
  });
  it("shows groups without a department to the whole university", () => {
    expect(groupMatchesStudent({ department: null, academic_year: null }, cse3)).toBe(true);
  });
  it("blocks adding a student from another department", () => {
    const group = { university_id: "u", gender: "male", department: "Civil Engineering", academic_year: null };
    expect(membershipError(group, { university_id: "u", gender: "male", ...cse3 }, 0)).toMatch(/department/);
  });
});

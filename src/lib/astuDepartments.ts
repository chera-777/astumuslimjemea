// ASTU schools and departments (public list). Group visibility matches on these exact names.
export const ASTU_SCHOOLS: { school: string; departments: string[] }[] = [
  { school: "Freshman Program", departments: ["Freshman (Pre-Engineering)", "Freshman (Applied Science)"] },
  { school: "Electrical Engineering & Computing", departments: ["Computer Science & Engineering", "Electrical Power & Control Engineering", "Electronics & Communication Engineering"] },
  { school: "Mechanical, Chemical & Materials Engineering", departments: ["Mechanical Engineering", "Chemical Engineering", "Materials Science & Engineering"] },
  { school: "Civil Engineering & Architecture", departments: ["Civil Engineering", "Water Resources Engineering", "Architecture"] },
  { school: "Applied Natural Science", departments: ["Applied Biology", "Applied Chemistry", "Applied Geology", "Applied Mathematics", "Applied Physics", "Pharmacy"] },
  { school: "Humanities & Social Science", departments: ["Humanities & Social Science"] },
];

export const ASTU_DEPARTMENTS = ASTU_SCHOOLS.flatMap(s => s.departments);
export const CLASS_YEARS = ["1st year", "2nd year", "3rd year", "4th year", "5th year"];

/** Mirrors the database rule: blank department/year on a group means "everyone". */
export function groupMatchesStudent(
  group: { department?: string | null; academic_year?: string | null },
  student: { department?: string | null; batch_year?: string | null },
) {
  const dep = !group.department || group.department.toLowerCase() === (student.department ?? "").toLowerCase();
  const yr = !group.academic_year || group.academic_year === (student.batch_year ?? "");
  return dep && yr;
}

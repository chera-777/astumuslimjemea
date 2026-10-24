import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type StudentRecord = { id: string; full_name: string; gender: string; university_id: string; batch_year: string | null; department: string | null; is_verified: boolean };
export type StudentGroup = Tables<"student_groups">;
export type GroupMember = Tables<"group_members">;
export type Volunteer = Tables<"khadim_registrations">;
export type BookedShift = Tables<"khadim_schedule">;
export const GROUP_ROLES = ["Member", "Amir", "Naqeeb", "Murshid"] as const;
export const SERVICE_ROLES = [
  { id: "meal_card", label: "Meal Card Ticking" },
  { id: "food_serving", label: "Food Serving" },
  { id: "drinks", label: "Water & Drinks" },
  { id: "cleaning", label: "Cleaning" },
  { id: "ittikaf_support", label: "Ittikaf Support" },
] as const;

export function membershipError(group: Pick<StudentGroup, "university_id" | "gender">, student: Pick<StudentRecord, "university_id" | "gender">, count: number) {
  if (group.university_id !== student.university_id) return "Student and group must belong to the same university.";
  if (group.gender.toLowerCase() !== student.gender.toLowerCase()) return "Student and group must have the same gender.";
  if (count >= 14) return "A group can have at most 14 students.";
  return null;
}

export function shiftUniversityError(universityId: string, volunteer: Pick<Volunteer, "university_id">, student: Pick<StudentRecord, "university_id">) {
  return universityId === volunteer.university_id && universityId === student.university_id ? null : "Shift and volunteer must belong to the same university.";
}

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function bookedShiftStats(shifts: Pick<BookedShift, "assigned_date" | "assigned_role">[], today: string) {
  return {
    upcoming: shifts.filter(s => s.assigned_date >= today).length,
    past: shifts.filter(s => s.assigned_date < today).length,
    ittikaf: shifts.filter(s => s.assigned_date >= today && s.assigned_role === "ittikaf_support").length,
  };
}

export async function loadAllGroups(universityId?: string, gender?: string) {
  const rows: StudentGroup[] = [];
  for (let offset = 0; ; offset += 500) {
    let query = supabase.from("student_groups").select("*").order("id").range(offset, offset + 499);
    if (universityId) query = query.eq("university_id", universityId);
    if (gender) query = query.eq("gender", gender);
    const { data, error } = await query;
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < 500) break;
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadAdminCommunity() {
  const directory: StudentRecord[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.rpc("admin_student_directory").range(offset, offset + 499);
    if (error) throw error;
    directory.push(...(data ?? []));
    if ((data?.length ?? 0) < 500) break;
  }
  const [groups, universities, members, volunteers, shifts] = await Promise.all([
    loadAllGroups(),
    supabase.from("universities").select("*").order("name"),
    loadMembers(), loadVolunteers(), loadShifts(),
  ]);
  if (universities.error) throw universities.error;
  return { students: directory, groups, universities: universities.data ?? [], members, volunteers, shifts };
}

async function loadMembers() {
  const rows: GroupMember[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from("group_members").select("*").order("id").range(offset, offset + 499);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < 500) return rows;
  }
}
async function loadVolunteers() {
  const rows: Volunteer[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from("khadim_registrations").select("*").order("id").range(offset, offset + 499);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < 500) return rows;
  }
}
async function loadShifts() {
  const rows: BookedShift[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from("khadim_schedule").select("*").order("assigned_date").order("id").range(offset, offset + 499);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < 500) return rows;
  }
}
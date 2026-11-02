import { describe, expect, it } from "vitest";
import { profileCompletion, profileDraft, profileUpdate } from "@/lib/profileDetails";

describe("Editable student profile details", () => {
  it("saves student ID and personal and academic fields, trimmed", () => {
    const draft = profileDraft({ full_name: " Chera Kemal ", gender: "male", student_id: " ASTU-123 ", department: " Computing ", batch_year: "2026", phone: "+251900000000" });
    expect(profileUpdate(draft)).toMatchObject({ full_name: "Chera Kemal", student_id: "ASTU-123", department: "Computing", batch_year: "2026", phone: "+251900000000" });
  });
  it("does not include protected fields in student updates", () => {
    const draft = profileDraft({ full_name: "Chera Kemal", gender: "male", university_id: "protected-university", is_verified: true, is_cafe_student: true });
    const update = profileUpdate(draft);
    expect(update).not.toHaveProperty("university_id");
    expect(update).not.toHaveProperty("is_verified");
    expect(update).not.toHaveProperty("is_cafe_student");
    expect(update).not.toHaveProperty("role");
  });
  it("allows removal of optional details but requires name and gender", () => {
    const draft = profileDraft({ full_name: "Chera Kemal", gender: "male" });
    expect(profileUpdate(draft).student_id).toBeNull();
    expect(() => profileUpdate({ ...draft, full_name: " " })).toThrow();
    expect(() => profileUpdate({ ...draft, gender: "" })).toThrow();
  });
  it("rejects executable or insecure image and document links", () => {
    const draft = profileDraft({ full_name: "Chera Kemal", gender: "male" });
    expect(() => profileUpdate({ ...draft, id_card_url: "javascript:alert(1)" })).toThrow();
    expect(() => profileUpdate({ ...draft, profile_photo_url: "http://example.com/photo.jpg" })).toThrow();
    expect(profileUpdate({ ...draft, profile_photo_url: "https://example.com/photo.jpg" }).profile_photo_url).toBe("https://example.com/photo.jpg");
  });
  it("uses the same completion calculation for profile and reminder", () => {
    expect(profileCompletion(null)).toBe(0);
    expect(profileCompletion({ full_name: "Chera Kemal", gender: "male", phone: " ", student_id: "ASTU-123" })).toBe(43);
    expect(profileCompletion({ full_name: "Chera Kemal", gender: "male", phone: "123", department: "Computing", batch_year: "2026", student_id: "ASTU-123", profile_photo_url: "https://example.com/photo.jpg" })).toBe(100);
  });
});
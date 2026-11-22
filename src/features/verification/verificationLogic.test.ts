import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  checkConsistency,
  evaluatePortalCandidates,
  extractIdMetadataFromText,
  getVerificationProgress,
  normalizeFullName,
  scoreNameSimilarity,
  validateAstuStudentId,
} from "./verificationLogic.ts";

describe("verificationLogic", () => {
  it("normalizes Ethiopian/ASTU full names and scores similarity", () => {
    const norm = normalizeFullName("  Brother Yusuf   Mohammed Kedir ");
    assert.equal(norm.normalized, "yusuf mohammed kedir");
    assert.equal(scoreNameSimilarity("Yusuf Mohammed Kedir", "yusuf mohammed kedir"), 1);
    assert.ok(scoreNameSimilarity("Yusuf Mohammed", "Yusuf Mohammed Kedir") < 0.8);
    assert.equal(scoreNameSimilarity("Yusuf", "Yusuf Mohammed"), 0);
  });

  it("evaluates portal candidates for unique, ambiguous, and empty matches", () => {
    const candidates = [
      {
        officialFullName: "Yusuf Mohammed Kedir",
        department: "Computer Science & Engineering",
        admissionYear: "2022/23 (2015 E.C.)",
        enrollmentStatus: "active" as const,
      },
      {
        officialFullName: "Yusuf Mohammed Ahmed",
        department: "Mechanical Engineering",
        admissionYear: "2021/22 (2014 E.C.)",
        enrollmentStatus: "active" as const,
      },
    ];

    const unique = evaluatePortalCandidates("Yusuf Mohammed Kedir", null, candidates);
    assert.equal(unique.kind, "unique_match");

    const ambiguous = evaluatePortalCandidates(
      "Yusuf Mohammed Kedir",
      "Civil Engineering",
      [
        ...candidates,
        {
          officialFullName: "Yusuf Mohammed Kedir",
          department: "Architecture",
          admissionYear: "2023/24",
          enrollmentStatus: "active",
        },
      ]
    );
    assert.equal(ambiguous.kind, "ambiguous");

    const none = evaluatePortalCandidates("Abebe Bikila Tessema", null, candidates);
    assert.equal(none.kind, "no_match");
  });

  it("validates ASTU UGR/ETS student IDs and extracts metadata", () => {
    const valid = validateAstuStudentId("ugr/25412/14");
    assert.equal(valid.valid, true);
    assert.equal(valid.normalized, "UGR/25412/14");
    assert.match(valid.admissionYearLabel ?? "", /2014 E\.C\./);

    const invalid = validateAstuStudentId("12345");
    assert.equal(invalid.valid, false);

    const extracted = extractIdMetadataFromText(
      "ADAMA SCIENCE AND TECHNOLOGY UNIVERSITY UGR / 30111 / 15 Computer Science & Engineering",
      ["Computer Science & Engineering", "Civil Engineering"]
    );
    assert.equal(extracted.studentId, "UGR/30111/15");
    assert.equal(extracted.department, "Computer Science & Engineering");
  });

  it("checks consistency and computes 7-status workflow progress", () => {
    const consistency = checkConsistency(
      {
        fullName: "Yusuf Mohammed Kedir",
        studentId: "UGR/25412/14",
        department: "Computer Science & Engineering",
      },
      {
        officialFullName: "Yusuf Mohammed Kedir",
        studentId: "UGR/25412/14",
        department: "Mechanical Engineering",
      }
    );
    assert.equal(consistency.consistent, false);
    assert.deepEqual(consistency.matchedFields, ["Full name", "Student ID"]);
    assert.equal(consistency.mismatches.length, 1);

    assert.equal(getVerificationProgress("unverified").percent, 15);
    assert.equal(getVerificationProgress("additional_identification_required").needsAdditionalId, true);
    assert.equal(getVerificationProgress("pending_admin_review").isPendingReview, true);
    assert.equal(getVerificationProgress("automatically_verified").isVerified, true);
    assert.equal(getVerificationProgress("verified").percent, 100);
    assert.equal(getVerificationProgress("rejected").isRejected, true);
  });
});

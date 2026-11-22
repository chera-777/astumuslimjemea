import type { CommitteeMeeting } from "./types";

export const COMMITTEE_ALLOWED_ROLES = ["committee", "amir", "admin"] as const;

export class CommitteeAccessError extends Error {
  readonly code = "FORBIDDEN";
  constructor(message = "Access restricted to authorized Ashura Committee members and Amirs.") {
    super(message);
    this.name = "CommitteeAccessError";
  }
}

export function isCommitteeAuthorized(roles: readonly string[]): boolean {
  return roles.some((role) =>
    (COMMITTEE_ALLOWED_ROLES as readonly string[]).includes(role)
  );
}

export function isAmirOrAdmin(roles: readonly string[]): boolean {
  return roles.includes("amir") || roles.includes("admin");
}

export function assertCommitteeAccess(roles: readonly string[], action: string): void {
  if (!isCommitteeAuthorized(roles)) {
    throw new CommitteeAccessError(
      `Unauthorized to ${action}. Ashura Committee or Amir authorization is required.`
    );
  }
}

export function canManageCommitteeMeeting(
  roles: readonly string[],
  userId: string,
  meeting: CommitteeMeeting
): boolean {
  if (!isCommitteeAuthorized(roles)) return false;
  return meeting.hostId === userId || isAmirOrAdmin(roles);
}

export function canAccessMeetingRecord(
  roles: readonly string[],
  userId: string,
  meeting: CommitteeMeeting
): boolean {
  if (!isCommitteeAuthorized(roles)) return false;
  if (isAmirOrAdmin(roles)) return true;
  return (
    meeting.hostId === userId ||
    meeting.invitedUserIds.includes(userId) ||
    meeting.participants.some((p) => p.userId === userId)
  );
}

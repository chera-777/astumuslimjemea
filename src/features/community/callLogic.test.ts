import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyCallStatusTransition,
  buildCallRoute,
  buildIceServers,
  detectActiveSpeakerId,
  formatCallDuration,
  getVideoGridLayoutClass,
  resolveCallScope,
  resolveTerminateStatus,
  type CallRecord,
} from "./callLogic.ts";

function makeSampleCall(overrides: Partial<CallRecord> = {}): CallRecord {
  return {
    id: "call-100",
    conversationId: "conv-1",
    title: "Yusuf Kedir",
    avatarInitials: "YK",
    avatarColor: "from-teal-600 to-cyan-700",
    conversationType: "direct",
    callScope: "direct",
    mediaKind: "voice",
    status: "ringing",
    direction: "outgoing",
    callerId: "user-me",
    calleeIds: ["user-yusuf"],
    participants: [],
    startedAt: "2026-11-19T10:00:00.000Z",
    durationSec: 0,
    ...overrides,
  };
}

describe("callLogic", () => {
  it("builds independent routes for voice, video, and group calls", () => {
    assert.equal(resolveCallScope("direct"), "direct");
    assert.equal(resolveCallScope("group"), "group");
    assert.equal(resolveCallScope("channel"), "channel");

    assert.equal(
      buildCallRoute({ id: "abc", mediaKind: "voice", conversationType: "direct" }),
      "/calls/voice/abc"
    );
    assert.equal(
      buildCallRoute({ id: "abc", mediaKind: "video", conversationType: "direct" }),
      "/calls/video/abc"
    );
    assert.equal(
      buildCallRoute({ id: "grp-1", mediaKind: "voice", conversationType: "group" }),
      "/calls/group/grp-1"
    );
    assert.equal(
      buildCallRoute({ id: "ch-1", mediaKind: "video", conversationType: "channel" }),
      "/calls/video/ch-1"
    );
  });

  it("handles status transitions and computes call duration on end", () => {
    const ringing = makeSampleCall();
    const active = applyCallStatusTransition(ringing, "active", "2026-11-19T10:00:10.000Z");
    assert.equal(active.status, "active");
    assert.equal(active.answeredAt, "2026-11-19T10:00:10.000Z");

    const ended = applyCallStatusTransition(active, "ended", "2026-11-19T10:02:15.000Z");
    assert.equal(ended.status, "ended");
    assert.equal(ended.durationSec, 125);

    // Terminal states are immutable
    const afterTerminal = applyCallStatusTransition(ended, "active", "2026-11-19T10:03:00.000Z");
    assert.equal(afterTerminal.status, "ended");
  });

  it("resolves ringing termination outcomes accurately", () => {
    assert.equal(
      resolveTerminateStatus({ currentStatus: "ringing", actor: "caller", reason: "hangup" }),
      "cancelled"
    );
    assert.equal(
      resolveTerminateStatus({ currentStatus: "ringing", actor: "callee", reason: "decline" }),
      "declined"
    );
    assert.equal(
      resolveTerminateStatus({ currentStatus: "ringing", actor: "system", reason: "timeout" }),
      "missed"
    );
    assert.equal(
      resolveTerminateStatus({ currentStatus: "active", actor: "caller", reason: "hangup" }),
      "ended"
    );
  });

  it("formats duration with hours when needed and configures ICE servers", () => {
    assert.equal(formatCallDuration(5), "0:05");
    assert.equal(formatCallDuration(125), "2:05");
    assert.equal(formatCallDuration(3665), "1:01:05");

    const stunOnly = buildIceServers();
    assert.equal(stunOnly.length, 1);

    const withTurn = buildIceServers({
      turnUrl: "turn:turn.campus.et:3478",
      turnUsername: "astu",
      turnCredential: "secret",
    });
    assert.equal(withTurn.length, 2);
    assert.equal(withTurn[1].username, "astu");
  });

  it("selects grid layout and detects active unmuted speaker", () => {
    assert.match(getVideoGridLayoutClass(1), /grid-cols-1/);
    assert.match(getVideoGridLayoutClass(3), /sm:grid-cols-2/);
    assert.match(getVideoGridLayoutClass(6), /lg:grid-cols-3/);

    const speaker = detectActiveSpeakerId(
      { "u-1": 0.45, "u-2": 0.25 },
      new Set(["u-1"]),
      null
    );
    assert.equal(speaker, "u-2");
  });
});

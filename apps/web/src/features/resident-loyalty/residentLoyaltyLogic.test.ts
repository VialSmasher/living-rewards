import assert from "node:assert/strict";
import test from "node:test";
import { calculateResidentPoints, POINT_RULES } from "./residentLoyaltyLogic";
import type { ResidentEvent, RewardRedemption } from "./types";

test("resident points include awarded events and subtract approved rewards", () => {
  const events: ResidentEvent[] = [
    {
      id: "event-1",
      residentId: "resident-1",
      buildingId: "building-1",
      unitId: "unit-1",
      eventType: "notice_acknowledged",
      pointsAwarded: POINT_RULES.notice_acknowledged,
      metadata: {},
      createdAt: "2026-06-01T12:00:00.000Z"
    },
    {
      id: "event-2",
      residentId: "resident-1",
      buildingId: "building-1",
      unitId: "unit-1",
      eventType: "access_confirmed",
      pointsAwarded: POINT_RULES.access_confirmed,
      metadata: {},
      createdAt: "2026-06-02T12:00:00.000Z"
    }
  ];

  const redemptions: RewardRedemption[] = [
    {
      id: "redemption-1",
      residentId: "resident-1",
      buildingId: "building-1",
      rewardId: "reward-1",
      status: "approved",
      pointCost: 100,
      valueLabel: "$10",
      requestedAt: "2026-06-03T12:00:00.000Z",
      approvedAt: "2026-06-04T12:00:00.000Z"
    }
  ];

  assert.equal(calculateResidentPoints("resident-1", events, redemptions), 75);
});

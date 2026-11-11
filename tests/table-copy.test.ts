import { describe, it, expect } from "vitest";
import { newGame } from "../lib/game";
import { tableMessage, teamName } from "../lib/table-copy";
import type { View } from "../lib/protocol";
function view(overrides: Partial<View> = {}): View {
  const { hands, ...game } = newGame();
  return {
    ...game,
    phase: "play",
    room: "testroom",
    you: 0,
    host: true,
    hand: [],
    counts: [8, 8, 8, 8],
    paused: false,
    seats: ["Heshan", "Amal", "Nimali", "Kasun"].map((name) => ({
      name,
      ready: true,
      connected: true,
    })),
    ...overrides,
  };
}
describe("actionable game instructions", () => {
  it("names every disconnected player rather than hiding the reason for a pause", () => {
    const v = view({ paused: true });
    v.seats[1]!.connected = false;
    v.seats[3]!.connected = false;
    const message = tableMessage(v, "connected");
    expect(message.headline).toBe("Game paused");
    expect(message.detail).toContain("Amal and Kasun");
    expect(message.detail).toContain("reconnect");
  });
  it("tells the local player to reconnect instead of blaming stale opponent state", () => {
    const message = tableMessage(view({ paused: true }), "disconnected");
    expect(message.headline).toBe("You’re disconnected");
    expect(message.detail).toContain("Reconnect");
  });
  it("only requires the led suit when the current player can follow it", () => {
    const v = view({
      turn: 0,
      trick: [{ seat: 3, card: { id: "hearts-7", suit: "hearts", rank: 7 } }],
      hand: [{ id: "hearts-14", suit: "hearts", rank: 14 }],
    });
    expect(tableMessage(v, "connected").detail).toContain("Play a heart card");
    v.hand = [{ id: "clubs-14", suit: "clubs", rank: 14 }];
    expect(tableMessage(v, "connected").detail).toContain(
      "You can play any card",
    );
    v.turn = 1;
    expect(tableMessage(v, "connected").detail).toContain("Your cards unlock");
  });
  it("identifies teams from the viewer’s seat, preserving numbered teams for spectators", () => {
    expect(teamName(1, 3)).toBe("Your team");
    expect(teamName(0, 3)).toBe("Other team");
    expect(teamName(0, null)).toBe("Team 1");
  });
});

it("does not describe a finished match as paused when players leave", () => {
  const v = view({
    phase: "finished",
    paused: true,
    result: { winner: 0, tokens: 1, tricks: [5, 3], message: "" },
  });
  expect(tableMessage(v, "connected").headline).toContain("wins the match");
  expect(tableMessage(v, "connected").detail).toContain("return");
});
it("does not promise spectators a hand or a turn", () => {
  expect(
    tableMessage(view({ you: null, turn: 1 }), "connected").detail,
  ).toContain("watching");
  expect(
    tableMessage(view({ you: null, phase: "trump" }), "connected").detail,
  ).not.toContain("You’ll receive");
});

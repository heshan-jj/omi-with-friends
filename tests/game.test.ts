import { describe, expect, it } from "vitest";
import {
  beginHand,
  chooseTrump,
  deck,
  legalCards,
  newGame,
  playCard,
  settleTrick,
  shuffle,
  trickWinner,
  type Card,
  type Game,
} from "../lib/game";
const c = (suit: Card["suit"], rank: number): Card => ({
  suit,
  rank,
  id: `${suit}-${rank}`,
});
function endHand(tricks: number[], caller = 0, pending = 0): Game {
  return {
    ...newGame(),
    phase: "trick-end",
    hands: [[], [], [], []],
    trick: [0, 1, 2, 3].map((seat) => ({ seat, card: c("hearts", seat + 7) })),
    tricks,
    caller,
    pending,
  };
}
describe("dealing and trumps", () => {
  it("uses 32 unique cards, each suit seven through ace", () => {
    expect(new Set(deck().map((c) => c.id)).size).toBe(32);
    for (let i = 0; i < 50; i++)
      expect(
        shuffle(deck())
          .map((c) => c.id)
          .sort(),
      ).toEqual(
        deck()
          .map((c) => c.id)
          .sort(),
      );
  });
  it("deals two batches counterclockwise and rotates dealer", () => {
    const g = beginHand(newGame(), deck());
    expect(g.hands[1].slice(0, 4)).toEqual(deck().slice(0, 4));
    expect(g.hands[1].slice(4)).toEqual(deck().slice(16, 20));
    expect(g.hands.every((h) => h.length === 8)).toBe(true);
    expect(g.turn).toBe(1);
    expect(beginHand({ ...g, phase: "hand-end" }).dealer).toBe(1);
  });
  it("only the designated caller can choose a valid trump", () => {
    const g = beginHand(newGame());
    expect(() => chooseTrump(g, 0, "spades")).toThrow();
    expect(() => chooseTrump(g, 1, "fake" as never)).toThrow();
    const next = chooseTrump(g, 1, "hearts");
    expect(next.phase).toBe("play");
    expect(g.phase).toBe("trump");
  });
});
describe("playing tricks", () => {
  it("requires following suit, but permits any discard when void", () => {
    const trick = [{ seat: 0, card: c("hearts", 7) }];
    expect(legalCards([c("hearts", 8), c("spades", 14)], trick)).toEqual([
      c("hearts", 8),
    ]);
    expect(legalCards([c("clubs", 8), c("spades", 14)], trick)).toHaveLength(2);
  });
  it("ranks trumps above the lead suit, ignoring unrelated high cards", () => {
    const trick = [
      { seat: 0, card: c("hearts", 14) },
      { seat: 1, card: c("clubs", 14) },
      { seat: 2, card: c("spades", 7) },
      { seat: 3, card: c("spades", 8) },
    ];
    expect(trickWinner(trick, "spades")).toBe(3);
    expect(trickWinner(trick, "diamonds")).toBe(0);
  });
  it("rejects wrong turns, foreign cards and failure to follow", () => {
    const g = {
      ...beginHand(newGame()),
      phase: "play" as const,
      trump: "clubs" as const,
      turn: 1,
      trick: [{ seat: 0, card: c("hearts", 7) }],
      hands: [[], [c("hearts", 8), c("spades", 14)], [], []],
    };
    expect(() => playCard(g, 2, "hearts-8")).toThrow();
    expect(() => playCard(g, 1, "clubs-14")).toThrow();
    expect(() => playCard(g, 1, "spades-14")).toThrow(/Follow/);
    expect(playCard(g, 1, "hearts-8").turn).toBe(2);
    expect(g.hands[1]).toHaveLength(2);
  });
  it("plays complete legal games with 8 tricks and no duplicate cards", () => {
    for (let i = 0; i < 30; i++) {
      let g = chooseTrump(beginHand(newGame()), 1, "hearts");
      const played = new Set<string>();
      while (g.phase === "play" || g.phase === "trick-end") {
        if (g.phase === "trick-end") {
          g = settleTrick(g);
          continue;
        }
        const card = legalCards(g.hands[g.turn], g.trick)[0];
        expect(played.has(card.id)).toBe(false);
        played.add(card.id);
        g = playCard(g, g.turn, card.id);
      }
      expect(played.size).toBe(32);
      expect(g.tricks.reduce((a, b) => a + b)).toBe(8);
      expect(g.phase).toBe("hand-end");
    }
  });
});
describe("tokens and match completion", () => {
  it.each([
    [[5, 3], 0, 1],
    [[7, 1], 1, 2],
    [[3, 5], 1, 1],
    [[1, 7], 0, 2],
    [[8, 0], 0, 3],
    [[0, 8], 0, 3],
  ] as [number[], number, number][])(
    "scores %j, caller %s as %s tokens",
    (tricks, caller, tokens) => {
      const g = settleTrick(endHand(tricks, caller));
      expect(g.result?.tokens).toBe(tokens);
    },
  );
  it("accumulates draws and pays the bonus once", () => {
    let g = settleTrick(endHand([4, 4]));
    expect(g.pending).toBe(1);
    g = settleTrick({ ...endHand([4, 4]), pending: g.pending });
    expect(g.pending).toBe(2);
    g = settleTrick({ ...endHand([6, 2], 0), pending: g.pending });
    expect(g.scores).toEqual([3, 0]);
    expect(g.pending).toBe(0);
  });
  it("finishes at or above ten and preserves scores between hands", () => {
    const g = settleTrick({ ...endHand([8, 0]), scores: [9, 4] });
    expect(g.phase).toBe("finished");
    expect(g.scores[0]).toBe(12);
    expect(() => beginHand(g)).toThrow();
    const n = beginHand({
      ...endHand([5, 3]),
      phase: "hand-end",
      scores: [3, 4],
    });
    expect(n.scores).toEqual([3, 4]);
  });
});

it("finishes complete matches at the token target through repeated legal hands", () => {
  for (let match = 0; match < 10; match++) {
    let g = newGame();
    let hands = 0;
    while (g.phase !== "finished" && hands < 150) {
      g = beginHand(g);
      g = chooseTrump(g, g.caller, "spades");
      while (g.phase === "play" || g.phase === "trick-end") {
        if (g.phase === "trick-end") g = settleTrick(g);
        else
          g = playCard(g, g.turn, legalCards(g.hands[g.turn], g.trick)[0].id);
      }
      hands++;
    }
    expect(g.phase).toBe("finished");
    expect(Math.max(...g.scores)).toBeGreaterThanOrEqual(10);
    expect(g.result?.winner).not.toBeNull();
  }
});

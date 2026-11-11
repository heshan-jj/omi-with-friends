export const SUITS = ["spades", "hearts", "clubs", "diamonds"] as const;
export type Suit = (typeof SUITS)[number];
export type Card = { suit: Suit; rank: number; id: string };
export type PlayedCard = { seat: number; card: Card };
export type Phase =
  "lobby" | "trump" | "play" | "trick-end" | "hand-end" | "finished";
export type HandResult = {
  winner: number | null;
  tokens: number;
  tricks: number[];
  message: string;
};
export type Game = {
  phase: Phase;
  dealer: number;
  caller: number;
  turn: number;
  trump: Suit | null;
  hands: Card[][];
  trick: PlayedCard[];
  tricks: number[];
  scores: number[];
  pending: number;
  handNumber: number;
  lastTrick: PlayedCard[];
  lastWinner: number | null;
  result: HandResult | null;
};
export function newGame(): Game {
  return {
    phase: "lobby",
    dealer: 0,
    caller: 1,
    turn: 1,
    trump: null,
    hands: [[], [], [], []],
    trick: [],
    tricks: [0, 0],
    scores: [0, 0],
    pending: 0,
    handNumber: 0,
    lastTrick: [],
    lastWinner: null,
    result: null,
  };
}
export function deck(): Card[] {
  return SUITS.flatMap((suit) =>
    Array.from({ length: 8 }, (_, i) => ({
      suit,
      rank: i + 7,
      id: `${suit}-${i + 7}`,
    })),
  );
}
export function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const n = new Uint32Array(1);
  do {
    crypto.getRandomValues(n);
  } while (n[0] >= limit);
  return n[0] % max;
}
export function shuffle(cards: Card[]): Card[] {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function beginHand(game: Game, cards = shuffle(deck())): Game {
  if (!["lobby", "hand-end"].includes(game.phase))
    throw new Error("Finish this hand first.");
  if (cards.length !== 32 || new Set(cards.map((c) => c.id)).size !== 32)
    throw new Error("Invalid deck.");
  const g = structuredClone(game);
  if (g.handNumber > 0) g.dealer = (g.dealer + 1) % 4;
  g.caller = (g.dealer + 1) % 4;
  g.turn = g.caller;
  g.trump = null;
  g.hands = [[], [], [], []];
  let offset = 0;
  for (let batch = 0; batch < 2; batch++)
    for (let i = 1; i <= 4; i++) {
      const seat = (g.dealer + i) % 4;
      g.hands[seat].push(...cards.slice(offset, offset + 4));
      offset += 4;
    }
  g.phase = "trump";
  g.trick = [];
  g.tricks = [0, 0];
  g.handNumber++;
  g.result = null;
  g.lastTrick = [];
  g.lastWinner = null;
  return g;
}
export function chooseTrump(game: Game, seat: number, suit: Suit): Game {
  if (game.phase !== "trump" || seat !== game.caller)
    throw new Error("Wait for your turn to call trumps.");
  if (!SUITS.includes(suit)) throw new Error("Choose a valid suit.");
  return { ...game, trump: suit, phase: "play" };
}
export function legalCards(hand: Card[], trick: PlayedCard[]): Card[] {
  const lead = trick[0]?.card.suit;
  const following = hand.filter((c) => c.suit === lead);
  return following.length ? following : hand;
}
export function trickWinner(trick: PlayedCard[], trump: Suit): number {
  if (trick.length !== 4) throw new Error("A trick needs four cards.");
  const lead = trick[0].card.suit;
  const strength = (c: Card) =>
    (c.suit === trump ? 200 : c.suit === lead ? 100 : 0) + c.rank;
  return trick.reduce((winner, p) =>
    strength(p.card) > strength(winner.card) ? p : winner,
  ).seat;
}
export function playCard(game: Game, seat: number, id: string): Game {
  if (game.phase !== "play" || seat !== game.turn)
    throw new Error("Wait for your turn.");
  const hand = game.hands[seat];
  const card = hand.find((c) => c.id === id);
  if (!card) throw new Error("That card is not in your hand.");
  if (!legalCards(hand, game.trick).some((c) => c.id === id))
    throw new Error(
      `Follow ${game.trick[0].card.suit} while you have that suit.`,
    );
  const g = structuredClone(game);
  g.hands[seat] = g.hands[seat].filter((c) => c.id !== id);
  g.trick.push({ seat, card });
  if (g.trick.length < 4) {
    g.turn = (seat + 1) % 4;
    return g;
  }
  const winner = trickWinner(g.trick, g.trump!);
  g.tricks[winner % 2]++;
  g.turn = winner;
  g.lastWinner = winner;
  g.phase = "trick-end";
  return g;
}
export function settleTrick(game: Game): Game {
  if (game.phase !== "trick-end") throw new Error("No completed trick.");
  const g = structuredClone(game);
  g.lastTrick = g.trick;
  g.trick = [];
  if (g.hands.some((h) => h.length)) {
    g.phase = "play";
    return g;
  }
  const winner = g.tricks[0] === 4 ? null : g.tricks[0] > 4 ? 0 : 1;
  if (winner === null) {
    g.pending++;
    g.result = {
      winner: null,
      tokens: 0,
      tricks: [...g.tricks],
      message: "Four each. One extra token carries to the next winning hand.",
    };
  } else {
    const sweep = g.tricks[winner] === 8;
    const tokens = (sweep ? 3 : winner === g.caller % 2 ? 1 : 2) + g.pending;
    g.scores[winner] += tokens;
    g.pending = 0;
    g.result = {
      winner,
      tokens,
      tricks: [...g.tricks],
      message: sweep
        ? "Kapothi! All eight tricks."
        : winner === g.caller % 2
          ? "The trump callers take the hand."
          : "The defending team takes the hand.",
    };
  }
  g.phase = g.scores.some((s) => s >= 10) ? "finished" : "hand-end";
  return g;
}
export function rankLabel(rank: number) {
  return (
    ({ 14: "A", 13: "K", 12: "Q", 11: "J" } as Record<number, string>)[rank] ??
    String(rank)
  );
}

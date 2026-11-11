import type { Card, Game } from "./game";
export type Player = { key: string; name: string; ready: boolean };
export type Seat = { name: string; ready: boolean; connected: boolean } | null;
export type RoomState = {
  game: Game;
  players: (Player | null)[];
  hostKey: string | null;
  updatedAt: number;
  room: string;
};
export type View = Omit<Game, "hands"> & {
  seats: Seat[];
  hand: Card[];
  counts: number[];
  you: number | null;
  host: boolean;
  paused: boolean;
  room: string;
};
export type Command =
  | { type: "seat"; seat: number; name: string }
  | { type: "ready" }
  | { type: "start" }
  | { type: "trump"; suit: string }
  | { type: "play"; card: string }
  | { type: "next" }
  | { type: "rematch" }
  | { type: "leave" };

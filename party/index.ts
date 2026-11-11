import type * as Party from "partykit/server";
import {
  beginHand,
  chooseTrump,
  newGame,
  playCard,
  randomInt,
  settleTrick,
  SUITS,
  type Suit,
} from "../lib/game";
import type { Command, RoomState, View } from "../lib/protocol";
const fresh = (): RoomState => ({
  game: newGame(),
  players: [null, null, null, null],
  hostKey: null,
  updatedAt: Date.now(),
  room: "",
});
export default class OmiRoom implements Party.Server {
  state: RoomState = fresh();
  constructor(readonly room: Party.Room) {}
  static async onBeforeConnect(request: Party.Request, lobby: Party.Lobby) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (!token || !/^[a-f0-9]{64}$/.test(token))
      return new Response("Invalid session.", { status: 401 });
    const origin = request.headers.get("Origin");
    const allowed = String(lobby.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(url.host);
    if (
      !origin ||
      (!allowed.includes(origin) &&
        !(local && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)))
    )
      return new Response("This website is not allowed to connect.", {
        status: 403,
      });
    if (!/^[a-z0-9]{8}$/.test(lobby.id))
      return new Response("Invalid room code.", { status: 400 });
    return request;
  }
  async onStart() {
    this.state = (await this.room.storage.get<RoomState>("room")) ?? fresh();
    if (this.state.game.phase === "trick-end")
      await this.room.storage.setAlarm(Date.now() + 1200);
  }
  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    this.state.room = this.room.id;
    const token = new URL(ctx.request.url).searchParams.get("token")!;
    const bytes = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(token),
    );
    const key = Array.from(new Uint8Array(bytes), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    connection.setState({ key, lastMessage: 0 });
    this.broadcast();
  }
  key(connection: Party.Connection) {
    return (connection.state as { key?: string } | null)?.key;
  }
  connected(key: string) {
    return [...this.room.getConnections()].some((c) => this.key(c) === key);
  }
  paused() {
    return (
      this.state.game.phase !== "lobby" &&
      this.state.players.some((p) => !p || !this.connected(p.key))
    );
  }
  view(key?: string): View {
    const { game, players, hostKey } = this.state;
    const found = players.findIndex((p) => p?.key === key);
    const you = found < 0 ? null : found;
    const { hands, ...publicGame } = game;
    return {
      ...publicGame,
      room: this.state.room,
      seats: players.map((p) =>
        p
          ? { name: p.name, ready: p.ready, connected: this.connected(p.key) }
          : null,
      ),
      hand:
        you === null
          ? []
          : game.phase === "trump"
            ? hands[you].slice(0, 4)
            : hands[you],
      counts: hands.map((h) =>
        game.phase === "trump" ? Math.min(4, h.length) : h.length,
      ),
      you,
      host: key === hostKey,
      paused: this.paused(),
    };
  }
  broadcast() {
    for (const c of this.room.getConnections())
      c.send(JSON.stringify({ type: "state", state: this.view(this.key(c)) }));
  }
  async save() {
    this.state.updatedAt = Date.now();
    await this.room.storage.put("room", this.state);
    this.broadcast();
  }
  async onMessage(message: string, connection: Party.Connection) {
    try {
      if (typeof message !== "string" || message.length > 1200)
        throw new Error("Message too large.");
      const session = connection.state as { key: string; lastMessage: number };
      if (!session?.key) throw new Error("Reconnect to the room.");
      if (Date.now() - session.lastMessage < 100)
        throw new Error("Please wait a moment.");
      connection.setState({ ...session, lastMessage: Date.now() });
      const command = JSON.parse(message) as Command;
      const key = session.key;
      const { players } = this.state;
      let seat = players.findIndex((p) => p?.key === key);
      if (command.type === "seat") {
        if (this.state.game.phase !== "lobby")
          throw new Error("This match has already started.");
        if (
          !Number.isInteger(command.seat) ||
          command.seat < 0 ||
          command.seat > 3
        )
          throw new Error("Choose a seat.");
        const name =
          typeof command.name === "string"
            ? command.name.trim().slice(0, 24)
            : "";
        if (!name) throw new Error("Enter your name first.");
        if (players[command.seat] && players[command.seat]?.key !== key)
          throw new Error("Someone just took that seat.");
        if (seat >= 0) players[seat] = null;
        players[command.seat] = { key, name, ready: false };
        this.state.hostKey ??= key;
      } else {
        if (seat < 0) throw new Error("Take a seat first.");
        const player = players[seat]!;
        const host = () => {
          if (this.state.hostKey !== key)
            throw new Error("Only the host can do that.");
        };
        const allHere = () => {
          if (players.some((p) => !p || !this.connected(p.key)))
            throw new Error("Wait for all four players to connect.");
        };
        switch (command.type) {
          case "ready":
            if (this.state.game.phase !== "lobby")
              throw new Error("The match is in progress.");
            player.ready = !player.ready;
            break;
          case "start":
            host();
            allHere();
            if (players.some((p) => !p?.ready))
              throw new Error("Everyone needs to be ready.");
            this.state.game.dealer = randomInt(4);
            this.state.game = beginHand(this.state.game);
            break;
          case "trump":
            allHere();
            if (!SUITS.includes(command.suit as Suit))
              throw new Error("Choose a suit.");
            this.state.game = chooseTrump(
              this.state.game,
              seat,
              command.suit as Suit,
            );
            break;
          case "play":
            allHere();
            this.state.game = playCard(this.state.game, seat, command.card);
            if (this.state.game.phase === "trick-end")
              await this.room.storage.setAlarm(Date.now() + 1800);
            break;
          case "next":
            host();
            allHere();
            if (this.state.game.phase !== "hand-end")
              throw new Error("Finish this hand first.");
            this.state.game = beginHand(this.state.game);
            break;
          case "rematch":
            host();
            allHere();
            if (this.state.game.phase !== "finished")
              throw new Error("Finish the match first.");
            this.state.game = newGame();
            players.forEach((p) => {
              if (p) p.ready = false;
            });
            break;
          case "leave":
            if (
              this.state.game.phase !== "lobby" &&
              this.state.game.phase !== "finished"
            )
              throw new Error("You can leave your seat after the match.");
            players[seat] = null;
            if (this.state.hostKey === key)
              this.state.hostKey = players.find((p) => p)?.key ?? null;
            if (!players.some(Boolean)) this.state = fresh();
            break;
          default:
            throw new Error("Unknown action.");
        }
      }
      await this.save();
    } catch (error) {
      connection.send(
        JSON.stringify({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to play. Try again.",
        }),
      );
    }
  }
  onClose() {
    this.broadcast();
  }
  onRequest() {
    return new Response("Omi room service is ready.", {
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  }
  async onAlarm() {
    if (this.state.game.phase === "trick-end") {
      this.state.game = settleTrick(this.state.game);
      await this.save();
    }
  }
}

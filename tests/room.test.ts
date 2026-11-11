import { beforeEach, describe, expect, it } from "vitest";
import OmiRoom from "../party";
import { newGame } from "../lib/game";
import type * as Party from "partykit/server";
function connection(key: string) {
  return {
    state: { key, lastMessage: 0 },
    messages: [] as string[],
    setState(state: unknown) {
      this.state = state as typeof this.state;
    },
    send(value: string) {
      this.messages.push(value);
    },
  };
}
let a: ReturnType<typeof connection>,
  b: ReturnType<typeof connection>,
  server: OmiRoom;
let connections: ReturnType<typeof connection>[];
beforeEach(() => {
  a = connection("a");
  b = connection("b");
  connections = [a, b];
  const data = new Map();
  server = new OmiRoom({
    id: "testroom",
    getConnections: () => connections,
    storage: {
      get: async (k: string) => data.get(k),
      put: async (k: string, v: unknown) => data.set(k, structuredClone(v)),
      setAlarm: async () => {},
    },
  } as unknown as Party.Room);
});
async function send(c: ReturnType<typeof connection>, command: unknown) {
  c.state.lastMessage = 0;
  await server.onMessage(
    JSON.stringify(command),
    c as unknown as Party.Connection,
  );
}
describe("room authority and privacy", () => {
  it("rejects seat theft and restricts host actions", async () => {
    await send(a, { type: "seat", seat: 0, name: "Amal" });
    await send(b, { type: "seat", seat: 0, name: "Nimal" });
    expect(server.state.players[0]?.name).toBe("Amal");
    expect(JSON.parse(b.messages.at(-1)!).type).toBe("error");
    await send(b, { type: "seat", seat: 1, name: "Nimal" });
    await send(b, { type: "start" });
    expect(server.state.game.phase).toBe("lobby");
    expect(JSON.parse(b.messages.at(-1)!).message).toContain("host");
  });
  it("requires readiness and does not let next bypass the lobby", async () => {
    await send(a, { type: "seat", seat: 0, name: "Amal" });
    await send(a, { type: "next" });
    expect(server.state.game.phase).toBe("lobby");
    expect(JSON.parse(a.messages.at(-1)!).type).toBe("error");
    await send(a, { type: "start" });
    expect(server.state.game.phase).toBe("lobby");
  });
  it("only exposes the viewer’s first four before the trump call", () => {
    server.state.players = [
      { key: "a", name: "Amal", ready: true },
      null,
      null,
      null,
    ];
    server.state.game = {
      ...newGame(),
      phase: "trump",
      hands: [
        Array.from({ length: 8 }, (_, i) => ({
          suit: "hearts",
          rank: i + 7,
          id: `hearts-${i + 7}`,
        })),
        [],
        [],
        [],
      ],
    };
    const view = server.view("a");
    expect(view.hand).toHaveLength(4);
    expect(view).not.toHaveProperty("hands");
    expect(JSON.stringify(view)).not.toContain('"key"');
    expect(server.view("b").hand).toHaveLength(0);
    expect(view.counts[0]).toBe(4);
  });
  it("pauses when a player disconnects and resumes for the same credential", () => {
    server.state.players = [
      { key: "a", name: "Amal", ready: true },
      { key: "b", name: "Nimal", ready: true },
      { key: "c", name: "C", ready: true },
      { key: "d", name: "D", ready: true },
    ];
    connections.push(connection("c"), connection("d"));
    server.state.game.phase = "play";
    expect(server.paused()).toBe(false);
    connections.splice(1, 1);
    expect(server.paused()).toBe(true);
    connections.push(connection("b"));
    expect(server.paused()).toBe(false);
    expect(server.view("b").you).toBe(1);
  });
  it("rejects malformed commands without crashing", async () => {
    for (const command of [
      null,
      {},
      { type: "seat", seat: 99, name: "x" },
      { type: "seat", seat: 0, name: 34 },
    ]) {
      await send(a, command);
      expect(JSON.parse(a.messages.at(-1)!).type).toBe("error");
    }
  });
  it("enforces origin and session format before opening a socket", async () => {
    const lobby = {
      id: "testroom",
      env: { ALLOWED_ORIGINS: "https://omi.example" },
    } as unknown as Party.Lobby;
    const request = (origin: string, token = "a".repeat(64)) =>
      new Request(
        `https://rooms.example/parties/main/testroom?token=${token}`,
        { headers: { Origin: origin } },
      ) as unknown as Party.Request;
    expect(
      (
        (await OmiRoom.onBeforeConnect(
          request("https://bad.example"),
          lobby,
        )) as Response
      ).status,
    ).toBe(403);
    expect(
      (
        (await OmiRoom.onBeforeConnect(
          request("https://omi.example", "bad"),
          lobby,
        )) as Response
      ).status,
    ).toBe(401);
    expect(
      await OmiRoom.onBeforeConnect(request("https://omi.example"), lobby),
    ).toBeInstanceOf(Request);
  });
});

it("restores saved seats and match state in a new server instance", async () => {
  await send(a, { type: "seat", seat: 0, name: "Amal" });
  await send(a, { type: "ready" });
  const restored = new OmiRoom(server.room);
  await restored.onStart();
  expect(restored.state).toEqual(server.state);
  expect(restored.view("a").you).toBe(0);
  expect(restored.state.players[0]?.ready).toBe(true);
});

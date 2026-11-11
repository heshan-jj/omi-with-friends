import {
  Server,
  routePartykitRequest,
  type Connection,
  type ConnectionContext,
  type WSMessage,
} from "partyserver";
import OmiRoom from "./index";
export type Env = {
  Main: DurableObjectNamespace<Main>;
  ALLOWED_ORIGINS: string;
};
/** Cloudflare transport; the Omi authority itself has no hosting dependency. */
export class Main extends Server<Env> {
  authority: OmiRoom;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    const server = this;
    this.authority = new OmiRoom({
      get id() {
        return server.name;
      },
      getConnections: () => server.getConnections(),
      storage: {
        get: <T>(key: string) => ctx.storage.get<T>(key),
        put: (key, value) => ctx.storage.put(key, value),
        setAlarm: (time) => ctx.storage.setAlarm(time),
      },
    });
  }
  onStart() {
    return this.authority.onStart();
  }
  onConnect(connection: Connection, context: ConnectionContext) {
    return this.authority.onConnect(connection, context);
  }
  onMessage(connection: Connection, message: WSMessage) {
    if (typeof message !== "string") {
      connection.send(
        JSON.stringify({
          type: "error",
          message: "Only text commands are accepted.",
        }),
      );
      return;
    }
    return this.authority.onMessage(message, connection);
  }
  onClose() {
    this.authority.onClose();
  }
  onError() {
    this.authority.onClose();
  }
  onRequest() {
    return this.authority.onRequest();
  }
  onAlarm() {
    return this.authority.onAlarm();
  }
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (
      (await routePartykitRequest(request, env, {
        onBeforeConnect: (request, lobby) =>
          OmiRoom.onBeforeConnect(request, { id: lobby.name, env }),
      })) ?? new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;

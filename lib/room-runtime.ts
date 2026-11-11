/** Minimal transport boundary: the authority stays testable outside Workers. */
export type Connection = {
  state: unknown;
  setState(value: unknown): unknown;
  send(value: string): void;
};
export type RoomRuntime = {
  readonly id: string;
  getConnections(): Iterable<Connection>;
  storage: {
    get<T>(key: string): Promise<T | undefined>;
    put(key: string, value: unknown): Promise<unknown>;
    setAlarm(time: number): Promise<unknown>;
  };
};
export type ConnectionContext = { request: Request };
export type Lobby = { id: string; env: { ALLOWED_ORIGINS?: unknown } };

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  DoorOpen,
  HelpCircle,
  Link2,
  LoaderCircle,
  RotateCcw,
  Users,
  WifiOff,
  X,
} from "lucide-react";
import {
  legalCards,
  rankLabel,
  SUITS,
  type Card,
  type Suit,
} from "../lib/game";
import type { Command, View } from "../lib/protocol";

export function SuitIcon({
  suit,
  className = "",
}: {
  suit: Suit;
  className?: string;
}) {
  const paths: Record<Suit, string> = {
    hearts:
      "M12 21C9 18 2 13 2 7.5 2 2 9 1 12 6c3-5 10-4 10 1.5C22 13 15 18 12 21Z",
    diamonds: "m12 1 9 11-9 11L3 12Z",
    spades:
      "M12 1C9 5 2 10 2 14a5 5 0 0 0 8 4l-2 5h8l-2-5a5 5 0 0 0 8-4c0-4-7-9-10-13Z",
    clubs: "M9 9a5 5 0 1 1 6 0 5 5 0 1 1-1 9l2 5H8l2-5a5 5 0 1 1-1-9Z",
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`suit ${suit} ${className}`}
      fill="currentColor"
    >
      <path d={paths[suit]} />
    </svg>
  );
}
function PlayingCard({
  card,
  back = false,
  small = false,
}: {
  card?: Card;
  back?: boolean;
  small?: boolean;
}) {
  if (back || !card)
    return (
      <span className={`playing-card card-back ${small ? "small" : ""}`}>
        <span className="back-diamond">o</span>
      </span>
    );
  return (
    <span
      className={`playing-card ${card.suit === "hearts" || card.suit === "diamonds" ? "red" : ""} ${small ? "small" : ""}`}
    >
      <span className="card-corner">
        <b>{rankLabel(card.rank)}</b>
        <SuitIcon suit={card.suit} />
      </span>
      <SuitIcon suit={card.suit} className="card-pip" />
      <span className="card-corner bottom">
        <b>{rankLabel(card.rank)}</b>
        <SuitIcon suit={card.suit} />
      </span>
    </span>
  );
}
function Brand({ table = false }: { table?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${table ? "on-table" : ""}`}
      aria-label="Omi home"
    >
      <span>
        omi<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
function Rules({ close }: { close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="rules-dialog"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <button
        className="icon-button close-dialog"
        onClick={close}
        aria-label="Close rules"
      >
        <X size={22} />
      </button>
      <h2>A quick hand with the rules.</h2>
      <p>Four friends. Two teams. Partners sit opposite each other.</p>
      <ol>
        <li>
          <strong>Call trumps.</strong> The player to the dealer’s right chooses
          a trump suit after seeing their first four cards. Then everyone
          receives four more.
        </li>
        <li>
          <strong>Follow suit.</strong> Play the suit that was led if you can.
          Otherwise, play any card. The highest trump wins; without trumps, the
          highest card of the led suit wins.
        </li>
        <li>
          <strong>Take the next lead.</strong> The trick winner leads. Play
          moves counterclockwise. Cards rank A, K, Q, J, 10, 9, 8, 7.
        </li>
        <li>
          <strong>Win tokens.</strong> Take 5–7 tricks for 1 token as trump
          callers, or 2 as defenders. All eight is Kapothi: 3 tokens. A 4–4 draw
          adds a bonus token to the next winning hand; repeated draws
          accumulate.
        </li>
      </ol>
      <p className="rules-note">
        First to 10 tokens wins. This table uses automatic Kapothi scoring,
        without an announcement or failed-sweep penalty.
      </p>
      <button className="button primary" onClick={close}>
        Got it. Let’s play <ArrowRight size={18} />
      </button>
    </dialog>
  );
}
function Preview() {
  return (
    <div className="table-preview" aria-label="Illustration of an Omi table">
      <span className="preview-caption">
        <span className="tiny-dot" /> Your next catch-up, dealt.
      </span>
      <div className="preview-felt">
        <div className="felt-ring" />
        <div className="preview-wordmark">omi.</div>
        <div className="preview-top-hand">
          {[0, 1, 2].map((i) => (
            <PlayingCard key={i} back small />
          ))}
        </div>
        <div className="preview-play play-one">
          <PlayingCard card={{ suit: "hearts", rank: 14, id: "demo-heart" }} />
        </div>
        <div className="preview-play play-two">
          <PlayingCard card={{ suit: "spades", rank: 13, id: "demo-spade" }} />
        </div>
        <div className="preview-play play-three">
          <PlayingCard card={{ suit: "hearts", rank: 12, id: "demo-queen" }} />
        </div>
        <div className="preview-bottom-hand">
          {(
            [
              { suit: "clubs", rank: 14 },
              { suit: "hearts", rank: 13 },
              { suit: "spades", rank: 14 },
              { suit: "diamonds", rank: 11 },
            ] as Card[]
          ).map((c, i) => (
            <div
              key={c.suit}
              style={{
                transform: `translateY(${Math.abs(i - 1.5) * 9}px) rotate(${(i - 1.5) * 10}deg)`,
              }}
            >
              <PlayingCard card={c} />
            </div>
          ))}
        </div>
        <div className="preview-seat">
          <span className="avatar">Y</span>
          <span>Your seat is waiting</span>
        </div>
      </div>
      <span className="preview-foot">Same game. A little closer.</span>
    </div>
  );
}
export function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [rules, setRules] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      setName(localStorage.getItem("omi.name") ?? "");
    } catch {}
    setHydrated(true);
  }, []);
  function enter(join: boolean) {
    setError("");
    if (!name.trim()) {
      setError("What should your friends call you?");
      document.getElementById("name")?.focus();
      return;
    }
    let room = code.trim().toLowerCase();
    const match = room.match(/\/room\/([a-z0-9]{8})\/?$/);
    if (match) room = match[1];
    if (join && !/^[a-z0-9]{8}$/.test(room)) {
      setError("Enter the 8-character room code or paste an invite link.");
      return;
    }
    if (!join) {
      const bytes = crypto.getRandomValues(new Uint8Array(8));
      room = Array.from(bytes, (b) => (b % 36).toString(36)).join("");
    }
    try {
      localStorage.setItem("omi.name", name.trim());
    } catch {
      setError("Allow browser storage so you can reconnect to your seat.");
      return;
    }
    setBusy(true);
    router.push(`/room/${room}`);
  }
  return (
    <div className="home">
      <header className="home-header">
        <div className="brand-lockup">
          <Brand />
          <span>The Sri Lankan card game</span>
        </div>
        <button
          className="text-button"
          disabled={!hydrated}
          onClick={() => setRules(true)}
        >
          <HelpCircle size={17} /> How to play
        </button>
      </header>
      <main className="home-main">
        <section className="welcome">
          <div className="suit-row">
            {SUITS.map((s) => (
              <SuitIcon key={s} suit={s} />
            ))}
          </div>
          <h1>
            A table for
            <br />
            your <em>friends.</em>
          </h1>
          <p className="intro">
            Bring your people. We’ll bring the cards.
            <br />
            Play a little Omi, wherever everyone is.
          </p>
          <form
            className="entry-form"
            onSubmit={(e) => {
              e.preventDefault();
              enter(false);
            }}
          >
            <label htmlFor="name">What should we call you?</label>
            <input
              id="name"
              autoComplete="nickname"
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={!hydrated || busy}
              required
            />
            <button
              className="button primary create-button"
              disabled={busy || !hydrated}
              type="submit"
            >
              {busy ? (
                <LoaderCircle className="spin" size={19} />
              ) : (
                <>
                  Create a private table <ArrowUpRight size={20} />
                </>
              )}
            </button>
            <div className="join-divider">
              <span />
              Already have an invite?
              <span />
            </div>
            <label className="sr-only" htmlFor="room-code">
              Room code or invite link
            </label>
            <div className="join-field">
              <input
                id="room-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    enter(true);
                  }
                }}
                placeholder="Room code or invite link"
                autoCapitalize="none"
                spellCheck={false}
                disabled={!hydrated || busy}
              />
              <button
                type="button"
                aria-label="Join table"
                onClick={() => enter(true)}
                disabled={busy || !hydrated}
              >
                <ArrowRight size={21} />
              </button>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </form>
          <p className="entry-note">
            <Users size={15} /> Four players <span>·</span> Just a link{" "}
            <span>·</span> No sign-up
          </p>
        </section>
        <Preview />
      </main>
      <footer className="home-footer">
        <span>A familiar game. A new way to get together.</span>
        <span>
          Made for good company <SuitIcon suit="hearts" />
        </span>
      </footer>
      {rules && <Rules close={() => setRules(false)} />}
    </div>
  );
}
function useRoom(code: string) {
  const socket = useRef<PartySocket | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [connection, setConnection] = useState<
    "connecting" | "connected" | "disconnected" | "unavailable"
  >("connecting");
  const [error, setError] = useState("");
  useEffect(() => {
    const host =
      process.env.NEXT_PUBLIC_PARTYKIT_HOST ||
      (location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? `${location.hostname}:1999`
        : "");
    if (!host) {
      setConnection("unavailable");
      return;
    }
    let token: string;
    try {
      const key = `omi.session.${code}`;
      token = localStorage.getItem(key) ?? "";
      if (!/^[a-f0-9]{64}$/.test(token)) {
        token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
        localStorage.setItem(key, token);
      }
    } catch {
      setConnection("unavailable");
      setError("Allow browser storage to save your seat.");
      return;
    }
    const s = new PartySocket({
      host,
      room: code,
      query: { token },
      maxRetries: 8,
    });
    socket.current = s;
    s.addEventListener("open", () => {
      setConnection("connected");
      setError("");
    });
    s.addEventListener("close", () => setConnection("disconnected"));
    s.addEventListener("error", () => setConnection("disconnected"));
    s.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "state") setView(data.state);
        if (data.type === "error") setError(data.message);
      } catch {
        setError("Couldn’t read the table update. Reconnect to try again.");
      }
    });
    return () => {
      s.close();
      socket.current = null;
    };
  }, [code]);
  function send(command: Command) {
    setError("");
    if (socket.current?.readyState !== WebSocket.OPEN) {
      setError("You’re offline. Wait for the table to reconnect.");
      return;
    }
    socket.current.send(JSON.stringify(command));
  }
  return { view, connection, error, setError, send };
}
export function Room({ code }: { code: string }) {
  const { view: v, connection, error, setError, send } = useRoom(code);
  const [name, setName] = useState("");
  const [rules, setRules] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    try {
      setName(localStorage.getItem("omi.name") ?? "");
    } catch {}
  }, []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopyError(true);
    }
  }
  function claim(seat: number) {
    if (!name.trim()) {
      setError("Enter your name before choosing a seat.");
      document.getElementById("table-name")?.focus();
      return;
    }
    try {
      localStorage.setItem("omi.name", name.trim());
    } catch {}
    send({ type: "seat", seat, name });
  }
  const online = connection === "connected";
  const you = v?.you ?? null;
  const lobby = v?.phase === "lobby";
  const allReady = v?.seats.every((s) => s?.ready && s.connected);
  const myTurn =
    you !== null &&
    v?.turn === you &&
    v.phase === "play" &&
    !v.paused &&
    online;
  const legal = v
    ? new Set(legalCards(v.hand, v.trick).map((c) => c.id))
    : new Set<string>();
  const seatPosition = (seat: number) =>
    ["south", "east", "north", "west"][(seat - (you ?? 0) + 4) % 4];
  let headline = "Finding your table…";
  let subline = "Pull up a chair. We’ll be right with you.";
  if (v) {
    if (lobby) {
      headline =
        you === null ? "Pull up a chair." : "Good company starts here.";
      subline =
        you === null
          ? "Choose a seat. Your partner sits opposite you."
          : "Share the invite, then get everyone ready.";
    } else if (v.paused) {
      headline = "Saving a seat.";
      subline = "Play will resume when everyone is back. Your cards are safe.";
    } else if (v.phase === "trump") {
      headline =
        v.caller === you
          ? "Your call. What’s trump?"
          : `${v.seats[v.caller]?.name} is calling trumps.`;
      subline =
        v.caller === you
          ? "Choose a suit from your first four cards."
          : "The next four cards arrive after the call.";
    } else if (v.phase === "play") {
      headline = myTurn ? "Your turn." : `${v.seats[v.turn]?.name}’s turn.`;
      subline = v.trick.length
        ? `Follow ${v.trick[0].card.suit} if you can.`
        : "Lead any card to start the trick.";
    } else if (v.phase === "trick-end") {
      headline = `${v.seats[v.lastWinner ?? 0]?.name} takes the trick.`;
      subline = "The winner leads the next one.";
    } else {
      headline =
        v.phase === "finished"
          ? `Team ${(v.result?.winner ?? 0) + 1} wins the match!`
          : v.result?.winner === null
            ? "Evenly matched."
            : `Team ${(v.result?.winner ?? 0) + 1} takes the hand.`;
      subline = v.result?.message ?? "";
    }
  }
  if (connection === "unavailable") {
    headline = "The table is unavailable.";
    subline =
      "Online tables aren’t available right now. Please try again later.";
  } else if (connection === "disconnected") {
    headline = "Reconnecting to your table…";
    subline = "Keep this tab open. We’re holding your seat.";
  }
  return (
    <div className="room-page">
      <header className="room-header">
        <div className="brand-lockup">
          <Brand table />
          <span>Friends’ table</span>
        </div>
        <div className="room-header-actions">
          <span
            className={`connection-dot ${online ? "online" : ""}`}
            aria-label={online ? "Connected" : "Not connected"}
          />
          <span className="room-code">{code.toUpperCase()}</span>
          <button className="invite-button" onClick={copy}>
            {copied ? <Check size={16} /> : <Link2 size={16} />}
            <span>{copied ? "Link copied" : "Invite friends"}</span>
          </button>
          <button
            className="icon-button"
            onClick={() => setRules(true)}
            aria-label="How to play"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </header>
      <main className="room-main">
        <div className="table-status" aria-live="polite">
          <h1>{headline}</h1>
          <p>{subline}</p>
          {copyError && (
            <p className="copy-fallback">
              Copy this invite:{" "}
              <input
                aria-label="Invite link"
                value={typeof location === "undefined" ? "" : location.href}
                readOnly
                onFocus={(e) => e.target.select()}
              />
            </p>
          )}
        </div>
        {error && (
          <div className="room-error" role="alert">
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}
        {v && (
          <>
            <div className="score-strip">
              <span
                className={you === null || you % 2 === 0 ? "your-team" : ""}
              >
                Team 1 <b>{v.scores[0]}</b>
                <small>{v.tricks[0]} tricks</small>
              </span>
              <span className="score-target">
                {lobby ? "First to 10" : `Hand ${v.handNumber}`}
                <small>
                  {v.pending
                    ? `${v.pending} bonus token${v.pending > 1 ? "s" : ""} carried`
                    : "10 tokens to win"}
                </small>
              </span>
              <span
                className={you !== null && you % 2 === 1 ? "your-team" : ""}
              >
                Team 2 <b>{v.scores[1]}</b>
                <small>{v.tricks[1]} tricks</small>
              </span>
            </div>
            <div className={`game-table ${lobby ? "is-lobby" : ""}`}>
              <div className="table-inner-line" />
              {v.seats.map((player, seat) => (
                <div
                  key={seat}
                  className={`player-seat ${seatPosition(seat)} ${!lobby && v.turn === seat ? "has-turn" : ""}`}
                >
                  {player ? (
                    <>
                      <span
                        className={`avatar ${seat % 2 === 0 ? "team-a" : "team-b"}`}
                      >
                        {player.name.slice(0, 1).toUpperCase()}
                        {!player.connected && <WifiOff size={12} />}
                      </span>
                      <span className="player-name">
                        {player.name}
                        {seat === you && <small>you</small>}
                      </span>
                      <span className="player-detail">
                        {lobby ? (
                          player.ready ? (
                            <>
                              <Check size={12} /> Ready
                            </>
                          ) : (
                            "Not ready"
                          )
                        ) : (
                          `Team ${(seat % 2) + 1}${v.dealer === seat ? " · Dealer" : ""}`
                        )}
                      </span>
                      {!lobby && seat !== you && (
                        <div
                          className="opponent-hand"
                          aria-label={`${v.counts[seat]} cards`}
                        >
                          {Array.from(
                            { length: Math.min(v.counts[seat], 5) },
                            (_, i) => (
                              <PlayingCard key={i} back small />
                            ),
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      className="empty-seat"
                      disabled={!lobby || !online}
                      onClick={() => claim(seat)}
                      aria-label={`Take seat ${seat + 1}, Team ${(seat % 2) + 1}`}
                    >
                      <Users size={22} />
                      <span>Sit here</span>
                      <small>Team {(seat % 2) + 1}</small>
                    </button>
                  )}
                </div>
              ))}
              <div className="table-center">
                {lobby ? (
                  <div className="lobby-center">
                    <span className="table-logo">omi.</span>
                    <span className="seats-filled">
                      {v.seats.filter(Boolean).length} of 4 friends here
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="trump-indicator">
                      {v.trump ? (
                        <>
                          <SuitIcon suit={v.trump} />
                          <span>{v.trump} trump</span>
                        </>
                      ) : (
                        <span>Trumps to be called</span>
                      )}
                    </div>
                    <div className="trick-area">
                      {v.trick.map((p) => (
                        <motion.div
                          key={p.card.id}
                          initial={
                            reduce ? false : { opacity: 0, y: 12, rotate: -4 }
                          }
                          animate={{ opacity: 1, y: 0, rotate: 0 }}
                          className={`trick-card from-${seatPosition(p.seat)}`}
                        >
                          <PlayingCard card={p.card} />
                          <span>{v.seats[p.seat]?.name}</span>
                        </motion.div>
                      ))}
                    </div>
                    {v.phase === "play" && v.trick.length === 0 && (
                      <span className="empty-trick-note">
                        {myTurn ? "Your lead" : "Waiting for the lead"}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            {lobby ? (
              <section className="lobby-controls">
                {you === null ? (
                  <div className="name-inline">
                    <label htmlFor="table-name">Your name</label>
                    <input
                      id="table-name"
                      maxLength={24}
                      autoComplete="nickname"
                      placeholder="What should we call you?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <p>Choose any empty seat above to join.</p>
                  </div>
                ) : (
                  <>
                    <div className="ready-actions">
                      <button
                        className={`button ${v.seats[you]?.ready ? "ready-button" : "gold-button"}`}
                        disabled={!online}
                        onClick={() => send({ type: "ready" })}
                      >
                        {v.seats[you]?.ready ? (
                          <>
                            <Check size={18} /> You’re ready
                          </>
                        ) : (
                          <>
                            I’m ready <Check size={18} />
                          </>
                        )}
                      </button>
                      {v.host && (
                        <button
                          className="button gold-button"
                          disabled={!allReady || !online}
                          onClick={() => send({ type: "start" })}
                        >
                          Deal the cards <ArrowRight size={18} />
                        </button>
                      )}
                    </div>
                    <p>
                      {v.host
                        ? "Everyone ready? Deal when all four friends are here."
                        : "The host will deal once everyone is ready."}
                    </p>
                    <button
                      className="text-button leave-seat"
                      onClick={() => send({ type: "leave" })}
                    >
                      <DoorOpen size={14} /> Leave seat
                    </button>
                  </>
                )}
              </section>
            ) : (
              <section className="hand-zone">
                {v.phase === "trump" && v.caller === you && (
                  <div className="trump-choice" aria-label="Choose trump suit">
                    {SUITS.map((s) => (
                      <button
                        key={s}
                        disabled={!online || v.paused}
                        onClick={() => send({ type: "trump", suit: s })}
                      >
                        <SuitIcon suit={s} />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                )}
                {v.phase === "hand-end" || v.phase === "finished" ? (
                  <div className="hand-result">
                    <strong>
                      {v.result?.winner === null
                        ? `${v.pending} bonus token${v.pending > 1 ? "s" : ""} carried`
                        : `+${v.result?.tokens} tokens to Team ${(v.result?.winner ?? 0) + 1}`}
                    </strong>
                    <span>{v.result?.tricks.join(" – ")} tricks</span>
                    {v.host ? (
                      <button
                        className="button gold-button"
                        disabled={!online || v.paused}
                        onClick={() =>
                          send({
                            type: v.phase === "finished" ? "rematch" : "next",
                          })
                        }
                      >
                        {v.phase === "finished" ? (
                          <>
                            <RotateCcw size={17} /> Play again
                          </>
                        ) : (
                          <>
                            Next hand <ArrowRight size={17} />
                          </>
                        )}
                      </button>
                    ) : (
                      <p>
                        Waiting for the host to{" "}
                        {v.phase === "finished"
                          ? "start a rematch"
                          : "deal the next hand"}
                        .
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="hand-label">
                      <span>
                        {you === null
                          ? "You’re watching"
                          : v.phase === "trump"
                            ? "Your first four"
                            : "Your hand"}
                      </span>
                      <span>
                        {v.phase === "trump"
                          ? "4 more after the call"
                          : myTurn
                            ? "Choose a card to play"
                            : you !== null
                              ? `Team ${(you % 2) + 1} · ${v.hand.length} cards`
                              : ""}
                      </span>
                    </div>
                    <div className="your-hand">
                      {[...v.hand]
                        .sort(
                          (a, b) =>
                            SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) ||
                            b.rank - a.rank,
                        )
                        .map((c, i) => (
                          <motion.button
                            key={c.id}
                            className={`hand-card ${myTurn && legal.has(c.id) ? "playable" : ""}`}
                            disabled={!myTurn || !legal.has(c.id)}
                            onClick={() => send({ type: "play", card: c.id })}
                            aria-label={`Play ${rankLabel(c.rank)} of ${c.suit}`}
                            initial={reduce ? false : { opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: reduce ? 0 : i * 0.035 }}
                            whileHover={reduce ? undefined : { y: -14 }}
                            whileFocus={reduce ? undefined : { y: -14 }}
                          >
                            <PlayingCard card={c} />
                          </motion.button>
                        ))}
                    </div>
                  </>
                )}
              </section>
            )}
          </>
        )}
        {!v && (
          <div className="connection-placeholder">
            {connection === "unavailable" ? (
              <>
                <WifiOff size={36} />
                <Link href="/" className="button gold-button">
                  Back to Omi <ArrowRight size={17} />
                </Link>
              </>
            ) : (
              <>
                <LoaderCircle size={30} className="spin" />
                <p>
                  {connection === "disconnected"
                    ? "Check your connection, or try again."
                    : "Setting the table…"}
                </p>
                {connection === "disconnected" && (
                  <button
                    className="button gold-button"
                    onClick={() => location.reload()}
                  >
                    Try again <RotateCcw size={17} />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </main>
      <footer className="room-footer">
        <span>
          <span className="tiny-dot" /> Private table
        </span>
        <button className="text-button" onClick={() => setRules(true)}>
          A little help with the rules <ArrowUpRight size={14} />
        </button>
      </footer>
      {rules && <Rules close={() => setRules(false)} />}
    </div>
  );
}

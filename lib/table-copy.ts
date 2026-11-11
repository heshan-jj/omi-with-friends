import type { View } from "./protocol";

export function teamName(team: number, you: number | null) {
  return you === null
    ? `Team ${team + 1}`
    : team === you % 2
      ? "Your team"
      : "Other team";
}
function namesList(names: string[]) {
  return names.length < 2
    ? (names[0] ?? "the other players")
    : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}
export function tableMessage(
  v: View | null,
  connection: "connecting" | "connected" | "disconnected" | "unavailable",
) {
  if (connection === "unavailable")
    return {
      headline: "Unable to open this table",
      detail: "Online play is unavailable right now. Try again in a moment.",
    };
  if (connection === "disconnected")
    return {
      headline: "You’re disconnected",
      detail:
        "Check your connection. Keep this tab open to rejoin, or select Reconnect.",
    };
  if (!v)
    return {
      headline: "Joining your table…",
      detail: "Connecting to the game and finding your seat.",
    };
  const you = v.you;
  const caller = v.seats[v.caller]?.name ?? "The next player";
  const next = v.seats[v.turn]?.name ?? "The next player";
  if (v.phase === "lobby") {
    if (you === null)
      return {
        headline: "Join your friends",
        detail:
          "Enter your name, then choose a seat. Your teammate sits opposite you.",
      };
    const missing = 4 - v.seats.filter(Boolean).length;
    if (missing)
      return {
        headline: "Invite your friends",
        detail: `Share the invite link with ${missing} more ${missing === 1 ? "friend" : "friends"}, then select Ready to play.`,
      };
    if (v.seats.every((p) => p?.ready && p.connected))
      return {
        headline: "Everyone’s ready!",
        detail: v.host
          ? "Select Start game to deal the first round."
          : "The host can now start the game.",
      };
    return {
      headline: "Get ready to play",
      detail: v.seats[you]?.ready
        ? "Waiting for the other players to select Ready to play."
        : "Select Ready to play. The host starts when all 4 players are ready.",
    };
  }
  if (v.phase === "finished")
    return {
      headline: `${teamName(v.result?.winner ?? 0, you)} wins the match!`,
      detail: v.paused
        ? "Everyone needs to return before the host can start a new match."
        : v.host
          ? "Select Play again to start a new match."
          : "The host can start a new match when everyone is ready.",
    };
  if (v.paused) {
    const missing = v.seats
      .filter((p) => p && !p.connected)
      .map((p) => p!.name);
    return {
      headline: "Game paused",
      detail: `Waiting for ${namesList(missing)} to reconnect. Play continues automatically when they return.`,
    };
  }
  if (v.phase === "trump")
    return {
      headline:
        v.caller === you
          ? "Choose the trump suit"
          : `${caller} is choosing trump`,
      detail:
        you === null
          ? "Play begins after they choose the trump suit."
          : v.caller === you
            ? "Choose a suit below. You’ll then receive your next 4 cards."
            : "You’ll receive 4 more cards after they choose.",
    };
  if (v.phase === "play") {
    if (v.turn !== you)
      return {
        headline: `${next}’s turn`,
        detail:
          you === null
            ? "You’re watching this match."
            : "Your cards unlock when it’s your turn.",
      };
    const lead = v.trick[0]?.card.suit;
    return {
      headline: "Your turn — play a card",
      detail: !lead
        ? "Choose any card from your hand to start this trick."
        : v.hand.some((c) => c.suit === lead)
          ? `Play a ${lead.slice(0, -1)} card. You must follow the suit that was led.`
          : `You have no ${lead}. You can play any card.`,
    };
  }
  if (v.phase === "trick-end") {
    const winner = v.seats[v.lastWinner ?? 0]?.name ?? "The winning player";
    return {
      headline: `${winner} won the trick`,
      detail:
        you === v.lastWinner
          ? "You play first in the next trick."
          : `${winner} plays first in the next trick.`,
    };
  }
  if (v.result?.winner === null)
    return {
      headline: "Round tied: 4–4",
      detail: `No tokens this round. The next winning team gets ${v.pending} extra ${v.pending === 1 ? "token" : "tokens"}.`,
    };
  return {
    headline: `${teamName(v.result?.winner ?? 0, you)} won the round`,
    detail: `${v.result?.tricks.join("–")} tricks. ${v.result?.tokens} ${v.result?.tokens === 1 ? "token" : "tokens"} added to the winning team’s score.`,
  };
}

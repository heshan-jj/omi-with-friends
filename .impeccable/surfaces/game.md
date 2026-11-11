# Home and private table

Mode: Operate. Create/join a room, choose seats, play Omi on phones.

## Direction contract

THESIS: An inviting private card table whose controls stay clear while cards lead the scene.
OWN-WORLD: Deep green felt, warm ivory cards, saffron actions, compact humanist UI and expressive serif display. Seats visibly connect partners across the table.
STORY: Enter your name, create or join a table, share the link, settle into a seat, and play.
FIRST VIEWPORT: Split desktop composition with large Omi wordmark and one create/join form beside a composed four-card spread; mobile stacks the form before the illustration. The table has four anchored seats, a central trick, and a hand along the bottom.
FORM: Code-led implementation of the already discussed warm card-table direction. Launcher and concept seed unavailable (missing bundled executable); no seed result fabricated. Signature interaction: cards lift on selection and settle into the center with reduced-motion support.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Motion refinement

Focal moment: the cards are dealt into a fan, share their geometry from the local hand into the trick, then collect toward the trick winner. The home preview rehearses the same deal once on load.
Continuity: animate hand reflow, directional opponent plays, trump reveal and changing score numerals.
Feedback: lift playable cards on hover/focus, compress taps, pulse the active seat twice, and celebrate decisive hands with one bounded burst.
Budget: 0.4s card flights, 0.25s reflow, 0.12s status changes; the existing server rhythm stays unchanged. No infinite decorative loops. Reduced motion removes travel, ripples, and confetti while preserving state and score updates.

## Copy and trump guidance

Lead each state with a direct explanation and one available next action. Pause messages name disconnected players. Use Round for a deal, hand for cards, tokens for score, and Your team/Your teammate for relationships. Keep a sticky, high-contrast trump banner below the score; show pending selection honestly, and mark trump card faces with a text label as well as color. Never ask non-callers or spectators to choose trump.

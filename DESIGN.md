---
name: Omi with friends
description: A warm private card table for friends.
colors:
  paper: "#f4f0e5"
  ink: "#173e32"
  muted: "#617365"
  green: "#123e32"
  deep: "#0c2b24"
  gold: "#ecc06b"
  red: "#b64435"
  line: "#d7d8c9"
  card-face: "#fffaf0"
  card-back: "#c9d2ac"
  primary-hover: "#205541"
  gold-hover: "#f7ce81"
typography:
  display:
    fontFamily: '"Bodoni Moda", Georgia, serif'
    fontSize: "clamp(60px, 6.4vw, 92px)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  headline:
    fontFamily: '"Bodoni Moda", Georgia, serif'
    fontSize: "clamp(26px, 3vw, 37px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: '"Bodoni Moda", Georgia, serif'
    fontSize: "34px"
    fontWeight: 500
    lineHeight: 1.15
  body:
    fontFamily: '"Manrope", sans-serif'
    fontSize: "14px"
    fontWeight: 400
  label:
    fontFamily: '"Manrope", sans-serif'
    fontSize: "12px"
    fontWeight: 700
  button:
    fontFamily: '"Manrope", sans-serif'
    fontSize: "13px"
    fontWeight: 700
  card-rank:
    fontFamily: '"Bodoni Moda", Georgia, serif'
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.1
rounded:
  small-card: "5px"
  compact-control: "7px"
  button: "8px"
  field-card: "9px"
  seat: "13px"
  dialog: "16px"
  table: "150px"
  preview: "200px"
  circle: "50%"
spacing:
  micro: "5px"
  compact: "8px"
  control-gap: "12px"
  inset: "14px"
  standard: "18px"
  section: "24px"
  large: "32px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "14px 22px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.deep}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "14px 22px"
  button-gold-hover:
    backgroundColor: "{colors.gold-hover}"
  button-ready:
    backgroundColor: "#b7d6b324"
    textColor: "#c5e5ba"
    rounded: "{rounded.button}"
    padding: "11px 18px"
  button-text:
    textColor: "{colors.ink}"
    padding: "9px 0"
  button-invite:
    backgroundColor: "#ecf0db0d"
    textColor: "#e6ebd8"
    rounded: "{rounded.compact-control}"
    padding: "10px 14px"
  button-icon:
    rounded: "{rounded.circle}"
    width: "40px"
    height: "40px"
  input:
    backgroundColor: "rgba(255, 255, 255, 0.45)"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field-card}"
    padding: "15px 17px"
  brand:
    textColor: "{colors.ink}"
  playing-card:
    backgroundColor: "{colors.card-face}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field-card}"
    width: "96px"
    height: "138px"
  playing-card-back:
    backgroundColor: "{colors.card-back}"
    rounded: "{rounded.field-card}"
    width: "96px"
    height: "138px"
---

# Design System: Omi with friends

## Overview

**Creative North Star: "The private card table"**

The private card table is the established visual anchor: deep green felt, warm ivory cards, saffron actions, compact humanist controls and expressive serif display. Rounded table silhouettes and overlapping cards provide the material character.

The interface prioritizes readable cards and clear state. The light entry surface and dark playing surface share the same typography and control shapes; contextual gold emphasis connects invitations, readiness and legal play.

**Key Characteristics:**

- Warm paper against deep green felt.
- Serif expression paired with compact sans-serif controls.
- Recognizable card faces, overlapping hands and anchored seats.
- Visible keyboard focus and reduced-motion support.

## Colors

Warm neutrals and green surfaces establish the setting; saffron and suit red provide functional contrast. Frontmatter records the reusable palette, retaining the CSS token names.

### Primary

- **Green:** primary entry actions and light-surface field focus.
- **Deep:** room background and the dark ground behind seats.
- **Gold:** actions on the table, the local team marker, trump icons, selection and legal-card emphasis.

### Secondary

- **Red:** hearts and diamonds, paired with their distinct shapes.

### Neutral

- **Paper:** entry background, dialog background and prominent text on dark surfaces.
- **Ink:** entry text and dark suit symbols.
- **Muted:** supporting light-surface copy.
- **Line:** field borders and entry dividers.
- **Card face / Card back:** warm card paper and pale green patterned backs.
- **Primary hover / Gold hover:** the established brighter action states.

Felt surfaces use radial green gradients. Supporting text and outlines use contextual muted greens and translucent pale tones rather than one universal neutral on both backgrounds.

## Typography

**Display Font:** Bodoni Moda, with Georgia and serif fallbacks.
**Body Font:** Manrope, with sans-serif fallback.

The serif gives headings, wordmarks and card ranks their expressive character. The sans-serif keeps names, instructions, scores and controls compact and readable. No separate mono family is used; score numerals use tabular figures.

### Hierarchy

- **Display:** entry headline; responsive sizing is defined in Layout.
- **Headline:** centered table status, with balanced wrapping.
- **Title:** rules-dialog heading.
- **Body:** base interface text; entry introduction uses relaxed line height (1.9).
- **Label:** name labels; secondary game metadata ranges from small supporting copy to compact team and seat labels.
- **Button:** bold action labels; lobby controls use smaller text (11px desktop, 10px mobile).
- **Card rank:** upright serif ranks; reduced context sizes retain the same family and weight.

The wordmark uses a tight serif treatment (600 weight, 58px, line height 1, letter spacing -0.04em); its dot changes from warm brown on paper to gold at the table.

## Layout

The entry shell is centered with a maximum width (1600px). Its desktop main grid uses two columns (1fr / 1.05fr), a proportional gap (6%) and side padding (6.5%). The text block is restrained (470px maximum) and the entry form is narrower (354px maximum). The room main area is centered (1100px maximum) with side padding (30px). Table and hand remain the focal spatial group, with seats anchored north, south, east and west and partners opposite.

The table is proportional (80% width, 700px maximum) with a fixed desktop height (330px), generous space for seats above and below, and a centered hand below it. Small gaps organize controls; larger spacing separates status, scores, table and hand. Frontmatter records reused spacing steps, not an enforced mathematical scale.

- **Wide screens (min-width 1500px):** entry vertical padding and preview height expand; the playing table grows to 360px high.
- **Compact desktop (max-width 900px):** entry side padding becomes 5%, preview and table shrink, room side padding becomes 24px, and the room brand subtitle hides.
- **Mobile (max-width 640px):** entry content stacks with the form before the illustration. The entry headline uses clamp(55px, 14vw, 75px); the table headline becomes 27px. Entry form width is unrestricted within its container. Room padding becomes 14px; the table uses calc(100% - 86px), a 370px maximum and a 285px height. Seats remain anchored around it. Cards, metadata, header controls and score gaps shrink. The connection dot hides while its surrounding status remains available.

Full-size cards are 96 × 138px; the live hand uses 76 × 110px desktop and 57 × 84px mobile. Trick cards use 65 × 94px desktop and 49 × 71px mobile. The hand overlaps horizontally, with mobile overlap clamped to keep eight cards within the viewport. Preserve rank and suit visibility when adapting these layouts.

## Elevation & Depth

Depth combines felt gradients, inset table lines, card overlap and selective shadows. Controls generally remain flat; physical cards and the table carry ambient depth, while the modal rises above a dimmed, blurred backdrop.

### Shadow Vocabulary

- **Card:** `0 6px 10px #082e2530` under ordinary playing cards.
- **Preview felt:** `0 24px 42px -24px #102c3066` below the entry illustration.
- **Game table:** `0 20px 45px #04191250` below the live table.
- **Avatar:** `0 4px 12px #0003` around occupied table seats.
- **Playable card:** `0 6px 15px #021b2066, 0 -2px 0 var(--gold)` adds a gold top edge.
- **Dialog:** `0 30px 90px #0006`; backdrop `#061f19b8` with blur (4px).

## Shapes

Controls and cards use gently rounded rectangles; fields and full-size cards share the same corner radius. Smaller card backs tighten their corners. Tables use large capsule-like radii, reducing to 110px on mobile. Avatars and tiny connection indicators are circular. Thin field strokes, inset felt rings and dashed empty-seat icon outlines provide boundaries without heavy framing. Dialogs use the softest rectangular corners in the interface.

## Components

### Buttons

Confident, compact actions use bold sans-serif labels, centered alignment and room for inline icons. Primary green serves the paper surface; gold serves the room. Standard buttons have a minimum height (50px); the entry create action is full width and slightly taller (53px). The ready state uses a translucent green fill, pale text and a fine outline. General disabled controls use opacity (0.4); disabled hand cards preserve full wrapper opacity and dim the card face instead.

Enabled standard buttons lift on hover (-2px) with background and transform transitions (0.18s). Keyboard focus uses a visible outline (3px) and offset (5px): ochre on paper and gold in the room. Text buttons underline on hover; invite controls brighten their translucent background. Circular icon buttons use a subtle translucent hover fill.

### Inputs / Fields

Light fields use a thin line border and translucent white background. Focus changes the border to green and adds a translucent ink ring (3px). The joined invite field keeps one shared outline around input and arrow action. Dark-room name fields use a translucent fill, pale stroke, paper text and a gold focus ring. Labels remain outside the fields; errors appear as red supporting text on entry and a warm dark-red alert strip in the room.

### Navigation

The serif wordmark is a home link. The entry header pairs it with a short subtitle and a rules text action; the room header pairs it with code, invitation and rules controls. Brand subtitles hide as width contracts. The invitation action includes a link/check icon and visible copy state. There is no tab bar or standalone chip component in the current interface.

### Playing cards

Warm faces carry corner ranks and suits plus a central pip, with an inverted lower corner. Hearts and diamonds are red; clubs and spades use ink. Backs use pale green, a fine diagonal pattern and a centered serif mark. Opponent hands always show backs. A playable hand card gains a gold top edge; unavailable cards dim. Card focus rises above its neighbors and keeps a visible outline.

Cards are the focal motion. The home spread deals once on load, completing in about 1.3s. A new hand fans in over 0.48s with 0.045s stagger; a local card shares its layout identity with its table destination. Opponent cards travel from their seat over 0.4s, the winning card gains a gold outline, and collected tricks shrink toward the winner. Remaining hand cards reflow over 0.25s. Playable cards lift on hover/focus (-18px) and compress on tap (0.95 scale). Arrivals use `cubic-bezier(0.16, 1, 0.3, 1)`.

Supporting feedback stays short: status changes (0.12s), score numerals (0.24s), and trump reveal (0.32s). The active seat ripples twice; decisive hands get one bounded confetti burst (1.15s plus a capped stagger). No animation blocks a move or changes the server's pace. Reduced motion removes spatial transitions, ripples and confetti while leaving scores, turn outlines, labels and actions intact. The loading spinner normally rotates over 1.2s with linear timing.

### Table, seats and scores

The green table has an inset fine ring and four anchored seats. Occupied seats show a circular initial avatar, name, local-player marker and team/readiness metadata. Team colors distinguish the two sides; a gold avatar outline marks the current turn. Empty seats are dark rounded buttons with a dashed circular people icon, invitation text and team label. The score strip uses tabular numbers, compact supporting trick counts and gold text for the local team.

### Rules dialog

A warm paper modal carries a serif title, compact explanatory copy, ordered rules, a close icon and a full-width primary action. Its width is bounded (540px, or viewport minus 32px), height constrained (85svh), and padding reduces on mobile. It uses the native modal dialog behavior, including Escape dismissal.

## Do's and Don'ts

### Do:

- **Do** use the established serif for display text and card ranks, and the sans-serif for controls and metadata.
- **Do** preserve the distinction between red suits and dark suits, including their suit shapes.
- **Do** keep visible focus outlines and the reduced-motion behavior on interactive cards and buttons.
- **Do** keep game status, team scores and player state visually distinct from the playing cards.

### Don't:

- **Don't** expose opponents’ card faces; use the patterned backs.
- **Don't** replace disabled hand-card dimming with the general button opacity treatment.
- **Don't** add decorative motion that bypasses the existing reduced-motion preference.

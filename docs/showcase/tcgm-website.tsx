/**
 * Showcase · TCG-M "Layered Prism" — a TOKEN-ONLY rebuild of a THIRD brand, this one with MOTION.
 *
 * Source: the `TCG-M_Complete_Brand_Design_SNS_v1.0` handoff (a hand-written HTML/CSS/JS prototype
 * — `07_prototype/index.html` + `site.css` + `app.js`, with `02_foundations/tokens.css` as its
 * source of truth). Japanese-first consumer product: trading-card price comparison, news and a
 * release calendar. All cards, prices, shops and dates below are the bundle's own FICTIONAL sample
 * data and are reproduced as such.
 *
 * Why this one exists next to acme-website (light/gold) and futurelastic-web (dark/gold): those two
 * prove a re-theme, and both are STILL. This brand ships a written MOTION TABLE
 * (`02_foundations/04_MOTION_AND_STATES.md`) — press 90ms, hover 140ms, state 200ms, hero-once
 * 480ms at y8→0, `cubic-bezier(.2,.8,.2,1)` — plus an explicit motion BUDGET (one decorative motion
 * region per viewport; no parallax, no count-up, no infinite float). So the interesting question is
 * not "can the tokens paint it" but "can the motion tokens be re-tuned to someone else's timing
 * spec, and does the shipped `Reveal` primitive land where the spec says it should". Both are
 * answered in the THEME block below: the brand's timing table IS eight token declarations, and the
 * hero reveals the ILLUSTRATION ONLY because the spec says "chỉ illustration, text hiện ngay".
 *
 * Per docs/COMPOSITION-VS-COMPONENT.md every section here (Header/Hero/GameRail/CardGrid/NewsRail/
 * Releases/Trust/Footer) FAILS the Framework-Component Test → composition over real primitives.
 * ZERO new framework components; nothing is added to `src/components/`.
 */
import * as React from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Heart,
  Layers,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  ArrowLeftRight,
} from "lucide-react";

import { Button, Heading, Icon, Reveal, Text } from "@godxjp/ui/general";
import {
  Badge,
  Card,
  CardContent,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  EmptyState,
} from "@godxjp/ui/data-display";
import { Flex, ResponsiveGrid, Separator } from "@godxjp/ui/layout";
import { useTranslation } from "@godxjp/ui/i18n";
import { SearchInput, ToggleGroup, ToggleGroupItem } from "@godxjp/ui/data-entry";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Toaster,
  toast,
} from "@godxjp/ui/feedback";

import heroPrism from "../assets/tcgm/hero-prism.svg";
import lockup from "../assets/tcgm/tcgm-lockup-color.svg";
import card1 from "../assets/tcgm/card-1.svg";
import card2 from "../assets/tcgm/card-2.svg";
import card3 from "../assets/tcgm/card-3.svg";
import card4 from "../assets/tcgm/card-4.svg";
import card5 from "../assets/tcgm/card-5.svg";
import card6 from "../assets/tcgm/card-6.svg";
import scene1 from "../assets/tcgm/scene-1.svg";
import scene2 from "../assets/tcgm/scene-2.svg";
import scene3 from "../assets/tcgm/scene-3.svg";
import scene4 from "../assets/tcgm/scene-4.svg";

// ── Brand stylesheet: the handoff's `tokens.css`, mapped onto the library's semantic roles. ───────
// This is what the consumer ships as their own theme.css. Raw brand values live HERE, never as
// arbitrary utilities in the markup below.
const THEME = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap');
[data-tenant="tcgm"] {
  /* Colour — 02_foundations/tokens.css, converted to the HSL triplets the library reads.
     Measured against WCAG 2.2: white/teal 9.51, ink/off-white 12.30, muted/off-white 5.47,
     muted/white 5.73, teal/sky-wash 8.71, teal/lavender-wash 8.35, teal/sand-wash 8.77 — every
     pair AA or better. "--input" is the CONTROL boundary held to 3:1 (SC 1.4.11): the brand's own
     "--color-border-strong" #718891 is 3.73:1 on white, so the boundary token is that one and NOT
     the decorative "--color-border" #DCE7EB, which stays chrome. */
  --primary: 192 72% 21%;            /* teal #0F4C5C — CTA, logo, heading ink */
  --primary-foreground: 0 0% 100%;
  --ring: 199 89% 29%;               /* focus #08618A — the brand rings in a DIFFERENT blue than
                                        it fills with, so --ring is declared, never inherited */
  --focus-ring-color: 199 89% 29%;
  --accent: 254 100% 97%;            /* lavender wash #F2EEFF — discovery/editorial */
  --accent-foreground: 195 57% 16%;
  --background: 210 40% 98%;         /* off-white #F8FAFC */
  --foreground: 195 57% 16%;         /* ink #123642 */
  --card: 0 0% 100%; --card-foreground: 195 57% 16%;
  --secondary: 203 100% 96%;         /* sky wash #EAF7FF — the quiet fill, per "white/sky 2.26:1
                                        không dùng": the SATURATED sky is illustration-only */
  --secondary-foreground: 192 72% 21%;
  --muted: 198 26% 93%; --muted-foreground: 196 17% 39%;
  --border: 196 27% 89%; --input: 197 13% 51%;
  --success: 161 65% 25%; --warning: 31 70% 31%; --destructive: 349 67% 42%; --info: 202 71% 31%;

  /* Shape — 01_FOUNDATIONS "Radius": 12 control · 20 card · 24 panel · 32 hero · 999 pill. */
  --radius: 0.75rem; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px; --radius-2xl: 24px;
  --card-radius: var(--radius-xl); --control-radius: var(--radius-md);

  /* Elevation — the brand's four shadows verbatim; the hover step is what Card "hoverable" raises
     to, so "nâng tối đa 2px và chuyển shadow sm→md" is a token pair, not a hand-written rule. */
  --shadow-color: 15 76 92;
  --shadow-xs: 0 1px 2px rgb(15 76 92 / .06);
  --card-shadow: 0 1px 2px rgb(15 76 92 / .06);
  --card-hover-shadow: 0 12px 32px -14px rgb(15 76 92 / .20);
  --shadow-sm: 0 4px 14px -6px rgb(15 76 92 / .12);
  --shadow-md: 0 12px 32px -14px rgb(15 76 92 / .20);
  --shadow-lg: 0 24px 64px -24px rgb(15 76 92 / .26);

  /* Type — Noto Sans JP for Japanese, Montserrat for Latin labels and prices. The brand is
     explicit that Montserrat carries no Japanese glyph, so it is the DISPLAY/label face only and
     never the body face. */
  --font-family-body: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", system-ui, sans-serif;
  --font-family-sans: var(--font-family-body);
  /* HEADINGS ARE NOTO, NOT MONTSERRAT. The prototype points h1-h3 at its --font-jp, and the brand
     says why in one line: Montserrat carries no Japanese glyph. A "Montserrat first" display stack
     LOOKS right because the browser falls through per glyph, but it hands the Latin inside a
     Japanese headline a different face than the headline, which is the opposite of the intent.
     Montserrat is the LATIN-label face, and it arrives through .tm-latin below. */
  --font-family-display: var(--font-family-body);
  --tm-latin: "Montserrat", system-ui, sans-serif;
  /* Hero display. The formula is 02_TYPOGRAPHY's own — "Use clamp(2.125rem, 4vw, 3.5rem) cho
     hero" — and it is a token rather than a call-site style because --font-size-display is the
     BASE KNOB of the whole display ramp, so 3xl/4xl follow it. Pinned at 3.5rem it measured 56px
     at 390, where the same document's mobile column says 34px; 2.125rem IS that 34px. */
  --font-size-display: clamp(2.125rem, 4vw, 3.5rem);
  --letter-spacing-tight: -0.025em;  /* JP heading tracking; the Latin −.035em is on .tm-eyebrow */

  /* MOTION — 04_MOTION_AND_STATES.md's timing table, as tokens. This is the whole point of this
     showcase: another brand's motion spec arrives as CONFIGURATION, and the shipped "Reveal"
     primitive + Card hover + Dialog enter all retime themselves off it with no new CSS.
       press 90ms · hover/focus 140ms · tab/state 200ms · enter 260ms · exit 180ms · hero-once 480ms
     Ease is the brand's "cubic-bezier(.2,.8,.2,1)" everywhere; it forbids spring overshoot. */
  --duration-fast: 140ms;
  --duration-base: 200ms;
  --duration-slow: 480ms;            /* motion-heroOnce */
  --ease-standard: cubic-bezier(.2,.8,.2,1);
  --ease-emphasized: cubic-bezier(.2,.8,.2,1);
  --ease-decelerate: cubic-bezier(.2,.8,.2,1);
  --reveal-distance: 8px;            /* "Hero once 480ms: 0→1, y8→0" — the 8 is the spec's */
  --reveal-stagger-step: 70ms;

  /* The carousel arrow TARGET. 03_COMPONENTS asks for "arrows44px" and 01_FOUNDATIONS sets the
     brand floor at 44x44 ("Chuan noi bo target >=44x44 CSS px tren web"), above WCAG 2.2 SC
     2.5.8's 24px. The library default is 2rem/32px; this is the knob that reaches the brand's
     number, and it did not exist until gh#931 - the box was two bare literals, so the only way
     to hit 44 was to override a library selector from this stylesheet. */
  --carousel-arrow-size: 2.75rem;

  /* Measure - the brand's content-max 1280 with 32px desktop gutters. */
  --page-measure-wide: 80rem;
  color-scheme: light;
}

/* ── Marketing surface (the consumer's own section stylesheet) ─────────────────────────────── */
[data-tenant="tcgm"] { background: hsl(var(--background)); color: hsl(var(--foreground)); min-block-size: 100vh; }
/* The gutter ladder is the prototype's own: .container is "100% - 64px" on desktop, "- 48px" under
   1024 and "- 32px" under 768. A MEDIA query, not a container one — a container cannot query
   itself, and a page gutter is a viewport concern anyway. It is also what gives the 34px headline
   room at 390: on a flat 32px gutter the hero column was 278px and "もっと見つけよう。" broke
   before the final character. */
[data-tenant="tcgm"] .tm-shell { margin-inline: auto; inline-size: 100%; max-inline-size: var(--page-measure-wide); padding-inline: var(--space-4); container-type: inline-size; }
@media (min-width: 768px) { [data-tenant="tcgm"] .tm-shell { padding-inline: var(--space-6); } }
@media (min-width: 1024px) { [data-tenant="tcgm"] .tm-shell { padding-inline: var(--space-8); } }
[data-tenant="tcgm"] .tm-section { padding-block-start: var(--space-20); }

/* The demo strip the prototype puts ABOVE the header. It is page chrome, not a Banner: it carries
   no action, no dismiss and no live region — the whole page is the sample it is labelling. */
[data-tenant="tcgm"] .tm-demo-notice { background: hsl(var(--accent)); border-block-end: var(--stroke-hairline) solid hsl(var(--border)); padding-block: var(--space-1); text-align: center; }

/* The sticky header IS this page's bar region. Not a <Topbar>: that is the APPLICATION chrome
   (app launcher, org switcher, account cell), and a marketing header is a nav row — the same call
   acme-website.tsx and futurelastic-web.tsx each made. */
[data-tenant="tcgm"] .tm-header { position: sticky; inset-block-start: 0; z-index: 30; background: hsl(var(--card)); border-block-end: var(--stroke-hairline) solid hsl(var(--border)); }
[data-tenant="tcgm"] .tm-header-inner { min-block-size: 80px; display: flex; align-items: center; column-gap: var(--space-8); row-gap: var(--space-2); flex-wrap: wrap; padding-block: var(--space-2); }
[data-tenant="tcgm"] .tm-brand { display: block; inline-size: 164px; max-inline-size: 42vw; }
[data-tenant="tcgm"] .tm-eyebrow { font-family: var(--tm-latin); font-weight: 700; font-size: 0.6875rem; line-height: 1.4; letter-spacing: .16em; text-transform: uppercase; color: hsl(var(--primary)); }

/* The Latin-label face. 02_TYPOGRAPHY: Montserrat is for "Latin short labels/prices" only, so it
   is opted into per element rather than inherited by a whole subtree of Japanese. */
[data-tenant="tcgm"] .tm-latin { font-family: var(--tm-latin); }

/* Responsive VISIBILITY, the only thing the header needs a class for: which controls a phone shows
   is presentation, so it belongs in the brand stylesheet rather than as props on four Buttons. */
[data-tenant="tcgm"] .tm-desktop-only { display: none; }
[data-tenant="tcgm"] .tm-mobile-only { display: inline-flex; }
@container (min-width: 768px) {
  [data-tenant="tcgm"] .tm-desktop-only { display: inline-flex; }
  [data-tenant="tcgm"] .tm-mobile-only { display: none; }
}

/* HERO. Prism Wash = two low-opacity radial washes, the brand's own motif, and the reason the
   library's .ui-brand-glow is NOT used here: that halo is one brand-coloured lobe, and this brand
   wants two in two different accents. Static, per "Homepage hero là static, không slideshow". */
[data-tenant="tcgm"] .tm-hero { position: relative; overflow: hidden; margin-block-start: var(--space-8); border: var(--stroke-hairline) solid hsl(var(--border)); border-radius: 32px;
  background: radial-gradient(ellipse at 90% 0%, hsl(var(--secondary)), transparent 65%), radial-gradient(ellipse at 0% 100%, hsl(var(--accent)), transparent 70%), hsl(var(--card));
  display: grid; grid-template-columns: 1fr; align-items: center; }
@container (min-width: 768px) { [data-tenant="tcgm"] .tm-hero { grid-template-columns: 1.15fr 1fr; min-block-size: 460px; } }
[data-tenant="tcgm"] .tm-hero-copy { padding: var(--space-8) var(--space-6) 0; max-inline-size: 650px; }
@container (min-width: 768px) { [data-tenant="tcgm"] .tm-hero-copy { padding: var(--space-12) 0 var(--space-12) var(--space-12); } }
[data-tenant="tcgm"] .tm-hero-search { max-inline-size: 550px; }
[data-tenant="tcgm"] .tm-hero-art { position: relative; min-inline-size: 0; block-size: 212px; overflow: hidden; }
@container (min-width: 768px) { [data-tenant="tcgm"] .tm-hero-art { block-size: auto; align-self: stretch; overflow: visible; } }
[data-tenant="tcgm"] .tm-hero-art img { position: absolute; inset-block-start: -58px; inset-inline-end: -14px; inline-size: 460px; max-inline-size: none; }
@container (min-width: 768px) { [data-tenant="tcgm"] .tm-hero-art img { inset-block: 0; inset-inline: -6% auto; inline-size: 128%; block-size: 100%; object-fit: contain; } }
/* The reveal WRAPS the art, so the observer measures the art's box and the copy is never inside a
   box that starts at opacity 0 — the spec's "text hiện ngay" is structural, not a delay of 0. */
[data-tenant="tcgm"] .tm-hero-art .ui-reveal { display: contents; }
[data-tenant="tcgm"] .tm-art-tag { position: absolute; inset-block-end: 49px; inset-inline-end: 30px; display: none; align-items: center; gap: var(--space-2);
  background: hsl(var(--card) / .92); border: var(--stroke-hairline) solid hsl(var(--border)); padding: var(--space-3) var(--space-4); border-radius: 14px; box-shadow: var(--shadow-sm); rotate: -4deg; }
@container (min-width: 1024px) { [data-tenant="tcgm"] .tm-art-tag { display: flex; } }

/* Card artwork sits in a 3:4-ish WELL and is "contain"-fitted — the brand forbids cropping a card's
   code or border away (04_ART_DIRECTION "Image ratios"). */
[data-tenant="tcgm"] .tm-artwell { position: relative; display: grid; place-items: center; block-size: 220px; margin-block-end: var(--space-4);
  border-radius: 12px; background: linear-gradient(145deg, hsl(var(--muted)), hsl(var(--background))); }
[data-tenant="tcgm"] .tm-artwell img { block-size: 196px; inline-size: 140px; object-fit: contain; filter: drop-shadow(0 6px 10px rgb(15 76 92 / .09)); }
[data-tenant="tcgm"] .tm-sample { position: absolute; inset-block-start: var(--space-2); inset-inline-start: var(--space-2); }
[data-tenant="tcgm"] .tm-watch { position: absolute; inset-block-start: var(--space-3); inset-inline-end: var(--space-3); z-index: 1; background: hsl(var(--card)); }
[data-tenant="tcgm"] .tm-watch[aria-pressed="true"] svg { fill: currentColor; }
[data-tenant="tcgm"] .tm-card-body { position: relative; }
[data-tenant="tcgm"] .tm-card-name { min-block-size: 3.2em; }
[data-tenant="tcgm"] .tm-price-row { display: flex; align-items: end; justify-content: space-between; gap: var(--space-2);
  margin-block-start: var(--space-3); padding-block-start: var(--space-3); border-block-start: var(--stroke-hairline) solid hsl(var(--border)); }
/* The trailing "送料別 / サンプル" note is dropped on a narrow card, exactly as the prototype drops
   it ("@media(max-width:767px){.card-price>.caption{display:none}}"). At 390 the two-up grid gives
   each card ~163px: keeping the note squeezed the price label into three lines and pushed the
   figure — the one thing the card exists to show — off its own baseline. The same sentence is
   already carried by the section note above the grid, so nothing is lost.
   A MEDIA query, like the prototype: an unnamed "@container" resolves against the nearest ancestor
   container, which here is the grid (358px at 390), never the 163px card — it measured "shown" at
   390. Making the card its own container would work but buys nothing over the viewport rule the
   prototype already specifies. */
[data-tenant="tcgm"] .tm-price-note { display: none; }
@media (min-width: 768px) { [data-tenant="tcgm"] .tm-price-note { display: block; } }

/* News cover. 16:9, the wordmark plate sits OUTSIDE the artwork's focal area. */
[data-tenant="tcgm"] .tm-news-cover { position: relative; block-size: 180px; overflow: hidden; background: hsl(var(--secondary)); }
[data-tenant="tcgm"] .tm-news-cover img { inline-size: 100%; block-size: 100%; object-fit: cover; object-position: center 39%; }
[data-tenant="tcgm"] .tm-news-word { position: absolute; inset-block-end: var(--space-5); inset-inline-start: var(--space-6); font-family: var(--tm-latin); font-weight: 700; font-size: 1.5rem; line-height: 1.2; letter-spacing: .04em;
  color: hsl(var(--primary)); background: hsl(var(--card) / .92); padding: var(--space-1) var(--space-3); border-radius: 6px; }

/* Release row — the date box is the brand's Sand surface. */
[data-tenant="tcgm"] .tm-datebox { inline-size: 58px; flex: 0 0 auto; text-align: center; border-radius: 12px; padding: var(--space-2);
  background: #FAF5EF; font-family: var(--tm-latin); color: hsl(var(--primary)); }

/* Trust band — Sand, the one warm surface in the system. */
[data-tenant="tcgm"] .tm-trust { background: #FAF5EF; border: var(--stroke-hairline) solid #EBE4DB; border-radius: 28px; padding: var(--space-12); }
[data-tenant="tcgm"] .tm-trust-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-8); }
@container (min-width: 1024px) { [data-tenant="tcgm"] .tm-trust-grid { grid-template-columns: 1fr 1.35fr; gap: var(--space-16, 4rem); } }
[data-tenant="tcgm"] .tm-trust-icon { inline-size: 44px; block-size: 44px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 14px; background: hsl(var(--card)); color: hsl(var(--primary)); }

[data-tenant="tcgm"] .tm-footer { margin-block-start: var(--space-20); border-block-start: var(--stroke-hairline) solid hsl(var(--border)); background: hsl(var(--card)); padding-block: var(--space-12) var(--space-8); }
[data-tenant="tcgm"] .tm-footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }
@container (min-width: 768px) { [data-tenant="tcgm"] .tm-footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr; gap: var(--space-10); } }
[data-tenant="tcgm"] .tm-footer-main { grid-column: 1 / -1; }
@container (min-width: 768px) { [data-tenant="tcgm"] .tm-footer-main { grid-column: auto; } }

/* The one piece of motion written by hand rather than tokenised, and it is written ONCE: the
   artwork inside a hovered card follows the card's own lift. "@media (hover: hover)" so a touch
   device never sticks in a hover state, and the reduced-motion branch is not optional. */
@media (hover: hover) {
  [data-tenant="tcgm"] .ui-card:hover .tm-artwell img { transform: translateY(-2px) scale(1.02); }
}
[data-tenant="tcgm"] .tm-artwell img { transition: transform var(--duration-base) var(--ease-standard); }
@media (prefers-reduced-motion: reduce) {
  [data-tenant="tcgm"] .tm-artwell img { transition: none; transform: none; }
}
`;

// ── Sample data. The SHAPE lives here; every word lives in `docs/i18n/messages/{ja,en,vi}.json`
// under `tcgm.*` and arrives through `t()`.
//
// That split is not decoration. A showcase is what the MCP catalog quotes and what a consumer
// copy-pastes, and the library's own chrome (Carousel slide labels, EmptyState, dismiss buttons)
// already follows the viewer's locale — so a hard-coded Japanese label next to it renders TWO
// languages in one row, and teaches the library's first rule backwards. `check:no-consumer-coupling`
// holds new docs files at zero hard-coded locale content for exactly that reason; it caught this
// page with 51. `docs/showcase/caimono-price-comparison.tsx` is the same brief solved the same way.
//
// Every card, price, shop and date is FICTIONAL by design: the brand's own `01_POSITIONING.md`
// forbids implying coverage or a market price it does not have.
type Game = "all" | "pokemon" | "onepiece" | "yugioh" | "duel" | "mtg" | "other";

const GAMES: Game[] = ["all", "pokemon", "onepiece", "yugioh", "duel", "mtg", "other"];

type SampleCard = {
  id: string;
  game: Exclude<Game, "all">;
  code: string;
  price: number | null;
  art: string;
};

const CARDS: SampleCard[] = [
  { id: "demo-01", game: "pokemon", code: "SAMPLE-A001", price: 1280, art: card1 },
  { id: "demo-02", game: "onepiece", code: "SAMPLE-B002", price: 2480, art: card2 },
  { id: "demo-03", game: "yugioh", code: "SAMPLE-C003", price: 680, art: card3 },
  { id: "demo-04", game: "duel", code: "SAMPLE-D004", price: 3980, art: card4 },
  { id: "demo-05", game: "mtg", code: "SAMPLE-E005", price: 980, art: card5 },
  // The deliberate edge case the handoff ships: NO price. "no price listed" is not zero, and the
  // 〜 suffix is dropped with it — 02_VERBAL_IDENTITY is explicit about both.
  { id: "demo-06", game: "other", code: "SAMPLE-F006", price: null, art: card6 },
];

const NEWS: Array<{ id: string; word: string; art: string }> = [
  { id: "compare", word: "COMPARE\nWITH CARE.", art: scene1 },
  { id: "edition", word: "FIND YOUR\nEDITION.", art: scene2 },
  { id: "watch", word: "YOUR NEXT\nDISCOVERY.", art: scene3 },
  { id: "sources", word: "READ THE\nDETAILS.", art: scene4 },
];

const RELEASES: Array<{ id: string; day: string }> = [
  { id: "prism", day: "25" },
  { id: "notes", day: "28" },
  { id: "study", day: "30" },
];

const TRUST: Array<{ id: string; icon: typeof Layers }> = [
  { id: "edition", icon: Layers },
  { id: "freshness", icon: Clock },
  { id: "ads", icon: ShieldCheck },
];

const NAV = ["cards", "news", "calendar"] as const;

const SHELL = "tm-shell";

/**
 * `Intl.NumberFormat` in the product's own locale, never a hand-rolled thousands separator — and
 * `currency: "JPY"` rather than a "¥" + number concatenation, so the sign, the grouping and the
 * (absent) minor unit are all the locale's answer. The brand: "JPY không thêm hai số thập phân".
 */
function jpy(locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "JPY",
    currencyDisplay: "symbol",
  });
}

// ── Sections ───────────────────────────────────────────────────────────────────────────────────

function DemoNotice() {
  const { t } = useTranslation();
  return (
    <div className="tm-demo-notice">
      <Text as="p" size="2xs" tone="default">
        {t("tcgm.demoNotice")}
      </Text>
    </div>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  const { t } = useTranslation();
  return (
    <header className="tm-header">
      <div className={`${SHELL} tm-header-inner`}>
        <img className="tm-brand" src={lockup} alt={t("tcgm.brandAlt")} width={164} height={52} />
        <nav aria-label={t("tcgm.nav.label")} className="tm-desktop-only">
          <Flex direction="row" gap="xs" align="center" wrap>
            {NAV.map((key, i) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                aria-current={i === 0 ? "page" : undefined}
              >
                {t(`tcgm.nav.${key}`)}
              </Button>
            ))}
          </Flex>
        </nav>
        <Flex direction="row" gap="xs" align="center" className="ms-auto">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("tcgm.header.search")}
            className="tm-desktop-only"
          >
            <Search aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t("tcgm.header.watchlist")}>
            <Heart aria-hidden="true" />
          </Button>
          <Button variant="outline" size="sm" className="tm-desktop-only">
            {t("tcgm.header.tryApp")}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("tcgm.header.openMenu")}
            className="tm-mobile-only"
            onClick={onMenu}
          >
            <Menu aria-hidden="true" />
          </Button>
        </Flex>
      </div>
    </header>
  );
}

function Hero({ onSearch }: { onSearch: (q: string) => void }) {
  const { t } = useTranslation();
  const hints: Array<[typeof Layers, string]> = [
    [Layers, t("tcgm.hero.hintTitles")],
    [ArrowLeftRight, t("tcgm.hero.hintCompare")],
    [Sparkles, t("tcgm.hero.hintDiscover")],
  ];
  return (
    <div className={SHELL}>
      <section className="tm-hero">
        {/* NO Reveal around the copy. 04_MOTION_AND_STATES: "Hero once 480ms … chỉ illustration,
            text hiện ngay" — the headline and the search field must be readable and operable on
            the first frame, so only the artwork below is wrapped. */}
        <div className="tm-hero-copy">
          <Flex direction="col" gap="md" align="start">
            <p className="tm-eyebrow">{t("tcgm.hero.eyebrow")}</p>
            <Heading level={1} size="5xl" weight="bold">
              {t("tcgm.hero.titleLine1")}
              <br />
              {t("tcgm.hero.titleLine2")}
            </Heading>
            <Text as="p" size="md" tone="muted">
              {t("tcgm.hero.leadLine1")}
              <br />
              {t("tcgm.hero.leadLine2")}
            </Text>
            <SearchInput
              className="tm-hero-search"
              placeholder={t("tcgm.hero.searchPlaceholder")}
              ariaLabel={t("tcgm.hero.searchLabel")}
              onSearch={onSearch}
            />
            <Flex direction="row" gap="md" wrap>
              {hints.map(([Glyph, label]) => (
                <Flex key={label} direction="row" gap="xs" align="center">
                  <Icon as={Glyph} size="xs" tone="muted" />
                  <Text as="span" size="2xs" tone="muted">
                    {label}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </div>
        <div className="tm-hero-art">
          {/* The hero's ONE decorative motion region, played once on mount at the brand's
              480ms/y8 timing. `Reveal` drops the animation entirely under prefers-reduced-motion
              and its resting state is the FINISHED one, so the artwork is never hidden. */}
          <Reveal on="mount">
            <img
              src={heroPrism}
              alt={t("tcgm.hero.artAlt")}
              width={1200}
              height={760}
              fetchPriority="high"
            />
          </Reveal>
          <div className="tm-art-tag">
            <Icon as={Sparkles} size="xs" tone="primary" />
            <Text as="span" size="2xs">
              {t("tcgm.hero.artTag")}
            </Text>
          </div>
        </div>
      </section>
    </div>
  );
}

function GameRail({ value, onValueChange }: { value: Game; onValueChange: (g: Game) => void }) {
  const { t } = useTranslation();
  return (
    <div className={SHELL}>
      <ToggleGroup
        type="single"
        disallowEmptySelection
        variant="outline"
        shape="pill"
        size="lg"
        wrap
        value={value}
        onValueChange={(v) => onValueChange(v as Game)}
        aria-label={t("tcgm.games.label")}
        className="mt-6"
      >
        {GAMES.map((key) => (
          <ToggleGroupItem key={key} value={key}>
            {t(`tcgm.games.${key}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: React.ReactNode;
  action?: string;
}) {
  return (
    <Flex direction="row" justify="between" align="end" gap="md" wrap>
      <Flex direction="col" gap="xs">
        <p className="tm-eyebrow">{eyebrow}</p>
        <Heading level={2} size="3xl" weight="bold">
          {title}
        </Heading>
      </Flex>
      {action ? (
        <Button variant="link" size="sm">
          {action}
          <ArrowRight aria-hidden="true" />
        </Button>
      ) : null}
    </Flex>
  );
}

function TradingCard({
  card,
  watched,
  onWatch,
}: {
  card: SampleCard;
  watched: boolean;
  onWatch: (card: SampleCard) => void;
}) {
  // NOT `Card asChild`: this card contains a second control (the watch toggle), and a card that is
  // itself one link may not contain another — `hoverable` + a real control inside is the branch
  // the Card docblock names for exactly this shape.
  const { t, locale } = useTranslation();
  const name = t(`tcgm.cards.${card.id}.name`);
  return (
    <Card hoverable className="tm-card-body">
      <Button
        className="tm-watch"
        variant="ghost"
        size="icon"
        aria-pressed={watched}
        // The accessible name says what the press will DO, and it is a whole message per state —
        // never a sentence glued together from a name and a verb, which is unbuildable in a
        // language that puts them in the other order.
        aria-label={t(watched ? "tcgm.card.watchRemove" : "tcgm.card.watchAdd", { name })}
        onClick={() => onWatch(card)}
      >
        <Heart aria-hidden="true" />
      </Button>
      <CardContent solo>
        <Flex direction="col" gap="xs">
          <div className="tm-artwell">
            <Badge className="tm-sample" variant="outline" tone="default" as="span">
              {t("tcgm.card.sampleBadge")}
            </Badge>
            <img
              src={card.art}
              alt={t("tcgm.card.artAlt", { name })}
              width={140}
              height={196}
              loading="lazy"
            />
          </div>
          <Text as="p" size="2xs" tone="muted">
            {t("tcgm.card.classifiedAs", { game: t(`tcgm.games.${card.game}`) })}
          </Text>
          <Heading level={3} size="sm" weight="bold" className="tm-card-name">
            {name}
          </Heading>
          <Text as="p" size="2xs" tone="muted" tabular className="tm-latin">
            {card.code} · {t(`tcgm.cards.${card.id}.edition`)}
          </Text>
          <div className="tm-price-row">
            <Flex direction="col" gap={1}>
              <Text as="span" size="2xs" tone="muted">
                {t("tcgm.card.priceLabel")}
              </Text>
              {card.price === null ? (
                <Text as="span" size="sm" weight="bold" tone="muted">
                  {t("tcgm.card.noPrice")}
                </Text>
              ) : (
                <Text
                  as="span"
                  size="2xl"
                  weight="bold"
                  tone="primary"
                  tabular
                  className="tm-latin"
                >
                  {jpy(locale).format(card.price)}
                  <Text as="span" size="2xs" weight="regular" tone="muted">
                    〜
                  </Text>
                </Text>
              )}
            </Flex>
            <Text as="span" size="2xs" tone="muted" align="end" className="tm-price-note">
              {t("tcgm.card.shippingNote")}
              <br />
              {t("tcgm.card.sampleNote")}
            </Text>
          </div>
        </Flex>
      </CardContent>
    </Card>
  );
}

/**
 * The card grid. `columns` steps are CONTAINER widths, not viewport ones, which is why the third
 * column is keyed to `sm` (40rem) and not `md`: inside the 1280px shell the grid's own box is the
 * viewport minus the 32px gutters, so a 768 tablet hands it 704px. Keyed to `md` (48rem) it stayed
 * 2-up there, where the prototype shows 3.
 */
function Collection({
  cards,
  watched,
  onWatch,
  onReset,
}: {
  cards: SampleCard[];
  watched: ReadonlySet<string>;
  onWatch: (card: SampleCard) => void;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={`${SHELL} tm-section`}>
      <Flex direction="col" gap="lg">
        <Reveal on="view">
          <SectionHead
            eyebrow={t("tcgm.collection.eyebrow")}
            title={t("tcgm.collection.title")}
            action={t("tcgm.collection.action")}
          />
        </Reveal>
        <Text as="p" size="2xs" tone="muted" role="status">
          {/* The count goes THROUGH the message, so a locale that pluralises decides its own
              form — never `{n}` glued to a literal counter word at the call site. */}
          {t("tcgm.collection.count", { count: cards.length })} · {t("tcgm.collection.note")}
        </Text>
        {cards.length ? (
          <ResponsiveGrid columns={{ base: 2, sm: 3, lg: 4 }} gap="lg" align="stretch">
            {cards.map((card, i) => (
              // `on="view"` + a stagger ordinal: the row cascades in as it reaches the viewport,
              // capped at the ladder's 6 steps so a long list never waits half a second.
              <Reveal key={card.id} on="view" delay={(Math.min(i, 5) + 1) as 1 | 2 | 3 | 4 | 5 | 6}>
                <TradingCard card={card} watched={watched.has(card.id)} onWatch={onWatch} />
              </Reveal>
            ))}
          </ResponsiveGrid>
        ) : (
          <EmptyState
            variant="section"
            icon={Layers}
            title={t("tcgm.collection.emptyTitle")}
            description={t("tcgm.collection.emptyBody")}
            action={
              <Button variant="outline" onClick={onReset}>
                {t("tcgm.collection.reset")}
              </Button>
            }
          />
        )}
      </Flex>
    </section>
  );
}

function NewsRail() {
  const { t } = useTranslation();
  return (
    <section className={`${SHELL} tm-section`}>
      <Flex direction="col" gap="lg">
        <Reveal on="view">
          <SectionHead
            eyebrow={t("tcgm.news.eyebrow")}
            title={t("tcgm.news.title")}
            action={t("tcgm.news.action")}
          />
        </Reveal>
        {/* Manual by default, with real previous/next controls beside the rail. The brand allows
            autoplay only behind a pause control and forbids it as the default; the library's
            Carousel ships no autoplay plugin unless one is passed, so the default IS the spec.

            THE REVEAL WRAPS THE RAIL, NOT THE SLIDES — and this is a measured correction, not a
            preference. Per-slide `on="view"` put an IntersectionObserver on a box the carousel
            viewport CLIPS (`overflow: hidden`), so a slide parked outside the window has an empty
            intersection rect and never leaves `data-reveal-state="out"`: measured on this page at
            1440, 3 of the 4 slides sat at opacity 0 after scrolling the whole document, and stayed
            there. That is the one failure Reveal's own docblock forbids — "a reveal that never
            reveals". One observer on the unclipped section answers instead, and it also keeps the
            brand's motion budget (one decorative motion region per viewport) rather than spending
            it on four staggered cards inside a rail. */}
        <Reveal on="view">
          <Carousel opts={{ align: "start", containScroll: "trimSnaps" }}>
            <CarouselContent>
              {NEWS.map((n) => (
                <CarouselItem key={n.id} className="basis-4/5 sm:basis-1/2 lg:basis-1/3">
                  <Card hoverable className="h-full overflow-hidden">
                    <div className="tm-news-cover">
                      <img src={n.art} alt="" loading="lazy" />
                      <span className="tm-news-word">
                        {n.word.split("\n").map((line, li) => (
                          <React.Fragment key={line}>
                            {li ? <br /> : null}
                            {line}
                          </React.Fragment>
                        ))}
                      </span>
                    </div>
                    <CardContent solo>
                      <Flex direction="col" gap="sm" align="start">
                        <Flex direction="row" gap="sm" align="center" wrap>
                          <Badge variant="secondary" as="span">
                            {t(`tcgm.articles.${n.id}.cat`)}
                          </Badge>
                          <Text as="span" size="2xs" tone="muted">
                            {t("tcgm.news.sample")}
                          </Text>
                        </Flex>
                        <Heading level={3} size="md" weight="bold">
                          {t(`tcgm.articles.${n.id}.title`)}
                        </Heading>
                        <Text as="p" size="2xs" tone="muted" tabular>
                          {t("tcgm.news.meta")}
                        </Text>
                      </Flex>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <Flex direction="row" gap="sm" align="center" justify="end" className="mt-4">
              <Text as="span" size="2xs" tone="muted" className="me-auto">
                {t("tcgm.news.manual")}
              </Text>
              <CarouselPrevious />
              <CarouselNext />
            </Flex>
          </Carousel>
        </Reveal>
      </Flex>
    </section>
  );
}

function Releases({ onPick }: { onPick: (title: string) => void }) {
  const { t } = useTranslation();
  return (
    <section className={`${SHELL} tm-section`}>
      <Flex direction="col" gap="lg">
        <Reveal on="view">
          <SectionHead
            eyebrow={t("tcgm.releases.eyebrow")}
            title={t("tcgm.releases.title")}
            action={t("tcgm.releases.action")}
          />
        </Reveal>
        <ResponsiveGrid columns={{ base: 1, md: 3 }} gap="md" align="stretch">
          {RELEASES.map((r, i) => (
            <Reveal key={r.id} on="view" delay={(i + 1) as 1 | 2 | 3}>
              <Card hoverable className="h-full">
                <CardContent solo>
                  <Flex direction="row" gap="md" align="center">
                    <div className="tm-datebox">
                      <Text as="span" size="2xs" tone="inherit" className="block tracking-widest">
                        SEP
                      </Text>
                      <Text
                        as="span"
                        size="2xl"
                        weight="bold"
                        tone="inherit"
                        tabular
                        className="tm-latin"
                      >
                        {r.day}
                      </Text>
                    </div>
                    <Flex direction="col" gap={1} className="min-w-0">
                      <Text as="span" size="2xs" tone="muted">
                        {t(`tcgm.release.${r.id}.kind`)}
                      </Text>
                      <Heading level={3} size="sm" weight="bold">
                        {t(`tcgm.release.${r.id}.title`)}
                      </Heading>
                      <Button
                        variant="link"
                        size="xs"
                        className="justify-start"
                        onClick={() => onPick(t(`tcgm.release.${r.id}.title`))}
                      >
                        {t("tcgm.releases.view")}
                        <ArrowRight aria-hidden="true" />
                      </Button>
                    </Flex>
                  </Flex>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </ResponsiveGrid>
      </Flex>
    </section>
  );
}

function Trust() {
  const { t } = useTranslation();
  return (
    <section className={`${SHELL} tm-section`}>
      <Reveal on="view">
        <div className="tm-trust">
          <div className="tm-trust-grid">
            <Flex direction="col" gap="md" align="start">
              <p className="tm-eyebrow">{t("tcgm.trust.eyebrow")}</p>
              <Heading level={2} size="3xl" weight="bold">
                {t("tcgm.trust.titleLine1")}
                <br />
                {t("tcgm.trust.titleLine2")}
              </Heading>
              <Text as="p" size="sm" tone="muted">
                {t("tcgm.trust.bodyLine1")}
                <br />
                {t("tcgm.trust.bodyLine2")}
              </Text>
              <Button variant="link" size="sm" className="px-0">
                {t("tcgm.trust.link")}
                <ArrowRight aria-hidden="true" />
              </Button>
            </Flex>
            <Flex direction="col" gap="lg">
              {TRUST.map((item, i) => (
                <Reveal key={item.id} on="view" delay={(i + 1) as 1 | 2 | 3}>
                  <Flex direction="row" gap="md" align="start">
                    <span className="tm-trust-icon">
                      <Icon as={item.icon} size="md" tone="inherit" />
                    </span>
                    <Flex direction="col" gap={1}>
                      <Heading level={3} size="sm" weight="bold">
                        {t(`tcgm.trust.${item.id}Title`)}
                      </Heading>
                      <Text as="p" size="sm" tone="muted">
                        {t(`tcgm.trust.${item.id}Body`)}
                      </Text>
                    </Flex>
                  </Flex>
                </Reveal>
              ))}
            </Flex>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  const { t } = useTranslation();
  const cols: Array<[string, string[]]> = [
    ["colFind", ["linkSearch", "linkCompare", "linkWatchlist"]],
    ["colRead", ["linkNews", "linkCalendar", "linkBasics"]],
    ["colAbout", ["linkMethod", "linkComponents", "linkConsent"]],
  ];
  return (
    <footer className="tm-footer">
      <div className={`${SHELL} tm-footer-grid`}>
        <Flex direction="col" gap="sm" className="tm-footer-main">
          <img
            className="tm-brand"
            src={lockup}
            alt={t("tcgm.brandAlt")}
            width={164}
            height={52}
            loading="lazy"
          />
          <Text as="p" size="sm" tone="muted">
            {t("tcgm.footer.taglineLine1")}
            <br />
            {t("tcgm.footer.taglineLine2")}
          </Text>
          <Text as="p" size="2xs" tone="muted">
            {t("tcgm.footer.accent")}
          </Text>
        </Flex>
        {cols.map(([head, items]) => (
          <Flex key={head} direction="col" gap="xs" align="start">
            <Text as="div" size="2xs" weight="bold">
              {t(`tcgm.footer.${head}`)}
            </Text>
            {items.map((item) => (
              <Button key={item} variant="link" size="sm" className="text-muted-foreground px-0">
                {t(`tcgm.footer.${item}`)}
              </Button>
            ))}
          </Flex>
        ))}
      </div>
      <div className={SHELL}>
        <Separator space="lg" />
        <Flex direction="row" justify="between" gap="sm" wrap>
          <Text as="span" size="2xs" tone="muted">
            {t("tcgm.footer.legal")}
          </Text>
          <Text as="span" size="2xs" tone="muted">
            {t("tcgm.footer.disclaimer")}
          </Text>
        </Flex>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────────────────────

export default function TcgmWebsiteShowcase() {
  const { t } = useTranslation();
  const [game, setGame] = React.useState<Game>("all");
  const [query, setQuery] = React.useState("");
  const [watched, setWatched] = React.useState<ReadonlySet<string>>(() => new Set());
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [release, setRelease] = React.useState<string | null>(null);

  const cards = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    // Searching the RENDERED strings, not a frozen copy of them: the card's name and edition are
    // whatever the active locale says they are, so a viewer typing in the language on screen finds
    // the card. `localeCompare`-free because this is a substring test, not an ordering.
    return CARDS.filter(
      (c) =>
        (game === "all" || c.game === game) &&
        (!q ||
          [
            t(`tcgm.cards.${c.id}.name`),
            c.code,
            t(`tcgm.cards.${c.id}.edition`),
            t(`tcgm.games.${c.game}`),
          ].some((field) => field.toLowerCase().includes(q))),
    );
  }, [game, query, t]);

  const handleWatch = React.useCallback(
    (card: SampleCard) => {
      setWatched((prev) => {
        const next = new Set(prev);
        const had = next.has(card.id);
        if (had) next.delete(card.id);
        else next.add(card.id);
        // The brand's own copy for this pair (02_VERBAL_IDENTITY), and the demo must never imply a
        // sync or a notification it does not perform.
        toast(t(had ? "tcgm.toast.removed" : "tcgm.toast.saved"));
        return next;
      });
    },
    [t],
  );

  const reset = React.useCallback(() => {
    setGame("all");
    setQuery("");
  }, []);

  return (
    <div data-tenant="tcgm">
      <style>{THEME}</style>
      <DemoNotice />
      <Header onMenu={() => setMenuOpen(true)} />
      <main>
        <Hero onSearch={setQuery} />
        <GameRail value={game} onValueChange={setGame} />
        <Collection cards={cards} watched={watched} onWatch={handleWatch} onReset={reset} />
        <NewsRail />
        <Releases onPick={setRelease} />
        <Trust />
      </main>
      <Footer />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{t("tcgm.header.menu")}</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <Flex direction="col" gap="xs" align="start">
              {[...NAV, "watchlist", "method"].map((key) => (
                <Button key={key} variant="ghost" size="lg" fullWidth className="justify-start">
                  {t(`tcgm.nav.${key}`)}
                  <ArrowRight aria-hidden="true" className="ms-auto" />
                </Button>
              ))}
            </Flex>
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Dialog open={release !== null} onOpenChange={(open) => !open && setRelease(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("tcgm.dialog.title")}</DialogTitle>
            <DialogDescription>{t("tcgm.dialog.body")}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Flex direction="col" gap="sm" align="start">
              <Badge variant="secondary" as="span">
                {t("tcgm.dialog.sample")}
              </Badge>
              <Heading level={3} size="md" weight="bold">
                {release}
              </Heading>
              <Flex direction="row" gap="xs" align="center">
                <Icon as={CalendarDays} size="xs" tone="muted" />
                <Text as="span" size="2xs" tone="muted" tabular>
                  {t("tcgm.dialog.date")}
                </Text>
              </Flex>
            </Flex>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

/**
 * Showcase · Marketing page — the composition doctrine's own deliverable (gh#833).
 *
 * `docs/COMPOSITION-VS-COMPONENT.md` §3 judges Hero, Navbar, Footer, PricingTable, testimonial,
 * logo wall, feature grid and CTA band to be COMPOSITIONS: layout + content + token configuration
 * over real components, expressible today. The doctrine's remedy for a composition is a `docs/`
 * showcase, not a component. Until this page existed that was an assertion. This is the
 * demonstration, and its claim is a MEASUREMENT, not a promise:
 *
 *                                      this page   acme-website   futurelastic-web
 *   `<style>` blocks ................       0            1               1
 *   page-local class SELECTORS ......       0           17              28
 *   bespoke classes ON elements .....       0           16              25
 *   non-`ui-*` classes on elements ..       0           38              45
 *   raw px/rem/em/vw literals .......       0           29              40
 *
 * Counted with comments stripped (so a docblock quoting a class or a length is not counted):
 * selectors are `/(^|[\s,>+~])\.([a-zA-Z_][\w-]*)\s*(?=[{,.:[]|\s)/m`, classes are every token
 * inside a `className`, literals are `/(?<![\w.$}#-])(\d*\.?\d+)(px|rem|em|ch|pt|v\w+)\b/`. The two
 * siblings also RE-THEME, which is half of what their stylesheets carry; this page uses the shipped
 * theme, so everything it could not express is a framework gap rather than a brand decision.
 * `public-landing.tsx` also measures 0/0 and is not a counter-example: it is a narrow
 * `CenteredShell preset="public-landing"` page with no full-bleed band, no display type, no
 * pricing and no logo wall, i.e. none of the shapes that produced the classes above.
 *
 * Every LENGTH here is a token reference: `var(--space-section-band)`, `var(--space-section-hero)`,
 * `var(--page-measure-wide)`, `var(--band-height-3xl)`, `var(--space-6)`, `var(--space-2)`,
 * `var(--overlay-z-index)`. The only class written anywhere below is `.ui-brand-glow`, which the
 * package ships (`src/styles/layout.css`).
 *
 * ── WHAT IS STILL HAND-WRITTEN, AND WHY (the finding this page exists to produce) ───────────────
 *
 * Zero classes and zero literals did NOT mean zero CSS. Six things below are inline `style`
 * objects because no PROP reaches them. Each one is a named gap, in the order a reader meets them:
 *
 *  1. THE SECTION BAND — `paddingBlock: var(--space-section-band | --space-section-hero)`.
 *     PARTLY CLOSED by gh#839: the numeric `GapProp` ladder now reaches the two band steps, so
 *     `pad={{ block: 20 }}` (80px) and `pad={{ block: 24 }}` (96px) state the rhythm through the
 *     public API. The bands below still use an inline `style` because each one ALSO needs the
 *     centred inner column (`SHELL`), and nothing owns "full-bleed outside, measured column
 *     inside" — that half of gh#839 is open. Neither step has a compact variant either:
 *     `--space-section-hero` measures 96px at 1440 and at 320, where the package's own landing
 *     preset drops its band via `--centered-shell-landing-main-padding-block-compact`.
 *  2. THE CENTRED COLUMN — `marginInline: auto` + `inlineSize: 100%` +
 *     `maxInlineSize: var(--page-measure-wide)` + `paddingInline: var(--space-6)`, repeated at
 *     every band. gh#831 minted `--page-measure-wide` and deliberately did not add
 *     `PageContainer measure="wide"`, reasoning that a marketing page is full-bleed sections with
 *     a centred inner column and `PageContainer` owns neither. The reasoning holds; its
 *     consequence is that NOTHING owns the centred inner column.
 *  3. THE STICKY BAR — `position: sticky` + `insetBlockStart` + `zIndex`. `Affix` does not exist
 *     here (`docs/roadmap/website-components.md` §5.2 proposed `--affix-inset-block-start` and
 *     `--affix-z-index`; neither shipped) and `Topbar` has no `sticky` prop.
 *  4. THE GLASS — `--topbar-background-alpha` / `--topbar-backdrop-blur-size` as inline custom
 *     properties. They are `initial` by design, so a call site MUST set them, and that is correct.
 *     This used to read `--space-2`, borrowing a token that means something else, because the
 *     library had no blur SCALE at all. gh#837 closed that: `--blur-sm|md|lg` now exists in
 *     `foundation.css`, deliberately NOT `--scaling`-multiplied, because a backdrop blur is an
 *     optical effect and compact density does not mean thinner glass. Measured: `blur(8px)`.
 *  5. THE HALO — `position: relative` / `overflow: hidden` on the band and `position: absolute` /
 *     `inset: 0` on the `.ui-brand-glow` layer. This is the package's own idiom (both siblings
 *     write `className="ui-brand-glow absolute inset-0"`), spelled as logical inline style so
 *     `check:rtl` never has to grant an exception.
 *  6. THE DISPLAY RAMP IS NOT RESPONSIVE, and this is the one that changed the page. gh#826 gave
 *     `Heading size` / `Text size` the display steps, and `size` takes a single scalar: there is
 *     no responsive object form, the way `Flex direction` and `ResponsiveGrid columns` both take
 *     one. `--font-size-5xl` is `--font-size-display` = 54px at 1440 and 54px at 320. Measured
 *     with a headline of ordinary marketing length (99 characters): 6 lines at 1280, 10 at 375,
 *     12 at 320, i.e. a phone hero five screens tall. The headline in `en`/`ja`/`vi` was cut to
 *     what 54px can carry (2 lines at 1280, 4 at 375) and the long-copy edge case moved to the
 *     feature grid, where `features.auditTitle` runs several lines beside `features.ssoTitle` =
 *     "SSO". NO page-local `clamp()` was written: both siblings wrote one, and writing a third is
 *     how a framework gap becomes folklore. The package already knows the answer for exactly one
 *     preset (`--centered-shell-landing-heading-size-compact`, read only by
 *     `CenteredShell preset="public-landing"`); a composition cannot reach it.
 *
 * MegaMenu is deliberately ABSENT, and the absence is measured, not an oversight. A site nav and
 * this sticky glass bar are mutually exclusive today. `docs/navigation/mega-menu.tsx` records that
 * MegaMenu must not go in a `Topbar` slot: `topbar-center` is `display: none` below ~1280px, and
 * `topbar-start` is `overflow: clip` with a nowrap row, which put 58 elements outside the viewport
 * at 375px. Meanwhile `.ui-topbar` is the ONLY selector that reads the gh#831 glass knobs, and
 * turning the blur on makes the bar a backdrop root, i.e. the containing block for its own fixed
 * descendants, which is exactly how MegaMenu positions its panel. So the bar carries plain anchors
 * at desktop and the narrow answer is the `Sheet`, which is what the MegaMenu doc prescribes.
 *
 * ── REACHING THE EDGES, AND THE TWO THINGS IT BROKE ─────────────────────────────────────────────
 *
 * Tidy data is why a docs site's examples never break. On purpose here: a 71-character identifier
 * with no break opportunity in it, in three places; CJK beside Latin in one sentence, one plan row
 * and one quote; a feature card with NO description beside five that have one; a testimonial with
 * NO rating beside two that have one; a plan with NO badge and NO figure beside one carrying three
 * badges; a footer column with one link beside one with six; a brand lockup long enough to outgrow
 * the bar. Two of those broke the page, and both fixes are documented at the call site:
 *
 *   • The id held the document open at 457px on every phone width. `Text whitespace="pre-wrap"`
 *     gives `overflow-wrap: break-word`, which does NOT reduce a box's MIN-CONTENT size, and a
 *     flex item keeps `min-width: auto` — so in the footer row it wrapped nothing. `Flex fill`
 *     (`flex: 1 1 0` + `min-inline-size: 0`) is what makes the break fire.
 *   • The lockup measured 222px against the 85px `topbar-start` had left at 375, and was clipped.
 *     `Logo` has no `truncate`; the package's own answer, in `public-landing.tsx`, is to drop the
 *     wordmark at phone width.
 *
 * Measured in Chromium after both, at 320 / 375 / 390 / 768 / 1024 / 1280 / 1440:
 * `document.documentElement.scrollWidth` equals the viewport at every one, and zero unclipped
 * elements cross the inline edge. The two boxes that do scroll are the `Marquee` viewport and the
 * `Carousel` viewport, which is what both components are.
 *
 * Every string and every `aria-label` comes from `t()` (`src/i18n/messages/{en,ja,vi}.json`,
 * namespace `marketingShowcase`), and the locale picker in the bar switches all three live. Money
 * is `Intl.NumberFormat` with the ACTIVE locale and an ISO 4217 code that lives in data, never a
 * symbol in the copy. The year is `Intl.DateTimeFormat`. Domains are RFC 2606 reserved
 * (`*.example.jp`), the company is fictional, and every wordmark in the logo wall is invented.
 */
import { useMemo, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  CalendarClock,
  CircleCheck,
  FileSearch,
  Globe2,
  KeyRound,
  Menu,
  Route,
  Webhook,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  FeatureList,
  Marquee,
  StatCard,
} from "@godxjp/ui/data-display";
import { Rating, Segmented } from "@godxjp/ui/data-entry";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@godxjp/ui/feedback";
import { Button, Heading, Icon, Logo, Reveal, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, ResponsiveGrid, Separator, Topbar } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/* ── The five inline-style constants named in the docblock. Every value is a token reference; no
   number with a unit appears anywhere in this file. ─────────────────────────────────────────── */

/** (2) The centred inner column. Nothing in the package owns this shape yet. */
const SHELL: CSSProperties = {
  marginInline: "auto",
  inlineSize: "100%",
  maxInlineSize: "var(--page-measure-wide)",
  paddingInline: "var(--space-6)",
};

/** (1) The section rhythm gh#831 named and no prop reads. */
const BAND: CSSProperties = { paddingBlock: "var(--space-section-band)" };
const HERO_BAND: CSSProperties = { paddingBlock: "var(--space-section-hero)" };

/** (5) The halo host and the halo layer. */
const GLOW_HOST: CSSProperties = { position: "relative", overflow: "hidden" };
const GLOW_LAYER: CSSProperties = { position: "absolute", inset: 0 };
const ABOVE_GLOW: CSSProperties = { position: "relative" };

/** (3) The sticky bar region. `Affix` does not exist; `Topbar` has no `sticky`. */
const STICKY_HEADER: CSSProperties = {
  position: "sticky",
  insetBlockStart: 0,
  zIndex: "var(--overlay-z-index)",
};

/** (4) gh#831's glass knobs plus the bar geometry its own docstring recommends. */
const GLASS_BAR: CSSProperties = {
  "--topbar-height": "var(--band-height-3xl)",
  /* Full-bleed glass, content on the shell measure: the same `max(gutter, half the slack)` the
     package writes for CenteredShell's landing preset, so no page-local media query. */
  "--topbar-inset": "max(var(--space-6), calc((100% - var(--page-measure-wide)) / 2))",
  "--topbar-background-alpha": "85%",
  "--topbar-backdrop-blur-size": "var(--blur-md)",
} as CSSProperties;

/** Per-instance halo shaping — the four `--brand-glow-*` knobs, at the call site. */
const HERO_GLOW: CSSProperties = {
  "--brand-glow-size": "55% 60%",
  "--brand-glow-position": "82% -8%",
  "--brand-glow-alpha": "0.20",
} as CSSProperties;

const CTA_GLOW: CSSProperties = {
  "--brand-glow-size": "70% 90%",
  "--brand-glow-position": "50% 110%",
  "--brand-glow-alpha": "0.16",
} as CSSProperties;

/* ── Data. RFC 2606 reserved domains, a fictional company, invented customer wordmarks. ──────── */

const SITE = "works.example.jp";

/**
 * 71 characters, and not one of them is a break opportunity: no hyphen, no underscore, no slash.
 * It is in the hero panel AND in a feature card so the failure has two chances to show itself.
 */
const ENDPOINT_ID = "whsec0f3a8c1d2e4b5a697c8d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e";

const NAV_KEYS = ["product", "solutions", "pricing", "docs"] as const;

/** Invented wordmarks. CJK, Latin and Vietnamese diacritics in one row, plus a very long one. */
const CUSTOMERS = [
  { glyph: "A", name: "Aoba Foods" },
  { glyph: "北", name: "北陸精密工業" },
  { glyph: "M", name: "Meridian Health" },
  { glyph: "T", name: "Trường An" },
  { glyph: "K", name: "Kita Logistics and Warehousing" },
  { glyph: "Ö", name: "Örebro Verkstad" },
  { glyph: "海", name: "海運サービス" },
];

/** The currency lives in DATA, so nothing in the page hard-codes a symbol or an ISO 4217 code. */
const CURRENCY = "JPY";

type Plan = {
  key: "starter" | "team" | "enterprise";
  /** `null` = quoted: the empty slot beside two filled ones. */
  monthly: number | null;
  yearlyMonthly: number | null;
  accent: boolean;
  badges: Array<"popular" | "saving" | "fresh">;
  features: Array<{ state: "included" | "limited" | "excluded"; key: string; limitKey?: string }>;
};

const PLANS: Plan[] = [
  {
    key: "starter",
    monthly: 4800,
    yearlyMonthly: 4000,
    accent: false,
    badges: [],
    features: [
      { state: "limited", key: "featChains", limitKey: "limitedChains" },
      { state: "included", key: "featExport" },
      { state: "excluded", key: "featDelegation" },
      { state: "excluded", key: "featSso" },
      { state: "excluded", key: "featResidency" },
      { state: "limited", key: "featSupport", limitKey: "limitedSupport" },
    ],
  },
  {
    key: "team",
    monthly: 9600,
    yearlyMonthly: 8000,
    accent: true,
    badges: ["popular", "saving", "fresh"],
    features: [
      { state: "included", key: "featChains" },
      { state: "included", key: "featExport" },
      { state: "included", key: "featDelegation" },
      { state: "included", key: "featSso" },
      { state: "excluded", key: "featResidency" },
      { state: "limited", key: "featSupport", limitKey: "limitedSupport" },
    ],
  },
  {
    key: "enterprise",
    monthly: null,
    yearlyMonthly: null,
    accent: false,
    badges: [],
    features: [
      { state: "included", key: "featChains" },
      { state: "included", key: "featExport" },
      { state: "included", key: "featDelegation" },
      { state: "included", key: "featSso" },
      { state: "included", key: "featResidency" },
      { state: "included", key: "featSupport" },
    ],
  },
];

const FEATURES = [
  { key: "routing", icon: Route, hasBody: true, long: false },
  /* The long title with NO body: an empty slot beside five filled ones. */
  { key: "audit", icon: FileSearch, hasBody: false, long: true },
  { key: "evidence", icon: CircleCheck, hasBody: true, long: false },
  { key: "webhook", icon: Webhook, hasBody: true, long: false },
  { key: "residency", icon: Globe2, hasBody: true, long: false },
  { key: "sso", icon: KeyRound, hasBody: true, long: false },
];

const QUOTES = [
  { key: "1", rating: 5 },
  /* Two words, and no rating: the second empty slot. */
  { key: "2", rating: null },
  { key: "3", rating: 4 },
] as const;

const FOOTER_COLUMNS = [
  { key: "product", links: ["featuresLink", "pricingLink", "changelog", "status"] },
  { key: "company", links: ["about", "careers"] },
  {
    key: "legal",
    links: ["terms", "privacy", "security", "subprocessors", "accessibility", "status"],
  },
  /* One link beside six. */
  { key: "contact", links: ["salesLine"] },
];

export default function MarketingPage() {
  const { t, locale } = useTranslation();
  const [cycle, setCycle] = useState("monthly");
  const [navOpen, setNavOpen] = useState(false);

  const money = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: CURRENCY,
        maximumFractionDigits: 0,
      }),
    [locale],
  );
  const count = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const year = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: "numeric" }).format(new Date()),
    [locale],
  );

  return (
    <Flex as="div" direction="col" gap="none">
      {/* ── NAVBAR ─────────────────────────────────────────────────────────────────────────── */}
      <header style={STICKY_HEADER}>
        <Topbar
          style={GLASS_BAR}
          start={
            <Flex align="center" gap="lg">
              {/* The lockup measures 222px, and at 375 the start slot has 85px after the end
                  cluster takes its natural width — so `topbar-start` clipped it (measured: 93 in
                  85). The bar's shrink contract says a long brand string should truncate rather
                  than spill, and `Logo` has no `truncate`; the package's own answer, in
                  `public-landing.tsx`, is to drop the wordmark at phone width. The mark alone
                  identifies the product there, and the full name is the first thing in the Sheet. */}
              <Flex hideBelow="sm" align="center" gap="none">
                <Logo
                  glyph="E"
                  wordmark={t("marketingShowcase.brand.name")}
                  productSuffix={t("marketingShowcase.brand.suffix")}
                />
              </Flex>
              <Flex hideFrom="sm" align="center" gap="none">
                <Logo glyph="E" label={t("marketingShowcase.brand.name")} />
              </Flex>
              <Flex
                as="div"
                hideBelow="lg"
                align="center"
                gap="xs"
                role="navigation"
                aria-label={t("marketingShowcase.nav.label")}
              >
                {NAV_KEYS.map((key, index) => (
                  <Button key={key} variant="ghost" size="sm" asChild>
                    <a href={`#${key}`} aria-current={index === 0 ? "page" : undefined}>
                      {t(`marketingShowcase.nav.${key}`)}
                    </a>
                  </Button>
                ))}
              </Flex>
            </Flex>
          }
          end={
            <Flex align="center" gap="sm">
              <AppSettingPicker kind="locale" />
              <Flex hideBelow="sm" align="center" gap="sm">
                <Button variant="ghost" size="sm" asChild>
                  <a href="#start">{t("marketingShowcase.nav.signIn")}</a>
                </Button>
              </Flex>
              <Button size="sm" asChild>
                <a href="#start">{t("marketingShowcase.nav.getStarted")}</a>
              </Button>
              {/* The narrow answer the MegaMenu doc prescribes. Nothing in the bar is unreachable
                  at 375px: every destination hidden above is inside this Sheet. */}
              <Flex hideFrom="lg" align="center" gap="none">
                <Sheet open={navOpen} onOpenChange={setNavOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("marketingShowcase.nav.open")}
                    >
                      <Icon as={Menu} size="sm" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>{t("marketingShowcase.nav.title")}</SheetTitle>
                      <SheetDescription>{t("marketingShowcase.nav.description")}</SheetDescription>
                    </SheetHeader>
                    <SheetBody>
                      <Flex
                        direction="col"
                        gap="xs"
                        role="navigation"
                        aria-label={t("marketingShowcase.nav.label")}
                      >
                        {NAV_KEYS.map((key) => (
                          <SheetClose key={key} asChild>
                            <Button variant="ghost" size="sm" align="start" fullWidth asChild>
                              <a href={`#${key}`}>{t(`marketingShowcase.nav.${key}`)}</a>
                            </Button>
                          </SheetClose>
                        ))}
                        <Separator space="sm" />
                        <SheetClose asChild>
                          <Button variant="ghost" size="sm" align="start" fullWidth asChild>
                            <a href="#start">{t("marketingShowcase.nav.signIn")}</a>
                          </Button>
                        </SheetClose>
                      </Flex>
                    </SheetBody>
                  </SheetContent>
                </Sheet>
              </Flex>
            </Flex>
          }
        />
      </header>

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
        <section id="product" style={GLOW_HOST}>
          <div
            aria-hidden="true"
            className="ui-brand-glow"
            style={{ ...GLOW_LAYER, ...HERO_GLOW }}
          />
          <div style={{ ...SHELL, ...HERO_BAND, ...ABOVE_GLOW }}>
            <ResponsiveGrid columns={{ base: 1, lg: 2 }} gap="xl" align="start">
              <Reveal>
                <Flex direction="col" gap="lg">
                  <Flex align="center" gap="sm" wrap>
                    <Badge tone="primary" shape="pill">
                      {t("marketingShowcase.hero.eyebrow")}
                    </Badge>
                  </Flex>
                  {/* A real <h1> at the display tier — gh#826's `size` beside `level`, instead of
                      the `.tx-display` class with a raw font-size both siblings used to carry. */}
                  <Heading level={1} size="5xl" weight="bold">
                    {t("marketingShowcase.hero.title")}
                  </Heading>
                  <Text size="xl" tone="muted">
                    {t("marketingShowcase.hero.lead")}
                  </Text>
                  <Flex align="center" gap="sm" wrap>
                    <Button size="lg" asChild>
                      <a href="#start">
                        {t("marketingShowcase.hero.primary")}
                        <Icon as={ArrowRight} size="sm" tone="inherit" />
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <a href="#start">
                        <Icon as={CalendarClock} size="sm" tone="inherit" />
                        {t("marketingShowcase.hero.secondary")}
                      </a>
                    </Button>
                  </Flex>
                  <Text size="xs" tone="muted">
                    {t("marketingShowcase.hero.trust")}
                  </Text>
                </Flex>
              </Reveal>

              <Reveal delay={2}>
                <Card variant="outline">
                  <CardContent solo>
                    <Flex direction="col" gap="md">
                      <Flex direction="col" gap="none">
                        <Heading level={2} size="md">
                          {t("marketingShowcase.hero.panelTitle")}
                        </Heading>
                        <Text size="xs" tone="muted">
                          {t("marketingShowcase.hero.panelNote")}
                        </Text>
                      </Flex>
                      <ResponsiveGrid columns={{ base: 1, sm: 3 }} gap="sm">
                        <StatCard
                          label={t("marketingShowcase.hero.pending")}
                          value={count.format(18)}
                          accent="attention"
                        />
                        <StatCard
                          label={t("marketingShowcase.hero.cleared")}
                          value={count.format(146)}
                          delta="+12"
                        />
                        <StatCard
                          label={t("marketingShowcase.hero.median")}
                          value={t("marketingShowcase.hero.medianValue")}
                        />
                      </ResponsiveGrid>
                      <Separator space="xs" />
                      <Flex direction="col" gap="xs">
                        <Text size="xs" weight="medium" tone="muted">
                          {t("marketingShowcase.hero.endpointLabel")}
                        </Text>
                        {/* 71 characters with nowhere to break. `whitespace="pre-wrap"` is the
                            public prop for this (`overflow-wrap: break-word`) and it is enough
                            HERE, because a column flex item has a definite inline size to break
                            against. In the footer row it was not; see the note there. */}
                        <Text as="code" chip size="2xs" whitespace="pre-wrap">
                          {ENDPOINT_ID}
                        </Text>
                        <Text size="2xs" tone="muted">
                          {t("marketingShowcase.hero.endpointNote")}
                        </Text>
                      </Flex>
                    </Flex>
                  </CardContent>
                </Card>
              </Reveal>
            </ResponsiveGrid>
          </div>
        </section>

        {/* ── LOGO WALL ────────────────────────────────────────────────────────────────────── */}
        <section aria-labelledby="logos-title">
          <div style={{ ...SHELL, ...BAND }}>
            <Flex direction="col" gap="lg">
              <Flex direction="col" gap="xs">
                <Heading level={2} size="lg" id="logos-title">
                  {t("marketingShowcase.logos.title")}
                </Heading>
                <Text size="sm" tone="muted">
                  {t("marketingShowcase.logos.caption")}
                </Text>
              </Flex>
              {/* `defaultPlay={false}` is the recommended posture; the pause/play control is
                  Marquee's own real Button, in the tab order, with a localized name. */}
              <Marquee
                defaultPlay={false}
                speed="slow"
                gap="xl"
                fade
                pauseOnHover
                label={t("marketingShowcase.logos.marqueeLabel")}
              >
                {CUSTOMERS.map((customer) => (
                  <Logo
                    key={customer.name}
                    glyph={customer.glyph}
                    size="sm"
                    wordmark={customer.name}
                  />
                ))}
              </Marquee>
            </Flex>
          </div>
        </section>

        {/* ── FEATURE GRID ─────────────────────────────────────────────────────────────────── */}
        <section id="solutions" aria-labelledby="features-title">
          <Flex as="div" direction="col" gap="none" surface="muted">
            <div style={{ ...SHELL, ...BAND }}>
              <Flex direction="col" gap="xl">
                <Flex direction="col" gap="xs">
                  <Heading level={2} size="3xl" weight="bold" id="features-title">
                    {t("marketingShowcase.features.title")}
                  </Heading>
                  <Text size="lg" tone="muted">
                    {t("marketingShowcase.features.lead")}
                  </Text>
                </Flex>
                <ResponsiveGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="md" align="stretch">
                  {FEATURES.map((feature) => (
                    <Card key={feature.key} hoverable>
                      <CardContent solo>
                        <Flex direction="col" gap="sm">
                          {/* The doctrine's "icon medallion": Avatar square + a Lucide glyph. */}
                          <Avatar shape="square" appearance="tinted" size="md">
                            <AvatarFallback>
                              <Icon as={feature.icon} size="sm" tone="primary" />
                            </AvatarFallback>
                          </Avatar>
                          <Heading level={3} size="md">
                            {t(`marketingShowcase.features.${feature.key}Title`)}
                          </Heading>
                          {feature.hasBody ? (
                            <Text size="sm" tone="muted">
                              {t(`marketingShowcase.features.${feature.key}Body`)}
                            </Text>
                          ) : null}
                          {feature.key === "webhook" ? (
                            <Text as="code" chip size="2xs" whitespace="pre-wrap">
                              {ENDPOINT_ID}
                            </Text>
                          ) : null}
                        </Flex>
                      </CardContent>
                    </Card>
                  ))}
                </ResponsiveGrid>
              </Flex>
            </div>
          </Flex>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────────────────────── */}
        <section aria-labelledby="quotes-title">
          <div style={{ ...SHELL, ...BAND }}>
            <Flex direction="col" gap="lg">
              <Heading level={2} size="3xl" weight="bold" id="quotes-title">
                {t("marketingShowcase.testimonials.title")}
              </Heading>
              <Carousel opts={{ align: "start", loop: true }}>
                <CarouselContent>
                  {QUOTES.map((quote) => (
                    <CarouselItem key={quote.key}>
                      <Card variant="outline">
                        <CardContent solo>
                          <Flex direction="col" gap="md">
                            {quote.rating === null ? null : (
                              <Rating
                                readOnly
                                value={quote.rating}
                                name={`quote-${quote.key}`}
                                aria-label={t("marketingShowcase.testimonials.ratingLabel")}
                              />
                            )}
                            <Text size="lg">
                              {t(`marketingShowcase.testimonials.q${quote.key}`)}
                            </Text>
                            <Flex align="center" gap="sm">
                              <Avatar size="sm">
                                <AvatarFallback>
                                  {t(`marketingShowcase.testimonials.a${quote.key}`).slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <Flex direction="col" gap="none">
                                <Text size="sm" weight="medium">
                                  {t(`marketingShowcase.testimonials.a${quote.key}`)}
                                </Text>
                                <Text size="xs" tone="muted">
                                  {t(`marketingShowcase.testimonials.r${quote.key}`)}
                                </Text>
                              </Flex>
                            </Flex>
                          </Flex>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* The three controls are DIRECT children of Carousel because the component
                    places them itself: `.ui-carousel-previous` / `-next` are `position: absolute`
                    against `.ui-carousel`, and `.ui-carousel-dots` carries its own block padding.
                    Wrapping them in a Flex row produced an empty flex item and moved nothing.
                    Their accessible names are the component's own (`dataDisplay.carousel.*`). */}
                <CarouselPrevious />
                <CarouselNext />
                <CarouselDots />
              </Carousel>
            </Flex>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────────────────────────── */}
        <section id="pricing" aria-labelledby="pricing-title">
          <Flex as="div" direction="col" gap="none" surface="muted">
            <div style={{ ...SHELL, ...BAND }}>
              <Flex direction="col" gap="xl">
                <Flex direction="col" gap="md">
                  <Heading level={2} size="3xl" weight="bold" id="pricing-title">
                    {t("marketingShowcase.pricing.title")}
                  </Heading>
                  <Text size="lg" tone="muted">
                    {t("marketingShowcase.pricing.lead")}
                  </Text>
                  {/* FeatureList + Card accent + Segmented. The plan said pricing needs nothing
                      new, and it needed nothing new. */}
                  <Segmented
                    value={cycle}
                    onValueChange={setCycle}
                    aria-label={t("marketingShowcase.pricing.cycleLabel")}
                    options={[
                      { value: "monthly", label: t("marketingShowcase.pricing.monthly") },
                      {
                        value: "yearly",
                        label: t("marketingShowcase.pricing.yearly"),
                        count: 2,
                        countLabel: t("marketingShowcase.pricing.saving"),
                      },
                    ]}
                  />
                </Flex>
                <ResponsiveGrid columns={{ base: 1, md: 3 }} gap="md" align="stretch">
                  {PLANS.map((plan) => {
                    const amount = cycle === "yearly" ? plan.yearlyMonthly : plan.monthly;
                    return (
                      <Card
                        key={plan.key}
                        accent={plan.accent ? "primary" : undefined}
                        accentPlacement={plan.accent ? "perimeter" : undefined}
                      >
                        <CardContent solo>
                          <Flex direction="col" gap="md">
                            <Flex align="center" gap="xs" wrap>
                              <Heading level={3} size="lg">
                                {t(`marketingShowcase.pricing.${plan.key}Name`)}
                              </Heading>
                              {plan.badges.map((badge) => (
                                <Badge
                                  key={badge}
                                  as="span"
                                  shape="pill"
                                  tone={badge === "popular" ? "primary" : "muted"}
                                  variant={badge === "fresh" ? "outline" : "default"}
                                >
                                  {t(`marketingShowcase.pricing.${badge}`)}
                                </Badge>
                              ))}
                            </Flex>
                            <Flex direction="col" gap="none">
                              {/* The quoted plan has NO figure: an empty slot beside two full
                                  ones, in the row where a missing number usually collapses. */}
                              <Text size="4xl" weight="bold" tabular>
                                {amount === null
                                  ? t("marketingShowcase.pricing.quoted")
                                  : money.format(amount)}
                              </Text>
                              <Text size="xs" tone="muted">
                                {amount === null
                                  ? t("marketingShowcase.pricing.quotedNote")
                                  : cycle === "yearly"
                                    ? t("marketingShowcase.pricing.billedYearly")
                                    : t("marketingShowcase.pricing.perMonth")}
                              </Text>
                            </Flex>
                            <Text size="sm" tone="muted">
                              {t(`marketingShowcase.pricing.${plan.key}Note`)}
                            </Text>
                            <FeatureList
                              items={plan.features.map((feature) => ({
                                state: feature.state,
                                label: t(`marketingShowcase.pricing.${feature.key}`),
                                description: feature.limitKey
                                  ? t(`marketingShowcase.pricing.${feature.limitKey}`)
                                  : undefined,
                              }))}
                            />
                            <Button fullWidth variant={plan.accent ? "default" : "outline"} asChild>
                              <a href="#start">
                                {amount === null
                                  ? t("marketingShowcase.pricing.ctaQuote")
                                  : t("marketingShowcase.pricing.cta")}
                              </a>
                            </Button>
                          </Flex>
                        </CardContent>
                      </Card>
                    );
                  })}
                </ResponsiveGrid>
              </Flex>
            </div>
          </Flex>
        </section>

        {/* ── CTA BAND ─────────────────────────────────────────────────────────────────────── */}
        <section id="start" style={GLOW_HOST} aria-labelledby="cta-title">
          <div
            aria-hidden="true"
            className="ui-brand-glow"
            style={{ ...GLOW_LAYER, ...CTA_GLOW }}
          />
          <div style={{ ...SHELL, ...BAND, ...ABOVE_GLOW }}>
            <Reveal on="view">
              <Flex direction="col" gap="md" align="center">
                <Heading level={2} size="4xl" weight="bold" align="center" id="cta-title">
                  {t("marketingShowcase.cta.title")}
                </Heading>
                <Text size="lg" tone="muted" align="center">
                  {t("marketingShowcase.cta.lead")}
                </Text>
                <Flex align="center" gap="sm" wrap justify="center">
                  <Button size="lg" asChild>
                    <a href={`https://${SITE}`}>
                      {t("marketingShowcase.cta.primary")}
                      <Icon as={ArrowRight} size="sm" tone="inherit" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href={`https://${SITE}`}>{t("marketingShowcase.cta.secondary")}</a>
                  </Button>
                </Flex>
                <Text size="xs" tone="muted" align="center">
                  {t("marketingShowcase.cta.note")}
                </Text>
              </Flex>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────────────────────── */}
      <footer>
        <Flex as="div" direction="col" gap="none" surface="muted">
          <div style={{ ...SHELL, ...BAND }}>
            <Flex direction="col" gap="lg">
              {/* ResponsiveGrid.Item span — the asymmetric footer both siblings hand-wrote a
                  `grid-template-columns: 1.4fr 1fr 1fr 1fr` for. It has shipped the whole time. */}
              <ResponsiveGrid columns={12} gap="lg">
                <ResponsiveGrid.Item span={{ base: 12, sm: 12, md: 4, lg: 4 }}>
                  <Flex direction="col" gap="sm">
                    <Logo
                      glyph="E"
                      wordmark={t("marketingShowcase.brand.name")}
                      productSuffix={t("marketingShowcase.brand.suffix")}
                    />
                    <Text size="sm" tone="muted">
                      {t("marketingShowcase.footer.addressLabel")} ·{" "}
                      {t("marketingShowcase.footer.address")}
                    </Text>
                    <Text size="sm" tone="muted">
                      {t("marketingShowcase.footer.salesLine")} · sales@{SITE}
                    </Text>
                  </Flex>
                </ResponsiveGrid.Item>
                {FOOTER_COLUMNS.map((column) => (
                  <ResponsiveGrid.Item key={column.key} span={{ base: 12, sm: 6, md: 2, lg: 2 }}>
                    <Flex
                      direction="col"
                      gap="xs"
                      align="start"
                      role="navigation"
                      aria-label={t(`marketingShowcase.footer.${column.key}`)}
                    >
                      <Text size="xs" weight="medium" tone="muted">
                        {t(`marketingShowcase.footer.${column.key}`)}
                      </Text>
                      {column.links.map((link) => (
                        <Button key={link} variant="link" size="sm" asChild>
                          <a href={`https://${SITE}`}>{t(`marketingShowcase.footer.${link}`)}</a>
                        </Button>
                      ))}
                    </Flex>
                  </ResponsiveGrid.Item>
                ))}
              </ResponsiveGrid>
              <Separator space="sm" />
              <Flex align="center" justify="between" gap="sm" wrap>
                <Text size="xs" tone="muted">
                  {year} · {t("marketingShowcase.footer.rights")}
                </Text>
                {/* The hostile case, and the one that actually broke: `whitespace="pre-wrap"`
                    gives `overflow-wrap: break-word`, which does NOT reduce a box's MIN-CONTENT
                    size, and a flex item keeps `min-width: auto`. So in this row the 71-character
                    id held the whole line open and the DOCUMENT scrolled: 457px at 390, 375 and
                    320 alike. `Flex fill` is the documented answer (`flex: 1 1 0` +
                    `min-inline-size: 0`, layout.css:167) and it is what makes the break fire. */}
                <Flex fill direction="col" gap="none">
                  <Text size="2xs" tone="muted" whitespace="pre-wrap" align="end">
                    {ENDPOINT_ID}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </div>
        </Flex>
      </footer>
    </Flex>
  );
}

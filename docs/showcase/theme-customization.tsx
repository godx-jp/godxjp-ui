/**
 * Showcase · theme-customization — "Flexible theme customization".
 *
 * ONE DENSE BOARD, dozens of real primitives, and a theme bar above it. Pick a palette and the
 * whole board repaints in place: no reload, no remount, no second stylesheet. The page is the
 * inventory claim as much as the theming claim — every cell below is a real installable
 * `@godxjp/ui` export, composed the way a consumer would compose it.
 *
 * ── Gate 0 verdict: COMPOSITION PATTERN ──────────────────────────────────────────────────────
 * A "ThemeBoard" / "ThemePresetChips" fails the Framework-Component Test
 * (docs/COMPOSITION-VS-COMPONENT.md): C2 it owns no behaviour a primitive does not already own
 * (`Segmented` is the one-of-N control, `ColorPicker` is the hex control, `applyPrimaryColor` is
 * the seed API); C3 it is fully expressible from existing primitives plus a scoped token block;
 * C7 it would ship one marketing page's layout to every consumer. So it lives HERE. Zero new
 * components, zero new tokens.
 *
 * ── How the chips change the SEED (docs/CUSTOMER-THEMING.md, level 1 · scoped at level 3) ────
 * The chips never touch a component and never touch a role. They move `--primary` — the seed the
 * whole action family derives from at runtime (`--primary-hover`, `--primary-active`,
 * `--primary-border`, `--control-outline`, `--text-link`, `--text-brand`, `--text-primary` are all
 * `initial` knobs resolved at the painting element, src/tokens/derived.css). They are declared
 * under `[data-godx-theme="…"]`, a SCOPE, so the board repaints while the rest of the document
 * does not have to know.
 *
 * ── THE FREEZE TRAP THIS PAGE ACTUALLY HIT (docs/TOKENS.md · "the :root freeze rule") ─────────
 * Two of them, and neither is a colour knob:
 *
 *   1. `--ring` is NOT an `initial` knob. src/tokens/derived.css declares `--ring: var(--primary)`
 *      at `:root`, and says why it cannot be a knob: it is a public role that consumer CSS reads
 *      as `hsl(var(--ring))` directly. A `var()` substitutes at the element that DECLARES it, so
 *      `--ring` computes once on `<html>` from the ROOT seed and inherits that frozen value all
 *      the way down. Scoping `--primary` alone therefore repainted every fill, border, link and
 *      hover on the board and left every FOCUS RING on the old violet. The fix is one line per
 *      scope: re-declare `--ring: var(--primary)` INSIDE the scope, where it re-resolves.
 *
 *   2. The radius scale is the same shape one tier up. `--radius-xs … --radius-2xl` are
 *      `calc(var(--radius) · φⁿ)` declared at `:root` (src/styles/base.css), and
 *      `--card-radius: var(--radius-xl)` / `--control-radius: var(--radius)` /
 *      `--button-radius: var(--radius-md)` / `--badge-radius: var(--radius-md)` mirror them from
 *      `:root` too. Scoping `--radius` for the corner chips moved NOTHING until the scope restated
 *      the six steps and the four component mirrors. That is the same fix acme-portal carries.
 *
 * ── The one thing the chips deliberately do NOT move ─────────────────────────────────────────
 * `--brand` / `--brand-foreground`. The identity role is independent of the action colour on
 * purpose (gh#250), so a tenant changing its button colour does not retint its logo.
 *
 * ── Reaching the edges, deliberately ─────────────────────────────────────────────────────────
 * A tidy board is the defect, not the deliverable, so every row here carries at least one of:
 * a three-line label beside a one-word one; a 71-character unbreakable token; a slot left empty
 * beside the same slot fully filled; CJK beside Latin beside Vietnamese diacritics.
 *
 * THE FIRST SWEEP AT 375px FOUND TWO THINGS, and neither was in the page's own markup:
 *
 *   · `ChatBubble loading` painted a 544px placeholder inside a 341px card, 214px of it outside
 *     with no scrollport above it. `.ui-chat-bubble-skeleton-line` declared a DEFINITE 34rem
 *     inside an implicit `auto` grid track, and an `auto` track floors at its item's max-content,
 *     so the line's own `max-inline-size: 100%` resolved against 544px and did nothing. Fixed
 *     upstream in src/styles/data-display-layout.css (`grid-template-columns: minmax(0, …)`),
 *     because a local workaround here would have left it broken for every other consumer.
 *
 *   · A `TagInput` sat 37px wider than its column. That one was THIS page's bug: `Field` is the
 *     compact label-plus-control row and puts `flex-shrink: 0` on its control cell, which is right
 *     for a checkbox box and wrong for a full-width field. Every full-width control below is
 *     `FormField`; `Field` is kept only for the two `Switch` rows, which is what it is for.
 *
 * Measured after both: `check:frame-overflow`'s own probe reports 0 hits and 0 page overflow at
 * 320 / 375 / 390 / 768 / 1024 / 1280 / 1440, and 0 under `dir="rtl"`.
 *
 * ── i18n / a11y / RTL ────────────────────────────────────────────────────────────────────────
 * Every string and every `aria-label` comes from `t()` (`themeShowcase.*` in
 * src/i18n/messages/{en,ja,vi}.json); the locale picker drives the SAME `AppProvider` locale the
 * library's own chrome reads, so the page and its components switch together. Numbers, currency,
 * dates, lists, regions and plurals go through `Intl` with that locale — no hand-built formats, no
 * emoji flags. Logical CSS only; no Tailwind spacing or layout utilities on this page's own
 * markup.
 */
import * as React from "react";
import {
  AtSign,
  Bell,
  CircleUserRound,
  Fingerprint,
  KeyRound,
  Mail,
  MapPin,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { applyPrimaryColor } from "@godxjp/ui/app";
import { useTranslation } from "@godxjp/ui/i18n";
import { Activity, Button, Icon, Text } from "@godxjp/ui/general";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  ChatBubble,
  CredentialReveal,
  Descriptions,
  Legend,
  ListRow,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Progress,
  QrCode,
  StatCard,
  Swatch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ThoughtChain,
  Timeline,
  Welcome,
  type BadgeTone,
  type TimelineItem,
} from "@godxjp/ui/data-display";
import {
  CheckboxGroup,
  ColorPicker,
  DatePicker,
  Field,
  FormField,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Input,
  PasswordInput,
  PasswordStrength,
  RadioGroup,
  Rating,
  Segmented,
  Select,
  Slider,
  Switch,
  TagInput,
} from "@godxjp/ui/data-entry";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@godxjp/ui/feedback";
import { AuthDivider, Flex, PageContainer, ResponsiveGrid, Separator } from "@godxjp/ui/layout";
import { AppSettingPicker, AppSettingToggle, Steps, Tabs } from "@godxjp/ui/navigation";

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * THE ENTIRE THEME LAYER. One scoped block per palette, one per corner step. No component CSS,
 * no `!important`, no fork. Every seed pair was measured before it was written (WCAG 2.2 SC 1.4.3
 * on the label, SC 1.4.11 on the fill against its canvas):
 *
 *   palette  light seed  label   fill/canvas   dark seed   label    fill/canvas
 *   godx     #7A00FF     6.42:1  6.42:1        #DCBCFF     12.68:1  10.61:1
 *   indigo   #4338CA     7.90:1  7.90:1        #A5B4FC     10.53:1   8.81:1
 *   teal     #0F766E     5.47:1  5.47:1        #5EEAD4     14.20:1  11.88:1
 *   amber    #B45309     5.02:1  5.02:1        #FCD34D     14.56:1  12.18:1
 *   rose     #BE123C     6.29:1  6.29:1        #FDA4AF     11.11:1   9.29:1
 *
 * A DARK SEED IS NOT A LIGHT SEED. Nothing in CSS lifts one onto the dark spine, so each palette
 * declares both and the dark half is selected by the theme axis AppProvider writes to <html>
 * (`[data-theme="dark"]`, with the legacy `.dark` class as its equal alias). A block that set the
 * light seed only would keep a mid-dark fill on a dark canvas and nothing would say so.
 * ──────────────────────────────────────────────────────────────────────────────────────────── */
const THEME_CSS = `
[data-godx-theme="godx"]   { --primary: 268.7 100% 50%;  --primary-foreground: 0 0% 100%; }
[data-godx-theme="indigo"] { --primary: 244.5 57.9% 50.6%; --primary-foreground: 0 0% 100%; }
[data-godx-theme="teal"]   { --primary: 175.3 77.4% 26.1%; --primary-foreground: 0 0% 100%; }
[data-godx-theme="amber"]  { --primary: 26 90.5% 37.1%;  --primary-foreground: 0 0% 100%; }
[data-godx-theme="rose"]   { --primary: 345.3 82.7% 40.8%; --primary-foreground: 0 0% 100%; }

:root[data-theme="dark"] [data-godx-theme="godx"],   .dark [data-godx-theme="godx"]   { --primary: 268.7 100% 86.9%; --primary-foreground: 0 0% 0%; }
:root[data-theme="dark"] [data-godx-theme="indigo"], .dark [data-godx-theme="indigo"] { --primary: 229.7 93.5% 81.8%; --primary-foreground: 0 0% 0%; }
:root[data-theme="dark"] [data-godx-theme="teal"],   .dark [data-godx-theme="teal"]   { --primary: 170.6 76.9% 64.3%; --primary-foreground: 0 0% 0%; }
:root[data-theme="dark"] [data-godx-theme="amber"],  .dark [data-godx-theme="amber"]  { --primary: 45.9 96.7% 64.5%; --primary-foreground: 0 0% 0%; }
:root[data-theme="dark"] [data-godx-theme="rose"],   .dark [data-godx-theme="rose"]   { --primary: 352.6 95.7% 81.8%; --primary-foreground: 0 0% 0%; }

/* TRAP 1 — --ring is a public ROLE, not an \`initial\` knob (src/tokens/derived.css declares
 * \`--ring: var(--primary)\` at :root and explains why it must stay a role). It therefore freezes on
 * the ROOT seed, and every focus ring on this board stayed violet until this line existed. One
 * declaration inside the scope re-resolves it against the scope's own --primary. */
[data-godx-theme] { --ring: var(--primary); }

/* TRAP 2 — the radius scale freezes the same way, one tier up: the six steps are
 * \`calc(var(--radius) · φⁿ)\` declared at :root, and four component knobs mirror them from :root
 * too. Scoping --radius alone moved nothing at all; the scope has to restate the chain. */
[data-godx-corner="sharp"]   { --radius: 0rem; }
[data-godx-corner="default"] { --radius: 0.375rem; }
[data-godx-corner="soft"]    { --radius: 0.875rem; }
[data-godx-corner] {
  --radius-xs: calc(var(--radius) / var(--radius-ratio) / var(--radius-ratio) / var(--radius-ratio));
  --radius-sm: calc(var(--radius) / var(--radius-ratio) / var(--radius-ratio));
  --radius-md: calc(var(--radius) / var(--radius-ratio));
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * var(--radius-ratio));
  --radius-2xl: calc(var(--radius) * var(--radius-ratio) * var(--radius-ratio));
  --card-radius: var(--radius-xl);
  --control-radius: var(--radius);
  --button-radius: var(--radius-md);
  --badge-radius: var(--radius-md);
}
`;

/** The hex each palette chip stands for, in the LIGHT theme — what the Swatch beside it samples. */
const PALETTE_SEED: Record<string, string> = {
  godx: "#7A00FF",
  indigo: "#4338CA",
  teal: "#0F766E",
  amber: "#B45309",
  rose: "#BE123C",
};

/* ── Data. Ids, hex, people's names and amounts are DATA and stay as they are; every label that
 * describes them is a message key. Hosts use RFC 2606 reserved names. ────────────────────────── */

/** 71 characters, no space, no hyphenation opportunity a browser will take. The string exists to
 * prove the board survives one: it sits in a Descriptions value, a Timeline title and a table
 * cell, each of which has to decide between truncating it and pushing its neighbour off the row. */
const UNBREAKABLE = "THEME_SEED_LEDGER_0007_CONTRAST_VERIFIED_AGAINST_CANVAS_AND_LABEL_00042";

const REGION_CODES = ["JP", "VN", "DE", "BR", "IN"] as const;

const RELEASE_ROWS = [
  {
    id: "RLS-2026-0912",
    ref: UNBREAKABLE,
    owner: "佐藤 玲",
    initials: "佐",
    region: "JP",
    currency: "JPY",
    amount: 1_284_000,
    tone: "success" as BadgeTone,
    statusKey: "shipped",
  },
  {
    id: "RLS-2026-0913",
    ref: "RLS-13",
    owner: "Nguyễn Thị Hương Giang",
    initials: "NG",
    region: "VN",
    currency: "VND",
    amount: 41_500_000,
    tone: "warning" as BadgeTone,
    statusKey: "review",
  },
  {
    id: "RLS-2026-0914",
    ref: "",
    owner: "A",
    initials: "A",
    region: "DE",
    currency: "EUR",
    amount: 0,
    tone: "muted" as BadgeTone,
    statusKey: "draft",
  },
  {
    id: "RLS-2026-0915",
    ref: "RLS-15-BUILD-ARTEFACT",
    owner: "Ana Beatriz Gonçalves de Almeida",
    initials: "AB",
    region: "BR",
    currency: "BRL",
    amount: 87_640.5,
    tone: "destructive" as BadgeTone,
    statusKey: "failed",
  },
] as const;

const AVATARS = [
  { initials: "佐", presence: "online" as const },
  { initials: "NG", presence: "busy" as const },
  { initials: "AB", presence: "away" as const },
  { initials: "Д", presence: "offline" as const },
];

export default function ThemeCustomizationShowcase() {
  const { t, locale } = useTranslation();
  const boardRef = React.useRef<HTMLDivElement>(null);

  const [palette, setPalette] = React.useState("godx");
  const [corner, setCorner] = React.useState("default");
  const [custom, setCustom] = React.useState("#0F62FE");
  const [regions, setRegions] = React.useState<string[]>(["JP", "VN"]);
  const [labels, setLabels] = React.useState<string[]>(["本番", "ổn định", UNBREAKABLE]);
  const [plan, setPlan] = React.useState("standard");
  const [channels, setChannels] = React.useState<string[]>(["email"]);
  const [cadence, setCadence] = React.useState("weekly");
  const [density, setDensity] = React.useState("comfortable");
  const [autoDeploy, setAutoDeploy] = React.useState(true);
  const [budget, setBudget] = React.useState<number[]>([40]);
  const [score, setScore] = React.useState(3.5);
  const [secret, setSecret] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  /* The CUSTOM chip takes the other documented road to the same seed: `applyPrimaryColor` computes
   * `--primary`, picks `--primary-foreground` by the fill's own luminance, resets the four derived
   * knobs so an ancestor's literal cannot outrank the new seed, and — note — sets `--ring` itself,
   * for exactly the reason trap 1 above exists. It writes to this element, so it is scoped too.
   * It does NOT lift the seed for a dark canvas; that is what `pnpm gen:brand` is for. */
  React.useEffect(() => {
    const root = boardRef.current;
    if (!root || palette !== "custom") return;
    return applyPrimaryColor(root, custom);
  }, [palette, custom]);

  const money = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  const regionName = (code: string) =>
    new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  const shortDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso));
  const percent = (value: number) =>
    new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(value);
  const regionList = new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(
    regions.map(regionName),
  );
  /* The counted noun is a CLDR CATEGORY MAP in the catalog; `t()` selects the category with
   * `Intl.PluralRules` for the active locale and formats the number with `Intl.NumberFormat`.
   * "1 regions" is a bug, and a single template is how you ship one. */
  const seatNoun = t("themeShowcase.dashboard.seats", { count: regions.length });

  const paletteOptions = ["godx", "indigo", "teal", "amber", "rose", "custom"].map((id) => ({
    value: id,
    label: (
      <Flex as="span" align="center" gap="xs">
        <Swatch color={id === "custom" ? custom : PALETTE_SEED[id]} />
        <Text as="span" size="xs">
          {t(`themeShowcase.palette.${id}`)}
        </Text>
      </Flex>
    ),
  }));

  const timelineItems: TimelineItem[] = [
    {
      title: t("themeShowcase.timeline.seedApplied"),
      location: t("themeShowcase.timeline.scope"),
      time: shortDate("2026-09-12T09:30:00Z"),
      status: "done",
    },
    {
      /* A title with an intrinsic width of its own: it must shrink rather than push `time` off the
       * end of the row. Every other item here is a short string, which can never show that. */
      title: (
        <Text truncate mono>
          {UNBREAKABLE}
        </Text>
      ),
      time: shortDate("2026-09-12T11:18:00Z"),
      status: "current",
    },
    { title: t("themeShowcase.timeline.contrastQueued"), status: "pending" },
  ];

  return (
    <div ref={boardRef} data-godx-theme={palette} data-godx-corner={corner}>
      <style>{THEME_CSS}</style>
      <PageContainer
        title={t("themeShowcase.page.title")}
        subtitle={t("themeShowcase.page.subtitle")}
        extra={{
          end: (
            <Flex align="center" gap="sm" wrap>
              <AppSettingPicker kind="locale" appearance="bar" />
              <AppSettingToggle kind="theme" appearance="bar" />
            </Flex>
          ),
        }}
      >
        <Flex direction="col" gap="lg">
          {/* ── The theme bar: seed, corner, custom hex ─────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>{t("themeShowcase.bar.title")}</CardTitle>
              <CardDescription>{t("themeShowcase.bar.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <Segmented
                  aria-label={t("themeShowcase.bar.paletteLabel")}
                  value={palette}
                  onValueChange={setPalette}
                  options={paletteOptions}
                />
                <Flex direction={{ base: "col", md: "row" }} gap="md" align="start">
                  <Segmented
                    aria-label={t("themeShowcase.bar.cornerLabel")}
                    value={corner}
                    onValueChange={setCorner}
                    size="sm"
                    options={[
                      { value: "sharp", label: t("themeShowcase.corner.sharp") },
                      { value: "default", label: t("themeShowcase.corner.default") },
                      { value: "soft", label: t("themeShowcase.corner.soft") },
                    ]}
                  />
                  <FormField
                    id="theme-seed"
                    label={t("themeShowcase.bar.customLabel")}
                    helper={t("themeShowcase.bar.customHint")}
                  >
                    <ColorPicker
                      id="theme-seed"
                      value={custom}
                      onValueChange={(next) => {
                        setCustom(next);
                        setPalette("custom");
                      }}
                    />
                  </FormField>
                </Flex>
                <Text size="xs" tone="muted">
                  {t("themeShowcase.bar.identityNote")}
                </Text>
              </Flex>
            </CardContent>
          </Card>

          {/* ── The board ───────────────────────────────────────────────────────────────── */}
          <Card>
            <CardContent flush>
              <Tabs
                defaultValue="components"
                variant="line"
                bodied
                items={[
                  {
                    value: "components",
                    label: t("themeShowcase.tabs.components"),
                    content: (
                      <ComponentsBoard
                        t={t}
                        locale={locale}
                        regions={regions}
                        setRegions={setRegions}
                        regionList={regionList}
                        labels={labels}
                        setLabels={setLabels}
                        plan={plan}
                        setPlan={setPlan}
                        channels={channels}
                        setChannels={setChannels}
                        cadence={cadence}
                        setCadence={setCadence}
                        density={density}
                        setDensity={setDensity}
                        autoDeploy={autoDeploy}
                        setAutoDeploy={setAutoDeploy}
                        budget={budget}
                        setBudget={setBudget}
                        score={score}
                        setScore={setScore}
                        secret={secret}
                        setSecret={setSecret}
                        confirmOpen={confirmOpen}
                        setConfirmOpen={setConfirmOpen}
                        percent={percent}
                      />
                    ),
                  },
                  {
                    value: "dashboard",
                    label: t("themeShowcase.tabs.dashboard"),
                    content: (
                      <DashboardBoard
                        t={t}
                        money={money}
                        regionName={regionName}
                        shortDate={shortDate}
                        percent={percent}
                        seatNoun={seatNoun}
                        timelineItems={timelineItems}
                        locale={locale}
                      />
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </div>
  );
}

type Translate = (key: string, params?: Record<string, string | number>) => string;

/* ── Tab 1 · COMPONENTS — the dense inventory ─────────────────────────────────────────────── */
function ComponentsBoard(props: {
  t: Translate;
  locale: string;
  regions: string[];
  setRegions: (next: string[]) => void;
  regionList: string;
  labels: string[];
  setLabels: (next: string[]) => void;
  plan: string;
  setPlan: (next: string) => void;
  channels: string[];
  setChannels: (next: string[]) => void;
  cadence: string;
  setCadence: (next: string) => void;
  density: string;
  setDensity: (next: string) => void;
  autoDeploy: boolean;
  setAutoDeploy: (next: boolean) => void;
  budget: number[];
  setBudget: (next: number[]) => void;
  score: number;
  setScore: (next: number) => void;
  secret: string;
  setSecret: (next: string) => void;
  confirmOpen: boolean;
  setConfirmOpen: (next: boolean) => void;
  percent: (value: number) => string;
}) {
  const {
    t,
    regions,
    setRegions,
    regionList,
    labels,
    setLabels,
    plan,
    setPlan,
    channels,
    setChannels,
    cadence,
    setCadence,
    density,
    setDensity,
    autoDeploy,
    setAutoDeploy,
    budget,
    setBudget,
    score,
    setScore,
    secret,
    setSecret,
    confirmOpen,
    setConfirmOpen,
    percent,
  } = props;

  return (
    <ResponsiveGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="lg" align="start">
      {/* 1 · text entry */}
      <Flex direction="col" gap="md">
        <FormField
          id="board-email"
          label={t("themeShowcase.form.email")}
          helper={t("themeShowcase.form.emailHint")}
        >
          <Input
            id="board-email"
            type="email"
            autoComplete="email"
            prefix={<Mail aria-hidden="true" />}
            placeholder={t("themeShowcase.form.emailPlaceholder")}
            defaultValue="release-desk@ops.example.jp"
          />
        </FormField>
        <FormField id="board-handle" label={t("themeShowcase.form.handle")}>
          <Input
            id="board-handle"
            addonBefore={<AtSign aria-hidden="true" />}
            defaultValue="release-desk"
            count={{ max: 24, show: true }}
          />
        </FormField>
      </Flex>

      {/* 2 · multi-select with removable tags + free tags */}
      <Flex direction="col" gap="md">
        <FormField
          id="board-regions"
          label={t("themeShowcase.form.regions")}
          helper={regions.length > 0 ? regionList : t("themeShowcase.form.regionsEmpty")}
        >
          <Select
            id="board-regions"
            mode="multiple"
            maxTagCount={2}
            value={regions}
            onValueChange={setRegions}
            placeholder={t("themeShowcase.form.regionsPlaceholder")}
            options={REGION_CODES.map((code) => ({
              value: code,
              label: new Intl.DisplayNames([props.locale], { type: "region" }).of(code) ?? code,
            }))}
          />
        </FormField>
        <FormField id="board-labels" label={t("themeShowcase.form.labels")}>
          <TagInput
            id="board-labels"
            value={labels}
            onValueChange={setLabels}
            maxTagCount={2}
            placeholder={t("themeShowcase.form.labelsPlaceholder")}
          />
        </FormField>
      </Flex>

      {/* 3 · dropdown + date */}
      <Flex direction="col" gap="md">
        <FormField id="board-plan" label={t("themeShowcase.form.plan")}>
          <Select
            id="board-plan"
            value={plan}
            onValueChange={setPlan}
            options={[
              { value: "starter", label: t("themeShowcase.plan.starter") },
              { value: "standard", label: t("themeShowcase.plan.standard") },
              { value: "scale", label: t("themeShowcase.plan.scale") },
            ]}
          />
        </FormField>
        <FormField id="board-date" label={t("themeShowcase.form.releaseDate")}>
          <DatePicker id="board-date" defaultValue={new Date("2026-09-12T00:00:00Z")} />
        </FormField>
      </Flex>

      {/* 4 · checkboxes — a three-line label beside a one-word one, and a disabled row */}
      <Flex direction="col" gap="md">
        <Text size="xs" tone="muted" weight="medium">
          {t("themeShowcase.form.channels")}
        </Text>
        <CheckboxGroup
          name="board-channels"
          value={channels}
          onValueChange={setChannels}
          options={[
            { value: "email", label: t("themeShowcase.channel.email") },
            {
              value: "escalation",
              label: t("themeShowcase.channel.escalation"),
              description: t("themeShowcase.channel.escalationHint"),
            },
            { value: "pager", label: t("themeShowcase.channel.pager"), disabled: true },
          ]}
        />
      </Flex>

      {/* 5 · radios + segmented */}
      <Flex direction="col" gap="md">
        <Text size="xs" tone="muted" weight="medium">
          {t("themeShowcase.form.cadence")}
        </Text>
        <RadioGroup
          name="board-cadence"
          value={cadence}
          onValueChange={setCadence}
          orientation="horizontal"
          options={[
            { value: "daily", label: t("themeShowcase.cadence.daily") },
            { value: "weekly", label: t("themeShowcase.cadence.weekly") },
            { value: "manual", label: t("themeShowcase.cadence.manual") },
          ]}
        />
        <Segmented
          aria-label={t("themeShowcase.form.density")}
          value={density}
          onValueChange={setDensity}
          size="sm"
          options={[
            { value: "compact", label: t("themeShowcase.density.compact") },
            { value: "default", label: t("themeShowcase.density.default") },
            { value: "comfortable", label: t("themeShowcase.density.comfortable") },
          ]}
        />
      </Flex>

      {/* 6 · switch + slider + activity */}
      <Flex direction="col" gap="md">
        <Field
          id="board-auto"
          label={t("themeShowcase.form.autoDeploy")}
          description={t("themeShowcase.form.autoDeployHint")}
        >
          <Switch id="board-auto" checked={autoDeploy} onCheckedChange={setAutoDeploy} />
        </Field>
        <Field id="board-freeze" label={t("themeShowcase.form.freeze")}>
          <Switch id="board-freeze" loading defaultChecked />
        </Field>
        <FormField
          id="board-budget"
          label={t("themeShowcase.form.budget", { value: percent(budget[0] / 100) })}
        >
          <Slider id="board-budget" value={budget} onValueChange={setBudget} />
        </FormField>
        <Activity label={t("themeShowcase.form.syncing")} />
      </Flex>

      {/* 7 · steps */}
      <Flex direction="col" gap="md">
        <Text size="xs" tone="muted" weight="medium">
          {t("themeShowcase.steps.caption")}
        </Text>
        <Steps
          value={1}
          percent={62}
          orientation="vertical"
          items={[
            {
              title: t("themeShowcase.steps.finished"),
              description: t("themeShowcase.steps.finishedHint"),
            },
            { title: t("themeShowcase.steps.inProcess") },
            {
              title: t("themeShowcase.steps.waiting"),
              description: t("themeShowcase.steps.waitingHint"),
            },
          ]}
        />
      </Flex>

      {/* 8 · progress: bar, ring, breakdown + legend */}
      <Flex direction="col" gap="md">
        <Progress
          value={62}
          label={t("themeShowcase.progress.rollout", { value: percent(0.62) })}
        />
        <Progress
          value={94}
          tone="warning"
          label={t("themeShowcase.progress.quota", { value: percent(0.94) })}
        />
        <Flex align="center" gap="md" wrap>
          <Progress shape="ring" value={18} label="18/42" />
          <Progress
            shape="ring"
            value={100}
            tone="success"
            label={t("themeShowcase.progress.done")}
          />
        </Flex>
        <Progress
          segments={[
            { value: 2, tone: "destructive", label: t("themeShowcase.legend.failed") },
            { value: 3, tone: "warning", label: t("themeShowcase.legend.review") },
            { value: 12, tone: "success", label: t("themeShowcase.legend.shipped") },
          ]}
        />
        <Legend
          items={[
            { tone: "destructive", label: t("themeShowcase.legend.failed") },
            { tone: "warning", label: t("themeShowcase.legend.review") },
            { tone: "success", label: t("themeShowcase.legend.shipped") },
          ]}
        />
      </Flex>

      {/* 9 · status marks — never colour alone: every dot carries its word */}
      <Flex direction="col" gap="md">
        <Text size="xs" tone="muted" weight="medium">
          {t("themeShowcase.status.caption")}
        </Text>
        <Flex gap="xs" wrap>
          <Badge tone="success">{t("themeShowcase.status.success")}</Badge>
          <Badge tone="destructive">{t("themeShowcase.status.error")}</Badge>
          <Badge tone="muted">{t("themeShowcase.status.default")}</Badge>
          <Badge tone="info">{t("themeShowcase.status.processing")}</Badge>
          <Badge tone="warning">{t("themeShowcase.status.warning")}</Badge>
          <Badge tone="primary" variant="outline">
            {t("themeShowcase.status.seed")}
          </Badge>
        </Flex>
        <Flex gap="xs" wrap>
          <Button size="sm">{t("themeShowcase.action.primary")}</Button>
          <Button size="sm" variant="secondary">
            {t("themeShowcase.action.secondary")}
          </Button>
          <Button size="sm" variant="outline">
            {t("themeShowcase.action.outline")}
          </Button>
          <Button size="sm" variant="dashed">
            {t("themeShowcase.action.dashed")}
          </Button>
          <Button size="sm" variant="ghost">
            {t("themeShowcase.action.ghost")}
          </Button>
          <Button size="sm" loading loadingText={t("themeShowcase.action.deploying")}>
            {t("themeShowcase.action.deploying")}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="outline"
                aria-label={t("themeShowcase.action.discard")}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("themeShowcase.action.discard")}</TooltipContent>
          </Tooltip>
        </Flex>
      </Flex>

      {/* 10 · confirm popover + avatar stack */}
      <Flex direction="col" gap="md">
        <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              {t("themeShowcase.confirm.trigger")}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>{t("themeShowcase.confirm.title")}</PopoverTitle>
              <PopoverDescription>{t("themeShowcase.confirm.description")}</PopoverDescription>
            </PopoverHeader>
            <Flex gap="xs" justify="end">
              <Button size="xs" variant="ghost" onClick={() => setConfirmOpen(false)}>
                {t("themeShowcase.confirm.cancel")}
              </Button>
              <Button size="xs" variant="destructive" onClick={() => setConfirmOpen(false)}>
                {t("themeShowcase.confirm.ok")}
              </Button>
            </Flex>
          </PopoverContent>
        </Popover>
        <Flex align="center" gap="xs" wrap>
          {AVATARS.map((person) => (
            <Avatar key={person.initials} size="sm" presence={person.presence}>
              <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
          ))}
          <Avatar size="sm" appearance="tinted">
            <AvatarFallback>+8</AvatarFallback>
          </Avatar>
          <Text size="xs" tone="muted">
            {t("themeShowcase.avatars.caption")}
          </Text>
        </Flex>
        <Rating
          value={score}
          onValueChange={setScore}
          allowHalf
          tooltips={[
            t("themeShowcase.rating.1"),
            t("themeShowcase.rating.2"),
            t("themeShowcase.rating.3"),
            t("themeShowcase.rating.4"),
            t("themeShowcase.rating.5"),
          ]}
        />
        <Rating value={4} readOnly />
      </Flex>

      {/* 11 · OTP verification card */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle level={3}>{t("themeShowcase.otp.title")}</CardTitle>
          <CardDescription>{t("themeShowcase.otp.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <InputOTP
            maxLength={6}
            align="center"
            pattern="[0-9]*"
            aria-label={t("themeShowcase.otp.field")}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </CardContent>
        <CardFooter>
          <Button fullWidth>{t("themeShowcase.otp.verify")}</Button>
        </CardFooter>
      </Card>

      {/* 12 · sign-up card with a divider and two identity handoffs */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle level={3}>{t("themeShowcase.signup.title")}</CardTitle>
          <CardDescription>{t("themeShowcase.signup.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Flex direction="col" gap="md">
            <FormField id="signup-email" label={t("themeShowcase.signup.email")}>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.jp"
              />
            </FormField>
            <FormField id="signup-secret" label={t("themeShowcase.signup.password")}>
              <PasswordInput
                id="signup-secret"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                autoComplete="new-password"
              />
            </FormField>
            <PasswordStrength value={secret} />
            <Button fullWidth>{t("themeShowcase.signup.submit")}</Button>
            <AuthDivider label={t("themeShowcase.signup.or")} />
            <Button variant="outline" fullWidth>
              <ShieldCheck aria-hidden="true" />
              {t("themeShowcase.signup.sso")}
            </Button>
            <Button variant="outline" fullWidth>
              <Fingerprint aria-hidden="true" />
              {t("themeShowcase.signup.passkey")}
            </Button>
          </Flex>
        </CardContent>
      </Card>

      {/* 13 · notifications — one row with every slot filled, one with only a title */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle level={3}>{t("themeShowcase.notify.title")}</CardTitle>
          <CardAction>
            <Badge tone="info">2</Badge>
          </CardAction>
        </CardHeader>
        <CardContent flush>
          <Flex as="ul" marker="none" direction="col" gap="none">
            <ListRow
              as="li"
              unread
              align="start"
              overflow="wrap"
              leading={<Bell aria-hidden="true" />}
              title={t("themeShowcase.notify.longTitle")}
              description={t("themeShowcase.notify.longMeta")}
              trailing={
                <Button size="xs" variant="outline">
                  {t("themeShowcase.notify.open")}
                </Button>
              }
            />
            <ListRow
              as="li"
              align="start"
              overflow="wrap"
              title={t("themeShowcase.notify.bareTitle")}
            />
          </Flex>
        </CardContent>
      </Card>

      {/* 14 · enrolment QR + the manual fallback */}
      <Flex direction="col" gap="md">
        <Text size="xs" tone="muted" weight="medium">
          {t("themeShowcase.qr.caption")}
        </Text>
        <QrCode
          value="otpauth://totp/ops.example.jp:release-desk?secret=JBSWY3DPEHPK3PXP&issuer=ops.example.jp"
          label={t("themeShowcase.qr.label")}
          size="md"
        />
        <CredentialReveal
          secret="JBSW Y3DP EHPK 3PXP"
          label={t("themeShowcase.qr.manualKey")}
          warning={null}
        />
      </Flex>

      {/* 15 · assistant surfaces — Welcome, ChatBubble (full · bare · pending), ThoughtChain */}
      <Flex direction="col" gap="md">
        <Welcome
          icon={<Icon as={CircleUserRound} size="lg" tone="primary" />}
          title={t("themeShowcase.welcome.title")}
          description={t("themeShowcase.welcome.description")}
          extra={
            <Button size="xs" variant="ghost">
              {t("themeShowcase.welcome.dismiss")}
            </Button>
          }
        />
        <ChatBubble
          placement="start"
          avatar={
            <Avatar size="sm" aria-hidden="true">
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
          }
          header={t("themeShowcase.chat.assistant")}
          footer={t("themeShowcase.chat.sent")}
        >
          {t("themeShowcase.chat.answer")}
        </ChatBubble>
        <ChatBubble placement="end">{t("themeShowcase.chat.bare")}</ChatBubble>
        <ChatBubble placement="start" header={t("themeShowcase.chat.assistant")} loading />
        <ThoughtChain
          label={t("themeShowcase.thought.label")}
          defaultExpandedKeys={["contrast"]}
          items={[
            {
              key: "read",
              title: t("themeShowcase.thought.read"),
              description: t("themeShowcase.thought.readHint"),
              status: "success",
            },
            {
              key: "contrast",
              title: t("themeShowcase.thought.contrast"),
              content: t("themeShowcase.thought.contrastBody"),
              collapsible: true,
              status: "loading",
            },
            { key: "write", title: t("themeShowcase.thought.write"), status: "error" },
          ]}
        />
      </Flex>

      {/* 16 · carousel */}
      <Flex direction="col" gap="md">
        <Text size="xs" tone="muted" weight="medium">
          {t("themeShowcase.carousel.caption")}
        </Text>
        <Carousel opts={{ loop: true }}>
          <CarouselContent>
            {["godx", "indigo", "teal", "amber", "rose"].map((id) => (
              <CarouselItem key={id}>
                <Card variant="muted">
                  <CardContent>
                    <Flex align="center" gap="sm">
                      <Swatch
                        color={PALETTE_SEED[id]}
                        aria-label={t(`themeShowcase.palette.${id}`)}
                      />
                      <Flex direction="col" gap="none">
                        <Text weight="medium">{t(`themeShowcase.palette.${id}`)}</Text>
                        <Text size="xs" tone="muted" mono>
                          {PALETTE_SEED[id]}
                        </Text>
                      </Flex>
                    </Flex>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
          <CarouselDots />
        </Carousel>
      </Flex>

      {/* 17 · an alert that is not tidy: a long body beside a one-word title */}
      <Flex direction="col" gap="md">
        <Alert tone="warning">
          <AlertTitle>{t("themeShowcase.alert.title")}</AlertTitle>
          <AlertDescription>{t("themeShowcase.alert.description")}</AlertDescription>
        </Alert>
        <Alert tone="success">
          <AlertTitle>{t("themeShowcase.alert.okTitle")}</AlertTitle>
        </Alert>
      </Flex>
    </ResponsiveGrid>
  );
}

/* ── Tab 2 · DASHBOARD ─────────────────────────────────────────────────────────────────────── */
function DashboardBoard(props: {
  t: Translate;
  money: (amount: number, currency: string) => string;
  regionName: (code: string) => string;
  shortDate: (iso: string) => string;
  percent: (value: number) => string;
  seatNoun: string;
  timelineItems: TimelineItem[];
  locale: string;
}) {
  const { t, money, regionName, shortDate, percent, seatNoun, timelineItems, locale } = props;

  return (
    <Flex direction="col" gap="lg">
      <ResponsiveGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
        <StatCard
          label={t("themeShowcase.dashboard.releases")}
          value={new Intl.NumberFormat(locale).format(1284)}
          delta="+12%"
          hint={t("themeShowcase.dashboard.releasesHint")}
        />
        <StatCard
          label={t("themeShowcase.dashboard.revenue")}
          value={money(8_200_000, "JPY")}
          accent="primary"
        />
        {/* Every slot filled, next to a tile with nothing but its label and a dash. */}
        <StatCard
          label={t("themeShowcase.dashboard.failureRate")}
          value={percent(0.021)}
          delta="-0.4pt"
          hint={t("themeShowcase.dashboard.failureHint")}
          inverse
        />
        <StatCard label={t("themeShowcase.dashboard.seatsLabel")} value="—" hint={seatNoun} />
      </ResponsiveGrid>

      <ResponsiveGrid columns={{ base: 1, lg: 2 }} gap="lg" align="start">
        <Card>
          <CardHeader>
            <CardTitle level={3}>{t("themeShowcase.dashboard.mix")}</CardTitle>
            <CardAction>
              <Legend
                items={[
                  { tone: "destructive", label: t("themeShowcase.legend.failed") },
                  { tone: "warning", label: t("themeShowcase.legend.review") },
                  { tone: "success", label: t("themeShowcase.legend.shipped") },
                ]}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Progress
                segments={[
                  { value: 2, tone: "destructive", label: t("themeShowcase.legend.failed") },
                  { value: 3, tone: "warning", label: t("themeShowcase.legend.review") },
                  { value: 12, tone: "success", label: t("themeShowcase.legend.shipped") },
                ]}
              />
              <Separator />
              <Descriptions
                columns={{ sm: 1, md: 2 }}
                items={[
                  {
                    key: "env",
                    label: t("themeShowcase.dashboard.environment"),
                    children: "ops.example.jp",
                  },
                  /* Deliberately empty: a value with nothing in it, beside one with everything. */
                  { key: "owner", label: t("themeShowcase.dashboard.owner"), children: "" },
                  {
                    key: "ledger",
                    label: t("themeShowcase.dashboard.ledger"),
                    children: UNBREAKABLE,
                    mono: true,
                    span: "filled",
                  },
                ]}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={3}>{t("themeShowcase.dashboard.activity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline variant="status" items={timelineItems} />
          </CardContent>
        </Card>
      </ResponsiveGrid>

      <Card>
        <CardHeader>
          <CardTitle level={3}>{t("themeShowcase.dashboard.table")}</CardTitle>
          <CardDescription>{t("themeShowcase.dashboard.tableHint")}</CardDescription>
        </CardHeader>
        <CardContent flush>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("themeShowcase.table.id")}</TableHead>
                <TableHead>{t("themeShowcase.table.owner")}</TableHead>
                <TableHead>{t("themeShowcase.table.region")}</TableHead>
                <TableHead>{t("themeShowcase.table.ref")}</TableHead>
                <TableHead>{t("themeShowcase.table.status")}</TableHead>
                <TableHead className="text-end">{t("themeShowcase.table.amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RELEASE_ROWS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Text size="xs" mono tone="muted">
                      {row.id}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Flex align="center" gap="xs">
                      <Avatar size="xs">
                        <AvatarFallback>{row.initials}</AvatarFallback>
                      </Avatar>
                      <Text size="sm">{row.owner}</Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex align="center" gap="xs">
                      <Icon as={MapPin} size="xs" tone="muted" />
                      <Text size="sm">{regionName(row.region)}</Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    {row.ref ? (
                      <Text size="xs" mono truncate>
                        {row.ref}
                      </Text>
                    ) : (
                      <Text size="xs" tone="muted">
                        {t("themeShowcase.table.noRef")}
                      </Text>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge tone={row.tone} variant="outline">
                      {t(`themeShowcase.releaseStatus.${row.statusKey}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {money(row.amount, row.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Flex align="center" gap="sm" wrap justify="between" fill>
            <Text size="xs" tone="muted">
              {t("themeShowcase.dashboard.updated", { date: shortDate("2026-09-21T00:00:00Z") })}
            </Text>
            <Button size="xs" variant="outline">
              <KeyRound aria-hidden="true" />
              {t("themeShowcase.dashboard.rotate")}
            </Button>
          </Flex>
        </CardFooter>
      </Card>
    </Flex>
  );
}

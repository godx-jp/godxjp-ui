/**
 * Showcase · glassmorphism — a MEASUREMENT of the published theme API, not a demo.
 *
 * ── The constraint this page was built under ─────────────────────────────────────────────────
 * Exactly one new CSS file exists for this theme: `docs/themes/glassmorphism.css`. It contains
 * NOTHING but `--custom-property` declarations inside `[data-theme-style="glass"]` — no
 * `backdrop-filter`/`background`/`box-shadow` written directly, no selector touching a `.ui-*`
 * internal class, no `src/components/**` or `src/tokens/**` edit. This page's OWN markup carries
 * no `className`, no inline `style`, and no page-local CSS — every visual result below is the
 * theme file's tokens read by EXISTING `src/styles/**` rules, exactly the way an Ant Design
 * consumer is limited to `theme.token` / `theme.components`.
 *
 * ── Portal escape (a finding in its own right) ───────────────────────────────────────────────
 * Dialog / Sheet / Popover / DropdownMenu / Select / Tooltip all portal their content OUT of this
 * page's DOM subtree (to `document.body` by default), and a CSS custom property only inherits
 * through the DOM tree — so `data-theme-style="glass"` on this page's one wrapper does NOT reach
 * any of the six on its own (verified: computed `backgroundColor` on each Content node was the
 * page's default theme, not glass, until this was added). `docs/CUSTOMER-THEMING.md`'s "level 3 ·
 * scope" entry does not mention portals at all. Two ways exist to close the gap and neither needed
 * a new prop: (a) re-declare `data-theme-style="glass"` directly on each `*Content` primitive —
 * every one spreads `...props` onto its real DOM node (verified in source for Dialog, Sheet,
 * Popover, DropdownMenu, Tooltip and Select), so a plain `data-*` attribute (not a className, not
 * a style) lands on the portalled root and the CSS scope re-resolves there; that is what this page
 * does. (b) the published `OverlayPortalProvider` (`@godxjp/ui/app`) can instead re-parent every
 * overlay's portal INSIDE a chosen container, which would make (a) unnecessary — not used here
 * only because per-node reapplication demonstrates the gap more plainly for the report below.
 * Toast is the same story: `sonner.tsx` spreads `...props` onto the `<Sonner>` root last, so
 * `<Toaster data-theme-style="glass" />` reaches sonner's own portalled container the same way.
 *
 * ── GAP REPORT — reachable via a documented custom property? (ALL cells verified live with
 *    `getComputedStyle`/`CSS.supports` in the browser, not inferred from reading source) ────────
 * "Reachable" = a token exists AND was changed above AND the computed style actually moved.
 * "shared role" = the only lever is a foundation token several components read bare (--card,
 * --popover, --border) — changing it moves every OTHER bare reader in scope too, not just the one
 * named; still counted ✓ per the brief's own definition. File:line is the exact hard-coded
 * declaration where NO token exists at all. Two mechanisms surfaced ONLY by measuring, not by
 * reading the docs:
 *   (1) THE SHADOW SEED IS A TWO-LAYER FREEZE TRAP. `--shadow-color` retints `--shadow-sm/md/lg`
 *       directly (they are declared once at `:root`, so restating them here was required — the
 *       SAME shape as the documented `--ring: var(--primary)` trap). Card/Sheet/Popover/Tooltip/
 *       Segmented go through a SECOND, component-tier mirror on top of that (`--card-shadow: var(
 *       --shadow-sm)`, also declared once at `:root`) — restating the foundation step alone left
 *       their shadow black; it took a second restatement per mirror. Select/DropdownMenu/Dialog/
 *       `.ui-button--outline` read a foundation step DIRECTLY and needed only the first restatement.
 *   (2) `--background` CANNOT take an alpha suffix (confirmed with `CSS.supports`: a second `/`
 *       is invalid CSS) because shell-layout.css:2648 already composes it with `/
 *       var(--topbar-background-alpha)` — the ONE token multiple unrelated call sites both need
 *       BARE (the page canvas) and PRE-ALPHA'D (Topbar). This is why Dialog's and Sheet's
 *       BACKGROUND are the two true dead ends in the whole set: the only lever that reaches them
 *       is shared with a consumer that breaks first. `--border` has no such second consumer
 *       (checked), so it WAS safely given an alpha suffix and turned out to be the widest-reaching
 *       single line in the theme file — it reaches Dialog's, Sheet's, Select's, DropdownMenu's,
 *       Sidebar's, the default Alert tone's, and `.ui-button--outline`'s BORDER, none of which had
 *       a dedicated token of their own.
 *
 * component      | surface                                                    | blur (backdrop-filter) | border                                     | shadow                                | gradient
 * --------------- | ----------------------------------------------------------- | ------------------------ | -------------------------------------------- | ---------------------------------------- | --------
 * Card            | ✓ --card-background                                         | ✗ none — no `backdrop-filter` anywhere in card-layout.css | ✓ --card-border                    | ✓ --card-shadow (2-layer mirror, see above) | ✗ DEAD END — card-layout.css:49 `linear-gradient(var(--card-tint), var(--card-tint))` repeats ONE token as both stops; a real 2-colour value degenerates to `linear-gradient(A 0%, B 100%, A 0%, B 100%)`, which CSS clamps to a hard A→B split, not a blend (measured with `getComputedStyle`)
 * Dialog          | ✗ dialog-layout.css:56 `hsl(var(--background))` hard-coded — `--background` cannot take an alpha (see above) | ✗ none | ✓ shared role `--border` (dialog-layout.css:55) | ✓ `--shadow-color` seed + `--dialog-content-glow` (additive highlight layer) | ✗ no gradient hook on the panel at all
 * Sheet           | ✗ sheet.tsx bakes Tailwind `bg-background` into its className — same `--background` dead end | ✗ none | ✓ shared role `--border` (sheet.tsx:235-236 `border-l`/`border-r`, a PHYSICAL utility the file's own comment flags as a pre-existing RTL debt) | ✓ `--sheet-shadow` (2-layer mirror) | ✗ no gradient hook
 * Popover         | ✓ --popover-surface-background                             | ✗ none               | ✓ --popover-surface-border-color             | ✓ --popover-shadow (2-layer mirror)      | ✗ no gradient hook — only a flat token
 * DropdownMenu    | ✓ shared role `--popover` (navigation-layout.css:937 hard-codes `hsl(var(--popover))`, no `--dropdown-menu-background`) | ✗ none | ✓ shared role `--border` (navigation-layout.css:936) | ✓ `--shadow-color` seed direct (`--shadow-md`) | ✗ no gradient hook
 * Select (open)   | ✓ shared role `--popover` (control.css:2317, no `--select-background`) | ✗ none | ✓ shared role `--border` (control.css:2316) | ✓ `--shadow-color` seed direct (`--shadow-md`) | ✗ no gradient hook
 * Tooltip         | ✓ --tooltip-background                                     | ✗ none               | ✓ --tooltip-border-color                     | ✓ --tooltip-shadow (2-layer mirror)      | ✗ no gradient hook
 * Topbar          | ✓ --topbar-background-alpha (composes with --background)   | **✓ --topbar-backdrop-blur-size — THE ONLY SURFACE IN THIS ENTIRE SET WITH A REAL backdrop-filter**, confirmed live: `blur(16px)` | ✗ no `--topbar-border-color` — `.ui-topbar` draws no border at all | n/a — no shadow property on `.ui-topbar` | ✓ --topbar-gradient (shell-layout.css:389, single-slot `background-image`, confirmed clean) — but see the AppShell-chrome note below
 * Sidebar         | ✓ shared role `--card` (Sidebar itself is `display:contents`; the visible box is AppShell's `.app-sidebar`, shell-layout.css:228) | ✗ none | ✓ shared role `--border` (shell-layout.css:216) | n/a — no shadow on `.app-sidebar` | ✓ --sidebar-gradient (shell-layout.css:230, confirmed clean)
 * Table/DataTable | ✓ shared with Card: table-layout.css:540 reuses `--card-background` | ✗ none | ✓ OUTER frame is shared role `--border` (table-layout.css:372 — NOT `--table-border-color`, confirmed by measuring which alpha actually rendered); `--table-border-color` is real but scoped to internal cell dividers under `<Table bordered>`, unused by this page's plain DataTable | n/a — inherits the Card it sits in | ✗ no gradient hook of its own (inherits Card's dead end)
 * Input           | ✓ --control-surface-background (shared with Select trigger/TagInput) | ✗ none | ✓ --control-surface-border-color | n/a — no shadow on `.ui-control-surface` | ✗ no gradient hook
 * Button          | ✗ `bg-primary`/`bg-background`/`bg-secondary` Tailwind utilities read foundation roles directly — no `--button-background` at any tier; deliberately not retinted (would recolour every other bare reader) | ✗ none | ✓ shared role `--border` (`outline`/`dashed` variants' plain `border` utility) | ✓ `.ui-button--outline` reads `--shadow-sm` directly (retinted); the default (filled) variant has no shadow at all | ✗ no gradient hook
 * Badge           | ✓ --badge-tint-fill / --badge-tint-edge (colour-mix PERCENTAGES, not colours) | ✗ none | ✓ same two percentages | n/a — no `box-shadow` on a badge at all (flat chip by design) | ✗ no gradient hook
 * Tabs            | ✓ --tabs-panel-background / --tabs-card-background (require `bodied`/`variant="card"`) | ✗ none | ✓ shared role `--border` for the COLOUR (navigation-layout.css:479); `--tabs-panel-border-width` is a separate, dedicated WIDTH-only token | n/a — no shadow on a tabs panel | ✗ no gradient hook
 * Alert           | partial: 4 toned variants ✓ `--alert-bg-alpha`/`--surface-*`; default/neutral tone ✗ alert-layout.css:20 hard-codes literal `hsl(var(--muted) / 0.4)` — same double-alpha dead end as `--background` | ✗ none | ✓ toned via `--alert-border-alpha`; default tone ✓ too, shared role `--border` (alert-layout.css:19) | n/a — Alert draws no shadow (inline banner) | ✗ no gradient hook
 * Toast           | ✓ shared role `--popover`, set inline by sonner.tsx (`--normal-bg: hsl(var(--popover))`) — same lever as Select/DropdownMenu | unable to verify — sonner's own vendor stylesheet was not present as a plain file in this checkout (pnpm content-addressed store), so its box-shadow could not be inspected in source; the rendered `[data-sonner-toast]` root DID show `backdrop-filter: none` when checked live, so blur is at minimum absent even if the shadow itself is unconfirmed | ✓ shared role `--border` (`--normal-border`) | not independently confirmed (see surface note) | ✗ no gradient hook
 * Avatar          | ✓ --avatar-background (dedicated)                          | ✗ none               | n/a — `.ui-avatar` draws no border            | n/a — no shadow                          | ✗ no gradient hook
 * Progress        | ✓ --progress-track-background (dedicated); FILL deliberately untouched — it is the WCAG 2.2 SC 1.4.11 data mark, not decoration | ✗ none | n/a — no border on the track | n/a — no shadow | ✗ no gradient hook
 * Segmented       | ✓ --segmented-track-background / --segmented-item-selected-background | ✗ none | ✓ --segmented-item-selected-border-color | ✓ --segmented-item-selected-shadow (2-layer mirror) | ✗ no gradient hook
 *
 * BLUR, TALLIED: 1 of 19 (Topbar). Every other row's ✗ is a `backdrop-filter: none` measured live
 * with `getComputedStyle`, not an assumption from reading the stylesheet — confirmed for Card,
 * Dialog, Sheet, Popover, DropdownMenu, Select, Tooltip, Sidebar, DataTable, Input, Button, Badge,
 * Alert, Avatar, Progress, Segmented, and AppShell's own `.app-topbar`/`.app-sidebar` chrome.
 * GRADIENT, TALLIED: 3 of 19 have a clean single-slot hook (Topbar, Sidebar, and — outside this
 * table — `PageContainer`'s own header via `--gradient-hero`); Card's only hook degenerates by
 * construction; the other 15 have no gradient-image property anywhere in their rule at all.
 *
 * ── AppShell chrome sits OUTSIDE the one region with a backdrop (measured, not designed around) ─
 * `.app-topbar` and `.app-sidebar` are siblings of `.app-main` in AppShell's CSS grid, and
 * `--gradient-glow`/the page's vivid backdrop is painted ONLY inside `.app-main`
 * (shell-layout.css:403). So even where the chrome IS translucent + gradient-washed (both
 * confirmed above), there is nothing colourful behind it to show through — measured live, both
 * render as a flat, near-opaque wash over the page's own light canvas. Glass needs a busy ground
 * BEHIND the element wearing it; AppShell's own chrome never sits over one.
 *
 * ── Contrast — measured live: `getComputedStyle` for text colour, screenshot pixel-sampling
 *    (majority colour in the text's own bounding box) for the ACTUAL composited background,
 *    WCAG relative-luminance formula for the ratio. Not estimated. ──────────────────────────────
 *   Card title on Card surface:                 rgb(36,35,30)   on rgb(167,157,196)  → 6.19:1  PASS (needs 4.5:1)
 *   Card description (muted) on Card surface:   rgb(104,102,94) on rgb(165,157,193)  → 2.24:1  **FAIL** (needs 4.5:1) — the muted-foreground ink was tuned for an OPAQUE light card; a 55%-alpha glass panel over a vivid backdrop erodes it below AA
 *   Topbar brand text on Topbar surface:         rgb(104,102,94) on rgb(233,224,250) → 4.52:1  PASS, but by 0.02 — effectively at the floor
 *   Dialog title on Dialog surface:              rgb(36,35,30)   on rgb(253,253,252) → 15.46:1 PASS — because Dialog's background is the one dead end above, it stayed fully opaque and never lost its designed contrast
 *   Dialog description (muted) on Dialog surface: rgb(104,102,94) on rgb(253,253,252) → 5.65:1  PASS
 * The one AA FAILURE found is exactly the muted/secondary text tier riding a translucent surface —
 * the tier this system already uses for every card subtitle, table meta column and empty-state
 * caption. Any real consumer shipping this theme would need to either raise `--muted-foreground`'s
 * contrast specifically for glass surfaces or stop using it on anything that sits on one.
 *
 * ── i18n / a11y ───────────────────────────────────────────────────────────────────────────────
 * Every string on this page goes through `t()` (`glassShowcase.*` in
 * docs/i18n/messages/{en,ja,vi}.json — a docs-only namespace, registered by
 * `preview/src/docs-messages.ts`, never shipped to the runtime catalogue). Real primitives only;
 * no raw HTML controls; controlled-vocabulary props (`tone`, `value`/`onValueChange`).
 */
import * as React from "react";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  LayoutGrid,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";

import {
  AppShell,
  Flex,
  PageContainer,
  ResponsiveGrid,
  Sidebar,
  Topbar,
  TopbarItem,
} from "@godxjp/ui/layout";
import { Button, Text } from "@godxjp/ui/general";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import {
  FormField,
  Input,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
} from "@godxjp/ui/feedback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@godxjp/ui/navigation";
import { useTranslation } from "@godxjp/ui/i18n";

// The one theme file this exercise is allowed to add — a side-effect CSS import, exactly like
// every other stylesheet this preview loads (preview/src/main.tsx does the same for its own
// CSS). Nothing here is page-local: every rule inside lives under `[data-theme-style="glass"]`.
import "../themes/glassmorphism.css";

const GLASS = "glass";

type RequestRow = {
  id: string;
  nameKey: string;
  ownerKey: string;
  tone: "success" | "warning" | "destructive";
};

const REQUEST_ROWS: RequestRow[] = [
  { id: "r1", nameKey: "row1Name", ownerKey: "row1Owner", tone: "success" },
  { id: "r2", nameKey: "row2Name", ownerKey: "row2Owner", tone: "warning" },
  { id: "r3", nameKey: "row3Name", ownerKey: "row3Owner", tone: "destructive" },
];

export default function GlassmorphismShowcase() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [role, setRole] = React.useState("viewer");

  const toneLabel = React.useCallback(
    (tone: RequestRow["tone"]) =>
      tone === "success"
        ? t("glassShowcase.table.toneSuccess")
        : tone === "warning"
          ? t("glassShowcase.table.toneWarning")
          : t("glassShowcase.table.toneDestructive"),
    [t],
  );

  const columns: ColumnDef<RequestRow>[] = [
    {
      key: "nameKey",
      header: t("glassShowcase.table.columnName"),
      render: (row) => <Text as="span">{t(`glassShowcase.table.${row.nameKey}`)}</Text>,
    },
    {
      key: "ownerKey",
      header: t("glassShowcase.table.columnOwner"),
      hiddenOnMobile: true,
      render: (row) => <Text as="span">{t(`glassShowcase.table.${row.ownerKey}`)}</Text>,
    },
    {
      key: "tone",
      header: t("glassShowcase.table.columnStatus"),
      align: "right",
      render: (row) => <Badge tone={row.tone}>{toneLabel(row.tone)}</Badge>,
    },
  ];

  const sidebar = (
    <Sidebar
      activeId="overview"
      onSelect={() => {}}
      sections={[
        {
          label: t("glassShowcase.sidebar.sectionLabel"),
          items: [
            { id: "overview", label: t("glassShowcase.sidebar.overview"), icon: LayoutGrid },
            { id: "reports", label: t("glassShowcase.sidebar.reports"), icon: BarChart3 },
            { id: "settings", label: t("glassShowcase.sidebar.settings"), icon: Settings },
          ],
        },
      ]}
      product={{ name: t("glassShowcase.sidebar.product"), role: t("glassShowcase.sidebar.role") }}
    />
  );

  const topbar = (
    <Topbar
      start={
        <TopbarItem asChild>
          <Text as="strong">{t("glassShowcase.topbar.brand")}</Text>
        </TopbarItem>
      }
      end={
        <Flex direction="row" gap="sm" align="center">
          <Popover>
            <PopoverTrigger asChild>
              <TopbarItem
                icon={<Bell aria-hidden="true" />}
                aria-label={t("glassShowcase.topbar.notifications")}
              />
            </PopoverTrigger>
            {/* Portal escape: re-declared here, see the file docblock. */}
            <PopoverContent data-theme-style={GLASS} align="end">
              <Flex direction="col" gap="sm">
                <Text as="strong">{t("glassShowcase.popover.title")}</Text>
                <Text as="p" size="sm" tone="muted">
                  {t("glassShowcase.popover.body")}
                </Text>
                <Button size="sm" variant="outline">
                  <CheckCircle2 aria-hidden="true" />
                  {t("glassShowcase.popover.action")}
                </Button>
              </Flex>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TopbarItem
                aria-label={t("glassShowcase.topbar.account")}
                icon={<UserRound aria-hidden="true" />}
              />
            </DropdownMenuTrigger>
            {/* Portal escape: re-declared here, see the file docblock. */}
            <DropdownMenuContent data-theme-style={GLASS} align="end">
              <DropdownMenuLabel>{t("glassShowcase.sidebar.product")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t("glassShowcase.topbar.profile")}</DropdownMenuItem>
              <DropdownMenuItem>{t("glassShowcase.topbar.billing")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut aria-hidden="true" />
                {t("glassShowcase.topbar.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Flex>
      }
    />
  );

  return (
    <div data-theme-style={GLASS}>
      <AppShell sidebar={sidebar} topbar={topbar}>
        <PageContainer title={t("glassShowcase.page.title")} subtitle={t("glassShowcase.page.subtitle")}>
          <Flex direction="col" gap="lg">
            <Alert tone="info">
              <AlertTitle>{t("glassShowcase.alert.title")}</AlertTitle>
              <AlertDescription>{t("glassShowcase.alert.description")}</AlertDescription>
            </Alert>

            <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
              <Card>
                <CardHeader>
                  <CardTitle level={2}>{t("glassShowcase.overview.title")}</CardTitle>
                  <CardDescription>{t("glassShowcase.overview.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Flex direction="col" gap="md">
                    <Flex direction="row" gap="xs" wrap>
                      <Badge tone="success">{t("glassShowcase.overview.badgeActive")}</Badge>
                      <Badge tone="info">{t("glassShowcase.overview.badgeInvited")}</Badge>
                      <Badge tone="warning">{t("glassShowcase.overview.badgePending")}</Badge>
                    </Flex>
                    <Progress value={68} label={t("glassShowcase.overview.progressLabel")} />
                    <Flex
                      direction="row"
                      gap="xs"
                      aria-label={t("glassShowcase.overview.avatarGroupLabel")}
                    >
                      <Avatar>
                        <AvatarFallback>MS</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>DC</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>PN</AvatarFallback>
                      </Avatar>
                    </Flex>
                  </Flex>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle level={2}>{t("glassShowcase.controls.title")}</CardTitle>
                  <CardDescription>{t("glassShowcase.controls.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Flex direction="col" gap="md">
                    <Segmented
                      aria-label={t("glassShowcase.controls.title")}
                      defaultValue="month"
                      options={[
                        { value: "week", label: t("glassShowcase.controls.period.week") },
                        { value: "month", label: t("glassShowcase.controls.period.month") },
                        { value: "quarter", label: t("glassShowcase.controls.period.quarter") },
                      ]}
                    />
                    <Tabs defaultValue="overview" bodied>
                      <TabsList>
                        <TabsTrigger value="overview">
                          {t("glassShowcase.controls.tabs.overview")}
                        </TabsTrigger>
                        <TabsTrigger value="activity">
                          {t("glassShowcase.controls.tabs.activity")}
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview">
                        <Text as="p" size="sm">
                          {t("glassShowcase.controls.tabs.overviewBody")}
                        </Text>
                      </TabsContent>
                      <TabsContent value="activity">
                        <Text as="p" size="sm">
                          {t("glassShowcase.controls.tabs.activityBody")}
                        </Text>
                      </TabsContent>
                    </Tabs>
                  </Flex>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle level={2}>{t("glassShowcase.form.title")}</CardTitle>
                  <CardDescription>{t("glassShowcase.form.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Flex direction="col" gap="md">
                    <FormField label={t("glassShowcase.form.nameLabel")}>
                      <Input
                        id="glass-member-name"
                        name="memberName"
                        placeholder={t("glassShowcase.form.namePlaceholder")}
                      />
                    </FormField>
                    <FormField label={t("glassShowcase.form.roleLabel")}>
                      {/* Select (open) — manual composition so `data-theme-style` can be
                          re-declared on SelectContent for the portalled popup (see docblock). */}
                      <Select value={role} onValueChange={setRole} defaultOpen>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent data-theme-style={GLASS}>
                          <SelectItem value="viewer">{t("glassShowcase.form.roleViewer")}</SelectItem>
                          <SelectItem value="editor">{t("glassShowcase.form.roleEditor")}</SelectItem>
                          <SelectItem value="admin">{t("glassShowcase.form.roleAdmin")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </Flex>
                </CardContent>
              </Card>
            </ResponsiveGrid>

            <Card>
              <CardHeader>
                <CardTitle level={2}>{t("glassShowcase.table.title")}</CardTitle>
                <CardDescription>{t("glassShowcase.table.description")}</CardDescription>
              </CardHeader>
              <CardContent flush>
                <DataTable
                  columns={columns}
                  data={REQUEST_ROWS}
                  getRowId={(row) => row.id}
                  label={t("glassShowcase.table.title")}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle level={2}>{t("glassShowcase.actions.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Flex direction="row" gap="sm" wrap align="center">
                  <Button onClick={() => setDialogOpen(true)}>
                    {t("glassShowcase.actions.openDialog")}
                  </Button>
                  <Button variant="outline" onClick={() => setSheetOpen(true)}>
                    {t("glassShowcase.actions.openSheet")}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">{t("glassShowcase.actions.tooltipTrigger")}</Button>
                    </TooltipTrigger>
                    {/* Portal escape: re-declared here, see the file docblock. */}
                    <TooltipContent data-theme-style={GLASS}>
                      {t("glassShowcase.tooltip.text")}
                    </TooltipContent>
                  </Tooltip>
                  <Button
                    variant="secondary"
                    onClick={() => toast(t("glassShowcase.toast.message"))}
                  >
                    {t("glassShowcase.actions.showToast")}
                  </Button>
                </Flex>
              </CardContent>
            </Card>
          </Flex>
        </PageContainer>
      </AppShell>

      {/* Dialog — portal escape: re-declared on DialogContent, see the file docblock. Panel
          background/border stay opaque regardless (dead end — see the gap table above). */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-theme-style={GLASS}>
          <DialogHeader>
            <DialogTitle>{t("glassShowcase.dialog.title")}</DialogTitle>
            <DialogDescription>{t("glassShowcase.dialog.description")}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Text as="p" size="sm">
              {t("glassShowcase.dialog.body")}
            </Text>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("glassShowcase.dialog.cancel")}</Button>
            </DialogClose>
            <Button onClick={() => setDialogOpen(false)}>{t("glassShowcase.dialog.confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet — same portal escape + same dead end as Dialog. */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent data-theme-style={GLASS}>
          <SheetHeader>
            <SheetTitle>{t("glassShowcase.sheet.title")}</SheetTitle>
            <SheetDescription>{t("glassShowcase.sheet.description")}</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <Text as="p" size="sm">
              {t("glassShowcase.sheet.body")}
            </Text>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">{t("glassShowcase.sheet.close")}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Toast — portal escape: re-declared on Toaster itself, see the file docblock. */}
      <Toaster data-theme-style={GLASS} />
    </div>
  );
}

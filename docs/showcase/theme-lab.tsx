/**
 * Showcase · theme-lab — CAN THIS COMPONENT SET WEAR A COMPLEX THEME? One page, every component
 * that can be rendered, several themes, several seeds, switchable, measured.
 *
 * It replaces `/showcase/glassmorphism`, which gh#882 diagnosed correctly: that page proved ONE
 * theme against a DOZEN components, and the question is neither "does glassmorphism work" nor
 * "does Card survive it". A single theme cannot answer the question, and twelve components cannot
 * either — three defects that week were found only because something happened to be on the page
 * (an opaque Tabs strip inside a glass Card, a table header that kept `--muted`, a Sidebar over
 * the wrong canvas). **Coverage is the instrument.**
 *
 * ── THE RULES THIS PAGE IS MEASURED UNDER ────────────────────────────────────────────────────
 *  1. `docs/themes/*.css` may contain NOTHING but `--custom-property` declarations. No
 *     `backdrop-filter:`, no `background:`, no selector into a `.ui-*` class.
 *  2. This page carries no `className` and no inline `style` for theming. The ONE inline style is
 *     `tenantTheme(hex).vars` on the scope — the library's own published channel for a seed, and
 *     the thing gh#882 asks to be used "rather than hand-picking".
 *  3. `ThemeScope`, never a bare wrapper. `src/styles/base.css` sets `color: hsl(var(--foreground))`
 *     on `body`, above every scope a page can make, so that `var()` substitutes against the ROOT
 *     once and every descendant inherits the RESOLVED colour. A plain `<div>` therefore retints
 *     every surface and no text — measured at 1.34:1 before gh#881. `ThemeScope` re-states `color`
 *     on itself AND on the body-level overlay host it creates, which is also what carries the
 *     theme to the portalled panels: Dialog, Sheet, Select, DropdownMenu, Popover, Tooltip and
 *     Toast all portal out of this subtree, and a custom property only inherits through the DOM.
 *     The previous page re-declared `data-theme-style` on each `*Content` by hand; that is no
 *     longer needed and its absence here is part of what this page checks.
 *  4. Where something cannot be expressed, the RESULT is written down — on the page, in the
 *     "could not be rendered" table at the bottom and the "could not be reached" notes in each
 *     theme file — never worked around.
 *
 * ── ADDRESSING, FOR THE INSTRUMENT ───────────────────────────────────────────────────────────
 * `?theme=<id>&seed=<id>` drives both switches, so `scripts/measure-glass.mjs` navigates straight
 * to a cell of the matrix instead of clicking through a Segmented whose labels are localised (the
 * preview's default locale is `vi`). Overlay triggers carry `data-probe="…"`, because the
 * instrument has had four of its own selectors wrong — `[data-slot="table"]` when the blur is on
 * `.ui-data-table-surface`, `[role="listbox"]` instead of `.ui-select-content`, `borderTopWidth`
 * alone, and a backdrop sampled inside the Sidebar — every one of them making the library look
 * worse than it was. A `data-*` hook is not styling and not a theme; it is an address.
 *
 * ── WHAT IS NOT HERE, AND WHY ────────────────────────────────────────────────────────────────
 * See `ABSENT` at the bottom of this file: it is rendered on the page as a real table, because an
 * absence nobody can see is an absence nobody accounts for. Every row is about RENDERING — a
 * provider, a hook, a shell that owns the document — never about whether a token exists.
 *
 * ── AND THE ONE THING THIS PAGE DELIBERATELY DOES NOT SAY ────────────────────────────────────
 * **No sentence here asserts that a surface is unreachable by a token.** The page it replaces
 * carried a per-component gap table, and that table rotted twice — most recently inside the Sheet
 * itself, whose body text read "sheet.tsx bakes `bg-background` into its className, there is no
 * `--sheet-background` to set" while the panel it was printed on rendered `rgba(29, 33, 53, 0.92)`
 * through the `--sheet-surface-background` gh#880 had added hours earlier. A reachability claim is
 * true on the day it is written, false the day someone adds a knob, and worst of all in a page
 * whose entire claim is to be a measurement.
 *
 * A derived table was considered and rejected, and the reason is small but decisive: the only
 * honest source is `agent/tokens.json`, `docs/**` may not import it (`check:example-imports`
 * allows relative `.ts` data modules and committed assets, not a JSON reach outside the tree), and
 * a generated snapshot committed beside the page is the same rot with an extra step. So the prose
 * here is limited to what the theme files DEMONSTRATE by setting a token, and the authority on
 * reachability is `scripts/measure-glass.mjs`, which reads the computed value of every surface and
 * every opened overlay across the whole theme × seed matrix. Run it; do not trust a paragraph.
 */
import * as React from "react";
import {
  Activity as ActivityIcon,
  BarChart3,
  Bell,
  Bot,
  Building2,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  LayoutGrid,
  LogOut,
  Palette,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Shield,
  Smartphone,
  Users,
} from "lucide-react";

import { ThemeScope, tenantTheme, useOptionalAppContext } from "@godxjp/ui/app";
import { AreaChart, BarChart, LineChart, PieChart } from "@godxjp/ui/charts";
import { CompactBarTrend } from "@godxjp/ui/charts/compact-bar-trend";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardAction,
  CardBar,
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
  ChatBubbleList,
  CodeBlock,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CredentialReveal,
  DataTable,
  Descriptions,
  EmptyState,
  FeatureList,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Legend,
  ListRow,
  Marquee,
  PermissionMatrix,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Progress,
  Prose,
  QrCode,
  RangeTimeline,
  ScrollArea,
  ServiceCatalogCta,
  ServiceLauncherCard,
  StatCard,
  StatusBadge,
  Swatch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ThoughtChain,
  Thumbnail,
  Timeline,
  TimelineGrid,
  Tree,
  Welcome,
  type ChatMessageProp,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import {
  Attachments,
  Calendar,
  Cascader,
  ChatComposer,
  ChatSuggestion,
  Checkbox,
  CheckboxGroup,
  ColorPicker,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
  DatePicker,
  BranchScopePicker,
  Field,
  Form,
  FormErrors,
  FormField,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Label,
  NumberInput,
  PasswordInput,
  PasswordStrength,
  Radio,
  RadioGroup,
  Rating,
  SearchInput,
  Segmented,
  Select,
  Slider,
  Switch,
  TagInput,
  Textarea,
  TimePicker,
  TimeRangePicker,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Transfer,
  TreeSelect,
  Upload,
  type UploadFileItem,
} from "@godxjp/ui/data-entry";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertDialog,
  AlertTitle,
  Banner,
  Callout,
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
  Skeleton,
  SkeletonArticle,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonForm,
  SkeletonImage,
  SkeletonInput,
  SkeletonNode,
  SkeletonRows,
  SkeletonTable,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TwoFactorSetup,
  toast,
} from "@godxjp/ui/feedback";
import {
  Actions,
  ActionsCopy,
  ActionsFeedback,
  Activity,
  Button,
  FloatButton,
  Heading,
  Icon,
  Link,
  Logo,
  Paragraph,
  Reveal,
  Text,
  Title,
  Typography,
  VisuallyHidden,
} from "@godxjp/ui/general";
import {
  AccountChip,
  Affix,
  AppLauncher,
  AppShell,
  AspectRatio,
  AuthAccountSummary,
  AuthDivider,
  AuthFooter,
  AuthIdentity,
  AuthStack,
  Breadcrumb,
  DraggablePanel,
  ErrorSurface,
  Flex,
  Masonry,
  MasterDetail,
  NavList,
  OrgSwitcher,
  PageContainer,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ResponsiveGrid,
  Separator,
  ServiceRolePanel,
  Sidebar,
  SplitPane,
  Topbar,
  TopbarItem,
} from "@godxjp/ui/layout";
import {
  Anchor,
  AppSettingPicker,
  AppSettingToggle,
  Conversations,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FilterBar,
  MegaMenu,
  Pagination,
  Steps,
  Tabs,
  Toolbar,
  ToolbarGroup,
} from "@godxjp/ui/navigation";
import { useTranslation } from "@godxjp/ui/i18n";

import shotLandscape from "../assets/shot-landscape.svg";
import {
  MODES,
  SEEDS,
  THEMES,
  modeFromQuery,
  seedFromQuery,
  themeFromQuery,
  themeQueryValue,
  type ModeRow,
  type SeedRow,
  type ThemeRow,
} from "../themes";

/* ── The components that CANNOT appear here, and the reason for each ─────────────────────────
 * Rendered on the page as a table. An absence nobody can see is an absence nobody accounts for,
 * and gh#882 asks for the reason in the page itself, not in a commit message. */
const ABSENT: ReadonlyArray<{ name: string; reasonKey: string }> = [
  { name: "AppProvider", reasonKey: "themeLab.absent.provider" },
  { name: "OverlayPortalProvider", reasonKey: "themeLab.absent.overlayPortal" },
  { name: "ThemeScope", reasonKey: "themeLab.absent.themeScope" },
  { name: "AuthShell", reasonKey: "themeLab.absent.ownsPage" },
  { name: "CenteredShell", reasonKey: "themeLab.absent.ownsPage" },
  { name: "MobileShell", reasonKey: "themeLab.absent.ownsPage" },
  { name: "LegalDocumentShell", reasonKey: "themeLab.absent.ownsPage" },
  { name: "useZodForm", reasonKey: "themeLab.absent.needsSchema" },
  { name: "FormRoot", reasonKey: "themeLab.absent.needsSchema" },
  { name: "FormFieldControl", reasonKey: "themeLab.absent.needsSchema" },
  { name: "FormFieldArray", reasonKey: "themeLab.absent.needsSchema" },
  { name: "AlertDialogRoot", reasonKey: "themeLab.absent.sameSurface" },
  { name: "useFormAdapter", reasonKey: "themeLab.absent.hook" },
  { name: "useCarousel", reasonKey: "themeLab.absent.hook" },
  { name: "usePasswordStrength", reasonKey: "themeLab.absent.hook" },
  { name: "useUploadDraft", reasonKey: "themeLab.absent.hook" },
  { name: "formatDate", reasonKey: "themeLab.absent.function" },
  { name: "flexRender", reasonKey: "themeLab.absent.function" },
  { name: "buttonVariants", reasonKey: "themeLab.absent.function" },
  { name: "collectUploadCommitActions", reasonKey: "themeLab.absent.function" },
  { name: "createSidebarLink", reasonKey: "themeLab.absent.function" },
  { name: "inertiaUpload", reasonKey: "themeLab.absent.inertia" },
  { name: "UploadCropDialog", reasonKey: "themeLab.absent.needsFile" },
  { name: "AvatarImage", reasonKey: "themeLab.absent.needsNetwork" },
  { name: "PrefetchLink", reasonKey: "themeLab.absent.needsRouter" },
  { name: "DataState", reasonKey: "themeLab.absent.needsQuery" },
  { name: "InfiniteQueryState", reasonKey: "themeLab.absent.needsQuery" },
  { name: "AlertQueryError", reasonKey: "themeLab.absent.needsQuery" },
  { name: "ButtonRefetch", reasonKey: "themeLab.absent.needsQuery" },
  { name: "VisuallyHidden", reasonKey: "themeLab.absent.invisible" },
];

const UNBREAKABLE = "Betriebsstaettengewinnabgrenzungsaufzeichnungsverordnung-2026-A";

type Row = {
  id: string;
  nameKey: string;
  ownerKey: string;
  tone: "success" | "warning" | "destructive";
};

const ROWS: Row[] = [
  { id: "r1", nameKey: "alpha", ownerKey: "one", tone: "success" },
  { id: "r2", nameKey: "beta", ownerKey: "two", tone: "warning" },
  { id: "r3", nameKey: "gamma", ownerKey: "three", tone: "destructive" },
];

const TREND = [
  { date: "2026-09-16", count: 4 },
  { date: "2026-09-17", count: 9 },
  { date: "2026-09-18", count: 6 },
  { date: "2026-09-19", count: 12 },
  { date: "2026-09-20", count: 8 },
  { date: "2026-09-21", count: 15 },
  { date: "2026-09-22", count: 11 },
];

const SERIES = [
  { month: "2026-04", plan: 120, actual: 98 },
  { month: "2026-05", plan: 130, actual: 141 },
  { month: "2026-06", plan: 128, actual: 119 },
  { month: "2026-07", plan: 150, actual: 162 },
];

/** A titled block. Local composition, not a component: it owns no behaviour a Card does not. */
function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle level={2}>{title}</CardTitle>
        {note ? <CardDescription>{note}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <Flex direction="col" gap="lg">
          {children}
        </Flex>
      </CardContent>
    </Card>
  );
}

/** A labelled row of specimens. */
function Row2({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Flex direction="col" gap="xs">
      <Text size="xs" tone="muted">
        {label}
      </Text>
      <Flex direction="row" gap="sm" wrap align="center">
        {children}
      </Flex>
    </Flex>
  );
}

export default function ThemeLabShowcase() {
  const { t } = useTranslation();

  const initial = React.useMemo(() => {
    const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
    return {
      theme: themeFromQuery(params.get("theme")),
      seed: seedFromQuery(params.get("seed")),
      mode: modeFromQuery(params.get("mode")),
    };
  }, []);

  // The bounded scroller Affix and Anchor pin against — see the note at their call site.
  const affixScrollerRef = React.useRef<HTMLDivElement>(null);
  const [theme, setTheme] = React.useState<ThemeRow>(initial.theme);
  const [seed, setSeed] = React.useState<SeedRow>(initial.seed);
  const [mode, setMode] = React.useState<ModeRow>(initial.mode);

  /*
   * The URL is the page's own state, so a measurement or a screenshot can address one cell of the
   * matrix directly. `replaceState` rather than `pushState`: flipping a switch is not navigation,
   * and a back button that walks a colour history is the kind of cleverness nobody asked for.
   */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("theme", themeQueryValue(theme));
    params.set("seed", seed.id);
    params.set("mode", mode.id);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [theme, seed, mode]);

  /*
   * Polarity, applied THE WAY THE LIBRARY ITSELF APPLIES IT: through `AppProvider`'s own `theme`
   * axis (`src/app/theme-axes.ts`'s `applyThemeAxes`, which is what `AppProvider` calls on
   * `<html data-theme>`), never by writing `document.documentElement` from this page. Writing it
   * here directly would race `AppProvider`'s own mount effect and lose: React commits a
   * descendant's effects before its ancestor's, so a direct write on mount would be overwritten a
   * moment later by `AppProvider`'s own effect re-asserting ITS state. Going through
   * `ctx.setTheme` — the exact setter `AppSettingToggle kind="theme"` already uses above — sets
   * `AppProvider`'s OWN state, so its effect re-fires FROM that state and there is nothing to race.
   *
   * `ctx` is read via a ref kept fresh every render, and the effect depends only on `mode.id`, so
   * this does not re-fire every time some OTHER axis (locale, density, …) changes the context's
   * identity — only when this switch changes. The cleanup restores whatever the axis was
   * immediately before this effect's own change, so leaving the page (or flipping the switch back)
   * does not leak a forced polarity into the rest of the showcase.
   */
  const appContext = useOptionalAppContext();
  const appContextRef = React.useRef(appContext);
  appContextRef.current = appContext;
  React.useEffect(() => {
    const ctx = appContextRef.current;
    if (!ctx) return;
    const previous = ctx.theme;
    ctx.setTheme(mode.id);
    return () => {
      ctx.setTheme(previous);
    };
  }, [mode.id]);

  /* The seed is walked against THIS THEME's surface for THIS POLARITY, not the package's (see
   * `inkSurface`). A theme declares its own `--text-link`, but `tenantTheme` returns the brand
   * inks as literals in `style`, and an inline literal outranks any selector — so the theme's
   * declaration is only reachable if the value handed to it was computed on the right ground. */
  const brand = React.useMemo(
    () => tenantTheme(seed.hex, { surface: theme.inkSurface[mode.id] }),
    [seed.hex, theme.inkSurface, mode.id],
  );

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [twoFactorOpen, setTwoFactorOpen] = React.useState(false);
  const [role, setRole] = React.useState("viewer");
  const [checked, setChecked] = React.useState(true);
  const [switched, setSwitched] = React.useState(true);
  const [volume, setVolume] = React.useState(64);
  const [colour, setColour] = React.useState("#2563EB");
  const [tags, setTags] = React.useState<string[]>(["a11y", "rtl"]);
  const [password, setPassword] = React.useState("Glass-2026!");
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [step] = React.useState(1);
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 8, 23));
  const [time, setTime] = React.useState("09:30");
  const [uploads, setUploads] = React.useState<UploadFileItem[]>([]);
  const [draft, setDraft] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [conversation, setConversation] = React.useState("c1");
  const [route, setRoute] = React.useState("products");
  const [org, setOrg] = React.useState("dxs");
  const [panelPosition, setPanelPosition] = React.useState({ x: 0, y: 0 });
  const [treeChecked, setTreeChecked] = React.useState<string[]>(["billing.read"]);
  const [transferred, setTransferred] = React.useState<string[]>(["1010"]);
  const [cascade, setCascade] = React.useState<string[]>([]);
  const [account, setAccount] = React.useState<string | undefined>(undefined);
  const [selectedRole, setSelectedRole] = React.useState("admin");
  const [scope, setScope] = React.useState<{
    mode: "all" | "selected";
    branchIds?: readonly string[];
  }>({ mode: "selected", branchIds: ["b1"] });

  const toneLabel = React.useCallback((tone: Row["tone"]) => t(`themeLab.tone.${tone}`), [t]);

  const columns: ColumnDef<Row>[] = [
    {
      key: "nameKey",
      header: t("themeLab.table.name"),
      render: (row) => <Text as="span">{t(`themeLab.sample.${row.nameKey}`)}</Text>,
    },
    {
      key: "ownerKey",
      header: t("themeLab.table.owner"),
      hiddenOnMobile: true,
      render: (row) => <Text as="span">{t(`themeLab.sample.${row.ownerKey}`)}</Text>,
    },
    {
      key: "tone",
      header: t("themeLab.table.status"),
      align: "right",
      render: (row) => <Badge tone={row.tone}>{toneLabel(row.tone)}</Badge>,
    },
  ];

  const chat: ChatMessageProp[] = [
    { id: "m1", role: "assistant", content: t("themeLab.chat.assistant") },
    { id: "m2", role: "user", content: t("themeLab.chat.user") },
  ];

  const sidebar = (
    <Sidebar
      activeId="overview"
      onSelect={() => {}}
      sections={[
        {
          label: t("themeLab.nav.section"),
          items: [
            { id: "overview", label: t("themeLab.nav.overview"), icon: LayoutGrid },
            { id: "reports", label: t("themeLab.nav.reports"), icon: BarChart3 },
            { id: "people", label: t("themeLab.nav.people"), icon: Users },
            { id: "settings", label: t("themeLab.nav.settings"), icon: Settings },
          ],
        },
      ]}
      product={{ name: t("themeLab.product"), role: t("themeLab.nav.role") }}
      footer={
        <Text size="xs" tone="muted">
          {t("themeLab.nav.footer")}
        </Text>
      }
    />
  );

  const topbar = (
    <Topbar
      start={
        <>
          {/* `Logo`, not `TopbarItem asChild` + `Text`: `Text` does not forward a ref to a DOM
              node, and the bar's `Focusable` wrapper warned about exactly that at runtime. The
              brand cell is a lockup, not a control, so `Logo` is also the right component. */}
          <Logo glyph="g" wordmark={t("themeLab.product")} />
          <AppLauncher
            apps={[
              {
                id: "console",
                name: t("themeLab.app.console"),
                href: "#console",
                icon: <BarChart3 aria-hidden="true" />,
                current: true,
              },
              {
                id: "billing",
                name: t("themeLab.app.billing"),
                href: "#billing",
                icon: <CreditCard aria-hidden="true" />,
              },
            ]}
            labels={{
              trigger: t("themeLab.launcher.trigger"),
              title: t("themeLab.launcher.title"),
              empty: t("themeLab.label.noResults"),
              loading: t("themeLab.label.loading"),
            }}
          />
        </>
      }
      end={
        <Flex direction="row" gap="sm" align="center">
          <AppSettingPicker kind="locale" appearance="bar" />
          <AppSettingToggle kind="theme" />
          <Popover>
            <PopoverTrigger asChild>
              <TopbarItem
                data-probe="popover"
                icon={<Bell aria-hidden="true" />}
                aria-label={t("themeLab.topbar.notifications")}
              />
            </PopoverTrigger>
            <PopoverContent align="end">
              <PopoverHeader>
                <PopoverTitle>{t("themeLab.popover.title")}</PopoverTitle>
                <PopoverDescription>{t("themeLab.popover.body")}</PopoverDescription>
              </PopoverHeader>
              <Button size="sm" variant="outline">
                <Check aria-hidden="true" />
                {t("themeLab.popover.action")}
              </Button>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TopbarItem
                data-probe="dropdown"
                aria-label={t("themeLab.topbar.account")}
                icon={
                  <Avatar>
                    <AvatarFallback>DP</AvatarFallback>
                  </Avatar>
                }
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("themeLab.product")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t("themeLab.menu.profile")}</DropdownMenuItem>
              <DropdownMenuItem>{t("themeLab.menu.billing")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut aria-hidden="true" />
                {t("themeLab.menu.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Flex>
      }
    />
  );

  return (
    /*
     * The attribute is ALWAYS written, "base" included. `docs/themes/` has no `base.css`, so
     * `[data-theme-style="base"]` matches no rule and the region keeps the library's own theme —
     * but the scope stays ADDRESSABLE, and that is not cosmetic: `measure-glass.mjs` scopes its
     * contrast walk to `[data-theme-style]`, and with the attribute omitted the default theme
     * measured 22 strings instead of 530 while reporting a clean sweep.
     */
    <ThemeScope data-theme-style={themeQueryValue(theme)} style={brand.vars}>
      <AppShell sidebar={sidebar} topbar={topbar}>
        <PageContainer
          title={t("themeLab.page.title")}
          subtitle={t("themeLab.page.subtitle")}
          breadcrumb={[
            { label: t("themeLab.nav.overview"), to: "#overview" },
            { label: t("themeLab.page.title") },
          ]}
          extra={
            <AccountChip
              name={t("themeLab.sample.one")}
              email="duong@example.test"
              actionLabel={t("themeLab.menu.logout")}
              onAction={() => {}}
            />
          }
        >
          <Flex direction="col" gap="lg">
            {/* ── 1 · the switches themselves ───────────────────────────────────────────── */}
            <Card accent="primary">
              <CardHeader>
                <CardTitle level={2}>{t("themeLab.switch.title")}</CardTitle>
                <CardDescription>{t("themeLab.switch.note")}</CardDescription>
                <CardAction>
                  <Legend
                    items={[
                      { tone: "success", label: t("themeLab.switch.legendPass") },
                      { tone: "destructive", label: t("themeLab.switch.legendFail") },
                    ]}
                  />
                </CardAction>
              </CardHeader>
              <CardContent>
                <Flex direction="col" gap="md">
                  <Field id="theme-switch" label={t("themeLab.switch.themeLabel")}>
                    <Segmented
                      id="theme-switch"
                      aria-label={t("themeLab.switch.themeLabel")}
                      value={themeQueryValue(theme)}
                      onValueChange={(next) => setTheme(themeFromQuery(next))}
                      options={THEMES.map((row) => ({
                        value: themeQueryValue(row),
                        label: t(row.nameKey),
                      }))}
                    />
                  </Field>
                  <Text size="sm" tone="muted">
                    {t(theme.noteKey)}
                  </Text>
                  <Field id="seed-switch" label={t("themeLab.switch.seedLabel")}>
                    <Segmented
                      id="seed-switch"
                      aria-label={t("themeLab.switch.seedLabel")}
                      value={seed.id}
                      onValueChange={(next) => setSeed(seedFromQuery(next))}
                      options={SEEDS.map((row) => ({
                        value: row.id,
                        label: t(row.nameKey),
                      }))}
                    />
                  </Field>
                  <Field id="mode-switch" label={t("themeLab.switch.modeLabel")}>
                    <Segmented
                      id="mode-switch"
                      aria-label={t("themeLab.switch.modeLabel")}
                      value={mode.id}
                      onValueChange={(next) => setMode(modeFromQuery(next))}
                      options={MODES.map((row) => ({
                        value: row.id,
                        label: t(row.nameKey),
                      }))}
                    />
                  </Field>
                  <Flex direction="row" gap="sm" wrap align="center">
                    {SEEDS.map((row) => (
                      <Swatch
                        key={row.id}
                        color={row.hex}
                        aria-label={`${t(row.nameKey)} ${row.hex}`}
                      />
                    ))}
                  </Flex>
                  <Descriptions columns={2}>
                    <Descriptions.Item label={t("themeLab.switch.seedHex")} mono>
                      {brand.primary ?? "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("themeLab.switch.seedInk")} mono>
                      {brand.foreground ?? "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("themeLab.switch.seedContrast")} span={2}>
                      <Badge tone={brand.meetsAA ? "success" : "destructive"}>
                        {brand.contrast.toFixed(2)}:1
                      </Badge>
                    </Descriptions.Item>
                  </Descriptions>
                </Flex>
              </CardContent>
            </Card>

            {/* ── 2 · type ─────────────────────────────────────────────────────────────── */}
            <Section
              id="type"
              title={t("themeLab.section.type")}
              note={t("themeLab.section.typeNote")}
            >
              <Flex direction="col" gap="sm">
                <Heading level={3}>{t("themeLab.sample.headline")}</Heading>
                <Title level={4}>{t("themeLab.sample.alpha")}</Title>
                <Paragraph>{t("themeLab.sample.long")}</Paragraph>
                <Text size="sm" tone="muted">
                  {t("themeLab.sample.short")}
                </Text>
                <Text size="xs" mono tone="muted">
                  {UNBREAKABLE}
                </Text>
                <Text weight="medium" tabular>
                  {new Intl.NumberFormat(undefined, { notation: "standard" }).format(1240000)}
                </Text>
                <Link href="#type">{t("themeLab.sample.linkLabel")}</Link>
                <Typography>
                  <Typography.Title level={5}>{t("themeLab.sample.beta")}</Typography.Title>
                  <Typography.Paragraph>{t("themeLab.sample.short")}</Typography.Paragraph>
                </Typography>
                <Prose size="sm">
                  <Typography.Paragraph>{t("themeLab.sample.long")}</Typography.Paragraph>
                </Prose>
                <CodeBlock size="xs" maxHeight="sm" aria-label={t("themeLab.sample.codeLabel")}>
                  {`[data-theme-style="flat"] {\n  --card-radius: 0;\n}`}
                </CodeBlock>
                <Flex direction="row" gap="sm" align="center" wrap>
                  <Logo glyph="g" wordmark={t("themeLab.product")} />
                  <Icon as={Shield} size="md" tone="success" label={t("themeLab.sample.secure")} />
                  <Icon as={Clock} size="sm" tone="muted" />
                  <Activity label={t("themeLab.sample.syncing")} />
                  <Activity variant="bar" tone="info" label={t("themeLab.sample.syncing")} />
                </Flex>
                <Separator label={t("themeLab.sample.short")} labelAlign="start" />
                <Marquee fade pauseOnHover label={t("themeLab.sample.marqueeLabel")}>
                  {["alpha", "beta", "gamma", "delta", "epsilon"].map((key) => (
                    <Text key={key} size="sm" tone="muted">
                      {t(`themeLab.sample.${key}`)}
                    </Text>
                  ))}
                </Marquee>
                <AspectRatio ratio={16 / 5}>
                  <EmptyState
                    title={t("themeLab.sample.aspectTitle")}
                    description={t("themeLab.sample.short")}
                  />
                </AspectRatio>
                <VisuallyHidden>{t("themeLab.sample.short")}</VisuallyHidden>
              </Flex>
            </Section>

            {/* ── 3 · actions ──────────────────────────────────────────────────────────── */}
            <Section id="actions" title={t("themeLab.section.actions")}>
              <Row2 label={t("themeLab.label.variants")}>
                <Button>{t("themeLab.action.save")}</Button>
                <Button variant="secondary">{t("themeLab.action.secondary")}</Button>
                <Button variant="outline">{t("themeLab.action.outline")}</Button>
                <Button variant="ghost">{t("themeLab.action.ghost")}</Button>
                <Button variant="dashed">{t("themeLab.action.dashed")}</Button>
                <Button variant="destructive">{t("themeLab.action.destructive")}</Button>
                <Button variant="link">{t("themeLab.action.link")}</Button>
                <Button disabled>{t("themeLab.action.disabled")}</Button>
              </Row2>
              <Row2 label={t("themeLab.label.sizes")}>
                <Button size="xs">xs</Button>
                <Button size="sm">sm</Button>
                <Button size="md">md</Button>
                <Button size="lg">lg</Button>
                <Button size="icon" aria-label={t("themeLab.action.search")}>
                  <Search aria-hidden="true" />
                </Button>
              </Row2>
              <Row2 label={t("themeLab.label.toggles")}>
                <Toggle aria-label={t("themeLab.action.bold")}>B</Toggle>
                <Toggle
                  variant="soft"
                  shape="pill"
                  count={12}
                  countLabel={t("themeLab.label.items")}
                >
                  {t("themeLab.action.unread")}
                </Toggle>
                <ToggleGroup
                  type="single"
                  defaultValue="left"
                  aria-label={t("themeLab.label.align")}
                >
                  <ToggleGroupItem value="left">{t("themeLab.align.start")}</ToggleGroupItem>
                  <ToggleGroupItem value="center">{t("themeLab.align.center")}</ToggleGroupItem>
                  <ToggleGroupItem value="right">{t("themeLab.align.end")}</ToggleGroupItem>
                </ToggleGroup>
                <Rating name="score" aria-label={t("themeLab.label.rating")} defaultValue={4} />
              </Row2>
              <Row2 label={t("themeLab.label.actionsBar")}>
                <Actions
                  label={t("themeLab.label.actionsBar")}
                  items={[
                    { key: "retry", label: t("themeLab.action.retry"), icon: <RefreshCw /> },
                    {
                      key: "more",
                      label: t("themeLab.action.more"),
                      subItems: [
                        { key: "share", label: t("themeLab.action.share"), icon: <Share2 /> },
                      ],
                    },
                    { key: "copy", actionRender: <ActionsCopy text={UNBREAKABLE} /> },
                    { key: "feedback", actionRender: <ActionsFeedback /> },
                  ]}
                />
              </Row2>
            </Section>

            {/* ── 4 · status and data display ──────────────────────────────────────────── */}
            <Section id="display" title={t("themeLab.section.display")}>
              <Row2 label={t("themeLab.label.badges")}>
                <Badge>{t("themeLab.tone.neutral")}</Badge>
                <Badge tone="success">{t("themeLab.tone.success")}</Badge>
                <Badge tone="warning">{t("themeLab.tone.warning")}</Badge>
                <Badge tone="destructive">{t("themeLab.tone.destructive")}</Badge>
                <Badge tone="info">{t("themeLab.tone.info")}</Badge>
                <Badge variant="secondary">{t("themeLab.tone.neutral")}</Badge>
                <StatusBadge status="active">{t("themeLab.tone.success")}</StatusBadge>
                <Swatch color={seed.hex} aria-label={t(seed.nameKey)} />
              </Row2>
              <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>
                <StatCard
                  label={t("themeLab.stat.members")}
                  value="12,450"
                  hint={t("themeLab.stat.hint")}
                />
                <StatCard label={t("themeLab.stat.revenue")} value="8.2M" delta="+12%" />
                <StatCard label={t("themeLab.stat.usage")} value="68.4%" />
                <StatCard label={t("themeLab.stat.open")} value="3" />
              </ResponsiveGrid>
              <Flex direction="col" gap="sm">
                <Progress value={68} label={t("themeLab.label.progress")} />
                <Progress value={92} tone="warning" label={t("themeLab.label.progress")} />
                <Flex direction="row" gap="xs" aria-label={t("themeLab.label.people")}>
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
              <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
                <Card>
                  <CardBar border="block-end">{t("themeLab.label.tools")}</CardBar>
                  <CardContent flush>
                    <ListRow
                      leading={<Smartphone aria-hidden="true" />}
                      title={t("themeLab.sample.alpha")}
                      description={t("themeLab.sample.short")}
                      trailing={<Badge tone="success">{t("themeLab.tone.success")}</Badge>}
                    />
                    <ListRow
                      unread
                      overflow="wrap"
                      title={t("themeLab.sample.long")}
                      description={t("themeLab.sample.short")}
                      trailing={
                        <Button size="xs" variant="ghost">
                          {t("themeLab.action.more")}
                        </Button>
                      }
                    />
                  </CardContent>
                  <CardFooter>
                    <Text size="xs" tone="muted">
                      {t("themeLab.sample.short")}
                    </Text>
                  </CardFooter>
                </Card>
                <Flex direction="col" gap="md">
                  <FeatureList
                    items={[
                      { state: "included", label: "SSO", description: t("themeLab.sample.short") },
                      { state: "limited", label: "API", description: t("themeLab.sample.short") },
                      { state: "excluded", label: t("themeLab.sample.gamma") },
                    ]}
                  />
                  <Descriptions columns={2}>
                    <Descriptions.Item label={t("themeLab.table.name")} mono>
                      {UNBREAKABLE}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("themeLab.table.owner")}>
                      {t("themeLab.sample.one")}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("themeLab.table.status")} span={2}>
                      {t("themeLab.sample.long")}
                    </Descriptions.Item>
                  </Descriptions>
                </Flex>
              </ResponsiveGrid>
              <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
                <Timeline
                  items={[
                    { title: t("themeLab.sample.alpha"), time: "2026-09-21 10:00" },
                    { title: t("themeLab.sample.beta"), time: "2026-09-22 14:00" },
                    { title: t("themeLab.sample.gamma"), current: true },
                  ]}
                />
                <RangeTimeline
                  label={t("themeLab.label.schedule")}
                  columns={[{ label: t("themeLab.label.week"), units: 7 }]}
                  rows={[
                    {
                      id: "task",
                      label: t("themeLab.sample.alpha"),
                      start: 0,
                      end: 4,
                      startLabel: t("themeLab.label.start"),
                      endLabel: t("themeLab.label.end"),
                    },
                  ]}
                />
              </ResponsiveGrid>
              <TimelineGrid
                label={t("themeLab.label.schedule")}
                start="08:00"
                end="20:00"
                interval={2}
                now="14:35"
                columns={[
                  { id: "d1", label: t("themeLab.sample.alpha") },
                  { id: "d2", label: t("themeLab.sample.beta"), current: true },
                ]}
                events={[
                  {
                    id: "e1",
                    columnId: "d2",
                    start: "09:00",
                    end: "17:30",
                    title: t("themeLab.sample.gamma"),
                    description: t("themeLab.sample.one"),
                  },
                ]}
              />
              <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
                <Accordion type="single" collapsible>
                  <AccordionItem value="a">
                    <AccordionTrigger>{t("themeLab.sample.alpha")}</AccordionTrigger>
                    <AccordionContent>{t("themeLab.sample.long")}</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="b">
                    <AccordionTrigger>{t("themeLab.sample.beta")}</AccordionTrigger>
                    <AccordionContent>{t("themeLab.sample.short")}</AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Flex direction="col" gap="sm" align="start">
                  <Collapsible>
                    <Flex direction="col" align="start" gap="sm">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronDown aria-hidden="true" />
                          {t("themeLab.action.more")}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <Text size="sm">{t("themeLab.sample.long")}</Text>
                      </CollapsibleContent>
                    </Flex>
                  </Collapsible>
                  {/* No `asChild`. HoverCardTrigger is a react-aria `Focusable`, and a `Button`
                      handed to it through `asChild` warned "<Focusable> child must forward its ref
                      to a DOM element" on every render. The catalogue's own example is a bare
                      trigger, and that is what this uses. */}
                  <HoverCard>
                    <HoverCardTrigger>{t("themeLab.sample.one")}</HoverCardTrigger>
                    <HoverCardContent>{t("themeLab.sample.short")}</HoverCardContent>
                  </HoverCard>
                </Flex>
              </ResponsiveGrid>
              <Card>
                <CardContent flush>
                  <ScrollArea>
                    <Flex direction="col" gap="sm">
                      {["alpha", "beta", "gamma", "delta", "epsilon"].map((key) => (
                        <Text key={key} size="sm">
                          {t(`themeLab.sample.${key}`)}
                        </Text>
                      ))}
                    </Flex>
                  </ScrollArea>
                </CardContent>
              </Card>
              <Tree
                aria-label={t("themeLab.label.permissions")}
                treeData={[
                  {
                    value: "billing",
                    label: t("themeLab.sample.alpha"),
                    children: [
                      { value: "billing.read", label: t("themeLab.sample.beta") },
                      { value: "billing.write", label: t("themeLab.sample.gamma") },
                    ],
                  },
                ]}
                checkable
                defaultExpandAll
                checkedValues={treeChecked}
                onCheckedValuesChange={setTreeChecked}
              />
              <Carousel opts={{ loop: true }}>
                <CarouselContent>
                  {["alpha", "beta", "gamma"].map((key) => (
                    <CarouselItem key={key}>
                      <Card>
                        <CardContent>
                          <Text>{t(`themeLab.sample.${key}`)}</Text>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
                <CarouselDots />
              </Carousel>
              <Masonry
                columns={{ base: 1, sm: 2, lg: 3 }}
                gap="md"
                items={["alpha", "beta", "gamma", "delta"].map((key) => ({ key, data: key }))}
                itemRender={({ data }) => (
                  <Card>
                    <CardContent>
                      <Text>{t(`themeLab.sample.${data}`)}</Text>
                    </CardContent>
                  </Card>
                )}
              />
              <Flex direction="row" gap="md" wrap align="start">
                <QrCode
                  value="https://example.test/enrol"
                  label={t("themeLab.label.qr")}
                  size="md"
                />
                <Thumbnail
                  src={shotLandscape}
                  width={960}
                  height={540}
                  alt={t("themeLab.label.thumbnail")}
                  size="lg"
                />
                <CredentialReveal
                  label={t("themeLab.label.credential")}
                  secret="gxp_live_8Fh2kQ9wR7nZ1xV4bT6mL0cD"
                  defaultRevealed
                />
              </Flex>
            </Section>

            {/* ── 5 · tables ───────────────────────────────────────────────────────────── */}
            <Section id="tables" title={t("themeLab.section.tables")}>
              <Card>
                <CardContent flush>
                  <DataTable
                    columns={columns}
                    data={ROWS}
                    getRowId={(row) => row.id}
                    label={t("themeLab.section.tables")}
                  />
                </CardContent>
              </Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("themeLab.table.name")}</TableHead>
                    <TableHead numeric>{t("themeLab.table.amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{t("themeLab.sample.alpha")}</TableCell>
                    <TableCell numeric>1,200</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t("themeLab.sample.beta")}</TableCell>
                    <TableCell numeric>860</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Card>
                <CardContent flush>
                  <PermissionMatrix
                    roles={[
                      { id: "admin", name: t("themeLab.role.admin") },
                      { id: "viewer", name: t("themeLab.role.viewer") },
                    ]}
                    permissions={[
                      { id: "read", name: t("themeLab.perm.read") },
                      { id: "write", name: t("themeLab.perm.write") },
                    ]}
                    grants={new Set(["admin:read", "admin:write", "viewer:read"])}
                    readOnly
                  />
                </CardContent>
              </Card>
              <SkeletonTable rows={3} columns={4} />
              <SkeletonRows rows={2} columns={3} />
            </Section>

            {/* ── 6 · charts ───────────────────────────────────────────────────────────── */}
            <Section id="charts" title={t("themeLab.section.charts")}>
              <ResponsiveGrid columns={{ sm: 1, lg: 2 }}>
                <LineChart
                  label={t("themeLab.chart.trend")}
                  data={SERIES}
                  categoryKey="month"
                  series={[
                    { dataKey: "plan", label: t("themeLab.chart.plan") },
                    { dataKey: "actual", label: t("themeLab.chart.actual") },
                  ]}
                />
                <BarChart
                  label={t("themeLab.chart.byMonth")}
                  data={SERIES}
                  categoryKey="month"
                  series={[{ dataKey: "actual", label: t("themeLab.chart.actual") }]}
                />
                <AreaChart
                  label={t("themeLab.chart.stacked")}
                  data={SERIES}
                  categoryKey="month"
                  series={[
                    { dataKey: "plan", label: t("themeLab.chart.plan") },
                    { dataKey: "actual", label: t("themeLab.chart.actual") },
                  ]}
                  stacked
                />
                <PieChart
                  label={t("themeLab.chart.split")}
                  data={[
                    { category: t("themeLab.sample.alpha"), amount: 42 },
                    { category: t("themeLab.sample.beta"), amount: 31 },
                    { category: t("themeLab.sample.gamma"), amount: 27 },
                  ]}
                  dataKey="amount"
                  nameKey="category"
                  donut
                />
              </ResponsiveGrid>
              <CompactBarTrend
                label={t("themeLab.chart.weekly")}
                description={t("themeLab.sample.short")}
                data={TREND}
                categoryKey="date"
                valueKey="count"
                size="xs"
              />
            </Section>

            {/* ── 7 · form controls ────────────────────────────────────────────────────── */}
            <Section
              id="fields"
              title={t("themeLab.section.fields")}
              note={t("themeLab.section.fieldsNote")}
            >
              <Form
                layout="vertical"
                columns={2}
                /* A server error map, so `FormErrors` has something to summarise: with none it
                   renders nothing at all, which on a coverage page reads as a missing component
                   rather than as an empty state. */
                errors={{ email: t("themeLab.field.emailError") }}
              >
                <FormErrors />
                <FormField
                  id="f-name"
                  label={t("themeLab.field.name")}
                  required
                  helper={t("themeLab.sample.short")}
                >
                  <Input
                    id="f-name"
                    name="name"
                    placeholder={t("themeLab.field.namePlaceholder")}
                  />
                </FormField>
                <FormField
                  id="f-error"
                  label={t("themeLab.field.email")}
                  error={t("themeLab.field.emailError")}
                >
                  <Input id="f-error" name="email" defaultValue="not-an-email" />
                </FormField>
                <FormField id="f-search" label={t("themeLab.field.search")}>
                  <SearchInput
                    id="f-search"
                    value={query}
                    onSearch={setQuery}
                    placeholder={t("themeLab.field.searchPlaceholder")}
                  />
                </FormField>
                <FormField id="f-qty" label={t("themeLab.field.quantity")}>
                  <NumberInput
                    id="f-qty"
                    aria-label={t("themeLab.field.quantity")}
                    defaultValue={3}
                    min={0}
                    max={99}
                  />
                </FormField>
                <FormField id="f-pw" label={t("themeLab.field.password")}>
                  <PasswordInput
                    id="f-pw"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                  />
                </FormField>
                <FormField id="f-notes" label={t("themeLab.field.notes")} colSpan={2}>
                  <Textarea id="f-notes" rows={3} placeholder={t("themeLab.sample.short")} />
                </FormField>
                <FormField id="f-tags" label={t("themeLab.field.tags")}>
                  <TagInput
                    id="f-tags"
                    aria-label={t("themeLab.field.tags")}
                    value={tags}
                    onValueChange={setTags}
                  />
                </FormField>
                <FormField id="f-role" label={t("themeLab.field.role")}>
                  <Select
                    id="f-role"
                    value={role}
                    onValueChange={setRole}
                    options={[
                      { value: "viewer", label: t("themeLab.role.viewer") },
                      { value: "editor", label: t("themeLab.role.editor") },
                      { value: "admin", label: t("themeLab.role.admin") },
                    ]}
                  />
                </FormField>
                <FormField id="f-date" label={t("themeLab.field.date")}>
                  <DatePicker id="f-date" value={date} onValueChange={setDate} />
                </FormField>
                <FormField id="f-time" label={t("themeLab.field.time")}>
                  <TimePicker id="f-time" value={time} onValueChange={setTime} minuteStep={15} />
                </FormField>
                <FormField id="f-range" label={t("themeLab.field.timeRange")}>
                  <TimeRangePicker
                    aria-label={t("themeLab.field.timeRange")}
                    defaultValue={["09:00", "18:00"]}
                  />
                </FormField>
                <FormField id="f-colour" label={t("themeLab.field.colour")}>
                  <ColorPicker
                    id="f-colour"
                    aria-label={t("themeLab.field.colour")}
                    value={colour}
                    onValueChange={setColour}
                  />
                </FormField>
                <FormField id="f-volume" label={t("themeLab.field.volume")}>
                  <Slider
                    id="f-volume"
                    aria-label={t("themeLab.field.volume")}
                    value={volume}
                    onChange={(next) => setVolume(next as number)}
                  />
                </FormField>
                <FormField id="f-cascade" label={t("themeLab.field.region")}>
                  <Cascader
                    id="f-cascade"
                    options={[
                      {
                        value: "north",
                        label: t("themeLab.sample.alpha"),
                        children: [
                          { value: "n1", label: t("themeLab.sample.beta") },
                          { value: "n2", label: t("themeLab.sample.gamma") },
                        ],
                      },
                    ]}
                    value={cascade}
                    onValueChange={(next) => setCascade(next as string[])}
                    showSearch
                  />
                </FormField>
                <FormField id="f-scope" label={t("themeLab.field.scope")} colSpan={2}>
                  <BranchScopePicker
                    id="f-scope"
                    branches={[
                      { id: "b1", name: t("themeLab.sample.alpha") },
                      {
                        id: "b2",
                        name: t("themeLab.sample.beta"),
                        description: t("themeLab.sample.short"),
                      },
                      { id: "b3", name: t("themeLab.sample.gamma"), disabled: true },
                    ]}
                    value={scope}
                    onValueChange={setScope}
                    searchable
                  />
                </FormField>
                <FormField id="f-account" label={t("themeLab.field.account")}>
                  <TreeSelect
                    id="f-account"
                    /* `children`, not `content`: Cascader's option type nests through `content`
                     * and TreeSelect's `TreeOptionProp` through `children`. The MCP catalogue's
                     * own TreeSelect example writes `content` and does not typecheck — recorded
                     * here rather than quietly corrected, because the catalogue is what a
                     * consumer copies. */
                    treeData={[
                      {
                        value: "assets",
                        label: t("themeLab.sample.alpha"),
                        children: [
                          { value: "cash", label: t("themeLab.sample.beta") },
                          { value: "ar", label: t("themeLab.sample.gamma") },
                        ],
                      },
                    ]}
                    value={account}
                    onValueChange={(next) => setAccount(next as string | undefined)}
                    showSearch
                    treeDefaultExpandAll
                    allowClear
                  />
                </FormField>
              </Form>
              <Flex direction="col" gap="md">
                <Field
                  id="f-switch"
                  label={t("themeLab.field.notify")}
                  description={t("themeLab.sample.short")}
                >
                  <Switch
                    id="f-switch"
                    aria-label={t("themeLab.field.notify")}
                    checked={switched}
                    onCheckedChange={setSwitched}
                  />
                </Field>
                <Label htmlFor="f-agree">{t("themeLab.field.agree")}</Label>
                <Checkbox
                  id="f-agree"
                  checked={checked}
                  onCheckedChange={(next) => setChecked(next === true)}
                >
                  {t("themeLab.field.agree")}
                </Checkbox>
                <CheckboxGroup
                  name="perms"
                  aria-label={t("themeLab.label.permissions")}
                  options={[
                    { label: t("themeLab.perm.read"), value: "read" },
                    {
                      label: t("themeLab.perm.write"),
                      value: "write",
                      description: t("themeLab.sample.short"),
                    },
                    { label: t("themeLab.perm.admin"), value: "admin", disabled: true },
                  ]}
                  defaultValue={["read"]}
                  orientation="vertical"
                />
                <RadioGroup
                  name="tier"
                  aria-label={t("themeLab.label.variants")}
                  defaultValue="a"
                  orientation="horizontal"
                  options={[
                    { label: t("themeLab.sample.alpha"), value: "a" },
                    { label: t("themeLab.sample.beta"), value: "b" },
                  ]}
                />
                <Radio.Group
                  name="method"
                  aria-label={t("themeLab.label.sizes")}
                  defaultValue="card"
                  orientation="vertical"
                  options={[
                    {
                      label: t("themeLab.sample.gamma"),
                      value: "card",
                      description: t("themeLab.sample.short"),
                    },
                    { label: t("themeLab.sample.delta"), value: "bank" },
                  ]}
                />
                <PasswordStrength value={password} />
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <Upload variant="dropzone" value={uploads} onValueChange={setUploads} />
                <Attachments items={[]} overflow="scrollX" />
                <Command label={t("themeLab.label.quickPick")} loop>
                  <CommandInput placeholder={t("themeLab.field.searchPlaceholder")} />
                  <CommandList>
                    <CommandEmpty>{t("themeLab.label.noResults")}</CommandEmpty>
                    <CommandGroup heading={t("themeLab.sample.alpha")}>
                      <CommandItem value="one">{t("themeLab.sample.one")}</CommandItem>
                      <CommandItem value="two">{t("themeLab.sample.two")}</CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
                <Transfer
                  /* `key`, not `value` — the MCP catalogue's Transfer example writes `value` and
                   * does not typecheck either. Same note as TreeSelect above. */
                  dataSource={[
                    { key: "1010", title: t("themeLab.sample.alpha") },
                    { key: "1020", title: t("themeLab.sample.beta") },
                    { key: "2010", title: t("themeLab.sample.gamma") },
                  ]}
                  targetKeys={transferred}
                  onValueChange={setTransferred}
                  titles={[t("themeLab.label.available"), t("themeLab.label.selected")]}
                  showSearch
                />
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  aria-label={t("themeLab.field.date")}
                />
              </Flex>
            </Section>

            {/* ── 8 · navigation ───────────────────────────────────────────────────────── */}
            <Section id="nav" title={t("themeLab.section.nav")}>
              <Breadcrumb
                items={[
                  /* Distinct hrefs, because Breadcrumb keys its rows by `to` and two "#" rows
                   * produced a duplicate-key error in React. */
                  { label: t("themeLab.nav.overview"), to: "#overview" },
                  { label: t("themeLab.nav.reports"), to: "#nav" },
                  { label: t("themeLab.sample.alpha") },
                ]}
              />
              <Tabs
                defaultValue="overview"
                items={[
                  {
                    value: "overview",
                    label: t("themeLab.nav.overview"),
                    content: t("themeLab.sample.long"),
                  },
                  {
                    value: "reports",
                    label: t("themeLab.nav.reports"),
                    content: t("themeLab.sample.short"),
                  },
                ]}
              />
              <Steps
                value={step}
                items={[
                  { title: t("themeLab.sample.alpha") },
                  { title: t("themeLab.sample.beta") },
                  { title: t("themeLab.sample.gamma") },
                ]}
              />
              <Pagination value={page} total={96} pageSize={10} showTotal onValueChange={setPage} />
              <Toolbar hasActiveFilters onClear={() => setQuery("")}>
                <SearchInput
                  value={query}
                  onSearch={setQuery}
                  placeholder={t("themeLab.field.searchPlaceholder")}
                />
                <ToolbarGroup label={t("themeLab.table.status")}>
                  <Select
                    aria-label={t("themeLab.table.status")}
                    value={role}
                    onValueChange={setRole}
                    options={[
                      { value: "viewer", label: t("themeLab.role.viewer") },
                      { value: "admin", label: t("themeLab.role.admin") },
                    ]}
                  />
                </ToolbarGroup>
              </Toolbar>
              <FilterBar
                search={{
                  value: query,
                  onValueChange: setQuery,
                  placeholder: t("themeLab.field.searchPlaceholder"),
                }}
                resultCount={ROWS.length}
                actions={<Button size="sm">{t("themeLab.action.save")}</Button>}
              />
              <MegaMenu
                label={t("themeLab.label.mainNav")}
                value={route}
                onValueChange={setRoute}
                items={[
                  {
                    key: "products",
                    label: t("themeLab.sample.alpha"),
                    panel: {
                      groups: [
                        {
                          key: "core",
                          label: t("themeLab.sample.beta"),
                          links: [
                            { key: "hr", label: t("themeLab.sample.gamma"), href: "#hr" },
                            { key: "pay", label: t("themeLab.sample.delta"), href: "#pay" },
                          ],
                        },
                      ],
                    },
                  },
                  { key: "pricing", label: t("themeLab.sample.epsilon"), href: "#pricing" },
                ]}
              />
              <NavList
                label={t("themeLab.nav.section")}
                activeId="overview"
                items={[
                  {
                    id: "account",
                    label: t("themeLab.sample.alpha"),
                    icon: Users,
                    children: [
                      { id: "overview", label: t("themeLab.nav.overview"), href: "#overview" },
                      { id: "people", label: t("themeLab.nav.people"), href: "#people" },
                    ],
                  },
                  {
                    id: "appearance",
                    label: t("themeLab.nav.settings"),
                    icon: Palette,
                    href: "#settings",
                  },
                ]}
              />
              {/*
               * `affix={false}`, because Anchor has NO `target` prop — unlike Affix, which does.
               * So an affixed Anchor can only pin to the viewport, and on this page that put it
               * on top of the PageContainer header alongside the Affix. Turning the pinning off
               * is the only thing the API offers here; that asymmetry between two components
               * whose whole job is the same behaviour is filed as its own issue.
               */}
              <Anchor
                affix={false}
                label={t("themeLab.label.onThisPage")}
                items={[
                  { key: "type", href: "#type", title: t("themeLab.section.type") },
                  { key: "actions", href: "#actions", title: t("themeLab.section.actions") },
                  { key: "tables", href: "#tables", title: t("themeLab.section.tables") },
                ]}
              />
              {/*
               * Affix AND Anchor pin to their SCROLL TARGET, and without one that target is the
               * viewport — so on this page both landed on top of the PageContainer header, three
               * `position: fixed` bars stacked over the title. Measured: `.ui-affix-content` at
               * `inset-block-start: 0` and `64px`, `z-index: 20`, over a header at z-index 0.
               *
               * That is the components doing exactly what they were told, which is why it is the
               * PAGE that is wrong: a demo of a pinning component has no business pinning to the
               * document it is being demonstrated in. Each gets its own bounded scroller, which is
               * also the only way to SHOW the behaviour — a bar pinned to a viewport you are not
               * scrolling never moves, so the old version demonstrated nothing while breaking the
               * page it sat on.
               */}
              <div
                ref={affixScrollerRef}
                className="ui-scroll-area"
                style={{ blockSize: "12rem", overflowY: "auto" }}
              >
                <div style={{ blockSize: "30rem" }}>
                  <Affix offsetBlockStart={8} target={() => affixScrollerRef.current}>
                    <Flex align="center" justify="between" gap="sm">
                      <Text weight="medium">{t("themeLab.label.pinned")}</Text>
                      <Button size="sm">{t("themeLab.action.save")}</Button>
                    </Flex>
                  </Affix>
                </div>
              </div>
            </Section>

            {/* ── 9 · feedback ─────────────────────────────────────────────────────────── */}
            <Section id="feedback" title={t("themeLab.section.feedback")}>
              <Alert>
                <AlertTitle>{t("themeLab.tone.neutral")}</AlertTitle>
                <AlertDescription>{t("themeLab.sample.long")}</AlertDescription>
              </Alert>
              <Alert tone="info">
                <AlertTitle>{t("themeLab.tone.info")}</AlertTitle>
                <AlertDescription>{t("themeLab.sample.short")}</AlertDescription>
                <AlertActions>
                  <Button size="xs" variant="outline">
                    {t("themeLab.action.more")}
                  </Button>
                </AlertActions>
              </Alert>
              <Alert tone="success">
                <AlertTitle>{t("themeLab.tone.success")}</AlertTitle>
                <AlertDescription>{t("themeLab.sample.short")}</AlertDescription>
              </Alert>
              <Alert tone="warning">
                <AlertTitle>{t("themeLab.tone.warning")}</AlertTitle>
                <AlertDescription>{t("themeLab.sample.short")}</AlertDescription>
              </Alert>
              <Alert tone="destructive">
                <AlertTitle>{t("themeLab.tone.destructive")}</AlertTitle>
                <AlertDescription>{t("themeLab.sample.short")}</AlertDescription>
              </Alert>
              <Banner tone="warning">
                <Banner.Content>
                  <Banner.Title>{t("themeLab.tone.warning")}</Banner.Title>
                  <Banner.Description>{t("themeLab.sample.short")}</Banner.Description>
                </Banner.Content>
              </Banner>
              <Callout kind="warning">
                <Callout.Title>{t("themeLab.tone.warning")}</Callout.Title>
                <Callout.Description>{t("themeLab.sample.long")}</Callout.Description>
              </Callout>
              <EmptyState
                title={t("themeLab.label.noResults")}
                description={t("themeLab.sample.short")}
              />
              <ErrorSurface
                mode="application"
                status={403}
                title={t("themeLab.error.title")}
                description={t("themeLab.sample.long")}
                action={<Button>{t("themeLab.action.retry")}</Button>}
              />
              <Row2 label={t("themeLab.label.skeletons")}>
                <Skeleton />
                <SkeletonAvatar size="lg" />
                <SkeletonButton size="sm" />
                <SkeletonInput />
                <SkeletonNode />
                <SkeletonImage active />
              </Row2>
              <SkeletonArticle avatar active paragraph={{ rows: 2 }} />
              <SkeletonForm columns={2} fields={4} />
            </Section>

            {/* ── 10 · overlays. OPENED by the instrument, not merely present. ──────────── */}
            <Section
              id="overlays"
              title={t("themeLab.section.overlays")}
              note={t("themeLab.section.overlaysNote")}
            >
              <Flex direction="row" gap="sm" wrap align="center">
                <Button data-probe="dialog" onClick={() => setDialogOpen(true)}>
                  {t("themeLab.overlay.dialog")}
                </Button>
                <Button data-probe="sheet" variant="outline" onClick={() => setSheetOpen(true)}>
                  {t("themeLab.overlay.sheet")}
                </Button>
                <Button
                  data-probe="alert-dialog"
                  variant="destructive"
                  onClick={() => setAlertOpen(true)}
                >
                  {t("themeLab.overlay.alertDialog")}
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button data-probe="tooltip" variant="outline">
                      {t("themeLab.overlay.tooltip")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("themeLab.sample.short")}</TooltipContent>
                </Tooltip>
                <Button
                  data-probe="toast"
                  variant="secondary"
                  onClick={() => toast(t("themeLab.overlay.toastMessage"))}
                >
                  {t("themeLab.overlay.toast")}
                </Button>
                <Button
                  data-probe="two-factor"
                  variant="outline"
                  onClick={() => setTwoFactorOpen(true)}
                >
                  {t("themeLab.overlay.twoFactor")}
                </Button>
                <CommandPalette
                  groups={[
                    {
                      id: "pages",
                      label: t("themeLab.nav.section"),
                      items: [
                        { id: "overview", label: t("themeLab.nav.overview") },
                        { id: "reports", label: t("themeLab.nav.reports") },
                      ],
                    },
                  ]}
                  labels={{
                    open: t("themeLab.label.quickPick"),
                    title: t("themeLab.label.quickPick"),
                    description: t("themeLab.sample.short"),
                    placeholder: t("themeLab.field.searchPlaceholder"),
                    empty: t("themeLab.label.noResults"),
                  }}
                  onSelect={() => {}}
                />
              </Flex>
              <Flex direction="col" gap="sm" align="start">
                <Text size="xs" tone="muted">
                  {t("themeLab.overlay.inlineNote")}
                </Text>
                {/* `id`, not `data-probe`: Select is a closed component and does not spread
                    arbitrary `data-*` onto its trigger — measured, the attribute never reached the
                    DOM. The instrument addresses this one by id. */}
                <Select
                  id="overlay-select"
                  aria-label={t("themeLab.field.role")}
                  value={role}
                  onValueChange={setRole}
                  options={[
                    { value: "viewer", label: t("themeLab.role.viewer") },
                    { value: "editor", label: t("themeLab.role.editor") },
                    { value: "admin", label: t("themeLab.role.admin") },
                  ]}
                />
              </Flex>
            </Section>

            {/* ── 11 · regions and shells that nest ────────────────────────────────────── */}
            <Section id="regions" title={t("themeLab.section.regions")}>
              <SplitPane
                asideLabel={t("themeLab.label.detail")}
                aside={<Text size="sm">{t("themeLab.sample.short")}</Text>}
              >
                <Text size="sm">{t("themeLab.sample.long")}</Text>
              </SplitPane>
              <MasterDetail
                masterLabel={t("themeLab.label.master")}
                detailLabel={t("themeLab.label.detail")}
                master={<Text size="sm">{t("themeLab.sample.alpha")}</Text>}
              >
                <Text size="sm">{t("themeLab.sample.beta")}</Text>
              </MasterDetail>
              <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel id="list" defaultSize="40%" minSize="20%">
                  <Text size="sm">{t("themeLab.sample.alpha")}</Text>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel id="detail" defaultSize="60%" minSize="30%">
                  <Text size="sm">{t("themeLab.sample.beta")}</Text>
                </ResizablePanel>
              </ResizablePanelGroup>
              <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
                <ServiceLauncherCard
                  icon={Clock}
                  title={t("themeLab.sample.alpha")}
                  statusLabel={t("themeLab.tone.success")}
                  statusTone="success"
                  description={t("themeLab.sample.short")}
                  action={<Button>{t("themeLab.action.open")}</Button>}
                />
                <ServiceLauncherCard
                  icon={Building2}
                  title={t("themeLab.sample.beta")}
                  statusLabel={t("themeLab.tone.warning")}
                  statusTone="warning"
                  description={t("themeLab.sample.short")}
                  disabledReason={t("themeLab.sample.short")}
                  action={<Button disabled>{t("themeLab.action.open")}</Button>}
                />
                <ServiceCatalogCta
                  title={t("themeLab.label.catalog")}
                  action={<Button variant="outline">{t("themeLab.action.more")}</Button>}
                />
              </ResponsiveGrid>
              <ServiceRolePanel
                roles={[
                  { id: "admin", name: t("themeLab.role.admin") },
                  { id: "viewer", name: t("themeLab.role.viewer") },
                ]}
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                {(selected) => (
                  <Text size="sm">{selected ? selected.name : t("themeLab.label.noResults")}</Text>
                )}
              </ServiceRolePanel>
              <OrgSwitcher
                organizations={[
                  { id: "dxs", name: t("themeLab.sample.alpha"), meta: t("themeLab.role.admin") },
                  { id: "acme", name: t("themeLab.sample.beta"), meta: t("themeLab.role.viewer") },
                ]}
                value={org}
                onValueChange={setOrg}
                labels={{
                  trigger: (name) => `${t("themeLab.org.trigger")}: ${name}`,
                  title: t("themeLab.org.trigger"),
                  search: t("themeLab.field.searchPlaceholder"),
                  empty: t("themeLab.label.noResults"),
                  loading: t("themeLab.label.loading"),
                }}
              />
              <AuthStack>
                <AuthIdentity
                  title={t("themeLab.auth.title")}
                  requester={t("themeLab.auth.requester")}
                />
                <AuthAccountSummary
                  email="duong@example.test"
                  actionLabel={t("themeLab.auth.switch")}
                  onAction={() => {}}
                />
                <AuthDivider label={t("themeLab.auth.or")} />
                <AuthFooter
                  product={t("themeLab.product")}
                  terms={t("themeLab.auth.terms")}
                  privacy={t("themeLab.auth.privacy")}
                />
              </AuthStack>
            </Section>

            {/* ── 12 · conversational ──────────────────────────────────────────────────── */}
            <Section id="chat" title={t("themeLab.section.chat")}>
              <Welcome
                icon={<Bot aria-hidden="true" />}
                title={t("themeLab.chat.welcomeTitle")}
                description={t("themeLab.chat.welcomeBody")}
              />
              <ChatBubbleList
                label={t("themeLab.section.chat")}
                items={chat}
                roles={{
                  assistant: { placement: "start", variant: "filled" },
                  user: { placement: "end", variant: "outlined" },
                }}
              />
              <ChatBubble placement="start" header={t("themeLab.chat.assistantName")} loading />
              <ChatBubble placement="end" tone="destructive" header={t("themeLab.chat.userName")}>
                {t("themeLab.sample.short")}
              </ChatBubble>
              <ThoughtChain
                label={t("themeLab.chat.thoughts")}
                defaultExpandedKeys={["search"]}
                items={[
                  { key: "read", title: t("themeLab.sample.alpha"), status: "success" },
                  {
                    key: "search",
                    title: t("themeLab.sample.beta"),
                    status: "loading",
                    collapsible: true,
                  },
                  { key: "write", title: t("themeLab.sample.gamma"), status: "abort" },
                ]}
              />
              <Conversations
                activeKey={conversation}
                onActiveChange={setConversation}
                items={[
                  { key: "c1", label: t("themeLab.sample.alpha") },
                  { key: "c2", label: t("themeLab.sample.beta") },
                ]}
              />
              <ChatSuggestion
                items={[
                  { value: "summarize", label: t("themeLab.sample.gamma") },
                  { value: "translate", label: t("themeLab.sample.delta") },
                ]}
              >
                {({ onTrigger, onKeyDown }) => (
                  <ChatComposer
                    value={draft}
                    onValueChange={(next) => {
                      setDraft(next);
                      onTrigger(next);
                    }}
                    onKeyDown={onKeyDown}
                    onSubmit={() => setDraft("")}
                    placeholder={t("themeLab.chat.placeholder")}
                  />
                )}
              </ChatSuggestion>
            </Section>

            {/* ── 13 · what could NOT be rendered, and why ──────────────────────────────── */}
            <Section
              id="absent"
              title={t("themeLab.section.absent")}
              note={t("themeLab.section.absentNote")}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("themeLab.absent.export")}</TableHead>
                    <TableHead>{t("themeLab.absent.reason")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ABSENT.map((entry) => (
                    <TableRow key={`${entry.name}-${entry.reasonKey}`}>
                      <TableCell>
                        <Text as="span" size="sm" mono>
                          {entry.name}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text as="span" size="sm">
                          {t(entry.reasonKey)}
                        </Text>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>

            <Reveal>
              <Text size="xs" tone="muted">
                {t("themeLab.page.footer")}
              </Text>
            </Reveal>
          </Flex>
        </PageContainer>
      </AppShell>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("themeLab.overlay.dialog")}</DialogTitle>
            <DialogDescription>{t("themeLab.sample.short")}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Text as="p" size="sm">
              {t("themeLab.sample.long")}
            </Text>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("themeLab.action.cancel")}</Button>
            </DialogClose>
            <Button onClick={() => setDialogOpen(false)}>{t("themeLab.action.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t("themeLab.overlay.sheet")}</SheetTitle>
            <SheetDescription>{t("themeLab.sample.short")}</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <Text as="p" size="sm">
              {t("themeLab.sample.long")}
            </Text>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">{t("themeLab.action.cancel")}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title={t("themeLab.overlay.alertDialog")}
        description={t("themeLab.sample.long")}
        confirmLabel={t("themeLab.action.save")}
        cancelLabel={t("themeLab.action.cancel")}
        onConfirm={() => setAlertOpen(false)}
      />

      <TwoFactorSetup
        open={twoFactorOpen}
        onOpenChange={setTwoFactorOpen}
        qrValue="otpauth://totp/theme-lab?secret=JBSWY3DPEHPK3PXP"
        manualKey="JBSWY3DPEHPK3PXP"
        code={otp}
        onCodeChange={setOtp}
        onConfirm={() => setTwoFactorOpen(false)}
        onAcknowledge={() => setTwoFactorOpen(false)}
        labels={{
          title: t("themeLab.twoFactor.title"),
          description: t("themeLab.twoFactor.description"),
          qrLabel: t("themeLab.label.qr"),
          manualKeyLabel: t("themeLab.twoFactor.manualKey"),
          codeLabel: t("themeLab.twoFactor.code"),
          recoveryNotice: t("themeLab.twoFactor.recovery"),
          cancel: t("themeLab.action.cancel"),
          confirm: t("themeLab.action.save"),
          acknowledge: t("themeLab.twoFactor.acknowledge"),
        }}
      />

      <DraggablePanel
        title={t("themeLab.label.assistant")}
        placement="bottom-end"
        position={panelPosition}
        onPositionChange={setPanelPosition}
      >
        <Text size="sm">{t("themeLab.sample.short")}</Text>
      </DraggablePanel>

      <FloatButton.Group
        trigger="click"
        icon={<ActivityIcon />}
        aria-label={t("themeLab.label.assistant")}
      >
        <FloatButton tooltip={t("themeLab.action.share")} icon={<Share2 />} />
        <FloatButton tooltip={t("themeLab.action.more")} icon={<FileText />} />
        <FloatButton.BackTop />
      </FloatButton.Group>

      <Toaster />
    </ThemeScope>
  );
}

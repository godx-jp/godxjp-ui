/**
 * Canonical code patterns for common consumer scenarios. Every pattern is copy-paste-ready:
 * imports listed at top, types spelled out, inline JSX with no opaque helpers.
 */

export interface PatternEntry {
  /** URL-safe slug. */
  name: string;
  aliases?: string[];
  /** One-line elevator pitch. */
  tagline: string;
  /** Categories — used for search. */
  tags: string[];
  /** Full snippet. */
  code: string;
}

export const PATTERNS: PatternEntry[] = [
  {
    name: "common-fixes",
    tagline:
      "Fix the most common @godxjp/ui consumer mistakes & visual bugs (StatCard double-border, grey Badge, crushed/empty table headers, washed-out sidebar footer, Inertia layout crash, SSR hydration). Before → after.",
    tags: [
      "fixes",
      "migration",
      "bug",
      "cardstat",
      "statusbadge",
      "datatable",
      "sidebar",
      "gotcha",
      "review",
    ],
    code: `// ───────────────────────────────────────────────────────────────────────
// 0) ★ MOST COMMON: <Card> body has NO padding (content is flush against the edges)
//    Cause: the bare <Card> has ZERO inner padding — it MUST contain <CardContent>.
//    Don't hand-roll padding with className="p-4" on the Card either.
// ❌  <Card><Flex direction="col" gap="md">…fields…</Flex></Card>   // flush, no padding
// ❌  <Card className="p-4">…fields…</Card>                          // hand-rolled padding
// ✅  <Card><CardContent><Flex direction="col" gap="md">…fields…</Flex></CardContent></Card>
//    Titles → <CardHeader><CardTitle>. Only go flush deliberately for a full-bleed table:
// ✅  <Card><CardContent flush><DataTable/></CardContent></Card>
//    GENERAL RULE — compose godx-ui primitives FULLY; never hand-roll what one ships:
//      padding → CardContent (not p-4) · controls → Input/Select/Button (not raw <input>/<select>/<button>)
//      vertical spacing → Flex direction="col" gap (not space-y-*) · empty rows → DataTable's built-in
//      empty / <EmptyState> (not a custom data.length===0 guard). If a primitive exists, USE it.

// 1) StatCard shows a DOUBLE border (too thick)
//    Cause: StatCard IS already a bordered Card. Don't wrap it.
// ❌  <Card><CardContent><StatCard label="x" value="1" /></CardContent></Card>
// ✅  dashboard only, with comparison/trend:
//     <ResponsiveGrid columns={4}><StatCard label="売上" value="¥8.2M" delta="+12%" /></ResponsiveGrid>
//    A list or detail page has NO StatCard row — a row count is not a KPI (Pagination showTotal).

// 2) Badge renders grey with a ○ (no colour) for localized/tier labels
//    Cause: it auto-maps only English lifecycle keys.
// ✅  <Badge status="active">公開中</Badge>                       // lifecycle → keep icon
// ✅  <Badge status="プレミアム" tone="neutral" icon={null} />   // tier → ONE neutral tone
//    Colour is for status only; a tier/category/scope is plain text or a neutral pill.

// 3) Table text collapses to one char per line, or a chip wraps
// ✅  give long columns a width:  { key: "name", header: "氏名", width: "w-64" }
//    (cells + chips are pinned white-space: nowrap by the library.)

// 4) Empty (icon/action) column header shows a blank grey block
// ✅  header: "" renders a transparent cell — leave it empty, don't inject a space.

// 5) DataTable columns are crushed / squeezed
//    Cause: the table is nested in a narrow grid column.
// ❌  <ResponsiveGrid columns={3}><div className="lg:col-span-2"><Card><DataTable/></Card></div></ResponsiveGrid>
// ✅  Table gets its OWN full-width row: <Card><CardContent flush><DataTable/></CardContent></Card>

// 6) Toolbar (filter bar) has no padding (sticks to the edge)
//    Cause: it's inside CardContent flush (flush strips padding — that's for tables).
// ❌  <Card><CardContent flush><Toolbar/><DataTable/></CardContent></Card>
// ✅  <Toolbar/>  then  <Card><CardContent flush><DataTable/></CardContent></Card>

// 7) Sidebar footer looks washed-out / off-design
//    Cause: raw opacity-*/text-[11px]. Use semantic tokens.
// ✅  <div className="text-muted-foreground text-xs">
//        <div className="text-foreground font-medium">{name}</div><div>{role}</div></div>

// 8) Inertia: "Objects are not valid as a React child {errors, auth, …}"
//    Cause: persistent layout passed as a render fn. Use the ARRAY form.
// ❌  Page.layout = (page) => <Layout>{page}</Layout>
// ✅  Page.layout = [Layout]            // Layout is ({children}) => ...

// 9) Inertia v3 hydration mismatch ("server rendered text didn't match the client")
//    Cause: Math.random()/argless new Date() during render (SSR ≠ client).
// ✅  seed deterministically by index, or compute in an event handler.

// 10) Hide a column on mobile / sign-aware KPI delta
// ✅  columns: [{ key: "email", header: "メール", hiddenOnMobile: true }]
// ✅  <StatCard label="売上" value="¥8.2M" delta="+12%" />   // + green / - red; inverse flips`,
  },

  {
    name: "signup-form",
    tagline:
      "Card-wrapped sign-up form using react-hook-form + zod with FormField/Input and a CardFooter action bar (real @godxjp/ui API).",
    tags: ["form", "auth", "sign-up", "zod", "validation", "react-hook-form"],
    code: `import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@godxjp/ui/data-display";
import { FormField, Input } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Flex } from "@godxjp/ui/layout";

const schema = z.object({
  name: z.string().min(1, "氏名は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
});
type Values = z.infer<typeof schema>;

export function SignUpCard() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  const onSubmit = handleSubmit(async (v) => {
    await fetch("/api/signup", { method: "POST", body: JSON.stringify(v) });
  });
  return (
    <Card>
      <CardHeader><CardTitle>アカウント作成</CardTitle></CardHeader>
      <CardContent>
        <form id="signup" onSubmit={onSubmit}>
          {/* Vertical rhythm comes from Flex direction="col" gap — never space-y-*/gap-* utilities. */}
          <Flex direction="col" gap="md">
            <FormField id="name" label="氏名" required error={errors.name?.message}>
              <Input id="name" {...register("name")} />
            </FormField>
            <FormField id="email" label="メールアドレス" required error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} />
            </FormField>
          </Flex>
        </form>
      </CardContent>
      <CardFooter separated>
        <Button type="submit" form="signup" loading={isSubmitting}>アカウントを作成</Button>
      </CardFooter>
    </Card>
  );
}`,
  },

  {
    name: "settings-page-responsive",
    aliases: ["settings-tabs", "settings-page", "settings-layout"],
    tagline:
      "Route-backed settings: persistent desktop local navigation, compact mobile tab strip, deep links + browser history, and bounded form content — NO Card wrapper, NO undefined CSS.",
    tags: ["settings", "form", "tabs", "admin", "responsive", "navigation"],
    code: `// Research basis: GitHub, Google Account, Microsoft Account, Atlassian Account settings +
// the IBM Carbon form grid. Every destination is a URL, so deep links and browser back/forward
// work for free and the active item is derived from the route — never from local tab state.
//
// Desktop (>= lg): persistent vertical local nav on the left + bounded content on the right.
// Mobile (< lg):   the SAME routes become a horizontal, scrollable tab strip above the content.
// Styling uses ONLY real semantic token classes (bg-muted / text-foreground / text-muted-foreground)
// and responsive/visibility utilities — the library ships NO bespoke settings shell/nav CSS classes.
import { NavLink, Outlet, Navigate } from "react-router-dom";
import { Flex } from "@godxjp/ui/layout";
import { Form, FormField, Input } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";

const SECTIONS = [
  { to: "general", label: "基本情報" },
  { to: "security", label: "セキュリティ" },
  { to: "notifications", label: "通知" },
] as const;

// One link renderer for BOTH breakpoints. NavLink gives us the active state (and sets
// aria-current="page") straight from the URL; semantic tokens only, no invented classes.
const link = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm no-underline transition-colors whitespace-nowrap",
    isActive
      ? "bg-muted text-foreground font-medium"
      : "text-muted-foreground hover:text-foreground",
  ].join(" ");

export function SettingsLayout() {
  return (
    <Flex direction="col" gap="lg" className="lg:flex-row lg:items-start">
      {/* < lg: horizontal, scrollable route tabs. Flex owns the row and the gap — hideFrom /
          hideBelow own the breakpoint, so neither nav needs a hand-rolled flex or gap utility. */}
      <Flex as="nav" aria-label="設定" gap={1} hideFrom="lg" className="overflow-x-auto">
        {SECTIONS.map((s) => (
          <NavLink key={s.to} to={s.to} className={link} end>{s.label}</NavLink>
        ))}
      </Flex>
      {/* >= lg: persistent vertical local nav (bounded width, does not shrink). */}
      <Flex as="nav" aria-label="設定" direction="col" gap={1} hideBelow="lg" width={224} shrink={false}>
        {SECTIONS.map((s) => (
          <NavLink key={s.to} to={s.to} className={link} end>{s.label}</NavLink>
        ))}
      </Flex>
      {/* Bounded content region (~42rem) — the routed section renders here. min-w-0 lets it shrink. */}
      <main className="min-w-0 max-w-2xl flex-1"><Outlet /></main>
    </Flex>
  );
}

// A settings section. Horizontal label/control rows on desktop (collapse to stacked on mobile),
// controls bounded to a semantic width — set ONCE on the <Form>, which every FormField reads
// (gh#998). FormField OWNS the label↔control relationship — do NOT hand-roll <Label> + <input>. Save feedback = Button loading prop + a toast in onSuccess.
export function GeneralSettingsSection({
  defaults, onSave, saving, error,
}: { defaults: { name: string; email: string }; onSave: (v: FormData) => void; saving: boolean; error?: string }) {
  return (
    <Form layout="horizontal" controlWidth="24rem"
      onSubmit={(e) => { e.preventDefault(); onSave(new FormData(e.currentTarget)); }}>
      <FormField id="ws-name" label="ワークスペース名"
        helper="請求書や共有リンクに表示されます。" error={error}>
        <Input id="ws-name" name="name" defaultValue={defaults.name} />
      </FormField>
      <FormField id="ws-email" label="連絡先メール">
        <Input id="ws-email" name="email" type="email" defaultValue={defaults.email} />
      </FormField>
      <Flex gap="sm"><Button type="submit" loading={saving}>変更を保存</Button></Flex>
    </Form>
  );
}

// Router wiring — each destination is addressable, so deep links + back/forward just work:
//   <Route path="settings" element={<SettingsLayout/>}>
//     <Route index element={<Navigate to="general" replace/>} />
//     <Route path="general" element={<GeneralSettingsSection .../>} />
//     <Route path="security" element={<SecuritySection/>} />
//     <Route path="notifications" element={<NotificationsSection/>} />
//   </Route>

// ── DO / DON'T ────────────────────────────────────────────────────────────────────────────
// ✅ Tabs (navigation) are fine for a SMALL number (2–4) of PEER views inside ONE task/section
//    — e.g. "プロフィール" ⇄ "環境設定" within a single account page — where losing the URL is OK.
// ⛔ Tabs as the PRIMARY IA for broad settings (Account / Security / Billing / Members / …):
//    use route-backed local navigation so every area is deep-linkable and back/forward works.
// ⛔ Do NOT wrap the whole settings page in a Card, and do NOT make desktop a horizontal tab bar
//    — persistent local nav scales to many sections; a tab strip does not.
// ⛔ Do NOT invent CSS class names for the shell/nav/content — compose Flex + semantic tokens.`,
  },

  {
    name: "settings-section-rows",
    aliases: [
      "settings-section",
      "settings-row",
      "danger-zone",
      "billing-handoff",
      "preferences-rows",
      "account-identity",
    ],
    tagline:
      "The four canonical settings blocks — identity · preference rows · billing handoff · danger zone. Identity and billing are SECTIONS (Heading + Descriptions, no surface); preference rows and the danger zone are Cards because they are real boundaries. A COMPOSITION pattern: godx-ui ships no SettingsSection/SettingsRow/DangerZone component and never will.",
    tags: ["settings", "account", "billing", "danger", "preferences", "listrow", "card", "admin"],
    code: `// Gate 0 (docs/COMPOSITION-VS-COMPONENT.md): a "SettingsSection"/"SettingsRow"/"DangerZone"
// FAILS the Framework-Component Test, so compose it. Reference screen: get_exemplar("settings")
// (docs/showcase/settings-account-sections.tsx). Composition rules: DESIGN.md → Admin Screen Anatomy.
import { ExternalLink } from "lucide-react";
import { Button, Heading } from "@godxjp/ui/general";
import { Card, CardContent, Descriptions, ListRow, StatusBadge } from "@godxjp/ui/data-display";
import { Switch } from "@godxjp/ui/data-entry";
import { AlertDialog } from "@godxjp/ui/feedback";
import { Flex } from "@godxjp/ui/layout";

// Sections are a heading + spacing: the SECTION step (gap="xl") is larger than the ITEM step
// (gap="sm"), which is what carries the hierarchy — not a box around every block.
<Flex direction="col" gap="xl">

  {/* 1) IDENTITY — a section, not a Card. Metadata is Descriptions (a real <dl>). */}
  <Flex direction="col" gap="sm">
    <Flex justify="between" align="center">
      <Heading level={2}>アカウント情報</Heading>
      <Button variant="outline" size="sm">編集</Button>
    </Flex>
    <Descriptions columns={2}>
      <Descriptions.Item label="表示名">藤原 慧</Descriptions.Item>
      <Descriptions.Item label="メールアドレス">satoshi@example.co.jp</Descriptions.Item>
      <Descriptions.Item label="従業員番号" mono>EMP-1042-JP</Descriptions.Item>
      <Descriptions.Item label="利用開始日">
        <time dateTime="2023-04-01">
          {new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(since)}
        </time>
      </Descriptions.Item>
    </Descriptions>
  </Flex>

  {/* 2) PREFERENCE ROWS — a list of setting rows IS a real boundary, so it gets one Card:
       CardContent flush + ListRow, whose trailing slot is the control. The visible title is the
       control's <label htmlFor>. NEVER a flex div with border-b rows. */}
  <Flex direction="col" gap="sm">
    <Heading level={2}>通知の環境設定</Heading>
    <Card>
      <CardContent flush>
        <ListRow
          align="start"
          overflow="wrap"
          title={<label htmlFor="pref-digest">週次サマリーをメールで受け取る</label>}
          description="毎週月曜日の朝に未処理の承認をまとめて送信します。"
          trailing={<Switch id="pref-digest" checked={digest} onCheckedChange={setDigest} />}
        />
      </CardContent>
    </Card>
  </Flex>

  {/* 3) BILLING HANDOFF — a section. The state is a canonical StatusBadge (never a page-local
       status→colour map); money through Intl. */}
  <Flex direction="col" gap="sm">
    <Flex justify="between" align="center">
      <Heading level={2}>請求とサブスクリプション</Heading>
      <StatusBadge status="past_due" variant="outline" />
    </Flex>
    <Descriptions columns={2}>
      <Descriptions.Item label="契約プラン">ビジネス（年額）</Descriptions.Item>
      <Descriptions.Item label="次回請求予定額">
        {new Intl.NumberFormat(locale, { style: "currency", currency: "JPY" }).format(1536000)}
      </Descriptions.Item>
    </Descriptions>
    <div>
      <Button variant="outline" asChild>
        <a href={portalUrl} target="_blank" rel="noreferrer">
          <ExternalLink aria-hidden="true" />
          請求ポータルを開く
          <span className="sr-only">（新しいタブで開きます）</span>
        </a>
      </Button>
    </div>
  </Flex>

  {/* 4) DANGER ZONE — a real boundary: Card accent="destructive" (the rail comes from
       --destructive). The heading and each row say what is lost; no decorative icon. */}
  <Flex direction="col" gap="sm">
    <Heading level={2}>取り消せない操作</Heading>
    <Card accent="destructive">
      <CardContent flush>
        <ListRow
          align="start"
          overflow="wrap"
          title="ワークスペースと全データを完全に削除する"
          description="勤怠記録・申請履歴・監査ログがすべて削除されます。"
          trailing={<Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>削除</Button>}
        />
      </CardContent>
    </Card>
  </Flex>
</Flex>

<AlertDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="ワークスペースを完全に削除しますか？"
  description="この操作は取り消せません。確認のため識別子を入力してください。"
  challenge={workspaceSlug}
  variant="destructive"
  onConfirm={destroy}
/>

// ── DO / DON'T ────────────────────────────────────────────────────────────────────────────
// ✅ Section step > item step (gap="xl" between sections, gap="sm" inside one).
// ✅ A Card only where there is a real boundary: a list of setting rows, the danger zone.
// ✅ Every setting row is a ListRow; its control lives in \`trailing\`, titled by <label htmlFor>.
// ⛔ Do NOT add SettingsSection / SettingsRow / DangerZone to src/components — they fail Gate 0.
// ⛔ Do NOT give every block Card + CardHeader + CardTitle + CardDescription (ui-audit card-per-section).
// ⛔ Do NOT hand-roll padding (p-4), a status colour map, or a <dl> replacement.`,
  },

  {
    name: "pricing-plans",
    aliases: ["pricing-table", "plan-picker", "pricing-card"],
    tagline:
      "Pricing plan cards — ResponsiveGrid preset + Card featured + FeatureList + tabular price. A composition, not a component (consumer request, debated 2026-10-09 on #1205).",
    tags: ["pricing", "plans", "billing", "card", "composition"],
    code: `import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Badge, FeatureList } from "@godxjp/ui/data-display";
import { ResponsiveGrid } from "@godxjp/ui/layout";
import { Button, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";

type Plan = {
  id: string;
  name: string;
  summary: string;
  /** Minor units of the ISO 4217 currency; formatted with Intl, never hand-built. */
  price: number;
  currency: string;
  recommended?: boolean;
  current?: boolean;
  features: { state: "included" | "excluded" | "limited"; label: string; description?: string }[];
};

export function PricingPlans({ plans, onChoose }: { plans: Plan[]; onChoose: (id: string) => void }) {
  const { t, locale } = useTranslation();
  return (
    // 3 columns from the sm container step, 1 below it — the geometry is the preset's, not yours.
    <ResponsiveGrid preset="pricing-plans" gap="md">
      {plans.map((plan) => {
        const money = new Intl.NumberFormat(locale, { style: "currency", currency: plan.currency });
        const digits = money.resolvedOptions().maximumFractionDigits ?? 0;
        return (
          // "featured" is the one recommended plan: a brand-toned perimeter, not a bigger card.
          <Card key={plan.id} variant={plan.recommended ? "featured" : "default"}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.summary}</CardDescription>
              {plan.current ? <Badge tone="success">{t("billing.currentPlan")}</Badge> : null}
            </CardHeader>
            <CardContent>
              <Text size="xl" weight="semibold" tabular>
                {money.format(plan.price / 10 ** digits)}
              </Text>
              {/* FeatureList owns the included / limited / excluded glyph, colour and sr-only prefix. */}
              <FeatureList items={plan.features} />
            </CardContent>
            <CardFooter>
              <Button
                fullWidth
                variant={plan.recommended ? "default" : "outline"}
                disabled={plan.current}
                onClick={() => onChoose(plan.id)}
              >
                {plan.current ? t("billing.currentPlan") : t("billing.choosePlan")}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </ResponsiveGrid>
  );
}`,
  },

  {
    name: "confirm-destructive",
    tagline:
      'Type-to-confirm destructive dialog — the AlertDialog PRESET with `challenge` (the compound AlertDialog* parts are the older way in; a body the preset does not cover is Dialog variant="destructive").',
    tags: ["dialog", "confirm", "destructive", "delete"],
    code: `import { AlertDialog, toast } from "@godxjp/ui/feedback";

// The preset covers a typed challenge: confirm stays disabled until the input equals \`slug\`.
export function DeleteProjectDialog({ open, onOpenChange, slug }: { open: boolean; onOpenChange: (v: boolean) => void; slug: string }) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title="プロジェクトを削除"
      description={\`この操作は取り消せません。確認のためプロジェクト名 "\${slug}" と入力してください。\`}
      challenge={slug}
      confirmLabel="完全に削除"
      onConfirm={() => {
        toast.success("削除しました");
        onOpenChange(false);
      }}
    />
  );
}`,
  },

  {
    name: "dependent-selects",
    aliases: ["cascading-selects", "country-state-city", "chained-selects", "linked-selects"],
    tagline:
      'Country → state → city: three Selects where each child is disabled until its parent has a value (FormField helper says why), loading while its options fetch, and reset to "" when the parent changes. A composition, not a component — reach for Cascader only when it is ONE field.',
    tags: ["form", "select", "dependent", "cascading", "address", "loading", "reset"],
    code: `// Live page: /showcase/form-dependent-selects (docs/showcase/form-dependent-selects.tsx).
// Three rules: (1) child disabled until parent has a value + helper saying why;
// (2) child loading while its options fetch; (3) parent change resets EVERY descendant to "".
// Reset to "", Select's controlled empty value — undefined flips it to uncontrolled.
import * as React from "react";
import { Form, FormField, Select } from "@godxjp/ui/data-entry";
import { Flex } from "@godxjp/ui/layout";
import { useTranslation } from "@godxjp/ui/i18n";

type Option = { value: string; label: string };
type Address = { country: string; region: string; city: string };

// Fetch options for a parent value. The answer is stored WITH the parent it answers, so
// \`loading\` is derived and a slow answer for an OLD parent is never shown on the new one.
function useChildOptions(parent: string, fetchOptions: (parent: string) => Promise<Option[]>) {
  const [answer, setAnswer] = React.useState<{ parent: string; options: Option[] }>({ parent: "", options: [] });
  React.useEffect(() => {
    if (!parent) return;
    let live = true;
    void fetchOptions(parent).then((options) => { if (live) setAnswer({ parent, options }); });
    return () => { live = false; };
  }, [parent, fetchOptions]);
  const ready = parent !== "" && answer.parent === parent;
  return { options: ready ? answer.options : [], loading: parent !== "" && !ready };
}

export function AddressFields({
  fetchRegions,
  fetchCities,
}: {
  fetchRegions: (country: string) => Promise<Option[]>; // stable (module-level or useCallback)
  fetchCities: (region: string) => Promise<Option[]>;
}) {
  const { t, locale } = useTranslation();
  const [value, setValue] = React.useState<Address>({ country: "", region: "", city: "" });
  const regions = useChildOptions(value.country, fetchRegions);
  const cities = useChildOptions(value.region, fetchCities);

  // ISO 3166-1 alpha-2 → the reader's language, no catalogue needed.
  const countries = React.useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: "region" });
    return ["JP", "US", "VN"].map((code) => ({ value: code, label: names.of(code) ?? code }));
  }, [locale]);

  return (
    <Form controlWidth="20rem">
      <Flex direction="col" gap="md">
        <FormField id="country" label={t("address.country")}>
          <Select
            value={value.country}
            onValueChange={(country: string) => setValue({ country, region: "", city: "" })}
            options={countries}
            placeholder={t("address.countryPlaceholder")}
          />
        </FormField>
        <FormField
          id="region"
          label={t("address.region")}
          helper={value.country ? undefined : t("address.selectCountryFirst")}
        >
          <Select
            value={value.region}
            onValueChange={(region: string) => setValue({ ...value, region, city: "" })}
            options={regions.options}
            disabled={!value.country}
            loading={regions.loading}
            placeholder={t("address.regionPlaceholder")}
          />
        </FormField>
        <FormField
          id="city"
          label={t("address.city")}
          helper={value.region ? undefined : t("address.selectRegionFirst")}
        >
          <Select
            value={value.city}
            onValueChange={(city: string) => setValue({ ...value, city })}
            options={cities.options}
            disabled={!value.region}
            loading={cities.loading}
            placeholder={t("address.cityPlaceholder")}
          />
        </FormField>
      </Flex>
    </Form>
  );
}`,
  },

  {
    name: "card-grid-selection",
    aliases: ["card-selection", "selectable-cards", "bulk-delete-cards", "grid-bulk-actions"],
    tagline:
      "Select cards in a grid and act on them in bulk — Card + Checkbox per item, the real DataTable.BulkActions driven by count outside a table, indeterminate select-all, AlertDialog before delete, toast with Undo after, EmptyState when nothing is left.",
    tags: ["selection", "bulk", "cards", "grid", "delete", "undo", "empty", "checkbox"],
    code: `// Live page: /showcase/card-grid-selection (docs/showcase/card-grid-selection.tsx).
// DataTable.BulkActions reads the table context only when one exists — outside a table pass
// \`count\`: it renders nothing at 0, and the localised "N selected" + a labelled region above 0.
// The Checkbox's inline label is the item name: the name is the click target and the
// accessible name. Do NOT make the whole Card an onClick div.
import * as React from "react";
import { FolderOpen, Trash2 } from "lucide-react";
import { Card, CardContent, DataTable, EmptyState } from "@godxjp/ui/data-display";
import { Checkbox } from "@godxjp/ui/data-entry";
import { AlertDialog, Toaster, toast } from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";
import { Flex, ResponsiveGrid } from "@godxjp/ui/layout";
import { useTranslation } from "@godxjp/ui/i18n";

type Item = { id: string; name: string };

export function SelectableCardGrid({ source }: { source: Item[] }) {
  const { t } = useTranslation();
  const [items, setItems] = React.useState(source);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmCount, setConfirmCount] = React.useState(0); // frozen: selection clears on confirm

  const all = items.length > 0 && items.every((i) => selected.has(i.id));
  const selectAll: boolean | "indeterminate" = all ? true : selected.size > 0 ? "indeterminate" : false;

  const deleteSelected = () => {
    const removed = new Set(selected);
    setItems((cur) => cur.filter((i) => !removed.has(i.id)));
    setSelected(new Set());
    toast(t("files.deleted", { count: removed.size }), {
      action: {
        label: t("files.undo"),
        // restore in the SOURCE order, not appended at the end
        onClick: () => setItems((cur) => source.filter((i) => removed.has(i.id) || cur.some((c) => c.id === i.id))),
      },
    });
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        variant="section"
        title={t("files.emptyTitle")}
        action={<Button variant="outline" onClick={() => setItems(source)}>{t("files.reset")}</Button>}
      />
    );
  }

  return (
    <Flex direction="col" gap="md">
      <Flex direction="row" align="center" gap="md" wrap>
        <Checkbox
          checked={selectAll}
          onCheckedChange={(next) => setSelected(next === true ? new Set(items.map((i) => i.id)) : new Set())}
        >
          {t("files.selectAll")}
        </Checkbox>
        <DataTable.BulkActions count={selected.size}>
          <Button variant="destructive" size="sm" onClick={() => { setConfirmCount(selected.size); setConfirmOpen(true); }}>
            <Trash2 aria-hidden="true" />
            {t("files.delete")}
          </Button>
        </DataTable.BulkActions>
      </Flex>
      <ResponsiveGrid columns={{ base: 1, sm: 2, lg: 3 }}>
        {items.map((item) => (
          <Card key={item.id} className={selected.has(item.id) ? "border-primary" : undefined}>
            <CardContent>
              <Checkbox
                checked={selected.has(item.id)}
                onCheckedChange={(on) =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (on === true) next.add(item.id); else next.delete(item.id);
                    return next;
                  })
                }
              >
                {item.name}
              </Checkbox>
            </CardContent>
          </Card>
        ))}
      </ResponsiveGrid>
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="destructive"
        title={t("files.confirmTitle", { count: confirmCount })}
        confirmLabel={t("files.delete")}
        onConfirm={deleteSelected}
      />
      <Toaster />{/* once per app — usually in the root layout, not here */}
    </Flex>
  );
}`,
  },

  {
    name: "deferred-loading",
    tagline:
      "Inertia deferred props with a Skeleton fallback — SkeletonTable while data loads, then DataTable (real @godxjp/ui API).",
    tags: ["loading", "skeleton", "deferred", "inertia", "table"],
    code: `// Server (Laravel): defer the heavy prop
//   Inertia::render('crm/coupons/index', [
//     'coupons' => Inertia::defer(fn () => Coupon::all()),
//   ]);
import { Card, CardContent, DataTable } from "@godxjp/ui/data-display";
import type { ColumnDef } from "@godxjp/ui/data-display";
import { SkeletonTable } from "@godxjp/ui/feedback";

type Coupon = { id: string; name: string };
const columns: ColumnDef<Coupon>[] = [{ key: "name", header: "クーポン名" }];

// coupons is undefined until the deferred request resolves
export default function Coupons({ coupons }: { coupons?: Coupon[] }) {
  return (
    <Card>
      <CardContent flush>
        {!coupons
          ? <SkeletonTable rows={10} columns={6} />
          : <DataTable data={coupons} columns={columns} getRowId={(c) => c.id} />}
      </CardContent>
    </Card>
  );
}`,
  },

  {
    name: "inertia-list-page",
    tagline:
      "Inertia + @godxjp/ui list page — PageContainer + Toolbar (above the table) + DataTable + Badge + Pagination. No KPI row, no restating subtitle.",
    tags: ["inertia", "list", "table", "page", "filter", "pagination", "datatable", "crm"],
    code: `import { Head, router } from "@inertiajs/react"
import { useMemo, useState } from "react"
import { PageContainer, Flex } from "@godxjp/ui/layout"
import { Card, CardContent, DataTable, EmptyState, Badge, type ColumnDef } from "@godxjp/ui/data-display"
import { SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@godxjp/ui/data-entry"
import { Toolbar, ToolbarGroup, Pagination } from "@godxjp/ui/navigation"
import { formatDate } from "@godxjp/ui/datetime"
import { withCrmLayout } from "@/layouts/crm-layout" // see "inertia-persistent-layout"

type Coupon = { id: string; name: string; status: string; scope: string; validFrom: string; validTo: string; usage: number }
const PAGE_SIZE = 10

function Coupons({ coupons }: { coupons: Coupon[] }) {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => coupons.filter((c) => {
    if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false
    if (status !== "all" && c.status !== status) return false
    return true
  }), [coupons, q, status])
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ColumnDef = { key, header, render?, align?: "left"|"center"|"right", sortable?, width? }
  const columns: ColumnDef<Coupon>[] = [
    { key: "name", header: "クーポン名", render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "scope", header: "スコープ" }, // a category is plain text; Badge is for the status column only
    { key: "status", header: "ステータス", render: (c) => <Badge status={c.status} /> },
    { key: "valid", header: "有効期間", render: (c) => \`\${formatDate(c.validFrom)} 〜 \${formatDate(c.validTo)}\` },
    { key: "usage", header: "利用数", align: "right", render: (c) => c.usage.toLocaleString() },
  ]

  return (
    <>
      <Head title="クーポン管理" />
      {/* RULE: every page wraps in PageContainer; vertical rhythm via Flex direction="col"/ResponsiveGrid, never p-* or gap-* */}
      {/* No subtitle that restates the title, no StatCard row: the total is Pagination's showTotal. */}
      <PageContainer title="クーポン管理">
        <Flex direction="col" gap="lg">
          {/* Toolbar is the filter-bar primitive (standalone, above the table surface). It WRAPS and
              never scrolls sideways (rule #51); past 2–4 filters, see the "list-filters" pattern. Never a
              hand-built Flex/Card of FormFields (ui-audit hand-rolled-filter-bar). */}
          <Toolbar hasActiveFilters={q !== "" || status !== "all"} onClear={() => { setQ(""); setStatus("all"); setPage(1) }}>
            {/* SearchInput is value + onSearch(v) — NOT onChange */}
            <SearchInput placeholder="クーポン名で検索" value={q} onSearch={(v) => { setQ(v); setPage(1) }} />
            {/* Status view of the SAME table = a filter: Segmented with count for 2-4 statuses, this
                Select past 4. Never Tabs: Tabs switch panels with their own columns (gh#1324). */}
            <ToolbarGroup label="ステータス">
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ステータス</SelectItem>
                  <SelectItem value="公開中">公開中</SelectItem>
                  <SelectItem value="下書き">下書き</SelectItem>
                </SelectContent>
              </Select>
            </ToolbarGroup>
          </Toolbar>

          <Card>
            <CardContent flush>
              {filtered.length === 0
                ? <EmptyState title="該当するクーポンがありません" description="検索条件を変更してください。" /> /* one sentence, no icon */
                : <DataTable data={paged} columns={columns} getRowId={(c) => c.id} onRowClick={(c) => router.visit(\`/coupons/\${c.id}\`)} />}
            </CardContent>
          </Card>

          {/* Pagination ONLY for real multi-page data — hide it while empty or single-page. */}
          {filtered.length > PAGE_SIZE && (
            <Pagination value={page} total={filtered.length} pageSize={PAGE_SIZE} showTotal onValueChange={(p) => setPage(p)} />
          )}
        </Flex>
      </PageContainer>
    </>
  )
}

Coupons.layout = withCrmLayout
export default Coupons`,
  },

  {
    name: "inertia-detail-page",
    tagline:
      "Inertia detail page — receives {id} prop, Descriptions (compound) in one Card + EmptyState fallback. No KPI tile row.",
    tags: ["inertia", "detail", "show", "page", "keyvaluegrid", "crm"],
    code: `import { Head, router } from "@inertiajs/react"
import { PageContainer } from "@godxjp/ui/layout"
import { Card, CardContent, EmptyState, Descriptions, Badge } from "@godxjp/ui/data-display"
import { Button } from "@godxjp/ui/general"
import { formatDate } from "@godxjp/ui/datetime"
import { ArrowLeft } from "lucide-react"
import { withCrmLayout } from "@/layouts/crm-layout"

// Detail routes pass the param as an Inertia prop:
//   Route::get('/members/{id}', fn ($id) => Inertia::render('crm/members/show', ['id' => $id]))
function MemberShow({ id }: { id: string }) {
  const member = MEMBERS.find((m) => m.id === id)

  if (!member) {
    return (
      <>
        <Head title="会員詳細" />
        <PageContainer title="会員詳細">
          <EmptyState title="会員が見つかりません" description={\`ID「\${id}」は存在しません。\`} />
          <Button variant="outline" onClick={() => router.visit("/members")}><ArrowLeft className="size-4" />一覧へ戻る</Button>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Head title={member.name} />
      <PageContainer title={member.name}>
        {/* Figures about one member are facts, not KPIs: Descriptions rows, not a StatCard row. */}
        <Card>
          <CardContent>
            {/* Descriptions is COMPOUND — value goes in children, not a prop */}
            <Descriptions columns={2}>
              <Descriptions.Item label="会員ID">{member.id}</Descriptions.Item>
              <Descriptions.Item label="ランク">{member.rank}</Descriptions.Item>
              <Descriptions.Item label="ステータス"><Badge status={member.status} /></Descriptions.Item>
              <Descriptions.Item label="登録日">{formatDate(member.registeredAt)}</Descriptions.Item>
              <Descriptions.Item label="累計購入額">{\`¥\${member.total.toLocaleString()}\`}</Descriptions.Item>
              <Descriptions.Item label="来店回数">{member.visits}</Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>
      </PageContainer>
    </>
  )
}

MemberShow.layout = withCrmLayout
export default MemberShow`,
  },

  {
    name: "inertia-persistent-layout",
    tagline:
      "Inertia persistent layout (AppShell+Sidebar) — the array-form gotcha + the SSR/Math.random gotcha.",
    tags: ["inertia", "layout", "appshell", "sidebar", "ssr", "hydration", "gotcha"],
    code: `// resources/js/layouts/crm-layout.tsx
import { router, usePage } from "@inertiajs/react"
import { AppShell, Sidebar } from "@godxjp/ui/layout"
import { LayoutDashboard } from "lucide-react"
import type { ReactNode } from "react"

export function CrmLayout({ children }: { children: ReactNode }) {
  const { url } = usePage()
  const sections = [{ label: "メイン", items: [{ id: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard }] }]
  return (
    <AppShell sidebar={<Sidebar activeId={url} onSelect={(id) => router.visit(id)} sections={sections} product={{ name: "JOVY CRM" }} />}>
      {children}
    </AppShell>
  )
}

// ⚠️ GOTCHA 1 — persistent layout MUST be the ARRAY form.
// A render fn \`(page) => <CrmLayout>{page}</CrmLayout>\` is indistinguishable from a
// component; Inertia React calls it with the page-PROPS object and renders that
// object as a child → "Objects are not valid as a React child {errors, auth, …}".
export const withCrmLayout = [CrmLayout]   // ✅ array → Inertia passes the page as children
// page usage:  Dashboard.layout = withCrmLayout

// ⚠️ GOTCHA 2 — Inertia v3 SSRs even in \`npm run dev\`. NEVER call Math.random() or
// argless new Date() during render (e.g. fabricating chart/demo numbers) → React
// hydration mismatch ("server rendered text didn't match the client"). Seed
// deterministically by index, or compute inside an event handler:
const seeded = (n: number) => { const x = Math.sin((n + 1) * 99.71) * 1e4; return x - Math.floor(x) }`,
  },

  {
    name: "error-pages",
    aliases: ["error-surface", "errorsurface", "403", "404", "500", "503", "exception-page"],
    tagline:
      '400 / 403 / 404 / 500 / 503 exception pages. USE THE COMPONENT: import { ErrorSurface } from "@godxjp/ui/layout". `mode="application"` (400/403/404) is the body you put inside the AppShell the route already renders; `mode="system"` (500/503) owns the page via CenteredShell align="center".',
    tags: [
      "error",
      "errorsurface",
      "403",
      "404",
      "500",
      "503",
      "maintenance",
      "inertia",
      "ssr",
      "layout",
      "emptystate",
      "centeredshell",
    ],
    code: `// @godxjp/ui SHIPS <ErrorSurface>. Do NOT hand-compose an error page from
// the auth CenteredShell + a generic Card + a local ".canonical-auth-card" — that workaround IS the regression.
//
//    403 / 404  → mode="application": the surface is the BODY of the AppShell you ALREADY render
//                 (sidebar + topbar + breadcrumb are PRESERVED, never reconstructed)
//    500 / 503  → mode="system":      the surface OWNS the page (CenteredShell align="center",
//                 package-owned geometry at 1440 / 1024 / 390 — no min-h-dvh, no media query)
// Docs page: docs/layout/error-surface/

import { Button, Logo, Text } from "@godxjp/ui/general";
import { AppShell, ErrorSurface, PageContainer, Sidebar } from "@godxjp/ui/layout";

// ── WHAT THE COMPONENT OWNS ───────────────────────────────────────────────────────────
//  • status → icon + tone (ShieldAlert/warning · SearchX/muted · ServerCrash/destructive ·
//    Wrench/warning). You pass the NUMBER; you never write the lookup.
//  • EXACTLY ONE recovery action — a single slot; a 2nd element is dropped with a dev error.
//  • semantic metadata slots as real <dt>/<dd> pairs, with LIBRARY-owned localized labels:
//    requestId · permission · organization · maintenance{start,end,timeZone,progress}
//  • heading order (h2 in application mode under the PageContainer h1, h1 in system mode)
//  • the status code announced as "HTTP status 403", not the cardinal number "403"
// PRODUCT COPY stays yours: title / description / action come from the APP's own t().

// ── 403 / 404 — APPLICATION mode: PRESERVE the authenticated shell ─────────────────────
export function ForbiddenPage() {
  return (
    <AppShell sidebar={<Sidebar activeId="reports" sections={sections} />}>
      <PageContainer title={t("reports.title")} breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("reports.title") }]}>
        <ErrorSurface
          mode="application"
          status={403}
          title={t("errors.403.title")}
          description={t("errors.403.description")}
          permission="reports.view"        {/* WHY: the missing role … */}
          organization="Acme KK"           {/* … vs the wrong workspace */}
          action={<Button onClick={goHome}>{t("errors.backHome")}</Button>}
        />
      </PageContainer>
    </AppShell>
  );
}

// ── 500 / 503 — SYSTEM mode: package-owned viewport-centred geometry ───────────────────
// The component renders CenteredShell align="center" itself → the column centres in the 100dvh
// shell at 1440 / 1024 / 390. NO className, NO min-h-dvh, NO media query. Tall copy still scrolls
// from the top (auto offsets collapse), so a long JA/VI message is never clipped.
export function MaintenancePage() {
  return (
    <ErrorSurface
      mode="system"
      status={503}
      brand={<Logo glyph="G" />}
      title={t("errors.503.title")}
      description={t("errors.503.description")}
      maintenance={{
        start: "2026-08-02T18:00:00Z",  // ISO-8601 instants + an IANA zone → Intl.formatRange
        end: "2026-08-02T20:00:00Z",
        timeZone: "Asia/Tokyo",
        progress: 40,                   // 0-100, SERVER-SENT (a client clock breaks hydration)
      }}
      footer={<Text size="xs" tone="muted">2026 GodX</Text>}
      action={<Button onClick={reload}>{t("errors.reload")}</Button>}
    />
  );
}

// ── INERTIA / SSR — one Error page component, one expression ───────────────────────────
// Laravel: Handler::render() → Inertia::render('Error', ['status' => $response->getStatusCode()])
//
//   export default function Error({ status, requestId }) {
//     const isSystem = status >= 500
//     return (
//       <ErrorSurface
//         mode={isSystem ? "system" : "application"}
//         status={status}
//         requestId={requestId}
//         title={t(\`errors.\${status}.title\`)}
//         description={t(\`errors.\${status}.description\`)}
//         action={<Button asChild><Link href="/">{t("errors.backHome")}</Link></Button>}
//       />
//     )
//   }
//   // persistent layout ⇒ 403/404 keep the authenticated shell; 500/503 own the page
//   Error.layout = (page) => (page.props.status < 500 ? <CrmLayout>{page}</CrmLayout> : page)
//
// SSR rules:
//  • ErrorSurface has NO client state / effects / portals → it renders fully server-side. An
//    exception page must be readable without hydration.
//  • Pass the maintenance window as a SERVER-SENT ISO-8601 string + an explicit IANA timeZone.
//    An argless new Date() or the server's local zone ⇒ hydration mismatch.
//  • A 500 page must NOT import the app's query client / data providers — the failure may be
//    inside them. ErrorSurface needs only the AppProvider that supplies the locale.
//
// THEMING: retune with tokens, never a className —
//   --error-surface-max-width | -gap | -padding-block(-compact) | -meta-gap | -meta-row-gap |
//   --error-surface-meta-border (default 'none', rule #44) | --error-surface-progress-max-width
//
// ANTI-PATTERNS: the auth CenteredShell + a generic Card (the workaround; it is the
// UNAUTHENTICATED root with auth-card geometry) · rebuilding nav on the 403 page · two CTAs ·
// className="min-h-dvh flex …" · a hand-built "18:00 - 20:00 JST" string · writing the request id
// into 'description' as prose instead of using the semantic slot.`,
  },

  {
    name: "badge-coloring",
    tagline:
      "Colour a Badge for a localized STATUS via tone + icon; tiers and categories take one neutral tone (colour means status).",
    tags: ["statusbadge", "badge", "tone", "color", "status", "tier", "table"],
    code: `import { Badge } from "@godxjp/ui/data-display"

// Badge auto-colours a fixed set of English LIFECYCLE keys:
//   active/completed (success ✓) · draft (neutral ○) · pending/temporary (warning ⏱)
//   scheduled/sending (info) · cancelled (neutral) · failed/deleted/bounced (destructive ✕)
// Anything else (localized labels, tiers) falls back to neutral grey ○ unless you override.

// 1) Lifecycle with localized text — map to the key, keep JP via children (icon stays):
<Badge status="active">公開中</Badge>        // green ✓ 公開中

// 2) Unknown label — set tone explicitly (no icon, since the key is unknown):
<Badge status="公開中" tone="success" />

// 3) Tier / category — ONE neutral tone for all of them, no glyph. Colour means status;
//    a rainbow of tiers reads as several statuses. Prefer plain text in a table column.
<Badge status="プレミアム" tone="neutral" icon={null} />
<Badge status="ゴールド"   tone="neutral" icon={null} />

// tone: "success" | "warning" | "destructive" | "info" | "neutral"  (import type ToneProp)
// RULE: a chip never wraps — it is pinned white-space: nowrap, so it stays one line in
// narrow table cells. Centralize the domain→tone map in ONE small consumer wrapper and
// import that instead of the raw Badge across pages.`,
  },

  {
    name: "async-data-state",
    aliases: ["loading-states", "data-state", "query-states"],
    tagline:
      "The full async state machine — ONE primary state at a time: prerequisite, disabled-vs-loading, stale refresh, populated, real-empty, and cause-aware error (401/403/404/422/transient) with correct recovery.",
    tags: ["async", "loading", "query", "error", "empty", "prerequisite", "retry", "react-query"],
    code: `import { DataState, classifyQueryError } from "@godxjp/ui/query";
import { EmptyState } from "@godxjp/ui/data-display";
import { SkeletonTable } from "@godxjp/ui/feedback";
import { Building2, Inbox } from "lucide-react";

// ONE primary state renders at a time; DataState makes them mutually exclusive:
//   prerequisite → skeleton(loading) → data → empty → error   (never two at once).
//
// enabled:false is PREREQUISITE/idle, NOT loading. TanStack reports isPending while a query is
// disabled, but fetchStatus stays "idle" (no request in flight) — DataState renders the prerequisite
// slot, so a disabled query shows an instruction, NOT an endless skeleton.
//   const query = useQuery({ queryKey: ["members", orgId], queryFn, enabled: Boolean(orgId) });
//
// A background refetch over EXISTING data keeps the content on screen (no skeleton flash) and
// announces the busy state politely — stale/placeholder refresh is handled for you.
//
// Errors are classified by CAUSE, not blanket-retried:
//   auth (401)         → handled app-wide by <AuthExpiryProvider onAuthExpired> at the root:
//                        auto-redirect to sign-in ONCE, skeleton stays (NOT a retry, NOT an alert)
//   forbidden (403)    → permission message + access path            (no retry)
//   notFound (404)     → contextual not-found                        (no retry)
//   validation (400/422)→ corrective guidance                        (no retry)
//   transient (408/429/5xx/network) → Retry offered automatically
//   unknown            → neutral; opt into Retry via showRetry/onRetry only if it can help
// App root (once): <AuthExpiryProvider onAuthExpired={() => redirectToSignIn(location.href)}>
export function MembersPanel({ query, orgId }: { query: any; orgId?: string }) {
  return (
    <DataState
      query={query}
      prerequisite={<EmptyState icon={Building2} variant="section" title="組織を選択してください"
        description="メンバーを表示するには、上のセレクタで組織を選びます。" />}
      skeleton={<SkeletonTable rows={8} columns={4} />}
      empty={<EmptyState icon={Inbox} variant="section" title="メンバーがいません"
        description="この組織にはまだメンバーが登録されていません。" />}
      isEmpty={(data) => data.items.length === 0}
    >
      {(data) => <MemberTable items={data.items} />}
    </DataState>
  );
}

// Need a bespoke error surface? Pass errorRenderer and branch on the classified category — the
// default detail is always a localized message (never raw token / endpoint / stack text):
//   errorRenderer={(error, retry) => {
//     const { category } = classifyQueryError(error);
//     if (category === "forbidden") return <NoAccess />;
//     if (category === "transient") return <Retryable onRetry={retry} />;
//     return <GenericError />;
//   }}
// RULE: pagination/footer chrome NEVER renders outside the populated-data branch (see data-table-page).`,
  },

  {
    name: "data-table-page",
    aliases: ["filter-bar", "table-state", "list-page"],
    tagline:
      "Filter (Toolbar) + table surface + bottom pagination driven by a query state machine — pagination shows ONLY for successful multi-page data; filters/page survive a transient retry.",
    tags: ["table", "pagination", "filter", "async", "toolbar", "datatable"],
    code: `import { useState } from "react";
import { DataState } from "@godxjp/ui/query";
import { Card, CardContent, DataTable, EmptyState, type ColumnDef } from "@godxjp/ui/data-display";
import { SkeletonTable } from "@godxjp/ui/feedback";
import { SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@godxjp/ui/data-entry";
import { Toolbar, ToolbarGroup, Pagination } from "@godxjp/ui/navigation";
import { Flex } from "@godxjp/ui/layout";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

type Row = { id: string; name: string; status: string };

export function MembersTablePage({ orgId }: { orgId?: string }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // placeholderData: keepPreviousData → on page/filter change the PREVIOUS page stays visible
  // (a stale refresh) instead of flashing a skeleton. enabled gates on the prerequisite (orgId).
  const query = useQuery({
    queryKey: ["members", orgId, q, status, page],
    queryFn: () => fetchMembers({ orgId: orgId!, q, status, page, pageSize }),
    enabled: Boolean(orgId),
    placeholderData: keepPreviousData,
  });

  const columns: ColumnDef<Row>[] = [
    { key: "name", header: "氏名", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "status", header: "ステータス" },
  ];

  return (
    <Flex direction="col" gap="lg">
      {/* Toolbar (filter bar) is STANDALONE and always visible so the user can change filters even
          while a query is idle/loading/empty. Changing a filter resets to page 1. It WRAPS, never
          scrolls sideways (rule #51); more than 2–4 filters → the "list-filters" pattern. Never a
          hand-built Flex/Card of FormFields (ui-audit hand-rolled-filter-bar). */}
      <Toolbar hasActiveFilters={q !== "" || status !== "all"}
        onClear={() => { setQ(""); setStatus("all"); setPage(1); }}>
        <SearchInput placeholder="氏名で検索" value={q} onSearch={(v) => { setQ(v); setPage(1); }} />
        <ToolbarGroup label="ステータス">
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="active">有効</SelectItem>
              <SelectItem value="invited">招待中</SelectItem>
            </SelectContent>
          </Select>
        </ToolbarGroup>
      </Toolbar>

      {/* The table surface owns exactly ONE card. Pagination lives INSIDE the success branch, so it
          is hidden during prerequisite / loading / empty / error and for single-page results. */}
      <DataState
        query={query}
        prerequisite={<EmptyState variant="section" title="組織を選択してください" />}
        skeleton={<Card><CardContent flush><SkeletonTable rows={8} columns={2} /></CardContent></Card>}
        empty={<EmptyState variant="section" title="該当するメンバーがいません" description="検索条件を変更してください。" />}
        isEmpty={(d) => d.items.length === 0}
      >
        {(d) => {
          const totalPages = Math.ceil(d.total / pageSize);
          return (
            <>
              <Card><CardContent flush><DataTable data={d.items} columns={columns} getRowId={(r) => r.id} /></CardContent></Card>
              {totalPages > 1 && (
                <Pagination value={page} total={d.total} pageSize={pageSize} showTotal onValueChange={setPage} />
              )}
            </>
          );
        }}
      </DataState>
    </Flex>
  );
}
// Responsive: Pagination's showTotal range + controls stack at narrow widths automatically.
// A transient retry keeps q/status/page (they live in component state, not the query) — the
// same page reloads in place; the user never loses their filters.`,
  },

  {
    name: "list-filters",
    aliases: ["more-filters", "many-filters", "filter-sheet", "advanced-filters", "add-filter"],
    tagline:
      "A list page with MANY filters (cardinal rule #51) — FilterBar WRAPS; the 2–4 most-used filters stay inline, the rest sit behind ONE 'More filters' Button (count = hidden filters applied) that opens a Sheet; every applied filter is a removable chip. Never a sideways-scrolling strip.",
    tags: [
      "filter",
      "filters",
      "list",
      "toolbar",
      "filter-bar",
      "sheet",
      "chips",
      "search",
      "responsive",
      "datatable",
    ],
    code: `// Research basis: Shopify Polaris Filters ("include no more than 2 or 3 promoted filters"; a
// More button opens a sheet with the rest), Linear (one Filter menu), IBM Carbon filtering
// (filters hidden in a drawer/menu show how many are applied), WCAG 2.2 SC 1.4.10 Reflow
// (search fields and controls are not in the 2-D exception: they reflow, they do not scroll).
//
// RULE #51: a filter bar WRAPS — stacked below 640px, extra rows above — at every width.
// ❌ FilterBar overflow="scroll" (removed in 33.0.0), <ScrollArea orientation="horizontal"> or an
//    overflow-x-auto box around filters: the strip runs off-screen and clips its first label.
// ❌ your own <Flex>/<Card> of FormFields above the table, worst of all justify="between" (filters
//    pushed to the far ends): ui-audit hand-rolled-filter-bar. Filters pack at the START; the
//    only far-end element is FilterBar's \`actions\` slot.
// ✅ the common filters inline + ONE "More filters" Sheet for the rest + wrapping chips.
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@godxjp/ui/general";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@godxjp/ui/data-entry";
import {
  Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader,
  SheetTitle, SheetTrigger,
} from "@godxjp/ui/feedback";
import { Flex } from "@godxjp/ui/layout";
import { FilterBar, FilterBarGroup } from "@godxjp/ui/navigation";

type Option = { value: string; label: string };
type Filters = Record<"q" | "status" | "owner" | "region" | "channel" | "period", string>;
export const NO_FILTERS: Filters = { q: "", status: "", owner: "", region: "", channel: "", period: "" };

const STATUS: Option[] = [{ value: "open", label: "Open" }, { value: "paid", label: "Paid" }, { value: "void", label: "Void" }];
const OWNER: Option[] = [{ value: "me", label: "Me" }, { value: "team", label: "My team" }];
// Everything people reach for less often. Order = the order of the sheet.
const MORE: { key: "region" | "channel" | "period"; label: string; options: Option[] }[] = [
  { key: "region", label: "Region", options: [{ value: "kanto", label: "Kanto" }, { value: "kansai", label: "Kansai" }] },
  { key: "channel", label: "Sales channel", options: [{ value: "web", label: "Web" }, { value: "store", label: "Store" }] },
  { key: "period", label: "Period", options: [{ value: "month", label: "This month" }, { value: "quarter", label: "This quarter" }] },
];
const LABELS: Record<string, { label: string; options: Option[] }> = {
  status: { label: "Status", options: STATUS },
  owner: { label: "Owner", options: OWNER },
  ...Object.fromEntries(MORE.map((f) => [f.key, f])),
};

export function OrderFilters({ value, onValueChange, resultCount }: {
  value: Filters; onValueChange: (next: Filters) => void; resultCount: number;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const set = (key: keyof Filters, v: string) => onValueChange({ ...value, [key]: v });

  // ONE chip per applied filter — inline AND hidden ones, so nothing applied is out of sight.
  const chips = Object.entries(LABELS)
    .filter(([key]) => value[key as keyof Filters] !== "")
    .map(([key, f]) => ({
      value: key,
      label: \`\${f.label}: \${f.options.find((o) => o.value === value[key as keyof Filters])?.label ?? ""}\`,
    }));
  if (value.q) chips.unshift({ value: "q", label: \`Search: \${value.q}\` });
  const hiddenApplied = MORE.filter((f) => value[f.key] !== "").length;

  return (
    <FilterBar
      search={{ value: value.q, onValueChange: (v) => set("q", v), placeholder: "Search orders", ariaLabel: "Search orders" }}
      // The 2–4 most-used filters, INLINE. Typed filters wire each caption as the real <label>.
      filters={[
        { value: "status", label: "Status", options: STATUS, selected: value.status, onSelectedChange: (v) => set("status", v), placeholder: "All" },
        { value: "owner", label: "Owner", options: OWNER, selected: value.owner, onSelectedChange: (v) => set("owner", v), placeholder: "Anyone" },
      ]}
      chips={chips}
      onChipRemove={(key) => set(key as keyof Filters, "")}
      hasActiveFilters={chips.length > 0}
      onClear={() => onValueChange(NO_FILTERS)}
      resultCount={resultCount}
    >
      {/* Children render after the typed filters, before the reset: ONE "More filters" control.
          count = hidden filters applied, so the closed sheet still says so. Button paints a 0 pill by
          default (showZero = true) — showZero={false} hides it when nothing hidden is applied (#1333). */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" count={hiddenApplied} showZero={false} countLabel="applied">
            <SlidersHorizontal aria-hidden="true" />
            More filters
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>More filters</SheetTitle>
            <SheetDescription>Applied filters also show as chips above the list.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            {/* A Sheet scrolls VERTICALLY; the fields stack. The same FilterBarGroup labels them. */}
            <Flex direction="col" gap="md">
              {MORE.map((f) => (
                <FilterBarGroup key={f.key} label={f.label} controlId={\`more-\${f.key}\`}>
                  <Select value={value[f.key]} onValueChange={(v: string) => set(f.key, v)}>
                    <SelectTrigger id={\`more-\${f.key}\`}><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      {f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FilterBarGroup>
              ))}
            </Flex>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild><Button>Show results</Button></SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </FilterBar>
  );
}
// Phone width: the bar stacks (search, each filter, More filters, reset) and the chips wrap.
// A row of filter CHIPS (ToggleGroup) takes \`wrap\` — it does not scroll sideways either.
// Few filters (≤ 4)? Drop the Sheet: the plain bar in the data-table-page pattern is enough.`,
  },

  {
    name: "filter-bar-layouts",
    aliases: [
      "filter-layouts",
      "faceted-filter",
      "faceted-sidebar",
      "saved-views-filter",
      "docked-filter-panel",
      "filter-panel",
      "filter-menu",
    ],
    tagline:
      "Eleven list-filter layouts from leading products, all FilterBar + existing primitives: (a) inline packed, (b) search-first + ONE Filter menu + chips, (c) promoted + More-filters Sheet, (d) saved views above the bar, (e) wide search then filters, (f) actions at the end + sticky, (g) faceted sidebar, (h) compact bar in a table card, (i) date range + quick ranges, (j) phone stack + Sheet, (k) docked side panel. Filters always pack at the START.",
    tags: [
      "filter",
      "filters",
      "layout",
      "faceted",
      "facets",
      "saved views",
      "docked",
      "panel",
      "sidebar",
      "chips",
      "date range",
      "mobile",
      "list",
      "datatable",
    ],
    code: `// Live gallery: docs page navigation/filter-bar-layouts (every layout working, JA/EN/VI data,
// measured at 1280 and 390: filters 12px apart, no sideways overflow).
//
// THE ONE RULE ALL ELEVEN SHARE: filters are PACKED at the start of the bar with its one gap.
// The only element at the far end is FilterBar's actions slot (with the clear button). A Flex/Card
// of FormFields above a table — worst with justify="between" — is ui-audit hand-rolled-filter-bar.
//
// a  inline packed ........ 2–4 frequent filters · Ant Design ProTable query form (collapsed)
//    <FilterBar search={…} filters={[…]} resultCount={n} onClear={…}> + FilterBarGroup(Switch)
// b  search + Filter menu .. search does most of the work · Linear, GitHub issues
// c  promoted + More ....... more than 2–4 filters · Shopify Polaris IndexFilters → pattern list-filters
// d  saved views ........... a view = a whole filter set · Polaris IndexTable views, Jira
//    views={<Tabs controls="results-id">…<TabsTrigger count={n} countLabel="件">…} on FilterBar
// e  two rows .............. the query is the main input · Gmail, Amazon
//    <Flex direction="col" gap="sm"><SearchInput …/><FilterBar filters={[…]}>…</FilterBar></Flex>
// f  actions at the end .... page actions + pinned bar · ProTable toolbar, Stripe lists
//    <FilterBar sticky search filters actions={<><Button>CSV</Button><Button>追加</Button></>} />
// g  faceted sidebar ....... many multi-select facets with counts · Amazon, Rakuten
// h  compact in a card ..... a secondary table owns its filters · GitHub file / Actions tables
//    <Card><CardContent><Flex direction="col" gap="sm"><CardTitle/><FilterBar clearDisplay="icon">…
//    </FilterBar></Flex></CardContent><CardContent flush><DataTable density="compact"/></CardContent></Card>
//    (FilterBar has no size prop; density comes from the app/PageContainer density axis.)
// i  date range ............ time is the first filter · Stripe, Google Analytics
//    <FilterBarGroup label="期間"><Segmented options={7日/30日/四半期/期間指定} /></FilterBarGroup>
//    + <DatePicker range /> in a second FilterBarGroup only when 期間指定 is picked
// j  phone ................. below 640px every FilterBar stacks; extra filters in <SheetContent side="bottom">
// k  docked panel .......... long sessions on one table · Airtable/Notion view filters, Jira, Gmail
//
// SUBMIT-DRIVEN SHAPES (docs page navigation/search-form) — when a live bar is the wrong tool:
// l  検索条件フォーム ....... many conditions / heavy query / users expect 検索 · Ant Design
//    ProComponents QueryFilter → component SearchForm, pattern search-form
// m  condition builder ...... field / operator / value rows, all · any · "1 AND (2 OR 3)", saved
//    views · kintone filters, Salesforce filter logic → pattern condition-builder
// n  advanced search ........ label | input | what the row means · Google Advanced Search → pattern search-form
// o  list view + docked panel  list-view picker, pin, search, Filters panel · Salesforce Lightning
//    list views → pattern condition-builder
//
// Below: b, g and k in full — the three that compose more than FilterBar.
import * as React from "react";
import { ListFilter, PanelRightClose, PanelRightOpen, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { Checkbox } from "@godxjp/ui/data-entry";
import {
  Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";
import { useMediaQuery } from "@godxjp/ui/hooks";
import { Flex, MasterDetail, ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@godxjp/ui/layout";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger,
  FilterBar, FilterBarGroup,
} from "@godxjp/ui/navigation";
import type { PanelImperativeHandle } from "react-resizable-panels";

type Row = { id: string; name: string; country: string };
type Option = { value: string; label: string };
const COUNTRIES: Option[] = [{ value: "vn", label: "Việt Nam" }, { value: "ph", label: "Philippines" }];
const toggle = (list: string[], v: string, on: boolean) => (on ? [...list, v] : list.filter((x) => x !== v));

// ── b. Search first + ONE Filter menu + chips (Linear / GitHub) ──────────────────────────────
export function SearchFirstMenu({ q, setQ, countries, setCountries }: {
  q: string; setQ: (v: string) => void; countries: string[]; setCountries: (v: string[]) => void;
}) {
  const chips = countries.map((c) => ({ value: c, label: "国: " + COUNTRIES.find((o) => o.value === c)?.label }));
  return (
    <FilterBar
      search={{ value: q, onValueChange: setQ, placeholder: "Search", ariaLabel: "Search" }}
      chips={chips}
      onChipRemove={(v) => setCountries(countries.filter((c) => c !== v))}
      hasActiveFilters={chips.length > 0 || q !== ""}
      onClear={() => { setQ(""); setCountries([]); }}
      clearDisplay="icon"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" count={chips.length} showZero={false} countLabel="filters applied">
            <ListFilter aria-hidden="true" />Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>国 · Country</DropdownMenuLabel>
          {COUNTRIES.map((c) => (
            <DropdownMenuCheckboxItem key={c.value} checked={countries.includes(c.value)}
              onCheckedChange={(on) => setCountries(toggle(countries, c.value, on === true))}>
              {c.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </FilterBar>
  );
}

// Facets: a column of FilterBarGroups holding checkboxes — shared by g and k.
function Facets({ countries, setCountries }: { countries: string[]; setCountries: (v: string[]) => void }) {
  return (
    <FilterBarGroup label="国 · Country">
      <Flex direction="col" gap="xs">
        {COUNTRIES.map((c) => (
          <Checkbox key={c.value} checked={countries.includes(c.value)}
            onCheckedChange={(on) => setCountries(toggle(countries, c.value, on === true))}>
            {c.label}
          </Checkbox>
        ))}
      </Flex>
    </FilterBarGroup>
  );
}

// ── g. Faceted sidebar (Amazon / Rakuten): MasterDetail rail on the left; a Sheet when narrow ─
export function FacetedList({ rows, columns, countries, setCountries }: {
  rows: Row[]; columns: ColumnDef<Row>[]; countries: string[]; setCountries: (v: string[]) => void;
}) {
  const wide = useMediaQuery("(min-width: 768px)");
  const table = <Card><CardContent flush><DataTable data={rows} columns={columns} getRowId={(r) => r.id} /></CardContent></Card>;
  if (wide) {
    return (
      <MasterDetail rail="master" railWidth="narrow" collapseBelow={false} masterLabel="絞り込み"
        detailLabel="一覧" master={<Facets countries={countries} setCountries={setCountries} />}>
        {table}
      </MasterDetail>
    );
  }
  return (
    <Flex direction="col" gap="sm">
      <FilterBar hasActiveFilters={countries.length > 0} onClear={() => setCountries([])}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" count={countries.length} showZero={false} countLabel="filters applied">
              <SlidersHorizontal aria-hidden="true" />絞り込み
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader><SheetTitle>絞り込み</SheetTitle></SheetHeader>
            <SheetBody><Facets countries={countries} setCountries={setCountries} /></SheetBody>
            <SheetFooter><SheetClose asChild><Button>結果を表示</Button></SheetClose></SheetFooter>
          </SheetContent>
        </Sheet>
      </FilterBar>
      {table}
    </Flex>
  );
}

// ── k. Docked filter panel (Airtable / Jira / Gmail side panel) ──────────────────────────────
// Persistent (not an overlay), resizable, collapsible, remembers open/closed; chips stay in the
// bar above the table; below 1024px the same facets open in a Sheet instead.
const DOCK_KEY = "my-app:list-filter-panel-open";
export function DockedFilterList({ rows, columns, countries, setCountries }: {
  rows: Row[]; columns: ColumnDef<Row>[]; countries: string[]; setCountries: (v: string[]) => void;
}) {
  const docked = useMediaQuery("(min-width: 1024px)");
  const panelRef = React.useRef<PanelImperativeHandle | null>(null);
  const [open, setOpen] = React.useState(() => {
    try { return localStorage.getItem(DOCK_KEY) !== "false"; } catch { return true; }
  });
  const remember = (next: boolean) => {
    setOpen(next);
    try { localStorage.setItem(DOCK_KEY, String(next)); } catch { /* not remembered, still works */ }
  };
  const chips = countries.map((c) => ({ value: c, label: "国: " + COUNTRIES.find((o) => o.value === c)?.label }));
  const table = <Card><CardContent flush><DataTable data={rows} columns={columns} getRowId={(r) => r.id} /></CardContent></Card>;
  return (
    <Flex direction="col" gap="sm">
      <FilterBar
        chips={chips}
        onChipRemove={(v) => setCountries(countries.filter((c) => c !== v))}
        hasActiveFilters={chips.length > 0}
        onClear={() => setCountries([])}
        actions={docked ? (
          <Button variant="outline" size="sm" aria-expanded={open} aria-controls="list-filter-panel"
            count={chips.length} showZero={false} countLabel="filters applied"
            onClick={() => { if (open) panelRef.current?.collapse(); else panelRef.current?.expand(); remember(!open); }}>
            {open ? <PanelRightClose aria-hidden="true" /> : <PanelRightOpen aria-hidden="true" />}
            {open ? "フィルターパネルを閉じる" : "フィルターパネルを開く"}
          </Button>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" count={chips.length} showZero={false} countLabel="filters applied">
                <SlidersHorizontal aria-hidden="true" />フィルター
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader><SheetTitle>フィルター</SheetTitle></SheetHeader>
              <SheetBody><Facets countries={countries} setCountries={setCountries} /></SheetBody>
            </SheetContent>
          </Sheet>
        )}
      />
      {docked ? (
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel id="list-main" defaultSize="72%" minSize="50%">{table}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel id="list-filter-panel" panelRef={panelRef} collapsible collapsedSize="0%"
            defaultSize={open ? "28%" : "0%"} minSize="20%" maxSize="40%"
            onResize={(size) => { const next = size.asPercentage > 0; if (next !== open) remember(next); }}>
            {/* Render nothing while collapsed: content squeezed to 0px wraps one glyph per line. */}
            {open && (
              <Card>
                <CardHeader><CardTitle level={3}>フィルター</CardTitle></CardHeader>
                <CardContent><Facets countries={countries} setCountries={setCountries} /></CardContent>
              </Card>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : table}
    </Flex>
  );
}
// SplitPane is the non-resizable alternative for k (its aside is always inline-end; aside={null}
// closes it). A LEFT docked panel is g's MasterDetail rail="master".`,
  },

  {
    name: "search-form",
    aliases: [
      "検索条件",
      "検索フォーム",
      "query-filter",
      "query filter",
      "advanced search",
      "advanced-search",
      "search-panel",
    ],
    tagline:
      "「検索条件フォーム」 — SearchForm (Ant Design ProComponents QueryFilter): labelled conditions in aligned columns (label-top or label-left 「表形式」), ranges From〜To, 「部分一致」/「完全一致」, explicit 「検索」 + 「クリア」 (search on SUBMIT), the rest behind 「詳細条件を開く」, then a 「検索条件」 summary + result count. Plus the Google Advanced Search shape (label | input | what the row means).",
    tags: [
      "search",
      "search form",
      "query",
      "filter",
      "検索",
      "検索条件",
      "japanese",
      "business",
      "advanced search",
      "list",
      "datatable",
    ],
    code: `// Live examples: docs page navigation/search-form (l = SearchForm label-top and label-left,
// n = advanced-search form). Research: Ant Design ProComponents QueryFilter (defaultCollapsed
// true, defaultFormItemsNumber, layout vertical/horizontal, labelWidth, search/reset text);
// Google Advanced Search (rows: all these words / this exact phrase / any of these words /
// none of these words / numbers ranging from; then narrow by language, region, last update,
// site, terms appearing, file type).
//
// WHICH SHAPE (rule #51): few filters applied as they change → FilterBar. Many conditions, a heavy
// query, or users who expect a 検索 button → SearchForm. Arbitrary field × operator conditions,
// all/any/custom logic, saved views → pattern condition-builder.
import { useState, type FormEvent } from "react";
import { Card, CardContent, DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { DatePicker, FormField, Input, NumberInput, RadioGroup, Select } from "@godxjp/ui/data-entry";
import { Flex } from "@godxjp/ui/layout";
import { Text } from "@godxjp/ui/general";
import { SearchForm } from "@godxjp/ui/navigation";

type Option = { value: string; label: string };
type Conditions = {
  name: string; match: "partial" | "exact"; nationality: string; occupation: string;
  monthsMin: number | null; monthsMax: number | null;
};
const EMPTY: Conditions = { name: "", match: "partial", nationality: "", occupation: "", monthsMin: null, monthsMax: null };

export function TraineeSearch<T extends { id: string }>({ rows, columns, nationalities, occupations, search }: {
  rows: T[]; columns: ColumnDef<T>[]; nationalities: Option[]; occupations: Option[];
  search: (c: Conditions) => T[];
}) {
  // Inputs edit the DRAFT; 検索 copies it to APPLIED; クリア empties both.
  const [draft, setDraft] = useState<Conditions>(EMPTY);
  const [applied, setApplied] = useState<Conditions>(EMPTY);
  const set = (patch: Partial<Conditions>) => setDraft((cur) => ({ ...cur, ...patch }));
  const results = search(applied);
  const summary = [
    applied.name && "氏名: " + applied.name + (applied.match === "exact" ? "（完全一致）" : "（部分一致）"),
    applied.nationality && "国籍: " + nationalities.find((o) => o.value === applied.nationality)?.label,
    (applied.monthsMin != null || applied.monthsMax != null) && "在籍月数: " + (applied.monthsMin ?? "") + "〜" + (applied.monthsMax ?? ""),
  ].filter(Boolean).join(" / ") || "指定なし";

  return (
    <Flex direction="col" gap="md">
      <Card>
        <CardContent>
          {/* layout="horizontal" labelWidth="7rem" columns={{ base: 1, lg: 2 }} = label-left 表形式 */}
          <SearchForm
            controlWidth="100%"
            onSubmit={(e: FormEvent) => { e.preventDefault(); setApplied(draft); }}
            onReset={() => { setDraft(EMPTY); setApplied(EMPTY); }}
            summary={summary}
            resultCount={results.length}
          >
            <FormField label="氏名" id="ts-name">
              <Flex direction="col" gap="xs">
                <Input id="ts-name" value={draft.name} onChange={(e) => set({ name: e.target.value })} />
                <RadioGroup aria-label="一致条件" orientation="horizontal" value={draft.match}
                  options={[{ value: "partial", label: "部分一致" }, { value: "exact", label: "完全一致" }]}
                  onValueChange={(v) => set({ match: v === "exact" ? "exact" : "partial" })} />
              </Flex>
            </FormField>
            <FormField label="国籍" id="ts-nat">
              <Select id="ts-nat" options={nationalities} value={draft.nationality} placeholder="すべて" allowClear
                onValueChange={(v: string) => set({ nationality: v })} />
            </FormField>
            <FormField label="入国日" id="ts-entry">
              <DatePicker id="ts-entry" range />
            </FormField>
            {/* past the first row: behind 詳細条件を開く, still mounted */}
            <FormField label="在籍月数" id="ts-min">
              <Flex gap="xs" align="center">
                <NumberInput id="ts-min" aria-label="下限" min={0} value={draft.monthsMin} onValueChange={(v) => set({ monthsMin: v })} />
                <Text tone="muted">〜</Text>
                <NumberInput aria-label="上限" min={0} value={draft.monthsMax} onValueChange={(v) => set({ monthsMax: v })} />
              </Flex>
            </FormField>
            <FormField label="職種" id="ts-occ">
              <Select id="ts-occ" options={occupations} value={draft.occupation} placeholder="すべて" allowClear
                onValueChange={(v: string) => set({ occupation: v })} />
            </FormField>
          </SearchForm>
        </CardContent>
      </Card>
      <Card><CardContent flush><DataTable data={results} columns={columns} getRowId={(r) => r.id} /></CardContent></Card>
    </Flex>
  );
}

// ADVANCED-SEARCH SHAPE (Google): one <Form role="search" layout="horizontal" labelWidth="12rem"
// controlWidth="100%" onSubmit>; each row is <ResponsiveGrid columns={{ base: 1, lg: 2 }}> holding
// the FormField and a <Text tone="muted"> that says which search-box syntax the row stands for
// ("Put a minus sign before words you don't want: -withdrawn"); two <Heading level={3}> sections
// (find… / then narrow the results by…); ONE submit Button at the end of the form, and the
// equivalent query string shown with the result count after the search.`,
  },

  {
    name: "condition-builder",
    aliases: [
      "絞り込み条件",
      "条件ビルダー",
      "filter-builder",
      "query-builder",
      "kintone filter",
      "kintone-filter",
      "salesforce list view filter",
      "salesforce-filter",
      "filter logic",
      "list-view-filter",
    ],
    tagline:
      'Condition builder — numbered rows of field / operator / value, 「すべての条件を満たす」 / 「いずれかの条件を満たす」 / custom logic `1 AND (2 OR 3)`, add/remove rows, 「並び順」, save as a named view; applied on SUBMIT inside a role="search" Form. Composition, not a component. Docked beside the list it is the Salesforce list-view filter panel.',
    tags: [
      "filter",
      "condition",
      "builder",
      "query",
      "logic",
      "and",
      "or",
      "kintone",
      "salesforce",
      "saved view",
      "絞り込み",
      "list",
    ],
    code: `// Live examples: docs page navigation/search-form (m = builder, o = list view with the builder in a
// docked panel). Research: kintone's filter rows are field / operator / value (「次のいずれかを
// 含む」, ≦ …) combined with 「すべての条件を満たす」, conditions added with 「絞り込み条件を
// 追加」; the kintone query language joins conditions with and / or and groups them with
// parentheses, sorted by order by. Salesforce numbers each filter (Filter 1, 2, …) and combines
// them with AND / OR / NOT, e.g. (1 AND 2) OR 3; list views are switched from a picker, pinned
// as the default, and edited in a Filters panel (Add Filter → field / operator / value).
//
// A COMPOSITION, not a component: only one of the design systems the library follows names a
// condition builder, the operators are domain policy, and every piece is an existing primitive.
import { useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Badge } from "@godxjp/ui/data-display";
import { Form, FormField, Input, NumberInput, RadioGroup, Select } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Flex, ResponsiveGrid } from "@godxjp/ui/layout";

type Kind = "text" | "choice" | "number";
type Field = { value: string; label: string; kind: Kind; options?: { value: string; label: string }[] };
type Row = { id: number; field: string; operator: string; value: string };
export type Conditions = { match: "all" | "any" | "custom"; logic: string; rows: Row[] };

const OPERATORS: Record<Kind, { value: string; label: string }[]> = {
  text: [{ value: "contains", label: "次のキーワードを含む" }, { value: "notContains", label: "次のキーワードを含まない" }, { value: "eq", label: "＝" }, { value: "neq", label: "≠" }],
  choice: [{ value: "in", label: "次のいずれかを含む" }, { value: "notIn", label: "次のいずれも含まない" }],
  number: [{ value: "eq", label: "＝" }, { value: "neq", label: "≠" }, { value: "gte", label: "≥（以上）" }, { value: "lte", label: "≤（以下）" }],
};

/** Numbered-row logic: "1 AND (2 OR 3)", "NOT 2". null = malformed → show the field error. */
export function compileLogic(expr: string, count: number): ((hits: boolean[]) => boolean) | null {
  const tokens = expr.toUpperCase().match(/\\d+|AND|OR|NOT|\\(|\\)|\\S/g) ?? [];
  let pos = 0;
  type Node = (h: boolean[]) => boolean;
  const or = (): Node | null => { let l = and(); while (l && tokens[pos] === "OR") { pos++; const r = and(); if (!r) return null; const a = l; l = (h) => a(h) || r(h); } return l; };
  const and = (): Node | null => { let l = not(); while (l && tokens[pos] === "AND") { pos++; const r = not(); if (!r) return null; const a = l; l = (h) => a(h) && r(h); } return l; };
  const not = (): Node | null => {
    if (tokens[pos] === "NOT") { pos++; const i = not(); return i ? (h) => !i(h) : null; }
    if (tokens[pos] === "(") { pos++; const i = or(); if (!i || tokens[pos] !== ")") return null; pos++; return i; }
    const n = Number(tokens[pos]);
    if (!Number.isInteger(n) || n < 1 || n > count) return null;
    pos++; return (h) => h[n - 1] ?? false;
  };
  const tree = tokens.length ? or() : null;
  return tree && pos === tokens.length ? tree : null;
}

export function ConditionBuilder({ fields, value, onApply }: {
  fields: Field[]; value: Conditions; onApply: (c: Conditions) => void;
}) {
  const [draft, setDraft] = useState(value);
  const nextId = useRef(Math.max(0, ...value.rows.map((r) => r.id)) + 1);
  const valid = draft.match !== "custom" || compileLogic(draft.logic, draft.rows.length) !== null;
  const patch = (id: number, p: Partial<Row>) => setDraft((c) => ({ ...c, rows: c.rows.map((r) => (r.id === id ? { ...r, ...p } : r)) }));
  const kindOf = (f: string) => fields.find((x) => x.value === f)?.kind ?? "text";
  /** kintone's ＋ adds a blank condition right after its own row; null appends one. */
  const insertAfter = (rows: Row[], afterId: number | null): Row[] => {
    const blank: Row = { id: nextId.current++, field: fields[0].value, operator: OPERATORS[fields[0].kind][0].value, value: "" };
    const at = afterId === null ? rows.length : rows.findIndex((r) => r.id === afterId) + 1;
    return [...rows.slice(0, at), blank, ...rows.slice(at)];
  };

  // role="search" + a real submit: neither form-on-list-page nor hand-rolled-filter-bar flags it.
  return (
    <Form role="search" aria-label="絞り込み条件" controlWidth="100%"
      onSubmit={(e) => { e.preventDefault(); if (valid) onApply(draft); }}>
      <Flex direction="col" gap="md">
        <FormField label="条件の組み合わせ">
          <RadioGroup aria-label="条件の組み合わせ" orientation="horizontal" value={draft.match}
            options={[{ value: "all", label: "すべての条件を満たす" }, { value: "any", label: "いずれかの条件を満たす" }, { value: "custom", label: "条件式を指定" }]}
            onValueChange={(v) => setDraft((c) => ({ ...c, match: v as Conditions["match"] }))} />
        </FormField>
        {draft.rows.map((row, i) => {
          const field = fields.find((f) => f.value === row.field);
          const n = i + 1;
          return (
            // ONE line per condition, kintone-style: [No.] [field] [operator] [value] [＋][−].
            // Container grid: 24 tracks from lg (field 6, operator 5 — narrower but wide enough for
            // 「次のキーワードを含まない」 — value 10), 12 at md (the operator gets the extra track so its
            // longest label is not cut). Below md (a docked panel, a phone) it is 4 tracks and
            // \`dense\` backfills the ＋/− cell beside the number: No. and buttons on the first line,
            // field / operator / value stacked below. align="center" = antd Row align="middle".
            <Flex key={row.id} direction="col" role="group" aria-label={"条件 " + n}>
              <ResponsiveGrid columns={{ base: 4, md: 12, lg: 24 }} gap="sm" align="center" dense>
                <ResponsiveGrid.Item span={{ base: 1, md: 1, lg: 1 }}>
                  <Badge variant="outline">{n}</Badge>
                </ResponsiveGrid.Item>
                <ResponsiveGrid.Item span={{ base: 4, md: 3, lg: 6 }}>
                  <Select aria-label={"条件 " + n + " · フィールド"} options={fields} value={row.field}
                    onValueChange={(f: string) => patch(row.id, { field: f, operator: OPERATORS[kindOf(f)][0].value, value: "" })} />
                </ResponsiveGrid.Item>
                <ResponsiveGrid.Item span={{ base: 4, md: 4, lg: 5 }}>
                  <Select aria-label={"条件 " + n + " · 演算子"} options={OPERATORS[kindOf(row.field)]} value={row.operator}
                    onValueChange={(op: string) => patch(row.id, { operator: op })} />
                </ResponsiveGrid.Item>
                <ResponsiveGrid.Item span={{ base: 4, md: 3, lg: 10 }}>
                  {field?.kind === "choice" ? (
                    <Select aria-label={"条件 " + n + " · 値"} options={field.options ?? []} value={row.value}
                      onValueChange={(v: string) => patch(row.id, { value: v })} />
                  ) : field?.kind === "number" ? (
                    <NumberInput aria-label={"条件 " + n + " · 値"} value={row.value === "" ? null : Number(row.value)}
                      onValueChange={(v) => patch(row.id, { value: v == null ? "" : String(v) })} />
                  ) : (
                    <Input aria-label={"条件 " + n + " · 値"} value={row.value} onChange={(e) => patch(row.id, { value: e.target.value })} />
                  )}
                </ResponsiveGrid.Item>
                <ResponsiveGrid.Item span={{ base: 3, md: 1, lg: 2 }}>
                  <Flex gap="xs" justify="end">
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={"条件 " + n + " の後に条件を追加"}
                      onClick={() => setDraft((c) => ({ ...c, rows: insertAfter(c.rows, row.id) }))}>
                      <Plus aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={"条件 " + n + " を削除"}
                      onClick={() => setDraft((c) => ({ ...c, rows: c.rows.filter((r) => r.id !== row.id) }))}>
                      <Minus aria-hidden="true" />
                    </Button>
                  </Flex>
                </ResponsiveGrid.Item>
              </ResponsiveGrid>
            </Flex>
          );
        })}
        {/* With every row removed there is no ＋ left to press: offer one. */}
        {draft.rows.length === 0 && (
          <Flex>
            <Button type="button" variant="outline" size="sm"
              onClick={() => setDraft((c) => ({ ...c, rows: insertAfter(c.rows, null) }))}>
              <Plus aria-hidden="true" />条件を追加
            </Button>
          </Flex>
        )}
        {draft.match === "custom" && (
          <FormField label="条件式" id="cb-logic" helper="番号付きの条件を AND・OR・NOT と括弧で組み合わせます（例: 1 AND (2 OR 3)）。"
            error={valid ? undefined : "存在する条件の番号、AND・OR・NOT、対応の取れた括弧だけを使ってください。"}>
            <Input id="cb-logic" value={draft.logic} onChange={(e) => setDraft((c) => ({ ...c, logic: e.target.value }))} />
          </FormField>
        )}
        <Flex gap="sm" justify="end" wrap>
          <Button type="button" variant="ghost" onClick={() => setDraft(value)}>変更を元に戻す</Button>
          <Button type="submit" disabled={!valid}>適用</Button>
        </Flex>
      </Flex>
    </Form>
  );
}
// Add 並び順 (Select + Segmented 昇順/降順) and "save as view" (Input + Button) as two more
// FormFields when the screen keeps saved views. Docked beside the list (Salesforce list view):
// <SplitPane asideWidth="lg" aside={open ? <Card>…<ConditionBuilder/>…</Card> : null}> with a
// counted Filters toggle in FilterBar's actions; below 1024px the same builder opens in a Sheet.`,
  },

  {
    name: "organization-memberships",
    aliases: ["organization-switcher", "workspace-switcher", "received-invitations", "memberships"],
    tagline:
      "Workspace membership list — recognizable identity, current/active state, role, permission-aware Open/Switch/Manage/Leave row actions, page-level Create, and CONDITIONAL invitations (omit when none).",
    tags: ["organization", "workspace", "membership", "invitation", "account", "switcher"],
    code: `// Research basis: GitHub organization membership + Slack workspace switching/invitations.
// Each row = recognizable identity (Avatar/logo, NOT an identical decorative icon) + name +
// a "現在" (Current) badge for the active org + role + a permission-aware action menu.
import { Card, CardContent, CardHeader, CardTitle, ListRow, Badge, Avatar, AvatarImage, AvatarFallback, EmptyState } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex } from "@godxjp/ui/layout";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@godxjp/ui/navigation";
import { MoreHorizontal, Plus } from "lucide-react";

type Role = "owner" | "admin" | "member";
type Membership = { id: string; name: string; logoUrl?: string; role: Role; joinedAt: string; isCurrent: boolean; canManage: boolean };
type Invite = { id: string; orgName: string; invitedBy: string };

const ROLE_LABEL: Record<Role, string> = { owner: "オーナー", admin: "管理者", member: "メンバー" };

export function OrganizationMemberships({
  memberships, invitations, onOpen, onSwitch, onManage, onLeave, onCreate, onAccept, onDecline,
}: {
  memberships: Membership[]; invitations: Invite[];
  onOpen: (id: string) => void; onSwitch: (id: string) => void; onManage: (id: string) => void;
  onLeave: (id: string) => void; onCreate: () => void; onAccept: (id: string) => void; onDecline: (id: string) => void;
}) {
  return (
    <Flex direction="col" gap="lg">
      <Card>
        <CardHeader>
          <Flex justify="between" align="center">
            <CardTitle>組織</CardTitle>
            {/* Create belongs at page/section level, not per row. */}
            <Button variant="outline" size="sm" onClick={onCreate}><Plus className="size-4" />組織を作成</Button>
          </Flex>
        </CardHeader>
        {/* flush → ListRows draw their own edge-to-edge dividers. */}
        <CardContent flush>
          {memberships.length === 0 ? (
            <EmptyState variant="section" title="所属している組織がありません" description="新しい組織を作成するか、招待を受け取ってください。" />
          ) : (
            memberships.map((m) => (
              <ListRow
                key={m.id}
                leading={
                  <Avatar>
                    {m.logoUrl ? <AvatarImage src={m.logoUrl} alt="" /> : null}
                    <AvatarFallback>{m.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                }
                title={
                  <Flex gap="sm" align="center">
                    <span className="font-medium">{m.name}</span>
                    {m.isCurrent && <Badge tone="success" icon={null}>現在</Badge>}
                  </Flex>
                }
                description={ROLE_LABEL[m.role]}
                trailing={
                  <Flex gap="sm" align="center">
                    {m.isCurrent
                      ? <Button size="sm" onClick={() => onOpen(m.id)}>開く</Button>
                      : <Button variant="outline" size="sm" onClick={() => onSwitch(m.id)}>切り替え</Button>}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={\`\${m.name} の操作\`}><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onOpen(m.id)}>開く</DropdownMenuItem>
                        {m.canManage && <DropdownMenuItem onSelect={() => onManage(m.id)}>管理</DropdownMenuItem>}
                        {m.role !== "owner" && <DropdownMenuItem onSelect={() => onLeave(m.id)}>退出</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Flex>
                }
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* CONDITIONAL invitations — no pending invites ⇒ render NOTHING (no permanent empty Card).
          Few pending ⇒ a compact actionable list. Many/history ⇒ link to a focused route instead. */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader><CardTitle>保留中の招待</CardTitle></CardHeader>
          <CardContent flush>
            {invitations.map((inv) => (
              <ListRow
                key={inv.id}
                title={<span className="font-medium">{inv.orgName}</span>}
                description={\`\${inv.invitedBy} からの招待\`}
                trailing={
                  <Flex gap="sm">
                    <Button size="sm" onClick={() => onAccept(inv.id)}>参加</Button>
                    <Button variant="ghost" size="sm" onClick={() => onDecline(inv.id)}>辞退</Button>
                  </Flex>
                }
              />
            ))}
          </CardContent>
        </Card>
      )}
    </Flex>
  );
}
// DON'T: passive rows with no action · identical decorative icons · unlabeled timestamps
// (label them: "2024年に参加") · a large empty invitation Card shown permanently.`,
  },

  {
    name: "auth-recovery-panels",
    aliases: [
      "password-recovery",
      "forgot-password",
      "reset-password",
      "mfa-challenge",
      "two-factor-challenge",
      "2fa-challenge",
      "otp-challenge",
      "passkey-failure",
      "scr-008",
    ],
    tagline:
      'Signed-OUT password recovery + sign-in MFA challenge panels (SCR-008). There is NO PasswordRecoveryPanel and NO MfaChallengePanel — compose Card + AuthStack + FormField/InputOTP + Button inside CenteredShell variant="auth-canonical" preset="account-recovery" (the 432px token-owned measure).',
    tags: [
      "auth",
      "authshell",
      "recovery",
      "password",
      "mfa",
      "2fa",
      "otp",
      "inputotp",
      "passkey",
      "layout",
      "presentation",
    ],
    code: `// ⚠️ There is NO <PasswordRecoveryPanel state=…/> and NO <MfaChallengePanel state=…/> in
// @godxjp/ui. What the package owns is the MEASURE:
//    <CenteredShell variant="auth-canonical" preset="account-recovery">   ← 432px panel, 15px gutter at 390
// Docs page: docs/layout/auth-recovery/
//
// PRESENTATION ONLY. No route, no reset semantics, no OTP verification, no recovery-code
// consumption, no passkey authentication, no permissions. The consumer owns all logic and copy.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Input, InputOTP, InputOTPGroup, InputOTPSlot, PasswordInput, PasswordStrength } from "@godxjp/ui/data-entry";
import { Alert, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";
import { Button, Reveal } from "@godxjp/ui/general";
import { AuthFooter, CenteredShell, AuthStack, Flex } from "@godxjp/ui/layout";

// ── THE CANONICAL PANEL ANATOMY — identical for ALL SEVEN states ───────────────────────
//   Card > CardHeader(CardTitle + CardDescription)   ← title/description INSIDE the surface
//        > CardContent > AuthStack
//            [notice]   Alert tone="success|destructive"   (only when the state has one)
//            [fields]   FormField(s): email · password pair · ONE 6-slot InputOTP · one Input
//            [primary]  Button fullWidth                    (spans the panel; exactly one)
//            [fallback] Flex justify="between" gap="sm" wrap (two ghost actions share ONE row)
//
// DON'T put <AuthIdentity> above the panel here — it always renders the hosted mark, and the
// SCR-008 hierarchy puts the heading INSIDE the bordered surface.
// DON'T reuse <TwoFactorSetup> — that is the ENROLLMENT Dialog (QR / manual key / recovery
// output). A sign-in challenge has no secret to reveal and no dialog to dismiss: it IS the page.

// ── SIGN-IN MFA CHALLENGE (otp) ────────────────────────────────────────────────────────
// Focus order IS DOM order: code field → verify → fallback A → fallback B. No tabindex.
// The 6-slot row is ONE field: InputOTP owns paste/arrows/backspace/caret and is a single tab
// stop. Six <Input>s would put six stops in the ring and break paste of a 6-digit code.
export function MfaChallengePage({ code, onCodeChange, error, pending, onVerify }) {
  return (
    <CenteredShell variant="auth-canonical"
      preset="account-recovery"
      brand={brand}
      footer={<AuthFooter product="GoDX ID" terms={termsLink} privacy={privacyLink} locale={localePicker} />}
    >
      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle level={1}>{t("mfa.title")}</CardTitle>
            <CardDescription>{t("mfa.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="mfa-code" label={t("mfa.codeLabel")} error={error} required>
                <InputOTP maxLength={6} pattern="^[0-9]+$" value={code} onChange={onCodeChange}>
                  <InputOTPGroup>
                    {/* six <InputOTPSlot index={0..5} /> */}
                  </InputOTPGroup>
                </InputOTP>
              </FormField>
              <Button fullWidth loading={pending} loadingText={t("common.verifying")} onClick={onVerify}>
                {t("mfa.verify")}
              </Button>
              <Flex justify="between" gap="sm" wrap>
                <Button variant="ghost" size="sm">{t("mfa.useRecoveryCode")}</Button>
                <Button variant="ghost" size="sm">{t("mfa.retryPasskey")}</Button>
              </Flex>
            </AuthStack>
          </CardContent>
        </Card>
      </Reveal>
    </CenteredShell>
  );
}

// ── THE OTHER SIX STATES — same anatomy, only the notice/fields/copy change ─────────────
// The STATE IS NOT A PROP: the server answers, and the route renders the matching body in the
// SAME 432px panel. Nothing is reconstructed, because nothing was torn down.
//
//   password recovery · request        —  fields: email (autoComplete="username")
//   password recovery · sent           —  <Alert tone="success"> + <Button fullWidth disabled> (cooldown)
//   password recovery · new-password   —  two <PasswordInput autoComplete="new-password"> + <PasswordStrength>
//   password recovery · expired        —  <Alert tone="destructive">, primary = request a new link
//   MFA · recovery-code                —  ONE <Input autoComplete="one-time-code">
//   MFA · passkey-failure              —  <Alert tone="destructive">, primary = retry passkey
//
// The masked address in \`sent\` ("h*****@example.co.jp") is produced by the SERVER — the panel
// never reconstructs an identifier, it renders the string it is given.

// ── STATES ─────────────────────────────────────────────────────────────────────────────
//  error    FormField error ⇒ aria-invalid + aria-errormessage + role="alert". Never colour-only.
//  loading  Button loading + loadingText ⇒ aria-busy, the box does not resize, fallbacks disabled.
//  disabled a resend cooldown is <Button disabled> — keep it VISIBLE so the affordance is known.

// ── RESPONSIVE CONTRACT (1440 / 1024 / 390) ────────────────────────────────────────────
//  1440 · 1024   panel 432px, centred, 16px page gutter; OTP one row (6 × 36px = 216px)
//  390           panel 360px at x=15 (15px inline gutter, --auth-shell-recovery-main-padding-mobile),
//                310px content column, OTP still ONE row, primary still full-width, the fallback
//                row wraps to a stack only when the localized labels exceed the column.
//  ⚠️ The 390 canonical reference is a desktop 2×2 COMPOSITE that overflows
//  and crops horizontally. It is NOT a valid mobile source and was not traced; the row above is a
//  DECIDED contract, documented in docs/layout/auth-recovery/ and pinned by tests.

// ANTI-PATTERNS: a page-local --auth-shell-card-max-width override or a .recovery-panel{width:432px}
// class · AuthIdentity above the panel · TwoFactorSetup as a challenge · six Inputs for the OTP row ·
// re-scoping --control-height to widen the slots (use --otp-slot-size) · two primary actions.`,
  },

  {
    name: "account-recovery-settings",
    aliases: ["recovery-email", "backup-codes", "security-settings", "recovery-settings"],
    tagline:
      "Signed-in recovery: compact method status/action rows (email · phone · backup codes) + a separate password-change destination — capability-aware, risk-appropriate, NO stacked Info Alerts.",
    tags: ["account", "recovery", "security", "backup-codes", "password", "settings"],
    code: `// Research basis: Google Account recovery (email/phone + backup codes), Microsoft Security info,
// GitHub recovery codes. Signed-IN recovery SETTINGS (manage your methods) is a DIFFERENT surface
// from the signed-OUT forgot-password JOURNEY — do not mix them on one page.
import { Card, CardContent, CardHeader, CardTitle, ListRow, Badge } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex } from "@godxjp/ui/layout";
import { Mail, Smartphone, KeyRound } from "lucide-react";

type MethodStatus = "verified" | "unverified" | "unavailable";

const STATUS: Record<MethodStatus, { tone: "success" | "warning" | "neutral"; label: string }> = {
  verified: { tone: "success", label: "確認済み" },
  unverified: { tone: "warning", label: "未確認" },
  unavailable: { tone: "neutral", label: "未設定" },
};

function MethodRow({ icon: Icon, name, value, status, action }: {
  icon: React.ComponentType<{ className?: string }>; name: string; value?: string;
  status: MethodStatus; action: React.ReactNode;
}) {
  const s = STATUS[status];
  return (
    <ListRow
      leading={<Icon className="text-muted-foreground size-5" />}
      title={<span className="font-medium">{name}</span>}
      description={value ?? "未設定"}
      trailing={<Flex gap="sm" align="center"><Badge tone={s.tone} icon={null}>{s.label}</Badge>{action}</Flex>}
    />
  );
}

// Compact status/action rows — one row per method, capability-aware. Do NOT stack full-width
// Info Alerts for ordinary status, and do NOT show unavailable features as permanent page content
// beyond a single row that offers to set them up.
export function AccountRecoverySettings({ email, phone, backupCodesSupported, backupCodesRemaining, onChangeEmail, onChangePhone, onRegenerateCodes, onChangePassword }: {
  email?: string; phone?: string; backupCodesSupported: boolean; backupCodesRemaining: number;
  onChangeEmail: () => void; onChangePhone: () => void; onRegenerateCodes: () => void; onChangePassword: () => void;
}) {
  return (
    <Flex direction="col" gap="lg">
      <Card>
        <CardHeader><CardTitle>アカウント復旧</CardTitle></CardHeader>
        <CardContent flush>
          <MethodRow icon={Mail} name="復旧用メール" value={email} status={email ? "verified" : "unavailable"}
            action={<Button variant="outline" size="sm" onClick={onChangeEmail}>{email ? "変更" : "追加"}</Button>} />
          <MethodRow icon={Smartphone} name="復旧用電話番号" value={phone} status={phone ? "verified" : "unavailable"}
            action={<Button variant="outline" size="sm" onClick={onChangePhone}>{phone ? "変更" : "追加"}</Button>} />
          {/* Capability-aware: only render backup codes when the account type supports them. */}
          {backupCodesSupported && (
            <MethodRow icon={KeyRound} name="バックアップコード"
              value={\`残り \${backupCodesRemaining} 個\`} status={backupCodesRemaining > 0 ? "verified" : "unverified"}
              action={<Button variant="outline" size="sm" onClick={onRegenerateCodes}>再生成</Button>} />
          )}
        </CardContent>
      </Card>

      {/* Password change is its OWN destination (risk-appropriate confirmation lives there). */}
      <Card>
        <CardHeader><CardTitle>パスワード</CardTitle></CardHeader>
        <CardContent>
          <Flex justify="between" align="center">
            <span className="text-muted-foreground text-sm">最終更新: 90日前</span>
            <Button variant="outline" onClick={onChangePassword}>パスワードを変更</Button>
          </Flex>
        </CardContent>
      </Card>
    </Flex>
  );
}
// The signed-OUT recovery journey (forgot password → email link → reset) is a separate flow on the
// auth screens (CenteredShell variant="auth"), NOT part of these signed-in settings. Do not surface it here.`,
  },
  {
    name: "transactional-email",
    aliases: ["email-template", "email-tokens", "blade-email", "html-email"],
    tagline:
      "Build a transactional HTML email (Blade/Twig/MJML/React) from @godxjp/ui/email — literal hex + px derived from the web tokens, the canonical GoDX brand mark, a bulletproof CTA, legal footer and mobile reflow. NEVER hand-copy hex or hand-draw the logo in a mail template.",
    tags: ["email", "transactional", "blade", "laravel", "tokens", "brand", "mark", "mjml", "cta"],
    code: `// ───────────────────────────────────────────────────────────────────────
// WHY a separate export: an email is rendered by Blade/Twig/MJML and by clients that strip
// <style>, ignore CSS custom properties and block remote images. So NEITHER the React components
// NOR @godxjp/ui/tokens are reachable — every value must be a LITERAL inline style.
// @godxjp/ui/email is that bridge. It is React-free and dependency-free, and every value is
// DERIVED from src/tokens/ (HSL→hex at module load), so it can never drift from the web palette.
//
// ❌ style="background:#0077c7"                 // hand-copied hex → drifts the first re-theme
// ❌ style="padding: var(--space-8)"            // no email client resolves var()
// ❌ style="width: 30rem"                       // rem is unreliable; use literal px
// ❌ <img src="https://cdn…/logo.png">          // blocked by default in most clients
// ❌ an emerald pill with no internal glyph     // that is the INCOMPLETE mark
// ✅ every value from the token export + the embedded brand mark below

import {
  EMAIL_BRAND_MARK,
  EMAIL_COLORS,
  EMAIL_CTA,
  EMAIL_FOOTER,
  EMAIL_MOBILE,
  EMAIL_SHELL,
  EMAIL_TYPOGRAPHY,
  emailBrandMarkSvg,
  emailInlineStyle,
} from "@godxjp/ui/email";

const c = EMAIL_COLORS;

// 1) THE 480px SHELL — a table, not a div: Outlook's Word renderer has no flex/grid.
const page = emailInlineStyle({ padding: EMAIL_SHELL.pagePadding, backgroundColor: c.background });
const card = emailInlineStyle({
  width: EMAIL_SHELL.width,               // "480px" — EMAIL_SHELL.widthPx (480) for width="480"
  maxWidth: "100%",
  backgroundColor: c.surface,             // ← --card
  border: \`\${EMAIL_SHELL.borderWidth} solid \${c.border}\`,
  borderRadius: EMAIL_SHELL.radius,
});
const body = emailInlineStyle({
  padding: EMAIL_SHELL.padding,           // content column = EMAIL_SHELL.contentWidth (416px)
  fontFamily: EMAIL_TYPOGRAPHY.fontFamily,
  fontSize: EMAIL_TYPOGRAPHY.bodyFontSize,
  lineHeight: EMAIL_TYPOGRAPHY.bodyLineHeight,
  color: c.foreground,
});

// 2) THE BRAND MARK — emerald capsule + internal glyph, embedded, zero network fetch.
//    EMAIL_BRAND_MARK.svg        inline <svg>            (Apple Mail, iOS, Thunderbird)
//    EMAIL_BRAND_MARK.dataUri    data: URL for <img src> (no request)
//    EMAIL_BRAND_MARK.tableHtml  <table> fallback        (renders everywhere)
//    The header is a LOCKUP: mark (22px) + EMAIL_BRAND_MARK.gap + the wordmark at
//    EMAIL_BRAND_MARK.wordmarkFontSize/wordmarkFontWeight. The mark is DECORATIVE there —
//    emailBrandMarkSvg({ label: "" }) — so the wordmark carries the name and it is announced once.
const mark = emailBrandMarkSvg({ label: "" });

// 3) THE CTA — line-height EQUALS height, so the label centres with no flexbox.
const ctaCell = emailInlineStyle({
  height: EMAIL_CTA.height,               // 36px — the canonical box (mirrors --control-height-lg)
  borderRadius: EMAIL_CTA.radius,
  backgroundColor: c.primary,
});
const ctaLink = emailInlineStyle({
  display: "inline-block",
  padding: \`0 \${EMAIL_CTA.paddingX}\`,
  lineHeight: EMAIL_CTA.lineHeight,
  fontSize: EMAIL_CTA.fontSize,
  fontWeight: EMAIL_CTA.fontWeight,
  color: c.primaryForeground,
  textDecoration: "none",
});

// 4) LEGAL FOOTER — quiet type over a hairline; links separated by a fixed-width spacer span
//    (margins between inline links are dropped by several clients).
const footer = emailInlineStyle({
  borderTop: \`\${EMAIL_FOOTER.borderWidth} solid \${c.border}\`,
  paddingTop: EMAIL_FOOTER.paddingTop,
  fontSize: EMAIL_FOOTER.fontSize,
  lineHeight: EMAIL_FOOTER.lineHeight,
  color: c.mutedForeground,
});
const linkSpacer = emailInlineStyle({ display: "inline-block", width: EMAIL_FOOTER.linkGap });

export const html = \`
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr><td align="center" style="\${page}">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0"
           width="\${EMAIL_SHELL.widthPx}" class="email-card" style="\${card}">
      <tr><td class="email-body" style="\${body}">
        \${mark}
        <h1 class="email-heading">Your subject line</h1>
        <p>Your body copy.</p>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tr><td class="email-cta" align="center" style="\${ctaCell}">
            <a class="email-cta-link" href="https://your.app/action" style="\${ctaLink}">Continue</a>
          </td></tr>
        </table>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="\${footer}">
            <p>This mailbox is not monitored.</p>
            <p><a href="#">Help</a><span style="\${linkSpacer}">&#8203;</span><a href="#">Privacy</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>\`;

// 5) MOBILE REFLOW — progressive enhancement ONLY. Every rule below has an inline equivalent
//    above, so a client that strips <style> still renders the desktop layout, never a broken one.
export const mediaQuery = \`
@media (max-width: \${EMAIL_MOBILE.maxWidth}) {
  .email-card { width: \${EMAIL_MOBILE.width} !important; }
  .email-body { padding: \${EMAIL_MOBILE.padding} !important; }
  .email-heading { font-size: \${EMAIL_MOBILE.headingFontSize} !important; }
  .email-cta, .email-cta-link { width: \${EMAIL_MOBILE.ctaWidth} !important; }
}\`;

// 6) BLADE / TWIG / any non-JS engine — dump the same values once in the build step:
//    node --input-type=module -e 'import("@godxjp/ui/email").then(m => process.stdout.write(m.EMAIL_TOKENS_JSON))' > resources/design/email-tokens.json
//    then read the JSON from PHP. Same numbers, same source, no copy-paste.`,
  },
  {
    name: "page-sections",
    aliases: ["cards-in-page", "page-layout", "stack-cards"],
    tagline:
      "A page of several sections: a Heading + section spacing marks a section, not a Card. PageContainer spaces its direct children (section step); Flex gap spaces items inside one (item step). Card only for a real boundary.",
    tags: ["layout", "page", "card", "spacing", "flex", "grid", "section", "heading"],
    code: `import { PageContainer, Flex, ResponsiveGrid } from "@godxjp/ui/layout";
import { Card, CardContent, DataTable, Descriptions, type ColumnDef } from "@godxjp/ui/data-display";
import { Button, Heading } from "@godxjp/ui/general";

type Shot = { id: string; name: string };
const columns: ColumnDef<Shot>[] = [{ key: "name", header: "File" }];

// Two steps, never one uniform gap:
//   section step — between direct children of PageContainer (--page-body-gap). Do NOT add gap-*/mt-*.
//   item step    — inside a section, Flex gap="sm" between its heading and its content.
// A section is a Heading, not a Card. Card is for a real boundary: here, the table surface.
export function ReportPage({ shots }: { shots: Shot[] }) {
  return (
    <PageContainer title="Bug report" extra={<Button>Send</Button>}>
      <Flex direction="col" gap="sm">
        <Heading level={2}>Details</Heading>
        <Descriptions columns={2}>
          <Descriptions.Item label="URL">https://app.example.com/orders</Descriptions.Item>
          <Descriptions.Item label="Browser">Safari 18</Descriptions.Item>
        </Descriptions>
      </Flex>
      <Flex direction="col" gap="sm">
        <Heading level={2}>Screenshots</Heading>
        <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>…</ResponsiveGrid>
      </Flex>
      <Flex direction="col" gap="sm">
        <Heading level={2}>Attachments</Heading>
        <Card>
          <CardContent flush>
            <DataTable data={shots} columns={columns} getRowId={(r) => r.id} />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
`,
  },
  {
    name: "topbar-account-chip",
    aliases: ["user-chip", "account-menu", "signed-in-user"],
    tagline:
      "Signed-in user in a PageContainer `extra` slot: Avatar + name + sign-out as a Flex row of primitives — same control height as the buttons beside it. Never a hand-rolled rounded-full border div.",
    tags: ["auth", "topbar", "avatar", "header", "account", "chip"],
    code: `import { Flex } from "@godxjp/ui/layout";
import { Avatar, AvatarImage, AvatarFallback } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { LogOut } from "lucide-react";

// ❌ <div className="inline-flex items-center gap-1.5 rounded-full border py-0.5">…</div>
//    → 38px tall next to 32px controls, and the audit flags every class on it.
// ✅ a Flex row of real primitives: Avatar (control-sized), Text, an icon Button.
export function AccountChip({ user, onSignOut }: { user: { name: string; email: string; avatarUrl?: string }; onSignOut: () => void }) {
  return (
    <Flex gap="xs" align="center" title={user.email}>
      <Avatar>
        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
        <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <Text>{user.name}</Text>
      <Button variant="ghost" size="icon" aria-label="Sign out" onClick={onSignOut}><LogOut /></Button>
    </Flex>
  );
}

// In the page header, a language Select takes width="auto" so it does not swallow the row:
// <PageContainer title="…" extra={<><Select …><SelectTrigger width="auto">…</SelectTrigger>…</Select><AccountChip … /><Button>Send</Button></>}>
`,
  },
  {
    name: "tenant-brand-color",
    aliases: ["tenanttheme", "customer-brand-color", "runtime-theme", "brand-color"],
    tagline:
      "Wear a CUSTOMER's own hex at runtime, scoped to one region — tenantTheme(hex) returns the token declarations plus the WCAG 2.2 AA label, so you never hand-roll hex\u2192HSL or guess a foreground. There is no <TenantTheme> component and there should not be one.",
    tags: [
      "theme",
      "tenant",
      "multi-tenant",
      "brand",
      "color",
      "colour",
      "contrast",
      "wcag",
      "a11y",
      "runtime",
      "scoped",
      "hex",
      "hsl",
      "white-label",
      "launcher",
    ],
    code: `// ─────────────────────────────────────────────────────────────────────────
// A CUSTOMER's brand colour, at runtime, on ONE region. gh#861 / gh#868.
//
// The colour arrives as DATA (a hex an admin picked in your settings screen),
// not as a stylesheet you author. AppSettingPicker \`brand\` is an ENUM PRESET
// (brand|crm|logistics|partner|slate|dxs) and cannot take an arbitrary hex.
//
// ❌ DON'T hand-roll the conversion or the label. Two consumer repos each wrote
//    their own 18-line hexToHslChannels and their own contrast rule; a wrong
//    label makes nothing red — the text is just hard to read, for end users only.
// ❌ DON'T set --primary alone. It does not travel alone: --primary-foreground
//    does NOT follow it, and --ring is bound at :root where it FREEZES.
// ✅ DO ask the package for the declarations.

import { tenantTheme, contrastRatio, hexToHsl } from "@godxjp/ui/app";

const brand = tenantTheme(tenant.primary_color);      // "#0071bd" · 3- or 6-digit

<div data-tenant={tenant.slug} style={brand.vars}>    // a REGION, not <html>
  <Topbar … />
  <Button>Open app</Button>                            {/* rest, hover AND pressed follow */}
</div>

// brand.vars is exactly eight declarations:
//   --primary  --primary-foreground  --ring  --primary-hover  --primary-active
//   --text-link  --text-brand  --text-primary        ← the brand as INK (gh#887)
// An unusable hex yields EMPTY vars, so the region falls back to your own theme
// instead of breaking the page (same contract ColorPicker already has).

// THE LABEL IS CHOSEN BY CONTRAST, and the ratio is reported so you can check it.
// WCAG 2.2 SC 1.4.3, normal text, 4.5:1. White/black pivot at relative luminance
// 0.179; both candidates measure 4.58:1 there, so the winner ALWAYS clears AA.
//   #FFD400 → #000000 at 14.67:1   ("always white" would have been 1.29:1)
//   #0A1F44 → #ffffff at 16.25:1
brand.foreground  // "#ffffff"
brand.contrast    // 5.13
brand.meetsAA     // true

// ALREADY COMPUTED THE PAIR SERVER-SIDE? Pass it. It is used AS GIVEN — never
// silently replaced — and the result still reports what it achieves.
const supplied = tenantTheme(hex, { foreground: tenant.theme_tokens.foreground });
if (!supplied.meetsAA) {
  // supplied.contrast is the number. The API says NO instead of returning white.
}

// NESTED TENANTS on one page: call it per region. Each region carries its own
// pair, so nothing freezes from the region above it.

// THE BRAND AS INK IS ALSO FLOORED (gh#887) — it used not to be, and that is the
// half of the contract a consumer used to have to write. --primary is guaranteed
// against --primary-foreground: a FILL and its label. Nothing guaranteed the same
// colour as TEXT on a page surface, and a sidebar active item, a NavList item, a
// MegaMenu trigger, an Anchor link, \`Text link\` and \`Button variant="link"\` all do
// exactly that. Measured on /showcase/theme-lab: #FFD400 gave 1.18–2.06:1.
// So the three inks come back as LITERALS, each walked away from the surface until
// the painted pixel clears 4.5:1 and no further — a seed whose ramp step already
// clears is untouched. No call site of yours changes; the roles were always read.
//   #FFD400  link ink 1.73:1 → 4.56:1     #E2564A  3.80:1 → 4.53:1
//   #7C3AED / #2563EB / #0A1F44           byte-identical, they already cleared

// WHICH SURFACE? The DARKEST one the ink lands on — the default is --accent
// (#ebe9e5), not --background, because an ink clamped on the canvas measures
// 3.78:1 the moment the row under it is hovered. Pass your own when the region is
// darker than the package light theme, and ALWAYS for a region inside a dark theme
// (--accent there is #3c3a34) or the ink is walked the wrong way:
const darkRegion = tenantTheme(tenant.primary_color, { surface: "#3c3a34" });

// Still your call whether the raw seed is usable as ink somewhere the library does
// not paint — contrastRatio is the same arithmetic, exported:
if ((contrastRatio(tenant.primary_color, "#ffffff") ?? 0) >= 4.5) {
  // …the seed ITSELF, unclamped, on a white page
}

// The raw conversion, if you need it on its own (the inverse of hslToHex):
hexToHsl("#0071bd");   // "204.13 100% 37.06%"

// Worked screen: /showcase/tenant-brand-color · docs/CUSTOMER-THEMING.md
// Why there is no <TenantTheme> component: docs/COMPOSITION-VS-COMPONENT.md §3.2
`,
  },
  {
    name: "brand-theme-block",
    aliases: [
      "rebrand",
      "design-handoff",
      "brand-motion",
      "motion-tokens",
      "whitelabel",
      "white-label-theme",
      "theme-block",
      "external-brand",
    ],
    tagline:
      "Wear a WHOLE external brand — its palette, shape, type AND its motion spec — as one scoped theme block of token declarations. No forked components, no page-local overrides of library selectors. Use when you are handed a design system (Figma/HTML prototype/brand book), not a single customer hex.",
    tags: [
      "theme",
      "brand",
      "rebrand",
      "handoff",
      "motion",
      "animation",
      "reveal",
      "typography",
      "font",
      "cjk",
      "japanese",
      "tokens",
      "design-system",
      "white-label",
      "marketing",
      "landing",
    ],
    code: `// ─────────────────────────────────────────────────────────────────────────
// A WHOLE BRAND AS A THEME BLOCK.
//
// tenantTheme(hex) is for ONE customer colour arriving as data. This is the
// other job: a design system handed to you (brand book, Figma, an HTML
// prototype) that has its own palette, radii, shadows, type ramp AND motion
// timing. All of it is token configuration. If you find yourself forking a
// component or overriding a .ui-* selector from a page stylesheet, stop —
// that is the signal to file an issue for the missing knob instead.
//
// Worked screens, three different brands: /showcase/acme-website (light/gold),
// /showcase/futurelastic-web (dark/gold), /showcase/tcgm-website (light,
// Japanese, and the one with a MOTION spec).

<div data-tenant="acme">              {/* a REGION, never <html> */}
  <style>{THEME}</style>              {/* in an app this is your theme.css */}
  <Navbar /> <Hero /> <Footer />
</div>

const THEME = \`
[data-tenant="acme"] {
  /* 1 ── COLOUR. Map the brand's hexes onto the ROLES, as HSL triplets. */
  --primary: 192 72% 21%; --primary-foreground: 0 0% 100%;
  --ring: 199 89% 29%;          /* DECLARE IT. --ring is bound at :root and FREEZES;
                                   many brands ring in a different blue than they fill with. */
  --background: 210 40% 98%; --foreground: 195 57% 16%;
  --card: 0 0% 100%; --muted-foreground: 196 17% 39%;
  /* --border is decorative chrome. --input is the CONTROL BOUNDARY and is held to
     3:1 (WCAG 2.2 SC 1.4.11) — brands usually ship a second, darker "border-strong"
     for exactly this; use THAT one here, not the hairline. */
  --border: 196 27% 89%; --input: 197 13% 51%;

  /* 2 ── SHAPE + ELEVATION. Card hover is a TOKEN PAIR, not a hand-written rule:
     "lift 2px, shadow sm→md" == --card-shadow + --card-hover-shadow. */
  --radius-md: 12px; --radius-xl: 20px;
  --card-radius: var(--radius-xl); --control-radius: var(--radius-md);
  --card-shadow: 0 1px 2px rgb(15 76 92 / .06);
  --card-hover-shadow: 0 12px 32px -14px rgb(15 76 92 / .20);

  /* 3 ── TYPE. --font-size-display is the BASE KNOB of the display ramp: 3xl/4xl/5xl
     all derive from it, so never restate --font-size-5xl. Use clamp() or the hero
     paints its desktop size on a phone (measured: 56px at 390 where the brand scale
     said 34px). */
  --font-family-body: "Noto Sans JP", system-ui, sans-serif;
  --font-family-sans: var(--font-family-body);
  --font-family-display: var(--font-family-body);
  --font-size-display: clamp(2.125rem, 4vw, 3.5rem);
  /* ❌ --font-family-display: "Montserrat", "Noto Sans JP", …
     A Latin-only face FIRST in a CJK product looks fine (the browser falls through
     per glyph) while silently setting the Latin inside a Japanese headline in a
     different face than the headline. Keep the CJK face as the display family and
     opt into the Latin face per element instead: */
  --brand-latin: "Montserrat", system-ui, sans-serif;
}
[data-tenant="acme"] .brand-eyebrow,
[data-tenant="acme"] .brand-price { font-family: var(--brand-latin); }

/* 4 ── MOTION. THIS IS THE PART PEOPLE FORK OVER, AND THEY DO NOT NEED TO.
   A brand motion table — press 90ms · hover 140 · state 200 · enter 260 ·
   hero-once 480ms at y8→0 · cubic-bezier(.2,.8,.2,1) — is EIGHT declarations.
   <Reveal>, Card hoverable, Dialog/Sheet enter and every token-driven transition
   retime themselves off these. Zero new @keyframes. */
[data-tenant="acme"] {
  --duration-fast: 140ms;      /* hover / focus  */
  --duration-base: 200ms;      /* state change   */
  --duration-slow: 480ms;      /* hero once      */
  --ease-standard: cubic-bezier(.2,.8,.2,1);
  --ease-emphasized: cubic-bezier(.2,.8,.2,1);
  --ease-decelerate: cubic-bezier(.2,.8,.2,1);
  --reveal-distance: 8px;      /* the spec's "y8→0" */
  --reveal-stagger-step: 70ms;
  /* a11y numbers are tokens too — this brand's standard is a 44px target, above
     the WCAG 2.2 SC 2.5.8 floor of 24px (gh#931): */
  --carousel-arrow-size: 2.75rem;
}
\`;

// 5 ── SPEND THE MOTION, THEN STOP. Most brand books cap decorative motion
// ("one decorative region per viewport; no parallax, no count-up, no infinite
// float"). Read the spec before adding effects — adding more is not proving the
// framework, it is breaking the brand.

<Reveal on="mount">                 {/* hero: illustration only, if the spec says
                                       "text appears immediately" — then DON'T wrap
                                       the headline, so it paints on frame 1 */}
  <img src={heroArt} alt="…" />
</Reveal>

<Reveal on="view">                  {/* one observer per SECTION */}
  <SectionHeading />
</Reveal>
<ResponsiveGrid columns={{ base: 2, sm: 3, lg: 4 }}>
  {items.map((it, i) => (
    <Reveal key={it.id} on="view" delay={Math.min(i, 5) + 1}>   {/* delay caps at 6 */}
      <Card hoverable>…</Card>
    </Reveal>
  ))}
</ResponsiveGrid>

// ❌ THE ONE THAT BITES: never put on="view" on something a scroller CLIPS.
//    <Carousel><CarouselItem><Reveal on="view">…  ← 3 of 4 slides stayed at
//    opacity 0 FOREVER: the observer's root is the viewport and a clipped box has
//    an empty intersection rect, so a slide parked outside the rail never enters.
// ✅ Reveal the RAIL:
<Reveal on="view">
  <Carousel>
    <CarouselContent>
      {news.map((n) => (
        <CarouselItem key={n.id} className="basis-4/5 sm:basis-1/2 lg:basis-1/3">
          <Card hoverable>…</Card>          {/* fractional basis, never basis-[82%] */}
        </CarouselItem>
      ))}
    </CarouselContent>
  </Carousel>
</Reveal>

// 6 ── VERIFY BY MEASURING, NOT BY SCREENSHOT. A full-page screenshot does not
// fire viewport observers, so every scroll reveal photographs as invisible and
// tells you nothing. Scroll the document, then count:
//   [...document.querySelectorAll('.ui-reveal')]
//     .filter(e => e.getAttribute('data-reveal-state') === 'out').length   // must be 0
//   document.documentElement.scrollWidth - document.documentElement.clientWidth // must be 0
// Check the hero's computed font-size at 390, and remember ResponsiveGrid steps
// are CONTAINER widths: inside a 1280 shell with 32px gutters, a 768 tablet hands
// the grid 704px, so \`md\` (48rem) never fires there — key that column to \`sm\`.
`,
  },
];

/** Resolve a pattern by its canonical name OR any alias (case-insensitive). */
export function findPattern(name: string): PatternEntry | undefined {
  const slug = name.trim().toLowerCase();
  return PATTERNS.find((p) => p.name === slug || p.aliases?.includes(slug));
}

export function searchPatterns(query: string): PatternEntry[] {
  const q = query.trim().toLowerCase();
  if (q === "") return PATTERNS;
  return PATTERNS.filter(
    (p) =>
      p.name.includes(q) ||
      p.aliases?.some((a) => a.includes(q)) ||
      p.tagline.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)),
  );
}

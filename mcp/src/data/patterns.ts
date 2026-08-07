/**
 * Canonical code patterns for common consumer scenarios. The MCP
 * server returns one of these whenever a consumer asks "how do I X
 * with @godxjp/ui?" — saves the LLM from synthesising from primitive
 * docs over and over.
 *
 * Every pattern is copy-paste-ready: imports listed at top, types
 * spelled out, inline JSX with no opaque helpers. Every `import { … }
 * from "@godxjp/ui…"` is verified against the REAL package export set
 * by scripts/check-mcp-pattern-imports.mjs (release-sync guard), so a
 * pattern can never teach a removed API (e.g. the deleted Stack/Inline
 * layout primitives — use `Flex direction="col"`).
 */

export interface PatternEntry {
  /** URL-safe slug. */
  name: string;
  /** Alternate slugs that resolve to this pattern (older/other names a consumer may ask for). */
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
// ✅  <ResponsiveGrid columns={4}><StatCard label="x" value="1" /></ResponsiveGrid>
//    Need a section title? Use a heading, NOT a Card:
// ✅  <Flex direction="col" gap="sm"><div className="text-sm font-medium">KPI</div>
//        <ResponsiveGrid columns={4}><StatCard .../></ResponsiveGrid></Flex>

// 2) Badge renders grey with a ○ (no colour) for localized/tier labels
//    Cause: it auto-maps only English lifecycle keys.
// ❌  <Badge status="プレミアム" />
// ✅  <Badge status="プレミアム" tone="success" icon={null} />   // tier → pill, no icon
// ✅  <Badge status="active">公開中</Badge>                       // lifecycle → keep icon

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
import { FormField, Input } from "@godxjp/ui/data-entry";
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
      {/* < lg: horizontal, scrollable route tabs. */}
      <nav aria-label="設定" className="flex gap-1 overflow-x-auto lg:hidden">
        {SECTIONS.map((s) => (
          <NavLink key={s.to} to={s.to} className={link} end>{s.label}</NavLink>
        ))}
      </nav>
      {/* >= lg: persistent vertical local nav (bounded width, does not shrink). */}
      <nav aria-label="設定" className="hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:gap-1">
        {SECTIONS.map((s) => (
          <NavLink key={s.to} to={s.to} className={link} end>{s.label}</NavLink>
        ))}
      </nav>
      {/* Bounded content region (~42rem) — the routed section renders here. min-w-0 lets it shrink. */}
      <main className="min-w-0 max-w-2xl flex-1"><Outlet /></main>
    </Flex>
  );
}

// A settings section. Horizontal label/control rows on desktop (collapse to stacked on mobile),
// controls bounded to a semantic width. FormField OWNS the label↔control relationship — do NOT
// hand-roll <Label> + <input>. Save feedback = Button loading prop + a toast in onSuccess.
export function GeneralSettingsSection({
  defaults, onSave, saving, error,
}: { defaults: { name: string; email: string }; onSave: (v: FormData) => void; saving: boolean; error?: string }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(new FormData(e.currentTarget)); }}>
      <Flex direction="col" gap="md">
        <FormField id="ws-name" label="ワークスペース名" layout="horizontal" controlWidth="24rem"
          helper="請求書や共有リンクに表示されます。" error={error}>
          <Input id="ws-name" name="name" defaultValue={defaults.name} />
        </FormField>
        <FormField id="ws-email" label="連絡先メール" layout="horizontal" controlWidth="24rem">
          <Input id="ws-email" name="email" type="email" defaultValue={defaults.email} />
        </FormField>
        <Flex gap="sm"><Button type="submit" loading={saving}>変更を保存</Button></Flex>
      </Flex>
    </form>
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
      "The four canonical settings BLOCKS — identity · preference rows · billing handoff · danger zone — composed from Card + ListRow + Descriptions + StatusBadge + AlertDialog. A COMPOSITION pattern: godx-ui ships no SettingsSection/SettingsRow/DangerZone component and never will.",
    tags: ["settings", "account", "billing", "danger", "preferences", "listrow", "card", "admin"],
    code: `// gh#216. Gate 0 (docs/COMPOSITION-VS-COMPONENT.md): a "SettingsSection"/"SettingsRow"/
// "DangerZone" FAILS the Framework-Component Test — it owns no behavior (C2), is fully
// expressible from existing primitives + tokens (C3), and its API would be screen-shaped (C4).
// So compose it. Live reference screen: the "settings account sections" page in the preview
// showcase gallery (docs/showcase/, served at /showcase/<id>).
import { ExternalLink, ShieldAlert } from "lucide-react";
import { Button, Text } from "@godxjp/ui/general";
import {
  Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
  Descriptions, ListRow, StatusBadge,
} from "@godxjp/ui/data-display";
import { Switch } from "@godxjp/ui/data-entry";
import { AlertDialog } from "@godxjp/ui/feedback";
import { Flex } from "@godxjp/ui/layout";

// 1) IDENTITY — metadata is a description list, so it is Descriptions (a real <dl>), never a
//    two-column flex of styled divs. One header action goes in CardAction.
<Card>
  <CardHeader>
    <CardTitle level={2}>アカウント情報</CardTitle>
    <CardDescription>請求書・監査ログに表示される氏名とメールアドレスです。</CardDescription>
    <CardAction><Button variant="outline" size="sm">編集</Button></CardAction>
  </CardHeader>
  <CardContent>
    <Descriptions columns={2}>
      <Descriptions.Item label="表示名">藤原 慧</Descriptions.Item>
      <Descriptions.Item label="メールアドレス">satoshi@example.co.jp</Descriptions.Item>
      <Descriptions.Item label="従業員番号" mono>EMP-1042-JP</Descriptions.Item>
      <Descriptions.Item label="利用開始日">
        {/* ISO-8601 in the machine attribute, Intl for the human text. */}
        <time dateTime="2023-04-01">
          {new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(since)}
        </time>
      </Descriptions.Item>
    </Descriptions>
  </CardContent>
</Card>

// 2) PREFERENCE ROWS — THE setting row pattern: CardContent flush + ListRow, whose \`trailing\`
//    slot IS the control. align="start" + overflow="wrap" keep long JA/VI titles readable and let
//    the control drop to its own line at 390px (--list-row-body-min-width).
// ⛔ NEVER: <div className="flex items-center justify-between border-b py-3">…</div>
<Card>
  <CardHeader><CardTitle level={2}>通知の環境設定</CardTitle></CardHeader>
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

// 3) BILLING HANDOFF — the subscription state is a CANONICAL StatusBadge; the tone + icon come
//    from the library's shared domain-status map, so a page NEVER keeps its own status→colour
//    table. Money/seats/dates go through Intl (ISO 4217 minor units come from the formatter).
// ⛔ NEVER: const STATUS_COLORS = { past_due: "red", trialing: "blue" }
<Card>
  <CardHeader>
    <CardTitle level={2}>請求とサブスクリプション</CardTitle>
    <CardDescription>支払い方法と請求書は外部の請求ポータルで管理します。</CardDescription>
    <CardAction><StatusBadge status="past_due" variant="outline" /></CardAction>
  </CardHeader>
  <CardContent>
    <Descriptions columns={2}>
      <Descriptions.Item label="契約プラン">ビジネス（年額）</Descriptions.Item>
      <Descriptions.Item label="次回請求予定額">
        {new Intl.NumberFormat(locale, { style: "currency", currency: "JPY" }).format(1536000)}
      </Descriptions.Item>
    </Descriptions>
  </CardContent>
  <CardFooter separated>
    <Button variant="outline" asChild>
      <a href={portalUrl} target="_blank" rel="noreferrer">
        <ExternalLink aria-hidden="true" />
        請求ポータルを開く
        {/* Never signal "leaves the app" with the icon alone (WCAG 1.4.1 / 2.4.4). */}
        <span className="sr-only">（新しいタブで開きます）</span>
      </a>
    </Button>
  </CardFooter>
</Card>

// 4) DANGER ZONE — Card accent="destructive" paints the semantic leading rail from --destructive
//    through the existing --card-accent-rail-width token. NO new component, NO new token, and no
//    baked red. Colour never carries the meaning alone: the heading says "irreversible", each row
//    says what is lost, and delete is gated behind type-to-confirm friction.
<Card accent="destructive">
  <CardHeader>
    <CardTitle level={2} className="text-destructive">取り消せない操作</CardTitle>
    <CardDescription>以下の操作は元に戻せません。</CardDescription>
  </CardHeader>
  <CardContent flush>
    <ListRow
      align="start"
      overflow="wrap"
      leading={<ShieldAlert className="text-destructive size-4" aria-hidden="true" />}
      title="ワークスペースと全データを完全に削除する"
      description="勤怠記録・申請履歴・監査ログがすべて削除されます。"
      trailing={
        <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>削除</Button>
      }
    />
  </CardContent>
</Card>

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
// ✅ Sections stack in a bounded column: <Flex direction="col" gap="lg" className="max-w-3xl">.
// ✅ Every setting row is a ListRow; its control lives in \`trailing\`, and the visible row title is
//    a <label htmlFor> pointing at that control so the switch/select is named by what you can read.
// ⛔ Do NOT add SettingsSection / SettingsRow / DangerZone to src/components — they fail Gate 0.
// ⛔ Do NOT wrap the WHOLE settings page in one Card (route-backed local nav owns the IA — see the
//    responsive settings page pattern); each block is its own Card.
// ⛔ Do NOT hand-roll padding (p-4) on a Card, a status colour map, or a <dl> replacement.`,
  },

  {
    name: "confirm-destructive",
    tagline:
      'Type-to-confirm destructive dialog — Dialog mode="confirm" + Input gate + toast (real @godxjp/ui API).',
    tags: ["dialog", "confirm", "destructive", "delete"],
    code: `import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@godxjp/ui/feedback";
import { Input } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Flex } from "@godxjp/ui/layout";
import { toast } from "sonner";

export function DeleteProjectDialog({ open, onOpenChange, slug }: { open: boolean; onOpenChange: (v: boolean) => void; slug: string }) {
  const [confirm, setConfirm] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange} mode="confirm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>プロジェクトを削除</DialogTitle>
          <DialogDescription>この操作は取り消せません。確認のためプロジェクト名 "{slug}" と入力してください。</DialogDescription>
        </DialogHeader>
        <Flex direction="col" gap="md">
          <Input value={confirm} onValueChange={(e) => setConfirm(e.target.value)} placeholder={slug} />
        </Flex>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button tone="destructive" disabled={confirm !== slug} onClick={() => { toast.success("削除しました"); onOpenChange(false); }}>完全に削除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      "Inertia + @godxjp/ui list page — PageContainer + Toolbar + DataTable + Badge + Pagination (current primitive API).",
    tags: ["inertia", "list", "table", "page", "filter", "pagination", "datatable", "crm"],
    code: `import { Head, router } from "@inertiajs/react"
import { useMemo, useState } from "react"
import { PageContainer, ResponsiveGrid, Flex } from "@godxjp/ui/layout"
import { Card, CardContent, StatCard, DataTable, EmptyState, Badge, type ColumnDef } from "@godxjp/ui/data-display"
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
    { key: "scope", header: "スコープ", render: (c) => <Badge status={c.scope} tone="info" icon={null} /> },
    { key: "status", header: "ステータス", render: (c) => <Badge status={c.status} /> },
    { key: "valid", header: "有効期間", render: (c) => \`\${formatDate(c.validFrom)} 〜 \${formatDate(c.validTo)}\` },
    { key: "usage", header: "利用数", align: "right", render: (c) => c.usage.toLocaleString() },
  ]

  return (
    <>
      <Head title="クーポン管理" />
      {/* RULE: every page wraps in PageContainer; vertical rhythm via Flex direction="col"/ResponsiveGrid, never p-*/gap-* */}
      <PageContainer title="クーポン管理" subtitle="配信中のクーポン一覧">
        <Flex direction="col" gap="lg">
          <ResponsiveGrid columns={3}>
            <StatCard label="公開中" value={coupons.filter((c) => c.status === "公開中").length} />
            <StatCard label="総利用数" value={coupons.reduce((s, c) => s + c.usage, 0).toLocaleString()} />
            <StatCard label="件数" value={coupons.length} />
          </ResponsiveGrid>

          {/* Toolbar is the filter-bar primitive (standalone, above the table surface). */}
          <Toolbar hasActiveFilters={q !== "" || status !== "all"} onClear={() => { setQ(""); setStatus("all"); setPage(1) }}>
            {/* SearchInput is value + onSearch(v) — NOT onChange */}
            <SearchInput placeholder="クーポン名で検索" value={q} onSearch={(v) => { setQ(v); setPage(1) }} />
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
                ? <EmptyState title="該当するクーポンがありません" description="検索条件を変更してください。" />
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
      "Inertia detail page — receives {id} prop, Descriptions (compound) + StatCard + EmptyState fallback.",
    tags: ["inertia", "detail", "show", "page", "keyvaluegrid", "crm"],
    code: `import { Head, router } from "@inertiajs/react"
import { PageContainer, ResponsiveGrid, Flex } from "@godxjp/ui/layout"
import { Card, CardContent, StatCard, EmptyState, Descriptions, Badge } from "@godxjp/ui/data-display"
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
        <PageContainer title="会員詳細" subtitle="会員が見つかりません">
          <EmptyState title="会員が見つかりません" description={\`ID「\${id}」は存在しません。\`} />
          <Button variant="outline" onClick={() => router.visit("/members")}><ArrowLeft className="size-4" />一覧へ戻る</Button>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Head title={member.name} />
      <PageContainer title={member.name} subtitle={\`\${member.id} / \${member.rank}\`}>
        <Flex direction="col" gap="lg">
          <ResponsiveGrid columns={4}>
            <StatCard label="累計購入額" value={\`¥\${member.total.toLocaleString()}\`} />
            <StatCard label="来店回数" value={member.visits} />
            <StatCard label="ポイント" value={member.points.toLocaleString()} />
            <StatCard label="LTV" value={\`¥\${member.ltv.toLocaleString()}\`} />
          </ResponsiveGrid>
          <Card>
            <CardContent>
              {/* Descriptions is COMPOUND — value goes in children, not a prop */}
              <Descriptions columns={2}>
                <Descriptions.Item label="氏名">{member.name}</Descriptions.Item>
                <Descriptions.Item label="ランク"><Badge status={member.rank} tone="info" icon={null} /></Descriptions.Item>
                <Descriptions.Item label="ステータス"><Badge status={member.status} /></Descriptions.Item>
                <Descriptions.Item label="登録日">{formatDate(member.registeredAt)}</Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>
        </Flex>
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
      '403 / 404 / 500 / 503 exception pages. USE THE COMPONENT: import { ErrorSurface } from "@godxjp/ui/layout". `mode="application"` (403/404) is the body you put inside the AppShell the route already renders; `mode="system"` (500/503) owns the page via CenteredShell align="center".',
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
    code: `// @godxjp/ui SHIPS <ErrorSurface> (gh#221 → gh#251). Do NOT hand-compose an error page from
// AuthShell + a generic Card + a local ".canonical-auth-card" — that workaround IS the regression.
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
// ANTI-PATTERNS: AuthShell + a generic Card (the gh#251 workaround; AuthShell is the
// UNAUTHENTICATED root with auth-card geometry) · rebuilding nav on the 403 page · two CTAs ·
// className="min-h-dvh flex …" · a hand-built "18:00 - 20:00 JST" string · writing the request id
// into 'description' as prose instead of using the semantic slot.`,
  },

  {
    name: "badge-coloring",
    tagline: "Colour a Badge for localized labels and tiers via tone + icon (escape-hatch props).",
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

// 3) Tier / category — coloured pill, drop the misleading glyph with icon={null}:
<Badge status="プレミアム" tone="success" icon={null} />
<Badge status="ゴールド"   tone="warning" icon={null} />
<Badge status="法人共通"   tone="info"    icon={null} />

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
//   auth (401)         → onAuthError: renew session / sign in again  (NOT a retry)
//   forbidden (403)    → permission message + access path            (no retry)
//   notFound (404)     → contextual not-found                        (no retry)
//   validation (400/422)→ corrective guidance                        (no retry)
//   transient (408/429/5xx/network) → Retry offered automatically
//   unknown            → neutral; opt into Retry via showRetry/onRetry only if it can help
export function MembersPanel({ query, orgId, onSignIn }: {
  query: any; orgId?: string; onSignIn: () => void;
}) {
  return (
    <DataState
      query={query}
      prerequisite={<EmptyState icon={Building2} variant="section" title="組織を選択してください"
        description="メンバーを表示するには、上のセレクタで組織を選びます。" />}
      skeleton={<SkeletonTable rows={8} columns={4} />}
      empty={<EmptyState icon={Inbox} variant="section" title="メンバーがいません"
        description="この組織にはまだメンバーが登録されていません。" />}
      isEmpty={(data) => data.items.length === 0}
      onAuthError={onSignIn}
    >
      {(data) => <MemberTable items={data.items} />}
    </DataState>
  );
}

// Need a bespoke error surface? Pass errorRenderer and branch on the classified category — the
// default detail is always a localized message (never raw token / endpoint / stack text):
//   errorRenderer={(error, retry) => {
//     const { category } = classifyQueryError(error);
//     if (category === "auth") return <SessionExpired onRenew={onSignIn} />;
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
          while a query is idle/loading/empty. Changing a filter resets to page 1. */}
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
    name: "rbac-service-roles",
    aliases: [
      "service-role-panel",
      "servicerolepanel",
      "branch-scope-picker",
      "branchscopepicker",
      "permission-matrix",
      "permissionmatrix",
      "role-editor",
      "rbac",
      "scr-203",
      "scr-111b",
    ],
    tagline:
      "Service roles, branch scope and the permission matrix. There is NO ServiceRolePanel, NO BranchScopePicker and NO PermissionMatrix component — all three FAIL the Framework-Component Test and are canonical COMPOSITIONS of existing primitives, with the only genuinely reusable part (the grant/diff data logic) shipped as @godxjp/ui/lib/permission-grid.",
    tags: [
      "rbac",
      "permissions",
      "roles",
      "admin",
      "table",
      "treeselect",
      "listrow",
      "masterdetail",
      "presentation",
    ],
    code: `// ⚠️ There is NO <ServiceRolePanel/>, NO <BranchScopePicker/> and NO <PermissionMatrix/> in
// @godxjp/ui, and none is planned (gh#257). Each fails the Framework-Component Test
// (docs/COMPOSITION-VS-COMPONENT.md): they own no reusable BEHAVIOR beyond what Table / TreeSelect
// / ListRow already give (C2), they are expressible today from primitives + tokens (C3), and they
// are RBAC-admin-niche rather than universal (C7). What the package DOES own is the part every
// consumer would otherwise re-derive: the grant/diff logic, as pure framework-neutral helpers.
//
// The three canonical compositions, and the ONE import you actually need:

import {
  countDifferences,
  grantKey,
  hasGrant,
  rolesDifferOnPermission,
  visibleRows,
} from "@godxjp/ui/lib/permission-grid";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ListRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";
import { FormField, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SHOW_PARENT, Switch, TreeSelect } from "@godxjp/ui/data-entry";
import { Alert, AlertDescription, AlertDialog, AlertTitle, Skeleton } from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";
import { Flex, MasterDetail, PageContainer } from "@godxjp/ui/layout";

// ── 1. SERVICE ROLE PANEL ────────────────────────────────────────────────────────────────────
// "which role does this member hold on each service" = a labelled list of rows, each with a role
// Select. Card + CardContent flush + <ul> of ListRow as="li" gives shared row dividers instead of
// a card outline per service. READ-ONLY / LOCKED is a Badge, NOT a disabled Select: a disabled
// control is a dead tab stop that says "you may change this later", which is not what locked means.
<Card>
  <CardHeader>
    <CardTitle level={2}>サービス権限</CardTitle>
    <CardDescription>サービスごとに付与するロールを選択します。</CardDescription>
  </CardHeader>
  <CardContent flush>
    <ul>
      {services.map((service) => (
        <ListRow
          as="li"
          key={service.id}
          title={service.name}
          description={service.description}
          trailing={
            service.locked ? (
              <Badge tone="neutral">{service.roleLabel}（変更不可）</Badge>
            ) : (
              <Select value={service.roleId} onValueChange={(next) => assign(service.id, next)}>
                <SelectTrigger aria-label={\`\${service.name} のロール\`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }
        />
      ))}
    </ul>
  </CardContent>
</Card>

// ── 2. BRANCH SCOPE PICKER ───────────────────────────────────────────────────────────────────
// A branch scope is a HIERARCHICAL multi-select with parent/child aggregation — which is exactly
// TreeSelect. Do NOT hand-roll a checkbox tree, and do NOT add a BranchScopePicker: that would
// duplicate a primitive (the cardinal no-duplication rule). SHOW_PARENT collapses a fully selected
// subtree to its parent, which is what makes "全社" read as one chip instead of 42.
<FormField
  label="適用範囲（支店）"
  required
  helper="選択した支店とその配下にのみ権限が適用されます。"
  error={scope.length === 0 ? "少なくとも1つの支店を選択してください。" : undefined}
>
  <TreeSelect
    multiple
    treeCheckable
    showSearch
    showCheckedStrategy={SHOW_PARENT}
    treeData={branches}
    value={scope}
    onValueChange={setScope}
    disabled={readOnly}
  />
</FormField>

// ── 3. PERMISSION MATRIX ─────────────────────────────────────────────────────────────────────
// role × permission grid with a sticky first column, a two-role COMPARE mode and a
// differences-only filter. Built from the Table family + Badge; the DATA logic is the library
// helper, so every consumer shares one source of truth for grant lookup and diffing.
// State is shape-encoded (Check vs Minus icon) plus sr-only text — never colour alone (WCAG 1.4.1).
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="sticky start-0">権限</TableHead>
      {roles.map((role) => <TableHead key={role.id}>{role.name}</TableHead>)}
    </TableRow>
  </TableHeader>
  <TableBody>
    {visibleRows(permissions, grants, { compare, diffOnly }).map((permission) => (
      <TableRow key={permission.id} data-diff={compare && rolesDifferOnPermission(grants, compare, permission.id)}>
        <TableCell className="sticky start-0">{permission.name}</TableCell>
        {roles.map((role) => (
          <TableCell key={grantKey(role.id, permission.id)}>
            {hasGrant(grants, role.id, permission.id)
              ? <><Check aria-hidden="true" /><span className="sr-only">許可</span></>
              : <><Minus aria-hidden="true" /><span className="sr-only">不許可</span></>}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>

// ── THE STATES, all from existing exports — never bespoke markup ─────────────────────────────
//   loading            → <Skeleton/> rows (match the settled row height so nothing jumps)
//   empty              → <EmptyState title=… description=…/>
//   validation         → FormField \`error\` (announced via aria-errormessage, not colour)
//   error              → <Alert tone="destructive"> with a retry action
//   permission-denied  → <Alert tone="warning"> for a SECTION; <ErrorSurface mode="denied"> when
//                        the whole page is forbidden (never render a page header that leaks the
//                        resource's name)
//   read-only / locked → a Badge stating the fact, NOT a disabled control
//   destructive        → <AlertDialog variant="destructive" title=… onConfirm=…> (revoking a
//                        role is not undoable from the UI; add \`challenge\` for type-to-confirm)
//
// LAYOUT: put the role list and the editor side by side with <MasterDetail> — it owns the tracks,
// the gap and the stacking threshold as tokens, so there is no grid-template-columns and no media
// query in your page at 1440 / 1024 / 390.
//
// Full worked screen: docs/showcase/permission-matrix.tsx and docs/showcase/service-role-scope.tsx`,
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
      'Signed-OUT password recovery + sign-in MFA challenge panels (SCR-008). There is NO PasswordRecoveryPanel and NO MfaChallengePanel — compose Card + AuthStack + FormField/InputOTP + Button inside AuthShell preset="account-recovery" (the 432px token-owned measure).',
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
// @godxjp/ui (gh#233 — both fail the Framework-Component Test: they own no behaviour, and a
// \`state\` prop that swaps five incompatible bodies is the screen-shaped grab-bag anti-pattern,
// the same call as ErrorSurface's \`mode\`). What the package owns is the MEASURE:
//    <AuthShell variant="canonical" preset="account-recovery">   ← 432px panel, 15px gutter at 390
// Docs page: docs/layout/auth-recovery/
//
// PRESENTATION ONLY. No route, no reset semantics, no OTP verification, no recovery-code
// consumption, no passkey authentication, no permissions. The consumer owns all logic and copy.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Input, InputOTP, InputOTPGroup, InputOTPSlot, PasswordInput, PasswordStrength } from "@godxjp/ui/data-entry";
import { Alert, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";
import { Button, Reveal } from "@godxjp/ui/general";
import { AuthFooter, AuthShell, AuthStack, Flex } from "@godxjp/ui/layout";

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
    <AuthShell
      variant="canonical"
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
    </AuthShell>
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
//  ⚠️ The 390 canonical reference supplied with gh#233 is a desktop 2×2 COMPOSITE that overflows
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
// auth screens (AuthShell), NOT part of these signed-in settings. Do not surface it here.`,
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
  height: EMAIL_CTA.height,               // 44px — the SC 2.5.5 / HIG 44pt touch target
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

/**
 * Canonical code patterns for common consumer scenarios. The MCP
 * server returns one of these whenever a consumer asks "how do I X
 * with @godxjp/ui?" — saves the LLM from synthesising from primitive
 * docs over and over.
 *
 * Every pattern is copy-paste-ready: imports listed at top, types
 * spelled out, inline JSX with no opaque helpers.
 */

export interface PatternEntry {
  /** URL-safe slug. */
  name: string;
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
// ❌  <Card><Stack gap="md">…fields…</Stack></Card>          // flush, no padding
// ❌  <Card className="p-4">…fields…</Card>                   // hand-rolled padding
// ✅  <Card><CardContent><Stack gap="md">…fields…</Stack></CardContent></Card>
//    Titles → <CardHeader><CardTitle>. Only go flush deliberately for a full-bleed table:
// ✅  <Card><CardContent flush><DataTable/></CardContent></Card>
//    GENERAL RULE — compose godx-ui primitives FULLY; never hand-roll what one ships:
//      padding → CardContent (not p-4) · controls → Input/Select/Button (not raw <input>/<select>/<button>)
//      empty rows → DataTable's built-in empty / <EmptyState> (not a custom data.length===0 guard).
//    If a primitive exists, USE it — don't reinvent it.

// 1) StatCard shows a DOUBLE border (too thick)
//    Cause: StatCard IS already a bordered Card. Don't wrap it.
// ❌  <Card><CardContent><StatCard label="x" value="1" /></CardContent></Card>
// ✅  <ResponsiveGrid columns={4}><StatCard label="x" value="1" /></ResponsiveGrid>
//    Need a section title? Use a heading, NOT a Card:
// ✅  <Stack gap="sm"><div className="text-sm font-medium">KPI</div>
//        <ResponsiveGrid columns={4}><StatCard .../></ResponsiveGrid></Stack>

// 2) Badge renders grey with a ○ (no colour) for localized/tier labels
//    Cause: it auto-maps only English lifecycle keys. (@godxjp/ui >= 6.1)
// ❌  <Badge status="プレミアム" />
// ✅  <Badge status="プレミアム" tone="success" icon={null} />   // tier → pill, no icon
// ✅  <Badge status="active">公開中</Badge>                   // lifecycle → keep icon

// 3) Table text collapses to one char per line, or a chip wraps
//    Cause: pre-6.1.2. (@godxjp/ui >= 6.1.2 → cells + chips are nowrap)
// ✅  npm i @godxjp/ui@^6.2.0
// ✅  give long columns a width:  { key: "name", header: "氏名", width: "w-64" }

// 4) Empty (icon/action) column header shows a blank grey block
//    (@godxjp/ui >= 6.2.0 auto-hides it: [data-slot=table-head][data-empty] → transparent)
// ✅  npm i @godxjp/ui@^6.2.0   // header: "" now renders a transparent cell

// 5) DataTable columns are crushed / squeezed
//    Cause: the table is nested in a narrow grid column.
// ❌  <ResponsiveGrid columns={3}><div className="lg:col-span-2"><Card><DataTable/></Card></div></ResponsiveGrid>
// ✅  Table gets its OWN full-width row: <Card><CardContent flush><DataTable/></CardContent></Card>

// 6) FilterBar has no padding (sticks to the edge)
//    Cause: it's inside CardContent flush (flush strips padding — that's for tables).
// ❌  <Card><CardContent flush><FilterBar/><DataTable/></CardContent></Card>
// ✅  <FilterBar/>  then  <Card><CardContent flush><DataTable/></CardContent></Card>

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

// 10) Hide a column on mobile / sign-aware KPI delta (@godxjp/ui >= 6.2.0)
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
import { Stack } from "@godxjp/ui/layout";

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
          <Stack gap="md">
            <FormField id="name" label="氏名" required error={errors.name?.message}>
              <Input id="name" {...register("name")} />
            </FormField>
            <FormField id="email" label="メールアドレス" required error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} />
            </FormField>
          </Stack>
        </form>
      </CardContent>
      <CardFooter separated>
        <Button type="submit" form="signup" disabled={isSubmitting}>アカウントを作成</Button>
      </CardFooter>
    </Card>
  );
}`,
  },

  {
    name: "settings-tabs",
    tagline:
      "Sectioned settings inside a Card with Tabs + FormField + Select + Switch (real @godxjp/ui API).",
    tags: ["settings", "form", "tabs", "admin"],
    code: `import { Card, CardContent } from "@godxjp/ui/data-display";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@godxjp/ui/navigation";
import { FormField, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Switch, Label } from "@godxjp/ui/data-entry";
import { Stack } from "@godxjp/ui/layout";

export function WorkspaceSettings() {
  return (
    <Card>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">基本情報</TabsTrigger>
            <TabsTrigger value="notify">通知</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Stack gap="md">
              <FormField id="ws-name" label="名前" required><Input id="ws-name" /></FormField>
              <FormField id="visibility" label="公開範囲">
                <Select defaultValue="internal">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">プライベート</SelectItem>
                    <SelectItem value="internal">社内公開</SelectItem>
                    <SelectItem value="public">公開</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </Stack>
          </TabsContent>
          <TabsContent value="notify">
            <div className="flex items-center gap-2">
              <Switch id="notify-comment" defaultChecked />
              <Label htmlFor="notify-comment">コメント通知を受け取る</Label>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}`,
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
import { Stack } from "@godxjp/ui/layout";
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
        <Stack gap="md">
          <Input value={confirm} onValueChange={(e) => setConfirm(e.target.value)} placeholder={slug} />
        </Stack>
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
      "Inertia + @godxjp/ui list page — PageContainer + FilterBar + DataTable + Badge + Pagination (current primitive API).",
    tags: ["inertia", "list", "table", "page", "filter", "pagination", "datatable", "crm"],
    code: `import { Head, router } from "@inertiajs/react"
import { useMemo, useState } from "react"
import { PageContainer, ResponsiveGrid, Stack } from "@godxjp/ui/layout"
import { Card, CardContent, StatCard, DataTable, EmptyState, Badge, type ColumnDef } from "@godxjp/ui/data-display"
import { SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@godxjp/ui/data-entry"
import { FilterBar, FilterGroup, Pagination } from "@godxjp/ui/navigation"
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
      {/* RULE: every page wraps in PageContainer; spacing via Stack/ResponsiveGrid, never p-*/gap-* */}
      <PageContainer title="クーポン管理" subtitle="配信中のクーポン一覧">
        <Stack gap="lg">
          <ResponsiveGrid columns={3}>
            <StatCard label="公開中" value={coupons.filter((c) => c.status === "公開中").length} />
            <StatCard label="総利用数" value={coupons.reduce((s, c) => s + c.usage, 0).toLocaleString()} />
            <StatCard label="件数" value={coupons.length} />
          </ResponsiveGrid>

          <FilterBar hasActiveFilters={q !== "" || status !== "all"} onClear={() => { setQ(""); setStatus("all"); setPage(1) }}>
            {/* SearchInput is value + onSearch(v) — NOT onChange */}
            <SearchInput placeholder="クーポン名で検索" value={q} onSearch={(v) => { setQ(v); setPage(1) }} />
            <FilterGroup label="ステータス">
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ステータス</SelectItem>
                  <SelectItem value="公開中">公開中</SelectItem>
                  <SelectItem value="下書き">下書き</SelectItem>
                </SelectContent>
              </Select>
            </FilterGroup>
          </FilterBar>

          <Card>
            <CardContent flush>
              {filtered.length === 0
                ? <EmptyState title="該当するクーポンがありません" description="検索条件を変更してください。" />
                : <DataTable data={paged} columns={columns} getRowId={(c) => c.id} onRowClick={(c) => router.visit(\`/coupons/\${c.id}\`)} />}
            </CardContent>
          </Card>

          {filtered.length > PAGE_SIZE && (
            <Pagination current={page} total={filtered.length} pageSize={PAGE_SIZE} showTotal onValueChange={(p) => setPage(p)} />
          )}
        </Stack>
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
import { PageContainer, ResponsiveGrid, Stack } from "@godxjp/ui/layout"
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
        <Stack gap="lg">
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
        </Stack>
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
    name: "badge-coloring",
    tagline:
      "Colour a Badge for localized labels and tiers via tone + icon (escape-hatch props, @godxjp/ui ≥ 6.1).",
    tags: ["statusbadge", "badge", "tone", "color", "status", "tier", "table"],
    code: `import { Badge } from "@godxjp/ui/data-display"

// Badge auto-colours a fixed set of English LIFECYCLE keys:
//   active/completed (success ✓) · draft (neutral ○) · pending/temporary (warning ⏱)
//   scheduled/sending (info) · cancelled (neutral) · failed/deleted/bounced (destructive ✕)
// Anything else (localized labels, tiers) falls back to neutral grey ○ unless you override.

// 1) Lifecycle with localized text — map to the key, keep JP via \`label\` (icon stays):
<Badge status="active">公開中</Badge>        // green ✓ 公開中

// 2) Unknown label — set tone explicitly (no icon, since the key is unknown):
<Badge status="公開中" tone="success" />

// 3) Tier / category — coloured pill, drop the misleading glyph with icon={null}:
<Badge status="プレミアム" tone="success" icon={null} />
<Badge status="ゴールド"   tone="warning" icon={null} />
<Badge status="法人共通"   tone="info"    icon={null} />

// tone: "success" | "warning" | "destructive" | "info" | "neutral"  (import type BadgeTone)
// RULE: a chip never wraps — it is pinned white-space: nowrap, so it stays one line in
// narrow table cells. Centralize the domain→tone map in ONE small consumer wrapper and
// import that instead of the raw Badge across pages.`,
  },
];

export function findPattern(name: string): PatternEntry | undefined {
  const slug = name.trim().toLowerCase();
  return PATTERNS.find((p) => p.name === slug);
}

export function searchPatterns(query: string): PatternEntry[] {
  const q = query.trim().toLowerCase();
  if (q === "") return PATTERNS;
  return PATTERNS.filter(
    (p) =>
      p.name.includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)),
  );
}

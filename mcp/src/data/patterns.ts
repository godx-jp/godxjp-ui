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
    name: "registration-form",
    tagline: "Card-wrapped sign-up form with zod validation + action bar.",
    tags: ["form", "auth", "sign-up", "zod", "validation"],
    code: `import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Card, Form, FormField, Input, InputPassword, Checkbox,
  Button, Separator, Typography,
} from "@godxjp/ui"

const schema = z.object({
  name: z.string().min(1, "氏名は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string()
    .min(8, "8 文字以上で入力してください")
    .regex(/[A-Z]/, "大文字を 1 つ以上含めてください")
    .regex(/\\d/, "数字を 1 つ以上含めてください"),
  agree: z.literal(true, { message: "利用規約への同意が必要です" }),
})
type SignUpValues = z.infer<typeof schema>

export function SignUpCard() {
  return (
    <Card
      title="アカウント作成"
      subtitle="30 秒で完了します。"
      style={{ maxWidth: 420, margin: "0 auto" }}
    >
      <Form<SignUpValues>
        resolver={zodResolver(schema)}
        defaultValues={{ name: "", email: "", password: "", agree: true }}
        onSubmit={async (values) => {
          // POST to your API
          await fetch("/api/signup", { method: "POST", body: JSON.stringify(values) })
        }}
      >
        <FormField name="name" label="氏名" required>
          <Input placeholder="山田 太郎" />
        </FormField>
        <FormField name="email" label="メールアドレス" required>
          <Input type="email" placeholder="taro@example.com" />
        </FormField>
        <FormField name="password" label="パスワード" required
          description="8 文字以上 / 大文字 1 / 数字 1">
          <InputPassword placeholder="••••••••" />
        </FormField>
        <FormField name="agree">
          <Checkbox>利用規約に同意する</Checkbox>
        </FormField>
        <Button type="submit" variant="primary" block>
          アカウントを作成
        </Button>
      </Form>
      <Separator style={{ margin: "var(--spacing-3) 0" }} />
      <Typography.Text color="secondary" style={{ textAlign: "center", display: "block" }}>
        既にアカウントをお持ちですか? <a href="/login">ログイン</a>
      </Typography.Text>
    </Card>
  )
}`,
  },

  {
    name: "settings-page",
    tagline: "Sectioned settings Card — 基本情報 / 公開範囲 / 通知, horizontal layout, action bar.",
    tags: ["settings", "form", "admin", "horizontal"],
    code: `import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Card, Form, FormField, Input, Select, Switch,
  Button, Separator, Typography, Flex,
} from "@godxjp/ui"

const schema = z.object({
  workspaceName: z.string().min(1),
  visibility: z.string(),
  notifyOnComment: z.boolean(),
  notifyOnMention: z.boolean(),
  digestFrequency: z.string(),
})
type SettingsValues = z.infer<typeof schema>

export function WorkspaceSettings() {
  return (
    <Card title="ワークスペース設定" subtitle="Acme Forge · /acme-forge"
      style={{ maxWidth: 820 }}>
      <Form<SettingsValues> layout="horizontal"
        resolver={zodResolver(schema)}
        defaultValues={{
          workspaceName: "Acme Forge",
          visibility: "internal",
          notifyOnComment: true,
          notifyOnMention: true,
          digestFrequency: "weekly",
        }}
        onSubmit={(v) => save(v)}
      >
        <Typography.Title size={5}>基本情報</Typography.Title>
        <FormField name="workspaceName" label="名前" required>
          <Input />
        </FormField>

        <Separator />
        <Typography.Title size={5}>公開範囲</Typography.Title>
        <FormField name="visibility" label="閲覧範囲" required>
          <Select options={[
            { value: "private",  label: "プライベート" },
            { value: "internal", label: "社内公開" },
            { value: "public",   label: "公開" },
          ]} />
        </FormField>

        <Separator />
        <Typography.Title size={5}>通知</Typography.Title>
        <FormField name="notifyOnComment" label="コメント"><Switch /></FormField>
        <FormField name="notifyOnMention" label="メンション"><Switch /></FormField>
        <FormField name="digestFrequency" label="ダイジェスト">
          <Select options={[
            { value: "off",    label: "送信しない" },
            { value: "daily",  label: "毎朝" },
            { value: "weekly", label: "週次" },
          ]} />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">変更を破棄</Button>
          <Button type="submit" variant="primary">設定を保存</Button>
        </Flex>
      </Form>
    </Card>
  )
}`,
  },

  {
    name: "data-table",
    tagline: "DataTable composite with toolbar + pagination + batch actions + sticky columns.",
    tags: ["table", "data", "pagination", "selection", "batch"],
    code: `import { useState } from "react"
import {
  DataTable, Badge, Avatar, Flex, Typography, Button,
  type TableColumn,
} from "@godxjp/ui"

interface Employee {
  id: string
  name: string
  role: string
  shop: string
  status: "active" | "pending" | "leave"
}

const columns: TableColumn<Employee>[] = [
  {
    accessorKey: "name",
    header: "氏名",
    minSize: 180,
    cell: ({ row }) => (
      <Flex align="center" gap="small">
        <Avatar size="sm" alt={row.original.name} />
        <Typography.Text strong>{row.original.name}</Typography.Text>
      </Flex>
    ),
    meta: { sticky: { side: "left", from: "md" } },
  },
  { accessorKey: "role", header: "役職", minSize: 120 },
  { accessorKey: "shop", header: "店舗", minSize: 96 },
  {
    accessorKey: "status",
    header: "状態",
    minSize: 96,
    cell: ({ row }) => {
      if (row.original.status === "active")  return <Badge variant="success" dot>稼働中</Badge>
      if (row.original.status === "pending") return <Badge variant="warning" dot>申請中</Badge>
      return <Badge variant="neutral" dot>休職</Badge>
    },
  },
]

export function EmployeeTable() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState("")

  // Replace with your real API
  const { data, total, loading } = useEmployees({ page, pageSize: 20, query })

  return (
    <DataTable
      tableKey="employees-v1"
      columns={columns}
      data={data}
      rowKey="id"
      toolbar={{
        search: { value: query, onValueChange: setQuery },
        primaryAction: { label: "新規追加", onClick: () => openNewModal() },
      }}
      pagination={{
        current: page, pageSize: 20, total,
        onChange: setPage,
      }}
      batchActions={{
        selectedRowKeys: selected,
        onSelectedRowKeysChange: setSelected,
        actions: ({ clearSelection }) => (
          <Flex gap="small">
            <Button variant="ghost" onClick={clearSelection}>解除</Button>
            <Button variant="destructive">削除</Button>
          </Flex>
        ),
      }}
    />
  )
}`,
  },

  {
    name: "confirm-destructive",
    tagline: "Destructive-action confirmation Dialog with typed-name verification.",
    tags: ["dialog", "confirm", "destructive", "delete"],
    code: `import { useState } from "react"
import { Card, Form, FormField, Input, Button, Flex, Separator, toast } from "@godxjp/ui"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({ confirm: z.string() })

export function DeleteProjectCard({ projectSlug }: { projectSlug: string }) {
  return (
    <Card
      title="プロジェクトを削除"
      subtitle="削除すると、関連するすべてのタスク・コメント・添付ファイルが復元できなくなります。"
      accent="destructive"
      style={{ maxWidth: 560 }}
    >
      <Form resolver={zodResolver(schema)} defaultValues={{ confirm: "" }}
        onSubmit={async (v) => {
          if (v.confirm !== projectSlug) {
            toast.error("プロジェクト名が一致しません")
            return
          }
          await fetch(\`/api/projects/\${projectSlug}\`, { method: "DELETE" })
          toast.success("プロジェクトを削除しました")
        }}
      >
        <FormField name="confirm" label={\`確認のため "\${projectSlug}" と入力してください\`} required>
          <Input placeholder={projectSlug} />
        </FormField>
        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button type="submit" variant="destructive">プロジェクトを完全に削除</Button>
        </Flex>
      </Form>
    </Card>
  )
}`,
  },

  {
    name: "app-shell",
    tagline: "AppShell wiring — Sidebar + Topbar + PageContent + Toaster.",
    tags: ["shell", "layout", "navigation", "app-root"],
    code: `import {
  AppShell, Sidebar, Topbar, PageContent,
  GodxConfigProvider, Toaster, Button, Typography,
} from "@godxjp/ui"
import { LayoutDashboard, FolderGit2, GitBranch, Settings } from "lucide-react"
import { useState } from "react"

const SECTIONS = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "projects",  label: "Projects",  icon: FolderGit2, badge: 8 },
      { id: "branches",  label: "Branches",  icon: GitBranch },
    ],
  },
  {
    label: "Admin",
    items: [
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
]

export function App() {
  const [active, setActive] = useState("dashboard")

  return (
    <GodxConfigProvider defaultLocale="ja" defaultTimezone="Asia/Tokyo" defaultCurrency="JPY">
      <AppShell
        sidebar={<Sidebar activeId={active} onSelect={setActive} sections={SECTIONS} />}
        topbar={<Topbar product={{ id: "godx", label: "GoDX Forge" }} project={{ id: "p1", label: "Acme" }} />}
      >
        <PageContent
          title="Dashboard"
          subtitle="Workspace activity, KPIs"
          extra={<Button variant="primary">New issue</Button>}
        >
          <Typography.Paragraph>Page body goes here.</Typography.Paragraph>
        </PageContent>
      </AppShell>
      <Toaster position="top-right" />
    </GodxConfigProvider>
  )
}`,
  },

  {
    name: "filter-bar",
    tagline: "Inline filter bar above a table — search + selects + reset.",
    tags: ["filter", "search", "inline", "table"],
    code: `import { useState } from "react"
import { Form, FormField, Input, Select, Button } from "@godxjp/ui"

export function EmployeeFilter({ onChange }: { onChange: (v: any) => void }) {
  return (
    <Form layout="inline" defaultValues={{ query: "", status: "active", shop: "shibuya" }}
      onSubmit={(v) => onChange(v)}
    >
      <FormField name="query" label="キーワード">
        <Input placeholder="名前 / メール / 電話番号" style={{ width: "16rem" }} />
      </FormField>
      <FormField name="status" label="ステータス">
        <Select options={[
          { value: "active", label: "稼働中" },
          { value: "paused", label: "一時停止" },
        ]} />
      </FormField>
      <FormField name="shop" label="店舗">
        <Select options={[
          { value: "shibuya",   label: "渋谷店" },
          { value: "shinjuku",  label: "新宿店" },
        ]} />
      </FormField>
      <Button type="submit" variant="primary">検索</Button>
      <Button type="reset" variant="ghost">リセット</Button>
    </Form>
  )
}`,
  },

  {
    name: "loading-states",
    tagline: "Skeleton on init fetch + Spinner on save (UX nuance).",
    tags: ["loading", "skeleton", "spinner", "form"],
    code: `import { useState, useEffect } from "react"
import {
  Card, Form, FormField, Input, Textarea, Button, Flex, Separator,
} from "@godxjp/ui"

export function ProfileEditor() {
  const [submitting, setSubmitting] = useState(false)
  const [initialFetched, setInitialFetched] = useState(false)
  const [values, setValues] = useState({ name: "", bio: "" })

  // Initial fetch
  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(data => {
      setValues(data)
      setInitialFetched(true)
    })
  }, [])

  return (
    <Card title="プロフィール" style={{ maxWidth: 640 }}>
      <Form
        loading={!initialFetched ? { kind: "skeleton" } : submitting}
        defaultValues={values}
        onSubmit={async (v) => {
          setSubmitting(true)
          await fetch("/api/me", { method: "PUT", body: JSON.stringify(v) })
          setSubmitting(false)
        }}
      >
        <FormField name="name" label="氏名" required><Input /></FormField>
        <FormField name="bio" label="自己紹介"><Textarea rows={3} /></FormField>
        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button" disabled={submitting}>キャンセル</Button>
          <Button type="submit" variant="primary" loading={submitting}>保存</Button>
        </Flex>
      </Form>
    </Card>
  )
}`,
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

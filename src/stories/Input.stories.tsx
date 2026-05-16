import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Check,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  Info,
  Lock,
  Mail,
  Search,
  X,
} from "lucide-react";
import { Input, Textarea } from "../components/primitives/Input";
import { Button } from "../components/primitives/Button";
import { Flex, Space, Row, Col } from "../components/primitives/layout";
import { LocaleInput, LocaleRowInput } from "../components/composites/locale-input";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Input** — text field with affix slots matching the canonical dxs-kintai
\`.input\` / \`.input-wrap\` design.

Visual contract lives entirely in props: \`size\` controls density,
\`status\` controls validation feedback, and the slot props (\`prefix\`,
\`suffix\`, \`addonBefore\`, \`addonAfter\`) compose icons or units inside
the shared \`.input-wrap\` shell. \`className\` is reserved for layout
glue, never for re-skinning — every visual value comes from the
canonical CSS classes in \`tokens.css\` / \`shell.css\`.

**Companion patterns** (canonical \`.field\` / \`.help\` / \`.checklist\` /
\`.count\` shipped from \`shell.css\`): wrap label + control + help in
a \`<div className="field">\`; flag required fields with
\`<span className="req">*</span>\` and optional ones with
\`<span className="opt">(optional)</span>\`.

**LocaleInput** (composite) ships the multilingual tab strip
(\`.loc-tabs\` + \`.loc-panel\`) and the per-row variant (\`.loc-row\`).
Generic — pass any \`locales: string[]\`.

**Accessibility (WCAG 2.1 AA)** — native semantics; pair with
\`<label htmlFor>\` for screen readers; \`status="error"\` consumers must
also wire \`aria-invalid\` + \`aria-describedby\` to the help text node.
Focus ring contrast ≥ 3:1.
        `.trim(),
      },
    },
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["small", "default", "large"],
      description: "Density: 28 / 32 / 36 px.",
      table: { defaultValue: { summary: "default" } },
    },
    status: {
      control: "inline-radio",
      options: ["default", "error", "warning"],
      description: "Validation feedback border + ring color.",
      table: { defaultValue: { summary: "default" } },
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "url", "number", "tel", "search"],
      table: { defaultValue: { summary: "text" } },
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    placeholder: { control: "text" },
    prefix: { control: false, description: "Leading slot (icon / unit)." },
    suffix: { control: false, description: "Trailing slot (icon / counter)." },
    addonBefore: { control: false, description: "Leading addon (scheme, unit)." },
    addonAfter: { control: false, description: "Trailing addon (TLD, unit)." },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

// ─────────────────────────────────────────────────────────────────────────
// Playground
// ─────────────────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: {
    placeholder: "メールアドレス",
    size: "default",
    status: "default",
    disabled: false,
    readOnly: false,
  },
};

// ─────────────────────────────────────────────────────────────────────────
// All states — section A of the canonical comp-inputs.html
// ─────────────────────────────────────────────────────────────────────────

export const AllStates: Story = {
  name: "States — default / focus / error / warning / success / disabled / readonly / loading",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px", maxWidth: 720 }}>
      {/* default */}
      <div className="field">
        <label htmlFor="emp">
          従業員コード <span className="req">*</span>
        </label>
        <Input id="emp" defaultValue="EMP-0042" placeholder="EMP-0001" />
        <div className="help">英数字 4–8 文字 · 例: <span className="mono">EMP-0042</span></div>
      </div>

      {/* focus (simulated via autoFocus) */}
      <div className="field">
        <label htmlFor="period">対象期間</label>
        <Input id="period" type="month" defaultValue="2026-05" autoFocus />
        <div className="help info">
          <Info size={12} />
          2026年5月の勤怠を集計します (2026/04/26 – 2026/05/25)
        </div>
      </div>

      {/* error */}
      <div className="field">
        <label htmlFor="email-err">
          会社メール <span className="req">*</span>
        </label>
        <Input
          id="email-err"
          status="error"
          defaultValue="m.tanaka@famgia"
          aria-invalid
          aria-describedby="email-err-msg"
        />
        <div id="email-err-msg" className="help err">
          <X size={12} strokeWidth={2.5} />
          ドメインが不正です — <span className="mono">@famgia.co.jp</span> で終わる必要があります
        </div>
      </div>

      {/* warning (with affixes) */}
      <div className="field">
        <label htmlFor="wage">
          時給 <span className="req">*</span>
        </label>
        <Input
          id="wage"
          status="warning"
          prefix="¥"
          suffix="/ 時"
          defaultValue="1,050"
          inputMode="numeric"
          style={{ textAlign: "right" }}
        />
        <div className="help warn">
          <AlertTriangle size={12} />
          東京都の最低時給 ¥1,113 を下回っています — 続行可能ですが要確認
        </div>
      </div>

      {/* success */}
      <div className="field">
        <label htmlFor="tel">携帯電話</label>
        <Input
          id="tel"
          defaultValue="090-1234-5678"
          suffix={<Check size={14} color="var(--success)" strokeWidth={2.5} />}
        />
        <div className="help ok">
          <Check size={12} strokeWidth={2.5} />
          SMS 認証済み · 2026/05/03 14:22
        </div>
      </div>

      {/* disabled */}
      <div className="field">
        <label htmlFor="contract" style={{ color: "var(--muted-foreground)" }}>
          雇用形態
        </label>
        <Input id="contract" disabled defaultValue="正社員 (無期)" />
        <div className="help">
          <Lock size={12} />
          契約変更フローからのみ更新可能 · 直近変更 2024/04/01
        </div>
      </div>

      {/* readonly */}
      <div className="field">
        <label htmlFor="userid">ユーザー ID</label>
        <Input id="userid" readOnly defaultValue="user_01HXY8P9Z3..." />
        <div className="help">
          <Info size={12} />
          システム自動生成 · クリックでコピー
        </div>
      </div>

      {/* loading (async validation) */}
      <div className="field">
        <label htmlFor="store">
          店舗 ID <span className="req">*</span>
        </label>
        <Input
          id="store"
          defaultValue="shibuya-honten"
          suffix={<span className="input-loading-spinner" aria-label="Validating" />}
        />
        <div className="help info">
          <span className="input-loading-spinner" style={{ width: 10, height: 10 }} aria-hidden="true" /> 重複を確認中…
        </div>
      </div>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Sizes
// ─────────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: "Sizes — small / default / large",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input size="small" placeholder="Small (28 px)" />
      <Input size="default" placeholder="Default (32 px)" />
      <Input size="large" placeholder="Large (36 px)" />
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Affixes (prefix + suffix + addon)
// ─────────────────────────────────────────────────────────────────────────

export const Affixes: Story = {
  name: "Affixes — prefix / suffix / addonBefore / addonAfter",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 420 }}>
      <Flex vertical gap="small">
        <div className="label">Prefix only</div>
        <Input prefix={<Search size={14} />} placeholder="Search projects…" />
        <Input prefix={<Mail size={14} />} type="email" placeholder="you@example.com" />
      </Flex>
      <Flex vertical gap="small">
        <div className="label">Suffix only</div>
        <Input suffix={<CheckCircle2 size={14} color="var(--success)" />} defaultValue="Available username" />
        <Input suffix={<CreditCard size={14} />} placeholder="4242 4242 4242 4242" />
      </Flex>
      <Flex vertical gap="small">
        <div className="label">Both</div>
        <Input prefix="¥" suffix="/ mo" inputMode="numeric" defaultValue="9,000" />
        <Input prefix="https://" suffix=".jp" placeholder="my-site" />
      </Flex>
      <Flex vertical gap="small">
        <div className="label">Addons (canonical .affix.pre / .affix.suf)</div>
        <Input addonBefore="https://" placeholder="example.com" />
        <Input addonAfter=".godx.jp" placeholder="forge" />
        <Input addonBefore="@" placeholder="username" />
      </Flex>
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Password toggle (canonical .pass-toggle / .input-pass-toggle)
// ─────────────────────────────────────────────────────────────────────────

function PasswordToggleDemo() {
  const [shown, setShown] = useState(false);
  return (
    <div className="field" style={{ maxWidth: 320 }}>
      <label htmlFor="pwd">
        パスワード <span className="req">*</span>
        <span className="spacer" />
        <a href="#" onClick={(e) => e.preventDefault()}>お忘れですか?</a>
      </label>
      <div style={{ position: "relative" }}>
        <Input
          id="pwd"
          type={shown ? "text" : "password"}
          defaultValue="hunter22!Aa"
          style={{ paddingRight: 34 }}
        />
        <button
          type="button"
          className="input-pass-toggle"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
        >
          {shown ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      <ul className="checklist">
        <li className="ok"><Check size={11} strokeWidth={3} /> 8 文字以上</li>
        <li className="ok"><Check size={11} strokeWidth={3} /> 大文字・小文字を含む</li>
        <li className="bad"><X size={11} strokeWidth={3} /> 記号 (! @ # ...) を 1 つ以上</li>
      </ul>
    </div>
  );
}

export const PasswordWithChecklist: Story = {
  name: "Password — show/hide + canonical .checklist",
  parameters: { controls: { disable: true } },
  render: () => <PasswordToggleDemo />,
};

// ─────────────────────────────────────────────────────────────────────────
// Field group helper patterns (canonical .field / .help / .count)
// ─────────────────────────────────────────────────────────────────────────

function FieldGroupDemo() {
  const [bio, setBio] = useState(
    "体調不良のため、本日 15:00 に早退しました。明日は通常通り出勤予定です。",
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px", maxWidth: 720 }}>
      {/* tooltip on label */}
      <div className="field">
        <label>
          基本給 <span className="req">*</span>
          <span className="info" tabIndex={0} title="残業手当・各種手当を含まない月額の基本給。賞与算定の基準となります。">
            <HelpCircle size={14} />
          </span>
        </label>
        <Input prefix="¥" defaultValue="245,000" inputMode="numeric" style={{ textAlign: "right" }} />
        <div className="help">月額 · 賞与算定基準</div>
      </div>

      {/* optional badge + link */}
      <div className="field">
        <label>
          代替メール <span className="opt">(optional)</span>
          <span className="spacer" />
          <a href="#" onClick={(e) => e.preventDefault()}>追加</a>
        </label>
        <Input prefix={<Mail size={14} />} placeholder="backup@example.com" />
        <div className="help">プライマリ復旧の連絡先 — 1 つまで</div>
      </div>

      {/* character counter via Textarea showCount */}
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label>早退理由 <span className="opt">(任意)</span></label>
        <Textarea
          rows={3}
          maxLength={200}
          showCount
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {/* prefix/suffix unit */}
      <div className="field">
        <label>標準勤務時間 <span className="req">*</span></label>
        <Input suffix="時間 / 日" defaultValue="8.0" inputMode="numeric" style={{ textAlign: "right" }} />
        <div className="help">残業の閾値として使用 · 法定上限 40 時間 / 週</div>
      </div>

      {/* placeholder format example */}
      <div className="field">
        <label>休憩時間</label>
        <Input placeholder="例: 12:00 – 13:00" defaultValue="12:30 – 13:30" />
        <div className="help">
          <Clock size={12} />
          24 時間表記 · 開始 – 終了
        </div>
      </div>
    </div>
  );
}

export const FieldGroups: Story = {
  name: "Composition — .field + .help patterns",
  parameters: { controls: { disable: true } },
  render: () => <FieldGroupDemo />,
};

// ─────────────────────────────────────────────────────────────────────────
// MULTILINGUAL — Locale tabs (canonical pattern ①)
// ─────────────────────────────────────────────────────────────────────────

function MultilingualTabsDemo() {
  const [values, setValues] = useState<Record<string, string>>({
    ja: "特選 まぐろ握り 6貫盛り合わせ",
    en: "Premium tuna nigiri assortment (6 pcs)",
    vi: "Sushi cá ngừ thượng hạng (đĩa 6 miếng)",
    zh: "",
  });
  const status: Record<string, "filled" | "draft" | "empty"> = {
    ja: "filled",
    en: "filled",
    vi: "draft",
    zh: "empty",
  };
  const filled = Object.values(status).filter((s) => s !== "empty").length;
  return (
    <div className="field" style={{ maxWidth: 560 }}>
      <label htmlFor="prod-name">
        商品名 <span className="req">*</span>
      </label>
      <LocaleInput
        id="prod-name"
        locales={["ja", "en", "vi", "zh"]}
        baseLocale="ja"
        baseLabel="(基準)"
        values={values}
        onChange={(loc, v) => setValues((prev) => ({ ...prev, [loc]: v }))}
        statusByLocale={status}
        resolveLocaleLabel={(loc) =>
          ({ ja: "日本語", en: "English", vi: "Tiếng Việt", zh: "简体中文" }[loc] ?? loc)
        }
        meta={`${filled} / 4 翻訳済`}
        tabsExtra={
          <button
            type="button"
            style={{
              border: "1px solid var(--border)",
              borderRadius: 4,
              height: 22,
              padding: "0 8px",
              fontSize: 11,
              background: "var(--background)",
              cursor: "pointer",
            }}
          >
            ⊕ 追加
          </button>
        }
        maxLength={60}
        help={
          <>
            <Info size={12} />
            日本語が基準言語 · 翻訳がない場合はこの値が使われます
          </>
        }
        helpStatus="info"
      />
      <div className="help" style={{ marginTop: 6, alignItems: "center" }}>
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: "var(--success)",
            marginRight: 4,
          }}
        />
        済 ·
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: "var(--warning)",
            margin: "0 4px 0 8px",
          }}
        />
        下書き ·
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: "var(--destructive)",
            margin: "0 4px 0 8px",
          }}
        />
        未翻訳
      </div>
    </div>
  );
}

export const Multilingual: Story = {
  name: "Multilingual — locale tabs (LocaleInput)",
  parameters: { controls: { disable: true } },
  render: () => <MultilingualTabsDemo />,
};

// ─────────────────────────────────────────────────────────────────────────
// MULTILINGUAL — per-row layout (canonical pattern ②)
// ─────────────────────────────────────────────────────────────────────────

function MultilingualRowDemo() {
  const [values, setValues] = useState<Record<string, string>>({
    ja: "渋谷駅 ハチ公口 徒歩 3 分。創業 1987 年の老舗寿司店です。",
    en: "3 min walk from Shibuya Station Hachiko exit. A traditional sushi restaurant established in 1987.",
    vi: "Cách lối ra Hachiko ga Shibuya 3 phút đi bộ.",
    zh: "",
  });
  return (
    <div className="field" style={{ maxWidth: 720 }}>
      <label>
        店舗説明 <span className="opt">(任意)</span>
      </label>
      <LocaleRowInput
        locales={["ja", "en", "vi", "zh"]}
        baseLocale="ja"
        multiline
        rows={2}
        values={values}
        onChange={(loc, v) => setValues((prev) => ({ ...prev, [loc]: v }))}
        statusByLocale={{ ja: "filled", en: "filled", vi: "draft", zh: "empty" }}
        placeholder="未翻訳 — 日本語の値が使用されます"
        help={
          <>
            <AlertTriangle size={12} />
            VI 翻訳が日本語より古い (2026/03/12) — 再確認を推奨
          </>
        }
        helpStatus="warn"
      />
    </div>
  );
}

export const MultilingualRows: Story = {
  name: "Multilingual — per-row (LocaleRowInput)",
  parameters: { controls: { disable: true } },
  render: () => <MultilingualRowDemo />,
};

// ─────────────────────────────────────────────────────────────────────────
// Disabled / Read-only
// ─────────────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  name: "States — disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input disabled placeholder="Disabled empty" />
      <Input disabled defaultValue="Read-only system value" />
      <Input disabled prefix={<Lock size={14} />} defaultValue="Locked by admin" />
    </Flex>
  ),
};

export const ReadOnly: Story = {
  name: "States — readonly",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input readOnly defaultValue="user_01HXY8P9..." />
      <Input readOnly defaultValue="yuki@godx.jp" prefix={<Mail size={14} />} />
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export const Types: Story = {
  name: "HTML types",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input type="email" placeholder="you@example.com" prefix={<Mail size={14} />} />
      <Input type="url" placeholder="https://godx.jp" prefix={<Globe size={14} />} />
      <Input type="number" placeholder="42" />
      <Input type="tel" placeholder="+81 90 1234 5678" />
      <Input type="search" placeholder="Search docs…" prefix={<Search size={14} />} />
      <Input type="password" placeholder="••••••••" prefix={<Lock size={14} />} />
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Composition — filter bar / login
// ─────────────────────────────────────────────────────────────────────────

export const FilterBar: Story = {
  name: "Composition — filter bar",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex gap="small" align="center" wrap style={{ maxWidth: 640 }}>
      <Input
        prefix={<Search size={14} />}
        placeholder="プロジェクトを検索…"
        style={{ flex: 1, minWidth: 240 }}
      />
      <Button variant="secondary">Filters</Button>
      <Button variant="primary">+ 新規</Button>
    </Flex>
  ),
};

export const LoginForm: Story = {
  name: "Composition — login form",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        maxWidth: 360,
        padding: "var(--spacing-6)",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <Flex vertical gap="middle">
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>ログイン</h3>
        <div className="field">
          <label htmlFor="login-email">メールアドレス</label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            prefix={<Mail size={14} />}
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label htmlFor="login-pw">
            パスワード
            <span className="spacer" />
            <a href="#" onClick={(e) => e.preventDefault()}>お忘れですか?</a>
          </label>
          <Input
            id="login-pw"
            type="password"
            autoComplete="current-password"
            prefix={<Lock size={14} />}
            placeholder="••••••••"
          />
        </div>
        <Space size="middle" align="center">
          <Button variant="primary" type="submit">サインイン</Button>
          <Button variant="ghost" size="sm">パスワードを忘れた</Button>
        </Space>
      </Flex>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Showcase — all variants
// ─────────────────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: "Showcase — all variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <div className="field">
          <label>Default</label>
          <Input placeholder="Type something…" />
        </div>
      </Col>
      <Col xs={24} md={12}>
        <div className="field">
          <label>With prefix + suffix</label>
          <Input prefix={<Search size={14} />} suffix={<X size={14} />} placeholder="Search" />
        </div>
      </Col>
      <Col xs={24} md={12}>
        <div className="field">
          <label>Addons</label>
          <Input addonBefore="https://" addonAfter=".jp" placeholder="forge" />
        </div>
      </Col>
      <Col xs={24} md={12}>
        <div className="field">
          <label>Status — error</label>
          <Input status="error" defaultValue="bad@" />
          <div className="help err"><X size={12} /> Invalid email</div>
        </div>
      </Col>
      <Col xs={24} md={12}>
        <div className="field">
          <label>Status — warning</label>
          <Input status="warning" defaultValue="1,050" prefix="¥" suffix="/ 時" />
          <div className="help warn"><AlertTriangle size={12} /> Below minimum</div>
        </div>
      </Col>
      <Col xs={24} md={12}>
        <div className="field">
          <label>Status — success</label>
          <Input defaultValue="090-1234-5678" suffix={<Check size={14} color="var(--success)" />} />
          <div className="help ok"><Check size={12} strokeWidth={2.5} /> SMS 認証済み</div>
        </div>
      </Col>
    </Row>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Textarea
// ─────────────────────────────────────────────────────────────────────────

type TextareaStory = StoryObj<typeof Textarea>;

export const TextareaDefault: TextareaStory = {
  name: "Textarea — default",
  parameters: { controls: { disable: true } },
  render: () => (
    <Textarea rows={4} placeholder="自己紹介を書いてください…" style={{ width: 360 }} />
  ),
};

export const TextareaSizes: TextareaStory = {
  name: "Textarea — sizes",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ width: 360 }}>
      <Textarea size="small" rows={3} placeholder="Small density" />
      <Textarea size="default" rows={3} placeholder="Default density" />
      <Textarea size="large" rows={3} placeholder="Large density" />
    </Flex>
  ),
};

export const TextareaResize: TextareaStory = {
  name: "Textarea — resize variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ width: 360 }}>
      <Textarea rows={3} resize="none" placeholder="resize=none (default)" />
      <Textarea rows={3} resize="vertical" placeholder="resize=vertical" />
      <Textarea rows={3} resize="horizontal" placeholder="resize=horizontal" />
      <Textarea rows={3} resize="both" placeholder="resize=both" />
    </Flex>
  ),
};

function TextareaAutoSizeDemo() {
  const [v, setV] = useState(
    "Type more lines…\nThe textarea grows up to 6 rows then scrolls.",
  );
  return (
    <Textarea
      autoSize={{ minRows: 2, maxRows: 6 }}
      value={v}
      onChange={(e) => setV(e.target.value)}
      style={{ width: 360 }}
    />
  );
}

export const TextareaAutoSize: TextareaStory = {
  name: "Textarea — autoSize",
  parameters: { controls: { disable: true } },
  render: () => <TextareaAutoSizeDemo />,
};

function TextareaShowCountDemo() {
  const [v, setV] = useState("A short bio in under 140 characters.");
  return (
    <Textarea
      rows={4}
      maxLength={140}
      showCount
      value={v}
      onChange={(e) => setV(e.target.value)}
      style={{ width: 360 }}
    />
  );
}

export const TextareaShowCount: TextareaStory = {
  name: "Textarea — showCount + maxLength",
  parameters: { controls: { disable: true } },
  render: () => <TextareaShowCountDemo />,
};

export const TextareaStatus: TextareaStory = {
  name: "Textarea — status states",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ width: 360 }}>
      <Textarea rows={3} status="default" defaultValue="Default" />
      <Textarea rows={3} status="warning" defaultValue="近すぎる単語" />
      <Textarea rows={3} status="error" defaultValue="Required field is empty" aria-invalid />
    </Flex>
  ),
};

export const TextareaDisabled: TextareaStory = {
  name: "Textarea — disabled / readonly",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ width: 360 }}>
      <Textarea rows={3} disabled defaultValue="Disabled state — cannot edit." />
      <Textarea rows={3} readOnly defaultValue="Read-only — selectable but immutable." />
    </Flex>
  ),
};

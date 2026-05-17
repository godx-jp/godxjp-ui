import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "../../../../components/primitives/Typography";

const { Title, Paragraph, Text, Link } = Typography;

/**
 * Components/General/Typography — Title / Paragraph / Text / Link
 * family. Visual contract lives in `.typography*` classes in
 * `shell.css`; every size + weight + color reads from existing
 * token chain (theme/accent/density/font-size axes flow).
 *
 * Vocabulary (per cardinal rule 23 §B):
 *   - `size` — dimensional scale, same name as Button/Input/Avatar.
 *     For Title: 1..5 maps to canon heading scale.
 *   - `color` — semantic role.
 *   - `truncate` — single-line or `{ rows: N }` clamp (NOT
 *     Ant's `ellipsis`).
 *   - `strong` / `italic` / `underline` / `del` / `mark` / `code` /
 *     `keyboard` — HTML5 semantic inline elements.
 *   - `copyable` — boolean adjective (same shape as Tag's `closable`).
 */

const meta: Meta<typeof Title> = {
  title: "new-primitives/Components/General/Typography",
  component: Title,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Typography** — four members (\`Title\`, \`Paragraph\`, \`Text\`,
\`Link\`) sharing a common prop surface: \`color\`, \`strong\`,
\`italic\`, \`underline\`, \`del\`, \`mark\`, \`code\`, \`keyboard\`,
\`disabled\`, \`copyable\`, \`truncate\`.

Title accepts \`size\` 1–5; sizes follow the canon heading mapping
declared in \`theme.css\`: \`1\` = \`--text-4xl\` (h1 cap),
\`2\` = \`--text-2xl\` (h2), \`3\` = \`--text-xl\` (page title),
\`4\` = \`--text-lg\` (subheading), \`5\` = \`--text-md\` (content
body). \`--text-3xl\` is an outlier in the canon and intentionally
NOT mapped to any level.
        `.trim(),
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Title>;

// ════════════════════════════════════════════════════════════════
// Title — sizes 1 through 5
// ════════════════════════════════════════════════════════════════

export const Title_Sizes: Story = {
  name: "Title · size 1–5",
  render: () => (
    <div>
      <Title size={1}>h1. GoDX UI · 32px / --text-4xl</Title>
      <Title size={2}>h2. GoDX UI · 24px / --text-2xl</Title>
      <Title size={3}>h3. GoDX UI · 20px / --text-xl</Title>
      <Title size={4}>h4. GoDX UI · 18px / --text-lg</Title>
      <Title size={5}>h5. GoDX UI · 16px / --text-md</Title>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Paragraph — body content
// ════════════════════════════════════════════════════════════════

export const Paragraph_Basic: Story = {
  name: "Paragraph · basic",
  render: () => (
    <div>
      <Paragraph>
        Famgia は飲食業の現場を支える勤怠 SaaS です。シフトの自動最適化、給与計算の自動連携、
        多店舗マルチテナント対応で、小さな店舗から大型チェーンまで一つの管理画面で運用できます。
      </Paragraph>
      <Paragraph>
        私たちは「現場が一番強くなる」プロダクトを作っています。
        無駄なクリックや待ち時間を削り、現場の判断スピードを上げる。
        その結果として、お客様一人ひとりに寄り添える時間を増やしたい。
      </Paragraph>
      <Paragraph color="secondary">
        — Famgia プロダクトチーム
      </Paragraph>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Text — inline marks
// ════════════════════════════════════════════════════════════════

export const Text_Marks: Story = {
  name: "Text · inline marks",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
      <Text>Default body text — no modifier.</Text>
      <Text strong>Strong text — font-weight 700.</Text>
      <Text italic>Italic text.</Text>
      <Text underline>Underline text.</Text>
      <Text del>Deleted (line-through) text.</Text>
      <Text>This sentence has a <Text mark>marked highlight</Text> inside.</Text>
      <Text>Inline <Text code>code</Text> and <Text keyboard>⌘K</Text> keyboard glyph.</Text>
      <Text disabled>Disabled — muted + cursor not-allowed.</Text>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Color — semantic roles
// ════════════════════════════════════════════════════════════════

export const Color_Semantic: Story = {
  name: "Color · semantic roles",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
      <Text>Default — `--foreground`.</Text>
      <Text color="secondary">Secondary — `--muted-foreground`.</Text>
      <Text color="success">Success — `--success` (若竹).</Text>
      <Text color="warning">Warning — `--warning` (山吹).</Text>
      <Text color="attention">Attention — `--attention` (朱).</Text>
      <Text color="info">Info — `--info` (群青).</Text>
      <Text color="destructive">Destructive — `--destructive` (茜).</Text>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Link
// ════════════════════════════════════════════════════════════════

export const Link_Basic: Story = {
  name: "Link · basic + colors",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Link href="https://godx.jp">Default link → godx.jp</Link>
      <Link href="https://godx.jp" color="success">Success link</Link>
      <Link href="https://godx.jp" color="destructive">Destructive link</Link>
      <Link href="https://godx.jp" disabled>Disabled link (aria-disabled)</Link>
      <Paragraph>
        Inline link inside a paragraph — <Link href="https://godx.jp/docs">jump to documentation</Link>.
      </Paragraph>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Copyable
// ════════════════════════════════════════════════════════════════

export const Copyable: Story = {
  name: "Copyable · click to copy",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text copyable>kb@famgia.com</Text>
      <Text copyable={{ text: "8e3c-fa12-9d04-7c11" }}>
        Click to copy: 8e3c-fa…
      </Text>
      <Paragraph copyable>
        従業員ID: EMP-2026-00138 · 渋谷本店 · 田中 美咲
      </Paragraph>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Truncate
// ════════════════════════════════════════════════════════════════

export const Truncate_Single: Story = {
  name: "Truncate · single line",
  render: () => (
    <div style={{ maxWidth: 360, display: "flex", flexDirection: "column", gap: 12 }}>
      <Text truncate>
        従業員一覧 · 渋谷本店 · ベトヤ表参道 · 自由が丘店 · 新宿西口店 · 中目黒店 — 横にスクロールしません
      </Text>
      <Paragraph truncate>
        単一行クランプ。テキストがコンテナ幅を超えた場合は末尾に省略記号が付きます。
        max-width が必要なため、親要素で幅制約をかけてください。
      </Paragraph>
    </div>
  ),
};

export const Truncate_Multiline: Story = {
  name: "Truncate · multi-line clamp",
  render: () => (
    <div style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 12 }}>
      <Paragraph truncate={{ rows: 2 }}>
        2026 年 6 月リリース予定の新機能と移行ガイド。シフト自動最適化と多店舗在庫連携を
        導入します。詳細はロードマップを公開しました。さらに、勤怠データから残業・深夜・
        手当を自動計算し、マネーフォワード / freee と直接連携できるようになります。
      </Paragraph>
      <Paragraph truncate={{ rows: 3 }}>
        3 行クランプ。Famgia は飲食業の現場を支える勤怠 SaaS です。シフトの自動最適化、
        給与計算の自動連携、多店舗マルチテナント対応で、小さな店舗から大型チェーンまで
        一つの管理画面で運用できます。残業の自動申請や打刻位置の確認といった現場ロジック
        を内蔵し、店長の管理コストを下げます。
      </Paragraph>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Composition — real-world example
// ════════════════════════════════════════════════════════════════

export const Composition_Article: Story = {
  name: "Composition · article",
  render: () => (
    <article style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 12 }}>
      <Text color="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        お知らせ · 2026/05/14
      </Text>
      <Title size={2}>2026 年 6 月リリース予定の新機能</Title>
      <Paragraph>
        シフト自動最適化と多店舗在庫連携を導入します。
        従来は店長が <Text code>Excel</Text> で行っていた週次のシフト組みが、
        需要予測 + 従業員のスキル + 希望シフトを基に <Text strong>自動生成</Text> されます。
      </Paragraph>
      <Paragraph>
        ベータ版は <Link href="#">試験運用に参加</Link> から申し込みできます。
        参加店舗には <Text mark>専任サポート</Text> が付きます。
      </Paragraph>
      <Paragraph color="secondary">
        — 編集部 · 3 分で読了
      </Paragraph>
    </article>
  ),
};

// ════════════════════════════════════════════════════════════════
// Axis matrix — every modifier × every color
// ════════════════════════════════════════════════════════════════

export const Matrix_All: Story = {
  name: "Matrix · color × modifier",
  render: () => {
    const colors: Array<"default" | "secondary" | "success" | "warning" | "attention" | "info" | "destructive"> = [
      "default", "secondary", "success", "warning", "attention", "info", "destructive",
    ];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, fontSize: 14 }}>
        {colors.map((c) => (
          <div key={c} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Text color={c}>{c} — base</Text>
            <Text color={c} strong>{c} — strong</Text>
            <Text color={c} italic>{c} — italic</Text>
            <Text color={c} underline>{c} — underline</Text>
            <Text color={c} del>{c} — del</Text>
          </div>
        ))}
      </div>
    );
  },
};

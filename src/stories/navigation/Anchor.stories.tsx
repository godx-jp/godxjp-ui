import type { Meta, StoryObj } from "@storybook/react";
import { Anchor, AnchorLink } from "../../components/navigation/Anchor";
import { Typography } from "../../components/general/Typography";

const { Title, Paragraph } = Typography;

/**
 * Navigation/Anchor — in-page scroll-spy navigation.
 *
 * Vocabulary (per cardinal rule 23 §B):
 *   - `orientation` — vertical (default) | horizontal
 *   - `sticky` — pin-on-scroll boolean
 *   - `offset` — pixel offset for scroll-spy detection
 *   - `value` / `defaultValue` / `onValueChange` — controlled active hash
 *     (mirrors Tabs/Select selection vocabulary)
 */

const meta: Meta<typeof Anchor> = {
  title: "Navigation/Anchor",
  component: Anchor,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof Anchor>;

const SectionBlock = ({ id, title }: { id: string; title: string }) => (
  <section id={id} style={{ minHeight: 480, padding: "var(--spacing-6) 0", borderBottom: "1px dashed var(--border)" }}>
    <Title size={3}>{title}</Title>
    <Paragraph>
      コンテンツブロック。スクロールするとアンカーがハイライトされます。
      IntersectionObserver で表示中のセクションを検知し、アクティブ状態を更新します。
    </Paragraph>
    <Paragraph color="secondary">id = #{id}</Paragraph>
  </section>
);

// ════════════════════════════════════════════════════════════════
// Vertical (default) — compositional
// ════════════════════════════════════════════════════════════════

export const Vertical: Story = {
  name: "Vertical · compositional",
  render: () => (
    <div style={{ display: "flex", gap: "var(--spacing-6)", padding: "var(--spacing-6)", alignItems: "flex-start" }}>
      <Anchor sticky offset={20} style={{ flexShrink: 0, width: 200, top: 20 }}>
        <AnchorLink href="#intro">概要</AnchorLink>
        <AnchorLink href="#install">インストール</AnchorLink>
        <AnchorLink href="#api">API リファレンス</AnchorLink>
        <AnchorLink href="#examples">使用例</AnchorLink>
        <AnchorLink href="#faq">よくある質問</AnchorLink>
      </Anchor>
      <div style={{ flex: 1, minWidth: 0 }}>
        <SectionBlock id="intro" title="概要" />
        <SectionBlock id="install" title="インストール" />
        <SectionBlock id="api" title="API リファレンス" />
        <SectionBlock id="examples" title="使用例" />
        <SectionBlock id="faq" title="よくある質問" />
      </div>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Horizontal — compact top-bar style
// ════════════════════════════════════════════════════════════════

export const Horizontal: Story = {
  name: "Horizontal · top-bar style",
  render: () => (
    <div style={{ padding: "var(--spacing-6)" }}>
      <Anchor orientation="horizontal" sticky offset={20} style={{ top: 0, background: "var(--background)", zIndex: 10 }}>
        <AnchorLink href="#overview">概要</AnchorLink>
        <AnchorLink href="#features">機能</AnchorLink>
        <AnchorLink href="#pricing">プラン</AnchorLink>
        <AnchorLink href="#contact">お問い合わせ</AnchorLink>
      </Anchor>
      <div style={{ paddingTop: "var(--spacing-4)" }}>
        <SectionBlock id="overview" title="概要" />
        <SectionBlock id="features" title="機能" />
        <SectionBlock id="pricing" title="プラン" />
        <SectionBlock id="contact" title="お問い合わせ" />
      </div>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Data-driven — `items` array
// ════════════════════════════════════════════════════════════════

export const DataDriven: Story = {
  name: "Data-driven · items array",
  render: () => (
    <div style={{ display: "flex", gap: "var(--spacing-6)", padding: "var(--spacing-6)", alignItems: "flex-start" }}>
      <Anchor
        sticky
        offset={20}
        style={{ flexShrink: 0, width: 200, top: 20 }}
        items={[
          { href: "#section-1", label: "第 1 章" },
          { href: "#section-2", label: "第 2 章" },
          { href: "#section-3", label: "第 3 章" },
          { href: "#section-4", label: "第 4 章" },
        ]}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <SectionBlock id="section-1" title="第 1 章" />
        <SectionBlock id="section-2" title="第 2 章" />
        <SectionBlock id="section-3" title="第 3 章" />
        <SectionBlock id="section-4" title="第 4 章" />
      </div>
    </div>
  ),
};

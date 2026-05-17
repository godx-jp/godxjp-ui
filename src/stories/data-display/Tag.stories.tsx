import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Star } from "lucide-react";
import { Tag } from "../../components/data-display/Tag";
import { Flex } from "../../components/layout";

/**
 * data-display/Tag — label chip.
 *
 * Documented props (per `Tag.tsx`):
 *   color?:    TagPresetColor | string    preset or any CSS colour
 *   bordered?: boolean                    outline + tint (default true)
 *   closable?: boolean                    ⨯ button
 *   onClose?:  (e) => void
 *   icon?:     ReactNode                  leading icon
 *
 * Preset colours: default · success · warning · error · info ·
 *                 attention · primary.
 *
 * Per cardinal rule 25 stories use only documented props — colour
 * sweep iterates the documented preset enum.
 */

const meta: Meta<typeof Tag> = {
  title: "Data Display/Tag",
  component: Tag,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Tag** — Ant-Design label chip.

Distinct from \`<Badge>\`: Badge anchors a status pill (a number or a
single short word), Tag labels collections (often many in a row,
optionally closable).

Preset \`color\` snaps to a semantic CSS variable (\`var(--success)\`
etc.); custom CSS strings (\`oklch(56% 0.15 240)\`) are accepted too.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tag>;

const PRESETS = [
  "default",
  "primary",
  "success",
  "warning",
  "error",
  "info",
  "attention",
] as const;

// ─── Default ────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default · plain label",
  render: () => (
    <Flex gap="small" align="center" wrap>
      <Tag>渋谷本店</Tag>
      <Tag icon={<Star size={12} aria-hidden />}>お気に入り</Tag>
      <Tag color="primary">店長</Tag>
      <Tag color="success">承認済</Tag>
    </Flex>
  ),
};

// ─── Closable — ⨯ button triggers onClose ───────────────────────

export const Closable: Story = {
  name: "Closable · ⨯ button",
  render: () => {
    function Demo() {
      const [tags, setTags] = useState([
        "渋谷本店",
        "新宿支店",
        "横浜支店",
        "池袋支店",
      ]);
      return (
        <Flex gap="small" align="center" wrap>
          {tags.map((t) => (
            <Tag
              key={t}
              closable
              onClose={() => setTags((rest) => rest.filter((x) => x !== t))}
            >
              {t}
            </Tag>
          ))}
        </Flex>
      );
    }
    return <Demo />;
  },
};

// ─── ColorSweep — every documented preset ───────────────────────

export const ColorSweep: Story = {
  name: "ColorSweep · every preset",
  render: () => (
    <Flex gap="small" align="center" wrap>
      {PRESETS.map((c) => (
        <Tag key={c} color={c}>
          {c}
        </Tag>
      ))}
    </Flex>
  ),
};

// ─── Bordered=false — borderless variant ────────────────────────

export const Bordered_False: Story = {
  name: "Bordered=false · borderless tint",
  render: () => (
    <Flex gap="small" align="center" wrap>
      {PRESETS.map((c) => (
        <Tag key={c} color={c} bordered={false}>
          {c}
        </Tag>
      ))}
    </Flex>
  ),
};

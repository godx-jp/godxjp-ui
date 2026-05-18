import type { Meta, StoryObj } from "@storybook/react";
import {
  Check,
  ChevronRight,
  Download,
  Plus,
  Trash2,
} from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "../../components/general/Button";
import { Flex } from "../../components/layout";

/**
 * general/Button — canonical action atom.
 *
 * 100% mapped to dxs-kintai design canon
 * (`design-handoff/.../preview/comp-buttons.html`).
 *
 * Cardinal rules honoured:
 *   §14 — Radix Slot for `asChild`
 *   §21 — every axis (theme/accent/density/font-size)
 *   §22 — every literal token-pinned
 *   §23 — vocabulary (`size`, `variant`, `block`, `loading`,
 *          `startContent`, `endContent` per docs/specs/04)
 *   §24 — mobile-first touch-target floor (@media <md → 44px)
 *   §25 — story is docs; primitive is the UI (see Button.tsx +
 *          .btn CSS in shell.css for the implementation)
 */

const meta: Meta<typeof Button> = {
  title: "General/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Button** — canonical action primitive. Six variants × four sizes
+ \`block\` / \`loading\` modifiers + \`startContent\` / \`endContent\`
slots.

Vocabulary per cardinal rule 23 §B:
- \`size\`: \`"x-small" | "small" | "default" | "large"\` →
  \`--density-element-{xs,sm,default,lg}\` chain
- \`variant\`: \`"primary" | "secondary" | "outline" | "ghost" |
  "destructive" | "link"\`
- \`block\`: full-width modifier
- \`loading\`: spinner + disabled

Mobile-first per cardinal rule 24: on \`xs/sm\` viewports visual
height still follows \`size\` + density. The 44px floor is a hit-area
requirement, not a mobile visual-height override.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

// ─── Variants ───────────────────────────────────────────────────

export const Variants: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <Flex gap="small" wrap>
      <Button variant="primary" onClick={args.onClick}>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </Flex>
  ),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("clicking the primary button fires onClick", async () => {
      const btn = canvas.getByRole("button", { name: /primary/i });
      await userEvent.click(btn);
      await expect(args.onClick).toHaveBeenCalled();
    });
  },
};

// ─── Sizes ──────────────────────────────────────────────────────

export const Sizes: Story = {
  name: "Sizes (x-small / small / default / large)",
  render: () => (
    <Flex gap="small" align="center" wrap>
      <Button size="x-small">x-small</Button>
      <Button size="small">small</Button>
      <Button size="default">default</Button>
      <Button size="large">large</Button>
    </Flex>
  ),
};

// ─── Variant × Size matrix ──────────────────────────────────────

export const Matrix: Story = {
  name: "Matrix (variant × size)",
  render: () => (
    <Flex vertical gap="small">
      {(["primary", "secondary", "outline", "ghost", "destructive"] as const).map((v) => (
        <Flex key={v} gap="small" align="center" wrap>
          <Button variant={v} size="x-small">xs · {v}</Button>
          <Button variant={v} size="small">sm · {v}</Button>
          <Button variant={v}>default · {v}</Button>
          <Button variant={v} size="large">lg · {v}</Button>
        </Flex>
      ))}
    </Flex>
  ),
};

// ─── Slots — startContent / endContent ──────────────────────────

export const WithIcons: Story = {
  name: "Slots · startContent / endContent",
  render: () => (
    <Flex gap="small" wrap>
      <Button startContent={<Plus size={14} aria-hidden />}>新規</Button>
      <Button variant="secondary" startContent={<Download size={14} aria-hidden />}>
        Export
      </Button>
      <Button variant="outline" endContent={<ChevronRight size={14} aria-hidden />}>
        Next
      </Button>
      <Button variant="destructive" startContent={<Trash2 size={14} aria-hidden />}>
        Delete
      </Button>
    </Flex>
  ),
};

// ─── Loading state ──────────────────────────────────────────────

export const Loading: Story = {
  render: () => (
    <Flex gap="small" wrap>
      <Button loading>処理中…</Button>
      <Button variant="secondary" loading>Saving</Button>
      <Button variant="outline" loading>Loading</Button>
    </Flex>
  ),
};

// ─── Disabled ───────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <Flex gap="small" wrap>
      <Button disabled>Primary</Button>
      <Button variant="secondary" disabled>Secondary</Button>
      <Button variant="outline" disabled>Outline</Button>
      <Button variant="ghost" disabled>Ghost</Button>
      <Button variant="destructive" disabled>Destructive</Button>
    </Flex>
  ),
};

// ─── Block (full-width — mobile form submit pattern) ────────────

export const Block: Story = {
  name: "Block (full-width)",
  parameters: {
    docs: {
      description: {
        story: `\`block\` stretches the button to fill its parent. Common on
mobile form submit. Per cardinal rule 24 §B the painted height still
follows \`size\` + density on \`xs/sm\`; 44px is a hit-area floor.`.trim(),
      },
    },
  },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Button block>送信する</Button>
      <Button variant="outline" block>キャンセル</Button>
    </Flex>
  ),
};

// ─── asChild (Radix Slot — wrap a link / RouterLink) ────────────

export const AsChild: Story = {
  name: "asChild (Radix Slot)",
  parameters: {
    docs: {
      description: {
        story: `\`asChild\` swaps the underlying element via Radix Slot —
the button styles wrap any child without nesting. Useful for
React Router's \`<Link>\` or anchor tags.`.trim(),
      },
    },
  },
  render: () => (
    <Flex gap="small">
      <Button asChild>
        <a href="https://example.com" target="_blank" rel="noreferrer">
          <Check size={14} aria-hidden /> Open in new tab
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href="#docs">Docs ↗</a>
      </Button>
    </Flex>
  ),
};

// ─── Mobile-first touch target showcase ─────────────────────────

export const MobileTouchTarget: Story = {
  name: "Mobile-first touch target (cardinal rule 24)",
  parameters: {
    docs: {
      description: {
        story: `Resize the Storybook canvas (Viewports toolbar) to **mobile1**
(< 768px) and observe that visual height still follows \`size\` +
density. The 44px floor is handled as hit-area, not painted height.
\`variant="link"\` is text-style and exempt.`.trim(),
      },
    },
  },
  render: () => (
    <Flex vertical gap="small" align="start">
      <Button size="x-small">x-small</Button>
      <Button size="small">small</Button>
      <Button size="default">default</Button>
      <Button size="large">large</Button>
      <Button variant="link">link (text-style — exempt)</Button>
    </Flex>
  ),
};

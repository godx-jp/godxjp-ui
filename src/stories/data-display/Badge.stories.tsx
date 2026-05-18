import type { Meta, StoryObj } from "@storybook/react";
import { Bell } from "lucide-react";
import { Badge } from "../../components/data-display/Badge";
import { IconButton } from "../../components/data-display/IconButton";
import { Flex } from "../../components/layout";

/**
 * data-display/Badge — status chip / pill.
 *
 * Documented props (per `Badge.tsx`):
 *   variant?:    "primary" | "success" | "warning" | "info" | "error"
 *                | "attention" | "neutral" | "outline"
 *   appearance?: "soft" | "solid" | "outline"
 *   dot?:        boolean              colored dot before label
 *   children?:   ReactNode            label text (or numeric count)
 *
 * Per cardinal rule 25 the primitive owns the contract; stories only
 * compose documented props. Numeric counts ride through `children`
 * (the canonical chip is text-based — `数=5`, `5+`, etc.), and the
 * "anchor over icon button" pattern wraps `<IconButton>` inside a
 * relative-positioned container.
 */

const meta: Meta<typeof Badge> = {
  title: "Data Display/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Badge** — status chip / pill primitive.

Eight semantic variants × three appearances (\`soft / solid / outline\`)
+ an optional leading \`dot\`. Distinct from \`<Tag>\`: Badge anchors
status (申請中 / 承認済 / 却下), Tag labels collections.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

// ─── Default — numeric count as children ────────────────────────

export const Default: Story = {
  name: "Default · numeric count (children = 5)",
  render: () => (
    <Flex gap="default" align="center">
      <Badge variant="primary" dot={false}>5</Badge>
      <Badge variant="destructive" dot={false}>5</Badge>
      <Badge variant="success" dot={false}>5</Badge>
    </Flex>
  ),
};

// ─── Dot — boolean leading dot ──────────────────────────────────

export const Dot: Story = {
  name: "Dot · leading colored dot",
  render: () => (
    <Flex gap="default" align="center">
      <Badge variant="success" dot>稼働中</Badge>
      <Badge variant="warning" dot>申請中</Badge>
      <Badge variant="attention" dot>遅刻</Badge>
      <Badge variant="destructive" dot>却下</Badge>
      <Badge variant="neutral" dot>下書き</Badge>
    </Flex>
  ),
};

// ─── MaxCount — count > maxCount renders "N+" via children ──────

export const MaxCount: Story = {
  name: "MaxCount · cap at 99+ via children",
  render: () => (
    <Flex gap="default" align="center">
      <Badge variant="destructive" dot={false}>9</Badge>
      <Badge variant="destructive" dot={false}>42</Badge>
      <Badge variant="destructive" dot={false}>99</Badge>
      <Badge variant="destructive" dot={false}>99+</Badge>
      <Badge variant="destructive" dot={false}>999+</Badge>
    </Flex>
  ),
};

// ─── Status — success / warning / error / info ──────────────────

export const Status: Story = {
  name: "Status · success · warning · error · info",
  render: () => (
    <Flex gap="default" align="center" wrap>
      <Badge variant="success" appearance="solid">承認済</Badge>
      <Badge variant="warning" appearance="solid">要対応</Badge>
      <Badge variant="destructive" appearance="solid">却下</Badge>
      <Badge variant="info" appearance="solid">通知</Badge>
      <Badge variant="success">承認済</Badge>
      <Badge variant="warning">要対応</Badge>
      <Badge variant="destructive">却下</Badge>
      <Badge variant="info">通知</Badge>
    </Flex>
  ),
};

// ─── WithChildren — anchor over an IconButton ───────────────────

export const WithChildren: Story = {
  name: "WithChildren · anchor over IconButton",
  render: () => (
    <Flex gap="large" align="center">
      <span
        style={{
          position: "relative",
          display: "inline-flex",
        }}
      >
        <IconButton aria-label="通知">
          <Bell size={16} aria-hidden />
        </IconButton>
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -6,
          }}
        >
          <Badge variant="destructive" dot={false}>3</Badge>
        </span>
      </span>
      <span
        style={{
          position: "relative",
          display: "inline-flex",
        }}
      >
        <IconButton aria-label="通知 (多数)">
          <Bell size={16} aria-hidden />
        </IconButton>
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -6,
          }}
        >
          <Badge variant="destructive" dot={false}>99+</Badge>
        </span>
      </span>
    </Flex>
  ),
};

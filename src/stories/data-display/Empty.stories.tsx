import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";
import { Empty } from "../../components/data-display/Empty";
import { Button } from "../../components/general/Button";

/**
 * data-display/Empty — empty-state placeholder.
 *
 * Documented props (per `Empty.tsx`):
 *   image?:       ReactNode    illustration / icon (defaults to box SVG)
 *   description?: ReactNode    text below the image
 *   children?:    ReactNode    action area below description
 *
 * Stories use only these props; visual contract lives in the `.empty-*`
 * class family in shell.css per cardinal rule 25.
 */

const meta: Meta<typeof Empty> = {
  title: "Data Display/Empty",
  component: Empty,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Empty** — Ant-Design empty-state placeholder.

Three slots:
- \`image\` — illustration / icon (default: built-in box SVG)
- \`description\` — explanatory copy below the image
- \`children\` — action area (typically a CTA button)

All visual values pinned to design tokens via the \`.empty-*\` class
family in \`shell.css\`.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Empty>;

// ─── Default ────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default · built-in illustration",
  render: () => <Empty />,
};

// ─── WithDescription ────────────────────────────────────────────

export const WithDescription: Story = {
  name: "WithDescription · explanatory copy",
  render: () => (
    <Empty description="まだ申請がありません" />
  ),
};

// ─── WithAction — button in children slot ───────────────────────

export const WithAction: Story = {
  name: "WithAction · CTA button in children slot",
  render: () => (
    <Empty description="まだ申請がありません">
      <Button
        variant="primary"
        startContent={<Plus size={14} aria-hidden />}
      >
        新規申請
      </Button>
    </Empty>
  ),
};

// ─── Compact — tighter padding via the description-only variant ─

export const Compact: Story = {
  name: "Compact · description-only (no action slot)",
  render: () => (
    <Empty description="該当データなし" />
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import { QRCode } from "../../components/data-display/QRCode";
import { Flex } from "../../components/layout";

/**
 * data-display/QRCode — inline SVG QR.
 *
 * Documented props (per `QRCode.tsx`):
 *   value            string                       — text / URL to encode
 *   size?            number                       — pixels, default 160
 *   errorLevel?      "L" | "M" | "Q" | "H"
 *   color?           string                       — defaults `currentColor`
 *   bgColor?         string
 *   icon?            ReactNode                    — centre overlay
 *   iconSize?        number
 *
 * Per cardinal rule 25 the visual contract lives in the primitive
 * + the `.qrcode` class; stories only catalogue variants.
 */

const meta: Meta<typeof QRCode> = {
  title: "Data Display/QRCode",
  component: QRCode,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**QRCode** — render a QR code as inline SVG (one \`<rect>\` per
dark cell). Foreground defaults to \`currentColor\` so the QR
inherits theme axis flips automatically.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof QRCode>;

// ─── Default — encode the platform URL ──────────────────────────

export const Default: Story = {
  name: "Default · https://godx.jp",
  render: () => <QRCode value="https://godx.jp" />,
};

// ─── Sizes — small / default / large ────────────────────────────

export const Sizes: Story = {
  name: "Sizes · 96 / 160 / 240px",
  render: () => (
    <Flex gap="large" align="center">
      <QRCode value="https://godx.jp" size={96} />
      <QRCode value="https://godx.jp" size={160} />
      <QRCode value="https://godx.jp" size={240} />
    </Flex>
  ),
};

// ─── WithIcon — centre overlay ──────────────────────────────────

export const WithIcon: Story = {
  name: "WithIcon · 中央にロゴ",
  render: () => (
    <QRCode
      value="https://godx.jp"
      size={200}
      errorLevel="H"
      icon={
        <span
          style={{
            fontWeight: 700,
            fontSize: "var(--text-sm)",
            color: "var(--primary)",
          }}
        >
          G
        </span>
      }
    />
  ),
};

// ─── ColorThemed — color + bgColor variants ─────────────────────

export const ColorThemed: Story = {
  name: "ColorThemed · color / bgColor variants",
  render: () => (
    <Flex gap="large" align="center">
      <QRCode value="https://godx.jp" color="var(--foreground)" />
      <QRCode
        value="https://godx.jp"
        color="var(--primary)"
        bgColor="var(--background)"
      />
      <QRCode
        value="https://godx.jp"
        color="var(--success)"
        bgColor="var(--card)"
      />
    </Flex>
  ),
};

// ─── HighErrorCorrection — level H ─────────────────────────────

export const HighErrorCorrection: Story = {
  name: "HighErrorCorrection · level H",
  render: () => (
    <Flex gap="large" align="center">
      <QRCode value="https://godx.jp/projects/admin-platform" errorLevel="L" />
      <QRCode value="https://godx.jp/projects/admin-platform" errorLevel="H" />
    </Flex>
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import { Image } from "../../../../components/data-display/Image";
import { Flex } from "../../../../components/layout";

/**
 * new-primitives/components/data-display/Image — `<img>` with
 * optional click-to-preview lightbox.
 *
 * Documented props (per `Image.tsx`):
 *   src             string                          — URL
 *   alt             string                          — accessible label
 *   preview?        boolean                         — click → fullscreen
 *   placeholder?    ReactNode                       — while loading
 *   fallback?       ReactNode                       — when src fails
 *   loadStrategy?   "eager" | "lazy"
 *   fit?            "cover" | "contain" | "fill" | "none" | "scale-down"
 *
 * Per cardinal rule 25, all visuals come from the primitive + CSS
 * (`.image-wrap`, `.image-preview-overlay`); stories only catalogue
 * variants.
 */

const PHOTO = "https://picsum.photos/seed/godx/800/600";
const PHOTO_TALL = "https://picsum.photos/seed/godx-tall/600/900";
const BROKEN = "https://invalid.local/missing.jpg";

const meta: Meta<typeof Image> = {
  title: "new-primitives/Components/Data Display/Image",
  component: Image,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Image** — display an image with optional click-to-preview
fullscreen overlay. Tracks load / error state and swaps in the
\`placeholder\` / \`fallback\` slots.

Esc + outside-click + the corner × button close the overlay.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Image>;

// ─── Default — single image, preview on ─────────────────────────

export const Default: Story = {
  name: "Default · 写真 (click to zoom)",
  render: () => (
    <Image src={PHOTO} alt="サンプル画像" style={{ width: 320 }} />
  ),
};

// ─── WithPreview — explicit prop ────────────────────────────────

export const WithPreview: Story = {
  name: "WithPreview · 拡大プレビュー",
  render: () => (
    <Image
      src={PHOTO_TALL}
      alt="縦長サンプル"
      preview
      style={{ width: 240 }}
    />
  ),
};

// ─── Sizes — 200 / 400 / 600 width ──────────────────────────────

export const Sizes: Story = {
  name: "Sizes · 200 / 400 / 600px",
  render: () => (
    <Flex gap="middle" align="start" wrap>
      <Image src={PHOTO} alt="200px" style={{ width: 200 }} />
      <Image src={PHOTO} alt="400px" style={{ width: 400 }} />
      <Image src={PHOTO} alt="600px" style={{ width: 600 }} />
    </Flex>
  ),
};

// ─── Fit — cover vs contain ─────────────────────────────────────

export const Fit_Cover_vs_Contain: Story = {
  name: "Fit · cover vs contain",
  render: () => (
    <Flex gap="middle" align="start">
      <div style={{ width: 240, height: 180, background: "var(--muted)" }}>
        <Image
          src={PHOTO_TALL}
          alt="cover"
          fit="cover"
          style={{ width: 240, height: 180 }}
        />
      </div>
      <div style={{ width: 240, height: 180, background: "var(--muted)" }}>
        <Image
          src={PHOTO_TALL}
          alt="contain"
          fit="contain"
          style={{ width: 240, height: 180 }}
        />
      </div>
    </Flex>
  ),
};

// ─── ErrorFallback — broken src → fallback shows ────────────────

export const ErrorFallback: Story = {
  name: "ErrorFallback · 読込失敗時の代替",
  render: () => (
    <Image
      src={BROKEN}
      alt="壊れた画像"
      fallback={<span>画像を読み込めませんでした</span>}
      style={{ width: 240, height: 180 }}
    />
  ),
};

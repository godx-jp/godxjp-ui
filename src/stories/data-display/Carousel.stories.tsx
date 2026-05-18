import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Carousel } from "../../components/data-display/Carousel";

/**
 * Data Display/Carousel — slide deck primitive.
 *
 * Data API — pass `slides`. Selection
 * state via `value` / `defaultValue` / `onValueChange` per cardinal
 * rule 23 §B. NEVER Ant's `activeKey` / `autoplaySpeed`.
 */

const meta: Meta<typeof Carousel> = {
  title: "Data Display/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Carousel>;

const PALETTE = [
  { bg: "oklch(70% 0.15 240)", label: "渋み・1月の社員旅行" },
  { bg: "oklch(72% 0.13 160)", label: "簡素・2月のチーム合宿" },
  { bg: "oklch(74% 0.14 60)", label: "間・3月の決算会議" },
  { bg: "oklch(70% 0.18 30)", label: "鋭さ・4月の入社式" },
  { bg: "oklch(64% 0.14 300)", label: "落ち着き・5月の社員研修" },
];

function Slide({ bg, label }: { bg: string; label: string }) {
  return (
    <div
        style={{
          background: bg,
          color: "white",
          padding: "var(--spacing-12) var(--spacing-6)",
          fontSize: "var(--text-lg)",
          fontWeight: "var(--font-weight-medium)",
          textAlign: "center",
          minHeight: 240,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {label}
      </div>
  );
}

const slides = PALETTE.map((p) => <Slide key={p.label} {...p} />);

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Carousel slides={slides} />
    </div>
  ),
};

export const WithoutDots: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Carousel dots={false} slides={slides} />
    </div>
  ),
};

export const Autoplay: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Carousel autoplay={3000} slides={slides} />
      <p
        style={{
          marginTop: 12,
          fontSize: "var(--text-xs)",
          color: "var(--muted-foreground)",
        }}
      >
        3秒ごとに自動切替。マウスホバーで一時停止します。
      </p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ maxWidth: 480, height: 320 }}>
      <Carousel orientation="vertical" slides={slides} />
    </div>
  ),
  // Regression pin for the "vertical carousel renders every slide
  // stacked instead of clipping to one" bug. With the CSS height:100%
  // fix only the active slide is in the viewport's clipped region —
  // the rest sit translated out of view. We probe that by counting
  // slides whose bounding rect is inside the carousel viewport.
  play: async ({ canvasElement, step }) => {
    const root = canvasElement.querySelector(".carousel") as HTMLElement;
    if (!root) throw new Error("carousel root missing");

    await step("only the active slide is inside the viewport", async () => {
      const viewport = root.querySelector(".carousel-viewport") as HTMLElement;
      const slides = Array.from(root.querySelectorAll(".carousel-slide"));
      expect(slides.length).toBeGreaterThanOrEqual(2);

      const vpRect = viewport.getBoundingClientRect();
      const inside = slides.filter((s) => {
        const r = s.getBoundingClientRect();
        return r.top >= vpRect.top && r.bottom <= vpRect.bottom + 1;
      });
      await expect(inside.length).toBe(1);
    });

    await step("the dots indicator marks slide 0 as active", async () => {
      const dot0 = root.querySelector(".carousel-dot") as HTMLElement;
      await expect(dot0).toHaveAttribute("data-active", "true");
    });
  },
};

export const NoLoop: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Carousel loop={false} slides={slides} />
      <p
        style={{
          marginTop: 12,
          fontSize: "var(--text-xs)",
          color: "var(--muted-foreground)",
        }}
      >
        最初・最後でループしません。矢印がdisabledになります。
      </p>
    </div>
  ),
};

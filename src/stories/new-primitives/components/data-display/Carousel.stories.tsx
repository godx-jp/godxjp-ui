import type { Meta, StoryObj } from "@storybook/react";
import {
  Carousel,
  CarouselSlide,
} from "../../../../components/data-display/Carousel";

/**
 * Components/Data Display/Carousel — slide deck primitive.
 *
 * Compositional API — pass `<CarouselSlide>` children. Selection
 * state via `value` / `defaultValue` / `onValueChange` per cardinal
 * rule 23 §B. NEVER Ant's `activeKey` / `autoplaySpeed`.
 */

const meta: Meta<typeof Carousel> = {
  title: "new-primitives/Components/Data Display/Carousel",
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
    <CarouselSlide>
      <div
        style={{
          background: bg,
          color: "white",
          padding: "var(--spacing-12) var(--spacing-6)",
          fontSize: "var(--text-lg)",
          fontWeight: "var(--font-weight-medium)",
          textAlign: "center",
          minHeight: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {label}
      </div>
    </CarouselSlide>
  );
}

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Carousel>
        {PALETTE.map((p, i) => (
          <Slide key={i} {...p} />
        ))}
      </Carousel>
    </div>
  ),
};

export const WithoutDots: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Carousel dots={false}>
        {PALETTE.map((p, i) => (
          <Slide key={i} {...p} />
        ))}
      </Carousel>
    </div>
  ),
};

export const Autoplay: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Carousel autoplay={3000}>
        {PALETTE.map((p, i) => (
          <Slide key={i} {...p} />
        ))}
      </Carousel>
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
      <Carousel orientation="vertical">
        {PALETTE.map((p, i) => (
          <Slide key={i} {...p} />
        ))}
      </Carousel>
    </div>
  ),
};

export const NoLoop: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Carousel loop={false}>
        {PALETTE.map((p, i) => (
          <Slide key={i} {...p} />
        ))}
      </Carousel>
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

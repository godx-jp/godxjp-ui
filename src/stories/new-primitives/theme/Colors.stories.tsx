import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../../../components/primitives/Card";
import { Flex, Row, Col } from "../../../components/primitives/layout";

/**
 * new-primitives/Colors — visual catalogue for the framework's
 * color system. Source-of-truth:
 * `new-docs/03-token-system.md` §B (Colour).
 *
 * Layers:
 *   1. Brand chain (--primary family) — rescales per data-accent
 *   2. Surface chain (--background / --card / --secondary / --muted /
 *      --accent / --surface-1..3) — rescales per data-theme
 *   3. Semantic chain (success / warning / info / attention /
 *      destructive) — fixed mapping
 *   4. Wa-iro decorative palette (decorative only, never role)
 */

const meta: Meta = {
  title: "new-primitives/Theme/Colors",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Colors** — three semantic chains + one decorative palette.
Switch the **Color theme** (accent) toolbar to see the brand
chain rescale; switch **Theme** (light/dark) to see surface +
semantic chains adapt.
        `.trim(),
      },
    },
  },
};
export default meta;

const muted = { fontSize: "var(--card-meta-size)", color: "var(--muted-foreground)" } as const;
const tokenLabel = { width: 220, fontSize: "var(--text-2xs)" } as const;

function Swatch({ token, hint }: { token: string; hint?: string }) {
  return (
    <Flex align="center" gap="middle">
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-md)",
          background: `var(${token})`,
          border: "1px solid var(--border)",
          flexShrink: 0,
        }}
      />
      <code className="mono" style={tokenLabel}>{token}</code>
      {hint && <span style={{ ...muted, marginLeft: "auto" }}>{hint}</span>}
    </Flex>
  );
}

export const BrandChain: StoryObj = {
  name: "Brand chain (--primary family)",
  parameters: {
    docs: {
      description: {
        story: `Brand chain re-binds per \`data-accent\` axis. Switch
the **Color theme** toolbar (blue / green / violet / amber / rose /
slate) to see every swatch shift hue while keeping perceptual
lightness via OKLCH.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Brand chain" meta="rescales per [data-accent]">
      <div className="dv-stack">
        <Swatch token="--primary" hint="brand fill" />
        <Swatch token="--primary-foreground" hint="text on --primary" />
        <Swatch token="--ring" hint="focus ring" />
        <Swatch token="--brand" hint="logo / avatar stripe" />
        <Swatch token="--sidebar-active-bg" hint="active nav background" />
        <Swatch token="--sidebar-active-fg" hint="active nav text" />
      </div>
    </Card>
  ),
};

export const SurfaceChain: StoryObj = {
  name: "Surface chain (light + dark)",
  parameters: {
    docs: {
      description: {
        story: `Surface tokens for page / card / popover / muted fill.
Re-binds per \`data-theme\` axis (switch toolbar light↔dark).
Lightness in OKLCH: light 93–99% / chroma ≤0.005; dark 18–30% /
chroma ≤0.008.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Surface chain" meta="rescales per [data-theme]">
      <div className="dv-stack">
        <Swatch token="--background" hint="page bg" />
        <Swatch token="--foreground" hint="default text" />
        <Swatch token="--card" hint="raised surface" />
        <Swatch token="--card-foreground" hint="text on --card" />
        <Swatch token="--popover" hint="floating surface" />
        <Swatch token="--secondary" hint="muted fill (table head, switch track)" />
        <Swatch token="--muted" hint="muted text bg (chip default)" />
        <Swatch token="--muted-foreground" hint="muted text" />
        <Swatch token="--accent" hint="hover tint" />
        <Swatch token="--surface-1" hint="= card" />
        <Swatch token="--surface-2" hint="page bg subtle" />
        <Swatch token="--surface-3" hint="hover / active tint" />
        <Swatch token="--border" hint="hairline 1px" />
        <Swatch token="--input" hint="input border" />
        <Swatch token="--input-background" hint="input fill" />
      </div>
    </Card>
  ),
};

export const SemanticChain: StoryObj = {
  name: "Semantic chain (success / warning / info / attention / destructive)",
  parameters: {
    docs: {
      description: {
        story: `Fixed mapping — NEVER substitute. **Prefer
\`attention\` (朱) over \`destructive\` (茜) for non-destructive
alerts** (lateness, slow op, retryable failure). The
"everything's red" pattern is dated.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Semantic chain" meta="fixed mapping">
      <div className="dv-stack">
        <Swatch token="--success" hint="若竹 #68be8d · 72% 0.13 155" />
        <Swatch token="--warning" hint="山吹 #f8b500 · 80% 0.17 85" />
        <Swatch token="--info" hint="群青 #4c6cb3 · 55% 0.12 265" />
        <Swatch token="--attention" hint="朱 #eb6101 · 66% 0.19 45 — non-destructive alert" />
        <Swatch token="--destructive" hint="茜 #b7282e · 52% 0.18 25 — terminal / destructive" />
        <Swatch token="--error" hint="alias of --destructive" />
      </div>
    </Card>
  ),
};

const WAIRO_PALETTE: Array<[string, string, string]> = [
  ["--wa-ai",       "藍",  "indigo (info dark)"],
  ["--wa-gunjo",    "群青", "ultramarine (info)"],
  ["--wa-ruri",     "瑠璃", "lapis (primary saturated)"],
  ["--wa-kon",      "紺",  "navy (text emphasis)"],
  ["--wa-wakatake", "若竹", "young bamboo (success)"],
  ["--wa-moegi",    "萌葱", "spring green (success dark)"],
  ["--wa-yamabuki", "山吹", "mountain yellow (warning)"],
  ["--wa-shu",      "朱",  "vermilion (attention)"],
  ["--wa-akane",    "茜",  "madder (danger)"],
  ["--wa-enji",     "臙脂", "cochineal"],
  ["--wa-sakura",   "桜",  "cherry (soft info bg)"],
  ["--wa-sumi",     "墨",  "ink (warm text)"],
  ["--wa-nezu",     "鼠",  "mouse grey (muted text)"],
];

export const WaIroPalette: StoryObj = {
  name: "Wa-iro 和色 decorative palette",
  parameters: {
    docs: {
      description: {
        story: `Traditional Japanese hues for **charts / tags /
brand tints only** — NEVER mapped to a semantic role (mapping
a wa-iro hue to success/destructive breaks the user's mental
model of the role colors).`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Wa-iro decorative palette" meta="charts · tags · tints">
      <div className="dv-stack">
        {WAIRO_PALETTE.map(([tok, name, hint]) => (
          <Flex key={tok} align="center" gap="middle">
            <span
              style={{
                width: 32, height: 32, borderRadius: "var(--radius-md)",
                background: `var(${tok})`, border: "1px solid var(--border)", flexShrink: 0,
              }}
            />
            <code className="mono" style={tokenLabel}>{tok}</code>
            <span style={{ width: 40, fontWeight: 500 }}>{name}</span>
            <span style={{ ...muted, marginLeft: "auto" }}>{hint}</span>
          </Flex>
        ))}
      </div>
    </Card>
  ),
};

export const AccentPalettes: StoryObj = {
  name: "Accent palettes (theme color axis)",
  parameters: {
    docs: {
      description: {
        story: `Six accent palettes the framework ships. Each
re-binds the brand chain (--primary, --primary-foreground, --ring,
--brand, --sidebar-active-*). Set on \`<html>\` via
\`data-accent="<name>"\` — the Storybook toolbar drives this for
preview.`.trim(),
      },
    },
  },
  render: () => (
    <Row gutter={[14, 14]}>
      {[
        { name: "blue",   hint: "default — SmartHR blue", hue: "246" },
        { name: "green",  hint: "success-leaning",         hue: "158" },
        { name: "violet", hint: "enterprise-cool",         hue: "302" },
        { name: "amber",  hint: "warmth / hospitality",    hue: "75" },
        { name: "rose",   hint: "attention / brand var",   hue: "18" },
        { name: "slate",  hint: "low-chroma neutral",      hue: "250" },
      ].map((p) => (
        <Col span={8} key={p.name}>
          <div data-accent={p.name} style={{ display: "contents" }}>
            <Card title={`accent="${p.name}"`} meta={`hue ${p.hue}°`}>
              <Flex gap="small" align="center">
                <span style={{ width: 24, height: 24, borderRadius: "var(--radius-md)", background: "var(--primary)" }} />
                <span style={{ width: 24, height: 24, borderRadius: "var(--radius-md)", background: "var(--ring)" }} />
                <span style={{ width: 24, height: 24, borderRadius: "var(--radius-md)", background: "var(--brand)" }} />
                <span style={{ width: 24, height: 24, borderRadius: "var(--radius-md)", background: "var(--sidebar-active-bg)", border: "1px solid var(--border)" }} />
              </Flex>
              <div style={{ ...muted, marginTop: 8 }}>{p.hint}</div>
            </Card>
          </div>
        </Col>
      ))}
    </Row>
  ),
};

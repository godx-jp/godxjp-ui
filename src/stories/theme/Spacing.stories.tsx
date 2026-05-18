import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../../components/data-display/Card";
import { Flex, Row, Col } from "../../components/layout";

/**
 * Theme/Spacing — visual catalogue for the framework's
 * spacing system. Two layers:
 *
 *   1. `--spacing-{0..24}` — the 4px-grid scale used for gaps,
 *      paddings, margins inside primitives. Fixed across density
 *      axis (rem rescales with font-size only).
 *   2. `--density-*` — context-aware density chain (element /
 *      card / page / section / header). Re-binds per
 *      `[data-density]` axis. Switch the Storybook density
 *      toolbar to see every density value rescale live.
 *
 * Per cardinal rule 21 every component reads these tokens, not
 * hardcoded literals. Per cardinal rule 22 the values are pinned
 * to the dxs-kintai canon (`design-handoff/.../colors_and_type.css`).
 *
 * Source-of-truth: `docs/specs/03-token-system.md` §D + §E.
 */

const meta: Meta = {
  title: "Theme/Spacing",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Spacing** — the framework's two-layer spacing system. Source-of-truth:
[\`docs/specs/03-token-system.md\`](https://github.com/godx-jp/godxjp-ui/blob/main/docs/specs/03-token-system.md)
§D (spacing scale) + §E (density chain).
        `.trim(),
      },
    },
  },
};
export default meta;

const muted = {
  fontSize: "var(--card-meta-size)",
  color: "var(--muted-foreground)",
} as const;
const tokenLabel = { width: 200, fontSize: "var(--text-2xs)" } as const;
const tokenValue = {
  width: 150,
  fontSize: "var(--text-2xs)",
  color: "var(--muted-foreground)",
} as const;

const SPACING_SCALE: Array<[string, string, number]> = [
  ["--spacing-0", "0", 0],
  ["--spacing-1", "0.25rem · 4px", 4],
  ["--spacing-2", "0.5rem · 8px", 8],
  ["--spacing-3", "0.75rem · 12px", 12],
  ["--spacing-4", "1rem · 16px", 16],
  ["--spacing-5", "1.25rem · 20px", 20],
  ["--spacing-6", "1.5rem · 24px", 24],
  ["--spacing-8", "2rem · 32px", 32],
  ["--spacing-10", "2.5rem · 40px", 40],
  ["--spacing-12", "3rem · 48px", 48],
  ["--spacing-16", "4rem · 64px", 64],
  ["--spacing-20", "5rem · 80px", 80],
  ["--spacing-24", "6rem · 96px", 96],
];

const DENSITY_TOKENS: string[] = [
  "--density-element-xs",
  "--density-element-sm",
  "--density-element",
  "--density-element-lg",
  "--density-element-xl",
  "--density-card",
  "--density-dialog",
  "--density-page",
  "--density-section",
  "--density-page-title",
  "--density-table-head",
  "--header-height",
  "--touch-target-min",
];

export const Scale: StoryObj = {
  name: "Spacing scale (--spacing-{0..24})",
  parameters: {
    docs: {
      description: {
        story: `4px-grid scale used for gaps, paddings, margins inside
primitives. Values in rem so the \`data-font-size\` axis rescales
the visual bar.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Spacing scale" meta="4px grid">
      <div className="dv-stack">
        {SPACING_SCALE.map(([name, val, w]) => (
          <Flex key={name} align="center" gap="default">
            <code className="mono" style={tokenLabel}>
              {name}
            </code>
            <span className="mono" style={tokenValue}>
              {val}
            </span>
            <span
              style={{
                height: 6,
                width: w,
                background: "var(--primary)",
                borderRadius: 2,
              }}
            />
          </Flex>
        ))}
      </div>
    </Card>
  ),
};

function DensityRow({ token }: { token: string }) {
  return (
    <Flex align="center" gap="default">
      <code className="mono" style={tokenLabel}>
        {token}
      </code>
      <span
        style={{
          height: 6,
          width: `var(${token})`,
          minWidth: 4,
          background: "var(--primary)",
          borderRadius: 2,
        }}
      />
      <span className="mono" style={{ ...muted, marginLeft: "auto" }}>
        var({token})
      </span>
    </Flex>
  );
}

export const Density: StoryObj = {
  name: "Density chain (--density-*)",
  parameters: {
    docs: {
      description: {
        story: `Context-aware density tokens. Switch the **Density**
toolbar in Storybook (compact / default / comfortable) to see
every bar rescale live. \`--touch-target-min: 44px\` is the WCAG
floor and does NOT scale.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Density tokens" meta="[data-density] axis">
      <div className="dv-stack">
        {DENSITY_TOKENS.map((tok) => (
          <DensityRow key={tok} token={tok} />
        ))}
      </div>
    </Card>
  ),
};

export const DensityPaddingMatrix: StoryObj = {
  name: "Density × Padding matrix (Card)",
  parameters: {
    docs: {
      description: {
        story: `Card padding rescales through TWO axes simultaneously:
**density** (\`compact / default / comfortable\` → \`--density-card\`
0.75 / 1 / 1.5 rem) × **padding** prop (\`tight / default / cozy\`
multiplier 0.75 / 1 / 1.25). Switch the Storybook density toolbar
to see the matrix shift.`.trim(),
      },
    },
  },
  render: () => (
    <Flex vertical gap="default">
      <div style={muted}>
        Density axis lives on Storybook toolbar — switch & observe.
      </div>
      <Row gutter={[14, 14]}>
        {(["tight", "default", "cozy"] as const).map((p) => (
          <Col span={8} key={p}>
            <Card padding={p} title={`padding="${p}"`}>
              <span style={muted}>
                Horizontal = <code>var(--density-card)</code> × multiplier.
                Vertical chrome = <code>var(--card-pad-y-*)</code>.
              </span>
            </Card>
          </Col>
        ))}
      </Row>
    </Flex>
  ),
};

export const CardChromeTokens: StoryObj = {
  name: "Card chrome tokens",
  parameters: {
    docs: {
      description: {
        story: `Component-scope tokens pinned to the dxs-kintai design
canon (\`design-handoff/.../comp-card.html\`). Carry the design's
literal 10/14/10 px vertical pad; horizontal pad reads
\`--density-card\` for density-axis participation.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Card chrome tokens" meta="pinned to comp-card.html">
      <div className="dv-stack">
        {[
          ["--card-pad-y-header", "0.625rem · 10px", "design `.ch` pad-y"],
          ["--card-pad-y-body", "0.875rem · 14px", "design `.cb` pad-y"],
          ["--card-pad-y-footer", "0.625rem · 10px", "design `.cf` pad-y"],
          ["--card-header-gap", "0.625rem · 10px", "design `.ch` gap"],
          ["--card-title-size", "0.8125rem · 13px", "design `.ch .t`"],
          [
            "--card-meta-size",
            "0.6875rem · 11px",
            "design `.ch .sub` / `.micro`",
          ],
          ["--card-kicker-size", "0.625rem · 10px", "design `.ch-kicker .k`"],
          ["--card-band-height", "4px · literal", "design `.ch-band`"],
        ].map(([tok, val, src]) => (
          <Flex key={tok} gap="default" align="center">
            <code className="mono" style={tokenLabel}>
              {tok}
            </code>
            <span className="mono" style={tokenValue}>
              {val}
            </span>
            <span style={{ ...muted, marginLeft: "auto" }}>{src}</span>
          </Flex>
        ))}
      </div>
    </Card>
  ),
};

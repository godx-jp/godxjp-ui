import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../../../components/data-display/Card";
import { Flex } from "../../../components/layout";

/**
 * new-primitives/Radius & Shadow & Motion — three foundation
 * showcases consolidated in one file (each is small, related,
 * usually consulted together).
 *
 * Source-of-truth: `new-docs/03-token-system.md` §F (radius),
 * §G (shadow), §H (motion).
 */

const meta: Meta = {
  title: "new-primitives/Theme/Radius · Shadow · Motion",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Radius / Shadow / Motion** — foundation tokens for surface
geometry and animation. Three layers usually consulted together:
radius (border-radius scale), shadow (elevation ladder), motion
(transition timings + easing curves).
        `.trim(),
      },
    },
  },
};
export default meta;

const muted = { fontSize: "var(--card-meta-size)", color: "var(--muted-foreground)" } as const;
const tokenLabel = { width: 160, fontSize: "var(--text-2xs)", fontFamily: "var(--font-mono)" } as const;
const valLabel = { width: 150, fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" } as const;

export const Radius: StoryObj = {
  name: "Radius (--radius-{sm,md,lg,xl,full})",
  parameters: {
    docs: {
      description: {
        story: `Base \`--radius: 0.375rem\` (6px). Derivatives via
\`calc()\`. Conventions: buttons / inputs = \`--radius-md\` (4px);
cards / dialogs = \`--radius-lg\` (6px); tags / chips =
\`--radius-full\` (pill). Border width locked to \`1px\`; 2px
reserved for accent edges + focus rings.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Radius scale" meta="base 6px">
      <div className="dv-stack">
        {[
          ["--radius-sm",   "calc(--radius - 4px) · 2px", "meta chips, tiny tags"],
          ["--radius-md",   "calc(--radius - 2px) · 4px", "buttons, inputs"],
          ["--radius-lg",   "var(--radius) · 6px",        "cards, dialogs"],
          ["--radius-xl",   "calc(--radius + 4px) · 10px", "hero / large surfaces"],
          ["--radius-full", "9999px",                       "pills, dots, avatars"],
        ].map(([tok, val, hint]) => (
          <Flex key={tok} align="center" gap="middle">
            <code style={tokenLabel}>{tok}</code>
            <code style={valLabel}>{val}</code>
            <span
              style={{
                width: 48,
                height: 32,
                background: "var(--primary)",
                borderRadius: `var(${tok})`,
              }}
            />
            <span style={{ ...muted, marginLeft: "auto" }}>{hint}</span>
          </Flex>
        ))}
      </div>
    </Card>
  ),
};

export const Shadow: StoryObj = {
  name: "Shadow (--shadow / --shadow-sm..2xl + inner)",
  parameters: {
    docs: {
      description: {
        story: `Six elevation levels — climb only when the surface
needs it. Cards at rest = **NO shadow** (border only). Hover →
\`--shadow-sm\`. Popover / dropdown → \`--shadow-md\`. Dialog /
modal → \`--shadow-xl\`. Climbing the ladder without design-canon
backing is rejected at review.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Shadow ladder" meta="climb sparingly">
      <div className="dv-stack">
        {[
          ["--shadow-sm",    "subtle lift",         "card hover"],
          ["--shadow",       "1px elevation",       "tooltip"],
          ["--shadow-md",    "2px elevation",       "popover, dropdown"],
          ["--shadow-lg",    "3px elevation",       "context menu"],
          ["--shadow-xl",    "4px elevation",       "dialog / modal"],
          ["--shadow-2xl",   "5px deep",            "command palette"],
          ["--shadow-inner", "inset depression",    "inset input bg"],
        ].map(([tok, val, hint]) => (
          <Flex key={tok} align="center" gap="middle">
            <code style={tokenLabel}>{tok}</code>
            <code style={valLabel}>{val}</code>
            <span
              style={{
                width: 48,
                height: 32,
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow: `var(${tok})`,
              }}
            />
            <span style={{ ...muted, marginLeft: "auto" }}>{hint}</span>
          </Flex>
        ))}
      </div>
    </Card>
  ),
};

function MotionRow({ tok, val }: { tok: string; val: string }) {
  return (
    <Flex align="center" gap="middle">
      <code style={tokenLabel}>{tok}</code>
      <code style={valLabel}>{val}</code>
      <div
        style={{
          width: 240,
          height: 32,
          background: "var(--secondary)",
          borderRadius: "var(--radius-md)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: 32,
            background: "var(--primary)",
            borderRadius: "var(--radius-md)",
            animation: `motion-demo ${val} infinite alternate ease-in-out`,
          }}
        />
        <style>{`
          @keyframes motion-demo {
            from { transform: translateX(0); }
            to { transform: translateX(208px); }
          }
        `}</style>
      </div>
    </Flex>
  );
}

export const Motion: StoryObj = {
  name: "Motion (--transition-* + --ease-*)",
  parameters: {
    docs: {
      description: {
        story: `Four transition durations + three easing curves.
Conventions: hover = \`--transition-fast + ease-out\`. Open /
close = \`--transition-base + ease-out\`. Long transitions =
\`--transition-slow + ease-in-out\`. Honour
\`prefers-reduced-motion\` globally at @layer base.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Motion tokens" meta="bars demo loop">
      <div className="dv-stack">
        <MotionRow tok="--transition-fast" val="150ms" />
        <MotionRow tok="--transition-base" val="200ms" />
        <MotionRow tok="--transition-slow" val="300ms" />
        <MotionRow tok="--transition-slower" val="500ms" />
      </div>
      <div style={{ ...muted, marginTop: 12 }}>
        Easing tokens (apply via <code className="mono">transition-timing-function</code>):
      </div>
      <div className="dv-stack" style={{ marginTop: 8 }}>
        {[
          ["--ease-in",     "cubic-bezier(0.4, 0, 1, 1)",   "accelerate in"],
          ["--ease-out",    "cubic-bezier(0, 0, 0.2, 1)",   "decelerate out (default)"],
          ["--ease-in-out", "cubic-bezier(0.4, 0, 0.2, 1)", "smooth two-sided"],
        ].map(([tok, val, hint]) => (
          <Flex key={tok} align="center" gap="middle">
            <code style={tokenLabel}>{tok}</code>
            <code style={valLabel}>{val}</code>
            <span style={muted}>{hint}</span>
          </Flex>
        ))}
      </div>
    </Card>
  ),
};

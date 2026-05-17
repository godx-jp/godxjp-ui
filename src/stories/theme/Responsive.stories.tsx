import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Card } from "../../components/data-display/Card";
import { Flex, Row, Col } from "../../components/layout";
import { useBreakpoint, matchBreakpoint } from "../../hooks/useBreakpoint";
import type { Breakpoint } from "../../hooks/useBreakpoint";

/**
 * Theme/theme/Responsive — breakpoint token catalogue +
 * live readout.
 *
 * Source-of-truth: `new-docs/03-token-system.md` §I-2.
 *
 * Per cardinal rule 22 every breakpoint value is token-pinned
 * (`--breakpoint-{xs,sm,md,lg,xl,xxl}`). Components NEVER hardcode
 * the px literal — they read via `useBreakpoint` / `matchBreakpoint`
 * (JS) or Tailwind utility variants `sm:` / `md:` / `lg:` / `xl:` /
 * `2xl:` (compile-time).
 */

const meta: Meta = {
  title: "Theme/Responsive",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Responsive breakpoints** — six mobile-first min-width thresholds
pinned as tokens. Match Tailwind v4 defaults so existing utility
classes (\`sm:grid-cols-2 lg:grid-cols-4\`) keep working unchanged.
        `.trim(),
      },
    },
  },
};
export default meta;

const muted = { fontSize: "var(--card-meta-size)", color: "var(--muted-foreground)" } as const;
const tokenLabel = { width: 160, fontSize: "var(--text-2xs)", fontFamily: "var(--font-mono)" } as const;
const valLabel = { width: 200, fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" } as const;

const BREAKPOINTS: Array<[Breakpoint, string, string]> = [
  ["xs",  "0",      "phone portrait — mobile-first base"],
  ["sm",  "640px",  "phone landscape / tablet portrait · 40em"],
  ["md",  "768px",  "tablet landscape · 48em"],
  ["lg",  "1024px", "laptop · 64em"],
  ["xl",  "1280px", "desktop · 80em"],
  ["xxl", "1536px", "wide desktop / 4K-leaning · 96em"],
];

export const Scale: StoryObj = {
  name: "Breakpoint scale (--breakpoint-*)",
  parameters: {
    docs: {
      description: {
        story: `Six tokens, mobile-first ordering. Names \`xs/sm/md/lg/xl/xxl\`
match Row/Col + useBreakpoint vocabulary (cardinal rule 23 §B).
Tailwind \`2xl:\` utility variant aliases to \`--breakpoint-xxl\`.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Breakpoint scale" meta="mobile-first min-width">
      <div className="dv-stack">
        {BREAKPOINTS.map(([bp, px, hint]) => (
          <Flex key={bp} align="center" gap="middle">
            <code style={tokenLabel}>--breakpoint-{bp}</code>
            <code style={valLabel}>{px}</code>
            <span style={muted}>{hint}</span>
          </Flex>
        ))}
      </div>
    </Card>
  ),
};

function LiveReadout() {
  const bp = useBreakpoint();
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? 0 : window.innerWidth,
  );
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Card
      title="Live viewport"
      meta={`useBreakpoint() = "${bp}"`}
      accent="primary"
    >
      <Flex vertical gap="small">
        <Flex align="baseline" gap="middle">
          <span className="stat lg">{width}<span className="unit">px</span></span>
          <span style={muted}>resize your browser to watch this re-render</span>
        </Flex>
        <div className="dv-stack" style={{ marginTop: 8 }}>
          {BREAKPOINTS.map(([target]) => (
            <Flex key={target} align="center" gap="middle">
              <code className="mono" style={{ width: 60, fontSize: "var(--text-xs)" }}>{target}</code>
              <code className="mono" style={muted}>matchBreakpoint(bp, "{target}")</code>
              <span
                className="dot"
                style={{
                  background: matchBreakpoint(bp, target) ? "var(--success)" : "var(--muted-foreground)",
                  marginLeft: "auto",
                  width: 8,
                  height: 8,
                }}
              />
              <span style={{ ...muted, width: 40 }}>
                {matchBreakpoint(bp, target) ? "true" : "false"}
              </span>
            </Flex>
          ))}
        </div>
      </Flex>
    </Card>
  );
}

export const LiveReadoutStory: StoryObj = {
  name: "Live viewport readout (useBreakpoint)",
  parameters: {
    docs: {
      description: {
        story: `Live demo of \`useBreakpoint()\` + \`matchBreakpoint()\`.
The card updates as you resize the browser (or rotate a device).
Token chain: \`getComputedStyle(:root).--breakpoint-md\` → matchMedia
\`(min-width: 768px)\` → React state.`.trim(),
      },
    },
  },
  render: () => <LiveReadout />,
};

export const RowColResponsive: StoryObj = {
  name: "Row/Col responsive layout",
  parameters: {
    docs: {
      description: {
        story: `Classic 24-col responsive grid. Each \`<Col>\` takes
\`xs={24}\` (full width on phones) and \`md={8}\` (3-col layout
from tablet-landscape up). The Row's \`gutter={{ xs: 8, md: 16 }}\`
reads the live breakpoint via \`getComputedStyle\` (cardinal rule
22 — no hardcoded px).`.trim(),
      },
    },
  },
  render: () => (
    <Row gutter={{ xs: 8, md: 16 }}>
      <Col xs={24} md={8}>
        <Card padding="default" title="Mobile · 24/24" meta="xs={24}">
          On phone: full width. On md+: 1/3 width.
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card padding="default" title="Mobile · 24/24" meta="md={8}">
          Resize narrow → cards stack vertically.
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card padding="default" title="Mobile · 24/24" meta="—">
          Resize wide → 3-up grid.
        </Card>
      </Col>
    </Row>
  ),
};

export const TailwindUtilities: StoryObj = {
  name: "Tailwind utility variants (sm: / md: / lg: / xl: / 2xl:)",
  parameters: {
    docs: {
      description: {
        story: `Tailwind v4 utility variants resolve via the
\`@theme inline\` map in \`tokens/tailwind.css\` — so
\`md:grid-cols-3\` uses \`--breakpoint-md\` (768px) at compile
time.

The grid below: 1 column on \`xs\`, 2 on \`sm\`, 3 on \`md\`,
4 on \`lg\`, 6 on \`xl\`.`.trim(),
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} padding="tight">
          <span style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)" }}>{i + 1}</span>
        </Card>
      ))}
    </div>
  ),
};

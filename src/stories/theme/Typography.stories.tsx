import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../../components/data-display/Card";
import { Flex } from "../../components/layout";

/**
 * Theme/Typography — visual catalogue for the type scale,
 * heading aliases, weights, line-heights, and family stacks.
 *
 * Source-of-truth: `docs/specs/03-token-system.md` §C.
 *
 * Brand voice (簡素 — kanso): three weights only (400 / 500 / 700);
 * line-height 1.7 for JP body (間 — ma); intentionally small
 * headings (20/18/14/13) for info-dense enterprise.
 */

const meta: Meta = {
  title: "Theme/Typography",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Typography** — type scale (\`--text-2xs\` → \`--text-4xl\`),
heading aliases (\`--heading-h1\` → \`--heading-h4\`), three
weights only (\`400 / 500 / 700\` — 簡素), four line-heights
(\`none / tight / normal / body 1.7 / relaxed / loose\`), and the
JP-first font stack (\`M PLUS 2\` head + Hiragino fallback).
        `.trim(),
      },
    },
  },
};
export default meta;

const muted = { fontSize: "var(--card-meta-size)", color: "var(--muted-foreground)" } as const;
const tokenLabel = { width: 130, fontSize: "var(--text-2xs)", fontFamily: "var(--font-mono)" } as const;
const valLabel = { width: 150, fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" } as const;

const TYPE_SCALE: Array<[string, string, string]> = [
  ["--text-2xs",  "0.6875rem · 11px", "fine print"],
  ["--text-xs",   "0.75rem · 12px",   "caption / label"],
  ["--text-sm",   "0.8125rem · 13px", "dense table"],
  ["--text-base", "0.875rem · 14px",  "DEFAULT body (JP density)"],
  ["--text-md",   "1rem · 16px",      "content-heavy body"],
  ["--text-lg",   "1.125rem · 18px",  "subheading"],
  ["--text-xl",   "1.25rem · 20px",   "h3 / page title"],
  ["--text-2xl",  "1.5rem · 24px",    "h2"],
  ["--text-3xl",  "1.875rem · 30px",  ""],
  ["--text-4xl",  "2rem · 32px",      "h1 cap"],
];

export const Scale: StoryObj = {
  name: "Type scale (--text-2xs → --text-4xl)",
  parameters: {
    docs: {
      description: {
        story: `Ten-step type scale. \`--text-base: 0.875rem\` (14px)
is the JP-density default body size. Rescales with the
\`data-font-size\` axis (sm 14 / base 16 / lg 18 / xl 20 root).`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Type scale" meta="lang='ja'">
      <div className="dv-stack">
        {TYPE_SCALE.map(([tok, val, hint]) => (
          <Flex key={tok} align="baseline" gap="middle">
            <code style={tokenLabel}>{tok}</code>
            <code style={valLabel}>{val}</code>
            <span style={{ fontSize: `var(${tok})`, fontWeight: 500 }} lang="ja">あア漢 Aa 123</span>
            {hint && <span style={{ ...muted, marginLeft: "auto" }}>{hint}</span>}
          </Flex>
        ))}
      </div>
    </Card>
  ),
};

export const HeadingAliases: StoryObj = {
  name: "Heading aliases (h1–h4)",
  parameters: {
    docs: {
      description: {
        story: `JP enterprise convention — headings stay small for
info-dense layouts. Headings render via the alias chain so a
designer reading "h1" gets a consistent size without picking from
the raw scale.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Heading semantic aliases" meta="intentionally small">
      <div className="dv-stack">
        {[
          ["--heading-h1", "var(--text-xl) · 20px", "page title"],
          ["--heading-h2", "var(--text-lg) · 18px", "section title"],
          ["--heading-h3", "var(--text-base) · 14px", "card title-ish"],
          ["--heading-h4", "var(--text-sm) · 13px", "sub-section"],
        ].map(([tok, val, hint]) => (
          <Flex key={tok} align="baseline" gap="middle">
            <code style={tokenLabel}>{tok}</code>
            <code style={valLabel}>{val}</code>
            <span style={{ fontSize: `var(${tok})`, fontWeight: 500 }} lang="ja">勤怠ダッシュボード</span>
            <span style={{ ...muted, marginLeft: "auto" }}>{hint}</span>
          </Flex>
        ))}
      </div>
    </Card>
  ),
};

export const Weights: StoryObj = {
  name: "Weights (400 / 500 / 700 — 簡素)",
  parameters: {
    docs: {
      description: {
        story: `**Three weights only**. No 300 (kana strokes
disappear at small sizes). No 600 (ambiguous between 500 and 700).
\`--font-weight-semibold: 600\` exists as a legacy alias; new code
uses 500 or 700.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Weights" meta="three only · 簡素 (kanso)">
      <div className="dv-stack">
        {[
          ["--font-weight-normal", "400", "body"],
          ["--font-weight-medium", "500", "heading default · freee vibes"],
          ["--font-weight-bold", "700", "emphasis only"],
        ].map(([tok, w, hint]) => (
          <Flex key={tok} align="baseline" gap="middle">
            <code style={tokenLabel}>{tok}</code>
            <code style={valLabel}>{w}</code>
            <span style={{ fontSize: "var(--text-base)", fontWeight: w as React.CSSProperties["fontWeight"] }} lang="ja">
              勤怠データ — Attendance data — 168.5h
            </span>
            <span style={{ ...muted, marginLeft: "auto" }}>{hint}</span>
          </Flex>
        ))}
      </div>
    </Card>
  ),
};

export const LineHeights: StoryObj = {
  name: "Line heights (1 / 1.25 / 1.5 / 1.7 / 1.625 / 2)",
  parameters: {
    docs: {
      description: {
        story: `\`--leading-body: 1.7\` is the JP body default
(間 / ma principle — vertical breathing room). Headings use
\`--leading-tight: 1.25\`. Dense / single-line UI uses
\`--leading-normal: 1.5\`.`.trim(),
      },
    },
  },
  render: () => (
    <Card title="Line-heights">
      <div className="dv-stack">
        {[
          ["--leading-none",    "1",     "single-line UI"],
          ["--leading-tight",   "1.25",  "headings"],
          ["--leading-normal",  "1.5",   "dense UI"],
          ["--leading-body",    "1.7",   "JP body — 間 (ma)"],
          ["--leading-relaxed", "1.625", ""],
          ["--leading-loose",   "2",     ""],
        ].map(([tok, val, hint]) => (
          <Flex key={tok} align="start" gap="middle">
            <code style={tokenLabel}>{tok}</code>
            <code style={valLabel}>{val}</code>
            <p
              lang="ja"
              style={{
                margin: 0,
                lineHeight: `var(${tok})`,
                fontSize: "var(--text-base)",
                maxWidth: 280,
              }}
            >
              勤怠データを保存します。ご確認ください。続きを下に表示します。
            </p>
            <span style={{ ...muted, marginLeft: "auto" }}>{hint}</span>
          </Flex>
        ))}
      </div>
    </Card>
  ),
};

export const FontFamily: StoryObj = {
  name: "Font stacks",
  parameters: {
    docs: {
      description: {
        story: `\`--font-sans-jp\`: M PLUS 2 (Google) + Hiragino +
Yu Gothic fallback chain — the JP-first stack. \`--font-mono\`:
ui-monospace + SF Mono + Menlo — for tabular numerics and code.
NEVER substitute Inter / Roboto / Arial — cardinal rule 22 +
Anthropic frontend-design skill anti-pattern.`.trim(),
      },
    },
  },
  render: () => (
    <Flex vertical gap="middle">
      <Card title="--font-sans-jp" meta="M PLUS 2 + JP fallback chain">
        <p lang="ja" style={{ margin: 0, fontFamily: "var(--font-sans-jp)", fontSize: "var(--text-base)", lineHeight: "var(--leading-body)" }}>
          勤怠ダッシュボード — Attendance Dashboard<br/>
          Hôm nay là ngày 15 tháng 5 năm 2026.<br/>
          The quick brown fox jumps over the lazy dog. 1234567890.
        </p>
      </Card>
      <Card title="--font-mono" meta="ui-monospace + SF Mono">
        <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontVariantNumeric: "tabular-nums", lineHeight: 1.5 }}>
{`2026/05/17 14:32 · ¥4,500 · 渋谷本店
2026/05/17 14:28 · ¥3,200 · 渋谷本店
2026/05/17 14:15 · ¥8,100 · 表参道店`}
        </pre>
      </Card>
    </Flex>
  ),
};

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { describe, expect, it } from "vitest";

import { AgentBadge } from "../badge";
import { renderWithUi } from "@/test/render";

/**
 * `<AgentBadge />` is the "AI agent" label beside a name: a localized default, a span by default
 * (it sits in a name's text line), a violet outline read through role-mirror knobs, never wrapping.
 */
const styles = readFileSync(resolve(process.cwd(), "src/styles/badge-layout.css"), "utf8");
const tokens = readFileSync(resolve(process.cwd(), "src/tokens/components/badge.css"), "utf8");
const foundation = readFileSync(resolve(process.cwd(), "src/tokens/foundation.css"), "utf8");

/** The `vi` string `renderWithUi` resolves. */
const VI_AGENT = "Tác tử AI";

function renderBadge(ui: React.ReactElement) {
  const { container } = renderWithUi(ui);
  return container.querySelector('[data-slot="badge"]')!;
}

describe("AgentBadge — API", () => {
  it("renders the localized default label in a span", () => {
    const badge = renderBadge(<AgentBadge />);
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveAttribute("data-agent");
    expect(badge).toHaveAttribute("data-shape", "pill");
    expect(badge.querySelector('[data-slot="badge-label"]')).toHaveTextContent(VI_AGENT);
  });

  it("lets children override the label and `as` swap the tag", () => {
    const badge = renderBadge(<AgentBadge as="div">Bot</AgentBadge>);
    expect(badge.tagName).toBe("DIV");
    expect(badge).toHaveTextContent("Bot");
    expect(badge).not.toHaveTextContent(VI_AGENT);
  });

  it("forwards className and arbitrary attributes", () => {
    const badge = renderBadge(<AgentBadge className="extra" data-testid="agent-label" />);
    expect(badge).toHaveClass("extra");
    expect(badge).toHaveAttribute("data-testid", "agent-label");
  });

  it("carries no fill or ink utility that would out-rank the agent rule", () => {
    const badge = renderBadge(<AgentBadge />);
    const classes = badge.getAttribute("class") ?? "";
    expect(classes).not.toMatch(/\b(bg-|text-\[color)/);
  });
});

describe("AgentBadge — styles and tokens", () => {
  const rule = styles
    .slice(styles.indexOf('[data-slot="badge"][data-agent] {'))
    .replace(/\/\*[\s\S]*?\*\//g, " ");
  const body = rule.slice(0, rule.indexOf("}"));

  it("is a violet outline on a transparent ground that never wraps", () => {
    expect(body).toContain("border-color: hsl(var(--badge-agent-border, var(--agent)))");
    expect(body).toContain("color: hsl(var(--badge-agent-foreground, var(--text-agent)))");
    expect(body).toContain("background-color: transparent");
    expect(body).toContain("white-space: nowrap");
  });

  it("declares its colour knobs initial and the agent role in both themes", () => {
    expect(tokens).toContain("--badge-agent-border: initial;");
    expect(tokens).toContain("--badge-agent-foreground: initial;");
    expect(foundation.match(/--agent: /g)).toHaveLength(2);
    expect(foundation.match(/--text-agent: /g)).toHaveLength(2);
  });
});

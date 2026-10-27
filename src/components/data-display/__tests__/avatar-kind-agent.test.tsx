import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { describe, expect, it } from "vitest";

import { Avatar, AvatarFallback } from "../avatar";
import { renderWithUi } from "@/test/render";

/**
 * `<Avatar kind="agent">` tells an AI agent apart from a person on the mark itself — a member list,
 * an assignee picker, a comment author. Inert for a person; for an agent, a visible "AI" tag that
 * is aria-hidden plus ONE localized sr-only label, so the meaning never rests on colour alone.
 */
const styles = readFileSync(resolve(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
const tokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/data-display.css"),
  "utf8",
);

/** The `vi` string `renderWithUi` resolves. */
const VI_AGENT = "Tác tử AI";

function renderAvatar(ui: React.ReactElement) {
  const { container } = renderWithUi(ui);
  return {
    root: container.querySelector('[data-slot="avatar"]')!,
    tag: container.querySelector('[data-slot="avatar-agent"]'),
  };
}

describe("Avatar kind — API", () => {
  it("is inert when omitted: no node, no attribute", () => {
    const { root, tag } = renderAvatar(
      <Avatar>
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    expect(tag).toBeNull();
    expect(root).not.toHaveAttribute("data-kind");
    expect(root.getAttribute("class")).toBe("ui-avatar");
  });

  it('is inert for an explicit kind="person"', () => {
    const { root, tag } = renderAvatar(
      <Avatar kind="person">
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    expect(tag).toBeNull();
    expect(root).not.toHaveAttribute("data-kind");
    expect(root).not.toHaveAttribute("kind");
  });

  it('marks the root and renders the tag for kind="agent"', () => {
    const { root, tag } = renderAvatar(
      <Avatar kind="agent">
        <AvatarFallback>ハ</AvatarFallback>
      </Avatar>,
    );
    expect(root).toHaveAttribute("data-kind", "agent");
    expect(root).not.toHaveAttribute("kind");
    expect(tag).not.toBeNull();
  });

  it("reads the localized label once: the visible AI is hidden, the sr-only string carries it", () => {
    const { root, tag } = renderAvatar(
      <Avatar kind="agent">
        <AvatarFallback>ハ</AvatarFallback>
      </Avatar>,
    );
    const visible = tag!.querySelector('[aria-hidden="true"]');
    expect(visible).toHaveTextContent("AI");
    const srOnly = tag!.querySelector(".sr-only");
    expect(srOnly).toHaveTextContent(VI_AGENT);
    // Exactly one accessible statement of the kind.
    const spoken = Array.from(root.querySelectorAll(".sr-only")).map((n) => n.textContent);
    expect(spoken.filter((text) => text === VI_AGENT)).toHaveLength(1);
  });

  it("composes with presence: both nodes, each on its own corner", () => {
    const { container } = renderWithUi(
      <Avatar kind="agent" presence="online" size="sm">
        <AvatarFallback>ミ</AvatarFallback>
      </Avatar>,
    );
    expect(container.querySelector('[data-slot="avatar-agent"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="avatar-presence"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute("data-size", "sm");
  });
});

describe("Avatar kind — styles and tokens", () => {
  const agentCss = styles
    .slice(styles.indexOf('[data-slot="avatar-agent"] {'))
    .replace(/\/\*[\s\S]*?\*\//g, " ");
  const rule = agentCss.slice(0, agentCss.indexOf("}"));

  it("pins the tag to the block-start corner, leaving block-end to presence", () => {
    // Spills a --space-1 past the corner by default, as the approved design does.
    expect(rule).toContain(
      "inset-block-start: var(--avatar-agent-inset, calc(var(--space-1) * -1))",
    );
    expect(rule).toContain(
      "inset-inline-end: var(--avatar-agent-inset, calc(var(--space-1) * -1))",
    );
    expect(rule).not.toContain("inset-block-end");
  });

  it("lifts the clip only for an agent mark", () => {
    expect(styles).toMatch(/\.ui-avatar\[data-kind="agent"\]\s*\{\s*overflow: visible;/);
  });

  it("reads every colour through a role-mirror knob declared initial", () => {
    for (const knob of ["background", "foreground", "ring-color"]) {
      expect(tokens).toContain(`--avatar-agent-${knob}: initial;`);
    }
    expect(rule).toContain("var(--avatar-agent-background, var(--agent))");
    expect(rule).toContain("var(--avatar-agent-foreground, var(--agent-foreground))");
    expect(rule).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});

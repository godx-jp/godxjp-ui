import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Text } from "../typography";

/**
 * `link` (gh#400) — the inline link affordance.
 *
 * The gap it closes: a link inside running content had no primitive. `Button variant="link"` is a
 * CONTROL — `.ui-button` is `white-space: nowrap; flex-shrink: 0` on a `--control-height` tier with
 * inline padding — so in a table cell it neither wraps nor shares the cell's line box, and one
 * consumer had `whitespace-normal` written back on top of it to undo exactly that. The rest wrote
 * `className="text-primary hover:underline"`, which is the pair consumer rules 6 and 7 forbid.
 */
describe("Text — link", () => {
  it("marks the element as a link and defaults its tone to primary", () => {
    render(
      <Text as="a" href="/issues/PKG-1" link>
        ログイン画面の余白
      </Text>,
    );
    const el = screen.getByRole("link", { name: "ログイン画面の余白" });
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("data-slot", "text");
    expect(el).toHaveAttribute("data-link", "");
    expect(el).toHaveAttribute("data-tone", "primary");
  });

  it("keeps an explicit tone — the affordance is not the colour", () => {
    // A destructive link ("delete this") is a link AND destructive. Had `link` painted the colour
    // itself, this would have been two rules of equal specificity arguing over one element.
    render(
      <Text as="a" href="/danger" link tone="destructive">
        取り消す
      </Text>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("data-tone", "destructive");
  });

  it("emits no link attribute when the prop is absent, and stays tone=default", () => {
    render(<Text>ただの本文</Text>);
    const el = screen.getByText("ただの本文");
    expect(el).not.toHaveAttribute("data-link");
    expect(el).toHaveAttribute("data-tone", "default");
  });

  it("composes onto a router link through asChild, without emitting a second element", () => {
    // The shape 54 consumer call sites are actually written in: an Inertia / React Router `Link`
    // owns the element and its navigation; Text owns the type step, tone and truncation.
    const RouterLink = ({
      to,
      children,
      ...props
    }: {
      to: string;
      children?: React.ReactNode;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a href={to} data-router="" {...props}>
        {children}
      </a>
    );

    const { container } = render(
      <Text asChild link truncate size="xs">
        <RouterLink to="/wiki/Home">Home</RouterLink>
      </Text>,
    );

    const el = screen.getByRole("link", { name: "Home" });
    expect(el).toHaveAttribute("data-router", "");
    expect(el).toHaveAttribute("data-link", "");
    expect(el).toHaveAttribute("data-truncate", "");
    expect(el).toHaveAttribute("data-size", "xs");
    expect(el).toHaveClass("ui-text");
    // The typography lands ONTO the child — one anchor, not an anchor wrapped in a span.
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelectorAll("span")).toHaveLength(0);
  });

  it("merges className and lets the child's own props win, the way Slot would", () => {
    // Hand-rolled asChild (cloneElement, so Text stays server-renderable — see the component's
    // note), which means its merge order is this repo's to prove rather than Radix's to assume.
    render(
      <Text asChild link className="max-w-64" href="/from-text">
        <a href="/from-child" className="child-class" data-testid="anchor">
          明細
        </a>
      </Text>,
    );
    const el = screen.getByTestId("anchor");
    expect(el).toHaveAttribute("href", "/from-child");
    expect(el.className).toBe("ui-text max-w-64 child-class");
  });

  it("still wraps and truncates as text, which is the whole reason it is not a Button", () => {
    render(
      <Text as="a" href="/x" link>
        非常に長い件名がテーブルのセルの中で折り返される必要がある
      </Text>,
    );
    const el = screen.getByRole("link");
    // No control classes: nothing here sets nowrap, a control height or inline padding.
    expect(el.className).toBe("ui-text");
    expect(el).not.toHaveAttribute("data-size", "default");
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { Heading, Link, Paragraph, Text, Title, Typography } from "../typography";

/**
 * antd `Typography` parity — the surface that is NOT copy/edit/ellipsis (those have their own
 * files). Read against antd 6.6.3, `es/typography/**`.
 *
 * Every assertion here is on a ROLE, an ELEMENT or a `data-*` attribute. None is on a Tailwind
 * class — `check:no-tailwind-class-assertions` forbids it, and a class name is not a contract.
 */
describe("Typography — antd decorations", () => {
  it("wraps the content in antd's own elements, in antd's own nesting order", () => {
    // antd `wrapperDecorations`: strong → u → del → code → mark → kbd → i, outermost last.
    // The ORDER is the contract: a screen reader announces the outer element first, so a
    // struck-through code run must read "deleted, code", not "code, deleted".
    const { container } = render(
      <Text strong underline delete code mark keyboard italic>
        取り消された値
      </Text>,
    );
    const span = container.querySelector('[data-slot="text"]');
    expect(span?.innerHTML).toBe(
      "<i><kbd><mark><code><del><u><strong>取り消された値</strong></u></del></code></mark></kbd></i>",
    );
  });

  it("emits each decoration as a REAL element, not a text-decoration", () => {
    // This is the whole reason the flags wrap rather than restyle: `<del>` reaches assistive tech,
    // `text-decoration: line-through` does not.
    const { container } = render(<Text delete>廃止</Text>);
    expect(container.querySelector("del")).toHaveTextContent("廃止");
  });

  it("renders no wrapper at all when no decoration is asked for", () => {
    const { container } = render(<Text>ただの本文</Text>);
    expect(container.querySelector('[data-slot="text"]')?.innerHTML).toBe("ただの本文");
  });
});

describe("Typography — type ↔ tone", () => {
  it("folds antd's four `type` values onto this library's tone vocabulary", () => {
    const cases = [
      ["secondary", "muted"],
      ["success", "success"],
      ["warning", "warning"],
      ["danger", "destructive"],
    ] as const;
    for (const [type, tone] of cases) {
      const { container, unmount } = render(<Text type={type}>状態</Text>);
      expect(container.querySelector('[data-slot="text"]')).toHaveAttribute("data-tone", tone);
      unmount();
    }
  });

  it("lets `tone` win when both spellings are passed, and says so in dev", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Text type="danger" tone="info">
        両方
      </Text>,
    );
    expect(screen.getByText("両方")).toHaveAttribute("data-tone", "info");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("`tone` takes precedence"));
    vi.restoreAllMocks();
  });
});

describe("Typography — disabled", () => {
  it("marks the run unavailable to CSS AND to assistive tech", () => {
    // The colour alone reads as "muted". `aria-disabled` is what tells a screen-reader user the
    // difference between de-emphasised and unavailable.
    render(<Text disabled>編集できません</Text>);
    const el = screen.getByText("編集できません");
    expect(el).toHaveAttribute("data-disabled", "");
    expect(el).toHaveAttribute("aria-disabled", "true");
  });
});

describe("Title — antd Typography.Title", () => {
  it("renders h1..h5 and sizes each from its own level token", () => {
    for (const level of [1, 2, 3, 4, 5] as const) {
      const { unmount } = render(<Title level={level}>請求サマリー</Title>);
      const heading = screen.getByRole("heading", { level });
      expect(heading.tagName).toBe(`H${level}`);
      expect(heading).toHaveAttribute("data-level", String(level));
      unmount();
    }
  });

  it("defaults to level 1 — antd's default, not Heading's 2", () => {
    render(<Title>見出し</Title>);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("falls back to h1 for a level outside 1..5, the way antd does", () => {
    // A runtime value from an API must not produce `<h7>`, which the browser treats as an unknown
    // inline element with no heading semantics at all.
    render(<Title level={7 as never}>壊れたレベル</Title>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("data-level", "1");
  });

  it("leaves Heading untouched — four levels, level 2 default, no antd behaviour", () => {
    // The backward-compatibility contract: Heading is this library's own and did not move.
    render(<Heading>既存の見出し</Heading>);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveAttribute("data-slot", "heading");
    expect(heading).not.toHaveAttribute("data-ellipsis");
  });
});

describe("Paragraph — antd Typography.Paragraph", () => {
  it("renders a <div>, because an editor and an action cluster are block content", () => {
    // antd's own choice. A <p> may not legally contain a <div>, and the parser would split it —
    // the actions would end up OUTSIDE the paragraph they belong to.
    const { container } = render(<Paragraph>段落</Paragraph>);
    expect(container.querySelector("div[data-slot='text']")).toHaveTextContent("段落");
  });

  it("still renders a <p> when the content is known to be phrasing-only", () => {
    const { container } = render(<Paragraph as="p">段落</Paragraph>);
    expect(container.querySelector("p")).toHaveTextContent("段落");
  });
});

describe("Link — antd Typography.Link", () => {
  it("renders an anchor that already carries the link affordance", () => {
    render(<Link href="/issues/PKG-1">ログイン画面の余白</Link>);
    const el = screen.getByRole("link", { name: "ログイン画面の余白" });
    expect(el).toHaveAttribute("data-link", "");
    expect(el).toHaveAttribute("data-tone", "primary");
  });

  it("adds rel=noopener noreferrer to a _blank link that did not set one", () => {
    // antd's guard, ported: without it the opened document keeps a live `window.opener` handle
    // back into this one.
    render(
      <Link href="https://example.com" target="_blank">
        外部
      </Link>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("never overrides a rel the caller wrote", () => {
    render(
      <Link href="https://example.com" target="_blank" rel="external">
        外部
      </Link>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("rel", "external");
  });
});

describe("Typography — the compound export", () => {
  it("hangs the family off the root so an antd paste compiles unchanged", () => {
    expect(Typography.Text).toBe(Text);
    expect(Typography.Title).toBe(Title);
    expect(Typography.Paragraph).toBe(Paragraph);
    expect(Typography.Link).toBe(Link);
  });

  it("renders an <article> wrapper carrying no emphasis of its own", () => {
    const { container } = render(<Typography>本文</Typography>);
    const root = container.querySelector('[data-slot="typography"]');
    expect(root?.tagName).toBe("ARTICLE");
    expect(root).not.toHaveAttribute("data-tone");
  });

  it("takes antd's private `component` as an alias for `as`", () => {
    const { container } = render(<Typography component="section">本文</Typography>);
    expect(container.querySelector('[data-slot="typography"]')?.tagName).toBe("SECTION");
  });
});

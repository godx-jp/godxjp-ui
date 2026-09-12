import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { ruleSelectors } from "@/test/css-selector";
import {
  Skeleton,
  SkeletonArticle,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonInput,
  SkeletonNode,
} from "../skeleton";

const lines = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>(".ui-skeleton-article-line"),
];
const measure = (el: HTMLElement) => el.style.getPropertyValue("--skeleton-line-width");
const title = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".ui-skeleton-article-title");

describe("Skeleton · antd loading gate", () => {
  it("renders the placeholder when `loading` is omitted entirely", () => {
    const { container } = renderWithUi(<Skeleton>done</Skeleton>);
    expect(container.querySelector(".ui-skeleton-block")).toBeInTheDocument();
  });

  it("renders children INSTEAD of the placeholder when loading={false}", () => {
    const { container } = renderWithUi(<Skeleton loading={false}>done</Skeleton>);
    expect(container.querySelector(".ui-skeleton-block")).not.toBeInTheDocument();
    expect(container.textContent).toBe("done");
  });

  it("keeps the placeholder while loading={true}", () => {
    const { container } = renderWithUi(<Skeleton loading>done</Skeleton>);
    expect(container.querySelector(".ui-skeleton-block")).toBeInTheDocument();
  });

  it("marks `active` on the block and leaves it off by default", () => {
    const { container } = renderWithUi(
      <>
        <Skeleton active data-testid="on" />
        <Skeleton data-testid="off" />
      </>,
    );
    expect(container.querySelector("[data-testid='on']")).toHaveAttribute("data-active");
    expect(container.querySelector("[data-testid='off']")).not.toHaveAttribute("data-active");
  });
});

describe("SkeletonArticle · antd default matrix", () => {
  it("defaults to no avatar, a 38% title and three paragraph rows", () => {
    const { container } = renderWithUi(<SkeletonArticle />);
    expect(container.querySelector("[data-skeleton-element='avatar']")).not.toBeInTheDocument();
    expect(measure(title(container)!)).toBe("38%");
    expect(lines(container)).toHaveLength(3);
  });

  it("with an avatar: a large circle, a 50% title and two paragraph rows", () => {
    const { container } = renderWithUi(<SkeletonArticle avatar />);
    const avatar = container.querySelector("[data-skeleton-element='avatar']");
    expect(avatar).toHaveAttribute("data-shape", "circle");
    expect(avatar).toHaveAttribute("data-size", "lg");
    expect(measure(title(container)!)).toBe("50%");
    expect(lines(container)).toHaveLength(2);
  });

  it("with an avatar and a title but no paragraph, the avatar squares off", () => {
    const { container } = renderWithUi(<SkeletonArticle avatar paragraph={false} />);
    expect(container.querySelector("[data-skeleton-element='avatar']")).toHaveAttribute(
      "data-shape",
      "square",
    );
    expect(title(container)).toBeInTheDocument();
    expect(measure(title(container)!)).toBe("");
    expect(lines(container)).toHaveLength(0);
  });

  it("measures only the LAST row from a single paragraph width", () => {
    const { container } = renderWithUi(<SkeletonArticle paragraph={{ rows: 4, width: "30%" }} />);
    const rows = lines(container);
    expect(rows).toHaveLength(4);
    expect(rows.slice(0, 3).map(measure)).toEqual(["", "", ""]);
    expect(measure(rows[3])).toBe("30%");
  });

  it("measures row by row from a width ARRAY, and reads a number as pixels", () => {
    const { container } = renderWithUi(
      <SkeletonArticle paragraph={{ rows: 3, width: ["10%", 120, "50%"] }} />,
    );
    expect(lines(container).map(measure)).toEqual(["10%", "120px", "50%"]);
  });

  it("drops the title line when title={false} and the paragraph when paragraph={false}", () => {
    const { container } = renderWithUi(<SkeletonArticle title={false} paragraph={false} />);
    expect(title(container)).not.toBeInTheDocument();
    expect(lines(container)).toHaveLength(0);
  });

  it("honours an explicit title width over the default matrix", () => {
    const { container } = renderWithUi(<SkeletonArticle title={{ width: "12rem" }} />);
    expect(measure(title(container)!)).toBe("12rem");
  });

  it("flags round and active on the root, and swaps children in when loading={false}", () => {
    const { container } = renderWithUi(<SkeletonArticle round active />);
    const root = container.querySelector("[data-slot='skeleton-article']");
    expect(root).toHaveAttribute("data-round");
    expect(root).toHaveAttribute("data-active");

    const done = renderWithUi(<SkeletonArticle loading={false}>loaded</SkeletonArticle>);
    expect(done.container.querySelector("[data-slot='skeleton-article']")).not.toBeInTheDocument();
    expect(done.container.textContent).toBe("loaded");
  });

  /**
   * antd's short last line is a CSS rule, not a prop, so the string being present proves nothing —
   * it has to SELECT. Three rows: the last one matches. Two rows: `:nth-child(2)` excludes it, so
   * a two-line paragraph does not end in a stub.
   */
  it("selects the short last line only once a paragraph is longer than two rows", () => {
    const css = readFileSync("src/styles/alert-layout.css", "utf8");
    const [selector] = ruleSelectors(css, ".ui-skeleton-article-line:last-child");

    const three = renderWithUi(<SkeletonArticle paragraph={{ rows: 3 }} />);
    const threeRows = lines(three.container);
    expect(threeRows[2].matches(selector)).toBe(true);
    expect(threeRows[0].matches(selector)).toBe(false);

    const two = renderWithUi(<SkeletonArticle paragraph={{ rows: 2 }} />);
    expect(lines(two.container).at(-1)!.matches(selector)).toBe(false);
  });
});

describe("Skeleton `active` sheen", () => {
  const css = readFileSync("src/styles/alert-layout.css", "utf8");

  /**
   * A rule that names no element paints nothing. Both halves are checked here: the sheen selects a
   * standalone `active` block AND every line under an `active` article, and it selects NEITHER
   * when the flag is off.
   */
  it("selects an active block and every line under an active article", () => {
    const selectors = ruleSelectors(css, ".ui-skeleton-block[data-active]");
    const { container } = renderWithUi(
      <>
        <Skeleton active data-testid="on" />
        <Skeleton data-testid="off" />
        <SkeletonArticle active paragraph={{ rows: 2 }} />
        <SkeletonArticle paragraph={{ rows: 2 }} />
      </>,
    );
    const hits = (el: Element) => selectors.some((selector) => el.matches(selector));

    expect(hits(container.querySelector("[data-testid='on']")!)).toBe(true);
    expect(hits(container.querySelector("[data-testid='off']")!)).toBe(false);

    const [activeArticle, restingArticle] = [
      ...container.querySelectorAll("[data-slot='skeleton-article']"),
    ];
    expect([...activeArticle.querySelectorAll(".ui-skeleton-block")].every(hits)).toBe(true);
    expect([...restingArticle.querySelectorAll(".ui-skeleton-block")].some(hits)).toBe(false);
  });

  /**
   * The duration reads `--duration-loop`, which is declared ONLY inside `.ui-scale-fixed` in
   * tokens/foundation.css and therefore resolves to nothing at the document root — measured, an
   * `animation` shorthand carrying it computes to `animation-name: none`. The fallback is what
   * makes the sheen paint today; drop it and the sheen silently stops. See the rule's comment.
   */
  it("carries a duration fallback while the motion tier is unreachable at :root", () => {
    expect(css).toContain(
      "animation: ui-skeleton-sweep var(--duration-loop, 1400ms) ease infinite",
    );
  });

  it("stops every skeleton motion under prefers-reduced-motion", () => {
    // Slice to the reduced-motion block first — ruleSelectors reads ONE rule, and an @media
    // wrapper would otherwise be read as part of the selector.
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    const selectors = ruleSelectors(reduced, ".ui-skeleton-block");
    const { container } = renderWithUi(
      <>
        <Skeleton active data-testid="on" />
        <Skeleton data-testid="off" />
      </>,
    );
    for (const id of ["on", "off"]) {
      const el = container.querySelector(`[data-testid='${id}']`)!;
      expect(selectors.some((selector) => el.matches(selector))).toBe(true);
    }
  });
});

describe("Skeleton element presets", () => {
  it("carry their kind, and the antd namespace is the same component", () => {
    expect(Skeleton.Avatar).toBe(SkeletonAvatar);
    expect(Skeleton.Button).toBe(SkeletonButton);
    expect(Skeleton.Input).toBe(SkeletonInput);
    expect(Skeleton.Node).toBe(SkeletonNode);
    expect(Skeleton.Image).toBe(SkeletonImage);
    expect(Skeleton.Article).toBe(SkeletonArticle);
  });

  it("map size / shape / block onto the block that stands in for the control", () => {
    const { container } = renderWithUi(
      <>
        <SkeletonButton size="lg" shape="pill" block />
        <SkeletonInput size="sm" />
        <SkeletonAvatar shape="square" size="xs" />
        <SkeletonNode>inner</SkeletonNode>
      </>,
    );
    const button = container.querySelector("[data-skeleton-element='button']")!;
    expect(button).toHaveAttribute("data-size", "lg");
    expect(button).toHaveAttribute("data-shape", "pill");
    expect(button).toHaveAttribute("data-block");

    const input = container.querySelector("[data-skeleton-element='input']")!;
    expect(input).toHaveAttribute("data-size", "sm");
    expect(input).not.toHaveAttribute("data-block");

    const avatar = container.querySelector("[data-skeleton-element='avatar']")!;
    expect(avatar).toHaveAttribute("data-shape", "square");
    expect(avatar).toHaveAttribute("data-size", "xs");

    expect(container.querySelector("[data-skeleton-element='node']")).toHaveTextContent("inner");
  });

  it("hides SkeletonImage's glyph from the accessibility tree", () => {
    const { container } = renderWithUi(<SkeletonImage />);
    const glyph = container.querySelector(".ui-skeleton-image-glyph")!;
    expect(glyph).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("[data-skeleton-element='image']")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { Tabs } from "../tabs";
import { PageContainer } from "../../layout/page-container";
import { renderWithUi } from "@/test/render";

const css = readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8");

/*
 * React Aria builds a Tabs collection by rendering a hidden <template> beside the Tabs root. The
 * template is display:none, so a `gap`-based Flex never counts it — but PageContainer spaces its
 * sections with a sibling selector, and `> * + *` counted the template as a section: the Tabs that
 * opens a page body got a full section gap above it.
 */
describe("Tabs' collection <template> is not a page section", () => {
  it("the page-body section rule skips <template> siblings, at the original specificity", () => {
    const { container } = renderWithUi(
      <PageContainer title="ホーム">
        <Tabs variant="chips" items={[{ value: "home", label: "ホーム" }]} defaultValue="home" />
        <p>本文</p>
      </PageContainer>,
    );
    const body = container.querySelector(".ui-page-body")!;
    const kids = [...body.children].map((el) => el.tagName.toLowerCase());
    // What the rule has to survive: a template rendered as a SIBLING of the Tabs root.
    expect(kids.filter((tag) => tag === "template").length).toBeGreaterThan(0);
    // The section selector excludes templates on both sides of the sibling combinator.
    expect(css).toContain(".ui-page-body > :where(:not(template)) ~ :where(:not(template)) {");
    expect(css).not.toMatch(/\.ui-page-body > \* \+ \* \{/);
    // jsdom has no layout, so prove the selector against the DOM itself: the first real section
    // (the Tabs root) is NOT matched, the paragraph after it is.
    const sections = body.querySelectorAll(":scope > :not(template) ~ :not(template)");
    expect([...sections].some((el) => el.getAttribute("data-slot") === "tabs")).toBe(false);
    expect([...sections].some((el) => el.tagName === "P")).toBe(true);
  });
});

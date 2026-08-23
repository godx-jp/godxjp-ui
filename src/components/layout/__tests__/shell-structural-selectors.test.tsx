import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";
import { AuthIdentity } from "../auth-identity";
import { AuthShell } from "../auth-shell";
import { Topbar } from "../topbar";

/** Structural selectors in shell-layout.css against really rendered DOM. */
const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/shell-layout.css"),
  "utf8",
);

describe("shell-layout.css structural selectors select the rendered DOM", () => {
  it("login requester wrap rule reaches the requester TEXT, not the clock icon", () => {
    const selector = ruleSelector(
      css,
      '.ui-auth-shell[data-preset="login"] .ui-auth-requester > :last-child',
    );
    const { container } = renderWithUi(
      <AuthShell preset="login" brand={<span>EXSELI</span>}>
        <AuthIdentity title="ログイン" requester="very-long-requester@example.com" />
      </AuthShell>,
    );

    const requester = container.querySelector(".ui-auth-requester")!;
    expect(requester, "login shell renders the requester block").not.toBeNull();
    const children = [...requester.children];
    expect(children.length).toBe(2);
    expect(children[0].matches(selector), "the icon span is not the wrap target").toBe(false);
    expect(children[1].matches(selector), "the text node wrapper is the wrap target").toBe(true);
  });

  it("topbar start clips its LAST child (the breadcrumb/title slot)", () => {
    const selector = ruleSelector(css, ".ui-topbar-start > :last-child");
    const { container } = renderWithUi(
      <Topbar
        start={
          <>
            <button type="button">menu</button>
            <div data-testid="crumbs">パンくず</div>
          </>
        }
      />,
    );

    const start = container.querySelector(".ui-topbar-start")!;
    const children = [...start.children];
    expect(children.length).toBe(2);
    expect(children[0].matches(selector)).toBe(false);
    expect(children[1].matches(selector)).toBe(true);
  });
});

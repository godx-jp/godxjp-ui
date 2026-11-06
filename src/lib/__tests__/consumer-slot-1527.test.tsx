import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import { execSync } from "node:child_process";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { Alert, AlertTitle } from "../../components/feedback/alert";
import { Dialog, DialogContent, DialogTitle } from "../../components/feedback/dialog";
import { Badge } from "../../components/data-display/badge";
import { Card, CardContent } from "../../components/data-display/card";
import { Button } from "../../components/general/button";
import { Heading, Text } from "../../components/general/typography";
import { Input } from "../../components/data-entry/input";
import { Separator } from "../../components/layout/separator";
import { AuthDivider } from "../../components/layout/auth-divider";
import { DialogClose } from "../../components/feedback/dialog";
import { Sheet, SheetContent, SheetTitle } from "../../components/feedback/sheet";
import { Slot } from "../slot";
import { Collapsible, CollapsibleTrigger } from "../../components/data-display/collapsible";
import { withoutSlot } from "../without-slot";

/*
 * gh#1527 — a consumer's `data-slot` replaced the component's own slot, so every rule keyed on
 * it (Alert's flex row, surface, border, padding; Card's 62 rules…) stopped matching. Measured
 * on a running consumer: 44 call sites. The component's slot must win.
 */
describe("a consumer data-slot never replaces the component's own slot (gh#1527)", () => {
  const cases: Array<[string, string, () => React.ReactElement]> = [
    [
      "Alert",
      "alert",
      () => (
        <Alert data-slot="consumer">
          <AlertTitle>t</AlertTitle>
        </Alert>
      ),
    ],
    [
      "Card",
      "card",
      () => (
        <Card data-slot="consumer">
          <CardContent>c</CardContent>
        </Card>
      ),
    ],
    ["Badge", "badge", () => <Badge data-slot="consumer">b</Badge>],
    ["Button", "button", () => <Button data-slot="consumer">b</Button>],
    ["Text", "text", () => <Text data-slot="consumer">t</Text>],
    ["Heading", "heading", () => <Heading data-slot="consumer">h</Heading>],
    ["Input", "input", () => <Input aria-label="i" data-slot="consumer" />],
    ["Separator", "separator", () => <Separator data-slot="consumer" />],
  ];

  it.each(cases)("%s keeps data-slot=%s", (_name, slot, el) => {
    const { container } = render(el());
    expect(container.querySelector('[data-slot="consumer"]')).toBeNull();
    expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
  });

  it("DialogContent keeps data-slot=dialog-content", () => {
    render(
      <Dialog open>
        <DialogContent data-slot="consumer">
          <DialogTitle>d</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(document.querySelector('[data-slot="consumer"]')).toBeNull();
    expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeNull();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("SheetContent keeps data-slot=sheet-content", () => {
    render(
      <Sheet open>
        <SheetContent data-slot="consumer">
          <SheetTitle>s</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(document.querySelector('[data-slot="consumer"]')).toBeNull();
    expect(document.querySelector('[data-slot="sheet-content"]')).not.toBeNull();
  });

  it("a kit composite still names its root: AuthDivider over Separator", () => {
    const { container } = render(<AuthDivider label="or" data-slot="consumer" />);
    expect(container.querySelector('[data-slot="auth-divider"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="consumer"]')).toBeNull();
    expect(container.querySelector("[data-kit-slot]")).toBeNull();
  });

  it("asChild keeps the wrapper's slot on a kit child: DialogClose asChild Button", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>d</DialogTitle>
          <DialogClose asChild>
            <Button data-slot="consumer">Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );
    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(cancel.getAttribute("data-slot")).toBe("dialog-close");
    expect(cancel.hasAttribute("data-kit-slot")).toBe(false);
  });

  it("asChild onto a host element passes data-slot only, no kit key", () => {
    const { container } = render(
      <Slot data-slot="wrapper">
        <a href="#x">x</a>
      </Slot>,
    );
    const a = container.querySelector("a");
    expect(a?.getAttribute("data-slot")).toBe("wrapper");
    expect(a?.hasAttribute("data-kit-slot")).toBe(false);
  });

  it("the kit channel never reaches the DOM through a kit recipient (ColorPicker presets group)", () => {
    const { container } = render(
      <Collapsible {...({ "data-kit-slot": "color-picker-presets-group" } as object)}>
        <CollapsibleTrigger>t</CollapsibleTrigger>
      </Collapsible>,
    );
    expect(container.querySelector("[data-kit-slot]")).toBeNull();
    expect(container.querySelector('[data-slot="color-picker-presets-group"]')).not.toBeNull();
  });

  it("asChild onto a NON-kit component child: data-slot lands; the kit key rides along (documented)", () => {
    const Link = (p: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...p} />;
    const { container } = render(
      <Slot data-slot="wrapper">
        <Link href="#x">x</Link>
      </Slot>,
    );
    const a = container.querySelector("a");
    expect(a?.getAttribute("data-slot")).toBe("wrapper");
    expect(a?.getAttribute("data-kit-slot")).toBe("wrapper");
  });

  it("other consumer attributes still reach the element", () => {
    const { container } = render(
      <Alert data-slot="consumer" data-testid="kept" id="kept-id">
        x
      </Alert>,
    );
    const el = container.querySelector('[data-slot="alert"]');
    expect(el?.getAttribute("data-testid")).toBe("kept");
    expect(el?.id).toBe("kept-id");
  });
});

describe("withoutSlot", () => {
  it("returns the same object when no data-slot is present (no copy)", () => {
    const bag = { id: "a" };
    expect(withoutSlot(bag)).toBe(bag);
  });
  it("drops only data-slot", () => {
    expect(withoutSlot({ id: "a", "data-slot": "x", "data-x": 1 })).toEqual({
      id: "a",
      "data-x": 1,
    });
  });
  it("passes non-objects through", () => {
    expect(withoutSlot(undefined)).toBeUndefined();
  });
});

/*
 * The structural guard: anywhere a component stamps its own `data-slot` and THEN spreads a bag,
 * the bag must go through `withoutSlot`, or a caller's slot overwrites the component's. Parsed as
 * an AST (JSX attributes and object literals), never grepped, so formatting cannot fool it.
 */
function unguardedSpreads(file: string, text: string): string[] {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];
  const isSlot = (n: ts.Node | undefined) =>
    !!n && n.getText().replace(/["']/g, "") === "data-slot";
  const guarded = (e: ts.Expression) =>
    ts.isCallExpression(e) && e.expression.getText() === "withoutSlot";
  const report = (e: ts.Expression) => {
    if (guarded(e)) return;
    const { line } = sf.getLineAndCharacterOfPosition(e.getStart());
    found.push(`${file}:${line + 1} {...${e.getText().slice(0, 40)}}`);
  };
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const ps = node.attributes.properties;
      const i = ps.findIndex((p) => ts.isJsxAttribute(p) && isSlot(p.name));
      if (i >= 0)
        for (const p of ps.slice(i + 1)) if (ts.isJsxSpreadAttribute(p)) report(p.expression);
    } else if (ts.isObjectLiteralExpression(node)) {
      const ps = node.properties;
      const i = ps.findIndex((p) => ts.isPropertyAssignment(p) && isSlot(p.name));
      if (i >= 0)
        for (const p of ps.slice(i + 1)) if (ts.isSpreadAssignment(p)) report(p.expression);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

describe("source guard: a slot stamped before a spread is protected (gh#1527)", () => {
  it("control: the lens finds an unguarded spread and accepts a guarded one", () => {
    expect(unguardedSpreads("a.tsx", `const a = <div data-slot="x" {...props} />;`)).toHaveLength(
      1,
    );
    expect(unguardedSpreads("b.tsx", `const b = { "data-slot": "x", ...rest };`)).toHaveLength(1);
    expect(
      unguardedSpreads("c.tsx", `const c = <div data-slot="x" {...withoutSlot(props)} />;`),
    ).toHaveLength(0);
    expect(unguardedSpreads("d.tsx", `const d = <div {...props} data-slot="x" />;`)).toHaveLength(
      0,
    );
  });

  it("no component in src/ spreads an unguarded bag after its own data-slot", () => {
    const files = execSync("git ls-files 'src/**/*.tsx' 'src/**/*.ts'", { encoding: "utf8" })
      .split("\n")
      .filter((f) => f && !f.includes("__tests__"));
    const offenders = files.flatMap((f) => unguardedSpreads(f, fs.readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});

/*
 * The other half: a kit composite that names the slot of a kit component it renders must use the
 * kit channel. A literal `data-slot` on a relative-imported component is now discarded by that
 * component, so the composite would silently lose its own name (AuthDivider → "separator").
 */
function kitChildrenGivenDataSlot(file: string, text: string): string[] {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const relative = new Set<string>();
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause) continue;
    if (!(st.moduleSpecifier as ts.StringLiteral).text.startsWith(".")) continue;
    const nb = st.importClause.namedBindings;
    if (nb && ts.isNamedImports(nb)) for (const e of nb.elements) relative.add(e.name.text);
  }
  relative.delete("Slot");
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const root = node.tagName.getText().split(".")[0]!;
      if (relative.has(root))
        for (const p of node.attributes.properties)
          if (ts.isJsxAttribute(p) && p.name.getText() === "data-slot") {
            const { line } = sf.getLineAndCharacterOfPosition(p.getStart());
            found.push(`${file}:${line + 1} <${root} data-slot>`);
          }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

describe("source guard: kit composites name inner kit slots through data-kit-slot", () => {
  it("control: flags a relative-imported child given data-slot, not a host or package child", () => {
    const bad = `import { Button } from "./button";\nconst a = <Button data-slot="x" />;`;
    const host = `import { Button } from "./button";\nconst a = <span data-slot="x" />;`;
    const pkg = `import { Text } from "react-aria-components";\nconst a = <Text data-slot="x" />;`;
    const good = `import { Button } from "./button";\nconst a = <Button data-kit-slot="x" />;`;
    expect(kitChildrenGivenDataSlot("a.tsx", bad)).toHaveLength(1);
    expect(kitChildrenGivenDataSlot("b.tsx", host)).toHaveLength(0);
    expect(kitChildrenGivenDataSlot("c.tsx", pkg)).toHaveLength(0);
    expect(kitChildrenGivenDataSlot("d.tsx", good)).toHaveLength(0);
  });

  it("no kit source hands a literal data-slot to a kit component", () => {
    const files = execSync("git ls-files 'src/**/*.tsx'", { encoding: "utf8" })
      .split("\n")
      .filter((f) => f && !f.includes("__tests__"));
    const offenders = files.flatMap((f) => kitChildrenGivenDataSlot(f, fs.readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});

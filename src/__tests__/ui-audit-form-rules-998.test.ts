import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * THE FORM RULES ABOVE THE FIELD (gh#998): formfield-needs-form · dialog-form-too-big ·
 * select-width-hint.
 *
 * Validated first on the reporter's real files (godx-mailer, fetched at the commits before and
 * after its fixes) with this very CLI: every defect caught before; nothing flagged in the fixed
 * files except a hand-rolled wrapping <Flex> of four FormFields the fix itself missed. These
 * fixtures pin the shapes that validation turned up, including the ones that must NOT match.
 */
const script = join(process.cwd(), "scripts/ui-audit.mjs");

type Finding = { rule: string; severity: string; line: number };
function audit(source: string): Finding[] {
  const cwd = mkdtempSync(join(tmpdir(), "godx-ui-audit-998-"));
  try {
    writeFileSync(join(cwd, "package.json"), JSON.stringify({ name: "consumer" }));
    mkdirSync(join(cwd, "resources/js/pages"), { recursive: true });
    writeFileSync(join(cwd, "resources/js/pages/sample.tsx"), source);
    const out = spawnSync(process.execPath, [script, "--format", "json"], {
      cwd,
      encoding: "utf8",
    }).stdout;
    const parsed = JSON.parse(out) as { findings?: Finding[] } | Finding[];
    return (Array.isArray(parsed) ? parsed : (parsed.findings ?? [])).filter((f) =>
      ["formfield-needs-form", "dialog-form-too-big", "select-width-hint"].includes(f.rule),
    );
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}
const rules = (src: string) => audit(src).map((f) => `${f.rule}:${f.severity}`);

const field = (id: string, extra = "") =>
  `<FormField id="${id}" label="L"${extra}><Input id="${id}" /></FormField>`;

describe("formfield-needs-form (gh#998)", () => {
  it("a FormField with no Form around it is an error", () => {
    expect(rules(`export const A = () => <Card>${field("a")}${field("b")}</Card>;`)).toEqual([
      "formfield-needs-form:error",
      "formfield-needs-form:error",
    ]);
  });

  it("the reporter's defect: a row of fields in a hand-rolled Flex, no Form", () => {
    expect(rules(`<Flex gap="sm" wrap>${field("a")}${field("b")}</Flex>`)).toHaveLength(2);
  });

  it("inside <Form>, including a tag broken across lines, is clean", () => {
    expect(
      rules(`<Form\n  layout="horizontal"\n  labelWidth="10rem"\n>\n${field("a")}\n</Form>`),
    ).toEqual([]);
  });

  it("after </Form> closes, a later FormField is outside again", () => {
    expect(rules(`<><Form>${field("a")}</Form>${field("b")}</>`)).toEqual([
      "formfield-needs-form:error",
    ]);
  });

  it("a field COMPONENT whose whole output is one FormField is exempt", () => {
    expect(rules(`function AttachmentsField() {\n  return (\n    ${field("f")}\n  );\n}`)).toEqual(
      [],
    );
    expect(rules(`const NameField = () => ${field("n")};`)).toEqual([]);
  });

  it("the escape hatch works, with a reason, like every other rule", () => {
    expect(
      rules(
        `// ui-audit-disable-next-line formfield-needs-form -- one-off search box\n${field("q")}`,
      ),
    ).toEqual([]);
  });
});

describe("dialog-form-too-big (gh#998)", () => {
  const body = (tag: string, n: number) =>
    `<Form><${tag}>${Array.from({ length: n }, (_, i) => field(`f${i}`)).join("")}</${tag}></Form>`;

  it.each(["DialogBody", "Dialog.Body", "SheetBody", "Sheet.Body"])(
    "three FormFields in %s is an error",
    (tag) => {
      expect(rules(body(tag, 3))).toEqual(["dialog-form-too-big:error"]);
    },
  );

  it("two is fine — a dialog may hold a confirmation or one or two fields", () => {
    expect(rules(body("DialogBody", 2))).toEqual([]);
  });
});

describe("select-width-hint (gh#998)", () => {
  const select = `<Select><SelectTrigger id="s" /></Select>`;

  it("a Select in a FormField with no controlWidth anywhere is a warning", () => {
    expect(rules(`<Form><FormField id="s" label="L">${select}</FormField></Form>`)).toEqual([
      "select-width-hint:warn",
    ]);
  });

  it("controlWidth on the field clears it", () => {
    expect(
      rules(`<Form><FormField id="s" label="L" controlWidth="10rem">${select}</FormField></Form>`),
    ).toEqual([]);
  });

  it("controlWidth once on the enclosing Form clears it", () => {
    expect(
      rules(`<Form controlWidth="md"><FormField id="s" label="L">${select}</FormField></Form>`),
    ).toEqual([]);
  });

  it("a width on a Form that has already CLOSED does not count", () => {
    expect(
      rules(
        `<><Form controlWidth="md">${field("a")}</Form><Form><FormField id="s" label="L">${select}</FormField></Form></>`,
      ),
    ).toEqual(["select-width-hint:warn"]);
  });

  it("an Input is not a Select", () => {
    expect(rules(`<Form>${field("a")}</Form>`)).toEqual([]);
  });
});

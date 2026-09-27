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
  it("two FormFields under one parent with no Form around them is an error", () => {
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
      rules(
        `<Form\n  layout="horizontal"\n  labelWidth="10rem"\n>\n${field("a")}\n${field("b")}\n</Form>`,
      ),
    ).toEqual([]);
  });

  it("after </Form> closes, later fields are outside again", () => {
    expect(
      rules(
        `<div><Form>${field("a")}${field("b")}</Form><Flex>${field("c")}${field("d")}</Flex></div>`,
      ),
    ).toEqual(["formfield-needs-form:error", "formfield-needs-form:error"]);
  });

  it("a LONE field is not flagged — a search box, the ConfirmDialog's type-to-confirm input", () => {
    expect(rules(`<DialogBody>${field("confirm")}<p>note</p></DialogBody>`)).toEqual([]);
  });

  it("two lone fields under DIFFERENT parents are not a group", () => {
    expect(rules(`<div><Card>${field("a")}</Card><Card>${field("b")}</Card></div>`)).toEqual([]);
  });

  it("a generic argument is not an element — it must not break the parent stack", () => {
    const src = `function F() {\n  const ref = useRef<HTMLDivElement>(null);\n  return <Flex>${field("a")}${field("b")}</Flex>;\n}`;
    expect(rules(src)).toHaveLength(2);
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
        `// ui-audit-disable-begin formfield-needs-form — filter bar, no submit, gh#998\n<Flex>\n${field("q")}\n${field("r")}\n</Flex>\n// ui-audit-disable-end formfield-needs-form`,
      ),
    ).toEqual([]);
  });
});

describe("dialog-form-too-big (gh#998)", () => {
  const body = (tag: string, n: number) =>
    `<Form><${tag}>${Array.from({ length: n }, (_, i) => field(`f${i}`)).join("")}</${tag}></Form>`;

  it.each(["DialogBody", "Dialog.Body"])("three FormFields in %s is an error", (tag) => {
    expect(rules(body(tag, 3))).toEqual(["dialog-form-too-big:error"]);
  });

  it.each(["SheetBody", "Sheet.Body"])(
    "a side %s is NOT — a drawer is where a filter or edit form belongs (antd Drawer)",
    (tag) => {
      expect(rules(body(tag, 4))).toEqual([]);
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

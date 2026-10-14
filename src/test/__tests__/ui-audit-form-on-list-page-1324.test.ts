import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * gh#1324 · `form-on-list-page`: a create form with 3+ FormFields inlined beside the list it
 * creates into (design-complex-admin anti-pattern #3). Seven godx-qc screens shipped exactly this
 * and no audit fired. A WARNING, like the other gh#1294 composition tells.
 */

const SCRIPT = resolve("scripts/ui-audit.mjs");
const RULE = "form-on-list-page";
let root: string | null = null;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = null;
});

type Finding = { rule: string; line: number; severity: string; snippet: string };

function findings(body: string, file = "pages/staff/index.tsx"): Finding[] {
  root = mkdtempSync(join(tmpdir(), "ui-audit-form-on-list-"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "some-consumer-app" }));
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), body);
  const r = spawnSync(process.execPath, [SCRIPT, file, "--format", "json"], {
    cwd: root,
    encoding: "utf8",
  });
  const out = JSON.parse(r.stdout) as { findings: Finding[] };
  return out.findings.filter((f) => f.rule === RULE);
}

const page = (jsx: string) => `export const Page = () => (\n${jsx}\n);\n`;
const fields = (n: number) =>
  Array.from(
    { length: n },
    (_, i) => `    <FormField name="f${i}" label="F${i}"><Input /></FormField>`,
  ).join("\n");
const form = (n: number) => `  <Form onSubmit={save}>\n${fields(n)}\n  </Form>`;
const table = `  <Card><CardContent flush><DataTable data={rows} columns={columns} /></CardContent></Card>`;

describe("form-on-list-page", () => {
  it("flags a 3-field create form above a DataTable, at the Form, as a warning", () => {
    const hits = findings(
      page(`<PageContainer title="Staff">\n${form(3)}\n${table}\n</PageContainer>`),
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].line).toBe(3);
    expect(hits[0].severity).toBe("warn");
    expect(hits[0].snippet).toMatch(/^3 FormFields beside a list/);
  });

  it("sees Table and List as the list surface too, and a form BELOW the list", () => {
    expect(findings(page(`<Flex>\n${form(4)}\n<Table />\n</Flex>`))).toHaveLength(1);
    expect(findings(page(`<Flex>\n<List items={rows} />\n${form(6)}\n</Flex>`))).toHaveLength(1);
  });

  it("does not flag a 2-field form (a filter bar) beside a table", () => {
    expect(findings(page(`<Flex>\n${form(2)}\n${table}\n</Flex>`))).toHaveLength(0);
  });

  it("does not flag a Form that never submits (a filter or parameter bar), in either arrow shape", () => {
    for (const handler of ["(event) => event.preventDefault()", "(e) => { e.preventDefault(); }"]) {
      const bar = form(3).replace("onSubmit={save}", `onSubmit={${handler}}`);
      expect(findings(page(`<Flex>\n${bar}\n${table}\n</Flex>`)), handler).toHaveLength(0);
    }
    // A handler that does more than preventDefault is a real submit.
    const real = form(3).replace(
      "onSubmit={save}",
      "onSubmit={(e) => { e.preventDefault(); create(values); }}",
    );
    expect(findings(page(`<Flex>\n${real}\n${table}\n</Flex>`))).toHaveLength(1);
  });

  it("does not flag a create form inside a Dialog or a Sheet", () => {
    expect(
      findings(
        page(
          `<Flex>\n<Dialog open={open}><DialogContent>\n${form(5)}\n</DialogContent></Dialog>\n${table}\n</Flex>`,
        ),
      ),
    ).toHaveLength(0);
    expect(
      findings(page(`<Flex>\n<Sheet open={open}>\n${form(5)}\n</Sheet>\n${table}\n</Flex>`)),
    ).toHaveLength(0);
  });

  it("does not flag an editor whose line-items Table sits inside its Form", () => {
    expect(
      findings(
        page(`<Form onSubmit={save}>\n${fields(4)}\n  <Table />\n</Form>`),
        "pages/invoices/edit.tsx",
      ),
    ).toHaveLength(0);
  });

  it("sees ListRow items as the list, and a create sub-component rendered into the page", () => {
    expect(
      findings(page(`<Flex>\n${form(3)}\n<ul><ListRow as="li" title="a" /></ul>\n</Flex>`)),
    ).toHaveLength(1);
    // The godx-qc shape: the page renders <CreateLot />, defined below without a PageContainer.
    const file = `export const Page = () => (
  <PageContainer title="Lots">
    <CreateLot />
${table}
  </PageContainer>
);
function CreateLot() {
  return (
${form(5)}
  );
}
`;
    expect(findings(file)).toHaveLength(1);
  });

  it("does not pair a list page and a create page that one file renders as two PageContainers", () => {
    const file = `export const List = () => (
  <PageContainer title="Lots">
${table}
  </PageContainer>
);
export const Create = () => (
  <PageContainer title="New lot">
${form(5)}
  </PageContainer>
);
`;
    expect(findings(file)).toHaveLength(0);
  });

  it("does not flag a Form with no onSubmit, and does not count a label={false} slot", () => {
    const bar = form(3).replace(" onSubmit={save}", ' layout="horizontal"');
    expect(findings(page(`<Flex>\n${bar}\n${table}\n</Flex>`))).toHaveLength(0);
    const signOff = form(2).replace(
      "  </Form>",
      `    <FormField label={false}><Button type="submit">Sign</Button></FormField>\n  </Form>`,
    );
    expect(findings(page(`<Flex>\n${signOff}\n${table}\n</Flex>`))).toHaveLength(0);
  });

  it("does not flag a form-only page or a list-only page", () => {
    expect(
      findings(page(`<PageContainer title="New">\n${form(6)}\n</PageContainer>`)),
    ).toHaveLength(0);
    expect(findings(page(`<Flex>\n${form(6)}\n</Flex>`))).toHaveLength(0);
    expect(
      findings(page(`<PageContainer title="Staff">\n${table}\n</PageContainer>`)),
    ).toHaveLength(0);
  });

  it("counts FormFields per Form, not per file", () => {
    // Two 2-field forms (say, a filter and an inline rename) are not one 4-field create form.
    expect(findings(page(`<Flex>\n${form(2)}\n${form(2)}\n${table}\n</Flex>`))).toHaveLength(0);
  });

  it("is silenced by ui-audit-disable-next-line with the rule id", () => {
    const body = page(
      `<Flex>\n  {/* ui-audit-disable-next-line form-on-list-page */}\n${form(3).replace(/^\s+/, "  ")}\n${table}\n</Flex>`,
    );
    expect(findings(body)).toHaveLength(0);
  });
});

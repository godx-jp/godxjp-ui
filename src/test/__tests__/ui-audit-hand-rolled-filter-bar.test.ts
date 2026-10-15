import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * `hand-rolled-filter-bar` (cardinal rule #51): a list page whose filters are laid out in the
 * consumer's own Flex/Card instead of FilterBar. gino-cloud's 送出機関 list did it with
 * `justify="between"`, which pushed three filters to the far left, middle and far right of a wide
 * card. A WARNING, like the other page-composition rules (`form-on-list-page`).
 */

const SCRIPT = resolve("scripts/ui-audit.mjs");
const RULE = "hand-rolled-filter-bar";
let root: string | null = null;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = null;
});

type Finding = { rule: string; line: number; severity: string; snippet: string };

function findings(
  body: string,
  file = "resources/js/pages/agencies/index.tsx",
  rule = RULE,
): Finding[] {
  root = mkdtempSync(join(tmpdir(), "ui-audit-filter-bar-"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "some-consumer-app" }));
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), body);
  const r = spawnSync(process.execPath, [SCRIPT, file, "--format", "json"], {
    cwd: root,
    encoding: "utf8",
  });
  const out = JSON.parse(r.stdout) as { findings: Finding[] };
  return out.findings.filter((f) => f.rule === rule);
}

const page = (jsx: string) =>
  `export default function Page() {\n  return (\n    <PageContainer title="送出機関">\n${jsx}\n    </PageContainer>\n  );\n}\n`;
const table = `      <Card><CardContent flush><DataTable data={rows} columns={columns} /></CardContent></Card>`;

/** The consumer's 送出機関 strip, verbatim in shape. */
const GINO = `      <Card>
        <CardContent>
          <Flex gap="md" align="end" wrap justify="between">
            <Flex width={280} direction="col">
              <FormField label="国">
                <Select options={countries} value={country} onValueChange={setCountry} />
              </FormField>
            </Flex>
            <Flex width={280} direction="col">
              <FormField label="状態">
                <Select options={statuses} value={status} onValueChange={setStatus} />
              </FormField>
            </Flex>
            <FormField label="無効も表示">
              <Switch checked={all} onCheckedChange={setAll} />
            </FormField>
          </Flex>
        </CardContent>
      </Card>`;

describe("hand-rolled-filter-bar", () => {
  it("flags the gino-cloud strip at the spreading Flex, as a warning naming justify", () => {
    const hits = findings(page(`${GINO}\n${table}`));
    expect(hits).toHaveLength(1);
    expect(hits[0].severity).toBe("warn");
    expect(hits[0].line).toBe(6);
    expect(hits[0].snippet).toMatch(/^3 filter controls spread by justify: <Flex/);
  });

  it("flags a packed row of filters too, and bare self-labelled controls", () => {
    const packed = GINO.replace(' justify="between"', "");
    const hits = findings(page(`${packed}\n${table}`));
    expect(hits).toHaveLength(1);
    expect(hits[0].snippet).toMatch(/^3 filter controls outside a FilterBar/);

    const bare = `      <Flex gap="sm">\n        <SearchInput value={q} onValueChange={setQ} />\n        <Select aria-label="状態" options={o} />\n      </Flex>`;
    expect(findings(page(`${bare}\n${table}`))).toHaveLength(1);
  });

  it("flags a Form that never submits: it is the same strip with a form element around it", () => {
    const strip = `      <Form>\n        <ResponsiveGrid columns={{ md: 2 }}>\n          <FormField label="区分"><Select options={o} /></FormField>\n          <FormField label="期間"><DatePicker /></FormField>\n        </ResponsiveGrid>\n      </Form>`;
    expect(findings(page(`${strip}\n${table}`))).toHaveLength(1);
  });

  it("does not flag FilterBar, or a Sheet of FilterBarGroups (pattern list-filters)", () => {
    const bar = `      <FilterBar onClear={clear}>\n        <FilterBarGroup label="国"><Select options={o} /></FilterBarGroup>\n        <FilterBarGroup label="状態"><Select options={o} /></FilterBarGroup>\n        <Sheet><SheetContent><SheetBody>\n          <FilterBarGroup label="地域"><Select options={o} /></FilterBarGroup>\n          <FormField label="期間"><DatePicker /></FormField>\n          <FormField label="担当"><Select options={o} /></FormField>\n        </SheetBody></SheetContent></Sheet>\n      </FilterBar>`;
    expect(findings(page(`${bar}\n${table}`))).toHaveLength(0);
  });

  it("does not flag a submitting settings Form with Selects, even beside a Table", () => {
    const settings = `      <Form onSubmit={save}>\n        <Flex gap="md">\n          <FormField label="言語"><Select options={o} /></FormField>\n          <FormField label="タイムゾーン"><Select options={o} /></FormField>\n          <FormField label="通知"><Switch /></FormField>\n        </Flex>\n      </Form>`;
    expect(findings(page(`${settings}\n${table}`))).toHaveLength(0);
  });

  it("does not flag a single search box, or filters with no list on the page", () => {
    const search = `      <Flex gap="sm">\n        <SearchInput value={q} onValueChange={setQ} />\n        <Button>新規</Button>\n      </Flex>`;
    expect(findings(page(`${search}\n${table}`))).toHaveLength(0);
    expect(findings(page(GINO))).toHaveLength(0);
  });

  it("does not flag a column of fields (an editor panel), or cell editors inside the table", () => {
    const editor = `      <Flex direction="col" gap="md">\n        <FormField label="色"><Select options={o} /></FormField>\n        <FormField label="角丸"><Select options={o} /></FormField>\n      </Flex>`;
    expect(findings(page(`${editor}\n${table}`))).toHaveLength(0);
    const cells = `      <Table><TableBody><TableRow><TableCell><Select aria-label="a" /></TableCell><TableCell><Switch aria-label="b" /></TableCell></TableRow></TableBody></Table>`;
    expect(findings(page(cells))).toHaveLength(0);
  });

  it("names justify only when 2+ direct children hold filters, not a filter group beside an action", () => {
    const row = `      <Flex justify="between">\n        <Flex gap="sm">\n          <FormField label="国"><Select options={o} /></FormField>\n          <FormField label="状態"><Select options={o} /></FormField>\n        </Flex>\n        <Button>新規</Button>\n      </Flex>`;
    const hits = findings(page(`${row}\n${table}`));
    expect(hits).toHaveLength(1);
    expect(hits[0].snippet).toMatch(/outside a FilterBar: <Flex gap="sm">/);
  });

  /*
   * The three legitimate list-filter shapes (rule #51's decision table) must stay clean under BOTH
   * this rule and `form-on-list-page`: a live FilterBar, a submit-driven 検索条件フォーム, and a
   * condition builder that applies on Save.
   */
  describe("legit search-form and condition-builder shapes", () => {
    const six = Array.from(
      { length: 6 },
      (_, i) => `        <FormField label="条件${i}"><Select options={o} /></FormField>`,
    ).join("\n");
    const shapes = {
      SearchForm: `      <SearchForm onSubmit={search} onReset={clear} summary={summary} resultCount={rows.length}>\n${six}\n      </SearchForm>`,
      "Form role=search": `      <Form role="search" onSubmit={search} columns={{ md: 3 }}>\n${six}\n      </Form>`,
      "condition builder": `      <Form role="search" onSubmit={apply}>\n        <Flex direction="col" gap="sm">\n          <Flex gap="sm"><Select aria-label="フィールド" options={f} /><Select aria-label="演算子" options={op} /><Input aria-label="値" /></Flex>\n          <Flex gap="sm"><Select aria-label="フィールド" options={f} /><Select aria-label="演算子" options={op} /><Input aria-label="値" /></Flex>\n        </Flex>\n      </Form>`,
    };
    for (const [name, jsx] of Object.entries(shapes)) {
      it(`does not flag a ${name} above a DataTable, under either rule`, () => {
        const body = page(`${jsx}\n${table}`);
        expect(findings(body)).toHaveLength(0);
        expect(findings(body, undefined, "form-on-list-page")).toHaveLength(0);
      });
    }

    it("still flags a submitting create Form (no role=search) beside the list", () => {
      const create = `      <Form onSubmit={save}>\n${six}\n      </Form>`;
      expect(findings(page(`${create}\n${table}`), undefined, "form-on-list-page")).toHaveLength(1);
    });
  });
});

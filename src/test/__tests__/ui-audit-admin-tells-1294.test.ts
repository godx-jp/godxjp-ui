import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * gh#1294 · the admin-screen tells that pass every per-line rule: a Card inside a Card, a Card
 * per section, a KPI tile row on a page that is not a dashboard, an icon EmptyState inside a Card,
 * and Badge / Alert density. All WARNINGS — judgement calls, not defects. Each case is one consumer
 * file audited in consumer mode; every rule has a firing fixture and a non-firing control.
 */

const SCRIPT = resolve("scripts/ui-audit.mjs");
let root: string | null = null;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = null;
});

type Finding = { rule: string; line: number; severity: string; snippet: string };

function findings(rule: string, body: string, file = "pages/coupons/index.tsx"): Finding[] {
  root = mkdtempSync(join(tmpdir(), "ui-audit-admin-tells-"));
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

const page = (jsx: string) => `export const Page = () => (\n${jsx}\n);\n`;
const repeat = (n: number, s: string) => Array.from({ length: n }, () => s).join("\n");

describe("nested-card", () => {
  it("flags a Card inside another Card's content, as a warning", () => {
    const hits = findings(
      "nested-card",
      page(`<Card>
  <CardContent>
    <Card>
      <CardContent>inner</CardContent>
    </Card>
  </CardContent>
</Card>`),
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].line).toBe(4);
    expect(hits[0].severity).toBe("warn");
  });

  it("sees a StatCard (already a bordered card) inside a Card", () => {
    expect(
      findings(
        "nested-card",
        page(`<Card><CardContent><StatCard label="a" value={1} /></CardContent></Card>`),
      ),
    ).toHaveLength(1);
  });

  it("does not flag sibling Cards", () => {
    expect(
      findings(
        "nested-card",
        page(`<Flex direction="col" gap="lg">
  <Card><CardContent>a</CardContent></Card>
  <Card><CardContent>b</CardContent></Card>
</Flex>`),
      ),
    ).toHaveLength(0);
  });
});

describe("card-per-section", () => {
  const card = `  <Card><CardHeader><CardTitle>t</CardTitle></CardHeader><CardContent>x</CardContent></Card>`;

  it("flags a file with 5 Cards, once, naming the count", () => {
    const hits = findings(
      "card-per-section",
      page(`<PageContainer title="t">\n${repeat(5, card)}\n</PageContainer>`),
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].snippet).toBe("5 in this file");
    expect(hits[0].severity).toBe("warn");
  });

  it("does not flag 4 Cards, and does not count CardContent / StatCard as Cards", () => {
    expect(
      findings(
        "card-per-section",
        page(
          `<PageContainer title="t">\n${repeat(4, card)}\n<StatCard label="a" value={1} />\n</PageContainer>`,
        ),
      ),
    ).toHaveLength(0);
  });
});

describe("kpi-row-off-dashboard", () => {
  const row = `<ResponsiveGrid columns={3}>
  <StatCard label="公開中" value={1} />
  <StatCard label="総利用数" value={2} />
  <StatCard label="件数" value={3} />
</ResponsiveGrid>`;

  it("flags three StatCards on a list page", () => {
    const hits = findings("kpi-row-off-dashboard", page(row));
    expect(hits).toHaveLength(1);
    expect(hits[0].severity).toBe("warn");
  });

  it("does not flag the same row on a dashboard path", () => {
    expect(findings("kpi-row-off-dashboard", page(row), "pages/dashboard/index.tsx")).toHaveLength(
      0,
    );
    expect(findings("kpi-row-off-dashboard", page(row), "pages/SalesDashboard.tsx")).toHaveLength(
      0,
    );
  });

  it("does not flag two StatCards", () => {
    expect(
      findings(
        "kpi-row-off-dashboard",
        page(`<Flex><StatCard label="a" value={1} /><StatCard label="b" value={2} /></Flex>`),
      ),
    ).toHaveLength(0);
  });
});

describe("empty-state-icon-in-card", () => {
  it("flags an icon EmptyState inside CardContent", () => {
    const hits = findings(
      "empty-state-icon-in-card",
      page(`<Card>
  <CardContent>
    <EmptyState icon={Inbox} title="クーポンがありません" />
  </CardContent>
</Card>`),
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].line).toBe(4);
    expect(hits[0].severity).toBe("warn");
  });

  it("flags one passed through an attribute inside the Card (DataState empty=…)", () => {
    expect(
      findings(
        "empty-state-icon-in-card",
        page(
          `<Card><CardContent flush><DataState query={q} empty={<EmptyState icon={Inbox} title="なし" />}>{(d) => d}</DataState></CardContent></Card>`,
        ),
      ),
    ).toHaveLength(1);
  });

  it("does not flag an EmptyState without an icon, with icon={null}, compact, or outside a Card", () => {
    expect(
      findings(
        "empty-state-icon-in-card",
        page(`<Flex direction="col">
  <Card><CardContent><EmptyState title="なし" action={<Button icon={<Plus />}>追加</Button>} /></CardContent></Card>
  <Card><CardContent><EmptyState icon={null} title="なし" /></CardContent></Card>
  <Card><CardContent><EmptyState icon={Inbox} variant="compact" title="なし" /></CardContent></Card>
  <EmptyState icon={Inbox} title="なし" />
</Flex>`),
      ),
    ).toHaveLength(0);
  });
});

describe("badge-wall", () => {
  it("flags a file with 5 Badge/Tag", () => {
    const hits = findings(
      "badge-wall",
      page(
        `<Flex>\n${repeat(3, `<Badge status="active" />`)}\n${repeat(2, `<Tag>t</Tag>`)}\n</Flex>`,
      ),
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].snippet).toBe("5 in this file");
    expect(hits[0].severity).toBe("warn");
  });

  it("does not flag 4", () => {
    expect(
      findings("badge-wall", page(`<Flex>\n${repeat(4, `<Badge status="active" />`)}\n</Flex>`)),
    ).toHaveLength(0);
  });
});

describe("alert-per-page", () => {
  it("flags a file with 4 Alerts", () => {
    const hits = findings(
      "alert-per-page",
      page(
        `<Flex direction="col">\n${repeat(4, `<Alert tone="info"><AlertDescription>x</AlertDescription></Alert>`)}\n</Flex>`,
      ),
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].snippet).toBe("4 in this file");
    expect(hits[0].severity).toBe("warn");
  });

  it("does not flag 3, and does not count AlertDialog", () => {
    expect(
      findings(
        "alert-per-page",
        page(
          `<Flex direction="col">\n${repeat(3, `<Alert tone="info">x</Alert>`)}\n<AlertDialog open />\n</Flex>`,
        ),
      ),
    ).toHaveLength(0);
  });
});

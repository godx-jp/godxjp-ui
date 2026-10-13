import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * `formfield-needs-form` and a field group rendered into its CALLER's Form (gh#1238).
 *
 * gino-cloud's `RevisionFields` renders two FormFields and is only ever used inside
 * `<Form asChild errors={form.errors}>` in two dialogs. The rule read one file at a time, saw no
 * <Form>, and flagged it — and its suggested fix (wrap the group in <Form>) would nest a <form> or
 * open a second Form context without the caller's errors. Each case below is a consumer project
 * on disk, audited by the real script.
 */

const SCRIPT = resolve("scripts/ui-audit.mjs");
let root: string | null = null;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = null;
});

const FIELDS = `import { FormField } from "@godxjp/ui/data-entry";
import { Input } from "@godxjp/ui/data-entry";
export function RevisionFields() {
  return (
    <>
      <FormField label="Revision"><Input name="revision" /></FormField>
      <FormField label="Reason"><Input name="reason" /></FormField>
    </>
  );
}
`;

const DIALOG = `import { Form } from "@godxjp/ui/data-entry";
import { RevisionFields } from "../../lib/masters/revision-fields";
export function JobOrderDialog({ form, submit }) {
  return (
    <Form asChild errors={form.errors}>
      <form onSubmit={submit}>
        <RevisionFields />
      </form>
    </Form>
  );
}
`;

function project(files: Record<string, string>) {
  root = mkdtempSync(join(tmpdir(), "ui-audit-form-fragment-"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "some-consumer-app" }));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, dirname(path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

function hits(cwd: string, ...paths: string[]) {
  const r = spawnSync(process.execPath, [SCRIPT, ...paths, "--format", "json"], {
    cwd,
    encoding: "utf8",
  });
  const out = JSON.parse(r.stdout) as {
    findings: { rule: string; file: string; message: string }[];
  };
  return out.findings.filter((f) => f.rule === "formfield-needs-form");
}
const files = (found: { file: string }[]) => found.map((f) => f.file);

const FIELD_FILE = "resources/js/lib/masters/revision-fields.tsx";

describe("formfield-needs-form: fields rendered into the caller's Form (gh#1238)", () => {
  it("does not flag a field group whose every caller renders it inside a Form — the reported files", () => {
    const cwd = project({
      [FIELD_FILE]: FIELDS,
      "resources/js/components/jobs/job-order-dialog.tsx": DIALOG,
    });
    expect(files(hits(cwd, "resources/js"))).toEqual([]);
  });

  it("still sees the callers when only the field file is audited (the --changed / editor-hook shape)", () => {
    const cwd = project({
      [FIELD_FILE]: FIELDS,
      "resources/js/components/jobs/job-order-dialog.tsx": DIALOG,
    });
    expect(files(hits(cwd, FIELD_FILE))).toEqual([]);
  });

  it("still flags the group when one caller renders it with no Form, and names THAT call site", () => {
    const cwd = project({
      [FIELD_FILE]: FIELDS,
      "resources/js/components/jobs/job-order-dialog.tsx": DIALOG,
      "resources/js/pages/revisions.tsx": `import { RevisionFields } from "../lib/masters/revision-fields";
export default function Revisions() {
  return <section><RevisionFields /></section>;
}
`,
    });
    const found = hits(cwd, "resources/js");
    expect(files(found)).toEqual([FIELD_FILE, FIELD_FILE]);
    // The fix belongs at the bare caller, so the message points there, not at the fields.
    expect(found[0]!.message).toContain("resources/js/pages/revisions.tsx:3");
    expect(found[0]!.message).toContain("Wrap THAT call in <Form>");
  });

  it("still flags fields in a hand-rolled Flex that nothing wraps in a Form (the gh#998 defect)", () => {
    const cwd = project({
      "resources/js/pages/settings.tsx": `import { Flex } from "@godxjp/ui/layout";
import { FormField, Input } from "@godxjp/ui/data-entry";
export default function Settings() {
  return (
    <Flex>
      <FormField label="Name"><Input name="name" /></FormField>
      <FormField label="Email"><Input name="email" /></FormField>
    </Flex>
  );
}
`,
    });
    const found = hits(cwd, "resources/js");
    expect(found).toHaveLength(2);
    expect(found[0]!.message).toContain("FormFields under one parent with no <Form>");
  });
});

/**
 * gh#1260 — the call site sits in a RENDER HELPER. gino-cloud's pre-departure tracking renders
 * `Field`/`Choice` (one FormField each) inside `const legFields = (leg, title) => (…)`, and only
 * CALLS `legFields(…)` inside `<Form onSubmit={submitPlan}>`. The walk saw the JSX with no Form
 * above it in the source and asked for a second, nested Form.
 */
const LEG_FIELDS = (
  callSite: string,
) => `import { Form, FormField, Input, Flex } from "@godxjp/ui/data-entry";
function Field({ label }) {
  return <FormField label={label}><Input name={label} /></FormField>;
}
export function Tracking({ submitPlan }) {
  const legFields = (leg, title) => {
    const detail = (name) => <Field label={leg + name} />;
    return (
      <Flex>
        <Field label={title} />
        {detail("flight")}
        <FormField label="Airport"><Input name={leg + "airport"} /></FormField>
        <FormField label="Gate"><Input name={leg + "gate"} /></FormField>
      </Flex>
    );
  };
  ${callSite}
}
`;

describe("formfield-needs-form: call sites inside a render helper called under a Form (gh#1260)", () => {
  const FILE = "resources/js/lib/application-cases/pre-departure-tracking.tsx";

  it("follows the helper (and a helper inside it) to the <Form> its calls sit in — the reported file", () => {
    const cwd = project({
      [FILE]: LEG_FIELDS(`return (
    <Form onSubmit={submitPlan}>
      {legFields("inbound", "Inbound")}
      {legFields("outbound", "Outbound")}
    </Form>
  );`),
    });
    expect(hits(cwd, "resources/js")).toEqual([]);
  });

  it("still flags it when one call of the helper is outside every Form", () => {
    const cwd = project({
      [FILE]: LEG_FIELDS(`return (
    <section>
      <Form onSubmit={submitPlan}>{legFields("inbound", "Inbound")}</Form>
      {legFields("outbound", "Outbound")}
    </section>
  );`),
    });
    expect(hits(cwd, "resources/js").length).toBeGreaterThan(0);
  });

  it("still flags a helper that is never called in the file (it may be exported or passed on)", () => {
    const cwd = project({
      [FILE]: LEG_FIELDS(`return <Form onSubmit={submitPlan}><span /></Form>;`),
    });
    expect(hits(cwd, "resources/js").length).toBeGreaterThan(0);
  });

  it("keeps two one-field components in one file apart instead of reading them as one group", () => {
    const cwd = project({
      [FILE]: `import { FormField, Input, Select } from "@godxjp/ui/data-entry";
function Field({ label }) {
  return <FormField label={label}><Input name={label} /></FormField>;
}
function Choice({ label }) {
  return <FormField label={label}><Select name={label} /></FormField>;
}
export default function Page() {
  return <section><Field label="a" /><Choice label="b" /></section>;
}
`,
    });
    expect(hits(cwd, "resources/js")).toEqual([]);
  });
});

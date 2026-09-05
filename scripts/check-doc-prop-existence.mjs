// Guard: every prop used in a documentation EXAMPLE must exist on the component.
//
// WHY THIS EXISTS
// `check-mcp-prop-sync.mjs` checks one direction — every declared prop is documented. Nothing
// checked the other direction, so a code example could hand the reader a prop the component does
// not have and every gate stayed green.
// `<Button tone="destructive">` (Button has `variant`; `tone` exists only on Text/Heading) and
// three Topbar examples passed `product` / `productMenu` / `collapsed` when Topbar takes only
// `start` / `center` / `end` / `children`. Copy-pasting any of them is an instant type error.
// Examples inside `mcp/src/data/*.ts` are STRING literals and examples in `docs/**/*.md` are
// fenced code, so no compiler will ever see either — the check has to be textual.
//
// SOURCE OF TRUTH is `component-api-manifest.json`, not the hand-written `src/props/**/*.prop.ts`.
// The manifest is generated from the real components, so it resolves inheritance and external
// types (Radix, react-router) that static reading of the prop types cannot. It is also simply
// manifest already listed the real `layout`/`labelAlign`.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const manifest = JSON.parse(readFileSync(join(ROOT, "component-api-manifest.json"), "utf8"));

// A component that wraps a third-party primitive (Radix, react-day-picker, embla, react-router)
// gets its real surface from that package's types, which the generator does not expand — the
// manifest lists a LOWER BOUND for it, not the full API. `<Slider minStepsBetweenThumbs>` and
// `<Calendar mode="range">` are both real and both absent from the manifest. Checking those
// components would produce confident nonsense, so they are skipped and counted out loud.
const THIRD_PARTY = /node_modules\/\.pnpm\/(?!@types\+react@)/;
const API = new Map();
const SKIPPED = [];
for (const [name, entry] of Object.entries(manifest.components)) {
  const props = entry.props ?? [];
  // An entry with NO props listed is a hole, not an empty API: `AspectRatio` re-exports the
  // Radix primitive wholesale, so the generator recorded nothing and `ratio` — which is real and
  // required — would read as invented. Nothing to check against means nothing to check.
  const external =
    props.length === 0 || props.some((p) => (p.declaredIn ?? []).some((d) => THIRD_PARTY.test(d)));
  if (external) SKIPPED.push(name);
  else API.set(name, new Set(props.map((p) => p.name)));
}

// Props any React/DOM element accepts, plus the DS-wide escape hatches. A component inheriting
// HTMLAttributes accepts far more than the manifest lists, so these can never be a finding.
const UNIVERSAL = new Set([
  "className",
  "style",
  "id",
  "key",
  "ref",
  "children",
  "asChild",
  "role",
  "tabIndex",
  "title",
  "hidden",
  "slot",
  "dir",
  "lang",
  "translate",
  "inert",
  "draggable",
  "spellCheck",
  "autoFocus",
  "type",
  "name",
  "value",
  "defaultValue",
  "placeholder",
  "disabled",
  "required",
  "readOnly",
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "htmlFor",
  "form",
  "action",
  "method",
  "min",
  "max",
  "step",
  "rows",
  "cols",
  "maxLength",
  "minLength",
  "pattern",
  "multiple",
  "accept",
  "checked",
  "defaultChecked",
  "selected",
  "open",
  "colSpan",
  "rowSpan",
  "scope",
  "download",
  "autoComplete",
  "inputMode",
  "enterKeyHint",
  "capture",
  "list",
  "wrap",
  "start",
  "reversed",
  "controls",
  "autoPlay",
  "loop",
  "muted",
  "playsInline",
  "poster",
  "preload",
  "crossOrigin",
]);

// Verified exceptions — each one was checked by hand against the component and is REAL code.
// Add to this list only with the reason, never to silence a finding you have not read.
const ALLOW = new Map([
  // Renders a react-router <Link>; `to` and the rest of LinkProps come from an external package
  // the manifest generator does not expand, so it lists only the prefetch-specific props.
  ["PrefetchLink", new Set(["to", "state", "replace", "reloadDocument", "preventScrollReset"])],
]);

// `Alert.QueryError` is catalogued as `AlertQueryError`. A dotted tag with no manifest entry of
// its own (`Descriptions.Item`) is NOT resolved to its root — the root's props are not the
// child's, and pretending otherwise invents findings.
const resolve = (tag) => API.get(tag.replaceAll(".", ""));

const files = [];
for (const f of readdirSync(join(ROOT, "mcp/src/data"))) {
  if (f.endsWith(".ts")) files.push(join(ROOT, "mcp/src/data", f));
}
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".md")) files.push(p);
  }
};
walk(join(ROOT, "docs"));

// Reads the attributes of exactly the tag being opened. A `{...}` value is consumed whole, so a
// nested <Tag> inside a prop value is not mistaken for an attribute of the outer tag — that
// confusion alone accounted for 33 phantom findings while this was being written.
function attributesOf(src, from) {
  const attrs = [];
  let i = from;
  for (let guard = 0; i < src.length && guard < 400; guard++) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] === ">" || (src[i] === "/" && src[i + 1] === ">")) break;
    const nm = /^([A-Za-z_$][\w$-]*)/.exec(src.slice(i));
    if (!nm) break;
    i += nm[1].length;
    if (src[i] !== "=") continue; // prose, not an attribute
    i++;
    if (src[i] === '"' || src[i] === "'") {
      const q = src[i++];
      while (i < src.length && src[i] !== q) i++;
      i++;
    } else if (src[i] === "{") {
      let depth = 0;
      do {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") depth--;
        i++;
      } while (i < src.length && depth > 0);
    }
    attrs.push({ name: nm[1], at: i });
  }
  return attrs;
}

const findings = [];
for (const file of files) {
  const src = readFileSync(file, "utf8");
  const tagRe = /<([A-Z][\w.]*)/g;
  let t;
  while ((t = tagRe.exec(src))) {
    const comp = t[1];
    const own = resolve(comp);
    if (!own) continue; // not ours, or a component this guard cannot judge (see SKIPPED)
    // the entire job of a migration guide. Without this, `- <Card size="compact">` in
    // Only `-` is skipped: a `+` line is the API the
    // guide is telling people to WRITE, and that must still be real.
    const lineStart = src.lastIndexOf("\n", t.index) + 1;
    if (/^\s*-\s*</.test(src.slice(lineStart, t.index + 1))) continue;

    const allowed = ALLOW.get(comp.replaceAll(".", ""));
    for (const { name } of attributesOf(src, tagRe.lastIndex)) {
      if (UNIVERSAL.has(name) || allowed?.has(name)) continue;
      if (name.startsWith("aria-") || name.startsWith("data-") || name.startsWith("on")) continue;
      if (own.has(name)) continue;
      const line = src.slice(0, t.index).split("\n").length;
      findings.push({
        file: relative(ROOT, file),
        line,
        comp,
        name,
        near: src.split("\n")[line - 1]?.trim().slice(0, 96),
      });
    }
  }
}

if (findings.length > 0) {
  console.error(
    `✗ check:doc-prop-existence — ${findings.length} documentation example(s) use a prop the component does not have:\n`,
  );
  for (const f of findings) {
    console.error(
      `  ${f.file}:${f.line}  <${f.comp} ${f.name}=…>  — ${f.comp} has no \`${f.name}\``,
    );
    console.error(`      ${f.near}`);
  }
  console.error(
    `\n  Fix the example against the real API (component-api-manifest.json lists it). If the prop\n` +
      `  IS real and the manifest simply cannot see it (external type from another package), add it\n` +
      `  to ALLOW in ${relative(ROOT, fileURLToPath(import.meta.url))} WITH the reason.`,
  );
  process.exit(1);
}

console.log(
  `✓ check:doc-prop-existence — ${files.length} example sources scanned against ${API.size} fully` +
    ` resolved components; every prop used exists.\n` +
    `  (${SKIPPED.length} components wrap third-party primitives and cannot be judged from the` +
    ` manifest — they are not covered.)`,
);

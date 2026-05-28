#!/usr/bin/env node
/**
 * Sync docs/primitives .md — props đầy đủ + tiếng Việt + use case.
 * Run: node preview/scripts/sync-primitive-docs.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  guideForComponent,
  guideForProp,
  guideForSubComponent,
  NATIVE_EXPAND_VI,
} from "./prop-guide-vi.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UI_ROOT = join(__dirname, "../..");
const DOCS_ROOT = join(UI_ROOT, "docs/primitives");
const SRC_COMPONENTS = join(UI_ROOT, "src/components");
const SRC_PROPS = join(UI_ROOT, "src/props");

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else if (name.endsWith(".tsx") && !name.startsWith("_")) acc.push(path);
  }
  return acc;
}

function walkFiles(dir, ext, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walkFiles(path, ext, acc);
    else if (path.endsWith(ext)) acc.push(path);
  }
  return acc;
}

function loadVocabulary() {
  const map = new Map();
  for (const file of walkFiles(join(SRC_PROPS, "vocabulary"), ".prop.ts")) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/export type (\w+) = ([^;]+);/g)) {
      map.set(m[1], m[2].trim());
    }
  }
  return map;
}

function loadComponentPropTypes() {
  const map = new Map();
  for (const file of walkFiles(join(SRC_PROPS, "components"), ".prop.ts")) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/export type (\w+) = ([\s\S]*?);/g)) {
      map.set(m[1], m[2].trim());
    }
  }
  return map;
}

function findComponentFile(componentName) {
  for (const file of walkFiles(SRC_COMPONENTS, ".tsx")) {
    const src = readFileSync(file, "utf8");
    const patterns = [
      `export\\s+(?:async\\s+)?function\\s+${componentName}\\b`,
      `export\\s+const\\s+${componentName}\\s*=?`,
      `(?:^|\\n)(?:export\\s+)?const\\s+${componentName}\\s*=`,
      `(?:^|\\n)function\\s+${componentName}\\b`,
    ];
    if (patterns.some((p) => new RegExp(p, "m").test(src))) return file;
  }
  return null;
}

function formatTypeForTable(type) {
  const t = type.trim();
  if (t.includes("|")) {
    return t
      .split("|")
      .map((part) => part.trim().replace(/^["'`]|["'`]$/g, ""))
      .filter(Boolean)
      .map((part) => `\`${part}\``)
      .join(", ");
  }
  if (t.startsWith("`")) return t;
  return `\`${t}\``;
}

function groupKeyFromDemoPath(demoPath) {
  const rel = relative(DOCS_ROOT, demoPath);
  return rel.split("/")[0] ?? "general";
}

const SKIP_IMPORTS = new Set(["toast", "flattenItemPages"]);

function componentNameFromDemoPath(demoPath) {
  const base = demoPath.split("/").pop().replace(".tsx", "");
  const segment = base === "index" ? (demoPath.split("/").slice(-2, -1)[0] ?? base) : base;
  return segment
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function parseDemo(demoPath) {
  const src = readFileSync(demoPath, "utf8");
  const components = [];
  let importPath = null;

  for (const m of src.matchAll(
    /import\s+(?!type\s)\{([^}]+)\}\s+from\s+["']@godx-jp\/godxjp-ui\/([^"']+)["']/g,
  )) {
    importPath = `@godxjp/ui/${m[2]}`;
    for (const part of m[1].split(",")) {
      const name = part
        .trim()
        .split(/\s+as\s+/)[0]
        .trim();
      if (!name || SKIP_IMPORTS.has(name)) continue;
      if (name.startsWith("use") && name.length > 3) continue;
      if (!components.includes(name)) components.push(name);
    }
  }

  if (!importPath || !components.length) return null;

  const expected = componentNameFromDemoPath(demoPath);
  const familyMode = !components.includes(expected);
  const primary = familyMode ? expected : expected;
  const subs = familyMode ? components : components.filter((c) => c !== expected);

  return {
    importPath,
    groupKey: groupKeyFromDemoPath(demoPath),
    components,
    primary,
    subs,
    familyMode,
  };
}

function extractJsDoc(source, componentName) {
  const re = new RegExp(
    `/\\*\\*([\\s\\S]*?)\\*/\\s*(?:export\\s+type\\s+${componentName}Props[\\s\\S]*?;\\s*)?(?:export\\s+(?:const|function)\\s+${componentName}\\b)`,
  );
  const m = source.match(re);
  if (!m) return "";
  return m[1]
    .replace(/^\s*\*\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractCvaVariants(source) {
  const variants = new Map();
  const defaults = new Map();
  const variantsIdx = source.indexOf("variants:");
  if (variantsIdx >= 0) {
    const chunk = source.slice(variantsIdx, variantsIdx + 2500);
    for (const dim of ["variant", "size", "align", "orientation", "side"]) {
      const m = chunk.match(new RegExp(`${dim}:\\s*\\{([^}]+)\\}`));
      if (m) {
        const keys = [...m[1].matchAll(/(\w+):/g)].map((k) => k[1]);
        if (keys.length) variants.set(dim, keys);
      }
    }
  }
  const defMatch = source.match(/defaultVariants:\s*\{([^}]+)\}/);
  if (defMatch) {
    for (const dm of defMatch[1].matchAll(/(\w+):\s*["']?([\w-]+)["']?/g)) {
      defaults.set(dm[1], dm[2]);
    }
  }
  return { variants, defaults };
}

function detectNativeElement(source) {
  if (/InputHTMLAttributes/.test(source)) return "input";
  if (/TextareaHTMLAttributes/.test(source)) return "textarea";
  if (/ButtonHTMLAttributes/.test(source)) return "button";
  if (/HTMLAttributes/.test(source)) return "div";
  return null;
}

function resolveType(type, vocabulary, componentProps, depth = 0) {
  let t = type.trim().replace(/\s+/g, " ");
  if (depth > 4) return t;
  if (vocabulary.has(t))
    return resolveType(vocabulary.get(t), vocabulary, componentProps, depth + 1);
  if (componentProps.has(t)) {
    const body = componentProps.get(t);
    if (body.includes("&")) {
      return parseTypeBody(body, vocabulary, componentProps)
        .map((f) => f.type)
        .join(" & ");
    }
    return parseTypeBody(body, vocabulary, componentProps)
      .map((f) => `${f.name}${f.optional ? "?" : ""}: ${f.type}`)
      .join("; ");
  }
  t = t.replace(/React\.ReactNode/g, "`ReactNode`");
  t = t.replace(/React\.Node/g, "`ReactNode`");
  return t;
}

function loadVocabDescription(typeName) {
  const file = join(SRC_PROPS, "registry.ts");
  const src = readFileSync(file, "utf8");
  const m = src.match(new RegExp(`${typeName}:\\s*\\{[^}]*description:\\s*"([^"]+)"`));
  return m?.[1] ?? "";
}

function parseObjectFields(objSource, vocabulary, componentProps) {
  const fields = [];
  const fieldRe = /(?:\/\*\*([\s\S]*?)\*\/\s*)?(\w+)(\?)?:\s*([^;,\n}]+)/g;
  let m;
  while ((m = fieldRe.exec(objSource))) {
    const jsdoc = m[1]?.replace(/\s+/g, " ").trim();
    const name = m[2];
    const optional = Boolean(m[3]);
    let type = m[4].trim();
    if (type.startsWith("{")) continue;
    type = resolveType(type, vocabulary, componentProps);
    const english = jsdoc || loadVocabDescription(m[4].trim());
    const vi = guideForProp(name, english);
    fields.push({
      name,
      optional,
      type,
      moTa: vi.moTa,
      useCase: vi.useCase,
      category: vi.category ?? (name.startsWith("on") ? "action" : "data"),
    });
  }
  return fields;
}

function htmlElementKey(part) {
  if (/InputHTMLAttributes/.test(part)) return "input";
  if (/TextareaHTMLAttributes/.test(part)) return "textarea";
  if (/ButtonHTMLAttributes/.test(part)) return "button";
  if (/HTMLAttributes/.test(part)) return "div";
  return null;
}

function parseTypeBody(body, vocabulary, componentProps) {
  const fields = [];
  const nativeElement = body.match(/HTML\w+Attributes/) ? htmlElementKey(body) : null;

  for (const part of body.split(/\s*&\s*/)) {
    const p = part.trim();
    if (htmlElementKey(p)) continue;
    if (/VariantProps<typeof \w+>/.test(p)) continue;
    const obj = p.match(/\{([\s\S]*)\}/);
    if (obj) fields.push(...parseObjectFields(obj[1], vocabulary, componentProps));
  }

  return { fields, nativeElement };
}

function extractTypeBlock(source, typeName) {
  const typeRe = new RegExp(`export\\s+type\\s+${typeName}\\s*=`, "m");
  const ifaceRe = new RegExp(`export\\s+interface\\s+${typeName}\\b`, "m");
  const match = source.match(typeRe) ?? source.match(ifaceRe);
  if (!match) return null;

  const start = match.index + match[0].length;
  const rest = source.slice(start).trimStart();
  if (/^\{\s*\}/.test(rest)) return "";
  if (rest.startsWith("{")) {
    let depth = 0;
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === "{") depth++;
      if (rest[i] === "}") depth--;
      if (depth === 0 && rest[i] === "}") return rest.slice(0, i + 1);
    }
    return null;
  }

  let depth = 0;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "{") depth++;
    if (rest[i] === "}") depth--;
    if (rest[i] === ";" && depth === 0) return rest.slice(0, i);
  }
  if (/\{\s*\}\s*$/.test(rest.trim())) return "";
  return null;
}

function resolvePropImportPath(fromFile, importPath) {
  const base = dirname(fromFile);
  let resolved = join(base, importPath);
  if (!resolved.endsWith(".ts")) resolved += ".ts";
  return resolved;
}

function extractPropsFromComponent(
  source,
  componentName,
  vocabulary,
  componentProps,
  componentFile,
) {
  const candidates = [`${componentName}Props`, `${componentName}Prop`];
  /** @type {{ fields: any[], nativeElement: string | null }} */
  let result = { fields: [], nativeElement: null };

  for (const name of candidates) {
    const body = extractTypeBlock(source, name);
    if (body !== null) {
      result = parseTypeBody(body, vocabulary, componentProps);
      break;
    }
  }

  if (!result.fields.length) {
    const reExport = source.match(/export\s+type\s*\{[^}]+\}\s*from\s+["']([^"']+)["']/);
    if (reExport) {
      const propFile = resolvePropImportPath(componentFile, reExport[1]);
      try {
        const propSrc = readFileSync(propFile, "utf8");
        for (const name of candidates) {
          const body = extractTypeBlock(propSrc, name);
          if (body !== null) {
            result = parseTypeBody(body, vocabulary, componentProps);
            if (!result.nativeElement) {
              const el = (source + propSrc).match(/HTML\w+Attributes/);
              result.nativeElement = el ? htmlElementKey(el[0]) : null;
            }
            break;
          }
        }
      } catch {
        /* fall through */
      }
    }
  }

  if (!result.nativeElement) {
    result.nativeElement = detectNativeElement(source);
  }

  return result;
}

function mergeCvaIntoFields(fields, cva) {
  for (const [key, values] of cva.variants) {
    const type = values.map((v) => `"${v}"`).join(" | ");
    const vi = guideForProp(key);
    if (fields.some((f) => f.name === key)) {
      fields = fields.map((f) => (f.name === key ? { ...f, type } : f));
    } else {
      fields.push({
        name: key,
        optional: true,
        type,
        moTa: vi.moTa,
        useCase: vi.useCase,
        category: "data",
      });
    }
  }
  for (const [key, val] of cva.defaults) {
    fields = fields.map((f) => (f.name === key ? { ...f, default: val } : f));
  }
  return fields;
}

function expandNativeProps(fields, nativeElement) {
  if (!nativeElement || !NATIVE_EXPAND_VI[nativeElement]) return fields;
  const existing = new Set(fields.map((f) => f.name));
  const expanded = [...fields];
  for (const prop of NATIVE_EXPAND_VI[nativeElement]) {
    if (existing.has(prop.name)) continue;
    expanded.push({
      name: prop.name,
      optional: prop.optional ?? true,
      type: prop.type,
      moTa: prop.moTa,
      useCase: prop.useCase,
      category: prop.category ?? "native",
    });
  }
  return expanded;
}

function categorizeFields(fields) {
  const data = [];
  const action = [];
  const native = [];
  for (const f of fields) {
    const cat = f.category ?? (f.name.startsWith("on") ? "action" : "data");
    if (cat === "action") action.push(f);
    else if (cat === "native") native.push(f);
    else data.push(f);
  }
  return { data, action, native };
}

function renderPropTable(fields) {
  if (!fields.length) return ["Không có props trong nhóm này.", ""];
  const lines = [
    "| Prop | Kiểu | Mặc định | Mô tả | Use case |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const f of fields) {
    const def = f.default ? `\`${f.default}\`` : f.optional ? "—" : "**bắt buộc**";
    lines.push(
      `| \`${f.name}\` | ${formatTypeForTable(f.type)} | ${def} | ${f.moTa} | ${f.useCase} |`,
    );
  }
  lines.push("");
  return lines;
}

function renderComponentPropSections(fields, headingPrefix = "##") {
  const { data, action, native } = categorizeFields(fields);
  const lines = [];
  lines.push(`${headingPrefix} Props hiển thị & cấu hình`, "", ...renderPropTable(data));
  lines.push(
    `${headingPrefix} Props hành động (events & callbacks)`,
    "",
    ...renderPropTable(action),
  );
  if (native.length) {
    lines.push(`${headingPrefix} Thuộc tính DOM & accessibility`, "", ...renderPropTable(native));
  }
  return lines;
}

function componentUsesCva(source, componentName) {
  for (const name of [`${componentName}Props`, `${componentName}Prop`]) {
    const body = extractTypeBlock(source, name);
    if (body && /VariantProps<typeof \w+>/.test(body)) return true;
  }
  return false;
}

function buildFieldsForComponent(componentName, vocabulary, componentProps) {
  const componentFile = findComponentFile(componentName);
  if (!componentFile) return null;

  const source = readFileSync(componentFile, "utf8");
  const cva = componentUsesCva(source, componentName)
    ? extractCvaVariants(source)
    : { variants: new Map(), defaults: new Map() };
  const { fields: rawFields, nativeElement } = extractPropsFromComponent(
    source,
    componentName,
    vocabulary,
    componentProps,
    componentFile,
  );
  let fields = mergeCvaIntoFields(rawFields, cva);
  fields = expandNativeProps(fields, nativeElement);

  if (
    !fields.some((f) => f.name === "children") &&
    !fields.some((f) => ["label", "title", "value"].includes(f.name)) &&
    !/InputHTMLAttributes|TextareaHTMLAttributes/.test(source) &&
    /HTMLAttributes/.test(source)
  ) {
    const vi = guideForProp("children");
    fields.unshift({
      name: "children",
      optional: true,
      type: "`ReactNode`",
      moTa: vi.moTa,
      useCase: vi.useCase,
      category: "data",
    });
  }

  return { fields, source };
}

function generateMarkdown(title, parsed, componentDocs) {
  const { importPath, groupKey, components, primary, subs, familyMode } = parsed;
  const compGuide = guideForComponent(primary, groupKey);
  const importList = components.join(", ");

  const lines = [
    "---",
    `title: ${title}`,
    "lang: vi",
    "---",
    "",
    compGuide.intro,
    "",
    "## Khi nào dùng",
    "",
    ...compGuide.useCases.map((u) => `- ${u}`),
    "",
    "## Import",
    "",
    "```tsx",
    `import { ${importList} } from "${importPath}";`,
    "```",
    "",
  ];

  if (familyMode) {
    lines.push("## Components", "");
    for (const name of components) {
      const doc = componentDocs.get(name);
      if (!doc) continue;
      const subGuide = guideForSubComponent(name, extractJsDoc(doc.source, name));
      lines.push(`### ${name}`, "", subGuide.intro, "", `**Use case:** ${subGuide.useCase}`, "");
      lines.push(...renderComponentPropSections(doc.fields, "####"));
    }
  } else {
    const mainDoc = componentDocs.get(primary);
    if (mainDoc) {
      if (subs.length) {
        lines.push(`## ${primary} — component chính`, "");
      }
      lines.push(...renderComponentPropSections(mainDoc.fields, "##"));
    }

    if (subs.length) {
      lines.push("## Sub-components", "");
      for (const name of subs) {
        const doc = componentDocs.get(name);
        if (!doc) continue;
        const subGuide = guideForSubComponent(name, extractJsDoc(doc.source, name));
        lines.push(`### ${name}`, "", subGuide.intro, "", `**Use case:** ${subGuide.useCase}`, "");
        lines.push(...renderComponentPropSections(doc.fields, "####"));
      }
    }
  }

  lines.push(
    "## Ghi chú",
    "",
    "- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.",
    "- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.",
    "- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.",
    "- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.",
    "",
  );

  return lines.join("\n");
}

function parseExistingTitle(mdPath) {
  try {
    const raw = readFileSync(mdPath, "utf8");
    const m = raw.match(/^---[\s\S]*?title:\s*(.+?)\s*[\r\n]/);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  } catch {
    /* new file */
  }
  return null;
}

function main() {
  const vocabulary = loadVocabulary();
  const componentProps = loadComponentPropTypes();
  const demos = walk(DOCS_ROOT);
  let updated = 0;
  let skipped = 0;

  for (const demoPath of demos) {
    if (demoPath.includes("/examples/")) {
      skipped += 1;
      continue;
    }
    const parsed = parseDemo(demoPath);
    if (!parsed) {
      console.warn(`skip (no import): ${relative(UI_ROOT, demoPath)}`);
      skipped += 1;
      continue;
    }

    const componentDocs = new Map();
    for (const name of parsed.components) {
      const built = buildFieldsForComponent(name, vocabulary, componentProps);
      if (built) componentDocs.set(name, built);
    }

    if (!componentDocs.size && !parsed.familyMode) {
      console.warn(
        `skip (component not found): ${parsed.primary} (${relative(UI_ROOT, demoPath)})`,
      );
      skipped += 1;
      continue;
    }

    const mdPath = demoPath.replace(/\.tsx$/, ".md");
    const title = parseExistingTitle(mdPath) ?? parsed.primary;
    const md = generateMarkdown(title, parsed, componentDocs);
    writeFileSync(mdPath, md, "utf8");
    updated += 1;
  }

  console.log(`sync-primitive-docs: updated ${updated}, skipped ${skipped}`);
}

main();

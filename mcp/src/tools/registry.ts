/**
 * Tool registry — declares MCP tool schemas + dispatches calls.
 * Each tool returns a Markdown string (well-formatted) so any
 * MCP-aware agent can render it inline.
 */

import {
  COMPONENTS,
  componentsByGroup,
  findComponent,
  type ComponentGroup,
} from "../data/components.js";
import { PROP_VOCABULARY, findVocab } from "../data/prop-vocabulary.js";
import { TOKENS, tokensByCategory, type TokenCategory } from "../data/tokens.js";
import { CARDINAL_RULES, findRule } from "../data/rules.js";
import { PATTERNS, findPattern, searchPatterns } from "../data/patterns.js";

export const TOOL_DEFINITIONS = [
  {
    name: "list_primitives",
    description:
      "List every @godxjp/ui primitive / composite / shell with its group + one-line tagline. Optionally filter by group.",
    inputSchema: {
      type: "object",
      properties: {
        group: {
          type: "string",
          enum: [
            "general", "layout", "data-display", "data-entry",
            "feedback", "navigation", "composites", "shell", "providers",
          ],
          description: "Filter by primitive group. Omit to list all.",
        },
      },
    },
  },
  {
    name: "get_component",
    description:
      "Full API for one component — props (name, type, description, default), copy-paste example, story + doc paths, cardinal rules to follow.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Component name, e.g. 'Button', 'DataTable', 'FormField'." },
      },
      required: ["name"],
    },
  },
  {
    name: "search_components",
    description:
      "Fuzzy-search components by name / tagline / prop names. Returns matches ranked by relevance.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text query." },
      },
      required: ["query"],
    },
  },
  {
    name: "get_prop_vocabulary",
    description:
      "Read the shared prop-vocabulary types (`SizeProp`, `StatusProp`, `ColorProp`, `LoadingProp`, etc.). Pass `name` to get one, omit for all.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Vocabulary type name (e.g. 'SizeProp'). Omit for catalog." },
      },
    },
  },
  {
    name: "get_tokens",
    description:
      "Read design tokens. Optionally filter by category (color / spacing / typography / radius / shadow / motion / breakpoint / density / z-index).",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: [
            "color", "spacing", "typography", "radius",
            "shadow", "motion", "breakpoint", "density", "z-index",
          ],
        },
      },
    },
  },
  {
    name: "get_cardinal_rules",
    description:
      "Read the 34 cardinal rules from CLAUDE.md. Pass `number` (1–34) for one rule, omit for all.",
    inputSchema: {
      type: "object",
      properties: {
        number: { type: "number", description: "Rule number 1–34. Omit for full list." },
      },
    },
  },
  {
    name: "get_pattern",
    description:
      "Fetch a canonical code pattern (registration-form / settings-page / data-table / confirm-destructive / app-shell / filter-bar / loading-states). Returns copy-paste-ready snippet.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "Pattern slug. Use `list_patterns` first if unsure.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "list_patterns",
    description: "List every canonical code pattern with its tagline + tags. Use before `get_pattern`.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "suggest_primitive",
    description:
      "Natural-language → primitive recommendation. Describe a use case (e.g. 'show validation errors', 'filter rows', 'confirm a destructive delete') and get back the recommended primitive(s) + rationale.",
    inputSchema: {
      type: "object",
      properties: {
        use_case: { type: "string", description: "Describe what you want to build." },
      },
      required: ["use_case"],
    },
  },
  {
    name: "lint_jsx",
    description:
      "Check a JSX snippet against the most common rule violations (raw `<button>` / `<input>`, hard-coded colors / sizes, missing aria-label on IconButton, `'error'` instead of `'destructive'` on Tag, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        jsx: { type: "string", description: "The JSX snippet to lint." },
      },
      required: ["jsx"],
    },
  },
];

export async function dispatchTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    case "list_primitives":
      return listPrimitives(args.group as ComponentGroup | undefined);
    case "get_component":
      return getComponent(String(args.name ?? ""));
    case "search_components":
      return searchComponents(String(args.query ?? ""));
    case "get_prop_vocabulary":
      return getPropVocab(args.name as string | undefined);
    case "get_tokens":
      return getTokens(args.category as TokenCategory | undefined);
    case "get_cardinal_rules":
      return getCardinalRules(
        typeof args.number === "number" ? args.number : undefined,
      );
    case "get_pattern":
      return getPattern(String(args.name ?? ""));
    case "list_patterns":
      return listPatterns();
    case "suggest_primitive":
      return suggestPrimitive(String(args.use_case ?? ""));
    case "lint_jsx":
      return lintJsx(String(args.jsx ?? ""));
    default:
      return `Unknown tool: ${name}`;
  }
}

// ── tool implementations ────────────────────────────────────────

function listPrimitives(group?: ComponentGroup): string {
  const list = group ? componentsByGroup(group) : COMPONENTS;
  if (list.length === 0) return `No components found${group ? ` in group "${group}"` : ""}.`;
  const grouped = list.reduce<Record<string, typeof list>>((acc, c) => {
    (acc[c.group] ??= []).push(c);
    return acc;
  }, {});
  let out = `# @godxjp/ui primitives${group ? ` — ${group}` : ""}\n\n`;
  out += `${list.length} components.\n\n`;
  for (const [g, items] of Object.entries(grouped)) {
    out += `## ${g}\n\n`;
    for (const c of items) {
      out += `- **${c.name}** — ${c.tagline}\n`;
    }
    out += "\n";
  }
  return out;
}

function getComponent(name: string): string {
  const c = findComponent(name);
  if (!c) return `Component "${name}" not found. Use list_primitives to see available components.`;
  let out = `# ${c.name}\n\n`;
  out += `**Group:** ${c.group}\n\n`;
  out += `${c.tagline}\n\n`;
  out += `## Props\n\n`;
  out += `| Name | Type | Required | Default | Description |\n|---|---|---|---|---|\n`;
  for (const p of c.props) {
    out += `| \`${p.name}\` | \`${p.type}\` | ${p.required ? "✓" : ""} | ${p.defaultValue ? `\`${p.defaultValue}\`` : ""} | ${p.description} |\n`;
  }
  out += `\n## Example\n\n\`\`\`tsx\n${c.example}\n\`\`\`\n\n`;
  if (c.docPath) out += `**Reference doc:** \`docs/reference/${c.docPath}\`\n\n`;
  out += `**Storybook:** \`src/stories/${c.storyPath}\`\n\n`;
  out += `**Cardinal rules:** ${c.rules.map((n) => `#${n}`).join(", ")}\n`;
  return out;
}

function searchComponents(query: string): string {
  const q = query.trim().toLowerCase();
  if (q === "") return listPrimitives();
  const matches = COMPONENTS.map((c) => {
    let score = 0;
    if (c.name.toLowerCase().includes(q)) score += 5;
    if (c.tagline.toLowerCase().includes(q)) score += 2;
    if (c.props.some((p) => p.name.toLowerCase().includes(q))) score += 1;
    if (c.props.some((p) => p.description.toLowerCase().includes(q))) score += 1;
    return { c, score };
  })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
  if (matches.length === 0) return `No matches for "${query}".`;
  let out = `# Search "${query}" — ${matches.length} matches\n\n`;
  for (const { c, score } of matches) {
    out += `- **${c.name}** (${c.group}, score ${score}) — ${c.tagline}\n`;
  }
  return out;
}

function getPropVocab(name?: string): string {
  if (name) {
    const v = findVocab(name);
    if (!v) return `Vocabulary "${name}" not found.`;
    let out = `# ${v.name}\n\n${v.concept}\n\n`;
    out += `**Values:** ${v.values.map((x) => `\`${x}\``).join(" | ")}\n\n`;
    out += `**Used by:** ${v.usedBy.map((x) => `\`${x}\``).join(", ")}\n\n`;
    if (v.notes) out += `**Notes:** ${v.notes}\n`;
    return out;
  }
  let out = `# @godxjp/ui prop vocabulary\n\n${PROP_VOCABULARY.length} shared types from \`src/props/\`.\n\n`;
  for (const v of PROP_VOCABULARY) {
    out += `## ${v.name}\n${v.concept}\n\n`;
    out += `Values: ${v.values.map((x) => `\`${x}\``).join(" | ")}\n\n`;
  }
  return out;
}

function getTokens(category?: TokenCategory): string {
  const list = category ? tokensByCategory(category) : TOKENS;
  if (list.length === 0) return `No tokens found${category ? ` in category "${category}"` : ""}.`;
  let out = `# Design tokens${category ? ` — ${category}` : ""}\n\n`;
  const grouped = list.reduce<Record<string, typeof list>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});
  for (const [cat, items] of Object.entries(grouped)) {
    out += `## ${cat}\n\n| Name | Role | Value | Axis |\n|---|---|---|---|\n`;
    for (const t of items) {
      out += `| \`${t.name}\` | ${t.role} | ${t.value ?? "—"} | ${t.axis ?? "—"} |\n`;
    }
    out += "\n";
  }
  return out;
}

function getCardinalRules(num?: number): string {
  if (num !== undefined) {
    const r = findRule(num);
    if (!r) return `Rule ${num} not found. Valid range: 1–${CARDINAL_RULES.length}.`;
    return `# Rule ${r.number} — ${r.title}\n\n${r.body}\n`;
  }
  let out = `# Cardinal rules (${CARDINAL_RULES.length})\n\n`;
  for (const r of CARDINAL_RULES) {
    out += `## ${r.number}. ${r.title}\n\n${r.body}\n\n`;
  }
  return out;
}

function listPatterns(): string {
  let out = `# Canonical patterns (${PATTERNS.length})\n\n`;
  for (const p of PATTERNS) {
    out += `- **${p.name}** — ${p.tagline}  \n  _tags: ${p.tags.join(", ")}_\n`;
  }
  return out;
}

function getPattern(name: string): string {
  const p = findPattern(name);
  if (!p) {
    const candidates = searchPatterns(name);
    if (candidates.length === 0) return `Pattern "${name}" not found. Use list_patterns to see all.`;
    let out = `Pattern "${name}" not found. Closest matches:\n\n`;
    for (const c of candidates) out += `- ${c.name} — ${c.tagline}\n`;
    return out;
  }
  return `# Pattern: ${p.name}\n\n${p.tagline}\n\n**Tags:** ${p.tags.join(", ")}\n\n\`\`\`tsx\n${p.code}\n\`\`\`\n`;
}

function suggestPrimitive(useCase: string): string {
  const q = useCase.trim().toLowerCase();
  if (q === "") return "Describe your use case, e.g. 'show validation errors' or 'filter table rows'.";

  // Heuristic mapping — keywords → primitives + rationale.
  const suggestions: Array<{ component: string; rationale: string; score: number }> = [];
  const check = (kw: string[], component: string, rationale: string, weight = 2) => {
    if (kw.some((k) => q.includes(k))) {
      suggestions.push({ component, rationale, score: weight });
    }
  };

  check(["form", "submit", "validation", "register", "sign up", "login"], "Form + FormField", "react-hook-form + zod composition. `<Form resolver={zodResolver(schema)}> <FormField name='x'><Input/></FormField> </Form>`", 5);
  check(["table", "rows", "columns", "spreadsheet", "data grid"], "DataTable (composite) or Table (primitive)", "DataTable for full chrome (toolbar + pagination + batch). Table for slim primitive without chrome.", 5);
  check(["modal", "dialog", "confirm"], "Dialog or AlertDialog", "Radix Dialog wrapped. `AlertDialog` for destructive confirm (forces an explicit action button).", 4);
  check(["drawer", "side panel", "sheet"], "Sheet", "Radix Dialog as side panel. Wider than Modal — for settings/filters/details.", 4);
  check(["toast", "notification", "snackbar"], "toast / Toaster", "Sonner-backed. Mount `<Toaster>` once in app root, call `toast.success(...)` anywhere.", 4);
  check(["loading", "spinner", "saving"], "Spinner or LoadingProp on Form/FormField", "Spinner for active work (saving). LoadingProp={{kind:'skeleton'}} for INITIAL fetch.", 3);
  check(["skeleton", "placeholder", "fetching"], "Skeleton or LoadingProp", "Skeleton for initial-data-fetch state. LoadingProp on Form cascades to all FormFields.", 3);
  check(["alert", "banner", "notice", "warning"], "Alert", "Inline notice banner. 5 semantic colors × outlined/banner variants.", 3);
  check(["dropdown", "menu", "context menu"], "DropdownMenu", "Radix DropdownMenu for floating context menus.", 3);
  check(["sidebar", "nav", "navigation"], "Sidebar (shell)", "Left nav rail with sections + items + product chip. Collapsible.", 3);
  check(["select", "dropdown picker"], "Select or AutoComplete", "Select for discrete options. AutoComplete for free-text + suggestions.", 3);
  check(["badge", "chip", "pill", "label"], "Badge or Tag", "Badge for status pills (numeric/short word). Tag for labels (removable).", 3);
  check(["filter", "search"], "Form layout='inline' + Pattern 'filter-bar'", "Inline form above the table. See `get_pattern filter-bar`.", 4);
  check(["delete", "destructive", "danger"], "Pattern 'confirm-destructive'", "Card with `accent='destructive'` + typed-name confirm. See `get_pattern confirm-destructive`.", 4);
  check(["card", "panel", "section"], "Card", "Surface container. Title + subtitle + body + actions.", 3);
  check(["upload", "file"], "MediaUpload (composite)", "Drag-drop upload composite (in composites/upload).", 3);
  check(["date", "calendar"], "DatePicker or DateField or Calendar", "React Aria-backed. DateField for inline segmented input. DatePicker for popover.", 3);
  check(["time", "hour"], "TimeField or TimeInput", "TimeField (React Aria, segmented) or TimeInput (plain HH:MM).", 3);
  check(["color", "theme picker"], "ColorPicker", "Radix Popover-backed color picker with presets.", 3);
  check(["slider", "range"], "Slider", "Radix Slider with single or range value.", 3);
  check(["rating", "stars"], "Rate", "Star rating component.", 3);
  check(["transfer", "move between", "shuttle"], "Transfer", "Two-list shuttle picker.", 3);
  check(["tree", "nested", "hierarchy"], "Tree or TreeSelect", "Tree for visual rendering, TreeSelect for picker.", 3);
  check(["cascader", "country state city"], "Cascader", "Nested column picker (country > state > city).", 3);
  check(["accordion", "collapse"], "Collapse", "Vertical accordion with smooth open/close.", 3);
  check(["carousel", "slider images"], "Carousel", "Image / card carousel with autoplay + dots.", 3);
  check(["timeline", "activity"], "Timeline", "Vertical activity / event timeline.", 3);
  check(["popover", "tooltip", "hover info"], "Popover or Tooltip", "Popover for click-to-open. Tooltip for hover.", 3);

  if (suggestions.length === 0) {
    return `No direct match for "${useCase}". Try \`list_primitives\` or \`search_components query="..."\`.`;
  }

  suggestions.sort((a, b) => b.score - a.score);
  let out = `# Suggestions for "${useCase}"\n\n`;
  for (const s of suggestions) {
    out += `- **${s.component}** — ${s.rationale}\n`;
  }
  out += `\nFor full API: \`get_component name="X"\`. For canonical code: \`get_pattern name="..."\`.\n`;
  return out;
}

function lintJsx(jsx: string): string {
  const issues: string[] = [];

  const check = (regex: RegExp, msg: string) => {
    if (regex.test(jsx)) issues.push(msg);
  };

  // Rule 29 — raw HTML where primitive exists
  check(/<button[\s>]/i, "Use `<Button>` instead of raw `<button>` (rule 29).");
  check(/<input[\s>]/i, "Use `<Input>` instead of raw `<input>` (rule 29).");
  check(/<select[\s>]/i, "Use `<Select>` instead of raw `<select>` (rule 29).");
  check(/<textarea[\s>]/i, "Use `<Textarea>` instead of raw `<textarea>` (rule 29).");

  // Rule 2 — raw color utilities (not token-named)
  check(/bg-(red|blue|green|yellow|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/, "Token-named utilities only (`bg-primary`, `bg-destructive`). Raw value utilities (`bg-red-500`) violate rule 2.");
  check(/text-(red|blue|green|yellow|gray)-\d{2,3}\b/, "Use semantic color tokens (`text-destructive`, `text-success`) instead of raw color scales (rule 2).");

  // Tag — old "error" vocab
  check(/<Tag[\s\S]*?color=["']error["']/i, "Tag `color=\"error\"` was renamed to `\"destructive\"` (v5.0, PR #60).");
  check(/<Badge[\s\S]*?variant=["']error["']/i, "Badge `variant=\"error\"` was renamed to `\"destructive\"` (v5.0, PR #63).");

  // Space / Flex / Grid — old "middle" vocab
  check(/(Flex|Space|Grid|Masonry)[\s\S]*?(gap|size)=["']middle["']/i, '`"middle"` → `"default"` for Flex/Space/Grid/Masonry gap/size (v5.0, PR #63).');

  // IconButton size "default" — now "md"
  check(/<IconButton[\s\S]*?size=["']default["']/i, 'IconButton `size="default"` → `"md"` (aliased to IconSizeProp in v5.0).');

  // SegmentedControl size "sm" — now "small"
  check(/<SegmentedControl[\s\S]*?size=["']sm["']/i, 'SegmentedControl `size="sm"` → `"small"` (aligned with SizeProp in v5.0).');

  // PageContent padding old vocab
  check(/<PageContent[\s\S]*?padding=["'](compact|comfortable)["']/i, 'PageContent `padding="compact"/"comfortable"` → `"tight"/"cozy"` (aligned with PaddingProp in v5.0).');

  // Pagination justify
  check(/<Pagination[\s\S]*?justify=["']between["']/i, 'Pagination `justify="between"` → `"space-between"` (matches FlexJustify in v5.0).');

  // IconButton without aria-label (rule 6 — WCAG)
  if (/<IconButton(?![^>]*aria-label)/i.test(jsx) && !/asChild/i.test(jsx)) {
    issues.push("`<IconButton>` should have `aria-label` (icon-only buttons need an accessible name; rule 6 — WCAG 2.1 AA).");
  }

  // Story-only checks (rule 34) — `cell: () => ` pattern check
  if (/cell:\s*\(\{?\s*row\s*\}?\)\s*=>/i.test(jsx) && /export\s+const\s+\w+\s*:\s*Story/i.test(jsx)) {
    if (!/parameters[\s\S]{0,200}source[\s\S]{0,100}code:/i.test(jsx)) {
      issues.push("Stories with function-valued cell renderers MUST override `parameters.docs.source.code` (rule 34). Storybook strips function bodies to `() => {}` otherwise.");
    }
  }

  if (issues.length === 0) {
    return "✅ No issues found. Snippet looks clean against the most common rule violations.";
  }
  let out = `# Lint findings — ${issues.length} issue${issues.length === 1 ? "" : "s"}\n\n`;
  for (const i of issues) out += `- ${i}\n`;
  out += `\nNote: this is a heuristic check — not a substitute for the full CI gate (\`pnpm lint:tokens\`, \`pnpm type-check\`, axe-core in stories).\n`;
  return out;
}

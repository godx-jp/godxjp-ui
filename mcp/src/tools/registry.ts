/**
 * Tool registry — declares MCP tool schemas + dispatches calls.
 *
 * Token-efficient design (per PLAN.md):
 *   - `list_*` returns SMALL metadata (1-line each).
 *   - `get_*` / `get_*_section` returns ONE focused unit.
 *   - `route_task` returns a SMALL pointer to skill+section.
 *
 * The agent walks: list → narrow → drill into one section. Avoids
 * dumping 50KB blobs.
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
import { SKILLS, findSkill, findSection, routeTask } from "../data/skills-index.js";
import { ANTI_AI_TELLS, aiTellsByCategory, type AiTell } from "../data/anti-ai-tells.js";
import { REDESIGN_CHECKS, FIX_PRIORITY, REDESIGN_RULES, checksByCategory, type AuditCheck } from "../data/redesign-audit.js";

export const TOOL_DEFINITIONS = [
  // ── DISCOVERY (small responses) ────────────────────────────────
  {
    name: "list_skills",
    description:
      "List every design / taste skill bundled by this MCP (taste / soft / minimalist / brutalist / gpt-tasteskill / redesign / output / brandkit / stitch / imagegen-mobile / imagegen-web / image-to-code). Returns id + name + whenToUse + section ids. ~1KB. Use FIRST to discover what skills exist; then `get_skill_section` to drill in.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_primitives",
    description:
      "List every @godxjp/ui primitive / composite / shell. Returns group + tagline per entry. ~3KB. Optionally filter by group.",
    inputSchema: {
      type: "object",
      properties: {
        group: {
          type: "string",
          enum: ["general", "layout", "data-display", "data-entry", "feedback", "navigation", "composites", "shell", "providers"],
        },
      },
    },
  },
  {
    name: "list_patterns",
    description: "List every canonical code pattern (registration-form / settings-page / data-table / confirm-destructive / app-shell / filter-bar / loading-states). ~500 bytes. Use before `get_pattern`.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_anti_ai_tells",
    description:
      "List every AI-tell pattern to AVOID (organised by category: visual / layout / copy / interaction / imagery / structure). ~2KB. Use to self-audit a design before shipping.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", enum: ["visual", "layout", "copy", "interaction", "imagery", "structure"] },
      },
    },
  },
  {
    name: "list_redesign_checks",
    description:
      "List the redesign audit checklist (50+ checks across 9 categories: typography / color-surface / layout / interactivity / content / components / iconography / code-quality / omissions). ~5KB. Use when auditing an existing project.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", enum: ["typography", "color-surface", "layout", "interactivity", "content", "components", "iconography", "code-quality", "omissions"] },
      },
    },
  },

  // ── DRILL-DOWN (medium responses) ──────────────────────────────
  {
    name: "get_anti_ai_tell",
    description: "Fetch ONE anti-AI-tell — full body + concrete fix. Use after `list_anti_ai_tells`.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Exact tell name from list_anti_ai_tells." } },
      required: ["name"],
    },
  },
  {
    name: "get_redesign_check",
    description: "Fetch redesign check(s) matching a symptom snippet. Returns full fix + UI note. Use after `list_redesign_checks`.",
    inputSchema: {
      type: "object",
      properties: { symptom: { type: "string", description: "Fragment of the symptom text (e.g. 'Inter everywhere' / '100vh')." } },
      required: ["symptom"],
    },
  },
  {
    name: "get_skill_section",
    description:
      "Fetch ONE section of ONE skill — token-efficient. E.g. `skill='soft', section='double-bezel'`. Use after `list_skills` narrowed the relevant skill + section.",
    inputSchema: {
      type: "object",
      properties: {
        skill: { type: "string", description: "Skill id (e.g. 'soft', 'minimalist', 'taste')." },
        section: { type: "string", description: "Section id within that skill." },
      },
      required: ["skill", "section"],
    },
  },
  {
    name: "get_component",
    description: "Full API for one @godxjp/ui component — props, types, default, example, story + doc paths, cardinal rules. ~2KB.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Component name (e.g. 'Button', 'DataTable')." } },
      required: ["name"],
    },
  },
  {
    name: "get_pattern",
    description: "Full code snippet for one canonical pattern — copy-paste-ready.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Pattern slug (use list_patterns first)." } },
      required: ["name"],
    },
  },
  {
    name: "get_rule",
    description: "Read one cardinal rule from CLAUDE.md (by number) OR all if no number.",
    inputSchema: {
      type: "object",
      properties: { number: { type: "number", description: "Rule number (1-N)." } },
    },
  },
  {
    name: "get_vocab",
    description: "Read shared prop-vocabulary type (`SizeProp`, `StatusProp`, `ColorProp`, `LoadingProp`, etc.) OR all if no name.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Vocab type name." } },
    },
  },
  {
    name: "get_tokens",
    description: "Read design tokens, optionally filtered by category.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", enum: ["color", "spacing", "typography", "radius", "shadow", "motion", "breakpoint", "density", "z-index"] },
      },
    },
  },

  // ── TASK ROUTING (smallest response — pointer) ─────────────────
  {
    name: "route_task",
    description:
      "Natural-language task → skill+section pointer. ~300 bytes. E.g. 'I want to design a premium agency hero' → `{skill:'soft', section:'vibe-archetypes', why:'...'}`. Use FIRST when you don't know which skill applies.",
    inputSchema: {
      type: "object",
      properties: { task: { type: "string", description: "Describe what you want to build." } },
      required: ["task"],
    },
  },
  {
    name: "suggest_primitive",
    description:
      "Use case → primitive recommendation. E.g. 'confirm a destructive delete' → DangerZone pattern + Dialog suggestion.",
    inputSchema: {
      type: "object",
      properties: { use_case: { type: "string" } },
      required: ["use_case"],
    },
  },
  {
    name: "search_components",
    description: "Fuzzy-search primitives by name / tagline / prop. Returns ranked matches.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },

  // ── LINT / AUDIT (one-shot critique) ───────────────────────────
  {
    name: "lint_jsx",
    description:
      "Heuristic check of a JSX snippet for common violations — raw `<button>` / `<input>`, `color='error'` on Tag/Badge, missing aria-label, missing source.code override on stories with cell renderers (rule 34), etc.",
    inputSchema: {
      type: "object",
      properties: { jsx: { type: "string" } },
      required: ["jsx"],
    },
  },
];

export async function dispatchTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    // Discovery
    case "list_skills":          return listSkills();
    case "list_primitives":      return listPrimitives(args.group as ComponentGroup | undefined);
    case "list_patterns":        return listPatterns();
    case "list_anti_ai_tells":   return listAntiAiTells(args.category as AiTell["category"] | undefined);
    case "list_redesign_checks": return listRedesignChecks(args.category as AuditCheck["category"] | undefined);
    case "get_anti_ai_tell":     return getAntiAiTell(String(args.name ?? ""));
    case "get_redesign_check":   return getRedesignCheck(String(args.symptom ?? ""));
    // Drill-down
    case "get_skill_section":    return getSkillSection(String(args.skill ?? ""), String(args.section ?? ""));
    case "get_component":        return getComponent(String(args.name ?? ""));
    case "get_pattern":          return getPattern(String(args.name ?? ""));
    case "get_rule":             return getRule(typeof args.number === "number" ? args.number : undefined);
    case "get_vocab":            return getVocab(args.name as string | undefined);
    case "get_tokens":           return getTokens(args.category as TokenCategory | undefined);
    // Task routing
    case "route_task":           return routeTaskTool(String(args.task ?? ""));
    case "suggest_primitive":    return suggestPrimitive(String(args.use_case ?? ""));
    case "search_components":    return searchComponents(String(args.query ?? ""));
    // Lint
    case "lint_jsx":             return lintJsx(String(args.jsx ?? ""));
    default:                     return `Unknown tool: ${name}`;
  }
}

// ── implementations ───────────────────────────────────────────────

function listSkills(): string {
  let out = `# Available skills (${SKILLS.length})\n\n`;
  out += `Use \`get_skill_section skill="..." section="..."\` to drill in.\n\n`;
  for (const s of SKILLS) {
    out += `## ${s.id} — ${s.name}\n`;
    out += `**When to use:** ${s.whenToUse}\n\n`;
    out += `**Sections:** ${s.sections.map((sec) => `\`${sec.id}\``).join(", ")}\n\n`;
  }
  out += `\n_Source: ${SKILLS.map((s) => s.source).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join("; ")}, …_`;
  return out;
}

function listPrimitives(group?: ComponentGroup): string {
  const list = group ? componentsByGroup(group) : COMPONENTS;
  if (list.length === 0) return `No components${group ? ` in group "${group}"` : ""}.`;
  const grouped = list.reduce<Record<string, typeof list>>((acc, c) => {
    (acc[c.group] ??= []).push(c);
    return acc;
  }, {});
  let out = `# @godxjp/ui primitives${group ? ` — ${group}` : ""}\n\n${list.length} components.\n\n`;
  for (const [g, items] of Object.entries(grouped)) {
    out += `## ${g}\n\n`;
    for (const c of items) out += `- **${c.name}** — ${c.tagline}\n`;
    out += "\n";
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

function listAntiAiTells(cat?: AiTell["category"]): string {
  const list = cat ? aiTellsByCategory(cat) : ANTI_AI_TELLS;
  // Compact list — names only. Use `get_anti_ai_tell` for full body + fix.
  let out = `# AI tells to AVOID${cat ? ` — ${cat}` : ""} (${list.length})\n\n`;
  out += `_Compact list. Use \`get_anti_ai_tell name="<name>"\` for the full body + fix._\n\n`;
  const grouped = list.reduce<Record<string, typeof list>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});
  for (const [c, items] of Object.entries(grouped)) {
    out += `## ${c}\n`;
    for (const t of items) out += `- ${t.name}\n`;
    out += "\n";
  }
  return out;
}

function getAntiAiTell(name: string): string {
  const t = ANTI_AI_TELLS.find((x) => x.name.toLowerCase() === name.trim().toLowerCase());
  if (!t) {
    let out = `Anti-AI-tell "${name}" not found. Use \`list_anti_ai_tells\` to discover. Closest:\n\n`;
    for (const x of ANTI_AI_TELLS.slice(0, 8)) out += `- ${x.name} (${x.category})\n`;
    return out;
  }
  return `# ${t.name}\n\n**Category:** ${t.category}\n\n## Symptom\n\n${t.body}\n\n## Fix\n\n${t.fix}\n`;
}

function listRedesignChecks(cat?: AuditCheck["category"]): string {
  const list = cat ? checksByCategory(cat) : REDESIGN_CHECKS;
  // Compact list — symptoms only. Use `get_redesign_check` for the full fix + ui-note.
  let out = `# Redesign audit${cat ? ` — ${cat}` : ""} (${list.length} checks)\n\n`;
  if (!cat) {
    out += `## Fix priority\n${FIX_PRIORITY.map((p) => p).join("\n")}\n\n`;
    out += `## Rules\n${REDESIGN_RULES.map((r) => `- ${r}`).join("\n")}\n\n`;
  }
  out += `_Compact list of symptoms. Use \`get_redesign_check symptom="<text snippet>"\` for the full fix + UI note._\n\n`;
  const grouped = list.reduce<Record<string, typeof list>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});
  for (const [c, items] of Object.entries(grouped)) {
    out += `## ${c}\n`;
    for (const item of items) out += `- ${item.symptom}\n`;
    out += "\n";
  }
  return out;
}

function getRedesignCheck(snippet: string): string {
  const q = snippet.trim().toLowerCase();
  if (!q) return "Pass `symptom` — a fragment matching the audit check symptom (e.g. 'Inter everywhere' / '100vh' / 'Acme').";
  const matches = REDESIGN_CHECKS.filter(
    (c) => c.symptom.toLowerCase().includes(q) || c.fix.toLowerCase().includes(q),
  );
  if (!matches.length) {
    return `No redesign check matches "${snippet}". Use \`list_redesign_checks\` to see all.`;
  }
  let out = `# Redesign checks matching "${snippet}" (${matches.length})\n\n`;
  for (const c of matches) {
    out += `## ${c.category}\n\n**Symptom:** ${c.symptom}\n\n**Fix:** ${c.fix}\n${c.uiNote ? `\n_UI note:_ ${c.uiNote}\n` : ""}\n`;
  }
  return out;
}

function getSkillSection(skillId: string, sectionId: string): string {
  const skill = findSkill(skillId);
  if (!skill) return `Skill "${skillId}" not found. Use \`list_skills\` for available ids.`;
  if (!sectionId) {
    let out = `# ${skill.name}\n\n${skill.whenToUse}\n\n## Sections\n`;
    for (const sec of skill.sections) out += `- \`${sec.id}\` — ${sec.tagline}\n`;
    return out;
  }
  const section = findSection(skillId, sectionId);
  if (!section) {
    let out = `Section "${sectionId}" not in skill "${skillId}". Available:\n`;
    for (const sec of skill.sections) out += `- \`${sec.id}\` — ${sec.tagline}\n`;
    return out;
  }
  return `# ${skill.name} → ${section.title}\n\n${section.tagline}\n\n${section.body}\n\n_Source: ${skill.source}_`;
}

function getComponent(name: string): string {
  const c = findComponent(name);
  if (!c) return `Component "${name}" not found. Use \`list_primitives\` to discover.`;
  let out = `# ${c.name}\n\n**Group:** ${c.group}\n\n${c.tagline}\n\n## Props\n\n`;
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

function getPattern(name: string): string {
  const p = findPattern(name);
  if (!p) {
    const candidates = searchPatterns(name);
    if (candidates.length === 0) return `Pattern "${name}" not found.`;
    let out = `Pattern "${name}" not found. Closest:\n`;
    for (const c of candidates) out += `- ${c.name} — ${c.tagline}\n`;
    return out;
  }
  return `# Pattern: ${p.name}\n\n${p.tagline}\n\n**Tags:** ${p.tags.join(", ")}\n\n\`\`\`tsx\n${p.code}\n\`\`\`\n`;
}

function getRule(num?: number): string {
  if (num !== undefined) {
    const r = findRule(num);
    if (!r) return `Rule ${num} not found. Valid: 1-${CARDINAL_RULES.length}.`;
    return `# Rule ${r.number} — ${r.title}\n\n${r.body}\n`;
  }
  let out = `# Cardinal rules (${CARDINAL_RULES.length})\n\n`;
  for (const r of CARDINAL_RULES) out += `## ${r.number}. ${r.title}\n\n${r.body}\n\n`;
  return out;
}

function getVocab(name?: string): string {
  if (name) {
    const v = findVocab(name);
    if (!v) return `Vocab "${name}" not found.`;
    let out = `# ${v.name}\n\n${v.concept}\n\n`;
    out += `**Values:** ${v.values.map((x) => `\`${x}\``).join(" | ")}\n\n`;
    out += `**Used by:** ${v.usedBy.map((x) => `\`${x}\``).join(", ")}\n\n`;
    if (v.notes) out += `**Notes:** ${v.notes}\n`;
    return out;
  }
  let out = `# Prop vocabulary\n\n${PROP_VOCABULARY.length} shared types.\n\n`;
  for (const v of PROP_VOCABULARY) {
    out += `## ${v.name}\n${v.concept}\n\nValues: ${v.values.map((x) => `\`${x}\``).join(" | ")}\n\n`;
  }
  return out;
}

function getTokens(cat?: TokenCategory): string {
  const list = cat ? tokensByCategory(cat) : TOKENS;
  if (list.length === 0) return `No tokens${cat ? ` in "${cat}"` : ""}.`;
  let out = `# Design tokens${cat ? ` — ${cat}` : ""}\n\n`;
  const grouped = list.reduce<Record<string, typeof list>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});
  for (const [c, items] of Object.entries(grouped)) {
    out += `## ${c}\n\n| Name | Role | Value | Axis |\n|---|---|---|---|\n`;
    for (const t of items) out += `| \`${t.name}\` | ${t.role} | ${t.value ?? "—"} | ${t.axis ?? "—"} |\n`;
    out += "\n";
  }
  return out;
}

function routeTaskTool(task: string): string {
  if (!task.trim()) return "Describe the task (e.g. 'design a premium agency hero', 'audit existing settings page').";
  const results = routeTask(task);
  let out = `# Routing "${task}"\n\n`;
  for (const r of results) {
    out += `- **skill:** \`${r.skill}\`, **section:** \`${r.section}\`  \n  ${r.why}\n`;
    if (r.alsoSee?.length) out += `  _Also see:_ ${r.alsoSee.map((s) => `\`${s}\``).join(", ")}\n`;
  }
  out += `\nFetch with: \`get_skill_section skill="X" section="Y"\``;
  return out;
}

function suggestPrimitive(useCase: string): string {
  const q = useCase.trim().toLowerCase();
  if (!q) return "Describe your use case.";
  const suggestions: Array<{ component: string; rationale: string; score: number }> = [];
  const check = (kw: string[], component: string, rationale: string, weight = 2) => {
    if (kw.some((k) => q.includes(k))) suggestions.push({ component, rationale, score: weight });
  };
  check(["form", "submit", "validation", "register", "sign up"], "Form + FormField", "RHF + zod composition.", 5);
  check(["table", "rows", "columns"], "DataTable / Table", "DataTable for chrome (toolbar+pagination+batch). Table for slim primitive.", 5);
  check(["modal", "dialog", "confirm"], "Dialog / AlertDialog", "Radix Dialog. AlertDialog for destructive.", 4);
  check(["drawer", "side panel", "sheet"], "Sheet", "Side panel for filters/settings.", 4);
  check(["toast", "notification"], "toast / Toaster", "Sonner-backed.", 4);
  check(["loading", "saving", "spinner"], "Spinner / Form loading prop", "Spinner=active work, Skeleton=init fetch.", 3);
  check(["alert", "banner"], "Alert", "5 semantic colors × outlined/banner.", 3);
  check(["select", "dropdown"], "Select / AutoComplete", "Select=discrete options, AutoComplete=free-text+suggestions.", 3);
  check(["filter"], "Form layout='inline' + pattern 'filter-bar'", "Inline form above table.", 4);
  check(["delete", "destructive"], "Pattern 'confirm-destructive'", "Card accent='destructive' + typed-name confirm.", 4);
  if (!suggestions.length) return `No direct match for "${useCase}". Try \`list_primitives\` or \`search_components\`.`;
  suggestions.sort((a, b) => b.score - a.score);
  let out = `# Suggestions for "${useCase}"\n\n`;
  for (const s of suggestions) out += `- **${s.component}** — ${s.rationale}\n`;
  return out;
}

function searchComponents(query: string): string {
  const q = query.trim().toLowerCase();
  if (!q) return listPrimitives();
  const matches = COMPONENTS.map((c) => {
    let score = 0;
    if (c.name.toLowerCase().includes(q)) score += 5;
    if (c.tagline.toLowerCase().includes(q)) score += 2;
    if (c.props.some((p) => p.name.toLowerCase().includes(q))) score += 1;
    return { c, score };
  })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
  if (!matches.length) return `No matches for "${query}".`;
  let out = `# Search "${query}" — ${matches.length} matches\n\n`;
  for (const { c, score } of matches) out += `- **${c.name}** (${c.group}, ${score}) — ${c.tagline}\n`;
  return out;
}

function lintJsx(jsx: string): string {
  const issues: string[] = [];
  const check = (regex: RegExp, msg: string) => { if (regex.test(jsx)) issues.push(msg); };
  // Lowercase HTML tags only — React PascalCase (Button) MUST NOT match.
  check(/<button[\s>]/, "Use `<Button>` instead of raw `<button>` (rule 29).");
  check(/<input[\s>]/, "Use `<Input>` instead of raw `<input>` (rule 29).");
  check(/<select[\s>]/, "Use `<Select>` instead of raw `<select>` (rule 29).");
  check(/<textarea[\s>]/, "Use `<Textarea>` instead of raw `<textarea>` (rule 29).");
  check(/bg-(red|blue|green|yellow|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/, "Use semantic token utilities (`bg-primary`/`bg-destructive`) not raw color scales (rule 2).");
  check(/<Tag[\s\S]*?color=["']error["']/i, 'Tag `color="error"` → `"destructive"` (v5.0, PR #60).');
  check(/<Badge[\s\S]*?variant=["']error["']/i, 'Badge `variant="error"` → `"destructive"` (v5.0, PR #63).');
  check(/(Flex|Space|Grid|Masonry)[\s\S]*?(gap|size)=["']middle["']/i, '`"middle"` → `"default"` for Flex/Space/Grid/Masonry (v5.0).');
  check(/<IconButton[\s\S]*?size=["']default["']/i, 'IconButton `size="default"` → `"md"` (v5.0).');
  check(/<SegmentedControl[\s\S]*?size=["']sm["']/i, 'SegmentedControl `size="sm"` → `"small"` (v5.0).');
  check(/<PageContent[\s\S]*?padding=["'](compact|comfortable)["']/i, 'PageContent `padding="compact"/"comfortable"` → `"tight"/"cozy"` (v5.0).');
  check(/<Pagination[\s\S]*?justify=["']between["']/i, 'Pagination `justify="between"` → `"space-between"` (v5.0).');
  if (/<IconButton(?![^>]*aria-label)/i.test(jsx) && !/asChild/i.test(jsx)) {
    issues.push("`<IconButton>` should have `aria-label` (rule 6 — WCAG).");
  }
  if (/cell:\s*\(\{?\s*row\s*\}?\)\s*=>/i.test(jsx) && /export\s+const\s+\w+\s*:\s*Story/i.test(jsx)) {
    if (!/parameters[\s\S]{0,200}source[\s\S]{0,100}code:/i.test(jsx)) {
      issues.push("Stories with function-valued cell renderers MUST override `parameters.docs.source.code` (rule 34).");
    }
  }
  // Anti-AI tells
  if (/text-(red|blue|green|yellow)-\d{2,3}\b/.test(jsx)) issues.push("Hard-coded color scales — use semantic tokens. Tells AI-slop palette (rule 2 + anti-AI-tells.visual.rainbow-chip-wall).");
  if (/h-\[?100vh\]?/.test(jsx)) issues.push("`100vh` causes iOS Safari viewport jump — use `min-h-[100dvh]` (redesign.layout / soft.absolute-zero).");
  if (/className=["'][^"']*(?:shadow-md|shadow-lg|shadow-xl)["']/.test(jsx)) issues.push("Tailwind heavy shadows are an AI tell — use ultra-diffuse low-opacity (< 0.05) or tinted shadows (soft.absolute-zero, minimalist).");
  if (/Inter|Roboto|Helvetica|Open\s*Sans/i.test(jsx)) issues.push("Banned default fonts (Inter/Roboto/Helvetica/Open Sans). Use Geist/Clash Display/PP Editorial New (soft.absolute-zero, minimalist.negative-constraints).");
  if (/Acme|NovaCore|Flowbit|Quantix|VeloPay|John\s+Doe|Jane\s+Smith|Lorem\s+Ipsum/i.test(jsx)) issues.push("Generic placeholder content (Acme/NovaCore/John Doe/Lorem Ipsum). Use believable real-sounding names (anti-AI-tells.copy).");
  if (issues.length === 0) return "✅ No issues found against the heuristic checks.";
  let out = `# Lint findings — ${issues.length} issue${issues.length === 1 ? "" : "s"}\n\n`;
  for (const i of issues) out += `- ${i}\n`;
  out += `\nNote: heuristic only — not a substitute for the full CI gate.\n`;
  return out;
}

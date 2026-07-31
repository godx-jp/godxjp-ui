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
import { COMPONENT_TOKENS } from "../data/component-tokens.generated.js";
import {
  FRAME_COVERAGE,
  FRAME_COVERAGE_POLICY,
  findFrameCoverage,
  type FrameCoverageEntry,
} from "../data/frame-coverage.generated.js";
import { CARDINAL_RULES, findRule } from "../data/rules.js";
import { PATTERNS, findPattern, searchPatterns } from "../data/patterns.js";
import {
  SKILLS,
  findSkill,
  findSection,
  routeTask,
  isConsumerSkill,
} from "../data/skills-index.js";
import { ANTI_AI_TELLS, aiTellsByCategory, type AiTell } from "../data/anti-ai-tells.js";
import {
  REDESIGN_CHECKS,
  FIX_PRIORITY,
  REDESIGN_RULES,
  checksByCategory,
  type AuditCheck,
} from "../data/redesign-audit.js";
import { AUDIT_COMMAND, auditRulesByCategory, type AuditRule } from "../data/audit-rules.js";
import {
  VISUAL_AUDIT_COMMAND,
  visualRulesByCategory,
  type VisualRule,
} from "../data/visual-rules.js";
import pkg from "../../package.json";

export const TOOL_DEFINITIONS = [
  // ── DISCOVERY (small responses) ────────────────────────────────
  {
    name: "list_skills",
    description:
      "List every design/taste skill bundled by this MCP (id + name + whenToUse + section ids). Use FIRST to discover skills; then `get_skill_section` to drill in.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_primitives",
    description:
      "List every @godxjp/ui primitive/composite/shell (group + tagline per entry). Optionally filter by group. Then `get_component` for one's full API.",
    inputSchema: {
      type: "object",
      properties: {
        group: {
          type: "string",
          enum: [
            "general",
            "layout",
            "data-display",
            "data-entry",
            "feedback",
            "navigation",
            "composites",
            "shell",
            "providers",
          ],
        },
      },
    },
  },
  {
    name: "list_patterns",
    description:
      "List every canonical copy-paste code pattern (signup-form, settings-page, data-table-page, async-data-state, confirm-destructive, …); common aliases resolve too. Use before `get_pattern`.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_anti_ai_tells",
    description:
      "List every AI-tell pattern to AVOID (optionally by category). Use to self-audit a design before shipping; then `get_anti_ai_tell` for the fix.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["visual", "layout", "copy", "interaction", "imagery", "structure"],
        },
      },
    },
  },
  {
    name: "list_redesign_checks",
    description:
      "List the redesign audit checklist (50+ checks; optionally by category). Use when auditing an existing project; then `get_redesign_check` for a symptom's fix.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: [
            "typography",
            "color-surface",
            "layout",
            "interactivity",
            "content",
            "components",
            "iconography",
            "code-quality",
            "omissions",
          ],
        },
      },
    },
  },

  {
    name: "list_audit_rules",
    description:
      "List the LOCAL static ui-audit rules (scripts/ui-audit.mjs) to run BEFORE any visual review — each cites the standard it enforces (WCAG/WAI-ARIA/Intl/ISO/IANA/CSS-Logical) + a fix + the run command. Optionally by category.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["tokens", "composition", "api", "a11y", "i18n", "rtl", "copy"],
        },
      },
    },
  },

  {
    name: "list_visual_checks",
    description:
      "List the RUNTIME visual-audit checks (scripts/visual-audit.mjs — Playwright + axe-core) to run against the RUNNING app: contrast/ARIA (axe), target size, rendered-accent chroma, DOM emoji, banner layout. Needs a browser (vs list_audit_rules, static). Optionally by category.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", enum: ["a11y", "color", "i18n", "layout"] },
      },
    },
  },

  // ── DRILL-DOWN (medium responses) ──────────────────────────────
  {
    name: "get_anti_ai_tell",
    description:
      "Fetch ONE anti-AI-tell — full body + concrete fix. Use after `list_anti_ai_tells`.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Exact tell name from list_anti_ai_tells." },
      },
      required: ["name"],
    },
  },
  {
    name: "get_redesign_check",
    description:
      "Fetch redesign check(s) matching a symptom snippet. Returns full fix + UI note. Use after `list_redesign_checks`.",
    inputSchema: {
      type: "object",
      properties: {
        symptom: {
          type: "string",
          description: "Fragment of the symptom text (e.g. 'Inter everywhere' / '100vh').",
        },
      },
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
    description:
      "Full guide for one @godxjp/ui component — import path, props/types/defaults, HOW to use it (DO/DON'T), WHEN to reach for it (use cases), related components (don't reinvent/confuse), a copy-paste example, story path, and cardinal rules. Use this before hand-rolling anything. Design-token knobs are listed compactly (name+default); pass `verbose:true` for what each token controls.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Component name (e.g. 'Button', 'DataTable')." },
        verbose: {
          type: "boolean",
          description:
            "Include the full design-token table with a 'what it controls' description per token. Default false (compact token+default only) to save context.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "get_pattern",
    description: "Full code snippet for one canonical pattern — copy-paste-ready.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Pattern slug (use list_patterns first)." },
      },
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
    description:
      "Read shared prop-vocabulary type (`SizeProp`, `StatusProp`, `ColorProp`, `LoadingProp`, etc.) OR all if no name.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Vocab type name." } },
    },
  },
  {
    name: "get_tokens",
    description:
      "Read design tokens, optionally filtered by tier category (primitive / semantic / component).",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["primitive", "semantic", "component"],
        },
      },
    },
  },

  // ── CONSUMER NAMESPACE (app-dev surface — core-only skills hidden) ─
  {
    name: "list_consumer_skills",
    description:
      "List the design skills relevant to an app-dev BUILDING WITH @godxjp/ui (audience consumer/both). Hides core library-maintenance skills. START HERE if you import @godxjp/ui and want guidance (design-to-page, compose-a-screen, taste, …). Returns id + name + whenToUse + section ids.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_consumer_skill",
    description:
      "Fetch ONE section of ONE consumer-facing skill. Same as get_skill_section but refuses core-only skills (steers app-devs away from library-maintenance material). Use after list_consumer_skills / route_consumer_task.",
    inputSchema: {
      type: "object",
      properties: {
        skill: {
          type: "string",
          description: "Consumer skill id (e.g. 'design-to-page', 'compose-a-screen').",
        },
        section: { type: "string", description: "Section id within that skill." },
      },
      required: ["skill"],
    },
  },
  {
    name: "route_consumer_task",
    description:
      "Natural-language task → consumer skill+section pointer. Like route_task but only points to consumer-facing skills (never core library-maintenance). Use FIRST when you're building an app with @godxjp/ui.",
    inputSchema: {
      type: "object",
      properties: { task: { type: "string", description: "Describe what you want to build." } },
      required: ["task"],
    },
  },
  {
    name: "draft_bug_report",
    description:
      "When @godxjp/ui ITSELF is at fault (missing token, a primitive lacking the controlled-vocabulary prop, a real a11y/behaviour bug, a wrong catalog example) and you cannot follow a rule — DON'T fake a workaround. This drafts a detailed GitHub issue body + a copy-paste `gh issue create` command so you can report it. Prints the command only; never runs gh.",
    inputSchema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "One-line title of the bug / blocked rule." },
        repro: { type: "string", description: "Minimal steps or code to reproduce." },
        expected: { type: "string", description: "What SHOULD happen (per the rule/spec)." },
        actual: { type: "string", description: "What actually happens." },
        component: {
          type: "string",
          description: "Affected component name, if any (links to get_component).",
        },
        rule: {
          type: "number",
          description: "Cardinal rule number that can't be followed, if any.",
        },
        version: { type: "string", description: "Installed @godxjp/ui version (e.g. '12.1.0')." },
        env: { type: "string", description: "Environment (browser/OS/framework), if relevant." },
      },
      required: ["summary"],
    },
  },

  {
    name: "check_compatibility",
    description:
      "Report whether the @godxjp/ui version installed in the target project matches THIS catalog (which describes one release train). A mismatched minor means the props/tokens/patterns may describe a build they never installed (#140). Pass the installed version (`npm ls @godxjp/ui`); call it at the START of a consumer session.",
    inputSchema: {
      type: "object",
      properties: {
        version: {
          type: "string",
          description:
            "Installed @godxjp/ui version in the target project, e.g. '16.10.0'. Omit to just read " +
            "the catalog's own version + compatible range.",
        },
      },
    },
  },

  // ── TASK ROUTING (smallest response — pointer) ─────────────────
  {
    name: "route_task",
    description:
      "Natural-language task → skill+section pointer (e.g. 'design a premium agency hero' → soft/vibe-archetypes). Use FIRST when you don't know which skill applies.",
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

  {
    name: "get_frame_coverage",
    description:
      "Verified preview-contract coverage for a component (issue #163). Answers 'is this state actually PROVEN?' — returns, per contract dimension (variants, tones, sizes, shapes, density, controlled/uncontrolled ownership, disabled/read-only/loading/empty/error/success, async retry/cancel/offline, responsive viewport matrix, RTL, long/localized content, keyboard/focus, accessible name/description/error, reduced motion / coarse touch), whether an EXECUTED case proves it (covered), whether nothing proves it (UNTESTED), or whether it cannot exist (not-applicable, with a reason). UNTESTED IS NOT A PASS: never infer that a component supports a state because an example renders. Call this before telling a user a component 'supports' anything. Omit `name` for the repo-wide summary and the tracked known gaps.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "Public export name (e.g. 'Button', 'DataTable', 'CardFooter'). Omit for the repo-wide coverage summary.",
        },
      },
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

export async function dispatchTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    // Discovery
    case "list_skills":
      return listSkills();
    case "list_primitives":
      return listPrimitives(args.group as ComponentGroup | undefined);
    case "list_patterns":
      return listPatterns();
    case "list_anti_ai_tells":
      return listAntiAiTells(args.category as AiTell["category"] | undefined);
    case "list_redesign_checks":
      return listRedesignChecks(args.category as AuditCheck["category"] | undefined);
    case "list_audit_rules":
      return listAuditRules(args.category as AuditRule["category"] | undefined);
    case "list_visual_checks":
      return listVisualChecks(args.category as VisualRule["category"] | undefined);
    case "get_anti_ai_tell":
      return getAntiAiTell(String(args.name ?? ""));
    case "get_redesign_check":
      return getRedesignCheck(String(args.symptom ?? ""));
    // Drill-down
    case "get_skill_section":
      return getSkillSection(String(args.skill ?? ""), String(args.section ?? ""));
    case "get_component":
      return getComponent(String(args.name ?? ""), args.verbose === true);
    case "get_pattern":
      return getPattern(String(args.name ?? ""));
    case "get_rule":
      return getRule(typeof args.number === "number" ? args.number : undefined);
    case "get_vocab":
      return getVocab(args.name == null ? undefined : String(args.name));
    case "get_tokens":
      return getTokens(args.category as TokenCategory | undefined);
    // Consumer namespace
    case "list_consumer_skills":
      return listConsumerSkills();
    case "get_consumer_skill":
      return getConsumerSkill(String(args.skill ?? ""), String(args.section ?? ""));
    case "route_consumer_task":
      return routeTaskTool(String(args.task ?? ""), { consumerOnly: true });
    case "draft_bug_report":
      return draftBugReport(args);
    case "check_compatibility":
      return checkCompatibility(args.version == null ? undefined : String(args.version));
    // Task routing
    case "route_task":
      return routeTaskTool(String(args.task ?? ""));
    case "suggest_primitive":
      return suggestPrimitive(String(args.use_case ?? ""));
    case "search_components":
      return searchComponents(String(args.query ?? ""));
    case "get_frame_coverage":
      return getFrameCoverage(args.name === undefined ? undefined : String(args.name));
    // Lint
    case "lint_jsx":
      return lintJsx(String(args.jsx ?? ""));
    default:
      return `Unknown tool: ${name}`;
  }
}

// ── implementations ───────────────────────────────────────────────

function listSkills(): string {
  let out = `# Available skills (${SKILLS.length})\n\n`;
  out += `Each is tagged \`[audience]\` — \`core\` = building @godxjp/ui itself, \`consumer\` = building an app with it, \`both\`. App-devs: use \`list_consumer_skills\` to hide core material.\n\n`;
  out += `Use \`get_skill_section skill="..." section="..."\` to drill in.\n\n`;
  for (const s of SKILLS) {
    out += `## ${s.id} — ${s.name}  \`[${s.audience}]\`\n`;
    out += `**When to use:** ${s.whenToUse}\n\n`;
    out += `**Sections:** ${s.sections.map((sec) => `\`${sec.id}\``).join(", ")}\n\n`;
  }
  out += `\n_Source: ${SKILLS.map((s) => s.source)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3)
    .join("; ")}, …_`;
  return out;
}

function listConsumerSkills(): string {
  const list = SKILLS.filter(isConsumerSkill);
  let out = `# Consumer skills (${list.length}) — building an app WITH @godxjp/ui\n\n`;
  out += `Core library-maintenance skills are hidden. Drill in with \`get_consumer_skill skill="..." section="..."\`, or route a task with \`route_consumer_task\`.\n\n`;
  for (const s of list) {
    out += `## ${s.id} — ${s.name}  \`[${s.audience}]\`\n`;
    out += `**When to use:** ${s.whenToUse}\n\n`;
    out += `**Sections:** ${s.sections.map((sec) => `\`${sec.id}\``).join(", ")}\n\n`;
  }
  return out;
}

function getConsumerSkill(skillId: string, sectionId: string): string {
  const skill = findSkill(skillId);
  if (skill && !isConsumerSkill(skill)) {
    return `Skill "${skillId}" is CORE-only (building @godxjp/ui itself) and isn't served to app-devs. Use \`list_consumer_skills\` for consumer-facing guidance${
      skillId === "component-discipline"
        ? ` — the standards you need when composing/extending are folded into \`compose-a-screen/state-and-a11y\` and \`design-to-page/verify\`.`
        : `.`
    }`;
  }
  // Reuse the shared renderer; it also handles not-found + section listing.
  return getSkillSection(skillId, sectionId);
}

function draftBugReport(args: Record<string, unknown>): string {
  const get = (k: string) => {
    const v = args[k];
    return typeof v === "string" ? v.trim() : "";
  };
  const summary = get("summary");
  if (!summary) {
    return (
      "Pass at least `summary` (one-line title). For a useful report also pass `repro`, " +
      "`expected`, `actual`, and ideally `component` / `rule` / `version` / `env`. " +
      "A vague report a maintainer can't reproduce is not enough."
    );
  }
  const repro = get("repro");
  const expected = get("expected");
  const actual = get("actual");
  const component = get("component");
  const rule = typeof args.rule === "number" ? args.rule : undefined;
  const version = get("version");
  const env = get("env");

  const missing: string[] = [];
  if (!repro) missing.push("repro");
  if (!expected) missing.push("expected");
  if (!actual) missing.push("actual");

  const ph = (label: string, val: string) =>
    val ? val : `_(TODO: ${label} — required for a reproducible report)_`;

  const title = `[bug] ${summary}`;
  let body = `## Summary\n\n${summary}\n\n`;
  body += `## Affected\n\n`;
  body += component
    ? `- Component: \`${component}\` (see \`get_component name="${component}"\`)\n`
    : `- Component: _(n/a)_\n`;
  body += rule !== undefined ? `- Cardinal rule: #${rule} (see \`get_rule number=${rule}\`)\n` : "";
  body += `\n## Reproduction (minimal)\n\n${ph("repro", repro)}\n\n`;
  body += `## Expected\n\n${ph("expected", expected)}\n\n`;
  body += `## Actual\n\n${ph("actual", actual)}\n\n`;
  body += `## Environment\n\n`;
  body += `- @godxjp/ui version: ${version || "_(TODO: e.g. 12.1.0)_"}\n`;
  body += `- Env: ${env || "_(TODO: browser / OS / framework)_"}\n\n`;
  body += `## Proposed fix\n\n_(optional — what the library should do instead)_\n`;

  // Shell-safe single-quote escaping for the gh command.
  const q = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;
  const cmd = `gh issue create --repo godx-jp/godxjp-ui --label bug --title ${q(title)} --body ${q(body)}`;

  let out = `# Draft bug report\n\n`;
  if (missing.length) {
    out += `> ⚠️ Incomplete — fill ${missing.map((m) => `\`${m}\``).join(", ")} before filing (a report a maintainer can't reproduce will bounce).\n\n`;
  }
  out += `**Title:** ${title}\n\n`;
  out += `## Issue body (Markdown)\n\n${body}\n`;
  out += `## File it (copy-paste — this tool does NOT run gh)\n\n\`\`\`sh\n${cmd}\n\`\`\`\n\n`;
  out += `_Reminder: don't hand-roll a fake workaround to hide the bug — file this, then mark any minimal local workaround with \`// TODO(godxui#<n>)\`._\n`;
  return out;
}

/**
 * Compatibility verdict between the consumer's installed @godxjp/ui and THIS catalog.
 * The catalog is version-pinned to the library (issue #140): `pkg.version` is the release train and
 * `pkg.godxUiCompatibility` the minor-pinned range (e.g. "16.10.x") it faithfully describes.
 */
function checkCompatibility(installed?: string): string {
  const catalog = pkg.version;
  const range = pkg.godxUiCompatibility as string | undefined;
  const header =
    `# @godxjp/ui compatibility\n\n` +
    `- MCP / catalog version (serverInfo.version): **${catalog}**\n` +
    `- Compatible @godxjp/ui range: **${range ?? "(unset)"}**\n`;

  const v = installed?.trim();
  if (!v) {
    return (
      header +
      `\nProvide the installed version — \`check_compatibility version="16.10.0"\` — to get a ` +
      `match/mismatch verdict. Read it from the target project's ` +
      `\`node_modules/@godxjp/ui/package.json\` or \`npm ls @godxjp/ui\`.\n`
    );
  }

  const parse = (s: string) => {
    const m = /^(\d+)\.(\d+)\.(\d+)/.exec(s);
    return m ? { major: m[1], minor: m[2] } : null;
  };
  const rangeMinor = range ? /^(\d+)\.(\d+)\.x$/.exec(range) : null;
  const iv = parse(v);

  if (!iv || (range && !rangeMinor)) {
    return (
      header +
      `\n⚠️ Could not compare — installed="${v}" is not a plain x.y.z version, or the catalog range ` +
      `is malformed. Verify with \`npm ls @godxjp/ui\`.\n`
    );
  }

  const matches = rangeMinor
    ? iv.major === rangeMinor[1] && iv.minor === rangeMinor[2]
    : v === catalog;

  if (matches) {
    return (
      header +
      `\n✅ In lockstep — installed @godxjp/ui@${v} is described by this catalog. Prop / token / ` +
      `pattern guidance is safe to trust.\n`
    );
  }
  return (
    header +
    `\n🔴 MISMATCH — the target project runs @godxjp/ui@${v}, but this catalog describes ${range ?? catalog}. ` +
    `Props, defaults, tokens, and patterns it returns may not match the installed build. ` +
    `Align them before trusting output:\n` +
    `- upgrade the app: \`npm i @godxjp/ui@${catalog}\`, or\n` +
    `- point your agent at the matching MCP release: \`@godxjp/ui-mcp@${iv.major}.${iv.minor}\` (same minor as the app).\n`
  );
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

function listVisualChecks(cat?: VisualRule["category"]): string {
  const list = visualRulesByCategory(cat);
  let out = `# Runtime visual-audit checks${cat ? ` — ${cat}` : ""} (${list.length})\n\n`;
  out += `_Run against the RUNNING app BEFORE a visual review (warnings, non-blocking). Needs a browser._\n`;
  out += `\`\`\`\n${VISUAL_AUDIT_COMMAND}\n\`\`\`\n\n`;
  out += `_Static \`list_audit_rules\` first (cheap, every save) → THIS (before review) → human eyes for taste._\n\n`;
  for (const r of list) {
    out += `- **${r.id}** (${r.severity}, ${r.category}) — _${r.standard}_\n  ${r.fix}\n`;
  }
  return out;
}

function listAuditRules(cat?: AuditRule["category"]): string {
  const list = auditRulesByCategory(cat);
  let out = `# Local UI-audit rules${cat ? ` — ${cat}` : ""} (${list.length})\n\n`;
  out += `_Run BEFORE any visual review (warnings are agent guidance, non-blocking):_\n`;
  out += `\`\`\`\n${AUDIT_COMMAND}\n\`\`\`\n\n`;
  const grouped = list.reduce<Record<string, AuditRule[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});
  for (const [c, items] of Object.entries(grouped)) {
    out += `## ${c}\n`;
    for (const r of items) {
      out += `- **${r.id}** (${r.severity})${r.standard ? ` — _${r.standard}_` : ""}\n  ${r.fix}\n`;
    }
    out += "\n";
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
  if (!q)
    return "Pass `symptom` — a fragment matching the audit check symptom (e.g. 'Inter everywhere' / '100vh' / 'Acme').";
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

/**
 * Token-name prefixes a component exposes as theme knobs. Defaults to the
 * kebab-cased component name; overrides cover the irregular cases (shared
 * `--control-*` sizing, DataTable→table, the shell parts, etc.).
 */
const TOKEN_PREFIXES: Record<string, string[]> = {
  Badge: ["badge"],
  Button: ["button"],
  Toggle: ["toggle"],
  TagInput: ["tag-input"],
  Card: ["card"],
  StatCard: ["stat-card"],
  Table: ["table"],
  DataTable: ["table"],
  Dialog: ["dialog"],
  AlertDialog: ["dialog"],
  Sheet: ["dialog"],
  Drawer: ["dialog"],
  Alert: ["alert"],
  EmptyState: ["empty-state"],
  Skeleton: ["skeleton"],
  Pagination: ["pagination"],
  Toolbar: ["filter"],
  Breadcrumb: ["breadcrumb"],
  Menubar: ["menubar"],
  Progress: ["progress"],
  TreeSelect: ["tree"],
  Timeline: ["timeline"],
  PasswordStrength: ["password-strength"],
  PasswordInput: ["password-strength"],
  Checkbox: ["checkbox"],
  Switch: ["switch"],
  Slider: ["slider"],
  ColorPicker: ["color-picker"],
  Command: ["command"],
  Radio: ["choice"],
  RadioGroup: ["choice"],
  Field: ["choice"],
  // `app-shell` was missing, so get_component AppShell never surfaced its OWN knobs —
  // --app-shell-{sidebar,rail}-width, -bar-height/-inset/-gap, -mobile-nav-* (gh#213).
  AppShell: ["app-shell", "sidebar", "topbar"],
  Sidebar: ["sidebar"],
  Topbar: ["topbar"],
  Form: ["form"],
  FormField: ["form"],
  // Shared control sizing/typography — every plain control reads these.
  Input: ["control"],
  Textarea: ["control"],
  NumberInput: ["control"],
  Select: ["control", "search-input"],
  Cascader: ["control"],
  DatePicker: ["control"],
  TimePicker: ["control"],
  InputOTP: ["control"],
};

function componentTokensFor(name: string) {
  const prefixes = TOKEN_PREFIXES[name] ?? [
    name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  ];
  return COMPONENT_TOKENS.filter((t) => prefixes.some((p) => t.name.startsWith(`--${p}-`)));
}

function getComponent(name: string, verbose = false): string {
  const c = findComponent(name);
  if (!c) return `Component "${name}" not found. Use \`list_primitives\` to discover.`;
  let out = `# ${c.name}\n\n**Group:** ${c.group}`;
  const importPath = c.importPath ?? `@godxjp/ui/${c.group === "providers" ? "app" : c.group}`;
  out += `  ·  **Import:** \`import { ${c.name} } from "${importPath}"\`\n\n`;
  if (c.deprecated) {
    out += `> ⚠️ **DEPRECATED.** Kept catalogued so you're steered to the replacement — see the tagline / Related below. Do not use in new code.\n\n`;
  }
  out += `${c.tagline}\n\n## Props\n\n`;
  out += `| Name | Type | Required | Default | Description |\n|---|---|---|---|---|\n`;
  for (const p of c.props) {
    out += `| \`${p.name}\` | \`${p.type}\` | ${p.required ? "✓" : ""} | ${p.defaultValue ? `\`${p.defaultValue}\`` : ""} | ${p.description} |\n`;
  }
  const tokens = componentTokensFor(c.name);
  if (tokens.length) {
    out += `\n## Design tokens (theme knobs)\n\nOverride these in a service \`theme.css\` to re-tune ONLY this component (never hard-code or fork CSS — rules #44/#45/#46):\n\n`;
    if (verbose) {
      // Full table với "what it controls" — chỉ khi verbose (cột mô tả lặp nhiều, tốn token).
      out += `| Token | Default | What it controls |\n|---|---|---|\n`;
      for (const t of tokens) out += `| \`${t.name}\` | \`${t.value}\` | ${t.description} |\n`;
    } else {
      // Compact mặc định: token + default (bỏ cột mô tả) → đủ để biết knob nào có + giá trị.
      out += `| Token | Default |\n|---|---|\n`;
      for (const t of tokens) out += `| \`${t.name}\` | \`${t.value}\` |\n`;
      out += `\n_${tokens.length} knob${tokens.length > 1 ? "s" : ""}. Gọi \`get_component name="${c.name}" verbose=true\` để xem mỗi token điều khiển gì._\n`;
    }
  }
  if (c.usage && c.usage.length) {
    out += `\n## How to use it\n\n`;
    for (const u of c.usage) out += `- ${u}\n`;
  }
  if (c.useCases && c.useCases.length) {
    out += `\n## When to reach for it (use cases)\n\n`;
    for (const u of c.useCases) out += `- ${u}\n`;
  }
  out += `\n## Example\n\n\`\`\`tsx\n${c.example}\n\`\`\`\n\n`;
  // The example above is ONE hand-picked happy path. Issue #163 item 7: the catalogue must
  // state which contract dimensions are actually proven, so the example is never mistaken for
  // a support claim.
  out += coverageBlock(findFrameCoverage(c.name), c.name);
  if (c.related && c.related.length) {
    out += `## Related — don't confuse / don't reinvent\n\n`;
    for (const r of c.related) out += `- ${r}\n`;
    out += `\n`;
  }
  if (c.docPath) out += `**Reference doc:** \`docs/reference/${c.docPath}\`\n\n`;
  out += `**Storybook:** \`src/stories/${c.storyPath}\`\n\n`;
  if (c.rules.length) {
    out += `**Cardinal rules:**\n`;
    for (const n of c.rules) {
      const rule = findRule(n);
      out += rule ? `- #${n} — ${rule.title}\n` : `- #${n}\n`;
    }
  }
  return out;
}

const DIMENSION_TITLE = new Map(
  FRAME_COVERAGE_POLICY.dimensions.map((d) => [d.id as string, d.title as string]),
);

/**
 * Coverage block appended to `get_component` (issue #163 item 7). The whole point is that an
 * agent reading a happy-path example must ALSO see which contract dimensions nothing proves —
 * otherwise the example gets mistaken for a support claim.
 */
function coverageBlock(entry: FrameCoverageEntry | undefined, name: string): string {
  if (!entry) {
    return (
      `\n## Verified contract coverage (issue #163)\n\n` +
      `**UNTESTED.** \`${name}\` has no entry in the frame-coverage ledger, so NOTHING about its ` +
      `props, states, responsive behaviour, RTL, keyboard or async lifecycle is proven by an ` +
      `executed case. Treat the example above as an illustration, never as evidence of support.\n\n`
    );
  }
  const label = (ids: readonly string[]) =>
    ids.map((id) => DIMENSION_TITLE.get(id) ?? id).join(", ");
  let out = `\n## Verified contract coverage (issue #163)\n\n`;
  out += `> ${FRAME_COVERAGE_POLICY.warning}\n\n`;
  out += entry.frame
    ? `Frame: \`${entry.frame}\`\n\n`
    : `**No \`/frame/**\` route exists for this export yet.**\n\n`;
  out += entry.covered.length
    ? `- ✅ **covered** (an executed case proves it): ${label(entry.covered)}\n`
    : `- ✅ **covered:** none\n`;
  out += entry.untested.length
    ? `- ⚠️ **UNTESTED — not a pass, no executed case:** ${label(entry.untested)}\n`
    : `- ⚠️ **UNTESTED:** none\n`;
  if (entry.notApplicable.length) {
    out += `- ➖ **not applicable** (no such axis in this export's public API): ${label(entry.notApplicable)}\n`;
  }
  const gaps = FRAME_COVERAGE_POLICY.knownGaps.filter((gap) =>
    (gap.targets as readonly string[]).includes(entry.name),
  );
  for (const gap of gaps) {
    out += `- 🔎 **tracked known gap** \`${gap.id}\`: ${(gap.cases as readonly string[]).join(" · ")}\n`;
  }
  out += `\nSee \`preview/frame-coverage.ledger.json\` and \`docs/FRAME-COVERAGE-LEDGER.md\` for the written reason behind every cell.\n\n`;
  return out;
}

function getFrameCoverage(name?: string): string {
  const t = FRAME_COVERAGE_POLICY.totals;
  if (!name || !name.trim()) {
    let out = `# Preview contract coverage (issue #163)\n\n`;
    out += `> ${FRAME_COVERAGE_POLICY.warning}\n\n`;
    out += `- Public exports tracked: **${t.exports}** (${t.exportsWithoutFrame} with no frame at all)\n`;
    out += `- Dimension cells: **${t.dimensionCells}** — ✅ ${t.covered} covered · ⚠️ ${t.untested} UNTESTED · ➖ ${t.notApplicable} reasoned not-applicable\n`;
    out += `- Required viewport matrix: ${FRAME_COVERAGE_POLICY.requiredViewports.join(", ")} (container widths ${FRAME_COVERAGE_POLICY.containerWidths.join(", ")})\n`;
    out += `- Ledger recorded: ${FRAME_COVERAGE_POLICY.recordedAt} · \`${FRAME_COVERAGE_POLICY.ledger}\`\n\n`;
    out += `## Contract dimensions\n\n`;
    for (const d of FRAME_COVERAGE_POLICY.dimensions) out += `- \`${d.id}\` — ${d.title}\n`;
    out += `\n## Tracked known gaps\n\n`;
    for (const gap of FRAME_COVERAGE_POLICY.knownGaps) {
      out += `- \`${gap.id}\` — ${(gap.targets as readonly string[]).join(", ")}: ${(gap.cases as readonly string[]).join(" · ")}\n`;
    }
    out += `\nCall \`get_frame_coverage name="Button"\` for one export. **Never** report a dimension as supported because an example renders it.\n`;
    return out;
  }
  const entry = findFrameCoverage(name);
  if (!entry) {
    const near = FRAME_COVERAGE.filter((candidate) =>
      candidate.name.toLowerCase().includes(name.trim().toLowerCase()),
    )
      .slice(0, 8)
      .map((candidate) => candidate.name);
    return (
      `No frame-coverage entry for "${name}" — its contract is **UNTESTED** by definition.\n` +
      (near.length ? `Did you mean: ${near.join(", ")}?\n` : "") +
      `Call \`get_frame_coverage\` with no name for the repo-wide summary.\n`
    );
  }
  return `# ${entry.name} — contract coverage\n\n**Group:** ${entry.group}\n${coverageBlock(entry, entry.name)}`;
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
    out += `## ${c}\n\n| Name | Role | Tier |\n|---|---|---|\n`;
    for (const t of items) out += `| \`${t.name}\` | ${t.role} | ${t.tier} |\n`;
    out += "\n";
  }
  return out;
}

function routeTaskTool(task: string, opts?: { consumerOnly?: boolean }): string {
  if (!task.trim())
    return "Describe the task (e.g. 'design a premium agency hero', 'audit existing settings page').";
  const results = routeTask(task, opts);
  let out = `# Routing "${task}"${opts?.consumerOnly ? " (consumer)" : ""}\n\n`;
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
  check(
    ["form", "submit", "validation", "register", "sign up"],
    "Form + FormField",
    "RHF + zod composition.",
    5,
  );
  check(
    ["table", "rows", "columns"],
    "DataTable / Table",
    "DataTable for chrome (toolbar+pagination+batch). Table for slim primitive.",
    5,
  );
  check(
    ["modal", "dialog", "confirm"],
    "Dialog / AlertDialog",
    "Radix Dialog. AlertDialog for destructive.",
    4,
  );
  check(["drawer", "side panel", "sheet"], "Sheet", "Side panel for filters/settings.", 4);
  check(["toast", "notification"], "toast / Toaster", "Sonner-backed.", 4);
  check(
    ["loading", "saving", "spinner"],
    "Spinner / Form loading prop",
    "Spinner=active work, Skeleton=init fetch.",
    3,
  );
  check(["alert", "banner"], "Alert", "5 semantic colors × outlined/banner.", 3);
  check(
    ["select", "dropdown"],
    "Select / AutoComplete",
    "Select=discrete options, AutoComplete=free-text+suggestions.",
    3,
  );
  check(
    ["filter"],
    "Toolbar/ToolbarGroup + pattern 'filter-bar' (→ data-table-page)",
    "Standalone Toolbar filter bar above a table; see the data-table-page pattern.",
    4,
  );
  check(
    ["delete", "destructive"],
    "Pattern 'confirm-destructive'",
    "Card accent='destructive' + typed-name confirm.",
    4,
  );
  if (!suggestions.length)
    return `No direct match for "${useCase}". Try \`list_primitives\` or \`search_components\`.`;
  suggestions.sort((a, b) => b.score - a.score);
  let out = `# Suggestions for "${useCase}"\n\n`;
  for (const s of suggestions) out += `- **${s.component}** — ${s.rationale}\n`;
  return out;
}

function searchComponents(query: string): string {
  const q = query.trim().toLowerCase();
  if (!q) return listPrimitives();
  // Tokenize → khớp theo TỪNG từ (query nhiều từ như "async searchable select" trước đây
  // khớp cả cụm liền nên hiếm trúng). Bỏ token quá ngắn (nhiễu). Ghi điểm qua nhiều
  // trường — quan trọng nhất: name/tagline + useCases (người dùng search theo Ý ĐỊNH, vd
  // "confirm delete" / "date range"), rồi usage/related/group/props.
  const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
  const terms = tokens.length ? tokens : [q];
  const matches = COMPONENTS.map((c) => {
    const name = c.name.toLowerCase();
    const tagline = c.tagline.toLowerCase();
    const useCases = (c.useCases ?? []).join(" ").toLowerCase();
    const usage = (c.usage ?? []).join(" ").toLowerCase();
    const related = (c.related ?? []).join(" ").toLowerCase();
    const props = c.props.map((p) => p.name.toLowerCase());
    let score = 0;
    if (name === q) score += 100; // exact-name → luôn lên đầu
    for (const t of terms) {
      if (name.includes(t)) score += 5;
      if (tagline.includes(t)) score += 3;
      if (useCases.includes(t)) score += 2;
      if (usage.includes(t)) score += 1;
      if (related.includes(t)) score += 1;
      if (c.group.includes(t)) score += 1;
      if (props.some((p) => p.includes(t))) score += 1;
    }
    return { c, score };
  })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
  if (!matches.length)
    return `No matches for "${query}". Try \`list_primitives\` or a broader term (e.g. a use-case word like "date", "select", "confirm").`;
  let out = `# Search "${query}" — ${matches.length} match${matches.length > 1 ? "es" : ""}\n\n`;
  for (const { c, score } of matches)
    out += `- **${c.name}** (${c.group}, ${score}) — ${c.tagline}\n`;
  return out;
}

function lintJsx(jsx: string): string {
  const issues: string[] = [];
  const check = (regex: RegExp, msg: string) => {
    if (regex.test(jsx)) issues.push(msg);
  };
  // Lowercase HTML tags only — React PascalCase (Button) MUST NOT match.
  check(/<button[\s>]/, "Use `<Button>` instead of raw `<button>` (rule 29).");
  check(/<input[\s>]/, "Use `<Input>` instead of raw `<input>` (rule 29).");
  check(/<select[\s>]/, "Use `<Select>` instead of raw `<select>` (rule 29).");
  check(/<textarea[\s>]/, "Use `<Textarea>` instead of raw `<textarea>` (rule 29).");
  check(
    /<(table|thead|tbody)[\s>]/,
    "Use `<DataTable>` instead of a hand-rolled `<table>` (rule 29).",
  );
  check(
    /bg-(red|blue|green|yellow|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
    "Use semantic token utilities (`bg-primary`/`bg-destructive`) not raw color scales (rule 2).",
  );
  check(
    /\b(?:ml|mr|pl|pr|left|right)-(?:\d|\[|auto|px|full|screen)|\b(?:rounded-[lr]|border-[lr]|text-(?:left|right))\b/,
    "Physical direction class — use logical CSS (`ms-/me-`, `ps-/pe-`, `start-/end-`, `rounded-s/e`, `text-start/end`) so the UI flips correctly under RTL (rule: logical CSS).",
  );
  check(
    /size=["']default["']/,
    '`size="default"` is not in the controlled vocabulary — use `size` ∈ xs|sm|md|lg.',
  );
  check(
    /\btext-\[[0-9.]+px\]/,
    "Arbitrary text size `text-[Npx]` bypasses the golden type scale — use `<Text size>` / `<Heading level>` (rule 42).",
  );
  check(
    /<Tag[\s\S]*?color=["']error["']/i,
    'Tag `color="error"` → `"destructive"` (v5.0, PR #60).',
  );
  check(
    /<Badge[\s\S]*?variant=["']error["']/i,
    'Badge `variant="error"` → `"destructive"` (v5.0, PR #63).',
  );
  check(
    /(Flex|Space|Grid|Masonry)[\s\S]*?(gap|size)=["']middle["']/i,
    '`"middle"` → `"default"` for Flex/Space/Grid/Masonry (v5.0).',
  );
  check(/<IconButton[\s\S]*?size=["']default["']/i, 'IconButton `size="default"` → `"md"` (v5.0).');
  check(
    /<SegmentedControl[\s\S]*?size=["']sm["']/i,
    'SegmentedControl `size="sm"` → `"small"` (v5.0).',
  );
  check(
    /<PageContent[\s\S]*?padding=["'](compact|comfortable)["']/i,
    'PageContent `padding="compact"/"comfortable"` → `"tight"/"cozy"` (v5.0).',
  );
  check(
    /<Pagination[\s\S]*?justify=["']between["']/i,
    'Pagination `justify="between"` → `"space-between"` (v5.0).',
  );
  if (/<IconButton(?![^>]*aria-label)/i.test(jsx) && !/asChild/i.test(jsx)) {
    issues.push("`<IconButton>` should have `aria-label` (rule 6 — WCAG).");
  }
  if (
    /cell:\s*\(\{?\s*row\s*\}?\)\s*=>/i.test(jsx) &&
    /export\s+const\s+\w+\s*:\s*Story/i.test(jsx)
  ) {
    if (!/parameters[\s\S]{0,200}source[\s\S]{0,100}code:/i.test(jsx)) {
      issues.push(
        "Stories with function-valued cell renderers MUST override `parameters.docs.source.code` (rule 34).",
      );
    }
  }
  // Anti-AI tells
  if (/text-(red|blue|green|yellow)-\d{2,3}\b/.test(jsx))
    issues.push(
      "Hard-coded color scales — use semantic tokens. Tells AI-slop palette (rule 2 + anti-AI-tells.visual.rainbow-chip-wall).",
    );
  if (/h-\[?100vh\]?/.test(jsx))
    issues.push(
      "`100vh` causes iOS Safari viewport jump — use `min-h-[100dvh]` (redesign.layout / soft.absolute-zero).",
    );
  if (/className=["'][^"']*(?:shadow-md|shadow-lg|shadow-xl)["']/.test(jsx))
    issues.push(
      "Tailwind heavy shadows are an AI tell — use ultra-diffuse low-opacity (< 0.05) or tinted shadows (soft.absolute-zero, minimalist).",
    );
  if (/\b(?:Inter|Roboto|Helvetica|Open\s+Sans)\b/i.test(jsx))
    issues.push(
      "Banned default fonts (Inter/Roboto/Helvetica/Open Sans). Use Geist/Clash Display/PP Editorial New (soft.absolute-zero, minimalist.negative-constraints).",
    );
  if (/Acme|NovaCore|Flowbit|Quantix|VeloPay|John\s+Doe|Jane\s+Smith|Lorem\s+Ipsum/i.test(jsx))
    issues.push(
      "Generic placeholder content (Acme/NovaCore/John Doe/Lorem Ipsum). Use believable real-sounding names (anti-AI-tells.copy).",
    );
  if (issues.length === 0) return "✅ No issues found against the heuristic checks.";
  let out = `# Lint findings — ${issues.length} issue${issues.length === 1 ? "" : "s"}\n\n`;
  for (const i of issues) out += `- ${i}\n`;
  out += `\nNote: heuristic only — not a substitute for the full CI gate.\n`;
  return out;
}

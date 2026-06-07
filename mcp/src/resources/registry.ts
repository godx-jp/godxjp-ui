/**
 * Resource registry — exposes catalogs as MCP resources so agents
 * can discover + browse them without invoking tools.
 *
 *   godx-ui://components            — full component catalog (JSON)
 *   godx-ui://components/{name}     — single component (Markdown)
 *   godx-ui://prop-vocabulary       — full vocab (JSON)
 *   godx-ui://tokens                — all tokens (JSON)
 *   godx-ui://tokens/{category}     — tokens in category (JSON)
 *   godx-ui://rules                 — all cardinal rules (Markdown)
 *   godx-ui://rules/{number}        — single rule (Markdown)
 *   godx-ui://patterns              — pattern catalog (JSON)
 *   godx-ui://patterns/{name}       — single pattern (Markdown)
 */

import { COMPONENTS, findComponent } from "../data/components.js";
import { PROP_VOCABULARY } from "../data/prop-vocabulary.js";
import { TOKENS, tokensByCategory, type TokenCategory } from "../data/tokens.js";
import { CARDINAL_RULES, findRule } from "../data/rules.js";
import { PATTERNS, findPattern } from "../data/patterns.js";

const RULE_COUNT = CARDINAL_RULES.length;

export const RESOURCE_DEFINITIONS = [
  {
    uri: "godx-ui://components",
    name: "All components",
    description: "Full component catalog as JSON — name, group, tagline, props, example, rules.",
    mimeType: "application/json",
  },
  {
    uri: "godx-ui://prop-vocabulary",
    name: "Shared prop vocabulary",
    description:
      "Cross-cutting prop types (SizeProp, StatusProp, ColorProp, LoadingProp, …) as JSON.",
    mimeType: "application/json",
  },
  {
    uri: "godx-ui://tokens",
    name: "All design tokens",
    description: "Every CSS variable + role + value + axis as JSON.",
    mimeType: "application/json",
  },
  {
    uri: "godx-ui://rules",
    name: `Cardinal rules (${RULE_COUNT})`,
    description: `The ${RULE_COUNT} binding rules from CLAUDE.md as Markdown.`,
    mimeType: "text/markdown",
  },
  {
    uri: "godx-ui://patterns",
    name: "Code patterns",
    description:
      "Canonical pattern catalog (registration-form, settings-page, data-table, …) as JSON.",
    mimeType: "application/json",
  },
];

export async function readResource(uri: string): Promise<string> {
  // godx-ui://components
  if (uri === "godx-ui://components") {
    return JSON.stringify(COMPONENTS, null, 2);
  }
  // godx-ui://components/{name}
  if (uri.startsWith("godx-ui://components/")) {
    const name = uri.slice("godx-ui://components/".length);
    const c = findComponent(name);
    if (!c) throw new Error(`Component not found: ${name}`);
    return formatComponentMarkdown(c);
  }

  if (uri === "godx-ui://prop-vocabulary") {
    return JSON.stringify(PROP_VOCABULARY, null, 2);
  }

  if (uri === "godx-ui://tokens") {
    return JSON.stringify(TOKENS, null, 2);
  }
  if (uri.startsWith("godx-ui://tokens/")) {
    const cat = uri.slice("godx-ui://tokens/".length) as TokenCategory;
    return JSON.stringify(tokensByCategory(cat), null, 2);
  }

  if (uri === "godx-ui://rules") {
    let out = `# Cardinal rules (${CARDINAL_RULES.length})\n\n`;
    for (const r of CARDINAL_RULES) {
      out += `## ${r.number}. ${r.title}\n\n${r.body}\n\n`;
    }
    return out;
  }
  if (uri.startsWith("godx-ui://rules/")) {
    const num = Number(uri.slice("godx-ui://rules/".length));
    const r = findRule(num);
    if (!r) throw new Error(`Rule not found: ${num}`);
    return `# Rule ${r.number} — ${r.title}\n\n${r.body}\n`;
  }

  if (uri === "godx-ui://patterns") {
    return JSON.stringify(
      PATTERNS.map(({ name, tagline, tags }) => ({ name, tagline, tags })),
      null,
      2,
    );
  }
  if (uri.startsWith("godx-ui://patterns/")) {
    const name = uri.slice("godx-ui://patterns/".length);
    const p = findPattern(name);
    if (!p) throw new Error(`Pattern not found: ${name}`);
    return `# ${p.name}\n\n${p.tagline}\n\n**Tags:** ${p.tags.join(", ")}\n\n\`\`\`tsx\n${p.code}\n\`\`\`\n`;
  }

  throw new Error(`Unknown resource: ${uri}`);
}

function formatComponentMarkdown(c: ReturnType<typeof findComponent> & object): string {
  let out = `# ${c.name}\n\n**Group:** ${c.group}\n\n${c.tagline}\n\n`;
  out += `## Props\n\n`;
  out += `| Name | Type | Required | Default | Description |\n|---|---|---|---|---|\n`;
  for (const p of c.props) {
    out += `| \`${p.name}\` | \`${p.type}\` | ${p.required ? "✓" : ""} | ${p.defaultValue ? `\`${p.defaultValue}\`` : ""} | ${p.description} |\n`;
  }
  out += `\n## Example\n\n\`\`\`tsx\n${c.example}\n\`\`\`\n`;
  return out;
}

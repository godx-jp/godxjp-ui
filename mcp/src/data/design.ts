/**
 * DESIGN.md as MCP data (gh#1294 A). The text is embedded by scripts/gen-agent-catalog.mjs into
 * `design.generated.ts`, because the MCP package ships `dist/` only and cannot read the repo.
 */
import { DESIGN_MD } from "./design.generated.js";

export interface DesignSection {
  /** Slug of the heading: "colors", "admin-screen-anatomy", … The front matter is "tokens". */
  id: string;
  title: string;
  /** The section's Markdown, heading included. */
  body: string;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Split DESIGN.md into the YAML front matter ("tokens") and one entry per `## ` heading. */
export function designSections(md: string = DESIGN_MD): DesignSection[] {
  const sections: DesignSection[] = [];
  let rest = md;
  const front = /^---\n[\s\S]*?\n---\n/.exec(md);
  if (front) {
    sections.push({ id: "tokens", title: "Tokens (YAML front matter)", body: front[0].trim() });
    rest = md.slice(front[0].length);
  }
  for (const chunk of rest.split(/^(?=## )/m)) {
    const m = /^## (.+)$/m.exec(chunk);
    if (!m || !chunk.startsWith("## ")) continue;
    sections.push({ id: slug(m[1]), title: m[1].trim(), body: chunk.trim() });
  }
  return sections;
}

export function findDesignSection(query: string): DesignSection | undefined {
  const q = slug(query);
  if (!q) return undefined;
  const all = designSections();
  return (
    all.find((s) => s.id === q) ??
    all.find((s) => s.id.startsWith(q)) ??
    all.find((s) => s.id.split("-").includes(q))
  );
}

/** One `### <heading>` subsection of "Admin Screen Anatomy", heading included. */
export function anatomySubsection(heading: string): string | undefined {
  const anatomy = designSections().find((s) => s.id === "admin-screen-anatomy");
  if (!anatomy) return undefined;
  for (const chunk of anatomy.body.split(/^(?=### )/m)) {
    const m = /^### (.+)$/m.exec(chunk);
    if (m && m[1].trim().toLowerCase() === heading.trim().toLowerCase()) return chunk.trim();
  }
  return undefined;
}

export { DESIGN_MD };

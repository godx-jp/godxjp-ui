import { defaultSchema } from "rehype-sanitize";
import type { Options as SanitizeSchema } from "rehype-sanitize";

/**
 * THE ONE SANITISER SCHEMA (gh#1108). godx-task and godx-content each carried their own copy of
 * this; every consumer now renders through this one, so a policy change happens once.
 *
 * Built on `rehype-sanitize`'s `defaultSchema` (GitHub's), with three deliberate changes:
 *
 * - `clobberPrefix: ""`. The default re-prefixes every `id`, but remark-gfm already writes footnote
 *   ids and their `href`s as a matched `user-content-` pair, so the second prefix split the pair and
 *   footnote links went nowhere (measured in godx-task). The clobber exists to stop a body minting
 *   an id that collides with the host's; this renderer never parses raw HTML (no `rehype-raw`), so
 *   the only ids in the tree are the ones the pipeline generated. `raw-html.test` pins that.
 * - `protocols`: links and images allow only `http`, `https`, `mailto` (links) and relative URLs.
 *   `javascript:`, `data:`, `vbscript:` and every other scheme are dropped.
 * - Task-list checkboxes stay `disabled` (the default): ticking one would be a write to the body.
 *
 * Hosts extend it with `extendSchema`, never by editing a copy.
 */
export const markdownSchema: SanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: "",
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
    src: ["http", "https"],
    cite: ["http", "https"],
  },
  attributes: {
    ...defaultSchema.attributes,
    // Heading anchors (rehype-headings, below) and the code fence language.
    h1: [...(defaultSchema.attributes?.h1 ?? []), "id"],
    h2: [...(defaultSchema.attributes?.h2 ?? []), "id"],
    h3: [...(defaultSchema.attributes?.h3 ?? []), "id"],
    h4: [...(defaultSchema.attributes?.h4 ?? []), "id"],
    h5: [...(defaultSchema.attributes?.h5 ?? []), "id"],
    h6: [...(defaultSchema.attributes?.h6 ?? []), "id"],
  },
};

/** Extra tags / attributes a host needs (a callout marker, a section element). Additive only. */
export type SchemaExtension = {
  tagNames?: string[];
  attributes?: Record<string, NonNullable<SanitizeSchema["attributes"]>[string]>;
};

type AttributeRule = NonNullable<SanitizeSchema["attributes"]>[string][number];

/** `["className", …]` → "className"; a bare `"id"` → "id". */
const ruleName = (rule: AttributeRule) => (Array.isArray(rule) ? rule[0] : rule);

/**
 * The schema plus a host's additions. ADDITIVE: an extension can allow a tag or an attribute, never
 * widen `protocols` or bring raw HTML back, so a consumer cannot loosen the URL policy by accident.
 *
 * A rule for an attribute the base ALREADY constrains is MERGED into that rule (gh#1116): the
 * sanitiser reads the first rule it finds for an attribute, so appending `["className",
 * "math-inline"]` beside the default `["className", /^language-./]` was silently ignored and the
 * formula class stripped. Merged, it is one rule allowing both. An attribute the base allows with
 * no value constraint stays unconstrained.
 */
export function extendSchema(extension: SchemaExtension = {}): SanitizeSchema {
  const attributes = { ...markdownSchema.attributes };
  for (const [tag, list] of Object.entries(extension.attributes ?? {})) {
    const merged: AttributeRule[] = [...(attributes[tag] ?? [])];
    for (const rule of list) {
      const name = ruleName(rule);
      const at = merged.findIndex((existing) => ruleName(existing) === name);
      if (at === -1) {
        merged.push(rule);
        continue;
      }
      const existing = merged[at]!;
      // A bare name already allows every value; a bare name added over a constrained rule widens
      // it to every value, which is what the host asked for.
      if (!Array.isArray(existing)) continue;
      merged[at] = Array.isArray(rule)
        ? ([name, ...existing.slice(1), ...rule.slice(1)] as AttributeRule)
        : rule;
    }
    attributes[tag] = merged;
  }
  return {
    ...markdownSchema,
    tagNames: [...(markdownSchema.tagNames ?? []), ...(extension.tagNames ?? [])],
    attributes,
  };
}

const SAFE_HREF = /^(https?:|mailto:)/i;
const SAFE_SRC = /^https?:/i;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * react-markdown's `urlTransform`, with the same allow-list as the schema, so a URL is checked
 * where it is written as well as where it is sanitised. Relative URLs (`/x`, `x`, `#a`, `?q`) pass;
 * a scheme outside the list becomes `""`. A host scheme such as `asset:` is resolved by the host's
 * `resolveUrl` BEFORE this check, so it can only turn into an allowed URL or be dropped.
 */
export function safeUrl(url: string, key: string): string {
  const value = url.trim();
  // A browser drops tab / newline / control characters while parsing a URL, so `java\tscript:`
  // EXECUTES as `javascript:`. The scheme is judged on the string the browser will see.
  // eslint-disable-next-line no-control-regex -- matching control characters is the point here
  const probe = value.replace(/[\x00-\x20\x7f]/g, "");
  if (!SCHEME.test(probe)) return value;
  if (key === "src") return SAFE_SRC.test(probe) ? value : "";
  return SAFE_HREF.test(probe) ? value : "";
}

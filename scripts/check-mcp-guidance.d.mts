/** Type surface for the catalog guidance gate (scripts/check-mcp-guidance.mjs, v32 #1223). */

export interface GuidanceFinding {
  rule: "related" | "useCases" | "storyPath" | "tagline" | "inert";
  entry: string;
  detail: string;
}

export interface GuidanceEntry {
  name: string;
  tagline: string;
  props: Array<{ name: string; description: string }>;
  related?: string[];
  useCases?: string[];
  subParts?: string[];
  absorbed?: string[];
  storyPath?: string;
  importPath?: string;
}

export const LIBRARIES: Array<{ word: RegExp; packages: RegExp[] }>;

export function lintGuidance(input: {
  components: GuidanceEntry[];
  utilities: Array<{ name: string }>;
  runtimeDeps: Set<string>;
  packageDeps?: Record<string, Set<string>>;
  discarded?: Map<string, Set<string>>;
  docExists: (rel: string) => boolean;
  externalNames?: Set<string>;
}): GuidanceFinding[];

/** Props a source file receives and throws away (`prop: _prop` destructuring). */
export function discardedProps(source: string): Set<string>;

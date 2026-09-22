/** Type surface for the consumer-coupling gate (scripts/check-no-consumer-coupling.mjs). */

/** A single detected reference: the denylist token, the exact matched text, and its 1-based line. */
export interface CouplingHit {
  token: string;
  match: string;
  line: number;
}

/** Scan raw text for consumer/product identifiers + consumer infra domains. */
export function scanText(text: string): CouplingHit[];

/** Scan component source for hard-coded locale/currency/timezone literals that bypass Intl/CLDR. */
export function scanLocale(text: string): CouplingHit[];

/**
 * Scan a docs example (docs/**) for hard-coded locale content in CHROME positions — text rendered
 * as a JSX child, and strings passed to props that render as human-readable text. Domain data
 * (a name in a row, a category in a chart array) and comments are deliberately NOT scanned; see
 * the rationale block in the gate script (gh#846).
 */
export function scanDocsChrome(text: string): CouplingHit[];

/** Which of `namespaces` this text reads a message key from (`"ns.x"` / `` `ns.${x}` ``). */
export function referencedNamespaces(text: string, namespaces: readonly string[]): string[];

/** A runtime-catalogue namespace no shipping `src/**` module reads, and the docs files that do. */
export interface DocsOnlyNamespace {
  namespace: string;
  readers: string[];
}

/**
 * Namespaces `src/i18n/messages/*.json` ships that only `docs/**` reads — demo copy in every
 * consumer's bundle, because `translate.ts` imports those JSON files statically and JSON has no
 * named exports to tree-shake (gh#858). Empty is the passing state.
 */
export function findDocsOnlyRuntimeNamespaces(): DocsOnlyNamespace[];

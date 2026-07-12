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

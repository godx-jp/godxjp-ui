import { parse } from "./parse";
import { serialize } from "./serialize";

export { parse } from "./parse";
export { serialize } from "./serialize";
export type { Doc, DocNode, Mark, CalloutKind } from "./model";
export { CALLOUT_KINDS, COLUMNS_MAX, COLUMNS_MIN } from "./model";

/**
 * Identifies the serializer's output. Bumped whenever `serialize` would write a stored body
 * differently, so a host can tell which normalization a saved `normalized_body` came from.
 */
export const CODEC_ID = "kit-md@1";

/** `serialize(parse(markdown))` — the canonical form of a body, exactly what the editor saves. */
export function normalize(markdown: string): string {
  return serialize(parse(markdown));
}

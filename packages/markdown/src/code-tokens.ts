/** The kit's token names (`data-code-token`, Shiki's createCssVariablesTheme vocabulary). */
export const CODE_TOKENS = [
  "comment",
  "keyword",
  "string",
  "string-expression",
  "function",
  "constant",
  "parameter",
  "punctuation",
  "link",
  "inserted",
  "deleted",
  "changed",
] as const;
export type CodeToken = (typeof CODE_TOKENS)[number];

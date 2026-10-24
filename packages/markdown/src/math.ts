import rehypeKatex from "rehype-katex";

import { KATEX_OPTIONS } from "./katex-schema";

export { KATEX_OPTIONS, katexSchema } from "./katex-schema";

/** KaTeX at parse time, before the sanitiser (katex-schema.ts says what it may emit). */
export function rehypeMath(): ReturnType<typeof rehypeKatex> {
  return rehypeKatex(KATEX_OPTIONS);
}

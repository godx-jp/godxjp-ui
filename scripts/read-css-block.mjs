/** Read one balanced CSS block, ignoring braces inside comments and quoted strings. */
export function readCssBlock(css, open) {
  if (open < 0 || css[open] !== "{") throw new Error("CSS block opening brace not found");
  let depth = 1;
  let quote = "";
  let comment = false;
  for (let i = open + 1; i < css.length; i++) {
    const c = css[i],
      next = css[i + 1];
    if (comment) {
      if (c === "*" && next === "/") {
        comment = false;
        i++;
      }
      continue;
    }
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = "";
      continue;
    }
    if (c === "/" && next === "*") {
      comment = true;
      i++;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error("Unterminated CSS block");
}

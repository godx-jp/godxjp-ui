import * as React from "react";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Token = { type: string; text: string };

function tokenizeTsx(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    const rest = source.slice(i);

    if (rest.startsWith("{/*")) {
      const end = source.indexOf("*/}", i);
      const chunk = end >= 0 ? source.slice(i, end + 3) : rest;
      tokens.push({ type: "comment", text: chunk });
      i += chunk.length;
      continue;
    }

    if (rest[0] === '"' || rest[0] === "'") {
      const quote = rest[0]!;
      let j = i + 1;
      let escaped = false;
      while (j < source.length) {
        const char = source[j]!;
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === quote) {
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ type: "string", text: source.slice(i, j) });
      i = j;
      continue;
    }

    if (rest[0] === "<" && /<\/?[A-Za-z]/.test(rest)) {
      const match = rest.match(/^<\/?[A-Za-z][\w.-]*/);
      tokens.push({ type: "tag", text: match?.[0] ?? rest[0]! });
      i += match?.[0].length ?? 1;
      continue;
    }

    const attrMatch = rest.match(/^[A-Za-z][\w-]*(?==)/);
    if (attrMatch) {
      tokens.push({ type: "attr", text: attrMatch[0] });
      i += attrMatch[0].length;
      continue;
    }

    const punctMatch = rest.match(/^[{}()[\],/=]/);
    if (punctMatch) {
      tokens.push({ type: "punct", text: punctMatch[0] });
      i += 1;
      continue;
    }

    const wordMatch = rest.match(/^[A-Za-z_$][\w$-]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      const keywords = new Set(["true", "false", "null", "undefined", "return", "export", "const"]);
      tokens.push({ type: keywords.has(word) ? "keyword" : "plain", text: word });
      i += word.length;
      continue;
    }

    tokens.push({ type: "plain", text: rest[0]! });
    i += 1;
  }

  return tokens;
}

export function HighlightedCode({ source }: { source: string }) {
  const html = React.useMemo(() => {
    return tokenizeTsx(source)
      .map(({ type, text }) => `<span class="tok-${type}">${escapeHtml(text)}</span>`)
      .join("");
  }, [source]);

  return <code dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Extract copy-paste JSX from a CSF story export block in raw source. */

function findMatchingBrace(source: string, openIndex: number): number {
  let depth = 0;
  let quote: '"' | "'" | "`" | null = null;
  let escaped = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i]!;

    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function exportBlock(raw: string, exportName: string): string | undefined {
  const marker = `export const ${exportName}`;
  const start = raw.indexOf(marker);
  if (start < 0) return undefined;

  const braceStart = raw.indexOf("{", start + marker.length);
  if (braceStart < 0) return undefined;

  const braceEnd = findMatchingBrace(raw, braceStart);
  if (braceEnd < 0) return undefined;

  return raw.slice(braceStart, braceEnd + 1);
}

function extractTemplateLiteral(block: string, key: string): string | undefined {
  const re = new RegExp(`${key}:\\s*\``);
  const match = re.exec(block);
  if (!match) return undefined;

  let i = match.index + match[0].length;
  let out = "";
  let escaped = false;

  while (i < block.length) {
    const char = block[i]!;
    if (escaped) {
      out += char;
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === "`") {
      return out.trim();
    } else {
      out += char;
    }
    i += 1;
  }

  return undefined;
}

function unwrapParens(expression: string): string {
  const trimmed = expression.trim();
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function extractRenderBody(block: string): string | undefined {
  const renderIndex = block.indexOf("render:");
  if (renderIndex < 0) return undefined;

  const arrowIndex = block.indexOf("=>", renderIndex);
  if (arrowIndex < 0) return undefined;

  let i = arrowIndex + 2;
  while (i < block.length && /\s/.test(block[i]!)) i += 1;

  const first = block[i];
  if (first === "(") {
    const end = findMatchingParen(block, i);
    if (end >= 0) return unwrapParens(block.slice(i, end + 1));
  }

  if (first === "<") {
    const end = findJsxEnd(block, i);
    if (end >= 0) return block.slice(i, end).trim();
  }

  if (first === "{") {
    const returnIndex = block.indexOf("return", i);
    if (returnIndex >= 0) {
      let j = returnIndex + "return".length;
      while (j < block.length && /\s/.test(block[j]!)) j += 1;
      if (block[j] === "(") {
        const end = findMatchingParen(block, j);
        if (end >= 0) return unwrapParens(block.slice(j, end + 1));
      }
    }
  }

  return undefined;
}

function findMatchingParen(source: string, start: number): number {
  let depth = 0;
  let quote: '"' | "'" | "`" | null = null;
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i]!;
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "(") depth += 1;
    else if (char === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findJsxEnd(source: string, start: number): number {
  let depth = 0;
  let quote: '"' | "'" | "`" | null = null;
  let escaped = false;
  let started = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i]!;

    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "<") {
      depth += 1;
      started = true;
    } else if (char === ">" && started) {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }

  return -1;
}

function formatArgsSnippet(componentName: string, args: Record<string, unknown>): string {
  const props = Object.entries(args)
    .filter(([key]) => key !== "children")
    .map(([key, value]) => {
      if (typeof value === "string") return `${key}="${value}"`;
      if (typeof value === "boolean") return value ? key : `${key}={false}`;
      return `${key}={${JSON.stringify(value)}}`;
    });

  const children = args.children;
  const open = props.length ? `<${componentName} ${props.join(" ")}>` : `<${componentName}>`;

  if (children === undefined || children === null)
    return `<${componentName}${props.length ? ` ${props.join(" ")}` : ""} />`;

  if (typeof children === "string") {
    return props.length
      ? `<${componentName} ${props.join(" ")}>${children}</${componentName}>`
      : `${open}${children}</${componentName}>`;
  }

  return `${open}{/* … */}</${componentName}>`;
}

export function extractSourceFromRaw(raw: string, exportName: string): string | undefined {
  const block = exportBlock(raw, exportName);
  if (!block) return undefined;

  const curated = extractTemplateLiteral(block, "code");
  if (curated) return curated;

  return extractRenderBody(block);
}

export function extractSourceFromStoryExport(
  exported: {
    args?: Record<string, unknown>;
    parameters?: { docs?: { source?: { code?: string } } };
  },
  componentName?: string,
): string | undefined {
  const curated = exported.parameters?.docs?.source?.code;
  if (typeof curated === "string" && curated.trim()) return curated.trim();

  if (exported.args && componentName) {
    return formatArgsSnippet(componentName, exported.args);
  }

  return undefined;
}

export function resolveStorySource(
  raw: string,
  exportName: string,
  exported?: {
    args?: Record<string, unknown>;
    parameters?: { docs?: { source?: { code?: string } } };
  },
  componentName?: string,
): string {
  const fromModule = exported ? extractSourceFromStoryExport(exported, componentName) : undefined;
  if (fromModule) return fromModule;

  const fromRaw = extractSourceFromRaw(raw, exportName);
  if (fromRaw) return fromRaw;

  return `// No preview source for "${exportName}". Add parameters.docs.source.code or a render() function.`;
}

import * as React from "react";

export type Frontmatter = {
  title?: string;
  /** Override preview route id (hash slug). */
  slug?: string;
  layout?: "fullscreen" | "padded";
  /** Logical frame height in px (responsive preset). Also accepts viewport: WxH */
  height?: number;
  width?: number;
};

function parseViewportNumbers(value: string): { width?: number; height?: number } {
  const dims = value.match(/^(\d+)\s*[x×]\s*(\d+)$/i);
  if (dims) {
    return { width: Number(dims[1]), height: Number(dims[2]) };
  }
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) return { height: n };
  return {};
}

export function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith("---")) return { frontmatter: {}, body: raw };

  const end = trimmed.indexOf("\n---", 3);
  if (end < 0) return { frontmatter: {}, body: raw };

  const block = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 4).trimStart();
  const frontmatter: Frontmatter = {};

  for (const line of block.split("\n")) {
    const match = line.match(/^([\w-]+):\s*(.+)$/);
    if (!match) continue;
    const key = match[1]!;
    const value = match[2]!.trim().replace(/^["']|["']$/g, "");
    if (key === "title") frontmatter.title = value;
    if (key === "layout" && (value === "fullscreen" || value === "padded")) {
      frontmatter.layout = value;
    }
    if (key === "height" || key === "width") {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) frontmatter[key] = n;
    }
    if (key === "viewport") {
      const parsed = parseViewportNumbers(value);
      if (parsed.width) frontmatter.width = parsed.width;
      if (parsed.height) frontmatter.height = parsed.height;
    }
  }

  return { frontmatter, body };
}

/** Body without the leading `# title` line — for folder README shown under page title. */
export function stripLeadingHeading(raw: string): string {
  const { body } = parseFrontmatter(raw);
  const lines = body.split("\n");
  const rest: string[] = [];
  let skipped = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!skipped && trimmed.startsWith("# ")) {
      skipped = true;
      continue;
    }
    rest.push(line);
  }

  return rest.join("\n").trim();
}

function inlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0]!;
    if (token.startsWith("`")) {
      parts.push(
        <code key={`${match.index}-code`} className="doc-inline-code">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      parts.push(<strong key={`${match.index}-strong`}>{token.slice(2, -2)}</strong>);
    }
    last = match.index + token.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.startsWith("|") && t.endsWith("|") && t.includes("|");
}

function isTableSeparator(line: string): boolean {
  const t = line.trim();
  if (!isTableRow(t)) return false;
  return t.replace(/[|\s:-]/g, "") === "";
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const { body } = parseFrontmatter(source);
  if (!body.trim()) return null;

  const nodes: React.ReactNode[] = [];
  const lines = body.split("\n");
  let listItems: string[] | null = null;
  let codeLines: string[] | null = null;
  let codeLang = "";
  let i = 0;

  const flushList = () => {
    if (!listItems?.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="doc-list">
        {listItems.map((item, idx) => (
          <li key={idx}>{inlineMarkdown(item)}</li>
        ))}
      </ul>,
    );
    listItems = null;
  };

  const flushCode = () => {
    if (!codeLines) return;
    nodes.push(
      <pre key={`pre-${nodes.length}`} className="doc-code-block">
        <code>{codeLines.join("\n")}</code>
      </pre>,
    );
    codeLines = null;
    codeLang = "";
  };

  const flushTable = (start: number): number => {
    const header = parseTableRow(lines[start]!);
    let end = start + 1;
    if (end < lines.length && isTableSeparator(lines[end]!)) end += 1;
    const rows: string[][] = [];
    while (end < lines.length && isTableRow(lines[end]!) && !isTableSeparator(lines[end]!)) {
      rows.push(parseTableRow(lines[end]!));
      end += 1;
    }
    nodes.push(
      <div key={`table-${nodes.length}`} className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              {header.map((cell, idx) => (
                <th key={idx}>{inlineMarkdown(cell)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx}>{inlineMarkdown(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    return end;
  };

  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (codeLines) {
      if (trimmed.startsWith("```")) {
        flushCode();
        i += 1;
        continue;
      }
      codeLines.push(line);
      i += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushList();
      codeLang = trimmed.slice(3).trim();
      codeLines = [];
      i += 1;
      continue;
    }

    if (!trimmed) {
      flushList();
      i += 1;
      continue;
    }

    if (isTableRow(trimmed)) {
      flushList();
      i = flushTable(i);
      continue;
    }

    if (trimmed.startsWith("- ")) {
      listItems ??= [];
      listItems.push(trimmed.slice(2));
      i += 1;
      continue;
    }

    flushList();

    if (trimmed.startsWith("#### ")) {
      nodes.push(
        <h4 key={`h4-${nodes.length}`} className="doc-h4">
          {inlineMarkdown(trimmed.slice(5))}
        </h4>,
      );
    } else if (trimmed.startsWith("### ")) {
      nodes.push(
        <h3 key={`h3-${nodes.length}`} className="doc-h3">
          {inlineMarkdown(trimmed.slice(4))}
        </h3>,
      );
    } else if (trimmed.startsWith("## ")) {
      nodes.push(
        <h2 key={`h2-${nodes.length}`} className="doc-h2">
          {inlineMarkdown(trimmed.slice(3))}
        </h2>,
      );
    } else if (trimmed.startsWith("# ")) {
      nodes.push(
        <h1 key={`h1-${nodes.length}`} className="doc-h1">
          {inlineMarkdown(trimmed.slice(2))}
        </h1>,
      );
    } else {
      nodes.push(
        <p key={`p-${nodes.length}`} className="doc-p">
          {inlineMarkdown(trimmed)}
        </p>,
      );
    }
    i += 1;
  }

  flushList();
  flushCode();
  return <div className={className ? `doc-prose ${className}` : "doc-prose"}>{nodes}</div>;
}

/**
 * `godx-ui-mcp call <tool> [json-args]` — the same catalog over plain stdio, for a session that
 * has no MCP client (gh#1324: a Claude Code session started outside the consumer repo never loads
 * its `.mcp.json`). It runs the server's own `dispatchTool`, so the answer is byte-identical to
 * the MCP tool's text, version line included. `call` with no tool lists the tools.
 *
 * Consumers reach it through `npx --no-install @godxjp/ui mcp-call …`, which launches the repo's
 * pinned server from `.mcp.json` with `call` appended.
 */
import { TOOL_DEFINITIONS, dispatchTool } from "./tools/registry.js";

export type CallResult = { code: number; stdout: string; stderr: string };

export async function runCall(argv: string[]): Promise<CallResult> {
  const [tool, json] = argv;
  if (!tool) {
    const lines = TOOL_DEFINITIONS.map(
      (t) => `${t.name} — ${String(t.description ?? "").split(/(?<=\.)\s/)[0]}`,
    );
    return {
      code: 0,
      stdout: `usage: godx-ui-mcp call <tool> ['{"arg":"value"}']\n\n${lines.join("\n")}\n`,
      stderr: "",
    };
  }
  if (!TOOL_DEFINITIONS.some((t) => t.name === tool)) {
    return {
      code: 1,
      stdout: "",
      stderr: `unknown tool: ${tool} (godx-ui-mcp call with no tool lists them)\n`,
    };
  }
  let args: unknown = {};
  if (json !== undefined) {
    try {
      args = JSON.parse(json);
    } catch {
      return { code: 2, stdout: "", stderr: `arguments must be a JSON object, got: ${json}\n` };
    }
    if (args === null || typeof args !== "object" || Array.isArray(args)) {
      return { code: 2, stdout: "", stderr: `arguments must be a JSON object, got: ${json}\n` };
    }
  }
  const text = await dispatchTool(tool, args as Record<string, unknown>);
  return { code: 0, stdout: text.endsWith("\n") ? text : `${text}\n`, stderr: "" };
}

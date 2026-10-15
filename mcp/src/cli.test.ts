import { describe, expect, it } from "vitest";

import { runCall } from "./cli";
import { TOOL_DEFINITIONS, dispatchTool } from "./tools/registry";

/**
 * gh#1324 — `godx-ui-mcp call <tool> [json]`, the stdio fallback for a session without an MCP
 * client. It must answer with the SAME text as the MCP tool (it runs `dispatchTool`), not a fork.
 */
/** The CLI ends the answer with exactly one newline, as a terminal expects. */
const line = (text: string) => (text.endsWith("\n") ? text : `${text}\n`);

describe("godx-ui-mcp call", () => {
  it("answers byte-for-byte what the MCP tool answers", async () => {
    const args = { name: "Segmented" };
    const viaCli = await runCall(["get_component", JSON.stringify(args)]);
    expect(viaCli.code).toBe(0);
    expect(viaCli.stdout).toBe(line(await dispatchTool("get_component", args)));
  });

  it("defaults the arguments to {}", async () => {
    const r = await runCall(["list_patterns"]);
    expect(r.code).toBe(0);
    expect(r.stdout).toBe(line(await dispatchTool("list_patterns", {})));
  });

  it("lists every tool when no tool is given", async () => {
    const r = await runCall([]);
    expect(r.code).toBe(0);
    for (const t of TOOL_DEFINITIONS) expect(r.stdout).toContain(`${t.name} — `);
  });

  it("rejects an unknown tool and non-object arguments with a non-zero code", async () => {
    expect((await runCall(["nope"])).code).toBe(1);
    expect((await runCall(["get_component", "{bad"])).code).toBe(2);
    expect((await runCall(["get_component", "[1]"])).code).toBe(2);
    expect((await runCall(["get_component", "null"])).code).toBe(2);
  });
});

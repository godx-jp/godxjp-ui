/**
 * @godxjp/ui-mcp — MCP server entry.
 *
 * Spawned over stdio by an MCP-aware agent (Claude Desktop, Cursor,
 * Continue, Cline, etc.) per the consumer's `.mcp.json` /
 * `claude_desktop_config.json`. Exposes a curated catalogue of the
 * @godxjp/ui framework so the agent can:
 *
 *   - list primitives (with group / tagline / props / example)
 *   - look up a single component's full API
 *   - search by name / use-case / feature
 *   - read the shared prop-vocabulary (`SizeProp`, `ColorProp`, …)
 *   - read design tokens (per category)
 *   - read cardinal rules (by number or all)
 *   - fetch canonical code patterns (registration form, settings,
 *     data table, app shell, …) — copy-paste-ready snippets
 *   - lint a JSX snippet against the most common rule violations
 *
 * The server reads ONLY its own bundled data files. Zero filesystem
 * access into consumer projects, no network, no shell. Safe to mount
 * read-only.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { TOOL_DEFINITIONS, dispatchTool } from "./tools/registry.js";
import { RESOURCE_DEFINITIONS, readResource } from "./resources/registry.js";
import pkg from "../package.json";

async function main() {
  const server = new Server(
    {
      name: "godx-ui-mcp",
      // Track the package version — never hardcode (see server.test.ts guard).
      version: pkg.version,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    },
  );

  // ── tools ──────────────────────────────────────────────────────
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOL_DEFINITIONS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const result = await dispatchTool(name, (args ?? {}) as Record<string, unknown>);
    return { content: [{ type: "text", text: result }] };
  });

  // ── resources ──────────────────────────────────────────────────
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: RESOURCE_DEFINITIONS,
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    const text = await readResource(uri);
    return {
      contents: [
        {
          uri,
          mimeType: uri.endsWith(".json") ? "application/json" : "text/markdown",
          text,
        },
      ],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr so it doesn't pollute the stdio JSON-RPC channel.
  console.error("[godx-ui-mcp] connected (stdio)");
}

main().catch((err) => {
  console.error("[godx-ui-mcp] fatal:", err);
  process.exit(1);
});

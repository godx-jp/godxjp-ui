/**
 * Types for `scripts/_agent-setup.mjs`, which is plain ESM with no declarations of its own.
 *
 * WHY A DECLARATION FILE RATHER THAN `@ts-expect-error`. The test imported this with the directive
 * on the line above the `import`, and a directive suppresses errors on the NEXT line only. Adding a
 * third named import made prettier wrap the statement, so the module specifier moved down two lines
 * while the directive stayed put: the suppression silently stopped covering the error it was
 * written for AND became unused. Two errors out of one reformat, neither of them about the code.
 *
 * A declaration file cannot be knocked out of alignment by a formatter. `.d.mts`, not `.d.ts`,
 * because the import specifier ends in `.mjs` and TypeScript resolves the matching extension.
 *
 * Signatures read from the source, not inferred from the call sites.
 */
export declare const MCP_KEY: string;
export declare const MCP_SERVER: { command: string; args: string[] };
export declare const KIT_VERSION: string;

/** `null` when the consumer has no installed `@godxjp/ui`. */
export declare function readConsumerUiMetadata(
  root: string,
): { version: string; godxUiMcp: string } | null;

/** Takes the consumer ROOT, not a version — it reads the metadata itself. */
export declare function mcpServerFor(root: string): {
  command: string;
  args: string[];
  env?: { GODX_UI_VERSION: string };
};

/** `"created"` / `"added"` on success, otherwise a human-readable refusal sentence. */
export declare function ensureMcpJson(root: string): string;

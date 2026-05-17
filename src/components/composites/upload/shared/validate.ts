// Upload validation helpers — MIME + size + count gates run before
// queueing a file into the list. Pure functions; no React, no state.

import type { UploadLabels } from "./types";

export interface ValidationContext {
  accept?: string;
  maxSize?: number;
  labels: UploadLabels;
}

/**
 * Match a file against the `accept` pattern. Supports the same forms
 * as `<input accept>`:
 *
 *   - extension list: `.pdf,.docx`
 *   - MIME exact: `image/png,application/pdf`
 *   - MIME wildcard: `image/*`
 *   - mixed: `image/*,.pdf`
 *   - empty / undefined: accept everything
 */
export function matchesAccept(file: File, accept?: string): boolean {
  if (!accept || accept.trim() === "") return true;
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith(".")) {
      return fileName.endsWith(token);
    }
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -1); // keep trailing slash
      return fileType.startsWith(prefix);
    }
    return fileType === token;
  });
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  ctx: ValidationContext,
): ValidationResult {
  if (!matchesAccept(file, ctx.accept)) {
    return { ok: false, error: ctx.labels.rejectedType };
  }
  if (ctx.maxSize !== undefined && file.size > ctx.maxSize) {
    const mb = Math.max(1, Math.round(ctx.maxSize / 1024 / 1024));
    return {
      ok: false,
      error: ctx.labels.rejectedTooLarge.replace("{{mb}}", String(mb)),
    };
  }
  return { ok: true };
}

export function validateCount(
  currentCount: number,
  incoming: number,
  maxCount: number | undefined,
  labels: UploadLabels,
): ValidationResult {
  if (maxCount === undefined) return { ok: true };
  if (currentCount + incoming > maxCount) {
    return {
      ok: false,
      error: labels.rejectedTooMany.replace("{{count}}", String(maxCount)),
    };
  }
  return { ok: true };
}

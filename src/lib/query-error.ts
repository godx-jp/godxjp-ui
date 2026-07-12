// Cause-aware classification for query/API failures. A generic "error + Retry" is the wrong
// default recovery for most error classes (an expired token or a permission failure never resolves
// by repeating the same request). DataState + AlertQueryError use this to pick a safe affordance
// and a privacy-preserving, localized message instead of dumping raw backend/token text.

/** Recovery-relevant error classes. Retry is only meaningful for `transient`. */
export type QueryErrorCategory =
  | "auth" // 401 / invalid|expired access token — renew session or sign in again
  | "forbidden" // 403 — permission/access path, never a blind retry
  | "notFound" // 404 — contextual not-found
  | "validation" // 400 / 422 domain error — corrective guidance
  | "transient" // network / timeout / 408 / 429 / 5xx — retry may resolve it
  | "unknown"; // uncategorized — neutral, no blind retry by default

export type QueryErrorInfo = {
  category: QueryErrorCategory;
  /** HTTP status when one could be derived from the error, else `undefined`. */
  status?: number;
  /** `true` only when repeating the same request can plausibly resolve the cause. */
  retryable: boolean;
};

/** Best-effort HTTP status from the many shapes an error can take (fetch/axios/Nest/plain). */
function readStatus(error: unknown): number | undefined {
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    for (const value of [e.status, e.statusCode, e.code]) {
      if (typeof value === "number" && value >= 100 && value <= 599) return value;
    }
    const response = e.response as Record<string, unknown> | undefined;
    if (response && typeof response.status === "number") return response.status;
  }
  const match = readMessage(error).match(/\b([1-5]\d{2})\b/);
  if (match) {
    const parsed = Number(match[1]);
    if (parsed >= 400 && parsed <= 599) return parsed;
  }
  return undefined;
}

/** A message string from any error shape without throwing on non-Error values. */
function readMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (
    error &&
    typeof error === "object" &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "";
}

const AUTH_RE =
  /unauthenticated|unauthorized|access[ _-]?token|invalid token|token (?:is )?(?:expired|invalid)|(?:session|token) (?:has )?expired/i;
const FORBIDDEN_RE =
  /forbidden|permission denied|not allowed|access denied|insufficient (?:scope|permission)/i;
const NOT_FOUND_RE = /not found|does not exist|no such/i;
const TRANSIENT_RE =
  /network|failed to fetch|timeout|timed out|connection|econn(?:refused|reset|aborted)|temporarily|unavailable|gateway/i;
const VALIDATION_RE = /validation|invalid input|bad request|must be|is required/i;

/**
 * Classify a query/API error into a recovery-relevant category. Status codes win; message
 * keywords are the fallback for transport layers that only surface a string (e.g. an SDK that
 * throws `new Error("Access token invalid")` with no status). Never exposes the raw message.
 */
export function classifyQueryError(error: unknown): QueryErrorInfo {
  const status = readStatus(error);
  const message = readMessage(error);
  const of = (category: QueryErrorCategory, retryable: boolean): QueryErrorInfo => ({
    category,
    status,
    retryable,
  });

  // A decisive HTTP status always wins over ambiguous message keywords (a 503 body that mentions
  // "not found" is still a retryable transient failure, not a 404).
  if (status !== undefined) {
    if (status === 401) return of("auth", false);
    if (status === 403) return of("forbidden", false);
    if (status === 404) return of("notFound", false);
    if (status === 408 || status === 429 || status >= 500) return of("transient", true);
    if (status === 400 || status === 422) return of("validation", false);
  }

  // No decisive status — fall back to message keywords (SDKs that throw a bare string/Error).
  if (AUTH_RE.test(message)) return of("auth", false);
  if (FORBIDDEN_RE.test(message)) return of("forbidden", false);
  if (NOT_FOUND_RE.test(message)) return of("notFound", false);
  if (TRANSIENT_RE.test(message)) return of("transient", true);
  if (VALIDATION_RE.test(message)) return of("validation", false);
  return of("unknown", false);
}

/** `true` when repeating the same request can plausibly resolve the error. */
export function isRetryableQueryError(error: unknown): boolean {
  return classifyQueryError(error).retryable;
}

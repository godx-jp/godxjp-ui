// @godxjp/ui — media-service client.
//
// Transport-layer wrapper around the platform's media-service public
// API (see services/media-service/api/openapi.yaml). Generic; no
// service-specific copy. Exposed as a sub-path entry so consumers
// who only want the transport (e.g. server-rendered callers) can
// import it without pulling React.
//
// Endpoint contract (gateway-routed per cardinal rule 14):
//
//   POST /upload-sessions               -> { upload_url, media_id }
//   POST /upload-sessions/{id}/complete -> ack
//   POST /objects/{id}/promote          -> media metadata
//   GET  /objects/{id}                  -> media metadata
//   GET  /objects/{id}/download         -> { url } (signed view URL)
//
// Auth flows through whatever the consumer attached at the global
// fetch / cookie layer; the framework does not embed credentials.
//
// Base URL precedence:
//   1. setMediaBaseURL(url) override at runtime;
//   2. import.meta.env.VITE_MEDIA_API_BASE_URL;
//   3. fallback to "/api/media/v1" (matches gateway carve-out).
//
// All read/upload helpers return Promise<MediaItem> after normalising
// whatever shape the server returned, so callers always see the same
// canonical shape regardless of which endpoint was hit.

export interface MediaItem {
  id: string;
  filename: string;
  contentType: string;
  /** Signed view URL — fetchable directly as an <img src>. */
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  /** Size in bytes. */
  size?: number;
}

export interface MediaInitResponse {
  /** Presigned PUT URL — upload bytes directly here. */
  uploadUrl: string;
  /** Server-assigned media UUID (use for promote + later fetch). */
  mediaId: string;
}

// ─── Base URL plumbing ────────────────────────────────────────────

const DEFAULT_BASE_URL = "/api/media/v1";

function readEnvBaseURL(): string | null {
  // import.meta.env is statically replaced at Vite build time; in
  // Storybook + tsup builds we never see VITE_* — the lookup is
  // defensive. typeof guards keep us SSR-safe.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (import.meta as any);
    const raw = meta?.env?.VITE_MEDIA_API_BASE_URL;
    return typeof raw === "string" && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

let runtimeBaseURL: string | null = null;

/**
 * Override the media-service base URL at runtime (consumer apps can
 * call this once during bootstrap if their deployment differs from
 * `VITE_MEDIA_API_BASE_URL`).
 */
export function setMediaBaseURL(url: string): void {
  runtimeBaseURL = url || null;
}

export function getMediaBaseURL(): string {
  return runtimeBaseURL ?? readEnvBaseURL() ?? DEFAULT_BASE_URL;
}

function buildURL(path: string): string {
  const base = getMediaBaseURL().replace(/\/+$/, "");
  const rel = path.startsWith("/") ? path : `/${path}`;
  return `${base}${rel}`;
}

// ─── Error shape ──────────────────────────────────────────────────

export class MediaClientError extends Error {
  status: number;
  detail?: string;
  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = "MediaClientError";
    this.status = status;
    this.detail = detail;
  }
}

async function parseProblem(res: Response): Promise<MediaClientError> {
  let detail: string | undefined;
  let title = res.statusText || `HTTP ${res.status}`;
  try {
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("problem+json") || ct.includes("json")) {
      const body = (await res.json()) as { title?: string; detail?: string };
      if (body.title) title = body.title;
      if (body.detail) detail = body.detail;
    }
  } catch {
    /* ignore — server returned non-JSON */
  }
  return new MediaClientError(title, res.status, detail);
}

// ─── Normalisation ────────────────────────────────────────────────

// The server's object payload is loosely typed in the OpenAPI spec
// today; the SPA only consumes a small slice. Map the common field
// aliases (id / object_id, content_type / mime_type, signed_url /
// download_url) so future server evolution does not break callers.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseMediaItem(raw: any, fallbackId?: string): MediaItem {
  const id: string =
    raw?.id ?? raw?.object_id ?? raw?.media_id ?? fallbackId ?? "";
  const filename: string =
    raw?.filename ?? raw?.name ?? raw?.object_name ?? "unknown";
  const contentType: string =
    raw?.contentType ?? raw?.content_type ?? raw?.mime_type ?? "application/octet-stream";
  const url: string =
    raw?.url ?? raw?.signed_url ?? raw?.download_url ?? raw?.view_url ?? "";
  const thumbnailUrl: string | undefined =
    raw?.thumbnailUrl ?? raw?.thumbnail_url ?? undefined;
  const width: number | undefined = raw?.width ?? raw?.metadata?.width;
  const height: number | undefined = raw?.height ?? raw?.metadata?.height;
  const size: number | undefined = raw?.size ?? raw?.size_bytes ?? raw?.bytes;
  return { id, filename, contentType, url, thumbnailUrl, width, height, size };
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Step 1 of the 3-step upload contract: ask the server for a
 * presigned PUT URL + a media UUID.
 */
export async function initUpload(file: File): Promise<MediaInitResponse> {
  const res = await fetch(buildURL("/upload-sessions"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type || "application/octet-stream",
      size: file.size,
    }),
  });
  if (!res.ok) throw await parseProblem(res);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = (await res.json()) as any;
  const uploadUrl: string = body?.upload_url ?? body?.uploadUrl;
  const mediaId: string = body?.media_id ?? body?.id ?? body?.object_id;
  if (!uploadUrl || !mediaId) {
    throw new MediaClientError(
      "media-service init response missing upload_url or media_id",
      502,
    );
  }
  return { uploadUrl, mediaId };
}

/**
 * Step 2: PUT raw bytes to the presigned URL. Progress reported
 * via XMLHttpRequest (fetch doesn't expose upload-progress events).
 */
export function putToPresigned(
  url: string,
  file: File | Blob,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    const type =
      (file as File).type || (file instanceof Blob ? file.type : "");
    if (type) xhr.setRequestHeader("content-type", type);
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(
          new MediaClientError(
            `presigned PUT failed (${xhr.status})`,
            xhr.status,
          ),
        );
      }
    };
    xhr.onerror = () =>
      reject(new MediaClientError("presigned PUT network error", 0));
    xhr.send(file);
  });
}

/**
 * Step 3: tell the server the bytes are on the bucket — server
 * promotes the temp object to permanent + returns final metadata.
 */
export async function promoteUpload(mediaId: string): Promise<MediaItem> {
  const res = await fetch(buildURL(`/objects/${mediaId}/promote`), {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw await parseProblem(res);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = (await res.json()) as any;
  return normaliseMediaItem(body, mediaId);
}

/** Fetch full metadata + signed view URL for one media UUID. */
export async function fetchMedia(id: string): Promise<MediaItem> {
  const res = await fetch(buildURL(`/objects/${id}`), {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw await parseProblem(res);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = (await res.json()) as any;
  const item = normaliseMediaItem(body, id);
  // If the server didn't inline a signed URL, hit the download
  // endpoint to materialise one. Server contract leaves this
  // server-side decision flexible.
  if (!item.url) {
    item.url = await fetchSignedURL(id);
  }
  return item;
}

/**
 * Batch fetch. The server doesn't expose a true batch endpoint, so
 * we fan out concurrent GETs and let the gateway dedupe. Falls back
 * gracefully on per-item errors — items that fail to resolve come
 * back with `url=""` so the UI can render a fallback tile.
 */
export async function fetchMediaBatch(ids: string[]): Promise<MediaItem[]> {
  if (ids.length === 0) return [];
  const settled = await Promise.allSettled(ids.map((id) => fetchMedia(id)));
  return settled.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          id: ids[i],
          filename: "unknown",
          contentType: "application/octet-stream",
          url: "",
        },
  );
}

async function fetchSignedURL(id: string): Promise<string> {
  const res = await fetch(buildURL(`/objects/${id}/download`), {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw await parseProblem(res);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = (await res.json()) as any;
  return body?.url ?? body?.signed_url ?? body?.download_url ?? "";
}

/**
 * End-to-end upload helper — runs init → PUT → promote, returning
 * the final MediaItem. Consumers that need progress can pass a
 * callback; the value is forwarded to `putToPresigned`.
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<MediaItem> {
  const { uploadUrl, mediaId } = await initUpload(file);
  await putToPresigned(uploadUrl, file, onProgress);
  return promoteUpload(mediaId);
}

import type { UploadProp } from "../../props/components/data-entry.prop";
import type { UploadRequestContext, UploadResult } from "./upload-types";

/** Default multipart transport. Custom storage protocols use onUpload with the same abort/progress contract. */
export async function uploadRequest(
  file: File,
  options: Pick<UploadProp, "action" | "method" | "headers" | "data" | "name" | "withCredentials">,
  context: UploadRequestContext,
): Promise<UploadResult> {
  const action = typeof options.action === "function" ? await options.action(file) : options.action;
  const data = typeof options.data === "function" ? await options.data(file) : options.data;
  context.signal.throwIfAborted();
  if (!action) throw new Error("Upload requires action or onUpload");
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const cleanup = () => context.signal.removeEventListener("abort", abort);
    xhr.open(options.method ?? "POST", action);
    xhr.withCredentials = options.withCredentials ?? false;
    for (const [key, value] of Object.entries(options.headers ?? {}))
      xhr.setRequestHeader(key, value);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) context.onProgress((event.loaded / event.total) * 100);
    };
    xhr.onload = () => {
      cleanup();
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`HTTP ${xhr.status}`));
        return;
      }
      let response: unknown = xhr.responseText;
      try {
        response = JSON.parse(xhr.responseText);
      } catch {
        /* Text responses are valid. */
      }
      const result =
        response && typeof response === "object" ? (response as Record<string, unknown>) : {};
      resolve({
        response,
        mediaId: typeof result.mediaId === "string" ? result.mediaId : undefined,
        url: typeof result.url === "string" ? result.url : undefined,
        previewUrl: typeof result.previewUrl === "string" ? result.previewUrl : undefined,
      });
    };
    xhr.onerror = () => {
      cleanup();
      reject(new Error("Network error"));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new DOMException("Upload aborted", "AbortError"));
    };
    context.signal.addEventListener("abort", abort, { once: true });
    const body = new FormData();
    for (const [key, value] of Object.entries(data ?? {})) body.append(key, value);
    body.append(options.name ?? "file", file, file.name);
    xhr.send(body);
  });
}

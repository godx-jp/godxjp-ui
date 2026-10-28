import { TextEncoder as NodeTextEncoder } from "node:util";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";
import type { toast as SonnerToast } from "sonner";

it("public and feedback toast exports use the same store as the kit Toaster", async () => {
  // Bundle the public import as a consumer would, without eagerly executing every barrel export.
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  let code: string;
  try {
    const { build } = await import("esbuild");
    const result = await build({
      stdin: {
        contents:
          'export { toast as publicToast } from "./src/index"; export { toast as feedbackToast } from "./src/components/feedback"; export { toast as store } from "sonner";',
        loader: "ts",
        resolveDir: process.cwd(),
      },
      bundle: true,
      write: false,
      platform: "node",
      format: "cjs",
      packages: "external",
    });
    code = result.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  const module = {
    exports: {} as {
      publicToast: typeof SonnerToast;
      feedbackToast: typeof SonnerToast;
      store: typeof SonnerToast;
    },
  };
  runInNewContext(code!, {
    module,
    exports: module.exports,
    require: createRequire(import.meta.url),
  });
  const { publicToast, feedbackToast, store } = module.exports;
  expect(publicToast).toBe(feedbackToast);
  const id = publicToast("public store regression", { duration: Infinity });
  expect(store.getToasts().find((item: { id: unknown }) => item.id === id)?.title).toBe(
    "public store regression",
  );
  publicToast.dismiss(id);
});

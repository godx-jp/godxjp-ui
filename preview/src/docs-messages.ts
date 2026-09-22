/**
 * The DOCS message catalogue — registered into the library catalogue at preview startup.
 *
 * These namespaces are copy for the example pages in `docs/**`: a showcase headline, a theme
 * editor's field labels, the invented invoice rows a preview renders. No component in `src/`
 * reads a key from any of them, and no consumer ever renders one — but until gh#858 they lived
 * in `src/i18n/messages/*.json`, the catalogue `translate.ts` imports statically, so they shipped
 * to every consumer in three languages. JSON has no named exports, so nothing could tree-shake
 * them; one `useTranslation()` anywhere (ScrollArea's default region label is enough) pulled all
 * three locales in whole.
 *
 * `registerMessages` is the extension point that already existed for exactly this shape of
 * problem, and it refuses to overwrite a namespace the library owns — so this file cannot quietly
 * take over `dataEntry.*` if a docs page ever names a key that way.
 *
 * AN EXPLICIT CALL, NOT A SIDE-EFFECT IMPORT, and that is not a style preference. This package
 * declares `"sideEffects": false`, so Rollup drops a module nothing imports a BINDING from:
 * `import "./docs-messages"` in the four entry points typechecked, linted and BUILT clean, and
 * shipped a preview where every docs page rendered `serviceLauncherShowcase.page.title` where its
 * title should be. Measured in `preview/dist` — not one chunk contained the copy.
 * (`preview/src/preload-recovery.ts` is imported that same way and is likewise absent from the
 * production preview bundle. Separate defect, not fixed here.)
 *
 * A missing registration does not crash: `translate()` falls back to echoing the key, which is
 * exactly why this has to be verified in a browser rather than inferred from a green build.
 *
 * `scripts/check-no-consumer-coupling.mjs` keeps the split honest — a namespace in the runtime
 * catalogue that only `docs/**` reads is a gate failure, and the fix is to move it here.
 */
import { registerMessages } from "../../src/i18n/translate";

import en from "../../docs/i18n/messages/en.json";
import ja from "../../docs/i18n/messages/ja.json";
import vi from "../../docs/i18n/messages/vi.json";

/** Call once, before the first render, from every preview entry point. */
export function registerDocsMessages(): void {
  registerMessages("en", en);
  registerMessages("ja", ja);
  registerMessages("vi", vi);
}

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  findDocsOnlyRuntimeNamespaces,
  referencedNamespaces,
} from "../../../scripts/check-no-consumer-coupling.mjs";
import { MESSAGE_CATALOG } from "../translate";

/**
 * gh#858 — `translate.ts` imports `messages/{en,ja,vi}.json` statically and builds MESSAGE_CATALOG
 * eagerly, so every namespace in those files is in the bundle of any consumer that renders one
 * component calling `useTranslation()`. JSON has no named exports; there is nothing to shake.
 *
 * At 28.12.0 that meant 60.7% of en.json — showcase and theme-editor demo copy, ~68.5 kB raw across
 * three locales — in every consumer's bundle. A consumer read those strings out of its PRODUCTION
 * build, which is how this was found.
 *
 * The assertion is DERIVED, not a frozen list: a namespace only `docs/**` reads is docs copy and
 * belongs in `docs/i18n/messages/*.json`, which `preview/src/docs-messages.ts` registers at startup.
 * Put `themeShowcase` back into `src/i18n/messages/en.json` and the first test goes red naming it.
 */

const LOCALES = ["en", "ja", "vi"] as const;
const runtimeMessages = (locale: (typeof LOCALES)[number]) =>
  JSON.parse(
    readFileSync(join(process.cwd(), `src/i18n/messages/${locale}.json`), "utf8"),
  ) as Record<string, unknown>;
const docsMessages = (locale: (typeof LOCALES)[number]) =>
  JSON.parse(
    readFileSync(join(process.cwd(), `docs/i18n/messages/${locale}.json`), "utf8"),
  ) as Record<string, unknown>;

describe("the runtime message catalogue carries no docs-only copy (gh#858)", () => {
  it("ships no namespace that only docs/** reads", () => {
    const orphans = findDocsOnlyRuntimeNamespaces();
    expect(
      orphans.map((o) => `${o.namespace} (read by ${o.readers.join(", ") || "nothing"})`),
    ).toEqual([]);
  });

  it("every namespace MESSAGE_CATALOG exposes at load is one the library itself reads", () => {
    // MESSAGE_CATALOG is what a consumer's bundle actually contains, so assert against the live
    // object too — not only against the files the gate reads off disk.
    const shipped = new Set(Object.values(MESSAGE_CATALOG).flatMap((m) => Object.keys(m)));
    const docsOnly = new Set(findDocsOnlyRuntimeNamespaces().map((o) => o.namespace));
    expect([...shipped].filter((ns) => docsOnly.has(ns))).toEqual([]);
  });

  it("the docs catalogue holds the moved namespaces, in all three locales", () => {
    const en = Object.keys(docsMessages("en"));
    expect(en).toContain("themeShowcase");
    expect(en).toContain("serviceLauncherShowcase");
    for (const locale of LOCALES) {
      // A locale missing a namespace does not throw — `translate()` echoes the key — so the
      // parity has to be asserted, not observed.
      expect(Object.keys(docsMessages(locale)).sort()).toEqual([...en].sort());
      expect(Object.keys(runtimeMessages(locale))).not.toContain("themeShowcase");
    }
  });

  it("the detector sees a namespace named only through a template head", () => {
    // `timezone.*` and `locale.*` have no literal `"timezone.xyz"` anywhere — they are built as
    // `` `timezone.${tz}` ``. A detector that missed those would call four live namespaces dead.
    expect(referencedNamespaces("t(`timezone.${tz}`)", ["timezone", "themeEditor"])).toEqual([
      "timezone",
    ]);
    expect(referencedNamespaces('t("dataEntry.calendar.today")', ["dataEntry"])).toEqual([
      "dataEntry",
    ]);
    expect(referencedNamespaces("const timezone = x.timezone.name;", ["timezone"])).toEqual([]);
  });
});

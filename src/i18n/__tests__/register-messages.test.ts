import { afterEach, describe, expect, it } from "vitest";
import { MESSAGE_CATALOG, registerMessages, translate } from "../translate";

/**
 * The catalog used to be closed — exported, but with no way to extend it — so every application
 * ran a second translation system beside this one. Two lookups and two fallback chains for pages
 * whose sentences mix library chrome with application copy.
 */

const snapshot = JSON.parse(JSON.stringify(MESSAGE_CATALOG)) as typeof MESSAGE_CATALOG;

afterEach(() => {
    for (const locale of Object.keys(snapshot) as (keyof typeof snapshot)[]) {
        MESSAGE_CATALOG[locale] = JSON.parse(JSON.stringify(snapshot[locale]));
    }
});

describe("registerMessages", () => {
    it("resolves an application's own key through the same translate() and fallback chain", () => {
        registerMessages("ja", { gino: { deadline: "期限" } });
        registerMessages("en", { gino: { deadline: "Deadline" } });

        expect(translate("ja", "en", "gino.deadline")).toBe("期限");
        // Not registered for vi, so the fallback locale answers rather than the dotted path.
        expect(translate("vi", "en", "gino.deadline")).toBe("Deadline");
    });

    it("MERGES — a second call cannot delete what the library already shipped", () => {
        const before = translate("ja", "en", "dataEntry.calendar.today");

        registerMessages("ja", { gino: { a: "A" } });
        registerMessages("ja", { gino: { b: "B" } });

        expect(translate("ja", "en", "gino.a")).toBe("A");
        expect(translate("ja", "en", "gino.b")).toBe("B");
        expect(translate("ja", "en", "dataEntry.calendar.today")).toBe(before);
    });

    it("last write wins for the same key, which is what a hot reload needs", () => {
        registerMessages("en", { gino: { title: "First" } });
        registerMessages("en", { gino: { title: "Second" } });

        expect(translate("en", "en", "gino.title")).toBe("Second");
    });

    it("REFUSES to overwrite a namespace the library owns", () => {
        // One application quietly changing what a shared component says, from a distance and only
        // in the build where the call ran, is not an extension point — it is a bug generator.
        expect(() => registerMessages("en", { dataEntry: { calendar: { today: "Nope" } } })).toThrow(
            /reserved top-level namespace/,
        );
        expect(translate("en", "en", "dataEntry.calendar.today")).toBe("Today");
    });
});

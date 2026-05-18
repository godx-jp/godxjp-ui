// Locale parity smoke test.
//
// Verifies that every key present in the canonical `ja` dictionary is
// also present in every other supported locale. Catches the class of
// bug where a new key is added to `ja` but the other locale files are
// not updated.
//
// Coverage: GDXUI-I-LOCALE-001

import { describe, it, expect } from "vitest"
import ja from "../locales/ja"
import en from "../locales/en"
import vi from "../locales/vi"
import fil from "../locales/fil"

type DeepRecord = Record<string, unknown>

function flatKeys(obj: DeepRecord, prefix = ""): string[] {
  return Object.keys(obj).flatMap((key) => {
    const full = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      return flatKeys(val as DeepRecord, full)
    }
    return [full]
  })
}

const jaKeys = flatKeys(ja as unknown as DeepRecord)

describe("locale parity", () => {
  const locales: Array<[string, unknown]> = [
    ["en", en],
    ["vi", vi],
    ["fil", fil],
  ]

  for (const [name, dict] of locales) {
    it(`${name} has all keys that ja has`, () => {
      const otherKeys = new Set(flatKeys(dict as DeepRecord))
      const missing = jaKeys.filter((k) => !otherKeys.has(k))
      expect(missing, `${name} is missing keys: ${missing.join(", ")}`).toHaveLength(0)
    })
  }
})

describe("SUPPORTED_LOCALES", () => {
  it("includes all four mandatory locales (umbrella frontend-architecture §6)", async () => {
    const { SUPPORTED_LOCALES } = await import("../index")
    expect(Array.from(SUPPORTED_LOCALES)).toEqual(expect.arrayContaining(["ja", "en", "vi", "fil"]))
  })
})

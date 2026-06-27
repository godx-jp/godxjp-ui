import { describe, it, expect } from "vitest";

import { AUDIT_RULES, type AuditRuleCategory } from "./data/audit-rules.js";
import { VISUAL_RULES, type VisualRuleCategory } from "./data/visual-rules.js";
import {
  SKILLS,
  findSkill,
  findSection,
  routeTask,
  isConsumerSkill,
} from "./data/skills-index.js";

/**
 * Cross-reference resolution for the guidance catalogs that point AT other
 * catalog entries — the broken-link guard. Complements the per-catalog shape
 * tests (audit-rules.test.ts, visual-rules.test.ts, skills.test.ts) by
 * asserting that every internal reference resolves.
 */

// ── audit-rules: category-union completeness ────────────────────────────────
describe("audit-rules — categories are within the declared union", () => {
  const UNION: ReadonlySet<AuditRuleCategory> = new Set<AuditRuleCategory>([
    "tokens",
    "composition",
    "api",
    "a11y",
    "i18n",
    "rtl",
    "copy",
  ]);

  it("every rule's category is one of the declared categories", () => {
    for (const r of AUDIT_RULES) {
      expect(UNION.has(r.category), `${r.id} category '${r.category}'`).toBe(true);
    }
  });

  it("a house design-system rule has standard=null; a spec rule names its standard", () => {
    for (const r of AUDIT_RULES) {
      // `standard` is `string | null` — never an empty string (ambiguous).
      if (r.standard !== null) {
        expect(r.standard.trim().length, `${r.id} standard`).toBeGreaterThan(0);
      }
    }
    // At least one of each kind exists (the catalog mixes house + spec rules).
    expect(AUDIT_RULES.some((r) => r.standard === null)).toBe(true);
    expect(AUDIT_RULES.some((r) => r.standard !== null)).toBe(true);
  });
});

// ── visual-rules: category-union completeness ───────────────────────────────
describe("visual-rules — categories are within the declared union", () => {
  const UNION: ReadonlySet<VisualRuleCategory> = new Set<VisualRuleCategory>([
    "a11y",
    "color",
    "i18n",
    "layout",
  ]);

  it("every visual rule's category is one of the declared categories", () => {
    for (const r of VISUAL_RULES) {
      expect(UNION.has(r.category), `${r.id} category '${r.category}'`).toBe(true);
    }
  });

  it("ids are unique across the visual catalog", () => {
    const ids = VISUAL_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every visual rule names a non-empty international standard", () => {
    for (const r of VISUAL_RULES) {
      expect(r.standard.trim().length, `${r.id} standard`).toBeGreaterThan(0);
    }
  });
});

// ── skills-index: source + router cross-references ──────────────────────────
describe("skills-index — source attribution + router targets resolve", () => {
  it("every skill names a non-empty source", () => {
    for (const s of SKILLS) {
      expect(s.source.trim().length, `${s.id} source`).toBeGreaterThan(0);
    }
  });

  // Drive the router across every documented branch + a fallback, then assert
  // every produced reference points at a REAL skill/section.
  const TASKS = [
    "a premium awwwards agency hero",
    "a marketing landing page hero",
    "a mobile app onboarding flow",
    "a notion-like workspace document editor",
    "a data heavy dashboard with an ops table",
    "a brand identity logo guidelines board",
    "redesign and audit an existing page",
    "a sign up form with validation",
    "the screen is slow, typing lags",
    "implement the design handoff bundle",
    "compose a screen from a brief",
    "zzz qqq nonsense xyzzy",
  ];

  it.each(TASKS)("routeTask('%s') yields only resolvable skill targets", (task) => {
    const results = routeTask(task);
    expect(results.length, `${task} produced no route`).toBeGreaterThan(0);
    for (const r of results) {
      expect(findSkill(r.skill), `route → skill '${r.skill}'`).toBeDefined();
      // section is either the sentinel or a real section of that skill.
      if (r.section !== "<see whenToUse>") {
        expect(findSection(r.skill, r.section), `${r.skill}/${r.section}`).toBeDefined();
      }
      // alsoSee refs are "skill/section" — both halves must resolve.
      for (const ref of r.alsoSee ?? []) {
        const [skillId, sectionId] = ref.split("/");
        expect(findSkill(skillId), `alsoSee skill '${skillId}'`).toBeDefined();
        if (sectionId) {
          expect(findSection(skillId, sectionId), `alsoSee ${ref}`).toBeDefined();
        }
      }
    }
  });

  it("routeTask is deterministic — same input, same output", () => {
    for (const task of TASKS) {
      expect(routeTask(task)).toEqual(routeTask(task));
    }
  });

  it("consumer-only routing never targets a core-only skill", () => {
    for (const task of TASKS) {
      for (const r of routeTask(task, { consumerOnly: true })) {
        const skill = findSkill(r.skill);
        expect(skill, `${r.skill}`).toBeDefined();
        expect(isConsumerSkill(skill!), `${r.skill} must be consumer-visible`).toBe(true);
      }
    }
  });
});

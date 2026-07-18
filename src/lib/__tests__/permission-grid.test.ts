import { describe, it, expect } from "vitest";

import {
  countDifferences,
  countGrants,
  grantKey,
  hasGrant,
  rolesDifferOnPermission,
  visibleRows,
  type ComparePair,
} from "../permission-grid";

// ── Fixtures: 4 roles × 5 permissions ───────────────────────────────────────
const PERMISSIONS = [
  { id: "user.manage" },
  { id: "billing.view" },
  { id: "billing.edit" },
  { id: "report.export" },
  { id: "settings.edit" },
] as const;

// admin: all · editor: view+export · viewer: view only · guest: none
const GRANTS = new Set<string>([
  grantKey("admin", "user.manage"),
  grantKey("admin", "billing.view"),
  grantKey("admin", "billing.edit"),
  grantKey("admin", "report.export"),
  grantKey("admin", "settings.edit"),
  grantKey("editor", "billing.view"),
  grantKey("editor", "report.export"),
  grantKey("viewer", "billing.view"),
]);

describe("grantKey", () => {
  it("is deterministic, order-sensitive, and round-trips through the grant Set", () => {
    expect(grantKey("editor", "billing.view")).toBe(grantKey("editor", "billing.view"));
    // (role, permission) is ordered — swapping must not collide.
    expect(grantKey("a", "b")).not.toBe(grantKey("b", "a"));
    expect(GRANTS.has(grantKey("editor", "billing.view"))).toBe(true);
    expect(GRANTS.has(grantKey("editor", "billing.edit"))).toBe(false);
  });
});

describe("hasGrant", () => {
  it("reports membership for granted and ungranted pairs", () => {
    expect(hasGrant(GRANTS, "admin", "settings.edit")).toBe(true);
    expect(hasGrant(GRANTS, "editor", "billing.view")).toBe(true);
    expect(hasGrant(GRANTS, "editor", "billing.edit")).toBe(false);
    expect(hasGrant(GRANTS, "guest", "billing.view")).toBe(false);
  });
});

describe("rolesDifferOnPermission", () => {
  const editorVsViewer: ComparePair = ["editor", "viewer"];

  it("is true only when exactly one role grants the permission", () => {
    // editor has report.export, viewer does not → differ
    expect(rolesDifferOnPermission(GRANTS, editorVsViewer, "report.export")).toBe(true);
    // both grant billing.view → same
    expect(rolesDifferOnPermission(GRANTS, editorVsViewer, "billing.view")).toBe(false);
    // neither grants settings.edit → same
    expect(rolesDifferOnPermission(GRANTS, editorVsViewer, "settings.edit")).toBe(false);
  });

  it("comparing a role with itself never differs", () => {
    for (const p of PERMISSIONS) {
      expect(rolesDifferOnPermission(GRANTS, ["admin", "admin"], p.id)).toBe(false);
    }
  });
});

describe("visibleRows", () => {
  const compare: ComparePair = ["editor", "viewer"];

  it("returns every row when diffOnly is off", () => {
    expect(visibleRows(PERMISSIONS, GRANTS, { compare, diffOnly: false })).toHaveLength(
      PERMISSIONS.length,
    );
  });

  it("returns every row when diffOnly is on but no compare pair is set", () => {
    expect(visibleRows(PERMISSIONS, GRANTS, { diffOnly: true })).toHaveLength(PERMISSIONS.length);
  });

  it("keeps only differing rows when diffOnly is on with a compare pair", () => {
    // editor vs viewer differ on report.export only (editor grants, viewer not)
    const rows = visibleRows(PERMISSIONS, GRANTS, { compare, diffOnly: true });
    expect(rows.map((r) => r.id)).toEqual(["report.export"]);
  });

  it("does not mutate the input array and preserves order", () => {
    const before = PERMISSIONS.map((p) => p.id);
    const rows = visibleRows(PERMISSIONS, GRANTS, {
      compare: ["admin", "guest"],
      diffOnly: true,
    });
    expect(PERMISSIONS.map((p) => p.id)).toEqual(before);
    // admin grants all, guest none → every row differs, original order kept
    expect(rows.map((r) => r.id)).toEqual(before);
  });

  it("defaults to returning all rows with no options", () => {
    expect(visibleRows(PERMISSIONS, GRANTS)).toHaveLength(PERMISSIONS.length);
  });
});

describe("countDifferences", () => {
  it("counts the permissions two roles disagree on", () => {
    expect(countDifferences(PERMISSIONS, GRANTS, ["editor", "viewer"])).toBe(1);
    expect(countDifferences(PERMISSIONS, GRANTS, ["admin", "guest"])).toBe(PERMISSIONS.length);
    expect(countDifferences(PERMISSIONS, GRANTS, ["viewer", "viewer"])).toBe(0);
  });
});

describe("countGrants", () => {
  it("counts a single role's granted permissions", () => {
    expect(countGrants(PERMISSIONS, GRANTS, "admin")).toBe(5);
    expect(countGrants(PERMISSIONS, GRANTS, "editor")).toBe(2);
    expect(countGrants(PERMISSIONS, GRANTS, "viewer")).toBe(1);
    expect(countGrants(PERMISSIONS, GRANTS, "guest")).toBe(0);
  });
});

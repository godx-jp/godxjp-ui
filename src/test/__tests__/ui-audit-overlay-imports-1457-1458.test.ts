import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect, it } from "vitest";
const SCRIPT = resolve("scripts/ui-audit.mjs");
function rules(source: string) {
  const root = mkdtempSync(join(tmpdir(), "g1-audit-"));
  try {
    writeFileSync(join(root, "package.json"), JSON.stringify({ name: "consumer" }));
    writeFileSync(join(root, "page.tsx"), source);
    const r = spawnSync(process.execPath, [SCRIPT, "page.tsx", "--format", "json"], {
      cwd: root,
      encoding: "utf8",
    });
    return JSON.parse(r.stdout).findings.map((f: { rule: string }) => f.rule);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
it("flags direct sonner imports including multiline", () => {
  expect(rules('import {\n toast\n} from "sonner";')).toContain("no-direct-sonner-import");
  expect(rules('import { toast } from "@godxjp/ui";')).not.toContain("no-direct-sonner-import");
  expect(rules('import type { ExternalToast } from "sonner";')).not.toContain(
    "no-direct-sonner-import",
  );
});
it("flags non-menu children but permits markup within a menu item and opaque wrappers", () => {
  expect(rules("<DropdownMenuContent><><div>Header</div></></DropdownMenuContent>")).toContain(
    "dropdown-menu-non-menu-children",
  );
  expect(
    rules(
      "<DropdownMenuContent><DropdownMenuItem><span>Label</span></DropdownMenuItem><CustomItem /></DropdownMenuContent>",
    ),
  ).not.toContain("dropdown-menu-non-menu-children");
  expect(rules("<PopoverContent><div>Header</div></PopoverContent>")).not.toContain(
    "dropdown-menu-non-menu-children",
  );
});

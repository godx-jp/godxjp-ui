import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";

it("never reserves layout space for focus paint", () => {
  const offenders: string[] = [];
  for (const file of readdirSync(join(__dirname, "..")).filter((f) => f.endsWith(".css"))) {
    const css = readFileSync(join(__dirname, "..", file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const declaration of css.matchAll(
      /(?:^|[;{])\s*((?:padding|margin)(?:-[\w-]+)?|(?:min-|max-)?(?:width|height|inline-size|block-size))\s*:\s*([^;{}]+)/g,
    )) {
      if (/--focus-(?:ring|outline)/.test(declaration[2]!))
        offenders.push(`${file}: ${declaration[0]}`);
    }
  }
  expect(offenders).toEqual([]);
});
it("keeps the resize separator on the original border-width tier", () => {
  expect(readFileSync(join(__dirname, "../../tokens/components/resizable.css"), "utf8")).toContain(
    "--resizable-handle-size: var(--control-border-width, var(--stroke-hairline))",
  );
});

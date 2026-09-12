import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const typographyPath = join(root, "src/components/general/typography.tsx");
const manifestPath = join(root, "component-api-manifest.json");
const generator = join(root, "scripts/gen-component-api-manifest.mjs");
const reproComment =
  "// ghi chú vô hại: component này KHÔNG nhận defaultValue\n";

function textPropNamesFromManifest(): string[] {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    components: { Text: { props: { name: string }[] } };
  };
  return manifest.components.Text.props.map((prop) => prop.name);
}

describe("gen-component-api-manifest — inherited prop detection", () => {
  it("does not publish inherited behavioral props mentioned only in comments", () => {
    const originalTypography = readFileSync(typographyPath, "utf8");
    const baseline = textPropNamesFromManifest();

    try {
      writeFileSync(typographyPath, reproComment + originalTypography);
      execSync(`node ${generator}`, { stdio: "pipe" });
      expect(textPropNamesFromManifest()).toEqual(baseline);
      expect(textPropNamesFromManifest()).not.toContain("defaultValue");
    } finally {
      writeFileSync(typographyPath, originalTypography);
      execSync(`node ${generator}`, { stdio: "pipe" });
    }
  });
});

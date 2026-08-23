#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const output = path.join(root, "component-api-manifest.json");
const inheritedBehavioralProps = new Set([
  "value",
  "defaultValue",
  "onValueChange",
  "checked",
  "defaultChecked",
  "onCheckedChange",
  "open",
  "defaultOpen",
  "onOpenChange",
  "disabled",
  "required",
  "name",
  "orientation",
  "dir",
  "activationMode",
  "modal",
  "loop",
  "type",
  "side",
  "align",
  "sideOffset",
  "alignOffset",
  "avoidCollisions",
  "collisionPadding",
  "sticky",
  "hideWhenDetached",
  "delayDuration",
  "skipDelayDuration",
  "disableHoverableContent",
  "forceMount",
]);

const configFile = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
if (configFile.error)
  throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const components = {};

function literalValues(type) {
  const parts = (type.isUnion() ? type.types : [type]).filter(
    (part) => !(part.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Void)),
  );
  const isLiteral = (part) =>
    Boolean(
      part.flags &
      (ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral | ts.TypeFlags.BooleanLiteral),
    );
  if (!parts.length || !parts.every(isLiteral)) return [];
  const values = [];
  for (const part of parts) {
    if (part.flags & ts.TypeFlags.StringLiteral) values.push(part.value);
    else if (part.flags & ts.TypeFlags.NumberLiteral) values.push(part.value);
    else if (part.flags & ts.TypeFlags.BooleanLiteral) values.push(part.intrinsicName === "true");
  }
  return [...new Set(values)];
}

for (const directory of fs
  .readdirSync(path.join(root, "src/components"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())) {
  const indexFile = path.join(root, "src/components", directory.name, "index.ts");
  if (!fs.existsSync(indexFile)) continue;
  const sourceFile = program.getSourceFile(indexFile);
  if (!sourceFile) continue;
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) continue;
  for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
    const name = symbol.name;
    if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) continue;
    const type = checker.getTypeOfSymbolAtLocation(symbol, sourceFile);
    const signature = type.getCallSignatures()[0];
    const parameter = signature?.parameters[0];
    if (!parameter) continue;
    const propsType = checker.getTypeOfSymbolAtLocation(parameter, sourceFile);
    const resolvedSymbol =
      symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    const implementationSource = (resolvedSymbol.declarations ?? [])
      .map((declaration) => declaration.getSourceFile())
      .filter((file) => file.fileName.includes(`${path.sep}src${path.sep}components${path.sep}`))
      .map((file) => file.text)
      .join("\n");
    const props = [];
    for (const prop of checker.getPropertiesOfType(propsType)) {
      const declarations = prop.declarations ?? [];
      const isOwned = declarations.some((declaration) => {
        const filename = declaration.getSourceFile().fileName;
        return (
          filename.includes(`${path.sep}src${path.sep}components${path.sep}`) ||
          filename.includes(`${path.sep}src${path.sep}props${path.sep}components${path.sep}`)
        );
      });
      const isPrimitiveBehavior = declarations.some((declaration) =>
        /node_modules.*(?:@radix-ui|cmdk|react-day-picker|sonner|embla-carousel|vaul|react-resizable-panels)/.test(
          declaration.getSourceFile().fileName,
        ),
      );
      const isHandledByImplementation = new RegExp(`\\b${prop.name}\\b`).test(implementationSource);
      if (
        !isOwned &&
        !(
          inheritedBehavioralProps.has(prop.name) &&
          (isPrimitiveBehavior || isHandledByImplementation)
        )
      )
        continue;
      const declaration = declarations[0] ?? sourceFile;
      const propType = checker.getTypeOfSymbolAtLocation(prop, declaration);
      props.push({
        name: prop.name,
        origin: isOwned ? "owned" : "inherited-behavioral",
        required: !(prop.flags & ts.SymbolFlags.Optional),
        type: checker.typeToString(propType, declaration, ts.TypeFormatFlags.NoTruncation),
        values: literalValues(propType),
        declaredIn: [
          ...new Set(
            declarations.map((item) => path.relative(root, item.getSourceFile().fileName)),
          ),
        ].sort(),
      });
    }
    components[name] = {
      group: directory.name,
      props: props.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }
}

const manifest = {
  schemaVersion: 1,
  generatedBy: "scripts/gen-component-api-manifest.mjs",
  components: Object.fromEntries(Object.entries(components).sort(([a], [b]) => a.localeCompare(b))),
};
// Format through prettier (repo config) before writing/comparing, so `pnpm format` and this
// generator agree byte-for-byte in either order — JSON.stringify always expands arrays, while
// prettier collapses short ones, and that mismatch made the two gates fight on a clean main
// (issue #302). The manifest stays prettier-visible on purpose; the generator emits what
// prettier would.
const prettier = (await import("prettier")).default;
const prettierConfig = (await prettier.resolveConfig(output)) ?? {};
const serialized = await prettier.format(`${JSON.stringify(manifest, null, 2)}\n`, {
  ...prettierConfig,
  filepath: output,
});
if (process.argv.includes("--check")) {
  if (!fs.existsSync(output) || fs.readFileSync(output, "utf8") !== serialized) {
    console.error(
      "component-api-manifest.json is stale; run node scripts/gen-component-api-manifest.mjs",
    );
    process.exit(1);
  }
  console.log(`component API manifest current: ${Object.keys(components).length} callable exports`);
} else {
  fs.writeFileSync(output, serialized);
  console.log(
    `wrote component-api-manifest.json (${Object.keys(components).length} callable exports)`,
  );
}

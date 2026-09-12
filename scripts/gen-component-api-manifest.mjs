#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();

/**
 * Unwrap `memo(forwardRef(fn))` / `forwardRef(fn)` to the callback that receives props.
 */
function unwrapComponentCallback(node) {
  if (!node) return undefined;
  if (
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isFunctionDeclaration(node)
  ) {
    return node;
  }
  if (ts.isCallExpression(node)) {
    return unwrapComponentCallback(node.arguments[0]);
  }
  return undefined;
}

function componentCallbacksFromDeclaration(declaration, sourceFile, checker) {
  if (ts.isFunctionDeclaration(declaration)) return [declaration];
  if (ts.isVariableDeclaration(declaration)) {
    let node = declaration.initializer;
    if (node && ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const callee = node.expression;
      if (callee.name.text === "assign" && callee.expression.text === "Object") {
        node = node.arguments[0];
        if (node && ts.isIdentifier(node)) {
          const symbol = checker.getSymbolAtLocation(node);
          if (symbol) {
            const resolved =
              symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
            for (const inner of resolved.declarations ?? []) {
              if (inner === declaration) continue;
              if (inner.getSourceFile() !== sourceFile) continue;
              const callbacks = componentCallbacksFromDeclaration(inner, sourceFile, checker);
              if (callbacks.length) return callbacks;
            }
          }
        }
      }
    }
    const callback = unwrapComponentCallback(node);
    return callback ? [callback] : [];
  }
  return [];
}

function restBindingNames(pattern) {
  const names = [];
  for (const element of pattern.elements) {
    if (!ts.isBindingElement(element) || !element.dotDotDotToken) continue;
    if (ts.isIdentifier(element.name)) names.push(element.name.text);
  }
  return names;
}

function visitBindingPropAccess(body, bindingNames, read) {
  const visit = (node) => {
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      bindingNames.has(node.expression.text)
    ) {
      read.add(node.name.text);
    }
    if (
      ts.isElementAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      bindingNames.has(node.expression.text)
    ) {
      const arg = node.argumentExpression;
      if (ts.isStringLiteral(arg) || ts.isNumericLiteral(arg)) read.add(arg.text);
    }
    if (ts.isVariableDeclaration(node) && ts.isObjectBindingPattern(node.name) && node.initializer) {
      let init = node.initializer;
      if (ts.isAsExpression(init) || ts.isTypeAssertionExpression(init)) init = init.expression;
      if (ts.isIdentifier(init) && bindingNames.has(init.text)) {
        for (const name of collectObjectBindingPropNames(node.name)) read.add(name);
      }
    }
    ts.forEachChild(node, visit);
  };
  if (body) visit(body);
}

/** Binding-element prop names (`{ disabled: x }` → `disabled`). */
function collectObjectBindingPropNames(pattern) {
  const names = [];
  for (const element of pattern.elements) {
    if (ts.isOmittedExpression(element)) continue;
    if (!ts.isBindingElement(element)) continue;
    const propName = element.propertyName ?? element.name;
    if (ts.isIdentifier(propName)) names.push(propName.text);
    else if (ts.isStringLiteral(propName) || ts.isNumericLiteral(propName)) names.push(propName.text);
  }
  return names;
}

/**
 * Inherited behavioral props the implementation actually touches — parameter destructure,
 * `props.foo`, or `props["foo"]` on the props binding only (not comments/strings).
 */
export function collectImplementationReadProps(resolvedSymbol, checker) {
  const read = new Set();
  for (const declaration of resolvedSymbol.declarations ?? []) {
    const sourceFile = declaration.getSourceFile();
    const fileName = sourceFile.fileName;
    if (!fileName.includes(`${path.sep}src${path.sep}components${path.sep}`)) continue;

    for (const callback of componentCallbacksFromDeclaration(
      declaration,
      sourceFile,
      checker,
    )) {
      const firstParam = callback.parameters[0];
      if (!firstParam) continue;

      if (ts.isObjectBindingPattern(firstParam.name)) {
        for (const name of collectObjectBindingPropNames(firstParam.name)) read.add(name);
        const bindings = new Set(restBindingNames(firstParam.name));
        if (bindings.size) visitBindingPropAccess(callback.body, bindings, read);
        continue;
      }

      if (!ts.isIdentifier(firstParam.name)) continue;
      visitBindingPropAccess(callback.body, new Set([firstParam.name.text]), read);
    }
  }
  return read;
}

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

export function buildComponentApiManifest(rootDir = root) {
  const configFile = ts.readConfigFile(path.join(rootDir, "tsconfig.json"), ts.sys.readFile);
  if (configFile.error)
    throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, rootDir);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();
  const components = {};

  function declaredPathForRoot(fileName) {
    const relative = path.relative(rootDir, fileName);
    const marker = relative.lastIndexOf(`node_modules${path.sep}`);

    return marker === -1 ? relative : relative.slice(marker);
  }

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
    .readdirSync(path.join(rootDir, "src/components"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())) {
    const indexFile = path.join(rootDir, "src/components", directory.name, "index.ts");
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
      const implementationReadProps = collectImplementationReadProps(resolvedSymbol, checker);
    /*
     * A UNION props type is one component with two call shapes (`<Select options>` vs the compound
     * children; a range picker vs a single one). `getPropertiesOfType` on a union returns only what
     * every member has IN COMMON, so the entire data-driven half of `Select` — `options`,
     * `loadOptions`, `showSearch`, and every antd prop hanging off them — was absent from the
     * manifest, and absent is what an agent reads as "does not exist" (see
     * docs/WHAT-BELONGS-HERE.md on `pad`/`padRaw`). Each member is enumerated instead and the
     * results deduped by name.
     *
     * `required` is deliberately the AND across the members that declare the prop: a prop required
     * in one shape and absent from another cannot be demanded of every call site.
     */
    const declaredHere = (prop) =>
      (prop.declarations ?? []).some((declaration) => {
        const filename = declaration.getSourceFile().fileName;
        return (
          filename.includes(`${path.sep}src${path.sep}components${path.sep}`) ||
          filename.includes(`${path.sep}src${path.sep}props${path.sep}components${path.sep}`)
        );
      });
    const propsOfType = (type) => {
      if (!type.isUnion()) return checker.getPropertiesOfType(type);
      const byName = new Map();
      for (const member of type.types) {
        for (const prop of checker.getPropertiesOfType(member)) {
          const seen = byName.get(prop.name);
          // The member that DECLARES the prop here wins. Both `Select` shapes carry `aria-label`,
          // but only one declares it in this repo's prop files; keeping the other one made the
          // ownership filter below drop the prop from the manifest entirely.
          if (!seen || (!declaredHere(seen) && declaredHere(prop))) byName.set(prop.name, prop);
        }
      }
      return [...byName.values()];
    };
    const props = [];
    for (const prop of propsOfType(propsType)) {
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
      const isHandledByImplementation = implementationReadProps.has(prop.name);
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
          ...new Set(declarations.map((item) => declaredPathForRoot(item.getSourceFile().fileName))),
        ].sort(),
      });
    }
    components[name] = {
      group: directory.name,
      props: props.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }
  }

  return {
    schemaVersion: 1,
    generatedBy: "scripts/gen-component-api-manifest.mjs",
    components: Object.fromEntries(Object.entries(components).sort(([a], [b]) => a.localeCompare(b))),
  };
}

async function runCli() {
  const manifest = buildComponentApiManifest();
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
    console.log(
      `component API manifest current: ${Object.keys(manifest.components).length} callable exports`,
    );
  } else {
    fs.writeFileSync(output, serialized);
    console.log(
      `wrote component-api-manifest.json (${Object.keys(manifest.components).length} callable exports)`,
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runCli();
}

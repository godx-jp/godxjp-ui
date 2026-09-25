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
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node)) {
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

/**
 * Is the rest binding SPREAD onward — `<Input {...props} />`, `{...rest}` into another element or
 * an options object? If so every remaining prop is genuinely forwarded, and the component accepts
 * it whether or not it names it.
 *
 * WHY THIS EXISTS. The AST detector that replaced the old source-grep counted only props the
 * implementation destructures or reads by name, which is right for the ghost it was written to
 * kill (a prop mentioned in a COMMENT was being published). It was wrong for the pass-through
 * case, and the wrongness was measurable: `PasswordInput` takes `{ className, …, ...props }` and
 * writes `<Input {...props} />`, so `value` reaches a real `<input>` — and the manifest dropped it,
 * turning `main` red on `audit:component-cases` with "evidence references a stale or nonexistent
 * public prop". The prop was neither stale nor nonexistent.
 *
 * A comment can never produce a spread, so recognising this does not bring the ghosts back.
 */
function bindingIsSpreadOnward(body, bindingNames) {
  const forwarded = new Set();
  const visit = (node) => {
    const isOurs = (expr) => expr && ts.isIdentifier(expr) && bindingNames.has(expr.text);

    // `<El {...props} />` — but ONLY when `El` can actually mean something by these props.
    //
    // The narrowing is the whole point. A first cut counted every spread, and it brought the
    // ghosts straight back: `Text` spreads its rest onto a `<span>`, so `defaultValue` reappeared
    // as a published prop of `Text` — a prop that would land on a span and do nothing, which is
    // exactly the "told about a prop that does not exist" failure this file exists to prevent.
    //
    // A form control is the line. `value`, `checked`, `defaultValue`, `name`, `required` MEAN
    // something to input/select/textarea/button and to a component of ours that wraps one; they
    // mean nothing to a div or a span. Capitalised tags are ours by JSX rule, and the ownership
    // filter above has already decided whether those are in scope.
    if (ts.isJsxSpreadAttribute(node) && isOurs(node.expression)) {
      // A JsxSpreadAttribute's parent is the JsxAttributes bag, and ITS parent is the element.
      // Reading `node.parent.tagName` looks right and is always undefined — measured: it silently
      // classified every spread as "not a control", which is the same failure wearing the fix.
      const opening = node.parent?.parent;
      const tag = opening && opening.tagName ? opening.tagName.getText() : "";
      const accepted = FORWARD_TARGETS.get(tag);
      if (accepted) for (const name of accepted) forwarded.add(name);
    }

    // `{ ...props }` into an object literal is NOT counted: where that object goes cannot be seen
    // from here, and guessing is how the ghosts got in.
    ts.forEachChild(node, visit);
  };
  if (body) visit(body);
  return forwarded;
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
    if (
      ts.isVariableDeclaration(node) &&
      ts.isObjectBindingPattern(node.name) &&
      node.initializer
    ) {
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
    else if (ts.isStringLiteral(propName) || ts.isNumericLiteral(propName))
      names.push(propName.text);
  }
  return names;
}

/**
 * Inherited behavioral props the implementation actually touches — parameter destructure,
 * `props.foo`, or `props["foo"]` on the props binding only (not comments/strings).
 */
/**
 * The only spread targets that make an inherited behavioural prop REAL.
 *
 * Deliberately a NAMED LIST, not a rule like "any capitalised tag", and the difference was
 * measured. `Text` is `(props) => <TextBase {...props} />`, so a capitalised-tag rule published
 * `Text.defaultValue` — a prop that is forwarded to another of our own components and never
 * reaches anything that could use it. That is the ghost this file exists to stop, re-entering
 * through the fix for the opposite bug.
 *
 * Native form controls qualify because `value`/`checked`/`name`/`required` mean something to them.
 * A component of ours qualifies only when it IS one of those with chrome around it, and adding a
 * name here should come with the reason — same discipline as `EXEMPT` in check-gate-coverage.mjs
 * and `DECLARED_OFF_SCALE` in the icon-size tests.
 */
const FORWARD_TARGETS = new Map([
  // Each target maps to the inherited props it MEANINGFULLY accepts — and the list is deliberately
  // the MINIMUM that repairs the known defect, not everything the DOM would tolerate.
  //
  // Two wrong cuts were measured before this one. A flat set of "control-ish tags" re-added 26
  // ghosts, including `CarouselNext.defaultChecked` — a button has no checked state. Listing every
  // attribute the element accepts then added 17 props that had never been published, and `Input`
  // and `PasswordInput` carry `complete: true` in component-case-evidence.json, so each new prop
  // demands evidence that does not exist. Publishing a prop with invented evidence is worse than
  // not publishing it.
  //
  // So this change is a REPAIR: it restores `PasswordInput.value`, which the AST rewrite dropped
  // and which `audit:component-cases` correctly complained about. Widening these lists is a
  // separate change that has to bring its evidence with it.
  ["input", ["value"]],
  ["Input", ["value"]],
]);

export function collectImplementationReadProps(resolvedSymbol, checker) {
  const read = new Set();
  for (const declaration of resolvedSymbol.declarations ?? []) {
    const sourceFile = declaration.getSourceFile();
    const fileName = sourceFile.fileName;
    if (!fileName.includes(`${path.sep}src${path.sep}components${path.sep}`)) continue;

    for (const callback of componentCallbacksFromDeclaration(declaration, sourceFile, checker)) {
      const firstParam = callback.parameters[0];
      if (!firstParam) continue;

      if (ts.isObjectBindingPattern(firstParam.name)) {
        for (const name of collectObjectBindingPropNames(firstParam.name)) read.add(name);
        const bindings = new Set(restBindingNames(firstParam.name));
        if (bindings.size) {
          visitBindingPropAccess(callback.body, bindings, read);
          for (const name of bindingIsSpreadOnward(callback.body, bindings)) read.add(name);
        }
        continue;
      }

      if (!ts.isIdentifier(firstParam.name)) continue;
      const whole = new Set([firstParam.name.text]);
      visitBindingPropAccess(callback.body, whole, read);
      for (const name of bindingIsSpreadOnward(callback.body, whole)) read.add(name);
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

  /**
   * The same truncation, applied to the `import("…")` specifiers INSIDE a stringified type.
   *
   * `checker.typeToString` spells an external type as `import("<specifier>").Name`, and that
   * specifier is resolved RELATIVE TO THE FILE, so its `../` depth is a fact about where the
   * checkout happens to sit — not about the API. Generated from the repo root it reads
   * `../../../node_modules/…`; generated from `.claude/worktrees/agent-<id>/`, where every writing
   * agent works by standing rule, it reads `../../../../../../node_modules/…`. Same source, same
   * types, different file, and `check:component-api-manifest` red for whoever committed last
   * (gh#870).
   *
   * `declaredPathForRoot` above has always been immune because it truncates at the last
   * `node_modules/`; the type string simply never got the same treatment. Truncating here makes
   * the two agree and, incidentally, collapses the two spellings TypeScript emits for one package
   * (`.pnpm/embla-carousel@8.6.0/node_modules/embla-carousel` and `../../../node_modules/.pnpm/…`)
   * onto one.
   *
   * The separator is `/`, not `path.sep`: TypeScript normalises specifiers, so this is not a
   * filesystem path even on Windows.
   */
  function stableTypeText(text) {
    return text.replace(/import\("([^"]*)"\)/g, (whole, specifier) => {
      const marker = specifier.lastIndexOf("node_modules/");
      return marker === -1 ? whole : `import("${specifier.slice(marker)}")`;
    });
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
      if (!signature) continue;
      /*
       * A COMPONENT WITH NO PROPS IS STILL A COMPONENT (gh#957).
       *
       * This used to be `if (!parameter) continue`, because the manifest's whole model is "take the
       * first parameter and enumerate its properties". A fixed shape has nothing to take:
       *
       *     export function SkeletonDetail() { … }   // the house shape for a record
       *     export function SkeletonStat() { … }     // the house shape for a KPI tile
       *
       * so both were read as "not a component" and never entered the manifest — which means
       * `every-public-name-answers.test.ts` never asked about them either, since it takes its keys
       * FROM the manifest. Same shape as the gh#553 defect that gate exists to stop: nothing that
       * validates entries can see a name that never became one. Measured: 10 of the 12 `Skeleton*`
       * components were present, and the two missing ones are exactly the two that take no props.
       *
       * Admitting them is safe rather than a widening: across every public barrel, exactly these
       * two exports have a call signature and zero parameters (measured, not assumed) — SCREAMING_
       * CASE constants like `CHART_COLORS` already fail the PascalCase test above, and utilities
       * like `cn` fail it too and are collected separately as `utilities` below.
       */
      const parameter = signature.parameters[0];
      if (!parameter) {
        components[name] = { group: directory.name, props: [] };
        continue;
      }
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
          type: stableTypeText(
            checker.typeToString(propType, declaration, ts.TypeFormatFlags.NoTruncation),
          ),
          values: literalValues(propType),
          declaredIn: [
            ...new Set(
              declarations.map((item) => declaredPathForRoot(item.getSourceFile().fileName)),
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

  /*
   * THE NON-COMPONENT HALF OF THE PUBLIC SURFACE (gh#951).
   *
   * Two independent rules kept every hook and utility out of this file, and both had to go:
   *
   *   `if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) continue`   → `cn`, `useDebouncedValue`, `toast`
   *   the loop only visits `src/components/<group>/index.ts` → `cn` lives at the ROOT barrel only,
   *                                                            so it was never even reached
   *
   * The cost was measured in godx-jp/godxjp-ui#947: `godx-task` and `godx-chat` each hand-wrote a
   * byte-identical 12-line `lib/utils.ts` wrapping `clsx`, while `cn` has shipped from the root of
   * this package all along. An agent asked the MCP how to merge classNames, got
   * `Component "cn" not found`, and wrote its own. That is a DISCOVERABILITY defect, and no new
   * package fixes it — under #947's own boundary `cn` stays here.
   *
   * These get their own section rather than joining `components`, because everything reading
   * `manifest.components` assumes "has props": `cn(...inputs)` and `useDebouncedValue(value, delay)`
   * have no props object to enumerate, so folding them in would hand every consumer of this file
   * entries it cannot interpret.
   */
  const utilities = {};
  const utilityBarrels = [[".", "src/index.ts"]];
  for (const directory of fs
    .readdirSync(path.join(rootDir, "src/components"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory()))
    utilityBarrels.push([
      `./${directory.name}`,
      `src/components/${directory.name}/index.ts`,
    ]);

  for (const [subpath, relative] of utilityBarrels) {
    const barrelPath = path.join(rootDir, relative);
    if (!fs.existsSync(barrelPath)) continue;
    const sourceFile = program.getSourceFile(barrelPath);
    if (!sourceFile) continue;
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) continue;
    for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
      const name = symbol.name;
      if (components[name]) continue;
      const resolved =
        symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      // A type-only export has no runtime identity, so it is not something to call or read.
      const isValue = Boolean(
        resolved.flags &
          (ts.SymbolFlags.Function | ts.SymbolFlags.Variable | ts.SymbolFlags.Method),
      );
      if (!isValue) continue;
      const type = checker.getTypeOfSymbolAtLocation(symbol, sourceFile);
      const signature = type.getCallSignatures()[0];
      /*
       * `kind` is what an agent needs before it can use the thing at all: a hook is only legal
       * inside a component body under the rules of hooks, a function is callable anywhere, and a
       * value is neither. Keyed on the `use` prefix because that IS React's rule — the linter and
       * the runtime both read the name, so nothing more authoritative exists to key on.
       */
      const kind = /^use[A-Z]/.test(name) ? "hook" : signature ? "function" : "value";
      const existing = utilities[name];
      if (existing) {
        if (!existing.subpaths.includes(subpath)) existing.subpaths.push(subpath);
        continue;
      }
      utilities[name] = {
        kind,
        // Every published subpath it is reachable from. A consumer copying an import needs one that
        // exists, and several of these are re-exported by `./admin` as well as the root.
        subpaths: [subpath],
        signature: stableTypeText(
          signature
            ? checker.signatureToString(signature, sourceFile, ts.TypeFormatFlags.NoTruncation)
            : checker.typeToString(type, sourceFile, ts.TypeFormatFlags.NoTruncation),
        ),
        declaredIn: [
          ...new Set(
            (resolved.declarations ?? []).map((declaration) =>
              declaredPathForRoot(declaration.getSourceFile().fileName),
            ),
          ),
        ].sort(),
      };
    }
  }

  /*
   * STILL schemaVersion 1, deliberately. `utilities` is purely ADDITIVE: every reader here touches
   * `manifest.components` and keeps working untouched, so there is no incompatible shape for a
   * version to warn about — and this field is a bare integer with no way to say "additive". A
   * reader that needs to know whether this section exists asks `"utilities" in manifest`, which is
   * both more precise than an integer and impossible to get wrong. Bumping it would only break
   * `scripts/check-component-case-evidence.mjs`, which pins manifest and evidence to 1 in one
   * condition (and which no npm script currently runs).
   */
  return {
    schemaVersion: 1,
    generatedBy: "scripts/gen-component-api-manifest.mjs",
    components: Object.fromEntries(
      Object.entries(components).sort(([a], [b]) => a.localeCompare(b)),
    ),
    utilities: Object.fromEntries(
      Object.entries(utilities)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, entry]) => [name, { ...entry, subpaths: entry.subpaths.sort() }]),
    ),
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

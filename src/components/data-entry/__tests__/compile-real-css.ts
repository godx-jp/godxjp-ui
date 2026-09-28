import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { compile } from "tailwindcss";

const ROOT = process.cwd();

/**
 * The package's REAL stylesheet (`styles/core`: tokens, every layout layer, Tailwind preflight)
 * compiled for exactly the utility classes `markup` uses — for geometry tests in Chromium, where a
 * hand-picked subset of layers would leave out the utility or reset that moves the box (gh#1023,
 * gh#1024). ~0.1s. Vendor sheets that do not resolve from the repo root are skipped: nothing a
 * form lays out comes from them.
 */
export async function compileRealCss(markup: string): Promise<string> {
  const loadStylesheet = async (id: string, base: string) => {
    let path: string;
    if (id.startsWith(".") || id.startsWith("/")) path = resolve(base, id);
    else {
      const pkg = join(ROOT, "node_modules", id);
      if (existsSync(pkg) && statSync(pkg).isFile()) path = pkg;
      else if (existsSync(join(pkg, "package.json"))) {
        const manifest = JSON.parse(readFileSync(join(pkg, "package.json"), "utf8"));
        path = join(pkg, manifest.exports?.["."]?.style ?? manifest.style ?? "index.css");
      } else return { path: pkg, base, content: "" };
    }
    return { path, base: dirname(path), content: readFileSync(path, "utf8") };
  };
  const entry = join(ROOT, "src/styles/core.css");
  const compiler = await compile(readFileSync(entry, "utf8"), {
    base: dirname(entry),
    loadStylesheet,
  });
  const candidates = [...markup.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1]!.split(/\s+/));
  return compiler.build(candidates);
}

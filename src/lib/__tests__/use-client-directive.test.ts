import { describe, expect, it } from "vitest";

import { clientSources, isClientSource } from "../../../scripts/add-use-client.mjs";

// Guards the gh#128 "use client" detector (scripts/add-use-client.mjs) so the RSC boundary set
// can't silently drift. The build stamps "use client" onto exactly these modules; check:use-client
// enforces the dist result. Here we test the detection LOGIC against real source.

describe("use client detection (gh#128 — Next.js App Router RSC)", () => {
  it("flags direct client usage: createContext, hook calls (incl. custom + generics), client deps", () => {
    expect(isClientSource(`const C = createContext(null);`)).toBe(true);
    expect(isClientSource(`function X(){ const [s] = useState(0); }`)).toBe(true);
    expect(isClientSource(`const { t } = useTranslation();`)).toBe(true); // custom hook call
    expect(isClientSource(`const r = useRef<HTMLDivElement>(null);`)).toBe(true); // generic hook
    expect(isClientSource(`import { Slot } from "@radix-ui/react-slot";`)).toBe(true);
    expect(isClientSource(`import { toast } from "sonner";`)).toBe(true);
  });

  it("does NOT flag pure server-safe code", () => {
    expect(isClientSource(`export const cn = (...a) => twMerge(clsx(a));`)).toBe(false);
    expect(isClientSource(`import { format } from "date-fns"; export const fmt = format;`)).toBe(false);
    expect(isClientSource(`export type Foo = { a: string };`)).toBe(false);
    // a hook NAME in an import (no call) or a member like `schema.useField` type — not a bare call
    expect(isClientSource(`import { useTranslation } from "../i18n";`)).toBe(false);
  });

  it("classifies the real source tree: interactive components + wrappers are client", () => {
    const client = [...clientSources()].map((p) => p.replace(/\\/g, "/"));
    const has = (suffix: string) => client.some((p) => p.endsWith(suffix));

    // direct client usage
    expect(has("src/components/general/button.tsx")).toBe(true); // useTranslation + Radix Slot
    expect(has("src/i18n/use-translation.tsx") || has("src/i18n/use-translation.ts")).toBe(true); // createContext
    expect(has("src/app/app-provider.tsx")).toBe(true);
    // transitive: a wrapper rendering a client child must itself be a client boundary
    expect(has("src/components/charts/area-chart.tsx")).toBe(true); // -> CartesianChart (recharts)
  });

  it("keeps pure utils, data, and .ts re-export barrels SERVER (importable from an RSC)", () => {
    const client = [...clientSources()].map((p) => p.replace(/\\/g, "/"));
    const has = (suffix: string) => client.some((p) => p.endsWith(suffix));

    expect(has("src/lib/utils.ts")).toBe(false); // cn()
    expect(has("src/lib/datetime/index.ts")).toBe(false);
    expect(has("src/props/index.ts")).toBe(false);
    expect(has("src/components/general/index.ts")).toBe(false); // re-export barrel stays server
    expect(has("src/index.ts")).toBe(false); // root admin surface barrel
    // a pure presentational component (no hooks, no client import) stays server-renderable
    expect(has("src/components/general/typography.tsx")).toBe(false); // Text / Heading
  });
});

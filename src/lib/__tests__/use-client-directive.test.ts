import { describe, expect, it } from "vitest";

import { clientSources, isClientSource } from "../../../scripts/add-use-client.mjs";

// Guards the "use client" detector (scripts/add-use-client.mjs) so the RSC boundary set
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
    expect(isClientSource(`import { format } from "date-fns"; export const fmt = format;`)).toBe(
      false,
    );
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
    expect(has("src/components/general/visually-hidden.tsx")).toBe(false);
  });

  it("records typography.tsx leaving the server set, and what that cost", () => {
    // Text and Heading WERE server-renderable, and this file asserted it. antd's
    // `Typography.Text` declares `copyable`, `editable` and `ellipsis`; all three need state, so
    // porting them (docs/DESIGN-AUTHORITY.md — antd is the standard) takes a hook call and the
    // module is stamped.
    //
    // The alternative was a SECOND component also called Text, one static and server, one
    // complete and client — a worse failure than the one being accepted here. The cost is the
    // bundle graph only: a server component may still RENDER <Text>, nothing about its API or
    // its DOM changes, and `Button` (as ubiquitous, and beside almost every Text on a real
    // screen) has been client all along, so a page with any control was already past the
    // boundary.
    //
    // Pinned rather than deleted: if this ever flips back to false, someone removed the antd
    // behaviour and should say so.
    const client = [...clientSources()].map((p) => p.replace(/\\/g, "/"));
    const has = (suffix: string) => client.some((p) => p.endsWith(suffix));
    expect(has("src/components/general/typography.tsx")).toBe(true);
    // The barrel STAYS server, which is what `check:use-client`'s MUST_BE_SERVER list depends on:
    // the client fixpoint propagates only through `.tsx` files, and this one is `.ts`.
    expect(has("src/components/general/index.ts")).toBe(false);
  });
});

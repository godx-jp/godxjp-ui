/**
 * Loader for the code-split card tab strip (./card-tab-strip). Internal — not exported from the
 * barrel.
 *
 * The loaded module is CACHED, and once it is, the lazy factory hands React a thenable that
 * resolves SYNCHRONOUSLY: React's `lazy` reads a synchronously-resolved thenable in the same render,
 * so a tabbed card rendered after the strip has loaded once (anywhere) draws its strip with no
 * fallback frame. Only the very first tabbed card on a page shows its body alone for a tick.
 */
type StripModule = typeof import("./card-tab-strip");

let loaded: StripModule | undefined;

/** Load (once) and cache the strip module. Await it to make the next tabbed card synchronous. */
export function loadCardTabStrip(): Promise<StripModule> {
  return import("./card-tab-strip").then((module) => {
    loaded = module;
    return module;
  });
}

/** The factory `React.lazy` calls: synchronous once cached, the dynamic import before that. */
export function cardTabStripFactory(): PromiseLike<StripModule> {
  if (loaded) {
    const module = loaded;
    return {
      then<R1 = StripModule, R2 = never>(
        onFulfilled?: ((value: StripModule) => R1 | PromiseLike<R1>) | null,
      ): PromiseLike<R1 | R2> {
        return Promise.resolve(onFulfilled ? onFulfilled(module) : (module as unknown as R1));
      },
    };
  }
  return loadCardTabStrip();
}

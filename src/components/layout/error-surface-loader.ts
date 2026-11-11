/**
 * Lazy loader for ErrorSurface as used by PageErrorBoundary's DEFAULT fallback. Internal — not
 * exported from the barrel.
 *
 * AppShell wraps every route in a PageErrorBoundary, so a STATIC import of ErrorSurface put it —
 * and through it Card, Descriptions, EmptyState, Progress — into every consumer's up-front
 * graph, for a surface that only draws after a page has thrown. The module is cached once
 * loaded, and the factory then returns a synchronously-resolved thenable, which `React.lazy`
 * reads in the same render (the same technique as card-tab-strip-loader.ts).
 */
type ErrorSurfaceModule = typeof import("./error-surface");

let loaded: ErrorSurfaceModule | undefined;

/** Load (once) and cache the ErrorSurface module. */
export function loadErrorSurface(): Promise<ErrorSurfaceModule> {
  return import("./error-surface").then((module) => {
    loaded = module;
    return module;
  });
}

/** The factory `React.lazy` calls: synchronous once cached, the dynamic import before that. */
export function errorSurfaceFactory(): PromiseLike<{
  default: ErrorSurfaceModule["ErrorSurface"];
}> {
  const toDefault = (module: ErrorSurfaceModule) => ({ default: module.ErrorSurface });
  if (loaded) {
    const module = loaded;
    return {
      then<R1, R2 = never>(
        onFulfilled?:
          ((value: { default: ErrorSurfaceModule["ErrorSurface"] }) => R1 | PromiseLike<R1>) | null,
      ): PromiseLike<R1 | R2> {
        return Promise.resolve(
          onFulfilled ? onFulfilled(toDefault(module)) : (toDefault(module) as unknown as R1),
        );
      },
    };
  }
  return loadErrorSurface().then(toDefault);
}

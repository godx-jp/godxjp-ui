import * as React from "react";

/**
 * Test-only guard that surfaces runaway re-render loops as a clear error instead
 * of a hung test. Counts its own renders; once they exceed `maxRenders` it throws,
 * so an effect/state loop in the tree under test fails fast and legibly.
 *
 * Self-contained (no external tooling dependency) — see docs/DEVELOPMENT.md §5.
 */
const DEFAULT_MAX_RENDERS = 50;

export type RenderLoopGuardProps = {
  children: React.ReactNode;
  /** Render budget before the guard throws. */
  maxRenders?: number;
  /** Optional label included in the error for easier triage. */
  label?: string;
};

export function RenderLoopGuard({
  children,
  maxRenders = DEFAULT_MAX_RENDERS,
  label,
}: RenderLoopGuardProps): React.ReactElement {
  const renders = React.useRef(0);
  renders.current += 1;

  if (renders.current > maxRenders) {
    throw new Error(
      `Possible infinite render loop${label ? ` in "${label}"` : ""}: ` +
        `exceeded ${maxRenders} renders.`,
    );
  }

  return <>{children}</>;
}

export type RenderLoopGuardOptions = Pick<RenderLoopGuardProps, "maxRenders" | "label">;

/** Wrap a UI element in the guard (inside StrictMode, to surface loops sooner). */
export function withRenderLoopGuard(
  ui: React.ReactElement,
  options?: RenderLoopGuardOptions,
): React.ReactElement {
  return (
    <React.StrictMode>
      <RenderLoopGuard {...options}>{ui}</RenderLoopGuard>
    </React.StrictMode>
  );
}

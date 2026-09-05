import type { ReactNode } from "react";

export type SplitPaneProps = {
  children: ReactNode;
  /**
   * Aside (trailing) panel content. Pass `null` to CLOSE the rail: no `<aside>` element is
   * rendered, the grid drops to one full-width column and the gap goes with it.
   */
  aside: ReactNode | null;
  /**
   * How wide the rail is once the pane is wide enough to split: `sm` 20rem,
   * `md` 22rem, `lg` 30rem. `lg` is for rails that carry a panel rather than a
   * list — a metadata table, a recently-updated feed — and it holds off
   * splitting until 64rem so the main column stays the wider of the two.
   */
  asideWidth?: "sm" | "md" | "lg";
  /** Accessible complementary landmark name; required when multiple panes share a document. */
  asideLabel?: string;
};

export function SplitPane({ children, aside, asideWidth = "md", asideLabel }: SplitPaneProps) {
  // `aside={null}` closes the rail. The state is published as `data-aside="closed"` on
  // `.ui-split-pane` so the geometry is decided by ONE attribute on the grid element itself —
  // never by a `:has()` / child selector, which would make the layout depend on what the
  // consumer happened to put inside. Open emits no attribute at all, so the open state is
  // byte-identical to what it has always been.
  const closed = aside === null || aside === undefined;

  // The scope wrapper establishes the pane's OWN query container (container-type: inline-size) so
  // the split decision comes from the pane's available width, not the viewport: a narrow embedded
  // pane on a large screen correctly stays single-column, and a wide pane on a small screen can
  return (
    <div className="ui-split-pane-scope">
      <div
        className="ui-split-pane"
        data-aside-width={asideWidth}
        data-aside={closed ? "closed" : undefined}
      >
        <div className="ui-split-pane-main">{children}</div>
        {closed ? null : (
          <aside className="ui-split-pane-aside" aria-label={asideLabel}>
            {aside}
          </aside>
        )}
      </div>
    </div>
  );
}

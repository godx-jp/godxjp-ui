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
  /**
   * Fill the remaining height of the parent instead of growing with the content.
   *
   * Default `false` keeps the pane content-height — the right answer for a pane that sits in a
   * scrolling page. Set it for an app-shell surface whose columns own their own scrolling (a chat
   * transcript with a pinned composer, a full-height table beside a detail rail): the pane and
   * both columns get a DEFINITE height, so `overflow` inside a column scrolls that column rather
   * than pushing the page taller.
   *
   * The parent still decides how much height there is to fill — `fill` claims 100% of it, it does
   * not invent it. Inside a flex column give the wrapper `flex: 1; min-height: 0`.
   */
  fill?: boolean;
};

export function SplitPane({
  children,
  aside,
  asideWidth = "md",
  asideLabel,
  fill = false,
}: SplitPaneProps) {
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
    // `data-fill` is published on BOTH wrappers, not just the grid: the scope element is the one
    // the consumer's own box actually contains, so without it the height stops at the scope and
    // the grid has nothing definite to fill. Two attributes here are what keeps the consumer from
    // reaching past its own child with `[&>*>*]` to say the same thing.
    <div className="ui-split-pane-scope" data-fill={fill ? "true" : undefined}>
      <div
        className="ui-split-pane"
        data-aside-width={asideWidth}
        data-aside={closed ? "closed" : undefined}
        data-fill={fill ? "true" : undefined}
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

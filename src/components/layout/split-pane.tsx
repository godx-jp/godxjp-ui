import type { ReactNode } from "react";

export type SplitPaneProps = {
  children: ReactNode;
  /**
   * Aside (trailing) panel content. Pass `null` to CLOSE the rail: no `<aside>` element is
   * rendered, the grid drops to one full-width column and the gap goes with it.
   *
   * Closing this way — rather than dropping the whole `SplitPane` at the call site — is what
   * keeps `children` MOUNTED. The three wrappers below are rendered unconditionally, so the
   * main column sits at the same depth and the same slot in the React tree in both states and
   * React reuses its DOM node instead of remounting it. A collapsible thread/detail panel that
   * swapped `<SplitPane>{page}</SplitPane>` for a bare `{page}` changed the tree depth, which
   * remounted the page and threw the reader to the bottom of a scrolled list.
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
  // split (gh#165 — replaces the old `@media (min-width: 1080px)` viewport query).
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

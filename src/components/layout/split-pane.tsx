import type { ReactNode } from "react";

export type SplitPaneProps = {
  children: ReactNode;
  aside: ReactNode;
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
  // The scope wrapper establishes the pane's OWN query container (container-type: inline-size) so
  // the split decision comes from the pane's available width, not the viewport: a narrow embedded
  // pane on a large screen correctly stays single-column, and a wide pane on a small screen can
  // split (gh#165 — replaces the old `@media (min-width: 1080px)` viewport query).
  return (
    <div className="ui-split-pane-scope">
      <div className="ui-split-pane" data-aside-width={asideWidth}>
        <div className="ui-split-pane-main">{children}</div>
        <aside className="ui-split-pane-aside" aria-label={asideLabel}>
          {aside}
        </aside>
      </div>
    </div>
  );
}

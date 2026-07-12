import type { ReactNode } from "react";

export type SplitPaneProps = {
  children: ReactNode;
  aside: ReactNode;
  asideWidth?: "sm" | "md";
  /** Accessible complementary landmark name; required when multiple panes share a document. */
  asideLabel?: string;
};

export function SplitPane({ children, aside, asideWidth = "md", asideLabel }: SplitPaneProps) {
  return (
    <div className="ui-split-pane" data-aside-width={asideWidth}>
      <div className="ui-split-pane-main">{children}</div>
      <aside className="ui-split-pane-aside" aria-label={asideLabel}>
        {aside}
      </aside>
    </div>
  );
}

import type { ReactNode } from "react";

export type SplitPaneProps = {
  children: ReactNode;
  aside: ReactNode;
  asideWidth?: "sm" | "md";
};

export function SplitPane({ children, aside, asideWidth = "md" }: SplitPaneProps) {
  // The scope wrapper establishes the pane's OWN query container (container-type: inline-size) so
  // the split decision comes from the pane's available width, not the viewport: a narrow embedded
  // pane on a large screen correctly stays single-column, and a wide pane on a small screen can
  // split (gh#165 — replaces the old `@media (min-width: 1080px)` viewport query).
  return (
    <div className="ui-split-pane-scope">
      <div className="ui-split-pane" data-aside-width={asideWidth}>
        <div className="ui-split-pane-main">{children}</div>
        <aside className="ui-split-pane-aside">{aside}</aside>
      </div>
    </div>
  );
}

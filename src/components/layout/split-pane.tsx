import type { ReactNode } from "react";

export type SplitPaneProps = {
  children: ReactNode;
  aside: ReactNode;
  asideWidth?: "sm" | "md";
};

export function SplitPane({ children, aside, asideWidth = "md" }: SplitPaneProps) {
  return (
    <div className="ui-split-pane" data-aside-width={asideWidth}>
      <div className="ui-split-pane-main">{children}</div>
      <aside className="ui-split-pane-aside">{aside}</aside>
    </div>
  );
}

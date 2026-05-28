import type { ComponentType, ReactNode, SVGProps } from "react";

import { Badge } from "../data-display/badge";

export type MobileFrameNavItem = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  active?: boolean;
};

export type MobileFrameProps = {
  title: string;
  subtitle?: string;
  status?: string;
  children: ReactNode;
  navItems?: MobileFrameNavItem[];
};

export function MobileFrame({
  title,
  subtitle,
  status,
  children,
  navItems = [],
}: MobileFrameProps) {
  return (
    <div className="ui-mobile-stage">
      <div className="ui-mobile-frame">
        <header className="ui-mobile-header">
          <div>
            <div className="ui-mobile-title">{title}</div>
            {subtitle ? <div className="ui-mobile-subtitle">{subtitle}</div> : null}
          </div>
          {status ? <Badge variant="secondary">{status}</Badge> : null}
        </header>
        <main className="ui-mobile-main">{children}</main>
        {navItems.length > 0 ? (
          <footer className="ui-mobile-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  className="ui-mobile-nav-item"
                  data-active={item.active ? "true" : undefined}
                  key={item.label}
                >
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

import { AppShell } from "./app-shell";
import { Topbar } from "./topbar";

export type ShellAppProps = {
  menu: ReactNode;
  breadcrumb?: ReactNode;
  children: ReactNode;
};

export function ShellApp({ menu, breadcrumb, children }: ShellAppProps) {
  return (
    <AppShell
      sidebar={menu}
      breadcrumb={breadcrumb}
      topbar={
        <Topbar
          product={{ name: "GodX", color: "hsl(var(--attention))" }}
          project={{ name: "Japan to SEA lanes" }}
          onSearchOpen={() => undefined}
          onNotificationsOpen={() => undefined}
          unread
        />
      }
    >
      {children}
    </AppShell>
  );
}

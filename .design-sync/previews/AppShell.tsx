import { AppShell, PageContainer, Sidebar, Topbar } from "@godxjp/ui";
import { LayoutDashboard, MessagesSquare, Users } from "lucide-react";

const sections = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { id: "chat", label: "Chat", icon: MessagesSquare, href: "/chat", badge: "12" },
      { id: "people", label: "People", icon: Users, href: "/people" },
    ],
  },
];

export function Default() {
  return (
    <div style={{ height: 620 }}>
      <AppShell
        sidebar={<Sidebar activeId="chat" sections={sections} />}
        topbar={<Topbar start={<strong style={{ fontSize: 13 }}>GoDX Chatter</strong>} />}
      >
        <PageContainer
          title="Customer support"
          subtitle="Intake and triage for inbound requests."
        >
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, maxWidth: "65ch" }}>
            The shell owns the grid: a sidebar rail, a topbar, and a scrolling main
            region. Page content goes inside a PageContainer so every screen inherits
            the same title, padding and breadcrumb slot.
          </p>
        </PageContainer>
      </AppShell>
    </div>
  );
}

export function NarrowRail() {
  return (
    <div style={{ height: 620 }}>
      <AppShell
        sidebarCollapsed
        sidebar={<Sidebar activeId="chat" collapsed sections={sections} />}
        topbar={<Topbar start={<strong style={{ fontSize: 13 }}>GoDX Chatter</strong>} />}
      >
        <PageContainer title="Customer support">
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, maxWidth: "65ch" }}>
            Collapsing the rail hands the width back to the content. The shell and the
            sidebar share one boolean so the grid track and the rail stay in step.
          </p>
        </PageContainer>
      </AppShell>
    </div>
  );
}

import { AppShell, Sidebar } from "@godxjp/ui";
import {
  BookOpen,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Shield,
  Users,
} from "lucide-react";

/*
 * Sidebar được dựng BÊN TRONG AppShell, đúng như tài liệu của DS yêu cầu:
 * nó không phải một khối đứng một mình mà là một rãnh trong lưới của shell.
 * Đặt nó vào một thẻ div rỗng thì nav sập và logo/footer văng ra hai phía —
 * đã thấy đúng như vậy khi thử.
 */
const sections = [
  {
    label: "Operations",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { id: "chat", label: "Chat", icon: MessagesSquare, href: "/chat", badge: "12" },
      {
        id: "ledger",
        label: "Ledger",
        icon: BookOpen,
        children: [
          { id: "journal", label: "Journal", icon: FileText, href: "/ledger/journal" },
          { id: "coa", label: "Chart of accounts", icon: CreditCard, href: "/ledger/coa" },
        ],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "users", label: "Users", icon: Users, href: "/users" },
      { id: "roles", label: "Roles", icon: Shield, href: "/roles", disabled: true },
    ],
  },
];

export function Default() {
  return (
    <div style={{ height: 480 }}>
      <AppShell
        sidebar={
          <Sidebar
            activeId="chat"
            sections={sections}
            product={{ name: "GoDX Chatter", role: "Betoya HQ", color: "hsl(var(--primary))" }}
            footer={
              <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 500 }}>佐藤 美咲</div>
                <div style={{ opacity: 0.7 }}>Online · Tokyo</div>
              </div>
            }
          />
        }
      >
        <div style={{ padding: 24, fontSize: 14, opacity: 0.7 }}>
          Nav sections, an active row with a badge, a collapsible group, and a
          pinned footer.
        </div>
      </AppShell>
    </div>
  );
}

export function Rail() {
  return (
    <div style={{ height: 480 }}>
      <AppShell
        sidebarCollapsed
        sidebar={<Sidebar activeId="chat" collapsed sections={sections} />}
      >
        <div style={{ padding: 24, fontSize: 14, opacity: 0.7 }}>
          Collapsed to an icon rail. Labels become tooltips; groups open in a
          flyout.
        </div>
      </AppShell>
    </div>
  );
}

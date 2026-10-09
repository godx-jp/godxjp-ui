import { Avatar, AvatarFallback, Badge, Card, CardContent } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import { Bot, Building2, Settings, Users } from "lucide-react";
import { OrgChart } from "@godxjp/ui/lab";
import type { OrgChartNodeProp } from "@godxjp/ui/lab";

/**
 * OrgChart — who reports to whom, people and AI agents on one chart (gh#1034).
 *
 * Three levels: the CEO, three department heads, and their reports, two of which are AI agents.
 * An agent's box is dashed and its accessible name ends in "AI agent", so the difference is never
 * the stroke alone. The chart is an APG tree view: Tab lands on one box, the arrow keys walk it.
 *
 * Narrow the preview: under 40rem of CONTAINER width the same data turns into an indented Tree.
 * The second card is deliberately narrow to show that form beside the wide one.
 *
 * Composed only from real @godxjp/ui components.
 */
const sections: SidebarSectionProp[] = [
  {
    label: "Organization",
    items: [
      { id: "chart", label: "Org chart", icon: Building2 },
      { id: "members", label: "Members", icon: Users },
      { id: "agents", label: "Agents", icon: Bot },
    ],
  },
  { label: "Admin", items: [{ id: "settings", label: "Settings", icon: Settings }] },
];

const mark = (initials: string) => (
  <Avatar size="sm">
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
);

const agentMark = (
  <Avatar size="sm" appearance="tinted">
    <AvatarFallback>
      <Bot aria-hidden="true" />
    </AvatarFallback>
  </Avatar>
);

const org: OrgChartNodeProp[] = [
  {
    key: "ceo",
    name: "Haruka Tanaka",
    title: "Chief Executive Officer",
    avatar: mark("HT"),
    children: [
      {
        key: "cto",
        name: "Kenji Watanabe",
        title: "Chief Technology Officer",
        avatar: mark("KW"),
        children: [
          {
            key: "review-agent",
            name: "Review Agent",
            title: "Code review · pull requests",
            variant: "agent",
            avatar: agentMark,
            extra: <Badge tone="success">Running</Badge>,
          },
          {
            key: "platform",
            name: "Mai Suzuki",
            title: "Platform Lead",
            avatar: mark("MS"),
          },
        ],
      },
      {
        key: "coo",
        name: "Daniel Park",
        title: "Chief Operating Officer",
        avatar: mark("DP"),
        children: [
          {
            key: "support-agent",
            name: "Support Agent",
            title: "Tier-1 customer support",
            variant: "agent",
            avatar: agentMark,
            extra: <Badge tone="warning">Paused</Badge>,
          },
          {
            key: "ops",
            name: "Linh Nguyen",
            title: "Operations Manager",
            avatar: mark("LN"),
          },
        ],
      },
      {
        key: "cfo",
        name: "Sofia Rossi",
        title: "Chief Financial Officer",
        avatar: mark("SR"),
        children: [
          {
            key: "controller",
            name: "Takumi Ito",
            title: "Financial Controller",
            avatar: mark("TI"),
          },
        ],
      },
    ],
  },
];

export default function OrgChartDoc() {
  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId="chart"
          sections={sections}
          onSelect={() => {}}
          product={{ name: "CoreDesk", role: "Admin", color: "hsl(var(--primary))" }}
        />
      }
      topbar={<Topbar />}
    >
      <PageContainer
        title="Org chart"
        subtitle="OrgChart · people and AI agents, top-down. Dashed boxes are agents."
      >
        <Card>
          <CardContent>
            <OrgChart data={org} label="Company org chart" />
          </CardContent>
        </Card>

        {/* THE NARROW FORM: the same data under 40rem of container width. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            narrow container · the same data as a Tree
          </Text>
          <Card className="max-w-sm">
            <CardContent>
              <OrgChart data={org} label="Company org chart (list)" />
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}

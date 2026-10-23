import {
  Badge,
  Card,
  CardContent,
  DataTable,
  Persona,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { PageContainer } from "@godxjp/ui/layout";
import { useTranslation } from "@godxjp/ui/i18n";

export default function Demo() {
  const { t, locale } = useTranslation();
  const members = [
    {
      id: "1",
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      self: true,
      role: "admin",
      lastActive: "2026-10-23T09:30:00+09:00",
      active: true,
    },
    {
      id: "2",
      name: "ليلى الحسن",
      email: "layla.alhassan@example.com",
      self: false,
      role: "editor",
      lastActive: "2026-10-22T14:15:00+09:00",
      active: false,
    },
  ];
  const columns: ColumnDef<(typeof members)[number]>[] = [
    {
      key: "name",
      width: "46%",
      header: t("personaExamples.member"),
      priority: "primary",
      ellipsis: true,
      render: (member) => (
        <Persona
          name={member.name}
          description={member.email}
          trailing={
            member.self ? <Badge tone="neutral">{t("personaExamples.you")}</Badge> : undefined
          }
        />
      ),
    },
    {
      key: "role",
      width: "16%",
      header: t("personaExamples.role"),
      render: (member) => t(`personaExamples.${member.role}`),
    },
    {
      key: "lastActive",
      width: "22%",
      header: t("personaExamples.lastActive"),
      render: (member) =>
        new Intl.DateTimeFormat(locale, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "Asia/Tokyo",
        }).format(new Date(member.lastActive)),
    },
    {
      key: "status",
      width: "16%",
      header: t("personaExamples.status"),
      render: (member) => (
        <Badge tone={member.active ? "success" : "neutral"}>
          {t(member.active ? "personaExamples.active" : "personaExamples.inactive")}
        </Badge>
      ),
    },
  ];
  return (
    <PageContainer title={t("personaExamples.members")}>
      <Card>
        <CardContent flush>
          <DataTable
            data={members}
            columns={columns}
            preset="stacked-record-collection"
            collapseBelow="sm"
            getRowId={(member) => member.id}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

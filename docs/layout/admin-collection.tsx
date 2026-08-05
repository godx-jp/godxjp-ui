import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { SearchInput } from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Toolbar, ToolbarGroup } from "@godxjp/ui/navigation";

type Locale = "ja" | "en" | "vi";
type Organization = { id: string; name: string; slug: string; members: number; status: string };

const copy = {
  ja: {
    title: "組織",
    subtitle: "すべての組織を管理します",
    search: "組織を検索",
    create: "組織を作成",
  },
  en: {
    title: "Organizations",
    subtitle: "Manage every organization in this environment",
    search: "Search organizations",
    create: "Create organization",
  },
  vi: {
    title: "Tổ chức",
    subtitle: "Quản lý toàn bộ tổ chức trong môi trường này",
    search: "Tìm kiếm tổ chức",
    create: "Tạo tổ chức",
  },
} as const;

const rows: Organization[] = [
  { id: "org_01", name: "GoDX Japan", slug: "godx-japan", members: 142, status: "Active" },
  {
    id: "org_02",
    name: "Famsys Operations",
    slug: "famsys-operations",
    members: 86,
    status: "Active",
  },
  {
    id: "org_03",
    name: "International Customer Experience Division",
    slug: "customer-experience-international",
    members: 39,
    status: "Review",
  },
  {
    id: "org_04",
    name: "Nền tảng vận hành Việt Nam",
    slug: "van-hanh-viet-nam",
    members: 71,
    status: "Active",
  },
  {
    id: "org_05",
    name: "関西プロダクト開発統括部",
    slug: "kansai-product-development",
    members: 54,
    status: "Active",
  },
];

const columns: ColumnDef<Organization>[] = [
  { key: "name", header: "Organization", render: (row) => <Text weight="medium">{row.name}</Text> },
  { key: "slug", header: "Slug", render: (row) => <Text mono>{row.slug}</Text> },
  { key: "members", header: "Members", align: "right" },
  { key: "status", header: "Status" },
];

export default function AdminCollectionPreview() {
  const [locale, setLocale] = useState<Locale>("ja");
  const [query, setQuery] = useState("");
  const labels = copy[locale];
  const filtered = useMemo(
    () =>
      rows.filter((row) => `${row.name} ${row.slug}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <PageContainer
      preset="admin-collection"
      title={labels.title}
      subtitle={labels.subtitle}
      extra={
        <Button size="sm">
          <Plus aria-hidden="true" />
          {labels.create}
        </Button>
      }
    >
      <Toolbar aria-label="Admin collection controls">
        <ToolbarGroup label={<span className="sr-only">{labels.search}</span>}>
          <SearchInput
            ariaLabel={labels.search}
            placeholder={labels.search}
            value={query}
            onValueChange={setQuery}
          />
        </ToolbarGroup>
        <ToolbarGroup label={<span className="sr-only">Locale</span>}>
          <Flex gap="xs" wrap>
            {(["ja", "en", "vi"] as const).map((language) => (
              <Button
                key={language}
                size="sm"
                variant={locale === language ? "default" : "outline"}
                onClick={() => setLocale(language)}
              >
                {language.toUpperCase()}
              </Button>
            ))}
          </Flex>
        </ToolbarGroup>
      </Toolbar>
      <DataTable data={filtered} columns={columns} getRowId={(row) => row.id} />
    </PageContainer>
  );
}

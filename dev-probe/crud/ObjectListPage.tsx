// dev-only — generic list view per object schema.

import { useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  Table,
  type TableColumn,
  type TableColumnVisibility,
  type TableFilter,
  type TableFilterItem,
  type TableSort,
  type TableSortState,
  type TableViewItem,
} from "../../src/components/data-display/Table";
import { Button } from "../../src/components/general/Button";
import { IconButton } from "../../src/components/data-display/IconButton";
import { PageHeader } from "../../src/components/data-display/PageHeader";
import { DropdownMenu } from "../../src/components/navigation/DropdownMenu";
import { toast } from "../../src/components/feedback/toaster";
import { navigate, routes } from "./routes";
import {
  OBJECTS_BY_NAME,
  enumOptions,
  localize,
  objectLabel,
  propertyLabel,
} from "./loadObjects";
import { useRecords, deleteRecord, deleteRecords } from "./store";
import { renderFieldView } from "./fields/index";
import { resolveTitle } from "./fields/Association";
import type {
  Locale,
  AnyRecord,
  PropertyDef,
  EnumRefPropertyDef,
} from "./schemaTypes";

interface Props {
  objectName: string;
  locale: Locale;
}

function rowTitle(objectName: string, row: AnyRecord): string {
  return resolveTitle(objectName, row.id) || String(row.id);
}

function buildColumns(
  objectName: string,
  locale: Locale,
  onDelete: (id: string) => void,
): TableColumn<AnyRecord>[] {
  const obj = OBJECTS_BY_NAME[objectName]!;
  const titleKey = obj.titleIndex ?? Object.keys(obj.properties)[0]!;

  const entries = Object.entries(obj.properties);
  const ordered = [
    ...entries.filter(([k]) => k === titleKey),
    ...entries.filter(([k]) => k !== titleKey && k !== "createdAt"),
    ...entries.filter(([k]) => k === "createdAt"),
  ];

  const fieldCols: TableColumn<AnyRecord>[] = ordered.slice(0, 7).map(([name, prop]) => ({
    accessorKey: name,
    header: propertyLabel(obj, name, locale),
    minSize: name === titleKey ? 220 : 140,
    cell: ({ row }) => {
      const content = renderFieldView({
        value: row.original[name],
        prop: prop as PropertyDef,
        propName: name,
        locale,
      });
      if (name === titleKey) {
        return (
          <a
            href={`#${routes.detail(objectName, row.original.id)}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(routes.detail(objectName, row.original.id));
            }}
            style={{
              color: "var(--primary)",
              fontWeight: 600,
              cursor: "pointer",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              maxWidth: "100%",
            }}
          >
            {rowTitle(objectName, row.original)}
          </a>
        );
      }
      return (
        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {content}
        </div>
      );
    },
    meta: {
      sortable: true,
      filterable:
        prop.type === "EnumRef" || prop.type === "Enum" || prop.type === "Boolean",
    },
  }));

  const actionCol: TableColumn<AnyRecord> = {
    id: "__actions",
    header: "",
    size: 56,
    minSize: 56,
    maxSize: 56,
    cell: ({ row }) => (
      <DropdownMenu
        trigger={
          <IconButton variant="ghost" size="small" aria-label="row menu">
            <MoreHorizontal size={16} />
          </IconButton>
        }
        items={[
          {
            key: "view",
            label: locale === "ja" ? "詳細を開く" : "Open",
            onSelect: () => navigate(routes.detail(objectName, row.original.id)),
          },
          {
            key: "edit",
            label: locale === "ja" ? "編集" : "Edit",
            onSelect: () => navigate(routes.edit(objectName, row.original.id)),
          },
          { key: "sep", type: "separator" },
          {
            key: "delete",
            label: locale === "ja" ? "削除" : "Delete",
            variant: "destructive",
            onSelect: () => onDelete(row.original.id),
          },
        ]}
      />
    ),
    meta: { className: "actions", sticky: "right", hideable: false },
  };

  return [...fieldCols, actionCol];
}

function buildFilterBar(
  objectName: string,
  locale: Locale,
  filters: TableFilter[],
  setFilters: (next: TableFilter[]) => void,
): TableFilterItem[] {
  const obj = OBJECTS_BY_NAME[objectName]!;
  const out: TableFilterItem[] = [];
  for (const [name, raw] of Object.entries(obj.properties)) {
    const prop = raw as PropertyDef;
    if (prop.type !== "EnumRef" && prop.type !== "Boolean") continue;
    const current = filters.find((f) => f.key === name);
    let options: Array<{ value: string; label: string }> = [];
    if (prop.type === "EnumRef") {
      options = enumOptions((prop as EnumRefPropertyDef).enum, locale);
    } else if (prop.type === "Boolean") {
      options = [
        { value: "true", label: locale === "ja" ? "はい" : "Yes" },
        { value: "false", label: locale === "ja" ? "いいえ" : "No" },
      ];
    }
    out.push({
      key: name,
      label: localize(prop.displayName, locale, name),
      value: current ? String(current.value ?? "") : undefined,
      valueLabel: current
        ? options.find((o) => o.value === String(current.value))?.label
        : undefined,
      options,
      onValueChange: (v: string) => {
        const others = filters.filter((f) => f.key !== name);
        setFilters(v ? [...others, { key: name, operator: "eq", value: v }] : others);
      },
      closable: !!current,
      onClose: () => setFilters(filters.filter((f) => f.key !== name)),
    });
  }
  return out;
}

function ListPage({ objectName, locale }: Props) {
  const obj = OBJECTS_BY_NAME[objectName];
  const records = useRecords(objectName);

  const [activeView, setActiveView] = useState("all");
  const [filters, setFilters] = useState<TableFilter[]>([]);
  const [sort, setSort] = useState<TableSortState>({ key: "createdAt", direction: "desc" });
  const [selected, setSelected] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<TableColumnVisibility>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filtered = useMemo<AnyRecord[]>(() => {
    if (!obj) return [];
    let out = records;
    if (filters.length > 0) {
      out = out.filter((row) =>
        filters.every(
          (f) => String((row as Record<string, unknown>)[f.key]) === String(f.value),
        ),
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter((row) =>
        Object.entries(row).some(([k, v]) => {
          if (v == null || k === "id") return false;
          return String(v).toLowerCase().includes(q);
        }),
      );
    }
    if (sort && !Array.isArray(sort)) {
      const { key, direction } = sort;
      out = [...out].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av == null && bv == null) return 0;
        if (av == null) return direction === "asc" ? -1 : 1;
        if (bv == null) return direction === "asc" ? 1 : -1;
        if (typeof av === "number" && typeof bv === "number") {
          return direction === "asc" ? av - bv : bv - av;
        }
        return direction === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return out;
  }, [records, filters, sort, search, obj]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  if (!obj) {
    return <div style={{ padding: 24 }}>Object &quot;{objectName}&quot; not found.</div>;
  }

  const objLabel = objectLabel(obj, locale);

  const columns = buildColumns(objectName, locale, (id) => {
    const ok = window.confirm(
      locale === "ja" ? `削除しますか？\nID: ${id}` : `Delete this record?\nID: ${id}`,
    );
    if (!ok) return;
    if (deleteRecord(objectName, id)) {
      toast.success(locale === "ja" ? "削除しました" : "Deleted");
    }
  });

  const views: TableViewItem[] = [
    {
      key: "all",
      label: locale === "ja" ? "すべて" : "All",
      filters: [],
      sort,
      count: filtered.length,
    },
  ];
  if (obj.properties["createdAt"]) {
    const recent: TableSort = { key: "createdAt", direction: "desc" };
    views.push({
      key: "recent",
      label: locale === "ja" ? "最近作成" : "Recently Created",
      filters: [],
      sort: recent,
    });
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title={objLabel}
        subtitle={
          locale === "ja"
            ? `${filtered.length} 件 / 全 ${records.length} 件`
            : `${filtered.length} of ${records.length} records`
        }
        actions={
          <Button onClick={() => navigate(routes.newRec(objectName))}>
            {locale === "ja" ? `＋ 新規 ${objLabel}` : `+ New ${objLabel}`}
          </Button>
        }
      />

      <div style={{ marginTop: 16 }}>
        <Table
          tableKey={`dev-probe:${objectName}`}
          columns={columns}
          data={paged}
          rowKey="id"
          columnVisibility={visibility}
          onColumnVisibilityChange={setVisibility}
          views={{
            items: views,
            activeKey: activeView,
            onActiveKeyChange: setActiveView,
            onViewApply: (v) => {
              setActiveView(v.key);
              setFilters(v.filters ?? []);
              if ("sort" in v && v.sort) setSort(v.sort);
            },
          }}
          toolbar={{
            search: {
              value: search,
              onValueChange: (v) => {
                setSearch(v);
                setPage(1);
              },
              placeholder: locale === "ja" ? "検索…" : "Search…",
            },
            filter: { label: locale === "ja" ? "フィルター" : "Filter" },
            columns: { label: locale === "ja" ? "列" : "Columns" },
            primaryAction: {
              label: locale === "ja" ? `＋ 新規` : `+ New`,
              onClick: () => navigate(routes.newRec(objectName)),
            },
          }}
          filters={filters}
          onFiltersChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
          filterBar={buildFilterBar(objectName, locale, filters, (next) => {
            setFilters(next);
            setPage(1);
          })}
          batchActions={{
            selectedRowKeys: selected,
            onSelectedRowKeysChange: setSelected,
            actions: (
              <Button
                size="small"
                variant="destructive"
                onClick={() => {
                  const ok = window.confirm(
                    locale === "ja"
                      ? `${selected.length} 件を削除しますか？`
                      : `Delete ${selected.length} record(s)?`,
                  );
                  if (!ok) return;
                  const n = deleteRecords(objectName, selected);
                  setSelected([]);
                  toast.success(
                    locale === "ja" ? `${n} 件を削除しました` : `${n} record(s) deleted`,
                  );
                }}
              >
                {locale === "ja" ? "一括削除" : "Delete"}
              </Button>
            ),
          }}
          sort={sort}
          onSortChange={setSort}
          pagination={{
            type: "numbered",
            current: page,
            pageSize,
            total: filtered.length,
            pageSizeOptions: [10, 25, 50, 100],
            onChange: (p, s) => {
              setPage(p);
              setPageSize(s);
            },
          }}
          empty={
            <div style={{ padding: 24, color: "var(--muted-foreground)" }}>
              {locale === "ja" ? "該当する記録がありません" : "No records found"}
            </div>
          }
        />
      </div>
    </div>
  );
}

export default ListPage;

// dev-only — detail + edit view.

import { useState } from "react";
import { Trash2, Pencil, X } from "lucide-react";
import { PageHeader } from "../../src/components/data-display/PageHeader";
import { Button } from "../../src/components/general/Button";
import { Tabs } from "../../src/components/navigation/Tabs";
import { Card } from "../../src/components/data-display/Card";
import { Field } from "../../src/components/data-entry/Field";
import { Popconfirm } from "../../src/components/feedback/Popconfirm";
import { Empty } from "../../src/components/data-display/Empty";
import { toast } from "../../src/components/feedback/toaster";
import { navigate, routes } from "./routes";
import { OBJECTS_BY_NAME, objectLabel, propertyLabel } from "./loadObjects";
import { useRecord, updateRecord, deleteRecord, listRecords } from "./store";
import { renderFieldEdit, renderFieldView } from "./fields/index";
import { resolveTitle } from "./fields/Association";
import type { AnyRecord, AssociationPropertyDef, Locale, PropertyDef } from "./schemaTypes";

interface Props {
  objectName: string;
  id: string;
  locale: Locale;
  /** When true the page boots in edit mode. */
  editMode?: boolean;
}

function DetailPage({ objectName, id, locale, editMode = false }: Props) {
  const obj = OBJECTS_BY_NAME[objectName];
  const record = useRecord(objectName, id);
  const [draft, setDraft] = useState<Partial<AnyRecord> | null>(null);
  const [isEditing, setEditing] = useState(editMode);

  if (!obj) return <div style={{ padding: 24 }}>Unknown object.</div>;
  if (!record) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description={locale === "ja" ? "見つかりません" : "Record not found"} />
        <div style={{ marginTop: 16 }}>
          <Button variant="outline" onClick={() => navigate(routes.list(objectName))}>
            ← {locale === "ja" ? "リストへ戻る" : "Back to list"}
          </Button>
        </div>
      </div>
    );
  }

  const startEdit = () => {
    setDraft({ ...record });
    setEditing(true);
  };
  const cancel = () => {
    setDraft(null);
    setEditing(false);
    if (editMode) navigate(routes.detail(objectName, id));
  };
  const save = () => {
    if (!draft) {
      setEditing(false);
      return;
    }
    // basic required-field validation
    const missing: string[] = [];
    for (const [name, raw] of Object.entries(obj.properties)) {
      const prop = raw as PropertyDef;
      if (prop.required && (draft[name] == null || draft[name] === "")) {
        missing.push(propertyLabel(obj, name, locale));
      }
    }
    if (missing.length) {
      toast.error(
        (locale === "ja" ? "必須項目: " : "Required: ") + missing.join(", "),
      );
      return;
    }
    updateRecord(objectName, id, draft);
    setDraft(null);
    setEditing(false);
    toast.success(locale === "ja" ? "保存しました" : "Saved");
    if (editMode) navigate(routes.detail(objectName, id));
  };

  const handleDelete = () => {
    deleteRecord(objectName, id);
    toast.success(locale === "ja" ? "削除しました" : "Deleted");
    navigate(routes.list(objectName));
  };

  const title = resolveTitle(objectName, id) || record.id;

  const overviewBody = (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
      {Object.entries(obj.properties).map(([name, raw]) => {
        const prop = raw as PropertyDef;
        const value = isEditing && draft ? draft[name] : record[name];
        return (
          <Field key={name} label={propertyLabel(obj, name, locale)} required={prop.required}>
            {isEditing
              ? renderFieldEdit({
                  value,
                  onChange: (next) =>
                    setDraft((prev) => ({ ...(prev ?? record), [name]: next })),
                  prop,
                  propName: name,
                  locale,
                })
              : renderFieldView({ value, prop, propName: name, locale })}
          </Field>
        );
      })}
    </div>
  );

  const related = collectRelated(objectName, id, locale);
  const relatedBody =
    related.length === 0 ? (
      <Empty description={locale === "ja" ? "関連レコードはありません" : "No related records"} />
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {related.map((group) => (
          <div key={group.title}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>
              {group.title} <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>({group.records.length})</span>
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {group.records.slice(0, 10).map((r) => (
                <li key={r.id}>
                  <a
                    href={`#${routes.detail(group.target, r.id)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(routes.detail(group.target, r.id));
                    }}
                    style={{ color: "var(--primary)" }}
                  >
                    {resolveTitle(group.target, r.id)}
                  </a>
                </li>
              ))}
              {group.records.length > 10 && (
                <li style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
                  …{locale === "ja" ? "他" : "and"} {group.records.length - 10}{" "}
                  {locale === "ja" ? "件" : "more"}
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title={title}
        subtitle={objectLabel(obj, locale)}
        breadcrumb={
          <a
            href={`#${routes.list(objectName)}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(routes.list(objectName));
            }}
            style={{ color: "var(--muted-foreground)", fontSize: 12 }}
          >
            ← {locale === "ja" ? "リストへ戻る" : "Back to list"}
          </a>
        }
        actions={
          isEditing ? (
            <>
              <Button variant="outline" onClick={cancel} startContent={<X size={14} />}>
                {locale === "ja" ? "キャンセル" : "Cancel"}
              </Button>
              <Button onClick={save}>{locale === "ja" ? "保存" : "Save"}</Button>
            </>
          ) : (
            <>
              <Popconfirm
                title={locale === "ja" ? "削除しますか？" : "Delete this record?"}
                description={
                  locale === "ja"
                    ? "この操作は取り消せません。"
                    : "This action cannot be undone."
                }
                confirmLabel={locale === "ja" ? "削除" : "Delete"}
                cancelLabel={locale === "ja" ? "キャンセル" : "Cancel"}
                confirmVariant="destructive"
                onConfirm={handleDelete}
              >
                <Button variant="outline" startContent={<Trash2 size={14} />}>
                  {locale === "ja" ? "削除" : "Delete"}
                </Button>
              </Popconfirm>
              <Button onClick={startEdit} startContent={<Pencil size={14} />}>
                {locale === "ja" ? "編集" : "Edit"}
              </Button>
            </>
          )
        }
      />
      <div style={{ marginTop: 16 }}>
        <Tabs
          defaultValue="overview"
          items={[
            {
              value: "overview",
              label: locale === "ja" ? "概要" : "Overview",
              content: (
                <Card padding="cozy" style={{ marginTop: 16 }}>
                  {overviewBody}
                </Card>
              ),
            },
            {
              value: "related",
              label: locale === "ja" ? "関連" : "Related",
              content: (
                <Card padding="cozy" style={{ marginTop: 16 }}>
                  {relatedBody}
                </Card>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

interface RelatedGroup {
  target: string;
  title: string;
  records: AnyRecord[];
}

function collectRelated(objectName: string, id: string, locale: Locale): RelatedGroup[] {
  // For each other object, find Association properties whose target is THIS
  // object, and list records that point to this id.
  const out: RelatedGroup[] = [];
  for (const candidate of Object.values(OBJECTS_BY_NAME)) {
    for (const [propName, raw] of Object.entries(candidate.properties)) {
      const prop = raw as PropertyDef;
      if (prop.type !== "Association") continue;
      const ass = prop as AssociationPropertyDef;
      if (ass.target !== objectName) continue;
      const matches = listRecords(candidate.name).filter((r) => r[propName] === id);
      if (!matches.length) continue;
      const title =
        objectLabel(candidate, locale) +
        (matches.length > 1 ? "" : "") +
        " · " +
        propertyLabel(candidate, propName, locale);
      out.push({ target: candidate.name, title, records: matches });
    }
  }
  return out;
}

export default DetailPage;

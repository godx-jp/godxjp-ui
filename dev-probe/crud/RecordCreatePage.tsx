// dev-only — create-record sheet.

import { useMemo, useState } from "react";
import { Sheet } from "../../src/components/feedback/Sheet";
import { Button } from "../../src/components/general/Button";
import { Field } from "../../src/components/data-entry/Field";
import { toast } from "../../src/components/feedback/toaster";
import { navigate, routes } from "./routes";
import { OBJECTS_BY_NAME, objectLabel, propertyLabel } from "./loadObjects";
import { createRecord } from "./store";
import { defaultRecord } from "./fakeData";
import { renderFieldEdit } from "./fields/index";
import type { AnyRecord, Locale, PropertyDef } from "./schemaTypes";

interface Props {
  objectName: string;
  locale: Locale;
}

function CreatePage({ objectName, locale }: Props) {
  const obj = OBJECTS_BY_NAME[objectName];

  const initial = useMemo<AnyRecord>(
    () => (obj ? defaultRecord(obj) : { id: "" }),
    [obj],
  );
  const [draft, setDraft] = useState<AnyRecord>(initial);

  if (!obj) return null;

  const submit = () => {
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
    const next = createRecord(objectName, draft);
    toast.success(locale === "ja" ? "作成しました" : "Created");
    navigate(routes.detail(objectName, next.id));
  };

  const close = () => navigate(routes.list(objectName));

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
      title={
        locale === "ja"
          ? `新規 ${objectLabel(obj, locale)}`
          : `New ${objectLabel(obj, locale)}`
      }
      description={
        locale === "ja"
          ? "必須項目を入力して保存してください。"
          : "Fill the required fields and save."
      }
      side="right"
      footer={
        <>
          <Button variant="outline" onClick={close}>
            {locale === "ja" ? "キャンセル" : "Cancel"}
          </Button>
          <Button onClick={submit}>
            {locale === "ja" ? "作成" : "Create"}
          </Button>
        </>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "0 4px",
        }}
      >
        {Object.entries(obj.properties)
          .filter(([k]) => k !== "createdAt")
          .map(([name, raw]) => {
            const prop = raw as PropertyDef;
            return (
              <Field
                key={name}
                label={propertyLabel(obj, name, locale)}
                required={prop.required}
              >
                {renderFieldEdit({
                  value: draft[name],
                  onChange: (next) =>
                    setDraft((prev) => ({ ...prev, [name]: next })),
                  prop,
                  propName: name,
                  locale,
                })}
              </Field>
            );
          })}
      </div>
    </Sheet>
  );
}

export default CreatePage;

/**
 * @godxjp/ui DataTable — save view Dialog.
 *
 * Stage 4b of the Table refactor (Plan §3). Lives on the composite
 * side. Surfaces a duplicate-warning Alert when the snapshot matches
 * an existing view.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "../../feedback/Alert";
import { Button } from "../../general/Button";
import { Dialog } from "../../feedback/Dialog";
import { Input } from "../../data-entry/Input";
import type { TableViewItem } from "../../data-display/Table.types";

interface SaveViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  duplicateView: TableViewItem | undefined;
  onConfirm: (label: string) => void;
}

export function SaveViewDialog(props: SaveViewDialogProps) {
  const { open, onOpenChange, defaultName, duplicateView, onConfirm } = props;
  const { t } = useTranslation();
  const [viewName, setViewName] = useState(defaultName);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setViewName(defaultName);
        onOpenChange(next);
      }}
      title={t("table.saveViewTitle")}
      description={t("table.saveViewDescription")}
      form={{
        onSubmit: (event) => {
          event.preventDefault();
          const label = viewName.trim();
          if (label === "") return;
          onConfirm(label);
        },
      }}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="small"
            onClick={() => onOpenChange(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" size="small" disabled={viewName.trim() === ""}>
            {duplicateView === undefined
              ? t("common.save")
              : t("table.continueSaveView")}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
        <Input
          autoFocus
          aria-label={t("table.viewName")}
          value={viewName}
          onChange={(event) => setViewName(event.target.value)}
          placeholder={t("table.viewNamePlaceholder")}
        />
        {duplicateView !== undefined && (
          <Alert
            color="warning"
            title={t("table.duplicateViewTitle", {
              name: String(duplicateView.label),
            })}
            description={t("table.duplicateViewDescription")}
          />
        )}
      </div>
    </Dialog>
  );
}

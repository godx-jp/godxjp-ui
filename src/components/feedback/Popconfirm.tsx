import { useState, type ReactNode } from "react";
import { Popover } from "../data-display/Popover";
import { Button } from "../general/Button";
import { cn } from "../cn";

/**
 * Popconfirm — inline confirmation popover anchored to its trigger.
 *
 *   <Popconfirm
 *     title="削除しますか？"
 *     description="このアイテムは復元できません。"
 *     confirmLabel="削除"
 *     confirmVariant="destructive"
 *     onConfirm={() => deleteItem()}
 *   >
 *     <Button variant="destructive">削除</Button>
 *   </Popconfirm>
 *
 * Distinct from AlertDialog / Modal (full-screen modal for
 * high-stakes decisions that need focus trap + scrim). Popconfirm
 * is a LIGHTWEIGHT inline confirm — the trigger stays in flow, the
 * popover anchors next to it, no overlay dim.
 *
 * Vocabulary (per cardinal rule 23 §B):
 *   - `open` / `defaultOpen` / `onOpenChange` — Radix overlay state
 *   - `placement` — popover anchor side
 *   - `title` / `description` / `icon` slots
 *   - `confirmVariant` — Button `variant` value ("primary" | "destructive")
 */

export interface PopconfirmProps {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Button variant for the confirm action ("primary" | "destructive"). */
  confirmVariant?: "primary" | "destructive";
  /** Leading icon shown beside the title. */
  icon?: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The trigger element (rendered via Radix `asChild`). */
  children?: ReactNode;
  /** Anchor side relative to the trigger. */
  placement?: "top" | "right" | "bottom" | "left";
  className?: string;
}

const DefaultIcon = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx={12} cy={12} r={10} />
    <line x1={12} y1={8} x2={12} y2={12} />
    <line x1={12} y1={16} x2={12.01} y2={16} />
  </svg>
);

export function Popconfirm({
  title,
  description,
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  confirmVariant = "primary",
  icon,
  onConfirm,
  onCancel,
  open,
  defaultOpen,
  onOpenChange,
  children,
  placement = "top",
  className,
}: PopconfirmProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };
  const handleConfirm = () => {
    onConfirm?.();
    setOpen(false);
  };

  const iconColor =
    confirmVariant === "destructive" ? "var(--destructive)" : "var(--warning)";

  return (
    <Popover
      open={currentOpen}
      onOpenChange={setOpen}
      trigger={children}
      side={placement}
      align="center"
      className={cn("popconfirm", className)}
    >
      <div className="popconfirm-body">
        <span className="popconfirm-icon" style={{ color: iconColor }}>
          {icon ?? <DefaultIcon />}
        </span>
        <div className="popconfirm-text">
          <div className="popconfirm-title">{title}</div>
          {description && (
            <div className="popconfirm-desc">{description}</div>
          )}
        </div>
      </div>
      <div className="popconfirm-actions">
        <Button variant="ghost" size="x-small" onClick={handleCancel}>
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant}
          size="x-small"
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Popover>
  );
}

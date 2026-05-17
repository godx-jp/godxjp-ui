import { type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./AlertDialog";
import { Button } from "./Button";

/**
 * Popconfirm — compact wrapper over `AlertDialog*` for the common
 * confirm-or-cancel flow. Same accessibility model as AlertDialog
 * (modal, traps focus, ARIA roles via Radix).
 *
 * Vocabulary (per cardinal rule 23 §B — concept-first):
 *   `open` / `defaultOpen` / `onOpenChange` — Radix-canonical overlay
 *     state; NEVER `visible` / `isOpen` / `shown`.
 *   `confirmVariant` — `primary` (default) or `destructive`; the
 *     latter for delete-style irreversible actions. `cancel` is
 *     always rendered as `variant="ghost"`.
 *
 * @example
 *   <Popconfirm
 *     title="削除しますか？"
 *     description="このアイテムは復元できません。"
 *     confirmVariant="destructive"
 *     confirmLabel="削除"
 *     onConfirm={() => mutate()}
 *   >
 *     <Button variant="destructive">削除</Button>
 *   </Popconfirm>
 */

export interface PopconfirmProps {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Confirm button variant — use "destructive" for delete-style. */
  confirmVariant?: "primary" | "destructive";
  onConfirm?: () => void;
  onCancel?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The trigger element (rendered via Radix `asChild`). */
  children?: ReactNode;
}

export function Popconfirm({
  title,
  description,
  confirmLabel = "確認",
  cancelLabel = "キャンセル",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  open,
  defaultOpen,
  onOpenChange,
  children,
}: PopconfirmProps) {
  return (
    <AlertDialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} asChild>
            <Button variant="ghost">{cancelLabel}</Button>
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} asChild>
            <Button variant={confirmVariant}>{confirmLabel}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

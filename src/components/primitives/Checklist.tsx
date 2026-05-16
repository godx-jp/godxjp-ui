import { Check, X } from "lucide-react";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

/**
 * Checklist — vertical list of pass/fail rules with per-row icon.
 *
 * Mirrors the canonical `.checklist` pattern from
 * `K:comp-inputs.html:196-200` (password-rules) + the CSS atom in
 * `shell.css` (`.checklist`, `.checklist li.ok`, `.checklist li.bad`).
 * Each row carries a leading icon (check / x by default) and a label;
 * row tone follows the canonical semantic palette (`--success` for ok,
 * `--destructive` for bad, `--muted-foreground` for neutral / pending).
 *
 * Typical uses: password-rule hints, validation summaries, "tasks
 * completed" lists, capability matrices.
 *
 * @example
 *   <Checklist
 *     items={[
 *       { ok: true,  label: "8文字以上" },
 *       { ok: true,  label: "大文字・小文字を含む" },
 *       { ok: false, label: "記号 (! @ # …) を 1 つ以上" },
 *     ]}
 *   />
 *
 * @example with custom icons + neutral pending state
 *   <Checklist
 *     items={[
 *       { ok: true,    label: "Plan approved",   icon: <Check size={11} /> },
 *       { ok: null,    label: "Awaiting review", icon: <Clock size={11} /> },
 *       { ok: false,   label: "Budget exceeded" },
 *     ]}
 *   />
 */

export interface ChecklistItem {
  /** `true` → ok / success; `false` → bad / destructive; `null` → neutral / pending. */
  ok: boolean | null;
  label: ReactNode;
  /** Override the default check / x icon. */
  icon?: ReactNode;
  /** Optional trailing hint text. */
  hint?: ReactNode;
}

export interface ChecklistProps extends HTMLAttributes<HTMLUListElement> {
  items: ChecklistItem[];
  /** Icon size in px — defaults to 11 (matches canonical). */
  iconSize?: number;
}

export const Checklist = forwardRef<HTMLUListElement, ChecklistProps>(
  function Checklist({ items, iconSize = 11, className, ...rest }, ref) {
    return (
      <ul ref={ref} className={cn("checklist", className)} {...rest}>
        {items.map((item, idx) => {
          const tone =
            item.ok === true ? "ok" : item.ok === false ? "bad" : undefined;
          const fallbackIcon =
            item.ok === true ? (
              <Check size={iconSize} strokeWidth={3} />
            ) : item.ok === false ? (
              <X size={iconSize} strokeWidth={3} />
            ) : null;
          return (
            <li key={idx} className={cn(tone)}>
              {item.icon ?? fallbackIcon}
              <span>{item.label}</span>
              {item.hint !== undefined && (
                <span
                  style={{
                    marginLeft: "auto",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {item.hint}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    );
  },
);

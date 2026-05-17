import type { ComponentProps } from "react";
import { X } from "lucide-react";
import { cn } from "../../cn";

/**
 * AttendeeChip — pill with leading initials avatar + name + optional
 * remove (✕). Used in event composer attendee fields and similar
 * "selected items" chip arrays.
 */
export interface AttendeeChipProps extends ComponentProps<"span"> {
  name: string;
  short: string;
  color: string;
  onRemove?: () => void;
}

export function AttendeeChip({
  name,
  short,
  color,
  onRemove,
  className,
  ...rest
}: AttendeeChipProps) {
  return (
    <span className={cn("attendee-chip", className)} {...rest}>
      <span className="attendee-chip-avatar" style={{ background: color }}>
        {short}
      </span>
      <span className="attendee-chip-name">{name}</span>
      {onRemove && (
        <button
          type="button"
          className="attendee-chip-close"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          <X size={11} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}

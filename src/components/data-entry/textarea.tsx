import * as React from "react";
import { cn } from "../../lib/utils";
import { controlMultilineClass } from "../../lib/control-styles";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(controlMultilineClass, className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

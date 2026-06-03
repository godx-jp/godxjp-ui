import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "../../lib/utils";
import { Input } from "../data-entry/input";

export type PasswordInputProps = Omit<React.ComponentPropsWithoutRef<typeof Input>, "type">;

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="ui-password-input" data-slot="password-input">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("ui-password-input-field", className)}
          {...props}
        />
        <button
          type="button"
          className="ui-password-input-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "パスワードを隠す" : "パスワードを表示"}
          tabIndex={-1}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

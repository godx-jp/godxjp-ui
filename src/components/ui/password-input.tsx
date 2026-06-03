import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Input } from "../data-entry/input";

export type PasswordInputProps = Omit<React.ComponentPropsWithoutRef<typeof Input>, "type">;

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const { t } = useTranslation();
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
          aria-label={visible ? t("ui.passwordInput.hide") : t("ui.passwordInput.show")}
          aria-pressed={visible}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

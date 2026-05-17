import {
  createContext,
  forwardRef,
  useContext,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "../cn";

/**
 * Menu — navigation list with selection state. Supports horizontal +
 * vertical orientations; selection mirrors Tabs/Select vocabulary
 * (`value` / `defaultValue` / `onValueChange`).
 *
 *   <Menu defaultValue="dashboard">
 *     <MenuItem value="dashboard" icon={<HomeIcon />}>ダッシュボード</MenuItem>
 *     <MenuItem value="orders">注文管理</MenuItem>
 *     <MenuDivider />
 *     <MenuGroup label="管理">
 *       <MenuItem value="users">ユーザー</MenuItem>
 *     </MenuGroup>
 *   </Menu>
 *
 * Vocabulary (§23.B):
 *   - `orientation` — vertical (default) | horizontal
 *   - `value` / `defaultValue` / `onValueChange` — selection state
 *   - `disabled` per item — interaction state
 *   - `icon` slot — decorative ReactNode per MenuItem
 *
 * Distinct from `DropdownMenu` (Radix overlay action menu): Menu is
 * the persistent navigation surface (sidebar / nav bar); DropdownMenu
 * is the trigger-bound popover.
 */

export type MenuOrientation = "horizontal" | "vertical";

interface MenuContextValue {
  value?: string;
  onValueChange?: (v: string) => void;
  orientation: MenuOrientation;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export interface MenuProps extends Omit<ComponentProps<"ul">, "onChange"> {
  orientation?: MenuOrientation;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const Menu = forwardRef<HTMLUListElement, MenuProps>(function Menu(
  {
    orientation = "vertical",
    value,
    defaultValue,
    onValueChange,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const active = value ?? internal;
  const handleChange = (v: string) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <MenuContext.Provider
      value={{ value: active, onValueChange: handleChange, orientation }}
    >
      <ul
        ref={ref}
        role="menu"
        className={cn("menu", className)}
        data-orientation={orientation}
        aria-orientation={orientation}
        {...rest}
      >
        {children}
      </ul>
    </MenuContext.Provider>
  );
});

// ─── MenuItem ────────────────────────────────────────────────────

export interface MenuItemProps extends Omit<ComponentProps<"button">, "value"> {
  value: string;
  disabled?: boolean;
  icon?: ReactNode;
  extra?: ReactNode;
}

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  function MenuItem(
    { value, disabled, icon, extra, className, children, onClick, ...rest },
    ref,
  ) {
    const ctx = useContext(MenuContext);
    const selected = ctx?.value === value;
    return (
      <li role="none" style={{ display: "contents" }}>
        <button
          ref={ref}
          type="button"
          role="menuitem"
          className={cn("menu-item", className)}
          data-state={selected ? "selected" : undefined}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          onClick={(e) => {
            onClick?.(e);
            if (!e.defaultPrevented && !disabled) ctx?.onValueChange?.(value);
          }}
          {...rest}
        >
          {icon && <span className="menu-item-icon">{icon}</span>}
          <span className="menu-item-label">{children}</span>
          {extra && <span className="menu-item-extra">{extra}</span>}
        </button>
      </li>
    );
  },
);

// ─── MenuGroup ───────────────────────────────────────────────────

export interface MenuGroupProps extends ComponentProps<"li"> {
  label?: ReactNode;
}

export const MenuGroup = forwardRef<HTMLLIElement, MenuGroupProps>(
  function MenuGroup({ label, children, className, ...rest }, ref) {
    return (
      <li ref={ref} role="none" className={cn(className)} {...rest}>
        {label && <div className="menu-group-label">{label}</div>}
        {children}
      </li>
    );
  },
);

// ─── MenuDivider ─────────────────────────────────────────────────

export const MenuDivider = forwardRef<HTMLHRElement, ComponentProps<"hr">>(
  function MenuDivider({ className, ...rest }, ref) {
    return (
      <hr
        ref={ref}
        role="separator"
        className={cn("menu-divider", className)}
        {...rest}
      />
    );
  },
);

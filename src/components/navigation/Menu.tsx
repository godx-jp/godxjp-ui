import { forwardRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "../cn";

export type MenuOrientation = "horizontal" | "vertical";

export interface MenuOption {
  value?: string;
  label?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  extra?: ReactNode;
  type?: "item" | "group" | "divider";
  items?: MenuOption[];
}

export interface MenuProps extends Omit<ComponentProps<"ul">, "onChange" | "children"> {
  orientation?: MenuOrientation;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  items: MenuOption[];
}

export const Menu = forwardRef<HTMLUListElement, MenuProps>(function Menu(
  {
    orientation = "vertical",
    value,
    defaultValue,
    onValueChange,
    items,
    className,
    ...rest
  },
  ref,
) {
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const active = value ?? internal;
  const handleChange = (nextValue: string) => {
    if (value === undefined) setInternal(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <ul
      ref={ref}
      role="menu"
      className={cn("menu", className)}
      data-orientation={orientation}
      aria-orientation={orientation}
      {...rest}
    >
      {items.map((item, index) => {
        if (item.type === "divider") {
          return (
            <hr
              key={`divider-${index}`}
              role="separator"
              className="menu-divider"
            />
          );
        }
        if (item.type === "group") {
          return (
            <div
              key={`group-${index}`}
              role="group"
              aria-label={typeof item.label === "string" ? item.label : undefined}
            >
              {item.label && <div className="menu-group-label">{item.label}</div>}
              {item.items?.map((child) => (
                <MenuButton
                  key={child.value}
                  item={child}
                  active={active}
                  onValueChange={handleChange}
                />
              ))}
            </div>
          );
        }
        return (
          <MenuButton
            key={item.value ?? index}
            item={item}
            active={active}
            onValueChange={handleChange}
          />
        );
      })}
    </ul>
  );
});

function MenuButton({
  item,
  active,
  onValueChange,
}: {
  item: MenuOption;
  active?: string;
  onValueChange: (value: string) => void;
}) {
  const selected = item.value !== undefined && active === item.value;
  return (
    <li role="none" style={{ display: "contents" }}>
      <button
        type="button"
        role="menuitem"
        className="menu-item"
        data-state={selected ? "selected" : undefined}
        aria-disabled={item.disabled || undefined}
        disabled={item.disabled}
        onClick={() => {
          if (!item.disabled && item.value !== undefined) onValueChange(item.value);
        }}
      >
        {item.icon && <span className="menu-item-icon">{item.icon}</span>}
        <span className="menu-item-label">{item.label}</span>
        {item.extra && <span className="menu-item-extra">{item.extra}</span>}
      </button>
    </li>
  );
}

import * as React from "react";
import { Check, Search } from "lucide-react";

import { cn } from "../../lib/utils";
import type {
  EditorialAuthCardProp,
  EditorialAuthProp,
  EditorialEmptyPanelProp,
  EditorialFootnoteProp,
  EditorialInlineSearchProp,
  EditorialMetaBarProp,
  EditorialStatsItemProp,
  EditorialStatsProp,
  EditorialTextButtonProp,
  EditorialToggleGroupItemProp,
  EditorialToggleGroupProp,
  EditorialToolbarProp,
  HoldingCardActionProp,
  HoldingCardProp,
  HoldingGridProp,
  SettingsLayoutProp,
  SettingsPanelProp,
  ThemePickerOptionProp,
  ThemePickerProp,
} from "../../props/components/editorial-account.prop";

export type {
  EditorialAuthCardProp,
  EditorialAuthCardProp as EditorialAuthCardProps,
  EditorialAuthProp,
  EditorialAuthProp as EditorialAuthProps,
  EditorialEmptyPanelProp,
  EditorialEmptyPanelProp as EditorialEmptyPanelProps,
  EditorialFootnoteProp,
  EditorialFootnoteProp as EditorialFootnoteProps,
  EditorialInlineSearchProp,
  EditorialInlineSearchProp as EditorialInlineSearchProps,
  EditorialMetaBarProp,
  EditorialMetaBarProp as EditorialMetaBarProps,
  EditorialStatsItemProp,
  EditorialStatsProp,
  EditorialStatsProp as EditorialStatsProps,
  EditorialTextButtonProp,
  EditorialTextButtonProp as EditorialTextButtonProps,
  EditorialToggleGroupItemProp,
  EditorialToggleGroupProp,
  EditorialToggleGroupProp as EditorialToggleGroupProps,
  EditorialToolbarProp,
  EditorialToolbarProp as EditorialToolbarProps,
  HoldingCardActionProp,
  HoldingCardProp,
  HoldingCardProp as HoldingCardProps,
  HoldingGridProp,
  HoldingGridProp as HoldingGridProps,
  HoldingViewProp,
  SettingsLayoutProp,
  SettingsLayoutProp as SettingsLayoutProps,
  SettingsPanelProp,
  SettingsPanelProp as SettingsPanelProps,
  ThemePickerOptionProp,
  ThemePickerPreviewProp,
  ThemePickerProp,
  ThemePickerProp as ThemePickerProps,
} from "../../props/components/editorial-account.prop";

/*
 * THE EDITORIAL ACCOUNT FAMILY (gh#1439) — the signed-in pages of an editorial site (a collection,
 * display settings, sign-in). Same contract as the editorial family (gh#1435): every length and
 * colour is an --editorial-* token (tokens/components/editorial-account.css), the rules live in
 * styles/editorial-account-layout.css, and no rule names a breakpoint — a theme re-declares the
 * tokens under its own width queries. None of these carries a string of its own.
 */

type AnyProps = Record<string, unknown> & { className?: string; children?: React.ReactNode };

const headingTag = (level: 2 | 3 | undefined) => (level === 3 ? "h3" : "h2");

/** A named group of `aria-pressed` buttons, one pressed at a time: text filter or icon switch. */
export function EditorialToggleGroup({
  items,
  value,
  onValueChange,
  variant = "text",
  className,
  ...rest
}: EditorialToggleGroupProp) {
  return (
    <div
      role="group"
      aria-label={rest["aria-label"]}
      data-slot="editorial-toggle-group"
      data-variant={variant}
      className={cn("ui-editorial-toggle-group", className)}
    >
      {items.map((item: EditorialToggleGroupItemProp) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={item.value === value}
          aria-label={variant === "icon" ? item.label : undefined}
          title={variant === "icon" ? item.label : undefined}
          className="ui-editorial-toggle-group-option ui-focus-ring"
          onClick={() => onValueChange(item.value)}
        >
          {item.icon != null && (
            <span aria-hidden className="ui-editorial-toggle-group-icon">
              {item.icon}
            </span>
          )}
          {variant === "text" && item.label}
        </button>
      ))}
    </div>
  );
}

/** A hairline-ruled strip: a glyph and a line at the start, a badge at the end. */
export function EditorialMetaBar({ icon, start, end, className }: EditorialMetaBarProp) {
  return (
    <div data-slot="editorial-meta-bar" className={cn("ui-editorial-meta-bar", className)}>
      <span className="ui-editorial-meta-bar-start">
        {icon != null && (
          <span aria-hidden className="ui-editorial-meta-bar-icon">
            {icon}
          </span>
        )}
        {start}
      </span>
      {end != null && <span className="ui-editorial-meta-bar-end">{end}</span>}
    </div>
  );
}

/** A centred signed-out (`guest`, with a card-stack illustration) or empty (`empty`) panel. */
export function EditorialEmptyPanel({
  variant = "guest",
  eyebrow,
  title,
  level,
  description,
  actions,
  icon,
  className,
}: EditorialEmptyPanelProp) {
  const Heading = headingTag(level);
  return (
    <div
      data-slot="editorial-empty-panel"
      data-variant={variant}
      className={cn("ui-editorial-empty-panel", className)}
    >
      {variant === "guest" ? (
        <div aria-hidden className="ui-editorial-empty-panel-art">
          <span />
          <span />
          <span />
        </div>
      ) : (
        icon != null && (
          <div aria-hidden className="ui-editorial-empty-panel-icon">
            {icon}
          </div>
        )
      )}
      {eyebrow}
      <Heading className="ui-editorial-empty-panel-title">{title}</Heading>
      {description != null && <p className="ui-editorial-empty-panel-description">{description}</p>}
      {actions != null && <div className="ui-editorial-empty-panel-actions">{actions}</div>}
    </div>
  );
}

/** A strip of figure tiles on unequal tracks; the first tile is the lead. */
export function EditorialStats({ items, className, ...rest }: EditorialStatsProp) {
  return (
    <ul
      aria-label={rest["aria-label"]}
      data-slot="editorial-stats"
      className={cn("ui-editorial-stats", className)}
    >
      {items.map((item: EditorialStatsItemProp, index: number) => (
        <li key={index} className="ui-editorial-stats-item">
          <span className="ui-editorial-stats-label">{item.label}</span>
          <strong className="ui-editorial-stats-value">
            {item.value}
            {item.unit != null && <small className="ui-editorial-stats-unit">{item.unit}</small>}
          </strong>
          {item.note != null && <p className="ui-editorial-stats-note">{item.note}</p>}
        </li>
      ))}
    </ul>
  );
}

/** A wrapping bar over a hairline: filters at the start, view switch and action at the end. */
export function EditorialToolbar({ start, end, className }: EditorialToolbarProp) {
  return (
    <div data-slot="editorial-toolbar" className={cn("ui-editorial-toolbar", className)}>
      {start != null && <div className="ui-editorial-toolbar-start">{start}</div>}
      {end != null && <div className="ui-editorial-toolbar-end">{end}</div>}
    </div>
  );
}

/** The track of HoldingCards; `view="list"` turns every card into a wide row. */
export function HoldingGrid({ view = "grid", children, className, ...rest }: HoldingGridProp) {
  return (
    <ul
      aria-label={rest["aria-label"]}
      data-slot="holding-grid"
      data-view={view}
      className={cn("ui-holding-grid", className)}
    >
      {React.Children.map(children, (child) =>
        child == null || child === false ? null : <li className="ui-holding-grid-item">{child}</li>,
      )}
    </ul>
  );
}

/** One owned item: picture ground, overline, title, meta, tags, purchase line, date, actions. */
export function HoldingCard({
  media,
  overline,
  title,
  level,
  meta,
  tags,
  purchase,
  date,
  actions,
  className,
}: HoldingCardProp) {
  const Heading = headingTag(level);
  const mediaBox = React.isValidElement(media) ? (
    React.cloneElement(media as React.ReactElement<AnyProps>, {
      className: cn("ui-holding-card-media", (media.props as AnyProps).className),
    })
  ) : (
    <div className="ui-holding-card-media">{media}</div>
  );
  return (
    <article data-slot="holding-card" className={cn("ui-holding-card", className)}>
      {mediaBox}
      <div className="ui-holding-card-body">
        {overline != null && <p className="ui-holding-card-overline">{overline}</p>}
        <Heading className="ui-holding-card-title">{title}</Heading>
        {meta != null && <p className="ui-holding-card-meta">{meta}</p>}
        {tags != null && tags.length > 0 && (
          <div className="ui-holding-card-tags">
            {tags.map((tag, index) => (
              <span key={index} className="ui-holding-card-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        {purchase != null && (
          <div className="ui-holding-card-purchase">
            <span className="ui-holding-card-purchase-label">{purchase.label}</span>
            <strong className="ui-holding-card-purchase-value">{purchase.value}</strong>
          </div>
        )}
        {date != null && <p className="ui-holding-card-date">{date}</p>}
        {actions != null && <div className="ui-holding-card-actions">{actions}</div>}
      </div>
    </article>
  );
}

/** A quiet glyph + label action of a HoldingCard; `asChild` turns a router link into it. */
export function HoldingCardAction({
  icon,
  children,
  asChild,
  onClick,
  disabled,
  className,
  ...rest
}: HoldingCardActionProp) {
  const glyph =
    icon != null ? (
      <span aria-hidden className="ui-holding-card-action-icon">
        {icon}
      </span>
    ) : null;
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<AnyProps>;
    return React.cloneElement(
      child,
      {
        "aria-label": rest["aria-label"],
        className: cn("ui-holding-card-action ui-focus-ring", className, child.props.className),
      },
      <>
        {glyph}
        {child.props.children}
      </>,
    );
  }
  return (
    <button
      type="button"
      aria-label={rest["aria-label"]}
      disabled={disabled}
      onClick={onClick}
      className={cn("ui-holding-card-action ui-focus-ring", className)}
    >
      {glyph}
      {children}
    </button>
  );
}

/** A settings page: a sticky rail beside the panels. */
export function SettingsLayout({ aside, children, className }: SettingsLayoutProp) {
  return (
    <div data-slot="settings-layout" className={cn("ui-settings-layout", className)}>
      {aside != null && <aside className="ui-settings-layout-aside">{aside}</aside>}
      <div className="ui-settings-layout-panels">{children}</div>
    </div>
  );
}

/** One bordered settings section: number, title, description, then its fields. */
export function SettingsPanel({
  number,
  title,
  level,
  description,
  children,
  titleId,
  className,
}: SettingsPanelProp) {
  const Heading = headingTag(level);
  return (
    <section
      aria-labelledby={titleId}
      data-slot="settings-panel"
      className={cn("ui-settings-panel", className)}
    >
      <div className="ui-settings-panel-head">
        {number != null && <span className="ui-settings-panel-number">{number}</span>}
        <div>
          <Heading id={titleId} className="ui-settings-panel-title">
            {title}
          </Heading>
          {description != null && <p className="ui-settings-panel-description">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/** An illustrated radio group for the colour theme (painted light / dark / system previews). */
export function ThemePicker({
  legend,
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  className,
}: ThemePickerProp) {
  const reactId = React.useId();
  const groupName = name ?? `theme-picker-${reactId}`;
  const [inner, setInner] = React.useState(defaultValue);
  const current = value !== undefined ? value : inner;
  return (
    <fieldset data-slot="theme-picker" className={cn("ui-theme-picker", className)}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option: ThemePickerOptionProp) => (
        <label key={option.value} className="ui-theme-picker-option">
          <input
            type="radio"
            name={groupName}
            value={option.value}
            checked={current === option.value}
            onChange={() => {
              if (value === undefined) setInner(option.value);
              onValueChange?.(option.value);
            }}
            className="ui-theme-picker-input"
          />
          <span aria-hidden data-preview={option.preview} className="ui-theme-picker-preview">
            <i />
            <i />
            <i />
          </span>
          <span className="ui-theme-picker-label">
            {option.icon != null && (
              <span aria-hidden className="ui-theme-picker-icon">
                {option.icon}
              </span>
            )}
            {option.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

/** A sign-in / sign-up page: the story column beside the form card. */
export function EditorialAuth({
  eyebrow,
  title,
  description,
  art,
  benefits,
  children,
  className,
}: EditorialAuthProp) {
  return (
    <div data-slot="editorial-auth" className={cn("ui-editorial-auth", className)}>
      <div className="ui-editorial-auth-story">
        {eyebrow}
        <h1 className="ui-editorial-auth-title">{title}</h1>
        {description != null && <p className="ui-editorial-auth-description">{description}</p>}
        <div aria-hidden className="ui-editorial-auth-art">
          <div />
          <div>{art}</div>
        </div>
        {benefits != null && benefits.length > 0 && (
          <ul className="ui-editorial-auth-benefits">
            {benefits.map((benefit, index) => (
              <li key={index}>
                <Check aria-hidden className="ui-editorial-auth-benefit-icon" />
                {benefit}
              </li>
            ))}
          </ul>
        )}
      </div>
      {children}
    </div>
  );
}

/** The form card of EditorialAuth: badge, title, copy, the form and a ruled footer line. */
export function EditorialAuthCard({
  badge,
  title,
  level,
  description,
  children,
  footer,
  className,
}: EditorialAuthCardProp) {
  const Heading = headingTag(level);
  return (
    <div data-slot="editorial-auth-card" className={cn("ui-editorial-auth-card", className)}>
      {badge != null && <div className="ui-editorial-auth-card-badge">{badge}</div>}
      <Heading className="ui-editorial-auth-card-title">{title}</Heading>
      {description != null && <p className="ui-editorial-auth-card-description">{description}</p>}
      <div className="ui-editorial-auth-card-body">{children}</div>
      {footer != null && <div className="ui-editorial-auth-card-footer">{footer}</div>}
    </div>
  );
}

/** An underlined text action in the primary tone; `asChild` turns a router link into it. */
export function EditorialTextButton({
  children,
  icon,
  asChild,
  onClick,
  disabled,
  className,
}: EditorialTextButtonProp) {
  const glyph =
    icon != null ? (
      <span aria-hidden className="ui-editorial-text-button-icon">
        {icon}
      </span>
    ) : null;
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<AnyProps>;
    return React.cloneElement(
      child,
      { className: cn("ui-editorial-text-button ui-focus-ring", className, child.props.className) },
      <>
        {child.props.children}
        {glyph}
      </>,
    );
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn("ui-editorial-text-button ui-focus-ring", className)}
    >
      {children}
      {glyph}
    </button>
  );
}

/** A collection's own search row: visible label, framed field with a glyph, a live count at the end. */
export function EditorialInlineSearch({
  label,
  id,
  placeholder,
  defaultValue,
  onSearch,
  debounce = 300,
  count,
  className,
}: EditorialInlineSearchProp) {
  const reactId = React.useId();
  const inputId = id ?? `editorial-inline-search-${reactId}`;
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const last = React.useRef((defaultValue ?? "").trim());
  const report = React.useCallback(
    (value: string) => {
      const query = value.trim();
      if (query === last.current) return;
      last.current = query;
      onSearch(query);
    },
    [onSearch],
  );
  React.useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div
      role="search"
      aria-label={label}
      data-slot="editorial-inline-search"
      className={cn("ui-editorial-inline-search", className)}
    >
      <label htmlFor={inputId} className="ui-editorial-inline-search-label">
        {label}
      </label>
      <div className="ui-editorial-inline-search-field">
        <Search aria-hidden className="ui-editorial-inline-search-icon" />
        <input
          id={inputId}
          type="search"
          placeholder={placeholder}
          defaultValue={defaultValue}
          autoComplete="off"
          className="ui-editorial-inline-search-input ui-focus-ring"
          onChange={(event) => {
            const value = event.currentTarget.value;
            clearTimeout(timer.current);
            timer.current = setTimeout(() => report(value), debounce);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            clearTimeout(timer.current);
            report(event.currentTarget.value);
          }}
        />
      </div>
      {count != null && (
        <span role="status" aria-live="polite" className="ui-editorial-inline-search-count">
          {count}
        </span>
      )}
    </div>
  );
}

/** A quiet closing line: a note at the start, an optional action at the end. */
export function EditorialFootnote({
  children,
  action,
  align = "start",
  className,
}: EditorialFootnoteProp) {
  return (
    <div
      data-slot="editorial-footnote"
      data-align={align === "start" ? undefined : align}
      className={cn("ui-editorial-footnote", className)}
    >
      {children != null && <div className="ui-editorial-footnote-body">{children}</div>}
      {action != null && <div className="ui-editorial-footnote-action">{action}</div>}
    </div>
  );
}

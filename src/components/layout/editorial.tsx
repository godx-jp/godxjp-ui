import * as React from "react";
import { createPortal } from "react-dom";
import { useLayoutEffect } from "@react-aria/utils";
import { ArrowRight, Bookmark, Search } from "lucide-react";

import { isImeComposing } from "../../lib/ime";
import { useOverlayPortalContainer } from "../../lib/overlay-portal";
import { Slot } from "../../lib/slot";
import { Breadcrumb } from "./breadcrumb";
import { EditorialSearchInline } from "./editorial-account";
import { cn } from "../../lib/utils";
import type {
  CardShowcaseProp,
  EditorialArticleProp,
  EditorialArticleSectionProp,
  EditorialNoteProp,
  EditorialPanelProp,
  CatalogCardProp,
  CatalogCardTagProp,
  EditorialBannerProp,
  EditorialBreadcrumbProp,
  EditorialCardProp,
  EditorialFilterBarProp,
  EditorialFooterProp,
  EditorialMastheadActionProp,
  EditorialMastheadLinkProp,
  EditorialMastheadProp,
  EditorialHeroProp,
  EditorialPageHeaderProp,
  EditorialPillNavItemProp,
  EditorialPillNavProp,
  EditorialSearchProp,
  EditorialSectionHeadProp,
  EditorialSectionProp,
  EditorialTextLinkProp,
  EyebrowProp,
} from "../../props/components/layout.prop";

export type {
  EditorialArticleProp,
  EditorialArticleProp as EditorialArticleProps,
  EditorialArticleSectionProp,
  EditorialNoteProp,
  EditorialPanelProp,
  EditorialPanelProp as EditorialPanelProps,
  EditorialBreadcrumbProp,
  EditorialBreadcrumbProp as EditorialBreadcrumbProps,
  EditorialPageHeaderProp,
  EditorialPageHeaderProp as EditorialPageHeaderProps,
  CardShowcaseProp,
  CardShowcaseProp as CardShowcaseProps,
  CatalogCardProp,
  CatalogCardProp as CatalogCardProps,
  CatalogCardTagProp,
  EditorialBannerProp,
  EditorialBannerProp as EditorialBannerProps,
  EditorialCardProp,
  EditorialCardProp as EditorialCardProps,
  EditorialHeroProp,
  EditorialHeroProp as EditorialHeroProps,
  EditorialPillNavItemProp,
  EditorialPillNavProp,
  EditorialPillNavProp as EditorialPillNavProps,
  EditorialSearchProp,
  EditorialSearchProp as EditorialSearchProps,
  EditorialSearchSuggestionFooterProp,
  EditorialSearchSuggestionGroupProp,
  EditorialSearchSuggestionProp,
  EditorialSectionHeadProp,
  EditorialSectionHeadProp as EditorialSectionHeadProps,
  EditorialSectionProp,
  EditorialSectionProp as EditorialSectionProps,
  EditorialTextLinkProp,
  EyebrowProp,
  EyebrowProp as EyebrowProps,
  EditorialFilterBarProp,
  EditorialFooterProp,
  EditorialMastheadActionProp,
  EditorialMastheadLinkProp,
  EditorialMastheadProp,
} from "../../props/components/layout.prop";

/*
 * THE EDITORIAL FAMILY (gh#1435). Every box below reads its geometry from
 * tokens/components/editorial.css; the rules live in styles/layout.css (`.ui-editorial-*`). None of
 * these components takes a breakpoint: a theme re-declares the tokens under its own width queries,
 * which is how a design with breakpoints of its own (360 / 700 / 960 / 1199) is matched exactly.
 */

type AnyProps = Record<string, unknown> & { className?: string; children?: React.ReactNode };

/** Re-use the consumer's link element (a router Link or `<a>`) as the box, with our content inside. */
function intoElement(
  element: React.ReactElement,
  className: string,
  content: React.ReactNode,
  extra?: Record<string, unknown>,
) {
  const props = element.props as AnyProps;
  return React.cloneElement(
    element as React.ReactElement<AnyProps>,
    { ...extra, className: cn(className, props.className) },
    content,
  );
}

/** One full-width band of a `flow="sections"` page; the content sits in the landing column. */
export function EditorialSection({
  children,
  tone = "default",
  divider = "none",
  spacing = "none",
  as: Tag = "section",
  className,
  ...rest
}: EditorialSectionProp) {
  return (
    <Tag
      {...rest}
      data-slot="editorial-section"
      data-tone={tone === "default" ? undefined : tone}
      data-divider={divider === "none" ? undefined : divider}
      data-spacing={spacing === "none" ? undefined : spacing}
      className={cn("ui-editorial-section", className)}
    >
      <div className="ui-editorial-section-content">{children}</div>
    </Tag>
  );
}

/** The opening of an editorial page: copy (kicker, h1, lead, search, suggestions) beside media. */
export function EditorialHero({
  eyebrow,
  title,
  description,
  search,
  footer,
  media,
  className,
}: EditorialHeroProp) {
  return (
    <div data-slot="editorial-hero" className={cn("ui-editorial-hero", className)}>
      <div className="ui-editorial-hero-copy">
        {eyebrow}
        <h1 className="ui-editorial-hero-title">{title}</h1>
        {description != null && <p className="ui-editorial-hero-description">{description}</p>}
        {search != null && <div className="ui-editorial-hero-search">{search}</div>}
        {footer != null && <div className="ui-editorial-hero-footer">{footer}</div>}
      </div>
      {media != null && <div className="ui-editorial-hero-media">{media}</div>}
    </div>
  );
}

/** The small uppercase kicker above an editorial heading, led by a short ornament rule. */
export function Eyebrow({ children, variant = "ruled", as: Tag = "p", className }: EyebrowProp) {
  return (
    <Tag
      data-slot="eyebrow"
      data-variant={variant}
      className={cn("ui-editorial-eyebrow", className)}
    >
      {children}
    </Tag>
  );
}

/** A section's head: kicker, an editorial title, one line of description and a trailing action. */
export function EditorialSectionHead({
  eyebrow,
  title,
  description,
  action,
  level = 2,
  scale = "section",
  titleId,
  className,
}: EditorialSectionHeadProp) {
  const Heading = level === 3 ? "h3" : "h2";
  return (
    <div
      data-slot="editorial-section-head"
      data-scale={scale === "module" ? "module" : undefined}
      className={cn("ui-editorial-section-head", className)}
    >
      <div className="ui-editorial-section-head-copy">
        {eyebrow}
        <Heading id={titleId} className="ui-editorial-section-head-title">
          {title}
        </Heading>
        {description != null && (
          <p className="ui-editorial-section-head-description">{description}</p>
        )}
      </div>
      {action != null && <div className="ui-editorial-section-head-action">{action}</div>}
    </div>
  );
}

/** The trail at the top of an editorial page: `Breadcrumb` with the editorial rhythm (gh#1437). */
export function EditorialBreadcrumb({
  items,
  linkComponent,
  ariaLabel,
  className,
}: EditorialBreadcrumbProp) {
  return (
    <div data-slot="editorial-breadcrumb" className={cn("ui-editorial-breadcrumb", className)}>
      <Breadcrumb items={items} linkComponent={linkComponent} ariaLabel={ariaLabel} />
    </div>
  );
}

/** The intro of an editorial listing page: trail, kicker, the page's h1, a lead and an action. */
export function EditorialPageHeader({
  breadcrumb,
  linkComponent,
  breadcrumbLabel,
  eyebrow,
  title,
  description,
  actions,
  search,
  titleId,
  eyebrowTone = "page",
  className,
}: EditorialPageHeaderProp) {
  return (
    <div
      data-slot="editorial-page-header"
      data-eyebrow-tone={eyebrowTone === "page" ? undefined : eyebrowTone}
      className={cn("ui-editorial-page-header", className)}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <EditorialBreadcrumb
          items={breadcrumb}
          linkComponent={linkComponent}
          ariaLabel={breadcrumbLabel}
        />
      )}
      <header className="ui-editorial-page-header-row">
        <div className="ui-editorial-page-header-copy">
          {eyebrow}
          <h1 id={titleId} className="ui-editorial-page-header-title">
            {title}
          </h1>
          {description != null && (
            <p className="ui-editorial-page-header-description">{description}</p>
          )}
          {search != null && <div className="ui-editorial-page-header-search">{search}</div>}
        </div>
        {actions != null && <div className="ui-editorial-page-header-actions">{actions}</div>}
      </header>
    </div>
  );
}

/** The reading column of a long-form editorial page: kicker, the page's h1, intro, sections. */
export function EditorialArticle({
  eyebrow,
  title,
  intro,
  children,
  titleId,
  className,
}: EditorialArticleProp) {
  return (
    <article data-slot="editorial-article" className={cn("ui-editorial-article", className)}>
      {eyebrow}
      <h1 id={titleId} className="ui-editorial-article-title">
        {title}
      </h1>
      {intro != null && <p className="ui-editorial-article-intro">{intro}</p>}
      {children}
    </article>
  );
}

/** One titled section of an `EditorialArticle`: an h2, paragraphs of prose, then anything else. */
export function EditorialArticleSection({
  title,
  paragraphs,
  children,
  titleId,
  className,
}: EditorialArticleSectionProp) {
  return (
    <section
      data-slot="editorial-article-section"
      aria-labelledby={titleId}
      className={cn("ui-editorial-article-section", className)}
    >
      <h2 id={titleId} className="ui-editorial-article-heading">
        {title}
      </h2>
      {paragraphs?.map((paragraph, index) => (
        <p key={index} className="ui-editorial-article-paragraph">
          {paragraph}
        </p>
      ))}
      {children}
    </section>
  );
}

/** A note block in an editorial article, set off by an ornament rule on its start edge. */
export function EditorialNote({ children, className }: EditorialNoteProp) {
  return (
    <div role="note" data-slot="editorial-note" className={cn("ui-editorial-note", className)}>
      {children}
    </div>
  );
}

/** A bordered panel: a tag, a heading and a list (a roadmap group). */
export function EditorialPanel({
  tag,
  title,
  items,
  children,
  level = 2,
  className,
}: EditorialPanelProp) {
  const Heading = level === 3 ? "h3" : "h2";
  return (
    <article data-slot="editorial-panel" className={cn("ui-editorial-panel", className)}>
      {tag != null && <span className="ui-editorial-panel-tag">{tag}</span>}
      <Heading className="ui-editorial-panel-title">{title}</Heading>
      {items && items.length > 0 && (
        <ul className="ui-editorial-panel-list">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
      {children}
    </article>
  );
}

/** An inline call to action with a trailing arrow. `asChild` wraps a router link. */
export function EditorialTextLink({
  children,
  asChild,
  className,
  ...rest
}: EditorialTextLinkProp) {
  const icon = <ArrowRight aria-hidden className="ui-editorial-text-link-icon" />;
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<AnyProps>;
    return intoElement(
      child,
      cn("ui-editorial-text-link", className),
      <>
        {child.props.children}
        {icon}
      </>,
      { ...rest, "data-slot": "editorial-text-link" },
    );
  }
  return (
    <a
      {...rest}
      data-slot="editorial-text-link"
      className={cn("ui-editorial-text-link", className)}
    >
      {children}
      {icon}
    </a>
  );
}

/** The site search: `inset` (glyph, field and submit in one box) or `inline` (gh#1439). */
export function EditorialSearch(props: EditorialSearchProp) {
  if (props.variant === "inline") {
    const { label, id, placeholder, defaultValue, onSearch, debounce, count, className } = props;
    return (
      <EditorialSearchInline
        label={label}
        id={id}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onSearch={onSearch ? (query: string) => onSearch(query) : undefined}
        debounce={debounce}
        count={count}
        className={className}
      />
    );
  }
  return <EditorialSearchInset {...props} />;
}

/**
 * The inset site search: glyph, field and submit button in one box, under a hidden label. Given
 * `suggestions` / `suggestionsFooter` the field is an ARIA combobox over a grouped listbox of links
 * (gh#1447, WAI-ARIA APG "combobox with listbox popup"): focus stays in the field, arrows move the
 * active row, Enter follows its link, Escape closes. An IME candidate is never a query.
 */
function EditorialSearchInset({
  label,
  placeholder,
  submitLabel,
  name = "q",
  defaultValue,
  action,
  onSearch,
  scope,
  suggestions,
  suggestionsFooter,
  suggestionsLabel,
  onQueryChange,
  linkComponent: LinkComponent = "a",
  id,
  className,
}: EditorialSearchProp) {
  const reactId = React.useId();
  const inputId = id ?? `editorial-search-${reactId}`;
  const listboxId = `${inputId}-suggestions`;
  const combobox = suggestions !== undefined || suggestionsFooter !== undefined;
  const composing = React.useRef(false);
  const [focused, setFocused] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [hasQuery, setHasQuery] = React.useState(Boolean(defaultValue?.trim()));
  const [active, setActive] = React.useState(-1);

  const groups = (suggestions ?? []).filter((group) => group.items.length > 0);
  const rowKeys = [
    ...groups.flatMap((group) => group.items.map((item) => `${group.id}:${item.id}`)),
    ...(suggestionsFooter ? ["footer"] : []),
  ];
  const rowsKey = rowKeys.join("|");
  const open = combobox && focused && !dismissed && hasQuery && rowKeys.length > 0;
  const formRef = React.useRef<HTMLFormElement>(null);
  const portalContainer = useOverlayPortalContainer();
  const anchor = usePopupAnchor(formRef, open);
  const optionId = React.useCallback(
    (index: number) => `${listboxId}-option-${index}`,
    [listboxId],
  );

  // New rows: nothing is active until the user moves into them.
  React.useEffect(() => setActive(-1), [rowsKey]);
  React.useEffect(() => {
    if (open && active >= 0) {
      document.getElementById(optionId(active))?.scrollIntoView?.({ block: "nearest" });
    }
  }, [open, active, optionId]);

  const report = (value: string) => {
    setHasQuery(value.trim() !== "");
    setDismissed(false);
    onQueryChange?.(value);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isImeComposing(event)) return;
    if (!open) {
      if (event.key === "ArrowDown" && hasQuery && rowKeys.length > 0) {
        event.preventDefault();
        setDismissed(false);
      }
      return;
    }
    const count = rowKeys.length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % count);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index <= 0 ? count - 1 : index - 1));
    } else if (event.key === "Escape") {
      // The first Escape closes the popup; the next one is the browser's (it clears the field).
      event.preventDefault();
      setDismissed(true);
      setActive(-1);
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      document.getElementById(optionId(active))?.click();
    }
  };

  let rowIndex = -1;
  const option = (key: string, href: string, rowClass: string, children: React.ReactNode) => {
    rowIndex += 1;
    const index = rowIndex;
    return (
      <LinkComponent
        key={key}
        id={optionId(index)}
        href={href}
        role="option"
        aria-selected={index === active}
        tabIndex={-1}
        className={rowClass}
        onClick={() => {
          setDismissed(true);
          setActive(-1);
        }}
      >
        {children}
      </LinkComponent>
    );
  };

  const comboboxProps: React.InputHTMLAttributes<HTMLInputElement> = combobox
    ? {
        role: "combobox",
        "aria-autocomplete": "list",
        "aria-expanded": open,
        "aria-controls": listboxId,
        "aria-activedescendant": open && active >= 0 ? optionId(active) : undefined,
        onChange: (event) => {
          if (!composing.current) report(event.currentTarget.value);
        },
        onCompositionStart: () => {
          composing.current = true;
        },
        onCompositionEnd: (event) => {
          composing.current = false;
          report(event.currentTarget.value);
        },
        onFocus: () => setFocused(true),
        onBlur: () => {
          setFocused(false);
          setActive(-1);
        },
        onKeyDown,
      }
    : {};

  return (
    <form
      ref={formRef}
      role="search"
      aria-label={label}
      action={action}
      data-slot="editorial-search"
      className={cn("ui-editorial-search", className)}
      onSubmit={(event) => {
        setDismissed(true);
        if (!onSearch) return;
        event.preventDefault();
        const value = new FormData(event.currentTarget).get(name);
        onSearch(typeof value === "string" ? value.trim() : "");
      }}
    >
      {scope != null && (
        <span data-slot="editorial-search-scope" className="ui-editorial-search-scope">
          {scope}
        </span>
      )}
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Search aria-hidden className="ui-editorial-search-icon" />
      <input
        id={inputId}
        name={name}
        type="search"
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete="off"
        className="ui-editorial-search-input"
        {...comboboxProps}
      />
      <button type="submit" className="ui-editorial-search-button ui-focus-ring">
        {submitLabel}
        <ArrowRight aria-hidden className="ui-editorial-search-button-icon" />
      </button>
      {/* Portalled (the overlay container): a hero or a toolbar that clips its overflow must not
          cut the popup off. Placed under the box from its measured rect while open. */}
      {combobox &&
        anchor.mounted &&
        createPortal(
          <div
            data-slot="editorial-search-popup"
            className="ui-editorial-search-popup"
            hidden={!open}
            style={anchor.style}
            // A press on a row must not blur the field first (the popup would close under the click).
            onMouseDown={(event) => event.preventDefault()}
          >
            <div role="listbox" id={listboxId} aria-label={suggestionsLabel ?? label}>
              {groups.map((group) => (
                <div
                  key={group.id}
                  role="group"
                  aria-labelledby={`${listboxId}-group-${group.id}`}
                  className="ui-editorial-search-group"
                >
                  <div
                    role="presentation"
                    id={`${listboxId}-group-${group.id}`}
                    className="ui-editorial-search-group-label"
                  >
                    {group.label}
                  </div>
                  {group.items.map((item) =>
                    option(
                      `${group.id}:${item.id}`,
                      item.href,
                      "ui-editorial-search-suggestion",
                      <>
                        {item.media != null && (
                          <span aria-hidden className="ui-editorial-search-suggestion-media">
                            {item.media}
                          </span>
                        )}
                        <span className="ui-editorial-search-suggestion-text">
                          <span className="ui-editorial-search-suggestion-label">{item.label}</span>
                          {item.description != null && (
                            <span className="ui-editorial-search-suggestion-description">
                              {item.description}
                            </span>
                          )}
                        </span>
                        {item.meta != null && (
                          <span className="ui-editorial-search-suggestion-meta">{item.meta}</span>
                        )}
                      </>,
                    ),
                  )}
                </div>
              ))}
              {suggestionsFooter &&
                option(
                  "footer",
                  suggestionsFooter.href,
                  "ui-editorial-search-suggestions-footer",
                  <>
                    <span className="ui-editorial-search-suggestion-label">
                      {suggestionsFooter.label}
                    </span>
                    <ArrowRight
                      aria-hidden
                      className="ui-editorial-search-suggestions-footer-icon"
                    />
                  </>,
                )}
            </div>
          </div>,
          portalContainer ?? document.body,
        )}
    </form>
  );
}

/**
 * Where the suggestions popup goes: under the box, as wide as it, with the room left below it in the
 * viewport (`--editorial-search-popup-room`, which caps the popup's max height). Re-measured on
 * scroll (any scroller), resize and a change of the box's own size while open. `mounted` turns true
 * after the first client render, so the server renders no portal.
 */
function usePopupAnchor(formRef: React.RefObject<HTMLFormElement | null>, open: boolean) {
  const [mounted, setMounted] = React.useState(false);
  const [style, setStyle] = React.useState<React.CSSProperties>();
  React.useEffect(() => setMounted(true), []);
  useLayoutEffect(() => {
    const form = formRef.current;
    if (!open || !form) return;
    const update = () => {
      const rect = form.getBoundingClientRect();
      setStyle({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
        ["--editorial-search-popup-room" as string]: `${Math.max(0, window.innerHeight - rect.bottom)}px`,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
    observer?.observe(form);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [formRef, open]);
  return { mounted, style };
}

/** A horizontal band of section links, scrolling sideways when it overflows. */
export function EditorialPillNav({ label, children, className, ...rest }: EditorialPillNavProp) {
  return (
    <nav
      {...rest}
      data-slot="editorial-pill-nav"
      className={cn("ui-editorial-pill-nav", className)}
    >
      {label != null && (
        <span aria-hidden className="ui-editorial-pill-nav-label">
          {label}
        </span>
      )}
      {children}
    </nav>
  );
}

/** One pill of an `EditorialPillNav`; `aria-current="page"` marks the current one. */
export function EditorialPillNavItem({
  children,
  asChild,
  icon,
  className,
  ...rest
}: EditorialPillNavItemProp) {
  const marker =
    icon === "dot" ? (
      <span aria-hidden className="ui-editorial-pill-dot" />
    ) : icon != null ? (
      <span aria-hidden className="ui-editorial-pill-icon">
        {icon}
      </span>
    ) : null;
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<AnyProps>;
    return intoElement(
      child,
      cn("ui-editorial-pill ui-focus-ring", className),
      <>
        {marker}
        {child.props.children}
      </>,
      { ...rest, "data-slot": "editorial-pill" },
    );
  }
  return (
    <a
      {...rest}
      data-slot="editorial-pill"
      className={cn("ui-editorial-pill ui-focus-ring", className)}
    >
      {marker}
      {children}
    </a>
  );
}

const FAN_POSITIONS = ["start", "center", "end"] as const;

/** A staged composition of product pictures: a fan of three cards, or a tilted binder page. */
export function CardShowcase({ preset, items, label, caption, className }: CardShowcaseProp) {
  if (preset === "binder") {
    return (
      <div
        data-slot="card-showcase"
        data-preset="binder"
        className={cn("ui-card-showcase", className)}
      >
        {items.map((item, index) => (
          <span key={index} className="ui-card-showcase-pocket">
            {item}
          </span>
        ))}
      </div>
    );
  }
  // DOM order start → end → centre, so the centre card paints over both neighbours without a
  // stacking override. The links are independent pictures, so this order is also a sound focus order.
  const placed = FAN_POSITIONS.map((position, index) => ({ position, item: items[index] })).filter(
    (entry) => entry.item != null,
  );
  const painted = [
    ...placed.filter((entry) => entry.position !== "center"),
    ...placed.filter((entry) => entry.position === "center"),
  ];
  return (
    <div data-slot="card-showcase" data-preset="fan" className={cn("ui-card-showcase", className)}>
      <span aria-hidden className="ui-card-showcase-orbit" data-orbit="1" />
      <span aria-hidden className="ui-card-showcase-orbit" data-orbit="2" />
      <span aria-hidden className="ui-card-showcase-orbit" data-orbit="3" />
      <span aria-hidden className="ui-card-showcase-glow" />
      {label != null && (
        <span aria-hidden className="ui-card-showcase-label">
          {label}
        </span>
      )}
      <span aria-hidden className="ui-card-showcase-star">
        ✦
      </span>
      {painted.map(({ position, item }) => (
        <div key={position} className="ui-card-showcase-card" data-position={position}>
          {item}
        </div>
      ))}
      <span aria-hidden className="ui-card-showcase-star" data-size="small">
        ✦
      </span>
      {caption && (
        <div className="ui-card-showcase-caption">
          {caption.icon != null && (
            <span aria-hidden className="ui-card-showcase-caption-icon">
              {caption.icon}
            </span>
          )}
          <span className="ui-card-showcase-caption-copy">
            {caption.overline != null && (
              <small className="ui-card-showcase-caption-overline">{caption.overline}</small>
            )}
            <strong className="ui-card-showcase-caption-title">{caption.title}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

/** A rounded brand panel: kicker, title, description and a call to action beside a media slot. */
export function EditorialBanner({
  eyebrow,
  title,
  description,
  action,
  media,
  level = 2,
  className,
}: EditorialBannerProp) {
  const Heading = level === 3 ? "h3" : "h2";
  return (
    <div data-slot="editorial-banner" className={cn("ui-editorial-banner", className)}>
      <div className="ui-editorial-banner-copy">
        {eyebrow}
        <Heading className="ui-editorial-banner-title">{title}</Heading>
        {description != null && <p className="ui-editorial-banner-description">{description}</p>}
        {action != null && <div className="ui-editorial-banner-action">{action}</div>}
      </div>
      {media != null && <div className="ui-editorial-banner-media">{media}</div>}
    </div>
  );
}

/** A catalog tile: framed picture with an overlaid favourite, then overline, title, meta, price. */
export function CatalogCard({
  variant = "card",
  media,
  favorite,
  overline,
  title,
  level = 3,
  meta,
  priceLabel,
  price,
  change,
  footer,
  className,
}: CatalogCardProp) {
  const Heading = level === 2 ? "h2" : level === 4 ? "h4" : "h3";
  return (
    <article
      data-slot="catalog-card"
      data-variant={variant}
      className={cn("ui-catalog-card", className)}
    >
      {favorite && (
        <button
          type="button"
          aria-pressed={favorite.pressed}
          aria-label={favorite.label}
          disabled={favorite.disabled}
          className="ui-catalog-card-favorite ui-focus-ring"
          onClick={() => favorite.onPressedChange(!favorite.pressed)}
        >
          <Bookmark aria-hidden className="ui-catalog-card-favorite-icon" />
        </button>
      )}
      <div className="ui-catalog-card-media">{media}</div>
      <div className="ui-catalog-card-body">
        {overline != null && <p className="ui-catalog-card-overline">{overline}</p>}
        <Heading className="ui-catalog-card-title">{title}</Heading>
        {meta != null && <div className="ui-catalog-card-meta">{meta}</div>}
        {priceLabel != null && <p className="ui-catalog-card-price-label">{priceLabel}</p>}
        {(price != null || change != null) && (
          <div className="ui-catalog-card-price-line">
            {price != null && <span className="ui-catalog-card-price">{price}</span>}
            {change != null && <span className="ui-catalog-card-change">{change}</span>}
          </div>
        )}
        {footer != null && <div className="ui-catalog-card-footer">{footer}</div>}
      </div>
    </article>
  );
}

/** A small outlined tag in a `CatalogCard` metadata row. */
export function CatalogCardTag({ children, className }: CatalogCardTagProp) {
  return <span className={cn("ui-catalog-card-tag", className)}>{children}</span>;
}

/** A whole-card link: a journal card (cover, category, title, lines, arrow) or a spotlight row. */
export function EditorialCard({
  variant,
  link,
  media,
  overline,
  title,
  description,
  action,
  level = 3,
  titleId,
  className,
}: EditorialCardProp) {
  const reactId = React.useId();
  const Heading = level === 2 ? "h2" : level === 4 ? "h4" : "h3";
  if (variant === "spotlight") {
    return intoElement(
      link,
      cn("ui-editorial-card", className),
      <>
        <div className="ui-editorial-card-copy">
          {overline != null && <span className="ui-editorial-card-overline">{overline}</span>}
          <Heading className="ui-editorial-card-title">{title}</Heading>
          {description != null && (
            <p className="ui-editorial-card-description">
              {description}
              <ArrowRight aria-hidden className="ui-editorial-card-description-icon" />
            </p>
          )}
        </div>
        <div aria-hidden className="ui-editorial-card-media">
          {media}
        </div>
      </>,
      { "data-slot": "editorial-card", "data-variant": "spotlight" },
    );
  }
  const headingId = titleId ?? `editorial-card-${reactId}`;
  return (
    <article
      data-slot="editorial-card"
      data-variant="journal"
      className={cn("ui-editorial-card", className)}
    >
      {intoElement(
        link,
        "ui-editorial-card-link ui-focus-ring",
        <>
          {media != null && <div className="ui-editorial-card-media">{media}</div>}
          <div className="ui-editorial-card-copy">
            {overline != null && <span className="ui-editorial-card-overline">{overline}</span>}
            <Heading id={headingId} className="ui-editorial-card-title">
              {title}
            </Heading>
            {description != null && <p className="ui-editorial-card-description">{description}</p>}
            <span className="ui-editorial-card-footer">
              <span>{action}</span>
              <span aria-hidden className="ui-editorial-card-arrow">
                <ArrowRight className="ui-editorial-card-arrow-icon" />
              </span>
            </span>
          </div>
        </>,
        { "aria-labelledby": headingId },
      )}
    </article>
  );
}

/** A public site's header row: logo, primary navigation, actions, and the phone-only menu trigger. */
export function EditorialMasthead({
  brand,
  nav,
  navLabel,
  actions,
  menu,
  className,
}: EditorialMastheadProp) {
  return (
    <div data-slot="editorial-masthead" className={cn("ui-editorial-masthead", className)}>
      <div className="ui-editorial-masthead-brand">{brand}</div>
      {nav != null && (
        <nav
          aria-label={navLabel}
          data-slot="editorial-masthead-nav"
          className="ui-editorial-masthead-nav"
        >
          {nav}
        </nav>
      )}
      <div data-slot="editorial-masthead-actions" className="ui-editorial-masthead-actions">
        {actions}
        {menu != null && <span className="ui-editorial-masthead-menu">{menu}</span>}
      </div>
    </div>
  );
}

/** One primary navigation link of an `EditorialMasthead`; `aria-current="page"` underlines it. */
export function EditorialMastheadLink({
  children,
  asChild,
  className,
  ...rest
}: EditorialMastheadLinkProp) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<AnyProps>;
    return intoElement(
      child,
      cn("ui-editorial-masthead-link ui-focus-ring", className),
      child.props.children,
      { ...rest, "data-slot": "editorial-masthead-link" },
    );
  }
  return (
    <a
      {...rest}
      data-slot="editorial-masthead-link"
      className={cn("ui-editorial-masthead-link ui-focus-ring", className)}
    >
      {children}
    </a>
  );
}

/** A 44px icon control of an `EditorialMasthead` (theme toggle, account). */
export const EditorialMastheadAction = React.forwardRef<
  HTMLButtonElement,
  EditorialMastheadActionProp
>(function EditorialMastheadAction(
  { children, asChild, variant = "ghost", collapse = false, className, type, ...rest },
  ref,
) {
  const shared = {
    "data-slot": "editorial-masthead-action",
    "data-variant": variant,
    "data-collapse": collapse ? "" : undefined,
    className: cn("ui-editorial-masthead-action ui-focus-ring", className),
  };
  if (asChild) {
    return (
      <Slot {...rest} {...shared} ref={ref as React.Ref<HTMLElement>}>
        {children}
      </Slot>
    );
  }
  return (
    <button {...rest} {...shared} ref={ref} type={type ?? "button"}>
      {children}
    </button>
  );
});

/** A public site's footer content: brand and tagline, link groups, and a bottom row. */
export function EditorialFooter({
  brand,
  tagline,
  groups,
  level = 2,
  legal,
  note,
  className,
}: EditorialFooterProp) {
  const Heading = level === 3 ? "h3" : "h2";
  return (
    <div data-slot="editorial-footer" className={cn("ui-editorial-footer", className)}>
      <div data-slot="editorial-footer-top" className="ui-editorial-footer-top">
        <div data-slot="editorial-footer-brand" className="ui-editorial-footer-brand">
          {brand}
          {tagline != null && <p className="ui-editorial-footer-tagline">{tagline}</p>}
        </div>
        {groups.map((group, index) => (
          <div key={index} data-slot="editorial-footer-group" className="ui-editorial-footer-group">
            <Heading className="ui-editorial-footer-heading">{group.title}</Heading>
            {group.links.map((link, linkIndex) => (
              <React.Fragment key={linkIndex}>{link}</React.Fragment>
            ))}
          </div>
        ))}
      </div>
      {(legal != null || note != null) && (
        <div data-slot="editorial-footer-bottom" className="ui-editorial-footer-bottom">
          {legal != null && <span>{legal}</span>}
          {note != null && <p className="ui-editorial-footer-note">{note}</p>}
        </div>
      )}
    </div>
  );
}

/** A row of underlined filter toggles (one pressed at a time) with a trailing note. */
export function EditorialFilterBar({
  options,
  value,
  onValueChange,
  extra,
  className,
  ...rest
}: EditorialFilterBarProp) {
  return (
    <div data-slot="editorial-filter-bar" className={cn("ui-editorial-filter-bar", className)}>
      <div role="group" aria-label={rest["aria-label"]} className="ui-editorial-filter-bar-group">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            className="ui-editorial-filter-bar-option ui-focus-ring"
            onClick={() => onValueChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {extra != null && <span className="ui-editorial-filter-bar-extra">{extra}</span>}
    </div>
  );
}

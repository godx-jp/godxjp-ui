import * as React from "react";
import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Text } from "../general/typography";
import { Separator } from "../layout/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

import type {
  ConversationsCreationProp,
  ConversationsEntryProp,
  ConversationsGroupableProp,
  ConversationsItemProp,
  ConversationsMenuProp,
  ConversationsProp,
} from "../../props/components/navigation.prop";

export type {
  ConversationsProp,
  ConversationsProp as ConversationsProps,
  ConversationsItemProp,
  ConversationsDividerProp,
  ConversationsEntryProp,
  ConversationsMenuProp,
  ConversationsMenuItemProp,
  ConversationsGroupableProp,
  ConversationsCreationProp,
} from "../../props/components/navigation.prop";

/** A run of rows drawn under one heading, or one unlabelled run. */
type Section = {
  /** `undefined` for the unlabelled run — the rows that carry no `group`. */
  group?: string;
  entries: ConversationsEntryProp[];
  collapsible: boolean;
};

function isDivider(
  entry: ConversationsEntryProp,
): entry is Extract<ConversationsEntryProp, { type: "divider" }> {
  return "type" in entry && entry.type === "divider";
}

/**
 * Direction at the RAIL, not at the document — a chat rail can sit inside an RTL region of an
 * otherwise LTR admin, and "forward" has to mean forward for the region the reader is in. Same
 * rule, same helper shape, as `Tree`.
 */
function isRtl(element: HTMLElement | null): boolean {
  return element?.closest("[dir]")?.getAttribute("dir")?.toLowerCase() === "rtl";
}

/**
 * Bucket `items` the way Ant Design X's `useGroupable` does, with one difference that is visible
 * only in the DOM.
 *
 * Ant X (`es/conversations/hooks/useGroupable.js`) emits ONE group entry per ungrouped item —
 * `{ data: [item], enableGroup: false }` — so nine ungrouped conversations become nine sibling
 * runs. That is invisible in its markup because its runs are not lists. Here each run IS a real
 * `<ul>`, and nine single-item lists would be announced as nine lists. Consecutive ungrouped
 * entries therefore merge into one run. Ordering is Ant X's, byte for byte: a bucket is created
 * where its FIRST member appears and later members of the same group join it there.
 */
function toSections(
  items: readonly ConversationsEntryProp[],
  groupable: boolean | ConversationsGroupableProp | undefined,
): Section[] {
  const collapsibleOption = typeof groupable === "object" ? groupable.collapsible : undefined;
  const sections: Section[] = [];

  for (const entry of items) {
    const group = !groupable || isDivider(entry) ? undefined : entry.group;
    if (group === undefined) {
      const tail = sections[sections.length - 1];
      if (tail && tail.group === undefined) {
        tail.entries.push(entry);
        continue;
      }
      sections.push({ entries: [entry], collapsible: false });
      continue;
    }
    const existing = sections.find((section) => section.group === group);
    if (existing) {
      existing.entries.push(entry);
      continue;
    }
    sections.push({
      group,
      entries: [entry],
      collapsible:
        typeof collapsibleOption === "function"
          ? collapsibleOption(group)
          : (collapsibleOption ?? false),
    });
  }

  return sections;
}

/** Navigation keys are namespaced so a conversation called `today` cannot collide with a bucket. */
const groupNavKey = (group: string) => `group:${group}`;
const rowNavKey = (key: string) => `row:${key}`;

/**
 * Conversations — the session rail of a chat surface (Ant Design X `Conversations`).
 *
 * ## What is ported, and the one half that is deliberately not
 *
 * Every prop a caller passes keeps Ant X's spelling and semantics: `items` (conversations and
 * `{ type: "divider" }` rules), `activeKey` / `defaultActiveKey` / `onActiveChange`, `menu` (flat
 * or per-row), `groupable` (with `label`, `collapsible` and the `expandedKeys` triad) and
 * `creation`. The two knobs left out are `styles` / `classNames` — the semantic style maps — and
 * they are left out by a standing decision of this repository, not by omission: a free-form style
 * hole freezes internal DOM slot names into public API and is unmeasurable by the audit
 * (docs/WHAT-BELONGS-HERE.md · "Lỗ kiểu dáng tự do"; docs/DESIGN-AUTHORITY.md · "A knob that only
 * a fork could reach is not parity either"). The rail is retuned through
 * `src/tokens/components/conversations.css` instead. `prefixCls`, `rootClassName`,
 * `menu.getPopupContainer`, `menu.trigger` and `shortcutKeys` are out for the same reason or
 * because the subsystem behind them does not exist here (see the PR for the per-prop ledger).
 *
 * ## What this adds, because Ant X's rail has no keyboard model at all
 *
 * Measured in `@ant-design/x@2.9.0`: `es/conversations/Item.js` renders a bare
 * `<li title … onClick>`. No `role`, no `tabIndex`, no key handling — the rail is unreachable by
 * keyboard, and a screen reader meets twelve list items with no hint that any of them is a
 * control or that one of them is current. Neither is the hand-rolled alternative the issue
 * describes (a stack of `Button`s) any better on the axis that matters: it is one tab stop PER
 * conversation.
 *
 * So the rows here are real `Button`s under ONE roving tabindex, the APG composite-widget rule:
 *
 * - the whole rail — group headings included — is a single tab stop;
 * - `↑` / `↓` walk it and wrap, `Home` / `End` jump to its ends;
 * - the logical FORWARD arrow (`→` in LTR, `←` in RTL) steps from a row onto its overflow menu,
 *   and the backward arrow steps back, so a row's second action costs no extra tab stop;
 * - the current conversation carries `aria-current="true"`, which is what makes "current" survive
 *   a theme that does not tint (WCAG 1.4.1 — never colour alone).
 */
export const Conversations = React.forwardRef<HTMLDivElement, ConversationsProp>(
  (
    {
      items = [],
      activeKey,
      defaultActiveKey,
      onActiveChange,
      menu,
      groupable,
      creation,
      label,
      id,
      className,
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const setRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const [uncontrolledActive, setUncontrolledActive] = React.useState(defaultActiveKey);
    const mergedActiveKey = activeKey ?? uncontrolledActive;

    const sections = React.useMemo(() => toSections(items, groupable), [items, groupable]);
    const groupOptions: ConversationsGroupableProp = typeof groupable === "object" ? groupable : {};

    const collapsibleGroups = React.useMemo(
      () => sections.filter((section) => section.collapsible && section.group).map((s) => s.group!),
      [sections],
    );
    const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState<string[]>(() => [
      ...(groupOptions.defaultExpandedKeys ?? collapsibleGroups),
    ]);
    const expandedKeys = groupOptions.expandedKeys
      ? [...groupOptions.expandedKeys]
      : uncontrolledExpanded;

    const toggleGroup = (group: string) => {
      const next = expandedKeys.includes(group)
        ? expandedKeys.filter((key) => key !== group)
        : [...expandedKeys, group];
      if (!groupOptions.expandedKeys) setUncontrolledExpanded(next);
      groupOptions.onExpand?.(next);
    };

    /*
     * The roving order, in the order the eye reads it: a bucket's heading, then the rows it is
     * showing. A COLLAPSED bucket contributes its heading and nothing else — its rows are not in
     * the DOM, so putting them in the order would park `tabIndex={0}` on an element that does not
     * exist and the rail would lose its tab stop entirely.
     */
    const navKeys: string[] = [];
    for (const section of sections) {
      if (section.group && section.collapsible) {
        navKeys.push(groupNavKey(section.group));
        if (!expandedKeys.includes(section.group)) continue;
      }
      for (const entry of section.entries) {
        if (!isDivider(entry) && !entry.disabled) navKeys.push(rowNavKey(entry.key));
      }
    }

    const [focusKey, setFocusKey] = React.useState<string | null>(null);
    const activeNavKey = mergedActiveKey ? rowNavKey(mergedActiveKey) : undefined;
    const tabStop =
      focusKey && navKeys.includes(focusKey)
        ? focusKey
        : activeNavKey && navKeys.includes(activeNavKey)
          ? activeNavKey
          : navKeys[0];

    const nodes = React.useRef(new Map<string, HTMLElement>());
    const registerNode = (key: string) => (node: HTMLElement | null) => {
      if (node) nodes.current.set(key, node);
      else nodes.current.delete(key);
    };

    const moveTo = (key: string | undefined) => {
      if (!key) return;
      setFocusKey(key);
      nodes.current.get(key)?.focus();
    };

    const step = (from: string, delta: 1 | -1) => {
      if (navKeys.length === 0) return;
      const index = navKeys.indexOf(from);
      const next = index === -1 ? 0 : (index + delta + navKeys.length) % navKeys.length;
      moveTo(navKeys[next]);
    };

    /** One key handler for every focusable in the rail — the composite owns its own navigation. */
    const handleNavKeyDown = (navKey: string) => (event: React.KeyboardEvent<HTMLElement>) => {
      const rtl = isRtl(event.currentTarget);
      const forward = rtl ? "ArrowLeft" : "ArrowRight";
      const backward = rtl ? "ArrowRight" : "ArrowLeft";
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          step(navKey, 1);
          return;
        case "ArrowUp":
          event.preventDefault();
          step(navKey, -1);
          return;
        case "Home":
          event.preventDefault();
          moveTo(navKeys[0]);
          return;
        case "End":
          event.preventDefault();
          moveTo(navKeys[navKeys.length - 1]);
          return;
        case forward: {
          const trigger = nodes.current.get(`menu:${navKey}`);
          if (!trigger) return;
          event.preventDefault();
          trigger.focus();
          return;
        }
        case backward: {
          // Only meaningful FROM a menu trigger; a row's backward arrow has nowhere to go.
          if (!navKey.startsWith("menu:")) return;
          event.preventDefault();
          moveTo(navKey.slice("menu:".length));
          return;
        }
        default:
      }
    };

    const selectConversation = (item: ConversationsItemProp) => {
      if (item.disabled) return;
      if (activeKey === undefined) setUncontrolledActive(item.key);
      onActiveChange?.(
        item.key,
        items.find((entry) => !isDivider(entry) && entry.key === item.key),
      );
    };

    const menuFor = (item: ConversationsItemProp): ConversationsMenuProp | undefined => {
      const resolved = typeof menu === "function" ? menu(item) : menu;
      return resolved && resolved.items.length > 0 ? resolved : undefined;
    };

    const renderEntry = (entry: ConversationsEntryProp, index: number) => {
      if (isDivider(entry)) {
        return (
          <li key={entry.key ?? `divider-${index}`} className="ui-conversations-rule">
            <Separator
              data-dashed={entry.dashed ? "true" : undefined}
              className="ui-conversations-separator"
            />
          </li>
        );
      }

      const navKey = rowNavKey(entry.key);
      const active = mergedActiveKey === entry.key;
      const rowMenu = entry.disabled ? undefined : menuFor(entry);
      const labelText = typeof entry.label === "string" ? entry.label : entry.key;

      return (
        <li
          key={entry.key}
          data-slot="conversations-item"
          data-active={active ? "true" : undefined}
          className="ui-conversations-item"
        >
          <Button
            ref={registerNode(navKey)}
            type="button"
            variant="ghost"
            fullWidth
            align="start"
            disabled={entry.disabled}
            aria-current={active ? "true" : undefined}
            tabIndex={tabStop === navKey ? 0 : -1}
            className="ui-conversations-row"
            onFocus={() => setFocusKey(navKey)}
            onClick={() => selectConversation(entry)}
            onKeyDown={handleNavKeyDown(navKey)}
          >
            {entry.icon ? (
              <span className="ui-conversations-icon" aria-hidden="true">
                {entry.icon}
              </span>
            ) : null}
            <Text truncate>{entry.label}</Text>
          </Button>

          {rowMenu ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  ref={registerNode(`menu:${navKey}`)}
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  tabIndex={-1}
                  className="ui-conversations-menu-trigger"
                  aria-label={
                    rowMenu.triggerLabel?.(entry) ??
                    t("navigation.conversations.rowActions", { label: labelText })
                  }
                  onKeyDown={handleNavKeyDown(`menu:${navKey}`)}
                >
                  <MoreHorizontal aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {rowMenu.items.map((command) => (
                  <DropdownMenuItem
                    key={command.key}
                    disabled={command.disabled}
                    variant={command.danger ? "destructive" : undefined}
                    onSelect={() => rowMenu.onClick?.({ key: command.key, conversation: entry })}
                  >
                    {command.icon}
                    {command.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </li>
      );
    };

    const railLabel = label ?? t("navigation.conversations.label");

    return (
      <div
        ref={setRootRef}
        id={id}
        data-slot="conversations"
        className={cn("ui-conversations", className)}
        {...rest}
      >
        {creation ? <CreationButton creation={creation} /> : null}

        {sections.map((section, sectionIndex) => {
          if (!section.group) {
            return (
              <ul
                key={`run-${sectionIndex}`}
                aria-label={railLabel}
                className="ui-conversations-list"
              >
                {section.entries.map(renderEntry)}
              </ul>
            );
          }

          const heading =
            typeof groupOptions.label === "function"
              ? groupOptions.label(section.group)
              : (groupOptions.label ?? section.group);
          const navKey = groupNavKey(section.group);
          const expanded = expandedKeys.includes(section.group);
          const listId = `${id ?? "ui-conversations"}-${section.group}`;

          return (
            <div
              key={section.group}
              data-slot="conversations-group"
              className="ui-conversations-group"
            >
              {section.collapsible ? (
                <Button
                  ref={registerNode(navKey)}
                  type="button"
                  variant="ghost"
                  size="sm"
                  fullWidth
                  align="start"
                  aria-expanded={expanded}
                  aria-controls={listId}
                  tabIndex={tabStop === navKey ? 0 : -1}
                  className="ui-conversations-group-trigger"
                  onFocus={() => setFocusKey(navKey)}
                  onClick={() => toggleGroup(section.group!)}
                  onKeyDown={handleNavKeyDown(navKey)}
                >
                  <ChevronDown
                    aria-hidden="true"
                    className="ui-conversations-group-chevron"
                    data-expanded={expanded ? "true" : undefined}
                  />
                  <Text size="xs" tone="muted" weight="medium" truncate>
                    {heading}
                  </Text>
                </Button>
              ) : (
                <Text
                  size="xs"
                  tone="muted"
                  weight="medium"
                  className="ui-conversations-group-label"
                >
                  {heading}
                </Text>
              )}

              {section.collapsible && !expanded ? null : (
                <ul
                  id={listId}
                  aria-label={typeof heading === "string" ? heading : section.group}
                  className="ui-conversations-list"
                >
                  {section.entries.map(renderEntry)}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
  },
);
Conversations.displayName = "Conversations";

/**
 * The "new conversation" button (Ant Design X `creation`). It is NOT part of the roving order: it
 * is not one of the conversations, it is the action that makes one, and a caller who tabs into the
 * rail expects to land on it first and then step into the list with one more Tab.
 */
function CreationButton({ creation }: { creation: ConversationsCreationProp }) {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      variant="outline"
      fullWidth
      align="start"
      disabled={creation.disabled}
      className="ui-conversations-creation"
      onClick={() => creation.onClick?.()}
    >
      {creation.icon ?? <Plus aria-hidden="true" />}
      {creation.label ?? t("navigation.conversations.creation")}
    </Button>
  );
}

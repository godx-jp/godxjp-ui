"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Ellipsis,
  Loader2,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  XCircle,
} from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../navigation/dropdown-menu";

import type {
  ActionsAudioProp,
  ActionsCopyProp,
  ActionsFeedbackProp,
  ActionsFeedbackValueProp,
  ActionsItemProp,
  ActionsProp,
  ActionsStatusItemProp,
} from "../../props/components/feedback.prop";

export type {
  ActionsProp,
  ActionsProp as ActionsProps,
  ActionsItemProp,
  ActionsVariantProp,
  ActionsFeedbackProp,
  ActionsFeedbackValueProp,
  ActionsCopyProp,
  ActionsAudioProp,
  ActionsStatusItemProp,
  ActionsItemStatusProp,
} from "../../props/components/feedback.prop";

const ActionsContext = React.createContext<{
  classNames?: ActionsProp["classNames"];
  styles?: ActionsProp["styles"];
} | null>(null);

function isItemType(item: ActionsItemProp | React.ReactNode): item is ActionsItemProp {
  return (
    item != null &&
    typeof item === "object" &&
    !React.isValidElement(item) &&
    ("label" in item || "icon" in item || "subItems" in item || "onItemClick" in item || "key" in item)
  );
}

function ActionTooltip({
  label,
  children,
}: {
  label?: string;
  children: React.ReactElement;
}) {
  if (!label) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function ActionsMenuItem({
  item,
  onClick,
  dropdownProps,
}: {
  item: ActionsItemProp;
  onClick?: ActionsProp["onClick"];
  dropdownProps?: ActionsProp["dropdownProps"];
}) {
  const context = React.useContext(ActionsContext);
  const id = React.useId();
  const itemKey = item.key ?? id;

  if (item.actionRender) {
    return typeof item.actionRender === "function" ? item.actionRender(item) : item.actionRender;
  }

  if (item.subItems?.length) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "ui-actions-item",
              context?.classNames?.item,
              context?.classNames?.itemDropdown,
            )}
            style={context?.styles?.item}
            aria-label={item.label}
          >
            <span className="ui-actions-icon">{item.icon ?? <Ellipsis aria-hidden="true" />}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          {...(dropdownProps as object)}
        >
          {item.subItems.map((subItem, index) => (
            <DropdownMenuItem
              key={subItem.key ?? `${itemKey}-${index}`}
              disabled={false}
              onSelect={() => {
                if (subItem.onItemClick) {
                  subItem.onItemClick(subItem);
                  return;
                }
                onClick?.({
                  key: subItem.key ?? `${itemKey}-${index}`,
                  item: subItem,
                  keyPath: [subItem.key ?? `${itemKey}-${index}`, itemKey],
                  domEvent: { type: "click" } as React.MouseEvent<HTMLElement>,
                });
              }}
            >
              {subItem.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const button = (
    <button
      type="button"
      className={cn("ui-actions-item", context?.classNames?.item)}
      style={context?.styles?.item}
      data-danger={item.danger ? "true" : undefined}
      aria-label={item.label}
      onClick={(domEvent) => {
        if (item.onItemClick) {
          item.onItemClick(item);
          return;
        }
        onClick?.({
          key: itemKey,
          item,
          keyPath: [itemKey],
          domEvent,
        });
      }}
    >
      <span className="ui-actions-icon">{item.icon}</span>
    </button>
  );

  return <ActionTooltip label={item.label}>{button}</ActionTooltip>;
}

const ActionsFeedback = ({
  value = "default",
  onChange,
  className,
  rootClassName,
  classNames = {},
  styles = {},
  ...props
}: ActionsFeedbackProp) => {
  const { t } = useTranslation();
  const like = (
    <button
      type="button"
      className={cn(
        "ui-actions-item ui-actions-feedback-item",
        classNames.like,
        value === "like" ? classNames.liked : undefined,
      )}
      style={{ ...styles.like, ...(value === "like" ? styles.liked : undefined) }}
      data-active={value === "like" ? "true" : undefined}
      aria-label={t("feedback.actions.like")}
      aria-pressed={value === "like"}
      onClick={() => onChange?.(value === "like" ? "default" : "like")}
    >
      <ThumbsUp aria-hidden="true" />
    </button>
  );
  const dislike = (
    <button
      type="button"
      className={cn(
        "ui-actions-item ui-actions-feedback-item",
        classNames.dislike,
        value === "dislike" ? classNames.disliked : undefined,
      )}
      style={{ ...styles.dislike, ...(value === "dislike" ? styles.disliked : undefined) }}
      data-active={value === "dislike" ? "true" : undefined}
      aria-label={t("feedback.actions.dislike")}
      aria-pressed={value === "dislike"}
      onClick={() => onChange?.(value === "dislike" ? "default" : "dislike")}
    >
      <ThumbsDown aria-hidden="true" />
    </button>
  );

  return (
    <div
      className={cn("ui-actions-feedback", rootClassName, classNames.root, className)}
      style={{ ...styles.root }}
      {...props}
    >
      {(["default", "like"] as ActionsFeedbackValueProp[]).includes(value) ? (
        <ActionTooltip label={t("feedback.actions.like")}>{like}</ActionTooltip>
      ) : null}
      {(["default", "dislike"] as ActionsFeedbackValueProp[]).includes(value) ? (
        <ActionTooltip label={t("feedback.actions.dislike")}>{dislike}</ActionTooltip>
      ) : null}
    </div>
  );
};

const ActionsCopy = ({
  text = "",
  icon,
  className,
  rootClassName,
  classNames = {},
  styles = {},
  ...props
}: ActionsCopyProp) => {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);

  return (
    <button
      type="button"
      className={cn("ui-actions-item", rootClassName, classNames.root, className)}
      style={{ ...styles.root }}
      aria-label={copied ? t("feedback.actions.copied") : t("feedback.actions.copy")}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
      {...props}
    >
      {copied ? icon ?? <Check aria-hidden="true" /> : icon ?? <Copy aria-hidden="true" />}
    </button>
  );
};

const ActionsStatusItem = ({
  status = "default",
  defaultIcon,
  runningIcon,
  label,
  className,
  rootClassName,
  classNames = {},
  styles = {},
  ...props
}: ActionsStatusItemProp) => {
  const icon =
    status === "loading"
      ? <Loader2 className="animate-spin" aria-hidden="true" />
      : status === "error"
        ? <XCircle aria-hidden="true" />
        : status === "running"
          ? runningIcon ?? <Volume2 aria-hidden="true" />
          : defaultIcon ?? <Volume2 aria-hidden="true" />;

  const button = (
    <button
      type="button"
      className={cn("ui-actions-item", rootClassName, classNames.root, className)}
      style={{ ...styles.root, ...styles[status] }}
      aria-label={label}
      {...props}
    >
      {icon}
    </button>
  );

  return <ActionTooltip label={label}>{button}</ActionTooltip>;
};

const ActionsAudio = (props: ActionsAudioProp) => {
  const { t } = useTranslation();
  const status = props.status ?? "default";
  const label =
    status === "loading"
      ? t("feedback.actions.audioLoading")
      : status === "error"
        ? t("feedback.actions.audioError")
        : status === "running"
          ? t("feedback.actions.audioRunning")
          : t("feedback.actions.audio");
  return <ActionsStatusItem {...props} label={label} status={status} />;
};

const ForwardActions = React.forwardRef<HTMLDivElement, ActionsProp>(
  (
    {
      items = [],
      onClick,
      dropdownProps,
      variant = "borderless",
      fadeIn,
      fadeInLeft,
      classNames = {},
      styles = {},
      rootClassName,
      className,
      ...props
    },
    ref,
  ) => {
    const motionClass = fadeInLeft ? "ui-actions-fade-left" : fadeIn ? "ui-actions-fade" : undefined;

    return (
      <div
        ref={ref}
        className={cn("ui-actions", rootClassName, classNames.root, className, motionClass)}
        style={styles.root}
        {...props}
      >
        <ActionsContext.Provider value={{ classNames, styles }}>
          <div className="ui-actions-list" data-variant={variant}>
            {items.map((item, index) => {
              if (!isItemType(item)) {
                return <React.Fragment key={index}>{item}</React.Fragment>;
              }
              return (
                <ActionsMenuItem
                  key={item.key ?? index}
                  item={item}
                  onClick={onClick}
                  dropdownProps={dropdownProps}
                />
              );
            })}
          </div>
        </ActionsContext.Provider>
      </div>
    );
  },
);
ForwardActions.displayName = "Actions";

type CompoundedActions = typeof ForwardActions & {
  Feedback: typeof ActionsFeedback;
  Copy: typeof ActionsCopy;
  Item: typeof ActionsStatusItem;
  Audio: typeof ActionsAudio;
};

export const Actions = ForwardActions as CompoundedActions;
Actions.Feedback = ActionsFeedback;
Actions.Copy = ActionsCopy;
Actions.Item = ActionsStatusItem;
Actions.Audio = ActionsAudio;

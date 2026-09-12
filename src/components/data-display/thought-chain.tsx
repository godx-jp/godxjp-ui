"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MinusCircle,
} from "lucide-react";

import { cn } from "../../lib/utils";

import type {
  ThoughtChainItemProp,
  ThoughtChainLineProp,
  ThoughtChainProp,
  ThoughtChainStandaloneItemProp,
} from "../../props/components/data-display.prop";

export type {
  ThoughtChainProp,
  ThoughtChainProp as ThoughtChainProps,
  ThoughtChainItemProp,
  ThoughtChainItemStatusProp,
  ThoughtChainLineProp,
  ThoughtChainStandaloneItemProp,
} from "../../props/components/data-display.prop";

const ThoughtChainContext = React.createContext<{
  expandedKeys: readonly string[];
  onItemExpand: (key: string) => void;
  line: ThoughtChainLineProp;
  classNames?: ThoughtChainProp["classNames"];
  styles?: ThoughtChainProp["styles"];
} | null>(null);

function useCollapsibleKeys({
  defaultExpandedKeys,
  expandedKeys: controlledKeys,
  onExpand,
  items,
}: {
  defaultExpandedKeys?: readonly string[];
  expandedKeys?: readonly string[];
  onExpand?: (keys: string[]) => void;
  items?: readonly ThoughtChainItemProp[];
}) {
  const [internal, setInternal] = React.useState<string[]>([...(defaultExpandedKeys ?? [])]);
  const expandedKeys = controlledKeys ?? internal;
  const onItemExpand = React.useCallback(
    (key: string) => {
      const next = expandedKeys.includes(key)
        ? expandedKeys.filter((entry) => entry !== key)
        : [...expandedKeys, key];
      if (controlledKeys === undefined) setInternal(next);
      onExpand?.(next);
    },
    [controlledKeys, expandedKeys, onExpand],
  );

  React.useEffect(() => {
    if (!controlledKeys && !defaultExpandedKeys && items?.length) {
      const auto = items
        .filter((item) => item.collapsible && item.content)
        .map((item, index) => item.key ?? `key_${index}`);
      if (auto.length) setInternal(auto);
    }
  }, [controlledKeys, defaultExpandedKeys, items]);

  return { expandedKeys, onItemExpand };
}

function StatusIcon({
  status,
  icon,
  className,
  style,
}: {
  status?: ThoughtChainItemProp["status"];
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (icon === false) return null;
  if (icon) {
    return (
      <span className={cn("ui-thought-chain-status", className)} style={style}>
        {icon}
      </span>
    );
  }
  if (!status) return null;
  const glyph =
    status === "loading"
      ? <Loader2 className="animate-spin" aria-hidden="true" />
      : status === "success"
        ? <CheckCircle2 aria-hidden="true" />
        : status === "error"
          ? <AlertCircle aria-hidden="true" />
          : <MinusCircle aria-hidden="true" />;
  return (
    <span
      className={cn("ui-thought-chain-status", className)}
      style={style}
      data-status={status}
    >
      {glyph}
    </span>
  );
}

function ThoughtChainNode({
  info,
  index,
  line,
  className,
  style,
}: {
  info: ThoughtChainItemProp;
  index: number;
  line: ThoughtChainLineProp;
  className?: string;
  style?: React.CSSProperties;
}) {
  const context = React.useContext(ThoughtChainContext);
  const key = info.key ?? `key_${index}`;
  const expanded = context?.expandedKeys.includes(key) ?? false;
  const showLine = line !== false;
  const lineStyle = typeof line === "string" ? line : "solid";
  const destroyOnHidden = info.destroyOnHidden ?? true;

  const iconNode =
    info.icon === false
      ? null
      : info.icon ?? <span className="ui-thought-chain-index">{index + 1}</span>;

  const contentVisible = info.collapsible ? expanded : true;

  return (
    <div
      className={cn("ui-thought-chain-node", className, context?.classNames?.item)}
      style={style}
      data-line={showLine ? lineStyle : "false"}
    >
      <div className="ui-thought-chain-rail">
        <StatusIcon
          status={info.status}
          icon={iconNode}
          className={context?.classNames?.itemIcon}
          style={context?.styles?.itemIcon}
        />
        {showLine ? (
          <span className="ui-thought-chain-line" data-style={lineStyle} aria-hidden="true" />
        ) : null}
      </div>
      <div className="ui-thought-chain-box">
        <div
          className={cn("ui-thought-chain-header", context?.classNames?.itemHeader)}
          style={context?.styles?.itemHeader}
        >
          {info.title ? (
            <div
              className="ui-thought-chain-title-row"
              data-collapsible={info.collapsible ? "true" : undefined}
              data-blink={info.blink ? "true" : undefined}
              role={info.collapsible ? "button" : undefined}
              tabIndex={info.collapsible ? 0 : undefined}
              aria-expanded={info.collapsible ? expanded : undefined}
              onClick={
                info.collapsible ? () => context?.onItemExpand(key) : undefined
              }
              onKeyDown={
                info.collapsible
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        context?.onItemExpand(key);
                      }
                    }
                  : undefined
              }
            >
              <span>{info.title}</span>
              {info.collapsible && info.content ? (
                <ChevronRight
                  className="ui-thought-chain-chevron"
                  data-expanded={expanded ? "true" : undefined}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          ) : null}
          {info.description ? (
            <div className="ui-thought-chain-description">{info.description}</div>
          ) : null}
        </div>
        {info.content && contentVisible ? (
          <div
            className={cn("ui-thought-chain-content", context?.classNames?.itemContent)}
            style={context?.styles?.itemContent}
            hidden={!contentVisible && destroyOnHidden ? true : undefined}
          >
            {info.content}
          </div>
        ) : null}
        {info.footer ? (
          <div
            className={cn("ui-thought-chain-footer", context?.classNames?.itemFooter)}
            style={context?.styles?.itemFooter}
          >
            {info.footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const ThoughtChainItem = React.forwardRef<HTMLDivElement, ThoughtChainStandaloneItemProp>(
  (
    {
      icon,
      title,
      description,
      status,
      variant = "solid",
      blink,
      disabled,
      onClick,
      className,
      rootClassName,
      classNames,
      styles,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "ui-thought-chain-item",
          rootClassName,
          classNames?.root,
          className,
        )}
        data-variant={variant}
        data-blink={blink ? "true" : undefined}
        data-clickable={onClick ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        onClick={disabled ? undefined : onClick}
        style={styles?.root}
        {...props}
      >
        <StatusIcon status={status} icon={icon} className={classNames?.icon} style={styles?.icon} />
        <div>
          {title ? (
            <div className={cn(classNames?.title)} style={styles?.title}>{title}</div>
          ) : null}
          {description ? (
            <div className={cn("ui-thought-chain-description", classNames?.description)} style={styles?.description}>
              {description}
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);
ThoughtChainItem.displayName = "ThoughtChain.Item";

const ForwardThoughtChain = React.forwardRef<HTMLDivElement, ThoughtChainProp>(
  (
    {
      items,
      defaultExpandedKeys,
      expandedKeys,
      onExpand,
      line = true,
      classNames = {},
      styles = {},
      rootClassName,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const { expandedKeys: keys, onItemExpand } = useCollapsibleKeys({
      defaultExpandedKeys,
      expandedKeys,
      onExpand,
      items,
    });

    return (
      <div
        ref={ref}
        id={id}
        className={cn("ui-thought-chain", className, rootClassName, classNames.root)}
        style={styles.root}
        {...props}
      >
        <ThoughtChainContext.Provider
          value={{ expandedKeys: keys, onItemExpand, line, classNames, styles }}
        >
          {items?.map((item, index) => (
            <ThoughtChainNode
              key={item.key ?? `key_${index}`}
              info={item}
              index={index}
              line={line}
              className={classNames.item}
              style={styles.item}
            />
          ))}
        </ThoughtChainContext.Provider>
      </div>
    );
  },
);
ForwardThoughtChain.displayName = "ThoughtChain";

type CompoundedThoughtChain = typeof ForwardThoughtChain & {
  Item: typeof ThoughtChainItem;
};

export const ThoughtChain = ForwardThoughtChain as CompoundedThoughtChain;
ThoughtChain.Item = ThoughtChainItem;

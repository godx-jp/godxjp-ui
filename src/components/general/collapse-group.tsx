import * as React from "react";

import type { CollapseGroupProp } from "../../props/components/general.prop";

export type {
  CollapseGroupProp,
  CollapseGroupProp as CollapseGroupProps,
} from "../../props/components/general.prop";

/** Fallback duration when the token cannot be read (ms). Matches `--duration-base`. */
const FALLBACK_MS = 180;
/** Upper bound before a leaving child is dropped even if no animation finished. */
const EXIT_GUARD_MS = 1500;

type Leaving = { element: React.ReactElement; after: string | null };

const keyOf = (element: React.ReactElement) => String(element.key);

function parseMs(value: string): number {
  const v = value.trim();
  if (v.endsWith("ms")) return parseFloat(v);
  if (v.endsWith("s")) return parseFloat(v) * 1000;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : FALLBACK_MS;
}

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * CollapseGroup — a removed child COLLAPSES before it leaves. Render a list's keyed children
 * through it (no wrapper element is added, so `ul > li` stays intact); when a key disappears from
 * `children`, that child stays in place — inert and hidden from assistive technology — while its
 * measured height, block padding/margin and opacity animate to 0, and is then unmounted
 * (`onExited(key)`). Under `prefers-reduced-motion` it is removed at once. The child must accept a
 * `ref` and spread unknown props onto its root element (every `@godxjp/ui` row does).
 */
export function CollapseGroup({ children, onExited }: CollapseGroupProp) {
  const current = React.Children.toArray(children).filter(React.isValidElement);
  const keys = current.map(keyOf);
  const signature = keys.join("\u0000");

  // The last rendered elements, by key — what a removed child is drawn from while it leaves.
  const latest = React.useRef(new Map<string, React.ReactElement>());
  const [shown, setShown] = React.useState<{ signature: string; keys: string[] }>({
    signature,
    keys,
  });
  const [leaving, setLeaving] = React.useState<Map<string, Leaving>>(() => new Map());

  // A change of the KEY SET is seen during the render that carries it, so a removed child never
  // unmounts for even one commit before it starts to leave.
  if (shown.signature !== signature) {
    const next = new Map(leaving);
    const present = new Set(keys);
    shown.keys.forEach((key, index) => {
      // eslint-disable-next-line react-hooks/refs -- read once per key-set change, written after commit
      const element = latest.current.get(key);
      if (!present.has(key) && element && !next.has(key)) {
        next.set(key, { element, after: index > 0 ? shown.keys[index - 1]! : null });
      }
    });
    for (const key of keys) next.delete(key);
    setLeaving(next);
    setShown({ signature, keys });
  }

  React.useLayoutEffect(() => {
    for (const element of current) latest.current.set(keyOf(element), element);
  });

  const nodes = React.useRef(new Map<string, HTMLElement>());
  const started = React.useRef(new Set<string>());

  const finish = React.useCallback(
    (key: string) => {
      started.current.delete(key);
      nodes.current.delete(key);
      latest.current.delete(key);
      setLeaving((prev) => {
        if (!prev.has(key)) return prev;
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
      // React.Children.toArray prefixes keys (".$row-1"); report the caller's own key.
      onExited?.(key.replace(/^\.\$/, ""));
    },
    [onExited],
  );

  React.useLayoutEffect(() => {
    for (const key of leaving.keys()) {
      if (started.current.has(key)) continue;
      started.current.add(key);
      const el = nodes.current.get(key);
      if (!el || typeof el.animate !== "function" || reducedMotion()) {
        finish(key);
        continue;
      }
      const cs = getComputedStyle(el);
      const height = el.getBoundingClientRect().height;
      const duration = parseMs(cs.getPropertyValue("--collapse-exit-duration") || "");
      const easing = cs.getPropertyValue("--ease-emphasized").trim() || "ease";
      el.style.overflow = "hidden";
      const animation = el.animate(
        [
          {
            height: `${height}px`,
            opacity: 1,
            paddingBlockStart: cs.paddingBlockStart,
            paddingBlockEnd: cs.paddingBlockEnd,
            marginBlockStart: cs.marginBlockStart,
            marginBlockEnd: cs.marginBlockEnd,
          },
          {
            height: "0px",
            opacity: 0,
            paddingBlockStart: "0px",
            paddingBlockEnd: "0px",
            marginBlockStart: "0px",
            marginBlockEnd: "0px",
          },
        ],
        { duration, easing, fill: "forwards" },
      );
      const guard = window.setTimeout(() => finish(key), Math.max(duration, 0) + EXIT_GUARD_MS);
      animation.onfinish = () => {
        window.clearTimeout(guard);
        finish(key);
      };
    }
  }, [leaving, finish]);

  // Present children in their order, each leaving child after the key it followed.
  const out: React.ReactNode[] = [];
  const pending = [...leaving.entries()];
  const placeAfter = (key: string | null) => {
    for (const [leaveKey, entry] of pending) {
      if (entry.after === key) {
        out.push(
          React.cloneElement(entry.element, {
            key: leaveKey,
            ref: (node: HTMLElement | null) => {
              if (node) nodes.current.set(leaveKey, node);
            },
            inert: true,
            "aria-hidden": true,
            "data-leaving": "",
          } as Record<string, unknown>),
        );
        placeAfter(leaveKey);
      }
    }
  };
  placeAfter(null);
  for (const element of current) {
    out.push(element);
    placeAfter(keyOf(element));
  }
  // A leaving child whose predecessor also left and is gone lands at the end.
  const placed = new Set(out.map((node) => (React.isValidElement(node) ? String(node.key) : "")));
  for (const [leaveKey, entry] of pending) {
    if (!placed.has(leaveKey)) {
      out.push(
        React.cloneElement(entry.element, {
          key: leaveKey,
          ref: (node: HTMLElement | null) => {
            if (node) nodes.current.set(leaveKey, node);
          },
          inert: true,
          "aria-hidden": true,
          "data-leaving": "",
        } as Record<string, unknown>),
      );
    }
  }
  return <>{out}</>;
}

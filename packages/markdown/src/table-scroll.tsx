import * as React from "react";

/**
 * The scroll box a rendered table sits in (gh#1131). `Prose` styles it (`.ui-prose-table-scroll`,
 * `overflow-x: auto`), so a wide table scrolls inside the body instead of widening the page.
 *
 * It is keyboard-focusable ONLY while it actually overflows, measured: a keyboard user can then
 * scroll it (WCAG 2.1.1), and a table that fits adds no empty tab stop.
 */
export function TableScroll({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = React.useState(false);
  React.useLayoutEffect(() => {
    const box = ref.current;
    if (!box || typeof ResizeObserver === "undefined") return undefined;
    const measure = () => setScrolls(box.scrollWidth > box.clientWidth + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    if (box.firstElementChild) observer.observe(box.firstElementChild);
    measure();
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="ui-prose-table-scroll"
      data-slot="prose-table-scroll"
      tabIndex={scrolls ? 0 : undefined}
    >
      {children}
    </div>
  );
}

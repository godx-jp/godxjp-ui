import Link from "next/link";

import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  /**
   * Right-aligned action buttons.  Accept both `actions` (explicit slot,
   * used by ResourceStubPage + plan-003 admin pages) and `children`
   * (legacy slot) — whichever is provided renders on the right side.
   */
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, backHref, actions, children }: PageHeaderProps) {
  const right = actions ?? children;
  return (
    <div className="bg-background sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        {backHref && (
          <Link
            href={backHref}
            className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-7 items-center justify-center rounded-md"
          >
            <ArrowLeft className="size-4" />
          </Link>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
        {description && <span className="text-muted-foreground text-xs">{description}</span>}
      </div>
      {right && <div className="flex items-center gap-1.5">{right}</div>}
    </div>
  );
}

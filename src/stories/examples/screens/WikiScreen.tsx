import { useTranslation } from "react-i18next";
import { PageHeader } from "../../../components/data-display/PageHeader";
import { Button } from "../../../components/general/Button";

// WikiScreen — 3-column wiki layout (TOC · prose · meta). Content is
// a static placeholder; consumers replace `children` with their
// markdown-rendered body.
export interface WikiScreenProps {
  toc?: Array<{ id: string; label: string }>;
  children?: React.ReactNode;
  meta?: React.ReactNode;
}

const DEFAULT_TOC = [
  { id: "intro", label: "Introduction" },
  { id: "stack", label: "Stack" },
  { id: "deployment", label: "Deployment" },
  { id: "onboarding", label: "Onboarding" },
];

export function WikiScreen({ toc = DEFAULT_TOC, children, meta }: WikiScreenProps) {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader
        title={t("nav.wiki")}
        subtitle="Living documentation"
        actions={<Button variant="primary">+ {t("common.new")}</Button>}
      />

      <div className="wiki-layout">
        <nav className="wiki-toc" aria-label="Table of contents">
          {toc.map((entry, i) => (
            <a key={entry.id} href={`#${entry.id}`} className={i === 0 ? "active" : undefined}>
              {entry.label}
            </a>
          ))}
        </nav>

        <article className="prose">
          {children ?? (
            <>
              <h1 id="intro">GoDX Forge — Engineering handbook</h1>
              <p>
                This wiki is a living reference for everyone working on the GoDX
                Forge platform. It mirrors the source-of-truth documentation that
                lives in <code>docs/</code>; edits here are commits.
              </p>
              <h2 id="stack">Stack</h2>
              <p>
                Each frontend service consumes <code>@godxjp/ui</code> for tokens,
                primitives, shell, i18n. Backend kernel lives in{" "}
                <code>services/_sdk/</code> (Go).
              </p>
              <ul>
                <li>React 19 · Vite · TypeScript</li>
                <li>Tailwind v4 with CSS-first <code>@theme</code> bridge</li>
                <li>i18next auto-detect + JA fallback</li>
              </ul>
              <h2 id="deployment">Deployment</h2>
              <p>
                Compose-orchestrated; subdomains route through Caddy per
                <code>deploy/docker/Caddyfile</code>.
              </p>
              <h2 id="onboarding">Onboarding</h2>
              <p>
                See <code>docs/onboarding/dev.md</code> for the day-0 checklist.
              </p>
            </>
          )}
        </article>

        <aside className="text-xs text-muted-foreground" aria-label="Meta">
          {meta ?? (
            <>
              <div className="text-[10px] uppercase tracking-wider mb-2">Updated</div>
              <p>2 hours ago by @satoshi</p>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

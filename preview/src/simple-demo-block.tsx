import * as React from "react";

import { HighlightedCode } from "./highlight";

type SimpleDemoBlockProps = {
  source: string;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
};

export function SimpleDemoBlock({ source, loading, error, children }: SimpleDemoBlockProps) {
  const [codeOpen, setCodeOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [source]);

  return (
    <div className="simple-demo-block demo-block">
      <div className="simple-demo-block-preview">
        {loading ? <div className="preview-loading">Loading…</div> : null}
        {error ? (
          <div className="preview-error">
            <strong>Failed to load demo</strong>
            <pre>{error}</pre>
          </div>
        ) : null}
        {!loading && !error ? children : null}
      </div>

      <footer className="demo-block-footer">
        <button
          type="button"
          className="demo-block-footer-btn"
          data-active={codeOpen ? "true" : undefined}
          onClick={() => setCodeOpen((v) => !v)}
          aria-expanded={codeOpen}
        >
          View code
        </button>
        {codeOpen ? (
          <button
            type="button"
            className="demo-block-footer-btn demo-block-footer-copy"
            onClick={copy}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </footer>

      {codeOpen ? (
        <div className="demo-block-code">
          <pre className="demo-block-code-pre">
            <HighlightedCode source={source} />
          </pre>
        </div>
      ) : null}
    </div>
  );
}

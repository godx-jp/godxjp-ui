import type { ReactNode } from "react";

export interface AuthFooterProps {
  product: ReactNode;
  terms: ReactNode;
  privacy: ReactNode;
  locale?: ReactNode;
}

/** Canonical mono legal line shared by hosted identity screens. */
export function AuthFooter({ product, terms, privacy, locale }: AuthFooterProps) {
  const items = [product, terms, privacy, locale].filter(
    (item): item is Exclude<ReactNode, null | undefined | false> =>
      item !== null && item !== undefined && item !== false,
  );

  return (
    <div data-slot="auth-legal-footer" className="ui-auth-legal-footer">
      {items.map((item, index) => (
        <span key={index} className="ui-auth-legal-footer-item">
          {index > 0 ? (
            <span aria-hidden="true" className="ui-auth-legal-footer-separator">
              ·
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </div>
  );
}

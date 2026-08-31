/**
 * Static-asset imports for the docs pages.
 *
 * `tsconfig.json` pins `"types": ["node"]`, so `vite/client` — which normally declares these — is
 * never loaded, and `tsconfig.docs.json` inherits that. Without this file `import cover from
 * "../assets/cover-terrain.svg"` is a TS2307 even though Vite resolves it perfectly at build time,
 * which is exactly how it passed locally and failed `typecheck:docs` in CI.
 *
 * Narrowed to the formats actually committed under `docs/assets`, and kept in step with
 * ASSET_EXTENSIONS in `scripts/check-example-imports.mjs`, which decides the same question for the
 * import guard.
 */
declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.avif" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

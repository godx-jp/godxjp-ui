/**
 * RE-EXPORT SHIM — the tree model moved to `src/lib/tree.ts`.
 *
 * `Tree` (data-display) and `TreeSelect` (data-entry) are two SURFACES over ONE model. Forking the
 * traversal would let a page tree and a dropdown tree disagree about what "expanded", "a leaf" or
 * "every descendant" means — so the normalizer, the visible-row flattener and the descendant walk
 * live in `src/lib/`, which both groups may import, and this path stays valid so nothing that
 * already imports `./tree-utils` has to change.
 */
export * from "../../lib/tree";

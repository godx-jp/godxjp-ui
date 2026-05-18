---
title: "ProductSwitcher"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: ProductSwitcher
status: stable
audience: [developer, agent]
lang: en
---

# ProductSwitcher

> Popover dropdown for switching the active product (org), with search filtering.

## Usage

```tsx
import { ProductSwitcher } from "@godxjp/ui/components/shell"

<ProductSwitcher
  trigger={
    <Button variant="ghost" aria-label="Switch product">
      {activeProduct.name}
    </Button>
  }
  activeId={activeProduct.id}
  onSelect={(product) => {
    setTweak("tenant", product.tenant)
    setProduct(product)
  }}
  open={productOpen}
  onOpenChange={setProductOpen}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `ReactNode` | required | Trigger element (wrapped with `Popover asChild`) |
| `activeId` | `string` | required | ID of the currently active product |
| `products` | `ForgeProduct[]` | `PRODUCTS` | List of products to display |
| `onSelect` | `(product: ForgeProduct) => void` | required | Called when a product row is selected |
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Called when open state changes |

## Default behavior

- Renders all products by default using the built-in `PRODUCTS` fixture.
- Search input filters by product `name` and `role` (case-insensitive substring match).
- The active product row shows a `✓` check mark.
- Selecting a row calls `onSelect`, clears the search query, and closes the popover (when `onOpenChange` is provided).
- Auto-focuses the search input on open.

## Accessibility

- Renders as a Radix Popover — `role="dialog"`, `aria-modal="false"`.
- Product rows are `<button>` elements with `aria-label` from the product name.
- Active row has `aria-pressed` implied by the `data-active` attribute (visual; not ARIA role).
- Escape closes the popover.

## See also

- [Topbar](./Topbar.md) — `onProductOpen` callback triggers ProductSwitcher.
- [ProjectSwitcher](./ProjectSwitcher.md) — cross-product project picker.
- [Reference: types — ForgeProduct](../types.md).

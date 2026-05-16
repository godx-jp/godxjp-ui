---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer, agent]
---

# TypeScript types

Every exported type and interface in `@godxjp/ui@3.0.0`.

---

## Primitives

### ButtonProps (`@godxjp/ui`)

```ts
interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  asChild?: boolean
  children?: ReactNode
}
```

### ButtonVariant (`@godxjp/ui`)

```ts
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
```

### ButtonSize (`@godxjp/ui`)

```ts
type ButtonSize = "sm" | "md" | "lg"
```

### BadgeProps (`@godxjp/ui`)

```ts
interface BadgeProps extends ComponentProps<"span"> {
  variant?: BadgeVariant
  dot?: boolean
  children?: ReactNode
}
```

### BadgeVariant (`@godxjp/ui`)

```ts
type BadgeVariant = "success" | "warning" | "info" | "error" | "attention" | "neutral" | "outline"
```

### InputProps (`@godxjp/ui`)

```ts
interface InputProps extends ComponentProps<"input"> {}
```

### TextareaProps (`@godxjp/ui`)

```ts
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}
```

### TimeInputProps (`@godxjp/ui`)

```ts
interface TimeInputProps {
  value?: string
  onChange?: (time: string) => void
  className?: string
  disabled?: boolean
  placeholder?: string
  id?: string
  name?: string
}
```

### SkeletonProps (`@godxjp/ui`)

```ts
type SkeletonProps = HTMLAttributes<HTMLDivElement>
```

### BreadcrumbProps (`@godxjp/ui`)

```ts
interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}
```

### BreadcrumbItemProps (`@godxjp/ui`)

```ts
interface BreadcrumbItemProps extends HTMLAttributes<HTMLElement> {
  href?: string
  current?: boolean
  children: ReactNode
}
```

### CardSubtitleProps (`@godxjp/ui`)

```ts
interface CardSubtitleProps extends ComponentProps<"p"> {
  children?: ReactNode
}
```

### SheetSide (`@godxjp/ui`)

```ts
type SheetSide = "top" | "right" | "bottom" | "left"
```

### SheetContentProps (`@godxjp/ui`)

```ts
type SheetContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: SheetSide
}
```

---

## Shell

### AppShellProps (`@godxjp/ui/components/shell`)

```ts
interface AppShellProps {
  sidebar: ReactNode
  topbar: ReactNode
  children: ReactNode
  sidebarCollapsed?: boolean
}
```

### SidebarItem (`@godxjp/ui/components/shell`)

```ts
interface SidebarItem {
  id: string
  label: string
  icon: ComponentType<{ size?: number }>
  badge?: string | number
  disabled?: boolean
}
```

### SidebarSection (`@godxjp/ui/components/shell`)

```ts
interface SidebarSection {
  label?: string
  items: SidebarItem[]
}
```

### SidebarProps (`@godxjp/ui/components/shell`)

```ts
interface SidebarProps {
  activeId: string
  onSelect: (id: string) => void
  sections: SidebarSection[]
  product: ForgeProduct
  onProductClick?: () => void
  collapsed?: boolean
  footer?: ReactNode
}
```

### TopbarProps (`@godxjp/ui/components/shell`)

```ts
interface TopbarProps {
  product: ForgeProduct
  project?: ForgeProject | null
  onProductOpen?: () => void
  onProjectOpen?: () => void
  onSearchOpen?: () => void
  onTweaksOpen?: () => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
  rightSlot?: ReactNode
}
```

### CommandItem (`@godxjp/ui/components/shell`)

```ts
interface CommandItem {
  id: string
  label: string
  group?: string
  hint?: string
  onSelect: () => void
}
```

### CommandPaletteProps (`@godxjp/ui/components/shell`)

```ts
interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commands: CommandItem[]
}
```

### TweaksPanelProps (`@godxjp/ui/components/shell`)

```ts
interface TweaksPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

### ProductSwitcherProps (`@godxjp/ui/components/shell`)

```ts
interface ProductSwitcherProps {
  trigger: ReactNode
  activeId: string
  products?: ForgeProduct[]
  onSelect: (product: ForgeProduct) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}
```

### RecentProject (`@godxjp/ui/components/shell`)

```ts
interface RecentProject {
  productId: string
  projectId: string
}
```

### ProjectSwitcherProps (`@godxjp/ui/components/shell`)

```ts
interface ProjectSwitcherProps {
  trigger: ReactNode
  activeProductId?: string
  activeProjectId?: string
  recent?: RecentProject[]
  products?: ForgeProduct[]
  onSelect: (project: ForgeProject, product: ForgeProduct) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}
```

---

## Data

### ForgeProduct (`@godxjp/ui/data`)

```ts
type ForgeProduct = {
  id: string
  name: string
  tenant: string      // matches [data-tenant] attribute — operator-defined, not a closed enum
  role: string
  desc: string
  color: string       // OKLCH color string for logo mark
  owner: string
  devs: number
  projects: ForgeProject[]
}
```

### ForgeProject (`@godxjp/ui/data`)

```ts
type ForgeProject = {
  id: string
  name: string
  stack: string
  kind: ProjectKind
  devs: number
  status: ProjectStatus
  branch: string
  lastCommit: string
  openIssues: number
  prs: number
  sandbox: boolean
}
```

### ProjectKind (`@godxjp/ui/data`)

```ts
type ProjectKind = "service" | "web" | "desktop" | "workstation" | "mobile" | "library" | "infra"
```

### ProjectStatus (`@godxjp/ui/data`)

```ts
type ProjectStatus = "active" | "review" | "planning" | "archived"
```

---

## Hooks

### Tweaks (`@godxjp/ui/hooks`)

```ts
type Tweaks = {
  density: Density
  theme: Theme
  tenant: string
  locale: GodxLocale
  sidebarCollapsed: boolean
}
```

### Density (`@godxjp/ui/hooks`)

```ts
type Density = "compact" | "default" | "comfortable"
```

### Theme (`@godxjp/ui/hooks`)

```ts
type Theme = "light" | "dark"
```

---

## i18n

### GodxLocale (`@godxjp/ui/i18n`)

```ts
type GodxLocale = "ja" | "en" | "vi" | "fil"
```

### ForgeLocale (`@godxjp/ui/i18n`) — deprecated

```ts
/** @deprecated Use GodxLocale instead. Will be removed in v4. */
type ForgeLocale = GodxLocale
```

### ForgeTranslations (`@godxjp/ui/i18n`)

```ts
type ForgeTranslations = typeof ja   // the full translation dictionary shape
```

---

## See also

- [Reference: Exports](./exports.md)
- [Reference: i18n](./i18n.md)

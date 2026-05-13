// Public surface for the atomic primitive layer. Each component is a
// thin wrapper around a canonical CSS class from `@godxjp/ui/tokens` —
// the visual contract stays mastered in CSS variables + class names,
// and React adds ergonomics (props, refs, ARIA, Radix wiring).
//
// Don't add a primitive that re-encodes a token in Tailwind utilities.
// If a new atom is needed, add the CSS class to tokens.css first, then
// wrap it here. See BRAND.md "Forbidden patterns" for the full rule.

export { cn } from "./cn"

export { Badge } from "./Badge"
export type { BadgeProps, BadgeVariant } from "./Badge"

export { Button } from "./Button"
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button"

export { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "./Card"
export type { CardSubtitleProps } from "./Card"

export { Input, Textarea } from "./Input"
export type { InputProps, TextareaProps } from "./Input"

export { Label } from "./Label"

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs"

export { Avatar } from "./Avatar"
export type { AvatarProps } from "./Avatar"

export { Separator } from "./Separator"

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./Popover"

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from "./DropdownMenu"

export { Calendar } from "./Calendar"

export { TimeInput } from "./TimeInput"
export type { TimeInputProps } from "./TimeInput"

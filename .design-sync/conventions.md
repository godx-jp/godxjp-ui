## Conventions — @godxjp/ui is a re-skinnable design *framework*

@godxjp/ui is **brand-neutral by design**: a set of real primitives driven by **semantic CSS
custom-property tokens**. A consumer drops in their OWN design system by overriding tokens once —
every component re-skins automatically. So when you build with it: **style through tokens and the
components' own props, and NEVER hard-code colors, radii, or chrome.** A hex value or an ad-hoc
border is a bug — there is a token for it.

### Style through props first, tokens second — no utility soup for look-and-feel
Most visual intent is expressed by **component props**, not classes:
- `variant` — visual style (e.g. Button `default | secondary | outline | dashed | ghost | link | destructive`).
- `tone` — semantic color role (`default | success | warning | destructive | info | muted | neutral`),
  on Badge / Alert / Progress / StatCard accents. Use tone for meaning; never a raw red/green.
- `size` — size presets (e.g. Button `xs | sm | default | lg`); `density` (`tight | cozy`) for compactness.
- Controlled inputs use `value` / `defaultValue` / `onValueChange` (a `value` with no `onValueChange`
  freezes the field). See `guidelines/docs/PROPS-VOCABULARY.md` for the exact per-component vocabulary
  before guessing a prop.

### When you DO write CSS, reference tokens (hsl-wrapped roles + raw structural)
This is a Tailwind v4 system; for your own layout glue use utilities, but every value resolves to a token:
- **Color roles** are HSL channel triplets — wrap them: `background: hsl(var(--primary))`,
  `color: hsl(var(--foreground))`. Roles: `--background --foreground --primary --primary-foreground
  --secondary --muted --muted-foreground --accent --card --card-foreground --popover --border --input
  --ring --destructive --success --warning --info --attention`.
- **Structural tokens** are used directly: `var(--radius)`, `var(--control-height)`,
  `var(--control-radius)`, the spacing scale `var(--space-page|--space-section|--space-stack|--space-inline|--space-chrome)`,
  type `var(--font-family-sans|--font-family-display)` and `var(--heading-h1..--heading-h4)`.
- Chrome (dividers, separator borders) reads a token whose default is the quietest state — e.g.
  `--page-header-divider`. Don't add borders; opt in via the token.

### Re-skinning (this is the whole point)
A consumer sets the role tokens once — globally at `:root`, or scoped per tenant via
`[data-tenant="acme"] { --primary: …; --radius: … }` — and the entire UI follows. Build designs that
hold up under re-theming: lean on the roles above so a brand swap just works. Full rules:
`guidelines/docs/CUSTOMER-THEMING.md` and `guidelines/docs/TOKENS.md`.

### Where the truth lives (read before composing)
- `guidelines/docs/TOKENS.md` · `CUSTOMER-THEMING.md` — the token system + theming.
- `guidelines/docs/PROPS-VOCABULARY.md` · `SPACING.md` · `FORMS.md` — controlled prop vocab, spacing, forms.
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage + variants. Read it before using a component.
- Compounds compose from real sub-parts (`Card` + `CardHeader/CardContent/CardFooter`,
  `Select` + `SelectTrigger/SelectContent/SelectItem`, `Tabs` + `TabsList/TabsTrigger/TabsContent`) — never hand-roll them.

### Idiomatic snippet
```jsx
const { Card, CardHeader, CardTitle, CardContent, Button, Badge } = window.GodxjpUi;
<Card>                                            {/* tokens carry the look */}
  <CardHeader>
    <CardTitle>Monthly attendance</CardTitle>
  </CardHeader>
  <CardContent>
    <div style={{ display: "flex", gap: "var(--space-inline)", alignItems: "center" }}>
      <Badge tone="success">Approved</Badge>     {/* tone = meaning, not a raw color */}
      <Button size="sm" variant="outline">View timesheet</Button>
    </div>
  </CardContent>
</Card>
```

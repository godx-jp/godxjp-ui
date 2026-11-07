---
name: godxjp-ui-brand-surface
description: How to build an EXPRESSIVE brand surface with @godxjp/ui without breaking the restrained kit. Brand surfaces are the sign-in screen, the screens that share its shell (second factor, password reset, invitation, client authorisation), first-run onboarding, and a product's first empty state. Use when one of these screens should make an impression, or when someone calls the login page plain. Covers when it applies and when it does not (admin screens never), the art-direction and motion process, the composition rules (the picture shows the product itself, kit components on the form side, tokens re-set per theme, bundled fonts, AA contrast, a designed 390px layout), a checklist, and the `auth-brand-surface` exemplar.
---

# Brand surfaces on a restrained kit (@godxjp/ui)

The kit is restrained on purpose (DESIGN.md: canvas, ink and hairline, with no gradients, glows
or tinted sections on app surfaces). Restraint is right on screens that people use all day.
A person meets a few screens before they are inside the product, and those screens are allowed
to show the brand. This skill says which screens those are, and how to make them expressive while
every control on them stays a kit component.

Sibling skill: `godxjp-ui-design`, which covers app screens. The form on a brand surface still
follows its `references/forms.md`.

The process uses three third-party skills. Install them separately, since they are not part of
this package and are not copied here:
`taste-skill` (github.com/leonxlnx/taste-skill, art direction),
`apple-design` (github.com/emilkowalski/skills, motion and materials),
and GSAP's official skills `gsap-core`, `gsap-react` and `gsap-timeline`
(github.com/greensock/gsap-skills). All three are MIT-licensed.

## 1. When it applies

| Brand surface (this skill)                                                                                                     | App surface (DESIGN.md, never expressive)                 |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| Sign-in, and every screen that shares its shell: second factor, password setup and reset, invitation, client-app authorisation | Anything inside the app shell after sign-in               |
| First-run onboarding (one sequence, seen once)                                                                                 | Lists, detail pages, forms, editors, settings             |
| A product's FIRST empty state (nothing exists yet), as a single picture                                                        | Dashboards, approval queues, and any screen used daily    |
|                                                                                                                                | A routine empty table or filter result (use `EmptyState`) |

- **The default is still the restrained shell.** `CenteredShell variant="auth-canonical"` with the
  `auth-recovery-panels` anatomy is the right sign-in for most products. A brand surface is a
  choice the product owner makes. Agents should not reach for it on their own.
- **Build it once, as one shared component.** Every auth page passes its form in as children, so
  sign-in, reset and invitation change together. If two auth pages look different, that is a bug.
- If you are not sure whether a screen is a brand surface, treat it as an app screen.

## 2. Composition rules

1. **Expressive outside, kit inside.** Every control is a kit component: `Form`, `FormField`,
   `Input`, `PasswordInput`, `Button`, `Alert`, `Heading`, `Text`, `Logo`, `AppSettingPicker`.
   The expressive layer is a stage behind and beside them. The .tsx holds no hex values, no
   utility classes and no hand-rolled surfaces. The look lives in ONE CSS file scoped to the
   surface root, and `npx @godxjp/ui audit` stays at zero.
2. **The picture shows the product itself.** Draw what the product manages: its machines,
   documents, routes, orders and the work that moves between them. Do not use a metaphor, a
   stock photo, an abstract blob or a gradient mesh. A person should be able to say what the
   product does from the picture alone. Draw it as inline SVG from fixed numbers, so every load
   shows the same picture and motion can target its parts by class. Use no images, no WebGL and
   no network. Mark it `aria-hidden="true" focusable="false"`: it is decoration, and its labels
   carry nothing the page needs.
3. **Colour through the kit's tokens.** On the surface root, re-set `--background`, `--card`,
   `--foreground`, `--muted-foreground`, `--border` and `--input` as needed, once for light and
   once under `:root[data-theme="dark"] .x, .dark .x`. Keep the picture's colours in a few app
   tokens (HSL triplets). **Leave `--primary` and `--ring` alone.** The brand colour comes from
   the theme or `tenantTheme(hex)`, and it stays on the buttons and the focus ring. Wrap the
   surface in `ThemeScope` (`@godxjp/ui/app`) so overlays it opens, such as the locale menu,
   inherit the re-set tokens instead of the page defaults.
4. **Do not redraw the identity.** Use the product's own `Logo` (mark plus `wordmark`), or the
   logo and name the tenant uploaded. Do not propose a new mark. Treat the name with type only:
   set it in the display face through the `--logo-wordmark-*` tokens, with weight contrast
   between its words.
5. **Bundle the fonts.** Import `@fontsource` packages in the CSS, because an on-premise install
   has no font CDN. Choose one display face per script and switch it on `html[lang]`. Latin
   display faces usually lack kana and Vietnamese tone marks. Check glyph coverage for every
   locale you ship before you choose a face. M PLUS 2 and Noto Sans JP (from
   `@godxjp/ui/styles/fonts`) cover Japanese. Japanese text gets more leading and no negative
   tracking.
6. **The picture may keep one theme.** A board of hardware can stay dark in both themes, which
   gives the product one recognisable face. The form side always follows the theme.
7. **Contrast is AA, measured.** Text on the picture needs 4.5:1 below 24px and 3:1 at 24px and
   above. The pause control needs 3:1 (WCAG 1.4.11). Do not let the picture run under text: fade
   it at the foot, or move the text.
8. **One h1, and focus order follows the DOM.** The h1 is the panel title ("Sign in"), not the
   wordmark. Tab order: fields, primary action, secondary actions, locale and theme, then the
   pause control. Do not use `tabindex`. The kit's focus ring must show on every stop, in both
   themes.
9. **Design 390px; do not squeeze the desktop layout into it.** On a phone the picture becomes a
   band, about a third of the screen, with the wordmark and value line, and the form sits below
   it. Anchor the picture (`preserveAspectRatio`) so that empty ground sits behind the words.
   Check 320, 390, 768, 1024, 1280 and 844x390.
10. **Copy stays quiet.** Write one plain value line and, at most, one fact line. DESIGN.md's
    copy rules still apply: no praise, no exclamation marks, no emoji.

## 3. Motion

Use GSAP with `useGSAP`, scoped to the surface root, and one `gsap.matchMedia()` that has a
reduced-motion branch.

- **The form arrives first, and fast.** It takes about 0.6s with `expo.out` and a 60ms stagger,
  because the person came to sign in. The picture keeps arriving behind it: routes draw in
  (`strokeDashoffset`), nodes settle and labels fade. Nothing bounces, because nothing on the
  screen was thrown. The form never waits for the picture.
- **The ambient loop starts when the entrance completes.** It moves work through the picture.
  Anything that moves for more than 5 seconds must be pausable (WCAG 2.2.2), so put a pause
  control on the picture it stops, not among the form's settings.
- **Reduced motion:** draw the picture at rest, fade the form in over 0.3s, run no loop, and
  hide the pause control because nothing moves.
- Animate only transforms, opacity and `stroke-dashoffset`. Never animate layout properties,
  and use no scroll-linked motion.

## 4. Process

1. **Inventory.** Read the current screen and its shared shell, and list every page that uses
   the shell.
2. **Read the kit.** Read DESIGN.md, run `get_component` for every control on the screen, and
   find the product's identity mark (`Logo`).
3. **Pick art directions with taste-skill.** Deal palettes and type pairings, then build 2 or 3
   directions that differ in their idea, not only in colour. A useful set: the product
   literally (its own topology), a metaphor from the product's name, and a material. The
   product-literal direction is the default recommendation, because it reads at a glance in both
   themes and at 390.
4. **Build all directions behind one switch** (a `?look=` query), sharing one DOM and one CSS
   file.
5. **Shoot the real app.** Use the real backend with an admin already created, so that no
   setup notice shows in the shots. Capture every direction at 1440x900 and 390x844, in light
   and dark, in each locale, plus reduced motion and a frame strip of the entrance. Look at every
   shot, fix what is wrong, and shoot again. Typical fixes: routes running under the headline
   (fade the picture at the foot), a line crossing the headline (move it), the picture's centre
   behind the words on a phone (anchor the picture), and a pause control among the form's
   settings (move it onto the picture).
6. **The owner chooses one direction.** Delete the others and the switch in the same change.
7. **Run the gates.** Run `npx @godxjp/ui audit` on the touched files and
   `npx @godxjp/ui visual-audit` on the auth routes at every width. Walk the form with Tab,
   measure contrast, and take a shot with reduced motion. Then hand the screen to someone who
   did not build it for acceptance.

taste-skill's page checkers judge landing pages (a hero alone on the first screen, one section
per screen), and a sign-in screen fails them by design. Do not run them here. Its "never" list
still applies: no violet AI gradient, no scroll-linked motion, nothing that moves for more than
5s without a pause control, and everything at rest under reduced motion.

## 5. Checklist

- [ ] This is a brand surface (section 1), and the owner asked for an expressive one.
- [ ] One shared component, and every auth page uses it.
- [ ] Every control is a kit component, and `audit` reports 0 errors and 0 warnings on the .tsx.
- [ ] The picture shows the product's own objects. It is SVG drawn from fixed data and marked `aria-hidden`.
- [ ] The CSS re-sets kit tokens on the surface root for light and dark, and leaves `--primary` and `--ring` alone.
- [ ] `ThemeScope` wraps the surface, and the locale menu shows the surface's tokens.
- [ ] The identity is the product's own `Logo` or the tenant's logo, not redrawn.
- [ ] Fonts are bundled, with one face per script and glyphs checked for every locale.
- [ ] Contrast is measured: 4.5:1 for text below 24px, 3:1 for large text and the pause icon.
- [ ] There is one h1 (the panel title). Tab order: fields, actions, settings, pause. The focus ring shows on every stop in both themes.
- [ ] The form arrives first, the loop starts after the entrance, the pause control sits on the picture, and reduced motion is at rest.
- [ ] Shots were taken at 320, 390, 768, 1024, 1280 and 844x390, in light and dark, in every locale, and every shot was looked at.
- [ ] `visual-audit` reports 0 machine failures. Rejected directions and their switch are deleted. Someone other than the builder accepted the screen.

## 6. Exemplar

The pattern `auth-brand-surface` (`get_pattern auth-brand-surface`, or
`agent/patterns/auth-brand-surface.json`) is the screen in TSX. It contains the shared
`BrandSurface` component, the product map drawn from placeholder data, the entrance and the
ambient loop, and the pause control. Its one stylesheet is
`references/exemplar-css.md`. Replace the placeholder topology with your product's own objects
and the HSL values with your brand's, then run section 4 from step 5.

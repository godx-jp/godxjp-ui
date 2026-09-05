--- title: Overview viewport: 1440x900 ---

# Password recovery & sign-in MFA challenge (SCR-008)

A **composition pattern**, not a component. `@godxjp/ui` ships **no `PasswordRecoveryPanel`** and **no `MfaChallengePanel`**: both fail the Framework-Component Test. What the package owns is the **measure** (`AuthShell preset="account-recovery"`), the tokens, and this canonical body.

This surface is **presentation only**. It defines no route, no reset semantics, no OTP verification, no recovery-code consumption, no passkey authentication and no permissions. Every string, every value and every action handler belongs to the consumer.

## Gate 0 — why there is no `<RecoveryPanel state=… />` (gh#233)

| #                                               | Verdict | Reasoning                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C1 universal                                    | ✅ pass | Every product with accounts ships password recovery and a second-factor challenge.                                                                                                                                                                                                                                                                     |
| C2 owns reusable behaviour                      | ❌ FAIL | It owns **none**. The one piece of real behaviour in the whole surface — paste / arrow keys / caret / backspace across six slots — already belongs to `InputOTP`. Focus order is DOM order. "State" is not state: it is _which body the server told you to render_. This is the criterion's own FAIL example: "pure static layout/visual arrangement". |
| C3 not expressible from existing primitives     | ❌ FAIL | It is expressible **today**: `Card` + `CardHeader`/`CardTitle`/`CardDescription` + `AuthStack` + `Alert` + `FormField` + `Input`/`PasswordInput`/`InputOTP` + `Button fullWidth` + `Flex`. The single real gap was the 432px measure — closed with a **token-owned preset**, per "add the token, not a component".                                     |
| C4 single responsibility + controlled-vocab API | ❌ FAIL | A `state="request \| sent \| new-password \| expired"` prop is the "grab-bag with a bespoke, screen-shaped API" anti-pattern (the same call as `ErrorSurface`'s `mode`). It would also **lie**: `sent` renders no field, `new-password` renders two plus a strength meter, `passkey-failure` renders none. One prop, five incompatible bodies.         |
| C5 fully token-themeable                        | ✅ pass | Every part is token-driven already; the new measure is three `--auth-shell-recovery-*` tokens.                                                                                                                                                                                                                                                         |
| C6 earns the international contract             | ➖      | The copy is the consumer's `t()` catalog either way; the a11y contract is already owned by `FormField` / `InputOTP` / `Button`.                                                                                                                                                                                                                        |
| C7 earns its bundle cost                        | ❌ FAIL | Two page-shaped blocks shipped to every consumer for screens each app renders once.                                                                                                                                                                                                                                                                    |

A recovery panel is a measure, some slots and some copy.

> **The state is not a prop — the state IS the body you render.** The server answers "we sent a
> link" / "that link expired" / "wrong code, 4 attempts left", and the route renders the matching
> body inside the same 432px panel. Nothing is reconstructed, because nothing was torn down.

## What the package now owns

`AuthShell preset="account-recovery"` — a named flow **measure**, orthogonal to `variant`:

```tsx
<AuthShell variant="canonical" preset="account-recovery" brand={…} footer={…}>
  <Card>…the panel…</Card>
</AuthShell>
```

| Token                                       | Default                 | Owns                                                                                                    |
| ------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `--auth-shell-recovery-card-max-width`      | `27rem`                 | the **432px** SCR-008 panel measure, shared by both panels                                              |
| `--auth-shell-recovery-main-padding`        | `1rem`                  | desktop/tablet page gutter                                                                              |
| `--auth-shell-recovery-main-padding-mobile` | `0.9375rem`             | **15px** inline gutter at ≤30rem ⇒ panel `x=15, width=360` at 390                                       |
| `--otp-slot-size`                           | `var(--control-height)` | the OTP slot box — widen the challenge row **without** re-scoping `--control-height` for the whole card |

Backward compatibility is total: the canonical Login measure (`--auth-shell-canonical-card-max-width: 22.5rem` / 360px) and the un-preset shell (`24rem`) are untouched, `--otp-slot-size` defaults to the live `--control-height` tier so every existing OTP row renders identically, and `preset` remains optional with a `"default"` default.

## The canonical panel anatomy (identical for all seven states)

```tsx
<Card>
  <CardHeader>
    {/* title + description sit INSIDE the bordered surface — this is the SCR-008 hierarchy.
        Do NOT put AuthIdentity above the card here: it always renders the hosted mark. */}
    <CardTitle level={1}>{t("mfa.title")}</CardTitle>
    <CardDescription>{t("mfa.description")}</CardDescription>
  </CardHeader>
  <CardContent>
    <AuthStack>
      {notice && <Alert tone="destructive">…</Alert>} {/* notice slot   */}
      <FormField id="code" label={t("mfa.codeLabel")} error={error} required>
        <InputOTP maxLength={6} pattern="^[0-9]+$" value={code} onChange={setCode}>
          <InputOTPGroup>{/* six InputOTPSlot — ONE field, one focus stop */}</InputOTPGroup>
        </InputOTP>
      </FormField>
      <Button fullWidth loading={pending} loadingText={t("common.verifying")}>
        {t("mfa.verify")}
      </Button>
      {/* fallback slot — the two recovery affordances share one row, wrap when they must */}
      <Flex justify="between" gap="sm" wrap>
        <Button variant="ghost" size="sm">
          {t("mfa.useRecoveryCode")}
        </Button>
        <Button variant="ghost" size="sm">
          {t("mfa.retryPasskey")}
        </Button>
      </Flex>
    </AuthStack>
  </CardContent>
</Card>
```

| Slot        | Built from                                       | Geometry owned by                                                                                                    |
| ----------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| title       | `CardTitle`                                      | `--auth-shell-canonical-heading-size`, `--auth-shell-card-gap-compact`                                               |
| description | `CardDescription`                                | `--auth-shell-card-gap-compact`, `--auth-shell-card-body-gap-compact`                                                |
| fields      | `FormField` + `Input`/`PasswordInput`/`InputOTP` | `--auth-stack-gap`, `--auth-shell-field-label-*`, `--otp-slot-size`, the `--control-height` tier                     |
| primary     | `Button fullWidth`                               | `--control-height` tier (never a literal height)                                                                     |
| notice      | `Alert tone=…`                                   | `--alert-*`                                                                                                          |
| fallback    | `Flex justify="between" gap="sm" wrap`           | `--space-*` via the gap scale; reflow is content-driven                                                              |
| panel box   | `Card` inside the shell's card slot              | `--auth-shell-recovery-card-max-width`, `--auth-shell-compact-card-inset`, `--auth-shell-card-padding-block-compact` |

## Seven states, one anatomy

| Flow              | State             | Notice        | Fields                             | Primary                           |
| ----------------- | ----------------- | ------------- | ---------------------------------- | --------------------------------- |
| password recovery | `request`         | —             | email                              | send reset link                   |
| password recovery | `sent`            | `success`     | —                                  | resend (disabled during cooldown) |
| password recovery | `new-password`    | —             | new + confirm + `PasswordStrength` | update password                   |
| password recovery | `expired`         | `destructive` | —                                  | request a new link                |
| sign-in MFA       | `otp`             | —             | one 6-slot `InputOTP` row          | verify                            |
| sign-in MFA       | `recovery-code`   | —             | one `Input`                        | verify                            |
| sign-in MFA       | `passkey-failure` | `destructive` | —                                  | retry passkey                     |

## Accessibility

- **Focus order = DOM order**: code field → primary → fallback A → fallback B. No `tabindex` anywhere, no positive tabindex, no focus trap (this is a page, not a dialog). - **One field, not six.** `InputOTP` is a single focus stop that owns paste, arrows, backspace and the caret. Six `Input`s would break paste — the most common real MFA interaction. - **Errors** are `FormField error` ⇒ `aria-invalid` + `aria-errormessage` on the control and a `role="alert"` message.

## Responsive contract

| Width | Panel                                     | OTP row                       | Fallback row                                                |
| ----- | ----------------------------------------- | ----------------------------- | ----------------------------------------------------------- |
| 1440  | `432px`, centred, 16px page gutter        | one row, 6 × 36px = 216px     | one row                                                     |
| 1024  | `432px`, centred, 16px page gutter        | one row, identical            | one row                                                     |
| 390   | `360px` (`x=15`), 15px inline page gutter | one row, identical, no scroll | one row; stacks when labels exceed the 310px content column |

**The supplied 390 reference image is not a valid source.** It is a desktop 2×2 composite that overflows and crops horizontally; it shows no mobile route and no reflow. The 390 row above is a **decided contract**, documented in the mobile example and pinned by tests — not a trace of that image. See **Examples → Viewport 390×844**.

## Measured in Chromium (headless, `deviceScaleFactor: 1`)

Real `getBoundingClientRect()` numbers from these pages, not estimates:

| Viewport | Panel `x` / `w`    | Page gutter | Content column | OTP row (6 slots) | Primary action | Fallback row                           | `scrollWidth`      |
| -------- | ------------------ | ----------- | -------------- | ----------------- | -------------- | -------------------------------------- | ------------------ |
| 1440×900 | `504` / **432**    | 16px        | 382px          | **216px** (6×36)  | 382×36         | one row                                | 1440 (no overflow) |
| 1024×900 | `296` / **432**    | 16px        | 382px          | 216px (6×36)      | 382×36         | one row                                | 1024 (no overflow) |
| 390×844  | **`15`** / **360** | 15px        | 310px          | 216px (6×36)      | 310×36         | one row (ja) → stacks on longer labels | 390 (no overflow)  |

At 390 all three wrap. The reflow is purely content-driven — there is no locale branch and no media query.

RTL (`dir="rtl"`, 1440): the panel stays `x=504, w=432`; the OTP slots mirror (slot 1 is the right-most at `x=875`, running to `x=695`) with `border-inline-start` and `border-start-start-radius` still on the logical first slot; the fallback row's reading order flips; `scrollWidth` stays 1440.

Focus order, driven with real `Tab` presses from the OTP field: `input.ui-otp-input` (accessible name "確認コード") → 確認する → リカバリコードを使う → パスキーで再試行 → the footer locale control. Typing `482915` into that **single** focus stop fills all six slots. Zero positive `tabindex` on the page. axe-core (wcag2a/2aa/21a/21aa/22aa) reports **0 violations** on all five pages at 1440 and 390, with a clean console.

> **Width is a contract; height is content.** The issue's artboard heights (request `h=248`, MFA
> `h=324`) are measurements of that artboard's copy. The panels here measure `h=275.5` with the
> Japanese copy above and `h=332.5` once a fallback row wraps. Pinning a panel height would clip a
> longer translation, so the pattern owns the measure and lets the panel grow.

## Anti-patterns

- ❌ `TwoFactorSetup` for a sign-in challenge — that is the **enrollment** dialog (QR / manual key / recovery output). A challenge has no secret to reveal and no dialog to dismiss. - ❌ `AuthIdentity` above the panel on SCR-008 — it always renders the hosted mark, and the canonical hierarchy puts the heading **inside** the bordered surface. - ❌ Six `Input`s for the OTP row — one `InputOTP`. - ❌ A page-local `--auth-shell-card-max-width` override, a `.recovery-panel { width: 432px }` class or any consumer media query — that is exactly the geometry this preset took over. - ❌ Re-scoping `--control-height` on the card to widen the OTP slots — that resizes the button and every input too. Use `--otp-slot-size`. - ❌ Two primary actions.

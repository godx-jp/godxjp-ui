import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ForgeProduct } from "./types";
import { useTweaks, type Density, type Theme } from "../../hooks/useTweaks";
import { SUPPORTED_LOCALES, type ForgeLocale } from "../../i18n";

// TweaksPanel — right-side drawer that exposes the four toggles every
// GoDX surface must honor: density, theme (light/dark), tenant
// (product brand override), locale (ja/en/vi), sidebar collapsed.
//
// Owned state lives in `useTweaks` (localStorage-persisted); this
// component is the visual face. Per MUST RULE #5 + #8, no service may
// implement its own theme switcher — every consumer reuses this.
//
// `products` is REQUIRED — consumers pass their own catalogue
// (no built-in mock data per cardinal rule 28). Pass `[]` to hide
// the tenant selector entirely.

export interface TweaksPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Product catalogue for the tenant selector. Pass `[]` to hide. */
  products?: ForgeProduct[];
}

export function TweaksPanel({ open, onOpenChange, products = [] }: TweaksPanelProps) {
  const { t } = useTranslation();
  const { tweaks, setTweak } = useTweaks();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-80 bg-popover text-popover-foreground border-l border-border shadow-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-right">
          <div className="flex items-center justify-between border-b border-border px-4 h-12">
            <Dialog.Title className="font-medium text-sm">
              {t("tweaks.title")}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="tb-icon-btn" aria-label="Close">
                <X size={14} />
              </button>
            </Dialog.Close>
          </div>

          <div className="overflow-y-auto h-[calc(100%-3rem)] p-4 flex flex-col gap-6">
            <Section label={t("tweaks.display")}>
              <Radio
                label={t("tweaks.density")}
                value={tweaks.density}
                onChange={(v) => setTweak("density", v as Density)}
                options={[
                  { value: "compact", label: t("tweaks.densityCompact") },
                  { value: "default", label: t("tweaks.densityDefault") },
                  { value: "comfortable", label: t("tweaks.densityComfortable") },
                ]}
              />
              <Radio
                label={t("tweaks.theme")}
                value={tweaks.theme}
                onChange={(v) => setTweak("theme", v as Theme)}
                options={[
                  { value: "light", label: t("tweaks.themeLight") },
                  { value: "dark", label: t("tweaks.themeDark") },
                ]}
              />
              <Toggle
                label={t("shell.sidebarCollapse")}
                value={tweaks.sidebarCollapsed}
                onChange={(v) => setTweak("sidebarCollapsed", v)}
              />
            </Section>

            {products.length > 0 && (
              <Section label={t("tweaks.product")}>
                <Select
                  label={t("tweaks.product")}
                  value={tweaks.tenant}
                  onChange={(v) => setTweak("tenant", v as typeof tweaks.tenant)}
                  options={products.map((p) => ({ value: p.tenant, label: p.name }))}
                />
              </Section>
            )}

            <Section label={t("tweaks.locale")}>
              <Radio
                label={t("tweaks.language")}
                value={tweaks.locale}
                onChange={(v) => setTweak("locale", v as ForgeLocale)}
                options={SUPPORTED_LOCALES.map((code) => ({
                  value: code,
                  label: (
                    { ja: "日本語", en: "English", vi: "Tiếng Việt", fil: "Filipino" } as Record<string, string>
                  )[code] ?? code,
                }))}
              />
            </Section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function Radio<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div className="grid auto-cols-fr grid-flow-col rounded-md border border-border overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            data-active={opt.value === value}
            onClick={() => onChange(opt.value)}
            className="px-2 py-1 text-xs hover:bg-accent/40 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="relative inline-flex h-5 w-9 items-center rounded-full bg-input data-[on=true]:bg-primary transition-colors"
        data-on={value}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform translate-x-0.5 data-[on=true]:translate-x-4"
          data-on={value}
        />
      </button>
    </label>
  );
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

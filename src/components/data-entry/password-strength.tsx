import { Check, X } from "lucide-react";
import { useTranslation } from "../../i18n/use-translation";

const DEFAULT_PASSWORD_RULES = ["length", "upper", "lower", "number", "symbol"] as const;

export type PasswordRule = (typeof DEFAULT_PASSWORD_RULES)[number];
/**
 * Every visible and screen-reader string, each optional (gh#1191). Unset entries come from the
 * kit's own ja / en / vi catalogue for the active locale, so most apps pass nothing.
 */
export type PasswordStrengthLabels = {
  weak?: string;
  fair?: string;
  strong?: string;
  /** Checklist line per rule. */
  rules?: Partial<Record<PasswordRule, string>>;
  /** Screen-reader prefix before a met rule (e.g. "Passed: "). */
  passed?: string;
  /** Screen-reader prefix before an unmet rule (e.g. "Not yet: "). */
  failed?: string;
  /** The polite live-region sentence, given the strength word. */
  announcement?: (strength: string) => string;
};

export type PasswordStrengthProps = {
  value: string;
  /**
   * The length rule's threshold (gh#1193), so the checklist matches the server's policy, e.g. 12 for
   * Laravel `Password::min(12)`. Default 8. It drives the check, the score and the rule text.
   */
  minLength?: number;
  rules?: PasswordRule[];
  showChecklist?: boolean;
  labels?: PasswordStrengthLabels;
};

export type PasswordStrengthReturn = {
  score: 0 | 1 | 2 | 3 | 4;
  checks: Record<PasswordRule, boolean>;
};

export function usePasswordStrength(
  value: string,
  rules: PasswordRule[] = [...DEFAULT_PASSWORD_RULES],
  minLength = 8,
): PasswordStrengthReturn {
  const uniqueRules = [...new Set(rules)];
  const checks: Record<PasswordRule, boolean> = {
    length: value.length >= minLength,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };
  const passed = uniqueRules.filter((rule) => checks[rule]).length;
  const score = Math.max(0, Math.min(4, passed)) as PasswordStrengthReturn["score"];

  return { score, checks };
}

function scoreTone(score: number) {
  if (score <= 1) return "destructive";
  if (score <= 3) return "warning";
  return "success";
}

function scoreKey(score: number): "weak" | "fair" | "strong" {
  if (score <= 1) return "weak";
  if (score <= 3) return "fair";
  return "strong";
}

export function PasswordStrength({
  value,
  minLength = 8,
  rules = [...DEFAULT_PASSWORD_RULES],
  showChecklist = true,
  labels = {},
}: PasswordStrengthProps) {
  const { t } = useTranslation();
  const normalizedRules = [...new Set(rules)];
  const { score, checks } = usePasswordStrength(value, normalizedRules, minLength);
  const tone = scoreTone(score);
  const segments = Array.from({ length: 5 });
  const key = scoreKey(score);
  const strength = labels[key] ?? t(`dataEntry.passwordStrength.${key}`);
  const ruleLabel = (rule: PasswordRule) =>
    labels.rules?.[rule] ?? t(`dataEntry.passwordStrength.rules.${rule}`, { n: String(minLength) });
  const announcement = labels.announcement
    ? labels.announcement(strength)
    : t("dataEntry.passwordStrength.announcement", { strength });

  return (
    <div className="ui-password-strength">
      <div
        className="ui-password-strength-track"
        role="img"
        aria-label={t("dataEntry.passwordStrength.meter", { score: String(score) })}
      >
        {segments.map((_, index) => {
          const filled = index < score + 1;
          return (
            <span
              key={index}
              className="ui-password-strength-segment"
              data-tone={filled ? tone : undefined}
              data-state={filled ? "filled" : "empty"}
              aria-hidden="true"
            />
          );
        })}
      </div>
      <div className="ui-password-strength-meta">
        <span className="ui-password-strength-label">{strength}</span>
        <span className="ui-password-strength-score" aria-hidden="true">
          {score}/4
        </span>
      </div>

      {showChecklist ? (
        <ul className="ui-password-strength-checklist">
          {normalizedRules.map((rule) => (
            <li
              key={rule}
              className="ui-password-strength-checklist-item"
              data-state={checks[rule] ? "passed" : "failed"}
            >
              {checks[rule] ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
              <span className="sr-only">
                {checks[rule]
                  ? (labels.passed ?? t("dataEntry.passwordStrength.passed"))
                  : (labels.failed ?? t("dataEntry.passwordStrength.failed"))}
              </span>
              <span>{ruleLabel(rule)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}

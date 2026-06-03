import { Check, X } from "lucide-react";

const DEFAULT_PASSWORD_RULES = ["length", "upper", "lower", "number", "symbol"] as const;
const DEFAULT_LABELS = {
  weak: "Weak",
  fair: "Fair",
  strong: "Strong",
} as const;

export type PasswordRule = (typeof DEFAULT_PASSWORD_RULES)[number];
export type PasswordStrengthLabels = {
  weak: string;
  fair: string;
  strong: string;
};

export type PasswordStrengthProps = {
  value: string;
  rules?: PasswordRule[];
  showChecklist?: boolean;
  labels?: PasswordStrengthLabels;
};

export type PasswordStrengthReturn = {
  score: 0 | 1 | 2 | 3 | 4;
  checks: Record<PasswordRule, boolean>;
};

export function usePasswordStrength(value: string, rules: PasswordRule[] = [...DEFAULT_PASSWORD_RULES]): PasswordStrengthReturn {
  const uniqueRules = [...new Set(rules)];
  const checks: Record<PasswordRule, boolean> = {
    length: value.length >= 8,
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

function scoreLabel(score: number, labels: PasswordStrengthLabels) {
  if (score <= 1) return labels.weak;
  if (score <= 3) return labels.fair;
  return labels.strong;
}

export function PasswordStrength({
  value,
  rules = [...DEFAULT_PASSWORD_RULES],
  showChecklist = true,
  labels = DEFAULT_LABELS,
}: PasswordStrengthProps) {
  const normalizedRules = [...new Set(rules)];
  const { score, checks } = usePasswordStrength(value, normalizedRules);
  const tone = scoreTone(score);
  const segments = Array.from({ length: 5 });

  return (
    <div className="ui-password-strength">
      <div className="ui-password-strength-track" role="img" aria-label={`Password strength ${score}/4`}>
        {segments.map((_, index) => {
          const filled = index < (score + 1);
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
        <span className="ui-password-strength-label">{scoreLabel(score, labels)}</span>
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
              <span>{labelForRule(rule)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {scoreLabel(score, labels)} password strength
      </span>
    </div>
  );
}

function labelForRule(rule: PasswordRule) {
  switch (rule) {
    case "length":
      return "8+ characters";
    case "upper":
      return "Contains uppercase letter";
    case "lower":
      return "Contains lowercase letter";
    case "number":
      return "Contains number";
    case "symbol":
      return "Contains symbol";
    default:
      return rule;
  }
}

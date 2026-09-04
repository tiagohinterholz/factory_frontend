import { Check, X } from "lucide-react"
import { PASSWORD_RULES, passwordScore } from "@/modules/core/utils/password-policy"

const LEVELS = [
  { label: "Muito fraca", barColor: "bg-danger", textColor: "text-danger" },
  { label: "Fraca", barColor: "bg-danger", textColor: "text-danger" },
  { label: "Média", barColor: "bg-warn", textColor: "text-warn" },
  { label: "Forte", barColor: "bg-ok", textColor: "text-ok" },
  { label: "Muito forte", barColor: "bg-ok", textColor: "text-ok" },
]

// Barra de "saúde" da senha + checklist dos requisitos (mesmas regras que o
// backend exige — validate_strong_password). `password` vazio mostra a barra
// zerada, mas some com o checklist pra não assustar antes da pessoa digitar.
export default function PasswordStrengthMeter({ password }) {
  const value = password || ""
  const score = passwordScore(value)
  const level = LEVELS[Math.max(0, score - 1)] ?? LEVELS[0]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="flex gap-1 flex-1"
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={5}
        >
          {PASSWORD_RULES.map((rule, index) => (
            <span
              key={rule.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index < score ? level.barColor : "bg-slate-100"
              }`}
            />
          ))}
        </div>
        {value && (
          <span className={`text-xs font-bold shrink-0 ${level.textColor}`}>{level.label}</span>
        )}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(value)
          return (
            <li
              key={rule.id}
              className={`flex items-center gap-1 text-xs ${met ? "text-ok" : "text-muted"}`}
            >
              {met ? (
                <Check className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 shrink-0" />
              )}
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

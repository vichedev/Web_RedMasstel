import { useMemo } from "react";
import zxcvbn from "zxcvbn";

const LEVELS = [
  { label: "Muy débil", color: "bg-red-500", textColor: "text-red-700" },
  { label: "Débil", color: "bg-orange-500", textColor: "text-orange-700" },
  { label: "Aceptable", color: "bg-amber-500", textColor: "text-amber-700" },
  { label: "Buena", color: "bg-emerald-500", textColor: "text-emerald-700" },
  { label: "Excelente", color: "bg-green-600", textColor: "text-green-700" },
];

/**
 * Medidor de fortaleza con `zxcvbn`. Evalúa contra diccionarios reales,
 * no solo longitud y caracteres.
 *
 * Devuelve `score` 0-4. La UI muestra una barra de progreso, un label
 * legible, y la sugerencia/advertencia más útil.
 */
export function PasswordStrengthMeter({ value, minScore = 2 }) {
  const result = useMemo(() => {
    if (!value) return null;
    return zxcvbn(value);
  }, [value]);

  if (!value) return null;
  const score = result?.score ?? 0;
  const level = LEVELS[score];
  const widthPct = ((score + 1) / 5) * 100;
  const passes = score >= minScore;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className={`font-bold ${level.textColor}`}>{level.label}</span>
        {!passes && (
          <span className="text-gray-500">
            mínimo: {LEVELS[minScore].label.toLowerCase()}
          </span>
        )}
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${level.color}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      {result?.feedback?.warning && (
        <p className="mt-1 text-[11px] text-amber-700">
          {translateWarning(result.feedback.warning)}
        </p>
      )}
      {result?.feedback?.suggestions?.[0] && (
        <p className="mt-0.5 text-[11px] text-gray-500">
          💡 {translateSuggestion(result.feedback.suggestions[0])}
        </p>
      )}
    </div>
  );
}

export function isPasswordStrongEnough(value, minScore = 2) {
  if (!value) return false;
  return zxcvbn(value).score >= minScore;
}

function translateWarning(en) {
  const map = {
    "This is a top-10 common password": "Es una de las contraseñas más usadas",
    "This is a top-100 common password": "Está entre las 100 más usadas",
    "This is a very common password": "Es una contraseña muy común",
    "This is similar to a commonly used password": "Es similar a una muy usada",
    "Repeats like \"aaa\" are easy to guess": "Las repeticiones son muy adivinables",
    "Repeats like \"abcabcabc\" are only slightly harder to guess than \"abc\"":
      "Las repeticiones son muy adivinables",
    "Sequences like abc or 6543 are easy to guess": "Las secuencias son adivinables",
    "Recent years are easy to guess": "Los años recientes son adivinables",
    "Dates are often easy to guess": "Las fechas son adivinables",
    'A word by itself is easy to guess': "Una sola palabra es adivinable",
    "Names and surnames by themselves are easy to guess":
      "Los nombres son adivinables",
    "Common names and surnames are easy to guess":
      "Los nombres comunes son adivinables",
  };
  return map[en] ?? en;
}

function translateSuggestion(en) {
  const map = {
    "Add another word or two. Uncommon words are better.":
      "Añade otra palabra o dos. Las palabras poco comunes son mejores.",
    "Use a longer keyboard pattern with more turns": "Usa un patrón más largo",
    "Avoid repeated words and characters": "Evita palabras o caracteres repetidos",
    "Avoid sequences": "Evita secuencias",
    "Avoid recent years": "Evita años recientes",
    "Avoid years that are associated with you": "Evita años personales",
    "Avoid dates and years that are associated with you":
      "Evita fechas personales",
    "Capitalization doesn't help very much": "Las mayúsculas no ayudan mucho",
    "All-uppercase is almost as easy to guess as all-lowercase":
      "TODO MAYÚSCULAS no es más seguro",
    "Reversed words aren't much harder to guess": "Las palabras al revés no ayudan",
    "Predictable substitutions like '@' instead of 'a' don't help very much":
      "Sustituir 'a' por '@' no añade mucha seguridad",
    "Use a few words, avoid common phrases":
      "Usa varias palabras y evita frases comunes",
    "No need for symbols, digits, or uppercase letters":
      "No es obligatorio usar símbolos o números",
  };
  return map[en] ?? en;
}

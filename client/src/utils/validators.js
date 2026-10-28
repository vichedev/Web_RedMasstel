export function isValidEmail(email) {
  // Regex pragmática: funciona para >99% de casos reales
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

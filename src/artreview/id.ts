export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `candidate-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

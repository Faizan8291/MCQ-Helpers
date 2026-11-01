/**
 * Single place that mints ids for client-side records.
 *
 * `crypto.randomUUID` exists in browsers and Node 19+, but some test
 * environments do not expose it, hence the fallback so id generation can
 * never crash a form submission.
 */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Returns the Midtrans Snap script URL based on the environment.
 * Kept server-side only — do not import in Client Components.
 */
export function getSnapScriptUrl(): string {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  return isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

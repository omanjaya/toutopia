/**
 * Strip HTML tags from a string (for plain text fields like names, titles).
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize HTML content — allow safe tags only (for rich text content).
 * Strips script tags, event handlers, javascript: URIs, and data: URIs.
 */
export function sanitizeHtml(input: string): string {
  return input
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handler attributes
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // Remove javascript: and data: URIs in href/src
    .replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, "")
    .replace(/(href|src)\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, "")
    // Remove iframe, embed, object, form tags
    .replace(/<\/?(iframe|embed|object|form|base|meta|link)\b[^>]*>/gi, "");
}

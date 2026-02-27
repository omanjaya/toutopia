/**
 * Strip HTML tags from a string (for plain text fields like names, titles).
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

// Whitelist of allowed HTML tags
const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "blockquote", "code", "pre",
  "a", "span", "div",
  "table", "thead", "tbody", "tfoot", "tr", "td", "th",
  "img", "figure", "figcaption",
  "sub", "sup", "mark", "small", "hr",
]);

// Allowed attributes per tag (whitelist approach)
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href"]),
  img: new Set(["src", "alt"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
};

// "class" is allowed on all tags
const GLOBAL_ATTRS = new Set(["class"]);

/**
 * Sanitize HTML content using a strict whitelist approach.
 * Only allows specific safe tags and attributes. Everything else is stripped.
 */
export function sanitizeHtml(input: string): string {
  return input.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/g, (fullMatch, tagName: string, attrsStr: string | undefined) => {
    const tag = tagName.toLowerCase();

    // Strip disallowed tags entirely (including their opening/closing markers)
    if (!ALLOWED_TAGS.has(tag)) {
      return "";
    }

    // If it's a closing tag, return a clean closing tag
    if (fullMatch.startsWith("</")) {
      return `</${tag}>`;
    }

    // Parse and filter attributes using whitelist
    const allowedTagAttrs = ALLOWED_ATTRS[tag];
    const filteredAttrs: string[] = [];

    if (attrsStr) {
      // Match attribute patterns: name="value", name='value', name=value, or bare name
      const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
      let attrMatch: RegExpExecArray | null;

      while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

        // Check if attribute is allowed (global or tag-specific)
        if (!GLOBAL_ATTRS.has(attrName) && !allowedTagAttrs?.has(attrName)) {
          continue;
        }

        // For href/src, block dangerous URI schemes
        if (attrName === "href" || attrName === "src") {
          const trimmedValue = attrValue.trim().toLowerCase();
          if (
            trimmedValue.startsWith("javascript:") ||
            trimmedValue.startsWith("data:") ||
            trimmedValue.startsWith("vbscript:")
          ) {
            continue;
          }
        }

        filteredAttrs.push(`${attrName}="${attrValue.replace(/"/g, "&quot;")}"`);
      }
    }

    const isSelfClosing = fullMatch.endsWith("/>") || tag === "br" || tag === "hr" || tag === "img";
    const attrString = filteredAttrs.length > 0 ? ` ${filteredAttrs.join(" ")}` : "";

    return isSelfClosing ? `<${tag}${attrString} />` : `<${tag}${attrString}>`;
  });
}

import DOMPurify, { type Config } from "dompurify"

/**
 * Allow-list for HTML returned by `GET /events/{id}` `description`.
 * Expand only if the API legitimately emits additional tags.
 */
const SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "a",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "span",
    "div",
  ],
  ALLOWED_ATTR: ["href", "title", "target", "rel", "class"],
  ALLOW_DATA_ATTR: false,
}

/**
 * Strips scripts and disallowed markup. Call only in the browser (e.g. after mount).
 */
export function sanitizeEventDescription(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG)
}

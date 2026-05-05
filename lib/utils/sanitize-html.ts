/**
 * Tiny HTML sanitizer for content authored in the admin RichTextEditor.
 *
 * Rules:
 *  - Whitelist of formatting tags only (block + inline).
 *  - Drops every attribute except an `href` on `<a>` (with safe schemes) and
 *    a constrained `style` for text-align.
 *  - Strips `<script>`, `<style>`, `<iframe>` and HTML comments outright.
 *  - For legacy plain-text values (no tags detected), wraps each paragraph in
 *    `<p>` and converts single newlines to `<br>` so existing data renders
 *    correctly.
 *
 * Note: the editor only runs in an authenticated admin area, so this layer is
 * defense-in-depth, not the primary security boundary.
 */

const ALLOWED_TAGS: Record<string, ReadonlyArray<string>> = {
  p: ["style"],
  br: [],
  div: ["style"],
  span: [],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  s: [],
  strike: [],
  h2: ["style"],
  h3: ["style"],
  h4: ["style"],
  ul: [],
  ol: [],
  li: [],
  blockquote: [],
  a: ["href"],
};

const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i;

function escapeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainTextToHtml(text: string): string {
  const escaped = escapeText(text).trim();
  if (!escaped) return "";
  return escaped
    .split(/\r?\n\s*\r?\n/)
    .map((para) => `<p>${para.replace(/\r?\n/g, "<br>")}</p>`)
    .join("");
}

function sanitizeStyle(raw: string): string {
  // Allow only `text-align: left|center|right|justify`.
  const out: string[] = [];
  for (const decl of raw.split(";")) {
    const [propRaw, valRaw] = decl.split(":");
    if (!propRaw || !valRaw) continue;
    const prop = propRaw.trim().toLowerCase();
    const val = valRaw.trim().toLowerCase();
    if (prop === "text-align" && /^(left|center|right|justify)$/.test(val)) {
      out.push(`text-align: ${val}`);
    }
  }
  return out.join("; ");
}

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";

  // No tags? Treat as plain text from legacy data and preserve line breaks.
  if (!/<\/?[a-z][^>]*>/i.test(input)) {
    return plainTextToHtml(input);
  }

  // Strip dangerous blocks (incl. their content) and HTML comments first.
  let html = input
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Walk every tag and rewrite based on the whitelist.
  html = html.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g,
    (_full, slash: string, tagRaw: string, attrsRaw: string) => {
      const tag = tagRaw.toLowerCase();
      const allowedAttrs = ALLOWED_TAGS[tag];
      if (!allowedAttrs) return "";

      if (slash === "/") return `</${tag}>`;

      const kept: string[] = [];
      const attrRe = /([a-zA-Z_:][\w:.\-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
      let m: RegExpExecArray | null;
      while ((m = attrRe.exec(attrsRaw))) {
        const name = m[1].toLowerCase();
        const value = m[3] ?? m[4] ?? m[5] ?? "";

        if (!allowedAttrs.includes(name)) continue;

        if (name === "href") {
          const trimmed = value.trim();
          if (!SAFE_HREF.test(trimmed)) continue;
          kept.push(`href="${escapeText(trimmed)}"`);
          continue;
        }

        if (name === "style") {
          const safe = sanitizeStyle(value);
          if (safe) kept.push(`style="${escapeText(safe)}"`);
          continue;
        }
      }

      if (tag === "a") {
        // Force safe link behavior for external nav.
        kept.push('target="_blank"', 'rel="noopener noreferrer"');
      }

      return `<${tag}${kept.length ? " " + kept.join(" ") : ""}>`;
    }
  );

  // Drop empty trailing whitespace-only paragraphs from execCommand output.
  return html.trim();
}

// Normalizes a string into a URL-friendly, kebab-case slug.
//
// Used for path matching / link generation where input can arrive with varied
// casing, whitespace, accents, or trailing slashes (e.g. comparing the active
// route against nav-item hrefs). Pure and unit-testable.
export function slugify(value) {
  if (value == null) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")                  // split accented chars (é -> e + combining)
    .replace(/[\u0300-\u036f]/g, "")   // drop combining diacritical marks
    .replace(/[^a-z0-9]+/g, "-")       // collapse runs of non-alphanumerics to '-'
    .replace(/^-+|-+$/g, "");          // trim leading/trailing '-'
}

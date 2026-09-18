/**
 * Turns a title into a URL slug matching the `slug` rule in `post.dto.ts`:
 * lowercase alphanumerics separated by single hyphens.
 */
export function slugify(input: string): string {
  return (
    input
      .normalize('NFKD')
      // Strip accents so "Café" becomes "cafe" rather than losing the word.
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 200)
      .replace(/-+$/g, '')
  );
}

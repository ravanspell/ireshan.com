/**
 * Languages offered by the code block's dropdown.
 *
 * A curated subset of `highlight.js/lib/common`, which is the bundle the block
 * loads - the full package carries ~190 languages. Anything listed here must
 * exist in that bundle or the block silently falls back to auto-detection.
 *
 * Auto-detect leads because it is what blocks saved before the block stored a
 * language at all fall back to.
 */
export const CODE_LANGUAGES: ReadonlyArray<{ value: string; label: string }> = [
  { value: '', label: 'Auto-detect' },
  { value: 'plaintext', label: 'Plain text' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'css', label: 'CSS' },
  { value: 'diff', label: 'Diff' },
  { value: 'go', label: 'Go' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'php', label: 'PHP' },
  { value: 'python', label: 'Python' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'rust', label: 'Rust' },
  { value: 'scss', label: 'SCSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'swift', label: 'Swift' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'xml', label: 'HTML / XML' },
  { value: 'yaml', label: 'YAML' },
];

/** highlight.js id -> dropdown label. Also doubles as the "is this id one we offer?" check. */
export const CODE_LANGUAGE_LABELS = new Map(
  CODE_LANGUAGES.map(({ value, label }) => [value, label]),
);

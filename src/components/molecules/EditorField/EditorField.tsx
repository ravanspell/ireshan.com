'use client';

/**
 * The input shell the editor's fields share. `TagInput` matches it on its own
 * wrapper, so the title, slug and tag rows read as one set of controls.
 */
export const fieldClass =
  'w-full rounded-md border border-input bg-field px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50';

export interface EditorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Extra classes for the input itself - the title runs larger, the slug monospaced. */
  inputClassName?: string;
}

/**
 * A labelled single-line field for the editor's post metadata.
 *
 * Deliberately not `@atoms/Input/Input`: that atom carries its own padding and
 * focus ring, which would put the title and slug out of step with `TagInput`
 * sitting directly beneath them.
 */
export default function EditorField({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputClassName = '',
}: EditorFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${fieldClass} ${inputClassName}`}
      />
    </div>
  );
}

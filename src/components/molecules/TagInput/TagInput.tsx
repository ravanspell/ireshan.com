'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { slugify } from '@lib/slug';

export interface TagInputProps {
  /** Tag names, in the order they'll be shown. */
  value: string[];
  onChange: (tags: string[]) => void;
  /**
   * Existing tag names, offered as autocomplete. Picking one isn't required -
   * a name that doesn't exist yet is created when the post is saved.
   */
  suggestions?: string[];
  /** Matches the ceiling `post.dto.ts` validates on the way in. */
  max?: number;
  disabled?: boolean;
  id?: string;
}

/**
 * Free-text tag field: type a name, press Enter (or comma) to turn it into a
 * chip.
 *
 * Duplicates are compared by slug, the same key the repository resolves names
 * with, so "Web Dev" and "web dev" can't both end up on one post.
 */
export default function TagInput({
  value,
  onChange,
  suggestions = [],
  max = 10,
  disabled = false,
  id,
}: TagInputProps) {
  const [draft, setDraft] = useState('');
  const listId = useId();

  const atLimit = value.length >= max;

  const commit = (raw: string) => {
    // Pasting "react, next.js" should give two chips, not one.
    const added = raw
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name && slugify(name));

    if (added.length === 0) {
      setDraft('');
      return;
    }

    const next = [...value];
    const seen = new Set(next.map(slugify));

    for (const name of added) {
      if (next.length >= max) break;
      const key = slugify(name);
      if (seen.has(key)) continue;
      seen.add(key);
      next.push(name);
    }

    setDraft('');
    if (next.length !== value.length) onChange(next);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      // Enter would otherwise submit the surrounding form.
      event.preventDefault();
      commit(draft);
      return;
    }

    // Backspace on an empty field takes back the last chip.
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      remove(value.length - 1);
    }
  };

  // Anything already on the post is dropped from the suggestion list.
  const chosen = new Set(value.map(slugify));
  const available = suggestions.filter((name) => !chosen.has(slugify(name)));

  return (
    <div className="space-y-2">
      <div className="border-input bg-field focus-within:border-ring focus-within:ring-ring/40 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 transition-colors focus-within:ring-2">
        {value.map((tag, index) => (
          <span
            key={slugify(tag)}
            className="bg-muted text-muted-foreground flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2 text-xs"
          >
            {tag}
            <button
              type="button"
              disabled={disabled}
              onClick={() => remove(index)}
              aria-label={`Remove tag ${tag}`}
              className="hover:text-foreground rounded-full p-0.5 disabled:opacity-50"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          id={id}
          list={listId}
          value={draft}
          disabled={disabled || atLimit}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          // Commits what's typed when the author moves on to Save, so a tag
          // that was never followed by Enter isn't silently dropped.
          onBlur={() => commit(draft)}
          placeholder={atLimit ? '' : value.length === 0 ? 'Add a tag…' : ''}
          className="text-foreground placeholder:text-muted-foreground min-w-32 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed"
        />

        <datalist id={listId}>
          {available.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      <p className="text-muted-foreground text-xs">
        {atLimit
          ? `Tag limit reached (${max}).`
          : 'Press Enter or comma to add. New tags are created on save.'}
      </p>
    </div>
  );
}

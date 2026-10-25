'use client';

import { useId, useState } from 'react';
import { Loader2, Sparkles, X } from 'lucide-react';

import { generateParagraphAction } from '@/app/actions/ai-writing';
import { Button } from '@/components/atoms/button';
import { fieldClass } from '@molecules/EditorField/EditorField';

export interface AIAssistPanelProps {
  /** Replace the assist block with this text as paragraphs. */
  onInsert: (text: string) => void;
  /** Remove the assist block without inserting anything. */
  onDiscard: () => void;
}

type Revision = { text: string; feedback: string };

/**
 * The writing assistant: Helps to write paragrhas
 * idea -> paragraph -> feedback -> revised paragraph, then insert.
 */
export default function AIAssistPanel({ onInsert, onDiscard }: AIAssistPanelProps) {
  const [idea, setIdea] = useState('');
  const [feedback, setFeedback] = useState('');
  const [text, setText] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A post can hold more than one assist block at once.
  const fieldId = useId();

  const generate = async (nextRevisions: Revision[]) => {
    setIsPending(true);
    setError(null);

    try {
      const result = await generateParagraphAction({ idea, revisions: nextRevisions });

      if (!result.success) {
        setError(
          result.error || Object.values(result.errors ?? {}).join(', ') || 'Something went wrong',
        );
        return;
      }

      setText(result.data);
      setRevisions(nextRevisions);
      setFeedback('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsPending(false);
    }
  };

  const refine = () => {
    if (text) void generate([...revisions, { text, feedback: feedback.trim() }]);
  };

  return (
    <div className="border-input bg-background my-2 space-y-3 rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-foreground flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4" aria-hidden="true" />
          AI assist
        </p>
        <Button variant="ghost" size="icon-sm" onClick={onDiscard} aria-label="Discard AI assist">
          <X />
        </Button>
      </div>

      {text === null ? (
        <>
          <label htmlFor={`${fieldId}-idea`} className="block text-sm font-medium">
            What should this paragraph say?
          </label>
          <textarea
            id={`${fieldId}-idea`}
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            rows={3}
            disabled={isPending}
            className={`${fieldClass} resize-y text-sm`}
            autoFocus
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => void generate([])}
              disabled={isPending || !idea.trim()}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {isPending ? 'Writing...' : 'Generate'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p
            className={`border-input text-foreground/90 rounded-md border p-3 text-sm leading-relaxed whitespace-pre-wrap ${isPending ? 'opacity-50' : ''}`}
          >
            {text}
          </p>
          <label htmlFor={`${fieldId}-feedback`} className="block text-sm font-medium">
            Refine
          </label>
          <textarea
            id={`${fieldId}-feedback`}
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="e.g. Shorter, less formal..."
            rows={2}
            disabled={isPending}
            className={`${fieldClass} resize-y text-sm`}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refine}
              disabled={isPending || !feedback.trim()}
            >
              {isPending && <Loader2 className="animate-spin" />}
              {isPending ? 'Revising...' : 'Refine'}
            </Button>
            <Button size="sm" onClick={() => onInsert(text)} disabled={isPending}>
              Insert
            </Button>
          </div>
        </>
      )}

      {error && (
        <p className="text-destructive text-sm" role="alert">
          ❌ {error}
        </p>
      )}
    </div>
  );
}

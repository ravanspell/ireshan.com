"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useTransition
} from "react";
import { saveArticleAction } from "@/app/actions/artical";
import type { OutputData } from "@editorjs/editorjs";
import { useIsMounted } from "@/utils/hooks/useMounted";
import { Button } from "@/components/atoms/button";
import TagInput from "@molecules/TagInput/TagInput";
import { loadEditorTools } from "@lib/editor-tools";
import { slugify } from "@lib/slug";
import { uploadMedia } from "@lib/media-upload";

interface EditorJSInstance {
    destroy: () => void;
    save: () => Promise<OutputData>;
    render: (data: OutputData) => Promise<void>;
}

// Shared by the title and slug inputs, and matched by `TagInput`'s wrapper.
const fieldClass =
    "w-full rounded-md border border-input bg-field px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50";

interface EditorClientProps {
    /** Present when editing an existing post; absent when drafting a new one. */
    articleId?: string;
    initialTitle?: string;
    initialSlug?: string;
    initialPublished?: boolean;
    /** Tag names already on the post. */
    initialTags?: string[];
    /** Every tag that exists, for autocomplete. */
    tagSuggestions?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any;
}

export default function EditorClient({
    articleId,
    initialTitle = "",
    initialSlug = "",
    initialPublished = false,
    initialTags = [],
    tagSuggestions = [],
    initialData,
}: EditorClientProps) {
    const isMounted = useIsMounted();
    const editorRef = useRef<EditorJSInstance | null>(null);
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
    const [saveError, setSaveError] = useState<string | null>(null);
    const [title, setTitle] = useState(initialTitle);
    const [slug, setSlug] = useState(initialSlug);
    const [tags, setTags] = useState<string[]>(initialTags);
    // Stops deriving from the title once the author edits the slug by hand, so
    // renaming a published post doesn't silently change its URL.
    const [slugTouched, setSlugTouched] = useState(Boolean(initialSlug));

    // The Editor.js upload tools only show a generic "upload failed" toast, so
    // the reason (wrong type, too large, signed out) is surfaced here instead.
    const [uploadError, setUploadError] = useState<string | null>(null);

    const reportUploadErrors = useCallback(
        async <T,>(upload: Promise<T>): Promise<T> => {
            setUploadError(null);
            try {
                return await upload;
            } catch (error) {
                setUploadError(error instanceof Error ? error.message : "Upload failed");
                throw error;
            }
        },
        [],
    );

    const onTitleChange = (value: string) => {
        setTitle(value);
        if (!slugTouched) setSlug(slugify(value));
    };

    // Memoised on `initialData` alone: every other value it closes over is a
    // module import or a ref. Without this the function identity changed on
    // each render, so listing it as an effect dependency would tear down and
    // rebuild the editor continuously.
    const initiateEditorJs = useCallback(async () => {
        const EditorJS = (await import("@editorjs/editorjs")).default;

        const editor = new EditorJS({
            holder: "editorjs",
            autofocus: true,
            placeholder: "Start writing your story...",
            // Editor.js's default is 300px of click-to-append space below the
            // last block, which reads as a broken empty panel.
            minHeight: 80,
            data: initialData,
            // Shared with `CMSViewer` so a block type that saves here is always
            // a block type the public post page can render.
            tools: await loadEditorTools({
                imageUploader: {
                    async uploadByFile(file: Blob) {
                        const url = await reportUploadErrors(uploadMedia(file));
                        return { success: 1, file: { url } };
                    },
                }
            }),
            onReady: () => {
                editorRef.current = editor;
            },
        });
    }, [initialData, reportUploadErrors]);

    useEffect(() => {
        if (!isMounted) return;

        if (!editorRef.current) {
            initiateEditorJs()
        }

        return () => {
            editorRef.current?.destroy();
            editorRef.current = null;
        };
    }, [initiateEditorJs, isMounted]);

    const save = async (published: boolean) => {
        const trimmedTitle = title.trim();
        const finalSlug = (slug || slugify(trimmedTitle)).trim();

        if (!trimmedTitle || !finalSlug) {
            setSaveError("Title and slug are both required.");
            setStatus("error");
            return;
        }

        try {
            const outputData = await editorRef.current?.save();
            if (!outputData) return;

            setStatus("saving");

            // call the server action (runs on server)
            startTransition(async () => {
                const result = await saveArticleAction({
                    id: articleId,
                    title: trimmedTitle,
                    slug: finalSlug,
                    content: outputData,
                    published,
                    tagNames: tags,
                });

                if (!result?.success) {
                    // Field errors come back from Zod, `error` from a domain failure.
                    const message = result?.errors
                        ? Object.values(result.errors).join(", ")
                        : result?.error;
                    console.error("Saving failed:", message);
                    setSaveError(message ?? "Unknown error");
                    setStatus("error");
                    return;
                }

                setSaveError(null);
                // Both come back normalised by the server - the slug may have
                // been derived, and tag names resolve to whatever spelling the
                // existing tag rows use.
                setSlug(result.data.slug);
                setTags(result.data.tags.map((tag) => tag.name));
                setStatus("done");
            });
        } catch (error) {
            console.error("Saving failed:", error);
            setSaveError(error instanceof Error ? error.message : "Unknown error");
            setStatus("error");
        }
    };

    return (
        <div className="w-full space-y-5">
            <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="post-title">
                    Title
                </label>
                <input
                    id="post-title"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Post title"
                    className={`${fieldClass} text-lg font-medium`}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="post-slug">
                    Slug (/blog/..)
                </label>
                <div className="flex items-center gap-2">
                    <input
                        id="post-slug"
                        value={slug}
                        onChange={(e) => {
                            setSlugTouched(true);
                            setSlug(slugify(e.target.value));
                        }}
                        placeholder="post-slug"
                        className={`${fieldClass} min-w-0 flex-1 font-mono text-sm`}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="post-tags">
                    Tags
                </label>
                <TagInput
                    id="post-tags"
                    value={tags}
                    onChange={setTags}
                    suggestions={tagSuggestions}
                    disabled={isPending}
                />
            </div>

            <div
                id="editorjs"
                className="bg-field text-foreground min-h-64 rounded-md border border-input py-6 pr-4 pl-4 min-[651px]:pr-6 min-[651px]:pl-18"
            />

            {uploadError && (
                <p className="text-destructive text-sm" role="alert">
                    ❌ Upload failed: {uploadError}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <Button disabled={isPending} onClick={() => save(true)}>
                    {isPending ? "Saving..." : initialPublished ? "Update" : "Publish"}
                </Button>
                <Button variant="outline" disabled={isPending} onClick={() => save(false)}>
                    Save draft
                </Button>
            </div>

            {status === "done" && <p className="text-sm text-green-500">✅ Saved successfully!</p>}
            {status === "error" && (
                <p className="text-destructive text-sm">❌ Save failed{saveError ? `: ${saveError}` : "."}</p>
            )}
        </div>
    );
}

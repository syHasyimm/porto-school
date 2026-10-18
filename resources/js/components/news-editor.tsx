import { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';
import type Quill from 'quill';

type NewsEditorProps = {
    content?: string;
    contentHtml?: string | null;
};

export function NewsEditor({ content = '', contentHtml }: NewsEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [plainText, setPlainText] = useState(content);
    const [html, setHtml] = useState(contentHtml ?? '');

    useEffect(() => {
        let editor: Quill | null = null;
        let active = true;
        let syncContent: (() => void) | null = null;

        void import('quill').then(({ default: QuillEditor }) => {
            if (!active || !editorRef.current) {
                return;
            }

            const container = document.createElement('div');
            editorRef.current.appendChild(container);

            editor = new QuillEditor(container, {
                theme: 'snow',
                placeholder: 'Tulis isi berita di sini...',
                formats: [
                    'header',
                    'bold',
                    'italic',
                    'underline',
                    'list',
                    'blockquote',
                    'link',
                ],
                modules: {
                    toolbar: [
                        [{ header: [2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['blockquote', 'link'],
                        ['clean'],
                    ],
                },
            });

            editor.root.id = 'content-editor';
            editor.root.setAttribute('aria-labelledby', 'content-label');
            editor.root.setAttribute('aria-required', 'true');

            if (contentHtml) {
                editor.clipboard.dangerouslyPasteHTML(contentHtml, 'silent');
            } else if (content) {
                editor.setText(content, 'silent');
            }

            syncContent = () => {
                if (!editor) {
                    return;
                }

                const text = editor.getText().trim();
                setPlainText(text);
                setHtml(text ? editor.getSemanticHTML().trim() : '');
            };

            syncContent();
            editor.on('text-change', syncContent);
        });

        return () => {
            active = false;

            if (editor && syncContent) {
                editor.off('text-change', syncContent);
            }

            editorRef.current?.replaceChildren();
        };
    }, [content, contentHtml]);

    return (
        <div className="news-quill overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-brand-500 focus-within:ring-3 focus-within:ring-brand-500/15">
            <div ref={editorRef} />
            <input type="hidden" name="content" value={plainText} />
            <input type="hidden" name="content_html" value={html} />
        </div>
    );
}

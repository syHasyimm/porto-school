import { X } from 'lucide-react';
import { useEffect, useRef, type PropsWithChildren, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type DialogProps = PropsWithChildren<{
    description?: string;
    footer?: ReactNode;
    open: boolean;
    title: string;
    onClose: () => void;
}>;

export function Dialog({ children, description, footer, open, title, onClose }: DialogProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        closeButtonRef.current?.focus();

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [onClose, open]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" role="presentation">
            <button
                type="button"
                aria-label="Tutup dialog"
                className="absolute inset-0 bg-slate-950/55"
                onClick={onClose}
            />
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
                className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 id="dialog-title" className="font-heading text-xl font-bold text-slate-950">
                            {title}
                        </h2>
                        {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
                    </div>
                    <Button
                        ref={closeButtonRef}
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Tutup"
                        onClick={onClose}
                    >
                        <X aria-hidden="true" className="size-5" />
                    </Button>
                </div>
                <div className="mt-5">{children}</div>
                {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
            </section>
        </div>
    );
}

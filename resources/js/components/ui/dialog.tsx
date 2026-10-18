import { X } from 'lucide-react';
import { useEffect, useId, useRef, type PropsWithChildren, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DialogProps = PropsWithChildren<{
    description?: string;
    footer?: ReactNode;
    open: boolean;
    size?: 'default' | 'lg';
    title: string;
    onClose: () => void;
}>;

export function Dialog({ children, description, footer, open, size = 'default', title, onClose }: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!open || !dialog) {
            return;
        }

        const previouslyFocused = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();

        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
                previouslyFocused.focus({ preventScroll: true });
            }
        };
    }, [open]);

    if (!open) {
        return null;
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={cn(
                'fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-xl bg-white p-6 text-slate-950 shadow-2xl backdrop:bg-slate-950/55',
                size === 'lg' ? 'max-w-2xl' : 'max-w-md',
            )}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target !== event.currentTarget) {
                    return;
                }

                const bounds = event.currentTarget.getBoundingClientRect();
                if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
                    onClose();
                }
            }}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 id={titleId} className="font-heading text-xl font-bold text-slate-950">
                        {title}
                    </h2>
                    {description && <p id={descriptionId} className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
                </div>
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    aria-label="Tutup"
                    onClick={onClose}
                >
                    <X aria-hidden="true" className="size-5" />
                </Button>
            </div>
            <div className="mt-5">{children}</div>
            {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
        </dialog>
    );
}

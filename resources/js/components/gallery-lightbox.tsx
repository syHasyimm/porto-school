import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { EditorialImage } from '@/components/editorial-image';
import type { GalleryItem } from '@/types';

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        zIndex: 1,
    }),
    center: { x: 0, zIndex: 1 },
    exit: (direction: number) => ({
        x: direction > 0 ? '-100%' : '100%',
        zIndex: 0,
    }),
};

export function GalleryLightbox({
    items,
    initialIndex,
    onClose,
}: {
    items: GalleryItem[];
    initialIndex: number;
    onClose: () => void;
}) {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [slideDirection, setSlideDirection] = useState(1);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);
    const shouldReduceMotion = useReducedMotion();
    const selected = items[activeIndex];
    const controlClass =
        'grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const trigger =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();
        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            trigger?.focus({ preventScroll: true });
        };
    }, []);

    function changePhoto(direction: number) {
        setSlideDirection(direction);
        setActiveIndex(
            (current) => (current + direction + items.length) % items.length,
        );
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'Tab') {
            const first = closeRef.current;
            const last = nextRef.current ?? first;
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            changePhoto(-1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            changePhoto(1);
        }
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="gallery-image-title"
            aria-describedby="gallery-image-position"
            onKeyDown={handleKeyDown}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
            className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-6xl overflow-y-auto overscroll-contain rounded-3xl border-0 bg-[#152033] p-0 text-white shadow-2xl backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm"
        >
            <div className="animate-in duration-200 zoom-in-95 fade-in motion-reduce:animate-none">
                <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <p
                        id="gallery-image-position"
                        className="text-xs leading-5 text-white/65"
                    >
                        <span className="font-bold text-white tabular-nums">
                            {activeIndex + 1} / {items.length}
                        </span>
                        <span className="ml-2">foto di halaman ini</span>
                    </p>
                    <button
                        ref={closeRef}
                        type="button"
                        aria-label="Tutup foto"
                        onClick={onClose}
                        className={controlClass}
                    >
                        <X aria-hidden="true" className="size-5" />
                    </button>
                </header>
                <figure>
                    <div className="relative h-[55dvh] max-h-152 overflow-hidden bg-[#101a2b] sm:h-[65dvh]">
                        <AnimatePresence
                            initial={false}
                            custom={slideDirection}
                        >
                            <motion.div
                                key={selected.id}
                                custom={slideDirection}
                                variants={slideVariants}
                                initial={shouldReduceMotion ? false : 'enter'}
                                animate="center"
                                exit={shouldReduceMotion ? undefined : 'exit'}
                                transition={
                                    shouldReduceMotion
                                        ? { duration: 0 }
                                        : {
                                              x: {
                                                  type: 'spring',
                                                  stiffness: 240,
                                                  damping: 28,
                                                  mass: 0.8,
                                              },
                                              opacity: { duration: 0.2 },
                                          }
                                }
                                className="absolute inset-0"
                            >
                                <EditorialImage
                                    src={selected.image_url}
                                    alt={selected.title}
                                    kind="gallery"
                                    loading="eager"
                                    className="size-full object-contain"
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <figcaption className="flex flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-6">
                        <div
                            className="min-w-0 flex-1"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            <p className="text-[11px] font-semibold text-white/60">
                                {selected.category || 'Dokumentasi sekolah'}
                            </p>
                            <h2
                                id="gallery-image-title"
                                className="mt-1.5 font-heading text-base leading-7 font-bold text-pretty sm:text-xl"
                            >
                                {selected.title}
                            </h2>
                        </div>
                        {items.length > 1 && (
                            <div className="flex shrink-0 gap-2">
                                <button
                                    type="button"
                                    aria-label="Foto sebelumnya"
                                    onClick={() => changePhoto(-1)}
                                    className={controlClass}
                                >
                                    <ChevronLeft
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </button>
                                <button
                                    ref={nextRef}
                                    type="button"
                                    aria-label="Foto berikutnya"
                                    onClick={() => changePhoto(1)}
                                    className={controlClass}
                                >
                                    <ChevronRight
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </button>
                            </div>
                        )}
                    </figcaption>
                </figure>
            </div>
        </dialog>
    );
}

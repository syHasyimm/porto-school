import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
} from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { MediaImage } from '@/components/media-image';
import { Button } from '@/components/ui/button';
import { index as galleryIndex } from '@/routes/gallery';
import type { GalleryItem } from '@/types';

export function HomeGalleryCarousel({ items }: { items: GalleryItem[] }) {
    const trackId = useId();
    const track = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [hasFocus, setHasFocus] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false);
    const reducedMotion = useReducedMotion();
    const canLoop = items.length > 1;
    const isPaused = isHovered || hasFocus || isInteracting || isManuallyPaused;
    const cardWidthClass =
        items.length === 1
            ? 'basis-full'
            : items.length === 2
              ? 'basis-full sm:basis-[calc((100%-1rem)/2)]'
              : items.length === 3
                ? 'basis-full sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]'
                : 'basis-full sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-3rem)/4)]';

    function cycleWidth(): number {
        const cards = track.current?.querySelectorAll<HTMLElement>(
            '[data-gallery-card]',
        );

        return cards && cards.length > items.length
            ? cards[items.length].offsetLeft - cards[0].offsetLeft
            : 0;
    }

    function normalizeScroll(): void {
        if (!track.current || !canLoop) {
            return;
        }

        const width = cycleWidth();

        if (width === 0) {
            return;
        }

        if (track.current.scrollLeft >= width * 2) {
            track.current.scrollLeft -= width;
        } else if (track.current.scrollLeft <= 0) {
            track.current.scrollLeft += width;
        }
    }

    function goToCard(direction: -1 | 1): void {
        const cards = track.current?.querySelectorAll<HTMLElement>(
            '[data-gallery-card]',
        );

        if (!track.current || !cards || cards.length < 2 || !canLoop) {
            return;
        }

        track.current.scrollBy({
            left: direction * (cards[1].offsetLeft - cards[0].offsetLeft),
            behavior: reducedMotion ? 'instant' : 'smooth',
        });
    }

    useEffect(() => {
        if (!track.current || !canLoop) {
            return;
        }

        const currentTrack = track.current;
        let previousWidth = 0;
        const observer = new ResizeObserver(() => {
            if (currentTrack.clientWidth !== previousWidth) {
                previousWidth = currentTrack.clientWidth;
                currentTrack.scrollLeft = cycleWidth();
            }
        });

        observer.observe(currentTrack);

        return () => observer.disconnect();
    }, [canLoop, items]);

    useEffect(() => {
        if (!track.current || !canLoop) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 },
        );

        observer.observe(track.current);

        return () => observer.disconnect();
    }, [canLoop]);

    useEffect(() => {
        if (
            !track.current ||
            !canLoop ||
            reducedMotion ||
            isPaused ||
            !isVisible
        ) {
            return;
        }

        let frameId: number;
        let previousTime: number | null = null;

        function animate(time: number): void {
            if (track.current && previousTime !== null) {
                track.current.scrollLeft +=
                    Math.min(time - previousTime, 64) * 0.035;
                normalizeScroll();
            }

            previousTime = time;
            frameId = requestAnimationFrame(animate);
        }

        frameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frameId);
    }, [canLoop, isPaused, isVisible, items, reducedMotion]);

    if (items.length === 0) {
        return null;
    }

    return (
        <div
            role="region"
            aria-label="Cerita dalam gambar"
            aria-roledescription="carousel"
            className="mt-7"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocusCapture={() => setHasFocus(true)}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setHasFocus(false);
                }
            }}
        >
            <p className="sr-only">
                Geser untuk melihat cerita lainnya. Gerakan otomatis berhenti
                saat kartu atau tombol mendapat fokus.
            </p>
            <div
                ref={track}
                id={trackId}
                onScroll={normalizeScroll}
                onPointerDown={() => setIsInteracting(true)}
                onPointerUp={() => setIsInteracting(false)}
                onPointerCancel={() => setIsInteracting(false)}
                className="relative flex [scrollbar-width:none] gap-4 overflow-x-auto overscroll-x-contain rounded-2xl [&::-webkit-scrollbar]:hidden"
            >
                {(canLoop ? [0, 1, 2] : [1]).flatMap((copy) =>
                    items.map((item) => (
                        <article
                            key={`${copy}-${item.id}`}
                            data-gallery-card
                            aria-hidden={canLoop && copy !== 1}
                            className={`min-w-0 shrink-0 ${cardWidthClass}`}
                        >
                            <Link
                                href={galleryIndex(
                                    item.category
                                        ? { query: { category: item.category } }
                                        : undefined,
                                )}
                                tabIndex={canLoop && copy !== 1 ? -1 : 0}
                                aria-label={`Lihat galeri ${item.category ?? 'sekolah'}: ${item.title}`}
                                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#dce3ed] bg-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-600"
                            >
                                <div className="overflow-hidden bg-[#e7edf3]">
                                    <MediaImage
                                        src={item.image_url}
                                        alt={item.title}
                                        fallbackLabel="Foto galeri belum tersedia"
                                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025] motion-reduce:transition-none"
                                    />
                                </div>
                                <div className="flex flex-1 items-end justify-between gap-3 p-5">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-brand-700">
                                            {item.category ?? 'Tanpa kategori'}
                                        </p>
                                        <h3 className="mt-2 line-clamp-2 font-heading text-lg leading-snug font-bold tracking-tight text-slate-900">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <ArrowUpRight
                                        aria-hidden="true"
                                        className="size-5 shrink-0 text-brand-600 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                                    />
                                </div>
                            </Link>
                        </article>
                    )),
                )}
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-900">
                        {String(items.length).padStart(2, '0')}
                    </span>{' '}
                    cerita pilihan
                </p>
                <div className="flex gap-2">
                    {canLoop && !reducedMotion && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="size-11 rounded-full border-brand-700/20 text-brand-700"
                            aria-label={
                                isManuallyPaused
                                    ? 'Putar cerita otomatis'
                                    : 'Jeda cerita otomatis'
                            }
                            aria-pressed={isManuallyPaused}
                            onClick={() =>
                                setIsManuallyPaused(!isManuallyPaused)
                            }
                        >
                            {isManuallyPaused ? (
                                <Play aria-hidden="true" className="size-5" />
                            ) : (
                                <Pause aria-hidden="true" className="size-5" />
                            )}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="size-11 rounded-full border-brand-700/20 text-brand-700"
                        aria-label="Cerita sebelumnya"
                        aria-controls={trackId}
                        disabled={!canLoop}
                        onClick={() => goToCard(-1)}
                    >
                        <ChevronLeft aria-hidden="true" className="size-5" />
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="size-11 rounded-full border-brand-700/20 text-brand-700"
                        aria-label="Cerita berikutnya"
                        aria-controls={trackId}
                        disabled={!canLoop}
                        onClick={() => goToCard(1)}
                    >
                        <ChevronRight aria-hidden="true" className="size-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

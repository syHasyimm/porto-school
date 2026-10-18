import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, GalleryHorizontalEnd } from 'lucide-react';
import { useState } from 'react';
import { EditorialImage } from '@/components/editorial-image';
import { EmptyState } from '@/components/empty-state';
import { GalleryLightbox } from '@/components/gallery-lightbox';
import { Pagination } from '@/components/pagination';
import PublicLayout from '@/layouts/public-layout';
import { cn } from '@/lib/utils';
import { index } from '@/routes/gallery';
import type { GalleryItem, Paginated } from '@/types';

type PublicGalleryProps = {
    categories: string[];
    filters: { category: string };
    items: Paginated<GalleryItem>;
};

export default function PublicGallery(props: PublicGalleryProps) {
    return (
        <PublicLayout>
            <Head title="Galeri Sekolah">
                <meta
                    name="description"
                    content="Dokumentasi kegiatan, fasilitas, dan pencapaian warga sekolah."
                />
            </Head>
            <GalleryView
                key={`${props.filters.category}:${props.items.current_page}`}
                {...props}
            />
        </PublicLayout>
    );
}

function GalleryView({ categories, filters, items }: PublicGalleryProps) {
    const { name } = usePage().props;
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    function tileSize(itemIndex: number): string {
        const groupSize = Math.min(
            6,
            items.data.length - Math.floor(itemIndex / 6) * 6,
        );
        const position = itemIndex % 6;
        const tabletColumn =
            groupSize === 6 && position === 5
                ? 'sm:col-span-2'
                : 'sm:col-span-1';

        if (groupSize === 1) {
            return 'sm:col-span-2 lg:col-span-12 lg:row-span-2';
        }

        if (groupSize === 2) {
            return 'sm:col-span-1 lg:col-span-6 lg:row-span-2';
        }

        if (position === 0) {
            return 'sm:col-span-2 lg:col-span-8 lg:row-span-2';
        }

        if (position === 3 && groupSize === 4) {
            return 'sm:col-span-2 lg:col-span-12';
        }

        if (position >= 3 && groupSize === 5) {
            return `${tabletColumn} lg:col-span-6`;
        }

        return `${tabletColumn} lg:col-span-4`;
    }

    return (
        <>
            <main data-entrance="blocks" className="bg-[#f8f7f3]">
                <header className="border-b border-[#e6e5e0]">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-8 px-4 pt-12 pb-10 sm:px-6 lg:px-8 lg:pt-16 lg:pb-14">
                        <div data-reveal="left">
                            <p className="text-sm font-bold text-brand-700">
                                Dokumentasi sekolah
                            </p>
                            <h1 className="mt-3 max-w-2xl font-heading text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-balance text-slate-950">
                                Cerita dalam gambar
                                <span className="text-brand-700">.</span>
                            </h1>
                            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                                Potret kegiatan dan keseharian warga {name}.
                                Pilih foto untuk melihat ceritanya lebih dekat.
                            </p>
                        </div>
                        <p
                            data-reveal="right"
                            className="hidden items-center gap-2 text-xs font-medium text-slate-500 md:inline-flex"
                        >
                            <GalleryHorizontalEnd
                                aria-hidden="true"
                                className="size-4 text-brand-700"
                            />
                            Dokumentasi dalam foto
                        </p>
                    </div>
                </header>
                <section
                    aria-label="Koleksi foto sekolah"
                    className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8 lg:pt-10 lg:pb-24"
                >
                    <div
                        data-reveal
                        className="mb-7 flex flex-wrap items-center justify-between gap-5 lg:mb-9"
                    >
                        <nav
                            className="flex flex-wrap gap-2"
                            aria-label="Filter kategori galeri"
                        >
                            {[
                                { value: '', label: 'Semua foto' },
                                ...categories.map((category) => ({
                                    value: category,
                                    label: category,
                                })),
                            ].map((category) => {
                                const active =
                                    category.value === filters.category;
                                return (
                                    <Link
                                        key={category.value}
                                        href={index({
                                            query: {
                                                category:
                                                    category.value || undefined,
                                            },
                                        })}
                                        preserveScroll
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                        className={cn(
                                            'inline-flex min-h-11 items-center rounded-full border px-5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 data-loading:opacity-60',
                                            active
                                                ? 'border-brand-700 bg-brand-700 text-white'
                                                : 'border-[#dce1ea] bg-white text-slate-600 hover:border-brand-700/30 hover:bg-brand-50 hover:text-brand-700',
                                        )}
                                    >
                                        {category.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <p
                            role="status"
                            className="text-xs leading-6 text-slate-500"
                        >
                            <span className="font-bold text-slate-800 tabular-nums">
                                {items.total}
                            </span>{' '}
                            foto
                            {filters.category
                                ? ` dalam kategori ${filters.category}`
                                : ' dalam galeri'}
                        </p>
                    </div>
                    {items.data.length === 0 ? (
                        <div
                            data-reveal="scale"
                            className="rounded-3xl border border-dashed border-[#d4dce8] bg-white py-8"
                        >
                            <EmptyState
                                icon={GalleryHorizontalEnd}
                                title="Belum ada foto"
                                description="Dokumentasi sekolah akan tampil di sini setelah ditambahkan."
                            />
                        </div>
                    ) : (
                        <>
                            <ol className="grid auto-rows-[18rem] gap-3 sm:auto-rows-[16rem] sm:grid-cols-2 lg:auto-rows-[13.5rem] lg:grid-cols-12 lg:gap-4">
                                {items.data.map((item, itemIndex) => (
                                    <li
                                        data-reveal="scale"
                                        key={item.id}
                                        className={cn(
                                            'min-w-0',
                                            tileSize(itemIndex),
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedIndex(itemIndex)
                                            }
                                            aria-label={`Buka foto ${item.title}`}
                                            className="group relative block size-full overflow-hidden rounded-xl bg-[#eae9e3] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                                            aria-haspopup="dialog"
                                        >
                                            {items.data.length === 1 && (
                                                <img
                                                    src={item.image_url}
                                                    alt=""
                                                    aria-hidden="true"
                                                    className="absolute inset-0 size-full scale-110 object-cover blur-3xl brightness-75"
                                                />
                                            )}
                                            <EditorialImage
                                                src={item.image_url}
                                                alt={item.title}
                                                kind="gallery"
                                                loading={
                                                    itemIndex === 0
                                                        ? 'eager'
                                                        : 'lazy'
                                                }
                                                className={cn(
                                                    'size-full transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transform-none',
                                                    items.data.length === 1
                                                        ? 'relative object-contain'
                                                        : 'object-cover',
                                                )}
                                            />
                                            <span
                                                aria-hidden="true"
                                                className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-slate-950/10 transition-colors duration-300 group-hover:from-slate-950/95"
                                            />
                                            <span className="absolute top-5 left-5 text-[11px] font-bold tracking-[0.16em] text-white/85 tabular-nums sm:top-6 sm:left-6">
                                                {String(
                                                    (items.from ?? 1) +
                                                        itemIndex,
                                                ).padStart(2, '0')}{' '}
                                                /{' '}
                                                {String(items.total).padStart(
                                                    2,
                                                    '0',
                                                )}
                                            </span>
                                            <span className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 text-white sm:right-6 sm:bottom-6 sm:left-6">
                                                <span className="max-w-xl min-w-0">
                                                    <span className="text-[11px] font-semibold tracking-[0.12em] text-white/75 uppercase">
                                                        {item.category ||
                                                            'Dokumentasi sekolah'}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'mt-1.5 block font-heading leading-tight font-bold tracking-tight text-pretty',
                                                            itemIndex % 6 ===
                                                                0 &&
                                                                items.data
                                                                    .length !==
                                                                    2
                                                                ? 'text-2xl sm:text-3xl lg:text-4xl'
                                                                : 'text-xl sm:text-2xl',
                                                        )}
                                                    >
                                                        {item.title}
                                                    </span>
                                                </span>
                                                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/55 bg-white/10 backdrop-blur-sm transition-colors duration-300 group-hover:bg-white group-hover:text-slate-950 sm:size-11">
                                                    <ArrowUpRight
                                                        aria-hidden="true"
                                                        className="size-5"
                                                    />
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ol>
                            {items.last_page > 1 && (
                                <div
                                    data-reveal
                                    className="mt-12 overflow-hidden rounded-2xl border border-[#dce3ee] bg-white"
                                >
                                    <Pagination
                                        from={items.from}
                                        to={items.to}
                                        total={items.total}
                                        links={items.links}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
            {selectedIndex !== null && (
                <GalleryLightbox
                    items={items.data}
                    initialIndex={selectedIndex}
                    onClose={() => setSelectedIndex(null)}
                />
            )}
        </>
    );
}

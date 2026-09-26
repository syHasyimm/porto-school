import { Head, Link } from '@inertiajs/react';
import { GalleryHorizontalEnd, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { PageTransition } from '@/components/page-transition';
import { Pagination } from '@/components/pagination';
import { buttonVariants } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { index } from '@/routes/gallery';
import type { GalleryItem, Paginated } from '@/types';

type PublicGalleryProps = {
    categories: string[];
    filters: { category: string };
    items: Paginated<GalleryItem>;
};

export default function PublicGallery({
    categories,
    filters,
    items,
}: PublicGalleryProps) {
    const [selected, setSelected] = useState<GalleryItem | null>(null);

    useEffect(() => {
        if (!selected) {
            return;
        }

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelected(null);
            }
        };

        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [selected]);

    return (
        <PublicLayout>
            <Head title="Galeri Sekolah" />
            <PageTransition>
                <section className="border-b border-slate-200 bg-slate-50">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                        <p className="text-sm font-bold text-brand-600">
                            Dokumentasi sekolah
                        </p>
                        <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Galeri SD Negeri 001 Kepenuhan
                        </h1>
                        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                            Momen kegiatan, fasilitas, dan pencapaian warga
                            sekolah dalam rangkaian foto.
                        </p>
                    </div>
                </section>
                <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    <nav
                        className="mb-8 flex flex-wrap gap-2"
                        aria-label="Filter kategori galeri"
                    >
                        <Link
                            href={index()}
                            className={buttonVariants({
                                size: 'sm',
                                variant: filters.category
                                    ? 'secondary'
                                    : 'primary',
                            })}
                        >
                            Semua
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category}
                                href={index({ query: { category } })}
                                className={buttonVariants({
                                    size: 'sm',
                                    variant:
                                        filters.category === category
                                            ? 'primary'
                                            : 'secondary',
                                })}
                            >
                                {category}
                            </Link>
                        ))}
                    </nav>

                    {items.data.length === 0 ? (
                        <EmptyState
                            icon={GalleryHorizontalEnd}
                            title="Belum ada foto"
                            description="Dokumentasi sekolah akan tampil di sini setelah ditambahkan."
                        />
                    ) : (
                        <>
                            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
                                {items.data.map((item, itemIndex) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSelected(item)}
                                        className="group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-xl bg-slate-100 text-left"
                                    >
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            className={`w-full object-cover transition duration-300 group-hover:scale-[1.02] ${itemIndex % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[4/3]'}`}
                                        />
                                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-5 pt-14 pb-4 text-white">
                                            <span className="block font-heading text-base font-bold">
                                                {item.title}
                                            </span>
                                            {item.category && (
                                                <span className="mt-1 block text-xs font-semibold text-white/75">
                                                    {item.category}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <Pagination
                                    from={items.from}
                                    to={items.to}
                                    total={items.total}
                                    links={items.links}
                                />
                            </div>
                        </>
                    )}
                </main>
            </PageTransition>

            {selected && (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 p-4 sm:p-8"
                    role="dialog"
                    aria-modal="true"
                    aria-label={selected.title}
                >
                    <button
                        type="button"
                        aria-label="Tutup gambar"
                        className="absolute inset-0"
                        onClick={() => setSelected(null)}
                    />
                    <figure className="relative z-10 max-h-full max-w-6xl">
                        <img
                            src={selected.image_url}
                            alt={selected.title}
                            className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl"
                        />
                        <figcaption className="mt-3 text-center text-sm font-semibold text-white">
                            {selected.title}
                            {selected.category ? ` · ${selected.category}` : ''}
                        </figcaption>
                    </figure>
                    <button
                        type="button"
                        aria-label="Tutup"
                        onClick={() => setSelected(null)}
                        className="absolute top-4 right-4 z-20 grid size-11 place-items-center rounded-full bg-white text-slate-950 shadow-lg sm:top-6 sm:right-6"
                    >
                        <X className="size-5" />
                    </button>
                </div>
            )}
        </PublicLayout>
    );
}

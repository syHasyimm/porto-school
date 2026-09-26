import { Form, Head, Link } from '@inertiajs/react';
import {
    GalleryHorizontalEnd,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Pagination } from '@/components/pagination';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { create, destroy, edit, index } from '@/routes/admin/gallery';
import type { GalleryItem, Paginated } from '@/types';

type GalleryIndexProps = {
    categories: string[];
    filters: { category: string; search: string };
    items: Paginated<GalleryItem>;
};

export default function GalleryIndex({
    categories,
    filters,
    items,
}: GalleryIndexProps) {
    const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);

    return (
        <AdminLayout active="gallery" title="Galeri">
            <Head title="Galeri" />
            <PageTransition>
                <PageHeader
                    title="Galeri sekolah"
                    description="Kelola dokumentasi visual yang tampil pada galeri publik."
                    action={
                        <Link href={create()} className={buttonVariants()}>
                            <Plus className="size-4" /> Tambah foto
                        </Link>
                    }
                />
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <Form
                            action={index()}
                            className="grid gap-2 sm:grid-cols-[1fr_12rem_auto_auto]"
                        >
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="Cari judul foto"
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                name="category"
                                defaultValue={filters.category}
                            >
                                <option value="">Semua kategori</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </Select>
                            <Button type="submit" variant="secondary">
                                Terapkan
                            </Button>
                            {(filters.search || filters.category) && (
                                <Link
                                    href={index()}
                                    className={buttonVariants({
                                        variant: 'ghost',
                                    })}
                                >
                                    Reset
                                </Link>
                            )}
                        </Form>
                    </div>

                    {items.data.length === 0 ? (
                        <EmptyState
                            icon={GalleryHorizontalEnd}
                            title="Foto tidak ditemukan"
                            description="Tambahkan foto baru atau ubah filter pencarian."
                            action={
                                !filters.search && !filters.category ? (
                                    <Link
                                        href={create()}
                                        className={buttonVariants()}
                                    >
                                        <Plus className="size-4" /> Tambah foto
                                    </Link>
                                ) : undefined
                            }
                        />
                    ) : (
                        <>
                            <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
                                {items.data.map((item) => (
                                    <article
                                        key={item.id}
                                        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                                    >
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            className="aspect-[16/10] w-full object-cover"
                                        />
                                        <div className="flex items-start justify-between gap-4 p-4">
                                            <div>
                                                <h2 className="font-heading text-sm font-bold text-slate-900">
                                                    {item.title}
                                                </h2>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {item.category ??
                                                        'Tanpa kategori'}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <Link
                                                    href={edit(item.id)}
                                                    className={buttonVariants({
                                                        size: 'icon',
                                                        variant: 'ghost',
                                                    })}
                                                    aria-label={`Edit ${item.title}`}
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-600 hover:bg-red-50"
                                                    aria-label={`Hapus ${item.title}`}
                                                    onClick={() =>
                                                        setItemToDelete(item)
                                                    }
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <Pagination
                                from={items.from}
                                to={items.to}
                                total={items.total}
                                links={items.links}
                            />
                        </>
                    )}
                </div>
            </PageTransition>

            <Dialog
                open={itemToDelete !== null}
                onClose={() => setItemToDelete(null)}
                title="Hapus foto?"
                description={`${itemToDelete?.title ?? 'Foto'} akan dihapus dari galeri publik.`}
                footer={
                    itemToDelete && (
                        <>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setItemToDelete(null)}
                            >
                                Batal
                            </Button>
                            <Form {...destroy.form(itemToDelete.id)}>
                                {({ processing }) => (
                                    <Button
                                        type="submit"
                                        variant="danger"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Menghapus...'
                                            : 'Hapus foto'}
                                    </Button>
                                )}
                            </Form>
                        </>
                    )
                }
            >
                <p className="text-sm text-slate-600">
                    Tindakan ini tidak dapat dibatalkan.
                </p>
            </Dialog>
        </AdminLayout>
    );
}

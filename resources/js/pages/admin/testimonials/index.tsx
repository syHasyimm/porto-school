import { Form, Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Quote, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AlumniAvatar } from '@/components/alumni-avatar';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { create, destroy, edit, index } from '@/routes/admin/testimonials';
import type { Paginated, TestimonialItem } from '@/types';

type TestimonialIndexProps = {
    items: Paginated<TestimonialItem>;
    filters: { search: string; status: string };
};

export default function TestimonialIndex({
    items,
    filters,
}: TestimonialIndexProps) {
    const [itemToDelete, setItemToDelete] = useState<TestimonialItem | null>(
        null,
    );

    return (
        <AdminLayout active="testimonials" title="Testimoni">
            <Head title="Testimoni Alumni" />
            <PageTransition>
                <PageHeader
                    title="Testimoni alumni"
                    description="Kelola cerita alumni. Maksimal enam testimoni tampil di beranda sesuai urutan yang Anda pilih."
                    action={
                        <Link href={create()} className={buttonVariants()}>
                            <Plus className="size-4" /> Tambah testimoni
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
                                <Search
                                    aria-hidden="true"
                                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                                />
                                <Input
                                    name="search"
                                    aria-label="Cari nama alumni"
                                    defaultValue={filters.search}
                                    placeholder="Cari nama alumni"
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                name="status"
                                aria-label="Filter status testimoni"
                                defaultValue={filters.status}
                            >
                                <option value="">Semua status</option>
                                <option value="published">
                                    Tampil di beranda
                                </option>
                                <option value="draft">Draft</option>
                            </Select>
                            <Button type="submit" variant="secondary">
                                Terapkan
                            </Button>
                            {(filters.search || filters.status) && (
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
                            icon={Quote}
                            title={
                                filters.search || filters.status
                                    ? 'Testimoni tidak ditemukan'
                                    : 'Belum ada testimoni'
                            }
                            description={
                                filters.search || filters.status
                                    ? 'Ubah kata pencarian atau filter status.'
                                    : 'Tambahkan cerita pertama dari alumni sekolah.'
                            }
                            action={
                                !filters.search && !filters.status ? (
                                    <Link
                                        href={create()}
                                        className={buttonVariants()}
                                    >
                                        <Plus className="size-4" /> Tambah
                                        testimoni
                                    </Link>
                                ) : undefined
                            }
                        />
                    ) : (
                        <>
                            <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                                {items.data.map((item) => (
                                    <article
                                        key={item.id}
                                        className="flex min-w-0 flex-col rounded-xl border border-slate-200 p-5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <AlumniAvatar
                                                name={item.name}
                                                photoUrl={item.photo_url}
                                                className="size-12"
                                            />
                                            <div className="min-w-0">
                                                <h2 className="font-heading text-sm font-bold break-words text-slate-900">
                                                    {item.name}
                                                </h2>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {item.graduation_year
                                                        ? `Lulusan ${item.graduation_year}`
                                                        : 'Tahun lulus belum diisi'}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-5 line-clamp-4 flex-1 text-sm leading-6 text-slate-600">
                                            {item.content}
                                        </p>
                                        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                                            <Badge
                                                variant={
                                                    item.is_published
                                                        ? 'green'
                                                        : 'neutral'
                                                }
                                            >
                                                {item.is_published
                                                    ? 'Tampil di beranda'
                                                    : 'Draft'}
                                            </Badge>
                                            <span className="text-xs text-slate-500">
                                                Urutan {item.sort_order}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3">
                                            <Link
                                                href={edit(item.id)}
                                                className={buttonVariants({
                                                    size: 'sm',
                                                    variant: 'ghost',
                                                })}
                                                aria-label={`Edit testimoni ${item.name}`}
                                            >
                                                <Pencil className="size-4" />{' '}
                                                Edit
                                            </Link>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:bg-red-50"
                                                aria-label={`Hapus testimoni ${item.name}`}
                                                onClick={() =>
                                                    setItemToDelete(item)
                                                }
                                            >
                                                <Trash2 className="size-4" />{' '}
                                                Hapus
                                            </Button>
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
                title="Hapus testimoni?"
                description={
                    itemToDelete
                        ? `Testimoni ${itemToDelete.name} akan dihapus beserta fotonya.`
                        : undefined
                }
                onClose={() => setItemToDelete(null)}
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
                            <Form
                                {...destroy.form(itemToDelete.id)}
                                onSuccess={() => setItemToDelete(null)}
                            >
                                {({ processing }) => (
                                    <Button
                                        type="submit"
                                        variant="danger"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Menghapus...'
                                            : 'Hapus testimoni'}
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

import { Form, Head, Link } from '@inertiajs/react';
import { Eye, Newspaper, Pencil, Plus, Search } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { create, edit, index, show } from '@/routes/admin/news';
import type { NewsSummary, Paginated } from '@/types';

type NewsIndexProps = {
    articles: Paginated<NewsSummary>;
    filters: { search: string; status: string };
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

export default function NewsIndex({ articles, filters }: NewsIndexProps) {
    return (
        <AdminLayout active="news" title="Berita">
            <Head title="Berita" />
            <PageTransition>
                <PageHeader
                    title="Berita sekolah"
                    description="Kelola berita terbit dan tulisan yang masih berupa draft."
                    action={
                        <Link href={create()} className={buttonVariants()}>
                            <Plus className="size-4" /> Tambah berita
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
                                    placeholder="Cari judul berita"
                                    className="pl-9"
                                />
                            </div>
                            <Select name="status" defaultValue={filters.status}>
                                <option value="">Semua status</option>
                                <option value="published">Terbit</option>
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

                    {articles.data.length === 0 ? (
                        <EmptyState
                            icon={Newspaper}
                            title="Berita tidak ditemukan"
                            description="Tambahkan berita baru atau ubah filter pencarian."
                            action={
                                !filters.search && !filters.status ? (
                                    <Link
                                        href={create()}
                                        className={buttonVariants()}
                                    >
                                        <Plus className="size-4" /> Tambah
                                        berita
                                    </Link>
                                ) : undefined
                            }
                        />
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Berita</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Publikasi</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {articles.data.map((article) => (
                                        <TableRow key={article.id}>
                                            <TableCell>
                                                <div className="flex min-w-64 items-center gap-3">
                                                    <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100">
                                                        {article.thumbnail_url ? (
                                                            <img
                                                                src={
                                                                    article.thumbnail_url
                                                                }
                                                                alt=""
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <Newspaper className="size-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">
                                                            {article.title}
                                                        </p>
                                                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                                            {article.excerpt}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        article.status ===
                                                        'published'
                                                            ? 'green'
                                                            : 'neutral'
                                                    }
                                                >
                                                    {article.status ===
                                                    'published'
                                                        ? 'Terbit'
                                                        : 'Draft'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-slate-600">
                                                {article.published_at
                                                    ? dateFormatter.format(
                                                          new Date(
                                                              article.published_at,
                                                          ),
                                                      )
                                                    : 'Belum ditentukan'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    <Link
                                                        href={show(article.id)}
                                                        className={buttonVariants(
                                                            {
                                                                size: 'icon',
                                                                variant:
                                                                    'ghost',
                                                            },
                                                        )}
                                                        aria-label={`Lihat ${article.title}`}
                                                    >
                                                        <Eye className="size-4" />
                                                    </Link>
                                                    <Link
                                                        href={edit(article.id)}
                                                        className={buttonVariants(
                                                            {
                                                                size: 'icon',
                                                                variant:
                                                                    'ghost',
                                                            },
                                                        )}
                                                        aria-label={`Edit ${article.title}`}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Pagination
                                from={articles.from}
                                to={articles.to}
                                total={articles.total}
                                links={articles.links}
                            />
                        </>
                    )}
                </div>
            </PageTransition>
        </AdminLayout>
    );
}

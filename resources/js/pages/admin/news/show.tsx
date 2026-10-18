import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ImageOff, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { NewsBody } from '@/components/news-body';
import { PageTransition } from '@/components/page-transition';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import AdminLayout from '@/layouts/admin-layout';
import { destroy, edit, index } from '@/routes/admin/news';
import type { NewsArticle } from '@/types';

type ShowNewsProps = { article: NewsArticle };

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
});

export default function ShowNews({ article }: ShowNewsProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <AdminLayout active="news" title="Detail Berita">
            <Head title={article.title} />
            <PageTransition>
                <PageHeader
                    title={article.title}
                    description={`/${article.slug}`}
                    breadcrumbs={[
                        { label: 'Berita', href: index.url() },
                        { label: article.title },
                    ]}
                    action={
                        <Link
                            href={edit(article.id)}
                            className={buttonVariants()}
                        >
                            <Pencil className="size-4" /> Edit berita
                        </Link>
                    }
                />
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <Card className="overflow-hidden">
                        {article.thumbnail_url ? (
                            <img
                                src={article.thumbnail_url}
                                alt={`Thumbnail ${article.title}`}
                                className="aspect-[16/7] w-full object-cover"
                            />
                        ) : (
                            <div className="grid aspect-[16/7] place-items-center bg-slate-100 text-slate-400">
                                <ImageOff className="size-10" />
                            </div>
                        )}
                        <article className="p-6 sm:p-8">
                            <NewsBody
                                article={article}
                                className="text-sm leading-8"
                            />
                        </article>
                    </Card>
                    <aside className="space-y-5">
                        <Card className="p-5">
                            <p className="text-xs font-bold text-slate-500">
                                Kategori
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                {article.category_label ?? 'Umum'}
                            </p>
                            <p className="mt-5 text-xs font-bold text-slate-500">
                                Status
                            </p>
                            <Badge
                                className="mt-2"
                                variant={
                                    article.status === 'published'
                                        ? 'green'
                                        : 'neutral'
                                }
                            >
                                {article.status === 'published'
                                    ? 'Terbit'
                                    : 'Draft'}
                            </Badge>
                            <p className="mt-5 text-xs font-bold text-slate-500">
                                Waktu publikasi
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-700">
                                {article.published_at
                                    ? dateFormatter.format(
                                          new Date(article.published_at),
                                      )
                                    : 'Belum ditentukan'}
                            </p>
                        </Card>
                        <Link
                            href={index()}
                            className={buttonVariants({
                                variant: 'secondary',
                                className: 'w-full',
                            })}
                        >
                            <ArrowLeft className="size-4" /> Kembali
                        </Link>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-red-600 hover:bg-red-50"
                            onClick={() => setConfirmDelete(true)}
                        >
                            <Trash2 className="size-4" /> Hapus berita
                        </Button>
                    </aside>
                </div>
            </PageTransition>
            <Dialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                title="Hapus berita?"
                description={`${article.title} akan dihapus dari sistem dan halaman publik.`}
                footer={
                    <>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setConfirmDelete(false)}
                        >
                            Batal
                        </Button>
                        <Form {...destroy.form(article.id)}>
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="danger"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Menghapus...'
                                        : 'Hapus berita'}
                                </Button>
                            )}
                        </Form>
                    </>
                }
            >
                <p className="text-sm text-slate-600">
                    Tindakan ini tidak dapat dibatalkan.
                </p>
            </Dialog>
        </AdminLayout>
    );
}

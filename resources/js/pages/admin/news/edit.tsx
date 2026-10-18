import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { NewsFields, type NewsCategoryOption } from '@/components/news-fields';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { index, show, update } from '@/routes/admin/news';
import type { NewsArticle } from '@/types';

type EditNewsProps = { article: NewsArticle; categories: NewsCategoryOption[] };

export default function EditNews({ article, categories }: EditNewsProps) {
    return (
        <AdminLayout active="news" title="Edit Berita">
            <Head title={`Edit ${article.title}`} />
            <PageTransition>
                <PageHeader
                    title="Edit berita"
                    description="Perbarui isi, thumbnail, atau waktu publikasi berita."
                    breadcrumbs={[
                        { label: 'Berita', href: index.url() },
                        { label: article.title, href: show.url(article.id) },
                        { label: 'Edit' },
                    ]}
                />
                <Form
                    {...update.form(article.id)}
                    encType="multipart/form-data"
                    className="max-w-4xl"
                >
                    {({ errors, processing, progress }) => (
                        <div className="space-y-6">
                            <Card className="p-5 sm:p-7">
                                <NewsFields
                                    article={article}
                                    categories={categories}
                                    errors={errors}
                                />
                                {progress && (
                                    <p className="mt-5 text-sm font-semibold text-brand-700">
                                        Mengunggah {progress.percentage}%
                                    </p>
                                )}
                            </Card>
                            <div className="flex justify-end gap-3">
                                <Link
                                    href={show(article.id)}
                                    className={buttonVariants({
                                        variant: 'secondary',
                                    })}
                                >
                                    <ArrowLeft className="size-4" /> Batal
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan perubahan'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </PageTransition>
        </AdminLayout>
    );
}

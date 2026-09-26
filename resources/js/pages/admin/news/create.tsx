import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { NewsFields } from '@/components/news-fields';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { index, store } from '@/routes/admin/news';

export default function CreateNews() {
    return (
        <AdminLayout active="news" title="Tambah Berita">
            <Head title="Tambah Berita" />
            <PageTransition>
                <PageHeader
                    title="Tambah berita"
                    description="Tulis kabar atau kegiatan terbaru untuk halaman publik sekolah."
                    breadcrumbs={[
                        { label: 'Berita', href: index.url() },
                        { label: 'Tambah berita' },
                    ]}
                />
                <Form
                    {...store.form()}
                    encType="multipart/form-data"
                    className="max-w-4xl"
                >
                    {({ errors, processing, progress }) => (
                        <div className="space-y-6">
                            <Card className="p-5 sm:p-7">
                                <NewsFields errors={errors} />
                                {progress && (
                                    <p className="mt-5 text-sm font-semibold text-brand-700">
                                        Mengunggah {progress.percentage}%
                                    </p>
                                )}
                            </Card>
                            <div className="flex justify-end gap-3">
                                <Link
                                    href={index()}
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
                                        : 'Simpan berita'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </PageTransition>
        </AdminLayout>
    );
}

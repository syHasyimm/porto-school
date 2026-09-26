import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { GalleryFields } from '@/components/gallery-fields';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { index, store } from '@/routes/admin/gallery';

type CreateGalleryProps = { categories: string[] };

export default function CreateGallery({ categories }: CreateGalleryProps) {
    return (
        <AdminLayout active="gallery" title="Tambah Foto">
            <Head title="Tambah Foto Galeri" />
            <PageTransition>
                <PageHeader
                    title="Tambah foto galeri"
                    description="Unggah dokumentasi kegiatan, fasilitas, atau prestasi sekolah."
                    breadcrumbs={[
                        { label: 'Galeri', href: index.url() },
                        { label: 'Tambah foto' },
                    ]}
                />
                <Form
                    {...store.form()}
                    encType="multipart/form-data"
                    className="max-w-2xl"
                >
                    {({ errors, processing, progress }) => (
                        <div className="space-y-6">
                            <Card className="p-5 sm:p-7">
                                <GalleryFields
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
                                        : 'Simpan foto'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </PageTransition>
        </AdminLayout>
    );
}

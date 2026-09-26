import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { GalleryFields } from '@/components/gallery-fields';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/gallery';
import type { GalleryItem } from '@/types';

type EditGalleryProps = { categories: string[]; item: GalleryItem };

export default function EditGallery({ categories, item }: EditGalleryProps) {
    return (
        <AdminLayout active="gallery" title="Edit Foto">
            <Head title={`Edit ${item.title}`} />
            <PageTransition>
                <PageHeader
                    title="Edit foto galeri"
                    description="Perbarui judul, kategori, atau gambar galeri."
                    breadcrumbs={[
                        { label: 'Galeri', href: index.url() },
                        { label: item.title },
                    ]}
                />
                <Form
                    {...update.form(item.id)}
                    encType="multipart/form-data"
                    className="max-w-2xl"
                >
                    {({ errors, processing, progress }) => (
                        <div className="space-y-6">
                            <Card className="p-5 sm:p-7">
                                <GalleryFields
                                    categories={categories}
                                    errors={errors}
                                    item={item}
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

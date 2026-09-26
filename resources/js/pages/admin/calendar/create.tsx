import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { AcademicEventFields } from '@/components/academic-event-fields';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { index, store } from '@/routes/admin/calendar';
import type { SelectOption } from '@/types';

type CreateEventProps = { categories: SelectOption[] };

export default function CreateEvent({ categories }: CreateEventProps) {
    return (
        <AdminLayout active="calendar" title="Tambah Agenda">
            <Head title="Tambah Agenda" />
            <PageTransition>
                <PageHeader
                    title="Tambah agenda"
                    description="Tambahkan jadwal libur, ujian, kegiatan, atau pengumuman."
                    breadcrumbs={[
                        { label: 'Kalender akademik', href: index.url() },
                        { label: 'Tambah agenda' },
                    ]}
                />
                <Form action={store()} className="max-w-3xl">
                    {({ errors, processing }) => (
                        <div className="space-y-6">
                            <Card className="p-5 sm:p-7">
                                <AcademicEventFields
                                    categories={categories}
                                    errors={errors}
                                />
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
                                    <Save className="size-4" />{' '}
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan agenda'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </PageTransition>
        </AdminLayout>
    );
}

import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { TestimonialForm } from '@/components/testimonial-form';
import AdminLayout from '@/layouts/admin-layout';
import { index } from '@/routes/admin/testimonials';

export default function CreateTestimonial() {
    return (
        <AdminLayout active="testimonials" title="Tambah Testimoni">
            <Head title="Tambah Testimoni" />
            <PageTransition>
                <PageHeader
                    title="Tambah testimoni"
                    description="Bagikan cerita alumni beserta foto dan tahun kelulusannya."
                    breadcrumbs={[
                        { label: 'Testimoni', href: index.url() },
                        { label: 'Tambah testimoni' },
                    ]}
                />
                <TestimonialForm />
            </PageTransition>
        </AdminLayout>
    );
}

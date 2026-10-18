import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { TestimonialForm } from '@/components/testimonial-form';
import AdminLayout from '@/layouts/admin-layout';
import { index } from '@/routes/admin/testimonials';
import type { TestimonialItem } from '@/types';

export default function EditTestimonial({ item }: { item: TestimonialItem }) {
    return (
        <AdminLayout active="testimonials" title="Edit Testimoni">
            <Head title={`Edit Testimoni ${item.name}`} />
            <PageTransition>
                <PageHeader
                    title="Edit testimoni"
                    description="Perbarui cerita alumni dan atur tampilannya di beranda."
                    breadcrumbs={[
                        { label: 'Testimoni', href: index.url() },
                        { label: item.name },
                    ]}
                />
                <TestimonialForm item={item} />
            </PageTransition>
        </AdminLayout>
    );
}

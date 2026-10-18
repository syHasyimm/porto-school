import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { AcademicEventFields } from '@/components/academic-event-fields';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/calendar';
import type { AcademicEvent, SelectOption } from '@/types';

type EditEventProps = {
    categories: SelectOption[];
    event: AcademicEvent;
    calendarContext: { month?: string; search?: string; category?: string };
};

export default function EditEvent({
    categories,
    event,
    calendarContext,
}: EditEventProps) {
    const action = update.form(event.id, { query: calendarContext });
    const returnToCalendar = index({ query: calendarContext });

    return (
        <AdminLayout active="calendar" title="Edit Agenda">
            <Head title={`Edit ${event.title}`} />
            <PageTransition>
                <PageHeader
                    title="Edit agenda"
                    description={`Perbarui informasi ${event.title}.`}
                    breadcrumbs={[
                        {
                            label: 'Kalender akademik',
                            href: returnToCalendar.url,
                        },
                        { label: 'Edit agenda' },
                    ]}
                />
                <Form
                    action={action.action}
                    method={action.method}
                    className="max-w-3xl"
                >
                    {({ errors, processing }) => (
                        <div className="space-y-6">
                            <Card className="p-5 sm:p-7">
                                <AcademicEventFields
                                    categories={categories}
                                    errors={errors}
                                    event={event}
                                />
                            </Card>
                            <div className="flex justify-end gap-3">
                                <Link
                                    href={returnToCalendar}
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

import { Form, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { TestimonialFields } from '@/components/testimonial-fields';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { index, store, update } from '@/routes/admin/testimonials';
import type { TestimonialItem } from '@/types';

export function TestimonialForm({ item }: { item?: TestimonialItem }) {
    return (
        <Form
            {...(item ? update.form(item.id) : store.form())}
            transform={(data) => ({
                ...data,
                is_published: data.is_published === '1',
            })}
            encType="multipart/form-data"
            className="max-w-2xl"
        >
            {({ errors, processing, progress }) => (
                <div className="space-y-6">
                    <Card className="p-5 sm:p-7">
                        <TestimonialFields item={item} errors={errors} />
                        {progress && (
                            <p className="mt-5 text-sm font-semibold text-brand-700">
                                Mengunggah {progress.percentage}%
                            </p>
                        )}
                    </Card>
                    <div className="flex flex-wrap justify-end gap-3">
                        <Link
                            href={index()}
                            className={buttonVariants({ variant: 'secondary' })}
                        >
                            <ArrowLeft className="size-4" /> Batal
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="size-4" />
                            {processing
                                ? 'Menyimpan...'
                                : item
                                  ? 'Simpan perubahan'
                                  : 'Simpan testimoni'}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}

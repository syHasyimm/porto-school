import { Head, Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { FormField } from '@/components/form-field';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { index, store, update } from '@/routes/admin/teacher-contacts';
import type { TeacherContact } from '@/types/whatsapp';

export default function ContactForm({
    contact,
}: {
    contact: TeacherContact | null;
}) {
    const title = contact ? 'Edit kontak guru' : 'Tambah kontak guru';
    const form = useForm({
        name: contact?.name ?? '',
        phone: contact?.phone ?? '',
        is_active: contact?.is_active ?? true,
        notifications_enabled: contact?.notifications_enabled ?? false,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (contact) {
            form.put(update.url(contact.id));
        } else {
            form.post(store.url());
        }
    }

    return (
        <AdminLayout active="teacher-contacts" title={title}>
            <Head title={title} />
            <PageTransition>
                <PageHeader
                    title={title}
                    description="Simpan kontak WhatsApp guru tanpa membuat akun login."
                    breadcrumbs={[
                        { label: 'Kontak guru', href: index.url() },
                        { label: title },
                    ]}
                />
                <form onSubmit={submit} className="max-w-2xl space-y-6">
                    <Card className="space-y-5 p-5 sm:p-7">
                        <FormField
                            htmlFor="name"
                            label="Nama guru"
                            required
                            error={form.errors.name}
                        >
                            <Input
                                id="name"
                                autoFocus
                                required
                                maxLength={255}
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                            />
                        </FormField>
                        <FormField
                            htmlFor="phone"
                            label="Nomor WhatsApp"
                            error={form.errors.phone}
                            hint="Gunakan nomor seluler Indonesia, misalnya 08123456789 atau +628123456789."
                        >
                            <Input
                                id="phone"
                                type="tel"
                                maxLength={30}
                                value={form.data.phone}
                                onChange={(e) =>
                                    form.setData('phone', e.target.value)
                                }
                                placeholder="08123456789"
                            />
                        </FormField>
                        <div className="space-y-4 border-t border-slate-200 pt-5">
                            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    className="size-4 accent-brand-600"
                                    checked={form.data.is_active}
                                    onChange={(e) =>
                                        form.setData(
                                            'is_active',
                                            e.target.checked,
                                        )
                                    }
                                />
                                Kontak aktif
                            </label>
                            <label className="flex items-start gap-3 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    className="mt-1 size-4 accent-brand-600"
                                    checked={form.data.notifications_enabled}
                                    onChange={(e) =>
                                        form.setData(
                                            'notifications_enabled',
                                            e.target.checked,
                                        )
                                    }
                                />
                                <span>
                                    <span className="block font-semibold">
                                        Menerima notifikasi WhatsApp
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                                        Guru menerima pengingat untuk agenda
                                        yang diaktifkan. Pastikan nomor WhatsApp
                                        sudah benar.
                                    </span>
                                </span>
                            </label>
                            {(form.errors.is_active ||
                                form.errors.notifications_enabled) && (
                                <p className="text-sm text-red-600">
                                    {form.errors.is_active ??
                                        form.errors.notifications_enabled}
                                </p>
                            )}
                        </div>
                    </Card>
                    <div className="flex justify-end gap-3">
                        <Link
                            href={index()}
                            className={buttonVariants({ variant: 'secondary' })}
                        >
                            Batal
                        </Link>
                        <Button type="submit" disabled={form.processing}>
                            <Save className="size-4" />
                            {form.processing ? 'Menyimpan...' : 'Simpan kontak'}
                        </Button>
                    </div>
                </form>
            </PageTransition>
        </AdminLayout>
    );
}

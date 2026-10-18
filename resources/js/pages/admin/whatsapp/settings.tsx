import { Form, Head, Link, useForm } from '@inertiajs/react';
import { Clock, Save, Send, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { FormField } from '@/components/form-field';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { test } from '@/routes/admin/whatsapp';
import { index as historyIndex } from '@/routes/admin/whatsapp/deliveries';
import { update } from '@/routes/admin/whatsapp/settings';
import type { WhatsAppSettings } from '@/types/whatsapp';

export default function WhatsAppSettingsPage({
    settings,
    timezones,
}: {
    settings: WhatsAppSettings;
    timezones: string[];
}) {
    const form = useForm({
        token: '',
        reminders_enabled: settings.reminders_enabled,
        send_time: settings.send_time,
        timezone: settings.timezone,
        admin_phone: settings.admin_phone ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(update.url(), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('token');
                form.setDefaults({ ...form.data, token: '' });
            },
        });
    }

    return (
        <AdminLayout active="whatsapp-settings" title="Pengaturan WhatsApp">
            <Head title="Pengaturan WhatsApp" />
            <PageTransition>
                <PageHeader
                    title="Pengaturan WhatsApp"
                    description="Atur koneksi Fonnte dan waktu pengingat agenda sekolah."
                    action={
                        <Link
                            href={historyIndex()}
                            className={buttonVariants({ variant: 'secondary' })}
                        >
                            Riwayat pengiriman
                        </Link>
                    }
                />
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                    <form onSubmit={submit} className="space-y-6">
                        <Card className="space-y-5 p-5 sm:p-7">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="font-heading text-lg font-bold">
                                    Koneksi Fonnte
                                </h2>
                                <Badge
                                    variant={
                                        settings.token_configured
                                            ? 'green'
                                            : 'amber'
                                    }
                                >
                                    {settings.token_configured
                                        ? 'Token tersedia'
                                        : 'Belum diatur'}
                                </Badge>
                            </div>
                            {settings.token_mask && (
                                <p className="text-sm text-slate-500">
                                    Token tersimpan:{' '}
                                    <span className="font-mono tracking-wider">
                                        {settings.token_mask}
                                    </span>
                                </p>
                            )}
                            <FormField
                                htmlFor="token"
                                label={
                                    settings.token_configured
                                        ? 'Ganti token Fonnte'
                                        : 'Token Fonnte'
                                }
                                error={form.errors.token}
                                hint="Token disimpan terenkripsi. Kosongkan kolom ini untuk mempertahankan token yang tersimpan."
                            >
                                <Input
                                    id="token"
                                    type="password"
                                    autoComplete="new-password"
                                    value={form.data.token}
                                    onChange={(e) =>
                                        form.setData('token', e.target.value)
                                    }
                                    maxLength={1000}
                                    placeholder={
                                        settings.token_configured
                                            ? 'Kosongkan jika tidak mengganti'
                                            : 'Masukkan token dari dashboard Fonnte'
                                    }
                                />
                            </FormField>
                            <FormField
                                htmlFor="admin_phone"
                                label="Nomor WhatsApp admin"
                                error={form.errors.admin_phone}
                                hint="Pesan tes dikirim ke nomor ini menggunakan pengaturan yang sudah disimpan."
                            >
                                <Input
                                    id="admin_phone"
                                    type="tel"
                                    value={form.data.admin_phone}
                                    onChange={(e) =>
                                        form.setData(
                                            'admin_phone',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="08123456789"
                                />
                            </FormField>
                        </Card>
                        <Card className="space-y-5 p-5 sm:p-7">
                            <div className="flex items-center gap-2">
                                <Clock className="size-5 text-brand-600" />
                                <h2 className="font-heading text-lg font-bold">
                                    Jadwal pengingat
                                </h2>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField
                                    htmlFor="send_time"
                                    label="Jam mulai kirim"
                                    required
                                    error={form.errors.send_time}
                                >
                                    <Input
                                        id="send_time"
                                        type="time"
                                        required
                                        value={form.data.send_time}
                                        onChange={(e) =>
                                            form.setData(
                                                'send_time',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </FormField>
                                <FormField
                                    htmlFor="timezone"
                                    label="Zona waktu"
                                    required
                                    error={form.errors.timezone}
                                >
                                    <Select
                                        id="timezone"
                                        value={form.data.timezone}
                                        onChange={(e) =>
                                            form.setData(
                                                'timezone',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        {timezones.map((zone) => (
                                            <option key={zone} value={zone}>
                                                {zone}
                                                {zone === 'Asia/Jakarta'
                                                    ? ' (WIB)'
                                                    : zone === 'Asia/Makassar'
                                                      ? ' (WITA)'
                                                      : zone === 'Asia/Jayapura'
                                                        ? ' (WIT)'
                                                        : ''}
                                            </option>
                                        ))}
                                    </Select>
                                </FormField>
                            </div>
                            <label className="flex items-start gap-3 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    className="mt-1 size-4 accent-brand-600"
                                    checked={form.data.reminders_enabled}
                                    onChange={(e) =>
                                        form.setData(
                                            'reminders_enabled',
                                            e.target.checked,
                                        )
                                    }
                                />
                                <span>
                                    <span className="block font-semibold">
                                        Aktifkan pengingat otomatis
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                                        Agenda diperiksa setiap menit. Agenda
                                        yang ditambahkan setelah jam kirim tetap
                                        diproses pada hari yang sama.
                                    </span>
                                </span>
                            </label>
                            {form.errors.reminders_enabled && (
                                <p className="text-sm text-red-600">
                                    {form.errors.reminders_enabled}
                                </p>
                            )}
                        </Card>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={form.processing}>
                                <Save className="size-4" />
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan pengaturan'}
                            </Button>
                        </div>
                    </form>
                    <div className="space-y-6">
                        <Card className="space-y-4 p-5 sm:p-6">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="size-5 text-brand-600" />
                                <h2 className="font-heading font-bold">
                                    Tes koneksi
                                </h2>
                            </div>
                            <p className="text-sm leading-6 text-slate-600">
                                Kirim pesan tes ke nomor admin untuk memeriksa
                                koneksi. Tes dapat dikirim saat pengingat
                                otomatis nonaktif.
                            </p>
                            <Form action={test()}>
                                {({ processing, errors }) => (
                                    <div className="space-y-3">
                                        <Button
                                            type="submit"
                                            variant="secondary"
                                            className="w-full"
                                            disabled={
                                                processing ||
                                                form.isDirty ||
                                                !settings.token_configured ||
                                                !settings.admin_phone
                                            }
                                        >
                                            <Send className="size-4" />
                                            {processing
                                                ? 'Mengantrekan...'
                                                : 'Kirim tes ke admin'}
                                        </Button>
                                        {errors.admin_phone && (
                                            <p className="text-sm text-red-600">
                                                {errors.admin_phone}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </Form>
                            {form.isDirty && (
                                <p className="text-xs leading-5 text-amber-700">
                                    Simpan perubahan sebelum mengirim tes.
                                </p>
                            )}
                        </Card>
                        <Card className="space-y-3 border-brand-100 bg-brand-50 p-5 sm:p-6">
                            <h2 className="text-brand-900 font-heading font-bold">
                                Cara pengingat bekerja
                            </h2>
                            <p className="text-brand-900/80 text-sm leading-6">
                                Satu pesan per agenda, per guru, per hari.
                                Agenda beberapa hari diingatkan setiap hari.
                                Nomor yang sama tidak menerima pesan ganda.
                            </p>
                            <p className="text-brand-900/80 text-sm leading-6">
                                Pengingat berjalan selama scheduler dan worker
                                aktif. Komputer atau server harus menyala dan
                                terhubung internet.
                            </p>
                            <p className="text-brand-900/70 text-xs leading-5">
                                Status “Diterima Fonnte” menunjukkan permintaan
                                diterima. Pelacakan pesan sampai ke penerima
                                belum tersedia.
                            </p>
                        </Card>
                    </div>
                </div>
            </PageTransition>
        </AdminLayout>
    );
}

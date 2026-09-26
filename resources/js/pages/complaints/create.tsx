import { Form, Head } from '@inertiajs/react';
import { FileText, LockKeyhole, MessageSquareText, Send } from 'lucide-react';
import { FormField } from '@/components/form-field';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/public-layout';
import { store } from '@/routes/complaints';
import type { SelectOption } from '@/types';

type ComplaintCreateProps = { categories: SelectOption[] };

export default function ComplaintCreate({ categories }: ComplaintCreateProps) {
    return (
        <PublicLayout>
            <Head title="Sampaikan Pengaduan" />
            <PageTransition>
                <section className="border-b border-slate-200 bg-slate-50">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-600">
                            <MessageSquareText className="size-4" /> Layanan
                            orang tua
                        </span>
                        <h1 className="mt-3 max-w-3xl font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Sampaikan pengaduan kepada sekolah
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                            Ceritakan kebutuhan atau kendala Anda secara jelas.
                            Tim sekolah akan memeriksa setiap laporan yang
                            masuk.
                        </p>
                    </div>
                </section>

                <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_20rem] lg:px-8 lg:py-14">
                    <Form
                        action={store()}
                        encType="multipart/form-data"
                        resetOnSuccess
                    >
                        {({ errors, processing, progress }) => (
                            <Card className="p-5 sm:p-8">
                                <div className="space-y-7">
                                    <section>
                                        <h2 className="font-heading text-lg font-bold">
                                            Data pelapor
                                        </h2>
                                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                            <FormField
                                                htmlFor="reporter_name"
                                                label="Nama lengkap"
                                                error={errors.reporter_name}
                                                required
                                            >
                                                <Input
                                                    id="reporter_name"
                                                    name="reporter_name"
                                                    autoComplete="name"
                                                    required
                                                    autoFocus
                                                />
                                            </FormField>
                                            <FormField
                                                htmlFor="email"
                                                label="Email"
                                                error={errors.email}
                                                required
                                            >
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    required
                                                />
                                            </FormField>
                                            <FormField
                                                htmlFor="phone"
                                                label="Nomor HP"
                                                error={errors.phone}
                                                required
                                            >
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    autoComplete="tel"
                                                    placeholder="08xxxxxxxxxx"
                                                    required
                                                />
                                            </FormField>
                                        </div>
                                    </section>

                                    <section className="border-t border-slate-200 pt-7">
                                        <h2 className="font-heading text-lg font-bold">
                                            Data siswa dan pengaduan
                                        </h2>
                                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                            <FormField
                                                htmlFor="student_name"
                                                label="Nama siswa"
                                                error={errors.student_name}
                                                required
                                            >
                                                <Input
                                                    id="student_name"
                                                    name="student_name"
                                                    required
                                                />
                                            </FormField>
                                            <FormField
                                                htmlFor="student_class"
                                                label="Kelas"
                                                error={errors.student_class}
                                                required
                                            >
                                                <Input
                                                    id="student_class"
                                                    name="student_class"
                                                    placeholder="Contoh: IV A"
                                                    required
                                                />
                                            </FormField>
                                            <FormField
                                                htmlFor="category"
                                                label="Kategori"
                                                error={errors.category}
                                                required
                                            >
                                                <Select
                                                    id="category"
                                                    name="category"
                                                    defaultValue=""
                                                    required
                                                >
                                                    <option value="" disabled>
                                                        Pilih kategori
                                                    </option>
                                                    {categories.map(
                                                        (category) => (
                                                            <option
                                                                key={
                                                                    category.value
                                                                }
                                                                value={
                                                                    category.value
                                                                }
                                                            >
                                                                {category.label}
                                                            </option>
                                                        ),
                                                    )}
                                                </Select>
                                            </FormField>
                                            <FormField
                                                htmlFor="attachment"
                                                label="Lampiran"
                                                error={errors.attachment}
                                                hint="Opsional. PDF, JPG, JPEG, atau PNG, maksimal 5 MB."
                                            >
                                                <Input
                                                    id="attachment"
                                                    name="attachment"
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                                    className="pt-2"
                                                />
                                            </FormField>
                                        </div>
                                        <div className="mt-5">
                                            <FormField
                                                htmlFor="body"
                                                label="Isi pengaduan"
                                                error={errors.body}
                                                hint="Jelaskan kejadian, waktu, dan bantuan yang Anda harapkan."
                                                required
                                            >
                                                <Textarea
                                                    id="body"
                                                    name="body"
                                                    rows={7}
                                                    required
                                                />
                                            </FormField>
                                        </div>
                                    </section>

                                    {progress && (
                                        <div>
                                            <div className="mb-2 flex justify-between text-xs font-bold text-slate-600">
                                                <span>Mengunggah lampiran</span>
                                                <span>
                                                    {progress.percentage}%
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full bg-brand-500 transition-all"
                                                    style={{
                                                        width: `${progress.percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={processing}
                                        className="w-full sm:w-auto"
                                    >
                                        <Send className="size-4" />
                                        {processing
                                            ? 'Mengirim...'
                                            : 'Kirim pengaduan'}
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </Form>

                    <aside className="space-y-4">
                        <Card className="p-5">
                            <LockKeyhole className="size-5 text-brand-600" />
                            <h2 className="mt-4 font-heading text-base font-bold">
                                Data dijaga secara privat
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Identitas, isi laporan, dan lampiran hanya dapat
                                dibuka oleh administrator sekolah.
                            </p>
                        </Card>
                        <Card className="p-5">
                            <FileText className="size-5 text-brand-600" />
                            <h2 className="mt-4 font-heading text-base font-bold">
                                Simpan nomor referensi
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Nomor referensi akan tampil setelah laporan
                                berhasil dikirim. Simpan nomor tersebut sebagai
                                bukti pengiriman.
                            </p>
                        </Card>
                    </aside>
                </main>
            </PageTransition>
        </PublicLayout>
    );
}

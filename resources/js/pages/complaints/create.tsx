import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    Check,
    FileText,
    LockKeyhole,
    MessageSquareText,
    Paperclip,
    Send,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/public-layout';
import { contact } from '@/routes';
import { store } from '@/routes/complaints';
import type { SelectOption } from '@/types';

type ComplaintCreateProps = { categories: SelectOption[] };

const fieldLabels: Record<string, string> = {
    reporter_name: 'Nama lengkap',
    email: 'Email',
    phone: 'Nomor HP',
    student_name: 'Nama siswa',
    student_class: 'Kelas',
    category: 'Kategori',
    body: 'Isi pengaduan',
    attachment: 'Lampiran',
};
const inputClassName =
    'h-12 scroll-mt-28 rounded-xl border-[#dce1e8] px-4 text-base aria-invalid:border-red-400 sm:text-sm';

export default function ComplaintCreate({ categories }: ComplaintCreateProps) {
    return (
        <PublicLayout>
            <Head title="Sampaikan Pengaduan">
                <meta
                    name="description"
                    content="Sampaikan pengaduan kepada sekolah melalui formulir dengan lampiran dan nomor referensi pengiriman."
                />
            </Head>
            <main data-entrance="blocks" className="bg-[#f8f7f3]">
                <header className="border-b border-[#e6e5e0]">
                    <div className="mx-auto grid max-w-7xl gap-7 px-4 pt-10 pb-9 sm:px-6 lg:grid-cols-[1fr_21rem] lg:items-end lg:px-8 lg:pt-12">
                        <div data-reveal="left">
                            <p className="flex items-center gap-2 text-sm font-bold text-brand-700">
                                <MessageSquareText
                                    aria-hidden="true"
                                    className="size-4 stroke-[1.75]"
                                />{' '}
                                Ruang pengaduan
                            </p>
                            <h1 className="mt-4 font-heading text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.12] font-extrabold tracking-tight text-balance">
                                Suara Anda,
                                <br />
                                <span className="text-brand-700">
                                    perhatian kami.
                                </span>
                            </h1>
                        </div>
                        <p
                            data-reveal="right"
                            className="max-w-md text-sm leading-7 text-slate-600 lg:pb-1"
                        >
                            Ada kendala yang ingin disampaikan? Ceritakan
                            melalui formulir ini agar sekolah dapat memeriksa
                            laporan Anda.
                        </p>
                    </div>
                </header>
                <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-12 lg:px-8 lg:py-12">
                    <aside
                        data-reveal="left"
                        className="order-2 lg:sticky lg:top-28 lg:order-1"
                    >
                        <div className="rounded-3xl border border-brand-700/10 bg-[#edf1f8] p-6">
                            <span className="grid size-11 place-items-center rounded-2xl border border-brand-700/10 bg-white text-brand-700">
                                <LockKeyhole
                                    aria-hidden="true"
                                    className="size-5 stroke-[1.75]"
                                />
                            </span>
                            <h2 className="mt-5 font-heading text-lg font-bold tracking-tight">
                                Ruang untuk bercerita
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                Identitas, isi laporan, dan lampiran hanya dapat
                                dibuka oleh administrator sekolah.
                            </p>
                            <div className="mt-6 border-t border-brand-700/10 pt-5">
                                <p className="text-xs font-bold text-brand-700">
                                    Sebelum mengirim
                                </p>
                                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                                    {[
                                        'Isi data pelapor dan siswa.',
                                        'Jelaskan kejadian dan waktu.',
                                        'Lampirkan bukti jika ada.',
                                    ].map((item) => (
                                        <li key={item} className="flex gap-3">
                                            <Check
                                                aria-hidden="true"
                                                className="mt-1 size-4 shrink-0 text-brand-700"
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="px-2 pt-6 sm:px-3">
                            <div className="flex gap-3">
                                <FileText
                                    aria-hidden="true"
                                    className="mt-1 size-5 shrink-0 stroke-[1.75] text-brand-700"
                                />
                                <div>
                                    <h2 className="text-sm font-bold">
                                        Simpan bukti pengiriman
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Nomor referensi akan tampil setelah
                                        laporan berhasil dikirim.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={contact()}
                                className="mt-6 inline-flex items-center gap-2 rounded-sm text-sm font-bold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                            >
                                Perlu informasi kontak?
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </Link>
                        </div>
                    </aside>
                    <Form
                        data-reveal="scale"
                        action={store()}
                        encType="multipart/form-data"
                        resetOnSuccess
                        className="order-1 min-w-0 overflow-hidden rounded-3xl border border-[#e0e3e9] bg-white shadow-[0_12px_36px_-24px_rgba(30,64,175,0.18)] lg:order-2"
                    >
                        {({ errors, processing, progress }) => (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-8">
                                    <h2 className="font-heading text-base font-bold">
                                        Formulir pengaduan
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Tanda{' '}
                                        <span className="font-bold text-red-600">
                                            *
                                        </span>{' '}
                                        wajib diisi
                                    </p>
                                </div>
                                <div className="px-5 sm:px-8">
                                    {Object.keys(errors).length > 0 && (
                                        <div
                                            role="alert"
                                            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                                        >
                                            <p className="font-bold">
                                                Periksa kembali data berikut.
                                            </p>
                                            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                                                {Object.keys(errors).map(
                                                    (field) => (
                                                        <li key={field}>
                                                            <a
                                                                href={`#${field}`}
                                                                className="underline underline-offset-4"
                                                            >
                                                                {fieldLabels[
                                                                    field
                                                                ] ?? field}
                                                            </a>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                    <ComplaintSection
                                        number="01"
                                        title="Tentang Anda"
                                        description="Data orang tua atau wali yang menyampaikan laporan."
                                    >
                                        <div className="sm:col-span-2">
                                            <ComplaintField
                                                name="reporter_name"
                                                error={errors.reporter_name}
                                            >
                                                <Input
                                                    id="reporter_name"
                                                    name="reporter_name"
                                                    autoComplete="name"
                                                    placeholder="Nama lengkap pelapor"
                                                    maxLength={255}
                                                    required
                                                    aria-invalid={Boolean(
                                                        errors.reporter_name,
                                                    )}
                                                    aria-describedby="reporter_name-feedback"
                                                    className={inputClassName}
                                                />
                                            </ComplaintField>
                                        </div>
                                        <ComplaintField
                                            name="email"
                                            error={errors.email}
                                        >
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder="nama@email.com"
                                                maxLength={255}
                                                required
                                                aria-invalid={Boolean(
                                                    errors.email,
                                                )}
                                                aria-describedby="email-feedback"
                                                className={inputClassName}
                                            />
                                        </ComplaintField>
                                        <ComplaintField
                                            name="phone"
                                            error={errors.phone}
                                        >
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                autoComplete="tel"
                                                placeholder="08xxxxxxxxxx"
                                                maxLength={30}
                                                required
                                                aria-invalid={Boolean(
                                                    errors.phone,
                                                )}
                                                aria-describedby="phone-feedback"
                                                className={inputClassName}
                                            />
                                        </ComplaintField>
                                    </ComplaintSection>
                                    <ComplaintSection
                                        number="02"
                                        title="Data siswa"
                                        description="Cantumkan siswa yang berkaitan dengan pengaduan."
                                    >
                                        <ComplaintField
                                            name="student_name"
                                            error={errors.student_name}
                                        >
                                            <Input
                                                id="student_name"
                                                name="student_name"
                                                placeholder="Nama lengkap siswa"
                                                maxLength={255}
                                                required
                                                aria-invalid={Boolean(
                                                    errors.student_name,
                                                )}
                                                aria-describedby="student_name-feedback"
                                                className={inputClassName}
                                            />
                                        </ComplaintField>
                                        <ComplaintField
                                            name="student_class"
                                            error={errors.student_class}
                                        >
                                            <Input
                                                id="student_class"
                                                name="student_class"
                                                placeholder="Contoh: IV A"
                                                maxLength={30}
                                                required
                                                aria-invalid={Boolean(
                                                    errors.student_class,
                                                )}
                                                aria-describedby="student_class-feedback"
                                                className={inputClassName}
                                            />
                                        </ComplaintField>
                                    </ComplaintSection>
                                    <ComplaintSection
                                        number="03"
                                        title="Ceritakan pengaduan"
                                        description="Detail yang jelas membantu sekolah memahami laporan."
                                    >
                                        <div className="sm:col-span-2">
                                            <ComplaintField
                                                name="category"
                                                error={errors.category}
                                            >
                                                <Select
                                                    id="category"
                                                    name="category"
                                                    defaultValue=""
                                                    required
                                                    aria-invalid={Boolean(
                                                        errors.category,
                                                    )}
                                                    aria-describedby="category-feedback"
                                                    className={inputClassName}
                                                >
                                                    <option value="" disabled>
                                                        Pilih kategori pengaduan
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
                                            </ComplaintField>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <ComplaintField
                                                name="body"
                                                error={errors.body}
                                                hint="Jelaskan kejadian, waktu, dan bantuan yang Anda harapkan. Maksimal 5.000 karakter."
                                            >
                                                <Textarea
                                                    id="body"
                                                    name="body"
                                                    rows={7}
                                                    placeholder="Tuliskan pengaduan Anda di sini..."
                                                    maxLength={5000}
                                                    required
                                                    aria-invalid={Boolean(
                                                        errors.body,
                                                    )}
                                                    aria-describedby="body-feedback"
                                                    className="scroll-mt-28 rounded-xl border-[#dce1e8] px-4 py-3 text-base leading-7 aria-invalid:border-red-400 sm:text-sm"
                                                />
                                            </ComplaintField>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <ComplaintField
                                                name="attachment"
                                                required={false}
                                                error={errors.attachment}
                                                hint="PDF, JPG, JPEG, atau PNG. Maksimal 5 MB."
                                            >
                                                <div className="rounded-2xl border border-dashed border-[#ccd4e2] bg-[#f8f9fc] p-4 sm:p-5">
                                                    <div className="mb-4 flex items-start gap-3">
                                                        <Paperclip
                                                            aria-hidden="true"
                                                            className="mt-1 size-5 shrink-0 stroke-[1.75] text-brand-700"
                                                        />
                                                        <p className="text-sm leading-6 text-slate-600">
                                                            Tambahkan foto atau
                                                            dokumen pendukung{' '}
                                                            <span className="text-slate-400">
                                                                (opsional)
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <Input
                                                        id="attachment"
                                                        name="attachment"
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                                        aria-invalid={Boolean(
                                                            errors.attachment,
                                                        )}
                                                        aria-describedby="attachment-feedback"
                                                        className="h-auto min-h-11 scroll-mt-28 border-0 bg-transparent p-0 text-xs leading-6 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-slate-200 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-50 focus-visible:ring-3"
                                                    />
                                                </div>
                                            </ComplaintField>
                                        </div>
                                    </ComplaintSection>
                                </div>
                                <div className="border-t border-slate-100 bg-[#fafbfc] px-5 py-6 sm:px-8">
                                    {progress && (
                                        <div className="mb-5" role="status">
                                            <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600">
                                                <span>Mengunggah lampiran</span>
                                                <span>
                                                    {progress.percentage ?? 0}%
                                                </span>
                                            </div>
                                            <progress
                                                value={progress.percentage ?? 0}
                                                max={100}
                                                aria-label="Progres unggah lampiran"
                                                className="h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-brand-600 [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-brand-600"
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="max-w-xs text-xs leading-6 text-slate-500">
                                            Pastikan data dan isi pengaduan
                                            sudah benar sebelum dikirim.
                                        </p>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={processing}
                                            aria-busy={processing}
                                            className="h-12 rounded-xl px-6"
                                        >
                                            {processing
                                                ? 'Mengirim...'
                                                : 'Kirim pengaduan'}
                                            <Send
                                                aria-hidden="true"
                                                className="size-4 stroke-[1.75]"
                                            />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </main>
        </PublicLayout>
    );
}

function ComplaintSection({
    children,
    number,
    title,
    description,
}: PropsWithChildren<{ number: string; title: string; description: string }>) {
    return (
        <section className="border-b border-slate-100 py-7 last:border-0 sm:py-8">
            <div className="mb-6 flex items-start gap-3 sm:gap-4">
                <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-brand-700/15 bg-brand-50 font-mono text-xs font-semibold text-brand-700"
                >
                    {number}
                </span>
                <div className="min-w-0 pt-1">
                    <h3 className="font-heading text-lg font-bold tracking-tight">
                        {title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-6 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">{children}</div>
        </section>
    );
}

function ComplaintField({
    children,
    name,
    error,
    hint,
    required = true,
}: PropsWithChildren<{
    name: string;
    error?: string;
    hint?: string;
    required?: boolean;
}>) {
    return (
        <FormField htmlFor={name} label={fieldLabels[name]} required={required}>
            {children}
            <p
                id={`${name}-feedback`}
                className={
                    error
                        ? 'text-sm font-medium text-red-600'
                        : hint
                          ? 'text-xs leading-5 text-slate-500'
                          : 'sr-only'
                }
            >
                {error || hint}
            </p>
        </FormField>
    );
}

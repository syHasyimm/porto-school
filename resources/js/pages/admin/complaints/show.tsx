import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowUpRight,
    CalendarDays,
    Check,
    CheckCheck,
    CircleCheck,
    Clock3,
    Download,
    FileText,
    GraduationCap,
    Inbox,
    LoaderCircle,
    LockKeyhole,
    Mail,
    MessageSquareReply,
    MessageSquareText,
    Paperclip,
    Phone,
    RefreshCw,
    Send,
    Tag,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { CopyButton } from '@/components/copy-button';
import { FormField } from '@/components/form-field';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { attachment, destroy, index } from '@/routes/admin/complaints';
import { store as storeResponse } from '@/routes/admin/complaints/responses';
import { update as updateStatus } from '@/routes/admin/complaints/status';
import type { Complaint, ComplaintStatus, SelectOption } from '@/types';

type ComplaintShowProps = {
    complaint: Complaint;
    statuses: SelectOption[];
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
});

const statusVariant: Record<ComplaintStatus, 'blue' | 'amber' | 'green'> = {
    baru: 'blue',
    diproses: 'amber',
    selesai: 'green',
};

const handlingStages = [
    { value: 'baru', label: 'Baru', icon: Inbox },
    { value: 'diproses', label: 'Diproses', icon: Clock3 },
    { value: 'selesai', label: 'Selesai', icon: CircleCheck },
] as const;

const statusDescriptions: Record<ComplaintStatus, string> = {
    baru: 'Pengaduan diterima dan menunggu tindak lanjut sekolah.',
    diproses:
        'Pengaduan sedang ditangani. Catat perkembangan melalui tanggapan.',
    selesai:
        'Penanganan pengaduan telah selesai. Riwayat tanggapan tetap tersimpan.',
};

export default function ComplaintShow({
    complaint,
    statuses,
}: ComplaintShowProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const currentStage = handlingStages.findIndex(
        (stage) => stage.value === complaint.status,
    );
    const StatusIcon = handlingStages[currentStage].icon;

    return (
        <AdminLayout active="complaints" title="Detail Pengaduan">
            <Head title={`Rincian pengaduan · ${complaint.reference_number}`} />
            <PageTransition>
                <PageHeader
                    title="Rincian pengaduan"
                    description="Tinjau laporan orang tua dan catat setiap tindak lanjut sekolah."
                    breadcrumbs={[
                        { label: 'Pengaduan', href: index.url() },
                        { label: complaint.reference_number },
                    ]}
                    action={
                        <Link
                            href={index()}
                            className={buttonVariants({
                                variant: 'secondary',
                            })}
                        >
                            <ArrowLeft aria-hidden="true" className="size-4" />
                            Daftar pengaduan
                        </Link>
                    }
                />

                <Card className="mb-6 overflow-hidden rounded-2xl shadow-none">
                    <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                            <div className="hidden size-13 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 sm:flex">
                                <MessageSquareText
                                    aria-hidden="true"
                                    className="size-6 stroke-[1.75]"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="mb-1.5 text-xs font-semibold text-slate-500">
                                    Nomor pengaduan
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <h2 className="font-heading text-lg font-bold tracking-tight break-all text-slate-950 sm:text-xl">
                                        {complaint.reference_number}
                                    </h2>
                                    <Badge
                                        variant={
                                            statusVariant[complaint.status]
                                        }
                                        className="gap-1.5 rounded-full px-2.5"
                                    >
                                        <StatusIcon
                                            aria-hidden="true"
                                            className="size-3.5"
                                        />
                                        {complaint.status_label}
                                    </Badge>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs leading-5 text-slate-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Tag
                                            aria-hidden="true"
                                            className="size-3.5 shrink-0"
                                        />
                                        {complaint.category_label}
                                    </span>
                                    <span className="inline-flex items-start gap-1.5">
                                        <CalendarDays
                                            aria-hidden="true"
                                            className="mt-0.5 size-3.5 shrink-0"
                                        />
                                        {complaint.created_at ? (
                                            <time
                                                dateTime={complaint.created_at}
                                            >
                                                {dateFormatter.format(
                                                    new Date(
                                                        complaint.created_at,
                                                    ),
                                                )}
                                            </time>
                                        ) : (
                                            'Waktu pengiriman tidak tersedia'
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <CopyButton
                            value={complaint.reference_number}
                            label="nomor pengaduan"
                        />
                    </div>
                    <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
                        <ol
                            aria-label="Tahapan penanganan pengaduan"
                            className="grid grid-cols-3"
                        >
                            {handlingStages.map((stage, stageIndex) => {
                                const isCurrent = stageIndex === currentStage;
                                const isPassed = stageIndex < currentStage;
                                const StageIcon = isPassed ? Check : stage.icon;

                                return (
                                    <li
                                        key={stage.value}
                                        aria-current={
                                            isCurrent ? 'step' : undefined
                                        }
                                        className="relative flex flex-col items-center gap-2 sm:flex-row sm:gap-3"
                                    >
                                        {stageIndex <
                                            handlingStages.length - 1 && (
                                            <div
                                                aria-hidden="true"
                                                className={cn(
                                                    'absolute top-4 -right-1/2 left-1/2 h-px sm:right-3 sm:left-9',
                                                    isPassed
                                                        ? 'bg-brand-500/35'
                                                        : 'bg-slate-200',
                                                )}
                                            />
                                        )}
                                        <span
                                            className={cn(
                                                'relative z-1 flex size-8 shrink-0 items-center justify-center rounded-full border sm:size-9',
                                                isCurrent
                                                    ? 'border-brand-500 bg-brand-500 text-white ring-4 ring-brand-500/10'
                                                    : isPassed
                                                      ? 'border-brand-100 bg-brand-100 text-brand-700'
                                                      : 'border-slate-200 bg-white text-slate-400',
                                            )}
                                        >
                                            <StageIcon
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        </span>
                                        <span
                                            className={cn(
                                                'relative z-1 bg-slate-50 px-1 text-xs font-semibold sm:text-sm',
                                                isCurrent
                                                    ? 'text-brand-700'
                                                    : isPassed
                                                      ? 'text-slate-700'
                                                      : 'text-slate-500',
                                            )}
                                        >
                                            {stage.label}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </Card>

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
                    <Card className="min-w-0 overflow-hidden rounded-2xl shadow-none">
                        <section
                            aria-labelledby="complaint-body-title"
                            className="p-5 sm:p-7"
                        >
                            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                                <FileText
                                    aria-hidden="true"
                                    className="size-5 shrink-0 text-brand-600"
                                />
                                <h2
                                    id="complaint-body-title"
                                    className="font-heading text-base font-bold text-slate-950"
                                >
                                    Isi pengaduan
                                </h2>
                                <Badge
                                    variant="neutral"
                                    className="ml-auto hidden font-medium sm:inline-flex"
                                >
                                    {complaint.category_label}
                                </Badge>
                            </div>
                            <p className="max-w-prose text-sm leading-8 wrap-anywhere whitespace-pre-wrap text-slate-700">
                                {complaint.body}
                            </p>
                        </section>
                        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
                            {complaint.has_attachment ? (
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                                            <Paperclip
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                Lampiran pengaduan
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Dokumen pendukung dari pelapor
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={attachment.url(complaint.id)}
                                        className={buttonVariants({
                                            variant: 'secondary',
                                            size: 'sm',
                                        })}
                                    >
                                        <Download
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                        Unduh lampiran
                                    </a>
                                </div>
                            ) : (
                                <p className="flex items-center gap-2 text-xs leading-5 text-slate-500">
                                    <Paperclip
                                        aria-hidden="true"
                                        className="size-4 shrink-0"
                                    />
                                    Pelapor tidak menyertakan lampiran.
                                </p>
                            )}
                        </div>
                    </Card>

                    <aside
                        aria-label="Pengelolaan dan informasi pengaduan"
                        className="flex min-w-0 flex-col gap-5 xl:col-start-2 xl:row-span-2 xl:row-start-1"
                    >
                        <Card className="overflow-hidden rounded-2xl border-brand-100 shadow-none">
                            <div className="border-b border-brand-100 bg-brand-50/70 px-5 py-4">
                                <h2 className="flex items-center gap-2.5 font-heading text-sm font-bold text-slate-950">
                                    <RefreshCw
                                        aria-hidden="true"
                                        className="size-4 text-brand-600"
                                    />
                                    Status penanganan
                                </h2>
                            </div>
                            <div className="p-5">
                                <p className="mb-5 text-xs leading-6 text-slate-500">
                                    {statusDescriptions[complaint.status]}
                                </p>
                                <Form
                                    {...updateStatus.form(complaint.id)}
                                    options={{ preserveScroll: true }}
                                >
                                    {({
                                        errors,
                                        processing,
                                        recentlySuccessful,
                                    }) => (
                                        <div className="flex flex-col gap-3">
                                            <FormField
                                                htmlFor="status"
                                                label="Status"
                                                error={errors.status}
                                            >
                                                <Select
                                                    key={complaint.status}
                                                    id="status"
                                                    name="status"
                                                    defaultValue={
                                                        complaint.status
                                                    }
                                                    disabled={processing}
                                                    aria-invalid={Boolean(
                                                        errors.status,
                                                    )}
                                                >
                                                    {statuses.map((status) => (
                                                        <option
                                                            key={status.value}
                                                            value={status.value}
                                                        >
                                                            {status.label}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </FormField>
                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <LoaderCircle
                                                        aria-hidden="true"
                                                        className="size-4 animate-spin"
                                                    />
                                                ) : (
                                                    <CheckCheck
                                                        aria-hidden="true"
                                                        className="size-4"
                                                    />
                                                )}
                                                {processing
                                                    ? 'Memperbarui...'
                                                    : 'Perbarui status'}
                                            </Button>
                                            {recentlySuccessful && (
                                                <p
                                                    role="status"
                                                    className="flex items-center gap-1.5 text-xs text-emerald-700"
                                                >
                                                    <CircleCheck
                                                        aria-hidden="true"
                                                        className="size-3.5"
                                                    />
                                                    Status berhasil diperbarui.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </Form>
                            </div>
                        </Card>

                        <Card className="overflow-hidden rounded-2xl shadow-none">
                            <section
                                aria-labelledby="reporter-title"
                                className="p-5"
                            >
                                <div className="mb-5 flex items-center justify-between gap-2">
                                    <h2
                                        id="reporter-title"
                                        className="font-heading text-sm font-bold text-slate-950"
                                    >
                                        Informasi pelapor
                                    </h2>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                        <LockKeyhole
                                            aria-hidden="true"
                                            className="size-3"
                                        />
                                        Privat
                                    </span>
                                </div>
                                <div className="mb-5 flex items-center gap-3">
                                    <span
                                        aria-hidden="true"
                                        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 font-heading text-sm font-bold text-brand-700"
                                    >
                                        {getInitials(complaint.reporter_name)}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold wrap-anywhere text-slate-900">
                                            {complaint.reporter_name}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Orang tua / wali siswa
                                        </p>
                                    </div>
                                </div>
                                <dl className="flex flex-col gap-4">
                                    <Detail
                                        icon={Mail}
                                        label="Email"
                                        value={complaint.email}
                                        href={`mailto:${complaint.email}`}
                                    />
                                    <Detail
                                        icon={Phone}
                                        label="Nomor HP"
                                        value={complaint.phone}
                                        href={`tel:${complaint.phone}`}
                                    />
                                </dl>
                            </section>
                            <section
                                aria-labelledby="student-title"
                                className="border-t border-slate-100 p-5"
                            >
                                <h2
                                    id="student-title"
                                    className="mb-5 flex items-center gap-2.5 font-heading text-sm font-bold text-slate-950"
                                >
                                    <GraduationCap
                                        aria-hidden="true"
                                        className="size-4 text-brand-600"
                                    />
                                    Siswa terkait
                                </h2>
                                <dl className="flex flex-col gap-4">
                                    <Detail
                                        icon={UserRound}
                                        label="Nama siswa"
                                        value={complaint.student_name}
                                    />
                                    <div className="pl-7">
                                        <dt className="text-xs font-medium text-slate-500">
                                            Kelas
                                        </dt>
                                        <dd className="mt-2">
                                            <Badge
                                                variant="neutral"
                                                className="px-2.5 font-semibold"
                                            >
                                                {complaint.student_class}
                                            </Badge>
                                        </dd>
                                    </div>
                                </dl>
                            </section>
                            <p className="flex items-start gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-[11px] leading-5 text-slate-500">
                                <LockKeyhole
                                    aria-hidden="true"
                                    className="mt-0.5 size-3.5 shrink-0"
                                />
                                Data pelapor dan lampiran hanya dapat diakses
                                oleh admin sekolah.
                            </p>
                        </Card>

                        <Button
                            type="button"
                            variant="ghost"
                            className="h-11 w-full border border-dashed border-slate-200 text-xs font-semibold text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setConfirmDelete(true)}
                        >
                            <Trash2 aria-hidden="true" className="size-4" />{' '}
                            Hapus pengaduan
                        </Button>
                    </aside>

                    <Card className="min-w-0 overflow-hidden rounded-2xl shadow-none xl:col-start-1">
                        <section
                            aria-labelledby="response-history-title"
                            className="p-5 sm:p-7"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2
                                    id="response-history-title"
                                    className="flex items-center gap-3 font-heading text-base font-bold text-slate-950"
                                >
                                    <MessageSquareReply
                                        aria-hidden="true"
                                        className="size-5 text-brand-600"
                                    />
                                    Riwayat tanggapan
                                </h2>
                                <Badge
                                    variant="neutral"
                                    className="font-medium tabular-nums"
                                >
                                    {complaint.responses.length} tanggapan
                                </Badge>
                            </div>
                            {complaint.responses.length === 0 ? (
                                <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center">
                                    <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                        <MessageSquareText
                                            aria-hidden="true"
                                            className="size-5 stroke-[1.75]"
                                        />
                                    </span>
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Belum ada tanggapan
                                    </h3>
                                    <p className="mt-2 max-w-xs text-xs leading-6 text-slate-500">
                                        Tambahkan catatan di bawah untuk memulai
                                        riwayat tindak lanjut pengaduan ini.
                                    </p>
                                </div>
                            ) : (
                                <ol className="mt-7">
                                    {complaint.responses.map(
                                        (response, responseIndex) => (
                                            <li
                                                key={response.id}
                                                className="relative flex gap-3 pb-7 last:pb-0 sm:gap-4"
                                            >
                                                {responseIndex <
                                                    complaint.responses.length -
                                                        1 && (
                                                    <span
                                                        aria-hidden="true"
                                                        className="absolute top-10 bottom-0 left-4.5 w-px bg-slate-200"
                                                    />
                                                )}
                                                <span
                                                    aria-hidden="true"
                                                    className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50 text-[11px] font-bold text-brand-700"
                                                >
                                                    {getInitials(
                                                        response.responder_name,
                                                    )}
                                                </span>
                                                <article className="min-w-0 flex-1 pt-0.5">
                                                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                                                        <h3 className="text-sm font-bold wrap-anywhere text-slate-900">
                                                            {
                                                                response.responder_name
                                                            }
                                                        </h3>
                                                        <time
                                                            dateTime={
                                                                response.created_at ??
                                                                undefined
                                                            }
                                                            className="text-[11px] leading-5 text-slate-500"
                                                        >
                                                            {response.created_at
                                                                ? dateFormatter.format(
                                                                      new Date(
                                                                          response.created_at,
                                                                      ),
                                                                  )
                                                                : 'Waktu tidak tersedia'}
                                                        </time>
                                                    </div>
                                                    <p className="mt-3 max-w-prose text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-slate-600">
                                                        {response.response}
                                                    </p>
                                                </article>
                                            </li>
                                        ),
                                    )}
                                </ol>
                            )}
                        </section>
                        <section
                            aria-labelledby="response-form-title"
                            className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-7"
                        >
                            <h2
                                id="response-form-title"
                                className="font-heading text-base font-bold text-slate-950"
                            >
                                Tambah tanggapan
                            </h2>
                            <p className="mt-1.5 text-xs leading-6 text-slate-500">
                                Catat hasil pemeriksaan, tindakan, atau
                                perkembangan penanganan.
                            </p>
                            <Form
                                {...storeResponse.form(complaint.id)}
                                resetOnSuccess
                                options={{ preserveScroll: true }}
                                className="mt-5"
                            >
                                {({
                                    errors,
                                    processing,
                                    recentlySuccessful,
                                }) => (
                                    <div className="flex flex-col gap-4">
                                        <FormField
                                            htmlFor="response"
                                            label="Catatan tindak lanjut"
                                            error={errors.response}
                                            required
                                        >
                                            <Textarea
                                                id="response"
                                                name="response"
                                                rows={5}
                                                placeholder="Tuliskan tindak lanjut sekolah terhadap pengaduan ini..."
                                                required
                                                disabled={processing}
                                                aria-invalid={Boolean(
                                                    errors.response,
                                                )}
                                                className="rounded-xl px-4 py-3 leading-7"
                                            />
                                        </FormField>
                                        {complaint.status === 'baru' && (
                                            <p className="flex items-start gap-2 text-xs leading-6 text-slate-500">
                                                <RefreshCw
                                                    aria-hidden="true"
                                                    className="mt-1 size-3.5 shrink-0 text-brand-600"
                                                />
                                                Tanggapan pertama otomatis
                                                mengubah status menjadi
                                                Diproses.
                                            </p>
                                        )}
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <p
                                                role="status"
                                                className="flex items-center gap-1.5 text-xs text-emerald-700"
                                            >
                                                {recentlySuccessful && (
                                                    <>
                                                        <CircleCheck
                                                            aria-hidden="true"
                                                            className="size-3.5"
                                                        />{' '}
                                                        Tanggapan berhasil
                                                        disimpan.
                                                    </>
                                                )}
                                            </p>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="sm:ml-auto"
                                            >
                                                {processing ? (
                                                    <LoaderCircle
                                                        aria-hidden="true"
                                                        className="size-4 animate-spin"
                                                    />
                                                ) : (
                                                    <Send
                                                        aria-hidden="true"
                                                        className="size-4"
                                                    />
                                                )}
                                                {processing
                                                    ? 'Menyimpan...'
                                                    : 'Simpan tanggapan'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Form>
                        </section>
                    </Card>
                </div>
            </PageTransition>

            <Dialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                title="Hapus pengaduan?"
                description={`${complaint.reference_number} beserta tanggapan dan lampirannya akan dihapus permanen.`}
                footer={
                    <>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setConfirmDelete(false)}
                        >
                            Batal
                        </Button>
                        <Form {...destroy.form(complaint.id)}>
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="danger"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Menghapus...'
                                        : 'Hapus pengaduan'}
                                </Button>
                            )}
                        </Form>
                    </>
                }
            >
                <p className="text-sm text-slate-600">
                    Tindakan ini tidak dapat dibatalkan.
                </p>
            </Dialog>
        </AdminLayout>
    );
}

type DetailProps = {
    icon: typeof UserRound;
    label: string;
    value: string;
    href?: string;
};

function Detail({ icon: Icon, label, value, href }: DetailProps) {
    return (
        <div className="flex gap-3">
            <Icon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-slate-400"
            />
            <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm leading-6 wrap-anywhere text-slate-800">
                    {href && value ? (
                        <a
                            href={href}
                            className="group inline-flex items-start gap-1.5 rounded-sm font-medium transition-colors hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                        >
                            <span className="min-w-0">{value}</span>
                            <ArrowUpRight
                                aria-hidden="true"
                                className="mt-1 size-3.5 shrink-0 text-slate-400 transition-colors group-hover:text-brand-600"
                            />
                        </a>
                    ) : (
                        value || 'Tidak diisi'
                    )}
                </dd>
            </div>
        </div>
    );
}

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase();
}

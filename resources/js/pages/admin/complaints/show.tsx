import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    Mail,
    MessageSquareReply,
    Phone,
    Send,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
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

export default function ComplaintShow({
    complaint,
    statuses,
}: ComplaintShowProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <AdminLayout active="complaints" title="Detail Pengaduan">
            <Head title={complaint.reference_number} />
            <PageTransition>
                <PageHeader
                    title={complaint.reference_number}
                    description={
                        complaint.created_at
                            ? `Dikirim ${dateFormatter.format(new Date(complaint.created_at))}`
                            : 'Waktu pengiriman tidak tersedia'
                    }
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
                            <ArrowLeft className="size-4" /> Kembali
                        </Link>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="space-y-6">
                        <Card className="p-5 sm:p-7">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                                        Kategori
                                    </p>
                                    <h2 className="mt-1 font-heading text-xl font-bold">
                                        {complaint.category_label}
                                    </h2>
                                </div>
                                <Badge
                                    variant={statusVariant[complaint.status]}
                                >
                                    {complaint.status_label}
                                </Badge>
                            </div>
                            <p className="mt-6 text-sm leading-7 whitespace-pre-line text-slate-700">
                                {complaint.body}
                            </p>
                            {complaint.has_attachment && (
                                <a
                                    href={attachment.url(complaint.id)}
                                    className={buttonVariants({
                                        variant: 'secondary',
                                        size: 'sm',
                                        className: 'mt-6',
                                    })}
                                >
                                    <Download className="size-4" /> Unduh
                                    lampiran privat
                                </a>
                            )}
                        </Card>

                        <Card className="p-5 sm:p-7">
                            <h2 className="font-heading text-lg font-bold">
                                Riwayat tanggapan
                            </h2>
                            {complaint.responses.length === 0 ? (
                                <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                                    Belum ada tanggapan. Tanggapan pertama akan
                                    otomatis mengubah status menjadi Diproses.
                                </div>
                            ) : (
                                <div className="mt-6 space-y-5">
                                    {complaint.responses.map((response) => (
                                        <article
                                            key={response.id}
                                            className="border-brand-200 border-l-2 pl-4"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="text-sm font-bold text-slate-900">
                                                    {response.responder_name}
                                                </p>
                                                <time className="text-xs text-slate-500">
                                                    {response.created_at
                                                        ? dateFormatter.format(
                                                              new Date(
                                                                  response.created_at,
                                                              ),
                                                          )
                                                        : '—'}
                                                </time>
                                            </div>
                                            <p className="mt-2 text-sm leading-7 whitespace-pre-line text-slate-600">
                                                {response.response}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card className="p-5 sm:p-7">
                            <div className="flex items-center gap-3">
                                <MessageSquareReply className="size-5 text-brand-600" />
                                <h2 className="font-heading text-lg font-bold">
                                    Tambah tanggapan
                                </h2>
                            </div>
                            <Form
                                {...storeResponse.form(complaint.id)}
                                resetOnSuccess
                                className="mt-5"
                            >
                                {({ errors, processing }) => (
                                    <div className="space-y-4">
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
                                                required
                                            />
                                        </FormField>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <Send className="size-4" />
                                            {processing
                                                ? 'Menyimpan...'
                                                : 'Simpan tanggapan'}
                                        </Button>
                                    </div>
                                )}
                            </Form>
                        </Card>
                    </div>

                    <aside className="space-y-6">
                        <Card className="p-5">
                            <h2 className="font-heading text-base font-bold">
                                Status penanganan
                            </h2>
                            <Form
                                {...updateStatus.form(complaint.id)}
                                className="mt-4 space-y-3"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <FormField
                                            htmlFor="status"
                                            label="Status"
                                            error={errors.status}
                                        >
                                            <Select
                                                id="status"
                                                name="status"
                                                defaultValue={complaint.status}
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
                                            variant="secondary"
                                            className="w-full"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Memperbarui...'
                                                : 'Perbarui status'}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </Card>

                        <Card className="p-5">
                            <h2 className="font-heading text-base font-bold">
                                Data privat pelapor
                            </h2>
                            <dl className="mt-5 space-y-4">
                                <Detail
                                    icon={UserRound}
                                    label="Pelapor"
                                    value={complaint.reporter_name}
                                />
                                <Detail
                                    icon={Mail}
                                    label="Email"
                                    value={complaint.email}
                                />
                                <Detail
                                    icon={Phone}
                                    label="Nomor HP"
                                    value={complaint.phone}
                                />
                            </dl>
                        </Card>

                        <Card className="p-5">
                            <h2 className="font-heading text-base font-bold">
                                Data siswa
                            </h2>
                            <dl className="mt-4 space-y-3 text-sm">
                                <div>
                                    <dt className="text-xs font-bold text-slate-500">
                                        Nama
                                    </dt>
                                    <dd className="mt-1 font-semibold text-slate-800">
                                        {complaint.student_name}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold text-slate-500">
                                        Kelas
                                    </dt>
                                    <dd className="mt-1 font-semibold text-slate-800">
                                        {complaint.student_class}
                                    </dd>
                                </div>
                            </dl>
                        </Card>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-red-600 hover:bg-red-50"
                            onClick={() => setConfirmDelete(true)}
                        >
                            <Trash2 className="size-4" /> Hapus pengaduan
                        </Button>
                    </aside>
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
};

function Detail({ icon: Icon, label, value }: DetailProps) {
    return (
        <div className="flex gap-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-brand-600" />
            <div className="min-w-0">
                <dt className="text-xs font-bold text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm leading-6 break-words text-slate-800">
                    {value}
                </dd>
            </div>
        </div>
    );
}

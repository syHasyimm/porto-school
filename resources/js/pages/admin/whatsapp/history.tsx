import { Form, Head, Link, usePoll } from '@inertiajs/react';
import { History, RotateCw } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { index, retry } from '@/routes/admin/whatsapp/deliveries';
import { edit as settingsEdit } from '@/routes/admin/whatsapp/settings';
import type { Paginated, SelectOption } from '@/types';
import type { WhatsAppDelivery } from '@/types/whatsapp';

type Props = {
    deliveries: Paginated<WhatsAppDelivery>;
    filters: { search: string; status: string };
    statuses: SelectOption[];
};

function timestamp(value: string | null, timezone: string): string {
    return value
        ? new Intl.DateTimeFormat('id-ID', {
              timeZone: timezone,
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(new Date(value))
        : '—';
}

function statusVariant(status: WhatsAppDelivery['status']) {
    if (status === 'accepted') {
        return 'green' as const;
    }
    if (status === 'failed') {
        return 'red' as const;
    }
    if (status === 'needs_review') {
        return 'amber' as const;
    }
    if (status === 'pending' || status === 'sending') {
        return 'blue' as const;
    }
    return 'neutral' as const;
}

export default function WhatsAppHistory({
    deliveries,
    filters,
    statuses,
}: Props) {
    usePoll(15000, { only: ['deliveries'] });
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selected = deliveries.data.find(
        (delivery) => delivery.id === selectedId,
    );

    return (
        <AdminLayout active="whatsapp-history" title="Riwayat WhatsApp">
            <Head title="Riwayat WhatsApp" />
            <PageTransition>
                <PageHeader
                    title="Riwayat pengiriman"
                    description="Pantau pengingat agenda dan pesan tes WhatsApp."
                    action={
                        <Link
                            href={settingsEdit()}
                            className={buttonVariants({ variant: 'secondary' })}
                        >
                            Pengaturan WhatsApp
                        </Link>
                    }
                />
                <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                    “Diterima Fonnte” belum berarti pesan sampai ke penerima.
                    Pengiriman dengan status “Perlu diperiksa” harus dicek di
                    dashboard Fonnte dan tidak dicoba ulang otomatis.
                </p>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <Form
                        action={index()}
                        className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row"
                    >
                        <Input
                            name="search"
                            aria-label="Cari pengiriman"
                            defaultValue={filters.search}
                            placeholder="Cari agenda, penerima, atau nomor"
                            className="sm:max-w-sm"
                        />
                        <Select
                            name="status"
                            aria-label="Filter status pengiriman"
                            defaultValue={filters.status}
                            className="sm:max-w-52"
                        >
                            <option value="">Semua status</option>
                            {statuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </Select>
                        <Button type="submit" variant="secondary">
                            Terapkan
                        </Button>
                        {(filters.search || filters.status) && (
                            <Link
                                href={index()}
                                className={buttonVariants({ variant: 'ghost' })}
                            >
                                Reset
                            </Link>
                        )}
                    </Form>
                    {deliveries.data.length === 0 ? (
                        <EmptyState
                            icon={History}
                            title="Belum ada pengiriman"
                            description="Pengingat dan pesan tes akan tampil di sini setelah diantrekan."
                        />
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Agenda / penerima</TableHead>
                                        <TableHead>Tanggal pengingat</TableHead>
                                        <TableHead>Waktu kirim</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deliveries.data.map((delivery) => (
                                        <TableRow key={delivery.id}>
                                            <TableCell className="max-w-80 min-w-60">
                                                <p className="font-semibold break-words">
                                                    {delivery.event_title}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {delivery.recipient_name} ·{' '}
                                                    {delivery.phone}
                                                </p>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {delivery.reminder_date}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <p>
                                                    {timestamp(
                                                        delivery.started_at,
                                                        delivery.timezone,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {delivery.timezone}
                                                </p>
                                            </TableCell>
                                            <TableCell className="max-w-72 min-w-48">
                                                <Badge
                                                    variant={statusVariant(
                                                        delivery.status,
                                                    )}
                                                >
                                                    {delivery.status_label}
                                                </Badge>
                                                {delivery.failure_reason && (
                                                    <p className="mt-2 text-xs leading-5 break-words text-slate-500">
                                                        {
                                                            delivery.failure_reason
                                                        }
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setSelectedId(
                                                                delivery.id,
                                                            )
                                                        }
                                                    >
                                                        Detail
                                                    </Button>
                                                    {delivery.can_retry && (
                                                        <Form
                                                            action={retry(
                                                                delivery.id,
                                                            )}
                                                            options={{
                                                                preserveScroll: true,
                                                            }}
                                                        >
                                                            {({
                                                                processing,
                                                                errors,
                                                            }) => (
                                                                <div>
                                                                    <Button
                                                                        type="submit"
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                    >
                                                                        <RotateCw className="size-3.5" />
                                                                        {processing
                                                                            ? 'Mengantrekan...'
                                                                            : 'Coba ulang'}
                                                                    </Button>
                                                                    {errors.delivery && (
                                                                        <p className="mt-2 max-w-48 text-xs text-red-600">
                                                                            {
                                                                                errors.delivery
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Form>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Pagination {...deliveries} />
                        </>
                    )}
                </div>
            </PageTransition>
            <Dialog
                open={selected !== undefined}
                title="Detail pengiriman"
                size="lg"
                onClose={() => setSelectedId(null)}
            >
                {selected && (
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold">
                                    {selected.event_title}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    {selected.recipient_name} · {selected.phone}
                                </p>
                            </div>
                            <Badge variant={statusVariant(selected.status)}>
                                {selected.status_label}
                            </Badge>
                        </div>
                        <dl className="grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-slate-500">Dijadwalkan</dt>
                                <dd className="mt-1">
                                    {timestamp(
                                        selected.available_at,
                                        selected.timezone,
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">
                                    Diterima Fonnte
                                </dt>
                                <dd className="mt-1">
                                    {timestamp(
                                        selected.accepted_at,
                                        selected.timezone,
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">
                                    Jumlah percobaan
                                </dt>
                                <dd className="mt-1">{selected.attempts}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">
                                    ID pesan Fonnte
                                </dt>
                                <dd className="mt-1 break-all">
                                    {selected.provider_ids.join(', ') || '—'}
                                </dd>
                            </div>
                        </dl>
                        {selected.failure_reason && (
                            <p className="rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                                {selected.failure_reason}
                            </p>
                        )}
                        <div>
                            <p className="mb-2 text-sm font-semibold">
                                Isi pesan
                            </p>
                            <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 break-words whitespace-pre-wrap text-slate-700">
                                {selected.message ??
                                    'Isi pesan disiapkan saat pengiriman.'}
                            </p>
                        </div>
                        {selected.attempt_history.length > 0 && (
                            <div>
                                <p className="mb-2 text-sm font-semibold">
                                    Riwayat percobaan
                                </p>
                                <ul className="space-y-3">
                                    {selected.attempt_history.map(
                                        (attempt, i) => (
                                            <li
                                                key={i}
                                                className="border-l-2 border-slate-200 pl-3 text-xs leading-5 text-slate-600"
                                            >
                                                {timestamp(
                                                    attempt.at,
                                                    selected.timezone,
                                                )}{' '}
                                                ·{' '}
                                                {statuses.find(
                                                    (status) =>
                                                        status.value ===
                                                        attempt.status,
                                                )?.label ?? attempt.status}
                                                {attempt.reason && (
                                                    <p>{attempt.reason}</p>
                                                )}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>
        </AdminLayout>
    );
}

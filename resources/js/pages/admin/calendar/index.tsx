import { Form, Head, Link } from '@inertiajs/react';
import { CalendarDays, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Pagination } from '@/components/pagination';
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
import { create, destroy, edit, index } from '@/routes/admin/calendar';
import type { AcademicEvent, Paginated, SelectOption } from '@/types';

type CalendarIndexProps = {
    categories: SelectOption[];
    events: Paginated<AcademicEvent>;
    filters: { category: string; search: string };
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

function formatDate(value: string): string {
    return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export default function CalendarIndex({
    categories,
    events,
    filters,
}: CalendarIndexProps) {
    const [eventToDelete, setEventToDelete] = useState<AcademicEvent | null>(
        null,
    );

    return (
        <AdminLayout active="calendar" title="Kalender Akademik">
            <Head title="Kalender Akademik" />
            <PageTransition>
                <PageHeader
                    title="Kalender akademik"
                    description="Kelola agenda sekolah yang tampil pada halaman publik."
                    action={
                        <Link href={create()} className={buttonVariants()}>
                            <Plus className="size-4" /> Tambah agenda
                        </Link>
                    }
                />
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <Form
                            action={index()}
                            className="grid gap-2 sm:grid-cols-[1fr_12rem_auto_auto]"
                        >
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="Cari judul agenda"
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                name="category"
                                defaultValue={filters.category}
                            >
                                <option value="">Semua kategori</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.value}
                                        value={category.value}
                                    >
                                        {category.label}
                                    </option>
                                ))}
                            </Select>
                            <Button type="submit" variant="secondary">
                                Terapkan
                            </Button>
                            {(filters.search || filters.category) && (
                                <Link
                                    href={index()}
                                    className={buttonVariants({
                                        variant: 'ghost',
                                    })}
                                >
                                    Reset
                                </Link>
                            )}
                        </Form>
                    </div>
                    {events.data.length === 0 ? (
                        <EmptyState
                            icon={CalendarDays}
                            title="Agenda tidak ditemukan"
                            description="Tambahkan agenda baru atau ubah filter pencarian."
                            action={
                                !filters.search && !filters.category ? (
                                    <Link
                                        href={create()}
                                        className={buttonVariants()}
                                    >
                                        <Plus className="size-4" /> Tambah
                                        agenda
                                    </Link>
                                ) : undefined
                            }
                        />
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Agenda</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.data.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell>
                                                <div className="min-w-56">
                                                    <p className="font-bold text-slate-900">
                                                        {event.title}
                                                    </p>
                                                    {event.description && (
                                                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                    <span
                                                        className="size-2.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                event.color,
                                                        }}
                                                    />
                                                    {event.category_label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {formatDate(event.start_date)}
                                                {event.end_date &&
                                                event.end_date !==
                                                    event.start_date
                                                    ? ` sampai ${formatDate(event.end_date)}`
                                                    : ''}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    <Link
                                                        href={edit(event.id)}
                                                        className={buttonVariants(
                                                            {
                                                                size: 'icon',
                                                                variant:
                                                                    'ghost',
                                                            },
                                                        )}
                                                        aria-label={`Edit ${event.title}`}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-red-600 hover:bg-red-50"
                                                        aria-label={`Hapus ${event.title}`}
                                                        onClick={() =>
                                                            setEventToDelete(
                                                                event,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Pagination
                                from={events.from}
                                to={events.to}
                                total={events.total}
                                links={events.links}
                            />
                        </>
                    )}
                </div>
            </PageTransition>
            <Dialog
                open={eventToDelete !== null}
                onClose={() => setEventToDelete(null)}
                title="Hapus agenda?"
                description={`${eventToDelete?.title ?? 'Agenda'} akan dihapus dari kalender publik.`}
                footer={
                    eventToDelete && (
                        <>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setEventToDelete(null)}
                            >
                                Batal
                            </Button>
                            <Form
                                action={destroy.form(eventToDelete.id).action}
                                method={destroy.form(eventToDelete.id).method}
                            >
                                {({ processing }) => (
                                    <Button
                                        type="submit"
                                        variant="danger"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Menghapus...'
                                            : 'Hapus agenda'}
                                    </Button>
                                )}
                            </Form>
                        </>
                    )
                }
            >
                <p className="text-sm text-slate-600">
                    Tindakan ini tidak dapat dibatalkan.
                </p>
            </Dialog>
        </AdminLayout>
    );
}

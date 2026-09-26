import { Form, Head, Link } from '@inertiajs/react';
import { Eye, MessageSquareText, Search } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { index, show } from '@/routes/admin/complaints';
import type {
    ComplaintStatus,
    ComplaintSummary,
    Paginated,
    SelectOption,
} from '@/types';

type ComplaintsIndexProps = {
    categories: SelectOption[];
    complaints: Paginated<ComplaintSummary>;
    filters: { category: string; search: string; status: string };
    statuses: SelectOption[];
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const statusVariant: Record<ComplaintStatus, 'blue' | 'amber' | 'green'> = {
    baru: 'blue',
    diproses: 'amber',
    selesai: 'green',
};

export default function ComplaintsIndex({
    categories,
    complaints,
    filters,
    statuses,
}: ComplaintsIndexProps) {
    return (
        <AdminLayout active="complaints" title="Pengaduan">
            <Head title="Pengaduan" />
            <PageTransition>
                <PageHeader
                    title="Pengaduan orang tua"
                    description="Tinjau laporan, perbarui status, dan catat tindak lanjut sekolah."
                />

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <Form
                            action={index()}
                            className="grid gap-2 md:grid-cols-[minmax(14rem,1fr)_11rem_11rem_auto_auto]"
                        >
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="Referensi, pelapor, atau siswa"
                                    className="pl-9"
                                />
                            </div>
                            <Select name="status" defaultValue={filters.status}>
                                <option value="">Semua status</option>
                                {statuses.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </Select>
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
                            {(filters.search ||
                                filters.status ||
                                filters.category) && (
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

                    {complaints.data.length === 0 ? (
                        <EmptyState
                            icon={MessageSquareText}
                            title="Pengaduan tidak ditemukan"
                            description="Belum ada laporan yang sesuai dengan filter saat ini."
                        />
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Referensi</TableHead>
                                        <TableHead>Pelapor dan siswa</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Masuk</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {complaints.data.map((complaint) => (
                                        <TableRow key={complaint.id}>
                                            <TableCell>
                                                <span className="font-mono text-xs font-bold text-slate-900">
                                                    {complaint.reference_number}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="min-w-48">
                                                    <p className="font-bold text-slate-900">
                                                        {
                                                            complaint.reporter_name
                                                        }
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {complaint.student_name}{' '}
                                                        · Kelas{' '}
                                                        {
                                                            complaint.student_class
                                                        }
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {complaint.category_label}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        statusVariant[
                                                            complaint.status
                                                        ]
                                                    }
                                                >
                                                    {complaint.status_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-slate-600">
                                                {complaint.created_at
                                                    ? dateFormatter.format(
                                                          new Date(
                                                              complaint.created_at,
                                                          ),
                                                      )
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link
                                                    href={show(complaint.id)}
                                                    className={buttonVariants({
                                                        size: 'icon',
                                                        variant: 'ghost',
                                                    })}
                                                    aria-label={`Buka ${complaint.reference_number}`}
                                                >
                                                    <Eye className="size-4" />
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Pagination
                                from={complaints.from}
                                to={complaints.to}
                                total={complaints.total}
                                links={complaints.links}
                            />
                        </>
                    )}
                </div>
            </PageTransition>
        </AdminLayout>
    );
}

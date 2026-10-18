import { Form, Head, Link } from '@inertiajs/react';
import { ContactRound, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { create, destroy, edit, index } from '@/routes/admin/teacher-contacts';
import type { Paginated } from '@/types';
import type { TeacherContact } from '@/types/whatsapp';

type Props = {
    contacts: Paginated<TeacherContact>;
    filters: { search: string };
};

export default function TeacherContacts({ contacts, filters }: Props) {
    const [deleting, setDeleting] = useState<TeacherContact | null>(null);

    return (
        <AdminLayout active="teacher-contacts" title="Kontak Guru">
            <Head title="Kontak Guru" />
            <PageTransition>
                <PageHeader
                    title="Kontak guru"
                    description="Penerima pengingat agenda melalui WhatsApp. Kontak guru tidak memerlukan akun login."
                    action={
                        <Link href={create()} className={buttonVariants()}>
                            <Plus className="size-4" /> Tambah kontak
                        </Link>
                    }
                />
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 p-5">
                        <Form action={index()} className="flex max-w-xl gap-2">
                            <div className="relative flex-1">
                                <Search
                                    aria-hidden="true"
                                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                                />
                                <Input
                                    name="search"
                                    aria-label="Cari kontak guru"
                                    defaultValue={filters.search}
                                    placeholder="Cari nama atau nomor WhatsApp"
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Cari
                            </Button>
                            {filters.search && (
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
                    {contacts.data.length === 0 ? (
                        <EmptyState
                            icon={ContactRound}
                            title={
                                filters.search
                                    ? 'Kontak tidak ditemukan'
                                    : 'Belum ada kontak guru'
                            }
                            description="Tambahkan nama dan nomor WhatsApp guru untuk menerima pengingat."
                        />
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama guru</TableHead>
                                        <TableHead>WhatsApp</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Notifikasi</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contacts.data.map((contact) => (
                                        <TableRow key={contact.id}>
                                            <TableCell className="min-w-48 font-semibold">
                                                {contact.name}
                                            </TableCell>
                                            <TableCell>
                                                <p>
                                                    {contact.phone ??
                                                        'Belum diisi'}
                                                </p>
                                                {contact.phone &&
                                                    !contact.phone_valid && (
                                                        <p className="mt-1 text-xs text-amber-700">
                                                            Perbarui nomor agar
                                                            valid
                                                        </p>
                                                    )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        contact.is_active
                                                            ? 'green'
                                                            : 'neutral'
                                                    }
                                                >
                                                    {contact.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        contact.notifications_enabled
                                                            ? 'blue'
                                                            : 'neutral'
                                                    }
                                                >
                                                    {contact.notifications_enabled
                                                        ? 'Menerima'
                                                        : 'Nonaktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    <Link
                                                        href={edit(contact.id)}
                                                        className={buttonVariants(
                                                            {
                                                                variant:
                                                                    'ghost',
                                                                size: 'icon',
                                                            },
                                                        )}
                                                        aria-label={`Edit ${contact.name}`}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Hapus ${contact.name}`}
                                                        onClick={() =>
                                                            setDeleting(contact)
                                                        }
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Pagination {...contacts} />
                        </>
                    )}
                    <p className="border-t border-slate-200 px-5 py-4 text-xs leading-5 text-slate-500">
                        Nomor WhatsApp yang sama menerima satu pesan untuk
                        setiap agenda per hari. Aktifkan status dan notifikasi
                        agar kontak menerima pengingat.
                    </p>
                </div>
            </PageTransition>
            <Dialog
                open={deleting !== null}
                title="Hapus kontak guru?"
                onClose={() => setDeleting(null)}
                description={`Kontak ${deleting?.name ?? ''} akan dihapus dari daftar penerima. Riwayat pengiriman tetap tersimpan.`}
                footer={
                    deleting && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => setDeleting(null)}
                            >
                                Batal
                            </Button>
                            <Form action={destroy(deleting.id)}>
                                {({ processing }) => (
                                    <Button
                                        type="submit"
                                        variant="danger"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Menghapus...'
                                            : 'Hapus kontak'}
                                    </Button>
                                )}
                            </Form>
                        </>
                    )
                }
            >
                <p className="text-sm text-slate-600">
                    Pengingat yang belum dikirim ke kontak ini akan dilewati.
                </p>
            </Dialog>
        </AdminLayout>
    );
}

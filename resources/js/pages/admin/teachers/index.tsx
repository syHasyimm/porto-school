import { Form, Head, Link } from '@inertiajs/react';
import {
    Eye,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserRound,
    UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Pagination } from '@/components/pagination';
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
import { create, destroy, edit, index, show } from '@/routes/admin/teachers';
import type { Paginated, Teacher } from '@/types';

type TeacherIndexProps = {
    filters: { search: string };
    teachers: Paginated<Teacher>;
};

export default function TeacherIndex({ filters, teachers }: TeacherIndexProps) {
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(
        null,
    );

    return (
        <AdminLayout active="teachers" title="Data Guru">
            <Head title="Data Guru" />
            <PageTransition>
                <PageHeader
                    title="Data guru"
                    description="Kelola akun, profil, dan foto guru SD Negeri 001 Kepenuhan."
                    action={
                        <Link href={create()} className={buttonVariants()}>
                            <Plus className="size-4" /> Tambah guru
                        </Link>
                    }
                />

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <Form action={index()} className="flex max-w-xl gap-2">
                            <div className="relative flex-1">
                                <Search
                                    aria-hidden="true"
                                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                                />
                                <Input
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="Cari nama, email, NIP, atau mapel"
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

                    {teachers.data.length === 0 ? (
                        <EmptyState
                            icon={UsersRound}
                            title={
                                filters.search
                                    ? 'Guru tidak ditemukan'
                                    : 'Belum ada data guru'
                            }
                            description={
                                filters.search
                                    ? 'Coba kata pencarian yang berbeda.'
                                    : 'Tambahkan guru pertama untuk mulai mengelola profil.'
                            }
                            action={
                                !filters.search ? (
                                    <Link
                                        href={create()}
                                        className={buttonVariants()}
                                    >
                                        <Plus className="size-4" /> Tambah guru
                                    </Link>
                                ) : undefined
                            }
                        />
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Guru</TableHead>
                                        <TableHead>NIP</TableHead>
                                        <TableHead>Mata pelajaran</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teachers.data.map((teacher) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell>
                                                <div className="flex min-w-64 items-center gap-3">
                                                    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100">
                                                        {teacher.photo_url ? (
                                                            <img
                                                                src={
                                                                    teacher.photo_url
                                                                }
                                                                alt=""
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <UserRound className="size-5 text-slate-400" />
                                                        )}
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-slate-900">
                                                            {teacher.name}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            {teacher.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {teacher.nip ?? 'Belum diisi'}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {teacher.subject ??
                                                    'Belum diisi'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    <Link
                                                        href={show(teacher.id)}
                                                        aria-label={`Lihat ${teacher.name}`}
                                                        className={buttonVariants(
                                                            {
                                                                size: 'icon',
                                                                variant:
                                                                    'ghost',
                                                            },
                                                        )}
                                                    >
                                                        <Eye className="size-4" />
                                                    </Link>
                                                    <Link
                                                        href={edit(teacher.id)}
                                                        aria-label={`Edit ${teacher.name}`}
                                                        className={buttonVariants(
                                                            {
                                                                size: 'icon',
                                                                variant:
                                                                    'ghost',
                                                            },
                                                        )}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        aria-label={`Hapus ${teacher.name}`}
                                                        className="text-red-600 hover:bg-red-50"
                                                        onClick={() =>
                                                            setTeacherToDelete(
                                                                teacher,
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
                                from={teachers.from}
                                to={teachers.to}
                                total={teachers.total}
                                links={teachers.links}
                            />
                        </>
                    )}
                </div>
            </PageTransition>

            <Dialog
                open={teacherToDelete !== null}
                onClose={() => setTeacherToDelete(null)}
                title="Hapus data guru?"
                description={`Akun dan profil ${teacherToDelete?.name ?? 'guru'} akan dihapus secara permanen.`}
                footer={
                    teacherToDelete && (
                        <>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setTeacherToDelete(null)}
                            >
                                Batal
                            </Button>
                            <Form
                                action={destroy.form(teacherToDelete.id).action}
                                method={destroy.form(teacherToDelete.id).method}
                            >
                                {({ processing }) => (
                                    <Button
                                        type="submit"
                                        variant="danger"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Menghapus...'
                                            : 'Hapus guru'}
                                    </Button>
                                )}
                            </Form>
                        </>
                    )
                }
            >
                <p className="text-sm leading-6 text-slate-600">
                    Foto profil yang tersimpan juga akan dibersihkan dari
                    penyimpanan sekolah.
                </p>
            </Dialog>
        </AdminLayout>
    );
}

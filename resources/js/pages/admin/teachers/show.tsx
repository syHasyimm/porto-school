import { Form, Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { TeacherEducationHistory } from '@/components/teacher-education-history';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import AdminLayout from '@/layouts/admin-layout';
import { destroy, edit, index } from '@/routes/admin/teachers';
import type { Teacher } from '@/types';

type ShowTeacherProps = { teacher: Teacher };

const dateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' });

export default function ShowTeacher({ teacher }: ShowTeacherProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <AdminLayout active="teachers" title="Detail Guru">
            <Head title={teacher.name} />
            <PageTransition>
                <PageHeader
                    title={teacher.name}
                    description={
                        teacher.subject ?? 'Mata pelajaran belum diisi'
                    }
                    breadcrumbs={[
                        { label: 'Data guru', href: index.url() },
                        { label: teacher.name },
                    ]}
                    action={
                        <Link
                            href={edit(teacher.id)}
                            className={buttonVariants()}
                        >
                            <Pencil className="size-4" /> Edit guru
                        </Link>
                    }
                />
                <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
                    <aside className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                        <div className="mx-auto grid aspect-square w-full max-w-52 place-items-center overflow-hidden rounded-xl bg-slate-100">
                            {teacher.photo_url ? (
                                <img
                                    src={teacher.photo_url}
                                    alt={`Foto ${teacher.name}`}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <UserRound className="size-16 text-slate-400" />
                            )}
                        </div>
                        <p className="mt-5 font-heading text-lg font-bold">
                            {teacher.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            {teacher.nip ?? 'NIP belum diisi'}
                        </p>
                    </aside>
                    <div className="space-y-6">
                        <section className="rounded-xl border border-slate-200 bg-white p-6">
                            <h2 className="font-heading text-lg font-bold">
                                Informasi guru
                            </h2>
                            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                                <Detail
                                    icon={Mail}
                                    label="Email"
                                    value={teacher.email}
                                />
                                <Detail
                                    icon={Phone}
                                    label="Nomor telepon"
                                    value={teacher.phone}
                                />
                                <Detail
                                    icon={CalendarDays}
                                    label="Tanggal lahir"
                                    value={
                                        teacher.birth_date
                                            ? dateFormatter.format(
                                                  new Date(
                                                      `${teacher.birth_date}T00:00:00`,
                                                  ),
                                              )
                                            : null
                                    }
                                />
                                <Detail
                                    icon={MapPin}
                                    label="Alamat"
                                    value={teacher.address}
                                />
                            </dl>
                        </section>
                        <section className="rounded-xl border border-slate-200 bg-white p-6">
                            <h2 className="font-heading text-lg font-bold">
                                Bio
                            </h2>
                            <p className="mt-3 text-sm leading-7 whitespace-pre-line text-slate-600">
                                {teacher.bio ?? 'Bio belum diisi.'}
                            </p>
                        </section>
                        <section className="rounded-2xl border border-[#dce3ee] bg-white p-6">
                            <h2 className="mb-6 font-heading text-lg font-bold">
                                Riwayat pendidikan
                            </h2>
                            <TeacherEducationHistory
                                entries={teacher.education_history}
                            />
                        </section>
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setConfirmDelete(true)}
                        >
                            <Trash2 className="size-4" /> Hapus guru
                        </Button>
                    </div>
                </div>
            </PageTransition>
            <Dialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                title="Hapus data guru?"
                description={`Akun dan profil ${teacher.name} akan dihapus secara permanen.`}
                footer={
                    <>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setConfirmDelete(false)}
                        >
                            Batal
                        </Button>
                        <Form
                            action={destroy.form(teacher.id).action}
                            method={destroy.form(teacher.id).method}
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="danger"
                                    disabled={processing}
                                >
                                    {processing ? 'Menghapus...' : 'Hapus guru'}
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

type DetailProps = { icon: typeof Mail; label: string; value: string | null };

function Detail({ icon: Icon, label, value }: DetailProps) {
    return (
        <div className="flex gap-3">
            <Icon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-brand-600"
            />
            <div>
                <dt className="text-xs font-bold text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-800">
                    {value ?? 'Belum diisi'}
                </dd>
            </div>
        </div>
    );
}

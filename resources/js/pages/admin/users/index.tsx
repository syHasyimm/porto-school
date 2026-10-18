import { Form, Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowUpRight,
    Eye,
    EyeOff,
    KeyRound,
    LoaderCircle,
    Search,
    UserRound,
    UserRoundCheck,
    UserRoundPlus,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { EmptyState } from '@/components/empty-state';
import { FormField } from '@/components/form-field';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Pagination } from '@/components/pagination';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import {
    edit as editTeacher,
    index as teachersIndex,
} from '@/routes/admin/teachers';
import { index, store } from '@/routes/admin/users';
import type { Paginated } from '@/types';

type TeacherAccount = {
    id: number;
    name: string;
    email: string;
    created_at: string | null;
    subject: string | null;
    has_profile: boolean;
};

type UserIndexProps = {
    accounts: Paginated<TeacherAccount>;
    filters: { search: string };
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

function CreateTeacherAccountDialog({ onClose }: { onClose: () => void }) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() =>
            nameInputRef.current?.focus(),
        );
        return () => window.cancelAnimationFrame(frame);
    }, []);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.submit(store(), {
            preserveScroll: true,
            onSuccess: () => {
                form.resetAndClearErrors();
                onClose();
            },
            onError: () => form.reset('password', 'password_confirmation'),
        });
    }

    return (
        <Dialog
            open
            size="lg"
            title="Tambah pengguna guru"
            description="Buat akun login baru untuk mengakses portal guru."
            onClose={() => {
                if (!form.processing) {
                    onClose();
                }
            }}
        >
            <form onSubmit={submit}>
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
                    <UserRoundCheck
                        aria-hidden="true"
                        className="size-5 shrink-0 text-brand-600"
                    />
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            Peran pengguna: Guru
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-slate-600">
                            Akses dashboard dan profil pribadi guru.
                        </p>
                    </div>
                </div>
                {form.hasErrors && (
                    <p
                        role="alert"
                        className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        Akun belum dibuat. Periksa data di bawah, lalu masukkan
                        kembali password.
                    </p>
                )}
                <fieldset
                    disabled={form.processing}
                    className="grid gap-4 sm:grid-cols-2"
                >
                    <div className="sm:col-span-2">
                        <FormField
                            htmlFor="account-name"
                            label="Nama lengkap"
                            error={form.errors.name}
                            required
                        >
                            <Input
                                ref={nameInputRef}
                                id="account-name"
                                name="name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                placeholder="Nama lengkap guru"
                                autoComplete="name"
                                maxLength={255}
                                aria-invalid={Boolean(form.errors.name)}
                                autoFocus
                                required
                            />
                        </FormField>
                    </div>
                    <div className="sm:col-span-2">
                        <FormField
                            htmlFor="account-email"
                            label="Email untuk login"
                            error={form.errors.email}
                            hint="Gunakan email yang belum terdaftar sebagai pengguna."
                            required
                        >
                            <Input
                                id="account-email"
                                name="email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                placeholder="Email guru"
                                autoComplete="email"
                                autoCapitalize="none"
                                spellCheck={false}
                                maxLength={255}
                                aria-invalid={Boolean(form.errors.email)}
                                required
                            />
                        </FormField>
                    </div>
                    <FormField
                        htmlFor="account-password"
                        label="Password"
                        error={form.errors.password}
                        required
                    >
                        <Input
                            id="account-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            autoComplete="new-password"
                            aria-invalid={Boolean(form.errors.password)}
                            required
                        />
                    </FormField>
                    <FormField
                        htmlFor="account-password-confirmation"
                        label="Konfirmasi password"
                        error={form.errors.password_confirmation}
                        required
                    >
                        <Input
                            id="account-password-confirmation"
                            name="password_confirmation"
                            type={showPassword ? 'text' : 'password'}
                            value={form.data.password_confirmation}
                            onChange={(event) =>
                                form.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            autoComplete="new-password"
                            aria-invalid={Boolean(
                                form.errors.password_confirmation,
                            )}
                            required
                        />
                    </FormField>
                    <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                        <p className="text-xs leading-5 text-slate-500">
                            Gunakan kombinasi huruf, angka, dan simbol.
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-pressed={showPassword}
                            aria-controls="account-password account-password-confirmation"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff aria-hidden="true" className="size-4" />
                            ) : (
                                <Eye aria-hidden="true" className="size-4" />
                            )}
                            {showPassword
                                ? 'Sembunyikan password'
                                : 'Tampilkan password'}
                        </Button>
                    </div>
                </fieldset>
                <p className="mt-6 border-t border-slate-100 pt-5 text-sm leading-6 text-slate-600">
                    Profil guru disiapkan otomatis. Foto, mata pelajaran, dan
                    riwayat pendidikan dapat dilengkapi melalui{' '}
                    <span className="font-semibold text-slate-900">
                        Data guru
                    </span>{' '}
                    setelah akun dibuat.
                </p>
                <div className="mt-5 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        Batal
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? (
                            <LoaderCircle
                                aria-hidden="true"
                                className="size-4 animate-spin"
                            />
                        ) : (
                            <UserRoundPlus
                                aria-hidden="true"
                                className="size-4"
                            />
                        )}
                        {form.processing ? 'Membuat akun...' : 'Buat akun guru'}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}

export default function UserIndex({ accounts, filters }: UserIndexProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <AdminLayout active="users" title="Pengguna Guru">
            <Head title="Pengguna Guru" />
            <PageTransition>
                <PageHeader
                    title="Pengguna guru"
                    description="Kelola akun login guru dan tambahkan pengguna baru ke portal sekolah."
                    action={
                        <Button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <UserRoundPlus
                                aria-hidden="true"
                                className="size-4"
                            />{' '}
                            Tambah pengguna guru
                        </Button>
                    }
                />
                <aside className="mb-6 flex flex-col gap-4 rounded-xl border border-brand-100 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-brand-600">
                            <KeyRound aria-hidden="true" className="size-5" />
                        </span>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">
                                Akun untuk portal guru
                            </h2>
                            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                                Guru masuk menggunakan email dan password yang
                                dibuat admin. Lengkapi informasi mengajar dan
                                foto melalui Data guru.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={teachersIndex()}
                        className={buttonVariants({
                            variant: 'secondary',
                            size: 'sm',
                            className: 'shrink-0',
                        })}
                    >
                        Data guru{' '}
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                </aside>
                <section
                    aria-label="Daftar akun guru"
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
                        <div>
                            <h2 className="font-heading text-base font-bold text-slate-900">
                                Daftar akun guru
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {accounts.total} akun
                                {filters.search
                                    ? ' sesuai pencarian'
                                    : ' terdaftar'}
                            </p>
                        </div>
                        <Form
                            action={index()}
                            className="flex min-w-0 gap-2 lg:w-96"
                        >
                            <div className="relative min-w-0 flex-1">
                                <Search
                                    aria-hidden="true"
                                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                                />
                                <Input
                                    key={filters.search}
                                    name="search"
                                    aria-label="Cari pengguna guru"
                                    defaultValue={filters.search}
                                    placeholder="Cari nama atau email"
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
                    {accounts.data.length === 0 ? (
                        <EmptyState
                            icon={UserRoundPlus}
                            title={
                                filters.search
                                    ? 'Pengguna tidak ditemukan'
                                    : 'Belum ada pengguna guru'
                            }
                            description={
                                filters.search
                                    ? 'Coba cari menggunakan nama atau email lainnya.'
                                    : 'Tambahkan akun pertama agar guru dapat masuk ke portal sekolah.'
                            }
                            action={
                                filters.search ? (
                                    <Link
                                        href={index()}
                                        className={buttonVariants({
                                            variant: 'secondary',
                                        })}
                                    >
                                        Tampilkan semua pengguna
                                    </Link>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={() => setIsCreateOpen(true)}
                                    >
                                        <UserRoundPlus
                                            aria-hidden="true"
                                            className="size-4"
                                        />{' '}
                                        Tambah pengguna guru
                                    </Button>
                                )
                            }
                        />
                    ) : (
                        <>
                            <div
                                aria-hidden="true"
                                className="hidden grid-cols-[minmax(0,1fr)_5rem_8rem_8rem] gap-5 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold text-slate-500 lg:grid"
                            >
                                <span>Pengguna</span>
                                <span>Peran</span>
                                <span>Dibuat pada</span>
                                <span className="text-right">Kelola</span>
                            </div>
                            <ul className="divide-y divide-slate-100">
                                {accounts.data.map((account) => (
                                    <li
                                        key={account.id}
                                        className="grid min-w-0 gap-4 px-5 py-5 transition-colors hover:bg-slate-50/60 lg:grid-cols-[minmax(0,1fr)_5rem_8rem_8rem] lg:items-center lg:gap-5"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                                                <UserRound
                                                    aria-hidden="true"
                                                    className="size-5"
                                                />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold break-words text-slate-900">
                                                    {account.name}
                                                </p>
                                                <p className="mt-0.5 text-sm break-all text-slate-500">
                                                    {account.email}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {account.subject ||
                                                        'Profil belum dilengkapi'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 lg:contents">
                                            <span className="inline-flex w-fit items-center rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                                                Guru
                                            </span>
                                            <time
                                                dateTime={
                                                    account.created_at ??
                                                    undefined
                                                }
                                                className="text-xs text-slate-500"
                                            >
                                                <span className="lg:hidden">
                                                    Dibuat{' '}
                                                </span>
                                                {account.created_at
                                                    ? dateFormatter.format(
                                                          new Date(
                                                              account.created_at,
                                                          ),
                                                      )
                                                    : '—'}
                                            </time>
                                            {account.has_profile && (
                                                <Link
                                                    href={editTeacher(
                                                        account.id,
                                                    )}
                                                    aria-label={`Kelola akun ${account.name}`}
                                                    className={buttonVariants({
                                                        variant: 'secondary',
                                                        size: 'sm',
                                                        className:
                                                            'ml-auto lg:justify-self-end',
                                                    })}
                                                >
                                                    Kelola{' '}
                                                    <ArrowUpRight
                                                        aria-hidden="true"
                                                        className="size-3.5"
                                                    />
                                                </Link>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <Pagination
                                from={accounts.from}
                                to={accounts.to}
                                total={accounts.total}
                                links={accounts.links}
                            />
                        </>
                    )}
                </section>
            </PageTransition>
            {isCreateOpen && (
                <CreateTeacherAccountDialog
                    onClose={() => setIsCreateOpen(false)}
                />
            )}
        </AdminLayout>
    );
}

import { Head } from '@inertiajs/react';
import {
    CalendarDays,
    MessageSquareText,
    Newspaper,
    UsersRound,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import AdminLayout from '@/layouts/admin-layout';

const modules = [
    {
        icon: UsersRound,
        label: 'Data guru',
        description: 'Kelola akun dan profil pendidik',
    },
    {
        icon: CalendarDays,
        label: 'Kalender',
        description: 'Susun agenda akademik sekolah',
    },
    {
        icon: MessageSquareText,
        label: 'Pengaduan',
        description: 'Pantau tindak lanjut pengaduan',
    },
    {
        icon: Newspaper,
        label: 'Publikasi',
        description: 'Kelola berita dan galeri sekolah',
    },
];

export default function AdminDashboard() {
    return (
        <AdminLayout active="dashboard" title="Dashboard Admin">
            <Head title="Dashboard Admin" />
            <PageTransition>
                <PageHeader
                    title="Dashboard"
                    description="Ringkasan area pengelolaan SD Negeri 001 Kepenuhan."
                />
                <section
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                    aria-label="Modul admin"
                >
                    {modules.map(({ icon: Icon, label, description }) => (
                        <article
                            key={label}
                            className="rounded-xl border border-slate-200 bg-white p-5"
                        >
                            <Icon
                                aria-hidden="true"
                                className="size-5 text-brand-600"
                                strokeWidth={1.8}
                            />
                            <h2 className="mt-5 font-heading text-base font-bold">
                                {label}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {description}
                            </p>
                        </article>
                    ))}
                </section>
                <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                    <p className="text-sm font-bold text-brand-600">
                        Pusat kendali sekolah
                    </p>
                    <h2 className="mt-2 font-heading text-2xl font-bold">
                        Selamat datang di ruang kerja admin
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                        Gunakan menu di sidebar untuk membuka modul. Fitur data
                        guru sudah siap untuk dikelola.
                    </p>
                </section>
            </PageTransition>
        </AdminLayout>
    );
}

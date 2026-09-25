import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';

const modules = [
    'Kelola profil dan akun guru',
    'Kelola kalender akademik',
    'Tindak lanjuti pengaduan orang tua',
    'Kelola berita, galeri, dan informasi sekolah',
];

export default function AdminDashboard() {
    return (
        <AuthenticatedLayout title="Dashboard Admin">
            <Head title="Dashboard Admin" />

            <div className="flex flex-col gap-8">
                <section className="max-w-2xl">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        Area pengelolaan
                    </p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight">
                        Selamat datang di dashboard sekolah
                    </h2>
                    <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
                        Fondasi akun dan hak akses sudah aktif. Modul
                        pengelolaan akan ditambahkan pada phase berikutnya.
                    </p>
                </section>

                <section
                    className="grid gap-4 sm:grid-cols-2"
                    aria-label="Modul admin"
                >
                    {modules.map((module) => (
                        <article
                            key={module}
                            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                        >
                            <p className="font-semibold">{module}</p>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Segera tersedia
                            </p>
                        </article>
                    ))}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

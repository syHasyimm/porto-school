import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';

export default function GuruDashboard() {
    return (
        <AuthenticatedLayout title="Dashboard Guru">
            <Head title="Dashboard Guru" />

            <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Profil guru
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                    Selamat datang di portal guru
                </h2>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
                    Akun Anda sudah terlindungi oleh akses khusus guru. Formulir
                    pengelolaan profil akan ditambahkan pada phase fitur guru.
                </p>
            </section>
        </AuthenticatedLayout>
    );
}

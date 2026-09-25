import { Head } from '@inertiajs/react';
import { UserRound } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import GuruLayout from '@/layouts/guru-layout';

export default function GuruDashboard() {
    return (
        <GuruLayout active="dashboard" title="Dashboard Guru">
            <Head title="Dashboard Guru" />
            <PageTransition>
                <PageHeader
                    title="Dashboard"
                    description="Kelola informasi profil Anda sebagai guru SD Negeri 001 Kepenuhan."
                />
                <section className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                    <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <UserRound aria-hidden="true" className="size-5" />
                    </span>
                    <h2 className="mt-6 font-heading text-2xl font-bold">
                        Profil guru dalam satu halaman
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Lengkapi NIP, mata pelajaran, alamat, nomor telepon, dan
                        foto profil agar informasi publik sekolah tetap akurat.
                    </p>
                </section>
            </PageTransition>
        </GuruLayout>
    );
}

import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Home, MessageSquarePlus } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { buttonVariants } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { home } from '@/routes';
import { create } from '@/routes/complaints';

type ComplaintSuccessProps = { referenceNumber: string };

export default function ComplaintSuccess({
    referenceNumber,
}: ComplaintSuccessProps) {
    return (
        <PublicLayout>
            <Head title="Pengaduan Berhasil Dikirim" />
            <PageTransition>
                <main className="mx-auto flex min-h-[65vh] max-w-3xl items-center px-4 py-16 sm:px-6">
                    <section className="w-full rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-[0_24px_70px_-45px_rgba(15,23,42,0.5)] sm:p-12">
                        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                            <CheckCircle2 className="size-7" />
                        </span>
                        <p className="mt-6 text-sm font-bold text-emerald-700">
                            Pengaduan berhasil dikirim
                        </p>
                        <h1 className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl">
                            Terima kasih atas laporan Anda
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
                            Administrator SD Negeri 001 Kepenuhan akan memeriksa
                            laporan yang masuk. Simpan nomor referensi berikut
                            sebagai bukti pengiriman.
                        </p>
                        <div className="border-brand-300 mx-auto mt-7 max-w-md rounded-xl border border-dashed bg-brand-50 px-5 py-5">
                            <span className="text-xs font-bold tracking-wide text-brand-700 uppercase">
                                Nomor referensi
                            </span>
                            <p className="mt-2 font-mono text-xl font-bold tracking-wider text-slate-950 sm:text-2xl">
                                {referenceNumber}
                            </p>
                        </div>
                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link href={home()} className={buttonVariants()}>
                                <Home className="size-4" /> Kembali ke beranda
                            </Link>
                            <Link
                                href={create()}
                                className={buttonVariants({
                                    variant: 'secondary',
                                })}
                            >
                                <MessageSquarePlus className="size-4" /> Kirim
                                laporan lain
                            </Link>
                        </div>
                    </section>
                </main>
            </PageTransition>
        </PublicLayout>
    );
}

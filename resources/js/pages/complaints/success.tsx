import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check, FileText, MessageSquarePlus } from 'lucide-react';
import { CopyButton } from '@/components/copy-button';
import { buttonVariants } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { home } from '@/routes';
import { create } from '@/routes/complaints';

type ComplaintSuccessProps = { referenceNumber: string };

export default function ComplaintSuccess({
    referenceNumber,
}: ComplaintSuccessProps) {
    const { name } = usePage().props;
    return (
        <PublicLayout>
            <Head title="Pengaduan Berhasil Dikirim" />
            <main
                data-entrance="blocks"
                className="bg-[#f8f7f3] px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
            >
                <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[#e0e3e9] bg-white shadow-[0_16px_50px_-30px_rgba(30,64,175,0.18)]">
                    <div
                        data-reveal
                        className="border-b border-slate-100 p-6 sm:p-10"
                    >
                        <div className="flex items-center gap-3 text-sm font-semibold text-brand-700">
                            <span className="grid size-10 place-items-center rounded-full bg-brand-50">
                                <Check aria-hidden="true" className="size-5" />
                            </span>
                            Pengaduan berhasil dikirim
                        </div>
                        <h1 className="mt-7 font-heading text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
                            Terima kasih sudah
                            <br className="hidden sm:block" /> menyampaikan.
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-slate-600">
                            Laporan Anda telah diterima. Administrator {name}{' '}
                            akan memeriksa pengaduan yang masuk.
                        </p>
                    </div>
                    <div data-reveal className="p-6 sm:p-10">
                        <div className="flex items-center gap-2 text-xs font-bold text-brand-700">
                            <FileText
                                aria-hidden="true"
                                className="size-4 stroke-[1.75]"
                            />
                            Bukti pengiriman
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-700/10 bg-[#edf1f8] p-5 sm:p-6">
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">
                                    Nomor referensi
                                </p>
                                <p className="mt-2 font-mono text-lg font-bold tracking-wide break-all text-brand-700 sm:text-xl">
                                    {referenceNumber}
                                </p>
                            </div>
                            <CopyButton
                                value={referenceNumber}
                                label="nomor referensi"
                            />
                        </div>
                        <p className="mt-4 text-xs leading-6 text-slate-500">
                            Salin atau simpan nomor ini sebagai bukti bahwa
                            pengaduan Anda telah dikirim.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={home()}
                                className={buttonVariants({
                                    size: 'lg',
                                    className: 'h-12 rounded-xl',
                                })}
                            >
                                Kembali ke beranda{' '}
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </Link>
                            <Link
                                href={create()}
                                className={buttonVariants({
                                    variant: 'secondary',
                                    size: 'lg',
                                    className: 'h-12 rounded-xl',
                                })}
                            >
                                <MessageSquarePlus
                                    aria-hidden="true"
                                    className="size-4"
                                />{' '}
                                Kirim laporan lain
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}

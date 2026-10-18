import { Head, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    BookOpen,
    GraduationCap,
    UsersRound,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';
import { TeacherPortrait } from '@/components/teacher-portrait';
import { TeacherProfileModal } from '@/components/teacher-profile-modal';
import PublicLayout from '@/layouts/public-layout';
import { cn } from '@/lib/utils';
import type { Paginated, PublicTeacher } from '@/types';

type TeacherListProps = { teachers: Paginated<PublicTeacher> };

export default function TeacherList({ teachers }: TeacherListProps) {
    const { name } = usePage().props;
    const reducedMotion = useReducedMotion();
    const [selectedTeacher, setSelectedTeacher] =
        useState<PublicTeacher | null>(null);

    return (
        <PublicLayout>
            <Head title="Guru" />
            <main data-entrance="blocks" className="bg-[#f8f7f3]">
                <section className="border-b border-[#e6e5e0]">
                    <div
                        data-reveal
                        className="mx-auto max-w-7xl px-4 pt-12 pb-9 sm:px-6 sm:pt-16 sm:pb-11 lg:px-8"
                    >
                        <p className="text-sm font-bold text-brand-700">
                            Tenaga pendidik
                        </p>
                        <h1 className="mt-4 max-w-3xl font-heading text-[clamp(2.25rem,4.4vw,3.5rem)] leading-[1.12] font-extrabold tracking-tight">
                            Kenali para
                            <br />
                            <span className="text-brand-700">
                                pendidik kami.
                            </span>
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                            Sosok di balik setiap pengalaman belajar di {name}.
                            Kenali bidang mengajar dan perjalanan pendidikan
                            mereka.
                        </p>
                    </div>
                </section>

                <section
                    aria-label="Daftar guru"
                    className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 sm:pb-20 lg:px-8"
                >
                    <div
                        data-reveal
                        className="mb-7 flex flex-wrap items-center justify-between gap-3"
                    >
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <UsersRound
                                aria-hidden="true"
                                className="size-4 text-brand-700"
                            />
                            {teachers.total} pendidik
                        </p>
                        {teachers.data.length > 0 && (
                            <p className="text-xs leading-5 text-slate-500">
                                Pilih kartu untuk mengenal guru lebih dekat.
                            </p>
                        )}
                    </div>
                    {teachers.data.length === 0 ? (
                        <div
                            data-reveal="scale"
                            className="rounded-3xl border border-[#e5e4df] bg-white"
                        >
                            <EmptyState
                                icon={UsersRound}
                                title="Profil guru belum tersedia"
                                description="Data tenaga pendidik akan ditampilkan setelah diperbarui oleh sekolah."
                            />
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'grid gap-8 lg:gap-9',
                                teachers.data.length === 1
                                    ? 'mx-auto max-w-sm'
                                    : teachers.data.length === 2
                                      ? 'mx-auto max-w-3xl sm:grid-cols-2'
                                      : 'sm:grid-cols-2 lg:grid-cols-3',
                            )}
                        >
                            {teachers.data.map((teacher, index) => (
                                <motion.div
                                    key={`${teachers.current_page}-${teacher.id}`}
                                    initial={
                                        reducedMotion
                                            ? false
                                            : { opacity: 0, y: 28, scale: 0.97 }
                                    }
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, amount: 0.15 }}
                                    transition={{
                                        duration: reducedMotion ? 0 : 0.65,
                                        delay: reducedMotion
                                            ? 0
                                            : Math.min(index * 0.07, 0.28),
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="h-full min-w-0"
                                >
                                    <article className="group relative isolate aspect-[3/4] min-h-104 min-w-0 overflow-hidden rounded-[2rem] bg-[#afcbd8] text-white shadow-[0_24px_48px_-24px_rgba(38,74,103,0.3)] ring-1 ring-slate-900/5 transition-[box-shadow,translate] duration-300 hover:shadow-[0_30px_56px_-22px_rgba(38,74,103,0.4)] motion-safe:focus-within:-translate-y-1.5 motion-safe:hover:-translate-y-1.5 motion-reduce:transition-none">
                                        <TeacherPortrait
                                            name={teacher.name}
                                            photoUrl={teacher.photo_url}
                                            className="absolute inset-0 size-full bg-[#afcbd8]"
                                        />
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-[#133953]/95 via-[#133953]/55 to-transparent [mask-image:linear-gradient(to_top,black_45%,transparent)] backdrop-blur-md"
                                        />
                                        <div className="relative flex h-full flex-col p-6 sm:p-7">
                                            <h2 className="text-center font-heading text-2xl leading-tight font-semibold tracking-tight break-words text-white text-shadow-[0_2px_8px_rgba(15,23,42,0.5)] sm:text-[1.75rem]">
                                                <button
                                                    type="button"
                                                    aria-label={`Lihat profil ${teacher.name}`}
                                                    aria-haspopup="dialog"
                                                    aria-controls={
                                                        selectedTeacher?.id ===
                                                        teacher.id
                                                            ? 'teacher-profile-modal'
                                                            : undefined
                                                    }
                                                    onClick={() =>
                                                        setSelectedTeacher(
                                                            teacher,
                                                        )
                                                    }
                                                    className="cursor-pointer outline-none after:absolute after:inset-0 after:rounded-[2rem] focus-visible:after:outline-2 focus-visible:after:-outline-offset-6 focus-visible:after:outline-white"
                                                >
                                                    {teacher.name}
                                                </button>
                                            </h2>
                                            <p className="pointer-events-none mt-3 flex items-start justify-center gap-2 text-center text-sm leading-5 font-medium break-words text-white text-shadow-[0_1px_6px_rgba(15,23,42,0.6)]">
                                                <BookOpen
                                                    aria-hidden="true"
                                                    className="mt-0.5 size-4 shrink-0"
                                                />
                                                <span className="min-w-0">
                                                    {teacher.subject || 'Guru'}
                                                </span>
                                            </p>
                                            <div className="pointer-events-none mt-auto flex items-center justify-between gap-3 pt-8">
                                                <div className="flex min-w-0 items-center gap-2.5">
                                                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/25">
                                                        <GraduationCap
                                                            aria-hidden="true"
                                                            className="size-4"
                                                        />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] leading-5 text-white/90">
                                                            Pendidikan
                                                        </p>
                                                        <p className="truncate text-xs leading-5 font-semibold">
                                                            {teacher
                                                                .education_history
                                                                .length > 0
                                                                ? `${teacher.education_history.length} riwayat`
                                                                : 'Belum diisi'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-xs font-semibold text-slate-900 shadow-[0_4px_12px_rgba(16,45,72,0.18)] transition-colors duration-300 group-focus-within:bg-brand-50 group-hover:bg-brand-50 motion-reduce:transition-none">
                                                    Lihat profil
                                                    <ArrowUpRight
                                                        aria-hidden="true"
                                                        className="size-4 transition-transform duration-300 motion-safe:group-focus-within:translate-x-0.5 motion-safe:group-focus-within:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 motion-reduce:transition-none"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    {teachers.total > 0 && (
                        <div
                            data-reveal
                            className="mt-12 border-t border-[#e1e5ea] pt-7"
                        >
                            <Pagination
                                variant="public"
                                itemLabel="guru"
                                from={teachers.from}
                                to={teachers.to}
                                total={teachers.total}
                                links={teachers.links}
                            />
                        </div>
                    )}
                </section>
            </main>
            {selectedTeacher && (
                <TeacherProfileModal
                    teacher={selectedTeacher}
                    onClose={() => setSelectedTeacher(null)}
                />
            )}
        </PublicLayout>
    );
}

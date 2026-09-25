import { Head } from '@inertiajs/react';
import { GraduationCap, UserRound, UsersRound } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageTransition } from '@/components/page-transition';
import { Pagination } from '@/components/pagination';
import PublicLayout from '@/layouts/public-layout';
import type { Paginated, PublicTeacher } from '@/types';

type TeacherListProps = {
    teachers: Paginated<PublicTeacher>;
};

export default function TeacherList({ teachers }: TeacherListProps) {
    return (
        <PublicLayout>
            <Head title="Guru" />
            <PageTransition>
                <main>
                    <section className="bg-slate-50">
                        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
                            <p className="text-sm font-bold text-brand-600">
                                Tenaga pendidik
                            </p>
                            <h1 className="mt-3 max-w-3xl font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
                                Guru yang mendampingi tumbuh kembang peserta
                                didik.
                            </h1>
                            <p className="mt-5 max-w-2xl leading-7 text-slate-600">
                                Kenali para pendidik SD Negeri 001 Kepenuhan dan
                                bidang yang mereka ampu.
                            </p>
                        </div>
                    </section>

                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        {teachers.data.length === 0 ? (
                            <div className="rounded-xl border border-slate-200">
                                <EmptyState
                                    icon={UsersRound}
                                    title="Profil guru belum tersedia"
                                    description="Data tenaga pendidik akan ditampilkan setelah diperbarui oleh sekolah."
                                />
                            </div>
                        ) : (
                            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {teachers.data.map((teacher) => (
                                    <article key={teacher.id}>
                                        <div className="grid aspect-[4/5] place-items-center overflow-hidden rounded-xl bg-slate-100">
                                            {teacher.photo_url ? (
                                                <img
                                                    src={teacher.photo_url}
                                                    alt={`Foto ${teacher.name}`}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <UserRound
                                                    aria-hidden="true"
                                                    className="size-16 text-slate-300"
                                                />
                                            )}
                                        </div>
                                        <div className="pt-5">
                                            <h2 className="font-heading text-lg font-bold text-slate-950">
                                                {teacher.name}
                                            </h2>
                                            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand-600">
                                                <GraduationCap
                                                    aria-hidden="true"
                                                    className="size-4"
                                                />
                                                {teacher.subject ?? 'Guru'}
                                            </p>
                                            {teacher.bio && (
                                                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                                                    {teacher.bio}
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                        <div className="mt-12 overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <Pagination
                                from={teachers.from}
                                to={teachers.to}
                                total={teachers.total}
                                links={teachers.links}
                            />
                        </div>
                    </section>
                </main>
            </PageTransition>
        </PublicLayout>
    );
}

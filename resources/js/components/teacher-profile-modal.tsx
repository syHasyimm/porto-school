import { BookOpen, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { TeacherEducationHistory } from '@/components/teacher-education-history';
import { TeacherPortrait } from '@/components/teacher-portrait';
import type { PublicTeacher } from '@/types';

export function TeacherProfileModal({
    teacher,
    onClose,
}: {
    teacher: PublicTeacher;
    onClose: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const trigger =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();

        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            trigger?.focus({ preventScroll: true });
        };
    }, []);

    return (
        <dialog
            ref={dialogRef}
            id="teacher-profile-modal"
            aria-labelledby="teacher-profile-name"
            aria-describedby="teacher-profile-subject"
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
            className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-[1.75rem] border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-[3px]"
        >
            <div className="relative animate-in duration-200 zoom-in-95 fade-in motion-reduce:animate-none">
                <div className="sticky top-0 z-10 flex justify-end bg-white/95 px-4 pt-4 backdrop-blur-sm sm:px-6">
                    <button
                        ref={closeRef}
                        type="button"
                        aria-label="Tutup profil guru"
                        onClick={onClose}
                        className="grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-brand-700/30 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                    >
                        <X aria-hidden="true" className="size-5" />
                    </button>
                </div>
                <div className="grid gap-7 px-6 pb-8 sm:grid-cols-[10rem_1fr] sm:gap-8 sm:px-8 sm:pb-10">
                    <aside className="min-w-0">
                        <TeacherPortrait
                            name={teacher.name}
                            photoUrl={teacher.photo_url}
                            className="mx-auto aspect-[4/5] w-32 rounded-2xl border border-[#dce3ee] sm:w-full"
                        />
                        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                            Tenaga pendidik
                        </p>
                    </aside>
                    <div className="min-w-0">
                        <h2
                            id="teacher-profile-name"
                            className="font-heading text-2xl leading-tight font-extrabold tracking-tight break-words sm:text-3xl"
                        >
                            {teacher.name}
                        </h2>
                        <p
                            id="teacher-profile-subject"
                            className="mt-3 flex items-start gap-2 text-sm font-semibold text-brand-700"
                        >
                            <BookOpen
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0"
                            />
                            {teacher.subject || 'Guru'}
                        </p>
                        <section className="mt-7">
                            <h3 className="font-heading text-base font-bold">
                                Tentang guru
                            </h3>
                            <p className="mt-3 text-sm leading-7 break-words whitespace-pre-line text-slate-600">
                                {teacher.bio ||
                                    'Bio guru belum ditambahkan oleh sekolah.'}
                            </p>
                        </section>
                        <section className="mt-8 border-t border-[#e6e8ed] pt-7">
                            <h3 className="mb-5 font-heading text-lg font-bold tracking-tight">
                                Riwayat pendidikan
                            </h3>
                            <TeacherEducationHistory
                                entries={teacher.education_history}
                            />
                        </section>
                    </div>
                </div>
            </div>
        </dialog>
    );
}

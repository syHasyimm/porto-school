import { Form, Head } from '@inertiajs/react';
import { LockKeyhole, Save } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { TeacherProfileFields } from '@/components/teacher-profile-fields';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import GuruLayout from '@/layouts/guru-layout';
import { update } from '@/routes/guru/profile';
import type { Teacher } from '@/types';

type EditProfileProps = {
    profile: Omit<Teacher, 'id'>;
};

export default function EditProfile({ profile }: EditProfileProps) {
    return (
        <GuruLayout active="profile" title="Profil Saya">
            <Head title="Profil Saya" />
            <PageTransition>
                <PageHeader
                    title="Profil saya"
                    description="Perbarui informasi profesional yang digunakan sekolah dan ditampilkan di halaman publik."
                />
                <Form
                    action={update.form().action}
                    method={update.form().method}
                    resetOnSuccess={['photo']}
                    className="max-w-4xl"
                >
                    {({ errors, processing, progress, recentlySuccessful }) => (
                        <div className="space-y-6">
                            <Card className="p-5 sm:p-7">
                                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                                    <LockKeyhole
                                        aria-hidden="true"
                                        className="mt-0.5 size-5 shrink-0 text-brand-600"
                                    />
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">
                                            Informasi akun dikelola admin
                                        </h2>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Hubungi admin sekolah jika nama atau
                                            email perlu diperbarui.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Nama lengkap
                                        </label>
                                        <Input
                                            id="name"
                                            value={profile.name}
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            value={profile.email}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-5 sm:p-7">
                                <h2 className="font-heading text-lg font-bold">
                                    Informasi profil
                                </h2>
                                <div className="mt-6">
                                    <TeacherProfileFields
                                        errors={errors}
                                        teacher={profile}
                                    />
                                </div>
                            </Card>
                            {progress && (
                                <div
                                    className="h-2 overflow-hidden rounded-full bg-slate-200"
                                    aria-label={`Mengunggah ${progress.percentage}%`}
                                >
                                    <div
                                        className="h-full bg-brand-500 transition-all"
                                        style={{
                                            width: `${progress.percentage}%`,
                                        }}
                                    />
                                </div>
                            )}
                            <div className="flex items-center justify-end gap-4">
                                {recentlySuccessful && (
                                    <p className="text-sm font-semibold text-emerald-700">
                                        Perubahan tersimpan.
                                    </p>
                                )}
                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />{' '}
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan profil'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </PageTransition>
        </GuruLayout>
    );
}

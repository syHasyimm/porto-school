import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormField } from '@/components/form-field';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { TeacherProfileFields } from '@/components/teacher-profile-fields';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { index, show, update } from '@/routes/admin/teachers';
import type { Teacher } from '@/types';

type EditTeacherProps = {
    teacher: Teacher;
};

export default function EditTeacher({ teacher }: EditTeacherProps) {
    return (
        <AdminLayout active="teachers" title="Edit Guru">
            <Head title={`Edit ${teacher.name}`} />
            <PageTransition>
                <PageHeader
                    title="Edit guru"
                    description={`Perbarui akun dan profil ${teacher.name}.`}
                    breadcrumbs={[
                        { label: 'Data guru', href: index.url() },
                        { label: teacher.name, href: show.url(teacher.id) },
                        { label: 'Edit' },
                    ]}
                />
                <Form
                    action={update.form(teacher.id).action}
                    method={update.form(teacher.id).method}
                    resetOnSuccess={[
                        'password',
                        'password_confirmation',
                        'photo',
                    ]}
                    className="max-w-4xl"
                >
                    {({ errors, processing, progress }) => (
                        <div className="space-y-6">
                            <Card className="p-5 sm:p-7">
                                <h2 className="font-heading text-lg font-bold">
                                    Informasi akun
                                </h2>
                                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                    <FormField
                                        htmlFor="name"
                                        label="Nama lengkap"
                                        error={errors.name}
                                        required
                                    >
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={teacher.name}
                                            required
                                            autoFocus
                                        />
                                    </FormField>
                                    <FormField
                                        htmlFor="email"
                                        label="Email"
                                        error={errors.email}
                                        required
                                    >
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={teacher.email}
                                            required
                                            autoComplete="email"
                                        />
                                    </FormField>
                                    <FormField
                                        htmlFor="password"
                                        label="Password baru"
                                        error={errors.password}
                                        hint="Kosongkan jika password tidak diubah."
                                    >
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                        />
                                    </FormField>
                                    <FormField
                                        htmlFor="password_confirmation"
                                        label="Konfirmasi password baru"
                                    >
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            autoComplete="new-password"
                                        />
                                    </FormField>
                                </div>
                            </Card>
                            <Card className="p-5 sm:p-7">
                                <h2 className="font-heading text-lg font-bold">
                                    Profil guru
                                </h2>
                                <div className="mt-6">
                                    <TeacherProfileFields
                                        errors={errors}
                                        teacher={teacher}
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
                            <div className="flex flex-wrap justify-end gap-3">
                                <Link
                                    href={show(teacher.id)}
                                    className={buttonVariants({
                                        variant: 'secondary',
                                    })}
                                >
                                    <ArrowLeft className="size-4" /> Batal
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />{' '}
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan perubahan'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </PageTransition>
        </AdminLayout>
    );
}

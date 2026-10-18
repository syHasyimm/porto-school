import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormField } from '@/components/form-field';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { TeacherProfileFields } from '@/components/teacher-profile-fields';
import { TeacherEducationEditor } from '@/components/teacher-education-editor';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { index, store } from '@/routes/admin/teachers';

export default function CreateTeacher() {
    return (
        <AdminLayout active="teachers" title="Tambah Guru">
            <Head title="Tambah Guru" />
            <PageTransition>
                <PageHeader
                    title="Tambah guru"
                    description="Buat akun login dan lengkapi profil guru."
                    breadcrumbs={[
                        { label: 'Data guru', href: index.url() },
                        { label: 'Tambah guru' },
                    ]}
                />
                <Form action={store()} resetOnSuccess className="max-w-4xl">
                    {({ errors, processing, progress, clearErrors }) => (
                        <div className="space-y-6">
                            <Card className="p-5 sm:p-7">
                                <h2 className="font-heading text-lg font-bold">
                                    Informasi akun
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Digunakan guru untuk masuk ke portal
                                    internal.
                                </p>
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
                                            required
                                            autoComplete="email"
                                        />
                                    </FormField>
                                    <FormField
                                        htmlFor="password"
                                        label="Password"
                                        error={errors.password}
                                        required
                                    >
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            autoComplete="new-password"
                                        />
                                    </FormField>
                                    <FormField
                                        htmlFor="password_confirmation"
                                        label="Konfirmasi password"
                                        required
                                    >
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            required
                                            autoComplete="new-password"
                                        />
                                    </FormField>
                                </div>
                            </Card>
                            <Card className="p-5 sm:p-7">
                                <h2 className="font-heading text-lg font-bold">
                                    Profil guru
                                </h2>
                                <p className="mt-1 mb-6 text-sm text-slate-500">
                                    Data profesional dan informasi yang akan
                                    tampil di situs.
                                </p>
                                <TeacherProfileFields errors={errors} />
                            </Card>
                            <TeacherEducationEditor
                                clearErrors={clearErrors}
                                errors={errors}
                                processing={processing}
                            />
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
                                    href={index()}
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
                                        : 'Simpan guru'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </PageTransition>
        </AdminLayout>
    );
}

import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, School } from 'lucide-react';
import { FormField } from '@/components/form-field';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { home } from '@/routes';
import { store } from '@/routes/login';

export default function Login() {
    return (
        <main className="grid min-h-[100dvh] bg-slate-50 lg:grid-cols-[0.9fr_1.1fr]">
            <Head title="Login" />
            <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <Link
                    href={home()}
                    className="flex items-center gap-3 font-heading font-bold"
                >
                    <span className="grid size-10 place-items-center rounded-xl bg-brand-500">
                        <School className="size-5" />
                    </span>
                    SD Negeri 001 Kepenuhan
                </Link>
                <div className="max-w-lg">
                    <p className="text-sm font-bold text-blue-300">
                        Portal internal sekolah
                    </p>
                    <h1 className="mt-4 font-heading text-4xl leading-tight font-extrabold">
                        Kelola informasi sekolah dengan lebih teratur.
                    </h1>
                    <p className="mt-5 leading-7 text-slate-400">
                        Akses khusus untuk administrator dan guru SD Negeri 001
                        Kepenuhan.
                    </p>
                </div>
                <p className="text-xs text-slate-500">
                    Sistem informasi sekolah
                </p>
            </section>

            <section className="grid place-items-center px-4 py-10 sm:px-8">
                <PageTransition>
                    <div className="w-full max-w-md">
                        <Link
                            href={home()}
                            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-600 lg:hidden"
                        >
                            <ArrowLeft className="size-4" /> Beranda
                        </Link>
                        <div className="mb-8 lg:hidden">
                            <span className="grid size-11 place-items-center rounded-xl bg-brand-500 text-white">
                                <School className="size-5" />
                            </span>
                        </div>
                        <h2 className="font-heading text-3xl font-bold tracking-tight">
                            Masuk ke dashboard
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            Gunakan akun yang diberikan oleh sekolah.
                        </p>

                        <Form
                            action={store()}
                            resetOnError={['password']}
                            className="mt-8"
                        >
                            {({ errors, processing }) => (
                                <div className="flex flex-col gap-5">
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
                                            autoComplete="email"
                                            autoFocus
                                            required
                                            placeholder="nama@sekolah.sch.id"
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
                                            autoComplete="current-password"
                                            required
                                            placeholder="Masukkan password"
                                        />
                                    </FormField>
                                    <label className="flex items-center gap-2 text-sm text-slate-600">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            value="1"
                                            className="size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                                        />
                                        Ingat saya
                                    </label>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        {processing ? 'Memproses...' : 'Masuk'}
                                    </Button>
                                </div>
                            )}
                        </Form>
                    </div>
                </PageTransition>
            </section>
        </main>
    );
}

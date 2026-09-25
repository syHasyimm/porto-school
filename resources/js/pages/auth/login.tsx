import { Form, Head } from '@inertiajs/react';
import { School } from 'lucide-react';
import { store } from '@/routes/login';

export default function Login() {
    return (
        <>
            <Head title="Login" />

            <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10 dark:bg-slate-950">
                <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
                                <School aria-hidden="true" className="size-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    Portal Sekolah
                                </p>
                                <h1 className="text-xl font-bold text-slate-950 dark:text-white">
                                    SD Negeri 001 Kepenuhan
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                                Masuk ke dashboard
                            </h2>
                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                                Gunakan akun admin atau guru yang telah
                                diberikan oleh sekolah.
                            </p>
                        </div>

                        <Form action={store()} resetOnError={['password']}>
                            {({ errors, processing }) => (
                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="email"
                                            className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            autoFocus
                                            required
                                            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                            placeholder="nama@sekolah.sch.id"
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="password"
                                            className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                                        >
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                            placeholder="Masukkan password"
                                        />
                                        {errors.password && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            value="1"
                                            className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700"
                                        />
                                        Ingat saya
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="h-11 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {processing ? 'Memproses...' : 'Masuk'}
                                    </button>
                                </div>
                            )}
                        </Form>
                    </div>
                </section>
            </main>
        </>
    );
}

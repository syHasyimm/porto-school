import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Newspaper } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageTransition } from '@/components/page-transition';
import { Pagination } from '@/components/pagination';
import PublicLayout from '@/layouts/public-layout';
import { show } from '@/routes/news';
import type { NewsSummary, Paginated } from '@/types';

type PublicNewsIndexProps = { articles: Paginated<NewsSummary> };

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

export default function PublicNewsIndex({ articles }: PublicNewsIndexProps) {
    return (
        <PublicLayout>
            <Head title="Berita Sekolah" />
            <PageTransition>
                <section className="border-b border-slate-200 bg-slate-50">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                        <p className="text-sm font-bold text-brand-600">
                            Kabar terbaru
                        </p>
                        <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Berita SD Negeri 001 Kepenuhan
                        </h1>
                        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                            Ikuti kegiatan, pencapaian, dan informasi terbaru
                            dari lingkungan sekolah.
                        </p>
                    </div>
                </section>
                <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    {articles.data.length === 0 ? (
                        <EmptyState
                            icon={Newspaper}
                            title="Belum ada berita"
                            description="Berita sekolah yang sudah diterbitkan akan tampil di sini."
                        />
                    ) : (
                        <>
                            <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                                {articles.data.map((article) => (
                                    <article key={article.id}>
                                        <Link
                                            href={show(article.slug)}
                                            className="group block"
                                        >
                                            <div className="grid aspect-[16/10] place-items-center overflow-hidden rounded-xl bg-slate-100">
                                                {article.thumbnail_url ? (
                                                    <img
                                                        src={
                                                            article.thumbnail_url
                                                        }
                                                        alt={`Thumbnail ${article.title}`}
                                                        className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                                    />
                                                ) : (
                                                    <Newspaper className="size-9 text-slate-400" />
                                                )}
                                            </div>
                                            <time className="mt-5 block text-xs font-bold text-brand-600">
                                                {article.published_at
                                                    ? dateFormatter.format(
                                                          new Date(
                                                              article.published_at,
                                                          ),
                                                      )
                                                    : ''}
                                            </time>
                                            <h2 className="mt-2 font-heading text-xl leading-snug font-bold text-slate-950 transition group-hover:text-brand-600">
                                                {article.title}
                                            </h2>
                                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                                                {article.excerpt}
                                            </p>
                                            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-600">
                                                Baca selengkapnya
                                                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                                            </span>
                                        </Link>
                                    </article>
                                ))}
                            </div>
                            <div className="mt-12 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <Pagination
                                    from={articles.from}
                                    to={articles.to}
                                    total={articles.total}
                                    links={articles.links}
                                />
                            </div>
                        </>
                    )}
                </main>
            </PageTransition>
        </PublicLayout>
    );
}

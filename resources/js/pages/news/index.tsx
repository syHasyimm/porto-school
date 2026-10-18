import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Newspaper } from 'lucide-react';
import { EditorialImage } from '@/components/editorial-image';
import { EmptyState } from '@/components/empty-state';
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

function PublishedDate({ article }: { article: NewsSummary }) {
    if (!article.published_at) return null;
    return (
        <time
            dateTime={article.published_at}
            className="text-xs font-semibold text-slate-500"
        >
            {dateFormatter.format(new Date(article.published_at))}
        </time>
    );
}

export default function PublicNewsIndex({ articles }: PublicNewsIndexProps) {
    const { name } = usePage().props;
    const featured = articles.current_page === 1 ? articles.data[0] : undefined;
    const remaining = featured ? articles.data.slice(1) : articles.data;

    return (
        <PublicLayout>
            <Head title="Berita Sekolah">
                <meta
                    name="description"
                    content={`Kabar kegiatan, pencapaian, dan informasi terbaru dari ${name}.`}
                />
            </Head>
            <main data-entrance="blocks" className="bg-[#f8f7f3]">
                <header className="border-b border-[#e6e5e0]">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 pt-10 pb-8 sm:px-6 lg:px-8">
                        <div data-reveal="headline">
                            <p className="text-sm font-bold text-brand-700">
                                Berita sekolah
                            </p>
                            <h1 className="mt-3 font-heading text-[clamp(2rem,3.8vw,3rem)] leading-tight font-extrabold tracking-tight text-balance">
                                Kabar dari sekolah
                                <span className="text-brand-700">.</span>
                            </h1>
                            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                                Kegiatan, pencapaian, dan cerita terbaru dari{' '}
                                {name}.
                            </p>
                        </div>
                        <p
                            data-reveal="right"
                            className="text-xs leading-6 text-slate-500 md:border-l md:border-[#d7dce5] md:pl-5"
                        >
                            <span className="mr-1 font-bold text-slate-800 tabular-nums md:mr-0 md:block md:font-heading md:text-2xl">
                                {articles.total}
                            </span>{' '}
                            berita diterbitkan
                        </p>
                    </div>
                </header>
                <section
                    aria-label="Berita yang diterbitkan"
                    className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8 lg:pb-20"
                >
                    {articles.data.length === 0 ? (
                        <div
                            data-reveal="scale"
                            className="rounded-3xl border border-dashed border-[#d4dce8] bg-white py-8"
                        >
                            <EmptyState
                                icon={Newspaper}
                                title="Belum ada berita"
                                description="Kabar sekolah akan tampil di sini setelah diterbitkan."
                            />
                        </div>
                    ) : (
                        <>
                            {featured && (
                                <article>
                                    <Link
                                        href={show(featured.slug)}
                                        prefetch
                                        className="group grid overflow-hidden rounded-[1.75rem] border border-[#dce3ee] bg-white transition-colors hover:border-brand-700/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 lg:grid-cols-[1.1fr_1fr]"
                                    >
                                        <div
                                            data-reveal="image"
                                            className="relative overflow-hidden bg-[#e8eef8] lg:min-h-88"
                                        >
                                            <EditorialImage
                                                src={featured.thumbnail_url}
                                                alt={featured.title}
                                                loading="eager"
                                                className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
                                            />
                                        </div>
                                        <div
                                            data-reveal="feature-copy"
                                            className="flex flex-col items-start p-6 sm:p-8 lg:p-10"
                                        >
                                            <p className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-brand-700">
                                                <span
                                                    aria-hidden="true"
                                                    className="size-1.5 rounded-full bg-brand-700"
                                                />
                                                Berita terbaru
                                            </p>
                                            <PublishedDate article={featured} />
                                            <h2 className="mt-3 max-w-lg font-heading text-2xl leading-tight font-bold tracking-tight text-pretty text-slate-950 transition-colors group-hover:text-brand-700 sm:text-3xl">
                                                {featured.title}
                                            </h2>
                                            <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-600">
                                                {featured.excerpt}
                                            </p>
                                            <span className="mt-7 inline-flex min-h-11 items-center gap-3 rounded-full bg-brand-700 px-5 py-3 text-xs font-bold text-white transition-colors group-hover:bg-brand-600">
                                                Baca cerita
                                                <ArrowUpRight
                                                    aria-hidden="true"
                                                    className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                                                />
                                            </span>
                                        </div>
                                    </Link>
                                </article>
                            )}
                            {remaining.length > 0 && (
                                <section
                                    aria-labelledby="news-list-heading"
                                    className={featured ? 'mt-12' : ''}
                                >
                                    <div
                                        data-reveal
                                        className="mb-7 flex items-end justify-between gap-4 border-b border-[#e1e3e8] pb-5"
                                    >
                                        <h2
                                            id="news-list-heading"
                                            className="font-heading text-xl font-bold tracking-tight"
                                        >
                                            {featured
                                                ? 'Berita lainnya'
                                                : 'Arsip berita'}
                                        </h2>
                                        <span className="text-xs text-slate-500">
                                            Halaman {articles.current_page}
                                        </span>
                                    </div>
                                    <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                                        {remaining.map((article) => (
                                            <article
                                                data-reveal="news-card"
                                                key={article.id}
                                            >
                                                <Link
                                                    href={show(article.slug)}
                                                    prefetch
                                                    className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                                                >
                                                    <div className="mb-5 overflow-hidden rounded-2xl">
                                                        <EditorialImage
                                                            src={
                                                                article.thumbnail_url
                                                            }
                                                            alt={article.title}
                                                            className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none"
                                                        />
                                                    </div>
                                                    <PublishedDate
                                                        article={article}
                                                    />
                                                    <h3 className="mt-3 font-heading text-xl leading-7 font-bold tracking-tight text-pretty text-slate-950 transition-colors group-hover:text-brand-700">
                                                        {article.title}
                                                    </h3>
                                                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                                                        {article.excerpt}
                                                    </p>
                                                    <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-brand-700">
                                                        Baca selengkapnya
                                                        <ArrowUpRight
                                                            aria-hidden="true"
                                                            className="size-4"
                                                        />
                                                    </span>
                                                </Link>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            )}
                            {articles.last_page > 1 && (
                                <div
                                    data-reveal
                                    className="mt-12 overflow-hidden rounded-2xl border border-[#dce3ee] bg-white"
                                >
                                    <Pagination
                                        from={articles.from}
                                        to={articles.to}
                                        total={articles.total}
                                        links={articles.links}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </PublicLayout>
    );
}

import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, CalendarDays } from 'lucide-react';
import { EditorialImage } from '@/components/editorial-image';
import { NewsBody } from '@/components/news-body';
import PublicLayout from '@/layouts/public-layout';
import { index, show } from '@/routes/news';
import type { NewsArticle, NewsSummary } from '@/types';

type PublicNewsShowProps = {
    article: NewsArticle;
    relatedNews: NewsSummary[];
};
const dateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' });

export default function PublicNewsShow({
    article,
    relatedNews,
}: PublicNewsShowProps) {
    const { name } = usePage().props;
    const hasSeparateExcerpt =
        article.excerpt.trim() !== article.content.trim();

    return (
        <PublicLayout>
            <Head title={article.title}>
                <meta name="description" content={article.excerpt} />
            </Head>
            <main data-entrance="blocks" className="bg-[#f8f7f3]">
                <article className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6 lg:px-8 lg:pt-10 lg:pb-20">
                    <header
                        data-reveal="headline"
                        className="mx-auto max-w-3xl"
                    >
                        <Link
                            href={index()}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg text-xs font-bold text-brand-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                        >
                            <ArrowLeft aria-hidden="true" className="size-4" />
                            Semua berita
                        </Link>
                        <p className="mt-7 text-xs font-bold text-brand-700">
                            Kabar sekolah / {article.category_label ?? 'Umum'}
                        </p>
                        <h1 className="mt-4 font-heading text-3xl leading-tight font-extrabold tracking-tight text-pretty text-slate-950 sm:text-4xl lg:text-5xl">
                            {article.title}
                        </h1>
                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-[#dce1e9] pb-7 text-xs font-medium text-slate-500">
                            {article.published_at && (
                                <time
                                    dateTime={article.published_at}
                                    className="inline-flex items-center gap-2"
                                >
                                    <CalendarDays
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    {dateFormatter.format(
                                        new Date(article.published_at),
                                    )}
                                </time>
                            )}
                            <span>{name}</span>
                        </div>
                        {hasSeparateExcerpt && (
                            <p className="mt-7 text-lg leading-8 text-slate-600">
                                {article.excerpt}
                            </p>
                        )}
                    </header>
                    {article.thumbnail_url && (
                        <figure
                            data-reveal="image"
                            className="mt-9 overflow-hidden rounded-[1.5rem]"
                        >
                            <EditorialImage
                                src={article.thumbnail_url}
                                alt={article.title}
                                loading="eager"
                                className="aspect-[16/9] w-full object-cover sm:aspect-[16/7]"
                            />
                        </figure>
                    )}
                    <div
                        data-reveal="article-body"
                        className="mx-auto mt-9 max-w-3xl"
                    >
                        <NewsBody
                            article={article}
                            className="text-base leading-8 sm:text-[17px] sm:leading-9"
                        />
                    </div>
                    <footer
                        data-reveal
                        className="mx-auto mt-12 max-w-3xl border-t border-[#dce1e9] pt-6"
                    >
                        <p className="text-xs leading-6 text-slate-500">
                            Informasi dari {name}.
                        </p>
                    </footer>
                </article>
                {relatedNews.length > 0 && (
                    <section
                        aria-labelledby="related-news-heading"
                        className="border-t border-[#e6e5e0]"
                    >
                        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
                            <div
                                data-reveal
                                className="mb-7 flex flex-wrap items-end justify-between gap-4"
                            >
                                <div>
                                    <p className="text-xs font-bold text-brand-700">
                                        Kabar sekolah
                                    </p>
                                    <h2
                                        id="related-news-heading"
                                        className="mt-2 font-heading text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
                                    >
                                        Berita lainnya
                                    </h2>
                                </div>
                                <Link
                                    href={index()}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-lg text-xs font-bold text-brand-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                                >
                                    Lihat semua berita
                                    <ArrowUpRight
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </Link>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {relatedNews.map((relatedArticle) => (
                                    <article
                                        data-reveal="news-card"
                                        key={relatedArticle.id}
                                    >
                                        <Link
                                            href={show(relatedArticle.slug)}
                                            prefetch
                                            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#dce3ee] bg-white transition-colors hover:border-brand-700/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                                        >
                                            <div className="overflow-hidden bg-[#e8eef8]">
                                                <EditorialImage
                                                    src={
                                                        relatedArticle.thumbnail_url
                                                    }
                                                    alt={relatedArticle.title}
                                                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none"
                                                />
                                            </div>
                                            <div className="flex flex-1 flex-col p-5">
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
                                                    <span className="text-brand-700">
                                                        {relatedArticle.category_label ??
                                                            'Umum'}
                                                    </span>
                                                    {relatedArticle.published_at && (
                                                        <time
                                                            dateTime={
                                                                relatedArticle.published_at
                                                            }
                                                            className="text-slate-500"
                                                        >
                                                            {dateFormatter.format(
                                                                new Date(
                                                                    relatedArticle.published_at,
                                                                ),
                                                            )}
                                                        </time>
                                                    )}
                                                </div>
                                                <h3 className="mt-3 font-heading text-lg leading-7 font-bold tracking-tight text-pretty text-slate-950 transition-colors group-hover:text-brand-700">
                                                    {relatedArticle.title}
                                                </h3>
                                                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                                                    {relatedArticle.excerpt}
                                                </p>
                                                <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-xs font-bold text-brand-700">
                                                    Baca selengkapnya
                                                    <ArrowUpRight
                                                        aria-hidden="true"
                                                        className="size-4"
                                                    />
                                                </span>
                                            </div>
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </PublicLayout>
    );
}

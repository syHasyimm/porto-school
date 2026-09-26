import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Newspaper } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { buttonVariants } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { index } from '@/routes/news';
import type { NewsArticle } from '@/types';

type PublicNewsShowProps = { article: NewsArticle };

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
});

export default function PublicNewsShow({ article }: PublicNewsShowProps) {
    return (
        <PublicLayout>
            <Head title={article.title} />
            <PageTransition>
                <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                    <Link
                        href={index()}
                        className={buttonVariants({ variant: 'ghost' })}
                    >
                        <ArrowLeft className="size-4" /> Semua berita
                    </Link>
                    <article className="mt-6">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="inline-flex items-center gap-2 text-sm font-bold text-brand-600">
                                <CalendarDays className="size-4" />
                                {article.published_at
                                    ? dateFormatter.format(
                                          new Date(article.published_at),
                                      )
                                    : ''}
                            </div>
                            <h1 className="mt-4 font-heading text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                                {article.title}
                            </h1>
                        </div>
                        <div className="mt-10 grid aspect-[16/8] place-items-center overflow-hidden rounded-2xl bg-slate-100">
                            {article.thumbnail_url ? (
                                <img
                                    src={article.thumbnail_url}
                                    alt={`Thumbnail ${article.title}`}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <Newspaper className="size-14 text-slate-400" />
                            )}
                        </div>
                        <div className="mx-auto mt-10 max-w-3xl text-base leading-8 whitespace-pre-line text-slate-700">
                            {article.content}
                        </div>
                    </article>
                </main>
            </PageTransition>
        </PublicLayout>
    );
}

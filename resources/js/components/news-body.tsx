import type { NewsArticle } from '@/types';
import { cn } from '@/lib/utils';

type NewsBodyProps = {
    article: NewsArticle;
    className?: string;
};

export function NewsBody({ article, className }: NewsBodyProps) {
    if (article.content_html) {
        return (
            <div
                className={cn(
                    'news-body break-words text-slate-700',
                    className,
                )}
                dangerouslySetInnerHTML={{ __html: article.content_html }}
            />
        );
    }

    return (
        <div
            className={cn(
                'break-words whitespace-pre-line text-slate-700',
                className,
            )}
        >
            {article.content}
        </div>
    );
}

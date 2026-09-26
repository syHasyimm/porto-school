export type NewsSummary = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail_url: string | null;
    published_at: string | null;
    status?: 'draft' | 'published';
    created_at?: string | null;
};

export type NewsArticle = NewsSummary & {
    content: string;
};

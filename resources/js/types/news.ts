export type NewsSummary = {
    id: number;
    title: string;
    category?: string;
    category_label?: string;
    slug: string;
    excerpt: string;
    thumbnail_url: string | null;
    published_at: string | null;
    status?: 'draft' | 'published';
    created_at?: string | null;
};

export type NewsArticle = NewsSummary & {
    content: string;
    content_html: string | null;
};

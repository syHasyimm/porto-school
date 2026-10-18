export type SchoolHistoryEntry = {
    id: number;
    period: string;
    title: string;
    description: string;
    photo_url: string | null;
};

export type SchoolHistoryItem = SchoolHistoryEntry & {
    is_published: boolean;
    sort_order: number;
};

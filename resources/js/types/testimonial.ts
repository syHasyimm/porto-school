export type TestimonialSummary = {
    id: number;
    name: string;
    graduation_year: number | null;
    content: string;
    photo_url: string | null;
};

export type TestimonialItem = TestimonialSummary & {
    is_published: boolean;
    sort_order: number;
};

export type TeacherEducation = {
    level: string;
    institution: string;
    field_of_study: string | null;
    graduation_year: number | null;
};

export type Teacher = {
    id: number;
    name: string;
    email: string;
    nip: string | null;
    phone: string | null;
    address: string | null;
    birth_date: string | null;
    subject: string | null;
    bio: string | null;
    photo_url: string | null;
    education_history: TeacherEducation[];
};

export type PublicTeacher = Pick<
    Teacher,
    'id' | 'name' | 'subject' | 'bio' | 'photo_url' | 'education_history'
>;

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

export type AcademicEvent = {
    id: number;
    title: string;
    description: string | null;
    category: 'libur' | 'ujian' | 'kegiatan' | 'pengumuman';
    category_label: string;
    start_date: string;
    end_date: string | null;
    color: string;
};

export type SelectOption = {
    label: string;
    value: string;
};

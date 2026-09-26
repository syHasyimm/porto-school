export type ComplaintStatus = 'baru' | 'diproses' | 'selesai';

export type ComplaintSummary = {
    id: number;
    reference_number: string;
    reporter_name: string;
    student_name: string;
    student_class: string;
    category: string;
    category_label: string;
    status: ComplaintStatus;
    status_label: string;
    created_at: string | null;
};

export type ComplaintResponse = {
    id: number;
    response: string;
    responder_name: string;
    created_at: string | null;
};

export type Complaint = ComplaintSummary & {
    email: string;
    phone: string;
    body: string;
    has_attachment: boolean;
    responses: ComplaintResponse[];
};

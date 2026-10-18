export type TeacherContact = {
    id: number;
    name: string;
    phone: string | null;
    is_active: boolean;
    notifications_enabled: boolean;
    phone_valid: boolean;
};

export type WhatsAppSettings = {
    token_configured: boolean;
    token_mask: string | null;
    reminders_enabled: boolean;
    send_time: string;
    timezone: string;
    admin_phone: string | null;
};

export type WhatsAppDelivery = {
    id: number;
    kind: 'reminder' | 'test';
    event_title: string;
    recipient_name: string;
    phone: string;
    reminder_date: string;
    timezone: string;
    status:
        | 'pending'
        | 'sending'
        | 'accepted'
        | 'failed'
        | 'needs_review'
        | 'skipped';
    status_label: string;
    attempts: number;
    available_at: string;
    started_at: string | null;
    finished_at: string | null;
    accepted_at: string | null;
    failure_reason: string | null;
    message: string | null;
    provider_ids: string[];
    provider_request_id: string | null;
    attempt_history: { status: string; at: string; reason: string | null }[];
    can_retry: boolean;
};

import type { PropsWithChildren } from 'react';
import DashboardLayout, {
    adminNavigation,
    type DashboardNavKey,
} from '@/layouts/dashboard-layout';
import { dashboard } from '@/routes/admin';
import { index as calendarIndex } from '@/routes/admin/calendar';
import { index as complaintsIndex } from '@/routes/admin/complaints';
import { index as galleryIndex } from '@/routes/admin/gallery';
import { index as newsIndex } from '@/routes/admin/news';
import { edit as settingsEdit } from '@/routes/admin/settings';
import { index as teachersIndex } from '@/routes/admin/teachers';
import { index as testimonialsIndex } from '@/routes/admin/testimonials';
import { index as usersIndex } from '@/routes/admin/users';
import { index as contactsIndex } from '@/routes/admin/teacher-contacts';
import { edit as whatsappSettingsEdit } from '@/routes/admin/whatsapp/settings';
import { index as whatsappHistoryIndex } from '@/routes/admin/whatsapp/deliveries';

type AdminLayoutProps = PropsWithChildren<{
    active: DashboardNavKey;
    title: string;
}>;

export default function AdminLayout({
    active,
    children,
    title,
}: AdminLayoutProps) {
    const hrefs: Partial<Record<DashboardNavKey, string>> = {
        dashboard: dashboard.url(),
        calendar: calendarIndex.url(),
        teachers: teachersIndex.url(),
        users: usersIndex.url(),
        complaints: complaintsIndex.url(),
        'teacher-contacts': contactsIndex.url(),
        'whatsapp-settings': whatsappSettingsEdit.url(),
        'whatsapp-history': whatsappHistoryIndex.url(),
        news: newsIndex.url(),
        gallery: galleryIndex.url(),
        testimonials: testimonialsIndex.url(),
        settings: settingsEdit.url(),
    };
    const navigation = adminNavigation.map((item) => ({
        ...item,
        href: hrefs[item.key],
    }));

    return (
        <DashboardLayout
            active={active}
            dashboardHref={dashboard.url()}
            navigation={navigation}
            title={title}
        >
            {children}
        </DashboardLayout>
    );
}

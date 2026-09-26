import type { PropsWithChildren } from 'react';
import DashboardLayout, {
    adminNavigation,
    type DashboardNavKey,
} from '@/layouts/dashboard-layout';
import { dashboard } from '@/routes/admin';
import { index as calendarIndex } from '@/routes/admin/calendar';
import { index as teachersIndex } from '@/routes/admin/teachers';

type AdminLayoutProps = PropsWithChildren<{
    active: DashboardNavKey;
    title: string;
}>;

export default function AdminLayout({
    active,
    children,
    title,
}: AdminLayoutProps) {
    const navigation = adminNavigation.map((item) => {
        if (item.key === 'teachers') {
            return { ...item, href: teachersIndex.url() };
        }

        if (item.key === 'calendar') {
            return { ...item, href: calendarIndex.url() };
        }

        return item;
    });

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

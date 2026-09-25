import type { PropsWithChildren } from 'react';
import DashboardLayout, {
    adminNavigation,
    type DashboardNavKey,
} from '@/layouts/dashboard-layout';
import { dashboard } from '@/routes/admin';
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
    const navigation = adminNavigation.map((item) =>
        item.key === 'teachers' ? { ...item, href: teachersIndex.url() } : item,
    );

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

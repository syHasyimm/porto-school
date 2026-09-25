import type { PropsWithChildren } from 'react';
import DashboardLayout, {
    guruNavigation,
    type DashboardNavKey,
} from '@/layouts/dashboard-layout';
import { dashboard } from '@/routes/guru';
import { edit as editProfile } from '@/routes/guru/profile';

type GuruLayoutProps = PropsWithChildren<{
    active: DashboardNavKey;
    title: string;
}>;

export default function GuruLayout({
    active,
    children,
    title,
}: GuruLayoutProps) {
    const navigation = guruNavigation.map((item) =>
        item.key === 'profile' ? { ...item, href: editProfile.url() } : item,
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

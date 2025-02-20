import { Suspense } from 'react';
import { Metadata } from 'next';
import DashboardLoading from './loading';

export const metadata: Metadata = {
  title: 'Dashboard | Learning Platform',
  description: 'Manage your lessons and schedule'
};

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
}

export default function DashboardLayout({ children }: Readonly<DashboardLayoutProps>) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<DashboardLoading />}>
        {/* Add dashboard navigation/layout here */}
        {children}
      </Suspense>
    </div>
  );
} 
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV, isNavItemActive } from '@molecules/AdminSidebar/admin-nav';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/atoms/breadcrumb';
import { Separator } from '@/components/atoms/separator';
import { SidebarTrigger } from '@/components/atoms/sidebar';
import { ROUTES } from '@/lib/constants/routes';

/**
 * Sticky header for the inset content panel: sidebar toggle plus a breadcrumb
 * derived from the nav config, after shadcn's `sidebar-07` / `dashboard-01`.
 */
export default function AdminSiteHeader() {
  const pathname = usePathname();
  const current = ADMIN_NAV.find((item) => isNavItemActive(item, pathname));
  const isDashboard = pathname === ROUTES.ADMIN.DASHBOARD;

  return (
    <header className="bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b backdrop-blur md:rounded-t-xl">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4!" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className={isDashboard ? undefined : 'hidden md:block'}>
              {isDashboard ? (
                <BreadcrumbPage>Admin</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={ROUTES.ADMIN.DASHBOARD}>Admin</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {current && !isDashboard && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{current.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}

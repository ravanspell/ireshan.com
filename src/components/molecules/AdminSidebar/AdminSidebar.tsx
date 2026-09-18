'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminNavUser, { type AdminUser } from '@molecules/AdminNavUser/AdminNavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/atoms/sidebar';
import { ADMIN_NAV, ADMIN_SITE_LINKS, isNavItemActive } from './admin-nav';

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: AdminUser | null;
}

/**
 * CMS sidebar, after shadcn's `sidebar-07` / `dashboard-01` blocks.
 *
 * Collapses to an icon rail on desktop (⌘B or the header trigger) and becomes
 * an off-canvas sheet on mobile - both handled by the `Sidebar` primitive.
 */
export default function AdminSidebar({ user, ...props }: AdminSidebarProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  // The mobile sheet stays open across client navigations unless told otherwise.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className='flex flex-col gap-2 p-2'>
          <div className='flex gap-2 justify-center items-center'>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg font-heading text-sm font-bold">
              AC
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Admin Center</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isNavItemActive(item, pathname)}
                  >
                    <Link href={item.href} onClick={closeOnMobile}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_SITE_LINKS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild size="sm" tooltip={item.title}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter>
          <AdminNavUser user={user} />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}

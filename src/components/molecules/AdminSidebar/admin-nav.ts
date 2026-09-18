import { ExternalLink, FilePen, LayoutDashboard, Newspaper, type LucideIcon } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import type { RouteMatch } from '@/lib/constants/routes';

export interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** `exact` for `/admin`, which would otherwise match every admin page. */
  match: RouteMatch;
}

/** Primary CMS navigation. Also the source of the header breadcrumb titles. */
export const ADMIN_NAV: readonly AdminNavItem[] = [
  { title: 'Dashboard', href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard, match: 'exact' },
  { title: 'Editor', href: ROUTES.ADMIN.EDITOR, icon: FilePen, match: 'prefix' },
];

/** Links out of the admin to the public site, opened in a new tab. */
export const ADMIN_SITE_LINKS: readonly Omit<AdminNavItem, 'match'>[] = [
  { title: 'View blog', href: ROUTES.BLOG.INDEX, icon: Newspaper },
  { title: 'View site', href: ROUTES.HOME, icon: ExternalLink },
];

export function isNavItemActive(item: AdminNavItem, pathname: string): boolean {
  return item.match === 'exact'
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

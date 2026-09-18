import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import AdminSidebar from '@molecules/AdminSidebar/AdminSidebar';
import AdminSiteHeader from '@molecules/AdminSiteHeader/AdminSiteHeader';
import type { AdminUser } from '@molecules/AdminNavUser/AdminNavUser';
import { SidebarInset, SidebarProvider } from '@/components/atoms/sidebar';
import { resolve } from '@/lib/di/container';
import { AuthController } from '@controllers/auth.controller';

/** Only the fields the sidebar shows - the full Supabase user never reaches the client. */
async function getAdminUser(): Promise<AdminUser | null> {
  const result = await resolve(AuthController).getCurrentUser();
  const user = result.success ? result.data : null;

  if (!user?.email) return null;

  const meta = user.user_metadata ?? {};

  return {
    name: meta.full_name ?? meta.name ?? user.email.split('@')[0],
    email: user.email,
    avatarUrl: meta.avatar_url,
  };
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [cookieStore, user] = await Promise.all([cookies(), getAdminUser()]);
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <NextTopLoader showSpinner={false} />
      <AdminSidebar variant="inset" user={user} />
      <SidebarInset className="md:peer-data-[variant=inset]:border">
        <AdminSiteHeader />
        <main className="flex flex-1 flex-col p-4 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

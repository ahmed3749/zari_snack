import Link from "next/link";

import AdminNotifications from "@/components/AdminNotifications";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { getAdminSession } from "@/lib/admin-auth";
import { getAdminNotifications } from "@/lib/restaurant-data";

export default async function AdminNav() {
  const session = await getAdminSession();
  const notifications = session
    ? await getAdminNotifications()
    : { unreadCount: 0, notifications: [] };

  return (
    <header className="border-b border-slate-200 bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="text-lg font-semibold">Admin Restaurant</div>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {session ? (
            <>
              <Link href="/admin/dashboard" className="transition hover:text-white">
                Tableau de bord
              </Link>
              <Link href="/admin/orders" className="transition hover:text-white">
                Commandes
              </Link>
              <Link href="/admin/menu" className="transition hover:text-white">
                Menu
              </Link>
              <Link href="/admin/settings" className="transition hover:text-white">
                Parametres
              </Link>
              <AdminNotifications
                adminId={session.adminId}
                notifications={notifications.notifications}
              />
              <AdminLogoutButton />
            </>
          ) : (
            <Link href="/admin/login" className="transition hover:text-white">
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

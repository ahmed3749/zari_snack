import AdminNavClient from "@/components/AdminNavClient";
import { getAdminSession } from "@/lib/admin-auth";
import { getAdminNotifications } from "@/lib/restaurant-data";

export default async function AdminNav() {
  const session = await getAdminSession();
  const notifications = session
    ? await getAdminNotifications()
    : { unreadCount: 0, notifications: [] };

  return (
    <AdminNavClient
      adminId={session?.adminId}
      notifications={notifications.notifications}
    />
  );
}

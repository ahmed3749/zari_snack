import SectionHeading from "../../../components/SectionHeading";

import { requireAdminSession } from "@/lib/admin-auth";
import { getDashboardData } from "@/lib/restaurant-data";

type DashboardOrder = Awaited<ReturnType<typeof getDashboardData>>["recentOrders"][number];

function formatPrice(value: number) {
  return `${value.toFixed(2)} DH`;
}

function getStatusBadge(status: string) {
  if (status === "NOUVELLE") {
    return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30";
  }

  if (status === "CONFIRMEE") {
    return "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30";
  }

  if (status === "PREPAREE") {
    return "bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/30";
  }

  if (status === "LIVREE") {
    return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30";
  }

  return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30";
}

export default async function AdminDashboardPage() {
  await requireAdminSession();
  const { settings, stats, recentOrders } = await getDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Tableau de bord"
        description="Vue d'ensemble des reservations, commandes et activite du restaurant."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-slate-900/90 p-6 text-slate-100 shadow-sm">
          <p className="text-sm text-slate-400">Commandes totales</p>
          <p className="mt-3 text-4xl font-semibold">{stats.totalOrders}</p>
          <p className="mt-2 text-sm text-slate-400">{stats.pendingOrders} a traiter</p>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-6 text-slate-100 shadow-sm">
          <p className="text-sm text-slate-400">Catalogue</p>
          <p className="mt-3 text-4xl font-semibold">{stats.activeProducts}</p>
          <p className="mt-2 text-sm text-slate-400">{stats.availableProducts} produits disponibles</p>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-6 text-slate-100 shadow-sm">
          <p className="text-sm text-slate-400">Categories actives</p>
          <p className="mt-3 text-4xl font-semibold">{stats.categories}</p>
          <p className="mt-2 text-sm text-slate-400">{settings?.restaurantName ?? "Restaurant"}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl bg-slate-900/90 p-6 text-slate-100 shadow-sm">
          <h2 className="text-xl font-semibold">Commandes recentes</h2>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Aucune commande enregistree pour le moment.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentOrders.map((order: DashboardOrder) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-lg">
                        🍽
                      </div>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-slate-400">{order.customerPhone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-950">
                        {formatPrice(Number(order.total))}
                      </p>
                      <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    {order.items.length} article(s) · {order.city}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-slate-900/90 p-6 text-slate-100 shadow-sm">
          <h2 className="text-xl font-semibold">Restaurant</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p><span className="font-semibold text-white">Nom:</span> {settings?.restaurantName ?? "Non configure"}</p>
            <p><span className="font-semibold text-white">WhatsApp:</span> {settings?.whatsappNumber ?? "Non configure"}</p>
            <p><span className="font-semibold text-white">Horaires:</span> {settings?.openingHours ?? "Non configure"}</p>
            <p><span className="font-semibold text-white">Frais de livraison:</span> {settings ? formatPrice(Number(settings.deliveryFee)) : "0.00 DH"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import SectionHeading from "../../../components/SectionHeading";

import { deleteSelectedOrders, updateOrderStatus } from "./actions";

import { requireAdminSession } from "@/lib/admin-auth";
import { getShortOrderReference } from "@/lib/order-reference";
import { ORDER_STATUSES, OrderStatus, type OrderStatus as OrderStatusValue } from "@/lib/order-status";
import { getOrdersList, getRestaurantSettings } from "@/lib/restaurant-data";

type OrdersList = Awaited<ReturnType<typeof getOrdersList>>;
type OrderRecord = OrdersList[number];
type OrderItemRecord = OrderRecord["items"][number];

function formatPrice(value: number) {
  return `${value.toFixed(2)} DH`;
}

function getStatusMeta(status: OrderStatusValue) {
  switch (status) {
    case OrderStatus.NOUVELLE:
      return {
        label: "Nouvelle",
        className: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
      };
    case OrderStatus.CONFIRMEE:
      return {
        label: "Confirmee",
        className: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30",
      };
    case OrderStatus.PREPAREE:
      return {
        label: "Preparee",
        className: "bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/30",
      };
    case OrderStatus.LIVREE:
      return {
        label: "Livree",
        className: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
      };
    default:
      return {
        label: "Annulee",
        className: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30",
      };
  }
}

function getStatusWhatsappMessage(status: OrderStatusValue) {
  switch (status) {
    case OrderStatus.NOUVELLE:
      return "Votre commande a bien ete recue et elle est en attente de traitement.";
    case OrderStatus.CONFIRMEE:
      return "Votre commande a ete confirmee et sera preparee tres bientot.";
    case OrderStatus.PREPAREE:
      return "Votre commande est prete et en cours de livraison.";
    case OrderStatus.LIVREE:
      return "Votre commande a ete livree. Merci pour votre confiance.";
    default:
      return "Votre commande a ete annulee. N'hesitez pas a nous contacter si besoin.";
  }
}

export default async function AdminOrdersPage() {
  await requireAdminSession();
  const [orders, settings]: [OrdersList, Awaited<ReturnType<typeof getRestaurantSettings>>] =
    await Promise.all([getOrdersList(), getRestaurantSettings()]);
  const restaurantName = settings?.restaurantName ?? "Restaurant";

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Commandes"
        description="L'admin recoit les commandes sur WhatsApp et les retrouve aussi ici pour les suivre et mettre a jour leur statut."
      />

      {orders.length === 0 ? (
        <div className="rounded-3xl bg-slate-900/90 p-8 text-slate-100 shadow-sm">
          <p>Aucune commande n&apos;a encore ete enregistree.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <form
            id="delete-orders-form"
            action={deleteSelectedOrders}
            className="flex flex-col gap-3 rounded-3xl bg-slate-900/90 p-5 text-slate-100 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold">Historique des commandes</h2>
              <p className="text-sm text-slate-400">
                Cochez les commandes a supprimer, puis cliquez sur le bouton de suppression.
              </p>
            </div>
            <button
              className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white"
              type="submit"
            >
              Supprimer la selection
            </button>
          </form>

          {orders.map((order: OrderRecord) => {
            const orderReference = getShortOrderReference(order.id);
            const statusMeta = getStatusMeta(order.status);
            const customerWhatsappNumber = order.customerPhone.replace(/\D/g, "");
            const whatsappMessage = [
              `Bonjour ${order.customerName},`,
              "",
              `${restaurantName} vous informe que la commande ${orderReference} est actuellement au statut "${statusMeta.label}".`,
              getStatusWhatsappMessage(order.status),
            ].join("\n");
            const whatsappLink = customerWhatsappNumber
              ? `https://wa.me/${customerWhatsappNumber}?text=${encodeURIComponent(
                  whatsappMessage
                )}`
              : null;

            return (
              <article key={order.id} className="rounded-3xl bg-slate-900/90 p-6 text-slate-100 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="orderIds"
                      value={order.id}
                      form="delete-orders-form"
                      className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 text-red-500"
                    />
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-lg">
                        🍽
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{order.customerName}</h2>
                        <p className="mt-1 text-sm text-slate-400">{order.customerPhone}</p>
                        <p className="mt-2 text-sm text-slate-400">
                          {order.deliveryAddress}, {order.city}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                          Commande {orderReference}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 lg:text-right">
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-950">
                        {formatPrice(Number(order.total))}
                      </span>
                    </div>

                    <form action={updateOrderStatus} className="flex flex-wrap gap-2 lg:justify-end">
                      <input type="hidden" name="id" value={order.id} />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
                      >
                        {ORDER_STATUSES.map((status: OrderStatusValue) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold" type="submit">
                        Mettre a jour
                      </button>
                    </form>

                    {whatsappLink ? (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
                      >
                        Ouvrir WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {order.items.map((item: OrderItemRecord) => (
                    <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-sm">
                            🍽
                          </span>
                          <p className="font-medium">{item.productName}</p>
                        </div>
                        <p className="text-sm text-slate-400">x{item.quantity}</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        {item.selectedSizeName ? `Taille: ${item.selectedSizeName}` : "Taille standard"}
                      </p>
                      <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-950">
                        {formatPrice(Number(item.subtotal))}
                      </p>
                    </div>
                  ))}
                </div>

                {order.note ? (
                  <p className="mt-4 text-sm text-amber-300">Note client: {order.note}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

import "server-only";

import { OrderStatus } from "@/lib/order-status";
import { getShortOrderReference } from "@/lib/order-reference";
import { prisma } from "@/lib/prisma";

export type AdminNotification = {
  id: string;
  title: string;
  description: string;
  href: string;
  createdAtLabel: string;
  unread: boolean;
};

function formatNotificationDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export async function getRestaurantSettings() {
  return prisma.restaurantSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });
}

export async function getPublicMenuCategories() {
  return prisma.category.findMany({
    where: {
      active: true,
      products: {
        some: {
          active: true,
          available: true,
        },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      products: {
        where: {
          active: true,
          available: true,
        },
        orderBy: { name: "asc" },
        include: {
          sizes: {
            orderBy: { priceModifier: "asc" },
          },
          optionLinks: {
            include: {
              sauce: true,
              extra: true,
              drink: true,
            },
          },
        },
      },
    },
  });
}

export async function getAdminMenuCategories() {
  return prisma.category.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      products: {
        orderBy: { name: "asc" },
        include: {
          sizes: {
            orderBy: { priceModifier: "asc" },
          },
          optionLinks: {
            include: {
              sauce: true,
              extra: true,
              drink: true,
            },
          },
        },
      },
    },
  });
}

export async function getAdminCatalogData() {
  const [categories, sauces, extras, drinks] = await Promise.all([
    getAdminMenuCategories(),
    prisma.sauce.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
    prisma.extra.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
    prisma.drink.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
  ]);

  return {
    categories,
    sauces,
    extras,
    drinks,
  };
}

export async function getDashboardData() {
  const [
    settings,
    totalOrders,
    pendingOrders,
    activeProducts,
    availableProducts,
    categories,
    recentOrders,
  ] = await Promise.all([
    getRestaurantSettings(),
    prisma.order.count(),
    prisma.order.count({
      where: {
        status: {
          in: [OrderStatus.NOUVELLE, OrderStatus.CONFIRMEE, OrderStatus.PREPAREE],
        },
      },
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true, available: true } }),
    prisma.category.count({ where: { active: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        items: true,
      },
    }),
  ]);

  return {
    settings,
    stats: {
      totalOrders,
      pendingOrders,
      activeProducts,
      availableProducts,
      categories,
    },
    recentOrders,
  };
}

export async function getOrdersList() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getAdminNotifications() {
  const newOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.NOUVELLE,
    },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      items: {
        select: {
          id: true,
        },
      },
    },
  });

  const notifications: AdminNotification[] = newOrders.map((order) => {
    const reference = getShortOrderReference(order.id);

    return {
      id: order.id,
      title: "Nouvelle commande",
      description: `${reference} de ${order.customerName} pour ${Number(order.total).toFixed(2)} DH, ${order.items.length} article(s), ${order.city}.`,
      href: "/admin/orders",
      createdAtLabel: formatNotificationDate(order.createdAt),
      unread: true,
    };
  });

  return {
    unreadCount: newOrders.length,
    notifications,
  };
}

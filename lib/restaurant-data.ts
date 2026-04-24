import "server-only";

import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

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

function isMissingTableError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021";
}

function isMissingRestaurantSettingsColumnError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2022" &&
    error.meta?.modelName === "RestaurantSettings"
  );
}

function formatNotificationDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function getRestaurantSettingsInternal() {
  try {
    return await prisma.restaurantSettings.findFirst({
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    // Allow the app to boot before the database is fully migrated.
    if (isMissingTableError(error) || isMissingRestaurantSettingsColumnError(error)) {
      return null;
    }

    throw error;
  }
}

async function getPublicMenuCategoriesInternal() {
  try {
    return await prisma.category.findMany({
      where: {
        active: true,
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
  } catch (error) {
    if (isMissingTableError(error)) {
      return [];
    }

    throw error;
  }
}

export const getRestaurantSettings = unstable_cache(getRestaurantSettingsInternal, ["restaurant-settings"], {
  tags: ["restaurant-settings"],
  revalidate: 300,
});

export const getPublicMenuCategories = unstable_cache(getPublicMenuCategoriesInternal, ["public-menu"], {
  tags: ["public-menu"],
  revalidate: 300,
});

export async function getAdminMenuCategories() {
  try {
    return await prisma.category.findMany({
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
  } catch (error) {
    if (isMissingTableError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getAdminCatalogData() {
  try {
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
  } catch (error) {
    if (isMissingTableError(error)) {
      return {
        categories: [],
        sauces: [],
        extras: [],
        drinks: [],
      };
    }

    throw error;
  }
}

export async function getDashboardData() {
  try {
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
  } catch (error) {
    if (isMissingTableError(error)) {
      return {
        settings: null,
        stats: {
          totalOrders: 0,
          pendingOrders: 0,
          activeProducts: 0,
          availableProducts: 0,
          categories: 0,
        },
        recentOrders: [],
      };
    }

    throw error;
  }
}

export async function getOrdersList() {
  try {
    return await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getAdminNotifications() {
  try {
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

    const notifications: AdminNotification[] = newOrders.map((order: (typeof newOrders)[number]) => {
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
  } catch (error) {
    if (isMissingTableError(error)) {
      return {
        unreadCount: 0,
        notifications: [],
      };
    }

    throw error;
  }
}

"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/admin-auth";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export async function updateOrderStatus(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as OrderStatus;

  if (!id || !ORDER_STATUSES.includes(status)) {
    return;
  }

  await prisma.order.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
}

export async function deleteSelectedOrders(formData: FormData) {
  await requireAdminSession();

  const orderIds = formData
    .getAll("orderIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (orderIds.length === 0) {
    return;
  }

  await prisma.order.deleteMany({
    where: {
      id: {
        in: [...new Set(orderIds)],
      },
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
}

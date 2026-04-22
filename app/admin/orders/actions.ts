"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function updateOrderStatus(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as OrderStatus;

  if (!id || !Object.values(OrderStatus).includes(status)) {
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

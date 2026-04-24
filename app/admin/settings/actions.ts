"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function parseText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function parseDecimal(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function saveRestaurantSettings(formData: FormData) {
  await requireAdminSession();

  const id = parseText(formData.get("id"));
  const data = {
    restaurantName: parseText(formData.get("restaurantName")) || "Restaurant",
    whatsappNumber: parseText(formData.get("whatsappNumber")),
    address: parseText(formData.get("address")) || null,
    openingHours: parseText(formData.get("openingHours")) || null,
    welcomeMessage: parseText(formData.get("welcomeMessage")) || null,
    logoUrl: parseText(formData.get("logoUrl")) || null,
    heroImageUrl: parseText(formData.get("heroImageUrl")) || null,
    deliveryFee: parseDecimal(formData.get("deliveryFee")),
  };

  if (id) {
    await prisma.restaurantSettings.update({
      where: { id },
      data,
    });
  } else {
    await prisma.restaurantSettings.create({
      data,
    });
  }

  revalidateTag("restaurant-settings", "max");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/contact");
  revalidatePath("/reservations");
}

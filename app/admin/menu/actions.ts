"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on";
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function parseDecimal(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? roundMoney(parsed) : 0;
}

function parseText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function parseIdList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value))
    .filter(Boolean);
}

const SIZE_FIELDS = [
  { key: "petit", label: "Petit" },
  { key: "moyen", label: "Moyen" },
  { key: "grand", label: "Grand" },
] as const;

function parseExactSizePrices(formData: FormData) {
  return SIZE_FIELDS.flatMap((size) => {
    if (!parseCheckbox(formData.get(`sizeEnabled-${size.key}`))) {
      return [];
    }

    const rawExactPrice = parseText(formData.get(`sizePrice-${size.key}`));
    const exactPrice = rawExactPrice ? parseDecimal(rawExactPrice) : 0;
    return [
      {
        name: size.label,
        exactPrice,
      },
    ];
  });
}

function buildSizePricing(formData: FormData) {
  const typedBasePrice = parseDecimal(formData.get("basePrice"));
  const exactSizes = parseExactSizePrices(formData);

  if (exactSizes.length === 0) {
    return {
      basePrice: typedBasePrice,
      sizes: [],
    };
  }

  const basePrice = Math.min(...exactSizes.map((size) => size.exactPrice));

  return {
    basePrice: roundMoney(basePrice),
    sizes: exactSizes.map((size) => ({
      name: size.name,
      priceModifier: roundMoney(Math.max(0, size.exactPrice - basePrice)),
    })),
  };
}

function refreshAdminSurfaces() {
  revalidateTag("public-menu", "max");
  revalidatePath("/admin/menu");
  revalidatePath("/admin/dashboard");
  revalidatePath("/menu");
  revalidatePath("/");
}

export async function createCategory(formData: FormData) {
  await requireAdminSession();

  const name = parseText(formData.get("name"));
  if (!name) {
    return;
  }

  await prisma.category.create({
    data: {
      name,
      description: parseText(formData.get("description")) || null,
      displayOrder: Math.trunc(parseDecimal(formData.get("displayOrder"))),
      active: parseCheckbox(formData.get("active")),
    },
  });

  refreshAdminSurfaces();
}

export async function updateCategory(formData: FormData) {
  await requireAdminSession();

  const id = parseText(formData.get("id"));
  const name = parseText(formData.get("name"));

  if (!id || !name) {
    return;
  }

  await prisma.category.update({
    where: { id },
    data: {
      name,
      description: parseText(formData.get("description")) || null,
      displayOrder: Math.trunc(parseDecimal(formData.get("displayOrder"))),
      active: parseCheckbox(formData.get("active")),
    },
  });

  refreshAdminSurfaces();
}

export async function deleteCategory(formData: FormData) {
  await requireAdminSession();

  const id = parseText(formData.get("id"));
  if (!id) {
    return;
  }

  try {
    await prisma.category.delete({
      where: { id },
    });
  } catch {
    await prisma.category.update({
      where: { id },
      data: {
        active: false,
        products: {
          updateMany: {
            where: {},
            data: {
              active: false,
              available: false,
            },
          },
        },
      },
    });
  }

  refreshAdminSurfaces();
}

export async function createProduct(formData: FormData) {
  await requireAdminSession();

  const name = parseText(formData.get("name"));
  const categoryId = parseText(formData.get("categoryId"));

  if (!name || !categoryId) {
    return;
  }

  const { basePrice, sizes } = buildSizePricing(formData);
  const sauceIds = parseIdList(formData, "sauceIds");
  const extraIds = parseIdList(formData, "extraIds");
  const drinkIds = parseIdList(formData, "drinkIds");

  await prisma.product.create({
    data: {
      name,
      description: parseText(formData.get("description")) || null,
      imageUrl: parseText(formData.get("imageUrl")) || null,
      basePrice,
      active: parseCheckbox(formData.get("active")),
      available: parseCheckbox(formData.get("available")),
      categoryId,
      sizes: {
        create: sizes,
      },
      optionLinks: {
        create: [
          ...sauceIds.map((sauceId) => ({ sauceId })),
          ...extraIds.map((extraId) => ({ extraId })),
          ...drinkIds.map((drinkId) => ({ drinkId })),
        ],
      },
    },
  });

  refreshAdminSurfaces();
}

export async function updateProduct(formData: FormData) {
  await requireAdminSession();

  const id = parseText(formData.get("id"));
  const name = parseText(formData.get("name"));
  const categoryId = parseText(formData.get("categoryId"));

  if (!id || !name || !categoryId) {
    return;
  }

  const { basePrice, sizes } = buildSizePricing(formData);
  const sauceIds = parseIdList(formData, "sauceIds");
  const extraIds = parseIdList(formData, "extraIds");
  const drinkIds = parseIdList(formData, "drinkIds");

  await prisma.product.update({
    where: { id },
    data: {
      name,
      description: parseText(formData.get("description")) || null,
      imageUrl: parseText(formData.get("imageUrl")) || null,
      basePrice,
      active: parseCheckbox(formData.get("active")),
      available: parseCheckbox(formData.get("available")),
      categoryId,
      sizes: {
        deleteMany: {},
        create: sizes,
      },
      optionLinks: {
        deleteMany: {},
        create: [
          ...sauceIds.map((sauceId) => ({ sauceId })),
          ...extraIds.map((extraId) => ({ extraId })),
          ...drinkIds.map((drinkId) => ({ drinkId })),
        ],
      },
    },
  });

  refreshAdminSurfaces();
}

export async function deleteProduct(formData: FormData) {
  await requireAdminSession();

  const id = parseText(formData.get("id"));
  if (!id) {
    return;
  }

  try {
    await prisma.product.delete({
      where: { id },
    });
  } catch {
    await prisma.product.update({
      where: { id },
      data: {
        active: false,
        available: false,
      },
    });
  }

  refreshAdminSurfaces();
}

export async function createCatalogOption(formData: FormData) {
  await requireAdminSession();

  const type = parseText(formData.get("type"));
  const name = parseText(formData.get("name"));

  if (!type || !name) {
    return;
  }

  const data = {
    name,
    price: parseDecimal(formData.get("price")),
    active: parseCheckbox(formData.get("active")),
  };

  if (type === "sauce") {
    await prisma.sauce.create({ data });
  } else if (type === "extra") {
    await prisma.extra.create({ data });
  } else if (type === "drink") {
    await prisma.drink.create({ data });
  }

  refreshAdminSurfaces();
}

export async function updateCatalogOption(formData: FormData) {
  await requireAdminSession();

  const type = parseText(formData.get("type"));
  const id = parseText(formData.get("id"));
  const name = parseText(formData.get("name"));

  if (!type || !id || !name) {
    return;
  }

  const data = {
    name,
    price: parseDecimal(formData.get("price")),
    active: parseCheckbox(formData.get("active")),
  };

  if (type === "sauce") {
    await prisma.sauce.update({ where: { id }, data });
  } else if (type === "extra") {
    await prisma.extra.update({ where: { id }, data });
  } else if (type === "drink") {
    await prisma.drink.update({ where: { id }, data });
  }

  refreshAdminSurfaces();
}

export async function deleteCatalogOption(formData: FormData) {
  await requireAdminSession();

  const type = parseText(formData.get("type"));
  const id = parseText(formData.get("id"));

  if (!type || !id) {
    return;
  }

  if (type === "sauce") {
    await prisma.sauce.delete({ where: { id } });
  } else if (type === "extra") {
    await prisma.extra.delete({ where: { id } });
  } else if (type === "drink") {
    await prisma.drink.delete({ where: { id } });
  }

  refreshAdminSurfaces();
}

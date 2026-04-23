import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { getAdminMenuCategories } from "@/lib/restaurant-data";

type AdminMenuCategories = Awaited<ReturnType<typeof getAdminMenuCategories>>;
type AdminMenuCategory = AdminMenuCategories[number];
type AdminMenuProduct = AdminMenuCategory["products"][number];
type AdminMenuProductSize = AdminMenuProduct["sizes"][number];
type AdminMenuProductOptionLink = AdminMenuProduct["optionLinks"][number];

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminSessionFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const categories: AdminMenuCategories = await getAdminMenuCategories();
    const products = categories.flatMap((category: AdminMenuCategory) =>
      category.products.map((product: AdminMenuProduct) => ({
        ...product,
        basePrice: Number(product.basePrice),
        category: {
          id: category.id,
          name: category.name,
        },
        sizes: product.sizes.map((size: AdminMenuProductSize) => ({
          ...size,
          priceModifier: Number(size.priceModifier),
        })),
        optionLinks: product.optionLinks.map((link: AdminMenuProductOptionLink) => ({
          id: link.id,
          sauce: link.sauce
            ? { name: link.sauce.name, price: Number(link.sauce.price) }
            : undefined,
          extra: link.extra
            ? { name: link.extra.name, price: Number(link.extra.price) }
            : undefined,
          drink: link.drink
            ? { name: link.drink.name, price: Number(link.drink.price) }
            : undefined,
        })),
      }))
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

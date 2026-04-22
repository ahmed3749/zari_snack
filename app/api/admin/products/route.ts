import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { getAdminMenuCategories } from "@/lib/restaurant-data";

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminSessionFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const categories = await getAdminMenuCategories();
    const products = categories.flatMap((category) =>
      category.products.map((product) => ({
        ...product,
        basePrice: Number(product.basePrice),
        category: {
          id: category.id,
          name: category.name,
        },
        sizes: product.sizes.map((size) => ({
          ...size,
          priceModifier: Number(size.priceModifier),
        })),
        optionLinks: product.optionLinks.map((link) => ({
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

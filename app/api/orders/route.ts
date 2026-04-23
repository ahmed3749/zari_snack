import { NextRequest, NextResponse } from "next/server";
import type { Drink, Extra, Product, ProductOptionLink, ProductSize, Sauce } from "@prisma/client";

import { getShortOrderReference } from "@/lib/order-reference";
import { prisma } from "@/lib/prisma";

type IncomingItem = {
  productId?: unknown;
  quantity?: unknown;
  selectedSizeId?: unknown;
  selectedSauceIds?: unknown;
  selectedExtraIds?: unknown;
  selectedDrinkId?: unknown;
};

type ParsedIncomingItem = {
  productId: string;
  quantity: number;
  selectedSizeId: string | null;
  selectedSauceIds: string[];
  selectedExtraIds: string[];
  selectedDrinkId: string | null;
};

type ProductWithOptions = Product & {
  sizes: ProductSize[];
  optionLinks: Array<
    ProductOptionLink & {
      sauce: Sauce | null;
      extra: Extra | null;
      drink: Drink | null;
    }
  >;
};

function formatPrice(value: number) {
  return `${value.toFixed(2)} DH`;
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeIdArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((entry): entry is string => typeof entry === "string"))];
}

function buildWhatsAppMessage(params: {
  restaurantName: string;
  orderReference: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  note: string;
  items: Array<{
    productName: string;
    quantity: number;
    subtotal: number;
    selectedSizeName: string | null;
    sauces: string[];
    extras: string[];
    drink: string | null;
  }>;
  total: number;
}) {
  const lines = [
    `Bonjour ${params.restaurantName},`,
    "",
    `Je confirme ma commande ${params.orderReference} :`,
    "",
    ...params.items.flatMap((item, index: number) => {
      const detailLines = [
        `${index + 1}. ${item.productName} x${item.quantity} - ${formatPrice(item.subtotal)}`,
      ];

      if (item.selectedSizeName) {
        detailLines.push(`   Taille: ${item.selectedSizeName}`);
      }

      if (item.sauces.length > 0) {
        detailLines.push(`   Sauces: ${item.sauces.join(", ")}`);
      }

      if (item.extras.length > 0) {
        detailLines.push(`   Extras: ${item.extras.join(", ")}`);
      }

      if (item.drink) {
        detailLines.push(`   Boisson: ${item.drink}`);
      }

      return detailLines;
    }),
    "",
    `Total: ${formatPrice(params.total)}`,
    "",
    `Client: ${params.customerName}`,
    `Téléphone: ${params.phone}`,
    `Adresse: ${params.address}`,
    `Quartier / Ville: ${params.city}`,
    `Remarque: ${params.note || "Aucune"}`,
  ];

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fullName = cleanString(body.fullName);
    const phone = cleanString(body.phone);
    const address = cleanString(body.address);
    const city = cleanString(body.city);
    const note = cleanString(body.note);
    const rawItems = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];

    if (!fullName || !phone || !address || !city) {
      return NextResponse.json(
        { error: "Les champs nom, téléphone, adresse et quartier ou ville sont obligatoires." },
        { status: 400 }
      );
    }

    if (rawItems.length === 0) {
      return NextResponse.json(
        { error: "Le panier est vide." },
        { status: 400 }
      );
    }

    const itemsPayload: ParsedIncomingItem[] = rawItems.map((item: IncomingItem) => ({
      productId: cleanString(item.productId),
      quantity:
        typeof item.quantity === "number" && Number.isInteger(item.quantity) && item.quantity > 0
          ? item.quantity
          : 0,
      selectedSizeId: cleanString(item.selectedSizeId) || null,
      selectedSauceIds: normalizeIdArray(item.selectedSauceIds),
      selectedExtraIds: normalizeIdArray(item.selectedExtraIds),
      selectedDrinkId: cleanString(item.selectedDrinkId) || null,
    }));

    if (itemsPayload.some((item: ParsedIncomingItem) => !item.productId || item.quantity < 1)) {
      return NextResponse.json(
        { error: "Le contenu du panier est invalide." },
        { status: 400 }
      );
    }

    const productIds = [...new Set(itemsPayload.map((item: ParsedIncomingItem) => item.productId))];
    const products: ProductWithOptions[] = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        active: true,
        available: true,
      },
      include: {
        sizes: true,
        optionLinks: {
          include: {
            sauce: true,
            extra: true,
            drink: true,
          },
        },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Un ou plusieurs produits ne sont plus disponibles." },
        { status: 400 }
      );
    }

    const productsById = new Map<string, ProductWithOptions>(
      products.map((product: ProductWithOptions) => [product.id, product])
    );
    let total = 0;

    const normalizedItems = itemsPayload.map((item: ParsedIncomingItem) => {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new Error("Produit introuvable.");
      }

      const selectedSize = item.selectedSizeId
        ? product.sizes.find((size: ProductSize) => size.id === item.selectedSizeId) ?? null
        : null;

      if (item.selectedSizeId && !selectedSize) {
        throw new Error(`La taille sélectionnée pour ${product.name} est invalide.`);
      }

      const sauces = product.optionLinks
        .filter((link: ProductWithOptions["optionLinks"][number]) => link.sauce && link.sauce.active && item.selectedSauceIds.includes(link.sauce.id))
        .map((link: ProductWithOptions["optionLinks"][number]) => link.sauce!);

      if (sauces.length !== item.selectedSauceIds.length) {
        throw new Error(`Une sauce sélectionnée pour ${product.name} est invalide.`);
      }

      const extras = product.optionLinks
        .filter((link: ProductWithOptions["optionLinks"][number]) => link.extra && link.extra.active && item.selectedExtraIds.includes(link.extra.id))
        .map((link: ProductWithOptions["optionLinks"][number]) => link.extra!);

      if (extras.length !== item.selectedExtraIds.length) {
        throw new Error(`Un extra sélectionné pour ${product.name} est invalide.`);
      }

      const drink = item.selectedDrinkId
        ? product.optionLinks.find(
            (link: ProductWithOptions["optionLinks"][number]) => link.drink && link.drink.active && link.drink.id === item.selectedDrinkId
          )?.drink ?? null
        : null;

      if (item.selectedDrinkId && !drink) {
        throw new Error(`La boisson sélectionnée pour ${product.name} est invalide.`);
      }

      const unitPrice =
        Number(product.basePrice) +
        Number(selectedSize?.priceModifier ?? 0) +
        sauces.reduce((sum: number, option: Sauce) => sum + Number(option.price), 0) +
        extras.reduce((sum: number, option: Extra) => sum + Number(option.price), 0) +
        Number(drink?.price ?? 0);

      const subtotal = unitPrice * item.quantity;
      total += subtotal;

      return {
        product,
        quantity: item.quantity,
        selectedSize,
        sauces,
        extras,
        drink,
        subtotal,
      };
    });

    const settings = await prisma.restaurantSettings.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!settings?.whatsappNumber) {
      return NextResponse.json(
        { error: "Le numéro WhatsApp du restaurant n'est pas configuré." },
        { status: 500 }
      );
    }

    const customer = await prisma.customer.upsert({
      where: { phone },
      update: {
        fullName,
      },
      create: {
        phone,
        fullName,
      },
    });

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        customerName: fullName,
        customerPhone: phone,
        deliveryAddress: address,
        city,
        note: note || null,
        total,
        items: {
          create: normalizedItems.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            basePrice: Number(item.product.basePrice),
            selectedSizeName: item.selectedSize?.name ?? null,
            selectedSizePrice: item.selectedSize
              ? Number(item.selectedSize.priceModifier)
              : null,
            options: {
              sauces: item.sauces.map((option: Sauce) => ({
                id: option.id,
                name: option.name,
                price: Number(option.price),
              })),
              extras: item.extras.map((option: Extra) => ({
                id: option.id,
                name: option.name,
                price: Number(option.price),
              })),
              drink: item.drink
                ? {
                    id: item.drink.id,
                    name: item.drink.name,
                    price: Number(item.drink.price),
                  }
                : null,
            },
            subtotal: item.subtotal,
          })),
        },
      },
    });
    const orderReference = getShortOrderReference(order.id);

    const whatsappMessage = buildWhatsAppMessage({
      restaurantName: settings.restaurantName,
      orderReference,
      customerName: fullName,
      phone,
      address,
      city,
      note,
      items: normalizedItems.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        subtotal: item.subtotal,
        selectedSizeName: item.selectedSize?.name ?? null,
        sauces: item.sauces.map((option: Sauce) => option.name),
        extras: item.extras.map((option: Extra) => option.name),
        drink: item.drink?.name ?? null,
      })),
      total,
    });

    const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;

    return NextResponse.json({
      orderId: order.id,
      orderReference,
      whatsappUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible d'enregistrer la commande.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

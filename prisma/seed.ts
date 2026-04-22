import { PrismaClient } from "@prisma/client";

/* eslint-disable @typescript-eslint/no-unused-vars */

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clean up existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productOptionLink.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.drink.deleteMany();
  await prisma.extra.deleteMany();
  await prisma.sauce.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.restaurantSettings.deleteMany();

  // Create restaurant settings
  const _settings = await prisma.restaurantSettings.create({
    data: {
      restaurantName: "Snack Saveur Marocaine",
      logoUrl:
        "https://images.unsplash.com/photo-1585521537688-5b0b0bfc3e5a?w=200",
      whatsappNumber: "+212670264409",
      address: "123 Rue Mohamed V, Casablanca",
      openingHours: "11:00 - 22:00",
      deliveryFee: 15.0,
      welcomeMessage: "Bienvenue chez Saveur Marocaine! 🍽️",
    },
  });

  console.log("✅ Restaurant settings created");

  // Create categories
  const sandwiches = await prisma.category.create({
    data: {
      name: "Sandwiches",
      description: "Sandwiches marocains savoureux",
      displayOrder: 1,
      active: true,
    },
  });

  const tagines = await prisma.category.create({
    data: {
      name: "Tajines",
      description: "Tajines traditionnels marocains",
      displayOrder: 2,
      active: true,
    },
  });

  const couscous = await prisma.category.create({
    data: {
      name: "Couscous",
      description: "Couscous fait maison",
      displayOrder: 3,
      active: true,
    },
  });

  const drinks = await prisma.category.create({
    data: {
      name: "Boissons",
      description: "Boissons rafraîchissantes",
      displayOrder: 4,
      active: true,
    },
  });

  console.log("✅ Categories created");

  // Create products - Sandwiches
  const mrocMerguez = await prisma.product.create({
    data: {
      name: "Mrouq Merguez",
      description:
        "Sandwich avec merguez grillée, oignons et sauce épicée",
      imageUrl:
        "https://images.unsplash.com/photo-1585238341710-4b4e6ceab518?w=400",
      basePrice: 35.0,
      active: true,
      available: true,
      categoryId: sandwiches.id,
    },
  });

  const mrocPoulet = await prisma.product.create({
    data: {
      name: "Mrouq Poulet",
      description:
        "Sandwich avec poulet grillé, légumes frais et sauce maison",
      imageUrl:
        "https://images.unsplash.com/photo-1586190203519-e21cc028cb29?w=400",
      basePrice: 40.0,
      active: true,
      available: true,
      categoryId: sandwiches.id,
    },
  });

  const _mrocBoeuf = await prisma.product.create({
    data: {
      name: "Mrouq Boeuf",
      description: "Sandwich avec viande de boeuf tendre et épices",
      imageUrl:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
      basePrice: 45.0,
      active: true,
      available: true,
      categoryId: sandwiches.id,
    },
  });

  // Create products - Tajines
  const tajinePoulet = await prisma.product.create({
    data: {
      name: "Tajine Poulet Citron",
      description: "Tajine traditionnel avec poulet, citron confit et olives",
      imageUrl:
        "https://images.unsplash.com/photo-1608270861620-7bb877b11eb0?w=400",
      basePrice: 65.0,
      active: true,
      available: true,
      categoryId: tagines.id,
    },
  });

  const _tajineAgneau = await prisma.product.create({
    data: {
      name: "Tajine Agneau Pruneaux",
      description: "Tajine savoureux avec agneau, pruneaux et amandes",
      imageUrl:
        "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
      basePrice: 85.0,
      active: true,
      available: true,
      categoryId: tagines.id,
    },
  });

  // Create products - Couscous
  const _couscousMerguez = await prisma.product.create({
    data: {
      name: "Couscous Royal",
      description: "Couscous avec viande mélangée, légumes et sauce",
      imageUrl:
        "https://images.unsplash.com/photo-1596040423379-ffd0e925b3d3?w=400",
      basePrice: 75.0,
      active: true,
      available: true,
      categoryId: couscous.id,
    },
  });

  // Create products - Drinks
  const _jusOrange = await prisma.product.create({
    data: {
      name: "Jus Orange",
      description: "Jus d'orange frais",
      imageUrl:
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
      basePrice: 15.0,
      active: true,
      available: true,
      categoryId: drinks.id,
    },
  });

  const _theMenthe = await prisma.product.create({
    data: {
      name: "Thé à la Menthe",
      description: "Thé vert marocain avec menthe fraîche",
      imageUrl:
        "https://images.unsplash.com/photo-1597318986035-a19d34e9f20f?w=400",
      basePrice: 12.0,
      active: true,
      available: true,
      categoryId: drinks.id,
    },
  });

  console.log("✅ Products created");

  // Create sizes
  const _sizePetit = await prisma.productSize.create({
    data: {
      name: "Petit",
      priceModifier: 0.0,
      productId: mrocMerguez.id,
    },
  });

  const _sizeMoyen = await prisma.productSize.create({
    data: {
      name: "Moyen",
      priceModifier: 5.0,
      productId: mrocMerguez.id,
    },
  });

  const _sizeGrand = await prisma.productSize.create({
    data: {
      name: "Grand",
      priceModifier: 10.0,
      productId: mrocMerguez.id,
    },
  });

  // Add sizes to other sandwich products
  await prisma.productSize.create({
    data: {
      name: "Petit",
      priceModifier: 0.0,
      productId: mrocPoulet.id,
    },
  });

  await prisma.productSize.create({
    data: {
      name: "Moyen",
      priceModifier: 5.0,
      productId: mrocPoulet.id,
    },
  });

  await prisma.productSize.create({
    data: {
      name: "Grand",
      priceModifier: 10.0,
      productId: mrocPoulet.id,
    },
  });

  console.log("✅ Sizes created");

  // Create sauces
  const saucePiquante = await prisma.sauce.create({
    data: {
      name: "Sauce Piquante",
      price: 0.0,
      active: true,
    },
  });

  const sauceMayonnaise = await prisma.sauce.create({
    data: {
      name: "Mayonnaise",
      price: 0.0,
      active: true,
    },
  });

  const sauceHarissa = await prisma.sauce.create({
    data: {
      name: "Harissa",
      price: 0.0,
      active: true,
    },
  });

  console.log("✅ Sauces created");

  // Create extras
  const extraOignons = await prisma.extra.create({
    data: {
      name: "Oignons Supplémentaires",
      price: 5.0,
      active: true,
    },
  });

  const extraFromage = await prisma.extra.create({
    data: {
      name: "Fromage",
      price: 8.0,
      active: true,
    },
  });

  const _extraOlives = await prisma.extra.create({
    data: {
      name: "Olives",
      price: 6.0,
      active: true,
    },
  });

  console.log("✅ Extras created");

  // Create drinks (global catalog items)
  const drinkCocaCola = await prisma.drink.create({
    data: {
      name: "Coca Cola",
      price: 10.0,
      active: true,
    },
  });

  const _drinkFanta = await prisma.drink.create({
    data: {
      name: "Fanta",
      price: 10.0,
      active: true,
    },
  });

  const drinkEau = await prisma.drink.create({
    data: {
      name: "Eau Minérale",
      price: 5.0,
      active: true,
    },
  });

  console.log("✅ Drinks created");

  // Create product option links
  // Link sauces to Mrouq Merguez
  await prisma.productOptionLink.create({
    data: {
      productId: mrocMerguez.id,
      sauceId: saucePiquante.id,
    },
  });

  await prisma.productOptionLink.create({
    data: {
      productId: mrocMerguez.id,
      sauceId: sauceMayonnaise.id,
    },
  });

  await prisma.productOptionLink.create({
    data: {
      productId: mrocMerguez.id,
      sauceId: sauceHarissa.id,
    },
  });

  // Link extras to Mrouq Merguez
  await prisma.productOptionLink.create({
    data: {
      productId: mrocMerguez.id,
      extraId: extraOignons.id,
    },
  });

  await prisma.productOptionLink.create({
    data: {
      productId: mrocMerguez.id,
      extraId: extraFromage.id,
    },
  });

  // Link drinks to Mrouq Merguez
  await prisma.productOptionLink.create({
    data: {
      productId: mrocMerguez.id,
      drinkId: drinkCocaCola.id,
    },
  });

  await prisma.productOptionLink.create({
    data: {
      productId: mrocMerguez.id,
      drinkId: drinkEau.id,
    },
  });

  // Link options to Tajine Poulet
  await prisma.productOptionLink.create({
    data: {
      productId: tajinePoulet.id,
      drinkId: drinkCocaCola.id,
    },
  });

  console.log("✅ Product option links created");

  // Create admin user
  await prisma.admin.create({
    data: {
      email: "admin@saveur-marocaine.ma",
      password: "admin123456", // In production, this should be hashed
      name: "Admin",
    },
  });

  console.log("✅ Admin user created");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

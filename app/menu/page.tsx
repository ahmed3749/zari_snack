import PublicFooter from "../../components/PublicFooter";
import PublicHeader from "../../components/PublicHeader";
import MenuClient from "../../components/menu/MenuClient";

import { getProductImageSrc } from "@/lib/product-image";
import { prisma } from "@/lib/prisma";

export default async function MenuPage({
  searchParams,
}: {
  searchParams?: Promise<{
    cart?: string;
  }>;
}) {
  await searchParams;
  const categories = await prisma.category.findMany({
    where: {
      active: true,
      products: {
        some: {
          active: true,
        },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      products: {
        where: {
          active: true,
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

  const heroEntry =
    categories.flatMap((category) =>
      category.products.map((product) => ({
        ...product,
        categoryName: category.name,
      }))
    )[0] ?? null;

  const heroImage = heroEntry
    ? getProductImageSrc(heroEntry.name, heroEntry.imageUrl, heroEntry.categoryName)
    : "/images/fallback/generic-fallback.png";

  return (
    <div className="min-h-screen text-slate-900">
      <PublicHeader />
      <main className="px-3 py-5 md:px-5 md:py-7">
        <div className="page-frame space-y-7 md:space-y-9">
          <section className="overflow-hidden rounded-[2rem] border-[3px] border-[#1a1613] bg-[#111] shadow-[0_28px_58px_rgba(33,21,12,0.22)]">
            <div className="grid min-h-[300px] lg:min-h-[360px] lg:grid-cols-[1.02fr_0.98fr]">
              <div className="hero-panel grid-pattern flex items-center px-6 py-8 text-white md:px-10 md:py-11">
                <div className="max-w-2xl">
                  <span className="inline-flex rounded-full bg-[linear-gradient(135deg,_#ffcd3c,_#ffb703)] px-4 py-1 text-xs font-black uppercase tracking-[0.26em] text-slate-950">
                    Carte du moment
                  </span>
                  <h1 className="section-title mt-4 text-6xl leading-[0.88] text-white md:text-8xl xl:text-[5.8rem]">
                    Découvrez
                    <span className="block text-[#ffbf1f]">notre menu</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/82 md:text-base">
                    Une carte pensée comme une vraie vitrine food: catégories visibles, produits
                    gourmands, personnalisation rapide et panier toujours accessible.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="#menu-root"
                      className="rounded-full bg-[linear-gradient(135deg,_#ff3b30,_#d91f1f)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_34px_rgba(127,29,29,0.3)]"
                    >
                      Voir les plats
                    </a>
                    <a
                      href="/contact"
                      className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm"
                    >
                      Nous contacter
                    </a>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[220px] overflow-hidden bg-[radial-gradient(circle_at_15%_15%,_rgba(255,191,31,0.18),_transparent_18%),radial-gradient(circle_at_78%_22%,_rgba(251,146,60,0.16),_transparent_20%),linear-gradient(135deg,_#2b1b11,_#0d0908)] lg:min-h-[380px]">
                <div className="hero-glow" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt="Aperçu du menu"
                  className="h-full w-full scale-[1.03] object-cover opacity-92"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(17,17,17,0.12),_rgba(17,17,17,0.4))]" />
              </div>
            </div>
          </section>

          <MenuClient
            categories={categories.map((category) => ({
              id: category.id,
              name: category.name,
              description: category.description,
              products: category.products.map((product) => ({
                id: product.id,
                name: product.name,
                description: product.description,
                imageUrl: product.imageUrl,
                basePrice: Number(product.basePrice),
                available: product.available,
                categoryName: category.name,
                sizes: product.sizes.map((size) => ({
                  id: size.id,
                  name: size.name,
                  priceModifier: Number(size.priceModifier),
                })),
                sauces: product.optionLinks
                  .filter((link) => link.sauce?.active)
                  .map((link) => ({
                    id: link.sauce!.id,
                    name: link.sauce!.name,
                    price: Number(link.sauce!.price),
                  })),
                extras: product.optionLinks
                  .filter((link) => link.extra?.active)
                  .map((link) => ({
                    id: link.extra!.id,
                    name: link.extra!.name,
                    price: Number(link.extra!.price),
                  })),
                drinks: product.optionLinks
                  .filter((link) => link.drink?.active)
                  .map((link) => ({
                    id: link.drink!.id,
                    name: link.drink!.name,
                    price: Number(link.drink!.price),
                  })),
              })),
            }))}
          />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

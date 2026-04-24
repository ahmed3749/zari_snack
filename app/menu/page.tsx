import PublicFooter from "../../components/PublicFooter";
import PublicHeader from "../../components/PublicHeader";
import MenuClient from "../../components/menu/MenuClient";
import type { MenuCategory, MenuProduct, MenuProductOption, MenuProductSize } from "../../components/menu/types";

import { getProductImageSrc } from "@/lib/product-image";
import { getPublicMenuCategories } from "@/lib/restaurant-data";

type MenuProductSizeRecord = {
  id: string;
  name: string;
  priceModifier: unknown;
};

type MenuProductOptionRecord = {
  id: string;
  name: string;
  price: unknown;
  active: boolean;
};

type MenuProductOptionLinkRecord = {
  sauce: MenuProductOptionRecord | null;
  extra: MenuProductOptionRecord | null;
  drink: MenuProductOptionRecord | null;
};

type MenuProductRecord = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: unknown;
  available: boolean;
  sizes: MenuProductSizeRecord[];
  optionLinks: MenuProductOptionLinkRecord[];
};

type MenuCategoryRecord = {
  id: string;
  name: string;
  description: string | null;
  products: MenuProductRecord[];
};

type MenuCategories = MenuCategoryRecord[];
type HeroEntry = MenuProductRecord & { categoryName: string };

export default async function MenuPage() {
  const categories: MenuCategories = await getPublicMenuCategories();

  const heroEntry: HeroEntry | null =
    categories.flatMap((category: MenuCategoryRecord) =>
      category.products.map((product: MenuProductRecord) => ({
        ...product,
        categoryName: category.name,
      }))
    )[0] ?? null;

  const menuCategories: MenuCategory[] = categories.map((category: MenuCategoryRecord) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    products: category.products.map((product: MenuProductRecord): MenuProduct => ({
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      basePrice: Number(product.basePrice),
      available: product.available,
      categoryName: category.name,
      sizes: product.sizes.map((size: MenuProductSizeRecord): MenuProductSize => ({
        id: size.id,
        name: size.name,
        priceModifier: Number(size.priceModifier),
      })),
      sauces: product.optionLinks
        .filter((link: MenuProductOptionLinkRecord) => link.sauce?.active)
        .map((link: MenuProductOptionLinkRecord): MenuProductOption => ({
          id: link.sauce!.id,
          name: link.sauce!.name,
          price: Number(link.sauce!.price),
        })),
      extras: product.optionLinks
        .filter((link: MenuProductOptionLinkRecord) => link.extra?.active)
        .map((link: MenuProductOptionLinkRecord): MenuProductOption => ({
          id: link.extra!.id,
          name: link.extra!.name,
          price: Number(link.extra!.price),
        })),
      drinks: product.optionLinks
        .filter((link: MenuProductOptionLinkRecord) => link.drink?.active)
        .map((link: MenuProductOptionLinkRecord): MenuProductOption => ({
          id: link.drink!.id,
          name: link.drink!.name,
          price: Number(link.drink!.price),
        })),
    })),
  }));

  const heroImage = heroEntry
    ? getProductImageSrc(heroEntry.name, heroEntry.imageUrl, heroEntry.categoryName)
    : "/images/fallback/generic-fallback.png";

  return (
    <div className="min-h-screen text-slate-900">
      <PublicHeader />
      <main className="px-3 pb-5 pt-3 md:px-5 md:py-7">
        <div className="page-frame space-y-7 md:space-y-9">
          <section className="overflow-hidden rounded-[2rem] border-[3px] border-[#1a1613] bg-[#111] shadow-[0_28px_58px_rgba(33,21,12,0.22)]">
            <div className="grid min-h-[300px] lg:min-h-[360px] lg:grid-cols-[1.02fr_0.98fr]">
              <div className="hero-panel grid-pattern flex items-center px-5 py-6 text-white md:px-10 md:py-11">
                <div className="max-w-2xl">
                  <span className="inline-flex rounded-full bg-[linear-gradient(135deg,_#ffcd3c,_#ffb703)] px-4 py-1 text-xs font-black uppercase tracking-[0.26em] text-slate-950">
                    Carte du moment
                  </span>
                  <h1 className="section-title mt-4 text-[3.2rem] leading-[0.88] text-white md:text-8xl xl:text-[5.8rem]">
                    Découvrez
                    <span className="block text-[#ffbf1f]">notre menu</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/82 md:text-base md:leading-7">
                    Une carte pensée comme une vraie vitrine food: catégories visibles, produits
                    gourmands, personnalisation rapide et panier toujours accessible.
                  </p>
                  <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                    <a
                      href="#menu-root"
                      className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,_#ff3b30,_#d91f1f)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_34px_rgba(127,29,29,0.3)]"
                    >
                      Voir les plats
                    </a>
                    <a
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm"
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
                  className="h-full w-full object-cover object-center opacity-92 md:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(17,17,17,0.12),_rgba(17,17,17,0.4))]" />
              </div>
            </div>
          </section>

          <MenuClient
            categories={menuCategories}
          />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

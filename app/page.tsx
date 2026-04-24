import PublicFooter from "../components/PublicFooter";
import PublicHeader from "../components/PublicHeader";

import { getProductImageSrc } from "@/lib/product-image";
import { getPublicMenuCategories, getRestaurantSettings } from "@/lib/restaurant-data";

type PublicCategories = Awaited<ReturnType<typeof getPublicMenuCategories>>;
type PublicCategory = PublicCategories[number];
type PublicProduct = PublicCategory["products"][number];
type HighlightProduct = PublicProduct & { categoryName: string };

function formatPrice(value: number) {
  return `${value.toFixed(2)} DH`;
}

export default async function HomePage() {
  const [settings, categories]: [Awaited<ReturnType<typeof getRestaurantSettings>>, PublicCategories] = await Promise.all([
    getRestaurantSettings(),
    getPublicMenuCategories(),
  ]);

  const featuredProducts: HighlightProduct[] = categories
    .flatMap((category: PublicCategory) =>
      category.products.map((product: PublicProduct) => ({
        ...product,
        categoryName: category.name,
      }))
    )
    .slice(0, 4);
  const bestSellers: HighlightProduct[] = categories
    .flatMap((category: PublicCategory) =>
      category.products.map((product: PublicProduct) => ({
        ...product,
        categoryName: category.name,
      }))
    )
    .slice(0, 3);
  const whatsappLink = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`
    : null;
  const heroImage = settings?.heroImageUrl || "/images/fallback/generic-fallback.png";

  return (
    <div className="flex min-h-screen flex-col text-slate-900">
      <PublicHeader />
      <main className="flex-1 px-3 pb-5 pt-3 md:px-5 md:py-7">
        <div className="page-frame space-y-7 md:space-y-9">
          <section className="overflow-hidden rounded-[2rem] border-[3px] border-[#1a1613] bg-[#111] shadow-[0_28px_58px_rgba(33,21,12,0.22)]">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="grid-pattern hero-panel px-5 py-6 text-white md:px-10 md:py-11">
                <div className="max-w-2xl">
                  <span className="inline-flex rounded-full bg-[linear-gradient(135deg,_#ffcd3c,_#ffb703)] px-4 py-1 text-xs font-black uppercase tracking-[0.26em] text-slate-950">
                    Bienvenue chez
                  </span>
                  <h1 className="section-title mt-4 text-[3.2rem] leading-[0.88] text-white md:text-8xl xl:text-[6.2rem]">
                    TACOS
                    <span className="block text-[#ffbf1f]">YASSINOS</span>
                  </h1>
                  <p className="mt-3 text-sm font-semibold text-white md:text-lg">
                    Les meilleurs tacos de Salé
                  </p>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/78 md:text-base md:leading-7">
                    {settings?.welcomeMessage ??
                      "Un univers street-food généreux, un design impactant et une commande rapide en quelques clics."}
                  </p>

                  <div className="mt-5 grid gap-2.5 text-sm sm:flex sm:flex-wrap">
                    <a
                      href="/menu"
                      className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,_#ff3b30,_#d91f1f)] px-5 py-3 font-bold text-white shadow-[0_18px_34px_rgba(127,29,29,0.3)]"
                    >
                      Commander maintenant
                    </a>
                    {whatsappLink ? (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-white/22 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur-sm"
                      >
                        Commander sur WhatsApp
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/68">
                    <span>Commande rapide</span>
                    <span>Ingrédients frais</span>
                    <span>Qualité garantie</span>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[250px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,191,31,0.24),_transparent_28%),linear-gradient(135deg,_#2b1b11,_#0d0908)] md:min-h-[440px]">
                <div className="hero-glow" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt="Produit vedette"
                  className="h-full w-full object-cover object-center opacity-92 md:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(17,17,17,0.08),_rgba(17,17,17,0.5))]" />
              </div>
            </div>
          </section>

          <section className="grid gap-4 rounded-[2rem] bg-white px-4 py-4 shadow-[0_20px_42px_rgba(62,31,6,0.1)] md:grid-cols-4 md:px-6 md:py-5">
            {[
              ["Livraison gratuite", "Dans Tiflet et Bettana"],
              ["Ouvert", settings?.openingHours ?? "Service quotidien"],
              ["Appelez-nous", settings?.whatsappNumber ?? "WhatsApp direct"],
              ["Note 4.6/5", "Clients satisfaits"],
            ].map(([title, text], index: number) => (
              <div
                key={title}
                className={`rounded-2xl px-4 py-3 ${
                  index === 0
                    ? "bg-[linear-gradient(135deg,_#fff7df,_#ffd66b)]"
                    : index === 1
                      ? "bg-[linear-gradient(135deg,_#fff,_#ffe8cf)]"
                      : index === 2
                        ? "bg-[linear-gradient(135deg,_#2a1810,_#4b2413)] text-white"
                        : "bg-[linear-gradient(135deg,_#fff2e8,_#ffd8bb)]"
                }`}
              >
                <p className="text-sm font-bold">{title}</p>
                <p className={`mt-1 text-sm ${index === 2 ? "text-white/75" : "text-slate-600"}`}>{text}</p>
              </div>
            ))}
          </section>

          <section className="menu-showcase p-5 md:p-7 xl:p-8">
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-700">
                    Découvrez notre menu
                  </p>
                  <h2 className="mt-2 text-[2.1rem] font-black leading-tight text-slate-950 md:text-[2.5rem]">
                    Une carte pensée pour donner faim
                  </h2>
                  <p className="mt-3 text-[15px] leading-7 text-slate-600">
                    Des produits bien visibles, des catégories faciles à parcourir et une structure
                    plus claire pour mieux guider la commande.
                  </p>
                </div>
                <a
                  href="/menu"
                  className="inline-flex rounded-full bg-[#1a1613] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_28px_rgba(0,0,0,0.12)]"
                >
                  Voir tout le menu
                </a>
              </div>

              <div className="-mx-1 overflow-x-auto pb-1">
                <div className="flex min-w-max gap-2.5 px-1">
                  <span className="category-chip bg-[#1a1613] px-5 text-sm font-bold text-white shadow-sm">
                    Tous
                  </span>
                  {categories.slice(0, 8).map((category: PublicCategory) => (
                    <span
                      key={category.id}
                      className="category-chip border border-amber-200 bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {featuredProducts.map((product: HighlightProduct, index: number) => (
                    <article
                      key={product.id}
                      className="showcase-card rounded-[1.8rem] min-w-0"
                    >
                      <div className="relative aspect-[4/3] bg-[linear-gradient(135deg,_#26140b,_#6b3212)] sm:h-52 sm:aspect-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getProductImageSrc(product.name, product.imageUrl, product.categoryName)}
                          alt={product.name}
                          className="h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(19,10,6,0.02),_rgba(19,10,6,0.42))]" />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-950">
                            {index === 0 ? "Populaire" : "Maison"}
                          </span>
                        </div>
                      </div>

                      <div className="flex h-[calc(100%-11rem)] flex-col gap-4 p-4 sm:h-[calc(100%-12rem)] sm:p-5">
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">
                            {product.categoryName}
                          </p>
                          <h3 className="line-clamp-2 min-h-[3rem] text-[17px] font-bold leading-6 text-slate-950 sm:text-[18px]">
                            {product.name}
                          </h3>
                          <p className="line-clamp-2 min-h-[3.25rem] text-[13px] leading-6 text-slate-600">
                            {product.description ?? "Recette maison, ingrédients frais et saveur généreuse."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-900">
                            {index % 2 === 0 ? "Chaud" : "Maison"}
                          </span>
                          <span className="rounded-full bg-[#2b1710] px-3 py-1 text-[11px] font-bold text-amber-100">
                            {index % 2 === 0 ? "Épicé" : "Populaire"}
                          </span>
                        </div>

                        <div className="mt-auto flex flex-col gap-3 pt-1">
                          <span className="inline-flex rounded-full bg-[#ffbf1f] px-3.5 py-1.5 text-sm font-black text-slate-950">
                            {formatPrice(Number(product.basePrice))}
                          </span>
                          <a
                            href="/menu"
                            className="inline-flex w-full items-center justify-center rounded-full bg-[#1a1613] px-4 py-2.5 text-sm font-bold text-white"
                          >
                            Commander
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="grid gap-4 self-start xl:sticky xl:top-6">
                  <div className="promo-panel rounded-[2rem] p-6 text-white shadow-[0_24px_44px_rgba(154,52,18,0.24)]">
                    <p className="inline-flex rounded-full bg-white/16 px-4 py-1 text-xs font-black uppercase tracking-[0.24em] text-white">
                      Offre spéciale
                    </p>
                    <h3 className="section-title mt-4 text-4xl leading-none md:text-5xl">
                      Livraison
                      <span className="block text-[#fff0b8]">gratuite</span>
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-white/85">
                      Dans certaines zones de livraison. Une offre simple, forte et bien visible.
                    </p>
                  </div>

                  <div className="rounded-[2rem] bg-[linear-gradient(135deg,_#fff8e8,_#ffd68a)] p-5 text-slate-950 shadow-[0_18px_34px_rgba(62,31,6,0.12)]">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-800">
                      Avantages
                    </p>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-2xl bg-white/70 px-4 py-3">
                        <p className="text-sm font-semibold">Fait maison</p>
                        <p className="mt-1 text-sm text-slate-700">Des recettes généreuses et régulières.</p>
                      </div>
                      <div className="rounded-2xl bg-white/70 px-4 py-3">
                        <p className="text-sm font-semibold">Cuisson minute</p>
                        <p className="mt-1 text-sm text-slate-700">Préparé chaud pour un meilleur goût.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dark-panel rounded-[2rem] p-5 text-white md:p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-300">
                      Nos best-sellers
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-white">Les produits qui reviennent le plus</h3>
                  </div>
                  <a
                    href="/menu"
                    className="inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Voir la carte
                  </a>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  {bestSellers.map((product: HighlightProduct, index: number) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 rounded-[1.6rem] border border-white/10 bg-white/6 px-4 py-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffbf1f] text-sm font-black text-slate-950">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">{product.name}</p>
                        <p className="truncate text-sm text-white/60">
                          {product.description ?? "Le favori de nos clients"}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#ffbf1f] px-3 py-1 text-sm font-black text-slate-950">
                        {formatPrice(Number(product.basePrice))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            {[
              ["Choisissez", "Parcourez notre menu", "bg-[linear-gradient(135deg,_#fff,_#ffe6be)] text-slate-950"],
              ["Commandez", "Via le panier ou WhatsApp", "bg-[linear-gradient(135deg,_#20130d,_#4a2411)] text-white"],
              ["On prépare", "Avec des ingrédients frais", "bg-[linear-gradient(135deg,_#fff7ea,_#ffd7a0)] text-slate-950"],
              ["Livraison rapide", "Directement à votre porte", "bg-[linear-gradient(135deg,_#ffb703,_#fb8500)] text-slate-950"],
            ].map(([title, text, cardClass]) => (
              <div
                key={title}
                className={`rounded-[2rem] px-5 py-5 shadow-[0_14px_30px_rgba(62,31,6,0.12)] ${cardClass}`}
              >
                <p className="text-xs font-black uppercase tracking-[0.22em] opacity-70">Étape</p>
                <p className="mt-2 text-lg font-bold">{title}</p>
                <p className="mt-1.5 text-sm leading-6 opacity-85">{text}</p>
              </div>
            ))}
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

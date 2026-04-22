"use client";

import { useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import ProductConfigurator from "@/components/menu/ProductConfigurator";
import type { MenuCategory } from "@/components/menu/types";

type MenuClientProps = {
  categories: MenuCategory[];
};

const ALL_CATEGORIES_ID = "all-categories";

export default function MenuClient({ categories }: MenuClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL_CATEGORIES_ID);
  const { addToCart } = useCart();

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null;

  return (
    <>
      <div className="brand-shell rounded-[2rem] p-5 md:p-6">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
              Sélection du jour
            </p>
            <h2 className="mt-2.5 text-3xl font-semibold text-slate-900 md:text-4xl">
              Filtrez par catégorie ou affichez tout le menu d&apos;un seul coup.
            </h2>
            <p className="mt-2.5 text-sm leading-6 text-slate-600 md:text-base">
              Utilisez les boutons de catégories pour aller plus vite, ou cliquez sur
              &nbsp;`Tous` pour afficher toutes les catégories et tous les plats en même temps.
            </p>
          </div>

          <div className="flex w-full max-w-xl flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {[{ id: ALL_CATEGORIES_ID, name: "Tous" }, ...categories].map((category) => {
                const isActive = category.id === selectedCategoryId;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium shadow-sm transition ${
                      isActive
                        ? "bg-[#1a1613] text-white"
                        : "border border-amber-200 bg-white text-amber-800"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div id="menu-root" className="space-y-6">
        {categories.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">
              Le menu est temporairement vide
            </p>
            <p className="mt-3 text-slate-600">
              Aucune catégorie active avec des produits actifs n&apos;est disponible pour le moment.
            </p>
          </div>
        ) : selectedCategoryId === ALL_CATEGORIES_ID ? (
          <div className="space-y-6">
            {categories.map((category) => (
              <section key={category.id} className="space-y-4">
                <div className="brand-shell rounded-[2rem] p-5">
                  <div className="relative z-10 flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                        Catégorie
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        {category.name}
                      </h2>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                      {category.products.length} produit(s)
                    </span>
                  </div>
                  {category.description ? (
                    <p className="relative z-10 mt-2.5 max-w-3xl text-slate-600">
                      {category.description}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {category.products.map((product) => (
                    <ProductConfigurator
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : selectedCategory ? (
          <section key={selectedCategory.id} className="space-y-4">
            <div className="brand-shell rounded-[2rem] p-5">
              <div className="relative z-10 flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Catégorie sélectionnée
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    {selectedCategory.name}
                  </h2>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                  {selectedCategory.products.length} produit(s)
                </span>
              </div>
              {selectedCategory.description ? (
                <p className="relative z-10 mt-2.5 max-w-3xl text-slate-600">
                  {selectedCategory.description}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {selectedCategory.products.map((product) => (
                <ProductConfigurator
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">Aucune catégorie disponible</p>
          </div>
        )}
      </div>
    </>
  );
}

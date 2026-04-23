"use client";

import { useMemo, useState } from "react";

import type { CartItem, MenuProduct, MenuProductOption, MenuProductSize } from "@/components/menu/types";
import { detectProductImageKind, getProductImageSrc } from "@/lib/product-image";

function formatPrice(value: number) {
  return `${value.toFixed(2)} DH`;
}

function getProductRules(kind: ReturnType<typeof detectProductImageKind>, product: MenuProduct) {
  switch (kind) {
    case "tacos":
      return {
        showSizes: false,
        showSauces: product.sauces.length > 0,
        showExtras: product.extras.length > 0,
        showDrinks: product.drinks.length > 0,
      };
    case "pizza":
      return {
        showSizes: product.sizes.length > 0,
        showSauces: false,
        showExtras: product.extras.length > 0,
        showDrinks: product.drinks.length > 0,
      };
    case "burger":
      return {
        showSizes: false,
        showSauces: product.sauces.length > 0,
        showExtras: product.extras.length > 0,
        showDrinks: product.drinks.length > 0,
      };
    default:
      return {
        showSizes: product.sizes.length > 0,
        showSauces: product.sauces.length > 0,
        showExtras: product.extras.length > 0,
        showDrinks: product.drinks.length > 0,
      };
  }
}

export default function ProductConfigurator({
  product,
  onAddToCart,
}: {
  product: MenuProduct;
  onAddToCart: (item: CartItem) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(
    product.sizes[0]?.id ?? null
  );
  const [selectedSauceIds, setSelectedSauceIds] = useState<string[]>([]);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [selectedDrinkId, setSelectedDrinkId] = useState<string | null>(null);

  const kind = detectProductImageKind(product.name, product.categoryName);
  const rules = getProductRules(kind, product);
  const imageSrc = getProductImageSrc(product.name, product.imageUrl, product.categoryName);

  const selectedSize = product.sizes.find((size: MenuProductSize) => size.id === selectedSizeId) ?? null;
  const selectedSauces = product.sauces.filter((option: MenuProductOption) =>
    selectedSauceIds.includes(option.id)
  );
  const selectedExtras = product.extras.filter((option: MenuProductOption) =>
    selectedExtraIds.includes(option.id)
  );
  const selectedDrink = product.drinks.find((option: MenuProductOption) => option.id === selectedDrinkId) ?? null;

  const unitPrice = useMemo(() => {
    const sizePrice = selectedSize?.priceModifier ?? 0;
    const saucesPrice = selectedSauces.reduce((sum: number, option: MenuProductOption) => sum + option.price, 0);
    const extrasPrice = selectedExtras.reduce((sum: number, option: MenuProductOption) => sum + option.price, 0);
    const drinkPrice = selectedDrink?.price ?? 0;

    return product.basePrice + sizePrice + saucesPrice + extrasPrice + drinkPrice;
  }, [product.basePrice, selectedDrink, selectedExtras, selectedSauces, selectedSize]);

  const totalPrice = unitPrice * quantity;

  function toggleMultiSelect(
    id: string,
    selectedIds: string[],
    setSelectedIds: (ids: string[]) => void
  ) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId: string) => selectedId !== id));
      return;
    }

    setSelectedIds([...selectedIds, id]);
  }

  function toggleSingleSelect(
    id: string,
    selectedId: string | null,
    setSelectedId: (value: string | null) => void
  ) {
    if (selectedId === id) {
      setSelectedId(null);
      return;
    }

    setSelectedId(id);
  }

  function handleAddToCart() {
    onAddToCart({
      id: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      quantity,
      basePrice: product.basePrice,
      unitPrice,
      subtotal: totalPrice,
      selectedSize,
      selectedSauces,
      selectedExtras,
      selectedDrink,
    });

    setQuantity(1);
    setSelectedSauceIds([]);
    setSelectedExtraIds([]);
    setSelectedDrinkId(null);
    setSelectedSizeId(product.sizes[0]?.id ?? null);
    if (typeof window !== "undefined") {
      window.location.hash = "menu-root";
    }
  }

  return (
    <>
      <article className="warm-card overflow-hidden rounded-[1.7rem]">
        <div className="relative h-44 w-full bg-[linear-gradient(135deg,_#1b130a,_#3b260c)] sm:h-48">
          {/* A plain img keeps admin-uploaded and arbitrary product URLs from breaking hydration. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
              {product.categoryName}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                product.available
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {product.available ? "Disponible" : "Indisponible"}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950 sm:text-xl">{product.name}</h3>
              <p className="mt-1.5 text-sm leading-5 text-slate-600">
                {product.description ?? "Description à venir."}
              </p>
            </div>
            <p className="whitespace-nowrap rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-amber-300">
              {formatPrice(product.basePrice)}
            </p>
          </div>

          <div className="flex items-center justify-end border-t border-slate-200/70 pt-3">
            <a
              href={product.available ? `#product-config-${product.id}` : "#menu-root"}
              aria-disabled={!product.available}
              className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
                product.available
                  ? "bg-[linear-gradient(135deg,_#ef4444,_#dc2626)] hover:shadow-lg hover:shadow-red-500/20"
                  : "cursor-not-allowed bg-slate-300 text-slate-500"
              }`}
            >
              Personnaliser
            </a>
          </div>
        </div>
      </article>

      <div
        id={`product-config-${product.id}`}
        className="product-modal mt-4 scroll-mt-28"
      >
          <div className="w-full rounded-[2rem] bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                  Fiche produit
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {product.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {product.description ?? "Composez votre produit selon vos préférences."}
                </p>
              </div>
              <a
                href="#menu-root"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
              >
                Fermer
              </a>
            </div>

            <div className="mt-6 space-y-6">
              {rules.showSizes ? (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Taille
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {product.sizes.map((size: MenuProductSize) => (
                      <label
                        key={size.id}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 ${
                          selectedSizeId === size.id
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <span className="font-medium text-slate-900">{size.name}</span>
                        <span className="text-sm text-slate-600">
                          {size.priceModifier > 0
                            ? `+${formatPrice(size.priceModifier)}`
                            : "Inclus"}
                        </span>
                        <input
                          type="radio"
                          name={`size-${product.id}`}
                          className="sr-only"
                          checked={selectedSizeId === size.id}
                          onChange={() => setSelectedSizeId(size.id)}
                        />
                      </label>
                    ))}
                  </div>
                </section>
              ) : null}

              {rules.showSauces ? (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Sauces
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {product.sauces.map((option: MenuProductOption) => (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 ${
                          selectedSauceIds.includes(option.id)
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <span className="font-medium text-slate-900">{option.name}</span>
                        <span className="text-sm text-slate-600">
                          {option.price > 0 ? `+${formatPrice(option.price)}` : "Inclus"}
                        </span>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selectedSauceIds.includes(option.id)}
                          onChange={() =>
                            toggleMultiSelect(option.id, selectedSauceIds, setSelectedSauceIds)
                          }
                        />
                      </label>
                    ))}
                  </div>
                </section>
              ) : null}

              {rules.showExtras ? (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Extras
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {product.extras.map((option: MenuProductOption) => (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 ${
                          selectedExtraIds.includes(option.id)
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <span className="font-medium text-slate-900">{option.name}</span>
                        <span className="text-sm text-slate-600">
                          {option.price > 0 ? `+${formatPrice(option.price)}` : "Inclus"}
                        </span>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selectedExtraIds.includes(option.id)}
                          onChange={() =>
                            toggleMultiSelect(option.id, selectedExtraIds, setSelectedExtraIds)
                          }
                        />
                      </label>
                    ))}
                  </div>
                </section>
              ) : null}

              {rules.showDrinks ? (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Boisson
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {product.drinks.map((option: MenuProductOption) => (
                      <button
                        type="button"
                        key={option.id}
                        aria-pressed={selectedDrinkId === option.id}
                        onClick={() =>
                          toggleSingleSelect(option.id, selectedDrinkId, setSelectedDrinkId)
                        }
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 ${
                          selectedDrinkId === option.id
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <span className="font-medium text-slate-900">{option.name}</span>
                        <span className="text-sm text-slate-600">
                          {option.price > 0 ? `+${formatPrice(option.price)}` : "Inclus"}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    La boisson est optionnelle. Recliquez sur une boisson choisie pour l&apos;annuler.
                  </p>
                </section>
              ) : null}

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Quantité
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="rounded-full border border-slate-200 px-4 py-2 text-lg font-semibold text-slate-700"
                  >
                    -
                  </button>
                  <div className="min-w-14 rounded-full bg-slate-100 px-4 py-2 text-center font-semibold text-slate-900">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-lg font-semibold text-slate-700"
                  >
                    +
                  </button>
                </div>
              </section>
            </div>

            <div className="mt-8 rounded-3xl bg-slate-950 p-5 text-slate-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Prix unitaire personnalisé</p>
                  <p className="mt-1 text-2xl font-semibold">{formatPrice(unitPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total</p>
                  <p className="mt-1 text-2xl font-semibold">{formatPrice(totalPrice)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                Ajouter au panier
              </button>
              <a
                href="#menu-root"
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 sm:w-auto"
              >
                Retour au menu
              </a>
            </div>
          </div>
        </div>
    </>
  );
}

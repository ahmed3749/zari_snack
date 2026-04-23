"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import type {
  CartItem,
  CheckoutPayloadItem,
  MenuProductOption,
  MenuProductSize,
} from "@/components/menu/types";

type CheckoutForm = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  note: string;
};

type CartContextValue = {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  addToCart: (item: CartItem) => void;
  openCart: () => void;
  closeCart: () => void;
};

type CartStep = 1 | 2 | 3;

const CartContext = createContext<CartContextValue | null>(null);

const initialForm: CheckoutForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  note: "",
};

function formatPrice(value: number) {
  return `${value.toFixed(2)} DH`;
}

function describeOptions(
  size: MenuProductSize | null,
  sauces: MenuProductOption[],
  extras: MenuProductOption[],
  drink: MenuProductOption | null
) {
  const parts: string[] = [];

  if (size) {
    parts.push(`Taille: ${size.name}`);
  }

  if (sauces.length > 0) {
    parts.push(`Sauces: ${sauces.map((option: MenuProductOption) => option.name).join(", ")}`);
  }

  if (extras.length > 0) {
    parts.push(`Extras: ${extras.map((option: MenuProductOption) => option.name).join(", ")}`);
  }

  if (drink) {
    parts.push(`Boisson: ${drink.name}`);
  }

  return parts;
}

const steps: Array<{ id: CartStep; label: string }> = [
  { id: 1, label: "Panier" },
  { id: 2, label: "Infos" },
  { id: 3, label: "Validation" },
];

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<CartStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<CheckoutForm>(initialForm);

  const cartCount = useMemo(
    () => cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
    [cartItems]
  );
  const cartTotal = useMemo(
    () => cartItems.reduce((sum: number, item: CartItem) => sum + item.subtotal, 0),
    [cartItems]
  );

  function openCart() {
    setCurrentStep(1);
    setSubmitError("");
    setIsCartOpen(true);
  }

  function closeCart() {
    setIsCartOpen(false);
    setCurrentStep(1);
    setSubmitError("");
  }

  function addToCart(item: CartItem) {
    setCartItems((current) => [...current, item]);
  }

  function updateItemQuantity(itemId: string, nextQuantity: number) {
    setCartItems((current: CartItem[]) =>
      current
        .map((item: CartItem) =>
          item.id === itemId
            ? {
                ...item,
                quantity: nextQuantity,
                subtotal: item.unitPrice * nextQuantity,
              }
            : item
        )
        .filter((item: CartItem) => item.quantity > 0)
    );
  }

  function removeItem(itemId: string) {
    setCartItems((current: CartItem[]) => current.filter((item: CartItem) => item.id !== itemId));
  }

  function setFormField(field: keyof CheckoutForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function goToInfoStep() {
    setSubmitError("");

    if (cartItems.length === 0) {
      setSubmitError("Ajoutez au moins un produit au panier.");
      return;
    }

    setCurrentStep(2);
  }

  function goToValidationStep() {
    setSubmitError("");

    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setSubmitError("Merci de remplir tous les champs obligatoires.");
      return;
    }

    setCurrentStep(3);
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    if (cartItems.length === 0) {
      setSubmitError("Ajoutez au moins un produit au panier.");
      setCurrentStep(1);
      return;
    }

    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setSubmitError("Merci de remplir tous les champs obligatoires.");
      setCurrentStep(2);
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      note: form.note.trim(),
      items: cartItems.map<CheckoutPayloadItem>((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedSizeId: item.selectedSize?.id ?? null,
        selectedSauceIds: item.selectedSauces.map((option: MenuProductOption) => option.id),
        selectedExtraIds: item.selectedExtras.map((option: MenuProductOption) => option.id),
        selectedDrinkId: item.selectedDrink?.id ?? null,
      })),
    };

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'enregistrer la commande.");
      }

      setCartItems([]);
      setForm(initialForm);
      setIsCartOpen(false);
      setCurrentStep(1);
      window.location.href = data.whatsappUrl;
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Impossible d'enregistrer la commande."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const value: CartContextValue = {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    addToCart,
    openCart,
    closeCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}

      {isCartOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                  Panier
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Finaliser votre commande
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Avancez étape par étape pour vérifier, renseigner, puis valider.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
              >
                Fermer
              </button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {steps.map((step: { id: CartStep; label: string }) => {
                const isActive = currentStep === step.id;
                const isDone = currentStep > step.id;

                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl border px-4 py-3 transition ${
                      isActive
                        ? "border-amber-400 bg-amber-50"
                        : isDone
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Étape {step.id}
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{step.label}</p>
                  </div>
                );
              })}
            </div>

            {submitError ? (
              <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </div>
            ) : null}

            {currentStep === 1 ? (
              <>
                {cartItems.length === 0 ? (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <p className="text-lg font-semibold text-slate-900">Votre panier est vide</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Le client peut terminer ses choix de plats puis ouvrir le panier quand il est prêt.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3.5">
                    {cartItems.map((item: CartItem) => {
                      const optionLines = describeOptions(
                        item.selectedSize,
                        item.selectedSauces,
                        item.selectedExtras,
                        item.selectedDrink
                      );

                      return (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-slate-900">{item.productName}</h3>
                              {optionLines.length > 0 ? (
                                <div className="mt-2 space-y-1 text-xs text-slate-500">
                                  {optionLines.map((line: string) => (
                                    <p key={line}>{line}</p>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <p className="whitespace-nowrap font-semibold text-slate-900">
                              {formatPrice(item.subtotal)}
                            </p>
                          </div>

                          <div className="mt-3.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                className="rounded-full border border-slate-300 px-3 py-1 text-sm"
                              >
                                -
                              </button>
                              <span className="min-w-8 text-center text-sm font-semibold text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="rounded-full border border-slate-300 px-3 py-1 text-sm"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-sm text-rose-600 transition hover:text-rose-500"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="rounded-3xl bg-slate-950 px-5 py-4 text-slate-100">
                    <p className="text-sm text-slate-400">Total panier</p>
                    <p className="mt-1 text-2xl font-semibold">{formatPrice(cartTotal)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={goToInfoStep}
                    className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                  >
                    Continuer vers les informations
                  </button>
                </div>
              </>
            ) : null}

            {currentStep === 2 ? (
              <div className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Nom complet</span>
                    <input
                      required
                      value={form.fullName}
                      onChange={(e) => setFormField("fullName", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Téléphone</span>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setFormField("phone", e.target.value)}
                      placeholder="0600000000"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400"
                    />
                  </label>
                </div>

                <label className="mt-4 block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Adresse de livraison</span>
                  <input
                    required
                    value={form.address}
                    onChange={(e) => setFormField("address", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400"
                  />
                </label>

                <label className="mt-4 block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Quartier ou ville</span>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setFormField("city", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400"
                  />
                </label>

                <label className="mt-4 block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Remarque</span>
                  <textarea
                    rows={4}
                    value={form.note}
                    onChange={(e) => setFormField("note", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400"
                    placeholder="Optionnel"
                  />
                </label>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    Retour au panier
                  </button>
                  <button
                    type="button"
                    onClick={goToValidationStep}
                    className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                  >
                    Continuer vers la validation
                  </button>
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <form onSubmit={submitOrder} className="mt-6 space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Récapitulatif</h3>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-900">Client:</span> {form.fullName}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Téléphone:</span> {form.phone}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Adresse:</span> {form.address}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Quartier / Ville:</span> {form.city}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Remarque:</span> {form.note || "Aucune"}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-950 p-5 text-slate-100">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-400">Articles</span>
                    <span className="text-lg font-semibold">{cartCount}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-400">Total panier</span>
                    <span className="text-2xl font-semibold">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    Retour aux informations
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isSubmitting ? "Enregistrement..." : "Valider et ouvrir WhatsApp"}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import SectionHeading from "../../../components/SectionHeading";
import AdminImageUploadField from "../../../components/admin/AdminImageUploadField";

import {
  createCatalogOption,
  createCategory,
  createProduct,
  deleteCatalogOption,
  deleteCategory,
  deleteProduct,
  updateCatalogOption,
  updateCategory,
  updateProduct,
} from "./actions";

import { requireAdminSession } from "@/lib/admin-auth";
import { getProductImageSrc } from "@/lib/product-image";
import { getAdminCatalogData } from "@/lib/restaurant-data";

function formatPrice(value: number) {
  return `${value.toFixed(2)} DH`;
}

type OptionRecord = {
  id: string;
  name: string;
  price: number;
  active: boolean;
};

type AdminCatalogData = Awaited<ReturnType<typeof getAdminCatalogData>>;
type ProductSize = AdminCatalogData["categories"][number]["products"][number]["sizes"][number];
type ProductOptionLink = AdminCatalogData["categories"][number]["products"][number]["optionLinks"][number];
type Product = Omit<AdminCatalogData["categories"][number]["products"][number], "sizes" | "optionLinks"> & {
  sizes: ProductSize[];
  optionLinks: ProductOptionLink[];
};
type Category = Omit<AdminCatalogData["categories"][number], "products"> & {
  products: Product[];
};
type ViewMode = "overview" | "add-category" | "add-product" | "categories" | "products" | "options";

const SIZE_OPTIONS = [
  { key: "petit", label: "Petit" },
  { key: "moyen", label: "Moyen" },
  { key: "grand", label: "Grand" },
] as const;

function ProductFormFields({
  categories,
  sauces,
  extras,
  drinks,
  product,
}: {
  categories: Category[];
  sauces: OptionRecord[];
  extras: OptionRecord[];
  drinks: OptionRecord[];
  product?: Product;
}) {
  const selectedSauceIds = new Set(
    product?.optionLinks.flatMap((link: ProductOptionLink) => (link.sauce ? [link.sauce.id] : [])) ?? []
  );
  const selectedExtraIds = new Set(
    product?.optionLinks.flatMap((link: ProductOptionLink) => (link.extra ? [link.extra.id] : [])) ?? []
  );
  const selectedDrinkIds = new Set(
    product?.optionLinks.flatMap((link: ProductOptionLink) => (link.drink ? [link.drink.id] : [])) ?? []
  );
  const basePrice = product ? Number(product.basePrice) : 0;
  const productSizes: ProductSize[] = product?.sizes ?? [];
  const sizeMap = new Map<string, number>(
    productSizes.map((size: ProductSize) => [
      size.name.toLowerCase(),
      basePrice + Number(size.priceModifier),
    ])
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Nom du produit</span>
          <input
            type="text"
            name="name"
            defaultValue={product?.name ?? ""}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Catégorie</span>
          <select
            name="categoryId"
            defaultValue={product?.categoryId ?? categories[0]?.id ?? ""}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
            required
          >
            {categories.map((category: Category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm text-slate-300">Description</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminImageUploadField defaultValue={product?.imageUrl ?? ""} />
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Prix de base</span>
          <input
            type="text"
            name="basePrice"
            inputMode="decimal"
            pattern="^[0-9]+([.,][0-9]{1,2})?$"
            defaultValue={product ? Number(product.basePrice) : 0}
            placeholder="Ex: 30 ou 30,00"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
            required
          />
          <p className="text-xs text-slate-500">
            Utilisé pour les plats sans tailles. Si des tailles sont cochées, le plus petit prix
            saisi devient automatiquement le prix de base.
          </p>
        </label>
      </div>

      <div className="space-y-3">
        <span className="text-sm text-slate-300">Tailles</span>
        <div className="grid gap-3 md:grid-cols-3">
          {SIZE_OPTIONS.map((size) => {
            const exactPrice = sizeMap.get(size.label.toLowerCase());
            const isEnabled = exactPrice !== undefined;

            return (
              <label
                key={size.key}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-100">{size.label}</span>
                  <input
                    type="checkbox"
                    name={`sizeEnabled-${size.key}`}
                    defaultChecked={isEnabled}
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <span className="text-xs text-slate-400">Prix exact pour cette taille</span>
                  <input
                    type="text"
                    name={`sizePrice-${size.key}`}
                    inputMode="decimal"
                    pattern="^[0-9]+([.,][0-9]{1,2})?$"
                    defaultValue={exactPrice ?? ""}
                    placeholder={size.label === "Petit" ? "Ex: 35 ou 35,00" : "Ex: 30,00"}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
                  />
                </div>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-slate-500">
          Cochez uniquement les tailles disponibles pour ce plat, puis indiquez le prix exact de
          chaque taille.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-slate-100">Sauces</p>
          <div className="mt-3 space-y-2 text-sm">
            {sauces.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  name="sauceIds"
                  value={option.id}
                  defaultChecked={selectedSauceIds.has(option.id)}
                />
                <span>{option.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-slate-100">Extras</p>
          <div className="mt-3 space-y-2 text-sm">
            {extras.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  name="extraIds"
                  value={option.id}
                  defaultChecked={selectedExtraIds.has(option.id)}
                />
                <span>{option.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-slate-100">Boissons</p>
          <div className="mt-3 space-y-2 text-sm">
            {drinks.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  name="drinkIds"
                  value={option.id}
                  defaultChecked={selectedDrinkIds.has(option.id)}
                />
                <span>{option.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
          <span>Actif</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="available" defaultChecked={product?.available ?? true} />
          <span>Disponible</span>
        </label>
      </div>
    </>
  );
}

function OptionSection({
  title,
  type,
  options,
}: {
  title: string;
  type: "sauce" | "extra" | "drink";
  options: OptionRecord[];
}) {
  return (
    <section className="rounded-3xl bg-slate-900/90 p-6 text-slate-100 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-slate-400">
            Ajoutez, modifiez ou supprimez les options disponibles.
          </p>
        </div>
      </div>

      <form
        action={createCatalogOption}
        className="mt-5 grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 md:grid-cols-[1fr_10rem_8rem_auto]"
      >
        <input type="hidden" name="type" value={type} />
        <input
          type="text"
          name="name"
          placeholder="Nom"
          className="rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
          required
        />
        <input
          type="number"
          name="price"
          step="0.01"
          min="0"
          placeholder="Prix"
          className="rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
          required
        />
        <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-300">
          <input type="checkbox" name="active" defaultChecked />
          <span>Actif</span>
        </label>
        <button className="rounded-full bg-amber-500 px-4 py-3 font-semibold text-slate-950" type="submit">
          Ajouter
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {options.map((option) => (
          <div key={option.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <form
              action={updateCatalogOption}
              className="grid gap-3 md:grid-cols-[1fr_10rem_8rem_auto_auto]"
            >
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="id" value={option.id} />
              <input
                type="text"
                name="name"
                defaultValue={option.name}
                className="rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
                required
              />
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                defaultValue={option.price}
                className="rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
                required
              />
              <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-300">
                <input type="checkbox" name="active" defaultChecked={option.active} />
                <span>Actif</span>
              </label>
              <button className="rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold" type="submit">
                Enregistrer
              </button>
            </form>
            <form action={deleteCatalogOption} className="mt-3">
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="id" value={option.id} />
              <button className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold" type="submit">
                Supprimer
              </button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickLink({
  href,
  title,
  description,
  active,
}: {
  href: string;
  title: string;
  description: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border p-4 transition ${
        active
          ? "border-amber-400 bg-amber-500/10 text-white"
          : "border-slate-800 bg-slate-950/50 text-slate-200 hover:border-slate-700"
      }`}
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </Link>
  );
}

function CategoryEditor({ category }: { category: Category }) {
  return (
    <article className="rounded-3xl bg-slate-900/90 p-6 text-slate-100 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-96">
          <h2 className="text-xl font-semibold">{category.name}</h2>
          <p className="mt-2 text-sm text-slate-400">
            {category.description ?? "Aucune description"}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            Ordre {category.displayOrder}
          </p>

          <form action={updateCategory} className="mt-4 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <input type="hidden" name="id" value={category.id} />
            <input
              type="text"
              name="name"
              defaultValue={category.name}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
              required
            />
            <textarea
              name="description"
              defaultValue={category.description ?? ""}
              rows={3}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
            />
            <input
              type="number"
              name="displayOrder"
              defaultValue={category.displayOrder}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
            />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" name="active" defaultChecked={category.active} />
              <span>Active</span>
            </label>
            <button className="rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold" type="submit">
              Enregistrer la catégorie
            </button>
          </form>

          <form action={deleteCategory} className="mt-3">
            <input type="hidden" name="id" value={category.id} />
            <button className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold" type="submit">
              Supprimer la catégorie
            </button>
          </form>
        </div>

        <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
          <p className="text-sm font-semibold text-slate-200">Produits de la catégorie</p>
          <div className="mt-3 space-y-3">
            {category.products.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun produit dans cette catégorie.</p>
            ) : (
              category.products.map((product: Product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-100">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{formatPrice(Number(product.basePrice))}</p>
                  </div>
                  <Link
                    href={`/admin/menu?view=products&productId=${product.id}`}
                    className="rounded-full bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950"
                  >
                    Gérer le plat
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductEditor({
  product,
  categories,
  sauces,
  extras,
  drinks,
}: {
  product: Product;
  categories: Category[];
  sauces: OptionRecord[];
  extras: OptionRecord[];
  drinks: OptionRecord[];
}) {
  const category = categories.find((entry) => entry.id === product.categoryId);

  return (
    <article className="rounded-3xl bg-slate-900/90 p-6 text-slate-100 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {category?.name ?? "Sans catégorie"} · {formatPrice(Number(product.basePrice))}
          </p>
        </div>
        <img
          src={getProductImageSrc(product.name, product.imageUrl, category?.name)}
          alt={product.name}
          className="h-28 w-40 rounded-xl object-cover"
        />
      </div>

      <form action={updateProduct} className="space-y-4">
        <input type="hidden" name="id" value={product.id} />
        <ProductFormFields
          categories={categories}
          sauces={sauces}
          extras={extras}
          drinks={drinks}
          product={product}
        />
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold" type="submit">
            Enregistrer le produit
          </button>
        </div>
      </form>

      <form action={deleteProduct} className="mt-3">
        <input type="hidden" name="id" value={product.id} />
        <button className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold" type="submit">
          Supprimer le produit
        </button>
      </form>
    </article>
  );
}

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams?: Promise<{
    view?: string;
    categoryId?: string;
    productId?: string;
  }>;
}) {
  await requireAdminSession();
  const params = (await searchParams) ?? {};
  const view = (params.view as ViewMode | undefined) ?? "overview";
  const { categories: rawCategories, sauces, extras, drinks } = await getAdminCatalogData();
  const categories: Category[] = rawCategories;

  const normalizedSauces = sauces.map((option) => ({ ...option, price: Number(option.price) }));
  const normalizedExtras = extras.map((option) => ({ ...option, price: Number(option.price) }));
  const normalizedDrinks = drinks.map((option) => ({ ...option, price: Number(option.price) }));
  const allProducts: Product[] = categories.flatMap((category: Category) => category.products);
  const selectedCategory =
    categories.find((category: Category) => category.id === params.categoryId) ?? categories[0] ?? null;
  const selectedProduct =
    allProducts.find((product: Product) => product.id === params.productId) ?? allProducts[0] ?? null;

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Gestion du menu"
        description="Choisissez directement l'opération à faire pour éviter la longue page et accéder plus vite à une catégorie, un plat ou une option."
      />

      <section className="rounded-3xl bg-slate-900/90 p-6 text-slate-100 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Accès rapide</h2>
          <p className="text-sm text-slate-400">
            Sélectionnez la zone à gérer, puis ciblez directement la catégorie ou le produit concerné.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <QuickLink
            href="/admin/menu?view=overview"
            title="Vue d'ensemble"
            description="Voir le résumé du catalogue et les accès rapides."
            active={view === "overview"}
          />
          <QuickLink
            href="/admin/menu?view=add-category"
            title="Ajouter une catégorie"
            description="Créer une nouvelle catégorie sans scroller."
            active={view === "add-category"}
          />
          <QuickLink
            href="/admin/menu?view=add-product"
            title="Ajouter un plat"
            description="Créer un nouveau produit directement."
            active={view === "add-product"}
          />
          <QuickLink
            href={`/admin/menu?view=categories${selectedCategory ? `&categoryId=${selectedCategory.id}` : ""}`}
            title="Gérer une catégorie"
            description="Choisir une catégorie précise à modifier."
            active={view === "categories"}
          />
          <QuickLink
            href={`/admin/menu?view=products${selectedProduct ? `&productId=${selectedProduct.id}` : ""}`}
            title="Gérer un plat"
            description="Choisir un produit précis à modifier."
            active={view === "products"}
          />
          <QuickLink
            href="/admin/menu?view=options"
            title="Gérer sauces et extras"
            description="Modifier les sauces, extras et boissons."
            active={view === "options"}
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <form action="/admin/menu" className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <input type="hidden" name="view" value="categories" />
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Aller à une catégorie</span>
              <div className="flex flex-col gap-3 md:flex-row">
                <select
                  name="categoryId"
                  defaultValue={selectedCategory?.id ?? ""}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
                >
                  {categories.map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button className="rounded-full bg-amber-500 px-5 py-3 font-semibold text-slate-950" type="submit">
                  Ouvrir
                </button>
              </div>
            </label>
          </form>

          <form action="/admin/menu" className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <input type="hidden" name="view" value="products" />
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Aller à un plat</span>
              <div className="flex flex-col gap-3 md:flex-row">
                <select
                  name="productId"
                  defaultValue={selectedProduct?.id ?? ""}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
                >
                  {categories.map((category: Category) => (
                    <optgroup key={category.id} label={category.name}>
                      {category.products.map((product: Product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button className="rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950" type="submit">
                  Ouvrir
                </button>
              </div>
            </label>
          </form>
        </div>
      </section>

      {view === "overview" ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-slate-900/90 p-5 text-slate-100 shadow-sm">
            <p className="text-sm text-slate-400">Catégories</p>
            <p className="mt-2 text-3xl font-semibold">{categories.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-900/90 p-5 text-slate-100 shadow-sm">
            <p className="text-sm text-slate-400">Produits</p>
            <p className="mt-2 text-3xl font-semibold">{allProducts.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-900/90 p-5 text-slate-100 shadow-sm">
            <p className="text-sm text-slate-400">Sauces + Extras</p>
            <p className="mt-2 text-3xl font-semibold">{normalizedSauces.length + normalizedExtras.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-900/90 p-5 text-slate-100 shadow-sm">
            <p className="text-sm text-slate-400">Boissons</p>
            <p className="mt-2 text-3xl font-semibold">{normalizedDrinks.length}</p>
          </div>
        </section>
      ) : null}

      {view === "add-category" ? (
        <section className="rounded-3xl bg-slate-900/90 p-6 text-slate-100 shadow-sm">
          <h2 className="text-xl font-semibold">Ajouter une catégorie</h2>
          <form action={createCategory} className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              type="text"
              name="name"
              placeholder="Nom de la catégorie"
              className="rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
              required
            />
            <input
              type="number"
              name="displayOrder"
              placeholder="Ordre"
              defaultValue={0}
              className="rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
            />
            <textarea
              name="description"
              placeholder="Description"
              rows={3}
              className="rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100 md:col-span-2"
            />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" name="active" defaultChecked />
              <span>Catégorie active</span>
            </label>
            <button className="rounded-full bg-amber-500 px-5 py-3 font-semibold text-slate-950" type="submit">
              Ajouter la catégorie
            </button>
          </form>
        </section>
      ) : null}

      {view === "add-product" ? (
        <section className="rounded-3xl bg-slate-900/90 p-6 text-slate-100 shadow-sm">
          <h2 className="text-xl font-semibold">Ajouter un produit</h2>
          <form action={createProduct} className="mt-5 space-y-4">
            <ProductFormFields
              categories={categories}
              sauces={normalizedSauces}
              extras={normalizedExtras}
              drinks={normalizedDrinks}
            />
            <button className="rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950" type="submit">
              Ajouter le produit
            </button>
          </form>
        </section>
      ) : null}

      {view === "categories" ? (
        selectedCategory ? (
          <CategoryEditor category={selectedCategory} />
        ) : (
          <div className="rounded-3xl bg-slate-900/90 p-6 text-slate-400 shadow-sm">
            Aucune catégorie disponible.
          </div>
        )
      ) : null}

      {view === "products" ? (
        selectedProduct ? (
          <ProductEditor
            product={selectedProduct}
            categories={categories}
            sauces={normalizedSauces}
            extras={normalizedExtras}
            drinks={normalizedDrinks}
          />
        ) : (
          <div className="rounded-3xl bg-slate-900/90 p-6 text-slate-400 shadow-sm">
            Aucun produit disponible.
          </div>
        )
      ) : null}

      {view === "options" ? (
        <div className="space-y-6">
          <OptionSection
            title="Gestion des sauces"
            type="sauce"
            options={normalizedSauces}
          />
          <OptionSection
            title="Gestion des extras"
            type="extra"
            options={normalizedExtras}
          />
          <OptionSection
            title="Gestion des boissons"
            type="drink"
            options={normalizedDrinks}
          />
        </div>
      ) : null}
    </div>
  );
}

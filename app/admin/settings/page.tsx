import SectionHeading from "../../../components/SectionHeading";

import { saveRestaurantSettings } from "./actions";

import { requireAdminSession } from "@/lib/admin-auth";
import { getRestaurantSettings } from "@/lib/restaurant-data";

export default async function AdminSettingsPage() {
  await requireAdminSession();
  const settings = await getRestaurantSettings();

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Paramètres"
        description="Configurez le restaurant, le numéro WhatsApp, l&apos;accueil et les informations affichées au public."
      />

      <div className="rounded-3xl bg-slate-900/90 p-8 text-slate-100 shadow-sm">
        <form action={saveRestaurantSettings} className="grid gap-4 md:grid-cols-2">
          {settings ? <input type="hidden" name="id" value={settings.id} /> : null}

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Nom du restaurant</span>
            <input
              type="text"
              name="restaurantName"
              defaultValue={settings?.restaurantName ?? ""}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">WhatsApp</span>
            <input
              type="text"
              name="whatsappNumber"
              defaultValue={settings?.whatsappNumber ?? ""}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Adresse</span>
            <input
              type="text"
              name="address"
              defaultValue={settings?.address ?? ""}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Horaires</span>
            <input
              type="text"
              name="openingHours"
              defaultValue={settings?.openingHours ?? ""}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Logo URL</span>
            <input
              type="url"
              name="logoUrl"
              defaultValue={settings?.logoUrl ?? ""}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Frais de livraison</span>
            <input
              type="number"
              name="deliveryFee"
              step="0.01"
              min="0"
              defaultValue={settings ? Number(settings.deliveryFee) : 0}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm text-slate-300">Message d&apos;accueil</span>
            <textarea
              name="welcomeMessage"
              rows={4}
              defaultValue={settings?.welcomeMessage ?? ""}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100"
            />
          </label>

          <div className="md:col-span-2">
            <button className="rounded-full bg-amber-500 px-5 py-3 font-semibold text-slate-950" type="submit">
              Enregistrer les paramètres
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

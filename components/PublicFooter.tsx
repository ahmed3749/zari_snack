import Link from "next/link";

import { getRestaurantSettings } from "@/lib/restaurant-data";

export default async function PublicFooter() {
  const settings = await getRestaurantSettings();
  const whatsappLink = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`
    : null;

  return (
    <footer className="px-4 pb-4 pt-10 md:px-6 md:pb-6 md:pt-12">
      <div className="page-frame overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(180deg,_#18110c,_#090909)] text-white shadow-2xl shadow-black/15">
        <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:px-8 md:py-9">
          <div className="space-y-4">
            <div>
              <p className="section-title text-4xl leading-none text-[#ffbf1f] md:text-5xl">
                {settings?.restaurantName ?? "Restaurant"}
              </p>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/72">
                Une interface inspirée des meilleures pages fast-food: impact visuel fort,
                accès rapide au menu et commande WhatsApp immédiate.
              </p>
            </div>
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-[linear-gradient(135deg,_#ffbf1f,_#f59e0b)] px-5 py-3 text-sm font-bold text-slate-950"
              >
                Commander sur WhatsApp
              </a>
            ) : null}
            <p className="text-sm text-white/55">
              Street-food généreuse, commande rapide et contact direct.
            </p>
          </div>

          <div className="space-y-4 text-sm text-white/75">
            <h2 className="text-base font-semibold text-white">Navigation</h2>
            <Link href="/" className="block">
              Accueil
            </Link>
            <Link href="/menu" className="block">
              Menu
            </Link>
            <Link href="/reservations" className="block">
              Réservations
            </Link>
            <Link href="/contact" className="block">
              Contact
            </Link>
            <Link href="/admin/login" className="block text-[#ffbf1f]">
              Espace admin
            </Link>
          </div>

          <div className="space-y-4 text-sm text-white/75">
            <h2 className="text-base font-semibold text-white">Informations</h2>
            <p>{settings?.address ?? "Adresse à compléter"}</p>
            <p>{settings?.openingHours ?? "Horaires à compléter"}</p>
            <p>{settings?.whatsappNumber ?? "WhatsApp non renseigné"}</p>
          </div>
        </div>

        <div className="border-t border-white/10 px-6 py-4 text-xs text-white/55 md:px-8">
          © 2026 {settings?.restaurantName ?? "Restaurant"}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

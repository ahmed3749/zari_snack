import PublicFooter from "../../components/PublicFooter";
import PublicHeader from "../../components/PublicHeader";

import { getRestaurantSettings } from "@/lib/restaurant-data";

export default async function ContactPage() {
  const settings = await getRestaurantSettings();
  const whatsappLink = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`
    : null;
  const mapQuery = encodeURIComponent(
    [settings?.restaurantName, settings?.address].filter(Boolean).join(", ")
  );
  const mapEmbedUrl = mapQuery
    ? `https://www.google.com/maps?q=${mapQuery}&output=embed`
    : null;
  const mapsLink = mapQuery ? `https://www.google.com/maps/search/?api=1&query=${mapQuery}` : null;

  return (
    <div className="min-h-screen text-slate-900">
      <PublicHeader />
      <main className="px-4 py-6 md:px-6 md:py-8">
        <div className="page-frame space-y-8 md:space-y-10">
          <section className="overflow-hidden rounded-[2.2rem] border-[3px] border-[#1a1613] bg-[#111] shadow-[0_24px_50px_rgba(33,21,12,0.2)]">
            <div className="grid min-h-[300px] lg:min-h-[360px] lg:grid-cols-[1.02fr_0.98fr]">
              <div className="hero-panel grid-pattern flex items-center px-6 py-8 text-white md:px-10 md:py-10">
                <div className="max-w-2xl">
                  <span className="inline-flex rounded-full bg-[linear-gradient(135deg,_#ffcd3c,_#ffb703)] px-4 py-1 text-xs font-black uppercase tracking-[0.26em] text-slate-950">
                    Contact rapide
                  </span>
                  <h1 className="section-title mt-4 text-5xl leading-[0.9] md:text-7xl xl:text-[5.2rem]">
                    Contact
                    <span className="block text-[#ffbf1f]">et accès</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/78 md:text-base">
                    Adresse, horaires, WhatsApp et carte Google Maps: tout ce qu&apos;il faut pour
                    nous trouver et nous écrire rapidement.
                  </p>
                  {whatsappLink ? (
                    <div className="mt-6">
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-[linear-gradient(135deg,_#ef4444,_#c61f1f)] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/25"
                      >
                        Ouvrir WhatsApp
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="relative min-h-[220px] overflow-hidden bg-[radial-gradient(circle_at_20%_18%,_rgba(255,191,31,0.18),_transparent_18%),radial-gradient(circle_at_82%_26%,_rgba(251,146,60,0.16),_transparent_20%),linear-gradient(135deg,_#2b1b11,_#0d0908)] lg:min-h-[360px]">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(0,0,0,0.1),_rgba(0,0,0,0.42))]" />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-full max-w-md rounded-[1.8rem] border border-white/10 bg-white/8 p-5 text-white backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                      Informations utiles
                    </p>
                    <div className="mt-4 space-y-3 text-sm text-white/80">
                      <p>{settings?.address ?? "Adresse à compléter"}</p>
                      <p>{settings?.openingHours ?? "Horaires à compléter"}</p>
                      <p>{settings?.whatsappNumber ?? "WhatsApp non renseigné"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-12">
            <div className="brand-shell rounded-[2rem] p-6 md:p-7 xl:col-span-7">
              <h2 className="section-title text-4xl leading-none text-slate-950">Coordonnées</h2>
              <div className="mt-4 space-y-3 text-slate-600">
                <p><span className="font-semibold text-slate-900">Restaurant:</span> {settings?.restaurantName ?? "Restaurant"}</p>
                <p><span className="font-semibold text-slate-900">Adresse:</span> {settings?.address ?? "Adresse à compléter"}</p>
                <p><span className="font-semibold text-slate-900">Horaires:</span> {settings?.openingHours ?? "Horaires à compléter"}</p>
                <p><span className="font-semibold text-slate-900">WhatsApp:</span> {settings?.whatsappNumber ?? "Non renseigné"}</p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white/70 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">Zone de livraison</p>
                  <p className="mt-2 text-sm text-slate-700">Salé, Bettana, Tiflet et zones proches selon disponibilité.</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/70 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">Questions fréquentes</p>
                  <p className="mt-2 text-sm text-slate-700">Commandes, réservations, groupes et demandes spéciales via WhatsApp.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 xl:col-span-5">
              <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,_#17120e,_#090909)] p-6 text-white shadow-2xl shadow-black/15 md:p-7">
                <h2 className="section-title text-4xl leading-none">Demandes rapides</h2>
                <p className="mt-3 text-sm leading-6 text-white/72">
                  Pour une commande, une réservation ou une demande spéciale, notre équipe répond
                  plus vite via WhatsApp.
                </p>
                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-full bg-[linear-gradient(135deg,_#f7b500,_#f28c00)] px-4.5 py-2.5 text-sm font-bold text-slate-950"
                  >
                    Ouvrir WhatsApp
                  </a>
                ) : null}
              </div>

              <div className="rounded-[2rem] bg-[linear-gradient(135deg,_#fff8ea,_#ffe0b3)] p-6 text-slate-950 shadow-[0_18px_40px_rgba(62,31,6,0.08)]">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-800">Besoin d&apos;aide ?</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Vous pouvez nous contacter pour une commande immédiate, une réservation, une demande de groupe ou une information sur la livraison.
                </p>
              </div>
            </div>
          </div>

          <section className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_18px_40px_rgba(62,31,6,0.08)]">
            <div className="flex flex-col gap-4 border-b border-black/6 px-6 py-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-700">
                  Localisation
                </p>
                <h2 className="section-title mt-2 text-4xl leading-none text-slate-950">
                  Retrouvez-nous sur la carte
                </h2>
              </div>
              {mapsLink ? (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full bg-[#1a1613] px-5 py-3 text-sm font-bold text-white"
                >
                  Ouvrir dans Google Maps
                </a>
              ) : null}
            </div>

            {mapEmbedUrl ? (
              <div className="h-[320px] w-full md:h-[420px]">
                <iframe
                  title="Carte Google Maps du restaurant"
                  src={mapEmbedUrl}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="px-6 py-10 text-center text-slate-600">
                L&apos;adresse du restaurant doit être renseignée pour afficher la carte Google Maps.
              </div>
            )}
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

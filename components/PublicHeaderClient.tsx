"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";

type PublicHeaderClientProps = {
  restaurantName: string;
  whatsappLink: string;
  initials: string;
};

const mobileLinks = [
  { href: "/", label: "Accueil" },
  { href: "/menu", label: "Menu" },
  { href: "/reservations", label: "Reservations" },
  { href: "/contact", label: "Contact" },
];

export default function PublicHeaderClient({
  restaurantName,
  whatsappLink,
  initials,
}: PublicHeaderClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, openCart } = useCart();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleOpenCart() {
    closeMenu();
    openCart();
  }

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-2 md:px-6 md:pt-4">
        <div
          className={`page-frame rounded-[1.35rem] border-[3px] border-[#1a1613] p-1.5 transition-all duration-300 md:rounded-[2rem] md:p-2 ${
            isScrolled
              ? "bg-[#14100d]/55 shadow-[0_18px_40px_rgba(33,21,12,0.14)] backdrop-blur-md"
              : "bg-[#14100d] shadow-[0_22px_50px_rgba(33,21,12,0.18)]"
          }`}
        >
          <div
            className={`rounded-[1rem] px-3 py-2 transition-all duration-300 md:rounded-[1.5rem] md:px-5 md:py-3 ${
              isScrolled
                ? "bg-[linear-gradient(180deg,_rgba(255,195,41,0.8),_rgba(247,175,0,0.74))]"
                : "bg-[linear-gradient(180deg,_#ffc329,_#f7af00)]"
            }`}
          >
            <div className="flex items-center justify-between gap-2 md:hidden">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#1a1613] bg-white text-xs font-black tracking-[-0.02em] text-slate-950 shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="section-title truncate text-[1.05rem] leading-none tracking-[-0.04em] text-slate-950">
                    {restaurantName}
                  </p>
                  <p className="mt-0.5 truncate text-[8px] font-extrabold uppercase tracking-[0.18em] text-slate-900/70">
                    Tacos, burgers et snacks
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenCart}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[#1a1613]/18 bg-white/45 px-3 text-sm font-black text-slate-950"
                  aria-label="Ouvrir le panier"
                >
                  Panier
                  <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[11px] text-white">
                    {cartCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((current) => !current)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1a1613]/18 bg-[#1a1613] text-white"
                  aria-expanded={isMenuOpen}
                  aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                >
                  <span className="flex flex-col gap-1">
                    <span className={`h-0.5 w-4 rounded-full bg-current transition ${isMenuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
                    <span className={`h-0.5 w-4 rounded-full bg-current transition ${isMenuOpen ? "opacity-0" : ""}`} />
                    <span className={`h-0.5 w-4 rounded-full bg-current transition ${isMenuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
                  </span>
                </button>
              </div>
            </div>

            <div className="hidden md:flex md:items-center md:justify-between md:gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#1a1613] bg-white text-sm font-black tracking-[-0.02em] text-slate-950 shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="section-title truncate text-[2rem] leading-none tracking-[-0.04em] text-slate-950">
                    {restaurantName}
                  </p>
                  <p className="mt-1 truncate text-[11px] font-extrabold uppercase tracking-[0.34em] text-slate-900/70">
                    Tacos, burgers et snacks
                  </p>
                </div>
              </div>

              <nav className="flex flex-wrap items-center gap-1 text-[0.95rem] font-black text-slate-900">
                {mobileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-3.5 py-1.5 transition hover:bg-white/35"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openCart}
                  className="inline-flex items-center justify-center rounded-full border border-[#1a1613]/18 bg-white/45 px-4 py-2.5 text-sm font-black tracking-[0.01em] text-slate-950 transition hover:bg-white/70"
                >
                  Panier
                  <span className="ml-2 rounded-full bg-slate-950 px-2 py-0.5 text-[11px] text-white">
                    {cartCount}
                  </span>
                </button>

                <a
                  href={whatsappLink}
                  target={whatsappLink.startsWith("https://") ? "_blank" : undefined}
                  rel={whatsappLink.startsWith("https://") ? "noreferrer" : undefined}
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,_#ef4444,_#c61f1f)] px-5 py-2.5 text-sm font-black tracking-[0.01em] text-white shadow-lg shadow-red-900/20 transition hover:-translate-y-0.5 hover:shadow-[0_18px_28px_rgba(127,29,29,0.28)]"
                >
                  Commander
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/45 transition md:hidden ${
          isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-3 top-[4.9rem] z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-[1.6rem] border-[3px] border-[#1a1613] bg-[#14100d] p-1.5 shadow-[0_28px_58px_rgba(17,10,5,0.32)] transition duration-300 md:hidden ${
          isMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="rounded-[1.2rem] bg-[linear-gradient(180deg,_#ffc329,_#f7af00)] p-4">
          <nav className="grid gap-2">
            {mobileLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="rounded-2xl bg-white/40 px-4 py-3 text-base font-black text-slate-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={handleOpenCart}
              className="inline-flex items-center justify-center rounded-full border border-[#1a1613]/18 bg-white/70 px-4 py-3 text-sm font-black text-slate-950"
            >
              Panier
              <span className="ml-2 rounded-full bg-slate-950 px-2 py-0.5 text-[11px] text-white">
                {cartCount}
              </span>
            </button>

            <a
              href={whatsappLink}
              onClick={closeMenu}
              target={whatsappLink.startsWith("https://") ? "_blank" : undefined}
              rel={whatsappLink.startsWith("https://") ? "noreferrer" : undefined}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,_#ef4444,_#c61f1f)] px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20"
            >
              Commander
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

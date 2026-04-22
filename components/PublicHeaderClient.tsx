"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";

type PublicHeaderClientProps = {
  restaurantName: string;
  whatsappLink: string;
  initials: string;
};

export default function PublicHeaderClient({
  restaurantName,
  whatsappLink,
  initials,
}: PublicHeaderClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
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

  return (
    <header className="sticky top-0 z-50 px-4 pt-3 md:px-6 md:pt-4">
      <div
        className={`page-frame rounded-[2rem] border-[3px] border-[#1a1613] p-2 transition-all duration-300 ${
          isScrolled
            ? "bg-[#14100d]/55 shadow-[0_18px_40px_rgba(33,21,12,0.14)] backdrop-blur-md"
            : "bg-[#14100d] shadow-[0_22px_50px_rgba(33,21,12,0.18)]"
        }`}
      >
        <div
          className={`flex flex-col gap-2.5 rounded-[1.5rem] px-4 py-3 transition-all duration-300 md:flex-row md:items-center md:justify-between md:px-5 ${
            isScrolled
              ? "bg-[linear-gradient(180deg,_rgba(255,195,41,0.78),_rgba(247,175,0,0.72))]"
              : "bg-[linear-gradient(180deg,_#ffc329,_#f7af00)]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#1a1613] bg-white text-sm font-black tracking-[-0.02em] text-slate-950 shadow-sm">
              {initials}
            </div>
            <div>
              <p className="section-title text-[1.65rem] leading-none tracking-[-0.04em] text-slate-950 md:text-[2rem]">
                {restaurantName}
              </p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.34em] text-slate-900/70 md:text-[11px]">
                Tacos, burgers et snacks
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1 text-sm font-black text-slate-900 md:text-[0.95rem]">
            <Link href="/" className="rounded-full px-3.5 py-1.5 transition hover:bg-white/35">
              Accueil
            </Link>
            <Link href="/menu" className="rounded-full px-3.5 py-1.5 transition hover:bg-white/35">
              Menu
            </Link>
            <Link
              href="/reservations"
              className="rounded-full px-3.5 py-1.5 transition hover:bg-white/35"
            >
              Réservations
            </Link>
            <Link href="/contact" className="rounded-full px-3.5 py-1.5 transition hover:bg-white/35">
              Contact
            </Link>
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
    </header>
  );
}

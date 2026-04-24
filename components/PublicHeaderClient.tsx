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
    <header className="sticky top-0 z-50 px-3 pt-2 md:px-6 md:pt-4">
      <div
        className={`page-frame rounded-[1.6rem] border-[3px] border-[#1a1613] p-1.5 transition-all duration-300 md:rounded-[2rem] md:p-2 ${
          isScrolled
            ? "bg-[#14100d]/55 shadow-[0_18px_40px_rgba(33,21,12,0.14)] backdrop-blur-md"
            : "bg-[#14100d] shadow-[0_22px_50px_rgba(33,21,12,0.18)]"
        }`}
      >
        <div
          className={`flex flex-col gap-2 rounded-[1.2rem] px-3 py-2.5 transition-all duration-300 md:flex-row md:items-center md:justify-between md:gap-2.5 md:rounded-[1.5rem] md:px-5 md:py-3 ${
            isScrolled
              ? "bg-[linear-gradient(180deg,_rgba(255,195,41,0.78),_rgba(247,175,0,0.72))]"
              : "bg-[linear-gradient(180deg,_#ffc329,_#f7af00)]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#1a1613] bg-white text-xs font-black tracking-[-0.02em] text-slate-950 shadow-sm md:h-12 md:w-12 md:text-sm">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="section-title truncate text-[1.15rem] leading-none tracking-[-0.04em] text-slate-950 md:text-[2rem]">
                {restaurantName}
              </p>
              <p className="mt-1 truncate text-[8px] font-extrabold uppercase tracking-[0.22em] text-slate-900/70 md:text-[11px] md:tracking-[0.34em]">
                Tacos, burgers et snacks
              </p>
            </div>
          </div>

          <nav className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 text-[0.95rem] font-black text-slate-900 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            <Link href="/" className="shrink-0 rounded-full px-3 py-1 transition hover:bg-white/35 md:px-3.5 md:py-1.5">
              Accueil
            </Link>
            <Link href="/menu" className="shrink-0 rounded-full px-3 py-1 transition hover:bg-white/35 md:px-3.5 md:py-1.5">
              Menu
            </Link>
            <Link
              href="/reservations"
              className="shrink-0 rounded-full px-3 py-1 transition hover:bg-white/35 md:px-3.5 md:py-1.5"
            >
              Reservations
            </Link>
            <Link href="/contact" className="shrink-0 rounded-full px-3 py-1 transition hover:bg-white/35 md:px-3.5 md:py-1.5">
              Contact
            </Link>
          </nav>

          <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
            <button
              type="button"
              onClick={openCart}
              className="inline-flex min-w-0 items-center justify-center rounded-full border border-[#1a1613]/18 bg-white/45 px-3 py-2 text-sm font-black tracking-[0.01em] text-slate-950 transition hover:bg-white/70 md:px-4 md:py-2.5"
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
              className="inline-flex min-w-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#ef4444,_#c61f1f)] px-4 py-2 text-sm font-black tracking-[0.01em] text-white shadow-lg shadow-red-900/20 transition hover:-translate-y-0.5 hover:shadow-[0_18px_28px_rgba(127,29,29,0.28)] md:px-5 md:py-2.5"
            >
              Commander
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

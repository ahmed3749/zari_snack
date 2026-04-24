"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AdminNotifications from "@/components/AdminNotifications";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import type { AdminNotification } from "@/lib/restaurant-data";

type AdminNavClientProps = {
  adminId?: string;
  notifications: AdminNotification[];
};

const navLinks = [
  { href: "/admin/dashboard", label: "Tableau de bord" },
  { href: "/admin/orders", label: "Commandes" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/settings", label: "Parametres" },
];

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNavClient({
  adminId,
  notifications,
}: AdminNavClientProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = Boolean(adminId);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const activeLabel = useMemo(() => {
    const currentLink = navLinks.find((link) => isCurrentPath(pathname, link.href));
    return currentLink?.label ?? "Admin Restaurant";
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 text-slate-50 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300/90">
                Espace admin
              </p>
              <p className="truncate text-lg font-semibold text-white">
                {isAuthenticated ? activeLabel : "Connexion"}
              </p>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="md:hidden">
                  <AdminNotifications
                    adminId={adminId!}
                    notifications={notifications}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen((current) => !current)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-white transition hover:border-slate-600 md:hidden"
                  aria-expanded={isMenuOpen}
                  aria-label={isMenuOpen ? "Fermer le menu admin" : "Ouvrir le menu admin"}
                >
                  <span className="flex flex-col gap-1">
                    <span className={`h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
                    <span className={`h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? "opacity-0" : ""}`} />
                    <span className={`h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
                  </span>
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800 md:hidden"
              >
                Connexion
              </Link>
            )}
          </div>

          <div className="mt-4 hidden items-center justify-between gap-4 md:flex">
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              {isAuthenticated ? (
                navLinks.map((link) => {
                  const isActive = isCurrentPath(pathname, link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-full px-4 py-2 font-medium transition ${
                        isActive
                          ? "bg-amber-400 text-slate-950"
                          : "bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })
              ) : (
                <Link
                  href="/admin/login"
                  className="rounded-full bg-slate-900 px-4 py-2 font-medium text-slate-100 transition hover:bg-slate-800"
                >
                  Connexion
                </Link>
              )}
            </nav>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <AdminNotifications
                  adminId={adminId!}
                  notifications={notifications}
                />
                <AdminLogoutButton className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500" />
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {isAuthenticated ? (
        <>
          <div
            className={`fixed inset-0 z-40 bg-slate-950/70 transition md:hidden ${
              isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          <aside
            className={`fixed inset-x-0 bottom-0 z-50 rounded-t-[2rem] border-t border-slate-800 bg-slate-950 px-4 pb-8 pt-4 shadow-[0_-24px_60px_rgba(0,0,0,0.45)] transition duration-300 md:hidden ${
              isMenuOpen ? "translate-y-0" : "translate-y-full"
            }`}
            aria-hidden={!isMenuOpen}
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-700" />

            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                  Navigation
                </p>
                <p className="mt-1 text-lg font-semibold text-white">Administration</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-200"
                aria-label="Fermer le menu admin"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <nav className="grid gap-2">
              {navLinks.map((link) => {
                const isActive = isCurrentPath(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-2xl px-4 py-4 text-base font-semibold transition ${
                      isActive
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-900 text-slate-100 hover:bg-slate-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Session admin
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Acces rapide aux commandes, au menu et aux parametres du restaurant.
              </p>
              <div className="mt-4">
                <AdminLogoutButton className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500" />
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}

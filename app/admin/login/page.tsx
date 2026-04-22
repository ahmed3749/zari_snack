import Link from "next/link";
import { redirect } from "next/navigation";

import { loginAdmin } from "./actions";

import { getAdminSession } from "@/lib/admin-auth";

function getErrorMessage(error?: string) {
  if (error === "missing") {
    return "Merci de renseigner l'email et le mot de passe.";
  }

  if (error === "invalid") {
    return "Identifiants invalides.";
  }

  return "";
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin/dashboard");
  }

  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-md rounded-3xl bg-slate-900/90 p-10 shadow-xl shadow-slate-900/20">
        <h1 className="text-3xl font-semibold">Connexion admin</h1>
        <p className="mt-3 text-slate-400">
          Connectez-vous pour accéder au panneau d&apos;administration.
        </p>

        <form action={loginAdmin} className="mt-8 space-y-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-300 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-300 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            required
          />

          {errorMessage ? (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <Link href="/admin" className="hover:text-slate-400">
            Retour à l&apos;espace admin
          </Link>
        </div>

        <div className="mt-4 rounded-lg bg-slate-800/50 p-4 text-xs text-slate-400">
          <strong>Identifiants de test :</strong>
          <br />
          Email: admin@saveur-marocaine.ma
          <br />
          Mot de passe: admin123456
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-3xl bg-slate-900/90 p-10 shadow-xl shadow-slate-900/20">
        <h1 className="text-4xl font-semibold">Espace admin</h1>
        <p className="mt-4 text-slate-300">
          Accédez à l’administration du restaurant après authentification.
        </p>
        <div className="mt-8 flex flex-col gap-3 text-sm">
          <Link href="/admin/login" className="rounded-full bg-slate-700 px-4 py-3 text-center transition hover:bg-slate-600">
            Se connecter
          </Link>
          <Link href="/admin/dashboard" className="rounded-full border border-slate-700 px-4 py-3 text-center transition hover:border-slate-500">
            Aller au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}

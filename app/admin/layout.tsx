import type { Metadata } from "next";
import AdminNav from "../../components/AdminNav";

export const metadata: Metadata = {
  title: "Espace admin - Restaurant",
  description: "Interface d’administration protégée pour le restaurant",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

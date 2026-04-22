import { logoutAdmin } from "@/app/admin/actions";

export default function AdminLogoutButton() {
  return (
    <form action={logoutAdmin}>
      <button
        className="rounded bg-red-600 px-3 py-1 text-xs transition hover:bg-red-500"
        type="submit"
      >
        Déconnexion
      </button>
    </form>
  );
}

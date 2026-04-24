import { logoutAdmin } from "@/app/admin/actions";

type AdminLogoutButtonProps = {
  className?: string;
};

export default function AdminLogoutButton({ className }: AdminLogoutButtonProps) {
  return (
    <form action={logoutAdmin}>
      <button
        className={className ?? "rounded bg-red-600 px-3 py-1 text-xs transition hover:bg-red-500"}
        type="submit"
      >
        Deconnexion
      </button>
    </form>
  );
}

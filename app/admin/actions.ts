"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAdmin() {
  const cookieStore = await cookies();

  cookieStore.set("admin-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  redirect("/admin/login");
}

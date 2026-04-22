"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { signAdminToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=missing");
  }

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    redirect("/admin/login?error=invalid");
  }

  const isHashedPassword = admin.password.startsWith("$2");
  const isValidPassword = isHashedPassword
    ? await bcrypt.compare(password, admin.password)
    : password === admin.password;

  if (!isValidPassword) {
    redirect("/admin/login?error=invalid");
  }

  const token = signAdminToken({ adminId: admin.id, email: admin.email });
  const cookieStore = await cookies();

  cookieStore.set("admin-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  redirect("/admin/dashboard");
}

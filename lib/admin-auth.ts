import "server-only";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

type AdminTokenPayload = {
  adminId: string;
  email: string;
};

function getJwtSecret() {
  return process.env.JWT_SECRET || "secret-key";
}

export function verifyAdminToken(token?: string | null): AdminTokenPayload | null {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, getJwtSecret()) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get("admin-token")?.value);
}

export function getAdminSessionFromRequest(request: NextRequest) {
  return verifyAdminToken(request.cookies.get("admin-token")?.value);
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "24h" });
}

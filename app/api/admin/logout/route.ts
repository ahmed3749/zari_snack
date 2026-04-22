import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Déconnexion réussie" });

  // Supprimer le cookie
  response.cookies.set("admin-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });

  return response;
}
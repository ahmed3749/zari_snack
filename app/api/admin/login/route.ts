import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { signAdminToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    const isHashedPassword = admin.password.startsWith("$2");
    const isValidPassword = isHashedPassword
      ? await bcrypt.compare(password, admin.password)
      : password === admin.password;

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    const token = signAdminToken({ adminId: admin.id, email: admin.email });

    const response = NextResponse.json({
      message: "Connexion réussie",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });

    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: session.adminId,
        email: session.email,
      },
    });
  } catch {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}

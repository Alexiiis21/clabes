import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || "neon2026";

    if (username === "admin" && password === adminPassword) {
      const cookieStore = await cookies();
      cookieStore.set("clabes_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 1 semana
      });
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Error procesando solicitud" }, { status: 500 });
  }
}

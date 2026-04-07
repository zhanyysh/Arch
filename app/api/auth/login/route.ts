import { NextResponse } from "next/server";
import { createSessionToken, authenticateUser, authCookieName } from "@/lib/auth";
import { getHomeByRole } from "@/lib/rbac";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=missing_fields", request.url));
  }

  const session = await authenticateUser(email, password);

  if (!session) {
    return NextResponse.redirect(new URL("/login?error=invalid_credentials", request.url));
  }

  const token = await createSessionToken(session);

  const response = NextResponse.redirect(new URL(getHomeByRole(session.role), request.url));
  response.cookies.set(authCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 28800)
  });

  return response;
}

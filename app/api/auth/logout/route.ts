import { NextResponse } from "next/server";
import { authCookieName } from "@/lib/auth";

function buildLogoutResponse(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  // Ensure the session cookie is removed regardless of runtime/browser differences.
  response.cookies.set(authCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });

  response.cookies.delete(authCookieName);
  return response;
}

export async function POST(request: Request) {
  return buildLogoutResponse(request);
}

export async function GET(request: Request) {
  return buildLogoutResponse(request);
}

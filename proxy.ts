import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { UserRole } from "@/lib/domain";

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");
const cookieName = "build-control_session";

function roleHome(role: UserRole): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "manager") return "/dashboard/manager";
  if (role === "foreman") return "/dashboard/foreman";
  return "/dashboard/worker";
}

function isRoleAllowed(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin")) {
    return role === "admin";
  }

  if (pathname.startsWith("/dashboard/manager")) {
    return role === "manager";
  }

  if (pathname.startsWith("/dashboard/foreman")) {
    return role === "foreman";
  }

  if (pathname.startsWith("/dashboard/worker")) {
    return role === "worker";
  }

  if (pathname.startsWith("/dashboard")) {
    return true;
  }

  if (pathname.startsWith("/projects")) {
    return role === "manager" || role === "foreman";
  }

  return true;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/projects");
  const token = request.cookies.get(cookieName)?.value;

  if (!token) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    const role = payload.role as UserRole;

    if (pathname === "/login") {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }

    if (!isRoleAllowed(role, pathname)) {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.next();
    response.cookies.delete(cookieName);

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/domain";
import { db } from "@/lib/db";

const SESSION_COOKIE = "archmanager_session";
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");
const expiresInSeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 28800);

export interface SessionPayload extends JWTPayload {
  sub: string;
  role: UserRole;
  companyId: string;
  fullName: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(jwtSecret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret);

    return {
      sub: String(payload.sub),
      role: payload.role as UserRole,
      companyId: String(payload.companyId),
      fullName: String(payload.fullName)
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: expiresInSeconds
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<SessionPayload> {
  const session = await requireSession();

  if (!allowedRoles.includes(session.role)) {
    redirect(`/dashboard/${session.role}`);
  }

  return session;
}

export async function authenticateUser(email: string, password: string): Promise<SessionPayload | null> {
  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      role: true,
      companyId: true,
      isActive: true,
      passwordHash: true,
      company: {
        select: {
          isActive: true
        }
      }
    }
  });

  if (!user || !user.isActive || !user.company.isActive) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  return {
    sub: user.id,
    role: user.role,
    companyId: user.companyId,
    fullName: user.fullName
  };
}

export async function enforceTenantGuard(resourceCompanyId: string): Promise<SessionPayload> {
  const session = await requireSession();

  if (session.role === "admin") {
    return session;
  }

  if (session.companyId !== resourceCompanyId) {
    redirect(`/dashboard/${session.role}`);
  }

  return session;
}

export const authCookieName = SESSION_COOKIE;

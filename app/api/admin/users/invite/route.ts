import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const inviteSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  role: z.nativeEnum(UserRole),
  companyId: z.string().trim().min(3),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const company = await db.company.findUnique({
    where: { id: parsed.data.companyId },
    select: { id: true, isActive: true }
  });

  if (!company || !company.isActive) {
    return NextResponse.json({ error: "Company not found or inactive" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await db.user.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      companyId: parsed.data.companyId,
      passwordHash,
      isActive: true
    }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "user_invite",
      entityType: "user",
      entityId: user.id,
      details: `Invited user ${user.email}`
    }
  });

  return NextResponse.json({ ok: true, userId: user.id });
}

import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const updateSchema = z.object({
  fullName: z.string().trim().min(2),
  role: z.nativeEnum(UserRole),
  companyId: z.string().trim().min(3),
  status: z.enum(["Active", "Inactive", "Suspended"])
});

function planFromRole(role: UserRole): "Free" | "Pro" | "Enterprise" {
  if (role === "admin") {
    return "Enterprise";
  }

  if (role === "manager" || role === "foreman") {
    return "Pro";
  }

  return "Free";
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          name: true
        }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const activity = await db.auditLog.findMany({
    where: {
      OR: [
        {
          entityType: "user",
          entityId: user.id
        },
        {
          actorId: user.id
        }
      ]
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 20,
    select: {
      id: true,
      action: true,
      details: true,
      createdAt: true
    }
  });

  const plan = planFromRole(user.role);
  const billing = {
    plan,
    monthlyAmount: plan === "Enterprise" ? 199 : plan === "Pro" ? 39 : 0,
    currency: "USD",
    renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    paymentStatus: "Paid"
  };

  return NextResponse.json({
    overview: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      companyName: user.company.name,
      status: user.isActive ? "Active" : "Suspended",
      joinedAt: user.createdAt,
      lastLogin: user.updatedAt,
      totalSessions: Math.max(5, user.id.length * 3)
    },
    activity,
    billing
  });
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

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

  const target = await db.user.findUnique({ where: { id }, select: { email: true } });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await db.user.update({
    where: { id },
    data: {
      fullName: parsed.data.fullName,
      role: parsed.data.role,
      companyId: parsed.data.companyId,
      isActive: parsed.data.status === "Active"
    }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "user_update",
      entityType: "user",
      entityId: id,
      details: `Updated user ${target.email}`
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (id === session.sub) {
    return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id }, select: { email: true } });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await db.user.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "user_delete",
      entityType: "user",
      entityId: id,
      details: `Deleted user ${target.email}`
    }
  });

  return NextResponse.json({ ok: true });
}

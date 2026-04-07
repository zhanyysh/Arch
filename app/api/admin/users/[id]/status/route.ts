import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const statusSchema = z.object({
  status: z.enum(["Active", "Inactive", "Suspended"])
});

export async function POST(
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
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id }, select: { id: true, email: true } });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await db.user.update({
    where: { id },
    data: {
      isActive: parsed.data.status === "Active"
    }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: parsed.data.status === "Active" ? "user_activate" : "user_suspend",
      entityType: "user",
      entityId: id,
      details: `${parsed.data.status === "Active" ? "Activated" : "Suspended"} user ${target.email}`
    }
  });

  return NextResponse.json({ ok: true });
}

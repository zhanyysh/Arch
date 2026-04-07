import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
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

  const user = await db.user.update({
    where: { id },
    data: { isActive: false },
    select: { id: true, email: true }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "user_suspend",
      entityType: "user",
      entityId: user.id,
      details: `Suspended user ${user.email}`
    }
  });

  return NextResponse.json({ ok: true });
}

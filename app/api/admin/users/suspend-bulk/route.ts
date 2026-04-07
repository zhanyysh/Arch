import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const bulkSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1)
});

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await db.user.updateMany({
    where: {
      id: { in: parsed.data.userIds }
    },
    data: {
      isActive: false
    }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "user_suspend_bulk",
      entityType: "user",
      entityId: parsed.data.userIds.join(","),
      details: `Suspended ${parsed.data.userIds.length} users`
    }
  });

  return NextResponse.json({ ok: true });
}

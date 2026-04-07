import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const statusSchema = z.object({
  isActive: z.boolean()
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

  const company = await db.company.findUnique({
    where: { id },
    select: { id: true, name: true }
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  await db.company.update({
    where: { id },
    data: {
      isActive: parsed.data.isActive
    }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: parsed.data.isActive ? "company_activate" : "company_deactivate",
      entityType: "company",
      entityId: id,
      details: `${parsed.data.isActive ? "Activated" : "Deactivated"} company ${company.name}`
    }
  });

  return NextResponse.json({ ok: true });
}

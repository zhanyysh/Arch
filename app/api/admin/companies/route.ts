import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const createCompanySchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(7)
});

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCompanySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const company = await db.company.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      isActive: true
    }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "company_create",
      entityType: "company",
      entityId: company.id,
      details: `Created company ${company.name}`
    }
  });

  return NextResponse.json({ ok: true, companyId: company.id });
}

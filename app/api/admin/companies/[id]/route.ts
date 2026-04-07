import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

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

  const company = await db.company.findUnique({
    where: { id },
    include: {
      users: {
        select: { id: true }
      },
      projects: {
        select: { id: true }
      }
    }
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  if (company.users.length > 0 || company.projects.length > 0) {
    return NextResponse.json(
      { error: "Cannot delete company with related users or projects" },
      { status: 400 }
    );
  }

  await db.company.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "company_delete",
      entityType: "company",
      entityId: id,
      details: `Deleted company ${company.name}`
    }
  });

  return NextResponse.json({ ok: true });
}

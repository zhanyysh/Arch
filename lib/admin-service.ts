import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function listAdminData() {
  await requireRole(["admin"]);

  const [companies, users] = await Promise.all([
    db.company.findMany({
      orderBy: { createdAt: "desc" }
    }),
    db.user.findMany({
      include: {
        company: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return { companies, users };
}

export async function createCompany(input: { name: string; phone: string }) {
  const session = await requireRole(["admin"]);

  const company = await db.company.create({
    data: {
      name: input.name.trim(),
      phone: input.phone.trim(),
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
}

export async function toggleCompany(companyId: string, isActive: boolean) {
  const session = await requireRole(["admin"]);

  const company = await db.company.update({
    where: { id: companyId },
    data: { isActive }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: isActive ? "company_activate" : "company_deactivate",
      entityType: "company",
      entityId: company.id,
      details: `Company status set to ${isActive ? "active" : "inactive"}`
    }
  });
}

export async function createUser(input: {
  fullName: string;
  email: string;
  role: UserRole;
  companyId: string;
  passwordHash: string;
}) {
  const session = await requireRole(["admin"]);

  const user = await db.user.create({
    data: {
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      companyId: input.companyId,
      passwordHash: input.passwordHash,
      isActive: true
    }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "user_create",
      entityType: "user",
      entityId: user.id,
      details: `Created user ${user.email}`
    }
  });
}

export async function toggleUser(userId: string, isActive: boolean) {
  const session = await requireRole(["admin"]);

  const user = await db.user.update({
    where: { id: userId },
    data: { isActive }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: isActive ? "user_activate" : "user_deactivate",
      entityType: "user",
      entityId: user.id,
      details: `User status set to ${isActive ? "active" : "inactive"}`
    }
  });
}

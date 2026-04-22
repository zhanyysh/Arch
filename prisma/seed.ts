import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(params: {
  email: string;
  fullName: string;
  role: UserRole;
  companyId: string;
  password: string;
}) {
  const hash = await bcrypt.hash(params.password, 10);

  return prisma.user.upsert({
    where: { email: params.email },
    update: {
      fullName: params.fullName,
      role: params.role,
      companyId: params.companyId,
      passwordHash: hash,
      isActive: true
    },
    create: {
      email: params.email,
      fullName: params.fullName,
      role: params.role,
      companyId: params.companyId,
      passwordHash: hash,
      isActive: true
    }
  });
}

async function main() {
  const platform = await prisma.company.upsert({
    where: { id: "cmp_platform" },
    update: {
      name: "Build Control Platform",
      phone: "0777 77 77 77",
      isActive: true
    },
    create: {
      id: "cmp_platform",
      name: "Build Control Platform",
      phone: "0777 77 77 77",
      isActive: true
    }
  });

  const akBuild = await prisma.company.upsert({
    where: { id: "cmp_ak_build" },
    update: {
      name: "AK Build Group",
      phone: "0777 77 77 77",
      isActive: true
    },
    create: {
      id: "cmp_ak_build",
      name: "AK Build Group",
      phone: "0777 77 77 77",
      isActive: true
    }
  });

  const admin = await upsertUser({
    email: "admin@build-control.local",
    fullName: "Aibek Asanov",
    role: "admin",
    companyId: platform.id,
    password: "Admin123!"
  });

  const foreman = await upsertUser({
    email: "foreman@build-control.local",
    fullName: "Ruslan Mamytov",
    role: "foreman",
    companyId: akBuild.id,
    password: "Foreman123!"
  });

  await upsertUser({
    email: "manager@build-control.local",
    fullName: "Elvira Toktogulova",
    role: "manager",
    companyId: akBuild.id,
    password: "Manager123!"
  });

  const worker = await upsertUser({
    email: "worker@build-control.local",
    fullName: "Nurlan Osmonov",
    role: "worker",
    companyId: akBuild.id,
    password: "Worker123!"
  });

  const project = await prisma.project.upsert({
    where: { id: "prj_001" },
    update: {
      title: "Skyline Residence Complex",
      description: "12-storey residential complex in Bishkek",
      startsAt: new Date("2026-04-01"),
      dueAt: new Date("2026-12-20"),
      foremanId: foreman.id,
      companyId: akBuild.id,
      status: "in_progress"
    },
    create: {
      id: "prj_001",
      title: "Skyline Residence Complex",
      description: "12-storey residential complex in Bishkek",
      startsAt: new Date("2026-04-01"),
      dueAt: new Date("2026-12-20"),
      foremanId: foreman.id,
      companyId: akBuild.id,
      status: "in_progress"
    }
  });

  const stage = await prisma.stage.upsert({
    where: { id: "stg_001" },
    update: {
      projectId: project.id,
      title: "Foundation",
      startsAt: new Date("2026-04-01"),
      dueAt: new Date("2026-05-01"),
      status: "in_progress",
      order: 1
    },
    create: {
      id: "stg_001",
      projectId: project.id,
      title: "Foundation",
      startsAt: new Date("2026-04-01"),
      dueAt: new Date("2026-05-01"),
      status: "in_progress",
      order: 1
    }
  });

  await prisma.task.upsert({
    where: { id: "tsk_001" },
    update: {
      projectId: project.id,
      stageId: stage.id,
      workerId: worker.id,
      title: "Prepare formwork for section A",
      status: "in_progress",
      requiresAfterPhoto: true
    },
    create: {
      id: "tsk_001",
      projectId: project.id,
      stageId: stage.id,
      workerId: worker.id,
      title: "Prepare formwork for section A",
      status: "in_progress",
      requiresAfterPhoto: true
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "seed_init",
      entityType: "system",
      entityId: "bootstrap",
      details: "Initial seed data created"
    }
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

"use server";

import { ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

const createProjectSchema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().min(3),
  startsAt: z.string().trim().min(1),
  dueAt: z.string().trim().min(1),
  foremanId: z.string().trim().min(3)
});

export async function createProjectAction(formData: FormData) {
  const session = await requireRole(["manager"]);
  const parsed = createProjectSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    dueAt: String(formData.get("dueAt") ?? ""),
    foremanId: String(formData.get("foremanId") ?? "")
  });

  if (!parsed.success) {
    console.error("Project validation failed:", parsed.error);
    throw new Error("Invalid project data: " + parsed.error.message);
  }

  const foreman = await db.user.findFirst({
    where: {
      id: parsed.data.foremanId,
      companyId: session.companyId,
      role: "foreman",
      isActive: true
    },
    select: { id: true }
  });

  if (!foreman) {
    throw new Error("Назначенный прораб не найден");
  }

  const project = await db.project.create({
    data: {
      companyId: session.companyId,
      title: parsed.data.title,
      description: parsed.data.description,
      startsAt: new Date(parsed.data.startsAt),
      dueAt: new Date(parsed.data.dueAt),
      foremanId: parsed.data.foremanId,
      status: "planned"
    }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "project_create",
      entityType: "project",
      entityId: project.id,
      details: `Created project ${project.title}`
    }
  });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}/stages`);
}

export async function updateProjectStatusAction(formData: FormData) {
  const session = await requireRole(["manager", "foreman"]);
  const projectId = String(formData.get("projectId") ?? "");
  const status = String(formData.get("status") ?? "") as ProjectStatus;

  if (!projectId || !Object.values(ProjectStatus).includes(status)) {
    throw new Error("Некорректные параметры обновления статуса проекта");
  }

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      companyId: session.companyId,
      ...(session.role === "foreman" ? { foremanId: session.sub } : {})
    },
    select: { id: true, title: true }
  });

  if (!project) {
    throw new Error("Проект не найден или недоступен");
  }

  await db.project.update({
    where: { id: project.id },
    data: { status }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "project_status_update",
      entityType: "project",
      entityId: project.id,
      details: `Updated project status to ${status}`
    }
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${project.id}/stages`);
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true
});

const STAGE_STATUSES = ["not_started", "in_progress", "review", "done", "overdue"] as const;
type StageStatusValue = (typeof STAGE_STATUSES)[number];

const createStageSchema = z.object({
  projectId: z.string().trim().min(3),
  title: z.string().trim().min(2),
  startsAt: z.string().trim().min(1),
  dueAt: z.string().trim().min(1),
  order: z.coerce.number().int().min(1)
});

const createTaskSchema = z.object({
  projectId: z.string().trim().min(1),
  stageId: z.string().trim().min(1),
  workerId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  requiresAfterPhoto: z.boolean().default(true)
});

async function loadScopedProject(projectId: string, session: { role: string; companyId: string; sub: string }) {
  return db.project.findFirst({
    where: {
      id: projectId,
      companyId: session.companyId,
      ...(session.role === "foreman" ? { foremanId: session.sub } : {})
    },
    select: { id: true }
  });
}

export async function createStageAction(formData: FormData) {
  const session = await requireRole(["manager", "foreman"]);
  const parsed = createStageSchema.safeParse({
    projectId: String(formData.get("projectId") ?? ""),
    title: String(formData.get("title") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    dueAt: String(formData.get("dueAt") ?? ""),
    order: String(formData.get("order") ?? "")
  });

  if (!parsed.success) {
    throw new Error("Invalid stage data");
  }

  const project = await loadScopedProject(parsed.data.projectId, session);

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  await db.stage.create({
    data: {
      projectId: project.id,
      title: parsed.data.title,
      startsAt: new Date(parsed.data.startsAt),
      dueAt: new Date(parsed.data.dueAt),
      status: "not_started",
      order: parsed.data.order
    }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "stage_create",
      entityType: "project",
      entityId: project.id,
      details: `Created stage ${parsed.data.title}`
    }
  });

  revalidatePath(`/projects/${project.id}`);
  revalidatePath(`/projects/${project.id}/stages`);
}

export async function updateStageStatusAction(formData: FormData) {
  const session = await requireRole(["manager", "foreman"]);
  const projectId = String(formData.get("projectId") ?? "");
  const stageId = String(formData.get("stageId") ?? "");
  const status = String(formData.get("status") ?? "") as StageStatusValue;

  if (!projectId || !stageId || !STAGE_STATUSES.includes(status)) {
    throw new Error("Invalid stage update parameters");
  }

  const project = await loadScopedProject(projectId, session);

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  const stage = await db.stage.findFirst({
    where: {
      id: stageId,
      projectId: project.id
    },
    select: { id: true }
  });

  if (!stage) {
    throw new Error("Stage not found");
  }

  await db.stage.update({
    where: { id: stage.id },
    data: { status }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "stage_status_update",
      entityType: "stage",
      entityId: stage.id,
      details: `Updated stage status to ${status}`
    }
  });

  revalidatePath(`/projects/${project.id}`);
  revalidatePath(`/projects/${project.id}/stages`);
}

export async function createTaskAction(formData: FormData) {
  const session = await requireRole(["manager", "foreman"]);
  const parsed = createTaskSchema.safeParse({
    projectId: String(formData.get("projectId") ?? ""),
    stageId: String(formData.get("stageId") ?? ""),
    workerId: String(formData.get("workerId") ?? ""),
    title: String(formData.get("title") ?? ""),
    requiresAfterPhoto: formData.get("requiresAfterPhoto") === "on"
  });

  if (!parsed.success) {
    console.error("Task payload validation failed:", parsed.error);
    throw new Error("Invalid task payload: " + parsed.error.message);
  }

  const project = await loadScopedProject(parsed.data.projectId, session);

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  const stage = await db.stage.findFirst({
    where: {
      id: parsed.data.stageId,
      projectId: project.id
    },
    select: { id: true, title: true }
  });

  if (!stage) {
    throw new Error("Stage not found in selected project");
  }

  const worker = await db.user.findFirst({
    where: {
      id: parsed.data.workerId,
      companyId: session.companyId,
      role: "worker",
      isActive: true
    },
    select: { id: true, fullName: true }
  });

  if (!worker) {
    throw new Error("Worker not found or inactive");
  }

  const task = await db.task.create({
    data: {
      projectId: project.id,
      stageId: stage.id,
      workerId: worker.id,
      title: parsed.data.title,
      status: "new",
      requiresAfterPhoto: parsed.data.requiresAfterPhoto
    }
  });

  const beforePhotos = formData.getAll("beforePhotos") as File[];
  const validPhotos = beforePhotos.filter(file => file && file.size > 0 && file.name !== 'undefined');
  
  if (validPhotos.length > 0) {
    for (const photoFile of validPhotos) {
      const bytes = await photoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const photoUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "build-control/tasks/before", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url || "");
          }
        );
        uploadStream.end(buffer);
      });
      
      await db.photoReport.create({
        data: {
          taskId: task.id,
          kind: "before",
          url: photoUrl,
          uploadedBy: session.sub,
          attempt: 1
        }
      });
    }
  }

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "task_create",
      entityType: "task",
      entityId: task.id,
      details: `Created task ${parsed.data.title} for ${worker.fullName} in stage ${stage.title}`
    }
  });

  revalidatePath(`/projects/${project.id}`);
  revalidatePath(`/projects/${project.id}/stages`);
}

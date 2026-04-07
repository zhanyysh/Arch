"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

const TASK_STATUSES = ["new", "in_progress", "review", "done", "rework"] as const;
type TaskStatusValue = (typeof TASK_STATUSES)[number];

const updateTaskStatusSchema = z.object({
  projectId: z.string().trim().min(3),
  stageId: z.string().trim().min(3),
  taskId: z.string().trim().min(3),
  status: z.enum(TASK_STATUSES)
});

export async function updateTaskStatusAction(formData: FormData) {
  const session = await requireRole(["manager", "foreman"]);
  const parsed = updateTaskStatusSchema.safeParse({
    projectId: String(formData.get("projectId") ?? ""),
    stageId: String(formData.get("stageId") ?? ""),
    taskId: String(formData.get("taskId") ?? ""),
    status: String(formData.get("status") ?? "") as TaskStatusValue
  });

  if (!parsed.success) {
    throw new Error("Invalid task status payload");
  }

  const project = await db.project.findFirst({
    where: {
      id: parsed.data.projectId,
      companyId: session.companyId,
      ...(session.role === "foreman" ? { foremanId: session.sub } : {})
    },
    select: { id: true }
  });

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  const task = await db.task.findFirst({
    where: {
      id: parsed.data.taskId,
      projectId: project.id,
      stageId: parsed.data.stageId
    },
    select: { id: true, title: true }
  });

  if (!task) {
    throw new Error("Task not found in selected stage");
  }

  await db.task.update({
    where: { id: task.id },
    data: { status: parsed.data.status }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "task_status_update",
      entityType: "task",
      entityId: task.id,
      details: `Updated task status to ${parsed.data.status}`
    }
  });

  revalidatePath(`/projects/${project.id}/stages`);
  revalidatePath(`/projects/${project.id}/stages/${parsed.data.stageId}`);
}

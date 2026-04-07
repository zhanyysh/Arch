"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function approveTaskAction(taskId: string) {
  const session = await requireRole(["foreman", "manager"]);
  const task = await db.task.findUnique({ where: { id: taskId }, include: { project: true } });
  
  if (!task || task.project.companyId !== session.companyId) {
    throw new Error("Unauthorized");
  }
  
  await db.task.update({ where: { id: taskId }, data: { status: "done" } });
  
  await db.auditLog.create({
    data: { actorId: session.sub, action: "task_approved", entityType: "task", entityId: taskId }
  });
  
  revalidatePath("/dashboard/foreman");
}

export async function rejectTaskAction(taskId: string, reason: string) {
  const session = await requireRole(["foreman", "manager"]);
  const task = await db.task.findUnique({ where: { id: taskId }, include: { project: true } });
  
  if (!task || task.project.companyId !== session.companyId) {
    throw new Error("Unauthorized");
  }

  await db.task.update({ where: { id: taskId }, data: { status: "rework" } });
  
  await db.auditLog.create({
    data: { actorId: session.sub, action: "task_rejected", entityType: "task", entityId: taskId, details: reason }
  });
  
  revalidatePath("/dashboard/foreman");
}

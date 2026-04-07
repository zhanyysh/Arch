"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { TaskStatus } from "@prisma/client";

const UpdateTaskSchema = z.object({
  taskId: z.string().min(1),
  status: z.nativeEnum(TaskStatus),
});

export async function updateWorkerTaskAction(formData: FormData) {
  const session = await requireRole(["worker"]);
  
  const payload = UpdateTaskSchema.parse({
    taskId: formData.get("taskId"),
    status: formData.get("status") as TaskStatus,
  });

  const photoFile = formData.get("photo") as File | null;

  const task = await db.task.findFirst({
    where: { id: payload.taskId, workerId: session.sub }
  });

  if (!task) {
    throw new Error("Task not found or unauthorized");
  }

  // Handle actual file upload if photo exists
  if (photoFile && photoFile.size > 0 && photoFile.name !== 'undefined') {
    const bytes = await photoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = photoFile.name.split('.').pop() || 'jpg';
    const filename = `${uniqueSuffix}.${ext}`;
    
    const { join } = await import('path');
    const { writeFile, mkdir } = await import('fs/promises');
    
    const uploadDir = join(process.cwd(), 'public/uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {}
    
    const path = join(uploadDir, filename);
    await writeFile(path, buffer);
    const photoUrl = `/uploads/${filename}`;

    // Get current attempt number
    const maxAttempt = await db.photoReport.aggregate({
      where: { taskId: task.id, kind: "after" },
      _max: { attempt: true }
    });
    const currentAttempt = (maxAttempt._max.attempt || 0) + 1;

    await db.photoReport.create({
      data: {
        taskId: task.id,
        kind: "after",
        url: photoUrl,
        uploadedBy: session.sub,
        attempt: currentAttempt
      }
    });

    // Mark task as under review automatically since an 'after' photo was submitted
    await db.task.update({
      where: { id: payload.taskId },
      data: { status: "review" }
    });
  } else {
    // Basic status update (Worker cannot move task to review/done without photo)
    if (payload.status === 'review' || payload.status === 'done') {
      throw new Error("Cannot complete task without attaching a photo report.");
    }
    
    await db.task.update({
      where: { id: payload.taskId },
      data: { status: payload.status }
    });
  }

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: `Worker updated task: ${payload.status}`,
      entityType: "task",
      entityId: task.id
    }
  });

  revalidatePath("/dashboard/worker");
}
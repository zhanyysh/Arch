"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { TaskStatus } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary URL automatically picks up from process.env.CLOUDINARY_URL
// But ensure configuration is present if needed.
cloudinary.config({
  secure: true
});

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
    
    // Upload buffer directly to Cloudinary
    const photoUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "build-control/tasks", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result?.secure_url || "");
        }
      );
      uploadStream.end(buffer);
    });

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
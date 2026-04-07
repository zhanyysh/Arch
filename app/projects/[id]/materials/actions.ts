"use server";

import { MaterialStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

const createMaterialSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(1),
  quantity: z.coerce.number().min(0.01),
  unit: z.string().trim().min(1),
  cost: z.coerce.number().optional().default(0),
  supplier: z.string().trim().optional()
});

export async function createMaterialAction(formData: FormData) {
  const session = await requireRole(["manager", "foreman"]);
  
  const parsed = createMaterialSchema.safeParse({
    projectId: String(formData.get("projectId") ?? ""),
    name: String(formData.get("name") ?? ""),
    quantity: formData.get("quantity"),
    unit: String(formData.get("unit") ?? ""),
    cost: formData.get("cost") || undefined,
    supplier: String(formData.get("supplier") ?? "")
  });

  if (!parsed.success) {
    throw new Error("Invalid material data: " + parsed.error.message);
  }

  // Verify access to project
  const project = await db.project.findFirst({
    where: {
      id: parsed.data.projectId,
      companyId: session.companyId,
      ...(session.role === "foreman" ? { foremanId: session.sub } : {})
    }
  });

  if (!project) throw new Error("Project not found or access denied");

  const material = await db.material.create({
    data: {
      projectId: project.id,
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit,
      cost: parsed.data.cost || null,
      supplier: parsed.data.supplier || null,
      status: "planned"
    }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "material_create",
      entityType: "material",
      entityId: material.id,
      details: `Added ${material.quantity} ${material.unit} of ${material.name}`
    }
  });

  revalidatePath(`/projects/${project.id}/materials`);
}

export async function updateMaterialStatusAction(formData: FormData) {
  const session = await requireRole(["manager", "foreman"]);
  
  const materialId = String(formData.get("materialId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const status = String(formData.get("status") ?? "") as MaterialStatus;

  if (!materialId || !projectId || !Object.values(MaterialStatus).includes(status)) {
    throw new Error("Invalid material status update parameters");
  }

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      companyId: session.companyId,
      ...(session.role === "foreman" ? { foremanId: session.sub } : {})
    }
  });

  if (!project) throw new Error("Project not found or access denied");

  await db.material.update({
    where: { id: materialId },
    data: { status }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "material_status_update",
      entityType: "material",
      entityId: materialId,
      details: `Updated material status to ${status}`
    }
  });

  revalidatePath(`/projects/${projectId}/materials`);
}

export async function consumeMaterialAction(formData: FormData) {
  const session = await requireRole(["manager", "foreman"]);
  
  const materialId = String(formData.get("materialId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const amountToUse = parseFloat(String(formData.get("amountToUse") || 0));

  if (!materialId || !projectId || amountToUse <= 0 || isNaN(amountToUse)) {
    throw new Error("Invalid parameters");
  }

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      companyId: session.companyId,
      ...(session.role === "foreman" ? { foremanId: session.sub } : {})
    }
  });

  if (!project) throw new Error("Project not found or access denied");

  const material = await db.material.findUnique({
    where: { id: materialId }
  });

  if (!material || material.projectId !== projectId) {
    throw new Error("Material not found");
  }

  const newQuantity = material.quantity - amountToUse;
  if (newQuantity < 0) {
    throw new Error("Cannot consume more than available quantity");
  }

  // Auto-mark as "used" if quantity drops down to 0, otherwise keep existing status
  const newStatus = newQuantity === 0 ? "used" : material.status;

  await db.material.update({
    where: { id: materialId },
    data: { 
      quantity: newQuantity,
      status: newStatus
    }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "material_consume",
      entityType: "material",
      entityId: materialId,
      details: `Used ${amountToUse} ${material.unit} of ${material.name}. Remaining: ${newQuantity}`
    }
  });

  revalidatePath(`/projects/${projectId}/materials`);
}

export async function deleteMaterialAction(formData: FormData) {
  const session = await requireRole(["manager", "foreman"]);
  
  const materialId = String(formData.get("materialId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  if (!materialId || !projectId) throw new Error("Missing parameters");

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      companyId: session.companyId,
      ...(session.role === "foreman" ? { foremanId: session.sub } : {})
    }
  });

  if (!project) throw new Error("Project not found or access denied");

  const material = await db.material.delete({
    where: { id: materialId }
  });

  await db.auditLog.create({
    data: {
      actorId: session.sub,
      action: "material_delete",
      entityType: "material",
      entityId: materialId,
      details: `Deleted material ${material.name}`
    }
  });

  revalidatePath(`/projects/${projectId}/materials`);
}
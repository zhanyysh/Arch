"use server";

import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createCompany, createUser, toggleCompany, toggleUser } from "@/lib/admin-service";

const companySchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(7)
});

const userSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  role: z.nativeEnum(UserRole),
  companyId: z.string().trim().min(3),
  password: z.string().min(8)
});

export async function createCompanyAction(formData: FormData) {
  const parsed = companySchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? "")
  });

  if (!parsed.success) {
    throw new Error("Некорректные данные компании");
  }

  await createCompany(parsed.data);
  revalidatePath("/dashboard/admin");
}

export async function toggleCompanyAction(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  const nextActive = String(formData.get("nextActive") ?? "") === "true";

  if (!companyId) {
    throw new Error("Не указан companyId");
  }

  await toggleCompany(companyId, nextActive);
  revalidatePath("/dashboard/admin");
}

export async function createUserAction(formData: FormData) {
  const parsed = userSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? "") as UserRole,
    companyId: String(formData.get("companyId") ?? ""),
    password: String(formData.get("password") ?? "")
  });

  if (!parsed.success) {
    throw new Error("Некорректные данные пользователя");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await createUser({
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    role: parsed.data.role,
    companyId: parsed.data.companyId,
    passwordHash
  });

  revalidatePath("/dashboard/admin");
}

export async function toggleUserAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const nextActive = String(formData.get("nextActive") ?? "") === "true";

  if (!userId) {
    throw new Error("Не указан userId");
  }

  await toggleUser(userId, nextActive);
  revalidatePath("/dashboard/admin");
}

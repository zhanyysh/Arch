import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@admin.com";
  const password = "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  // Check if we already have a company to attach the admin to
  let company = await prisma.company.findFirst();

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "Super Admin Company",
        phone: "+996 777 77 77 77",
      },
    });
    console.log(`Created company: ${company.name}`);
  }

  // Create the admin user
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "admin",
      companyId: company.id,
    },
    create: {
      fullName: "Super Admin",
      email,
      passwordHash,
      role: "admin",
      companyId: company.id,
    },
  });

  console.log("✅ Super Admin created successfully!");
  console.log("-------------------------------------------------");
  console.log(`Email:    ${admin.email}`);
  console.log(`Password: ${password}`);
  console.log(`Role:     ${admin.role}`);
  console.log(`Company:  ${company.name}`);
  console.log("-------------------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
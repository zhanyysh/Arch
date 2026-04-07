const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const photos = await prisma.photoReport.findMany();
  console.log('Photos:', JSON.stringify(photos, null, 2));
  const tasks = await prisma.task.findMany({ include: { photos: true }});
  console.log('Tasks:', JSON.stringify(tasks, null, 2));
  process.exit();
}
run();
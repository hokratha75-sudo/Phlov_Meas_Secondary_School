import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.adminUser.findFirst();
  const teacher = await prisma.teacher.findFirst();
  console.log('Admin:', admin?.username, 'Teacher:', teacher?.username);
}
main().finally(() => prisma.$disconnect());

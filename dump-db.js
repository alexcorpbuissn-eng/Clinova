const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const clinics = await prisma.clinic.findMany();
  console.log('Clinics:', clinics);
  const users = await prisma.user.findMany();
  console.log('Users:', users);
}
main().finally(() => prisma.$disconnect());

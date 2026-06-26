const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const doctors = await prisma.doctor.findMany({ include: { clinic: true } });
  console.log(JSON.stringify(doctors, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());

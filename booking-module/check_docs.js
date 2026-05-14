const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const docs = await prisma.doctor.findMany({ include: { procedures: true } });
  console.dir(docs, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());

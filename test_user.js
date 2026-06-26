const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({where: {telegramPhone: '+998998571527'}});
  console.log(user);
}
main().finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany({ 
  where: { role: 'SUPER_ADMIN' }, 
  select: { id: true, telegramPhone: true, permissions: true, createdAt: true } 
}).then(console.log).catch(console.error).finally(() => prisma.$disconnect());

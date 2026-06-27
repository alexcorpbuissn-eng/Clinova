const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clinic = await prisma.clinic.findFirst({ where: { slug: 'habibullo-hilola' } });
  if (clinic) {
    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        source: 'BACKEND',
        message: 'Tizimga muvaffaqiyatli kirildi',
        details: JSON.stringify({ clinicId: clinic.id, action: 'LOGIN' })
      }
    });
    console.log('Log created for ' + clinic.name);
  } else {
    console.log('Clinic not found');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

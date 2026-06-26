import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from './src/lib/prisma';

async function main() {
  const user = await prisma.user.findUnique({ where: { telegramPhone: '+998998571527' }});
  console.log('USER:', user);
  
  if (user && user.clinicId) {
    const clinic = await prisma.clinic.findUnique({ where: { id: user.clinicId }});
    console.log('CLINIC:', clinic);
  }
}
main().finally(() => prisma.$disconnect());

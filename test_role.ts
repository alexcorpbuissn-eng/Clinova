import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from './src/lib/prisma';

async function main() {
  const user = await prisma.user.findFirst({ where: { telegramPhone: '+998998571527' }});
  console.log('USER:', user);
  
  const allUsers = await prisma.user.findMany();
  console.log('ALL USERS:', allUsers);
}
main().finally(() => prisma.$disconnect());

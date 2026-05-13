import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.patient.findMany({
    select: { telegramPhone: true, firstName: true, lastName: true },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log('--- RECENT PATIENTS ---');
  console.log(JSON.stringify(patients, null, 2));

  const users = await prisma.user.findMany();
  console.log('--- CURRENT USERS ---');
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

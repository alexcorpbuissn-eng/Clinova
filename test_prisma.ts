import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { clinicId: undefined },
      take: 1
    });
    console.log('SUCCESS:', appointments.length);
  } catch (err) {
    console.log('ERROR:', err);
  }
}
main().finally(() => prisma.$disconnect());

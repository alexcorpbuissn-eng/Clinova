
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { doctor: true }
  });
  console.log('--- USERS ---');
  console.table(users.map(u => ({
    id: u.id,
    phone: u.telegramPhone,
    role: u.role,
    doctorId: u.doctorId,
    doctorName: u.doctor ? `${u.doctor.firstName} ${u.doctor.lastName}` : 'N/A'
  })));

  const otps = await prisma.otp.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log('--- RECENT OTPS ---');
  console.table(otps);
  
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

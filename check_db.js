const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clinics = await prisma.clinic.findMany();
  console.log("Clinics:");
  console.log(JSON.stringify(clinics, null, 2));

  const doctors = await prisma.doctor.findMany();
  console.log("Doctors:");
  console.log(JSON.stringify(doctors, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@habibullo-hilola.uz';
  const password = 'admin'; // Change this later

  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log(`Admin ${email} already exists.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
    }
  });

  console.log(`Created admin user: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

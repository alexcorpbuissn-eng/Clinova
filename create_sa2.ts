import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
    const phone1 = '+998978571527';
    const phone2 = '+998998571527';
    const password = 'yamada554551';
    
    for (const phone of [phone1, phone2]) {
        const existingUser = await prisma.user.findUnique({
            where: { telegramPhone: phone }
        });
        
        if (existingUser) {
            await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: 'SUPER_ADMIN', password: password }
            });
            console.log('Updated existing user for phone:', phone);
        } else {
            await prisma.user.create({
                data: {
                    telegramPhone: phone,
                    role: 'SUPER_ADMIN',
                    password: password
                }
            });
            console.log('Created new user for phone:', phone);
        }
    }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

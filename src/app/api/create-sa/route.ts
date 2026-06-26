import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const phone1 = '+998978571527';
    const phone2 = '+998998571527';
    const password = 'yamada554551';
    
    try {
        for (const phone of [phone1, phone2]) {
            const existingUser = await prisma.user.findUnique({
                where: { telegramPhone: phone }
            });
            
            if (existingUser) {
                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { role: 'SUPER_ADMIN', password: password }
                });
            } else {
                await prisma.user.create({
                    data: {
                        firstName: 'Super',
                        lastName: 'Admin',
                        telegramPhone: phone,
                        role: 'SUPER_ADMIN',
                        password: password
                    }
                });
            }
        }
        return NextResponse.json({ success: true, message: 'Super admins created/updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

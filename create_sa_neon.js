const { Client } = require('@neondatabase/serverless');

async function main() {
    const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_VidDcgBt7T6x@ep-billowing-snow-alps2eo4.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
    await client.connect();

    const phone1 = '+998978571527';
    const phone2 = '+998998571527';
    const password = 'yamada554551';
    
    for (const phone of [phone1, phone2]) {
        const res = await client.query('SELECT id FROM "User" WHERE "telegramPhone" = $1', [phone]);
        
        if (res.rows.length > 0) {
            await client.query('UPDATE "User" SET role = $1, password = $2 WHERE "telegramPhone" = $3', ['SUPER_ADMIN', password, phone]);
            console.log('Updated existing user for phone:', phone);
        } else {
            // Need a UUID for id, since Prisma uses cuid or uuid usually, let's just insert one. Wait, Prisma uses uuid? 
            // We can check schema or just use uuidv4
            const { v4: uuidv4 } = require('uuid');
            const id = uuidv4();
            await client.query(
                'INSERT INTO "User" (id, "firstName", "lastName", "telegramPhone", role, password, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
                [id, 'Super', 'Admin', phone, 'SUPER_ADMIN', password]
            );
            console.log('Created new user for phone:', phone);
        }
    }
    
    await client.end();
}

main().catch(console.error);

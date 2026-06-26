import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log("Creating ClinicPlan enum if not exists...");
  try {
    await pool.query(`CREATE TYPE "ClinicPlan" AS ENUM ('TRIAL', 'BASIC', 'PRO', 'ENTERPRISE')`);
  } catch (e) {
    if (e.code !== '42710') throw e; // ignore if exists
  }

  console.log("Creating Clinic table...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Clinic" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "logoUrl" TEXT,
      "address" TEXT,
      "phone" TEXT,
      "telegramBotToken" TEXT,
      "telegramBotUsername" TEXT,
      "telegramGroupChatId" TEXT,
      "timezone" TEXT NOT NULL DEFAULT 'Asia/Tashkent',
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "plan" "ClinicPlan" NOT NULL DEFAULT 'TRIAL',
      "planExpiresAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
    )
  `);

  try {
    await pool.query(`CREATE UNIQUE INDEX "Clinic_slug_key" ON "Clinic"("slug")`);
  } catch(e) {}

  console.log("Inserting default clinic...");
  const clinicId = 'habibullo-hilola';
  await pool.query(`
    INSERT INTO "Clinic" ("id", "name", "slug") 
    VALUES ('${clinicId}', 'Habibullo-Hilola', 'habibullo-hilola')
    ON CONFLICT ("id") DO NOTHING
  `);

  const tables = ['Doctor', 'Appointment', 'Visit', 'Purchase', 'User', 'Procedure', 'Leave', 'Slot', 'Complaint', 'SavedDraft'];

  for (const table of tables) {
    console.log(`Adding clinicId to ${table}...`);
    try {
      await pool.query(`ALTER TABLE "${table}" ADD COLUMN "clinicId" TEXT NOT NULL DEFAULT '${clinicId}'`);
      await pool.query(`ALTER TABLE "${table}" ADD CONSTRAINT "${table}_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    } catch (e) {
      if (e.code === '42701') {
        console.log(`Column clinicId already exists on ${table}`);
      } else {
        console.error(`Error on ${table}:`, e.message);
      }
    }
  }

  // Update existing User role
  try {
    await pool.query(`UPDATE "User" SET role = 'ADMIN'::"Role" WHERE role IS NULL`);
  } catch(e) {}

  console.log("Done!");
  process.exit(0);
}

main().catch(console.error);

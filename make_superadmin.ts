import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log("Adding SUPER_ADMIN to Role enum...");
  try {
    await pool.query(`ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN'`);
    console.log("Successfully added SUPER_ADMIN to Role enum.");
  } catch (e) {
    if (e.code === '42710') { // duplicate_object
      console.log("SUPER_ADMIN already exists in Role enum.");
    } else {
      throw e;
    }
  }

  try {
    await pool.query(`UPDATE "User" SET "clinicId" = 'habibullo-hilola' WHERE "telegramPhone" = '+998998571527'`);
    console.log("Superadmin given clinicId habibullo-hilola");
  } catch (e) {
    console.error("Error updating superadmin clinicId:", e.message);
  }
  process.exit(0);
  console.log("Updated USER:", rows[0]);
  process.exit(0);
}
main();

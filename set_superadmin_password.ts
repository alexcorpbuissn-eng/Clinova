import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const res = await pool.query(`UPDATE "User" SET "password" = '12345678' WHERE "telegramPhone" = '+998998571527' RETURNING *`);
    console.log("Updated password for user:", res.rows[0]);
  } catch (e) {
    console.error("Error updating superadmin password:", e.message);
  }
  process.exit(0);
}
main();

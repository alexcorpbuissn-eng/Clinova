import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const res = await pool.query(`SELECT * FROM "User" WHERE "telegramPhone" = '+998998571527'`);
    console.log("User details:", res.rows[0]);
  } catch (e) {
    console.error("Error:", e.message);
  }
  process.exit(0);
}
main();

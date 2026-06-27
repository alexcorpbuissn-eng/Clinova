import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Show ALL Users to see what's in the DB
  const allUsers = await pool.query(`SELECT id, "telegramPhone", "role", "password", "clinicId" FROM "User"`);
  console.log("ALL Users in DB:", allUsers.rows);
  
  process.exit(0);
}
main();

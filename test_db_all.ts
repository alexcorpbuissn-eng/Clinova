import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(`SELECT * FROM "User"`);
  console.log("USERS:", rows);
}
main();

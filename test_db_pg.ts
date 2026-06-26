import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(`SELECT * FROM "User" WHERE "telegramPhone" = '+998998571527'`);
  console.log("USER:", rows[0]);
  
  if (rows[0] && rows[0].clinicId) {
    const { rows: clinics } = await pool.query(`SELECT * FROM "Clinic" WHERE id = $1`, [rows[0].clinicId]);
    console.log("CLINIC:", clinics[0]);
  }
}
main();

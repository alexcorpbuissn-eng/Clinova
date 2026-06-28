const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_VidDcgBt7T6x@ep-billowing-snow-alps2eo4.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require"
  });
  await client.connect();
  const res = await client.query('SELECT * FROM "User" WHERE role = $1', ['SUPER_ADMIN']);
  console.log(res.rows);
  await client.end();
}
test().catch(console.error);

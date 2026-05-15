/**
 * Sets photo URLs for all doctors using the same Unsplash photos as the About page.
 */
const { neon } = require('@neondatabase/serverless');

const DB_URL = "postgresql://neondb_owner:npg_VidDcgBt7T6x@ep-billowing-snow-alps2eo4.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require";

// Same professional doctor photos used on the about.html page
const photos = [
  "https://images.unsplash.com/photo-1559839734-2b71ce417274?auto=format&fit=crop&q=80&w=600&h=700",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600&h=700",
  "https://images.unsplash.com/photo-1594824436951-7f12620464d4?auto=format&fit=crop&q=80&w=600&h=700",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600&h=700",
  "https://images.unsplash.com/photo-1594824436960-7ea0361a659a?auto=format&fit=crop&q=80&w=600&h=700",
];

async function main() {
  const sql = neon(DB_URL);

  const doctors = await sql`SELECT id, "firstName", "lastName" FROM "Doctor" WHERE "isActive" = true ORDER BY "createdAt"`;
  
  console.log(`Found ${doctors.length} doctors.`);

  for (let i = 0; i < doctors.length; i++) {
    const photo = photos[i % photos.length];
    await sql`UPDATE "Doctor" SET "photoUrl" = ${photo} WHERE id = ${doctors[i].id}`;
    console.log(`✅ Updated Dr. ${doctors[i].firstName} ${doctors[i].lastName}`);
  }

  console.log('\nAll done!');
}

main().catch(console.error);

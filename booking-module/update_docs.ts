import { prisma } from './src/lib/prisma';

const photos = [
  "https://images.unsplash.com/photo-1559839734-2b71ce417274?auto=format&fit=crop&q=80&w=600&h=600",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600&h=600",
  "https://images.unsplash.com/photo-1594824436951-7f12620464d4?auto=format&fit=crop&q=80&w=600&h=600",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600&h=600",
  "https://images.unsplash.com/photo-1594824436960-7ea0361a659a?auto=format&fit=crop&q=80&w=600&h=600"
];

async function main() {
  const doctors = await prisma.doctor.findMany();
  for (let i = 0; i < doctors.length; i++) {
    const photoUrl = photos[i % photos.length];
    await prisma.doctor.update({
      where: { id: doctors[i].id },
      data: { photoUrl }
    });
    console.log(`Updated ${doctors[i].firstName} with photo.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

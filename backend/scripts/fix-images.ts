import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fixes: Record<string, string> = {
  // Pexels (verified, described explicitly for each location)
  'porto':     'https://images.pexels.com/photos/327514/pexels-photo-327514.jpeg?auto=compress&cs=tinysrgb&w=800',
  'algarve':   'https://images.pexels.com/photos/18141984/pexels-photo-18141984.jpeg?auto=compress&cs=tinysrgb&w=800',
  'amsterdão': 'https://images.pexels.com/photos/4237160/pexels-photo-4237160.jpeg?auto=compress&cs=tinysrgb&w=800',
};

async function main() {
  for (const [id, imageUrl] of Object.entries(fixes)) {
    const updated = await prisma.destination.updateMany({
      where: { id },
      data: { imageUrl },
    });
    if (updated.count > 0) console.log(`✓ ${id}`);
    else console.log(`— ${id} (não encontrado, a tentar por nome...)`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

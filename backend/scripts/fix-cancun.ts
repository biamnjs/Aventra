import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const r = await prisma.destination.updateMany({
    where: { id: 'cancún' },
    data: { imageUrl: 'https://images.pexels.com/photos/20210508/pexels-photo-20210508.jpeg?auto=compress&cs=tinysrgb&w=800' },
  });
  console.log(r.count > 0 ? '✓ cancún atualizado' : '— não encontrado, a tentar por nome...');

  if (r.count === 0) {
    const r2 = await prisma.destination.updateMany({
      where: { name: 'Cancún' },
      data: { imageUrl: 'https://images.pexels.com/photos/20210508/pexels-photo-20210508.jpeg?auto=compress&cs=tinysrgb&w=800' },
    });
    console.log(r2.count > 0 ? '✓ cancún atualizado por nome' : '— não encontrado por nome');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

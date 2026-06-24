import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) { console.error('Usage: ts-node delete-user.ts <email>'); process.exit(1); }

  await prisma.user.delete({ where: { email } });
  console.log(`Deleted: ${email}`);
}

main()
  .catch((e) => console.error(e.message))
  .finally(() => prisma.$disconnect());

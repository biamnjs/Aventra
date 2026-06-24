import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';

async function main() {
  await prisma.$connect();
  console.log('✓ Base de dados ligada');

  app.listen(env.PORT, () => {
    console.log(`✓ Servidor Aventra a correr em http://localhost:${env.PORT}`);
    console.log(`  Ambiente: ${env.NODE_ENV}`);
    console.log(`  API: http://localhost:${env.PORT}/api/v1`);
  });
}

main().catch((err) => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

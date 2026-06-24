import { FavoriteType } from '@prisma/client';
import { prisma } from '../config/database';

export async function toggleFavorite(userId: string, type: FavoriteType, referenceId: string, metadata?: unknown) {
  const existing = await prisma.favorite.findUnique({
    where: { userId_type_referenceId: { userId, type, referenceId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { favorited: false };
  }

  await prisma.favorite.create({
    data: { userId, type, referenceId, metadata: metadata ?? undefined },
  });
  return { favorited: true };
}

export async function getUserFavorites(userId: string, type?: FavoriteType) {
  return prisma.favorite.findMany({
    where: { userId, ...(type && { type }) },
    orderBy: { createdAt: 'desc' },
  });
}

export async function isFavorited(userId: string, type: FavoriteType, referenceId: string) {
  const fav = await prisma.favorite.findUnique({
    where: { userId_type_referenceId: { userId, type, referenceId } },
  });
  return !!fav;
}

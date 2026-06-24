import { PlaylistType, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export async function createPlaylist(userId: string, data: {
  name: string;
  type: PlaylistType;
  tripId?: string;
  songs: unknown[];
}) {
  return prisma.playlist.create({
    data: { userId, ...data, songs: data.songs as Prisma.InputJsonValue[] },
  });
}

export async function getUserPlaylists(userId: string) {
  return prisma.playlist.findMany({
    where: { userId },
    include: { trip: { select: { title: true, destination: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPlaylistById(playlistId: string, userId: string) {
  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId, userId },
  });

  if (!playlist) throw new Error('Playlist não encontrada');
  return playlist;
}

export async function deletePlaylist(playlistId: string, userId: string) {
  await prisma.playlist.delete({ where: { id: playlistId, userId } });
}

import { PlaylistType, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export async function createPlaylist(userId: string, data: {
  name: string;
  type: PlaylistType;
  tripId?: string;
  songs: unknown[];
  destination?: string;
  genres?: string[];
}) {
  if (data.tripId) {
    const trip = await prisma.trip.findFirst({ where: { id: data.tripId, userId } });
    if (!trip) throw new AppError(403, 'Acesso negado a esta viagem');
  }

  return prisma.playlist.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      tripId: data.tripId,
      destination: data.destination,
      genres: data.genres ?? [],
      songs: data.songs as Prisma.InputJsonValue[],
    },
  });
}

export async function updatePlaylistSongs(playlistId: string, userId: string, songs: unknown[]) {
  const playlist = await prisma.playlist.findFirst({ where: { id: playlistId, userId } });
  if (!playlist) throw new AppError(404, 'Playlist não encontrada');

  return prisma.playlist.update({
    where: { id: playlistId },
    data: { songs: songs as Prisma.InputJsonValue[] },
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Playlist } from '../types';

export function usePlaylists() {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const res = await api.get('/playlists');
      return res.data.data as Playlist[];
    },
  });
}

export function useGeneratePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { destination: string; type: string; genres: string[]; tripId?: string }) => {
      const res = await api.post('/ai/playlist', data);
      return res.data.data as { playlist: Playlist; description: string };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['playlists'] }),
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/playlists/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['playlists'] }),
  });
}

export function useRefreshPlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, keepSongIndices }: { id: string; keepSongIndices: number[] }) => {
      const res = await api.post(`/ai/playlist/${id}/refresh`, { keepSongIndices });
      return res.data.data as { playlist: Playlist };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['playlists'] }),
  });
}

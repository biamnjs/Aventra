import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useFavorites(type?: string) {
  return useQuery({
    queryKey: ['favorites', type],
    queryFn: async () => {
      const res = await api.get('/favorites', { params: type ? { type } : undefined });
      return res.data.data as Array<{
        id: string;
        type: string;
        referenceId: string;
        metadata: unknown;
        createdAt: string;
      }>;
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { type: string; referenceId: string; metadata?: unknown }) => {
      const res = await api.post('/favorites/toggle', data);
      return res.data.data as { favorited: boolean };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

export function useIsFavorited(type: string, referenceId: string) {
  return useQuery({
    queryKey: ['favorites', 'check', type, referenceId],
    queryFn: async () => {
      const res = await api.get('/favorites/check', { params: { type, referenceId } });
      return res.data.data.favorited as boolean;
    },
    enabled: !!referenceId,
  });
}

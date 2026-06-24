import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Destination } from '../types';

export function useFeaturedDestinations() {
  return useQuery({
    queryKey: ['destinations', 'featured'],
    queryFn: async () => {
      const res = await api.get('/destinations/featured');
      return res.data.data as Destination[];
    },
  });
}

export function useDestinations(filters?: { country?: string; climate?: string; tags?: string }) {
  return useQuery({
    queryKey: ['destinations', filters],
    queryFn: async () => {
      const res = await api.get('/destinations', { params: filters });
      return res.data.data as Destination[];
    },
  });
}

export function useDestination(id: string) {
  return useQuery({
    queryKey: ['destinations', id],
    queryFn: async () => {
      const res = await api.get(`/destinations/${id}`);
      return res.data.data as Destination & { hotels: unknown[]; reviews: unknown[] };
    },
    enabled: !!id,
  });
}

export function useSearchDestinations(query: string) {
  return useQuery({
    queryKey: ['destinations', 'search', query],
    queryFn: async () => {
      const res = await api.get('/destinations/search', { params: { q: query } });
      return res.data.data as Destination[];
    },
    enabled: query.length >= 2,
  });
}

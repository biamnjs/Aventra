import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Trip } from '../types';

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await api.get('/trips');
      return res.data.data as Trip[];
    },
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: async () => {
      const res = await api.get(`/trips/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      destinationId: string;
      title: string;
      startDate?: string;
      endDate?: string;
      budget?: number;
      notes?: string;
    }) => {
      const res = await api.post('/trips', data);
      return res.data.data as Trip;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useUpdateTrip(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Trip>) => {
      const res = await api.patch(`/trips/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trips', id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/trips/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useSaveItinerary(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (days: Array<{ dayNumber: number; activities: unknown[] }>) => {
      const res = await api.post(`/trips/${tripId}/itinerary`, { days });
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips', tripId] }),
  });
}

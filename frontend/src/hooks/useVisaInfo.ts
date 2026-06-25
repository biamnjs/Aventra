import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export type VisaStatus = 'free' | 'voa' | 'evisa' | 'required' | 'restricted' | 'domestic';

export interface VisaEntry {
  status: VisaStatus;
  days?: number;
  cost?: string;
  notes?: string;
  link?: string;
}

export function useVisaInfo(destinationId: string, passportCode: string | undefined) {
  return useQuery({
    queryKey: ['visa', destinationId, passportCode],
    queryFn: async () => {
      const res = await api.get(`/destinations/${destinationId}/visa`, { params: { passport: passportCode } });
      return res.data.data as VisaEntry;
    },
    enabled: !!destinationId && !!passportCode && passportCode.length === 2,
    staleTime: 1000 * 60 * 60, // 1h — visa data changes rarely
  });
}

export function useSavePassport() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  return useMutation({
    mutationFn: async (passportCountry: string) => {
      const res = await api.post('/users/traveler-profile', { passportCountry });
      return res.data.data;
    },
    onSuccess: (data) => {
      if (user) {
        setUser({ ...user, profile: data });
      }
      queryClient.invalidateQueries({ queryKey: ['traveler-profile'] });
    },
  });
}

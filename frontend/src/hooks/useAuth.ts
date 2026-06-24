import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post('/auth/login', data);
      return res.data.data;
    },
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      navigate('/painel');
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const res = await api.post('/auth/register', data);
      return res.data.data;
    },
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      navigate('/perfil/questionario');
    },
  });
}

export function useMe() {
  const { isAuthenticated, setUser } = useAuthStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
      return res.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
    navigate('/');
  };
}

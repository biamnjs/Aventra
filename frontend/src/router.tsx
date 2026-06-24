import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { Destinations } from './pages/Destinations';
import { DestinationDetail } from './pages/DestinationDetail';
import { Trips } from './pages/Trips';
import { NewTrip } from './pages/NewTrip';
import { TripDetail } from './pages/TripDetail';
import { Playlists } from './pages/Playlists';
import { Favorites } from './pages/Favorites';
import { TravelerQuestionnaire } from './pages/TravelerQuestionnaire';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/entrar" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/painel" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'entrar', element: <GuestRoute><Login /></GuestRoute> },
      { path: 'registar', element: <GuestRoute><Register /></GuestRoute> },

      { path: 'painel', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },

      { path: 'destinos', element: <Destinations /> },
      { path: 'destinos/:id', element: <DestinationDetail /> },

      { path: 'viagens', element: <ProtectedRoute><Trips /></ProtectedRoute> },
      { path: 'viagens/nova', element: <ProtectedRoute><NewTrip /></ProtectedRoute> },
      { path: 'viagens/:id', element: <ProtectedRoute><TripDetail /></ProtectedRoute> },

      { path: 'playlists', element: <ProtectedRoute><Playlists /></ProtectedRoute> },
      { path: 'favoritos', element: <ProtectedRoute><Favorites /></ProtectedRoute> },

      { path: 'perfil/questionario', element: <ProtectedRoute><TravelerQuestionnaire /></ProtectedRoute> },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

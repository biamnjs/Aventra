import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ChatAssistant } from '../ChatAssistant';
import { MiniPlayer } from '../MiniPlayer';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';

export function Layout() {
  const { isAuthenticated } = useAuthStore();
  const { track } = usePlayerStore();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className={track ? 'pb-20' : ''}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {isAuthenticated && <ChatAssistant />}
      <MiniPlayer />
    </div>
  );
}

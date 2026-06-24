import { useEffect, useRef, useState } from 'react';
import { Play, Pause, X, Volume2, Music } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

const moodColors: Record<string, string> = {
  animada: 'from-yellow-400 to-orange-400',
  relaxante: 'from-blue-400 to-cyan-400',
  romântica: 'from-pink-400 to-rose-400',
  intensa: 'from-red-500 to-orange-500',
  melancólica: 'from-purple-400 to-indigo-400',
};

export function MiniPlayer() {
  const { track, isPlaying, togglePlay, stop } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (!track.previewUrl) { stop(); return; }
    audio.src = track.previewUrl;
    audio.play().catch(() => stop());
  }, [track, stop]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => stop();
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
  }, [stop]);

  if (!track) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const gradient = moodColors[track.mood ?? ''] ?? 'from-brand-400 to-brand-600';

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  }

  function fmt(s: number) {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <audio ref={audioRef} preload="auto" />

      {/* barra de progresso clicável */}
      <div
        className="w-full h-1 bg-gray-200 cursor-pointer group"
        onClick={seek}
      >
        <div
          className={`h-full bg-gradient-to-r ${gradient} transition-all group-hover:h-1.5`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* ícone */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
          <Music className="w-5 h-5 text-white" />
        </div>

        {/* info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{track.title}</p>
          <p className="text-xs text-gray-500 truncate">{track.artist}</p>
        </div>

        {/* tempos */}
        <span className="text-xs text-gray-400 tabular-nums flex-shrink-0 hidden sm:block">
          {fmt(progress)} / {fmt(duration)}
        </span>

        {/* controles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={stop}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Fechar player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* badge preview */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
          <Volume2 className="w-3 h-3" />
          Pré-escuta 30s
        </div>
      </div>
    </div>
  );
}

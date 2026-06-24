import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Music, Plus, Trash2, ChevronDown, ChevronUp, Loader2, Play, Pause, ExternalLink } from 'lucide-react';
import { usePlaylists, useGeneratePlaylist, useDeletePlaylist } from '../hooks/usePlaylists';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { usePlayerStore } from '../store/playerStore';
import type { Playlist } from '../types';

const playlistTypes = [
  { value: 'TRAVEL', label: 'Viagem', emoji: '✈️' },
  { value: 'STORIES', label: 'Stories', emoji: '📱' },
  { value: 'REELS', label: 'Reels', emoji: '🎬' },
  { value: 'SUNSET', label: 'Pôr do Sol', emoji: '🌅' },
  { value: 'ROMANTIC', label: 'Romântica', emoji: '💕' },
  { value: 'ADVENTURE', label: 'Aventura', emoji: '🧗' },
];

const MUSIC_GENRES = [
  { value: 'pop', label: 'Pop', emoji: '🎤' },
  { value: 'rock', label: 'Rock', emoji: '🎸' },
  { value: 'indie', label: 'Indie', emoji: '🎵' },
  { value: 'hip-hop', label: 'Hip-Hop', emoji: '🎧' },
  { value: 'r&b', label: 'R&B / Soul', emoji: '🎶' },
  { value: 'electronic', label: 'Electrónica', emoji: '🎛️' },
  { value: 'jazz', label: 'Jazz', emoji: '🎷' },
  { value: 'bossa nova', label: 'Bossa Nova', emoji: '🌺' },
  { value: 'fado', label: 'Fado', emoji: '🎭' },
  { value: 'latino', label: 'Latino', emoji: '💃' },
  { value: 'reggaeton', label: 'Reggaeton', emoji: '🔥' },
  { value: 'afrobeat', label: 'Afrobeat', emoji: '🥁' },
  { value: 'reggae', label: 'Reggae', emoji: '🌴' },
  { value: 'folk', label: 'Folk / Acústico', emoji: '🪕' },
  { value: 'classical', label: 'Clássica', emoji: '🎻' },
  { value: 'funk', label: 'Funk / Chill', emoji: '😎' },
];

const moodColors: Record<string, string> = {
  animada: 'bg-yellow-100 text-yellow-700',
  relaxante: 'bg-blue-100 text-blue-700',
  romântica: 'bg-pink-100 text-pink-700',
  intensa: 'bg-red-100 text-red-700',
  melancólica: 'bg-purple-100 text-purple-700',
};

function SongRow({ song }: { song: Playlist['songs'][number] }) {
  const { track, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const isActive = track?.title === song.title && track?.artist === song.artist;

  async function handlePlay() {
    if (isActive) { togglePlay(); return; }
    setLoading(true);
    try {
      const q = encodeURIComponent(`${song.title} ${song.artist}`);
      const res = await fetch(`https://itunes.apple.com/search?term=${q}&media=music&limit=1`);
      const data = await res.json();
      const url: string | undefined = data.results?.[0]?.previewUrl;
      if (url) {
        setTrack({ title: song.title, artist: song.artist, previewUrl: url, mood: song.mood });
      } else {
        setUnavailable(true);
        setTimeout(() => setUnavailable(false), 3000);
      }
    } catch {
      setUnavailable(true);
      setTimeout(() => setUnavailable(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  const fallbackUrl = `https://www.last.fm/search/tracks?q=${encodeURIComponent(`${song.title} ${song.artist}`)}`;
  const linkUrl = song.lastFmUrl ?? fallbackUrl;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 group">
      {/* capa do álbum / play */}
      <div className="w-10 h-10 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
        {song.imageUrl ? (
          <img src={song.imageUrl} alt={song.album ?? song.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
            <Music className="w-4 h-4 text-purple-400" />
          </div>
        )}
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : unavailable ? (
            <span className="text-xs text-white">—</span>
          ) : isActive && isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>
        {isActive && !loading && (
          <div className="absolute inset-0 ring-2 ring-brand-500 rounded-lg pointer-events-none" />
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-brand-600' : 'text-gray-900'}`}>{song.title}</p>
        <p className="text-xs text-gray-500 truncate">
          {song.artist}
          {song.album && <span className="text-gray-400"> · {song.album}</span>}
        </p>
        {song.listeners && (
          <p className="text-xs text-gray-400">{song.listeners.toLocaleString('pt-PT')} ouvintes</p>
        )}
      </div>

      {/* mood + last.fm */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {song.mood && (
          <span className={`text-xs px-2 py-0.5 rounded-full hidden sm:inline ${moodColors[song.mood] ?? 'bg-gray-100 text-gray-600'}`}>
            {song.mood}
          </span>
        )}
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500"
          title="Abrir no Last.fm"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const [expanded, setExpanded] = useState(false);
  const deletePlaylist = useDeletePlaylist();
  const typeInfo = playlistTypes.find((t) => t.value === playlist.type);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Eliminar "${playlist.name}"?`)) return;
    await deletePlaylist.mutateAsync(playlist.id);
  }

  return (
    <Card className="overflow-hidden">
      <div
        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {typeInfo?.emoji ?? '🎵'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{playlist.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{typeInfo?.label} · {playlist.songs.length} músicas</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100">
          <div className="max-h-80 overflow-y-auto">
            {playlist.songs.map((song, i) => (
              <SongRow key={`${song.title}-${song.artist}-${i}`} song={song} />
            ))}
          </div>
          <div className="px-5 py-2.5 border-t border-gray-50 text-xs text-gray-400 flex items-center gap-1">
            <Play className="w-3 h-3" />
            Clica em qualquer música para ouvir uma pré-escuta de 30s
          </div>
        </div>
      )}
    </Card>
  );
}

export function Playlists() {
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [destination, setDestination] = useState(searchParams.get('destino') ?? '');
  const [selectedType, setSelectedType] = useState('TRAVEL');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { data: playlists, isLoading } = usePlaylists();
  const generatePlaylist = useGeneratePlaylist();

  const tripId = searchParams.get('viagem') ?? undefined;

  function toggleGenre(value: string) {
    setSelectedGenres((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    );
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!destination.trim()) { setError('Indica um destino'); return; }
    if (selectedGenres.length === 0) { setError('Seleciona pelo menos um género musical'); return; }
    try {
      await generatePlaylist.mutateAsync({ destination, type: selectedType, genres: selectedGenres, tripId });
      setShowForm(false);
      setDestination('');
      setSelectedGenres([]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg === 'Serviço de IA temporariamente indisponível'
        ? 'IA indisponível — adiciona a chave Anthropic no ficheiro .env do backend'
        : (msg ?? 'Erro ao gerar playlist. Tenta novamente.'));
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Playlists</h1>
          <p className="text-gray-500 mt-1">Músicas personalizadas para cada viagem</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Nova playlist
        </Button>
      </div>

      {/* Formulário de geração */}
      {showForm && (
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Gerar playlist com IA</h2>
          <form onSubmit={handleGenerate} className="space-y-5">
            <Input
              label="Destino"
              placeholder="Ex: Bali, Japão, Lisboa..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />

            {/* Géneros musicais */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Géneros musicais
                  {selectedGenres.length > 0 && (
                    <span className="ml-2 text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full font-normal">
                      {selectedGenres.length} selecionados
                    </span>
                  )}
                </label>
                {selectedGenres.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedGenres([])}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MUSIC_GENRES.map((genre) => {
                  const checked = selectedGenres.includes(genre.value);
                  return (
                    <button
                      key={genre.value}
                      type="button"
                      onClick={() => toggleGenre(genre.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                        checked
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center text-xs ${
                        checked ? 'bg-white border-white' : 'border-gray-300'
                      }`}>
                        {checked && '✓'}
                      </span>
                      <span>{genre.emoji}</span>
                      <span className="truncate">{genre.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tipo de playlist */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Tipo de playlist</label>
              <div className="grid grid-cols-3 gap-2">
                {playlistTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={`py-2 px-3 rounded-xl border text-sm font-medium transition-colors flex items-center gap-1.5 justify-center ${
                      selectedType === type.value
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'border-gray-200 text-gray-600 hover:border-brand-300'
                    }`}
                  >
                    <span>{type.emoji}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" loading={generatePlaylist.isPending} className="flex-1">
                {generatePlaylist.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />A gerar...</>
                ) : (
                  <><Music className="w-4 h-4" />Gerar playlist</>
                )}
              </Button>
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setSelectedGenres([]); }}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de playlists */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : playlists && playlists.length > 0 ? (
        <div className="space-y-3">
          {playlists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="font-medium text-gray-700 mb-2">Ainda sem playlists</h3>
          <p className="text-gray-400 text-sm mb-5">Cria a tua primeira playlist personalizada com IA</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Criar playlist
          </Button>
        </div>
      )}
    </div>
  );
}

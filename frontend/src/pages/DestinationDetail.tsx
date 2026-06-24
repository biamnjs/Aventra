import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, ArrowLeft, Heart, Star, Calendar, Plus, Music, Globe
} from 'lucide-react';
import { useDestination } from '../hooks/useDestinations';
import { useToggleFavorite, useIsFavorited } from '../hooks/useFavorites';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const climateEmojis: Record<string, string> = {
  tropical: '🌴',
  temperado: '🍂',
  árido: '☀️',
  frio: '❄️',
};

export function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const { data: destination, isLoading } = useDestination(id!);
  const { data: favorited } = useIsFavorited('DESTINATION', id!);
  const toggleFavorite = useToggleFavorite();

  async function handleFavorite() {
    if (!isAuthenticated) { navigate('/entrar'); return; }
    await toggleFavorite.mutateAsync({
      type: 'DESTINATION',
      referenceId: id!,
      metadata: { name: destination?.name, country: destination?.country, imageUrl: destination?.imageUrl },
    });
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-72 bg-gray-100 rounded-3xl mb-6" />
        <div className="h-8 bg-gray-100 rounded w-1/2 mb-3" />
        <div className="h-4 bg-gray-100 rounded w-1/4 mb-6" />
        <div className="h-24 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Destino não encontrado</p>
        <Link to="/destinos" className="text-brand-500 text-sm mt-2 hover:underline block">Voltar aos destinos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      {/* Hero */}
      <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden mb-8 bg-gray-100">
        {destination.imageUrl ? (
          <img src={destination.imageUrl} alt={destination.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-300 to-brand-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{destination.name}</h1>
            <div className="flex items-center gap-1.5 text-white/80 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{destination.country}</span>
            </div>
          </div>
          <button
            onClick={handleFavorite}
            disabled={toggleFavorite.isPending}
            className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
              favorited ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Sobre */}
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Sobre o destino</h2>
            <p className="text-gray-600 leading-relaxed">{destination.description}</p>
          </Card>

          {/* Tags */}
          {destination.tags.length > 0 && (
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Ideal para</h2>
              <div className="flex flex-wrap gap-2">
                {destination.tags.map((tag) => (
                  <span key={tag} className="bg-brand-50 text-brand-600 text-sm px-3 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Hotéis */}
          {Array.isArray(destination.hotels) && destination.hotels.length > 0 && (
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Hotéis Sugeridos</h2>
              <div className="space-y-3">
                {(destination.hotels as Array<{id: string; name: string; rating?: number; pricePerNight?: number; imageUrl?: string}>).map((hotel) => (
                  <div key={hotel.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {hotel.imageUrl && <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{hotel.name}</p>
                      {hotel.rating && (
                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          {hotel.rating}
                        </div>
                      )}
                    </div>
                    {hotel.pricePerNight && (
                      <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                        €{hotel.pricePerNight}/noite
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Informação rápida</h3>
            <div className="space-y-3 text-sm">
              {destination.climate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-lg">{climateEmojis[destination.climate] ?? '🌍'}</span>
                  <span>Clima <strong>{destination.climate}</strong></span>
                </div>
              )}
              {destination.latitude && destination.longitude && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="w-4 h-4" />
                  <span>{destination.latitude.toFixed(2)}, {destination.longitude.toFixed(2)}</span>
                </div>
              )}
            </div>
          </Card>

          <Link to={`/viagens/nova?destino=${destination.id}&nome=${encodeURIComponent(destination.name)}`}>
            <Button className="w-full" size="lg">
              <Calendar className="w-4 h-4" />
              Planear viagem
            </Button>
          </Link>

          <Link to={`/playlists?destino=${encodeURIComponent(destination.name)}`}>
            <Button variant="secondary" className="w-full">
              <Music className="w-4 h-4" />
              Gerar playlist
            </Button>
          </Link>

          <Link to={`/viagens/nova?destino=${destination.id}`}>
            <Button variant="ghost" className="w-full">
              <Plus className="w-4 h-4" />
              Adicionar à viagem
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

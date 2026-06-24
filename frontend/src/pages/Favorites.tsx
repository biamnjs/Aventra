import { Link } from 'react-router-dom';
import { Heart, MapPin, Hotel, Utensils, Map, Music, Trash2 } from 'lucide-react';
import { useFavorites, useToggleFavorite } from '../hooks/useFavorites';
import { Card } from '../components/ui/Card';

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; href: (id: string) => string }> = {
  DESTINATION: { label: 'Destinos', icon: MapPin, color: 'text-brand-500', href: (id) => `/destinos/${id}` },
  HOTEL: { label: 'Hotéis', icon: Hotel, color: 'text-blue-500', href: () => '#' },
  RESTAURANT: { label: 'Restaurantes', icon: Utensils, color: 'text-amber-500', href: () => '#' },
  ITINERARY: { label: 'Roteiros', icon: Map, color: 'text-green-500', href: (id) => `/viagens/${id}` },
  PLAYLIST: { label: 'Playlists', icon: Music, color: 'text-purple-500', href: () => '/playlists' },
};

interface Favorite {
  id: string;
  type: string;
  referenceId: string;
  metadata: unknown;
  createdAt: string;
}

function FavoriteCard({ fav }: { fav: Favorite }) {
  const config = typeConfig[fav.type];
  const toggle = useToggleFavorite();
  const meta = fav.metadata as Record<string, string> | null;
  const Icon = config?.icon ?? Heart;

  async function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    await toggle.mutateAsync({ type: fav.type, referenceId: fav.referenceId });
  }

  const content = (
    <Card hover className="p-4 flex items-center gap-4">
      {meta?.imageUrl ? (
        <img src={meta.imageUrl} alt={meta.name ?? ''} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className={`w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${config?.color ?? 'text-gray-400'}`} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{meta?.name ?? fav.referenceId}</p>
        {meta?.country && <p className="text-sm text-gray-500">{meta.country}</p>}
        <span className="text-xs text-gray-400">{config?.label ?? fav.type}</span>
      </div>
      <button
        onClick={handleRemove}
        disabled={toggle.isPending}
        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </Card>
  );

  const href = config?.href(fav.referenceId);
  return href && href !== '#' ? <Link to={href}>{content}</Link> : content;
}

export function Favorites() {
  const { data: favorites, isLoading } = useFavorites();

  const grouped = (favorites ?? []).reduce<Record<string, Favorite[]>>((acc, fav) => {
    if (!acc[fav.type]) acc[fav.type] = [];
    acc[fav.type].push(fav);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Favoritos</h1>
        <p className="text-gray-500 mt-1">Tudo o que guardaste para inspiração</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : Object.keys(grouped).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, items]) => {
            const config = typeConfig[type];
            const Icon = config?.icon ?? Heart;
            return (
              <section key={type}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-4 h-4 ${config?.color ?? 'text-gray-500'}`} />
                  <h2 className="font-semibold text-gray-700">{config?.label ?? type}</h2>
                  <span className="text-gray-400 text-sm">({items.length})</span>
                </div>
                <div className="space-y-3">
                  {items.map((fav) => (
                    <FavoriteCard key={fav.id} fav={fav} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-300" />
          </div>
          <h3 className="font-medium text-gray-700 mb-2">Ainda sem favoritos</h3>
          <p className="text-gray-400 text-sm">Explora destinos e guarda os que mais gostas</p>
          <Link to="/destinos" className="inline-block mt-4 text-brand-500 text-sm hover:underline">
            Explorar destinos →
          </Link>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { useDestinations } from '../hooks/useDestinations';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { Destination } from '../types';

const climateOptions = [
  { value: '', label: 'Todos os climas' },
  { value: 'tropical', label: 'Tropical' },
  { value: 'temperado', label: 'Temperado' },
  { value: 'árido', label: 'Árido' },
  { value: 'frio', label: 'Frio' },
];

const tagOptions = ['praia', 'cidade', 'natureza', 'cultura', 'aventura', 'luxo', 'fotografia', 'gastronomia', 'romântico'];

function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link to={`/destinos/${destination.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-100 shadow-sm">
        {destination.imageUrl ? (
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-200 to-brand-400" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-base">{destination.name}</h3>
          <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
            <MapPin className="w-3 h-3" />
            {destination.country}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {destination.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
        {destination.featured && (
          <div className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            Destaque
          </div>
        )}
      </div>
    </Link>
  );
}

export function Destinations() {
  const [search, setSearch] = useState('');
  const [climate, setClimate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: destinations, isLoading } = useDestinations({
    climate: climate || undefined,
    tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
  });

  const filtered = (destinations ?? []).filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q);
  });

  function toggleTag(tag: string) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function clearFilters() {
    setClimate('');
    setSelectedTags([]);
    setSearch('');
  }

  const hasFilters = !!climate || selectedTags.length > 0 || !!search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Explorar Destinos</h1>
        <p className="text-gray-500">Descobre os melhores destinos para o teu próximo roteiro</p>
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Pesquisar destinos ou países..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasFilters && <span className="bg-white text-brand-500 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{selectedTags.length + (climate ? 1 : 0)}</span>}
        </Button>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="w-4 h-4" />
            Limpar
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Clima</p>
            <div className="flex flex-wrap gap-2">
              {climateOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setClimate(opt.value)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    climate === opt.value
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'border-gray-200 text-gray-600 hover:border-brand-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tipo de viagem</p>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'border-gray-200 text-gray-600 hover:border-brand-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} destinos encontrados</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum destino encontrado com esses filtros</p>
          <button onClick={clearFilters} className="text-brand-500 text-sm mt-2 hover:underline">
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}

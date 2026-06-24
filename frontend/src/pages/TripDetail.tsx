import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Wallet, Music, Brain,
  Clock, DollarSign, Navigation, Trash2
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTrip, useUpdateTrip, useDeleteTrip } from '../hooks/useTrips';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatDate, formatCurrency } from '../lib/utils';
import { api } from '../lib/api';

type Activity = {
  time: string;
  name: string;
  description: string;
  location: string;
  estimatedCost: number;
  duration: string;
  category: string;
};

type ItineraryDay = {
  dayNumber: number;
  title?: string;
  activities: Activity[];
  totalEstimatedCost?: number;
  tips?: string;
};

const statusLabels: Record<string, string> = {
  PLANNING: 'A planear', BOOKED: 'Reservada', ONGOING: 'Em curso',
  COMPLETED: 'Concluída', CANCELLED: 'Cancelada',
};

const categoryIcons: Record<string, string> = {
  cultura: '🏛️', gastronomia: '🍽️', aventura: '🧗', compras: '🛍️',
  natureza: '🌿', fotografia: '📸',
};

export function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'info' | 'roteiro' | 'playlists'>('info');

  const { data: trip, isLoading } = useTrip(id!);
  const updateTrip = useUpdateTrip(id!);
  const deleteTrip = useDeleteTrip();

  const generateItinerary = useMutation({
    mutationFn: async () => {
      if (!trip) return;
      const days = trip.startDate && trip.endDate
        ? Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000)
        : 5;
      const res = await api.post('/ai/itinerary', {
        destination: trip.destination.name,
        days: Math.max(1, days),
      });
      const itinerary: ItineraryDay[] = res.data.data.itinerary;
      await api.post(`/trips/${id}/itinerary`, {
        days: itinerary.map((d) => ({ dayNumber: d.dayNumber, activities: d.activities })),
      });
      return itinerary;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips', id] }),
  });

  async function handleDelete() {
    if (!confirm('Eliminar esta viagem?')) return;
    await deleteTrip.mutateAsync(id!);
    navigate('/viagens');
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-56 bg-gray-100 rounded-3xl mb-6" />
        <div className="h-6 bg-gray-100 rounded w-1/3 mb-3" />
        <div className="h-4 bg-gray-100 rounded w-1/4" />
      </div>
    );
  }

  if (!trip) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Viagem não encontrada</p>
      <Link to="/viagens" className="text-brand-500 text-sm mt-2 hover:underline block">Voltar às viagens</Link>
    </div>
  );

  const itinerary: ItineraryDay[] = trip.itinerary ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      {/* Hero */}
      <div className="relative h-56 rounded-3xl overflow-hidden mb-6 bg-gray-100">
        {trip.destination.imageUrl && (
          <img src={trip.destination.imageUrl} alt={trip.destination.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
          <div>
            <span className="text-xs font-medium bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full mb-2 inline-block">
              {statusLabels[trip.status]}
            </span>
            <h1 className="text-2xl font-bold text-white">{trip.title}</h1>
            <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {trip.destination.name}, {trip.destination.country}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Info rápida */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {trip.startDate && (
          <Card className="p-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Partida</p>
              <p className="text-sm font-medium text-gray-900 truncate">{formatDate(trip.startDate)}</p>
            </div>
          </Card>
        )}
        {trip.endDate && (
          <Card className="p-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Regresso</p>
              <p className="text-sm font-medium text-gray-900 truncate">{formatDate(trip.endDate)}</p>
            </div>
          </Card>
        )}
        {trip.budget && (
          <Card className="p-3 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-green-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Orçamento</p>
              <p className="text-sm font-medium text-gray-900">{formatCurrency(trip.budget)}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {([['info', 'Informação'], ['roteiro', 'Roteiro'], ['playlists', 'Playlists']] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Informação */}
      {activeTab === 'info' && (
        <div className="space-y-4">
          {trip.notes && (
            <Card className="p-5">
              <h3 className="font-medium text-gray-900 mb-2">Notas</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{trip.notes}</p>
            </Card>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to={trip.destination.id ? `/destinos/${trip.destination.id}` : '/destinos'}>
              <Card hover className="p-5 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-brand-500" />
                <div>
                  <p className="font-medium text-gray-900">Ver destino</p>
                  <p className="text-sm text-gray-500">{trip.destination.name}</p>
                </div>
              </Card>
            </Link>
            <Link to={`/playlists?destino=${encodeURIComponent(trip.destination.name)}&viagem=${id}`}>
              <Card hover className="p-5 flex items-center gap-3">
                <Music className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900">Playlist da viagem</p>
                  <p className="text-sm text-gray-500">Gerar música personalizada</p>
                </div>
              </Card>
            </Link>
          </div>
          <div className="flex gap-2">
            <select
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={trip.status}
              onChange={async (e) => { await updateTrip.mutateAsync({ status: e.target.value as Trip['status'] }); }}
            >
              {Object.entries(statusLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tab: Roteiro */}
      {activeTab === 'roteiro' && (
        <div>
          {itinerary.length > 0 ? (
            <div className="space-y-6">
              {itinerary.map((day) => (
                <div key={day.dayNumber}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {day.dayNumber}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{day.title ?? `Dia ${day.dayNumber}`}</h3>
                      {day.totalEstimatedCost && (
                        <p className="text-xs text-gray-500">Custo estimado: {formatCurrency(day.totalEstimatedCost)}</p>
                      )}
                    </div>
                  </div>
                  <div className="ml-11 space-y-2">
                    {day.activities.map((act, i) => (
                      <Card key={i} className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg flex-shrink-0">{categoryIcons[act.category] ?? '📍'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 text-sm">{act.name}</p>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />{act.time}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />€{act.estimatedCost}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{act.description}</p>
                            {act.location && (
                              <p className="text-xs text-brand-500 flex items-center gap-1 mt-1">
                                <Navigation className="w-3 h-3" />{act.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  {day.tips && (
                    <div className="ml-11 mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                      💡 {day.tips}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">Ainda não tens roteiro</p>
              <p className="text-gray-400 text-sm mb-5">A IA vai gerar um roteiro dia a dia personalizado para ti</p>
              <Button
                onClick={() => generateItinerary.mutate()}
                loading={generateItinerary.isPending}
              >
                <Brain className="w-4 h-4" />
                Gerar roteiro com IA
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Playlists */}
      {activeTab === 'playlists' && (
        <div>
          {trip.playlists && trip.playlists.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {trip.playlists.map((pl: { id: string; name: string; type: string; songs: unknown[] }) => (
                <Card key={pl.id} className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="w-4 h-4 text-purple-500" />
                    <p className="font-medium text-gray-900 truncate">{pl.name}</p>
                  </div>
                  <p className="text-xs text-gray-400">{(pl.songs as unknown[]).length} músicas</p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Sem playlists para esta viagem</p>
              <Link to={`/playlists?destino=${encodeURIComponent(trip.destination.name)}&viagem=${id}`}>
                <Button variant="secondary">
                  <Music className="w-4 h-4" />
                  Criar playlist da viagem
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Trip = {
  id: string;
  title: string;
  status: 'PLANNING' | 'BOOKED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  budget?: number;
  notes?: string;
  destination: { id?: string; name: string; country: string; imageUrl?: string };
  itinerary?: ItineraryDay[];
  playlists?: unknown[];
};

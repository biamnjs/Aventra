import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  MapPin, Calendar, Wallet, ArrowRight, Music, Brain, Plus, Compass
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { Trip, Recommendation } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatCurrency, formatDate } from '../lib/utils';

const statusLabels: Record<string, { label: string; color: string }> = {
  PLANNING: { label: 'A planear', color: 'bg-blue-100 text-blue-700' },
  BOOKED: { label: 'Reservada', color: 'bg-purple-100 text-purple-700' },
  ONGOING: { label: 'Em curso', color: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Concluída', color: 'bg-gray-100 text-gray-600' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-600' },
};

function TripCard({ trip }: { trip: Trip }) {
  const status = statusLabels[trip.status];
  return (
    <Link to={`/viagens/${trip.id}`}>
      <Card hover className="overflow-hidden">
        <div className="relative h-36 bg-gray-100">
          {trip.destination.imageUrl ? (
            <img
              src={trip.destination.imageUrl}
              alt={trip.destination.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-200 to-brand-400" />
          )}
          <div className="absolute top-3 right-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{trip.title}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {trip.destination.name}, {trip.destination.country}
          </div>
          {trip.startDate && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(trip.startDate)}
            </div>
          )}
          {trip.budget && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Wallet className="w-3.5 h-3.5" />
              {formatCurrency(trip.budget)}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{rec.name}</h3>
          <p className="text-sm text-gray-500">{rec.country}</p>
        </div>
        <span className="text-xs bg-brand-50 text-brand-600 px-2 py-1 rounded-full font-medium">
          {rec.estimatedBudget}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{rec.reason}</p>
      <div className="flex flex-wrap gap-1 mb-4">
        {rec.highlights.slice(0, 3).map((h) => (
          <span key={h} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{h}</span>
        ))}
      </div>
      <Link to={`/destinos?pesquisa=${encodeURIComponent(rec.name)}`}>
        <Button size="sm" variant="secondary" className="w-full">
          Explorar destino <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </Card>
  );
}

export function Dashboard() {
  const { user } = useAuthStore();

  const { data: trips } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await api.get('/trips');
      return res.data.data as Trip[];
    },
  });

  const { data: recommendations, isLoading: loadingRecs, error: recsError } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const res = await api.get('/ai/recommendations');
      return res.data.data.recommendations as Recommendation[];
    },
    retry: false,
  });

  const activeTrips = trips?.filter((t) => ['PLANNING', 'BOOKED', 'ONGOING'].includes(t.status)) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Saudação */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">O que queres explorar hoje?</p>
      </div>

      {/* Acções rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { icon: Plus, label: 'Nova Viagem', href: '/viagens/nova', color: 'bg-brand-500 text-white' },
          { icon: Brain, label: 'Recomendações IA', href: '/recomendacoes', color: 'bg-purple-500 text-white' },
          { icon: Compass, label: 'Explorar Destinos', href: '/destinos', color: 'bg-blue-500 text-white' },
          { icon: Music, label: 'Playlists', href: '/playlists', color: 'bg-green-500 text-white' },
        ].map(({ icon: Icon, label, href, color }) => (
          <Link key={href} to={href}>
            <div className={`${color} rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:opacity-90 transition-opacity`}>
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Viagens Ativas */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">As Minhas Viagens</h2>
              <Link to="/viagens" className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1">
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeTrips.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {activeTrips.slice(0, 4).map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Compass className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Ainda não tens viagens planeadas</p>
                <Link to="/viagens/nova">
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    Criar primeira viagem
                  </Button>
                </Link>
              </Card>
            )}
          </section>
        </div>

        {/* Recomendações IA */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Sugestões para Ti</h2>
          </div>

          {loadingRecs ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i} className="p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded mb-2 w-2/3" />
                  <div className="h-3 bg-gray-100 rounded mb-4 w-1/3" />
                  <div className="h-12 bg-gray-100 rounded" />
                </Card>
              ))}
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec) => (
                <RecommendationCard key={rec.name} rec={rec} />
              ))}
            </div>
          ) : recsError ? (
            <Card className="p-6 text-center">
              <Brain className="w-8 h-8 text-amber-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">IA temporariamente indisponível</p>
              <p className="text-xs text-gray-400">Ativa o proxy para recomendações personalizadas</p>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <Brain className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">
                Completa o teu perfil para receber recomendações personalizadas
              </p>
              <Link to="/perfil/questionario">
                <Button size="sm" variant="secondary">Completar perfil</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

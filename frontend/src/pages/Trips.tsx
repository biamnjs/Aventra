import { Link } from 'react-router-dom';
import { Plus, MapPin, Calendar, Wallet, Trash2, Compass } from 'lucide-react';
import { useTrips, useDeleteTrip } from '../hooks/useTrips';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatDate, formatCurrency } from '../lib/utils';
import type { Trip } from '../types';

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  PLANNING: { label: 'A planear', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  BOOKED: { label: 'Reservada', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  ONGOING: { label: 'Em curso', color: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
  COMPLETED: { label: 'Concluída', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-600', dot: 'bg-red-400' },
};

function TripCard({ trip }: { trip: Trip }) {
  const deleteTrip = useDeleteTrip();
  const status = statusConfig[trip.status];

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(`Eliminar "${trip.title}"?`)) return;
    await deleteTrip.mutateAsync(trip.id);
  }

  return (
    <Link to={`/viagens/${trip.id}`}>
      <Card hover className="overflow-hidden">
        <div className="relative h-40">
          {trip.destination.imageUrl ? (
            <img src={trip.destination.imageUrl} alt={trip.destination.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-200 to-brand-400" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 right-3 flex gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleteTrip.isPending}
            className="absolute bottom-3 right-3 p-1.5 bg-black/30 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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

const statusOrder = ['ONGOING', 'PLANNING', 'BOOKED', 'COMPLETED', 'CANCELLED'];

export function Trips() {
  const { data: trips, isLoading } = useTrips();

  const groups = statusOrder.reduce<Record<string, Trip[]>>((acc, s) => {
    const items = (trips ?? []).filter((t) => t.status === s);
    if (items.length > 0) acc[s] = items;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">As Minhas Viagens</h1>
          <p className="text-gray-500 mt-1">Gere e acompanha todos os teus roteiros</p>
        </div>
        <Link to="/viagens/nova">
          <Button>
            <Plus className="w-4 h-4" />
            Nova viagem
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : Object.keys(groups).length > 0 ? (
        <div className="space-y-10">
          {statusOrder.filter((s) => groups[s]).map((status) => {
            const cfg = statusConfig[status];
            return (
              <section key={status}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <h2 className="font-semibold text-gray-700">{cfg.label}</h2>
                  <span className="text-gray-400 text-sm">({groups[status].length})</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups[status].map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <Compass className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Ainda não tens viagens</h3>
          <p className="text-gray-500 mb-6">Cria a tua primeira viagem e começa a planear</p>
          <Link to="/viagens/nova">
            <Button size="lg">
              <Plus className="w-4 h-4" />
              Criar primeira viagem
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

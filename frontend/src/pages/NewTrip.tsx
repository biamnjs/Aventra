import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Wallet, Search, ArrowLeft, FileText } from 'lucide-react';
import { useCreateTrip } from '../hooks/useTrips';
import { useSearchDestinations } from '../hooks/useDestinations';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
function useDebounceLocal(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function NewTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [destinationSearch, setDestinationSearch] = useState(searchParams.get('nome') ?? '');
  const [selectedDestination, setSelectedDestination] = useState<{ id: string; name: string; country: string } | null>(
    searchParams.get('destino') ? {
      id: searchParams.get('destino')!,
      name: searchParams.get('nome') ?? '',
      country: '',
    } : null
  );

  const [form, setForm] = useState({
    title: '',
    startDate: '',
    endDate: '',
    budget: '',
    notes: '',
  });
  const [error, setError] = useState('');

  const debouncedSearch = useDebounceLocal(destinationSearch, 400);
  const { data: searchResults } = useSearchDestinations(debouncedSearch);
  const createTrip = useCreateTrip();

  const showResults = !selectedDestination && debouncedSearch.length >= 2 && (searchResults?.length ?? 0) > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!selectedDestination) { setError('Selecciona um destino'); return; }
    if (!form.title.trim()) { setError('Dá um título à viagem'); return; }

    try {
      const trip = await createTrip.mutateAsync({
        destinationId: selectedDestination.id,
        title: form.title,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        notes: form.notes || undefined,
      });
      navigate(`/viagens/${trip.id}`);
    } catch {
      setError('Erro ao criar viagem. Tenta novamente.');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nova Viagem</h1>
        <p className="text-gray-500 mt-1">Preenche os detalhes para começar a planear</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Destino */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Destino</label>
          {selectedDestination ? (
            <Card className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-brand-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{selectedDestination.name}</p>
                {selectedDestination.country && <p className="text-sm text-gray-500">{selectedDestination.country}</p>}
              </div>
              <button
                type="button"
                onClick={() => { setSelectedDestination(null); setDestinationSearch(''); }}
                className="text-sm text-brand-500 hover:text-brand-600"
              >
                Alterar
              </button>
            </Card>
          ) : (
            <div className="relative">
              <Input
                placeholder="Pesquisar destino..."
                icon={<Search className="w-4 h-4" />}
                value={destinationSearch}
                onChange={(e) => setDestinationSearch(e.target.value)}
              />
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
                  {searchResults!.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setSelectedDestination({ id: d.id, name: d.name, country: d.country });
                        setDestinationSearch(d.name);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                    >
                      <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{d.name}</p>
                        <p className="text-xs text-gray-500">{d.country}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Input
          label="Título da viagem"
          placeholder="Ex: Verão em Lisboa 2026"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Data de partida"
            type="date"
            icon={<Calendar className="w-4 h-4" />}
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          />
          <Input
            label="Data de regresso"
            type="date"
            icon={<Calendar className="w-4 h-4" />}
            value={form.endDate}
            min={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
          />
        </div>

        <Input
          label="Orçamento total (€)"
          type="number"
          placeholder="Ex: 1500"
          icon={<Wallet className="w-4 h-4" />}
          value={form.budget}
          onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Notas</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              rows={3}
              placeholder="Ideias, requisitos especiais, coisas a não esquecer..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</div>
        )}

        <Button type="submit" size="lg" loading={createTrip.isPending} className="w-full">
          Criar Viagem
        </Button>
      </form>
    </div>
  );
}

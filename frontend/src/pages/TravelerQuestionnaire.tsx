import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';

type ProfileData = {
  budget?: number;
  accommodationType?: string;
  favoriteCountries: string[];
  musicGenres: string[];
  foodStyle: string[];
  activities: string[];
  climateType?: string;
  travelFrequency?: string;
  travelStyle?: string;
  photography: boolean;
  socialMedia: boolean;
  adventureLevel?: string;
};

const steps = [
  {
    id: 'budget',
    title: 'Qual é o teu orçamento médio por viagem?',
    subtitle: 'Ajuda-nos a recomendar opções adequadas',
    type: 'single' as const,
    field: 'accommodationType' as const,
    options: [
      { value: 'budget_low', label: 'Económico', description: 'Até €500', budget: 400 },
      { value: 'budget_mid', label: 'Moderado', description: '€500 – €1.500', budget: 1000 },
      { value: 'budget_high', label: 'Confortável', description: '€1.500 – €3.000', budget: 2000 },
      { value: 'budget_luxury', label: 'Luxo', description: 'Mais de €3.000', budget: 4000 },
    ],
  },
  {
    id: 'travelStyle',
    title: 'O que preferes numa viagem?',
    type: 'single' as const,
    field: 'travelStyle' as const,
    options: [
      { value: 'praia', label: '🏖️ Praia', description: 'Sol, mar e relaxamento' },
      { value: 'cidade', label: '🏙️ Cidade', description: 'Cultura, museus e gastronomia' },
      { value: 'natureza', label: '🌿 Natureza', description: 'Trilhos, florestas e montanhas' },
      { value: 'misto', label: '🗺️ Misto', description: 'Um pouco de tudo' },
    ],
  },
  {
    id: 'activities',
    title: 'Quais são as tuas actividades favoritas?',
    subtitle: 'Podes escolher várias',
    type: 'multi' as const,
    field: 'activities' as const,
    options: [
      { value: 'fotografia', label: '📸 Fotografia' },
      { value: 'gastronomia', label: '🍽️ Gastronomia' },
      { value: 'museus', label: '🏛️ Museus e Arte' },
      { value: 'caminhadas', label: '🥾 Caminhadas' },
      { value: 'mergulho', label: '🤿 Mergulho' },
      { value: 'compras', label: '🛍️ Compras' },
      { value: 'desporto', label: '⚽ Desporto' },
      { value: 'vida-noturna', label: '🎵 Vida Noturna' },
    ],
  },
  {
    id: 'music',
    title: 'Que músicas te acompanham nas viagens?',
    type: 'multi' as const,
    field: 'musicGenres' as const,
    options: [
      { value: 'pop', label: '🎤 Pop' },
      { value: 'indie', label: '🎸 Indie' },
      { value: 'jazz', label: '🎷 Jazz' },
      { value: 'electronic', label: '🎧 Electrónica' },
      { value: 'rock', label: '🎸 Rock' },
      { value: 'latin', label: '🎺 Latina' },
      { value: 'classical', label: '🎻 Clássica' },
      { value: 'hiphop', label: '🎤 Hip-Hop' },
    ],
  },
  {
    id: 'climate',
    title: 'Que clima preferes?',
    type: 'single' as const,
    field: 'climateType' as const,
    options: [
      { value: 'tropical', label: '🌴 Tropical', description: 'Quente e húmido' },
      { value: 'temperado', label: '🍂 Temperado', description: 'Ameno, 4 estações' },
      { value: 'árido', label: '☀️ Árido', description: 'Quente e seco' },
      { value: 'frio', label: '❄️ Frio', description: 'Fresco ou gelado' },
    ],
  },
  {
    id: 'extras',
    title: 'Conta-nos mais sobre ti',
    type: 'extras' as const,
    field: 'adventureLevel' as const,
    options: [
      { value: 'aventura', label: '🧗 Aventureiro', description: 'Adoro desafios e riscos' },
      { value: 'equilibrado', label: '⚖️ Equilibrado', description: 'Um meio-termo' },
      { value: 'conforto', label: '🛋️ Conforto', description: 'Prefiro o lado tranquilo' },
    ],
  },
];

function OptionButton({ selected, onClick, label, description }: {
  selected: boolean; onClick: () => void; label: string; description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-start gap-3 w-full p-4 rounded-2xl border-2 text-left transition-all ${
        selected
          ? 'border-brand-500 bg-brand-50'
          : 'border-gray-100 hover:border-brand-200 bg-white'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 transition-colors ${
        selected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
      }`}>
        {selected && <CheckCircle2 className="w-4 h-4 text-white -m-0.5" />}
      </div>
      <div>
        <span className="font-medium text-gray-900 text-sm">{label}</span>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </button>
  );
}

export function TravelerQuestionnaire() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<ProfileData>({
    favoriteCountries: [],
    musicGenres: [],
    foodStyle: [],
    activities: [],
    photography: false,
    socialMedia: false,
  });
  const [extras, setExtras] = useState({ photography: false, socialMedia: false });

  const [saveError, setSaveError] = useState('');

  const save = useMutation({
    mutationFn: async (data: ProfileData) => {
      const res = await api.post('/users/traveler-profile', data);
      await api.post('/ai/traveler-type');
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/painel');
    },
    onError: () => {
      setSaveError('Erro ao guardar perfil. Tenta novamente.');
    },
  });

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  function getSelected(field: keyof ProfileData): string | string[] {
    return (profile[field] as string | string[]) ?? (step.type === 'multi' ? [] : '');
  }

  function toggleSingle(field: keyof ProfileData, value: string, budget?: number) {
    setProfile((p) => ({
      ...p,
      [field]: value,
      ...(budget !== undefined ? { budget } : {}),
    }));
  }

  function toggleMulti(field: keyof ProfileData, value: string) {
    setProfile((p) => {
      const arr = (p[field] as string[]) ?? [];
      return {
        ...p,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  function canProceed(): boolean {
    if (step.type === 'extras') return !!profile.adventureLevel;
    if (step.type === 'single') return !!(profile[step.field] as string);
    return ((profile[step.field] as string[]) ?? []).length > 0;
  }

  async function handleNext() {
    if (isLast) {
      setSaveError('');
      // accommodationType was used as a budget-tier placeholder — strip it before sending
      // the numeric budget field already captures that selection
      const { accommodationType, ...cleanProfile } = profile;
      void accommodationType;
      await save.mutateAsync({ ...cleanProfile, ...extras });
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Passo {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h2>
          {step.subtitle && <p className="text-gray-500 text-sm mb-6">{step.subtitle}</p>}
          {!step.subtitle && <div className="mb-6" />}

          {step.type === 'extras' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Nível de aventura</p>
                {step.options.map((opt) => (
                  <OptionButton
                    key={opt.value}
                    selected={profile.adventureLevel === opt.value}
                    onClick={() => setProfile((p) => ({ ...p, adventureLevel: opt.value }))}
                    label={opt.label}
                    description={opt.description}
                  />
                ))}
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium text-gray-700">Interesses especiais</p>
                <OptionButton
                  selected={extras.photography}
                  onClick={() => setExtras((e) => ({ ...e, photography: !e.photography }))}
                  label="📸 Interesse em fotografia"
                  description="Receber dicas de locais e horários para fotografar"
                />
                <OptionButton
                  selected={extras.socialMedia}
                  onClick={() => setExtras((e) => ({ ...e, socialMedia: !e.socialMedia }))}
                  label="📱 Criar conteúdo para redes sociais"
                  description="Sugestões de poses, hashtags e legendas"
                />
              </div>
            </div>
          ) : step.type === 'multi' ? (
            <div className="grid grid-cols-2 gap-2">
              {step.options.map((opt) => {
                const arr = (getSelected(step.field) as string[]);
                return (
                  <OptionButton
                    key={opt.value}
                    selected={arr.includes(opt.value)}
                    onClick={() => toggleMulti(step.field, opt.value)}
                    label={opt.label}
                    description={(opt as { description?: string }).description}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {step.options.map((opt) => (
                <OptionButton
                  key={opt.value}
                  selected={getSelected(step.field) === opt.value}
                  onClick={() => toggleSingle(step.field, opt.value, (opt as { budget?: number }).budget)}
                  label={opt.label}
                  description={(opt as { description?: string }).description}
                />
              ))}
            </div>
          )}

          {saveError && (
            <p className="mt-6 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{saveError}</p>
          )}

          <div className="flex gap-3 mt-4">
            {currentStep > 0 && (
              <Button variant="secondary" onClick={() => setCurrentStep((s) => s - 1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={handleNext}
              disabled={!canProceed() || save.isPending}
              loading={save.isPending}
            >
              {save.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />A guardar...</>
              ) : isLast ? (
                'Concluir perfil'
              ) : (
                <>Continuar <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

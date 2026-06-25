import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, ArrowLeft, Heart, Star, Calendar, Music, Globe, Plus,
  ShieldCheck, ExternalLink, CheckCircle2, Thermometer, DollarSign,
} from 'lucide-react';
import { useDestination } from '../hooks/useDestinations';
import { useToggleFavorite, useIsFavorited } from '../hooks/useFavorites';
import { useAuthStore } from '../store/authStore';
import { useVisaInfo, useSavePassport, type VisaStatus } from '../hooks/useVisaInfo';
import { COUNTRIES } from '../data/countries';
import { Button } from '../components/ui/Button';
import type { Destination, TravelerProfile } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

const climateEmoji: Record<string, string> = {
  tropical: '🌴', temperado: '🍂', árido: '☀️', frio: '❄️',
};

const visaStatusConfig: Record<VisaStatus, { label: string; bg: string; text: string }> = {
  free:       { label: 'Sem visto',         bg: '#DCFCE7', text: '#166534' },
  voa:        { label: 'Visto na chegada',  bg: '#FEF9C3', text: '#854D0E' },
  evisa:      { label: 'e-Visto online',    bg: '#DBEAFE', text: '#1E40AF' },
  required:   { label: 'Visto obrigatório', bg: '#FEE2E2', text: '#991B1B' },
  restricted: { label: 'Acesso restrito',   bg: '#1F2937', text: '#F9FAFB' },
  domestic:   { label: 'País de origem',    bg: '#FFF7ED', text: '#C2410C' },
};

function getBudget(d: Destination): { min: number; max: number } {
  const c = d.country.toLowerCase();
  if (/indonésia|tailândia|vietname|camboja|malásia|filipinas|sri lanka|nepal/.test(c)) return { min: 40, max: 80 };
  if (/índia/.test(c)) return { min: 30, max: 70 };
  if (/japão|coreia|singapura/.test(c)) return { min: 100, max: 180 };
  if (/estados unidos|canadá/.test(c)) return { min: 120, max: 220 };
  if (/austrália|nova zelândia|fiji|polinésia/.test(c)) return { min: 120, max: 200 };
  if (/emirados|catar|arábia|omã/.test(c)) return { min: 130, max: 280 };
  if (/suíça|noruega|dinamarca|islândia|suécia|finlândia/.test(c)) return { min: 120, max: 240 };
  if (/república checa|hungria|polónia|croácia|estónia|roménia|sérvia/.test(c)) return { min: 60, max: 100 };
  if (/brasil|argentina|colômbia|peru|méxico|chile|costa rica|cuba|bolívia|equador/.test(c)) return { min: 50, max: 100 };
  if (/quénia|tanzânia|sul|marrocos|egito|gana|ruanda|maurícias|seychelles|tunísia/.test(c)) return { min: 60, max: 130 };
  const byClimate: Record<string, { min: number; max: number }> = {
    árido: { min: 90, max: 170 }, frio: { min: 100, max: 180 }, tropical: { min: 60, max: 120 },
  };
  return d.climate ? (byClimate[d.climate] ?? { min: 80, max: 150 }) : { min: 80, max: 150 };
}

function getWeather(climate?: string) {
  const map: Record<string, { high: number; low: number; label: string }> = {
    tropical: { high: 32, low: 24, label: 'Quente e húmido' },
    temperado: { high: 24, low: 13, label: 'Temperado' },
    árido:    { high: 40, low: 24, label: 'Quente e seco' },
    frio:     { high: 8,  low: -2, label: 'Frio' },
  };
  return map[climate ?? ''] ?? { high: 22, low: 14, label: 'Agradável' };
}

function getBestSeason(climate?: string) {
  const map: Record<string, { months: string; desc: string }> = {
    tropical: { months: 'Nov — Mar', desc: 'Estação seca, menos chuva' },
    temperado: { months: 'Mai — Set', desc: 'Verão agradável para turismo' },
    árido:    { months: 'Out — Abr', desc: 'Temperaturas mais amenas' },
    frio:     { months: 'Jun — Ago', desc: 'Verão suave com dias longos' },
  };
  return map[climate ?? ''] ?? { months: 'Abr — Out', desc: 'Primavera e verão' };
}

function computeCompatibility(
  destination: Destination,
  profile?: TravelerProfile | null,
): { score: number; reasons: string[] } | null {
  if (!profile) return null;
  const tagMap: Record<string, string> = {
    praia: 'Praias & mar', aventura: 'Espírito aventureiro', fotografia: 'Fotografia',
    gastronomia: 'Gastronomia local', cultura: 'Cultura e arte', natureza: 'Contacto com a natureza',
    histórico: 'Património histórico', luxo: 'Experiências premium', romântico: 'Atmosfera romântica',
    mergulho: 'Mergulho', ski: 'Desportos de inverno', família: 'Viagem em família',
    cidade: 'Vida urbana', música: 'Cena musical', 'vida noturna': 'Vida noturna',
  };
  const reasons: string[] = [];
  let pts = 0;
  if (profile.climateType === destination.climate) { pts += 20; reasons.push(`Clima ${destination.climate}`); }
  else if (profile.climateType === 'qualquer') pts += 10;
  (profile.activities ?? []).forEach(act => {
    if (destination.tags.includes(act)) {
      pts += 10;
      if (reasons.length < 4 && tagMap[act]) reasons.push(tagMap[act]!);
    }
  });
  if (profile.travelStyle && destination.tags.includes(profile.travelStyle)) {
    pts += 15;
    if (reasons.length < 4 && tagMap[profile.travelStyle]) reasons.push(tagMap[profile.travelStyle]!);
  }
  if (destination.featured) pts += 5;
  if (reasons.length < 2) destination.tags.slice(0, 3).forEach(t => { if (reasons.length < 3 && tagMap[t]) reasons.push(tagMap[t]!); });
  const score = Math.min(99, Math.max(52, Math.round(52 + (pts / 70) * 47)));
  return { score, reasons: [...new Set(reasons)].slice(0, 4) };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CircleProgress({ value }: { value: number }) {
  const size = 96;
  const sw = 7;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ECECEC" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#FF6238" strokeWidth={sw}
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${offset}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>
      <span className="relative text-xl font-bold" style={{ color: '#1F2937' }}>{value}%</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const CARD_STYLE: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 18,
  border: '1px solid #ECECEC',
  boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
};

const SECTION_TITLE = 'font-bold text-[#1F2937] mb-4';

type HotelItem = { id: string; name: string; rating?: number; pricePerNight?: number; imageUrl?: string };

export function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const { data: destination, isLoading } = useDestination(id!);
  const { data: favorited } = useIsFavorited('DESTINATION', id!);
  const toggleFavorite = useToggleFavorite();

  const [passport, setPassport] = useState<string>(user?.profile?.passportCountry ?? '');
  const { data: visaInfo, isLoading: visaLoading } = useVisaInfo(id!, passport || undefined);
  const savePassport = useSavePassport();

  function handlePassportChange(code: string) {
    setPassport(code);
    if (code && isAuthenticated) savePassport.mutate(code);
  }

  async function handleFavorite() {
    if (!isAuthenticated) { navigate('/entrar'); return; }
    await toggleFavorite.mutateAsync({
      type: 'DESTINATION', referenceId: id!,
      metadata: { name: destination?.name, country: destination?.country, imageUrl: destination?.imageUrl },
    });
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ background: '#FAFAFA', minHeight: '100vh' }}>
        <div className="max-w-[1320px] mx-auto px-8 py-8 animate-pulse">
          <div className="h-5 w-16 bg-gray-200 rounded mb-6" />
          <div className="h-[420px] bg-gray-200 rounded-[24px] mb-8" />
          <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 380px' }}>
            <div className="space-y-5">
              <div className="h-48 bg-gray-200 rounded-[18px]" />
              <div className="h-24 bg-gray-200 rounded-[18px]" />
            </div>
            <div className="space-y-4">
              <div className="h-56 bg-gray-200 rounded-[18px]" />
              <div className="h-14 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!destination) {
    return (
      <div style={{ background: '#FAFAFA', minHeight: '100vh' }} className="flex flex-col items-center justify-center gap-3">
        <Globe className="w-12 h-12 text-gray-300" />
        <p className="text-[#6B7280] text-lg">Destino não encontrado</p>
        <Link to="/destinos" className="text-brand-500 text-sm hover:underline">← Voltar aos destinos</Link>
      </div>
    );
  }

  const hotels = (destination.hotels ?? []) as HotelItem[];
  const budget = getBudget(destination);
  const weather = getWeather(destination.climate);
  const season = getBestSeason(destination.climate);
  const compat = computeCompatibility(destination, user?.profile);

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh' }}>
      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-8">

        {/* ── Back ──────────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1F2937] mb-6 transition-colors duration-[250ms]"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden mb-8"
          style={{ height: 'clamp(280px, 35vw, 420px)', borderRadius: 24 }}
        >
          {destination.imageUrl ? (
            <img
              src={destination.imageUrl}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.08) 100%)'
          }} />

          {/* Country badge — top left */}
          <div className="absolute top-5 left-6 flex items-center gap-1.5 backdrop-blur-sm bg-white/15 border border-white/25 text-white text-sm font-medium px-3 py-1.5 rounded-full">
            <MapPin className="w-3.5 h-3.5" />
            {destination.country}
          </div>

          {/* Favorite — top right */}
          <button
            onClick={handleFavorite}
            disabled={toggleFavorite.isPending}
            className="absolute top-4 right-5 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-[250ms] disabled:opacity-60"
            style={{
              width: 52, height: 52,
              background: favorited ? '#FF6238' : 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.28)',
            }}
          >
            <Heart className={`w-5 h-5 text-white ${favorited ? 'fill-current' : ''}`} />
          </button>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-16">
            <h1
              className="font-bold text-white leading-none mb-1"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
            >
              {destination.name}
            </h1>
            <p className="text-white/70 text-sm mb-5 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-white/90">4.8</span>
              <span className="text-white/50 mx-1">·</span>
              {destination.country}
            </p>

            {/* Glass info cards */}
            <div className="flex flex-wrap gap-2.5">
              {destination.climate && (
                <div className="backdrop-blur-sm bg-white/15 border border-white/20 rounded-2xl px-4 py-2.5 text-white">
                  <p className="text-white/60 text-[11px] uppercase tracking-wide mb-0.5">Clima</p>
                  <p className="text-sm font-semibold">{climateEmoji[destination.climate]} {destination.climate}</p>
                </div>
              )}
              <div className="backdrop-blur-sm bg-white/15 border border-white/20 rounded-2xl px-4 py-2.5 text-white">
                <p className="text-white/60 text-[11px] uppercase tracking-wide mb-0.5">Orçamento/dia</p>
                <p className="text-sm font-semibold">€{budget.min} — €{budget.max}</p>
              </div>
              <div className="backdrop-blur-sm bg-white/15 border border-white/20 rounded-2xl px-4 py-2.5 text-white">
                <p className="text-white/60 text-[11px] uppercase tracking-wide mb-0.5">Melhor época</p>
                <p className="text-sm font-semibold">{season.months}</p>
              </div>
              {destination.climate && (
                <div className="backdrop-blur-sm bg-white/15 border border-white/20 rounded-2xl px-4 py-2.5 text-white">
                  <p className="text-white/60 text-[11px] uppercase tracking-wide mb-0.5">Temperatura</p>
                  <p className="text-sm font-semibold">{weather.low}° — {weather.high}°C</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile action buttons ─────────────────────────────────────── */}
        <div className="lg:hidden space-y-3 mb-8">
          <Link to={`/viagens/nova?destino=${destination.id}&nome=${encodeURIComponent(destination.name)}`}>
            <Button className="w-full !rounded-xl !py-3.5 text-base" size="lg">
              <Calendar className="w-5 h-5" />
              Planear viagem
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link to={`/playlists?destino=${encodeURIComponent(destination.name)}`} className="block">
              <Button variant="secondary" className="w-full !rounded-xl">
                <Music className="w-4 h-4" /> Playlist
              </Button>
            </Link>
            <Link to={`/viagens/nova?destino=${destination.id}`} className="block">
              <Button variant="ghost" className="w-full !rounded-xl">
                <Plus className="w-4 h-4" /> À viagem
              </Button>
            </Link>
          </div>
        </div>

        {/* Real two-column grid (lg+) */}
        <div
          className="flex flex-col lg:grid gap-8 items-start"
          style={{ gridTemplateColumns: 'minmax(0,1fr) 380px' } as React.CSSProperties}
        >
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="space-y-6 min-w-0">

            {/* About */}
            <div style={CARD_STYLE} className="p-8 transition-shadow duration-[250ms] hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)]">
              <div className="flex gap-6 items-start">
                <div className="flex-1 min-w-0">
                  <h2 className={`text-[22px] ${SECTION_TITLE}`}>Sobre o destino</h2>
                  <p className="text-[#6B7280] leading-relaxed text-[17px]">{destination.description}</p>
                </div>
                {destination.imageUrl && (
                  <div
                    className="hidden sm:block flex-shrink-0 rounded-2xl overflow-hidden"
                    style={{ width: 200, height: 140 }}
                  >
                    <img src={destination.imageUrl} alt={destination.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {destination.tags.length > 0 && (
              <div style={CARD_STYLE} className="p-8">
                <h2 className={`text-[22px] ${SECTION_TITLE}`}>Ideal para</h2>
                <div className="flex flex-wrap gap-3">
                  {destination.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-[250ms] hover:-translate-y-0.5 hover:shadow-sm cursor-default"
                      style={{
                        background: '#FFF4F0',
                        color: '#FF6238',
                        border: '1.5px solid #FFE4DB',
                        height: 42,
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hotels */}
            {hotels.length > 0 && (
              <div style={CARD_STYLE} className="p-8">
                <h2 className={`text-[22px] ${SECTION_TITLE}`}>Alojamentos sugeridos</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="flex-shrink-0 rounded-[14px] overflow-hidden transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] cursor-pointer"
                      style={{ width: 200, background: '#FAFAFA', border: '1px solid #ECECEC' }}
                    >
                      <div className="h-[120px] bg-gray-200 overflow-hidden">
                        {hotel.imageUrl
                          ? <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                              <Globe className="w-8 h-8 text-brand-400" />
                            </div>
                        }
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-[#1F2937] text-sm truncate">{hotel.name}</p>
                        {hotel.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-[#6B7280]">{hotel.rating}</span>
                          </div>
                        )}
                        {hotel.pricePerNight && (
                          <p className="text-sm font-bold text-[#FF6238] mt-1">€{hotel.pricePerNight}<span className="text-xs font-normal text-[#6B7280]">/noite</span></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (sticky) ────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col gap-5" style={{ position: 'sticky', top: 100 }}>

            {/* Compatibility card */}
            {compat && (
              <div style={CARD_STYLE} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#1F2937] text-[16px]">Compatibilidade</h3>
                  <span className="text-xs text-[#6B7280] bg-gray-100 px-2.5 py-1 rounded-full">Perfil</span>
                </div>
                <div className="flex items-center gap-5 mb-4">
                  <CircleProgress value={compat.score} />
                  <div>
                    <p className="text-2xl font-bold text-[#1F2937]">{compat.score}%</p>
                    <p className="text-xs text-[#6B7280]">compatível com o teu perfil</p>
                  </div>
                </div>
                {compat.reasons.length > 0 && (
                  <div className="space-y-2 mb-5">
                    {compat.reasons.map((r) => (
                      <div key={r} className="flex items-center gap-2 text-sm text-[#1F2937]">
                        <CheckCircle2 className="w-4 h-4 text-[#FF6238] flex-shrink-0" />
                        {r}
                      </div>
                    ))}
                  </div>
                )}
                {/* Primary CTA */}
                <Link to={`/viagens/nova?destino=${destination.id}&nome=${encodeURIComponent(destination.name)}`}>
                  <button
                    className="w-full text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-[250ms] hover:opacity-90 active:scale-[.98]"
                    style={{ background: '#FF6238', height: 56, fontSize: 15 }}
                  >
                    <Calendar className="w-5 h-5" />
                    Planear viagem
                  </button>
                </Link>
                <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                  <Link to={`/playlists?destino=${encodeURIComponent(destination.name)}`} className="block">
                    <button
                      className="w-full text-[#1F2937] font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-[250ms] hover:bg-gray-50"
                      style={{ height: 44, fontSize: 14, border: '1.5px solid #ECECEC', background: '#fff' }}
                    >
                      <Music className="w-4 h-4" /> Playlist
                    </button>
                  </Link>
                  <Link to={`/viagens/nova?destino=${destination.id}`} className="block">
                    <button
                      className="w-full text-[#6B7280] font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-[250ms] hover:bg-gray-50"
                      style={{ height: 44, fontSize: 14, border: '1.5px solid #ECECEC', background: '#fff' }}
                    >
                      <Plus className="w-4 h-4" /> À viagem
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* If no profile, just show CTAs */}
            {!compat && (
              <div style={CARD_STYLE} className="p-5 space-y-3">
                <Link to={`/viagens/nova?destino=${destination.id}&nome=${encodeURIComponent(destination.name)}`}>
                  <button
                    className="w-full text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-[250ms] hover:opacity-90"
                    style={{ background: '#FF6238', height: 56, fontSize: 15 }}
                  >
                    <Calendar className="w-5 h-5" /> Planear viagem
                  </button>
                </Link>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link to={`/playlists?destino=${encodeURIComponent(destination.name)}`} className="block">
                    <button
                      className="w-full text-[#1F2937] font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-[250ms] hover:bg-gray-50"
                      style={{ height: 44, fontSize: 14, border: '1.5px solid #ECECEC', background: '#fff' }}
                    >
                      <Music className="w-4 h-4" /> Playlist
                    </button>
                  </Link>
                  <Link to={`/viagens/nova?destino=${destination.id}`} className="block">
                    <button
                      className="w-full text-[#6B7280] font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-[250ms] hover:bg-gray-50"
                      style={{ height: 44, fontSize: 14, border: '1.5px solid #ECECEC', background: '#fff' }}
                    >
                      <Plus className="w-4 h-4" /> À viagem
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Budget + Weather — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div style={CARD_STYLE} className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <DollarSign className="w-3.5 h-3.5 text-[#FF6238]" />
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Orçamento</p>
                </div>
                <p className="font-bold text-[#1F2937] text-[15px]">€{budget.min}–{budget.max}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">por pessoa/dia</p>
              </div>
              <div style={CARD_STYLE} className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Thermometer className="w-3.5 h-3.5 text-[#FF6238]" />
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Clima</p>
                </div>
                <p className="font-bold text-[#1F2937] text-[15px]">{weather.low}° – {weather.high}°C</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{weather.label}</p>
              </div>
            </div>

            {/* Best time */}
            <div style={CARD_STYLE} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#FF6238]" />
                <h3 className="font-bold text-[#1F2937] text-[15px]">Melhor altura para visitar</h3>
              </div>
              <p className="text-lg font-bold text-[#1F2937]">{season.months}</p>
              <p className="text-sm text-[#6B7280] mt-0.5">{season.desc}</p>
            </div>

            {/* Visa card */}
            <div style={CARD_STYLE} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-[#FF6238]" />
                <h3 className="font-bold text-[#1F2937] text-[15px]">Requisitos de entrada</h3>
              </div>
              <div className="mb-3">
                <label className="block text-xs text-[#6B7280] mb-1.5">Passaporte</label>
                <select
                  value={passport}
                  onChange={(e) => handlePassportChange(e.target.value)}
                  className="w-full text-sm border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6238]/30 transition-all duration-[250ms]"
                  style={{ borderColor: '#ECECEC', color: '#1F2937' }}
                >
                  <option value="">Selecionar país</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              {passport && (
                visaLoading ? (
                  <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                ) : visaInfo ? (
                  <div className="space-y-2.5">
                    <span
                      className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: visaStatusConfig[visaInfo.status].bg, color: visaStatusConfig[visaInfo.status].text }}
                    >
                      {visaStatusConfig[visaInfo.status].label}
                    </span>
                    <div className="text-xs text-[#6B7280] space-y-1">
                      {visaInfo.days && visaInfo.status !== 'domestic' && (
                        <p>Estadia máxima: <strong className="text-[#1F2937]">{visaInfo.days} dias</strong></p>
                      )}
                      {visaInfo.cost && (
                        <p>Custo: <strong className="text-[#1F2937]">{visaInfo.cost}</strong></p>
                      )}
                      {visaInfo.notes && <p className="italic">{visaInfo.notes}</p>}
                    </div>
                    {visaInfo.link && (
                      <a
                        href={visaInfo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-medium text-[#FF6238] hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Informação oficial
                      </a>
                    )}
                  </div>
                ) : null
              )}
              {!passport && (
                <p className="text-xs text-gray-400">Seleciona o passaporte para ver os requisitos de visto.</p>
              )}
            </div>

          </div>{/* end right column */}
        </div>{/* end grid */}

      </div>
    </div>
  );
}

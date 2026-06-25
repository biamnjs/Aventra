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
import type { Destination, TravelerProfile } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

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
    tropical: { months: 'Nov–Mar', desc: 'Estação seca, menos chuva' },
    temperado: { months: 'Mai–Set', desc: 'Verão agradável para turismo' },
    árido:    { months: 'Out–Abr', desc: 'Temperaturas mais amenas' },
    frio:     { months: 'Jun–Ago', desc: 'Verão suave com dias longos' },
  };
  return map[climate ?? ''] ?? { months: 'Abr–Out', desc: 'Primavera e verão' };
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
      if (reasons.length < 3 && tagMap[act]) reasons.push(tagMap[act]!);
    }
  });
  if (profile.travelStyle && destination.tags.includes(profile.travelStyle)) {
    pts += 15;
    if (reasons.length < 3 && tagMap[profile.travelStyle]) reasons.push(tagMap[profile.travelStyle]!);
  }
  if (destination.featured) pts += 5;
  if (reasons.length < 2) destination.tags.slice(0, 3).forEach(t => { if (reasons.length < 3 && tagMap[t]) reasons.push(tagMap[t]!); });
  const score = Math.min(99, Math.max(52, Math.round(52 + (pts / 70) * 47)));
  return { score, reasons: [...new Set(reasons)].slice(0, 3) };
}

// ── CircleProgress ────────────────────────────────────────────────────────────

function CircleProgress({ value }: { value: number }) {
  const size = 120;
  const sw = 9;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ECECEC" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#FF6238" strokeWidth={sw}
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${offset}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>
      <span className="relative font-[800] text-[#1F2937]" style={{ fontSize: 36 }}>{value}%</span>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CARD: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 18,
  border: '1px solid #ECECEC',
  boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
};

const GLASS: React.CSSProperties = {
  height: 70,
  padding: 14,
  borderRadius: 14,
  background: 'rgba(255,255,255,0.16)',
  backdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.18)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

type HotelItem = { id: string; name: string; rating?: number; pricePerNight?: number; imageUrl?: string };

// ── Page ──────────────────────────────────────────────────────────────────────

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
      <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
        <div className="max-w-[1440px] mx-auto px-8 py-5 animate-pulse">
          <div className="h-4 w-14 bg-gray-200 rounded mb-5" />
          <div className="bg-gray-200 rounded-[18px] mb-6" style={{ height: 360 }} />
          <div className="flex flex-col lg:grid gap-6" style={{ gridTemplateColumns: '2fr 420px' }}>
            <div className="space-y-6">
              <div className="bg-gray-200 rounded-[18px]" style={{ height: 220 }} />
              <div className="h-20 bg-gray-200 rounded-[18px]" />
            </div>
            <div className="space-y-5">
              <div className="bg-gray-200 rounded-[18px]" style={{ height: 300 }} />
              <div className="bg-gray-200 rounded-[18px]" style={{ height: 130 }} />
              <div className="bg-gray-200 rounded-[18px]" style={{ height: 120 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!destination) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#FAFAFA' }}>
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
    <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
      <div className="max-w-[1440px] mx-auto pb-10" style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 20 }}>

        {/* ── Back ─────────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1F2937] mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden mb-6"
          style={{ height: 360, borderRadius: 18 }}
        >
          {destination.imageUrl
            ? <img src={destination.imageUrl} alt={destination.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600" />
          }

          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 100%)' }}
          />

          {/* Favorite — top right */}
          <button
            onClick={handleFavorite}
            disabled={toggleFavorite.isPending}
            className="absolute top-4 right-5 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 disabled:opacity-60"
            style={{
              width: 48, height: 48,
              background: favorited ? '#FF6238' : 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.28)',
            }}
          >
            <Heart className={`w-5 h-5 text-white ${favorited ? 'fill-current' : ''}`} />
          </button>

          {/* Bottom content */}
          <div
            className="absolute inset-0 flex flex-col justify-end"
            style={{ padding: 32 }}
          >
            <h1
              className="text-white font-[800] leading-none"
              style={{ fontSize: 60, letterSpacing: -1 }}
            >
              {destination.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center mt-3" style={{ gap: 12 }}>
              <Star className="fill-amber-400 text-amber-400" style={{ width: 16, height: 16 }} />
              <span className="text-white font-semibold" style={{ fontSize: 17 }}>4.8</span>
              <span className="text-white/50">·</span>
              <MapPin className="text-white/70" style={{ width: 14, height: 14 }} />
              <span className="text-white/80" style={{ fontSize: 17 }}>{destination.country}</span>
            </div>

            {/* Glass info cards */}
            <div className="flex flex-wrap" style={{ gap: 16, marginTop: 28 }}>
              {destination.climate && (
                <div style={GLASS} className="text-white">
                  <p className="uppercase tracking-wide" style={{ fontSize: 11, opacity: 0.8 }}>Clima</p>
                  <p className="font-bold leading-none" style={{ fontSize: 20 }}>
                    {climateEmoji[destination.climate]} {destination.climate}
                  </p>
                </div>
              )}
              <div style={GLASS} className="text-white">
                <p className="uppercase tracking-wide" style={{ fontSize: 11, opacity: 0.8 }}>Orçamento/dia</p>
                <p className="font-bold leading-none" style={{ fontSize: 20 }}>€{budget.min}–{budget.max}</p>
              </div>
              <div style={GLASS} className="text-white">
                <p className="uppercase tracking-wide" style={{ fontSize: 11, opacity: 0.8 }}>Melhor época</p>
                <p className="font-bold leading-none" style={{ fontSize: 20 }}>{season.months}</p>
              </div>
              {destination.climate && (
                <div style={GLASS} className="text-white">
                  <p className="uppercase tracking-wide" style={{ fontSize: 11, opacity: 0.8 }}>Temperatura</p>
                  <p className="font-bold leading-none" style={{ fontSize: 20 }}>{weather.low}°–{weather.high}°C</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ─────────────────────────────────────────── */}
        <div
          className="flex flex-col lg:grid items-start"
          style={{ gridTemplateColumns: '2fr 420px', gap: 24 }}
        >

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="flex flex-col" style={{ gap: 24 }}>

            {/* About */}
            <div
              style={{ ...CARD, height: 220, padding: 28 }}
              className="flex items-center justify-between gap-6 overflow-hidden"
            >
              <div className="flex-1 min-w-0 overflow-hidden">
                <h2 className="font-bold text-[#1F2937] mb-3" style={{ fontSize: 36 }}>
                  Sobre o destino
                </h2>
                <p
                  className="text-[#6B7280] line-clamp-3"
                  style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 560 }}
                >
                  {destination.description}
                </p>
              </div>
              {destination.imageUrl && (
                <div
                  className="flex-shrink-0 overflow-hidden"
                  style={{ width: 260, height: 140, borderRadius: 14 }}
                >
                  <img src={destination.imageUrl} alt={destination.name} className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Tags */}
            {destination.tags.length > 0 && (
              <div style={{ ...CARD, padding: 24 }}>
                <h2 className="font-bold text-[#1F2937] mb-4" style={{ fontSize: 34 }}>Ideal para</h2>
                <div className="flex flex-wrap" style={{ gap: 12 }}>
                  {destination.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center font-medium cursor-default transition-all hover:-translate-y-0.5"
                      style={{
                        height: 36, padding: '0 16px', fontSize: 14, borderRadius: 999,
                        background: '#FFF4F0', color: '#FF6238', border: '1.5px solid #FFE4DB',
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
              <div style={{ ...CARD, padding: 24 }}>
                <h2 className="font-bold text-[#1F2937] mb-4" style={{ fontSize: 34 }}>Alojamentos sugeridos</h2>
                <div className="flex overflow-x-auto pb-2" style={{ gap: 16, scrollbarWidth: 'none' }}>
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="flex-shrink-0 overflow-hidden transition-all hover:-translate-y-1 cursor-pointer"
                      style={{ width: 170, height: 170, borderRadius: 14, background: '#FAFAFA', border: '1px solid #ECECEC' }}
                    >
                      <div className="overflow-hidden" style={{ height: 110 }}>
                        {hotel.imageUrl
                          ? <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                              <Globe className="w-8 h-8 text-brand-400" />
                            </div>
                        }
                      </div>
                      <div className="p-2.5">
                        <p className="font-semibold text-[#1F2937] truncate" style={{ fontSize: 16 }}>{hotel.name}</p>
                        {hotel.rating && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="fill-amber-400 text-amber-400" style={{ width: 12, height: 12 }} />
                            <span className="text-[#6B7280]" style={{ fontSize: 14 }}>{hotel.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (sidebar) ───────────────────────────────────── */}
          <div
            className="flex flex-col w-full"
            style={{ position: 'sticky', top: 88, gap: 20 }}
          >

            {/* Compatibility card */}
            {compat ? (
              <div style={{ ...CARD, padding: 28 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#1F2937]" style={{ fontSize: 32 }}>Compatibilidade</h3>
                  <span
                    className="font-medium text-[#6B7280] bg-gray-100 inline-flex items-center"
                    style={{ height: 34, padding: '0 14px', borderRadius: 999, fontSize: 13 }}
                  >
                    Perfil
                  </span>
                </div>

                <div className="flex items-center gap-5 mb-4">
                  <CircleProgress value={compat.score} />
                  <div>
                    <p className="font-bold text-[#1F2937] leading-none" style={{ fontSize: 32 }}>{compat.score}%</p>
                    <p className="text-[#6B7280] mt-1" style={{ fontSize: 16 }}>compatível com o teu perfil</p>
                  </div>
                </div>

                {compat.reasons.length > 0 && (
                  <div className="mb-4" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {compat.reasons.map((r) => (
                      <div key={r} className="flex items-center gap-2">
                        <CheckCircle2 className="text-green-500 flex-shrink-0" style={{ width: 18, height: 18 }} />
                        <span className="text-[#1F2937]" style={{ fontSize: 16 }}>{r}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Link to={`/viagens/nova?destino=${destination.id}&nome=${encodeURIComponent(destination.name)}`} className="block">
                  <button
                    className="w-full text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[.98]"
                    style={{ height: 54, borderRadius: 12, background: '#FF6238', fontSize: 17 }}
                  >
                    <Calendar className="w-5 h-5" />
                    Planear viagem
                  </button>
                </Link>
                <div className="flex gap-3 mt-3">
                  <Link to={`/playlists?destino=${encodeURIComponent(destination.name)}`} style={{ width: '48%' }} className="block">
                    <button
                      className="w-full text-[#1F2937] font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                      style={{ height: 48, borderRadius: 12, border: '1.5px solid #ECECEC', background: '#fff', fontSize: 14 }}
                    >
                      <Music className="w-4 h-4" /> Playlist
                    </button>
                  </Link>
                  <Link to={`/viagens/nova?destino=${destination.id}`} style={{ width: '48%' }} className="block">
                    <button
                      className="w-full text-[#6B7280] font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                      style={{ height: 48, borderRadius: 12, border: '1.5px solid #ECECEC', background: '#fff', fontSize: 14 }}
                    >
                      <Plus className="w-4 h-4" /> À viagem
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ ...CARD, padding: 24 }} className="flex flex-col gap-3">
                <Link to={`/viagens/nova?destino=${destination.id}&nome=${encodeURIComponent(destination.name)}`} className="block">
                  <button
                    className="w-full text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    style={{ height: 54, borderRadius: 12, background: '#FF6238', fontSize: 17 }}
                  >
                    <Calendar className="w-5 h-5" /> Planear viagem
                  </button>
                </Link>
                <div className="flex gap-3">
                  <Link to={`/playlists?destino=${encodeURIComponent(destination.name)}`} style={{ width: '48%' }} className="block">
                    <button
                      className="w-full text-[#1F2937] font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                      style={{ height: 48, borderRadius: 12, border: '1.5px solid #ECECEC', background: '#fff', fontSize: 14 }}
                    >
                      <Music className="w-4 h-4" /> Playlist
                    </button>
                  </Link>
                  <Link to={`/viagens/nova?destino=${destination.id}`} style={{ width: '48%' }} className="block">
                    <button
                      className="w-full text-[#6B7280] font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                      style={{ height: 48, borderRadius: 12, border: '1.5px solid #ECECEC', background: '#fff', fontSize: 14 }}
                    >
                      <Plus className="w-4 h-4" /> À viagem
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Budget */}
            <div style={{ ...CARD, height: 130, padding: 24 }}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-[#FF6238]" style={{ width: 16, height: 16 }} />
                <p className="font-semibold text-[#6B7280] uppercase tracking-wide" style={{ fontSize: 12 }}>Orçamento</p>
              </div>
              <p className="font-bold text-[#1F2937]" style={{ fontSize: 22 }}>€{budget.min} – €{budget.max}</p>
              <p className="text-[#6B7280] mt-1" style={{ fontSize: 14 }}>por pessoa/dia</p>
            </div>

            {/* Weather */}
            <div style={{ ...CARD, height: 120, padding: 24 }}>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="text-[#FF6238]" style={{ width: 16, height: 16 }} />
                <p className="font-semibold text-[#6B7280] uppercase tracking-wide" style={{ fontSize: 12 }}>Clima</p>
              </div>
              <p className="font-bold text-[#1F2937]" style={{ fontSize: 22 }}>{weather.low}° – {weather.high}°C</p>
              <p className="text-[#6B7280] mt-1" style={{ fontSize: 14 }}>{weather.label}</p>
            </div>

            {/* Best season */}
            <div style={{ ...CARD, height: 120, padding: 24 }}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-[#FF6238]" style={{ width: 16, height: 16 }} />
                <p className="font-semibold text-[#6B7280] uppercase tracking-wide" style={{ fontSize: 12 }}>Melhor época</p>
              </div>
              <p className="font-bold text-[#1F2937]" style={{ fontSize: 22 }}>{season.months}</p>
              <p className="text-[#6B7280] mt-1" style={{ fontSize: 14 }}>{season.desc}</p>
            </div>

            {/* Visa */}
            <div style={{ ...CARD, padding: 24, minHeight: 120 }}>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="text-[#FF6238]" style={{ width: 16, height: 16 }} />
                <p className="font-semibold text-[#6B7280] uppercase tracking-wide" style={{ fontSize: 12 }}>Requisitos de entrada</p>
              </div>
              <select
                value={passport}
                onChange={(e) => handlePassportChange(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6238]/30 mb-3"
                style={{ borderColor: '#ECECEC', color: passport ? '#1F2937' : '#9CA3AF', fontSize: 14 }}
              >
                <option value="">Selecionar passaporte</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              {passport && (
                visaLoading
                  ? <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                  : visaInfo
                    ? (
                      <div className="space-y-2">
                        <span
                          className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{ background: visaStatusConfig[visaInfo.status].bg, color: visaStatusConfig[visaInfo.status].text }}
                        >
                          {visaStatusConfig[visaInfo.status].label}
                        </span>
                        <div className="text-xs text-[#6B7280] space-y-1">
                          {visaInfo.days && visaInfo.status !== 'domestic' && (
                            <p>Estadia: <strong className="text-[#1F2937]">{visaInfo.days} dias</strong></p>
                          )}
                          {visaInfo.cost && <p>Custo: <strong className="text-[#1F2937]">{visaInfo.cost}</strong></p>}
                          {visaInfo.notes && <p className="italic">{visaInfo.notes}</p>}
                        </div>
                        {visaInfo.link && (
                          <a
                            href={visaInfo.link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-medium text-[#FF6238] hover:underline"
                          >
                            <ExternalLink style={{ width: 12, height: 12 }} /> Informação oficial
                          </a>
                        )}
                      </div>
                    )
                    : null
              )}
              {!passport && (
                <p className="text-xs text-gray-400">Seleciona o passaporte para ver os requisitos.</p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
